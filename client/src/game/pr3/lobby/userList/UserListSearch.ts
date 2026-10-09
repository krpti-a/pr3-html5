// Ported from com/jiggmin/pr3/lobby/userList/UserListSearch.as
import { int, $b } from '../../../../flash/as3.ts';
import { UserList } from './UserList.ts';
import { ListCache, MessagePopup, PlatformRacing3, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class UserListSearch extends UserList {
  static searchStr: string = "";
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_4= null;
         var _loc_5= false;
         var _loc_3= UserListSearch.searchStr;
         if(_loc_3 != "")
         {
            _loc_4 = ({} as any);
            _loc_4.p_name = _loc_3;
            _loc_5 = false;
            Sparkworkz.DataAccess("SearchUsers2",_loc_4,$b(this, 'searchUsersCallback'),_loc_5);
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  searchUsersCallback(param1: any, param2: string): void {
         var _loc_3_other= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= 0;
         var _loc_9= null;
         var _loc_10= null;
         var _loc_11= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("Could not search users: " + param2));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_7 = this.start + this.count;
            if(_loc_7 > _loc_4)
            {
               _loc_7 = _loc_4;
            }
            this.setTotalResults(_loc_4);
            _loc_8 = 0;
            while(_loc_8 < _loc_4)
            {
               _loc_3_other = _loc_3[_loc_8];
               _loc_10 = "member";
               if(_loc_3_other.group != "")
               {
                  _loc_10 = _loc_3_other.group;
               }
               _loc_11 = _loc_3_other.hat_array.split(",").length - 1;
               _loc_6 = ({} as any);
               _loc_6.socketID = 0;
               _loc_6.userID = _loc_3_other.userID;
               _loc_6.userName = _loc_3_other.userName;
               _loc_6.group = _loc_10;
               _loc_6.rank = _loc_3_other.rank;
               _loc_6.hats = _loc_11;
               _loc_6.status = _loc_3_other.status;
               _loc_6.nameColor = _loc_3_other.nameColor;
               _loc_5.push(_loc_6);
               _loc_8++;
            }
            _loc_9 = _loc_5.slice(this.start,_loc_7);
            this.displayList(_loc_9);
            ListCache.saveToCache(this.cacheSlug,this.cacheSeconds,0,999,_loc_4,_loc_5);
         }
         this.removeLoadingGraphic();
      }
  remove(): void {
         super.remove();
      }
  requestResults(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= UserListSearch.searchStr;
         if(_loc_3 != "")
         {
            this.cacheSlug = "userSearch - " + _loc_3;
            super.requestResults(param1,param2);
         }
      }
  constructor() {
         super("search");
         this.cacheSeconds = int(60 * 30);
      }
}
$reg('com.jiggmin.pr3.lobby.userList.UserListSearch', UserListSearch);
