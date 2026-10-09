// Ported from com/jiggmin/pr3/game/RunRecorder.as
import { Event, Sprite, getTimer } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { ActivePlayer, Data, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RunRecorder extends Sprite {
  lastX: number = 0;
  lastY: number = 0;
  declare lastItem: string;
  lastScaleX: number = 1;
  declare updateArray: any[];
  declare target: ActivePlayer;
  declare lastState: string;
  saveFreq: number = 250;
  lastRotation: number = 0;
  lastUpdate: number = 0;
  stopRecording(): void {
         this.lastUpdate = 0;
         this.enterFrameHandler(new Event(Event.ENTER_FRAME));
         this.lastUpdate = 0;
         this.enterFrameHandler(new Event(Event.ENTER_FRAME));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.target = null;
         this.updateArray = null;
      }
  enterFrameHandler(event: Event): void {
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_2= getTimer();
         var _loc_3= _loc_2 - this.lastUpdate;
         if(_loc_3 >= this.saveFreq)
         {
            this.lastUpdate += this.saveFreq;
            _loc_4 = ({} as any);
            _loc_5 = Math.round(this.target.x - this.lastX);
            _loc_6 = Math.round(this.target.y - this.lastY);
            this.lastX = int(this.lastX + (_loc_5));
            this.lastY = int(this.lastY + (_loc_6));
            _loc_7 = _loc_5.toString() + "|" + _loc_6.toString();
            _loc_4.p = _loc_7;
            _loc_8 = this.target.getM();
            if(_loc_8.scaleX != this.lastScaleX)
            {
               this.lastScaleX = _loc_8.scaleX;
               _loc_4.s = _loc_8.scaleX;
            }
            if(this.target.getState() != this.lastState)
            {
               this.lastState = this.target.getState();
               _loc_4.t = this.target.getState();
            }
            if(this.target.itemAbbr != this.lastItem)
            {
               this.lastItem = this.target.itemAbbr;
               _loc_4.i = this.target.itemAbbr;
            }
            if(this.target.rotation != this.lastRotation)
            {
               this.lastRotation = this.target.rotation;
               _loc_4.r = this.lastRotation;
            }
            this.updateArray.push(_loc_4);
         }
      }
  getRunStr(): string {
         var _loc_1= this.getRunObj();
         var _loc_2= JSON.stringify(_loc_1);
         return Data.compressString(_loc_2);
      }
  getRunObj(): any {
         var _loc_1= SocketManager.socket.me.vars;
         var _loc_2= ({} as any);
         _loc_2.playbackFreq = this.saveFreq;
         _loc_2.updateArray = this.updateArray;
         _loc_2.hat = _loc_1.hat;
         _loc_2.head = _loc_1.head;
         _loc_2.body = _loc_1.body;
         _loc_2.feet = _loc_1.feet;
         _loc_2.hatColor = _loc_1.hatColor;
         _loc_2.headColor = _loc_1.headColor;
         _loc_2.bodyColor = _loc_1.bodyColor;
         _loc_2.feetColor = _loc_1.feetColor;
         _loc_2.userName = SocketManager.socket.me.userName;
         return _loc_2;
      }
  constructor(param1: ActivePlayer) {
         super();
         this.updateArray = new Array();
         this.target = param1;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.lastUpdate = getTimer();
      }
}
$reg('com.jiggmin.pr3.game.RunRecorder', RunRecorder);
