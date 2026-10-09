// Ported from com/jiggmin/pr3/block/Block.as
import { Bitmap, BitmapData, ColorMatrixFilter, ColorTransform, Event, Point, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { ActivePlayer, BlockManager, BlockSettings, BlockSideSettings, DirectionArrowGraphic, GamePage, LuaEventHandler, MapManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Block extends Bitmap {
  static halfWidth: number = 20;
  static width: number = 40;
  static height: number = 40;
  static halfHeight: number = 20;
  posX: number = 0;
  posY: number = 0;
  active: boolean = false;
  declare bumpVel: Point;
  declare arrow: DirectionArrowGraphic;
  teleportActive: boolean = true;
  freezeAlpha: number = NaN;
  paintAlpha: number = NaN;
  changeBlockID: number = 0;
  generatorBlockID: number = 0;
  declare randMovePattern: string;
  frozen: boolean = false;
  painted: boolean = false;
  moveBlockActiveMode: boolean = false;
  startTileX: number = 0;
  startTileY: number = 0;
  moveCooldownTimeout: number = 0;
  isChangeBlock: boolean = false;
  isGeneratorBlock: boolean = false;
  _id: number = 0;
  declare freezeGraphic: Bitmap;
  declare paintGraphic: Bitmap;
  initialized: boolean = false;
  health: number = 0;
  declare moveBlockMoveCommand: string;
  removed: boolean = false;
  itemSupply: number = 0;
  statSupply: number = 0;
  timeTillBreak: number = 0;
  timeTillVanish: number = 0;
  dispenseCoins: number = 0;
  buttonID: number = 0;
  reactorID: number = 0;
  checkPointReset: boolean = false;
  declare stats: any;
  reflectAngle: number = NaN;
  _tileX: number = 0;
  _tileY: number = 0;
  freezeTimer: number = 0;
  paintTimer: number = 0;
  fadeInTimeout: number = 0;
  canMove: boolean = true;
  reactivateTimeout: number = 0;
  timeTillVanishTimeout: number = 0;
  teleportUsesLeft: number = -1;
  teleportCooldown: number = 3000;
  randomDestination: boolean = false;
  paused: boolean = false;
  codeVariables: any = ({} as any);
  coins: number = 3;
  cachedParticles: any = ({} as any);
  collapse: boolean = false;
  maxPaintAlpha: number = 1;
  vanishDisappearTime: number = 2000;
  bounciness: number = 1;
  arrowPower: number = 1;
  declare breakEventHandler: LuaEventHandler;
  predictableItems: boolean = false;
  iceId: number = 109;
  canFinish(): boolean {
         if(this.vars.bump.type == BlockSideSettings.FINISH || this.vars.left.type == BlockSideSettings.FINISH || this.vars.right.type == BlockSideSettings.FINISH || this.vars.top.type == BlockSideSettings.FINISH || this.vars.bottom.type == BlockSideSettings.FINISH)
         {
            return true;
         }
         return false;
      }
  executeMoveBlockMoveCommand(): boolean {
         var _loc_2: string= null;
         var _loc_3: Block= null;
         var _loc_1: boolean= false;
         if(this.moveBlockActiveMode == true)
         {
            this.moveBlockActiveMode = false;
            this.canMove = true;
            _loc_2 = this.moveBlockMoveCommand;
            if(_loc_2 == "u")
            {
               _loc_1 = this.move("bottom",false);
            }
            else if(_loc_2 == "d")
            {
               _loc_1 = this.move("top",false);
            }
            else if(_loc_2 == "r")
            {
               _loc_1 = this.move("left",false);
            }
            else if(_loc_2 == "l")
            {
               _loc_1 = this.move("right",false);
            }
            else if(_loc_2 == "@")
            {
               if(this._tileX != this.startTileX || this._tileY != this.startTileY)
               {
                  _loc_3 = MapManager.map.blockMap.getBlockAtTile(this.startTileX,this.startTileY);
                  if(_loc_3 != null && _loc_3.moveBlockActiveMode)
                  {
                     _loc_3.executeMoveBlockMoveCommand();
                  }
                  MapManager.map.blockMap.moveBlock(this,this.startTileX,this.startTileY);
                  _loc_1 = true;
               }
            }
         }
         return _loc_1;
      }
  init(): void {
         if(!this.initialized)
         {
            this.initialized = true;
            this.registerBlockType();
         }
      }
  hit(param1: number, param2: number): void {
         this.bumpVel = new Point(param1,param2);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'bumpAnim'),false,0,true);
      }
  freeze(duration: number = 50, iceId: number = 109): void {
    duration = int(duration); iceId = int(iceId);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'freezeAnim'),false,0,true);
         this.iceId = int(iceId);
         this.freezeTimer = int(duration);
         this.frozen = true;
         this.freezeAlpha = 1;
         this.addFreezeGraphic();
      }
  paint(color: number): void {
    color = uint(color);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'paintAnim'),false,0,true);
         this.paintTimer = int(250);
         this.painted = true;
         this.paintAlpha = 1;
         this.addPaintGraphic(color);
      }
  paintLua(color: number, duration: number, maxalpha: number): void {
    color = uint(color); duration = int(duration);
         this.removePaintGraphic();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'paintAnim'),false,0,true);
         this.paintTimer = int(duration);
         this.maxPaintAlpha = maxalpha;
         this.addPaintGraphic(color);
      }
  canTeleport(): boolean {
         if(this.vars.bump.type == BlockSideSettings.TELEPORT || this.vars.left.type == BlockSideSettings.TELEPORT || this.vars.right.type == BlockSideSettings.TELEPORT || this.vars.top.type == BlockSideSettings.TELEPORT || this.vars.bottom.type == BlockSideSettings.TELEPORT)
         {
            return true;
         }
         return false;
      }
  registerBlockType(): void {
         this.health = int(this.vars.health);
         this.itemSupply = int(this.vars.itemSupply);
         this.timeTillBreak = int(this.vars.timeTillBreak);
         this.timeTillVanish = int(this.vars.timeTillVanish);
         this.bounciness = this.vars.bounciness;
         this.arrowPower = this.vars.arrowPower;
         this.predictableItems = this.vars.predictableItems;
         this.dispenseCoins = int(this.vars.dispenseCoins);
         this.buttonID = int(this.vars.buttonID);
         this.reactorID = int(this.vars.reactorID);
         this.checkPointReset = this.vars.chkPointReset;
         this.stats = this.vars.stats;
         this.reflectAngle = this.vars.reflectAngle;
         this.statSupply = int(this.vars.statSupply);
         this.teleportUsesLeft = int(this.vars.teleportUses);
         this.teleportCooldown = int(this.vars.teleportCooldown);
         this.randomDestination = this.vars.randomDestination;
         this.coins = int(this.vars.coins);
         this.startTileX = int(this._tileX);
         this.startTileY = int(this._tileY);
         if(this.vars.type != BlockSettings.INACTIVE && this.vars.type != BlockSettings.INACTIVE_LUA && this.vars.type != BlockSettings.WATER && this.vars.type != BlockSettings.WATER_LUA && this.vars.type != BlockSettings.START)
         {
            this.active = true;
         }
         else
         {
            this.active = false;
         }
         var dependencies: any[]= this.getDependentBlockIds();
         if(dependencies != null && dependencies.length > 0)
         {
            GamePage.instance.registerRequiredBlocks(dependencies);
         }
         if(this.vars.type == BlockSettings.START)
         {
            GamePage.instance.registerStartBlock(this);
         }
         if(this.vars.type == BlockSettings.MOVE)
         {
            GamePage.instance.registerMoveBlock(this);
            if(this.vars.collapse)
            {
               this.collapse = true;
            }
         }
         if(this.vars.type == BlockSettings.CHANGE && !this.isChangeBlock)
         {
            GamePage.instance.registerChangeBlock(this);
            this.isChangeBlock = true;
            this.changeBlockID = int(this._id);
         }
         if(this.vars.type == BlockSettings.GENERATOR)
         {
            GamePage.instance.registerGeneratorBlock(this);
            this.isGeneratorBlock = true;
            this.generatorBlockID = int(this._id);
         }
         if(this.canFinish() && (GamePage.instance.levelType == "race" || GamePage.instance.levelType == "deathmatch"))
         {
            GamePage.instance.registerFinishBlock(this);
         }
         if(this.canTeleport())
         {
            GamePage.instance.registerTeleportBlock(this);
         }
         if(this.vars.type == BlockSettings.REACTOR)
         {
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'reactorBlockBreak'),false,0,true);
         }
      }
  removeArrow(): void {
         if(this.arrow != null)
         {
            if(this.arrow.parent != null)
            {
               this.arrow.parent.removeChild(this.arrow);
            }
            this.arrow = null;
         }
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'arrowFadeOut'));
      }
  get id(): number {
         return this._id;
      }
  unregisterBlockType(param1: boolean = false): void {
         if(Boolean(this.initialized) && GamePage.instance != null)
         {
            if(this.vars.type == BlockSettings.MOVE)
            {
               GamePage.instance.removeMoveBlock(this);
            }
            if(this.vars.type == BlockSettings.GENERATOR)
            {
               GamePage.instance.removeGeneratorBlock(this);
            }
            if(this.vars.type == BlockSettings.START)
            {
               GamePage.instance.removeStartBlock(this);
            }
            if(this.canFinish() && GamePage.instance.levelType == "race")
            {
               GamePage.instance.removeFinishBlock(this);
            }
            if(this.canTeleport())
            {
               GamePage.instance.removeTeleportBlock(this);
            }
            if(Boolean(this.isChangeBlock) && param1)
            {
               this._id = int(this.changeBlockID);
               GamePage.instance.removeChangeBlock(this);
            }
         }
      }
  reactivate(): void {
         this.unDullOut();
         this.teleportActive = true;
      }
  get vars(): BlockSettings {
         if(this.frozen)
         {
            if(this.iceId == 109)
            {
               return BlockManager.getBlockVars(9);
            }
            return BlockManager.getBlockVars(this.iceId);
         }
         return BlockManager.getBlockVars(this.id);
      }
  removeFreezeGraphic(): void {
         if(this.freezeGraphic != null)
         {
            if(this.freezeGraphic.parent != null)
            {
               this.freezeGraphic.parent.removeChild(this.freezeGraphic);
            }
            this.freezeGraphic = null;
         }
      }
  removePaintGraphic(): void {
         if(this.paintGraphic != null)
         {
            if(this.paintGraphic.parent != null)
            {
               this.paintGraphic.parent.removeChild(this.paintGraphic);
            }
            this.paintGraphic = null;
         }
      }
  fadeOut(event: Event): void {
         this.alpha -= 0.1;
         if(this.alpha <= 0)
         {
            this.alpha = 0;
            this.active = false;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'));
            clearTimeout(this.fadeInTimeout);
            this.fadeInTimeout = uint(setTimeout($b(this, 'startFadeIn'),this.vanishDisappearTime));
         }
      }
  addFreezeGraphic(): void {
         if(this.freezeGraphic == null)
         {
            this.freezeGraphic = BlockManager.requestBlock(this.iceId);
            this.freezeGraphic.x = this.x;
            this.freezeGraphic.y = this.y;
            MapManager.map.blockMap.blockEffectHolder.addChild(this.freezeGraphic);
         }
      }
  addPaintGraphic(color: number): void {
    color = uint(color);
         var red: number= NaN;
         var green: number= NaN;
         var blue: number= NaN;
         var grayscaleBitmapData: BitmapData= null;
         var grayColorMatrix: any[]= null;
         var newBitmapData: BitmapData= null;
         var colorMatrix: any[]= null;
         if(this.paintGraphic == null)
         {
            red = color >> 16 & 0xFF;
            green = color >> 8 & 0xFF;
            blue = color & 0xFF;
            grayscaleBitmapData = new BitmapData(this.height,this.width,true,0);
            grayscaleBitmapData.draw(this);
            grayColorMatrix = new Array();
            grayColorMatrix = grayColorMatrix.concat([1,1,1,0,0]);
            grayColorMatrix = grayColorMatrix.concat([1,1,1,0,0]);
            grayColorMatrix = grayColorMatrix.concat([1,1,1,0,0]);
            grayColorMatrix = grayColorMatrix.concat([0,0,0,0.9,0]);
            grayscaleBitmapData.applyFilter(grayscaleBitmapData,grayscaleBitmapData.rect,new Point(),new ColorMatrixFilter(grayColorMatrix));
            newBitmapData = new BitmapData(this.height,this.width,true,0);
            newBitmapData.draw(grayscaleBitmapData);
            colorMatrix = new Array();
            colorMatrix = colorMatrix.concat([red / 255,0,0,0,0]);
            colorMatrix = colorMatrix.concat([0,green / 255,0,0,0]);
            colorMatrix = colorMatrix.concat([0,0,blue / 255,0,0]);
            colorMatrix = colorMatrix.concat([0,0,0,1,0]);
            newBitmapData.applyFilter(newBitmapData,newBitmapData.rect,new Point(),new ColorMatrixFilter(colorMatrix));
            this.paintGraphic = new Bitmap(newBitmapData);
            this.paintGraphic.x = this.x;
            this.paintGraphic.y = this.y;
            this.paintGraphic.alpha = this.maxPaintAlpha;
            MapManager.map.blockMap.blockEffectHolder.addChild(this.paintGraphic);
         }
      }
  dullOut(): void {
         var _loc_1: ColorTransform= new ColorTransform(0.5,0.5,0.5,1,0,0,0,0);
         this.transform.colorTransform = _loc_1;
      }
  decreaseUseCount(): void {
         if(this.teleportUsesLeft != -1)
         {
            if(this.teleportUsesLeft > 0)
            {
               if(--this.teleportUsesLeft <= 0)
               {
                  this.dullOut();
                  this.teleportActive = false;
                  clearTimeout(this.reactivateTimeout);
               }
            }
         }
      }
  deactivateTeleportForDuration(param1: number): void {
         this.dullOut();
         this.teleportActive = false;
         clearTimeout(this.reactivateTimeout);
         if(this.teleportUsesLeft == -1 || this.teleportUsesLeft > 0)
         {
            this.reactivateTimeout = uint(setTimeout($b(this, 'reactivate'),param1));
         }
      }
  morphBlockType(param1: Block): void {
         this.unregisterBlockType();
         this._id = int(param1.id);
         this.bitmapData = param1.bitmapData;
         this.registerBlockType();
         this.unDullOut();
      }
  startFadeIn(): void {
         if(GamePage.instance == null)
         {
            return;
         }
         var _loc_3: ActivePlayer= null;
         var _loc_1: boolean= false;
         var _loc_2: number = int(5);
         for (_loc_3 of $each(GamePage.instance.playerArray))
         {
            if(_loc_3.x > this.posX - _loc_2 && _loc_3.x < this.posX + Block.width + _loc_2)
            {
               if(_loc_3.y > this.posY - _loc_2 && _loc_3.y < this.posY + Block.height + _loc_2)
               {
                  _loc_1 = true;
                  break;
               }
            }
         }
         if(!_loc_1)
         {
            this.alpha = 0.2;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'));
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeIn'));
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'fadeIn'),false,0,true);
            this.active = true;
         }
         else
         {
            this.active = false;
            this.fadeInTimeout = uint(setTimeout($b(this, 'startFadeIn'),1000));
         }
      }
  freezeAnim(event: Event): void {
         --this.freezeTimer;
         this.freezeAlpha = this.freezeTimer * 5 / 100;
         if(this.freezeAlpha > 1)
         {
            this.freezeAlpha = 1;
         }
         if(this.freezeGraphic != null)
         {
            this.freezeGraphic.x = this.x;
            this.freezeGraphic.y = this.y;
            this.freezeGraphic.alpha = this.freezeAlpha;
         }
         if(this.freezeTimer <= 0)
         {
            this.frozen = false;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'freezeAnim'));
            this.removeFreezeGraphic();
         }
      }
  paintAnim(event: Event): void {
         --this.paintTimer;
         this.paintAlpha = this.paintTimer * 5 / 100;
         if(this.paintTimer * 5 / 100 > this.maxPaintAlpha)
         {
            this.paintAlpha = this.maxPaintAlpha;
         }
         if(this.paintGraphic != null)
         {
            this.paintGraphic.x = this.x;
            this.paintGraphic.y = this.y;
            this.paintGraphic.alpha = this.paintAlpha;
         }
         if(this.paintTimer <= 0)
         {
            this.painted = false;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'paintAnim'));
            this.removePaintGraphic();
         }
      }
  remove(): void {
         this.removed = true;
         this.unregisterBlockType(true);
         clearTimeout(this.fadeInTimeout);
         clearTimeout(this.reactivateTimeout);
         clearTimeout(this.moveCooldownTimeout);
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeIn'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'bumpAnim'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'freezeAnim'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'paintAnim'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'reactorBlockBreak'));
         this.removeFreezeGraphic();
         this.removePaintGraphic();
         this.removeArrow();
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
         this.randMovePattern = null;
      }
  move(param1: string, param2: boolean = true, moveDelay: any = 33, pushableLeft: number = 1024): boolean {
    pushableLeft = int(pushableLeft);
         if(param1 == "bump")
         {
            return false;
         }
         var _loc_6: number = int(0);
         var _loc_7: number = int(0);
         var _loc_8: Block= null;
         var _loc_9: boolean= false;
         var _loc_10: BlockSettings= null;
         var _loc_11: BlockSideSettings= null;
         var _loc_3: number = int(0);
         var _loc_4: number = int(0);
         var _loc_5: boolean= false;
         if(this.canMove)
         {
            if(param1 == "top")
            {
               _loc_4 = int(1);
            }
            else if(param1 == "bottom")
            {
               _loc_4 = int(-1);
            }
            else if(param1 == "left")
            {
               _loc_3 = int(1);
            }
            else if(param1 == "right")
            {
               _loc_3 = int(-1);
            }
            _loc_6 = int(this.tileX + _loc_3);
            _loc_7 = int(this.tileY + _loc_4);
            _loc_8 = MapManager.map.blockMap.getBlockAtTile(_loc_6,_loc_7);
            if(_loc_8 == null)
            {
               MapManager.map.blockMap.moveBlock(this,_loc_6,_loc_7);
               _loc_5 = true;
            }
            else if(this.collapse)
            {
               GamePage.instance.shatterBlock(this);
            }
            else
            {
               _loc_9 = false;
               _loc_10 = _loc_8.vars;
               if(_loc_8.moveBlockActiveMode)
               {
                  _loc_9 = _loc_8.executeMoveBlockMoveCommand();
               }
               else if(pushableLeft > 0)
               {
                  _loc_11 = (_loc_10[param1]);
                  if(_loc_11.type == BlockSideSettings.BE_PUSHED)
                  {
                     _loc_9 = _loc_8.move(param1,param2,moveDelay,pushableLeft - 1);
                  }
               }
               if(_loc_9)
               {
                  MapManager.map.blockMap.moveBlock(this,_loc_6,_loc_7);
                  _loc_5 = true;
               }
            }
         }
         if(_loc_5 && param2)
         {
            if(moveDelay > 0)
            {
               this.canMove = false;
               clearTimeout(this.moveCooldownTimeout);
               this.moveCooldownTimeout = uint(setTimeout($b(this, 'resetCanMove'),moveDelay));
            }
         }
         return _loc_5;
      }
  fadeIn(event: Event): void {
         this.alpha += 0.1;
         if(this.alpha >= 1)
         {
            this.alpha = 1;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeIn'));
         }
      }
  set tileX(param1: number) {
    param1 = int(param1);
         this._tileX = int(param1);
         this.posX = int(param1 * Block.width);
      }
  set tileY(param1: number) {
    param1 = int(param1);
         this._tileY = int(param1);
         this.posY = int(param1 * Block.height);
      }
  clone(): Block {
         return new Block(this.bitmapData,this.id);
      }
  activateArrow(param1: number): void {
    param1 = int(param1);
         var _loc_2: number = int(0);
         if(this.arrow == null)
         {
            _loc_2 = int(Math.floor(this.id / 100));
            if(_loc_2 > 6)
            {
               _loc_2 = int(6);
            }
            this.arrow = new DirectionArrowGraphic();
            this.arrow.x = Block.width / 2 + this.posX;
            this.arrow.y = Block.height / 2 + this.posY;
            this.arrow.rotation = param1;
            this.arrow.arrow.gotoAndStop(_loc_2 + 1);
            MapManager.map.blockMap.blockEffectHolder.addChild(this.arrow);
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'arrowFadeOut'),false,0,true);
         }
         this.arrow.alpha = 1;
      }
  bumpAnim(event: Event): void {
         this.bumpVel.x *= 0.5;
         this.bumpVel.y *= 0.5;
         this.y += this.bumpVel.y;
         this.y += (this.posY - this.y) * 0.35;
         this.x += this.bumpVel.x;
         this.x += (this.posX - this.x) * 0.35;
         var _loc_2: number= Math.abs(this.posX - this.x);
         var _loc_3: number= Math.abs(this.posY - this.y);
         if(_loc_2 < 0.25 && _loc_3 < 0.25)
         {
            this.y = this.posY;
            this.x = this.posX;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'bumpAnim'));
            this.bumpVel.x = 0;
            this.bumpVel.y = 0;
         }
      }
  arrowFadeOut(event: Event = null): void {
         this.arrow.alpha -= 0.05;
         if(this.arrow.alpha <= 0)
         {
            this.removeArrow();
         }
      }
  get tileX(): number {
         return this._tileX;
      }
  startFadeOut(): void {
         if(this.timeTillVanishTimeout != 0)
         {
            clearTimeout(this.timeTillVanishTimeout);
            this.timeTillVanishTimeout = uint(0);
         }
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'));
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'fadeIn'));
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'fadeOut'),false,0,true);
      }
  get realVars(): BlockSettings {
         return BlockManager.getBlockVars(this.id);
      }
  get tileY(): number {
         return this._tileY;
      }
  unDullOut(): void {
         var _loc_1: ColorTransform= new ColorTransform();
         this.transform.colorTransform = _loc_1;
      }
  resetCanMove(): void {
         this.canMove = true;
      }
  assignMoveBlockMoveCommand(param1: string): void {
         this.moveBlockActiveMode = true;
         this.moveBlockMoveCommand = param1;
      }
  reactorBlockBreak(event: Event): void {
         if(GamePage.instance.buttonsPressed.indexOf(this.reactorID) >= 0)
         {
            GamePage.instance.shatterBlock(this);
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'reactorBlockBreak'));
         }
      }
  getDependentBlockIds(): any[] {
         if(this.vars.type == BlockSettings.CHANGE)
         {
            return this.vars.changePattern;
         }
         if(this.vars.type == BlockSettings.GENERATOR)
         {
            return [this.vars.generatorBlockID];
         }
         if(this.vars.isCustomItem())
         {
            return [this.vars.itemType.settings.p.id];
         }
         return null;
      }
  constructor(param1: BitmapData, param2: number) {
    param2 = int(param2);
         super();
         this.smoothing = false;
         this.bitmapData = param1;
         this._id = int(param2);
      }
}
$reg('com.jiggmin.pr3.block.Block', Block);
