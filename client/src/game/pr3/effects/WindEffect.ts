// Ported from com/jiggmin/pr3/effects/WindEffect.as
import { Event, clearInterval, getTimer, setInterval } from '../../../flash/index.ts';
import { uint, $each, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { CloudFaceGraphic, Data, MapManager, Maths, PM_PRNG, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class WindEffect extends Effect {
  static vel: number = 0;
  changeInterval: number = 0;
  lastTime: number = NaN;
  maxAccel: number = 0.1;
  accel: number = 0;
  declare m: any;
  declare randGenerator: PM_PRNG;
  changeFreq: number = 5000;
  maxAccelChange: number = 0.0005;
  declare playerArray: any[];
  targetAccel: number = 0;
  changeVel(): void {
         this.targetAccel = this.randGenerator.nextDoubleRange(-this.maxAccel,this.maxAccel);
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         clearInterval(this.changeInterval);
         this.playerArray = null;
         this.randGenerator = null;
         WindEffect.vel = 0;
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         var _loc_4= undefined;
         var _loc_6= undefined;
         _loc_4 = NaN;
         var _loc_5= null;
         _loc_6 = NaN;
         var _loc_7= NaN;
         var _loc_8= null;
         var _loc_2= this.accel - this.targetAccel;
         _loc_2 = Maths.limit(_loc_2,-this.maxAccelChange,this.maxAccelChange);
         this.accel -= _loc_2;
         var _loc_3= getTimer();
         _loc_4 = _loc_3 - this.lastTime;
         this.lastTime = _loc_3;
         for (_loc_5 of $each(this.playerArray))
         {
            _loc_7 = this.accel * 2 * _loc_4;
            WindEffect.vel = _loc_7;
            _loc_8 = Data.rotatePoint(_loc_7,0,_loc_5.rotation);
            _loc_5.windMoveX = _loc_8.x;
            _loc_5.windMoveY = _loc_8.y;
         }
         this.x = -MapManager.map.posX;
         this.y = -MapManager.map.posY + Settings.gameHeight / 2;
         _loc_6 = 3300;
         if(this.accel > 0)
         {
            this.m.scaleX = -1;
            this.m.x = 0 + this.accel * _loc_6;
         }
         else
         {
            this.m.scaleX = 1;
            this.m.x = Settings.gameWidth + this.accel * _loc_6;
         }
      }
  constructor(param1: any[], param2: number) {
         super();
         this.m = new CloudFaceGraphic();
         this.randGenerator = new PM_PRNG(param2);
         this.playerArray = param1;
         this.lastTime = getTimer();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.enterFrameHandler(new Event(Event.ENTER_FRAME));
         this.changeInterval = uint(setInterval($b(this, 'changeVel'),this.changeFreq));
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.WindEffect', WindEffect);
