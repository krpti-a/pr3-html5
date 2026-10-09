// Ported from com/jiggmin/pr3/PR3Socket.as
import { ByteArray } from '../../flash/index.ts';
import { int, uint, $each, $b } from '../../flash/as3.ts';
import { BlossomSocket } from '../blossomSocket/BlossomSocket.ts';
import { BitFieldHelper, BlossomEvent, ErrorPage, MessagePopup, PlatformRacing3, Settings } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PR3Socket extends BlossomSocket {
  declare friendArray: any[];
  declare ignoredArray: any[];
  getPMs(param1: number, param2: number, param3: number): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         var _loc_4= ({} as any);
         _loc_4.t = "get_pms";
         _loc_4.request_id = param1;
         _loc_4.start = param2;
         _loc_4.count = param3;
         this.send(_loc_4);
      }
  banUser(param1: number, param2: number, param3: number, param4: string, param5: string, param6: string = ""): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_7= ({} as any);
         _loc_7.t = "ban_user";
         _loc_7.socket_id = param1;
         _loc_7.user_id = param2;
         _loc_7.seconds = param3;
         _loc_7.ban_type = param4;
         _loc_7.reason = param5;
         _loc_7.log = param6;
         this.send(_loc_7);
      }
  banUserFromMatch(param1: number): void {
    param1 = int(param1);
         var obj= ({} as any);
         obj.t = "ban";
         obj.socket_id = param1;
         this.send(obj);
      }
  kickUserFromMatch(param1: number): void {
    param1 = int(param1);
         var obj= ({} as any);
         obj.t = "kick";
         obj.socket_id = param1;
         this.send(obj);
      }
  removeFriend(param1: number): void {
    param1 = int(param1);
         var _loc_2= this.friendArray.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.friendArray.splice(_loc_2,1);
            this.editUserList(param1,"friend","remove");
         }
      }
  rateLevel(levelID: number, rating: number): void {
    levelID = int(levelID); rating = int(rating);
         var obj= ({} as any);
         obj.t = "rate_level";
         obj.level_id = levelID;
         obj.rating = rating;
         this.send(obj);
      }
  sendPM(param1: string, param2: string, param3: string): void {
         var _loc_4= ({} as any);
         _loc_4.t = "send_pm";
         _loc_4.name = param1;
         _loc_4.title = param2;
         _loc_4.message = param3;
         this.send(_loc_4);
      }
  sendThing(param1: string, param2: number, param3: string, param4: number): void {
    param2 = int(param2); param4 = int(param4);
         var _loc_5= ({} as any);
         _loc_5.t = "send_thing";
         _loc_5.thing = param1;
         _loc_5.thing_id = param2;
         _loc_5.thing_title = param3;
         _loc_5.user_id = param4;
         this.send(_loc_5);
      }
  getLOTD(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "get_lotd";
         this.send(_loc_1);
      }
  getTournament(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "get_tournament";
         this.send(_loc_1);
      }
  remove(): void {
         if(this.me != null)
         {
            Settings.myCharacter = this.me.vars;
         }
         this.removeEventListener("receiveFriendsAndIgnored",$b(this, 'receiveArraysHandler'));
         this.removeEventListener("alert",$b(this, 'alertHandler'));
         this.removeEventListener("logoutTrigger",$b(this, 'logoutTriggerHandler'));
         super.remove();
      }
  getLevelList(param1: string, param2: number = 0, param3: number = 0, param4: number = 5, data: string = null): void {
    param2 = int(param2); param3 = int(param3); param4 = int(param4);
         var _loc_5= ({} as any);
         _loc_5.t = "get_level_list";
         _loc_5.mode = param1;
         _loc_5.request_id = param2;
         _loc_5.start = param3;
         _loc_5.count = param4;
         _loc_5.data = data;
         this.send(_loc_5);
      }
  receiveArraysHandler(event: BlossomEvent): void {
         this.friendArray = event.raw.friendArray;
         this.ignoredArray = event.raw.ignoredArray;
      }
  unpublishLevel(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "unpublish_level";
         _loc_2.level_id = param1;
         this.send(_loc_2);
      }
  update(param1: any): void {
         param1.t = "update";
         this.send(param1);
      }
  acceptThingTransfer(param1: number, title: string, comment: string, category: string, publish: boolean): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "accept_thing_transfer";
         _loc_2.transfer_id = param1;
         _loc_2.title = title;
         _loc_2.comment = comment;
         _loc_2.category = category;
         _loc_2.publish = publish;
         this.send(_loc_2);
      }
  deletePMs(param1: any[]): void {
         var _loc_2= ({} as any);
         _loc_2.t = "delete_pms";
         _loc_2.pm_array = param1;
         this.send(_loc_2);
      }
  addIgnore(param1: number): void {
    param1 = int(param1);
         if(this.ignoredArray.indexOf(param1) == -1)
         {
            this.ignoredArray.push(param1);
            this.editUserList(param1,"ignored","add");
         }
      }
  getMemberList(param1: string): void {
         var _loc_2= ({} as any);
         _loc_2.t = "get_member_list";
         _loc_2.room_name = param1;
         this.send(_loc_2);
      }
  countMyMedals(season: string): number {
         var _loc_3= null;
         var _loc_1= 0;
         var _loc_2= this.me.vars.campaign;
         if(_loc_2 != null)
         {
            for (_loc_3 of $each(_loc_2))
            {
               if(_loc_3.season == season)
               {
                  _loc_1 += _loc_3.medal;
               }
            }
         }
         return _loc_1;
      }
  deleteLevel(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "delete_level";
         _loc_2.level_id = param1;
         this.send(_loc_2);
      }
  getPM(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "get_pm";
         _loc_2.message_id = param1;
         this.send(_loc_2);
      }
  logoutTriggerHandler(event: BlossomEvent): void {
         PlatformRacing3.setPage(new ErrorPage(event.raw.message));
      }
  alertHandler(event: BlossomEvent): void {
         PlatformRacing3.addPopup(new MessagePopup(event.raw.message));
      }
  loseHat(param1: number, param2: number, param3: number, param4: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_5= ({} as any);
         _loc_5.t = "lose_hat";
         _loc_5.x = param1;
         _loc_5.y = param2;
         _loc_5.vel_x = param3;
         _loc_5.vel_y = param4;
         this.send(_loc_5);
      }
  addFriend(param1: number): void {
    param1 = int(param1);
         if(this.friendArray.indexOf(param1) == -1)
         {
            this.friendArray.push(param1);
            this.editUserList(param1,"friend","add");
         }
      }
  finishDrawing(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "finish_drawing";
         this.send(_loc_1);
      }
  requestMatches(param1: number, lobbyId: number): void {
    param1 = int(param1); lobbyId = uint(lobbyId);
         var _loc_2= ({} as any);
         _loc_2.t = "request_matches";
         _loc_2.num = param1;
         _loc_2.lobbyId = lobbyId;
         this.send(_loc_2);
      }
  getUserBans(param1: number, param2: number): void {
         var _loc_3= ({} as any);
         _loc_3.t = "get_user_bans";
         _loc_3.socket_id = param2;
         _loc_3.user_id = param1;
         this.send(_loc_3);
      }
  deletePM(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "delete_pm";
         _loc_2.message_id = param1;
         this.send(_loc_2);
      }
  createMatch(param1: number, param2: number, param3: number, param4: number, param5: number, param6: boolean): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5);
         var _loc_7= ({} as any);
         _loc_7.t = "create_match";
         _loc_7.level_id = param1;
         _loc_7.version = param2;
         _loc_7.min_rank = param3;
         _loc_7.max_rank = param4;
         _loc_7.max_members = param5;
         _loc_7.only_friends = param6;
         this.send(_loc_7);
      }
  joinTournament(): void {
         var obj= ({} as any);
         obj.t = "join_tournament";
         this.send(obj);
      }
  countMyGoldMedals(season: string): number {
         var _loc_3= null;
         var _loc_1= 0;
         var _loc_2= this.me.vars.campaign;
         if(_loc_2 != null)
         {
            for (_loc_3 of $each(_loc_2))
            {
               if(_loc_3.season == season)
               {
                  if(_loc_3.medal == 3)
                  {
                     _loc_1++;
                  }
               }
            }
         }
         return _loc_1;
      }
  getHat(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "get_hat";
         _loc_2.id = param1;
         this.send(_loc_2);
      }
  stopQuickJoin(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "stop_quick_join";
         this.send(_loc_1);
      }
  leaveLobby(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "leave_lobby";
         this.send(_loc_1);
      }
  forceMatchStart(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "force_start";
         this.send(_loc_1);
      }
  getUserPage(param1: number, param2: number): void {
         var _loc_3= ({} as any);
         _loc_3.t = "get_user_page";
         _loc_3.socket_id = param1;
         _loc_3.user_id = param2;
         this.send(_loc_3);
      }
  reportPM(param1: number): void {
    param1 = int(param1);
         var _loc_2= ({} as any);
         _loc_2.t = "report_pm";
         _loc_2.message_id = param1;
         this.send(_loc_2);
      }
  finishMatch(time: any): void {
         var _loc_1= ({} as any);
         _loc_1.t = "finish_match";
         _loc_1.time = time;
         this.send(_loc_1);
      }
  kothTime(time: any): void {
         var obj= ({} as any);
         obj.t = "koth";
         obj.time = time;
         this.send(obj);
      }
  editUserList(param1: number, param2: string, param3: string): void {
    param1 = int(param1);
         var _loc_4= ({} as any);
         _loc_4.t = "edit_user_list";
         _loc_4.user_id = param1;
         _loc_4.list_type = param2;
         _loc_4.action = param3;
         this.send(_loc_4);
      }
  startQuickJoin(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "start_quick_join";
         this.send(_loc_1);
      }
  removeIgnore(param1: number): void {
    param1 = int(param1);
         var _loc_2= this.ignoredArray.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.ignoredArray.splice(_loc_2,1);
            this.editUserList(param1,"ignored","remove");
         }
      }
  winHat(season: string, medals: number): void {
    medals = int(medals);
         var packet: any= ({} as any);
         packet.t = "win_hat";
         packet.season = season;
         packet.medals = medals;
         this.send(packet);
      }
  pr3GuestLogin(): void {
         var packet: any= ({} as any);
         packet.t = "guest_login";
         this.send(packet);
      }
  pr3TokenLogin(loginToken: string): void {
         var packet: any= ({} as any);
         packet.t = "token_login";
         packet.login_token = loginToken;
         this.send(packet);
      }
  updateCoins(param1: any): void {
         var _loc_2= ({} as any);
         _loc_2.t = "coins";
         _loc_2.coins = param1;
         this.send(_loc_2);
      }
  updateDash(param1: any): void {
         var _loc_2= ({} as any);
         _loc_2.t = "dash";
         _loc_2.dash = param1;
         this.send(_loc_2);
      }
  saveAccountSettings(param1: number, param2: number, param3: number, param4: number, param5: number, param6: number, param7: number, param8: number, param9: number, param10: number, param11: number, param12: number): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5); param6 = int(param6); param7 = int(param7); param8 = int(param8); param9 = int(param9); param10 = int(param10); param11 = int(param11); param12 = int(param12);
         var _loc_13= ({} as any);
         _loc_13.t = "set_account_settings";
         _loc_13.hat = param1;
         _loc_13.head = param2;
         _loc_13.body = param3;
         _loc_13.feet = param4;
         _loc_13.hatColor = param5;
         _loc_13.headColor = param6;
         _loc_13.bodyColor = param7;
         _loc_13.feetColor = param8;
         _loc_13.speed = param9;
         _loc_13.accel = param10;
         _loc_13.jump = param11;
         _loc_13.expBonus = param12;
         this.send(_loc_13);
      }
  forfiet(): void {
         var _loc_1= ({} as any);
         _loc_1.t = "forfiet";
         this.send(_loc_1);
      }
  getUserList(param1: string, param2: number, param3: number, param4: number): void {
    param2 = int(param2); param3 = int(param3); param4 = int(param4);
         var _loc_5= ({} as any);
         _loc_5.t = "get_user_list";
         _loc_5.list_type = param1;
         _loc_5.request_id = param2;
         _loc_5.start = param3;
         _loc_5.count = param4;
         this.send(_loc_5);
      }
  thingExits(type: string, title: string, category: string = ""): void {
         var _loc_1= ({} as any);
         _loc_1.t = "thingExits";
         _loc_1.thing_type = type;
         _loc_1.thing_title = title;
         _loc_1.thing_category = category;
         this.send(_loc_1);
      }
  sendUseItem(): void {
         var data: ByteArray= new ByteArray();
         data.writeShort(22);
         this.sendBytes(data);
      }
  sendGetItem(x: number, y: number, side: string, item: string): void {
    x = int(x); y = int(y);
         var data: ByteArray= new ByteArray();
         data.writeShort(14);
         data.writeInt(x);
         data.writeInt(y);
         data.writeUTF(side);
         data.writeUTF(item);
         this.sendBytes(data);
      }
  sendKeybinds(up: boolean, down: boolean, left: boolean, right: boolean): void {
         var helper: BitFieldHelper= new BitFieldHelper(0);
         if(up)
         {
            helper.add(1 << 0);
         }
         if(down)
         {
            helper.add(1 << 1);
         }
         if(left)
         {
            helper.add(1 << 2);
         }
         if(right)
         {
            helper.add(1 << 3);
         }
         var data: ByteArray= new ByteArray();
         data.writeShort(6);
         data.writeByte(helper.get());
         this.sendBytes(data);
      }
  constructor(param1: string, param2: number, param3: string) {
         super(param1,param2,param3);
    param2 = int(param2);
         this.friendArray = new Array();
         this.ignoredArray = new Array();

         this.version = 25;
         this.addEventListener("receiveFriendsAndIgnored",$b(this, 'receiveArraysHandler'),false,0,true);
         this.addEventListener("alert",$b(this, 'alertHandler'),false,0,true);
         this.addEventListener("logoutTrigger",$b(this, 'logoutTriggerHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.PR3Socket', PR3Socket);
