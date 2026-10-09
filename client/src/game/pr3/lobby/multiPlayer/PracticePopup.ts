// Ported from com/jiggmin/pr3/lobby/multiPlayer/PracticePopup.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { CreatingMatchPopup, Levels, SelectorEvent, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PracticePopup extends ButtonPopup {
  declare selectors: Levels;
  declare selectedLevel: any;
  clickCancel(): void {
         this.remove();
      }
  selectLevelHandler(event: SelectorEvent): void {
         this.selectedLevel = event.data;
         this.clickStartMatch();
      }
  clickStartMatch(): void {
         var _loc_1= null;
         if(this.selectedLevel != null)
         {
            SocketManager.socket.createMatch(this.selectedLevel.levelID,this.selectedLevel.version,0,99,1,false);
            _loc_1 = new CreatingMatchPopup(false);
            this.addPopup(_loc_1);
            this.remove();
         }
      }
  remove(): void {
         this.selectors.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'));
         this.selectors.remove();
         this.selectors = null;
         this.selectedLevel = null;
         super.remove();
      }
  constructor() {
         super();
         this.selectors = new Levels();
         this.selectors.x = 0;
         this.selectors.y = 0;
         this.selectors.addEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'),false,0,true);
         this.addGraphic(this.selectors);
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.PracticePopup', PracticePopup);
