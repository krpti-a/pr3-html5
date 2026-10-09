// Ported from com/jiggmin/pr3/effects/SlashEffect.as
import { int } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, Data, SlashEffectGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SlashEffect extends ProjectileEffect {
  hitSpace: number = 39;
  declare m: SlashEffectGraphic;
  init(): void {
         this.testPoints();
      }
  remove(): void {
         if(this.m != null)
         {
            this.m.stop();
            if(this.m.parent != null)
            {
               this.m.parent.removeChild(this.m);
            }
            this.m = null;
         }
         super.remove();
      }
  testPoints(): void {
         var _loc_1= Data.rotatePoint(0,14,-this.rotation);
         var _loc_2= Data.rotatePoint(0,-14,-this.rotation);
         var _loc_3= Data.rotatePoint(this.hitSpace,14,-this.rotation);
         var _loc_4= Data.rotatePoint(this.hitSpace,-14,-this.rotation);
         var _loc_5= Data.rotatePoint(this.hitSpace * 2,14,-this.rotation);
         var _loc_6= Data.rotatePoint(this.hitSpace * 2,-14,-this.rotation);
         this.testPoint(this.x + _loc_1.x,this.y + _loc_1.y);
         this.testPoint(this.x + _loc_2.x,this.y + _loc_2.y);
         this.testPoint(this.x + _loc_3.x,this.y + _loc_3.y);
         this.testPoint(this.x + _loc_4.x,this.y + _loc_4.y);
         this.testPoint(this.x + _loc_5.x,this.y + _loc_5.y);
         this.testPoint(this.x + _loc_6.x,this.y + _loc_6.y);
      }
  hit(params: any): void {
      }
  constructor(param1: ActivePlayer, param2: any, param3: any, param4: any, param5: any, noKB: boolean = false) {
         super(param1,param2,param3,param4,param5);
         this.m = new SlashEffectGraphic();

         this.noKnockback = noKB;
         this.velX = 5 * this.scaleX;
         this.hitSpace = int(this.hitSpace * (this.scaleX));
         this.life = int(5);
         this.hitVelX = 0.75 * this.scaleX;
         this.hitVelY = -0.33;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.SlashEffect', SlashEffect);
