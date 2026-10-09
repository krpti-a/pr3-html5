// Ported from com/jiggmin/pr3/effects/LaserEffect.as
import { Event } from '../../../flash/index.ts';
import { int, $as } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, Block, BlockSideSettings, GamePage, LaserEffectGraphic, LaserHitSound, MatchPage, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LaserEffect extends ProjectileEffect {
  removing: boolean = false;
  removingCounter: number = 18;
  declare m: LaserEffectGraphic;
  phasesLeft: number = 0;
  pointBlank: boolean = true;
  transferHit: boolean = false;
  transferFade: boolean = false;
  remove(): void {
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  hit(params: any): void {
    var blockSideSetting; // undeclared in decompiled source
         var hitBlock: Block= null;
         var hitSide= undefined;
         if(!this.pointBlank && Boolean(this.transferHit))
         {
            this.fromPlayer.setRealX(this.x);
            this.fromPlayer.setRealY(this.y);
            this.fromPlayer.showTeleportEffect();
         }
         if(this.m != null)
         {
            if(params.target instanceof Block)
            {
               hitBlock = $as(params.target, Block);
               hitSide = params.side;
               if(hitSide != null)
               {
                  blockSideSetting = hitBlock.vars[hitSide].type;
                  if(blockSideSetting == BlockSideSettings.REFLECT)
                  {
                     this.bounced = true;
                     this.rotation += hitBlock.reflectAngle;
                     this.x = hitBlock.posX + Block.halfHeight;
                     this.y = hitBlock.posY + Block.halfWidth;
                     return;
                  }
               }
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
            this.m.gotoAndPlay("hit");
            this.removing = true;
            Sounds.startGameSound(new LaserHitSound(),this,1.5);
         }
      }
  go(event: Event): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         this.pointBlank = false;
         if(!this.removing)
         {
            if(this.life <= 1 && Boolean(this.transferFade))
            {
               this.fromPlayer.setRealX(this.x);
               this.fromPlayer.setRealY(this.y);
               this.fromPlayer.showTeleportEffect();
            }
            super.go(event);
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
         Sounds.startGameSound(new LaserHitSound(),this,1);
      }
  constructor(player: ActivePlayer, damage: number = 1, knockback: number = 1, sap: number = 0, recovery: number = 2500, speed: number = 29, range: number = 100, shotRotation: number = 0, phasing: number = 0, ignorePlayerDirection: boolean = false, transferHit: boolean = false, transferFade: boolean = false, noKB: boolean = false) {
         super(player,damage,knockback,sap,recovery,shotRotation,ignorePlayerDirection);
    damage = int(damage); sap = int(sap); phasing = int(phasing);
         this.m = new LaserEffectGraphic();

         this.noKnockback = noKB;
         this.phasesLeft = int(phasing);
         this.velX = speed * this.scaleX;
         this.life = int(range);
         this.transferHit = transferHit;
         this.transferFade = transferFade;
         this.hitVelX = 0.5 * this.scaleX;
         this.hitVelY = -0.1;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.LaserEffect', LaserEffect);
