// Ported from com/jiggmin/pr3/game/Minimap.as
import { Bitmap, BitmapData, ColorTransform, Dictionary, DisplayObject, Event, GlowFilter, Matrix, Point, Rectangle, clearTimeout, realTimer, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $keys, $b } from '../../../flash/as3.ts';
import { Popup } from '../../popup/Popup.ts';
import { Block, GamePage, LocalPlayer, MapManager, MatchPage, Maths, MiniMapDotGraphic, MiniMapFinishGraphic, MiniMapHatGraphic, Player, RecordedPlayer, RemotePlayer } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Minimap extends Popup {
  declare static instance: Minimap;
  blockCount: number = 0;
  finishColor: number = 65280;
  declare drawBlocksTimeout: any;
  bgColor: number = 0;
  declare dotArray: any[];
  drawing: boolean = false;
  maxMapHeight: number = 60;
  declare dotDict: any;
  declare bitmap: Bitmap;
  blockScale: number = 1;
  blockIndex: number = 0;
  minX: number = 170;
  scale: number = NaN;
  translateY: number = NaN;
  declare blockArray: any[];
  declare miniHatArray: any[];
  declare miniHatIdArray: any[];
  maxMapWidth: number = 0;
  translateX: number = NaN;
  blockColor: number = 0;
  maxX: number = 560;
  bitmapAlpha: number = 1;
  declare bitmapData: BitmapData;
  declare ghostPlayer: RecordedPlayer;
  declare ghostPlayerDot: any;
  createMinimap(): void {
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_1= MapManager.map.blockMap;
         if(_loc_1.minX != 9999999)
         {
            _loc_2 = new Rectangle(_loc_1.minX,_loc_1.minY,_loc_1.maxX - _loc_1.minX + Block.width,_loc_1.maxY - _loc_1.minY + Block.height);
            _loc_3 = this.maxMapWidth / _loc_2.width;
            _loc_4 = this.maxMapHeight / _loc_2.height;
            if(_loc_3 < _loc_4)
            {
               this.scale = _loc_3;
            }
            else
            {
               this.scale = _loc_4;
            }
            if(this.scale > 0.25)
            {
               this.scale = 0.25;
            }
            this.blockScale = Maths.limit(this.scale,0.025,0.25);
            this.translateX = -_loc_2.left * this.scale;
            this.translateY = -_loc_2.top * this.scale;
            this.createBitmap(_loc_2.width * this.scale,_loc_2.height * this.scale);
            this.blockIndex = int(0);
            this.redraw();
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         clearTimeout(this.drawBlocksTimeout);
         this.removePlayerDots();
         this.dotDict = null;
         this.dotArray = null;
         this.miniHatArray = null;
         this.miniHatIdArray = null;
         this.blockArray = null;
         this.removeBitmap();
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         var player: Player= null;
         var colTrans: ColorTransform= null;
         var playerDot: any= null;
         player = null;
         var i: number = int(0);
         colTrans = null;
         while(i < this.dotArray.length)
         {
            playerDot = this.dotArray[i];
            player = this.dotDict[playerDot];
            colTrans = $b(playerDot.dotColor.transform, 'colorTransform');
            if(player instanceof LocalPlayer)
            {
               if(MatchPage.instance != null && MatchPage.instance.levelType == "kingOfTheHat")
               {
                  if(player.hatArray.length == 0)
                  {
                     playerDot.gotoAndStop("local");
                  }
                  else
                  {
                     playerDot.gotoAndStop("localHat");
                  }
               }
               else
               {
                  playerDot.gotoAndStop("local");
               }
            }
            else if(player instanceof RemotePlayer || player instanceof RecordedPlayer)
            {
               if(MatchPage.instance != null && MatchPage.instance.levelType == "kingOfTheHat")
               {
                  if(player.hatArray.length == 0)
                  {
                     playerDot.gotoAndStop("remote");
                  }
                  else
                  {
                     playerDot.gotoAndStop("remoteHat");
                  }
               }
               else
               {
                  playerDot.gotoAndStop("remote");
               }
            }
            if(player.hatArray.length > 1 && MatchPage.instance != null && MatchPage.instance.levelType == "kingOfTheHat")
            {
               var safeHatID: number = int(player.hatArray[1] >= 1 && player.hatArray[1] <= 19 ? int(player.hatArray[1]) : 1);
               playerDot.hat.gotoAndStop(safeHatID - 1);
               playerDot.hat.colorMC.gotoAndStop(safeHatID - 1);
               this.setGraphicColor(playerDot.hat.colorMC,player.hatColorArray[1]);
            }
            if(player == null || player.removed)
            {
               delete this.dotDict[playerDot];
               this.dotArray.splice(i,1);
               if(playerDot.parent != null)
               {
                  playerDot.parent.removeChild(playerDot);
               }
            }
            else
            {
               playerDot.x = player.x * this.scale + this.translateX;
               playerDot.y = player.y * this.scale + this.translateY;
               playerDot.dotColor.transform.colorTransform = colTrans;
               i++;
            }
         }
      }
  createFinishDots(): void {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_1= GamePage.instance.finishPositions;
         for (_loc_2 of $each(_loc_1))
         {
            _loc_3 = new MiniMapFinishGraphic();
            _loc_3.x = _loc_2.x * this.scale + this.translateX;
            _loc_3.y = _loc_2.y * this.scale + this.translateY;
            this.addGraphic(_loc_3);
         }
      }
  moveMiniHat(pos: Point, id: number, hatNum: number, hatCol: number): void {
    id = int(id); hatNum = int(hatNum); hatCol = int(hatCol);
         var i= 0;
         while(i < this.miniHatArray.length)
         {
            if(this.miniHatIdArray[i] == id)
            {
               this.miniHatArray[i].x = pos.x * this.scale + this.translateX;
               this.miniHatArray[i].y = pos.y * this.scale + this.translateY;
               hatNum = int(hatNum >= 1 && hatNum <= 19 ? hatNum : 1);
               this.miniHatArray[i].hat.gotoAndStop(hatNum - 1);
               this.miniHatArray[i].hat.colorMC.gotoAndStop(hatNum - 1);
               this.setGraphicColor(this.miniHatArray[i].hat.colorMC,hatCol);
            }
            i++;
         }
      }
  createMiniHat(pos: Point, id: number): void {
    id = int(id);
         var _loc_3= new MiniMapHatGraphic();
         _loc_3.x = pos.x * this.scale + this.translateX;
         _loc_3.y = pos.y * this.scale + this.translateY;
         this.addGraphic(_loc_3);
         this.miniHatArray.push(_loc_3);
         this.miniHatIdArray.push(id);
      }
  removeMiniHat(id: number): void {
    id = int(id);
         var i= 0;
         while(i < this.miniHatArray.length)
         {
            if(this.miniHatIdArray[i] == id)
            {
               this.miniHatArray[i].parent.removeChild(this.miniHatArray[i]);
               this.miniHatArray.splice(i,1);
               this.miniHatIdArray.splice(i,1);
            }
            i++;
         }
      }
  createBitmap(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         this.removeBitmap();
         param1 = int(int(Maths.limit(param1,1,this.maxMapWidth)));
         param2 = int(int(Maths.limit(param2,1,this.maxMapHeight)));
         this.bitmapData = new BitmapData(param1,param2,true,this.bgColor);
         this.bitmap = new Bitmap(this.bitmapData);
         this.bitmap.alpha = this.bitmapAlpha;
         this.addGraphic(this.bitmap);
         var _loc_3= new GlowFilter(16777215,0.5,3,3,1,3);
         var _loc_4= new Array(_loc_3);
         this.bitmap.filters = _loc_4;
      }
  removeBitmap(): void {
         if(this.bitmap != null)
         {
            this.bitmap.bitmapData = null;
            if(this.bitmap.parent != null)
            {
               this.bitmap.parent.removeChild(this.bitmap);
            }
         }
         if(this.bitmapData != null)
         {
            this.bitmapData.dispose();
            this.bitmapData = null;
         }
      }
  createPlayerDots(): void {
         var player= null;
         var playerDot= null;
         this.removePlayerDots();
         var players: any[]= GamePage.instance.playerArray;
         for (player of $each(players))
         {
            playerDot = new MiniMapDotGraphic();
            this.addGraphic(playerDot);
            this.dotDict[playerDot] = player;
            this.dotArray.push(playerDot);
            this.updatePlayerColor(player,player.outlineColor);
         }
      }
  addPlayerDot(player: Player): void {
         var minimapDot= null;
         minimapDot = new MiniMapDotGraphic();
         this.addGraphic(minimapDot);
         this.dotDict[minimapDot] = player;
         this.dotArray.push(minimapDot);
         this.updatePlayerColor(player,player.outlineColor);
      }
  drawBlocks(): void {
         var block: Block= null;
         this.drawing = true;
         if(this.blockArray == null)
         {
            this.blockArray = MapManager.map.blockMap.createUberArray();
            this.blockArray.sortOn(["x","y"],Array.NUMERIC);
            this.blockCount = int(this.blockArray.length);
         }
         var _loc_2= new Matrix();
         var _loc_4= realTimer() + 33;
         if(this.bitmapData != null)
         {
            this.bitmapData.lock();
            while(this.blockIndex < this.blockCount)
            {
               block = (this.blockArray[this.blockIndex++]);
               _loc_2.createBox(this.blockScale,this.blockScale,0,this.translateX + block.x * this.scale,this.translateY + block.y * this.scale);
               this.bitmapData.draw(block,_loc_2);
               if(this.blockIndex % 100 == 0 && realTimer() > _loc_4)
               {
                  break;
               }
            }
            this.bitmapData.unlock();
         }
         if(this.blockIndex == this.blockCount)
         {
            this.drawing = false;
            this.dispatchEvent(new Event(Event.COMPLETE));
            this.blockArray = null;
         }
         else
         {
            clearTimeout(this.drawBlocksTimeout);
            this.drawBlocksTimeout = setTimeout($b(this, 'drawBlocks'),0);
         }
      }
  removePlayerDots(): void {
         var _loc_2= null;
         var _loc_1= 0;
         while(_loc_1 < this.dotArray.length)
         {
            _loc_2 = this.dotArray[_loc_1];
            if(_loc_2.parent != null)
            {
               _loc_2.parent.removeChild(_loc_2);
            }
            _loc_1++;
         }
         this.dotArray = new Array();
         this.dotDict = new Dictionary();
      }
  redraw(): void {
         super.redraw();
         if(this.bitmap != null)
         {
            this.visible = true;
            this.y = this.availableHeight - this.height + 10;
            this.x = (this.maxMapWidth - this.bitmap.width) / 2 + this.minX;
         }
         else
         {
            this.visible = false;
         }
      }
  drawMap(): void {
         this.createMinimap();
         this.createFinishDots();
         this.createPlayerDots();
         this.drawBlocks();
      }
  setConstraints(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         this.minX = int(param1);
         this.maxX = int(param2);
         this.maxMapWidth = int(param2 - param1);
         this.drawMap();
         this.redraw();
      }
  setGraphicColor(param1: DisplayObject, param2: number): void {
    param2 = uint(param2);
         var colTrans: ColorTransform= new ColorTransform();
         colTrans.color = param2;
         param1.transform.colorTransform = colTrans;
      }
  unsetGraphicColor(param1: DisplayObject): void {
         param1.transform.colorTransform = new ColorTransform();
      }
  updatePlayerColor(player: Player, color: number): void {
    color = int(color);
         var dotEntry= undefined;
         for (dotEntry of $keys(this.dotDict))
         {
            if(this.dotDict[dotEntry] == player)
            {
               if(color >= 0)
               {
                  this.setGraphicColor(dotEntry.dotColor,color);
               }
               else
               {
                  this.unsetGraphicColor(dotEntry.dotColor);
               }
               break;
            }
         }
      }
  constructor() {
         super();
         Minimap.instance = this;
         this.maxMapWidth = int(this.maxX - this.minX);
         this.dotDict = new Dictionary(true);
         this.dotArray = new Array();
         this.miniHatArray = new Array();
         this.miniHatIdArray = new Array();
         this.intrusive = false;
         this.bg.visible = false;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.game.Minimap', Minimap);
