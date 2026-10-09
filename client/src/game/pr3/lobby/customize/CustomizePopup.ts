// Ported from com/jiggmin/pr3/lobby/customize/CustomizePopup.as
import { MouseEvent } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { LobbyPopup } from '../LobbyPopup.ts';
import { BlossomEvent, CustomizeMenuGraphic, ExpBar, PartDescriptions, PartSelector, Player, SecureSharedObject, SocketManager, StatSliders } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class CustomizePopup extends LobbyPopup {
  static leveledUp: boolean = false;
  declare m: any;
  declare player: Player;
  declare statSliders: StatSliders;
  declare expBar: ExpBar;
  declare hatSelector: PartSelector;
  declare headSelector: PartSelector;
  declare bodySelector: PartSelector;
  declare feetSelector: PartSelector;
  mouseOutHandler(event: MouseEvent): void {
         this.updateServer();
      }
  remove(): void {
         var _loc_2= undefined;
         this.bg.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'));
         this.updateServer();
         var _loc_1= SocketManager.socket;
         if(_loc_1 != null)
         {
            _loc_1.removeEventListener(BlossomEvent.RECEIVE_USER_VARS,$b(this, 'receiveUserVarsHandler'));
         }
         if(this.hatSelector != null)
         {
            this.hatSelector.remove();
            this.headSelector.remove();
            this.bodySelector.remove();
            this.feetSelector.remove();
            _loc_2 = null;
            this.feetSelector = null;
            this.bodySelector = _loc_2;
            this.headSelector = _loc_2;
            this.hatSelector = _loc_2;
            this.player.remove();
            this.player = null;
            this.statSliders.remove();
            this.statSliders = null;
            this.expBar.remove();
            this.expBar = null;
         }
         this.m = null;
         super.remove();
      }
  updateServer(): void {
         if(this.statSliders == null)
         {
            return;
         }
         var stats: any= this.statSliders.getStats();
         var hatID: number = int(this.hatSelector.getValue());
         var headID: number = int(this.headSelector.getValue());
         var bodyID: number = int(this.bodySelector.getValue());
         var feetID: number = int(this.feetSelector.getValue());
         var hatColor: number = int(this.hatSelector.getColor());
         var headColor: number = int(this.headSelector.getColor());
         var bodyColor: number = int(this.bodySelector.getColor());
         var feetColor: number = int(this.feetSelector.getColor());
         var speedStat: number = int(int(stats.speed));
         var accelStat: number = int(int(stats.accel));
         var jumpStat: number = int(int(stats.jump));
         var expStat: number = int(int(stats.expBonus));
         var socket= SocketManager.socket;
         var savedData= null;
         if(socket != null && socket.me != null && socket.me.vars != null)
         {
            savedData = socket.me.vars;
            if(savedData.hat != hatID || savedData.head != headID || savedData.body != bodyID || savedData.feet != feetID || savedData.hatColor != hatColor || savedData.headColor != headColor || savedData.bodyColor != bodyColor || savedData.feetColor != feetColor || savedData.speed != speedStat || savedData.accel != accelStat || savedData.jump != jumpStat || savedData.expBonus != expStat)
            {
               socket.saveAccountSettings(hatID,headID,bodyID,feetID,hatColor,headColor,bodyColor,feetColor,speedStat,accelStat,jumpStat,expStat);
            }
         }
      }
  init(): void {
         var _loc_2= null;
         var _loc_3= null;
         super.init();
         this.addGraphic(this.m);
         if(SocketManager.socket != null)
         {
            _loc_2 = SocketManager.socket;
            _loc_3 = _loc_2.me.vars;
            _loc_2.getUserVars(["rank","hatArray","headArray","bodyArray","feetArray","exp"],_loc_2.socketID);
            _loc_2.addEventListener(BlossomEvent.RECEIVE_USER_VARS,$b(this, 'receiveUserVarsHandler'),false,0,true);
         }
         this.bg.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'),false,0,true);
         if(CustomizePopup.leveledUp)
         {
            CustomizePopup.leveledUp = false;
            this.m.levelUpAnim.gotoAndPlay("anim");
         }
      }
  receiveUserVarsHandler(event: BlossomEvent): void {
         var _loc_2= null;
         var _loc_3= null;
         if(event.socketID == SocketManager.socket.socketID)
         {
            SocketManager.socket.removeEventListener(BlossomEvent.RECEIVE_USER_VARS,$b(this, 'receiveUserVarsHandler'));
            _loc_2 = SocketManager.socket;
            _loc_3 = _loc_2.me.vars;
            this.setUserVars(_loc_3);
         }
      }
  setUserVars(param1: any): void {
         if(SocketManager.socket.me != null)
         {
            param1 = SocketManager.socket.me.vars;
            this.m.nameBox.text = SocketManager.socket.me.userName;
         }
         else
         {
            param1 = SecureSharedObject.getLocal("pr3");
            this.m.nameBox.text = param1.userName;
         }
         this.m.rankBox.text = "Rank: " + param1.rank;
         this.m.hatsBox.text = "Hats: " + Math.min(18,Math.max(0,param1.hatArray.length - 1)).toString();
         this.player = new Player();
         this.player.scale = 1;
         this.player.x = 444;
         this.player.y = 244;
         this.player.setAppearance(param1.hat,param1.head,param1.body,param1.feet,param1.hatColor,param1.headColor,param1.bodyColor,param1.feetColor);
         this.m.addChild(this.player);
         this.statSliders = new StatSliders(param1.rank,param1.speed,param1.accel,param1.jump,param1.expBonus);
         this.statSliders.x = 20;
         this.statSliders.y = 104;
         this.addGraphic(this.statSliders);
         this.expBar = new ExpBar(param1.exp,param1.rank,this.statSliders.width);
         this.expBar.x = 20;
         this.expBar.y = this.statSliders.y + this.statSliders.height + 25;
         this.addGraphic(this.expBar);
         var appearanceSelectorsX: number = int(331);
         this.hatSelector = new PartSelector(this.player,"hat1",param1.hat,param1.hatColor,param1.hatArray,PartDescriptions.hatTitleArray,PartDescriptions.hatDescriptionArray,this.m.bonusBox);
         this.headSelector = new PartSelector(this.player,"head",param1.head,param1.headColor,param1.headArray,PartDescriptions.headTitleArray);
         this.bodySelector = new PartSelector(this.player,"body",param1.body,param1.bodyColor,param1.bodyArray,PartDescriptions.bodyTitleArray);
         this.feetSelector = new PartSelector(this.player,"feet",param1.feet,param1.feetColor,param1.feetArray,PartDescriptions.feetTitleArray);
         this.feetSelector.x = appearanceSelectorsX;
         this.bodySelector.x = appearanceSelectorsX;
         this.headSelector.x = appearanceSelectorsX;
         this.hatSelector.x = appearanceSelectorsX;
         this.hatSelector.y = 41;
         this.headSelector.y = this.hatSelector.y + 60;
         this.bodySelector.y = this.hatSelector.y + 120;
         this.feetSelector.y = this.hatSelector.y + 180;
         this.addGraphic(this.hatSelector);
         this.addGraphic(this.headSelector);
         this.addGraphic(this.bodySelector);
         this.addGraphic(this.feetSelector);
      }
  constructor() {
         super();
         this.m = new CustomizeMenuGraphic();
      }
}
$reg('com.jiggmin.pr3.lobby.customize.CustomizePopup', CustomizePopup);
