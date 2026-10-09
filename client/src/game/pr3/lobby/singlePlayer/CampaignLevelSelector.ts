// Ported from com/jiggmin/pr3/lobby/singlePlayer/CampaignLevelSelector.as
import { int, $each } from '../../../../flash/as3.ts';
import { LobbyLevelSelector } from '../LobbyLevelSelector.ts';
import { BestTimeDisplayer, ButtonClass, CampaignButton, Settings, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class CampaignLevelSelector extends LobbyLevelSelector {
  declare season: string;
  declare displayerArray: any[];
  makeButton(): ButtonClass {
         return new CampaignButton();
      }
  remove(): void {
         this.removeDisplayers();
         this.displayerArray = null;
         super.remove();
      }
  removeDisplayers(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.displayerArray))
         {
            _loc_1.remove();
         }
         this.displayerArray = new Array();
      }
  makeButtonForLevel(param1: any): ButtonClass {
         var _loc_10= undefined;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= null;
         var _loc_9= null;
         var _loc_2= SocketManager.socket.me;
         var _loc_3= _loc_2.vars;
         var _loc_4= 1;
         _loc_5 = _loc_3.campaign[param1.levelID];
         _loc_6 = super.makeButtonForLevel(param1);
         _loc_6.mouseChildren = true;
         _loc_6.toolTip = "";
         if(_loc_5 != null)
         {
            _loc_8 = new BestTimeDisplayer(param1);
            _loc_8.x = 0;
            _loc_8.y = 13;
            _loc_6.addChild(_loc_8);
            this.displayerArray.push(_loc_8);
            _loc_4 = _loc_5.medal + 1;
         }
         _loc_6.medals.gotoAndStop(_loc_4);
         _loc_7 = param1.medalsRequired - SocketManager.socket.countMyMedals(this.season);
         if(_loc_7 > 0 && !_loc_2.hasPermission("bypass_campaign_medal_requirement"))
         {
            _loc_6.data = null;
            _loc_6.alpha = 0.5;
            _loc_10 = false;
            _loc_6.mouseChildren = false;
            _loc_6.mouseEnabled = _loc_10;
            _loc_9 = "s";
            if(_loc_7 == 1)
            {
               _loc_9 = "";
            }
            _loc_6.earnMoreMedals.textBox.text = "Earn more medals to unlock this level!";
         }
         else
         {
            _loc_6.earnMoreMedals.textBox.text = "";
            _loc_6.earnMoreMedals.visible = false;
         }
         _loc_5 = _loc_3.campaign[param1.levelID];
         if(SocketManager.socket.friendArray.length > 0 || _loc_5 == null || _loc_6.earnMoreMedals.visible == true || Settings.loginType == Settings.LOGIN_TYPE_GUEST)
         {
            _loc_6.addFriendsMessage.visible = false;
         }
         return _loc_6;
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         SocketManager.socket.getLevelList("campaign",this.getRequestID(),param1,param2,this.season);
      }
  removeGraphics(): void {
         this.removeDisplayers();
         super.removeGraphics();
      }
  constructor(season: string) {
         super(4);
         this.season = season;
         this.displayerArray = new Array();

         this.rowHeight = int(70);
         this.cacheSlug = "campaign:" + season;
         this.paginationSlug = "campaign:" + season;
         this.cacheSeconds = int(60 * 60);
         this.setWidth(390);
         this.setHeight(305);
         this.setPageNum(this.getLastRememberedPage());
      }
}
$reg('com.jiggmin.pr3.lobby.singlePlayer.CampaignLevelSelector', CampaignLevelSelector);
