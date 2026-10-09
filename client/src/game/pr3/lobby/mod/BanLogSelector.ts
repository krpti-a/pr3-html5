// Ported from com/jiggmin/pr3/lobby/mod/BanLogSelector.as
import { int, $b } from '../../../../flash/as3.ts';
import { ModSelector } from './ModSelector.ts';
import { BanDetailsPopup, Data, MessagePopup, NameMaker, PlatformRacing3, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BanLogSelector extends ModSelector {
  banListCallback(param1: any, param2: string): void {
         var _loc_3_other= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("Could not retrieve ban records: " + param2));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_7 = 0;
            while(_loc_7 < _loc_4)
            {
               _loc_3_other = _loc_3[_loc_7];
               _loc_6 = ({} as any);
               _loc_6.modUserID = Number(_loc_3_other.mod_user_id);
               _loc_6.bannedUserID = Number(_loc_3_other.banned_user_id);
               _loc_6.modName = _loc_3_other.mod_name;
               _loc_6.modNameColor = _loc_3_other.mod_name_color;
               _loc_6.modGroup = _loc_3_other.mod_group;
               _loc_6.bannedName = _loc_3_other.banned_name;
               _loc_6.bannedNameColor = _loc_3_other.banned_name_color;
               _loc_6.bannedGroup = _loc_3_other.banned_group;
               _loc_6.banType = _loc_3_other.ban_type;
               _loc_6.banTime = Number(_loc_3_other.ban_time);
               _loc_6.expireTime = Number(_loc_3_other.expire_time);
               _loc_6.banID = Number(_loc_3_other.ban_id);
               _loc_6.bannedIP = _loc_3_other.banned_ip;
               _loc_6.banLifted = _loc_3_other.ban_lifted;
               _loc_6.banLiftedBy = _loc_3_other.ban_lifted_by;
               _loc_6.banLiftedUsername = _loc_3_other.ban_listed_username;
               _loc_6.banLiftedColor = _loc_3_other.ban_listed_color;
               _loc_6.banLiftedGroup = _loc_3_other.ban_lifted_group;
               _loc_5.push(_loc_6);
               _loc_7++;
            }
            this.setList(_loc_5);
         }
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= ({} as any);
         _loc_3.p_start = param1;
         _loc_3.p_count = param2;
         var _loc_4= false;
         Sparkworkz.DataAccess("GetBanRecords",_loc_3,$b(this, 'banListCallback'),_loc_4);
      }
  makeTitle(param1: any): string {
         var _loc_2= new NameMaker().makeNameFromParts(param1.bannedName,param1.bannedGroup,0,param1.bannedUserID,param1.bannedNameColor);
         var _loc_3= param1.bannedIP;
         if(_loc_2 == "")
         {
            _loc_2 = "Guest";
         }
         if(_loc_3 != "")
         {
            _loc_3 = " (" + _loc_3 + ")";
         }
         var _loc_4= Data.describeTime(param1.expireTime - param1.banTime);
         var _loc_5= param1.modName + " " + param1.banType + "ed " + _loc_2 + _loc_3 + " for " + _loc_4;
         return new NameMaker().makeNameFromParts(param1.modName,param1.modGroup,0,param1.modUserID,param1.modNameColor) + " " + param1.banType + "ed " + _loc_2 + _loc_3 + (param1.expireTime == "-1" ? " permanently" : " for " + _loc_4) + (param1.banLifted == "1" ? " (Lifted by " + new NameMaker().makeNameFromParts(param1.banLiftedUsername,param1.banLiftedGroup,0,param1.banLiftedBy,param1.banLiftedColor) + ")" : (param1.expireTime != "-1" && new Date().time / 1000 > param1.expireTime ? " (Expired)" : ""));
      }
  remove(): void {
         super.remove();
      }
  makeDate(param1: any): string {
         return Data.timestampToDate(param1.banTime * 1000);
      }
  selectSomething(param1: any): void {
         super.selectSomething(param1);
         PlatformRacing3.addPopup(new BanDetailsPopup(param1.banID));
      }
  constructor() {
         super();
         var _loc_1= ({} as any);
         var _loc_2= false;
         Sparkworkz.DataAccess("CountBans",_loc_1,$b(this, 'countTotResultsCallback'),_loc_2);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.BanLogSelector', BanLogSelector);
