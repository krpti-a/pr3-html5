// Ported from com/jiggmin/pr3/editor/artMenu/TextMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { Cursor, TextColorButton, TextCursor, TextRotationButton, TextSizeButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class TextMenu extends OptionMenu {
  static savedRotation: number = 0;
  static savedSize: number = 14;
  static savedColor: number = 466539;
  declare rotationButton: TextRotationButton;
  declare colorPicker: TextColorButton;
  declare sizeButton: TextSizeButton;
  remove(): void {
         TextMenu.savedSize = this.sizeButton.value;
         this.sizeButton.remove();
         this.sizeButton = null;
         TextMenu.savedColor = this.colorPicker.value;
         this.colorPicker.remove();
         this.colorPicker = null;
         TextMenu.savedRotation = this.rotationButton.value;
         this.rotationButton.remove();
         this.rotationButton = null;
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         this.maxRows = 3;
         Cursor.setCursor(new TextCursor());
         this.colorPicker = new TextColorButton();
         this.colorPicker.value = TextMenu.savedColor;
         this.addOption(this.colorPicker);
         this.sizeButton = new TextSizeButton();
         this.sizeButton.value = TextMenu.savedSize;
         this.addOption(this.sizeButton);
         this.rotationButton = new TextRotationButton();
         this.rotationButton.value = TextMenu.savedRotation;
         this.addOption(this.rotationButton);
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.TextMenu', TextMenu);
