// Ported from com/jiggmin/pr3/effects/ProjectileEffect.as
import { DisplayObject, Event, Point, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, BeamEffect, Block, BlockSettings, BlockSideSettings, BumpSound, BuzzsawEffect, Data, GamePage, GrenadeEffect, LaserEffect, LocalPlayer, MapManager, MatchPage, Maths, SlashEffect, SnowballEffect, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ProjectileEffect extends Effect {
  declare fromPlayer: ActivePlayer;
  hitVelX: number = 0;
  hitVelY: number = 0;
  velY: number = 0;
  velX: number = 29;
  life: number = 100;
  bounced: boolean = false;
  declare lastBlockTouched: Block;
  damage: number = 1;
  sap: number = 0;
  chill: any = false;
  recoverySpeed: number = 2500;
  knockbackMultiplier: number = 1;
  dealtDamage: boolean = false;
  collideWithBlocks: boolean = true;
  lastHitSide: string = "none";
  checkTouches: boolean = false;
  interactWithPlayers: boolean = true;
  beingBoostedX: boolean = false;
  beingBoostedY: boolean = false;
  noKnockback: boolean = false;
  ignoreHitBlock: boolean = false;
  useNewCollision: boolean = false;
  rotationAtUse: number = 0;
  directionAtUse: string = "right";
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         this.fromPlayer = null;
         super.remove();
      }
  testPoint(param1: number, param2: number): boolean {
    var realVars; // undeclared in decompiled source
         var blockOne: Block= null;
         var blockTwo: Block= null;
         var vel= undefined;
         var touchedBlock: Block= null;
         var _loc_4= null;
         var _loc_5= null;
         var testedPoint= null;
         var topLeft= null;
         var topRight= null;
         var bottomLeft= null;
         var bottomRight= null;
         var hitSide= null;
         var blockBump= null;
         var blockSideSetting= null;
         var _loc_14= null;
         var collided: boolean= false;
         var collisionPoint: Point= null;
         var collidedInOneAxis: boolean= true;
         if(this.removed == false)
         {
            touchedBlock = MapManager.map.blockMap.getBlockAtPos(param1,param2);
            if(touchedBlock == null && this.useNewCollision)
            {
               blockOne = MapManager.map.blockMap.getBlockAtPos(this.x,param2);
               blockTwo = MapManager.map.blockMap.getBlockAtPos(param1,this.y);
               if(blockOne != null || blockTwo != null)
               {
                  realVars = this.realHitVars(null,new Point(param1,param2),null,null);
                  if(realVars.target != null)
                  {
                     touchedBlock = realVars.target;
                  }
               }
            }
            if(touchedBlock != this.lastBlockTouched || this.checkTouches)
            {
               if(touchedBlock != null && touchedBlock.active)
               {
                  _loc_4 = Data.rotatePoint(this.velX,this.velY,-this.rotation);
                  _loc_5 = new Point(param1 - _loc_4.x * 25,param2 - _loc_4.y * 25);
                  testedPoint = new Point(param1,param2);
                  topLeft = new Point(touchedBlock.posX,touchedBlock.posY);
                  topRight = new Point(touchedBlock.posX + Block.width,touchedBlock.posY);
                  bottomLeft = new Point(touchedBlock.posX,touchedBlock.posY + Block.height);
                  bottomRight = new Point(touchedBlock.posX + Block.width,touchedBlock.posY + Block.height);
                  if(this.velX != 0 || this.velY != 0)
                  {
                     collisionPoint = Data.linesIntersect(_loc_5,testedPoint,topLeft,topRight);
                     if(collisionPoint != null)
                     {
                        hitSide = "top";
                     }
                     else
                     {
                        collisionPoint = Data.linesIntersect(_loc_5,testedPoint,topRight,bottomRight);
                        if(collisionPoint != null)
                        {
                           hitSide = "right";
                        }
                        else
                        {
                           collisionPoint = Data.linesIntersect(_loc_5,testedPoint,bottomLeft,bottomRight);
                           if(collisionPoint != null)
                           {
                              hitSide = "bottom";
                           }
                           else
                           {
                              collisionPoint = Data.linesIntersect(_loc_5,testedPoint,topLeft,bottomLeft);
                              if(collisionPoint != null)
                              {
                                 hitSide = "left";
                              }
                           }
                        }
                     }
                  }
                  else
                  {
                     hitSide = this.scaleX > 0 ? "right" : "left";
                  }
                  if(this.useNewCollision)
                  {
                     realVars = this.realHitVars(hitSide,testedPoint,touchedBlock,collisionPoint);
                     if(realVars.abort)
                     {
                        this.checkPointForPlayers(param1,param2);
                        return collided;
                     }
                     hitSide = realVars.hitSide;
                     touchedBlock = realVars.target;
                     collisionPoint = realVars.collisionPt;
                     collidedInOneAxis = Boolean(realVars.collidedInOneAxis);
                  }
                  if(touchedBlock == null)
                  {
                     this.checkPointForPlayers(param1,param2);
                     return collided;
                  }
                  blockBump = touchedBlock.vars.bump.type;
                  blockSideSetting = "";
                  if(hitSide != null)
                  {
                     blockSideSetting = touchedBlock.vars[hitSide].type;
                  }
                  this.lastBlockTouched = touchedBlock;
                  this.lastHitSide = hitSide;
                  _loc_14 = Data.rotatePoint(20 * this.scaleX,0,-this.rotation);
                  if(this.collideWithBlocks)
                  {
                     touchedBlock.hit(_loc_14.x,_loc_14.y);
                  }
                  if(!(this instanceof GrenadeEffect))
                  {
                     Sounds.startGameSound(new BumpSound(),this,0.66);
                  }
                  else if(Math.abs(this.velX) > 2 || Math.abs(this.velY) > 2)
                  {
                     Sounds.startGameSound(new BumpSound(),this,0.66);
                  }
                  if(this.collideWithBlocks && this.fromPlayer instanceof LocalPlayer)
                  {
                     if(blockBump == BlockSideSettings.EXPLODE || blockSideSetting == BlockSideSettings.EXPLODE)
                     {
                        if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
                        {
                           GamePage.instance.localExplodeBlock(touchedBlock,{
                              "source":this,
                              "side":hitSide
                           });
                        }
                        else
                        {
                           GamePage.instance.explodeBlock(touchedBlock,{
                              "source":this,
                              "side":hitSide
                           });
                        }
                     }
                     else if((blockBump == BlockSideSettings.SHATTER || blockSideSetting == BlockSideSettings.SHATTER || blockBump == BlockSideSettings.CRUMBLE || blockSideSetting == BlockSideSettings.CRUMBLE || blockBump == BlockSideSettings.GLASS || blockSideSetting == BlockSideSettings.GLASS || touchedBlock.vars.type == BlockSettings.WEAK) && (touchedBlock.vars.type != BlockSettings.WEAK || touchedBlock.vars.type == BlockSettings.WEAK && (blockSideSetting != BlockSideSettings.REFLECT || !(this instanceof LaserEffect))))
                     {
                        if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
                        {
                           GamePage.instance.localShatterBlock(touchedBlock,{
                              "source":this,
                              "side":hitSide
                           });
                        }
                        else
                        {
                           GamePage.instance.shatterBlock(touchedBlock,{
                              "source":this,
                              "side":hitSide
                           });
                        }
                     }
                  }
                  if(!touchedBlock.removed && !this.ignoreHitBlock)
                  {
                     if(blockSideSetting == BlockSideSettings.BE_PUSHED)
                     {
                        touchedBlock.move(hitSide);
                     }
                     else if(blockSideSetting == BlockSideSettings.VANISH)
                     {
                        if(touchedBlock.timeTillVanish <= 0)
                        {
                           touchedBlock.startFadeOut();
                        }
                        else if(touchedBlock.timeTillVanishTimeout == 0)
                        {
                           touchedBlock.timeTillVanishTimeout = uint(setTimeout($b(touchedBlock, 'startFadeOut'),touchedBlock.timeTillVanish));
                        }
                     }
                     else if(blockSideSetting == BlockSideSettings.REFLECT)
                     {
                        this.hit({
                           "target":touchedBlock,
                           "side":hitSide,
                           "collisionPt":collisionPoint
                        });
                     }
                     if(this instanceof GrenadeEffect)
                     {
                        vel = touchedBlock.bumpVel;
                        if(vel != null)
                        {
                           if(Math.abs(vel.x) > 0)
                           {
                              this.velY = Math.abs(vel.x) + Math.abs(this.velY);
                           }
                           else if(Math.abs(vel.y) > 0)
                           {
                              this.velY = Math.abs(vel.y) + Math.abs(this.velY);
                           }
                        }
                     }
                  }
                  if(blockSideSetting != BlockSideSettings.REFLECT || !(this instanceof LaserEffect))
                  {
                     this.hit({
                        "target":touchedBlock,
                        "side":hitSide,
                        "collisionPt":collisionPoint,
                        "oneAxis":collidedInOneAxis
                     });
                     if(!(this instanceof SlashEffect) && !(this instanceof BuzzsawEffect))
                     {
                        if(collisionPoint != null)
                        {
                           collided = true;
                           param1 = this.x = collisionPoint.x;
                           param2 = this.y = collisionPoint.y;
                        }
                     }
                  }
               }
            }
            this.checkPointForPlayers(param1,param2);
         }
         return collided;
      }
  realHitVars(side: string, tp: Point, hitBlock: Block, collisionPoint: Point): any {
         var blockContender: Block= null;
         var sideInt: number = int(0);
         var closestSide: number = int(0);
         var closestSideContender: number = int(0);
         var trueHitBlock: Block= null;
         var slope: number= NaN;
         var _b: number= NaN;
         var limit: number = int(0);
         var vcY: number= NaN;
         var verticalContender: Point= null;
         var hcX: number= NaN;
         var horizontalContender: Point= null;
         var returnObj: any= {
            "target":hitBlock,
            "hitSide":side,
            "collisionPt":collisionPoint,
            "collidedInOneAxis":true
         };
         var cpt: Point= Data.rotatePoint(this.x,this.y,this.rotation);
         var rotationIsPi: boolean= (this.rotationAtUse + 360) % 180 == 0;
         var zeroSlope: boolean= rotationIsPi && Math.abs(tp.y) - Math.abs(cpt.y) == 0 || !rotationIsPi && Math.abs(tp.x) - Math.abs(cpt.x) == 0;
         var infinitySlope: boolean= rotationIsPi && Math.abs(tp.x) - Math.abs(cpt.x) == 0 || !rotationIsPi && Math.abs(tp.y) - Math.abs(cpt.y) == 0;
         tp = Data.rotatePoint(tp.x,tp.y,this.rotation);
         if(this.isPointBlank() || zeroSlope)
         {
            sideInt = int(this.directionAtUse == "right" ? int(BuzzsawEffect.SIDE_LEFT) : int(BuzzsawEffect.SIDE_RIGHT));
            returnObj.hitSide = BuzzsawEffect.side_hitSide[this.rotateHitSide(sideInt,this.rotationAtUse)];
            return returnObj;
         }
         if(infinitySlope)
         {
            if(rotationIsPi)
            {
               sideInt = int(this.velY > 0 ? int(BuzzsawEffect.SIDE_UP) : int(BuzzsawEffect.SIDE_DOWN));
            }
            else
            {
               sideInt = int(this.velX > 0 ? int(BuzzsawEffect.SIDE_LEFT) : int(BuzzsawEffect.SIDE_RIGHT));
            }
            returnObj.hitSide = BuzzsawEffect.side_hitSide[sideInt];
            return returnObj;
         }
         closestSide = int(-1);
         slope = (-tp.y - -cpt.y) / (tp.x - cpt.x);
         _b = -cpt.y - slope * cpt.x;
         limit = int(0);
         while(closestSide == -1 && limit < 50 && Point.distance(cpt,tp) > 0 && Point.distance(Data.rotatePoint(this.x,this.y,this.rotation),cpt) <= Point.distance(Data.rotatePoint(this.x,this.y,this.rotation),tp))
         {
            if(this.velY > 0)
            {
               vcY = cpt.y + (40 - (cpt.y % 40 + 40) % 40);
            }
            else
            {
               vcY = cpt.y - (cpt.y % 40 + 40) % 40;
            }
            verticalContender = new Point(this.lineGetX(vcY,slope,_b),vcY);
            if(limit > 0 && Point.distance(cpt,verticalContender) == 0)
            {
               vcY += this.velY > 0 ? 40 : -40;
               verticalContender = new Point(this.lineGetX(vcY,slope,_b),vcY);
            }
            if(this.velX > 0)
            {
               hcX = cpt.x + (40 - (cpt.x % 40 + 40) % 40);
            }
            else
            {
               hcX = cpt.x - (cpt.x % 40 + 40) % 40;
            }
            horizontalContender = new Point(hcX,this.lineGetY(slope,hcX,_b));
            if(limit > 0 && Point.distance(cpt,horizontalContender) == 0)
            {
               hcX += this.velX > 0 ? 40 : -40;
               horizontalContender = new Point(hcX,this.lineGetY(slope,hcX,_b));
            }
            if(Point.distance(cpt,verticalContender) < Point.distance(cpt,horizontalContender))
            {
               closestSideContender = int(this.velY > 0 ? int(BuzzsawEffect.SIDE_UP) : int(BuzzsawEffect.SIDE_DOWN));
               closestSideContender = int(this.rotateHitSide(closestSideContender,this.rotation));
               cpt = verticalContender;
            }
            else
            {
               closestSideContender = int(this.velX > 0 ? int(BuzzsawEffect.SIDE_LEFT) : int(BuzzsawEffect.SIDE_RIGHT));
               closestSideContender = int(this.rotateHitSide(closestSideContender,this.rotation));
               cpt = horizontalContender;
            }
            if(Point.distance(Data.rotatePoint(this.x,this.y,this.rotation),cpt) > Point.distance(Data.rotatePoint(this.x,this.y,this.rotation),tp))
            {
               returnObj.abort = true;
               return returnObj;
            }
            blockContender = this.blockIsBelow(closestSideContender,Data.rotatePoint(cpt.x,cpt.y,-this.rotation),true);
            if(blockContender != null)
            {
               if(blockContender.vars[BuzzsawEffect.side_hitSide[closestSideContender]].type == BlockSideSettings.INACTIVE && !this.hitInactiveSides())
               {
                  closestSideContender = int(-1);
                  blockContender = null;
                  limit++;
               }
               else
               {
                  cpt = Data.rotatePoint(cpt.x,cpt.y,-this.rotation);
                  closestSide = int(closestSideContender);
                  trueHitBlock = this.blockIsBelow(closestSideContender,cpt,true);
               }
            }
            else
            {
               closestSideContender = int(-1);
               limit++;
            }
         }
         if(limit < 50)
         {
            returnObj.target = trueHitBlock;
            returnObj.hitSide = BuzzsawEffect.side_hitSide[closestSide];
            returnObj.collisionPt = cpt.clone();
            returnObj.collidedInOneAxis = false;
         }
         return returnObj;
      }
  adjustIndexByRotation(param1: number, param2: number): number {
    param1 = int(param1);
         var _loc_3= param2 / 90;
         if(_loc_3 < 0)
         {
            _loc_3 = 4 + _loc_3;
         }
         param1 = int(param1 + (_loc_3));
         return int(param1 % 4);
      }
  go(event: Event): void {
         var maxPixels: number = int(0);
         var moveX: number = int(0);
         var moveY: number = int(0);
         var velocityRotated: Point= null;
         if(--this.life <= 0)
         {
            this.remove();
            return;
         }
         var _velX: number = int(this.velX);
         var _velY: number = int(this.velY);
         if(_velX == 0 && _velY == 0)
         {
            this.onMoveStep(0,0);
         }
         else
         {
            while(_velX != 0 || _velY != 0)
            {
               maxPixels = int(39);
               moveX = int(int(Maths.limit(_velX,-maxPixels,maxPixels)));
               moveY = int(int(Maths.limit(_velY,-maxPixels,maxPixels)));
               velocityRotated = Data.rotatePoint(moveX,moveY,-this.rotation);
               if(!this.onMoveStep(velocityRotated.x,velocityRotated.y))
               {
                  break;
               }
               _velX = int(_velX - (moveX));
               _velY = int(_velY - (moveY));
            }
         }
      }
  onMoveStep(x: number, y: number): boolean {
         this.testPointMoving(x,y);
         return !this.removed;
      }
  testPointMoving(x: number, y: number): boolean {
         if(!this.testPoint(this.x + x,this.y + y))
         {
            this.x += x;
            this.y += y;
         }
      }
  checkObjectForPlayers(object: DisplayObject): void {
         var player= undefined;
         if(!this.removed)
         {
            for (player of $each(GamePage.instance.playerArray))
            {
               if(player != null && player != this.fromPlayer)
               {
                  if(!player.checkForFriendlyFire(this.fromPlayer))
                  {
                     if(Boolean(player.touchingObject(object)) && !player.shield)
                     {
                        player.touchingObject(object);
                        if(this instanceof BeamEffect)
                        {
                           player.iced = true;
                        }
                     }
                  }
               }
            }
         }
      }
  checkPointForPlayers(param1: number, param2: number): void {
         var player= undefined;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         if(!this.removed)
         {
            for (player of $each(GamePage.instance.playerArray))
            {
               if(player != null && (player != this.fromPlayer || this.bounced))
               {
                  if(this.parent != null)
                  {
                     if(!player.checkForFriendlyFire(this.fromPlayer))
                     {
                        _loc_4 = this.parent.localToGlobal(new Point(param1,param2));
                        if(player.touchingPoint(_loc_4.x,_loc_4.y))
                        {
                           if(this.fromPlayer != null)
                           {
                              if(this.fromPlayer.toqueHat || this instanceof SnowballEffect)
                              {
                                 this.chill = true;
                              }
                           }
                           if(!this.dealtDamage && !player.shield)
                           {
                              player.checkForDamage(this.fromPlayer,this.damage,this.sap,this.chill);
                              this.dealtDamage = true;
                           }
                           if(this.recoverySpeed != 2500)
                           {
                              player.hitBySnowball = true;
                           }
                           if(player instanceof LocalPlayer)
                           {
                              _loc_5 = new Point();
                              _loc_5 = Data.rotatePoint(this.hitVelX * this.knockbackMultiplier,this.hitVelY * this.knockbackMultiplier,player.rotation - this.rotation);
                              (player).tempRecoverySpeed = int(this.recoverySpeed);
                              (player).hit(_loc_5.x,_loc_5.y,this.damage,this.fromPlayer,this.noKnockback);
                           }
                           if(player.crownHat)
                           {
                              this.bounce();
                           }
                           else if(this.interactWithPlayers)
                           {
                              this.hit({"target":player});
                           }
                        }
                     }
                  }
               }
            }
         }
      }
  bounce(): void {
         this.bounced = true;
         this.rotation += 180;
      }
  hit(params: any): void {
         this.remove();
      }
  fromPacket(packet: any): void {
         this.x = packet.x;
         this.y = packet.y;
         this.velX = packet.velX;
         this.velY = packet.velY;
         this.scaleX = packet.dir;
         this.rotation = packet.rot;
         this.hitVelX = packet.hitVelX;
         this.hitVelY = packet.hitVelY;
         this.damage = int(packet.damage);
         this.knockbackMultiplier = packet.knockbackMultiplier;
      }
  get shooter(): ActivePlayer {
         return this.fromPlayer;
      }
  lineGetX(_y: number, _m: number, _b: number): number {
         return (-_y - _b) / _m;
      }
  lineGetY(_m: number, _x: number, _b: number): number {
         return -(_m * _x + _b);
      }
  blockIsBelow(side: number = 0, point: Point = null, getBlock: boolean = false): any {
    side = int(side);
         return null;
      }
  rotateHitSide(side: number, rotation: number): number {
    side = int(side);
         return 0;
      }
  isPointBlank(): boolean {
         return false;
      }
  hitInactiveSides(): boolean {
         return true;
      }
  constructor(player: ActivePlayer = null, damage: number = 1, knockback: number = 1, sap: number = 0, recovery: number = 2500, shotRotation: number = 0, ignorePlayerDirection: boolean = false) {
    damage = int(damage); sap = int(sap); recovery = int(recovery); shotRotation = int(shotRotation);
         super();
         if(player != null)
         {
            this.fromPlayer = player;
            this.rotation = player.rotation + shotRotation;
            if(player.facing == "left" && !ignorePlayerDirection)
            {
               this.scaleX = -1;
               this.velX *= -1;
            }
            this.rotationAtUse = this.fromPlayer.rotation;
            this.directionAtUse = this.fromPlayer.facing;
         }
         this.damage = int(damage);
         this.sap = int(sap);
         this.recoverySpeed = int(recovery);
         this.knockbackMultiplier = knockback;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'go'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.effects.ProjectileEffect', ProjectileEffect);
