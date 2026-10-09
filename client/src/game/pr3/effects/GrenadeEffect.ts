// Ported from com/jiggmin/pr3/effects/GrenadeEffect.as
import { Event, Point } from '../../../flash/index.ts';
import { int, $each } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, Block, BlockSettings, EffectMapLayer, ExplosionEffectGraphic, ExplosionSound, GamePage, GrenadeEffectGraphic, LocalPlayer, MapManager, MatchPage, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GrenadeEffect extends ProjectileEffect {
  removing: boolean = false;
  removingCounter: number = 18;
  declare m: any;
  throwForce: number = 10;
  direction: number = 0;
  xFriction: number = 2;
  yFriction: number = 2;
  xTolerance: number = 1;
  yTolerance: number = 1;
  yZero: boolean = false;
  throwForceX: number = 1;
  throwForceY: number = 1;
  blastRadius: number = 1;
  hurtArea: number = 120;
  blastDamage: number = 1;
  blastRecovery: number = 2500;
  blastDelay: number = 95;
  remove(): void {
         if(this.m != null)
         {
            this.removeChild(this.m);
            this.m = null;
            super.remove();
         }
      }
  hit(params: any): void {
         if(!this.testCombustion())
         {
            this.bounce();
         }
      }
  testCombustion(): boolean {
         if(this.life < 5)
         {
            this.combust();
            return true;
         }
         return false;
      }
  combust(): void {
         var player= undefined;
         var explosion: ExplosionEffectGraphic= null;
         var scaleAmount: number= NaN;
         var scaleAmount2: number= NaN;
         var deltaX: number = int(0);
         var deltaY: number = int(0);
         var blockAt: Block= null;
         var grenadePos: Point= null;
         var playerPos: Point= null;
         var range: number = int(int(this.blastRadius));
         if(range >= 0)
         {
            for(deltaX = int(-range); deltaX <= range; deltaX++)
            {
               for(deltaY = int(-range); deltaY <= range; deltaY++)
               {
                  blockAt = MapManager.map.blockMap.getBlockAtPos(this.x + deltaX * 39,this.y + deltaY * 39);
                  if(blockAt != null && blockAt.active)
                  {
                     if(this.fromPlayer instanceof LocalPlayer && blockAt.realVars.type != BlockSettings.IMPERVIOUS)
                     {
                        GamePage.instance.localShatterBlock(blockAt);
                     }
                  }
               }
            }
         }
         for (player of $each(GamePage.instance.playerArray))
         {
            grenadePos = new Point(this.x,this.y);
            playerPos = new Point(player.x,player.y);
            if(player != null && player instanceof LocalPlayer && Math.abs(Point.distance(playerPos,grenadePos)) <= this.hurtArea)
            {
               if(this.blastRecovery != 2500)
               {
                  player.hitBySnowball = true;
                  player.tempRecoverySpeed = this.blastRecovery;
               }
               (player).hit(0,0,this.blastDamage,this.fromPlayer);
            }
         }
         explosion = new ExplosionEffectGraphic();
         scaleAmount = this.blastRadius / 1;
         scaleAmount2 = this.hurtArea / 120;
         if(scaleAmount < scaleAmount2)
         {
            scaleAmount = scaleAmount2;
         }
         explosion.scaleX = 2 * this.blastRadius;
         explosion.scaleY = 2 * this.blastRadius;
         explosion.x = this.x;
         explosion.y = this.y;
         EffectMapLayer.addEffect(explosion);
         Sounds.startGameSound(new ExplosionSound(),explosion,2);
      }
  go(event: Event): void {
         var dRotation= undefined;
         super.go(event);
         if(this.testCombustion())
         {
            this.remove();
         }
         if(!this.yZero)
         {
            if(this.throwForce <= 5)
            {
               this.velY += 1.6;
            }
            else
            {
               this.velY += 0.4;
            }
         }
         if(this.m != null)
         {
            dRotation = this.direction * this.velX;
            if(dRotation > 45)
            {
               dRotation = 45;
            }
            this.m.rotation += dRotation;
         }
      }
  onMoveStep(x: number, y: number): boolean {
         if(!this.removing)
         {
            this.testPointMoving(x,y);
            return false;
         }
         return true;
      }
  initTest(): void {
         this.testPoint(this.x,this.y);
      }
  bounce(): void {
         if(!this.beingBoostedX)
         {
            this.velX /= this.xFriction;
         }
         if(!this.beingBoostedY)
         {
            this.velY /= this.yFriction;
         }
         if(this.rotation % 180 == 0 && (this.lastHitSide == "top" || this.lastHitSide == "bottom") || this.rotation % 180 != 0 && (this.lastHitSide == "left" || this.lastHitSide == "right"))
         {
            this.velY = 0 - this.velY;
         }
         else if(this.rotation % 180 == 0 && (this.lastHitSide == "left" || this.lastHitSide == "right") || this.rotation % 180 != 0 && (this.lastHitSide == "top" || this.lastHitSide == "bottom"))
         {
            this.velX = 0 - this.velX;
         }
      }
  checkPointForPlayers(param1: number, param2: number): void {
         if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
         {
            super.checkPointForPlayers(param1,param2);
         }
      }
  fromPacket(packet: any): void {
         super.fromPacket(packet);
         this.throwForce = int(packet.throwForce);
      }
  constructor(fromPlayer: ActivePlayer, blastDelay: number = 0, throwForceX: number = 1, throwForceY: number = 1, blastRadius: number = 1, hurtArea: number = 120, damage: number = 1, knockback: number = 1, recovery: number = 2500, blastDamage: number = 1, blastRecovery: number = 2500, noKB: boolean = false) {
         super(fromPlayer);
    blastDelay = int(blastDelay); blastRadius = int(blastRadius); hurtArea = int(hurtArea); damage = int(damage); recovery = int(recovery); blastDamage = int(blastDamage); blastRecovery = int(blastRecovery);
         this.throwForceX = throwForceX;
         this.throwForceY = throwForceY;
         this.blastRadius = int(blastRadius);
         this.hurtArea = int(hurtArea);
         this.blastDamage = int(blastDamage);
         this.blastRecovery = int(blastRecovery);
         this.m = new GrenadeEffectGraphic();
         this.direction = int(fromPlayer.lastDirection == "right" ? 1 : -1);
         this.m.scaleX *= 0.4;
         this.m.scaleY *= 0.4;

         this.noKnockback = noKB;
         this.damage = int(damage);
         this.knockbackMultiplier = knockback;
         this.recoverySpeed = int(recovery);
         this.life = int(blastDelay + 5);
         this.collideWithBlocks = false;
         this.checkTouches = true;
         this.interactWithPlayers = false;
         this.velX = fromPlayer.velX + this.throwForce * this.throwForceX * 0.5 * this.scaleX;
         this.velY = -(fromPlayer.velY + this.throwForce * this.throwForceY * 0.5);
         this.hitVelX = this.throwForce * 0.2 * this.scaleX;
         this.hitVelY = this.velY * 0.2;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.GrenadeEffect', GrenadeEffect);
