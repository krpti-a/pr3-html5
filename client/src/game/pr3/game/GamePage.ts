// Ported from com/jiggmin/pr3/game/GamePage.as
import { Bitmap, BitmapData, Event, KeyLocation, KeyboardEvent, Matrix, MouseEvent, Point, clearInterval, clearTimeout, getTimer, setInterval, setTimeout, trace } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { LevelPage } from '../mapPage/LevelPage.ts';
import { ActivePlayer, AlienEffect, Block, BlockIntervalManager, BlockLuaWrapper, BlockManager, BlockSettings, BlossomUser, CoinEffect, CountdownGraphic, Data, EffectMapLayer, ExplosionEffectGraphic, ExplosionSound, GameChat, GameHealth, GameLuaWrapper, GameTimer, GoSound, HatEffect, ItemDisplayGraphic, LevelEditorPage, LevelLuaWrapper, LocalPlayer, LocalPlayerLuaWrapper, LockHandler, LockHolder, LuaReference, MapLayer, MapManager, MatchPage, Maths, MessagePopup, Minimap, MobileControls, MusicDropdown, OfflineGamePage, PM_PRNG, ParticleEffect, PlatformRacing3, PrizePopup, ProjectileEffect, ProjectileEffectLuaWrapper, ReadySound, RemotePlayer, Settings, ShatterBlockSound, SmokeEffectGraphic, SnowEffect, SocketManager, Sounds, TextPopup, VictorySound, WindEffect } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GamePage extends LevelPage {
  declare static instance: GamePage;
  victorySoundTimeout: number = 0;
  minimapMinX: number = 100;
  autoDisplayMinimap: boolean = true;
  declare finishPositions: any[];
  declare hatPositions: any[];
  declare buttonsPressed: any[];
  countdownInterval: number = 0;
  declare minimap: Minimap;
  declare startPositions: any[];
  declare localPlayer: LocalPlayer;
  declare itemDisplay: ItemDisplayGraphic;
  countdown: number = 0;
  minimapMaxX: number = 530;
  declare prizePopup: PrizePopup;
  declare looseHatArray: any[];
  lastBlockUpdate: number = NaN;
  declare timer: GameTimer;
  declare health: GameHealth;
  declare teleportArrays: any[];
  declare musicDropdown: MusicDropdown;
  declare blockIntervalManager: BlockIntervalManager;
  canPlayVictorySound: boolean = true;
  declare playerHolder2: MapLayer;
  startPositionIndex: number = 0;
  declare playerHolder: MapLayer;
  declare playerArray: any[];
  inGame: boolean = false;
  luaBlockCached: any = ({} as any);
  declare luaGame: GameLuaWrapper;
  declare luaPlayer: LocalPlayerLuaWrapper;
  declare requiredBlocks: any[];
  checkLoadedChangeBlockVariationsTimeout: number = 0;
  declare drawingLock: LockHolder;
  coins: number = NaN;
  getGameTimer(): GameTimer {
         return this.timer;
      }
  removeMinimap(): void {
         if($b(this, 'minimap') != null)
         {
            $b(this, 'minimap').removeEventListener(Event.COMPLETE,$b(this, 'minimapDrawnHandler'));
            $b(this, 'minimap').remove();
            this.minimap = null;
         }
      }
  iFinished(): void {
         if(this.localPlayer != null)
         {
            this.localPlayer.resetRotation();
            this.localPlayer.remove();
            this.localPlayer = null;
         }
         if(!(this instanceof MatchPage))
         {
            this.timer.pause();
         }
         this.playVictorySound();
         this.addNavigation();
      }
  startSnow(): void {
         var _loc_1= 0;
         while(_loc_1 < 50)
         {
            new SnowEffect(this.localPlayer);
            _loc_1++;
         }
         MapManager.map.setBGColor(6988527);
      }
  createMinimap(): void {
         this.removeMinimap();
         this.minimap = new Minimap();
         $b(this, 'minimap').setConstraints(this.minimapMinX,this.minimapMaxX);
         this.addChild($b(this, 'minimap'));
      }
  minimapDrawnHandler(event: Event): void {
         $b(this, 'minimap').removeEventListener(Event.COMPLETE,$b(this, 'minimapDrawnHandler'));
         this.finishedDrawing();
      }
  startAliens(): void {
         new AlienEffect(Math.abs(MapManager.map.blockMap.maxX) + 5);
         new AlienEffect(Math.abs(MapManager.map.blockMap.maxX) + 6);
      }
  explodeBlock(block: Block, reason: any = null): void {
         var effect: ExplosionEffectGraphic= null;
         if(block != null)
         {
            effect = new ExplosionEffectGraphic();
            effect.x = block.posX + 15;
            effect.y = block.posY + 15;
            EffectMapLayer.addEffect(effect);
            Sounds.startGameSound(new ExplosionSound(),effect,2);
            if(block.realVars.type != BlockSettings.IMPERVIOUS)
            {
               this.removeBlock(block,reason);
            }
         }
      }
  init(): void {
         GamePage.instance = this;
         super.init();
         BlockManager.abortLoading();
         this.timer.x = Settings.gameWidth - 50;
         this.timer.y = 6;
         this.addChild(this.timer);
         this.health.x = Settings.gameWidth - 50;
         this.health.y = 26;
         this.addChild(this.health);
         this.musicDropdown.x = 270;
         this.musicDropdown.width = 150;
         this.addChild(this.musicDropdown);
      }
  initLua(): void {
         this.stage.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyEventHandler'),false,0,true);
         this.stage.addEventListener(KeyboardEvent.KEY_UP,$b(this, 'keyEventHandler'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseEventHandler'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseEventHandler'),false,0,true);
         this.luaGame = new GameLuaWrapper(this);
         var error: string= PlatformRacing3.lua.callGlobal("init_lua",this.luaGame,this.lua)[1];
         if(error != null)
         {
            PlatformRacing3.lua.callGlobal("clear_cache");
            this.luaGame = new GameLuaWrapper(this);
            if(this.localPlayer != null)
            {
               this.localPlayer.lua = this.luaPlayer = new LocalPlayerLuaWrapper(this.localPlayer);
            }
            trace("Global lua error:\n\n" + error);
            if(this instanceof LevelEditorPage)
            {
               PlatformRacing3.addPopup(new MessagePopup("Global lua error:\n\n" + error));
            }
            return;
         }
         var lock: LockHandler= new LockHandler($b(this, 'finishedDrawingInternal'));
         this.drawingLock = lock.acquireLock();
         $b(this.luaGame, 'init').call(lock);
      }
  remove(): void {
         clearInterval(this.countdownInterval);
         clearTimeout(this.victorySoundTimeout);
         clearTimeout(this.checkLoadedChangeBlockVariationsTimeout);
         BlockManager.removeEventListener("multiLoadComplete",$b(this, 'loadedChangeBlockVariations'));
         this.removePlayers();
         this.removePrizePopup();
         this.clearLua();
         if(this.timer != null)
         {
            this.timer.remove();
            this.timer = null;
         }
         if(this.health != null)
         {
            this.health.remove();
            this.health = null;
         }
         this.removeMinimap();
         if(this.musicDropdown != null)
         {
            this.musicDropdown.remove();
            this.musicDropdown = null;
         }
         if(this.blockIntervalManager != null)
         {
            this.blockIntervalManager.remove();
            this.blockIntervalManager = null;
         }
         this.playerHolder = null;
         this.playerHolder2 = null;
         this.playerArray = null;
         this.startPositions = null;
         this.finishPositions = null;
         this.hatPositions = null;
         this.buttonsPressed = null;
         this.teleportArrays = null;
         this.looseHatArray = null;
         this.localPlayer = null;
         GamePage.instance = null;
         super.remove();
      }
  localUseItem(): void {
      }
  removeMoveBlock(param1: Block): void {
         this.blockIntervalManager.removeBlock(param1,BlockIntervalManager.TYPE_MOVE);
      }
  removeGeneratorBlock(block: Block): void {
         this.blockIntervalManager.removeBlock(block,BlockIntervalManager.TYPE_GENERATOR);
      }
  startWind(): void {
         new WindEffect(this.playerArray,Math.abs(MapManager.map.blockMap.maxX) + 1);
      }
  registerChangeBlock(param1: Block): void {
         this.blockIntervalManager.addBlock(param1,BlockIntervalManager.TYPE_CHANGE);
      }
  registerGeneratorBlock(genBlock: Block): void {
         this.blockIntervalManager.addBlock(genBlock,BlockIntervalManager.TYPE_GENERATOR);
      }
  getNextStartPos(): Point {
         var block: Block= null;
         var point: Point= null;
         if(this.startPositions.length > 0)
         {
            if(this.startPositionIndex >= this.startPositions.length)
            {
               this.startPositionIndex = int(0);
            }
            point = this.startPositions[this.startPositionIndex++];
         }
         if(point == null)
         {
            block = MapManager.map.blockMap.getABlock();
            if(block != null)
            {
               point = new Point(block.x,block.y - Block.height / 2);
            }
         }
         if(point == null)
         {
            point = new Point(Settings.gameWidth / 2,Settings.gameHeight / 2);
         }
         return point;
      }
  registerFinishBlock(param1: Block): void {
         this.finishPositions.push(new Point(param1.posX,param1.posY));
      }
  registerHatPosition(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         this.hatPositions.push(new Point(param1,param2));
      }
  removeChangeBlock(param1: Block): void {
         this.blockIntervalManager.removeBlock(param1,BlockIntervalManager.TYPE_CHANGE);
      }
  resetCanPlayVictorySound(): void {
         this.canPlayVictorySound = true;
      }
  createBlockParticle(block: Block, x: number, y: number, height: number, width: number): void {
    x = int(x); y = int(y); height = int(height); width = int(width);
         var bitmapData: BitmapData= null;
         var matrix: Matrix= null;
         var posHash: number = int(x << 16 | y & 0xFFFF);
         var sizeHash: number = int(height << 16 | width & 0xFFFF);
         var sizeCache: any= block.cachedParticles[posHash];
         if(sizeCache == null)
         {
            sizeCache = block.cachedParticles[posHash] = ({} as any);
         }
         if(sizeCache[sizeHash] == null)
         {
            bitmapData = new BitmapData(height,width,true,0);
            matrix = new Matrix();
            matrix.createBox(1,1,0,-x,-y);
            bitmapData.draw(block,matrix);
            sizeCache[sizeHash] = bitmapData;
         }
         var effect: ParticleEffect= new ParticleEffect(new Bitmap(sizeCache[sizeHash]),0.75,0.95,0.05,5,5,20,0,-5);
         effect.x = block.posX + x;
         effect.y = block.posY + y;
      }
  removePlayers(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.playerArray))
         {
            if(!_loc_1.removed)
            {
               _loc_1.remove();
            }
         }
         this.playerArray = new Array();
         this.localPlayer = null;
      }
  removePrizePopup(): void {
         if(this.prizePopup != null)
         {
            if(!this.prizePopup.removed)
            {
               this.prizePopup.remove();
            }
            this.prizePopup = null;
         }
      }
  shatterBlock(block: Block, reason: any = null): void {
         var j: number = int(0);
         var effect: SmokeEffectGraphic= new SmokeEffectGraphic();
         effect.x = block.posX + Block.width / 2;
         effect.y = block.posY + Block.height / 2;
         effect.alpha = 1;
         if(Math.random() > 0.5)
         {
            effect.scaleX = -1;
         }
         EffectMapLayer.addEffect(effect);
         var size= 20;
         var i: number = int(0);
         while(i < Block.width)
         {
            j = int(0);
            while(j < Block.height)
            {
               this.createBlockParticle(block,i,j,size,size);
               j = int(j + (size));
            }
            i = int(i + (size));
         }
         Sounds.startGameSound(new ShatterBlockSound(),effect,1);
         this.removeBlock(block,reason);
      }
  localExplodeBlock(param1: Block, reason: any = null): void {
         this.explodeBlock(param1,reason);
      }
  removeFinishBlock(param1: Block): void {
      }
  grabHat(param1: any): void {
      }
  registerTeleportBlock(param1: Block): void {
         if(this.teleportArrays[param1.id] == null)
         {
            this.teleportArrays[param1.id] = new Array();
         }
         this.teleportArrays[param1.id].push(param1);
      }
  resetBlockSettings(): void {
         this.startPositions = new Array();
         this.finishPositions = new Array();
         this.teleportArrays = new Array();
         this.buttonsPressed = new Array();
         this.startPositionIndex = int(0);
      }
  countdownFinished(): void {
      }
  finishDrawingHandler(event: Event): void {
         super.finishDrawingHandler(event);
         BlockManager.addEventListener("multiLoadComplete",$b(this, 'loadedChangeBlockVariations'),false,0,true);
         BlockManager.requestManyBlocks(this.requiredBlocks);
      }
  keyEventHandler(event: KeyboardEvent): void {
         var keyLocation: string= null;
         if(this.luaPlayer == null)
         {
            return;
         }
         if(!this.luaPlayer.keyEvent.hasListeners)
         {
            return;
         }
         if(GameChat.inChatMode)
         {
            return;
         }
         if(TextPopup.inputMode)
         {
            return;
         }
         switch(event.keyLocation)
         {
            case KeyLocation.LEFT:
               keyLocation = "LEFT";
               break;
            case KeyLocation.RIGHT:
               keyLocation = "RIGHT";
               break;
            case KeyLocation.NUM_PAD:
               keyLocation = "NUMPAD";
               break;
            default:
               keyLocation = "STANDARD";
         }
         var eventData: any= {
            "isKeyDown":event.type == KeyboardEvent.KEY_DOWN,
            "keyCode":event.keyCode,
            "charCode":event.charCode,
            "keyLocation":keyLocation,
            "shiftKey":event.shiftKey,
            "ctrlKey":event.ctrlKey,
            "altKey":event.altKey
         };
         this.luaPlayer.keyEvent.call(eventData);
      }
  mouseEventHandler(event: MouseEvent): void {
         if(this.luaPlayer == null)
         {
            return;
         }
         if(!this.luaPlayer.mouseEvent.hasListeners)
         {
            return;
         }
         if(GameChat.inChatMode)
         {
            return;
         }
         if(TextPopup.inputMode)
         {
            return;
         }
         if(this.popupArray.length > 0)
         {
            return;
         }
         var eventData: any= {
            "buttonDown":event.buttonDown,
            "clickCount":event.clickCount,
            "mouseX":event.stageX / this.stage.stageWidth * 2 - 1,
            "mouseY":event.stageY / this.stage.stageHeight * -2 + 1
         };
         this.luaPlayer.mouseEvent.call(eventData);
      }
  createLooseHat(param1: number, param2: number, param3: number, param4: number, param5: number, param6: number, param7: number): HatEffect {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         if(param2 < 1 || param2 > 19)
         {
            return null;
         }
         var _loc_8: HatEffect= new HatEffect(param2,param3,param1);
         _loc_8.x = param4;
         _loc_8.y = param5;
         _loc_8.velX = param6;
         _loc_8.velY = param7;
         this.looseHatArray[param1] = _loc_8;
         return _loc_8;
      }
  positionPlayers(): void {
         var startBlock: Block= null;
         var player= null;
         var start= null;
         var localPlayer: LocalPlayer= null;
         for (player of $each(this.playerArray))
         {
            start = this.getNextStartPos();
            while(start == null)
            {
               start = this.getNextStartPos();
            }
            startBlock = MapManager.map.posToBlock(start.x,start.y);
            if(startBlock != null)
            {
               player.handleCodeBlock(startBlock,"none");
            }
            player.setRealX(start.x + 15);
            player.setRealY(start.y + 15);
            if(player instanceof LocalPlayer)
            {
               localPlayer = player;
            }
            else
            {
               this.playerHolder.addChild(player);
            }
            if(this.levelType == "deathmatch" || this.levelType == "damageDash")
            {
               player.createLifeBar(GamePage.instance.startHealth);
            }
            else if(GamePage.instance.extraHealth > 0)
            {
               player.createLifeBar(GamePage.instance.extraHealth);
            }
         }
         this.playerHolder.addChild(localPlayer);
      }
  startSFCHM(): void {
      }
  reset(): void {
         super.reset();
         this.resetBlockSettings();
         this.playerHolder = MapManager.map.createMap();
         this.playerHolder.sortNum = 2000000003;
         this.playerHolder2 = MapManager.map.createMap();
         this.playerHolder2.sortNum = 2000000001;
         MapManager.map.sortDepth();
      }
  enterWater(player: ActivePlayer): void {
         if(!player.removed)
         {
            if(player instanceof LocalPlayer || this.playerHolder2.numChildren == 0)
            {
               this.playerHolder2.addChild(player);
            }
            else
            {
               this.playerHolder2.addChildAt(player,this.playerHolder2.numChildren - 1);
            }
         }
      }
  exitWater(player: ActivePlayer): void {
         if(!player.removed)
         {
            if(player instanceof LocalPlayer || this.playerHolder.numChildren == 0)
            {
               this.playerHolder.addChild(player);
            }
            else
            {
               this.playerHolder.addChildAt(player,this.playerHolder.numChildren - 1);
            }
         }
      }
  finishedDrawing(): void {
         if(this.drawingLock == null)
         {
            this.finishedDrawingInternal();
            return;
         }
         this.drawingLock.dispose();
      }
  finishedDrawingInternal(): void {
         MapManager.map.requestActivateShowAll();
      }
  registerStartBlock(param1: Block): void {
         this.startPositions.push(new Point(param1.posX,param1.posY));
      }
  localShatterBlock(param1: Block, reason: any = null): void {
         this.shatterBlock(param1,reason);
      }
  registerMoveBlock(param1: Block): void {
         this.blockIntervalManager.addBlock(param1,BlockIntervalManager.TYPE_MOVE);
      }
  addPrizePopup(param1: string, param2: number, param3: string): void {
    param2 = int(param2);
         this.removePrizePopup();
         this.prizePopup = new PrizePopup(param1,param2,param3);
         this.addPopup(this.prizePopup);
         this.prizePopup.x = Settings.gameWidth - 185;
      }
  loadedChangeBlockVariations(event: Event = null): void {
         var id: number = uint(0);
         var dependencies: any[]= null;
         var depId: number = uint(0);
         if(!BlockManager.finishedWithRequests)
         {
            clearTimeout(this.checkLoadedChangeBlockVariationsTimeout);
            this.checkLoadedChangeBlockVariationsTimeout = uint(setTimeout($b(this, 'loadedChangeBlockVariations'),33));
            return;
         }
         if(this.requiredBlocks.length > 0)
         {
            for (id of $each(this.requiredBlocks.splice(0)))
            {
               dependencies = BlockManager.getBlock(id).getDependentBlockIds();
               if(dependencies != null)
               {
                  for (depId of $each(dependencies))
                  {
                     if(BlockManager.getBlockVars(depId) == null)
                     {
                        if(this.requiredBlocks.indexOf(depId) == -1)
                        {
                           this.requiredBlocks.push(depId);
                        }
                     }
                  }
               }
            }
            if(this.requiredBlocks.length > 0)
            {
               BlockManager.requestManyBlocks(this.requiredBlocks);
               return;
            }
         }
         BlockManager.removeEventListener("multiLoadComplete",$b(this, 'loadedChangeBlockVariations'));
         if(this.autoDisplayMinimap)
         {
            this.createMinimap();
            if($b(this, 'minimap').drawing)
            {
               $b(this, 'minimap').addEventListener(Event.COMPLETE,$b(this, 'minimapDrawnHandler'),false,0,true);
            }
            else
            {
               this.finishedDrawing();
            }
         }
         else
         {
            this.finishedDrawing();
         }
      }
  removeBlockFromArray(param1: Block, param2: any[]): void {
         var _loc_3= param2.indexOf(param1);
         if(_loc_3 != -1)
         {
            param2.splice(_loc_3,1);
         }
      }
  removeBlock(param1: Block, reason: any = null): void {
         var luaWrapper: any= null;
         var event: any= null;
         if(reason != null && param1.breakEventHandler != null && param1.breakEventHandler.hasListeners)
         {
            if(reason.source instanceof ProjectileEffect)
            {
               luaWrapper = new ProjectileEffectLuaWrapper((reason.source));
            }
            else if(reason.source instanceof ActivePlayer)
            {
               luaWrapper = (reason.source).lua;
            }
            else
            {
               luaWrapper = null;
            }
            event = {
               "cancelled":false,
               "block":new BlockLuaWrapper(param1,reason.side),
               "reason":luaWrapper,
               "side":reason.side
            };
            param1.breakEventHandler.call(event);
            if(event.cancelled)
            {
               return;
            }
         }
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= 0;
         var _loc_5= null;
         if(this.levelType == "coinFiend")
         {
            _loc_2 = new PM_PRNG(Math.abs(param1.posX + param1.posY));
            _loc_3 = _loc_2.nextDoubleRange(-5,5);
            _loc_4 = 0;
            while(_loc_4 < param1.vars.coins)
            {
               _loc_5 = new CoinEffect();
               _loc_5.x = param1.posX + 15;
               _loc_5.y = param1.posY + 15;
               _loc_5.velX = _loc_2.nextDoubleRange(-5,5);
               _loc_5.velY = _loc_2.nextDoubleRange(-5,0);
               _loc_4++;
            }
         }
         param1.removePaintGraphic();
         MapManager.map.blockMap.removeTile(param1.tileX,param1.tileY);
      }
  localLoseHat(param1: LocalPlayer, param2: number = 7): any {
         var _loc_3= param1.loseHat();
         var _loc_4= Data.rotatePoint(0,-60,-param1.rotation);
         var _loc_5= param1.x + _loc_4.x;
         var _loc_6= param1.y + _loc_4.y;
         var _loc_7= Math.random() * -180;
         var _loc_8= Maths.DEG_RAD * _loc_7;
         var _loc_9= Math.cos(_loc_8) * param2;
         var _loc_10= Math.sin(_loc_8) * param2;
         _loc_9 = Math.round(_loc_9 * 100) / 100;
         _loc_10 = Math.round(_loc_10 * 100) / 100;
         var _loc_11= ({} as any);
         _loc_11.hatNum = _loc_3.hatNum;
         _loc_11.hatColor = _loc_3.hatColor;
         _loc_11.x = _loc_5;
         _loc_11.y = _loc_6;
         _loc_11.velX = _loc_9;
         _loc_11.velY = _loc_10;
         return _loc_11;
      }
  removeStartBlock(param1: Block): void {
         var _loc_5= null;
         var _loc_2= new Point(param1.posX,param1.posY);
         var _loc_3= this.startPositions.length;
         var _loc_4= 0;
         while(_loc_4 < _loc_3)
         {
            _loc_5 = this.startPositions[_loc_4];
            if(_loc_5.x == _loc_2.x && _loc_5.y == _loc_2.y)
            {
               this.startPositions.splice(_loc_4,1);
               _loc_3--;
               _loc_4--;
            }
            _loc_4++;
         }
      }
  playVictorySound(): void {
         if(this.canPlayVictorySound)
         {
            Sounds.startSound(new VictorySound(),1);
            this.canPlayVictorySound = false;
            clearTimeout(this.victorySoundTimeout);
            this.victorySoundTimeout = uint(setTimeout($b(this, 'resetCanPlayVictorySound'),500));
         }
      }
  runCountdown(): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         var _loc_1= null;
         if(this.countdown == -1)
         {
            clearInterval(this.countdownInterval);
            this.countdownInterval = uint(0);
            this.countdownFinished();
            Sounds.startSound(new GoSound(),0.75);
         }
         else
         {
            _loc_1 = new CountdownGraphic();
            _loc_1.x = this.w / 2;
            _loc_1.y = this.h / 4;
            _loc_2 = false;
            _loc_1.mouseChildren = false;
            _loc_1.mouseEnabled = _loc_2;
            this.addChild(_loc_1);
            if(this.countdown == 3)
            {
               _loc_1.textHolder.gotoAndStop("three");
            }
            else if(this.countdown == 2)
            {
               _loc_1.textHolder.gotoAndStop("two");
            }
            else if(this.countdown == 1)
            {
               _loc_1.textHolder.gotoAndStop("one");
            }
            else if(this.countdown == 0)
            {
               if(!(this instanceof OfflineGamePage))
               {
                  _loc_1.textHolder.gotoAndStop(this.levelType);
               }
               else
               {
                  _loc_1.textHolder.gotoAndStop("race");
               }
            }
            if(this.countdown < 3)
            {
               Sounds.startSound(new ReadySound(),0.5);
            }
            _loc_2 = this;
            _loc_3 = this.countdown - 1;
            _loc_2.countdown = _loc_3;
         }
      }
  startCountdown(): void {
         this.initGame();
         MapManager.map.scale = 1;
         this.countdown = int(3);
         clearInterval(this.countdownInterval);
         this.countdownInterval = uint(setInterval($b(this, 'runCountdown'),666));
         this.runCountdown();
         if(this.localPlayer != null)
         {
            if(Settings.isMobile)
            {
               MobileControls.showPlayerControls();
            }
         }
      }
  initGame(): void {
         var error: string= null;
         if(this.drawingLock == null)
         {
            error = PlatformRacing3.lua.callGlobal("init_lua",this.luaGame,this.lua,this.luaPlayer,new LevelLuaWrapper())[1];
            if(error != null)
            {
               trace("Global lua error:\n\n" + error);
               if(this instanceof LevelEditorPage)
               {
                  PlatformRacing3.addPopup(new MessagePopup("Global lua error:\n\n" + error));
               }
            }
         }
         else
         {
            PlatformRacing3.lua.callGlobal("init_game",this.luaPlayer,new LevelLuaWrapper());
         }
      }
  startGame(): void {
         $b(this.luaGame, 'start').call();
         var _loc_1= null;
         this.timer.setTime(this.seconds);
         if(this.levelType != "kingOfTheHat")
         {
            if(this.seconds == 0)
            {
               this.timer.mode = "stopwatch";
            }
            this.timer.resume();
         }
         else
         {
            this.timer.mode = "countdown";
            this.timer.pause();
            this.doKOTHLogic();
         }
         for (_loc_1 of $each(this.playerArray))
         {
            if(!_loc_1.removed)
            {
               _loc_1.init();
            }
         }
         if($b(this, 'minimap') != null)
         {
            $b(this, 'minimap').createPlayerDots();
         }
         this.lastBlockUpdate = getTimer();
         this.musicDropdown.setSongID(this.songID);
         MapManager.map.scale = 1;
         this.blockIntervalManager.start();
         if(this.localPlayer != null)
         {
            if(Settings.isMobile)
            {
               MobileControls.showPlayerControls();
            }
         }
      }
  endGame(): void {
         if(!(this instanceof MatchPage))
         {
            this.timer.pause();
         }
         this.playVictorySound();
      }
  createPlayer(param1: BlossomUser): ActivePlayer {
         this.inGame = true;
         var _loc_3= null;
         var _loc_2= param1.vars;
         if(param1.socketID == SocketManager.socket.socketID)
         {
            _loc_3 = new LocalPlayer();
         }
         else
         {
            _loc_3 = new RemotePlayer();
         }
         _loc_3.setStats(_loc_2.speed,_loc_2.accel,_loc_2.jump);
         _loc_3.setAppearance(_loc_2.hat,_loc_2.head,_loc_2.body,_loc_2.feet,_loc_2.hatColor,_loc_2.headColor,_loc_2.bodyColor,_loc_2.feetColor);
         this.playerArray.push(_loc_3);
         if(this.playerHolder != null)
         {
            this.playerHolder.addChild(_loc_3);
         }
         return _loc_3;
      }
  removeTeleportBlock(param1: Block): void {
         if(this.teleportArrays[param1.id] != null)
         {
            this.removeBlockFromArray(param1,this.teleportArrays[param1.id]);
            if(this.teleportArrays[param1.id].length == 0)
            {
               this.teleportArrays[param1.id] = null;
            }
         }
      }
  get hasGameStarted(): boolean {
         return this.countdownInterval == 0;
      }
  doKOTHLogic(): void {
         var actualLength: number = int(0);
         var timeLeft: number = int(0);
         if(this.localPlayer != null && this.localPlayer.hatArray.length > 0)
         {
            actualLength = int(this.localPlayer.hatArray.length - 1);
            this.timer.timerSpeed = int(actualLength == 1 ? 1000 : int(Math.max(1000 - 50 * actualLength,150)));
            if(!this.timer.timerStarted)
            {
               timeLeft = int(this.timer.getCurrentDisplayTime());
               if(actualLength == 1)
               {
                  timeLeft = int(Math.max(timeLeft,3));
               }
               this.timer.setTime(timeLeft);
               this.timer.resume();
            }
         }
         else if(this.timer.timerStarted)
         {
            this.timer.pause();
         }
      }
  callLuaBlock(block: Block, side: string, player: LocalPlayer): void {
         var lua: string= block.vars.lua[side];
         if(lua == null)
         {
            return;
         }
         var blockCache: any[]= this.luaBlockCached[block.id];
         if(blockCache == null)
         {
            blockCache = this.luaBlockCached[block.id] = new Array();
         }
         var luaFunction: LuaReference= blockCache[side];
         if(luaFunction == null)
         {
            luaFunction = blockCache[side] = PlatformRacing3.lua.callGlobal("create_lua_block_function",lua)[1];
         }
         luaFunction.call(BlockLuaWrapper.wrap(block,side,player));
      }
  clearLua(): void {
         this.stage.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyEventHandler'));
         this.stage.removeEventListener(KeyboardEvent.KEY_UP,$b(this, 'keyEventHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseEventHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseEventHandler'));
         this.luaBlockCached = ({} as any);
         this.drawingLock = null;
         PlatformRacing3.lua.callGlobal("end_game");
         PlatformRacing3.startLuaState();
      }
  registerRequiredBlocks(blockIds: any[]): void {
         var id: number = uint(0);
         for (id of $each(blockIds))
         {
            if(this.requiredBlocks.indexOf(id) == -1)
            {
               this.requiredBlocks.push(id);
            }
         }
      }
  incCoins(): void {
         var _loc_1= Math.round(Data.revealNumber(this.coins));
         _loc_1 += 1;
         this.coins = Data.hideNumber(_loc_1);
      }
  getCoins(): number {
         return Math.round(Data.revealNumber(this.coins));
      }
  setCoins(value: number): void {
    value = int(value);
         if(value <= 0)
         {
            value = int(0);
         }
         this.coins = Data.hideNumber(value);
      }
  constructor() {
         super();
         this.playerArray = new Array();
         this.timer = new GameTimer();
         this.health = new GameHealth();
         this.itemDisplay = new ItemDisplayGraphic();
         this.startPositions = new Array();
         this.finishPositions = new Array();
         this.hatPositions = new Array();
         this.buttonsPressed = new Array();
         this.teleportArrays = new Array();
         this.looseHatArray = new Array();
         this.musicDropdown = new MusicDropdown();
         this.requiredBlocks = new Array();
         this.coins = Data.hideNumber(0);
         if(this instanceof OfflineGamePage)
         {
            this.blockIntervalManager = new BlockIntervalManager(false);
         }
         else if(this instanceof MatchPage)
         {
            this.blockIntervalManager = new BlockIntervalManager(true);
         }
         else
         {
            this.blockIntervalManager = new BlockIntervalManager(false);
         }
      }
}
$reg('com.jiggmin.pr3.game.GamePage', GamePage);
