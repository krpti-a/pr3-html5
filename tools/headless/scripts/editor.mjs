// Open the level editor and run some frames (for draw-call statistics).
export default async function ({ texts, frames, findType, until, report }) {
  await until(() => texts().some(t => /online\)/.test(t)), 300, 'menu');
  findType('MenuPage').clickEditor();
  await until(() => findType('LevelEditorPage'), 300, 'editor');
  await frames(90);
  report('editor-warm');
  await frames(30, 30);
}
