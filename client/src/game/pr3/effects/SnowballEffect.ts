// Ported from com/jiggmin/pr3/effects/SnowballEffect.as
import { Event } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, GamePage, MatchPage, PM_PRNG, SnowballEffectGraphic, SnowballHitSound, SnowballParticleEffect, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SnowballEffect extends ProjectileEffect {
  removing: boolean = false;
  removingCounter: number = 18;
  declare m: any;
  remove(): void {
    var _loc_2, _loc_3, _loc_4, _loc_5; // undeclared in decompiled source
         _loc_2 = new PM_PRNG(Math.abs(this.x + this.y));
         _loc_3 = _loc_2.nextDoubleRange(-5,5);
         _loc_4 = 0;
         while(_loc_4 < 8)
         {
            _loc_5 = new SnowballParticleEffect();
            _loc_5.x = this.x + 15;
            _loc_5.y = this.y + 15;
            _loc_5.velX = _loc_2.nextDoubleRange(this.velX * -1.5,this.velX * -0.5);
            _loc_5.velY = _loc_2.nextDoubleRange(-20,-5);
            ++_loc_4;
         }
         if(this.m != null)
         {
            this.removeChild(this.m);
            this.m = null;
         }
         super.remove();
      }
  hit(params: any): void {
         Sounds.startGameSound(new SnowballHitSound(),this,1.5);
         this.remove();
      }
  go(event: Event): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         if(!this.removing)
         {
            super.go(event);
            this.velY += 0.05;
         }
         else
         {
            _loc_2 = this;
            _loc_3 = this.removingCounter - 1;
            _loc_2.removingCounter = _loc_3;
            if(this.removingCounter <= 0)
            {
               this.remove();
            }
         }
      }
  onMoveStep(x: number, y: number): boolean {
         this.testPointMoving(x,y);
         return !this.removing;
      }
  checkPointForPlayers(param1: number, param2: number): void {
         if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
         {
            super.checkPointForPlayers(param1,param2);
         }
      }
  initTest(): void {
         this.testPoint(this.x,this.y);
      }
  bounce(): void {
         super.bounce();
         this.scaleX = -this.scaleX;
         Sounds.startGameSound(new SnowballHitSound(),this,1);
      }
  constructor(param1: ActivePlayer, param2: any, param3: any, param4: any, param5: any, param6: any, param7: any) {
         super(param1,0,param3,param4,param5);
         this.m = new SnowballEffectGraphic();

         this.velX = param6 * this.scaleX;
         this.velY = 0;
         this.life = int(param7);
         this.hitVelX = 0.5 * this.scaleX;
         this.hitVelY = -0.1;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.SnowballEffect', SnowballEffect);
