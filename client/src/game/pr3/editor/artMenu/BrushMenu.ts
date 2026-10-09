// Ported from com/jiggmin/pr3/editor/artMenu/BrushMenu.as
import { uint } from '../../../../flash/as3.ts';
import { OptionMenu } from '../OptionMenu.ts';
import { BrushAlphaButton, BrushColorButton, BrushCursor, BrushThicknessButton, Cursor } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BrushMenu extends OptionMenu {
  declare static instance: BrushMenu;
  static savedAlpha: number = 100;
  static savedColor: number = 0;
  static savedThickness: number = 5;
  declare alphaButton: BrushAlphaButton;
  declare colorPicker: BrushColorButton;
  declare thicknessButton: BrushThicknessButton;
  remove(): void {
         BrushMenu.savedThickness = this.thicknessButton.value;
         this.thicknessButton.remove();
         this.thicknessButton = null;
         BrushMenu.savedAlpha = this.alphaButton.value;
         this.alphaButton.remove();
         this.alphaButton = null;
         BrushMenu.savedColor = uint(this.colorPicker.value);
         this.colorPicker.remove();
         this.colorPicker = null;
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         BrushMenu.instance = this;
         Cursor.setCursor(new BrushCursor());
         this.colorPicker = new BrushColorButton();
         this.colorPicker.value = BrushMenu.savedColor;
         this.addOption(this.colorPicker);
         this.thicknessButton = new BrushThicknessButton();
         this.thicknessButton.value = BrushMenu.savedThickness;
         this.addOption(this.thicknessButton);
         this.alphaButton = new BrushAlphaButton();
         this.alphaButton.value = BrushMenu.savedAlpha;
         this.addOption(this.alphaButton);
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.BrushMenu', BrushMenu);
