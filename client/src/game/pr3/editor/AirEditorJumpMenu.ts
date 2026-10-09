// Ported from com/jiggmin/pr3/editor/AirEditorJumpMenu.as
import { LevelExport } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class AirEditorJumpMenu {
  static clickExport(): void {
         LevelExport.startExport();
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.editor.AirEditorJumpMenu', AirEditorJumpMenu);
