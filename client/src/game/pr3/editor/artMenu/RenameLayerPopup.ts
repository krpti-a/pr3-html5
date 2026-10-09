// Ported from com/jiggmin/pr3/editor/artMenu/RenameLayerPopup.as
import { Keyboard, KeyboardEvent, Point } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Popup } from '../../../popup/Popup.ts';
import { RenameLayerPopupGraphic, TextButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class RenameLayerPopup extends Popup {
  declare button: TextButton;
  declare m: any;
  clickOKButton(): void {
         this.remove();
      }
  keyDownHandler(event: KeyboardEvent): void {
         if(event.keyCode == Keyboard.ENTER)
         {
            this.remove();
         }
      }
  remove(): void {
         this.m.textBox.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'));
         this.button.label = this.m.textBox.text;
         this.button.data.mapName = this.m.textBox.text;
         this.m = null;
         this.button = null;
         super.remove();
      }
  constructor(param1: TextButton) {
         var _loc_2= undefined;
         super();
         _loc_2 = null;
         this.button = param1;
         this.dieWithoutFocus = true;
         this.autoPosition = false;
         this.intrusive = false;
         this.padding = int(0);
         this.bg.visible = false;
         this.m = new RenameLayerPopupGraphic();
         this.m.okButton.init("OK",$b(this, 'clickOKButton'));
         this.m.textBox.text = param1.label;
         this.m.textBox.restrict = " 0-9a-zA-Z!@#$%&*().><?[]{}";
         this.m.textBox.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'),false,0,true);
         this.addGraphic(this.m);
         _loc_2 = new Point(0,0);
         _loc_2 = param1.localToGlobal(_loc_2);
         this.x = _loc_2.x;
         this.y = _loc_2.y;
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.RenameLayerPopup', RenameLayerPopup);
