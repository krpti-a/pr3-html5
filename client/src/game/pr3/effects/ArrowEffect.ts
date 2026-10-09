// Ported from com/jiggmin/pr3/effects/ArrowEffect.as
import { Event } from '../../../flash/index.ts';
import { int, $as } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, ArrowEffectGraphic, Block, GamePage, MatchPage } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ArrowEffect extends ProjectileEffect {
  removing: boolean = false;
  removingCounter: number = 18;
  declare m: any;
  shootForce: number = 0;
  phasesLeft: number = 0;
  remove(): void {
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  hit(params: any): void {
         var hitBlock: Block= null;
         if(params.target instanceof Block)
         {
            hitBlock = $as(params.target, Block);
            this.phasesLeft = int(this.phasesLeft - (hitBlock.vars.phasingNumber));
         }
         else
         {
            --this.phasesLeft;
         }
         if(this.phasesLeft >= 0)
         {
            return;
         }
         this.removing = true;
      }
  go(event: Event): void {
         var vx: number= NaN;
         var vy: number= NaN;
         var Radians: number= NaN;
         var Degrees: number= NaN;
         var _loc_2: ArrowEffect= null;
         var _loc_3: number = int(0);
         if(!this.removing)
         {
            super.go(event);
            if(this.shootForce <= 5)
            {
               this.velY += 0.8;
               this.hitVelY = this.velY * 0.2;
            }
            else
            {
               this.velY += 0.2;
               this.hitVelY = this.velY * 0.2;
            }
            if(this.m != null)
            {
               vx = this.velX * this.scaleX - this.m.x;
               vy = this.velY - this.m.y;
               Radians = Math.atan2(vy,vx);
               Degrees = Radians * 180 / Math.PI;
               this.m.rotation = Degrees;
            }
         }
         else
         {
            _loc_2 = this;
            _loc_3 = int(this.removingCounter - 1);
            _loc_2.removingCounter = int(_loc_3);
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
  initTest(): void {
         this.testPoint(this.x,this.y);
      }
  bounce(): void {
      }
  checkPointForPlayers(param1: number, param2: number): void {
         if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
         {
            super.checkPointForPlayers(param1,param2);
         }
      }
  fromPacket(packet: any): void {
         super.fromPacket(packet);
         this.shootForce = int(packet.shootForce);
      }
  constructor(param1: ActivePlayer, ShootForce: number, damage: number, knockback: number, sap: number, recovery: number, range: number, phasing: number, shotRotation: number = 0, noKB: boolean = false) {
         super(param1,damage,knockback,sap,recovery,shotRotation);
    ShootForce = int(ShootForce); damage = int(damage); sap = int(sap);
         this.shootForce = int(ShootForce);
         this.phasesLeft = int(phasing);
         this.m = new ArrowEffectGraphic();
         this.m.scaleX *= 0.4;
         this.m.scaleY *= 0.4;

         this.noKnockback = noKB;
         this.velX = this.shootForce * 1.3 * this.scaleX;
         this.velY = this.fromPlayer.velY;
         this.life = int(range);
         this.hitVelX = this.shootForce * 0.2 * this.scaleX;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.ArrowEffect', ArrowEffect);
