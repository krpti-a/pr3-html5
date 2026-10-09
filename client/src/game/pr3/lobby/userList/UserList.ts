// Ported from com/jiggmin/pr3/lobby/userList/UserList.as
import { DisplayObject } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Lister } from '../../lister/Lister.ts';
import { BlossomEvent, MessagePopup, PlatformRacing3, SocketManager, Sparkworkz, UserListGraphic, UserListing } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class UserList extends Lister {
  declare static ignoredList: UserList;
  declare static friendsList: UserList;
  static LIST_TYPE_FRIENDS: string = "friends";
  static LIST_TYPE_ONLINE: string = "online";
  static LIST_TYPE_IGNORED: string = "ignored";
  declare listType: string;
  clickSearch(): void {
         var _loc_1= (this.bg);
      }
  createBG(): DisplayObject {
         return new UserListGraphic();
      }
  DACallback(param1: any, param2: string): void {
         var _loc_3_other= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= null;
         var _loc_9= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("UserList:: " + param2));
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
               _loc_8 = "member";
               if(_loc_3_other.group != "")
               {
                  _loc_8 = _loc_3_other.group;
               }
               _loc_9 = _loc_3_other.hat_array.split(",").length - 1;
               _loc_6 = ({} as any);
               _loc_6.socketID = 0;
               _loc_6.userID = _loc_3_other.userID;
               _loc_6.userName = _loc_3_other.userName;
               _loc_6.group = _loc_8;
               _loc_6.rank = _loc_3_other.rank;
               _loc_6.hats = _loc_9;
               _loc_6.status = _loc_3_other.status;
               _loc_6.nameColor = _loc_3_other.nameColor;
               _loc_5.push(_loc_6);
               _loc_7++;
            }
            this.displayList(_loc_5);
         }
         this.removeLoadingGraphic();
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= null;
         var _loc_4= false;
         if(this.listType == UserList.LIST_TYPE_ONLINE)
         {
            SocketManager.socket.getUserList(this.listType,this.getRequestID(),param1,param2);
         }
         else if(!SocketManager.socket.me.vars.guest)
         {
            _loc_3 = ({} as any);
            _loc_3.p_start = param1;
            _loc_3.p_count = param2;
            _loc_4 = false;
            if(this.listType == UserList.LIST_TYPE_FRIENDS)
            {
               Sparkworkz.DataAccess("GetMyFriends",_loc_3,$b(this, 'DACallback'),_loc_4);
            }
            if(this.listType == UserList.LIST_TYPE_IGNORED)
            {
               Sparkworkz.DataAccess("GetMyIgnored",_loc_3,$b(this, 'DACallback'),_loc_4);
            }
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  remove(): void {
         if(this.listType == "friends" && UserList.friendsList == this)
         {
            UserList.friendsList = null;
         }
         else if(this.listType == "ignored" && UserList.ignoredList == this)
         {
            UserList.ignoredList = null;
         }
         SocketManager.socket.removeEventListener("receiveUserList",$b(this, 'receiveUserListHandler'));
         super.remove();
      }
  countCallback(param1: any, param2: string): void {
         var _loc_3= null;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("UserList::countCallback - " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            if(this.listType == UserList.LIST_TYPE_FRIENDS)
            {
               this.setTotalResults(_loc_3.friend_count);
            }
            if(this.listType == UserList.LIST_TYPE_IGNORED)
            {
               this.setTotalResults(_loc_3.ignored_count);
            }
         }
      }
  removeGraphic(param1: DisplayObject): void {
         var _loc_2= (param1);
         _loc_2.remove();
      }
  receiveUserListHandler(event: BlossomEvent): void {
         var _loc_2= event.raw;
         if(_loc_2.requestID == this.requestID)
         {
            this.setTotalResults(_loc_2.results);
            this.setList(_loc_2.users);
         }
      }
  displayList(param1: any[]): void {
         var user: any= null;
         for (user of $each(param1))
         {
            this.addGraphic(new UserListing(user.socketID,user.userID,user.userName,user.rank,user.hats,user.status,user.nameColor));
         }
      }
  constructor(param1: string, param2: number = 12) {
         super(param2);
    param2 = int(param2);
         this.listType = param1;
         if(param1 == "friends")
         {
            UserList.friendsList = this;
         }
         else if(param1 == "ignored")
         {
            UserList.ignoredList = this;
         }

         this.cacheSeconds = int(0);
         this.cacheSlug = "userList - " + param1;
         this.paginationSlug = this.paginationSlug + " - " + param1;
         this.startY = int(53);
         this.rowHeight = int(20);
         this.setWidth(410);
         this.setHeight(294);
         SocketManager.socket.addEventListener("receiveUserList",$b(this, 'receiveUserListHandler'),false,0,true);
         this.setPageNum(this.getLastRememberedPage());
         var _loc_3= ({} as any);
         var _loc_4= false;
         if(param1 == UserList.LIST_TYPE_FRIENDS)
         {
            Sparkworkz.DataAccess("CountMyFriends",_loc_3,$b(this, 'countCallback'),_loc_4);
         }
         if(param1 == UserList.LIST_TYPE_IGNORED)
         {
            Sparkworkz.DataAccess("CountMyIgnored",_loc_3,$b(this, 'countCallback'),_loc_4);
         }
      }
}
$reg('com.jiggmin.pr3.lobby.userList.UserList', UserList);
