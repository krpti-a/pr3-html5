// Ported from com/jiggmin/pr3/mapPage/SavingStatusPopup.as
import { TextFieldAutoSize } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, TextGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SavingStatusPopup extends ButtonPopup {
  clickCancel(): void {
         this.remove();
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
         var _loc_1= new TextGraphic();
         _loc_1.textBox.autoSize = TextFieldAutoSize.LEFT;
         _loc_1.textBox.wordWrap = true;
         _loc_1.textBox.htmlText = "Saving...";
         this.addGraphic(_loc_1);
         this.createButton($b(this, 'clickCancel'),"Close");
      }
}
$reg('com.jiggmin.pr3.mapPage.SavingStatusPopup', SavingStatusPopup);
