// Ported from com/jiggmin/pr3/editor/artMenu/StampMenu.as
import { int } from '../../../../flash/as3.ts';
import { OptionMenu } from '../OptionMenu.ts';
import { Cursor, StampCursor, StampManager, StampPickerButton, StampRotationButton, StampSizeButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampMenu extends OptionMenu {
  static savedStamp: number = 0;
  static savedRotation: number = 0;
  static savedSize: number = 100;
  declare rotationButton: StampRotationButton;
  declare sizeButton: StampSizeButton;
  declare stampButton: StampPickerButton;
  remove(): void {
         StampMenu.savedStamp = int(this.stampButton.value.id);
         this.stampButton.remove();
         this.stampButton = null;
         StampMenu.savedSize = this.sizeButton.value;
         this.sizeButton.remove();
         this.sizeButton = null;
         StampMenu.savedRotation = this.rotationButton.value;
         this.rotationButton.remove();
         this.rotationButton = null;
         Cursor.removeCursor();
         super.remove();
      }
  constructor() {
         super();
         this.maxRows = 3;
         Cursor.setCursor(new StampCursor());
         this.stampButton = new StampPickerButton();
         if(StampMenu.savedStamp == 0)
         {
            this.stampButton.value = StampManager.requestStamp(1);
         }
         else
         {
            this.stampButton.value = StampManager.requestStamp(StampMenu.savedStamp);
         }
         this.addOption(this.stampButton);
         this.sizeButton = new StampSizeButton();
         this.sizeButton.value = StampMenu.savedSize;
         this.addOption(this.sizeButton);
         this.rotationButton = new StampRotationButton();
         this.rotationButton.value = StampMenu.savedRotation;
         this.addOption(this.rotationButton);
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.StampMenu', StampMenu);
