// Ported from com/jiggmin/pr3/effects/SnowEffect.as
import { Event } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { LocalPlayer, SnowEffectGraphic, WindEffect } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SnowEffect extends Effect {
  declare player: LocalPlayer;
  minX: number = -20;
  minY: number = -20;
  maxX: number = 700;
  maxY: number = 520;
  remove(): void {
         this.player = null;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  randX(): void {
         if(this.player != null)
         {
            this.x = Math.random() * 675 - 350 + this.player.x;
         }
         else
         {
            this.x = Math.random() * (this.maxX - this.minX) + this.minX;
         }
      }
  randY(): void {
         if(this.player != null)
         {
            this.y = Math.random() * 480 - 240 + this.player.y;
         }
         else
         {
            this.y = Math.random() * (this.maxY - this.minY) + this.minY;
         }
      }
  enterFrameHandler(event: Event): void {
         var _loc_3= NaN;
         this.rotation += 5;
         var _loc_2= WindEffect.vel * 3;
         _loc_3 = 5;
         this.x += _loc_2 * this.scaleX;
         this.y += _loc_3 * this.scaleY;
         if(this.player != null)
         {
            this.minX = int(this.player.x - 400);
            this.maxX = int(this.player.x + 400);
            this.minY = int(this.player.y - 400);
            this.maxY = int(this.player.y + 400);
         }
         if(this.y > this.maxY)
         {
            this.y = this.minY;
            this.randX();
         }
         else if(this.y < this.minY)
         {
            this.y = this.maxY;
            this.randX();
         }
         if(this.x > this.maxX)
         {
            this.x = this.minX;
            this.randY();
         }
         else if(this.x < this.minX)
         {
            this.x = this.maxX;
            this.randY();
         }
      }
  constructor(param1: LocalPlayer, param2: boolean = false) {
         var _loc_4= undefined;
         super();
         var _loc_3= null;
         this.player = param1;
         if(param1 != null || param2)
         {
            _loc_3 = new SnowEffectGraphic();
            this.addChild(_loc_3);
            _loc_4 = Math.sqrt(Math.random() * 1);
            this.scaleY = Math.sqrt(Math.random() * 1);
            this.scaleX = _loc_4;
            this.alpha = Math.random() * 0.5 + 0.1;
            this.rotation = Math.random() * 360;
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
            this.randX();
            this.randY();
         }
      }
}
$reg('com.jiggmin.pr3.effects.SnowEffect', SnowEffect);
