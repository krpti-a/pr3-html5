// Ported from com/jiggmin/pr3/editor/levelEditor/LoadingLevelPopup.as
import { Event, TextFieldAutoSize } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, TextGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class LoadingLevelPopup extends ButtonPopup {
  clickCancel(): void {
         this.dispatchEvent(new Event(Event.CANCEL));
         this.remove();
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
         var _loc_1= new TextGraphic();
         _loc_1.textBox.autoSize = TextFieldAutoSize.LEFT;
         _loc_1.textBox.wordWrap = true;
         _loc_1.textBox.htmlText = "Loading...";
         this.addGraphic(_loc_1);
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.editor.levelEditor.LoadingLevelPopup', LoadingLevelPopup);
