// Ported from com/jiggmin/pr3/effects/ParticleEffect.as
import { DisplayObject, Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { $reg } from '../../refs.ts';

export class ParticleEffect extends Effect {
  velRot: number = NaN;
  fade: number = NaN;
  velY: number = NaN;
  gravity: number = NaN;
  friction: number = NaN;
  velX: number = NaN;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         super.remove();
      }
  go(event: Event): void {
         this.velX *= this.friction;
         this.velY *= this.friction;
         this.velRot *= this.friction;
         this.velY += this.gravity;
         this.x += this.velX;
         this.y += this.velY;
         this.rotation += this.velRot;
         this.alpha -= this.fade;
         if(this.alpha <= 0)
         {
            this.remove();
         }
      }
  constructor(param1: DisplayObject, param2: number = 1, param3: number = 0.95, param4: number = 0.01, param5: number = 10, param6: number = 10, param7: number = 15, param8: number = 0, param9: number = 0) {
         super();
         this.addChild(param1);
         this.gravity = param2;
         this.friction = param3;
         this.fade = param4;
         this.velX = Math.random() * (param5 * 2) - param5;
         this.velY = Math.random() * (param6 * 2) - param6;
         this.velRot = Math.random() * (param7 * 2) - param7;
         this.velX += param8;
         this.velY += param9;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'go'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.effects.ParticleEffect', ParticleEffect);
