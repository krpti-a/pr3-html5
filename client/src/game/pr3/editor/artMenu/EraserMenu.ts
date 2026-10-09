// Ported from com/jiggmin/pr3/editor/artMenu/EraserMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { BrushAlphaButton, BrushThicknessButton, Cursor, EraserCursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class EraserMenu extends OptionMenu {
  static savedThickness: number = 5;
  static savedAlpha: number = 100;
  declare alphaButton: BrushAlphaButton;
  declare thicknessButton: BrushThicknessButton;
  remove(): void {
         EraserMenu.savedThickness = this.thicknessButton.value;
         this.thicknessButton.remove();
         this.thicknessButton = null;
         EraserMenu.savedAlpha = this.alphaButton.value;
         this.alphaButton.remove();
         this.alphaButton = null;
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         Cursor.setCursor(new EraserCursor());
         this.thicknessButton = new BrushThicknessButton();
         this.thicknessButton.value = EraserMenu.savedThickness;
         this.addOption(this.thicknessButton);
         this.alphaButton = new BrushAlphaButton();
         this.alphaButton.value = EraserMenu.savedAlpha;
         this.addOption(this.alphaButton);
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.EraserMenu', EraserMenu);
