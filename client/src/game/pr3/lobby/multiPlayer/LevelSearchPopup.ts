// Ported from com/jiggmin/pr3/lobby/multiPlayer/LevelSearchPopup.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, LevelSearch, LevelSearchPopupGraphic, Levels, PracticePopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class LevelSearchPopup extends ButtonPopup {
  declare m: any;
  clickSearch(): void {
         var _loc_1= this.m.searchBox.text;
         var _loc_2= this.m.modeOptions.selectedOption.data;
         var _loc_3= this.m.orderOptions.selectedOption.data;
         var _loc_4= this.m.dirOptions.selectedOption.data;
         if(Levels.instance == null)
         {
            this.addPopup(new PracticePopup());
         }
         Levels.instance.search(_loc_2,_loc_3,_loc_4,_loc_1);
         this.remove();
      }
  clickCancel(): void {
         this.remove();
      }
  constructor() {
         super();
         this.m = new LevelSearchPopupGraphic();
         this.setBG(new EditorPopupBGGraphic());
         this.m.searchBox.text = LevelSearch.search;
         this.m.modeOptions.addOption("User Name","user");
         this.m.modeOptions.addOption("Course Title","title");
         this.m.modeOptions.selectOptionData(LevelSearch.mode);
         this.m.orderOptions.addOption("Date","date");
         this.m.orderOptions.addOption("Alphabetical","alphabetical");
         this.m.orderOptions.addOption("Rating","rating");
         this.m.orderOptions.addOption("Popularity","popularity");
         this.m.orderOptions.selectOptionData(LevelSearch.sort);
         this.m.dirOptions.addOption("Descending","desc");
         this.m.dirOptions.addOption("Ascending","asc");
         this.m.dirOptions.selectOptionData(LevelSearch.dir);
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickSearch'),"Search");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.LevelSearchPopup', LevelSearchPopup);
