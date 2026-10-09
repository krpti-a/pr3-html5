// Ported from com/jiggmin/basic/Fadable.as
import { Event } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { Removable } from './Removable.ts';
import { $reg } from '../refs.ts';

export class Fadable extends Removable {
  static REACHED_TARGET_ALPHA: string = "reachedTargetAlpha";
  frames: number = 0;
  targetAlpha: number = NaN;
  curAlpha: number = 1;
  reachTargetAlpha(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeAlphaHandler'));
         this.alpha = this.targetAlpha;
         this.dispatchEvent(new Event(Fadable.REACHED_TARGET_ALPHA));
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeAlphaHandler'));
         super.remove();
      }
  fadeToAlpha(param1: number, param2: number): void {
    param2 = int(param2);
         this.targetAlpha = param1;
         this.frames = int(param2);
         this.curAlpha = this.alpha;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeAlphaHandler'));
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'fadeAlphaHandler'),false,0,true);
      }
  fadeAlphaHandler(event: Event): void {
         var _loc_2= this.curAlpha - this.targetAlpha;
         var _loc_3= _loc_2 / this.frames;
         this.curAlpha -= _loc_3;
         this.alpha = this.curAlpha;
         var _loc_4= this;
         var _loc_5= this.frames - 1;
         _loc_4.frames = _loc_5;
         if(this.frames <= 0)
         {
            this.reachTargetAlpha();
         }
         if(this.alpha < 0.01)
         {
            this.visible = false;
         }
         else
         {
            this.visible = true;
         }
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.basic.Fadable', Fadable);
