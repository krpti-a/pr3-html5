// Ported from com/jiggmin/pr3/player/LocalPlayer.as
import { Event, Keyboard, Point, clearInterval, clearTimeout, getTimer, setInterval, setTimeout } from '../../../flash/index.ts';
import { int, uint, $as, $each, $keys, $b } from '../../../flash/as3.ts';
import { ActivePlayer } from './ActivePlayer.ts';
import { ArrayUtil, Block, BlockSettings, BlockSideSettings, BlossomRoom, Bubble1Sound, Bubble2Sound, Bubble3Sound, Bubble4Sound, BumpHappySound, BumpHeartSound, BumpSadSound, Data, EndBlockTestPhysicFlowError, GameChat, GameInput, GameInputEvent, GamePage, Items, Key, LevelEditorPage, LocalPlayerLuaWrapper, MapManager, MapPage, MatchPage, Maths, MobileControls, Player, PlayerLuaWrapper, RemotePlayer, Settings, SocketManager, Sounds, StarSound, TextPopup } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LocalPlayer extends ActivePlayer {
  gotAnItem: boolean = false;
  declare remoteVars: any;
  originalSafeX: number = 0;
  originalSafeY: number = 0;
  justTeleported: boolean = false;
  updateInterval: number = 0;
  fallTolerance: number = 400;
  minUpdateFreq: number = 500;
  explodeImmunityTimeout: number = 0;
  tempExplodeImmunity: boolean = false;
  declare gotItemArray: any[];
  declare room: BlossomRoom;
  maxUpdateFreq: number = 50;
  safeX: number = NaN;
  lastUpdateTime: number = 0;
  safeRepeats: number = 0;
  safeY: number = NaN;
  activeCheckpoint: boolean = false;
  gaveGalloon: boolean = false;
  controller: any = null;
  hPad: number = 0;
  xButton: boolean = false;
  aButton: boolean = false;
  rTrigger: boolean = false;
  allowAlerts: boolean = true;
  autoUpTicks: number = 0;
  autoDownTicks: number = 0;
  autoLeftTicks: number = 0;
  autoRightTicks: number = 0;
  autoSpaceTicks: number = 0;
  disableUpTicks: number = 0;
  disableDownTicks: number = 0;
  disableLeftTicks: number = 0;
  disableRightTicks: number = 0;
  disableSpaceTicks: number = 0;
  hurtByBarbedNapalm: boolean = false;
  createLuaPlayer(): PlayerLuaWrapper {
         return new LocalPlayerLuaWrapper(this);
      }
  assignKeys(): void {
         var prevUp: boolean= Boolean(this.vars["up"]);
         var prevDown: boolean= Boolean(this.vars["down"]);
         var prevLeft: boolean= Boolean(this.vars["left"]);
         var prevRight: boolean= Boolean(this.vars["right"]);
         this.setVariable("up",false);
         this.setVariable("down",false);
         this.setVariable("left",false);
         this.setVariable("right",false);
         this.setVariable("space",false);
         if(!GameChat.inChatMode && (TextPopup.inputMode != null && !TextPopup.inputMode))
         {
            if(Key.isDown(Keyboard.UP) || Key.isDown(87) || MobileControls.isDown(Keyboard.UP) || this.xButton == true)
            {
               if(this.disableUpTicks <= 0)
               {
                  this.setVariable("up",true);
               }
            }
            if(Key.isDown(Keyboard.DOWN) || Key.isDown(83) || MobileControls.isDown(Keyboard.DOWN) || this.aButton == true)
            {
               if(this.disableDownTicks <= 0)
               {
                  this.setVariable("down",true);
               }
            }
            if(Key.isDown(Keyboard.LEFT) || Key.isDown(65) || MobileControls.isDown(Keyboard.LEFT) || this.hPad < -0.75)
            {
               if(this.disableLeftTicks <= 0)
               {
                  this.setVariable("left",true);
               }
            }
            if(Key.isDown(Keyboard.RIGHT) || Key.isDown(68) || MobileControls.isDown(Keyboard.RIGHT) || this.hPad > 0.75)
            {
               if(this.disableRightTicks <= 0)
               {
                  this.setVariable("right",true);
               }
            }
            if((Key.isDown(Keyboard.SPACE) || MobileControls.isDown(Keyboard.SPACE) || this.rTrigger == true) && !this.vars.hurt)
            {
               if(this.disableSpaceTicks <= 0)
               {
                  this.setVariable("space",true);
               }
            }
         }
         if(this.autoUpTicks > 0)
         {
            this.vars["up"] = true;
         }
         if(this.autoDownTicks > 0)
         {
            this.vars["down"] = true;
         }
         if(this.autoLeftTicks > 0)
         {
            this.vars["left"] = true;
         }
         if(this.autoRightTicks > 0)
         {
            this.vars["right"] = true;
         }
         if(this.autoSpaceTicks > 0)
         {
            this.vars["space"] = true;
         }
      }
  handleInputEvent(e: GameInputEvent): void {
         this.controller = GameInput.getDeviceAt(0);
         this.controller.enabled = true;
      }
  handleDeviceRemovedEvent(e: GameInputEvent): void {
         this.controller = null;
         this.hPad = 0;
         this.xButton = false;
         this.aButton = false;
         this.rTrigger = false;
      }
  deviceUpdate(e: Event): void {
         if(this.controller == null)
         {
            return;
         }
         var control: any= null;
         var controlMap: any= {};
         var i: number = uint(0);
         while(i < this.controller.numControls)
         {
            control = this.controller.getControlAt(i);
            controlMap[control.id] = control;
            i++;
         }
         this.hPad = controlMap["AXIS_0"];
         this.xButton = controlMap["BUTTON_6"];
         this.aButton = controlMap["BUTTON_4"];
         this.rTrigger = controlMap["BUTTON_10"];
      }
  remove(): void {
         clearInterval(this.updateInterval);
         clearTimeout(this.explodeImmunityTimeout);
         if(this.itemClass != null)
         {
            this.itemClass.remove();
            this.itemClass = null;
         }
         if(Settings.isMobile)
         {
            MobileControls.hidePlayerControls();
         }
         super.remove();
      }
  touchBlock(param1: Block, param2: string, timePast: number): void {
         var _loc_14= undefined;
         var _loc_15= undefined;
         var itemSettingsString: string= null;
         var itemSettings: any= null;
         var property: any= null;
         var destinationFound= undefined;
         var _loc_6= null;
         var _loc_7= null;
         var _loc_8= 0;
         var _loc_9= null;
         var _loc_10= NaN;
         var _loc_11= null;
         var _loc_12= 0;
         var _loc_13= null;
         var _loc_3= false;
         if(param2 != "bump" || param1 != this.lastBumpBlock)
         {
            _loc_3 = true;
         }
         super.touchBlock(param1,param2,timePast);
         var _loc_4= param1.vars;
         var _loc_5= (_loc_4[param2]);
         if(_loc_3)
         {
            if(_loc_5.type == BlockSideSettings.GIVE_ITEM)
            {
               if(param1.itemSupply > 0)
               {
                  this.gotAnItem = true;
                  if(this.gotItemArray.indexOf(param1) == -1)
                  {
                     this.gotItemArray.push(param1);
                     _loc_6 = ArrayUtil.copyArray(_loc_4.itemArray);
                     _loc_7 = (MapPage.instance).itemArray;
                     _loc_8 = 0;
                     while(_loc_8 < _loc_6.length)
                     {
                        _loc_9 = _loc_6[_loc_8];
                        if(_loc_7.indexOf(_loc_9) == -1)
                        {
                           _loc_6.splice(_loc_8,1);
                           _loc_8--;
                        }
                        _loc_8++;
                     }
                     if(_loc_6.length > 0)
                     {
                        _loc_10 = Math.floor(Math.random() * _loc_6.length);
                        if(param1.predictableItems)
                        {
                           if(this.nextItem >= _loc_6.length)
                           {
                              this.nextItem = int(0);
                           }
                           _loc_10 = this.nextItem;
                           ++this.nextItem;
                        }
                        _loc_9 = _loc_6[_loc_10];
                        this.setVariableAndSync("item",_loc_9);
                        if(GamePage.instance instanceof MatchPage)
                        {
                           SocketManager.socket.sendGetItem(param1.tileX,param1.tileY,param2,_loc_9);
                        }
                     }
                     _loc_14 = param1;
                     _loc_15 = _loc_14.itemSupply - 1;
                     _loc_14.itemSupply = _loc_15;
                     if(_loc_14.itemSupply <= 0)
                     {
                        _loc_14.dullOut();
                     }
                     Sounds.startGameSound(new StarSound(),this,0.75);
                  }
               }
            }
            if(_loc_5.type == BlockSideSettings.C_ITEM)
            {
               if(param1.itemSupply > 0)
               {
                  this.gotAnItem = true;
                  if(this.gotItemArray.indexOf(param1) == -1)
                  {
                     this.gotItemArray.push(param1);
                     _loc_6 = ArrayUtil.copyArray(_loc_4.itemArray);
                     _loc_7 = (MapPage.instance).itemArray;
                     _loc_8 = 0;
                     while(_loc_8 < _loc_6.length)
                     {
                        _loc_9 = _loc_6[_loc_8];
                        if(_loc_7.indexOf(_loc_9) == -1)
                        {
                           _loc_6.splice(_loc_8,1);
                           _loc_8--;
                        }
                        _loc_8++;
                     }
                     if(_loc_6.length > 0)
                     {
                        _loc_10 = Math.floor(Math.random() * _loc_6.length);
                        _loc_9 = _loc_6[_loc_10];
                        itemSettingsString = _loc_9;
                        itemSettings = param1.vars.itemType.settings[_loc_9];
                        for (property of $keys(itemSettings))
                        {
                           itemSettingsString += "|" + property + "|" + itemSettings[property];
                        }
                        this.setVariableAndSync("item",itemSettingsString);
                        if(GamePage.instance instanceof MatchPage)
                        {
                           SocketManager.socket.sendGetItem(param1.tileX,param1.tileY,param2,itemSettingsString);
                        }
                     }
                     _loc_14 = param1;
                     _loc_15 = _loc_14.itemSupply - 1;
                     _loc_14.itemSupply = _loc_15;
                     if(_loc_14.itemSupply <= 0)
                     {
                        _loc_14.dullOut();
                     }
                     Sounds.startGameSound(new StarSound(),this,0.75);
                  }
               }
            }
            else if(_loc_5.type == BlockSideSettings.INC_STATS || _loc_5.type == BlockSideSettings.DEC_STATS)
            {
               if(param1.statSupply > 0)
               {
                  --param1.statSupply;
                  if(_loc_5.type == BlockSideSettings.INC_STATS)
                  {
                     this.vars.velLevel = Maths.limit(this.vars.velLevel + _loc_5.incSpeed,0,this.vars.maxStat);
                     this.vars.accelLevel = Maths.limit(this.vars.accelLevel + _loc_5.incAccel,0,this.vars.maxStat);
                     this.vars.jumpLevel = Maths.limit(this.vars.jumpLevel + _loc_5.incJump,0,this.vars.maxStat);
                     Sounds.startGameSound(new BumpHappySound(),this);
                  }
                  else
                  {
                     this.vars.velLevel = Maths.limit(this.vars.velLevel - _loc_5.incSpeed,0,this.vars.maxStat);
                     this.vars.accelLevel = Maths.limit(this.vars.accelLevel - _loc_5.incAccel,0,this.vars.maxStat);
                     this.vars.jumpLevel = Maths.limit(this.vars.jumpLevel - _loc_5.incJump,0,this.vars.maxStat);
                     Sounds.startGameSound(new BumpSadSound(),this);
                  }
                  if(param1.statSupply <= 0)
                  {
                     param1.dullOut();
                  }
               }
            }
            else if(_loc_5.type == BlockSideSettings.C_STATS)
            {
               if(param1.statSupply > 0)
               {
                  --param1.statSupply;
                  if(!param1.stats.setStatsTo)
                  {
                     this.vars.velLevel = Maths.limit(this.vars.velLevel + param1.stats.speed,0,param1.stats.maxStat);
                     this.vars.accelLevel = Maths.limit(this.vars.accelLevel + param1.stats.accel,0,param1.stats.maxStat);
                     this.vars.jumpLevel = Maths.limit(this.vars.jumpLevel + param1.stats.jump,0,param1.stats.maxStat);
                  }
                  else
                  {
                     this.vars.velLevel = Maths.limit(param1.stats.speed,0,param1.stats.maxStat);
                     this.vars.accelLevel = Maths.limit(param1.stats.accel,0,param1.stats.maxStat);
                     this.vars.jumpLevel = Maths.limit(param1.stats.jump,0,param1.stats.maxStat);
                  }
                  this.vars.maxStat = param1.stats.maxStat;
                  if(param1.stats.speed >= 0 && param1.stats.accel >= 0 && param1.stats.jump >= 0)
                  {
                     Sounds.startGameSound(new BumpHappySound(),this);
                  }
                  else if(param1.stats.speed < 0 && param1.stats.accel < 0 && param1.stats.jump < 0)
                  {
                     Sounds.startGameSound(new BumpSadSound(),this);
                  }
                  else
                  {
                     Sounds.startGameSound(new BumpHappySound(),this);
                     Sounds.startGameSound(new BumpSadSound(),this);
                  }
                  if(param1.statSupply <= 0)
                  {
                     param1.dullOut();
                  }
               }
            }
            else if(_loc_5.type == BlockSideSettings.INC_HEALTH)
            {
               if(param1.statSupply > 0)
               {
                  _loc_14 = param1;
                  _loc_15 = _loc_14.statSupply - 1;
                  _loc_14.statSupply = _loc_15;
                  Sounds.startGameSound(new BumpHeartSound(),this,10);
                  if(this.lifeBar != null)
                  {
                     this.setVariable("life",Maths.limit(this.vars.life + 1,0,this.lifeBar.maxPercent));
                  }
                  if(_loc_14.statSupply <= 0)
                  {
                     _loc_14.dullOut();
                  }
               }
            }
            else if(_loc_5.type == BlockSideSettings.DISPENSE)
            {
               if(param1.statSupply > 0)
               {
                  _loc_14 = param1;
                  _loc_15 = _loc_14.statSupply - 1;
                  _loc_14.statSupply = _loc_15;
                  if(_loc_14.statSupply <= 0)
                  {
                     _loc_14.dullOut();
                  }
               }
            }
            else if(_loc_5.type == BlockSideSettings.GLASS)
            {
               param1.timeTillBreak = int(param1.timeTillBreak - (timePast));
               if(param1.timeTillBreak > 0)
               {
                  if(param1.timeTillBreak < 500)
                  {
                     GamePage.instance.createBlockParticle(param1,Math.floor(Math.random() * param1.width),Math.floor(Math.random() * param1.height),10,10);
                  }
               }
               else
               {
                  GamePage.instance.localShatterBlock(param1,{
                     "source":this,
                     "side":param2
                  });
               }
            }
            else if(_loc_5.type == BlockSideSettings.CHECKPOINT && param1.realVars[param2].type == BlockSideSettings.CHECKPOINT)
            {
               if(!param1.checkPointReset)
               {
                  this.activeCheckpoint = true;
                  this.markSafeBlock(param1,param2);
               }
               else
               {
                  this.activeCheckpoint = false;
               }
            }
            else if(_loc_5.type == BlockSideSettings.EXPLODE)
            {
               if(!param1.removed && this.tempExplodeImmunity == false)
               {
                  if(param1.vars.type == BlockSettings.IMPERVIOUS)
                  {
                     this.tempExplodeImmunity = true;
                     clearTimeout(this.explodeImmunityTimeout);
                     this.explodeImmunityTimeout = uint(setTimeout($b(this, 'resetExplodeImmunity'),500));
                  }
                  this.beHurtByBlock(param1);
                  GamePage.instance.localExplodeBlock(param1,{
                     "source":this,
                     "side":param2
                  });
               }
            }
            else if(_loc_5.type == BlockSideSettings.HURT)
            {
               if(this.recoveryTimer <= 0)
               {
                  this.beHurtByBlock(param1);
               }
            }
            else if(_loc_5.type == BlockSideSettings.FINISH)
            {
               if(GamePage.instance.levelType == "race" || GamePage.instance.levelType == "deathmatch")
               {
                  GamePage.instance.iFinished();
                  this.remove();
               }
            }
            else
            {
               if(_loc_5.type == BlockSideSettings.SAFETY)
               {
                  this.gotoSafePosition();
                  throw EndBlockTestPhysicFlowError.INSTANCE;
               }
               if(_loc_5.type == BlockSideSettings.SHATTER)
               {
                  GamePage.instance.localShatterBlock(param1,{
                     "source":this,
                     "side":param2
                  });
               }
               else if(_loc_5.type == BlockSideSettings.TELEPORT)
               {
                  _loc_11 = GamePage.instance.teleportArrays[param1.id];
                  if(_loc_11 != null && _loc_11.length > 0 && param1.teleportActive)
                  {
                     _loc_12 = _loc_11.indexOf(param1);
                     if(_loc_12 + 1 == _loc_11.length)
                     {
                        _loc_12 = 0;
                     }
                     else
                     {
                        _loc_12++;
                     }
                     if(param1.randomDestination && _loc_11.length > 1)
                     {
                        destinationFound = false;
                        while(!destinationFound)
                        {
                           _loc_12 = Math.floor(Math.random() * _loc_11.length);
                           if(_loc_11[_loc_12] != param1)
                           {
                              destinationFound = true;
                           }
                        }
                     }
                     _loc_13 = _loc_11[_loc_12];
                     if(param2 == "bump")
                     {
                        if(this.rotation == 0)
                        {
                           param2 = "bottom";
                        }
                        else if(this.rotation == 180 || this.rotation == -180)
                        {
                           param2 = "top";
                        }
                        else if(this.rotation == 90 || this.rotation == -270)
                        {
                           param2 = "right";
                        }
                        else if(this.rotation == -90 || this.rotation == 270)
                        {
                           param2 = "left";
                        }
                     }
                     if(param2 == "left")
                     {
                        this.shiftedX = this.getBlockBoundry(_loc_13,"left") - Block.halfWidth * this.multiplierX;
                        this.shiftedY = this.getBlockBoundry(_loc_13,"top") + Block.halfHeight * this.multiplierY;
                     }
                     else if(param2 == "right")
                     {
                        this.shiftedX = this.getBlockBoundry(_loc_13,"right") + Block.halfWidth * this.multiplierX;
                        this.shiftedY = this.getBlockBoundry(_loc_13,"top") + Block.halfHeight * this.multiplierY;
                     }
                     else if(param2 == "top")
                     {
                        this.shiftedX = this.getBlockBoundry(_loc_13,"left") + Block.halfWidth * this.multiplierX;
                        this.shiftedY = this.getBlockBoundry(_loc_13,"top") - Block.halfHeight * this.multiplierY;
                     }
                     else if(param2 == "bottom")
                     {
                        this.shiftedX = this.getBlockBoundry(_loc_13,"left") + Block.halfWidth * this.multiplierX;
                        this.shiftedY = this.getBlockBoundry(_loc_13,"bottom") + Block.halfHeight * this.multiplierY;
                     }
                     this.shiftedVelX = 0;
                     this.shiftedVelY = 0;
                     this.shiftedMoveX = 0;
                     this.shiftedMoveY = 0;
                     param1.decreaseUseCount();
                     if(param1 != _loc_13)
                     {
                        _loc_13.decreaseUseCount();
                     }
                     _loc_13.deactivateTeleportForDuration(_loc_13.teleportCooldown);
                     param1.deactivateTeleportForDuration(param1.teleportCooldown);
                     if(!this.teleStealth)
                     {
                        this.showPoofEffect();
                     }
                     this.justTeleported = true;
                     this.stillHoldingUp = false;
                     throw EndBlockTestPhysicFlowError.INSTANCE;
                  }
               }
               else if(_loc_5.type == BlockSideSettings.ROTATE_RIGHT)
               {
                  this.setVariable("rot",this.vars.rot + 90);
               }
               else if(_loc_5.type == BlockSideSettings.ROTATE_LEFT)
               {
                  this.setVariable("rot",this.vars.rot - 90);
               }
               else if(_loc_5.type == BlockSideSettings.LUA)
               {
                  GamePage.instance.callLuaBlock(param1,param2,this);
               }
            }
            if(param2 == "top")
            {
               _loc_4 = param1.realVars;
               if(_loc_4.type != BlockSettings.MOVE && _loc_4.type != BlockSettings.WEAK && !this.anyBlockSideIs(param1,BlockSideSettings.EXPLODE) && !this.anyBlockSideIs(param1,BlockSideSettings.VANISH) && !this.anyBlockSideIs(param1,BlockSideSettings.SAFETY) && !this.anyBlockSideIs(param1,BlockSideSettings.BE_PUSHED) && !this.anyBlockSideIs(param1,BlockSideSettings.CRUMBLE) && !this.anyBlockSideIs(param1,BlockSideSettings.SHATTER) && !this.anyBlockSideIs(param1,BlockSideSettings.GLASS))
               {
                  this.markSafeBlock(param1);
               }
            }
         }
      }
  init(): void {
         super.init();
         this.updateInterval = uint(setInterval($b(this, 'checkUpdate'),this.minUpdateFreq));
         this.safeX = this.x;
         this.safeY = this.y;
         this.originalSafeX = int(this.x);
         this.originalSafeY = int(this.y);
         MapManager.map.blockMap.drawBlocks();
         this.followPlayer = true;
      }
  hit(param1: number, param2: number, damage: number = 1, fromPlayer: ActivePlayer = null, noKnockback: boolean = false): void {
    damage = int(damage);
         if(Boolean(this.spicedVars.spiced) && Boolean(this.spicedVars.canBeInvincible))
         {
            this.spicedVars.canBeInvincible = false;
            return;
         }
         if(!noKnockback && this.ushankaTimer < 0)
         {
            if(this.bananaTimer > 0)
            {
               this.velX = param1 * 4;
               this.velY = param2 * 2;
               this.shiftedVelX = param1 * 4;
               this.shiftedVelY = param2 * 2;
            }
            else
            {
               this.velX = param1;
               this.velY = param2;
               this.shiftedVelX = param1;
               this.shiftedVelY = param2;
            }
            this.useShiftedVel = false;
         }
         if(this.recoveryTimer <= 0)
         {
            if(!this.shield && !this.crownHat)
            {
               if(fromPlayer != null)
               {
                  fromPlayer.increaseDashScore(damage);
               }
               this.setVariable("hurt",true);
               if(this.lifeBar != null)
               {
                  this.setVariable("life",Maths.limit(this.vars.life - damage,0,this.lifeBar.maxPercent));
                  if(this.vars.life <= 0)
                  {
                     if(GamePage.instance.levelType == "deathmatch" || GamePage.instance.levelType == "damageDash")
                     {
                        GamePage.instance.iFinished();
                        this.remove();
                     }
                     else if(GamePage.instance.extraHealth > 0)
                     {
                        GamePage.instance.iFinished();
                        this.remove();
                     }
                  }
               }
            }
         }
         if(!this.shield && this.hatArray[1] != 1 && this.hatArray[1] != 0 && !this.stickyHats)
         {
            GamePage.instance.localLoseHat(this);
         }
      }
  doesDamage(damageDealt: number): void {
         var i: number= 1;
         while(i <= damageDealt)
         {
            if(GamePage.instance instanceof MatchPage)
            {
               (GamePage.instance).incDash();
            }
            i++;
         }
      }
  enterFrameHandler(event: Event): void {
    var timeToPass; // undeclared in decompiled source
         if(GamePage.instance instanceof MatchPage)
         {
            if(GamePage.instance.levelType == "deathmatch")
            {
               if(Key.isDown(16) && Key.isDown(17) && Key.isDown(70))
               {
                  timeToPass = GamePage.instance.getGameTimer().getElapsedMS();
                  if(GamePage.instance.levelType == "deathmatch")
                  {
                     if(GamePage.instance.localPlayer != null)
                     {
                        if(GamePage.instance.localPlayer.getVars().life <= 0)
                        {
                           timeToPass *= -1;
                        }
                     }
                  }
                  SocketManager.socket.finishMatch(timeToPass);
               }
            }
            if(Key.isDown(16) && Key.isDown(17) && Key.isDown(82))
            {
            }
         }
         -this.assignKeys();
         if(this.timeSinceUpdate > this.maxUpdateFreq)
         {
            this.sendUpdate();
         }
         super.enterFrameHandler(event);
         if(this.justTeleported)
         {
            this.justTeleported = false;
            if(!this.teleStealth)
            {
               this.showTeleportEffect();
            }
            this.sendUpdate(true,true);
         }
         if(this.blockMap == null)
         {
            this.blockMap = MapManager.map.blockMap;
         }
         this.blockMap.drawBlocks();
      }
  get timeSinceUpdate(): number {
         var _loc_1= getTimer();
         return _loc_1 - this.lastUpdateTime;
      }
  setItem(param1: string, param2: any = ""): void {
         var _loc_3= null;
         super.setItem(param1,param2);
         var _loc_2= Items.getItemTitle(param1);
         if(_loc_3 != null)
         {
            _loc_3 = GamePage.instance.itemDisplay;
            _loc_3.gotoAndStop(_loc_2);
            if(_loc_2 == "None")
            {
               _loc_2 = "";
            }
            _loc_3.holder1.textBox.text = _loc_2;
            _loc_3.holder2.textBox.text = _loc_2;
         }
      }
  setHats(hats: any[]): void {
         super.setHats(hats);
      }
  beHurtByBlock(param1: Block, param2: number = 0.3, damage: number = 1): void {
    damage = int(damage);
         var _loc_3= Data.rotatePoint(20,20,0);
         var _loc_4= Data.rotatePoint(0,-30,-this.rotation);
         var _loc_5= this.x + _loc_4.x - (param1.x + _loc_3.x);
         var _loc_6= this.y + _loc_4.y - (param1.y + _loc_3.y);
         var _loc_7= Math.atan2(_loc_6,_loc_5);
         var _loc_8= Math.cos(_loc_7) * param2;
         var _loc_9= Math.sin(_loc_7) * param2;
         var _loc_10= Data.rotatePoint(_loc_8,_loc_9,this.rotation);
         this.hit(_loc_10.x,_loc_10.y,damage);
      }
  beHurtByNapalm(param1: ActivePlayer, param2: number = 0.3, damage: number = 1): void {
    damage = int(damage);
         if(this.hurtByBarbedNapalm)
         {
            param2 = 999;
            this.hurtByBarbedNapalm = false;
         }
         var _loc_3= Data.rotatePoint(param1.scaleX,param1.scaleY,0);
         var _loc_4= Data.rotatePoint(0,-30,-this.rotation);
         var _loc_5= this.x + _loc_4.x - (param1.x + _loc_3.x);
         var _loc_6= this.y + _loc_4.y - (param1.y + _loc_3.y);
         var _loc_7= Math.atan2(_loc_6,_loc_5);
         var _loc_8= Math.cos(_loc_7) * param2;
         var _loc_9= Math.sin(_loc_7) * param2;
         var _loc_10= Data.rotatePoint(_loc_8,_loc_9,this.rotation);
         this.hit(_loc_10.x,_loc_10.y,damage);
      }
  anyBlockSideIs(param1: Block, param2: string): boolean {
         var _loc_3= param1.realVars;
         if(_loc_3.top.type == param2 || _loc_3.bottom.type == param2 || _loc_3.left.type == param2 || _loc_3.right.type == param2 || _loc_3.bump.type == param2)
         {
            return true;
         }
         return false;
      }
  markSafeBlock(param1: Block, param2: string = "top"): void {
         if(this.activeCheckpoint && param1.realVars[param2].type != BlockSideSettings.CHECKPOINT)
         {
            return;
         }
         if(this.rotation == 0)
         {
            if(param2 == "top")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY - 20;
            }
            else if(param2 == "bottom")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY + 40;
            }
            else if(param2 == "left")
            {
               this.safeX = param1.posX - 20;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "right")
            {
               this.safeX = param1.posX + 40;
               this.safeY = param1.posY + Block.height / 2;
            }
         }
         else if(this.rotation == -90)
         {
            if(param2 == "top")
            {
               this.safeX = param1.posX - 20;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "bottom")
            {
               this.safeX = param1.posX + 40;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "left")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY + 40;
            }
            else if(param2 == "right")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY - 20;
            }
         }
         else if(this.rotation == 180 || this.rotation == -180)
         {
            if(param2 == "top")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY + 20 + Block.height;
            }
            else if(param2 == "bottom")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY - 40;
            }
            else if(param2 == "left")
            {
               this.safeX = param1.posX + 20 + Block.width;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "right")
            {
               this.safeX = param1.posX - 20;
               this.safeY = param1.posY + Block.height / 2;
            }
         }
         else if(this.rotation == 90)
         {
            if(param2 == "top")
            {
               this.safeX = param1.posX + 20 + Block.width;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "bottom")
            {
               this.safeX = param1.posX - 40;
               this.safeY = param1.posY + Block.height / 2;
            }
            else if(param2 == "left")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY - 20;
            }
            else if(param2 == "right")
            {
               this.safeX = param1.posX + Block.width / 2;
               this.safeY = param1.posY + 40;
            }
         }
         this.safeRepeats = int(0);
      }
  touchingBurningPlayer(): boolean {
         var _loc_3= null;
         var _loc_1= false;
         var player= null;
         for (player of $each(GamePage.instance.playerArray))
         {
            if(player != null)
            {
               if(Boolean(player.napalm) && player != this)
               {
                  _loc_3 = this.localToGlobal(new Point(0,0));
                  _loc_1 = player.touchingPoint(_loc_3.x,_loc_3.y);
                  if(!_loc_1)
                  {
                     _loc_3 = this.localToGlobal(new Point(0,-this.height));
                     _loc_1 = player.touchingPoint(_loc_3.x,_loc_3.y);
                  }
                  if(_loc_1)
                  {
                     if(player.tinfoilHat)
                     {
                        this.hurtByBarbedNapalm = true;
                     }
                     return _loc_1;
                  }
               }
            }
         }
         return _loc_1;
      }
  burningPlayer(): RemotePlayer {
         var _loc_4= undefined;
         var _loc_3= null;
         var _loc_1= false;
         var player= null;
         for (player of $each(GamePage.instance.playerArray))
         {
            if(player != null)
            {
               if(Boolean(player.napalm) && player != this)
               {
                  _loc_3 = this.localToGlobal(new Point(0,0));
                  _loc_1 = player.touchingPoint(_loc_3.x,_loc_3.y);
                  if(!_loc_1)
                  {
                     _loc_3 = this.localToGlobal(new Point(0,-this.height));
                     _loc_1 = player.touchingPoint(_loc_3.x,_loc_3.y);
                  }
                  _loc_4 = player;
                  if(_loc_1)
                  {
                     return _loc_4;
                  }
               }
            }
         }
         return _loc_4;
      }
  touchingSpicedPlayer(): RemotePlayer {
         var ourPointBottom: Point= null;
         var ourPointTop: Point= null;
         var otherPlayer: Player= null;
         var isTouchingSpicedPlayer: boolean= false;
         for (otherPlayer of $each(GamePage.instance.playerArray))
         {
            if(!(otherPlayer == null || !otherPlayer.spicedVars.spiced || otherPlayer == this || otherPlayer.spicedVars.pushedPlayers.indexOf(this) != -1))
            {
               ourPointBottom = this.localToGlobal(new Point(0,0));
               ourPointTop = this.localToGlobal(new Point(0,-this.height));
               isTouchingSpicedPlayer = Boolean(otherPlayer.touchingPoint(ourPointBottom.x,ourPointBottom.y)) || Boolean(otherPlayer.touchingPoint(ourPointTop.x,ourPointTop.y));
               if(isTouchingSpicedPlayer)
               {
                  return otherPlayer;
               }
            }
         }
         return null;
      }
  step(stepTimeMS: number): void {
         var hats: any[]= null;
         var i= undefined;
         var hat: any= null;
         var playerBurning: ActivePlayer= null;
         var hitSpicedPlayerPoint: Point= null;
         var deltaPoint: Point= null;
         if(GameChat.inChatMode && this.typing == false)
         {
            this.typing = true;
            this.room.sendToRoom({"id":1},false,"chatBubble");
         }
         else if(!GameChat.inChatMode && this.typing == true)
         {
            this.typing = false;
            this.room.sendToRoom({"id":0},false,"chatBubble");
         }
         if(this.autoUpTicks > 0)
         {
            this.setVariable("up",true);
            --this.autoUpTicks;
         }
         if(this.autoDownTicks > 0)
         {
            this.setVariable("down",true);
            --this.autoDownTicks;
         }
         if(this.autoLeftTicks > 0)
         {
            this.setVariable("left",true);
            --this.autoLeftTicks;
         }
         if(this.autoRightTicks > 0)
         {
            this.setVariable("right",true);
            --this.autoRightTicks;
         }
         if(this.autoSpaceTicks > 0)
         {
            this.setVariable("space",true);
            --this.autoSpaceTicks;
         }
         --this.disableUpTicks;
         --this.disableDownTicks;
         --this.disableLeftTicks;
         --this.disableRightTicks;
         --this.disableSpaceTicks;
         if(this.trafficConeHat)
         {
            if(!this.tinfoilHatCheck)
            {
               this.tinfoilHatCheck = true;
               MapManager.map.scale *= 0.8;
            }
         }
         else if(this.tinfoilHatCheck)
         {
            this.tinfoilHatCheck = false;
            MapManager.map.scale *= 1 / 0.8;
         }
         GamePage.instance.luaGame.callTickTimers(stepTimeMS);
         GamePage.instance.luaGame.tick.call(stepTimeMS);
         if(MapPage.instance instanceof LevelEditorPage)
         {
            if(Key.isDown(Keyboard.SHIFT))
            {
               if(!this.gallonHat)
               {
                  this.gallonHat = this.gaveGalloon = true;
               }
            }
            else if(this.gaveGalloon)
            {
               hats = new Array();
               i = 1;
               while(i < this.hatGraphicArray.length)
               {
                  hat = ({} as any);
                  hat.num = this.hatArray[i];
                  hat.color = this.hatColorArray[i];
                  hats.push(hat);
                  i++;
               }
               this.setHats(hats);
            }
         }
         if(this.touchingBurningPlayer())
         {
            playerBurning = this.burningPlayer();
            if(!playerBurning.checkForFriendlyFire(this))
            {
               this.checkForDamage(playerBurning,1,0);
               this.beHurtByNapalm($as(this.burningPlayer(), RemotePlayer));
            }
         }
         var hitSpicedPlayer: Player= this.touchingSpicedPlayer();
         if(hitSpicedPlayer != null)
         {
            hitSpicedPlayerPoint = hitSpicedPlayer.localToGlobal(new Point(0,0));
            deltaPoint = hitSpicedPlayerPoint.subtract(this.localToGlobal(new Point(0,0)));
            deltaPoint.normalize(hitSpicedPlayer.spicedVars.superSpiced ? 0.75 : 0.25);
            this.velX += -deltaPoint.x;
            this.velY += -deltaPoint.y;
            hitSpicedPlayer.spicedVars.pushedPlayers.push(this);
         }
         var _loc_3= null;
         this.gotAnItem = false;
         if(this.vars.hurt)
         {
            if(this.bananaTimer > 0)
            {
               GamePage.instance.localLoseHat(this);
            }
            if(this.hurtTimer <= 0)
            {
               this.hurtTimer = int(0);
               this.setVariable("hurt",false);
            }
         }
         if(this.swimming)
         {
            this.playSwimmingSounds();
            if(this.napalm)
            {
               this.napalm = false;
               this.setVariable("item",Items.NONE);
            }
         }
         var _loc_2= MapManager.map.blockMap;
         if(_loc_2 != null)
         {
            if(this.x > _loc_2.maxX + this.fallTolerance)
            {
               this.gotoSafePosition();
            }
            if(this.x < _loc_2.minX - this.fallTolerance)
            {
               this.gotoSafePosition();
            }
            if(this.y > _loc_2.maxY + this.fallTolerance)
            {
               this.gotoSafePosition();
            }
            if(this.y < _loc_2.minY - this.fallTolerance && MapManager.map.rot != 0)
            {
               this.gotoSafePosition();
            }
         }
         super.step(stepTimeMS);
         if(!this.removed)
         {
            if(!this.gotAnItem && this.gotItemArray.length > 0)
            {
               this.gotItemArray = new Array();
            }
            if(this.swimming && !this.touchingGround)
            {
               _loc_3 = this.getBlock(this.x,this.y);
               if(_loc_3 != null && _loc_3.realVars.type == BlockSettings.WATER)
               {
                  this.markSafeBlock(_loc_3);
               }
            }
         }
      }
  minimap(visibility: boolean): void {
         this.minimapVision = visibility;
         GamePage.instance.minimap.visible = visibility;
      }
  movePlayerTo(xPos: number, yPos: number, keepVelocity: boolean = false): void {
         this.justTeleported = true;
         if(!keepVelocity)
         {
            this.shiftedVelX = 0;
            this.shiftedVelY = 0;
            this.shiftedMoveX = 0;
            this.shiftedMoveY = 0;
         }
         this.stillHoldingUp = false;
         this.shiftedX += xPos;
         this.shiftedY += yPos;
         if(!this.teleStealth)
         {
            this.showTeleportEffect(true);
            this.showPoofEffect(true);
         }
      }
  movePlayerToPos(xPos: number, yPos: number, keepVelocity: boolean = false): void {
         this.justTeleported = true;
         if(!keepVelocity)
         {
            this.shiftedVelX = 0;
            this.shiftedVelY = 0;
            this.shiftedMoveX = 0;
            this.shiftedMoveY = 0;
         }
         this.stillHoldingUp = false;
         this.shiftedX = xPos;
         this.shiftedY = yPos;
         if(!this.teleStealth)
         {
            this.showTeleportEffect(true);
            this.showPoofEffect(true);
         }
      }
  playSwimmingSounds(): void {
         var _loc_1= null;
         var _loc_2= NaN;
         var _loc_3= NaN;
         var _loc_4= NaN;
         if(Math.random() > 0.95)
         {
            _loc_2 = Math.random();
            _loc_3 = Math.random();
            _loc_4 = Math.random() * 2 - 1;
            if(_loc_2 > 0.75)
            {
               _loc_1 = new Bubble1Sound();
            }
            else if(_loc_2 > 0.5)
            {
               _loc_1 = new Bubble2Sound();
            }
            else if(_loc_2 > 0.25)
            {
               _loc_1 = new Bubble3Sound();
            }
            else
            {
               _loc_1 = new Bubble4Sound();
            }
            Sounds.startSound(_loc_1,_loc_3,_loc_4);
         }
      }
  setRoom(param1: BlossomRoom): void {
         this.room = param1;
      }
  gotoSafePosition(): void {
         var _loc_1= undefined;
         _loc_1 = this;
         var _loc_2= this.safeRepeats + 1;
         _loc_1.safeRepeats = _loc_2;
         this.showPoofEffect();
         _loc_1 = this.safeX;
         this.shiftedX = this.safeX;
         this.realX = _loc_1;
         _loc_1 = this.safeY;
         this.shiftedY = this.safeY;
         this.realY = _loc_1;
         this.x = this.realX;
         this.y = this.realY;
         this.velX = 0;
         this.velY = 0.01;
         this.justTeleported = true;
         this.useShiftedVel = false;
      }
  sendUpdate(param1: boolean = false, param2: boolean = false): void {
         var _loc_5= null;
         var _loc_6= undefined;
         var _loc_3= false;
         var _loc_4= this.getPosObj();
         if(this.room != null)
         {
            for (_loc_5 of $keys(this.vars))
            {
               _loc_6 = this.vars[_loc_5];
               if(this.remoteVars[_loc_5] != this.vars[_loc_5])
               {
                  this.remoteVars[_loc_5] = this.vars[_loc_5];
                  _loc_4[_loc_5] = this.vars[_loc_5];
                  _loc_3 = true;
               }
            }
            if(Boolean(_loc_3) || param1)
            {
               if(param2)
               {
                  _loc_4.teleport = true;
               }
               SocketManager.socket.update(_loc_4);
               this.lastUpdateTime = getTimer();
            }
         }
      }
  checkUpdate(): void {
         if(this.timeSinceUpdate > this.minUpdateFreq)
         {
            this.sendUpdate(true);
         }
      }
  getPosObj(): any {
         var _loc_1= new Array();
         _loc_1[0] = Math.round(this.realX * 1000) / 1000;
         _loc_1[1] = Math.round(this.realY * 1000) / 1000;
         _loc_1[2] = Math.round(this.velX * 10) / 10;
         _loc_1[3] = Math.round(this.velY * 10) / 10;
         _loc_1[4] = this.m.scaleX;
         var _loc_2= ({} as any);
         _loc_2.p = _loc_1;
         return _loc_2;
      }
  resetExplodeImmunity(): void {
         this.tempExplodeImmunity = false;
      }
  setPosObj(param1: any): void {
         if(param1.p[4] == null)
         {
            param1.p[4] = this.m.scaleX;
         }
         var _loc_2= param1.p;
         this.realX = _loc_2[0];
         this.realY = _loc_2[1];
         this.velX = _loc_2[2];
         this.velY = _loc_2[3];
         this.m.scaleX = _loc_2[4];
         this.m.x = 0;
         this.m.y = 0;
         this.x = this.realX;
         this.y = this.realY;
      }
  isKeyPressed(keyPressed: number): boolean {
    keyPressed = int(keyPressed);
         if(!GameChat.inChatMode && (TextPopup.inputMode != null && !TextPopup.inputMode))
         {
            return Key.isDown(keyPressed);
         }
         return false;
      }
  setVariableAndSync(variable: string, value: any): void {
         delete this.remoteVars[variable];
         this.setVariable(variable,value);
      }
  constructor() {
         super();
         GamePage.instance.localPlayer = this;
         GamePage.instance.luaPlayer = this.lua;
         this.remoteVars = ({} as any);
         this.gotItemArray = new Array();
         var gameInput: GameInput= new GameInput();
         gameInput.addEventListener(GameInputEvent.DEVICE_ADDED,$b(this, 'handleInputEvent'));
         gameInput.addEventListener(GameInputEvent.DEVICE_REMOVED,$b(this, 'handleDeviceRemovedEvent'));
         gameInput.addEventListener(Event.ENTER_FRAME,$b(this, 'deviceUpdate'));
      }
}
$reg('com.jiggmin.pr3.player.LocalPlayer', LocalPlayer);
