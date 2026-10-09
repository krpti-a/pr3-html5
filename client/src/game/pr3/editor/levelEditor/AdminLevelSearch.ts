// Ported from com/jiggmin/pr3/editor/levelEditor/AdminLevelSearch.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { Levels, MapPage, SelectorEvent } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class AdminLevelSearch extends ButtonPopup {
  declare selectors: Levels;
  clickCancel(): void {
         this.remove();
      }
  selectLevelHandler(event: SelectorEvent): void {
         MapPage.instance.load(event.data.levelID);
         this.remove();
      }
  remove(): void {
         this.selectors.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'));
         this.selectors.remove();
         this.selectors = null;
         super.remove();
      }
  constructor() {
         super();
         this.selectors = new Levels(400,12,true);
         this.selectors.x = 0;
         this.selectors.y = 0;
         this.selectors.addEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'),false,0,true);
         this.addGraphic(this.selectors);
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.editor.levelEditor.AdminLevelSearch', AdminLevelSearch);
