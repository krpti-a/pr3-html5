// Ported from com/jiggmin/pr3/player/ActivePlayer.as
import { BitmapFilter, BitmapFilterQuality, BlurFilter, ColorMatrixFilter, ColorTransform, DisplayObject, Event, Point, clearTimeout, getTimer, setTimeout, trace } from '../../../flash/index.ts';
import { int, uint, $Array, $each, $b } from '../../../flash/as3.ts';
import { Player } from './Player.ts';
import { AlienEffect, Block, BlockMapLayer, BlockSettings, BlockSideSettings, BumpSound, CoinEffect, Color, Data, EasyProgressBar, EffectMapLayer, EnterWaterSound, ExitWaterSound, GamePage, Items, JumpSound, LevelEditorPage, LevelPage, LocalPlayer, MapManager, MatchPage, Maths, PM_PRNG, PartDescriptions, PlayerHitAreaGraphic, PlayerLuaWrapper, PoofEffectGraphic, Settings, Sounds, SproingSound, SuperJumpSound, TeleportEffect, TeleportSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ActivePlayer extends Player {
  static CHARGE_SJ_THRESHOLD: any = 0.1;
  hitWidth: number = 10;
  snailFriend: boolean = false;
  declare lastBumpBlock: Block;
  topHat: boolean = false;
  itemAccelBoost: number = 1;
  maxSuperJumpVel: number = 0.61;
  useShiftedVel: boolean = true;
  santaHat: boolean = false;
  teleportEffectCooldown: number = 0;
  onIce: boolean = false;
  declare vars: any;
  itemVelBoost: number = 1;
  declare elapsedArray: any[];
  chargingJump: boolean = false;
  medicalHat: boolean = false;
  boneChillingHat: boolean = false;
  defaultGravity: number = 0.0005;
  gravity: number = 0.0005;
  velX: number = 0;
  velY: number = 0;
  rotating: boolean = false;
  rotatedVelX: number = 0;
  rotatedVelY: number = 0;
  prankHat: boolean = false;
  crownHat: boolean = false;
  hurtTimer: number = 0;
  lastDirection: string = "";
  declare lifeBar: EasyProgressBar;
  realX: number = 0;
  realY: number = 0;
  sharkHat: boolean = false;
  windMoveX: number = 0;
  windMoveY: number = 0;
  pirateHat: boolean = false;
  lastTime: number = NaN;
  shiftedMoveX: number = NaN;
  shiftedMoveY: number = NaN;
  propellerHat: boolean = false;
  declare blockMap: BlockMapLayer;
  accelHat: boolean = false;
  superJumpVel: number = 0;
  speedBurstSpeedBoost: number = 0;
  arrowMaxSpeedBoost: number = 0;
  hitHeight: number = 60;
  shiftedVelY: number = 0;
  gallonHat: boolean = false;
  shiftedVelX: number = 0;
  jumpHat: boolean = false;
  moveX: number = 0;
  moveY: number = 0;
  touchingGround: boolean = false;
  happyHat: boolean = false;
  multiplierY: number = 1;
  remainingJumpVel: number = 0;
  multiplierX: number = 1;
  rockHat: boolean = false;
  rotatedMoveX: number = NaN;
  rotatedMoveY: number = NaN;
  parasolHat: boolean = false;
  maxMovePerFrame: number = 39;
  maxPropellerSuperJumpVel: number = 0.67;
  recoveryTimer: number = 0;
  declare lastStandBlock: Block;
  speedHat: boolean = false;
  partyHat: boolean = false;
  shiftedX: number = 0;
  chargingSuperJump: boolean = false;
  bullHat: boolean = false;
  rubberHat: boolean = false;
  bullCharge: number = 1;
  policeHat: boolean = false;
  ushankaHat: boolean = false;
  toqueHat: boolean = false;
  fezHat: boolean = false;
  witchHat: boolean = false;
  haloHat: boolean = false;
  bunnyHat: boolean = false;
  gaveWing: boolean = false;
  declare hitGraphic: any;
  swimming: boolean = false;
  shiftedY: number = 0;
  maxVelY: number = 1;
  attemptingBump: boolean = false;
  maxVelX: number = 1;
  beretHat: boolean = false;
  tinfoilHat: boolean = false;
  tinfoilHatCheck: boolean = false;
  glueHat: boolean = false;
  glueProcced: number = 0;
  trafficConeHat: boolean = false;
  trafficBlockDelay: number = 150;
  magnetHelmet: boolean = false;
  magnetHeld: number = 0;
  parasolHeld: number = 0;
  petSquid: boolean = false;
  camoCap: boolean = false;
  camoAlpha: number = 1;
  rocketHat: boolean = false;
  fanHat: boolean = false;
  spookyHat: boolean = false;
  natureHat: boolean = false;
  hyperjumpHat: boolean = false;
  bananaHat: boolean = false;
  crouching: boolean = false;
  stillHoldingUp: boolean = false;
  usedBunnyJump: boolean = false;
  friction: number = 0.009;
  itemjumpBooxt: number = 1;
  chilled: boolean = false;
  blurAmount: number = 0;
  hitBySnowball: boolean = false;
  tempRecoverySpeed: number = 2000;
  playerMetadata: any = ({} as any);
  painted: boolean = false;
  appliedPaintDebuff: boolean = false;
  rotationAmplifier: number = 1;
  swimmingAmplifier: number = 1;
  cameraStiffness: number = 0.25;
  minimapVision: boolean = true;
  teleStealth: boolean = false;
  haloTimer: number = 0;
  ushankaTimer: number = 0;
  freezeImmunityTimer: number = 300;
  typing: boolean = false;
  declare lua: PlayerLuaWrapper;
  superJumpEnabled: boolean = true;
  canWallJump: boolean = false;
  resetWallJumpTimer: number = 0;
  wallJumpingToRight: boolean = false;
  wallJumpsLeft: number = 0;
  personalAlien: AlienEffect = null;
  jumpedTime: number = 0;
  photoBoosts: number = 0;
  photoTimer: number = 0;
  photoNeeded: number = 300;
  photoEffectTimer: number = 0;
  accelHatTimer: number = 0;
  nitroJumpUsed: boolean = false;
  alphaMultiplier: number = 1;
  luaTintTimer: number = 0;
  luaTintR: number = 1;
  luaTintG: number = 1;
  luaTintB: number = 1;
  nextItem: number = 0;
  tintTimer: number = NaN;
  declare tintColor: ColorTransform;
  declare playerFilters: any[];
  _playerFPS: number = 0;
  stickyHats: boolean = false;
  bananaTimer: number = 0;
  finished: boolean = false;
  createLuaPlayer(): PlayerLuaWrapper {
         return new PlayerLuaWrapper(this);
      }
  get playerFPS(): number {
         return this._playerFPS || Settings.gameFPS;
      }
  set playerFPS(value: number) {
    value = int(value);
         this._playerFPS = int(Math.max(value,0));
      }
  init(): void {
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.lastTime = getTimer();
         this.gravity = this.defaultGravity * GamePage.instance.gravity;
         this.blockMap = MapManager.map.blockMap;
         if(this.followPlayer)
         {
            this.centerCamera();
         }
      }
  touchingPoint(param1: number, param2: number): boolean {
         if(this.hitGraphic != null && this.hitGraphic.hitTestPoint(param1,param2,false))
         {
            return true;
         }
         return false;
      }
  touchingObject(object: DisplayObject): boolean {
         if(this.hitGraphic != null && this.hitGraphic.hitTestObject(object))
         {
            return true;
         }
         return false;
      }
  setVariable(variableToSet: string, setAs: any): void {
         var itemSettings= undefined;
         this.vars[variableToSet] = setAs;
         if(variableToSet == "space")
         {
            if(this.itemClass != null)
            {
               this.itemClass.setSpace(setAs);
            }
         }
         if(variableToSet == "life")
         {
            if(this.lifeBar != null)
            {
               this.lifeBar.percent = setAs;
            }
         }
         if(variableToSet == "item")
         {
            itemSettings = setAs.split("|");
            this.setItem(itemSettings[0],itemSettings);
         }
         if(variableToSet == "rot")
         {
            this.rotating = true;
            this.vars.rot %= 360;
         }
         if(variableToSet == "hurt")
         {
            if(setAs == true)
            {
               this.endIce();
               if(this.haloHat && this.haloTimer < 150)
               {
                  this.setVariable("item",Items.NONE);
               }
               clearTimeout($b(this, 'endIce'));
               Sounds.startGameSound(new BumpSound(),this,0.5);
               if(this.medicalHat == true || this.hitBySnowball)
               {
                  if(this.medicalHat == true && this.hitBySnowball)
                  {
                     this.setRecoveryTimer(Math.ceil(this.tempRecoverySpeed / 2),Math.ceil(this.tempRecoverySpeed / 4));
                     this.hitBySnowball = false;
                     this.tempRecoverySpeed = int(2000);
                  }
                  else
                  {
                     this.setRecoveryTimer(this.tempRecoverySpeed,Math.ceil(this.tempRecoverySpeed / 2));
                     this.hitBySnowball = false;
                     this.tempRecoverySpeed = int(2000);
                  }
               }
               else
               {
                  this.setRecoveryTimer();
               }
            }
         }
      }
  doesDamage(damageDealt: number): void {
      }
  checkForDamage(fromPlayer: ActivePlayer, damageDealt: number, sapAmount: number, makeCold: boolean = false): void {
         var _loc_3= undefined;
         if(this.recoveryTimer <= 0)
         {
            _loc_3 = null;
            for (_loc_3 of $each(GamePage.instance.playerArray))
            {
               if(fromPlayer != null && _loc_3 == fromPlayer)
               {
                  fromPlayer.increaseDashScore(damageDealt);
                  if(fromPlayer.lifeBar != null)
                  {
                     fromPlayer.setVariable("life",Maths.limit(fromPlayer.lifeBar.percent + sapAmount,0,fromPlayer.lifeBar.maxPercent));
                  }
                  if(makeCold && this.ushankaTimer < 0)
                  {
                     this.chilled = true;
                     if(fromPlayer.toqueHat)
                     {
                        if(this.freezeImmunityTimer > 300)
                        {
                           this.blurAmount = 5;
                           this.freezeImmunityTimer = int(0);
                        }
                     }
                     else
                     {
                        this.blurAmount = 6;
                     }
                  }
               }
            }
         }
      }
  chargeSuperJump(stepTimeMS: number): void {
         var maxThreshold: number= this.maxSuperJumpVel;
         if(this.propellerHat)
         {
            maxThreshold = this.maxPropellerSuperJumpVel;
         }
         var superJumpMultiplier= this.jumpHat ? 2 : 1;
         this.superJumpVel += 0.000303 * superJumpMultiplier * stepTimeMS;
         if(this.superJumpVel > ActivePlayer.CHARGE_SJ_THRESHOLD)
         {
            this.chargingSuperJump = true;
            this.bullCharge = 1;
            if(this.hyperjumpHat && !this.nitroJumpUsed)
            {
               this.superJumpVel = 0.8113;
               this.nitroJumpUsed = true;
            }
         }
         if(this.superJumpVel > maxThreshold)
         {
            this.superJumpVel = maxThreshold;
            if(this.hyperjumpHat)
            {
               this.superJumpVel = 3;
            }
         }
      }
  determineState(stepTimeMS: number): void {
         var blurrer= undefined;
         var blurFilter: BitmapFilter= null;
         var matrix: any[]= null;
         var colorFilter: ColorMatrixFilter= null;
         var _loc_1= NaN;
         var _loc_2= NaN;
         var _loc_3= 0;
         var _loc_4= NaN;
         if(this.painted)
         {
            if(!this.appliedPaintDebuff)
            {
               this.appliedPaintDebuff = true;
               this.vars.velLevel = Maths.limit(this.vars.velLevel - 15,0,this.vars.maxStat);
               this.vars.accelLevel = Maths.limit(this.vars.accelLevel - 15,0,this.vars.maxStat);
               this.vars.jumpLevel = Maths.limit(this.vars.jumpLevel - 15,0,this.vars.maxStat);
            }
         }
         else if(this.appliedPaintDebuff)
         {
            this.appliedPaintDebuff = false;
            this.vars.velLevel = Maths.limit(this.vars.velLevel + 15,0,this.vars.maxStat);
            this.vars.accelLevel = Maths.limit(this.vars.accelLevel + 15,0,this.vars.maxStat);
            this.vars.jumpLevel = Maths.limit(this.vars.jumpLevel + 15,0,this.vars.maxStat);
         }
         if(this.recoveryTimer > 0)
         {
            _loc_1 = this.recoveryTimer % 200;
            if(_loc_1 >= 100)
            {
               this.alpha = 0.25;
            }
            else
            {
               this.alpha = 0.5;
            }
         }
         else
         {
            if(this.camoCap)
            {
               if(this.velX == 0 && this.velY > -0.02 * this.gravity * 2000 && this.velY < 0.02 * this.gravity * 2000)
               {
                  if(this.camoAlpha > 0)
                  {
                     this.camoAlpha -= 0.025;
                     if(this.camoAlpha <= 0.08 && !this.minimapVision)
                     {
                        this.camoAlpha = 0.08;
                     }
                  }
                  this.alpha = this.camoAlpha;
               }
               else
               {
                  this.camoAlpha = 1;
                  this.alpha = 1;
               }
            }
            else
            {
               this.alpha = 1;
            }
            this.alpha *= this.alphaMultiplier;
         }
         ++this.haloTimer;
         ++this.freezeImmunityTimer;
         if(this.ushankaHat)
         {
            this.ushankaTimer = int(75);
         }
         --this.ushankaTimer;
         if(this.bananaHat)
         {
            this.bananaTimer = int(125);
         }
         --this.bananaTimer;
         if(this.natureHat)
         {
            ++this.photoTimer;
            if(this.photoTimer >= this.photoNeeded)
            {
               this.photoTimer = int(0);
               ++this.photoBoosts;
               this.photoNeeded = int(this.photoNeeded + (90));
               this.photoEffectTimer = int(15);
            }
         }
         if(this.photoEffectTimer > 0)
         {
            --this.photoEffectTimer;
            blurrer = this.photoEffectTimer / 10;
            blurFilter = new BlurFilter(blurrer,blurrer / 2,BitmapFilterQuality.HIGH);
            matrix = new Array();
            matrix = matrix.concat([(blurrer * -1 + 5) / 5,0,blurrer * 0,0,0]);
            matrix = matrix.concat([0,(blurrer * -1 + 5) / 5,blurrer * 2,0,0]);
            matrix = matrix.concat([blurrer / 2,blurrer * 0,1,0,0]);
            matrix = matrix.concat([0,0,0,1,0]);
            colorFilter = new ColorMatrixFilter(matrix);
            this.playerFilters.push(blurFilter);
            this.playerFilters.push(colorFilter);
         }
         if(this.luaTintTimer > 0)
         {
            --this.luaTintTimer;
            blurrer = this.luaTintTimer / 10;
            matrix = new Array();
            matrix = matrix.concat([1 + blurrer * this.luaTintR,blurrer * this.luaTintR,blurrer * this.luaTintR,0,0]);
            matrix = matrix.concat([blurrer * this.luaTintG,1 + blurrer * this.luaTintG,blurrer * this.luaTintG,0,0]);
            matrix = matrix.concat([blurrer * this.luaTintB,blurrer * this.luaTintB,1 + blurrer * this.luaTintB,0,0]);
            matrix = matrix.concat([0,0,0,1,0]);
            colorFilter = new ColorMatrixFilter(matrix);
            this.playerFilters.push(colorFilter);
         }
         if(this.vars.up)
         {
            ++this.jumpedTime;
         }
         else
         {
            this.jumpedTime = int(0);
         }
         if(this.typing)
         {
            this.typingEffect = true;
         }
         else
         {
            this.typingEffect = false;
         }
         if(Boolean(this.vars.hurt) || this.iced)
         {
            if(this.vars.hurt)
            {
               if(this.hurtTimer > 495)
               {
                  this.setState("hurt");
               }
               else
               {
                  this.setState("recover");
               }
            }
            else if(this.iced)
            {
               this.setState("stand");
            }
         }
         else
         {
            if(!this.touchingGround)
            {
               if(!this.fanHat)
               {
                  this.superJumpVel = 0;
               }
               if(this.fanHat && this.superJumpVel > ActivePlayer.CHARGE_SJ_THRESHOLD)
               {
                  this.setState("chargeJump");
                  this.chargeSuperJump(stepTimeMS);
               }
               else if(this.swimming || this.gallonHat)
               {
                  this.setState("swim");
               }
               else
               {
                  this.setState("jump");
               }
               ++this.accelHatTimer;
            }
            else if(this.chargingSuperJump)
            {
               this.setState("chargeJump");
            }
            else if(Boolean(this.vars.left) || Boolean(this.vars.right))
            {
               if(this.crouching)
               {
                  this.setState("crawl");
               }
               else
               {
                  this.setState("run");
               }
            }
            else if(this.crouching)
            {
               this.setState("crouch");
            }
            else
            {
               this.setState("stand");
            }
            if(this.gallonHat && this.touchingGround == false)
            {
               this.setState("swim");
            }
            this.m.scaleY = 1;
            if(this.state == "chargeJump")
            {
               _loc_2 = this.superJumpVel / this.maxSuperJumpVel;
               _loc_3 = Math.ceil(_loc_2 * 100);
               if(_loc_3 == 100)
               {
                  if(this.m.currentFrame < _loc_3)
                  {
                     this.m.gotoAndPlay(_loc_3);
                  }
               }
               else
               {
                  this.m.gotoAndStop(_loc_3);
               }
               _loc_4 = _loc_3 / 2;
               this.m.scaleY = (Math.random() * _loc_4 + (100 - _loc_4 / 2)) / 100;
            }
         }
      }
  enterFrameHandler(event: Event): void {
         var currentTime= getTimer();
         var timeElapsed= currentTime - this.lastTime;
         var stepTimeMS= 1000 / this.playerFPS;
         if(timeElapsed > stepTimeMS)
         {
            while(timeElapsed >= stepTimeMS)
            {
               timeElapsed -= stepTimeMS;
               this.lastTime += stepTimeMS;
               this.step(stepTimeMS);
            }
         }
         else if(timeElapsed > 10)
         {
            this.step(timeElapsed);
            this.lastTime += timeElapsed;
         }
      }
  fadeOut(event: Event): void {
         this.alpha -= 0.04;
         if(this.alpha <= 0)
         {
            this.remove();
         }
      }
  positionLifeBar(): void {
         if(this.lifeBar != null)
         {
            this.lifeBar.x = -this.lifeBar.width / 2;
            this.lifeBar.y = 12;
         }
      }
  showPoofEffect(param1: boolean = false): void {
         var _loc_2= null;
         if(this.teleportEffectCooldown <= 0 || param1)
         {
            _loc_2 = new PoofEffectGraphic();
            _loc_2.x = this.x;
            _loc_2.y = this.y;
            _loc_2.rotation = this.rotation;
            EffectMapLayer.addEffect(_loc_2);
            Sounds.startGameSound(new TeleportSound(),this,2);
         }
      }
  setRealY(param1: number): void {
         this.realY = param1;
         this.y = param1;
         this.updatePersonalAlien();
      }
  setRealX(param1: number): void {
         this.realX = param1;
         this.x = param1;
         this.updatePersonalAlien();
      }
  beginFadeOut(): void {
         this.finished = true;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'),false,0,true);
      }
  rotateSide(param1: string): string {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= 0;
         if(param1 == "bump")
         {
            _loc_2 = param1;
         }
         else
         {
            _loc_3 = new Array("top","right","bottom","left");
            _loc_4 = _loc_3.indexOf(param1);
            _loc_4 = this.adjustIndexByRotation(_loc_4,this.rotation);
            _loc_2 = _loc_3[_loc_4];
         }
         return _loc_2;
      }
  setStats(param1: number, param2: number, param3: number): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         this.vars.velLevel = param1;
         this.vars.accelLevel = param2;
         this.vars.jumpLevel = param3;
      }
  setAppearance(param1: number, param2: number, param3: number, param4: number, param5: number, param6: number, param7: number, param8: number): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5); param6 = int(param6); param7 = int(param7); param8 = int(param8);
         super.setAppearance(param1,param2,param3,param4,param5,param6,param7,param8);
         if(param1 == PartDescriptions.PRANK_HAT)
         {
            this.snailFriend = GamePage.instance.levelType != LevelPage.KING_OF_HAT;
         }
      }
  canPass(param1: Block, param2: string): boolean {
         if(param1 == null || !this.blockSideIsActive(param1,param2))
         {
            return true;
         }
         return false;
      }
  getBlockBoundry(param1: Block, param2: string): number {
         var _loc_3= 0;
         var _loc_4= null;
         var _loc_5= 0;
         if(param1 != null)
         {
            _loc_4 = new Array(param1.posY,param1.posX + Block.width,param1.posY + Block.height,param1.posX);
            if(param2 == "top")
            {
               _loc_3 = 0;
            }
            else if(param2 == "right")
            {
               _loc_3 = 1;
            }
            else if(param2 == "bottom")
            {
               _loc_3 = 2;
            }
            else if(param2 == "left")
            {
               _loc_3 = 3;
            }
            _loc_3 = this.adjustIndexByRotation(_loc_3,this.rotation);
            return _loc_4[_loc_3];
         }
         return 1234567;
      }
  remove(): void {
         this.finished = true;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'));
         this.setItem(Items.NONE);
         if(this.hitGraphic != null)
         {
            this.removeChild(this.hitGraphic);
            this.hitGraphic = null;
         }
         if(this.personalAlien != null)
         {
            this.personalAlien.remove();
            this.personalAlien = null;
         }
         this.lastStandBlock = null;
         this.lastBumpBlock = null;
         this.blockMap = null;
         super.remove();
      }
  touchBlock(touchedBlock: Block, param2: string, timePast: number): void {
    var magnetPower, _loc_22, _loc_23, _loc_24, _loc_25; // undeclared in decompiled source
         var indexOfBeret: number = int(0);
         var beretColor: number = uint(0);
         var _loc_3= this.rotateSide(param2);
         var _loc_4= touchedBlock.vars;
         var _loc_5= _loc_4[_loc_3];
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= null;
         var _loc_9= NaN;
         var _loc_10= NaN;
         var _loc_11= NaN;
         var _loc_12= NaN;
         var _loc_13= NaN;
         if(param2 == "right" || param2 == "left")
         {
            this.bullCharge = 1;
            if(this.glueHat)
            {
               this.canWallJump = true;
            }
            if(param2 == "left")
            {
               this.wallJumpingToRight = false;
            }
            else
            {
               this.wallJumpingToRight = true;
            }
            this.resetWallJumpTimer = int(2);
         }
         if(param2 == "top" && this.santaHat && this.lastStandBlock != touchedBlock)
         {
            touchedBlock.freeze();
            this.lastStandBlock = touchedBlock;
         }
         if(this.beretHat && this.lastStandBlock != touchedBlock && _loc_5.type != BlockSideSettings.VANISH)
         {
            this.painted = false;
            indexOfBeret = int(this.hatArray.indexOf(PartDescriptions.BERET));
            beretColor = uint(uint(this.hatColorArray[indexOfBeret]));
            touchedBlock.paint(beretColor);
            this.lastStandBlock = touchedBlock;
         }
         else if(!this.beretHat)
         {
            if(touchedBlock.painted)
            {
               this.painted = true;
            }
            else
            {
               this.painted = false;
            }
         }
         if(this.magnetHelmet)
         {
            if(param2 == "bump" && this.getVars().up && this.magnetHeld < 150 && !this.crouching)
            {
               ++this.magnetHeld;
               magnetPower = 0.25 + this.vars.jumpLevel * 0.00185;
               magnetPower += this.photoBoosts;
               if(this.prankHat && !this.snailFriend)
               {
                  magnetPower *= 0.5;
               }
               if(this.happyHat)
               {
                  magnetPower += 3;
               }
               if(this.jumpHat)
               {
                  magnetPower += 5;
               }
               if(this.bunnyHat)
               {
                  magnetPower += 5;
                  magnetPower *= 0.6;
               }
               if(this.rotation == 180 || this.rotation == -180 || this.rotation == 90)
               {
                  if(this.shiftedVelY < magnetPower)
                  {
                     this.shiftedVelY = magnetPower;
                  }
               }
               else if(this.shiftedVelY > -magnetPower)
               {
                  this.shiftedVelY = -magnetPower;
               }
            }
         }
         if(_loc_5.type == BlockSideSettings.PUSH_UP || _loc_5.type == BlockSideSettings.PUSH_DOWN || _loc_5.type == BlockSideSettings.PUSH_LEFT || _loc_5.type == BlockSideSettings.PUSH_RIGHT)
         {
            this.blockTests(touchedBlock,param2);
            _loc_6 = new Array("pushUp","pushRight","pushDown","pushLeft");
            _loc_7 = _loc_6.indexOf(_loc_5.type);
            _loc_7 = this.adjustIndexByRotation(_loc_7,-this.rotation);
            _loc_8 = _loc_6[_loc_7];
            if(_loc_8 == "pushUp")
            {
               if(param2 == "top")
               {
                  this.shiftedVelY -= 0.3 * this.multiplierY * touchedBlock.arrowPower;
               }
               else if(param2 == "bottom")
               {
                  if(!this.vars.down)
                  {
                     this.shiftedVelY = -0.35 * this.multiplierY * touchedBlock.arrowPower;
                  }
               }
               else
               {
                  this.shiftedVelY -= 0.04 * this.multiplierY * touchedBlock.arrowPower;
               }
               touchedBlock.activateArrow(0 + this.rotation);
            }
            else if(_loc_8 == "pushDown")
            {
               this.shiftedVelY += 0.1 * this.multiplierY * touchedBlock.arrowPower;
               touchedBlock.activateArrow(180 + this.rotation);
            }
            else if(_loc_8 == "pushLeft")
            {
               this.shiftedVelX -= 0.075 * this.multiplierX * touchedBlock.arrowPower;
               touchedBlock.activateArrow(-90 + this.rotation);
               this.arrowMaxSpeedBoost = 0.5;
            }
            else if(_loc_8 == "pushRight")
            {
               this.shiftedVelX += 0.075 * this.multiplierX * touchedBlock.arrowPower;
               touchedBlock.activateArrow(90 + this.rotation);
               this.arrowMaxSpeedBoost = 0.5;
            }
         }
         else if(_loc_5.type == BlockSideSettings.BOUNCE)
         {
            _loc_9 = 0;
            _loc_10 = 0;
            if(param2 == "left" || param2 == "right")
            {
               _loc_9 = this.shiftedVelX * -1 * touchedBlock.bounciness;
            }
            else
            {
               _loc_10 = this.shiftedVelY * -1 * touchedBlock.bounciness;
            }
            this.blockTests(touchedBlock,param2);
            this.shiftedVelX += _loc_9;
            this.shiftedVelY += _loc_10;
            _loc_11 = Maths.pythag(_loc_9,_loc_10) * 2.25;
            _loc_11 = Maths.limit(_loc_11,0,1.25);
            Sounds.startGameSound(new SproingSound(),this,_loc_11);
         }
         else if(_loc_5.type == BlockSideSettings.CRUMBLE || touchedBlock.vars.type == BlockSettings.WEAK)
         {
            if(param2 == "top" || param2 == "bottom" || param2 == "bump")
            {
               _loc_12 = Math.abs(this.velY * 0.75);
               this.shiftedVelY *= 0.5;
            }
            else
            {
               _loc_12 = Math.abs(this.velX);
               this.shiftedVelX *= 0.5;
            }
            if(_loc_12 > 0.07)
            {
               _loc_13 = _loc_12 * 100;
               touchedBlock.health = int(touchedBlock.health - (_loc_13));
               if(touchedBlock.health > 0)
               {
                  while(_loc_13 > 0)
                  {
                     _loc_13 -= 3;
                     GamePage.instance.createBlockParticle(touchedBlock,Math.floor(Math.random() * Block.width),Math.floor(Math.random() * Block.height),10,10);
                  }
               }
            }
            if(touchedBlock.health <= 0 && this instanceof LocalPlayer)
            {
               GamePage.instance.localShatterBlock(touchedBlock,{
                  "source":this,
                  "side":param2
               });
            }
            else
            {
               this.blockTests(touchedBlock,param2);
            }
         }
         else if(_loc_5.type == BlockSideSettings.VANISH)
         {
            this.blockTests(touchedBlock,param2);
            if(touchedBlock.timeTillVanish <= 0)
            {
               touchedBlock.startFadeOut();
            }
            else if(touchedBlock.timeTillVanishTimeout == 0)
            {
               touchedBlock.timeTillVanishTimeout = uint(setTimeout($b(touchedBlock, 'startFadeOut'),touchedBlock.timeTillVanish));
            }
         }
         else if(_loc_5.type == BlockSideSettings.BUTTON)
         {
            this.blockTests(touchedBlock,param2);
            GamePage.instance.buttonsPressed[GamePage.instance.buttonsPressed.length] = touchedBlock.id;
         }
         else if(_loc_5.type == BlockSideSettings.ICE)
         {
            this.onIce = true;
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.BE_PUSHED)
         {
            this.blockTests(touchedBlock,param2);
            touchedBlock.move(_loc_3);
         }
         else if(_loc_5.type == BlockSideSettings.INC_STATS)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.DEC_STATS)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.INC_HEALTH)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.DISPENSE)
         {
            if(touchedBlock.statSupply > 0)
            {
               if(GamePage.instance.levelType == "coinFiend")
               {
                  _loc_22 = new PM_PRNG(Math.abs(touchedBlock.posX + touchedBlock.posY));
                  _loc_23 = _loc_22.nextDoubleRange(-5,5);
                  _loc_24 = 0;
                  while(_loc_24 < touchedBlock.vars.dispenseCoins)
                  {
                     _loc_25 = new CoinEffect();
                     _loc_25.x = touchedBlock.posX + 15;
                     _loc_25.y = touchedBlock.posY - 25;
                     _loc_25.velX = _loc_22.nextDoubleRange(-5,5);
                     _loc_25.velY = _loc_22.nextDoubleRange(-5,0);
                     ++_loc_24;
                  }
               }
            }
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.REFLECT)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.GLASS)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.GIVE_ITEM)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.TELEPORT)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.ROTATE_RIGHT)
         {
            this.rotationAmplifier = touchedBlock.vars.rotationSpeed;
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.ROTATE_LEFT)
         {
            this.rotationAmplifier = touchedBlock.vars.rotationSpeed;
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.SAFETY)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.SHATTER)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.HURT)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.EXPLODE)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.ACTIVE)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.CHECKPOINT)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.C_STATS)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.C_ITEM)
         {
            this.blockTests(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.CODE)
         {
            this.blockTests(touchedBlock,param2);
            this.handleCodeBlock(touchedBlock,param2);
         }
         else if(_loc_5.type == BlockSideSettings.LUA)
         {
            this.blockTests(touchedBlock,param2);
         }
      }
  handleCodeBlock(param1: Block, param2: string): void {
         var mayRunElse: boolean= false;
         var skipUntilConditional: boolean= false;
         var ifCompleted: boolean= false;
         var skipToEnd: boolean= false;
         var line: string= null;
         var ifIndex: number = int(0);
         var isVariableNew: boolean= false;
         var isVariableOld: boolean= false;
         var decimalIndex: number = int(0);
         var elseIfIndex: number = int(0);
         var elseIndex: number = int(0);
         var variableName: string= null;
         var variableValue: string= null;
         var target: string= null;
         var targetAndVariable= undefined;
         var methodIndex: number = int(0);
         var methodEndIndex= undefined;
         var methodName: string= null;
         var args: string= null;
         var setVariableIndex: number = int(0);
         var variableChar: string= null;
         var type: string= null;
         var result= undefined;
         var i: number = int(0);
         var _loc_3= this.rotateSide(param2);
         var _loc_4= param1.vars;
         var code: string= _loc_4.code[param2];
         if(code != null && code.length > 0)
         {
            try
            {
               mayRunElse = false;
               skipUntilConditional = false;
               ifCompleted = false;
               skipToEnd = false;
               for (line of $each(code.split("\r")))
               {
                  if(param1.removed)
                  {
                     break;
                  }
                  line = line.toLowerCase().replace(/^\s*|\s*$/gim,"");
                  if(line.length > 0)
                  {
                     if(line.indexOf("end") == 0)
                     {
                        skipUntilConditional = false;
                        mayRunElse = false;
                        ifCompleted = false;
                        skipToEnd = false;
                     }
                     else if(!skipToEnd)
                     {
                        ifIndex = int(line.indexOf("if"));
                        if(ifIndex == 0)
                        {
                           if(!this.parseCodeConditional(line,param1))
                           {
                              skipUntilConditional = true;
                              mayRunElse = true;
                           }
                           else
                           {
                              skipUntilConditional = false;
                              mayRunElse = false;
                              ifCompleted = true;
                           }
                        }
                        else if(mayRunElse)
                        {
                           elseIfIndex = int(line.indexOf("else if"));
                           if(elseIfIndex == 0)
                           {
                              if(!this.parseCodeConditional(line,param1))
                              {
                                 skipUntilConditional = true;
                                 mayRunElse = true;
                              }
                              else
                              {
                                 skipUntilConditional = false;
                                 mayRunElse = false;
                                 ifCompleted = true;
                              }
                           }
                           else
                           {
                              elseIndex = int(line.indexOf("else"));
                              if(elseIndex == 0)
                              {
                                 skipUntilConditional = false;
                                 mayRunElse = false;
                                 ifCompleted = true;
                              }
                           }
                        }
                        else
                        {
                           if(ifCompleted)
                           {
                              if(line.indexOf("else if") == 0 || line.indexOf("else") == 0)
                              {
                                 skipToEnd = true;
                              }
                           }
                           if(!skipUntilConditional)
                           {
                              isVariableNew = line.indexOf("new") == 0;
                              isVariableOld = line.indexOf("old") == 0;
                              if(isVariableNew || isVariableOld)
                              {
                                 variableName = line.substr(3,line.lastIndexOf("=") - 3).replace(/^\s*|\s*$/gim,"");
                                 variableValue = line.substr(line.lastIndexOf("=") + 1).replace(/^\s*|\s*$/gim,"");
                                 if(isVariableNew)
                                 {
                                    if(!(variableName in param1.codeVariables))
                                    {
                                       param1.codeVariables[variableName] = this.stringOrNumber(variableValue);
                                    }
                                 }
                                 else if(isVariableOld)
                                 {
                                    if(variableName in param1.codeVariables)
                                    {
                                       param1.codeVariables[variableName] = this.stringOrNumber(variableValue);
                                    }
                                 }
                              }
                              else
                              {
                                 decimalIndex = int(line.indexOf("."));
                                 if(decimalIndex != -1)
                                 {
                                    target = line.substr(0,decimalIndex);
                                    targetAndVariable = line.split(".");
                                    methodIndex = int(line.indexOf("(",decimalIndex));
                                    if(methodIndex != -1)
                                    {
                                       methodEndIndex = line.lastIndexOf(")");
                                       if(methodEndIndex != -1)
                                       {
                                          methodName = line.substr(decimalIndex + 1,methodIndex - decimalIndex - 1).replace(/^\s*|\s*$/gim,"");
                                          args = line.substr(methodIndex + 1,methodEndIndex - methodIndex - 1).replace(/^\s*|\s*$/gim,"");
                                          switch(target)
                                          {
                                             case "this":
                                             case "b":
                                             case "block":
                                                this.parseCodeBlock(line,param1,true);
                                                break;
                                             case "p":
                                             case "player":
                                                switch(methodName)
                                                {
                                                   case "hurt":
                                                      if(this instanceof LocalPlayer)
                                                      {
                                                         if(args.length > 0)
                                                         {
                                                            (this).beHurtByBlock(param1,0.3,int(args));
                                                         }
                                                         else
                                                         {
                                                            (this).beHurtByBlock(param1);
                                                         }
                                                      }
                                                      break;
                                                   default:
                                                      this.parsePlayerMetadata(line);
                                                }
                                          }
                                       }
                                    }
                                    else
                                    {
                                       setVariableIndex = int(line.indexOf("=",decimalIndex));
                                       if(setVariableIndex != -1)
                                       {
                                          variableChar = line.substr(setVariableIndex - 1,1);
                                          type = "s";
                                          if(variableChar == "-")
                                          {
                                             type = "m";
                                          }
                                          else if(variableChar == "+")
                                          {
                                             type = "p";
                                          }
                                          variableName = line.substr(decimalIndex + 1,setVariableIndex - decimalIndex - (type != "s" ? 2 : 1)).replace(/^\s*|\s*$/gim,"");
                                          result = line.substr(setVariableIndex + 1).replace(/^\s*|\s*$/gim,"");
                                          switch(target)
                                          {
                                             case "this":
                                             case "b":
                                             case "block":
                                                switch(type)
                                                {
                                                   case "s":
                                                      switch(variableName)
                                                      {
                                                         case "health":
                                                            param1.health = int(result);
                                                      }
                                                      break;
                                                   case "m":
                                                      switch(variableName)
                                                      {
                                                         case "health":
                                                            param1.health = int(param1.health - (int(result)));
                                                            if(param1.health > 0)
                                                            {
                                                               i = int(int(Maths.limit(int(result),0,100)));
                                                               while(i > 0)
                                                               {
                                                                  GamePage.instance.createBlockParticle(param1,Math.floor(Math.random() * Block.width),Math.floor(Math.random() * Block.height),10,10);
                                                                  i = int(i - (3));
                                                               }
                                                            }
                                                            if(param1.health <= 0 && this instanceof LocalPlayer)
                                                            {
                                                               GamePage.instance.localShatterBlock(param1);
                                                               break;
                                                            }
                                                            this.blockTests(param1,param2);
                                                      }
                                                      break;
                                                   case "p":
                                                      switch(variableName)
                                                      {
                                                         case "health":
                                                            param1.health = int(param1.health + (int(result)));
                                                      }
                                                }
                                                break;
                                             case "p":
                                             case "player":
                                                switch(type)
                                                {
                                                   case "s":
                                                      switch(variableName)
                                                      {
                                                         case "team":
                                                            this.team = result;
                                                            break;
                                                         case "speed":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.velLevel = Number(result);
                                                            }
                                                            break;
                                                         case "jump":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.jumpLevel = Number(result);
                                                            }
                                                            break;
                                                         case "acceleration":
                                                         case "accel":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.accelLevel = Number(result);
                                                            }
                                                            break;
                                                         case "gravity":
                                                         case "grav":
                                                            this.gravity = this.defaultGravity * Number(result);
                                                            break;
                                                         case "health":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("life",Maths.limit(int(result),0,this.lifeBar.maxPercent));
                                                            }
                                                            break;
                                                         case "rotation":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("rot",int(int(result) / 90) * 90);
                                                            }
                                                      }
                                                      break;
                                                   case "m":
                                                      switch(variableName)
                                                      {
                                                         case "speed":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.velLevel -= Number(result);
                                                            }
                                                            break;
                                                         case "jump":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.jumpLevel -= Number(result);
                                                            }
                                                            break;
                                                         case "acceleration":
                                                         case "accel":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.accelLevel -= Number(result);
                                                            }
                                                            break;
                                                         case "gravity":
                                                         case "grav":
                                                            this.gravity -= this.defaultGravity * Number(result);
                                                            break;
                                                         case "health":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("life",Maths.limit(this.vars.life - int(result),0,this.lifeBar.maxPercent));
                                                            }
                                                            break;
                                                         case "rotation":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("rot",this.vars.rot - int(int(result) / 90) * 90);
                                                            }
                                                      }
                                                      break;
                                                   case "p":
                                                      switch(variableName)
                                                      {
                                                         case "speed":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.velLevel += Number(result);
                                                            }
                                                            break;
                                                         case "jump":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.jumpLevel += Number(result);
                                                            }
                                                            break;
                                                         case "acceleration":
                                                         case "accel":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.vars.accelLevel += Number(result);
                                                            }
                                                            break;
                                                         case "gravity":
                                                         case "grav":
                                                            this.gravity += this.defaultGravity * Number(result);
                                                            break;
                                                         case "health":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("life",Maths.limit(this.vars.life + int(result),0,this.lifeBar.maxPercent));
                                                            }
                                                            break;
                                                         case "rotation":
                                                            if(this instanceof LocalPlayer)
                                                            {
                                                               this.setVariable("rot",this.vars.rot + int(int(result) / 90) * 90);
                                                            }
                                                      }
                                                }
                                                break;
                                             case "v":
                                             case "variable":
                                                switch(type)
                                                {
                                                   case "s":
                                                      param1.codeVariables[variableName] = this.stringOrNumber(result);
                                                      break;
                                                   case "m":
                                                      param1.codeVariables[variableName] -= this.stringOrNumber(result);
                                                      break;
                                                   case "p":
                                                      param1.codeVariables[variableName] += this.stringOrNumber(result);
                                                }
                                          }
                                       }
                                    }
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
            catch (e)
            {
               trace(e);
            }
         }
      }
  stringOrNumber(object: string): any {
         var objectNumber: number= Number(object);
         if(!isNaN(objectNumber))
         {
            return objectNumber;
         }
         return object;
      }
  parseCodeMove(args: string, block: Block): boolean {
         var splitdArgs: any[]= args.split(",");
         var i: number = int(0);
         while(i < splitdArgs.length)
         {
            splitdArgs[i] = splitdArgs[i].replace(/^\s*|\s*$/gim,"");
            i++;
         }
         var moveDelay: number = int(100);
         if(splitdArgs.length > 1)
         {
            moveDelay = int(int(splitdArgs[1]));
            if(moveDelay < 100)
            {
               moveDelay = int(100);
            }
         }
         var wasMoved: boolean= false;
         switch(splitdArgs[0])
         {
            case "left":
               wasMoved = block.move("right",moveDelay > 0,moveDelay);
               break;
            case "right":
               wasMoved = block.move("left",moveDelay > 0,moveDelay);
               break;
            case "up":
               wasMoved = block.move("bottom",moveDelay > 0,moveDelay);
               break;
            case "down":
               wasMoved = block.move("top",moveDelay > 0,moveDelay);
               break;
            case "stay":
         }
         if(wasMoved && splitdArgs.length > 2 && splitdArgs[2] == "true")
         {
            if(splitdArgs[0] == "up" || splitdArgs[0] == "down")
            {
               this.shiftedY = this.getBlockBoundry(block,"top") - 0.001 * this.multiplierY;
            }
            else if(splitdArgs[0] == "right")
            {
               this.shiftedX += 40;
            }
            else if(splitdArgs[0] == "left")
            {
               this.shiftedX -= 40;
            }
         }
         return wasMoved;
      }
  parsePlayerMetadata(line: string): string {
         var decimalIndex: number = int(0);
         var target: string= null;
         var methodIndex: number = int(0);
         var methodEndIndex= undefined;
         var methodName: string= null;
         var args: string= null;
         var newLine: string= null;
         decimalIndex = int(line.indexOf("."));
         if(decimalIndex != -1)
         {
            target = line.substr(0,decimalIndex);
            methodIndex = int(line.indexOf("(",decimalIndex));
            if(methodIndex != -1)
            {
               methodEndIndex = line.lastIndexOf(")");
               if(methodEndIndex != -1)
               {
                  methodName = line.substr(decimalIndex + 1,methodIndex - decimalIndex - 1).replace(/^\s*|\s*$/gim,"");
                  args = line.substr(methodIndex + 1,methodEndIndex - methodIndex - 1).replace(/^\s*|\s*$/gim,"");
                  newLine = line.split(methodName)[1];
                  newLine = newLine.substr(newLine.indexOf(")") + 1,newLine.length);
                  decimalIndex = int(newLine.indexOf("."));
                  args = args.split(")")[0];
                  switch(methodName)
                  {
                     case "getmetadata":
                        return this.parseMetadata(args,true);
                     case "setmetadata":
                        this.parseMetadata(args);
                        trace(args);
                  }
               }
            }
         }
         return "";
      }
  parseCodeBlock(line: string, block: Block, original: boolean): boolean {
         var decimalIndex: number = int(0);
         var target: string= null;
         var methodIndex: number = int(0);
         var methodEndIndex= undefined;
         var methodName: string= null;
         var args: string= null;
         var newLine: string= null;
         var blockPosition: Point= null;
         decimalIndex = int(line.indexOf("."));
         if(decimalIndex != -1)
         {
            target = line.substr(0,decimalIndex);
            methodIndex = int(line.indexOf("(",decimalIndex));
            if(methodIndex != -1)
            {
               methodEndIndex = line.lastIndexOf(")");
               if(methodEndIndex != -1)
               {
                  methodName = line.substr(decimalIndex + 1,methodIndex - decimalIndex - 1).replace(/^\s*|\s*$/gim,"");
                  args = line.substr(methodIndex + 1,methodEndIndex - methodIndex - 1).replace(/^\s*|\s*$/gim,"");
                  switch(methodName)
                  {
                     case "move":
                        this.parseCodeMove(args,block);
                        break;
                     case "vanish":
                        if(args.length <= 0)
                        {
                           block.startFadeOut();
                        }
                        else if(block.timeTillVanishTimeout == 0)
                        {
                           block.timeTillVanishTimeout = uint(setTimeout($b(block, 'startFadeOut'),int(args)));
                        }
                        break;
                     case "explode":
                        if(this instanceof LocalPlayer)
                        {
                           if(!this.tempExplodeImmunity)
                           {
                              if(block.vars.type == BlockSettings.IMPERVIOUS)
                              {
                                 this.tempExplodeImmunity = true;
                                 clearTimeout(this.explodeImmunityTimeout);
                                 this.explodeImmunityTimeout = setTimeout($b(this, 'resetExplodeImmunity'),500);
                              }
                              if(original)
                              {
                                 if(args.length > 0)
                                 {
                                    (this).beHurtByBlock(block,0.3,int(args));
                                 }
                                 else
                                 {
                                    (this).beHurtByBlock(block);
                                 }
                              }
                           }
                           GamePage.instance.localExplodeBlock(block);
                        }
                        break;
                     case "crumble":
                     case "break":
                     case "shatter":
                        GamePage.instance.createBlockParticle(block,Math.floor(Math.random() * Block.width),Math.floor(Math.random() * Block.height),10,10);
                        GamePage.instance.localShatterBlock(block);
                     case "stop":
                        block.paused = true;
                        break;
                     case "play":
                        block.paused = false;
                        break;
                     case "getblock":
                        if(original)
                        {
                           newLine = line.split("getblock")[1];
                           newLine = newLine.substr(newLine.indexOf(")") + 1,newLine.length);
                           decimalIndex = int(newLine.indexOf("."));
                           args = args.split(")")[0];
                           blockPosition = this.parseCodeBlockPosition(args,block);
                           if(this.getBlock(block.posX + blockPosition.x * 40,block.posY + blockPosition.y * 40))
                           {
                              this.parseCodeBlock(newLine,this.getBlock(block.posX + blockPosition.x * 40,block.posY + blockPosition.y * 40),false);
                           }
                        }
                  }
               }
            }
         }
         return undefined;
      }
  parseMetadata(args: string, getVal: boolean = false): string {
         var argsArray: any[]= args.split(",");
         var i: number = int(0);
         while(i < argsArray.length)
         {
            argsArray[i] = argsArray[i].replace(/^\s*|\s*$/gim,"");
            i++;
         }
         argsArray[0] = argsArray[0].replace(/  +/g," ");
         if(!getVal)
         {
            argsArray[1] = argsArray[1].replace(/  +/g," ");
            this.playerMetadata[argsArray[0]] = argsArray[1];
            return "";
         }
         return this.playerMetadata[argsArray[0]];
      }
  parseCodeBlockPosition(args: string, block: Block): Point {
         var argsArray: any[]= args.split(",");
         var i: number = int(0);
         while(i < argsArray.length)
         {
            argsArray[i] = argsArray[i].replace(/^\s*|\s*$/gim,"");
            i++;
         }
         argsArray[0] = argsArray[0].replace(/  +/g," ");
         argsArray[1] = argsArray[1].replace(/  +/g," ");
         var direction1: any[]= argsArray[0].split(" ");
         var direction2: any[]= argsArray[1].split(" ");
         var position: Point= new Point(0,0);
         if(direction1[0] == "right" || direction1[0] == "r")
         {
            position.x = int(direction1[1]);
         }
         else if(direction1[0] == "left" || direction1[0] == "l")
         {
            position.x = -int(direction1[1]);
         }
         if(direction2[0] == "up" || direction2[0] == "u")
         {
            position.y = -int(direction2[1]);
         }
         else if(direction2[0] == "down" || direction2[0] == "d")
         {
            position.y = int(direction2[1]);
         }
         return position;
      }
  parseCodeConditional(line: string, block: Block): boolean {
         var conditions: string= null;
         var condition: string= null;
         var splitd: any[]= null;
         var targetAndVariable= undefined;
         var methodIndex: number = int(0);
         var methodEndIndex= undefined;
         var methodName: string= null;
         var args: string= null;
         var result: any= null;
         var passes: boolean= false;
         var ifIndex= line.indexOf("if");
         var thenIndex: number = int(line.lastIndexOf("then"));
         if(thenIndex != -1)
         {
            conditions = line.substr(ifIndex + 3,thenIndex - ifIndex - 4).replace(/^\s*|\s*$/gim,"");
            for (condition of $each(conditions.split("and")))
            {
               condition = condition.replace(/^\s*|\s*$/gim,"");
               splitd = condition.split(" ");
               targetAndVariable = splitd[0].split(".");
               methodIndex = int(int(targetAndVariable[1].indexOf("(")));
               if(methodIndex != -1)
               {
                  methodEndIndex = targetAndVariable[1].lastIndexOf(")");
                  if(methodEndIndex != -1)
                  {
                     methodName = targetAndVariable[1].substr(0,methodIndex).replace(/^\s*|\s*$/gim,"");
                     args = targetAndVariable[1].substr(methodIndex + 1,methodEndIndex - methodIndex - 1).replace(/^\s*|\s*$/gim,"");
                     switch(targetAndVariable[0])
                     {
                        case "this":
                        case "b":
                        case "block":
                           switch(methodName)
                           {
                              case "move":
                                 passes = this.parseCodeMove(args,block);
                           }
                           break;
                        case "p":
                        case "player":
                           switch(methodName)
                           {
                              case "getmetadata":
                                 result = this.parsePlayerMetadata(splitd[0]);
                           }
                     }
                  }
               }
               switch(targetAndVariable[0])
               {
                  case "this":
                  case "b":
                  case "block":
                     switch(targetAndVariable[1])
                     {
                        case "health":
                           result = block.health;
                     }
                     break;
                  case "p":
                  case "player":
                     switch(targetAndVariable[1])
                     {
                        case "team":
                           result = this.team;
                           break;
                        case "speed":
                           if(this instanceof LocalPlayer)
                           {
                              result = this.vars.velLevel;
                           }
                           break;
                        case "jump":
                           if(this instanceof LocalPlayer)
                           {
                              result = this.vars.jumpLevel;
                           }
                           break;
                        case "acceleration":
                        case "accel":
                           if(this instanceof LocalPlayer)
                           {
                              result = this.vars.accelLevel;
                           }
                           break;
                        case "gravity":
                        case "grav":
                           result = this.defaultGravity / this.gravity;
                           break;
                        case "health":
                           result = this.vars.life;
                           break;
                        case "rotation":
                           result = this.vars.rot;
                           break;
                        case "hat":
                           result = this.hatArray;
                     }
                     break;
                  case "v":
                  case "variable":
                     result = block.codeVariables[targetAndVariable[1]];
               }
               if(result != null)
               {
                  switch(splitd[1])
                  {
                     case "!=":
                        passes = result instanceof $Array ? result.toString().indexOf(splitd[2].toString()) == -1 : result != splitd[2];
                        break;
                     case "equals":
                     case "=":
                        passes = result instanceof $Array ? result.toString().indexOf(splitd[2].toString()) != -1 : result == splitd[2];
                        break;
                     case "greater":
                     case ">":
                        passes = Number(result) > Number(splitd[2]);
                        break;
                     case "less":
                     case "<":
                        passes = Number(result) < Number(splitd[2]);
                        break;
                     case "greater or equals":
                     case ">=":
                        passes = Number(result) >= Number(splitd[2]);
                        break;
                     case "less or equals":
                     case "<=":
                        passes = Number(result) <= Number(splitd[2]);
                  }
                  if(!passes)
                  {
                     return false;
                  }
               }
            }
         }
         return passes;
      }
  blockSideIsActive(param1: Block, param2: string): boolean {
         var _loc_3= this.rotateSide(param2);
         var _loc_4= param1.vars;
         var _loc_5= _loc_4[_loc_3];
         if(_loc_5.type == BlockSideSettings.INACTIVE)
         {
            return false;
         }
         if(this.topHat == true && param2 != "top" && (_loc_5.type == BlockSideSettings.SHATTER || _loc_5.type == BlockSideSettings.CRUMBLE || _loc_5.type == BlockSideSettings.VANISH))
         {
            return false;
         }
         return true;
      }
  setItem(whichItem: string, itemSettings: any = ""): void {
         if(whichItem != Items.NONE && Items.getItemTitle(whichItem) == null)
         {
            whichItem = Items.NONE;
         }
         super.setItem(whichItem,itemSettings);
         if(this.itemClass != null)
         {
            if(this.itemClass.removed == false)
            {
               this.itemClass.remove();
            }
            this.itemClass = null;
         }
         if(whichItem != Items.NONE)
         {
            this.itemClass = Items.getItemClass(whichItem);
            this.itemClass.setPlayer(this);
            this.itemClass.init(itemSettings);
         }
      }
  getVars(): any {
         return this.vars;
      }
  blockTests(param1: Block, param2: string): void {
         var _loc_4= null;
         var _loc_3= param1.vars;
         if(_loc_3.type != BlockSettings.INACTIVE && _loc_3.type != BlockSettings.WATER && _loc_3.type != BlockSettings.START && _loc_3.type != BlockSettings.INACTIVE_LUA && _loc_3.type != BlockSettings.WATER_LUA)
         {
            if(param2 == "left")
            {
               this.shiftedMoveX = 0;
               this.shiftedX = this.getBlockBoundry(param1,"left") - (0.1 + this.hitWidth) * this.multiplierX;
               if(this.rubberHat || Boolean(this.vars.hurt) && this.bananaTimer > 0)
               {
                  this.shiftedVelX *= -0.99;
               }
               else
               {
                  this.shiftedVelX *= -0.25;
               }
            }
            if(param2 == "right")
            {
               this.shiftedMoveX = 0;
               this.shiftedX = this.getBlockBoundry(param1,"right") + (0.1 + this.hitWidth) * this.multiplierX;
               if(this.rubberHat || Boolean(this.vars.hurt) && this.bananaTimer > 0)
               {
                  this.shiftedVelX *= -0.99;
               }
               else
               {
                  this.shiftedVelX *= -0.25;
               }
            }
            if(param2 == "top")
            {
               if(this.vars.hurt)
               {
                  if(this.velY > 0)
                  {
                     if(this.rubberHat || Boolean(this.vars.hurt) && this.bananaTimer > 0)
                     {
                        this.shiftedVelY *= -0.99;
                     }
                     else
                     {
                        this.shiftedVelY *= -0.5;
                     }
                  }
               }
               else if(this.velY > 0)
               {
                  if((this.rubberHat || this.vars.hurt && this.bananaTimer > 0) && this.velY > 0.1)
                  {
                     this.shiftedVelY *= -0.25;
                  }
                  else
                  {
                     this.shiftedVelY = 0;
                  }
               }
               this.magnetHeld = 0;
               this.parasolHeld = 0;
               this.touchingGround = true;
               this.accelHatTimer = int(0);
               this.wallJumpsLeft = int(5);
               this.shiftedMoveY = 0;
               this.shiftedY = this.getBlockBoundry(param1,"top") - 0.001 * this.multiplierY;
            }
            if(param2 == "bottom")
            {
               if(!this.crouching)
               {
                  this.shiftedMoveY = 0;
                  this.shiftedY = this.getBlockBoundry(param1,"bottom") + (this.hitHeight + 0.1) * this.multiplierY;
                  if(this.velY < 0)
                  {
                     if((this.rubberHat || this.vars.hurt && this.bananaTimer > 0) && this.velY < -0.1)
                     {
                        this.shiftedVelY *= -0.99;
                     }
                     else
                     {
                        this.shiftedVelY = 0;
                     }
                  }
                  this.stillHoldingUp = false;
               }
            }
            if(param2 == "bump" && _loc_3[param2].type != BlockSideSettings.PUSH_UP)
            {
               this.attemptingBump = true;
               if(this.lastBumpBlock != param1)
               {
                  _loc_4 = Data.rotatePoint(0,-20,-this.rotation);
                  param1.hit(_loc_4.x,_loc_4.y);
                  Sounds.startGameSound(new BumpSound(),this,0.66);
                  this.lastBumpBlock = param1;
                  this.stillHoldingUp = false;
               }
            }
         }
      }
  setHats(hats: any[]): void {
         var hat: any= null;
         super.setHats(hats);
         this.happyHat = false;
         this.sharkHat = false;
         this.rubberHat = false;
         this.medicalHat = false;
         this.boneChillingHat = false;
         this.parasolHat = false;
         this.partyHat = false;
         this.topHat = false;
         this.prankHat = false;
         this.speedHat = false;
         this.jumpHat = false;
         this.accelHat = false;
         this.santaHat = false;
         this.gallonHat = false;
         this.crownHat = false;
         this.propellerHat = false;
         this.pirateHat = false;
         this.policeHat = false;
         this.ushankaHat = false;
         this.toqueHat = false;
         this.fezHat = false;
         this.witchHat = false;
         this.haloHat = false;
         this.rockHat = false;
         this.bunnyHat = false;
         this.bullHat = false;
         this.beretHat = false;
         this.tinfoilHat = false;
         this.glueHat = false;
         this.trafficConeHat = false;
         this.magnetHelmet = false;
         this.petSquid = false;
         this.camoCap = false;
         this.rocketHat = false;
         this.fanHat = false;
         this.spookyHat = false;
         this.natureHat = false;
         this.hyperjumpHat = false;
         this.bananaHat = false;
         if(this.personalAlien != null)
         {
            this.personalAlien.remove();
            this.personalAlien = null;
         }
         for (hat of $each(hats))
         {
            if(!(int(hat.num) < 1 || int(hat.num) > 19))
            {
               switch(hat.num)
               {
                  case PartDescriptions.PROPELLER_HAT:
                     this.propellerHat = true;
                     break;
                  case PartDescriptions.COWBOY_HAT:
                     this.gallonHat = true;
                     break;
                  case PartDescriptions.CROWN_HAT:
                     this.crownHat = true;
                     break;
                  case PartDescriptions.SANTA_HAT:
                     this.santaHat = true;
                     break;
                  case PartDescriptions.ACCEL_HAT:
                     this.accelHat = true;
                     break;
                  case PartDescriptions.JUMP_HAT:
                     this.jumpHat = true;
                     break;
                  case PartDescriptions.SPEED_HAT:
                     this.speedHat = true;
                     break;
                  case PartDescriptions.PRANK_HAT:
                     this.prankHat = true;
                     break;
                  case PartDescriptions.TOP_HAT:
                     this.topHat = true;
                     break;
                  case PartDescriptions.PARTY_HAT:
                     this.partyHat = true;
                     break;
                  case PartDescriptions.PARASOL_HAT:
                     this.parasolHat = true;
                     break;
                  case PartDescriptions.PIRATE_HAT:
                     this.pirateHat = true;
                     break;
                  case PartDescriptions.MEDICAL_HAT:
                     this.medicalHat = true;
                     break;
                  case PartDescriptions.EXTRATERRESTRIAL_HAT:
                     this.boneChillingHat = true;
                     break;
                  case PartDescriptions.RUBBER_HAT:
                     this.rubberHat = true;
                     break;
                  case PartDescriptions.SHARK_HAT:
                     this.sharkHat = true;
                     break;
                  case PartDescriptions.HAPPY_HAT:
                     this.happyHat = true;
                     break;
                  case PartDescriptions.POLICE_HAT:
                     this.policeHat = true;
                     break;
                  case PartDescriptions.USHANKA_HAT:
                     this.ushankaHat = true;
                     break;
                  case PartDescriptions.TOQUE_HAT:
                     this.toqueHat = true;
                     break;
                  case PartDescriptions.FEZ_HAT:
                     this.fezHat = true;
                     break;
                  case PartDescriptions.WITCH_HAT:
                     this.witchHat = true;
                     break;
                  case PartDescriptions.HALO_HAT:
                     this.haloHat = true;
                     break;
                  case PartDescriptions.ROCK_HAT:
                     this.rockHat = true;
                     break;
                  case PartDescriptions.BUNNY_HAT:
                     this.bunnyHat = true;
                     break;
                  case PartDescriptions.BULL_HAT:
                     this.bullHat = true;
                     break;
                  case PartDescriptions.BERET:
                     this.beretHat = true;
                     break;
                  case PartDescriptions.TINFOIL:
                     this.tinfoilHat = true;
                     break;
                  case PartDescriptions.GLUE:
                     this.glueHat = true;
                     break;
                  case PartDescriptions.TRAFFIC_CONE:
                     this.trafficConeHat = true;
                     break;
                  case PartDescriptions.MAGNET_HELMET:
                     this.magnetHelmet = true;
                     break;
                  case PartDescriptions.PET_SQUID:
                     this.petSquid = true;
                     break;
                  case PartDescriptions.CAMO_CAP:
                     this.camoCap = true;
                     break;
                  case PartDescriptions.ROCKET_HAT:
                     this.rocketHat = true;
                     break;
                  case PartDescriptions.FAN_HAT:
                     this.fanHat = true;
                     break;
                  case PartDescriptions.SPOOKY_HAT:
                     this.spookyHat = true;
                     break;
                  case PartDescriptions.NATURE_HAT:
                     this.natureHat = true;
                     break;
                  case PartDescriptions.HYPERJUMP_HAT:
                     this.hyperjumpHat = true;
                     break;
                  case PartDescriptions.BANANA_PEEL:
                     this.bananaHat = true;
                     break;
                  case PartDescriptions.ALIEN_HAT:
                     if(this.personalAlien == null)
                     {
                        this.personalAlien = new AlienEffect(69);
                        this.personalAlien.owner = this;
                        this.personalAlien.x = this.x + 40;
                        this.personalAlien.y = this.y - 80;
                        this.personalAlien.scaleX = 0.5;
                        this.personalAlien.scaleY = 0.5;
                        this.personalAlien.speedMultiplier = 0;
                        this.personalAlien.shootFreq = int(1);
                     }
               }
            }
         }
      }
  createLifeBar(startHealth: number): void {
    startHealth = int(startHealth);
         var _loc_1= undefined;
         if(this.lifeBar == null)
         {
            this.vars.life = startHealth;
            this.lifeBar = new EasyProgressBar();
            _loc_1 = 1 / this.scale;
            this.lifeBar.scaleY = 1 / this.scale;
            this.lifeBar.scaleX = _loc_1;
            this.lifeBar.width = 50 * (1 / this.scale);
            this.lifeBar.height = 10 * (1 / this.scale);
            this.lifeBar.maxPercent = this.vars.life;
            this.lifeBar.percent = this.vars.life;
            this.positionLifeBar();
            this.addChildAt(this.lifeBar,0);
         }
      }
  getBlock(param1: number, param2: number): Block {
         var _loc_3= null;
         if(this.blockMap != null)
         {
            return this.blockMap.getBlockAtPos(param1,param2);
         }
         return null;
      }
  step(stepTimeMS: number): void {
    var hatDistanceX, hatDistanceY, quickMaths, slowMaths, slowMaths2, slowMaths3, slowMaths4, slowMaths5, lastSuckMS, blurEffect, noMovement; // undeclared in decompiled source
         var _loc_16= undefined;
         var _loc_17= undefined;
         var suckHat= undefined;
         var settingsToGive: string= null;
         var blurrer= undefined;
         var blurFilter: BitmapFilter= null;
         var matrix: any[]= null;
         var colorFilter: ColorMatrixFilter= null;
         var currentVelCapped: number= Number(NaN);
         var _loc_6= NaN;
         var _loc_7= NaN;
         var _loc_8= NaN;
         var _loc_9= NaN;
         var _loc_10= NaN;
         var _loc_11= NaN;
         var _loc_12= null;
         var _loc_13= null;
         var _loc_14= NaN;
         var _loc_15= NaN;
         this.playerFilters.length = 0;
         if(!this.attemptingBump)
         {
            this.lastBumpBlock = null;
         }
         if(!this.touchingGround)
         {
            this.painted = false;
         }
         this.attemptingBump = false;
         if(this.vars.hurt)
         {
            this.hurtTimer = int(this.hurtTimer - (stepTimeMS));
         }
         this.recoveryTimer = int(this.recoveryTimer - (stepTimeMS));
         if(this.teleportEffectCooldown > 0)
         {
            _loc_16 = this;
            _loc_17 = this.teleportEffectCooldown - 1;
            _loc_16.teleportEffectCooldown = _loc_17;
         }
         var _loc_2= 0;
         var _loc_3= this.vars.velLevel;
         var _loc_4= this.vars.accelLevel;
         var _loc_5= this.vars.jumpLevel;
         this.useShiftedVel = true;
         if(this.resetWallJumpTimer <= 0)
         {
            this.canWallJump = false;
         }
         --this.resetWallJumpTimer;
         if(this.speedHat)
         {
            _loc_3 += 5;
         }
         if(this.accelHat)
         {
            _loc_4 += 5;
         }
         if(this.jumpHat)
         {
            _loc_5 += 5;
         }
         if(this.bullHat)
         {
            _loc_3 += 5;
         }
         if(this.fanHat)
         {
            _loc_3 += 5;
         }
         if(this.rockHat)
         {
            _loc_4 += 5;
         }
         if(this.rocketHat)
         {
            _loc_4 += 5;
         }
         if(this.bunnyHat)
         {
            _loc_5 += 5;
         }
         if(this.happyHat)
         {
            _loc_3 += 3;
            _loc_4 += 3;
            _loc_5 += 3;
         }
         if(this.prankHat && (!this.snailFriend || GamePage.instance.levelType == LevelPage.KING_OF_HAT))
         {
            _loc_3 *= 0.5;
            _loc_4 *= 0.5;
            _loc_5 *= 0.5;
         }
         if(this.onIce && this.ushankaHat)
         {
            _loc_3 = Math.max(_loc_3,100);
            _loc_4 = Math.max(_loc_4,100);
         }
         if(this.spookyHat)
         {
            _loc_3 *= -1;
            _loc_3 -= 100;
         }
         _loc_3 += this.photoBoosts;
         _loc_4 += this.photoBoosts;
         _loc_5 += this.photoBoosts;
         if(this.swimming && this.petSquid)
         {
            _loc_3 *= 1.5;
            _loc_5 *= 1.5;
         }
         if(this.witchHat)
         {
            suckHat = null;
            for (suckHat of $each(GamePage.instance.looseHatArray))
            {
               if(suckHat != null)
               {
                  if(suckHat.num == 10 || suckHat.num == 39)
                  {
                     hatDistanceX = suckHat.x - this.x;
                     hatDistanceY = suckHat.y - this.y;
                     quickMaths = Maths.pythag(hatDistanceX,hatDistanceY);
                     slowMaths = 500 - quickMaths;
                     if(slowMaths > 0)
                     {
                        slowMaths2 = Math.atan2(hatDistanceY,hatDistanceX);
                        slowMaths3 = Math.cos(slowMaths2) * slowMaths;
                        slowMaths4 = Math.sin(slowMaths2) * slowMaths;
                        slowMaths5 = Data.rotatePoint(slowMaths3,slowMaths4,suckHat.rotation);
                        suckHat.velX += slowMaths5.x / 1000 * this.alpha / 44 * lastSuckMS;
                        suckHat.velY += slowMaths5.y / 1000 * this.alpha / 44 * lastSuckMS;
                     }
                  }
                  else
                  {
                     hatDistanceX = suckHat.x - this.x;
                     hatDistanceY = suckHat.y - this.y;
                     quickMaths = Maths.pythag(hatDistanceX,hatDistanceY);
                     slowMaths = 500 - quickMaths;
                     if(slowMaths > 0)
                     {
                        slowMaths2 = Math.atan2(hatDistanceY,hatDistanceX);
                        slowMaths3 = Math.cos(slowMaths2) * slowMaths;
                        slowMaths4 = Math.sin(slowMaths2) * slowMaths;
                        slowMaths5 = Data.rotatePoint(slowMaths3,slowMaths4,suckHat.rotation);
                        suckHat.velX -= slowMaths5.x / 1000 * this.alpha / 44 * lastSuckMS;
                        suckHat.velY -= slowMaths5.y / 1000 * this.alpha / 44 * lastSuckMS;
                     }
                  }
               }
            }
         }
         lastSuckMS = stepTimeMS;
         if(this.haloHat)
         {
            if(!this.gaveWing)
            {
               if(this.itemClass == null)
               {
                  this.setVariable("item",Items.ANGEL_WINGS + "|ammo|" + "1" + "|strength|" + "1.5");
               }
               this.gaveWing = true;
            }
         }
         else
         {
            this.gaveWing = false;
         }
         if(this.boneChillingHat)
         {
            if(this.trafficBlockDelay < 0)
            {
               if(this.itemClass == null)
               {
                  settingsToGive = new String(Items.PORTABLE_BLOCK + "|id|" + Math.floor(Math.random() * 104400));
                  this.setVariable("item",Items.NONE);
                  this.setVariable("item",settingsToGive);
                  this.trafficBlockDelay = 300;
               }
               else
               {
                  this.trafficBlockDelay = 150;
               }
            }
            else
            {
               --this.trafficBlockDelay;
            }
         }
         if(this.chilled)
         {
            if(this.ushankaHat)
            {
               this.blurAmount = 0;
            }
            _loc_3 /= this.blurAmount + 1;
            _loc_4 /= this.blurAmount + 1;
            _loc_5 /= this.blurAmount + 1;
            if(this.blurAmount > 5)
            {
               _loc_3 = 0;
               _loc_4 = 0;
               _loc_5 = 0;
            }
            if(this.blurAmount <= 0)
            {
               this.endChill();
            }
         }
         if(this.blurAmount > 0)
         {
            blurEffect = this.blurAmount;
            if(this.blurAmount > 5)
            {
               blurEffect = 5;
            }
            blurrer = this.blurAmount;
            if(this.blurAmount > 10)
            {
               blurrer = 10;
            }
            blurFilter = new BlurFilter(blurrer,blurrer / 2,BitmapFilterQuality.HIGH);
            matrix = new Array();
            matrix = matrix.concat([(blurEffect * -1 + 5) / 5,0,blurEffect / 2,0,0]);
            matrix = matrix.concat([0,(blurEffect * -1 + 5) / 5,blurEffect,0,0]);
            matrix = matrix.concat([blurEffect / 2,blurEffect,1,0,0]);
            matrix = matrix.concat([0,0,0,1,0]);
            colorFilter = new ColorMatrixFilter(matrix);
            this.playerFilters.push(blurFilter);
            this.playerFilters.push(colorFilter);
            this.blurAmount -= 0.05;
         }
         if(this.rotating)
         {
            _loc_6 = Maths.getShortestRotChange(this.vars.rot,this.rotation);
            if(this.fezHat)
            {
               this.rotationAmplifier *= 10;
            }
            if(_loc_6 > 1 * this.rotationAmplifier)
            {
               this.rotation += 0.054 * this.rotationAmplifier * stepTimeMS;
            }
            else if(_loc_6 < -(1 * this.rotationAmplifier))
            {
               this.rotation -= 0.054 * this.rotationAmplifier * stepTimeMS;
            }
            else
            {
               this.rotation = this.vars.rot;
               this.rotating = false;
               this.rotationAmplifier = 1;
               if(this.rotation == 90 || this.rotation == -180 || this.rotation == 180)
               {
                  this.multiplierY = int(-1);
               }
               else
               {
                  this.multiplierY = int(1);
               }
               if(this.rotation == -90 || this.rotation == -180 || this.rotation == 180)
               {
                  this.multiplierX = int(-1);
               }
               else
               {
                  this.multiplierX = int(1);
               }
            }
         }
         else
         {
            _loc_7 = (0.00005 + _loc_4 * 0.000018) * this.itemAccelBoost;
            _loc_8 = 0.1 + this.arrowMaxSpeedBoost + this.speedBurstSpeedBoost + _loc_3 * 0.002;
            _loc_9 = 0;
            if(this.gallonHat)
            {
               _loc_8 = 0.5;
               _loc_7 = 0.003;
            }
            if(this.onIce && !this.santaHat && !this.ushankaHat)
            {
               _loc_7 *= 0.2;
            }
            if(this.iced && this.touchingGround)
            {
               if(this.santaHat)
               {
                  _loc_7 *= 0.2;
               }
               else
               {
                  _loc_7 *= 0.4;
               }
            }
            if(this.crouching && !this.accelHat)
            {
               _loc_7 *= 0.5;
               _loc_8 *= 0.5;
            }
            if(!this.vars.hurt && !this.iced)
            {
               if(this.vars.left)
               {
                  this.m.scaleX = -1;
                  if(this.bullHat)
                  {
                     if(this.lastDirection == "right")
                     {
                        this.bullCharge = 1;
                     }
                     if(this.bullCharge < 2)
                     {
                        this.bullCharge += 0.005;
                     }
                  }
                  else
                  {
                     this.bullCharge = 1;
                  }
                  this.lastDirection = "left";
                  if(!this.chargingSuperJump || this.fanHat)
                  {
                     _loc_9 = -(_loc_8 * this.bullCharge);
                  }
               }
               if(this.vars.right)
               {
                  this.m.scaleX = 1;
                  if(this.bullHat)
                  {
                     if(this.lastDirection == "left")
                     {
                        this.bullCharge = 1;
                     }
                     if(this.bullCharge < 2)
                     {
                        this.bullCharge += 0.005;
                     }
                  }
                  else
                  {
                     this.bullCharge = 1;
                  }
                  this.lastDirection = "right";
                  if(!this.chargingSuperJump || this.fanHat)
                  {
                     _loc_9 = _loc_8 * this.bullCharge;
                  }
               }
               if(this.bullHat && !this.vars.left && !this.vars.right)
               {
                  this.bullCharge = 1;
               }
               if(this.vars.up)
               {
                  if(this.bunnyHat)
                  {
                     _loc_5 /= 1 / 0.6;
                  }
                  if(this.touchingGround || this.velY > 0)
                  {
                     this.stillHoldingUp = false;
                  }
                  if((this.swimming || this.gallonHat) && !this.touchingGround)
                  {
                     _loc_2 -= 0.0024242;
                     this.stillHoldingUp = false;
                  }
                  else if((this.touchingGround || this.accelHatTimer < 2 && this.accelHat || this.canWallJump && this.wallJumpsLeft > 0 && this.jumpedTime < 5) && !this.crouching || this.stillHoldingUp)
                  {
                     if(!this.stillHoldingUp)
                     {
                        this.stillHoldingUp = true;
                        this.remainingJumpVel = 0.25 + _loc_5 * 0.0037;
                        if(this.canWallJump && !this.touchingGround)
                        {
                           this.remainingJumpVel = 0.25 + _loc_5 * 0.6 * 0.0037 * this.wallJumpsLeft * 0.2;
                           currentVelCapped = this.velY;
                           if(currentVelCapped > 0)
                           {
                              currentVelCapped = 0;
                           }
                           this.velY = (-0.02 * (this.gravity / this.defaultGravity) + currentVelCapped) / 2 * this.wallJumpsLeft * 0.2;
                           this.velX = (2 * this.remainingJumpVel - currentVelCapped) / 2 / 1.25 * this.wallJumpsLeft * 0.2;
                           if(!this.wallJumpingToRight)
                           {
                              this.velX *= -1;
                           }
                           --this.wallJumpsLeft;
                        }
                        Sounds.startGameSound(new JumpSound(),this,0.75);
                        this.resetWallJumpTimer = int(0);
                     }
                     if(this.stillHoldingUp)
                     {
                        _loc_14 = this.remainingJumpVel * (1 - Math.pow(1 - 10 / 27,27 * stepTimeMS / 1000));
                        _loc_14 = Maths.limit(_loc_14,0,this.remainingJumpVel);
                        this.remainingJumpVel -= _loc_14;
                        _loc_2 -= _loc_14 / stepTimeMS;
                     }
                  }
                  else if(this.parasolHat == true && this.velY > 0.075)
                  {
                     this.velY = 0.075;
                  }
                  else if(this.bunnyHat && !this.usedBunnyJump && !this.crouching)
                  {
                     this.usedBunnyJump = true;
                     this.stillHoldingUp = true;
                     this.velY = -0.02 * (this.gravity / this.defaultGravity);
                     this.remainingJumpVel = 0.25 + _loc_5 * 0.0037;
                     Sounds.startGameSound(new JumpSound(),this,0.75);
                  }
                  if(!this.stillHoldingUp && this.velY > -0.01 && !this.swimming && this.parasolHeld < 30 && false)
                  {
                     this.velY = -0.0075;
                     ++this.parasolHeld;
                     --this.jumpedTime;
                  }
               }
               else
               {
                  this.stillHoldingUp = false;
                  if(this.parasolHeld > 0)
                  {
                     this.parasolHeld = 30;
                  }
               }
               if(this.touchingGround)
               {
                  this.usedBunnyJump = false;
               }
               if(Boolean(this.vars.down) && !this.vars.up)
               {
                  if(this.touchingGround)
                  {
                     if(!this.crouching && this.superJumpEnabled)
                     {
                        this.chargeSuperJump(stepTimeMS);
                     }
                  }
                  else if(this.gallonHat)
                  {
                     _loc_2 += 0.00303;
                  }
                  else if(this.rockHat)
                  {
                     this.velY = (2.5 + this.velY * 16) / 17;
                  }
                  _loc_2 += 0.001515;
               }
               else
               {
                  if(this.chargingSuperJump)
                  {
                     this.velY = -this.superJumpVel;
                     _loc_2 = 0;
                     this.stillHoldingUp = false;
                     Sounds.startGameSound(new SuperJumpSound(),this,this.superJumpVel / this.maxSuperJumpVel * 2);
                     Sounds.startGameSound(new JumpSound(),this,0.5);
                  }
                  this.superJumpVel = 0;
                  this.chargingSuperJump = false;
               }
            }
            if(this.vars.hurt)
            {
               if(!this.touchingGround)
               {
                  _loc_7 /= 100;
               }
               else
               {
                  _loc_7 /= 2;
               }
            }
            if(this.velX > _loc_9)
            {
               _loc_7 *= -1;
            }
            _loc_10 = _loc_7 * stepTimeMS;
            _loc_11 = this.velX - _loc_9;
            if(Math.abs(_loc_10) > Math.abs(_loc_11))
            {
               _loc_15 = Math.abs(_loc_11) / Math.abs(_loc_10);
               _loc_10 *= _loc_15;
               _loc_7 *= _loc_15;
            }
            if(this.swimming)
            {
               if(!this.petSquid)
               {
                  _loc_2 += this.gravity / 2;
               }
            }
            else if(this.velY < -0.2 && this.rocketHat && this.stillHoldingUp)
            {
               _loc_2 += this.gravity * 1.75;
            }
            else
            {
               _loc_2 += this.gravity;
            }
            if(this.swimming && !this.gallonHat)
            {
               if(this.sharkHat)
               {
                  _loc_2 *= 0.25;
               }
               else if(!this.petSquid)
               {
                  _loc_2 *= 0.5;
               }
               else
               {
                  if(this.vars.up == false && this.vars.down == true)
                  {
                     _loc_2 *= 1.55;
                  }
                  this.velY *= 0.9;
                  if(this.velY > -0.01 && this.velY < 0 && !this.touchingGround)
                  {
                     this.velY = 0.0001;
                  }
                  if(this.vars.up == false && this.vars.down == false)
                  {
                     this.velY *= 0.75;
                  }
               }
            }
            this.velX = Maths.limit(this.velX,-1,1);
            this.velY = Maths.limit(this.velY,-1,1);
            this.moveX = this.velX * stepTimeMS + 0.5 * (_loc_7 * (stepTimeMS * stepTimeMS));
            this.velX += _loc_10;
            this.moveY = this.velY * stepTimeMS + 0.5 * (_loc_2 * (stepTimeMS * stepTimeMS));
            this.moveX += this.windMoveX;
            this.moveY += this.windMoveY;
            this.velY += _loc_2 * stepTimeMS;
            if(this.velY < -0.2 && !this.swimming && this.rocketHat && this.stillHoldingUp)
            {
               this.moveY *= 2;
            }
            if(this.gallonHat)
            {
               this.velX *= Math.pow(0.9,27 * stepTimeMS / 1000);
               this.velY *= Math.pow(0.9,27 * stepTimeMS / 1000);
            }
            else if(this.swimming)
            {
               noMovement = !this.vars.up && !this.vars.down && !this.vars.left && !this.vars.right;
               if(this.sharkHat)
               {
                  this.moveX = this.moveX * 0.85 * this.swimmingAmplifier;
                  this.moveY = this.moveY * 0.85 * this.swimmingAmplifier;
               }
               else
               {
                  this.velX *= Math.pow(0.9,27 * stepTimeMS / 1000);
                  this.velY *= Math.pow(0.9,27 * stepTimeMS / 1000);
                  this.moveX = this.moveX * 0.75 * this.swimmingAmplifier;
                  this.moveY = this.moveY * 0.75 * this.swimmingAmplifier;
               }
            }
            _loc_12 = Data.rotatePoint(this.moveX,this.moveY,-this.rotation);
            this.rotatedMoveX = _loc_12.x;
            this.rotatedMoveY = _loc_12.y;
            _loc_13 = Data.rotatePoint(this.velX,this.velY,-this.rotation);
            this.rotatedVelX = _loc_13.x;
            this.rotatedVelY = _loc_13.y;
            if(this.rotation == 90 || this.rotation == 270 || this.rotation == -90)
            {
               this.shiftedX = this.realY;
               this.shiftedY = this.realX;
               this.shiftedMoveX = this.rotatedMoveY;
               this.shiftedMoveY = this.rotatedMoveX;
               this.shiftedVelX = this.rotatedVelY;
               this.shiftedVelY = this.rotatedVelX;
            }
            else
            {
               this.shiftedX = this.realX;
               this.shiftedY = this.realY;
               this.shiftedMoveX = this.rotatedMoveX;
               this.shiftedMoveY = this.rotatedMoveY;
               this.shiftedVelX = this.rotatedVelX;
               this.shiftedVelY = this.rotatedVelY;
            }
            this.testBlocks(stepTimeMS);
            if(this instanceof LocalPlayer)
            {
               (this).lua.callTimers(stepTimeMS);
               $b((this).lua, 'tick').call(stepTimeMS);
            }
            this.determineState(stepTimeMS);
            if(this.useShiftedVel)
            {
               if(this.rotation == 90 || this.rotation == 270 || this.rotation == -90)
               {
                  this.realY = this.shiftedX;
                  this.realX = this.shiftedY;
                  this.rotatedMoveX = this.shiftedMoveY;
                  this.rotatedMoveY = this.shiftedMoveX;
                  this.rotatedVelX = this.shiftedVelY;
                  this.rotatedVelY = this.shiftedVelX;
               }
               else
               {
                  this.realX = this.shiftedX;
                  this.realY = this.shiftedY;
                  this.rotatedMoveX = this.shiftedMoveX;
                  this.rotatedMoveY = this.shiftedMoveY;
                  this.rotatedVelX = this.shiftedVelX;
                  this.rotatedVelY = this.shiftedVelY;
               }
               _loc_13 = Data.rotatePoint(this.rotatedVelX,this.rotatedVelY,this.rotation);
               this.velX = _loc_13.x;
               this.velY = _loc_13.y;
               this.realX += Maths.limit(this.rotatedMoveX,-this.maxMovePerFrame,this.maxMovePerFrame);
               this.realY += Maths.limit(this.rotatedMoveY,-this.maxMovePerFrame,this.maxMovePerFrame);
               this.x = this.realX;
               this.y = this.realY;
            }
         }
         this.updatePersonalAlien();
         if(this.followPlayer)
         {
            MapManager.map.setRot(-this.rotation);
            this.centerCamera(0.25);
         }
         this.filters = this.playerFilters;
      }
  resetRotation(): void {
         this.rotation = 0;
         MapManager.map.setRot(0);
         this.centerCamera(0.25);
      }
  centerCamera(stiffness: number = 1): void {
         if(MatchPage.instance != null)
         {
            if(MatchPage.instance.hasGameStarted)
            {
               stiffness = this.cameraStiffness;
            }
         }
         else if(LevelEditorPage.instance != null)
         {
            stiffness = this.cameraStiffness;
         }
         if(stiffness < 0 || stiffness > 1)
         {
            stiffness = 0.25;
         }
         var _loc_2= Data.rotatePoint(0,50,-this.rotation);
         var _loc_3= -this.x + Settings.gameWidth / 2 + _loc_2.x;
         var _loc_4= -this.y + Settings.gameHeight / 2 + _loc_2.y;
         var _loc_5= _loc_3 - MapManager.map.posX;
         var _loc_6= _loc_4 - MapManager.map.posY;
         if(Math.abs(_loc_5) > 1)
         {
            MapManager.map.posX += _loc_5 * stiffness;
         }
         if(Math.abs(_loc_6) > 1)
         {
            MapManager.map.posY += _loc_6 * stiffness;
         }
      }
  testBlocks(timePast: number): void {
         var blockWidth: number = int(0);
         var blockHeight: number = int(0);
         var rot: number= Number(NaN);
         var boundry: number= Number(NaN);
         var futurePosX: number= Number(NaN);
         var futurePosY: number= Number(NaN);
         var blp: Point= null;
         var bcp: Point= null;
         var brp: Point= null;
         var llp: Point= null;
         var lcp: Point= null;
         var lrp: Point= null;
         var mlp: Point= null;
         var mcp: Point= null;
         var mrp: Point= null;
         var hlp: Point= null;
         var hcp: Point= null;
         var hrp: Point= null;
         var bottomLeft: Block= null;
         var bottomCenter: Block= null;
         var bottomRight: Block= null;
         var lowerLeft: Block= null;
         var lowerCenter: Block= null;
         var lowerRight: Block= null;
         var midLeft: Block= null;
         var midCenter: Block= null;
         var midRight: Block= null;
         var highLeft: Block= null;
         var highCenter: Block= null;
         var highRight: Block= null;
         var tempBottom: Block= null;
         var testBlock: Block= null;
         var tempRightBlock: Block= null;
         var tempLeftBlock: Block= null;
         var tempHighBlock: Block= null;
         try
         {
            this.touchingGround = false;
            this.crouching = false;
            this.onIce = false;
            this.arrowMaxSpeedBoost = 0;
            blockWidth = int(Block.width);
            blockHeight = int(Block.height);
            rot = -this.rotation;
            futurePosX = (this.shiftedX + this.moveX * this.multiplierX) * this.multiplierX;
            futurePosY = (this.shiftedY + this.moveY * this.multiplierY) * this.multiplierY;
            blp = Data.rotatePoint(-blockWidth,blockHeight,rot);
            bcp = Data.rotatePoint(0,blockHeight,rot);
            brp = Data.rotatePoint(blockWidth,blockHeight,rot);
            llp = Data.rotatePoint(-blockWidth,0,rot);
            lcp = Data.rotatePoint(0,0,rot);
            lrp = Data.rotatePoint(blockWidth,0,rot);
            mlp = Data.rotatePoint(-blockWidth,-blockHeight,rot);
            mcp = Data.rotatePoint(0,-blockHeight,rot);
            mrp = Data.rotatePoint(blockWidth,-blockHeight,rot);
            hlp = Data.rotatePoint(-blockWidth,-blockHeight * 2,rot);
            hcp = Data.rotatePoint(0,-blockHeight * 2,rot);
            hrp = Data.rotatePoint(blockWidth,-blockHeight * 2,rot);
            bottomLeft = this.getActiveBlock(this.realX + blp.x,this.realY + blp.y);
            bottomCenter = this.getActiveBlock(this.realX + bcp.x,this.realY + bcp.y);
            bottomRight = this.getActiveBlock(this.realX + brp.x,this.realY + brp.y);
            lowerLeft = this.getActiveBlock(this.realX + llp.x,this.realY + llp.y);
            lowerCenter = this.getActiveBlock(this.realX + lcp.x,this.realY + lcp.y);
            lowerRight = this.getActiveBlock(this.realX + lrp.x,this.realY + lrp.y);
            midLeft = this.getActiveBlock(this.realX + mlp.x,this.realY + mlp.y);
            midCenter = this.getActiveBlock(this.realX + mcp.x,this.realY + mcp.y);
            midRight = this.getActiveBlock(this.realX + mrp.x,this.realY + mrp.y);
            highLeft = this.getActiveBlock(this.realX + hlp.x,this.realY + hlp.y);
            highCenter = this.getActiveBlock(this.realX + hcp.x,this.realY + hcp.y);
            highRight = this.getActiveBlock(this.realX + hrp.x,this.realY + hrp.y);
            if(this.moveY < 0)
            {
               if(!this.canPass(midCenter,"bottom"))
               {
                  this.shiftedMoveY = 2 * this.multiplierY;
                  this.shiftedVelY = 0.1 * this.multiplierY;
               }
            }
            if(this.moveY >= 0)
            {
               if(bottomCenter == null && !this.swimming && this.santaHat)
               {
                  testBlock = this.getBlock(this.realX + bcp.x,this.realY + bcp.y);
                  if(testBlock != null && testBlock.vars.type == BlockSettings.WATER)
                  {
                     bottomCenter = testBlock;
                  }
               }
               tempBottom = bottomCenter;
               if(this.canPass(bottomCenter,"top"))
               {
                  if(!this.canPass(bottomRight,"top") && this.canPass(lowerRight,"left"))
                  {
                     boundry = this.getBlockBoundry(bottomRight,"left");
                     if(futurePosX + this.hitWidth >= boundry * this.multiplierX)
                     {
                        tempBottom = bottomRight;
                     }
                  }
                  if(!this.canPass(bottomLeft,"top") && this.canPass(lowerLeft,"right"))
                  {
                     boundry = this.getBlockBoundry(bottomLeft,"right");
                     if(futurePosX - this.hitWidth <= boundry * this.multiplierX)
                     {
                        tempBottom = bottomLeft;
                     }
                  }
               }
               if(!this.canPass(tempBottom,"top"))
               {
                  boundry = this.getBlockBoundry(tempBottom,"top");
                  if(futurePosY >= boundry * this.multiplierY)
                  {
                     this.touchBlock(tempBottom,"top",timePast);
                  }
                  else if(this.gravity == 0 && Math.abs(futurePosY - boundry * this.multiplierY) <= 0.11)
                  {
                     this.touchBlock(tempBottom,"top",timePast);
                  }
               }
            }
            if(!this.canPass(midCenter,"bottom") && !this.canPass(bottomCenter,"top") && this.moveY < 0)
            {
               this.touchBlock(bottomCenter,"top",timePast);
            }
            if(this.touchingGround && !this.canPass(midCenter,"bottom"))
            {
               this.crouching = true;
               if(this.vars.up == true)
               {
                  this.touchBlock(midCenter,"bottom",timePast);
                  this.touchBlock(midCenter,"bump",timePast);
               }
            }
            if(this.moveX >= -1)
            {
               tempRightBlock = lowerRight;
               if(this.canPass(lowerRight,"left") && this.canPass(midCenter,"bottom") && !this.crouching && this.moveY < 0)
               {
                  tempRightBlock = midRight;
               }
               if(!this.canPass(tempRightBlock,"left"))
               {
                  boundry = this.getBlockBoundry(tempRightBlock,"left");
                  if(futurePosX + this.hitWidth >= boundry * this.multiplierX)
                  {
                     this.touchBlock(tempRightBlock,"left",timePast);
                  }
               }
            }
            if(this.moveX <= 1)
            {
               tempLeftBlock = lowerLeft;
               if(this.canPass(lowerLeft,"right") && this.canPass(midCenter,"bottom") && !this.crouching && this.moveY < 0)
               {
                  tempLeftBlock = midLeft;
               }
               if(!this.canPass(tempLeftBlock,"right"))
               {
                  boundry = this.getBlockBoundry(tempLeftBlock,"right");
                  if(futurePosX - this.hitWidth <= boundry * this.multiplierX)
                  {
                     this.touchBlock(tempLeftBlock,"right",timePast);
                  }
               }
            }
            if(this.moveY < 0)
            {
               if(this.crouching)
               {
                  this.rotatedMoveY = 0;
                  this.velY = 0;
               }
               else
               {
                  tempHighBlock = highCenter;
                  if(this.canPass(highCenter,"bottom"))
                  {
                     if(!this.canPass(highRight,"bottom") && this.canPass(midRight,"left") && this.canPass(lowerRight,"left"))
                     {
                        boundry = this.getBlockBoundry(highRight,"left");
                        if(futurePosX + this.hitWidth >= boundry * this.multiplierX)
                        {
                           tempHighBlock = highRight;
                        }
                     }
                     if(!this.canPass(highLeft,"bottom") && this.canPass(midLeft,"right") && this.canPass(lowerLeft,"right"))
                     {
                        boundry = this.getBlockBoundry(highLeft,"right");
                        if(futurePosX - this.hitWidth <= boundry * this.multiplierX)
                        {
                           tempHighBlock = highLeft;
                        }
                     }
                  }
                  if(!this.canPass(tempHighBlock,"bottom"))
                  {
                     boundry = this.getBlockBoundry(tempHighBlock,"bottom");
                     if((this.shiftedY - this.hitHeight * this.multiplierY) * this.multiplierY + this.moveY <= boundry * this.multiplierY)
                     {
                        this.touchBlock(tempHighBlock,"bottom",timePast);
                        this.touchBlock(tempHighBlock,"bump",timePast);
                     }
                  }
               }
            }
            lowerCenter = this.getBlock(this.realX,this.realY);
            if(lowerCenter != null && (lowerCenter.vars.type == BlockSettings.WATER || lowerCenter.vars.type == BlockSettings.WATER_LUA))
            {
               if(this.swimming == false)
               {
                  Sounds.startGameSound(new EnterWaterSound(),this,1);
                  GamePage.instance.enterWater(this);
               }
               this.swimming = true;
               this.swimmingAmplifier = lowerCenter.vars.swimSpeed;
               this.magnetHeld = 0;
               this.wallJumpsLeft = int(5);
               this.parasolHeld = 0;
            }
            else
            {
               if(this.swimming == true)
               {
                  Sounds.startGameSound(new ExitWaterSound(),this,1);
                  GamePage.instance.exitWater(this);
               }
               this.swimming = false;
               this.swimmingAmplifier = 1;
            }
            if(lowerCenter != null && this instanceof LocalPlayer && (lowerCenter.vars.type == BlockSettings.INACTIVE_LUA || lowerCenter.vars.type == BlockSettings.WATER_LUA))
            {
               GamePage.instance.callLuaBlock(lowerCenter,"inside",this);
            }
         }
         catch (ignore)
         {
         }
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
  getActiveBlock(param1: number, param2: number): Block {
         var _loc_3= this.getBlock(param1,param2);
         if(_loc_3 != null && _loc_3.active == false && !_loc_3.frozen)
         {
            _loc_3 = null;
         }
         return _loc_3;
      }
  touchingToquePlayer(): boolean {
         var _loc_3= null;
         var _loc_1= false;
         var _loc_2= null;
         for (_loc_2 of $each(GamePage.instance.playerArray))
         {
            if(_loc_2 != null)
            {
               if(Boolean(_loc_2.toqueHat) && _loc_2 != this)
               {
                  _loc_3 = this.localToGlobal(new Point(0,0));
                  _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
                  if(!_loc_1)
                  {
                     _loc_3 = this.localToGlobal(new Point(0,-this.height));
                     _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
                  }
                  if(_loc_1)
                  {
                     return _loc_1;
                  }
               }
            }
         }
         return _loc_1;
      }
  endChill(): void {
         this.chilled = false;
      }
  setRecoveryTimer(param1: number = 2500, param2: number = 1950): void {
    param1 = int(param1); param2 = int(param2);
         var mult: number = int(1);
         if(this.bananaTimer > 0)
         {
            mult = int(2);
         }
         this.recoveryTimer = int(param1 * mult);
         this.hurtTimer = int(param2 * mult);
      }
  showTeleportEffect(param1: boolean = false): void {
         if(this.teleportEffectCooldown <= 0 || param1)
         {
            this.teleportEffectCooldown = int(15);
            if(!this.teleStealth)
            {
               new TeleportEffect(this);
               Sounds.startGameSound(new TeleportSound(),this,2);
            }
         }
      }
  checkForFriendlyFire(other: ActivePlayer): boolean {
         var team: string= null;
         var i= undefined;
         if(other == null)
         {
            return false;
         }
         if(this.team == "none" || other.team == "none")
         {
            return false;
         }
         if(this.team == other.team)
         {
            team = "none";
            i = 0;
            while(i < GamePage.instance.playerArray.length)
            {
               if(team == "none")
               {
                  team = GamePage.instance.playerArray[i].team;
               }
               else if(GamePage.instance.playerArray[i].team != team)
               {
                  return true;
               }
               i++;
            }
            return false;
         }
         return undefined;
      }
  get team(): string {
         return this.vars.team;
      }
  set team(value: string) {
         this.setVariable("team",value);
      }
  increaseDashScore(points: number): void {
    points = int(points);
         this.doesDamage(points);
      }
  updatePersonalAlien(): void {
         if(this.personalAlien != null)
         {
            this.personalAlien.x = this.x + 40;
            this.personalAlien.y = this.y - 80;
         }
      }
  getItem(): any {
         if(this.itemClass != null)
         {
            return this.itemClass.settings;
         }
         return null;
      }
  tint(color: number, duration: number, vibrance: number = 0.75): void {
    color = uint(color);
         if(this.tintColor != null)
         {
            this.removeTint();
         }
         this.tintColor = new Color();
         this.tintColor.setTint(color,vibrance);
         this.transform.colorTransform = this.tintColor;
         setTimeout($b(this, 'startRemoveTint'),duration * 1000);
      }
  startRemoveTint(): void {
         this.tintTimer = getTimer();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'removeTintEase'),false,0,true);
      }
  removeTintEase(event: Event): void {
         var easeAmnt: number= 0.5;
         var elapsedTime= (getTimer() - this.tintTimer) / 1000;
         var progressPercent: number= elapsedTime / easeAmnt;
         if(progressPercent >= 1 || this.tintColor == null)
         {
            this.removeTint();
            return;
         }
         this.transform.colorTransform = Color.interpolateTransform(this.tintColor,new ColorTransform(),progressPercent);
      }
  removeTint(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'removeTintEase'));
         this.tintTimer = null;
         this.tintColor = null;
         this.transform.colorTransform = new ColorTransform();
      }
  constructor() {
         super();
         this.vars = ({} as any);
         this.elapsedArray = new Array();
         this.vars.up = false;
         this.vars.down = false;
         this.vars.left = false;
         this.vars.right = false;
         this.vars.space = false;
         this.vars.hurt = false;
         this.vars.coins = 0;
         this.vars.dash = 0;
         this.vars.rot = 0;
         this.vars.maxStat = 100;
         this.vars.team = "none";
         this.hitGraphic = new PlayerHitAreaGraphic();
         var _loc_1= 1 / this.scaleX;
         this.hitGraphic.scaleY = 1 / this.scaleX;
         this.hitGraphic.scaleX = _loc_1;
         this.hitGraphic.visible = false;
         this.addChild(this.hitGraphic);
         this.playerFilters = new Array();
         this.lua = this.createLuaPlayer();
         this.initSpicedVars();
      }
}
$reg('com.jiggmin.pr3.player.ActivePlayer', ActivePlayer);
