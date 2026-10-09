// Ported from com/jiggmin/pr3/player/RecordedPlayer.as
import { Event, getTimer } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Player } from './Player.ts';
import { Data, GamePage, MapManager, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RecordedPlayer extends Player {
  pendingX: number = 0;
  i: number = 0;
  posX: number = 0;
  posY: number = 0;
  declare updateArray: any[];
  pendingY: number = 0;
  playbackFreq: number = 250;
  pendingRotation: number = 0;
  curRotation: number = 0;
  lastUpdate: number = NaN;
  enterFrameHandler(event: Event): void {
         var _loc_4= undefined;
         var _loc_7= undefined;
         var _loc_8= undefined;
         _loc_4 = NaN;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_2= getTimer();
         var _loc_3= _loc_2 - this.lastUpdate;
         if(_loc_3 >= this.playbackFreq)
         {
            this.lastUpdate += this.playbackFreq;
            _loc_3 = _loc_2 - this.lastUpdate;
            this.posX = int(this.posX + (this.pendingX));
            this.posY = int(this.posY + (this.pendingY));
            this.curRotation = this.pendingRotation;
            _loc_5 = this.updateArray[this.i];
            if(_loc_5.p != null)
            {
               _loc_6 = _loc_5.p.split("|");
               this.pendingX = int(int(_loc_6[0]));
               this.pendingY = int(int(_loc_6[1]));
            }
            if(_loc_5.s != null)
            {
               this.m.scaleX = Number(_loc_5.s);
            }
            if(_loc_5.t != null)
            {
               this.setState(_loc_5.t);
            }
            if(_loc_5.i != null)
            {
               this.setItem(_loc_5.i);
            }
            if(_loc_5.r != null)
            {
               this.pendingRotation = int(_loc_5.r);
            }
            _loc_7 = this;
            _loc_8 = this.i + 1;
            _loc_7.i = _loc_8;
            if(this.i >= this.updateArray.length)
            {
               this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
               this.x = this.posX + this.pendingX;
               this.y = this.posY + this.pendingY;
            }
         }
         _loc_4 = _loc_3 / this.playbackFreq;
         this.x = this.posX + this.pendingX * _loc_4;
         this.y = this.posY + this.pendingY * _loc_4;
         this.rotation = this.curRotation + (this.pendingRotation - this.curRotation) * _loc_4;
         if(this.followPlayer)
         {
            MapManager.map.blockMap.drawBlocks();
            MapManager.map.setRot(-this.rotation);
            this.centerCamera(0.25);
         }
      }
  centerCamera(param1: number = 1): void {
         var _loc_2= Data.rotatePoint(0,50,-this.rotation);
         var _loc_3= -this.x + Settings.gameWidth / 2 + _loc_2.x;
         var _loc_4= -this.y + Settings.gameHeight / 2 + _loc_2.y;
         var _loc_5= _loc_3 - MapManager.map.posX;
         var _loc_6= _loc_4 - MapManager.map.posY;
         if(Math.abs(_loc_5) > 1)
         {
            MapManager.map.posX += _loc_5 * param1;
         }
         if(Math.abs(_loc_6) > 1)
         {
            MapManager.map.posY += _loc_6 * param1;
         }
      }
  setRecordedRunStr(param1: string): void {
         var _loc_2= Data.decompressString(param1);
         var _loc_3= JSON.parse(_loc_2);
         this.setRecordedRun(_loc_3);
      }
  setRecordedRun(param1: any): void {
         this.playbackFreq = int(param1.playbackFreq);
         this.updateArray = param1.updateArray;
         if(param1.hat != null)
         {
            this.setAppearance(param1.hat,param1.head,param1.body,param1.feet,param1.hatColor,param1.headColor,param1.bodyColor,param1.feetColor);
         }
         if(param1.userName != null)
         {
            this.setName(param1.userName);
            this.nameBox.alpha = 1;
         }
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.lastUpdate = getTimer() - this.playbackFreq;
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.updateArray = null;
         super.remove();
      }
  constructor() {
         super();
         this.updateArray = new Array();
         this.alpha = 0.25;
         GamePage.instance.minimap.addPlayerDot(this);
         if(this.followPlayer)
         {
            this.centerCamera();
         }
      }
}
$reg('com.jiggmin.pr3.player.RecordedPlayer', RecordedPlayer);
