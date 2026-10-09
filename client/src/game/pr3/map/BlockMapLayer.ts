// Ported from com/jiggmin/pr3/map/BlockMapLayer.as
import { DisplayObjectContainer, Sprite, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { CommandMapLayer } from './CommandMapLayer.ts';
import { Block, BlockManager, GamePage, LevelEditorPage, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockMapLayer extends CommandMapLayer {
  minX: number = NaN;
  minY: number = NaN;
  declare blockEffectHolder: Sprite;
  declare blockHolder: Sprite;
  checkFinishedTimeout: number = 0;
  _tileX: number = 0;
  _tileY: number = 0;
  maxX: number = NaN;
  maxY: number = NaN;
  blockGroupSize: number = 8;
  declare blockGroupArray: any[];
  blockGroupArraySize: number = 0;
  doCommand(param1: any): void {
         var _loc_7= undefined;
         var startX: number = int(0);
         var startY: number = int(0);
         var endX: number = int(0);
         var endY: number = int(0);
         var xNeg: boolean= false;
         var yNeg: boolean= false;
         var x= 0;
         var y= 0;
         var _loc_5= null;
         var _loc_2= param1.type;
         var _loc_3= Math.floor(param1.x / this.tileSize);
         var _loc_4= Math.floor(param1.y / this.tileSize);
         if(_loc_2 == "addBlock")
         {
            _loc_5 = BlockManager.requestBlock(param1.blockID);
            if(_loc_5.vars.temporary)
            {
               this.forceCommandBreak = true;
               _loc_7 = this.commandPos - 1;
               this.commandPos = int(_loc_7);
            }
            else if(Boolean(_loc_5.canFinish()) && Boolean(GamePage.instance.levelType == "kingOfTheHat") && !(GamePage.instance instanceof LevelEditorPage))
            {
               GamePage.instance.registerHatPosition(param1.x + 30,param1.y + 30);
            }
            else
            {
               this.addTile(_loc_5,_loc_3,_loc_4);
            }
         }
         else if(_loc_2 == "addMultipleBlocks")
         {
            _loc_5 = BlockManager.requestBlock(param1.blockID);
            if(_loc_5.vars.temporary)
            {
               this.forceCommandBreak = true;
               _loc_7 = this.commandPos - 1;
               this.commandPos = int(_loc_7);
            }
            else
            {
               startX = int(Math.floor(param1.startX / this.tileSize));
               startY = int(Math.floor(param1.startY / this.tileSize));
               endX = int(Math.ceil(param1.endX / this.tileSize));
               endY = int(Math.ceil(param1.endY / this.tileSize));
               xNeg = startX - endX < 0;
               yNeg = startY - endY < 0;
               x = startX;
               while(xNeg ? x < endX : x > endX)
               {
                  y = startY;
                  while(yNeg ? y < endY : y > endY)
                  {
                     if(Boolean(_loc_5.canFinish()) && Boolean(GamePage.instance.levelType == "kingOfTheHat") && !(GamePage.instance instanceof LevelEditorPage))
                     {
                        GamePage.instance.registerHatPosition(param1.x + 30,param1.y + 30);
                     }
                     else
                     {
                        this.addTile(_loc_5.clone(),x,y);
                     }
                     if(yNeg)
                     {
                        y++;
                     }
                     else
                     {
                        y--;
                     }
                  }
                  if(xNeg)
                  {
                     x++;
                  }
                  else
                  {
                     x--;
                  }
               }
            }
         }
         else if(_loc_2 == "removeBlock")
         {
            this.removeTile(_loc_3,_loc_4);
         }
         else if(_loc_2 == "removeBlocks")
         {
            startX = int(Math.floor(param1.startX / this.tileSize));
            startY = int(Math.floor(param1.startY / this.tileSize));
            endX = int(Math.ceil(param1.endX / this.tileSize));
            endY = int(Math.ceil(param1.endY / this.tileSize));
            xNeg = startX - endX < 0;
            yNeg = startY - endY < 0;
            x = startX;
            while(xNeg ? x < endX : x > endX)
            {
               y = startY;
               while(yNeg ? y < endY : y > endY)
               {
                  this.removeTile(x,y);
                  if(yNeg)
                  {
                     y++;
                  }
                  else
                  {
                     y--;
                  }
               }
               if(xNeg)
               {
                  x++;
               }
               else
               {
                  x--;
               }
            }
         }
      }
  removeBlocks(): void {
         var _loc_2= 0;
         var _loc_4= null;
         var _loc_1= this.createUberArray();
         var _loc_3= _loc_1.length;
         _loc_2 = 0;
         while(_loc_2 < _loc_3)
         {
            _loc_4 = (_loc_1[_loc_2]);
            if(_loc_4 != null)
            {
               _loc_4.remove();
            }
            _loc_2++;
         }
      }
  remove(): void {
         clearTimeout(this.checkFinishedTimeout);
         this.removeBlocks();
         this.removeChild(this.blockHolder);
         this.removeChild(this.blockEffectHolder);
         this.blockHolder = null;
         this.blockEffectHolder = null;
         super.remove();
      }
  addBlockAtTile(param1: Block, param2: number, param3: number): void {
    param2 = int(param2); param3 = int(param3);
         this.addTile(param1,param2,param3);
      }
  reset(): void {
         this.clear();
         this.commandPos = int(0);
         this.performCommands();
      }
  getBlockAtPos(param1: number, param2: number): Block {
         var _loc_3= Math.floor(param1 / this.tileSize);
         var _loc_4= Math.floor(param2 / this.tileSize);
         return this.getBlockAtTile(_loc_3,_loc_4);
      }
  removeTile(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= this.getBlockAtTile(param1,param2);
         if(_loc_3 != null)
         {
            _loc_3.remove();
         }
         super.removeTile(param1,param2);
      }
  finishedCommands(): void {
         if(BlockManager.finishedWithRequests)
         {
            super.finishedCommands();
         }
         else
         {
            clearTimeout(this.checkFinishedTimeout);
            this.checkFinishedTimeout = uint(setTimeout($b(this, 'finishedCommands'),33));
         }
      }
  adjustBoundries(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(param2 > this.maxY)
         {
            this.maxY = param2;
         }
         if(param2 < this.minY)
         {
            this.minY = param2;
         }
         if(param1 > this.maxX)
         {
            this.maxX = param1;
         }
         if(param1 < this.minX)
         {
            this.minX = param1;
         }
      }
  set saveString(param1: string) {
         var _loc_2= null;
         var _loc_3= 0;
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_7= 0;
         var _loc_8= 0;
         var _loc_9= 0;
         var _loc_10= null;
         var _loc_11= null;
         var _loc_12= null;
         var _loc_13= null;
         var _loc_14= 0;
         var _loc_15= null;
         this.clear();
         super.saveString = param1;
         if(param1 != "")
         {
            _loc_2 = param1.split(",");
            _loc_3 = _loc_2.length;
            _loc_6 = 0;
            _loc_7 = 0;
            _loc_12 = new Array();
            _loc_13 = new Array();
            _loc_14 = 0;
            while(_loc_14 < _loc_3)
            {
               _loc_11 = _loc_2[_loc_14];
               if(_loc_11.charAt(0) == "b")
               {
                  _loc_5 = int(_loc_11.substr(1));
               }
               else
               {
                  _loc_10 = _loc_11.split(":");
                  _loc_8 = int(_loc_10[0]);
                  _loc_9 = int(_loc_10[1]);
                  _loc_6 += _loc_8;
                  _loc_7 += _loc_9;
                  _loc_15 = ({} as any);
                  _loc_15.type = "addBlock";
                  _loc_15.blockID = _loc_5;
                  _loc_15.x = _loc_6 * this.tileSize;
                  _loc_15.y = _loc_7 * this.tileSize;
                  this.commandArray.push(_loc_15);
                  if(_loc_12[_loc_5] == null)
                  {
                     _loc_12[_loc_5] = true;
                     _loc_13.push(_loc_5);
                  }
               }
               _loc_14++;
            }
            BlockManager.requestManyBlocks(_loc_13);
            this.performCommands();
         }
         else
         {
            this.finishedCommands();
         }
      }
  getABlock(): Block {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_1= null;
         for (_loc_2 of $each(this.map))
         {
            if(_loc_2 != null)
            {
               for (_loc_3 of $each(_loc_2))
               {
                  if(_loc_3 != null && Boolean(_loc_3.active))
                  {
                     _loc_4 = this.getBlockAtTile(_loc_3.tileX,_loc_3.tileY - 1);
                     while(_loc_4 != null)
                     {
                        _loc_3 = _loc_4;
                        _loc_4 = this.getBlockAtTile(_loc_3.tileX,_loc_3.tileY - 1);
                     }
                     _loc_1 = _loc_3;
                     break;
                  }
               }
            }
         }
         return _loc_1;
      }
  resetBoundries(): void {
         this.maxY = -9999999;
         this.minY = 9999999;
         this.maxX = -9999999;
         this.minX = 9999999;
      }
  clear(): void {
         this.resetBoundries();
         this.removeBlocks();
         super.clear();
      }
  drawBlocks(): void {
         this.attachTilesInView(this.blockHolder);
      }
  get saveString(): string {
         var mapX: any[]= null;
         var data: string[]= null;
         var lastId: number= NaN;
         var lastX: number = int(0);
         var lastY: number = int(0);
         var block: Block= null;
         var blocks: any[]= new Array();
         for (mapX of $each(this.map))
         {
            for (block of $each(mapX))
            {
               if(block != null)
               {
                  blocks.push(block);
               }
            }
         }
         blocks.sortOn(["tileX","tileY"],[Array.NUMERIC,Array.NUMERIC]);
         data =  [];
         lastId = Number(NaN);
         lastX = int(0);
         lastY = int(0);
         for (block of $each(blocks))
         {
            if(block.id != lastId)
            {
               lastId = block.id;
               data.push("b" + lastId);
            }
            data.push(block.tileX - lastX + ":" + (block.tileY - lastY));
            lastX = int(block.tileX);
            lastY = int(block.tileY);
         }
         return data.join(",");
      }
  addTile(param1: any, param2: number, param3: number): void {
    param2 = int(param2); param3 = int(param3);
         var blockGroup: Sprite= null;
         var tileX: number = int(Math.floor(param2 / this.blockGroupSize));
         var tileY: number = int(Math.floor(param3 / this.blockGroupSize));
         this.removeTile(param2,param3);
         var _loc_4= (param1);
         _loc_4.x = param2 * this.tileSize;
         _loc_4.y = param3 * this.tileSize;
         _loc_4.tileX = param2;
         _loc_4.tileY = param3;
         _loc_4.init();
         if(this.showAll)
         {
            this.getOrCreateBlockGroup(tileX,tileY).addChild(_loc_4);
         }
         else
         {
            blockGroup = this.getOrCreateBlockGroup(tileX,tileY);
            blockGroup.addChild(_loc_4);
            if(this.isTileWithinView(param2,param3))
            {
               this.blockHolder.addChild(blockGroup);
            }
         }
         this.adjustBoundries(_loc_4.x,_loc_4.y);
         super.addTile(param1,param2,param3);
      }
  attachTilesInView(param1: DisplayObjectContainer): void {
         var j: number = int(0);
         var hash: number = int(0);
         var sprite: Sprite= null;
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_19= 0;
         var _loc_20= 0;
         var _loc_2= 0;
         var _loc_3= 1;
         if(this.parent != null && this.parent.parent != null)
         {
            _loc_2 = Math.round(this.parent.parent.rotation);
            _loc_3 = this.parent.parent.scaleX;
         }
         var _loc_4= 1 / Math.abs(_loc_3);
         var _loc_7= 0;
         var _loc_8= 0;
         var _loc_9= -this._posX - Settings.gameWidth / 2 * _loc_4 + Settings.gameWidth / 2;
         var _loc_10= -this._posY - Settings.gameHeight / 2 * _loc_4 + Settings.gameHeight / 2;
         if(_loc_2 == 0 || _loc_2 == 180 || _loc_2 == -180)
         {
            _loc_5 = Settings.gameWidth;
            _loc_6 = Settings.gameHeight;
         }
         else if(_loc_2 == 90 || _loc_2 == -90 || _loc_2 == 270 || _loc_2 == -270)
         {
            _loc_5 = Settings.gameHeight;
            _loc_6 = Settings.gameWidth;
            _loc_7 = 2;
            _loc_8 = -3;
         }
         else
         {
            _loc_5 = Settings.gameWidth;
            _loc_6 = Settings.gameWidth;
            _loc_7 = 0;
            _loc_8 = -3;
         }
         var _loc_11= Math.floor(_loc_9 / this.tileSize) + _loc_7;
         var _loc_12= Math.floor(_loc_10 / this.tileSize) + _loc_8;
         var _loc_13= Math.min(_loc_11 + Math.ceil(_loc_5 * _loc_4 / this.tileSize) + 1,this.maxX / this.tileSize);
         var _loc_14= Math.min(_loc_12 + Math.ceil(_loc_6 * _loc_4 / this.tileSize) + 1,this.maxY / this.tileSize);
         _loc_11 = Math.max(_loc_11,this.minX / this.tileSize);
         _loc_12 = Math.max(_loc_12,this.minY / this.tileSize);
         if(Math.floor(_loc_11 / this.blockGroupSize) == Math.floor(this.lastLeftTile / this.blockGroupSize) && Math.floor(_loc_13 / this.blockGroupSize) == Math.floor(this.lastRightTile / this.blockGroupSize) && Math.floor(_loc_12 / this.blockGroupSize) == Math.floor(this.lastTopTile / this.blockGroupSize) && Math.floor(_loc_14 / this.blockGroupSize) == Math.floor(this.lastBottomTile / this.blockGroupSize))
         {
            return;
         }
         this.blockHolder.removeChildren();
         for(var i: number = int(Math.floor(_loc_11 / this.blockGroupSize)); i <= Math.ceil(_loc_13 / this.blockGroupSize); i++)
         {
            for(j = int(Math.floor(_loc_12 / this.blockGroupSize)); j <= Math.ceil(_loc_14 / this.blockGroupSize); j++)
            {
               hash = int(i << 16 | j & 0xFFFF);
               sprite = this.blockGroupArray[hash];
               if(sprite != null)
               {
                  this.blockHolder.addChild(sprite);
               }
            }
         }
         this.lastBottomTile = int(_loc_14);
         this.lastTopTile = int(_loc_12);
         this.lastLeftTile = int(_loc_11);
         this.lastRightTile = int(_loc_13);
      }
  getOrCreateBlockGroup(tileX: number, tileY: number): Sprite {
    tileX = int(tileX); tileY = int(tileY);
         var hash: number = int(tileX << 16 | tileY & 0xFFFF);
         var sprite: Sprite= this.blockGroupArray[hash];
         if(sprite == null)
         {
            sprite = new Sprite();
            sprite.x = 0;
            sprite.y = 0;
            this.blockGroupArray[hash] = sprite;
            ++this.blockGroupArraySize;
         }
         return sprite;
      }
  getBlockAtTile(param1: number, param2: number): Block {
    param1 = int(param1); param2 = int(param2);
         var xMap: any[]= this.map[param1];
         if(xMap != null)
         {
            return xMap[param2];
         }
         return null;
      }
  addCommand(param1: any): void {
         var _loc_5= null;
         var _loc_6= null;
         var _loc_2= param1.type;
         var _loc_3= Math.floor(param1.x / this.tileSize);
         var _loc_4= Math.floor(param1.y / this.tileSize);
         if(_loc_2 == "addBlock")
         {
            _loc_5 = this.getBlockAtTile(_loc_3,_loc_4);
            if(_loc_5 == null || _loc_5.id != param1.blockID)
            {
               super.addCommand(param1);
            }
         }
         else if(_loc_2 == "removeBlock")
         {
            _loc_6 = this.getBlockAtTile(_loc_3,_loc_4);
            if(_loc_6 != null)
            {
               super.addCommand(param1);
            }
         }
         else
         {
            super.addCommand(param1);
         }
      }
  moveBlock(param1: Block, param2: number, param3: number): void {
    param2 = int(param2); param3 = int(param3);
         super.removeTile(param1.tileX,param1.tileY);
         this.addTile(param1,param2,param3);
      }
  requestActivateShowAll(): void {
         this.activateShowAll(this.blockHolder);
      }
  activateShowAll(holder: DisplayObjectContainer): void {
         var xMap= undefined;
         var _loc3_: Block= null;
         var _loc4_: number = int(0);
         var _loc5_: number = int(0);
      }
  constructor() {
         super();
         this.tileSize = int(Block.width);
         this.sortNum = 2000000002;
         this.blockHolder = new Sprite();
         this.addChild(this.blockHolder);
         this.blockEffectHolder = new Sprite();
         this.addChild(this.blockEffectHolder);
         this.resetBoundries();
         this.blockGroupArray = new Array();
      }
}
$reg('com.jiggmin.pr3.map.BlockMapLayer', BlockMapLayer);
