// Ported from com/jiggmin/pr3/game/SinglePlayerFinishPopup.as
import { int, $each, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { CheerSound, Data, EditorPopupBGGraphic, GamePage, ListCache, LobbyPage, MessagePopup, SinglePlayerFinishPopupGraphic, SocketManager, Sounds, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SinglePlayerFinishPopup extends ButtonPopup {
  declare season: string;
  declare retryFunction: Function;
  declare m: any;
  checkHatRewards(): void {
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= 0;
         var _loc_1= SocketManager.socket.countMyGoldMedals(this.season);
         var _loc_2= SocketManager.socket.me.vars;
         var _loc_3= _loc_2.prizes[this.season];
         for (_loc_4 of $each(_loc_3))
         {
            _loc_5 = _loc_2[_loc_4.category + "Array"];
            _loc_6 = _loc_5.indexOf(_loc_4.id);
            if(_loc_6 == -1 && _loc_4.medals <= _loc_1)
            {
               SocketManager.socket.winHat(this.season,_loc_1);
               GamePage.instance.addPrizePopup(_loc_4.category,_loc_4.id,"won");
               Sounds.startSound(new CheerSound(),1);
               break;
            }
         }
      }
  saveRunCallback(param1: any, param2: string): void {
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Your run could not be saved. " + param2));
         }
         else
         {
            this.checkHatRewards();
         }
      }
  remove(): void {
         this.m = null;
         this.retryFunction = null;
         super.remove();
      }
  init(): void {
         super.init();
         if(!SocketManager.socket.me.vars.guest)
         {
            this.checkHatRewards();
         }
      }
  clickRetry(): void {
         this.retryFunction();
         this.remove();
      }
  clickLobby(): void {
         this.setPage(new LobbyPage());
      }
  constructor(season: string, param1: number, version: number, param2: number, param3: string, param4: Function) {
    param1 = int(param1); version = int(version);
         super();
         this.season = season;
         var _loc_10= null;
         var _loc_11= 0;
         var _loc_14= null;
         var _loc_15= false;
         this.retryFunction = param4;
         this.setBG(new EditorPopupBGGraphic());
         this.m = new SinglePlayerFinishPopupGraphic();
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickRetry'),"Retry");
         this.createButton($b(this, 'clickLobby'),"Return to Lobby");
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_7= 0;
         var _loc_8= ListCache.getCache("campaign:" + this.season);
         var _loc_9= param2 / 1000;
         for (_loc_10 of $each(_loc_8))
         {
            if(_loc_10.levelID == param1)
            {
               _loc_5 = _loc_10.bronze;
               _loc_6 = _loc_10.silver;
               _loc_7 = _loc_10.gold;
               break;
            }
         }
         this.m.goldBox.text = Data.formatSeconds(_loc_7);
         this.m.silverBox.text = Data.formatSeconds(_loc_6);
         this.m.bronzeBox.text = Data.formatSeconds(_loc_5);
         _loc_11 = 0;
         if(param2 > 0 && _loc_9 <= _loc_7)
         {
            this.m.medalBox.text = "You earned a Gold Medal!";
            _loc_11 = 3;
         }
         else if(param2 > 0 && _loc_9 <= _loc_6)
         {
            this.m.medalBox.text = "You earned a Silver Medal!";
            _loc_11 = 2;
         }
         else if(param2 > 0 && _loc_9 <= _loc_5)
         {
            this.m.medalBox.text = "You earned a Bronze Medal!";
            _loc_11 = 1;
         }
         else if(param1 == 55600)
         {
            this.m.medalBox.text = "Play more levels to increase your stats!";
         }
         else
         {
            this.m.medalBox.text = "Beat these times to earn a medal!";
         }
         this.m.medals.gotoAndStop(_loc_11 + 1);
         var _loc_12= false;
         var _loc_13= SocketManager.socket.me.vars.campaign[param1];
         if(SocketManager.socket.me.vars.campaign[param1] == null)
         {
            _loc_13 = ({} as any);
            _loc_13.timeMS = 999999999;
            _loc_13.medal = 0;
            _loc_13.season = this.season;
         }
         if(_loc_13.timeMS >= 0 && param2 < _loc_13.timeMS)
         {
            this.m.timeBox.text = "It\'s a new record! Your time: " + Data.formatSeconds(param2 / 1000,"decimal");
            _loc_13.timeMS = param2;
            _loc_12 = true;
         }
         else if(_loc_13.timeMS < 0 && param2 < _loc_13.timeMS)
         {
            this.m.timeBox.text = "It\'s a new record! Your time: " + Data.formatSeconds(Math.abs(param2) / 1000,"decimal");
            _loc_13.timeMS = param2;
            _loc_12 = true;
         }
         else
         {
            this.m.timeBox.text = "Your time: " + Data.formatSeconds(param2 / 1000,"decimal");
            _loc_12 = true;
         }
         if(_loc_11 > _loc_13.medal)
         {
            _loc_13.medal = _loc_11;
            _loc_12 = true;
         }
         if(Boolean(_loc_12) && !SocketManager.socket.me.vars.guest)
         {
            _loc_14 = ({} as any);
            _loc_14.p_level_id = param1;
            _loc_14.p_level_version = version;
            _loc_14.p_recorded_run = param3;
            _loc_14.p_finish_time = param2;
            _loc_15 = false;
            Sparkworkz.DataAccess("SaveCampaignRun3",_loc_14,$b(this, 'saveRunCallback'),_loc_15);
         }
         SocketManager.socket.me.vars.campaign[param1] = _loc_13;
      }
}
$reg('com.jiggmin.pr3.game.SinglePlayerFinishPopup', SinglePlayerFinishPopup);
