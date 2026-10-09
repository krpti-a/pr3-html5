// Ported from com/jiggmin/pr3/editor/EditorPopup.as
import { Popup } from '../../popup/Popup.ts';
import { EditorPopupBGGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EditorPopup extends Popup {
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
      }
}
$reg('com.jiggmin.pr3.editor.EditorPopup', EditorPopup);
