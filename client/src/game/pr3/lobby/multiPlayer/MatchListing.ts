// Ported from com/jiggmin/pr3/lobby/multiPlayer/MatchListing.as
import { Dictionary, Event } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Fadable } from '../../../basic/Fadable.ts';
import { BlossomEvent, BlossomRoom, Data, InMatchPopup, MatchPage, MultiplayerLevelListingButton, PlatformRacing3, PlayerListing, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class MatchListing extends Fadable {
  declare callback: Function;
  declare playerListingArray: any[];
  maxColumns: number = 4;
  declare room: BlossomRoom;
  declare matchObj: any;
  declare m: MultiplayerLevelListingButton;
  declare matchName: string;
  join: boolean = false;
  spacingX: number = 96;
  spacingY: number = 25;
  startY: number = 13;
  declare playerListingDict: any;
  startX: number = 5;
  kick: boolean = false;
  ban: boolean = false;
  ply: boolean = false;
  started: boolean = false;
  startingBGHeight: number = NaN;
  declare popupRef: InMatchPopup;
  remove(): void {
         this.removeEventListener(Fadable.REACHED_TARGET_ALPHA,$b(this, 'fadedOutHandler'));
         this.room.removeEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'));
         this.room.removeEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'));
         this.room.removeEventListener("startGame",$b(this, 'startGameHandler'));
         this.room.removeEventListener("updateUserRoomVars",$b(this, 'updateUserRoomVarsHandler'));
         this.removeUsers();
         this.playerListingDict = null;
         this.playerListingArray = null;
         this.room.remove();
         this.room = null;
         this.removeChild(this.m);
         this.m = null;
         this.callback = null;
         super.remove();
      }
  beginRemove(): void {
         this.fadeToAlpha(0,10);
         this.addEventListener(Fadable.REACHED_TARGET_ALPHA,$b(this, 'fadedOutHandler'),false,0,true);
      }
  initLevelOfTheDay(): void {
         this.m.bgHolder.bg.levelOfTheDayDisplay.visible = true;
      }
  userJoinRoomHandler(event: BlossomEvent): void {
         var _loc_2= event.fromUser;
         var _loc_3= _loc_2.vars;
         var _loc_4= new PlayerListing(_loc_2.userName,_loc_3.rank.toString(),_loc_3.hat,_loc_3.head,_loc_3.body,_loc_3.feet,_loc_3.hatColor,_loc_3.headColor,_loc_3.bodyColor,_loc_3.feetColor,_loc_2.socketID,_loc_3.ping);
         _loc_4.setKickVisible(this.kick);
         _loc_4.setBanVisible(this.ban);
         _loc_4.mouseChildren = this.kick || this.ban;
         _loc_4.mouseEnabled = this.kick || this.ban;
         this.playerListingDict[_loc_2] = _loc_4;
         this.playerListingArray.push(_loc_4);
         this.displayUsers();
      }
  clickHandler(): void {
         if(this.callback != null)
         {
            this.callback(this);
         }
      }
  userLeaveRoomHandler(event: BlossomEvent): void {
         var _loc_2= event.fromUser;
         var _loc_3= this.playerListingDict[_loc_2];
         if(_loc_3 != null)
         {
            _loc_3.remove();
         }
         delete this.playerListingDict[_loc_2];
         var _loc_4= this.playerListingArray.indexOf(_loc_3);
         if(this.playerListingArray.indexOf(_loc_3) != -1)
         {
            this.playerListingArray.splice(_loc_4,1);
         }
         this.displayUsers();
         if(this.room.userArray.length == 0)
         {
            this.beginRemove();
         }
      }
  displayUsers(): void {
         var _loc_3= 0;
         var playerListing: PlayerListing= null;
         var playerArray: any[]= this.room.userArray;
         var _loc_2= 0;
         _loc_3 = 0;
         var _loc_4= false;
         if(playerArray.length > 4)
         {
            _loc_4 = true;
         }
         for (playerListing of $each(this.playerListingArray))
         {
            playerListing.x = _loc_2 * this.spacingX + this.startX;
            playerListing.y = _loc_3 * this.spacingY + this.startY;
            if(_loc_4)
            {
               playerListing.goSmall();
            }
            else
            {
               playerListing.goBig();
               this.m.bgHolder.bg.listingBG.height = this.startingBGHeight;
               if(this.m.bgHolder.bg.listingBG2 != null)
               {
                  this.m.bgHolder.bg.listingBG2.height = this.m.bgHolder.bg.listingBG.height;
               }
            }
            this.addChild(playerListing);
            _loc_2++;
            if(_loc_2 >= this.maxColumns)
            {
               _loc_2 = 0;
               _loc_3++;
            }
         }
         if(playerArray.length > 8)
         {
            this.m.bgHolder.bg.listingBG.height = this.startingBGHeight + ((_loc_3 + int((playerArray.length - 1) / 4) - 1) * this.spacingY + this.startY - (_loc_3 * this.spacingY + this.startY));
            if(this.m.bgHolder.bg.listingBG2 != null)
            {
               this.m.bgHolder.bg.listingBG2.height = this.m.bgHolder.bg.listingBG.height;
            }
         }
         if(this.popupRef != null)
         {
            this.popupRef.redrawHandler();
         }
      }
  getMatchObj(): any {
         return this.matchObj;
      }
  removeUsers(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.playerListingDict))
         {
            _loc_1.remove();
         }
         this.playerListingDict = new Dictionary();
         this.playerListingArray = new Array();
      }
  startGameHandler(event: BlossomEvent): void {
         var roomName= undefined;
         var randomSeed= undefined;
         this.started = true;
         if(this.join)
         {
            roomName = event.raw.gameName;
            randomSeed = event.raw.random;
            PlatformRacing3.instance.setPage(new MatchPage(this.matchObj.levelID,this.matchObj.version,roomName,this.matchObj.creatorName,this.matchObj.creatorModerator,this.matchObj.creatorID,randomSeed));
         }
         else
         {
            this.beginRemove();
         }
      }
  fadedOutHandler(event: Event): void {
         this.remove();
      }
  getRoom(): BlossomRoom {
         return this.room;
      }
  updateUserRoomVarsHandler(event: BlossomEvent): void {
         var player: PlayerListing= this.playerListingDict[event.fromUser];
         if(player != null)
         {
            player.copyFrom(event.fromUser);
            this.displayUsers();
         }
      }
  constructor(param1: any, param2: Function, param3: boolean = false, _popupRef: InMatchPopup = null) {
         var total= undefined;
         var percentageLikes= undefined;
         var percentageDislikes= undefined;
         var _loc_17= undefined;
         super();
         if(_popupRef != null)
         {
            this.popupRef = _popupRef;
         }
         var _loc_7= null;
         var _loc_16= null;
         this.playerListingArray = new Array();
         this.playerListingDict = new Dictionary(true);
         this.matchObj = param1;
         this.callback = param2;
         this.join = param3;
         var _loc_4= param1.roomName;
         var _loc_5= param1.levelID;
         var _loc_6= param1.levelTitle;
         _loc_7 = param1.levelType;
         var _loc_8= param1.creatorID;
         var _loc_9= param1.creatorName;
         var _loc_12= param1.minRank;
         var _loc_13= param1.maxRank;
         var _loc_14= param1.maxMembers;
         this.matchName = _loc_4;
         if(_loc_7 == "race")
         {
            _loc_16 = "Race";
         }
         else if(_loc_7 == "deathmatch")
         {
            _loc_16 = "Deathmatch";
         }
         else if(_loc_7 == "teamDeathmatch")
         {
            _loc_16 = "Team Deathmatch";
         }
         else if(_loc_7 == "coinFiend")
         {
            _loc_16 = "Coin Fiend";
         }
         else if(_loc_7 == "hatAttack")
         {
            _loc_16 = "Hat Attack";
         }
         else if(_loc_7 == "kingOfTheHat")
         {
            _loc_16 = "King of the Hat";
         }
         else if(_loc_7 == "damageDash")
         {
            _loc_16 = "Damage Dash";
         }
         this.m = new MultiplayerLevelListingButton();
         this.startingBGHeight = this.m.bgHolder.bg.listingBG.height;
         if(param1.creatorNameColor != null)
         {
            this.m.titleBox.htmlText = Data.cleanHTML(_loc_6) + " <font color=\'#1D5497\' size=\'10\'>by </font><font color=\'#" + param1.creatorNameColor.toString(16) + "\' size=\'12\'>" + _loc_9 + "</font>";
         }
         else
         {
            this.m.titleBox.htmlText = Data.cleanHTML(_loc_6) + " <font color=\'#1D5497\' size=\'10\'>by </font><font color=\'#000000\' size=\'12\'>" + _loc_9 + "</font>";
         }
         if(param1.likes != null && param1.dislikes != null)
         {
            this.m.thumbs.likesTextBox.text = param1.likes;
            if(param1.likes > 0 || param1.dislikes > 0)
            {
               total = param1.likes + param1.dislikes;
               percentageLikes = param1.likes / total * 49.75;
               percentageDislikes = param1.dislikes / total * 49.75;
            }
         }
         this.m.init("",$b(this, 'clickHandler'));
         this.addChild(this.m);
         this.room = new BlossomRoom(SocketManager.socket,_loc_4,"","match_listing",param3,param3);
         this.room.addEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'),false,0,true);
         this.room.addEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'),false,0,true);
         this.room.addEventListener("startGame",$b(this, 'startGameHandler'),false,0,true);
         this.room.addEventListener("updateUserRoomVars",$b(this, 'updateUserRoomVarsHandler'),false,0,true);
         this.alpha = 0;
         this.fadeToAlpha(1,10);
         if(param3)
         {
            this.m.mouseEnabled = false;
         }
         else
         {
            _loc_17 = false;
            this.m.titleBox.mouseEnabled = _loc_17;
         }
         this.m.bgHolder.bg.gotoAndStop(_loc_7);
         this.m.bgHolder.bg.levelOfTheDayDisplay.visible = false;
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.MatchListing', MatchListing);
