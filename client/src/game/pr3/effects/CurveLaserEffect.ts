// Ported from com/jiggmin/pr3/effects/CurveLaserEffect.as
import { Event } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { RocketEffect } from './RocketEffect.ts';
import { ActivePlayer, Block, CurveLaserEffectGraphic, GamePage, PM_PRNG } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class CurveLaserEffect extends RocketEffect {
  declare randGenerator: PM_PRNG;
  rotateMultiplier: number = NaN;
  rotateBaseline: number = NaN;
  explodeOnHit: boolean = false;
  removing: boolean = false;
  go(event: Event): void {
         if(!this.removing)
         {
            super.go(event);
            this.rotation += this.rotateBaseline + this.randGenerator.nextDoubleRange(-7,7) * this.rotateMultiplier;
         }
         else
         {
            this.remove();
         }
      }
  hit(params: any): void {
         if(params.target instanceof Block)
         {
            GamePage.instance.explodeBlock(params.target);
         }
         if(this.explodeOnHit)
         {
            this.removing = true;
         }
      }
  constructor(player: ActivePlayer, param1: number, rotateMultiplier: number = 1, explodeOnHit: boolean = true, adamage: number = 1, aknockback: number = 1, arecovery: number = 2500, speed: number = 14.5, range: number = 100, amaxvel: number = 20.5, aaccel: number = 1, rotateBaseline: number = 0) {
    adamage = int(adamage); arecovery = int(arecovery); range = int(range);
         super(player);
         this.randGenerator = new PM_PRNG(param1);
         this.rotateMultiplier = rotateMultiplier;
         this.rotateBaseline = rotateBaseline;
         this.explodeOnHit = explodeOnHit;
         this.velX = speed * this.scaleX;
         this.maxVel = amaxvel;
         this.accel = aaccel;
         this.damage = int(adamage);
         this.recoverySpeed = int(arecovery);
         this.knockbackMultiplier = aknockback;
         this.life = int(range);
         this.removeChildAt(0);
         this.m = null;
         this.addChild(new CurveLaserEffectGraphic());
      }
}
$reg('com.jiggmin.pr3.effects.CurveLaserEffect', CurveLaserEffect);
