// Ported from com/jiggmin/pr3/lobby/multiPlayer/StartMatchPopup.as
import { int, $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { ConfirmPopup, CreatingMatchPopup, Levels, MessagePopup, MultiPlayerPopup, SelectorEvent, SocketManager, Sparkworkz, StartMatchOptions } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StartMatchPopup extends ButtonPopup {
  declare selectedLevel: any;
  declare m: any;
  declare selectors: Levels;
  clickCancel(): void {
         this.remove();
      }
  remove(): void {
         this.selectors.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'));
         this.selectors.removeEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmLevelHandler'));
         this.selectors.remove();
         this.selectors = null;
         this.selectedLevel = null;
         this.m = null;
         super.remove();
      }
  confirmLevelHandler(event: SelectorEvent): void {
         this.clickStartMatch();
      }
  clickStartMatch(): void {
         if(this.selectedLevel != null)
         {
            SocketManager.socket.createMatch(this.selectedLevel.levelID,this.selectedLevel.version,int(this.m.minRankBox.text),int(this.m.maxRankBox.text),int(this.m.maxPlayerBox.text),this.m.friendsCheck.checked);
            MultiPlayerPopup.quickLevel = this.selectedLevel;
            this.addPopup(new CreatingMatchPopup());
            this.remove();
         }
      }
  clickFeature(): void {
         if(this.selectedLevel != null)
         {
            this.addPopup(new ConfirmPopup($b(this, 'confirmFeature'),"Are you sure you want to set this level as the Level of the Day? (This may take up to an hour to take effect)"));
         }
      }
  selectLevelHandler(event: SelectorEvent): void {
         this.selectedLevel = event.data;
      }
  clickUnpublish(): void {
         if(this.selectedLevel != null)
         {
            this.addPopup(new ConfirmPopup($b(this, 'confirmUnpublish'),"Are you sure you want to unpublish this level?"));
         }
      }
  confirmUnpublish(): void {
         SocketManager.socket.unpublishLevel(this.selectedLevel.levelID);
      }
  setFeaturedLevelCallback(param1: any, param2: string): void {
         if(param2 != "")
         {
            if(!this.removed)
            {
               this.addPopup(new MessagePopup("Could not set featured level " + param2));
            }
         }
      }
  confirmFeature(): void {
         var _loc_1= null;
         var _loc_2= false;
         if(this.selectedLevel != null)
         {
            _loc_1 = { p_level_id: this.selectedLevel.levelID };
            _loc_2 = false;
            Sparkworkz.DataAccess("SetLOTD",_loc_1,$b(this, 'setFeaturedLevelCallback'),_loc_2);
         }
      }
  constructor() {
         super();
         this.selectors = new Levels(180,5);
         this.selectors.x = 0;
         this.selectors.y = 0;
         this.selectors.addEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'),false,0,true);
         this.selectors.addEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmLevelHandler'),false,0,true);
         this.addGraphic(this.selectors);
         this.m = new StartMatchOptions();
         this.m.minRankBox.text = "0";
         this.m.minRankBox.restrict = "0-9";
         this.m.minRankBox.maxChars = 2;
         this.m.maxRankBox.text = "99";
         this.m.maxRankBox.restrict = "0-9";
         this.m.maxRankBox.maxChars = 2;
         this.m.maxPlayerBox.text = "99";
         this.m.maxPlayerBox.restrict = "0-9";
         this.m.maxPlayerBox.maxChars = 10;
         this.m.friendsCheck.label = "Allow only my friends";
         this.m.y = this.selectors.height + 9;
         this.addGraphic(this.m);
         if(SocketManager.socket.me.hasPermission("access_unpublish_level"))
         {
            this.createButton($b(this, 'clickUnpublish'),"Unpublish Level");
         }
         if(SocketManager.socket.me.hasPermission("access_feature_level"))
         {
            this.createButton($b(this, 'clickFeature'),"Feature Level");
         }
         this.createButton($b(this, 'clickStartMatch'),"Start Game");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.StartMatchPopup', StartMatchPopup);
