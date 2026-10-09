// Ported from com/jiggmin/pr3/effects/BuzzsawEffect.as
import { Event, Point, System, setTimeout } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, Block, BlockSettings, BlockSideSettings, BuzzsawEffectGraphic, BuzzsawEnterSound, BuzzsawLeaveSound, Data, GamePage, MapManager, MatchPage, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BuzzsawEffect extends ProjectileEffect {
  static SIDE_UP: number = 1;
  static SIDE_LEFT: number = 2;
  static SIDE_DOWN: number = 3;
  static SIDE_RIGHT: number = 4;
  static hitSide_Side: any = {
         "top":1,
         "left":2,
         "bottom":3,
         "right":4
      };
  static side_hitSide: any = {
         1:"top",
         2:"left",
         3:"bottom",
         4:"right"
      };
  declare m: any;
  throwForce: number = 4;
  gravity: number = 1;
  postgravity: number = 1;
  overrides: string = "";
  running: boolean = false;
  declare runningOn: Block;
  runningSide: number = 0;
  direction: number = 0;
  sawSpeed: number = 10;
  subMovements: any[] = [];
  turnAhead: boolean = false;
  pointBlank: boolean = true;
  ran: boolean = false;
  didCollision: boolean = false;
  bindMovement: boolean = false;
  declare pastTurnPt: Point;
  declare futureTurnPt: Point;
  futureTurnDr: string = null;
  didFirstHitVelocity: boolean = false;
  remove(): void {
         if(this.life <= 0)
         {
            Sounds.startGameSound(new BuzzsawLeaveSound(),this.m,1);
         }
         this.removeChild(this.m);
         this.m = null;
         super.remove();
         System.gc();
      }
  go(event: Event): void {
         this.pointBlank = false;
         this.didCollision = false;
         if(!this.running)
         {
            this.customGo();
            if(!this.running)
            {
               this.applyFreefallVel();
            }
         }
         else
         {
            this.interactWithBlock();
            if(this.running)
            {
               this.handleTurns();
               this.customGo();
               if(this.runningOn == null || !this.runningOn.active || Boolean(this.runningOn.removed))
               {
                  this.detach();
               }
            }
            else
            {
               this.customGo();
            }
         }
         if(this.m != null)
         {
            this.m.rotationZ += this.sawSpeed * 5;
         }
      }
  customGo(): void {
         var subMovement: any[]= null;
         var newBlock: Block= null;
         var numIterations= 0;
         var velocityRotated: Point= null;
         var wasFreefalling: boolean= false;
         var justTurned: boolean= false;
         var aboutToTurn: boolean= false;
         var newVelocity: Point= null;
         var pastTurn: Point= null;
         var nextTurn: Point= null;
         var validBlock: boolean= false;
         if(--this.life <= 0)
         {
            this.remove();
            return;
         }
         var maxPixels: number = int(39);
         var _velX: number= this.velX;
         var _velY: number= this.velY;
         var futurePt: Point= new Point(this.x,this.y);
         if(!(_velX == 0 && _velY == 0))
         {
            while(true)
            {
               if(this.subMovements.length > 0)
               {
                  subMovement = this.subMovements.removeAt(0);
                  if(subMovement[0] == "detach")
                  {
                     break;
                  }
                  _velX = Number(subMovement[0]);
                  _velY = Number(subMovement[1]);
                  nextTurn = subMovement[5];
               }
               numIterations = int(Math.ceil(Math.max(Math.abs(_velX),Math.abs(_velY)) / maxPixels));
               _velX /= numIterations;
               _velY /= numIterations;
               while(numIterations > 0)
               {
                  velocityRotated = Data.rotatePoint(_velX,_velY,-this.rotation);
                  wasFreefalling = !this.running;
                  if(!this.onMoveStep(velocityRotated.x,velocityRotated.y))
                  {
                     break;
                  }
                  if(wasFreefalling && (Boolean(this.running) || Boolean(this.didCollision)))
                  {
                     break;
                  }
                  if(Boolean(this.running) && subMovement != null)
                  {
                     newBlock = this.blockIsBelow(subMovement[2],new Point(this.x,this.y),true);
                     validBlock = newBlock != null && newBlock.active && !newBlock.removed;
                     justTurned = pastTurn != null && Point.distance(new Point(this.x,this.y),pastTurn) <= 2;
                     aboutToTurn = nextTurn != null && Point.distance(new Point(this.x,this.y),nextTurn) <= 2;
                     if(validBlock && subMovement[3] != "outside")
                     {
                        if(subMovement[3] == "inside" || subMovement[3] == "straight" && !justTurned && !aboutToTurn && newBlock != this.runningOn)
                        {
                           this.detach(false);
                           this.attach(newBlock,subMovement[2],true);
                           if(!this.running)
                           {
                              this.subMovements = [];
                              return;
                           }
                        }
                     }
                     if(subMovement[3] != "straight")
                     {
                        switch(subMovement[4])
                        {
                           case BuzzsawEffect.SIDE_UP:
                              newVelocity = new Point(0,subMovement[3] == "outside" ? 1 : -1);
                              break;
                           case BuzzsawEffect.SIDE_DOWN:
                              newVelocity = new Point(0,subMovement[3] == "outside" ? -1 : 1);
                              break;
                           case BuzzsawEffect.SIDE_LEFT:
                              newVelocity = new Point(subMovement[3] == "outside" ? 1 : -1,0);
                              break;
                           case BuzzsawEffect.SIDE_RIGHT:
                              newVelocity = new Point(subMovement[3] == "outside" ? -1 : 1,0);
                        }
                        this.runningSide = int(subMovement[2]);
                        this.setVelocity(newVelocity.x,newVelocity.y);
                        if(nextTurn != null)
                        {
                           pastTurn = nextTurn.clone();
                           nextTurn = null;
                        }
                     }
                  }
                  validBlock = Boolean(null);
                  pastTurn = null;
                  nextTurn = null;
                  numIterations--;
               }
               if(this.subMovements.length > 0)
               {
                  continue;
               }
            }
            this.detach();
            this.subMovements = [];
            return;
         }
         this.onMoveStep(0,0);
         this.subMovements = [];
      }
  testPointMoving(_x: number, _y: number): boolean {
         if(!this.testPoint(this.x + _x,this.y + _y))
         {
            if(!this.bindMovement)
            {
               this.x += _x;
               this.y += _y;
            }
            else
            {
               this.bindMovement = false;
            }
         }
      }
  hit(params: any): void {
         if(!this.running && params.side != null)
         {
            this.groundToBlock(params.side,params.target,params.collisionPt,params.oneAxis);
            this.ran = true;
            this.didCollision = true;
            this.bounced = true;
            this.didFirstHitVelocity = true;
            Sounds.startGameSound(new BuzzsawEnterSound(),this.m,1);
         }
      }
  applyFreefallVel(): any {
         switch(this.rotationAtUse)
         {
            case 0:
               this.velY += this.ran ? this.postgravity : this.gravity;
               break;
            case 90:
            case -270:
               this.velX -= this.ran ? this.postgravity : this.gravity;
               break;
            case 180:
            case -180:
               this.velY -= this.ran ? this.postgravity : this.gravity;
               break;
            case 270:
            case -90:
               this.velX += this.ran ? this.postgravity : this.gravity;
         }
      }
  groundToBlock(side: string, hitBlock: Block, collisionPoint: Point, collidedInOneAxis: boolean): boolean {
         var setPos: Point= null;
         var slope: number= NaN;
         var _b: number= NaN;
         var sideToRun: number = int(int(BuzzsawEffect.hitSide_Side[side]));
         if(collisionPoint != null)
         {
            slope = (-this.y - -collisionPoint.y) / (this.x - collisionPoint.x);
            _b = -collisionPoint.y - slope * collisionPoint.x;
         }
         if(collidedInOneAxis || !isFinite(slope) || slope == 0)
         {
            switch(sideToRun)
            {
               case BuzzsawEffect.SIDE_UP:
                  --hitBlock.y;
                  break;
               case BuzzsawEffect.SIDE_LEFT:
                  --hitBlock.x;
                  break;
               case BuzzsawEffect.SIDE_DOWN:
                  this.y = hitBlock.y + 40;
                  break;
               case BuzzsawEffect.SIDE_RIGHT:
                  this.x = hitBlock.x + 40;
            }
         }
         else
         {
            switch(sideToRun)
            {
               case BuzzsawEffect.SIDE_UP:
                  setPos = new Point(this.lineGetX(collisionPoint.y - 1,slope,_b),collisionPoint.y - 1);
                  break;
               case BuzzsawEffect.SIDE_LEFT:
                  setPos = new Point(collisionPoint.x - 1,this.lineGetY(slope,collisionPoint.x - 1,_b));
                  break;
               case BuzzsawEffect.SIDE_DOWN:
                  setPos = new Point(this.lineGetX(collisionPoint.y + 1,slope,_b),collisionPoint.y + 1);
                  break;
               case BuzzsawEffect.SIDE_RIGHT:
                  setPos = new Point(collisionPoint.x + 1,this.lineGetY(slope,collisionPoint.x + 1,_b));
            }
            this.x = setPos.x;
            this.y = setPos.y;
         }
         this.attach(hitBlock,sideToRun,true);
         this.bindMovement = true;
         return true;
      }
  handleTurns(): void {
    var futureBlock; // undeclared in decompiled source
         var fcpLimit: number= NaN;
         var outsideTurnBlock: Block= null;
         var pastSide: number = int(0);
         var offset: any[]= null;
         var checkPt: Point= null;
         var testPt: Point= null;
         var increment: number= NaN;
         var doInsideTurn: boolean= false;
         var doOutsideTurn: boolean= false;
         var distanceLeft: number= Math.max(Math.abs(this.velX),Math.abs(this.velY));
         var futurePt: Point= new Point(this.x,this.y);
         var futureSide: number = int(int(this.runningSide));
         var futureVelX: number= this.velX;
         var futureVelY: number= this.velY;
         var handledCurrentBlock: boolean= false;
         while(distanceLeft > 0)
         {
            offset = [0,0];
            checkPt = new Point(futurePt.x,futurePt.y);
            doInsideTurn = false;
            doOutsideTurn = false;
            if(this.futureTurnPt == null || futureVelX > 0 && futurePt.x > this.futureTurnPt.x || futureVelX < 0 && futurePt.x < this.futureTurnPt.x || futureVelY > 0 && futurePt.y > this.futureTurnPt.y || futureVelY < 0 && futurePt.y < this.futureTurnPt.y)
            {
               switch(futureSide)
               {
                  case BuzzsawEffect.SIDE_UP:
                  case BuzzsawEffect.SIDE_DOWN:
                     do
                     {
                        if(futureVelX > 0)
                        {
                           checkPt.x = handledCurrentBlock ? checkPt.x + 40 : this.runningOn.x + 40;
                           handledCurrentBlock = true;
                           offset[0] = 1;
                        }
                        else
                        {
                           checkPt.x = handledCurrentBlock ? checkPt.x - 40 : Number(this.runningOn.x);
                           handledCurrentBlock = true;
                           offset[0] = -1;
                        }
                        fcpLimit = Number(Point.distance(futurePt,checkPt));
                        testPt = new Point(checkPt.x + offset[0],checkPt.y);
                        doInsideTurn = Boolean(this.activeSideInSight(this.blockAt(testPt.x,testPt.y,true),futureSide,"inside",futureVelX,futureVelY));
                        doOutsideTurn = !this.activeSideInSight(this.blockIsBelow(futureSide,testPt,true),futureSide,"outside",futureVelX,futureVelY);
                     }
                     while(!doInsideTurn && !doOutsideTurn && fcpLimit <= distanceLeft);
                     break;
                  case BuzzsawEffect.SIDE_LEFT:
                  case BuzzsawEffect.SIDE_RIGHT:
                     do
                     {
                        if(futureVelY > 0)
                        {
                           checkPt.y = handledCurrentBlock ? checkPt.y + 40 : this.runningOn.y + 40;
                           handledCurrentBlock = true;
                           offset[1] = 1;
                        }
                        else
                        {
                           checkPt.y = handledCurrentBlock ? checkPt.y - 40 : Number(this.runningOn.y);
                           handledCurrentBlock = true;
                           offset[1] = -1;
                        }
                        fcpLimit = Number(Point.distance(futurePt,checkPt));
                        testPt = new Point(checkPt.x,checkPt.y + offset[1]);
                        doInsideTurn = Boolean(this.activeSideInSight(this.blockAt(testPt.x,testPt.y,true),futureSide,"inside",futureVelX,futureVelY));
                        doOutsideTurn = !this.activeSideInSight(this.blockIsBelow(futureSide,testPt,true),futureSide,"outside",futureVelX,futureVelY);
                     }
                     while(!doInsideTurn && !doOutsideTurn && fcpLimit <= distanceLeft);
               }
            }
            if(doInsideTurn || this.futureTurnPt != null && this.futureTurnDr == "inside")
            {
               if(this.futureTurnPt == null)
               {
                  this.futureTurnPt = new Point(checkPt.x - offset[0],checkPt.y - offset[1]);
                  this.futureTurnDr = "inside";
               }
               if(Point.distance(futurePt,this.futureTurnPt) > distanceLeft)
               {
                  this.subMovements.push([futureVelX,futureVelY,futureSide,"straight",null,this.futureTurnPt != null ? this.futureTurnPt.clone() : null]);
                  return;
               }
               pastSide = int(futureSide);
               switch(futureSide)
               {
                  case BuzzsawEffect.SIDE_UP:
                     futureSide = int(futureVelX > 0 ? BuzzsawEffect.SIDE_LEFT : BuzzsawEffect.SIDE_RIGHT);
                     futureVelY = 0 - (Math.abs(futureVelX) - Point.distance(this.futureTurnPt,futurePt));
                     if(futureVelY == 0)
                     {
                        futureVelY = -1;
                     }
                     futureVelX = 0;
                     break;
                  case BuzzsawEffect.SIDE_DOWN:
                     futureSide = int(futureVelX > 0 ? BuzzsawEffect.SIDE_LEFT : BuzzsawEffect.SIDE_RIGHT);
                     futureVelY = Math.abs(futureVelX) - Point.distance(this.futureTurnPt,futurePt);
                     if(futureVelY == 0)
                     {
                        futureVelY = 1;
                     }
                     futureVelX = 0;
                     break;
                  case BuzzsawEffect.SIDE_LEFT:
                     futureSide = int(futureVelY > 0 ? BuzzsawEffect.SIDE_UP : BuzzsawEffect.SIDE_DOWN);
                     futureVelX = 0 - (Math.abs(futureVelY) - Point.distance(this.futureTurnPt,futurePt));
                     if(futureVelX == 0)
                     {
                        futureVelX = -1;
                     }
                     futureVelY = 0;
                     break;
                  case BuzzsawEffect.SIDE_RIGHT:
                     futureSide = int(futureVelY > 0 ? BuzzsawEffect.SIDE_UP : BuzzsawEffect.SIDE_DOWN);
                     futureVelX = Math.abs(futureVelY) - Point.distance(this.futureTurnPt,futurePt);
                     if(futureVelX == 0)
                     {
                        futureVelX = 1;
                     }
                     futureVelY = 0;
               }
            }
            else
            {
               if(!(doOutsideTurn || this.futureTurnPt != null && this.futureTurnDr == "outside"))
               {
                  this.subMovements.push([futureVelX,futureVelY,futureSide,"straight",null,this.futureTurnPt != null ? this.futureTurnPt.clone() : null]);
                  return;
               }
               if(this.futureTurnPt == null)
               {
                  this.futureTurnPt = new Point(checkPt.x + offset[0],checkPt.y + offset[1]);
                  this.futureTurnDr = "outside";
               }
               if(Point.distance(futurePt,this.futureTurnPt) > distanceLeft)
               {
                  this.subMovements.push([futureVelX,futureVelY,futureSide,"straight",null,this.futureTurnPt != null ? this.futureTurnPt.clone() : null]);
                  return;
               }
               pastSide = int(futureSide);
               switch(futureSide)
               {
                  case BuzzsawEffect.SIDE_UP:
                     futureSide = int(futureVelX > 0 ? BuzzsawEffect.SIDE_RIGHT : BuzzsawEffect.SIDE_LEFT);
                     futureBlock = this.blockIsBelow(futureSide,new Point(this.futureTurnPt.x,this.futureTurnPt.y + 10),true);
                     futureVelY = Math.abs(futureVelX) - Point.distance(this.futureTurnPt,futurePt);
                     if(futureVelY == 0)
                     {
                        futureVelY = 1;
                     }
                     futureVelX = 0;
                     break;
                  case BuzzsawEffect.SIDE_DOWN:
                     futureSide = int(futureVelX > 0 ? BuzzsawEffect.SIDE_RIGHT : BuzzsawEffect.SIDE_LEFT);
                     futureBlock = this.blockIsBelow(futureSide,new Point(this.futureTurnPt.x,this.futureTurnPt.y - 10),true);
                     futureVelY = 0 - (Math.abs(futureVelX) - Point.distance(this.futureTurnPt,futurePt));
                     if(futureVelY == 0)
                     {
                        futureVelY = -1;
                     }
                     futureVelX = 0;
                     break;
                  case BuzzsawEffect.SIDE_LEFT:
                     futureSide = int(futureVelY > 0 ? BuzzsawEffect.SIDE_DOWN : BuzzsawEffect.SIDE_UP);
                     futureBlock = this.blockIsBelow(futureSide,new Point(this.futureTurnPt.x + 10,this.futureTurnPt.y),true);
                     futureVelX = Math.abs(futureVelY) - Point.distance(this.futureTurnPt,futurePt);
                     if(futureVelX == 0)
                     {
                        futureVelX = 1;
                     }
                     futureVelY = 0;
                     break;
                  case BuzzsawEffect.SIDE_RIGHT:
                     futureSide = int(futureVelY > 0 ? BuzzsawEffect.SIDE_DOWN : BuzzsawEffect.SIDE_UP);
                     futureBlock = this.blockIsBelow(futureSide,new Point(this.futureTurnPt.x - 10,this.futureTurnPt.y),true);
                     futureVelX = 0 - (Math.abs(futureVelY) - Point.distance(this.futureTurnPt,futurePt));
                     if(futureVelX == 0)
                     {
                        futureVelX = -1;
                     }
                     futureVelY = 0;
               }
            }
            this.subMovements.push([this.futureTurnPt.x - futurePt.x,this.futureTurnPt.y - futurePt.y,futureSide,this.futureTurnDr,pastSide,new Point(this.futureTurnPt.x,this.futureTurnPt.y)]);
            if(this.futureTurnDr == "outside" && futureBlock != null && (futureBlock.vars[BuzzsawEffect.side_hitSide[futureSide]].type == BlockSideSettings.INACTIVE && (this.overrides.length <= 4 || !Boolean(parseInt(this.overrides.charAt(this.overrides.length - 5))))))
            {
               this.subMovements.push(["detach"]);
               return;
            }
            distanceLeft -= Point.distance(this.futureTurnPt,futurePt);
            futurePt.x = this.futureTurnPt.x;
            futurePt.y = this.futureTurnPt.y;
            this.pastTurnPt = new Point(this.futureTurnPt.x,this.futureTurnPt.y);
            this.futureTurnPt = null;
            this.futureTurnDr = null;
         }
      }
  activeSideInSight(block: Block, currSide: number, turnDir: string, _currXVel: number, _currYVel: number): boolean {
    currSide = int(currSide);
         var sideToCheck: string= null;
         if(block == null)
         {
            return false;
         }
         if(!block.active)
         {
            return false;
         }
         if(this.overrides.length >= 5 && Boolean(parseInt(this.overrides.charAt(this.overrides.length - 5))))
         {
            return true;
         }
         if(turnDir == "inside")
         {
            switch(currSide)
            {
               case BuzzsawEffect.SIDE_UP:
               case BuzzsawEffect.SIDE_DOWN:
                  sideToCheck = _currXVel > 0 ? "left" : "right";
                  break;
               case BuzzsawEffect.SIDE_LEFT:
               case BuzzsawEffect.SIDE_RIGHT:
                  sideToCheck = _currYVel > 0 ? "top" : "bottom";
            }
         }
         else if(turnDir == "outside")
         {
            sideToCheck = BuzzsawEffect.side_hitSide[currSide];
         }
         var blockSideSetting= block.vars[sideToCheck].type;
         return blockSideSetting != BlockSideSettings.INACTIVE;
      }
  setVelocity(xMvmt: number, yMvmt: number, _side: number = 0): void {
    _side = int(_side);
         var side: number = int(_side);
         if(side == 0)
         {
            side = int(int(this.runningSide));
         }
         var vels: any= this.getVelocities(xMvmt,yMvmt);
         switch(side)
         {
            case BuzzsawEffect.SIDE_UP:
            case BuzzsawEffect.SIDE_DOWN:
               this.velX = this.sawSpeed * (vels.x > 0 ? 1 : -1);
               this.velY = 0;
               break;
            case BuzzsawEffect.SIDE_LEFT:
            case BuzzsawEffect.SIDE_RIGHT:
               this.velX = 0;
               this.velY = this.sawSpeed * (vels.y > 0 ? 1 : -1);
         }
      }
  getVelocities(xMvmt: number, yMvmt: number): any {
         var hitVels: any= null;
         if(this.rotationAtUse == 0)
         {
            hitVels = {
               "x":(xMvmt != 0 ? xMvmt : this.direction),
               "y":(Boolean(this.running) && Boolean(this.didFirstHitVelocity) ? yMvmt : -1)
            };
         }
         else if(Math.abs(this.rotationAtUse) == 180)
         {
            hitVels = {
               "x":(xMvmt != 0 ? xMvmt : -this.direction),
               "y":(Boolean(this.running) && Boolean(this.didFirstHitVelocity) ? yMvmt : 1)
            };
         }
         else if(this.rotationAtUse == 90 || this.rotationAtUse == -270)
         {
            hitVels = {
               "x":(Boolean(this.running) && Boolean(this.didFirstHitVelocity) ? xMvmt : 1),
               "y":(yMvmt != 0 ? yMvmt : this.direction)
            };
         }
         else if(this.rotationAtUse == 270 || this.rotationAtUse == -90)
         {
            hitVels = {
               "x":(Boolean(this.running) && Boolean(this.didFirstHitVelocity) ? xMvmt : -1),
               "y":(yMvmt != 0 ? yMvmt : -this.direction)
            };
         }
         return hitVels;
      }
  rotateVelocity(_xVel: number, _yVel: number, rotation: number): any {
    var temp; // undeclared in decompiled source
         if(rotation == 90)
         {
            temp = _xVel;
            _xVel = -_yVel;
            _yVel = Number(temp);
         }
         else if(rotation == 180 || rotation == -180)
         {
            _xVel *= -1;
            _yVel *= -1;
         }
         else if(rotation == -90)
         {
            temp = _xVel;
            _xVel = _yVel;
            _yVel = -temp;
         }
         return {
            "_xVel":_xVel,
            "_yVel":_yVel
         };
      }
  rotateHitSide(side: number, rotation: number): number {
    side = int(side);
         if(rotation == 0)
         {
            return side;
         }
         if(rotation == -90)
         {
            return this.rotateSide(side,1);
         }
         if(rotation == 90)
         {
            return this.rotateSide(side,-1);
         }
         if(rotation == 180 || rotation == -180)
         {
            return this.rotateSide(side,2);
         }
      }
  rotateSide(side: number, steps: number): number {
    side = int(side); steps = int(steps);
         while(steps != 0)
         {
            if(steps > 0)
            {
               if(++side > BuzzsawEffect.SIDE_RIGHT)
               {
                  side = int(BuzzsawEffect.SIDE_UP);
               }
               steps--;
            }
            else
            {
               side--;
               if(side < BuzzsawEffect.SIDE_UP)
               {
                  side = int(BuzzsawEffect.SIDE_RIGHT);
               }
               steps++;
            }
         }
         return side;
      }
  attach(block: Block, side: number, interact: boolean = false): void {
    side = int(side);
         this.running = true;
         this.runningOn = block;
         this.runningSide = int(side);
         this.setVelocity(this.velX,this.velY);
         if(interact)
         {
            this.interactWithBlock();
         }
      }
  detach(enterFreefall: boolean = true): void {
         if(this.runningOn != null)
         {
            if(this.runningOn.arrow != null)
            {
               this.runningOn.arrowFadeOut();
            }
         }
         if(enterFreefall)
         {
            this.setVelocity(this.velX,this.velY);
            this.running = false;
            this.runningSide = int(0);
            this.futureTurnPt = null;
            this.pastTurnPt = null;
            this.runningOn = null;
            this.didFirstHitVelocity = true;
            this.lastBlockTouched = null;
         }
      }
  blockIsBelow(side: number = 0, point: Point = null, getBlock: boolean = false): any {
    side = int(side);
         var deltaX: number = int(0);
         var deltaY: number = int(0);
         if(side == 0)
         {
            side = int(int(this.runningSide));
         }
         if(point == null)
         {
            point = new Point(this.x,this.y);
         }
         switch(side)
         {
            case BuzzsawEffect.SIDE_UP:
               deltaY = int(deltaY + (10));
               break;
            case BuzzsawEffect.SIDE_LEFT:
               deltaX = int(deltaX + (10));
               break;
            case BuzzsawEffect.SIDE_DOWN:
               deltaY = int(deltaY - (10));
               break;
            case BuzzsawEffect.SIDE_RIGHT:
               deltaX = int(deltaX - (10));
         }
         return this.blockAt(point.x + deltaX,point.y + deltaY,getBlock);
      }
  blockAt(x: number, y: number, getBlock: boolean = false): any {
         var block: Block= MapManager.map.blockMap.getBlockAtPos(x,y);
         if(getBlock)
         {
            return block;
         }
         if(block == null || !block.active)
         {
            return false;
         }
         return true;
      }
  interactWithBlock(_side: number = 0): void {
    _side = int(_side);
         var side: string= null;
         if(this.runningOn == null)
         {
            return;
         }
         if(_side == 0)
         {
            _side = int(int(this.runningSide));
         }
         switch(_side)
         {
            case BuzzsawEffect.SIDE_UP:
               side = "top";
               break;
            case BuzzsawEffect.SIDE_LEFT:
               side = "left";
               break;
            case BuzzsawEffect.SIDE_DOWN:
               side = "bottom";
               break;
            case BuzzsawEffect.SIDE_RIGHT:
               side = "right";
         }
         var blockSideSetting= this.runningOn.vars[side].type;
         var interactionsArray: any[]= [$b(this, 'checkExplode'),$b(this, 'checkVanish'),$b(this, 'checkShatters'),$b(this, 'checkArrowPush'),$b(this, 'checkInactive')];
         var lsb_i= int(this.overrides.length - 1);
         var count: number = int(0);
         if(lsb_i < 0)
         {
            while(count < interactionsArray.length)
            {
               interactionsArray[count](blockSideSetting,side);
               count++;
            }
            return;
         }
         do
         {
            if(!Boolean(parseInt(this.overrides.charAt(lsb_i))))
            {
               interactionsArray[count](blockSideSetting,side);
            }
            count++;
         }
         while(lsb_i-- > 0 && count < interactionsArray.length);
         if(count + 1 < interactionsArray.length)
         {
            while(count < interactionsArray.length)
            {
               interactionsArray[count](blockSideSetting,side);
               count++;
            }
         }
      }
  checkExplode(blockSideSetting: any, side: string): void {
         if(blockSideSetting == BlockSideSettings.EXPLODE)
         {
            if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
            {
               GamePage.instance.localExplodeBlock(this.runningOn,{
                  "source":this,
                  "side":side
               });
            }
            else
            {
               GamePage.instance.explodeBlock(this.runningOn,{
                  "source":this,
                  "side":side
               });
            }
         }
      }
  checkVanish(blockSideSetting: any, side: string): void {
         if(blockSideSetting == BlockSideSettings.VANISH)
         {
            if(this.runningOn.timeTillVanish <= 0)
            {
               this.runningOn.startFadeOut();
            }
            else if(this.runningOn.timeTillVanishTimeout == 0)
            {
               this.runningOn.timeTillVanishTimeout = uint(setTimeout($b(this.runningOn, 'startFadeOut'),this.runningOn.timeTillVanish));
            }
         }
      }
  checkShatters(blockSideSetting: any, side: string): void {
         if((blockSideSetting == BlockSideSettings.SHATTER || blockSideSetting == BlockSideSettings.CRUMBLE || blockSideSetting == BlockSideSettings.GLASS || this.runningOn.vars.type == BlockSettings.WEAK) && (this.runningOn.vars.type != BlockSettings.WEAK || this.runningOn.vars.type == BlockSettings.WEAK && blockSideSetting != BlockSideSettings.REFLECT))
         {
            if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
            {
               GamePage.instance.localShatterBlock(this.runningOn,{
                  "source":this,
                  "side":side
               });
            }
            else
            {
               GamePage.instance.shatterBlock(this.runningOn,{
                  "source":this,
                  "side":side
               });
            }
         }
      }
  checkArrowPush(blockSideSetting: any, side: string): void {
         var pushDirs: any[]= null;
         var i: number = int(0);
         var pushDir: string= null;
         var pushPower: number= NaN;
         if(blockSideSetting == BlockSideSettings.PUSH_UP || blockSideSetting == BlockSideSettings.PUSH_DOWN || blockSideSetting == BlockSideSettings.PUSH_LEFT || blockSideSetting == BlockSideSettings.PUSH_RIGHT)
         {
            pushDirs = new Array("pushUp","pushRight","pushDown","pushLeft");
            i = int(pushDirs.indexOf(blockSideSetting));
            i = int(int(this.adjustIndexByRotation(i,-this.rotation)));
            pushDir = pushDirs[i];
            pushPower = this.runningOn.arrowPower * 2;
            if(pushDir == "pushUp")
            {
               this.runningOn.activateArrow(0);
               if(this.runningSide == BuzzsawEffect.SIDE_UP)
               {
                  this.detach();
                  this.velY = -this.sawSpeed * pushPower / 2;
               }
               else if(this.runningSide % 2 == 0)
               {
                  this.velY = this.velY > 0 ? this.sawSpeed / pushPower : -this.sawSpeed * pushPower;
               }
            }
            else if(pushDir == "pushDown")
            {
               this.runningOn.activateArrow(180);
               if(this.runningSide == BuzzsawEffect.SIDE_DOWN)
               {
                  this.detach();
                  this.velY = this.sawSpeed * pushPower / 2;
               }
               else if(this.runningSide % 2 == 0)
               {
                  this.velY = this.velY > 0 ? this.sawSpeed * pushPower : -this.sawSpeed / pushPower;
               }
            }
            else if(pushDir == "pushLeft")
            {
               this.runningOn.activateArrow(-90);
               if(this.runningSide == BuzzsawEffect.SIDE_LEFT)
               {
                  this.detach();
                  this.velX = -this.sawSpeed * pushPower / 2;
               }
               else if(this.runningSide % 2 == 1)
               {
                  this.velX = this.velX > 0 ? this.sawSpeed / pushPower : -this.sawSpeed * pushPower;
               }
            }
            else if(pushDir == "pushRight")
            {
               this.runningOn.activateArrow(90);
               if(this.runningSide == BuzzsawEffect.SIDE_RIGHT)
               {
                  this.detach();
                  this.velX = this.sawSpeed * pushPower / 2;
               }
               else if(this.runningSide % 2 == 1)
               {
                  this.velX = this.velX > 0 ? this.sawSpeed * pushPower : -this.sawSpeed / pushPower;
               }
            }
         }
      }
  checkInactive(blockSideSetting: any, side: string): void {
         if(blockSideSetting == BlockSideSettings.INACTIVE)
         {
            this.detach();
         }
      }
  isPointBlank(): boolean {
         return this.pointBlank;
      }
  hitInactiveSides(): boolean {
         return this.overrides.length >= 5 && Boolean(parseInt(this.overrides.charAt(this.overrides.length - 5)));
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
  adjustIndexByRotation(index: number, rotation: number): number {
    index = int(index);
         var rotationFloor= rotation / 90;
         if(rotationFloor < 0)
         {
            rotationFloor = 4 + rotationFloor;
         }
         index = int(index + (rotationFloor));
         return int(index % 4);
      }
  initTest(): void {
         this.testPoint(this.x,this.y);
      }
  isBetween(a: Point, b: Point, c: Point): boolean {
         var tolerance: number= 0.5;
         var radianAngle: number= Math.atan2(c.y - b.y,c.x - b.x) - Math.atan2(a.y - b.y,a.x - b.x);
         var degreeAngle: number= radianAngle * 180 / Math.PI;
         return Math.abs(180 - degreeAngle) <= tolerance;
      }
  constructor(fromPlayer: ActivePlayer, damage: number, duration: number, horizontalForce: number, verticalForce: number, gravity: number, postgravity: number, overrides: string) {
         super(fromPlayer,damage);
    damage = int(damage);
         this.m = new BuzzsawEffectGraphic();
         this.direction = int(fromPlayer.lastDirection == "right" ? 1 : -1);
         this.m.scaleX *= 0.4;
         this.m.scaleY *= 0.4;

         this.throwForce = int(horizontalForce);
         this.gravity = gravity;
         this.postgravity = postgravity;
         this.overrides = overrides;
         this.life = int(duration);
         this.rotationAtUse = Math.round(Number(this.rotation / 90)) * 90;
         this.rotation = 0;
         var rotatedVel: any= this.rotateVelocity(this.throwForce * this.scaleX,verticalForce,this.rotationAtUse);
         this.velX = rotatedVel._xVel;
         this.velY = rotatedVel._yVel;
         this.collideWithBlocks = false;
         this.ignoreHitBlock = true;
         this.useNewCollision = true;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.BuzzsawEffect', BuzzsawEffect);
