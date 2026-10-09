#!/bin/sh
# Runs every physics scenario on the original (Ruffle) and on the port, and compares the traces.
# Requires the game server (PR3_ORIGIN, default http://localhost:8080) and .out/physics-ref.swf (make-as3.sh).
cd "$(dirname "$0")/../.."
NODE=${NODE:-node}
LIST=${*:-$($NODE -e "import('./tools/physics/scenarios.mjs').then(m => console.log(Object.keys(m.scenarios).join(' ')))")}
fail=0
for s in $LIST; do
  [ -f tools/physics/.out/ref-$s.json ] && [ -z "$FRESH" ] || $NODE tools/physics/run-ref.mjs $s >/dev/null || { echo "$s: reference run failed"; fail=1; continue; }
  SCENARIO=$s $NODE --max-old-space-size=1536 tools/headless/run.mjs physics >/dev/null 2>&1 || { echo "$s: port run failed"; fail=1; continue; }
  $NODE tools/physics/compare.mjs $s || fail=1
done
exit $fail
