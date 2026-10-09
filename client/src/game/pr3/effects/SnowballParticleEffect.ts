// Ported from com/jiggmin/pr3/effects/SnowballParticleEffect.as
import { RealEffect } from './RealEffect.ts';
import { SnowballParticleEffectGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SnowballParticleEffect extends RealEffect {
  life: number = 50;
  rotVel: number = 0;
  declare m: any;
  remove(): void {
         if(this.m != null)
         {
            this.m.stop();
            this.removeChild(this.m);
            this.m = null;
         }
         super.remove();
      }
  touchGround(): void {
         this.rotVel = this.velX * 5;
         super.touchGround();
      }
  step(): void {
         var _loc_4= undefined;
         var _loc_1= null;
         var _loc_2= null;
         super.step();
         var _loc_3= this;
         _loc_4 = this.life - 1;
         this.velX /= 1.1;
         this.velY += 0.5;
         _loc_3.life = _loc_4;
         if(this.life < 100)
         {
            this.alpha = this.life / 100;
         }
         if(this.life <= 0)
         {
            this.remove();
         }
      }
  constructor() {
         super();
         this.m = new SnowballParticleEffectGraphic();
         this.addChild(this.m);
         this.bounceY = 0.5;
         this.scaleX = Math.random() * 1.5;
         this.scaleY = this.scaleX;
      }
}
$reg('com.jiggmin.pr3.effects.SnowballParticleEffect', SnowballParticleEffect);
