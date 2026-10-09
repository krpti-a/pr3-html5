// Ported from com/jiggmin/pr3/lobby/singlePlayer/BestTimeDisplayer.as
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Data, ListCache, PlayerListing, PlayerListingButton, Settings, SocketManager, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BestTimeDisplayer extends Removable {
  playerSpacing: number = 96;
  declare level: any;
  playerPosX: number = 5;
  declare cacheSlug: string;
  declare playerArray: any[];
  cacheSeconds: number = 1800;
  displayList(param1: any[]): void {
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= NaN;
         var _loc_7= NaN;
         var _loc_8= null;
         var _loc_2= param1.length;
         var _loc_3= 0;
         while(_loc_3 < _loc_2)
         {
            _loc_4 = param1[_loc_3];
            _loc_6 = Number(_loc_4.best_time_ms);
            _loc_7 = _loc_6 / 1000;
            _loc_8 = Data.formatSeconds(Math.abs(_loc_7),"decimal");
            this.addUser(_loc_4.user_id,_loc_4.name,_loc_8,_loc_4.hat,_loc_4.head,_loc_4.body,_loc_4.feet,_loc_4.hat_color,_loc_4.head_color,_loc_4.body_color,_loc_4.feet_color,_loc_6 < 0);
            _loc_3++;
         }
      }
  getRunsCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= 0;
         if(param2 == "")
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_6 = 0;
            while(_loc_6 < _loc_4)
            {
               _loc_5[_loc_6] = _loc_3[_loc_6];
               _loc_6++;
            }
            ListCache.saveToCache(this.cacheSlug,this.cacheSeconds,0,3,3,_loc_5);
            this.displayList(_loc_5);
         }
      }
  remove(): void {
         this.level = null;
         this.removeUsers();
         super.remove();
      }
  clickPlayer(param1: PlayerListingButton): void {
         this.level.ghost = param1.data;
      }
  addUser(param1: number, param2: string, param4: string, param5: number, param6: number, param7: number, param8: number, param9: number, param10: number, param11: number, param12: number, died: boolean): void {
    param5 = int(param5); param6 = int(param6); param7 = int(param7); param8 = int(param8); param9 = int(param9); param10 = int(param10); param11 = int(param11); param12 = int(param12);
         var _loc_13= null;
         param4 = "Best: " + param4;
         _loc_13 = new PlayerListing(param2,param4,param5,param6,param7,param8,param9,param10,param11,param12,null,0,true);
         if(died)
         {
            _loc_13.setRankColor(16724787);
         }
         _loc_13.x = this.playerPosX;
         _loc_13.m.button.mouseEnabled = true;
         _loc_13.mouseChildren = true;
         _loc_13.mouseEnabled = true;
         this.playerPosX += this.playerSpacing;
         this.addChild(_loc_13);
         var _loc_14= ({} as any);
         _loc_14.userID = param1;
         _loc_14.userName = param2;
         _loc_14.bestTime = param4;
         _loc_14.hat = param5;
         _loc_14.head = param6;
         _loc_14.body = param7;
         _loc_14.feet = param8;
         _loc_14.hatColor = param9;
         _loc_14.headColor = param10;
         _loc_14.bodyColor = param11;
         _loc_14.feetColor = param12;
         var _loc_15= _loc_13.m.button;
         _loc_15.init("",$b(this, 'clickPlayer'));
         _loc_15.sendSelf = true;
         _loc_15.data = _loc_14;
      }
  removeUsers(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.playerArray))
         {
            _loc_1.remove();
         }
         this.playerArray = new Array();
      }
  constructor(param1: any) {
         super();
         var _loc_6= null;
         var _loc_7= null;
         var _loc_8= false;
         this.playerArray = new Array();
         this.level = param1;
         this.cacheSlug = "bestTimes - " + param1.levelID;
         var _loc_2= SocketManager.socket.me;
         var _loc_3= _loc_2.vars;
         var _loc_4= _loc_3.campaign[param1.levelID];
         if(_loc_3.campaign[param1.levelID] != null)
         {
            _loc_6 = Data.formatSeconds(Math.abs(_loc_4.timeMS / 1000),"decimal");
            this.addUser(_loc_2.userID,_loc_2.userName,_loc_6,_loc_3.hat,_loc_3.head,_loc_3.body,_loc_3.feet,_loc_3.hatColor,_loc_3.headColor,_loc_3.bodyColor,_loc_3.feetColor,_loc_4.timeMS < 0);
         }
         var _loc_5= ListCache.getFromCache(this.cacheSlug,0,3);
         if(ListCache.getFromCache(this.cacheSlug,0,3) != false)
         {
            this.displayList(_loc_5.list);
         }
         else if(Settings.loginType == "member")
         {
            _loc_7 = ({} as any);
            _loc_7.p_level_id = param1.levelID;
            _loc_8 = false;
            Sparkworkz.DataAccess("GetMyFriendsFastestRuns",_loc_7,$b(this, 'getRunsCallback'),_loc_8);
         }
      }
}
$reg('com.jiggmin.pr3.lobby.singlePlayer.BestTimeDisplayer', BestTimeDisplayer);
