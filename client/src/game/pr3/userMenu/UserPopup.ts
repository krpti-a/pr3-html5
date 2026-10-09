// Ported from com/jiggmin/pr3/userMenu/UserPopup.as
import { TextFieldAutoSize } from '../../../flash/index.ts';
import { int, $keys, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { BanPopup, Block, BlossomEvent, Chat, ConfirmPopup, Data, EasyButton, EditorPopupBGGraphic, Levels, ListCache, Player, PracticePopup, ReportedMessagePopup, SendPMPopup, SendThingPopup, SocketManager, UserBanStatsGraphic, UserList, UserPopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class UserPopup extends ButtonPopup {
  spaceX: number = 110;
  spaceY: number = 30;
  userID: number = 0;
  declare ignoredArray: any[];
  startY: number = 80;
  log: string = "";
  startX: number = 0;
  quickBanReason: string = "";
  socketID: number = 0;
  column: number = 0;
  row: number = 0;
  declare friendArray: any[];
  columns: number = 2;
  buttonW: number = 100;
  declare m: any;
  declare userName: string;
  clickSilence(): void {
         this.addPopup(new BanPopup(this.userName,"silence",this.socketID,this.userID,this.log));
         this.remove();
      }
  remove(): void {
         if(SocketManager.socket != null)
         {
            SocketManager.socket.removeEventListener("receiveUserPage",$b(this, 'receiveUserPageHandler'));
            SocketManager.socket.removeEventListener("receiveUserBans",$b(this, 'receiveUserBansHandler'));
         }
         this.friendArray = null;
         this.ignoredArray = null;
         super.remove();
      }
  clickPM(): void {
         this.addPopup(new SendPMPopup(this.userName));
         this.remove();
      }
  createMenuButton(param1: string, param2: Function): void {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_3= null;
         _loc_3 = new EasyButton();
         _loc_3.init(param1,param2);
         _loc_3.x = this.spaceX * this.column + this.startX;
         _loc_3.y = this.spaceY * this.row + this.startY;
         _loc_3.width = this.buttonW;
         _loc_4 = this;
         _loc_5 = this.column + 1;
         _loc_4.column = _loc_5;
         if(this.column >= this.columns)
         {
            this.column = int(0);
            _loc_4 = this;
            _loc_5 = this.row + 1;
            _loc_4.row = _loc_5;
         }
         this.addGraphic(_loc_3);
      }
  receiveUserPageHandler(event: BlossomEvent): void {
         var player: Player= null;
         if(SocketManager.socket != null)
         {
            SocketManager.socket.removeEventListener("receiveUserPage",$b(this, 'receiveUserPageHandler'));
         }
         var data: any= event.raw;
         this.m.rankBox.text = "Rank " + data.rank;
         if(data.online)
         {
            this.m.lastLoginBox.text = "Online (for " + Data.describeTime(data.timestamp / 1000) + ")";
         }
         else
         {
            this.m.lastLoginBox.text = "Last Login: " + Data.timestampToDateAdvanced(data.timestamp);
         }
         this.userID = int(data.userID);
         if(data.userID == null || data.userID == 0 || data.userID == "0")
         {
            this.m.groupBox.text = "Guest";
         }
         else if(event.raw.group != "")
         {
            this.m.groupBox.text = event.raw.group;
         }
         else
         {
            this.m.groupBox.text = "member";
         }
         if(data.userID != null && data.userID != 0)
         {
            if(this.friendArray.indexOf(this.userID) == -1)
            {
               this.createMenuButton("Add to Friends",$b(this, 'addToFriends'));
            }
            else
            {
               this.createMenuButton("Remove Friend",$b(this, 'removeFromFriends'));
            }
            if(this.ignoredArray.indexOf(this.userID) == -1)
            {
               this.createMenuButton("Add to Ignored",$b(this, 'addToIgnore'));
            }
            else
            {
               this.createMenuButton("Remove Ignore",$b(this, 'removeFromIgnore'));
            }
            this.createMenuButton("View Levels",$b(this, 'clickLevels'));
            this.createMenuButton("Send PM",$b(this, 'clickPM'));
            this.createMenuButton("Share Level",$b(this, 'clickSendLevel'));
            this.createMenuButton("Share Block",$b(this, 'clickSendBlock'));
         }
         if(SocketManager.socket.me.hasPermission("access_silence_user"))
         {
            this.createMenuButton("Silence User",$b(this, 'clickSilence'));
         }
         if(SocketManager.socket.me.hasPermission("access_ban_user"))
         {
            this.createMenuButton("Ban User",$b(this, 'clickBan'));
         }
         if(SocketManager.socket.me.hasPermission("access_bans"))
         {
            SocketManager.socket.getUserBans(this.userID,this.socketID);
         }
         player = new Player();
         player.setAppearance(data.hat,data.head,data.body,data.feet,data.hatColor,data.headColor,data.bodyColor,data.feetColor);
         player.x = 31;
         player.y = 71;
         player.scaleY = 0.35;
         player.scaleX = 0.35;
         this.addChild(player);
      }
  clickLevels(): void {
         if(Levels.instance == null)
         {
            this.addPopup(new PracticePopup());
         }
         Levels.instance.searchUserName(this.userName);
         this.remove();
      }
  clickBullySilence(): void {
         this.startQuickBan("Flaming / Bullying");
      }
  clickCyberSilence(): void {
         this.startQuickBan("Cybering");
      }
  clickSendLevel(): void {
         this.addPopup(new SendThingPopup(this.userID,this.userName,"level"));
         this.remove();
      }
  receiveUserBansHandler(event: BlossomEvent): void {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_2= event.raw;
         var _loc_3= new UserBanStatsGraphic();
         if(this.column != 0)
         {
            this.column = int(0);
            _loc_4 = this;
            _loc_5 = this.row + 1;
            _loc_4.row = _loc_5;
         }
         _loc_3.y = this.spaceY * this.row + this.startY;
         this.addGraphic(_loc_3);
         _loc_3.accountBox.text = "This account has been silenced " + _loc_2.accountSilenceCount + " times, and banned " + _loc_2.accountBanCount + " times.";
         _loc_3.ipBox.text = "This ip has been silenced " + _loc_2.ipSilenceCount + " times, and banned " + _loc_2.ipBanCount + " times.";
      }
  clickSendBlock(): void {
         this.addPopup(new SendThingPopup(this.userID,this.userName,"block"));
         this.remove();
      }
  removeFromIgnore(): void {
         SocketManager.socket.removeIgnore(this.userID);
         if(UserList.ignoredList != null)
         {
            UserList.ignoredList.refresh();
         }
         this.remove();
      }
  confirmQuickBan(): void {
         var _loc_1= new BanPopup(this.userName,"silence",this.socketID,this.userID,this.log);
         this.addPopup(_loc_1);
         _loc_1.quickCommit(60 * 60 * 24,this.quickBanReason);
         this.remove();
      }
  clearCampaignFriendCache(): void {
         var _loc_3= null;
         var _loc_1= SocketManager.socket.me.vars.campaign;
         var _loc_2= "";
         for (_loc_3 of $keys(_loc_1))
         {
            _loc_2 = "bestTimes - " + _loc_3;
            ListCache.deleteCache(_loc_2);
         }
      }
  clickClose(): void {
         this.remove();
      }
  startQuickBan(param1: string): void {
         this.quickBanReason = param1;
         this.addPopup(new ConfirmPopup($b(this, 'confirmQuickBan'),"Are you sure you want to silence " + this.userName + " for 1 day? Reason: " + this.quickBanReason));
      }
  clickBan(): void {
         this.addPopup(new BanPopup(this.userName,"ban",this.socketID,this.userID,this.log));
         this.remove();
      }
  addToIgnore(): void {
         SocketManager.socket.addIgnore(this.userID);
         this.remove();
      }
  clickSpamSilence(): void {
         this.startQuickBan("Spamming / Flooding");
      }
  clickSwearSilence(): void {
         this.startQuickBan("Swearing / Offensive Language");
      }
  addToFriends(): void {
         SocketManager.socket.addFriend(this.userID);
         this.clearCampaignFriendCache();
         this.remove();
      }
  removeFromFriends(): void {
         SocketManager.socket.removeFriend(this.userID);
         if(UserList.friendsList != null)
         {
            UserList.friendsList.refresh();
         }
         this.clearCampaignFriendCache();
         this.remove();
      }
  constructor(param1: string) {
         super();
         this.m = new UserPopupGraphic();
         this.setBG(new EditorPopupBGGraphic());
         var _loc_2= param1.split(":");
         var _loc_3= int(_loc_2[0]);
         var _loc_4= int(_loc_2[1]);
         var _loc_5= _loc_2[2];
         this.userID = int(_loc_4);
         this.socketID = int(_loc_3);
         this.userName = _loc_5;
         this.friendArray = SocketManager.socket.friendArray;
         this.ignoredArray = SocketManager.socket.ignoredArray;
         SocketManager.socket.getUserPage(_loc_3,_loc_4);
         SocketManager.socket.addEventListener("receiveUserPage",$b(this, 'receiveUserPageHandler'),false,0,true);
         SocketManager.socket.addEventListener("receiveUserBans",$b(this, 'receiveUserBansHandler'),false,0,true);
         this.addGraphic(this.m);
         this.m.titleBox.autoSize = TextFieldAutoSize.LEFT;
         this.m.titleBox.text = _loc_5;
         this.createButton($b(this, 'clickClose'),"Close");
         if(Chat.instance != null)
         {
            this.log = Chat.instance.getLog();
         }
         if(ReportedMessagePopup.instance != null)
         {
            this.log = ReportedMessagePopup.instance.getLog();
         }
      }
}
$reg('com.jiggmin.pr3.userMenu.UserPopup', UserPopup);
