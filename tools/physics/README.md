# Physics comparison against the original game

The port's physics is checked step by step against the **original SWF** running in Ruffle.

## How it works

1. `make-as3.sh` builds `.out/physics-ref.swf`: the original `client/pr3-fixed/game-fixed.swf` with two
   classes recompiled by FFDec:
   - `com.jiggmin.data.Key` (`as3/Key.as`): a scripted keyboard, a deterministic clock and a scenario driver
     that opens the level editor with a given level and starts its offline test mode.
   - `com.jiggmin.pr3.player.ActivePlayer`: generated from the decompiled original by a 4-line patch — the
     two `getTimer()` reads used for physics stepping use `Key.ptNow()` instead, and every physics step is
     logged with `Key.ptStep()`.

   A P-code diff of the rebuilt `ActivePlayer` against the original shows only those four changes; an
   unmodified decompile/recompile round trip is bytecode-identical apart from debug line numbers.
2. `run-ref.mjs <scenario>` runs the SWF in Ruffle web inside an isolated headless Chromium (memory
   watchdog in `tools/headless/cdp.mjs`) and records every step to `.out/ref-<scenario>.json`.
3. `tools/headless/scripts/physics.mjs` runs the same scenario through the port (headless Node, fake canvas)
   with the same keyboard schedule and clock, recording `.out/port-<scenario>.json`.
4. `compare.mjs <scenario>` compares x, y, velX, velY, realX, realY, rotation, state, remainingJumpVel and
   superJumpVel at every step.

Scenarios (`scenarios.mjs`) pick a level, a character and a key schedule. `run-all.sh` runs them all
(`FRESH=1` re-records the references).

## Deterministic clock

Flash's `getTimer()` is wall-clock time, so a recording made against it would depend on frame jitter. Both
sides instead use `floor(frame * 100 / 3)`: the 33/33/34 ms cadence of an exact 30 fps run, which is also
what the port uses at runtime. Tests start on a frame number divisible by 3 on both sides so the cadence is
in phase. With 30 fps frames and `playerFPS = 27` (37.04 ms), every frame performs exactly one physics step
of 33 or 34 ms.

## Results

All scenarios match **exactly** (maximum absolute difference 0) — positions, velocities, jump velocity and
states — over 150–700 steps each, on levels with basic, brick, safety-net, push, happy/sad and finish blocks.

## Limits

- Levels with custom blocks need the block server, which the reference run does not have; only levels
  made of built-in blocks are used.
- Timer-driven blocks (crumble, vanish, move) use real-time `setTimeout`/`setInterval` inside Ruffle, so they
  are not deterministic on the reference side and are left out.
- Items, hats with physics effects and multiplayer interactions are not covered by these scenarios.

## Requirements

Java 8+, FFDec 26.3.0 CLI (`FFDEC=…/ffdec-cli.jar`), the decompiled sources in `$PR3_REPO/reverse/as3-fixed` (`PR3_REPO` = the original pr3 repo, default `../pr3`), a
Ruffle web build (`RUFFLE=…/package`, npm `@ruffle-rs/ruffle`), a `chrome-headless-shell` binary (`CHROME`,
e.g. from Playwright's cache) and the game server running with the level database (`PR3_ORIGIN`).
