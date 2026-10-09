// Ported from com/jiggmin/ui/PaginationPopup.as
import { Event, TextFieldAutoSize } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { ButtonPopup } from '../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, PaginationPopupGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PaginationPopup extends ButtonPopup {
  static SET_PAGE_NUM: string = "setPageNum";
  _selectedPage: number = 0;
  declare m: any;
  clickCancel(): void {
         this.remove();
      }
  clickOK(): void {
         this._selectedPage = int(int(this.m.inputBox.text));
         this.dispatchEvent(new Event(PaginationPopup.SET_PAGE_NUM));
         this.remove();
      }
  get selectedPage(): number {
         return this._selectedPage;
      }
  constructor(param1: number, param2: number) {
    param1 = int(param1); param2 = int(param2);
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.autoPosition = false;
         this.intrusive = false;
         this.dieWithoutFocus = true;
         this.m = new PaginationPopupGraphic();
         this.m.numBox.autoSize = TextFieldAutoSize.LEFT;
         this.m.numBox.text = "/ " + param2.toString();
         this.m.inputBox.text = param1.toString();
         this.m.inputBox.restrict = "0-9";
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickOK'),"OK");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.ui.PaginationPopup', PaginationPopup);
