// Port side of the physics comparison (tools/physics): same scenario as the instrumented SWF.
// Env: SCENARIO (name in tools/physics/scenarios.mjs), PT_OUT (output json path).
import { writeFileSync } from 'node:fs';
import { scenarios, fetchLevel } from '../../physics/scenarios.mjs';

export default async function ({ G, frames, until, findType }) {
  const name = process.env.SCENARIO ?? 'brick-run';
  const sc = scenarios[name];
  const level = await fetchLevel(process.env.PR3_ORIGIN ?? 'http://localhost:8080', sc.levelId);
  const def = n => G.getDefinitionByName(n);
  const Key = def('com.jiggmin.data.Key'), Settings = def('com.jiggmin.pr3.Settings'), PR3 = def('com.jiggmin.pr3.PlatformRacing3');
  const LEP = def('com.jiggmin.pr3.editor.levelEditor.LevelEditorPage'), MapManager = def('com.jiggmin.pr3.map.MapManager');
  const LocalPlayer = def('com.jiggmin.pr3.player.LocalPlayer');
  // scripted keyboard, as in the instrumented Key.as
  let ptF = -1, sched = null;
  const origIsDown = Key.isDown;
  Key.isDown = function (key) {
    if (!sched) return origIsDown.call(Key, key);
    if (ptF < 0) return false;
    return sched.some(s => s[2] === key && ptF >= s[0] && ptF < s[1]);
  };
  const steps = [];
  const origStep = LocalPlayer.prototype.step;
  LocalPlayer.prototype.step = function (t) {
    origStep.call(this, t);
    steps.push([ptF, t, this.x, this.y, this.velX, this.velY, this.realX, this.realY, this.rotation, this.getState(), this.remainingJumpVel, this.superJumpVel]);
  };
  // the driver runs from a stage ENTER_FRAME listener registered right after Key's own
  let stage = 0, wait = 0, done = false;
  G.stage.addEventListener('enterFrame', () => {
    if (ptF >= 0) ptF++;
    if (stage === 0 && PR3.instance && G.clock.frame > 60) {
      Settings.myCharacter = { ...sc.character };
      LEP.tempSavedLevel = { ...level };
      PR3.setPage(new LEP());
      stage = 1;
    } else if (stage === 1) {
      wait++;
      if (LEP.instance && MapManager.map && !MapManager.map.drawing && wait > 60 && G.clock.frame % 3 === 0) {
        sched = sc.sched; ptF = 0;
        LEP.instance.startTest();
        stage = 2;
      }
    } else if (stage === 2 && ptF >= sc.frames) { done = true; stage = 3; }
  });
  await until(() => done, 3000, 'scenario');
  writeFileSync(process.env.PT_OUT ?? `tools/physics/.out/port-${name}.json`, JSON.stringify({ scenario: name, steps }));
  console.log(`${steps.length} steps`);
}
