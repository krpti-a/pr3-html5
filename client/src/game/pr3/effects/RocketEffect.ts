// Ported from com/jiggmin/pr3/effects/RocketEffect.as
import { Event } from '../../../flash/index.ts';
import { int, $as } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, Block, GamePage, LocalPlayer, MatchPage, RocketEffectGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RocketEffect extends ProjectileEffect {
  declare m: RocketEffectGraphic;
  accel: number = NaN;
  maxVel: number = NaN;
  phasesLeft: number = 0;
  initTest(): void {
         this.testPoint(this.x,this.y);
      }
  go(event: Event): void {
         super.go(event);
         if(Math.abs(this.velX) < this.maxVel)
         {
            if(this.scaleX < 0)
            {
               this.velX -= this.accel;
            }
            else
            {
               this.velX += this.accel;
            }
         }
         else if(this.velX < 0)
         {
            this.velX = -this.maxVel;
         }
         else
         {
            this.velX = this.maxVel;
         }
      }
  hit(params: any): void {
         var hitBlock: Block= null;
         if(Boolean(params.target instanceof Block) && Boolean(params.target.active) && !params.target.removed)
         {
            hitBlock = $as(params.target, Block);
            this.phasesLeft = int(this.phasesLeft - (hitBlock.vars.phasingNumber));
            if(this.phasesLeft < 0)
            {
               if(this.fromPlayer instanceof LocalPlayer)
               {
                  GamePage.instance.localExplodeBlock(params.target);
               }
               this.remove();
            }
         }
      }
  remove(): void {
         if(this.m != null)
         {
            this.removeChild(this.m);
            this.m = null;
         }
         super.remove();
      }
  checkPointForPlayers(param1: number, param2: number): void {
         if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
         {
            super.checkPointForPlayers(param1,param2);
         }
      }
  constructor(player: ActivePlayer, damage: number = 1, knockback: number = 1, sap: number = 0, recovery: number = 2500, speed: number = 14.5, accel: number = 1, maxVel: number = 20.5, range: number = 100, shotRotation: number = 0, phasing: number = 0, noKB: boolean = false) {
         super(player,damage,knockback,sap,recovery,shotRotation);
    damage = int(damage); sap = int(sap); recovery = int(recovery); range = int(range);
         this.m = new RocketEffectGraphic();

         this.noKnockback = noKB;
         this.velX = speed * this.scaleX;
         this.life = int(range);
         this.hitVelX = 1 * this.scaleX;
         this.hitVelY = -0.5;
         this.maxVel = maxVel;
         this.phasesLeft = int(phasing);
         this.accel = accel;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.RocketEffect', RocketEffect);
