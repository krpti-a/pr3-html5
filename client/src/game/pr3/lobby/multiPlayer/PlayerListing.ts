// Ported from com/jiggmin/pr3/lobby/multiPlayer/PlayerListing.as
import { ContextMenu, ContextMenuItem, Event, Mouse, MouseEvent } from '../../../../flash/index.ts';
import { int, uint, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlossomUser, ContextMenuEvent, Player, PlayerListingGraphic, SinglePlayerPopup, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PlayerListing extends Removable {
  static customContextMenu: ContextMenu = new ContextMenu();
  static spectateMenuItem: ContextMenuItem = new ContextMenuItem("Spectate");
  declare player: Player;
  declare rank: string;
  declare m: PlayerListingGraphic;
  declare userName: string;
  socketID: number = 0;
  campaign: boolean = false;
  ping: number = 0;
  static openCustomContextMenuHandler(e: ContextMenuEvent): void {
         Mouse.show();
      }
  static spectatePlayerItemHandler(e: ContextMenuEvent): void {
         var mouseTarget= e.mouseTarget;
         while(mouseTarget != null && !(mouseTarget instanceof PlayerListing))
         {
            mouseTarget = mouseTarget.parent;
         }
         if(!(mouseTarget instanceof PlayerListing))
         {
            return;
         }
         mouseTarget.parent.level.ghost = mouseTarget.m.button.data;
         var _loc_2= mouseTarget.parent.level;
         if(_loc_2 != null)
         {
            SinglePlayerPopup.instance.startOfflineGamePage(_loc_2.levelID,_loc_2.version,_loc_2.ghost,true);
         }
      }
  remove(): void {
    var spectatePlayer; // undeclared in decompiled source
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         if(this.campaign)
         {
            this.removeEventListener(ContextMenuEvent.MENU_SELECT,PlayerListing.openCustomContextMenuHandler);
            this.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,spectatePlayer);
         }
         this.player.remove();
         this.player = null;
         this.m = null;
         super.remove();
      }
  goSmall(): void {
         this.m.gotoAndStop("small");
         this.player.scale = 0.12;
         this.player.x = 14;
         this.player.y = 29;
         this.m.nameBox.text = this.userName;
         this.m.rankBox.text = this.rank;
         this.m.button.visible = false;
         this.setPing(this.ping);
      }
  enterFrameHandler(event: Event): void {
         this.alpha += 0.1;
         if(this.alpha >= 1)
         {
            this.alpha = 1;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         }
      }
  goBig(): void {
         this.m.gotoAndStop("large");
         this.player.scale = 0.2;
         this.player.x = 12;
         this.player.y = 54;
         this.m.nameBox.text = this.userName;
         this.m.rankBox.text = this.rank;
         this.m.button.visible = true;
         this.setPing(this.ping);
      }
  setPing(ping: number): void {
    ping = int(ping);
         this.m.pingBox.text = ping;
         if(ping <= 50)
         {
            this.m.pingBox.textColor = 26112;
         }
         else if(ping <= 100)
         {
            this.m.pingBox.textColor = 65280;
         }
         else if(ping <= 150)
         {
            this.m.pingBox.textColor = 16776960;
         }
         else if(ping <= 200)
         {
            this.m.pingBox.textColor = 16724787;
         }
         else
         {
            this.m.pingBox.textColor = 13369344;
         }
      }
  setRankColor(color: number): void {
    color = uint(color);
         this.m.rankBox.textColor = color;
      }
  kickMe(event: MouseEvent = null): void {
         SocketManager.socket.kickUserFromMatch(this.socketID);
      }
  banMe(event: MouseEvent = null): void {
         SocketManager.socket.banUserFromMatch(this.socketID);
      }
  setKickVisible(param1: boolean): void {
         this.m.kickBtn.visible = param1;
      }
  setBanVisible(param1: boolean): void {
         this.m.banBtn.visible = param1;
      }
  copyFrom(user: BlossomUser): void {
         this.userName = user.userName;
         this.rank = user.vars.rank.toString();
         this.ping = int(user.vars.ping);
         this.player.setAppearance(user.vars.hat,user.vars.head,user.vars.body,user.vars.feet,user.vars.hatColor,user.vars.headColor,user.vars.bodyColor,user.vars.feetColor);
      }
  getPlayer(): Player {
         return this.player;
      }
  static __init() {
    PlayerListing.customContextMenu.addEventListener(ContextMenuEvent.MENU_SELECT,PlayerListing.openCustomContextMenuHandler);
    PlayerListing.spectateMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,PlayerListing.spectatePlayerItemHandler);
    PlayerListing.customContextMenu.customItems = new Array(PlayerListing.spectateMenuItem);
  }
  constructor(param1: string, param3: string, param4: number, param5: number, param6: number, param7: number, param8: number, param9: number, param10: number, param11: number, param12: number, ping: number, param13: boolean = false) {
    param4 = int(param4); param5 = int(param5); param6 = int(param6); param7 = int(param7); param8 = int(param8); param9 = int(param9); param10 = int(param10); param11 = int(param11); param12 = int(param12); ping = int(ping);
         super();
         this.m = new PlayerListingGraphic();
         this.campaign = param13;
         if(this.campaign)
         {
            this.contextMenu = PlayerListing.customContextMenu;
         }
         this.m.nameBox.mouseEnabled = false;
         this.m.rankBox.mouseEnabled = false;
         this.m.kickBtn.visible = false;
         this.m.banBtn.visible = false;
         this.m.button.mouseEnabled = false;
         this.m.kickBtn.addEventListener(MouseEvent.CLICK,$b(this, 'kickMe'),false,0,true);
         this.m.banBtn.addEventListener(MouseEvent.CLICK,$b(this, 'banMe'),false,0,true);
         this.m.pingBox.visible = !this.campaign;
         this.setPing(this.ping);
         this.userName = param1;
         this.rank = param3;
         this.socketID = int(param12);
         this.player = new Player();
         this.player.setAppearance(param4,param5,param6,param7,param8,param9,param10,param11);
         this.goBig();
         this.player.mouseChildren = false;
         this.player.mouseEnabled = false;
         this.ping = int(ping);
         this.addChild(this.m);
         this.addChild(this.player);
         this.alpha = 0;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.PlayerListing', PlayerListing);
