// Physics comparison scenarios: a level, a scripted key schedule ([fromFrame, toFrame, keyCode], frames
// counted from the start of the editor's test mode) and a fixed character.
const L = 37, U = 38, R = 39, D = 40, SP = 32;
// hold right for the whole run, jumping for `len` frames every `every` frames
const runJump = (frames, every, len, dir = 39) => [[0, frames, dir], ...Array.from({ length: Math.floor(frames / every) }, (_, i) => [i * every + 10, i * every + 10 + len, 38])];
const character = { rank: 0, speed: 50, accel: 50, jump: 50, hat: 1, head: 1, body: 1, feet: 1, hatColor: 0, headColor: 0, bodyColor: 0, feetColor: 0 };
export const scenarios = {
  // run, jump, change direction and crouch on a level made of basic/brick blocks
  'brick-run': { levelId: 1180, frames: 420, character, sched: [[5, 150, R], [30, 42, U], [80, 82, U], [150, 220, L], [170, 200, U], [230, 250, D], [255, 400, R], [300, 330, U], [360, 362, U]] },
  // standing still, a single long jump, falling
  'idle-jump': { levelId: 1180, frames: 150, character, sched: [[20, 60, U]] },
  // max stats
  'fast-run': { levelId: 1180, frames: 300, character: { ...character, speed: 100, accel: 100, jump: 100 }, sched: [[0, 300, R], [40, 70, U], [120, 125, U], [200, 260, U]] },
  // special blocks (built-in only: the Ruffle side has no block server)
  'safety-net': { levelId: 1159, frames: 600, character, sched: runJump(600, 45, 18) },
  'push-blocks': { levelId: 1197, frames: 600, character, sched: runJump(600, 50, 25) },
  'happy-sad': { levelId: 1155, frames: 700, character, sched: runJump(700, 40, 12) },
  'finish-block': { levelId: 1154, frames: 500, character: { ...character, speed: 80, jump: 70 }, sched: runJump(500, 35, 20) },
};
// Level object as the client's LevelManager builds it from a GetLevel response row.
export function levelObj(row) {
  return {
    title: row.title, comment: row.comment, version: row.version, mode: row.mode, items: row.items, alienChance: row.alienChance,
    sfchmChance: row.sfchm_chance, windChance: row.wind_chance, snowChance: row.snow_chance, seconds: row.seconds, songID: row.song_id,
    gravity: row.gravity, bgImage: row.bg_image, levelData: row.level_data, publish: row.publish, levelID: row.level_id,
    king_of_the_hat: row.king_of_the_hat, health: row.health, lua: row.lua ?? '', minRank: row.min_rank ?? 0, extraHealth: row.extra_health ?? 0,
  };
}
export async function fetchLevel(origin, id) {
  const r = await (await fetch(`${origin}/api/data/GetLevel2`, { method: 'POST', body: JSON.stringify({ p_level_id: String(id) }), headers: { 'content-type': 'application/json' } })).json();
  if (r.Error) throw new Error(`level ${id}: ${r.Error}`);
  return levelObj(r.Row[0]);
}
