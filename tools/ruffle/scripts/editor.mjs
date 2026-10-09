// Original: main menu -> "Goto Level Editor".
export default async function ({ click, shot, sleep }) {
  await sleep(3000);
  await click(600, 300); await sleep(500); // focus the player
  await click(338, 455); await sleep(500); await click(338, 455);
  await sleep(5000); await shot('editor');
}
