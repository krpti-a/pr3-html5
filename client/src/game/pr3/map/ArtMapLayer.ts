// Ported from com/jiggmin/pr3/map/ArtMapLayer.as
import { Bitmap, BitmapData, ByteArray, Dictionary, DisplayObject, Event, Point, Rectangle, Sprite, clearTimeout, realTimer, setTimeout } from '../../../flash/index.ts';
import { int, uint, $as, $each, $keys, $b } from '../../../flash/as3.ts';
import { RasterMapLayer } from './RasterMapLayer.ts';
import { BlockEditorPage, Data, LevelEditorPage, Loader, LockHandler, LockHolder, MapManager, MapPage, MapText, Maths, PNGEncoderOptions, Settings, Stamp, StampManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ArtMapLayer extends RasterMapLayer {
  lineAlpha: any = 1;
  lineColor: number = NaN;
  lineThickness: number = 1;
  lineAliasing: boolean = false;
  pixelPointerX: number = NaN;
  pixelPointerY: number = NaN;
  mode: string = "brush";
  declare rotateBitmap: Bitmap;
  declare holder: Sprite;
  forceDrawBackgrounds: boolean = false;
  stamp: boolean = false;
  declare drawnPixels: any;
  declare textHolder: Sprite;
  postSaveStringTimeout: number = 0;
  declare requiredStamps: any[];
  getTextAtPos(param1: number, param2: number): MapText {
         var _loc_5= null;
         var _loc_3= this.textHolder.numChildren - 1;
         var _loc_4= null;
         while(_loc_3 >= 0)
         {
            _loc_5 = (this.textHolder.getChildAt(_loc_3));
            if(_loc_5.isTouchingPos(param1,param2))
            {
               _loc_4 = _loc_5;
               break;
            }
            _loc_3--;
         }
         return _loc_4;
      }
  doCommand(param1: any): void {
         var _loc_7= undefined;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_6= null;
         var commandType= param1.type;
         if(commandType == "moveTo")
         {
            this.mode = param1.mode;
            this.lineThickness = param1.thickness;
            this.lineAliasing = param1.aliasing;
            this.lineColor = param1.color;
            this.lineAlpha = param1.alpha;
            this.holder.graphics.lineStyle(param1.thickness,param1.color,param1.alpha);
            this.holder.graphics.moveTo(param1.x,param1.y);
            if(param1.thickness > 1)
            {
               this.holder.graphics.lineTo(param1.x + 0.5,param1.y);
            }
            else
            {
               this.resetPixelDrawer(param1.x,param1.y);
            }
         }
         else if(commandType == "lineTo")
         {
            if(this.lineThickness > 1)
            {
               this.holder.graphics.lineTo(param1.x,param1.y);
            }
            else
            {
               this.usePixelDrawer(param1.x,param1.y);
            }
         }
         else if(commandType == "stamp")
         {
            _loc_3 = Data.stringToObject(param1.stamp);
            _loc_4 = new Sprite();
            _loc_7 = param1.scale / 100;
            _loc_3.scaleY = param1.scale / 100;
            _loc_3.scaleX = _loc_7;
            _loc_3.x = -_loc_3.width / 2;
            _loc_3.y = -_loc_3.height / 2;
            _loc_3.alpha = param1.alpha / 100;
            _loc_4.addChild(_loc_3);
            _loc_4.x = param1.x;
            _loc_4.y = param1.y;
            _loc_4.rotation = param1.rotation;
            this.rasterizeWithHolder(_loc_4);
         }
         else if(commandType == "stampv2")
         {
            _loc_3 = StampManager.requestStamp(param1.stamp);
            _loc_3.smoothing = true;
            _loc_4 = new Sprite();
            _loc_7 = param1.scale / 100;
            _loc_3.scaleY = param1.scale / 100;
            _loc_3.scaleX = _loc_7;
            _loc_3.x = -_loc_3.width / 2;
            _loc_3.y = -_loc_3.height / 2;
            _loc_3.alpha = param1.alpha / 100;
            _loc_4.addChild(_loc_3);
            _loc_4.x = param1.x;
            _loc_4.y = param1.y;
            _loc_4.rotation = param1.rotation;
            this.rasterizeWithHolder(_loc_4);
         }
         else if(commandType == "graphic")
         {
            this.rasterizeWithHolder(param1.graphic);
         }
         else if(commandType == "text")
         {
            if(this.textHolder.numChildren > param1.depth)
            {
               _loc_6 = (this.textHolder.getChildAt(param1.depth));
            }
            else
            {
               _loc_6 = new MapText();
               this.textHolder.addChild(_loc_6);
            }
            _loc_6.x = param1.x;
            _loc_6.y = param1.y;
            _loc_6.rotation = param1.rotation;
            _loc_6.color = param1.color;
            _loc_6.size = param1.size;
            _loc_6.text = param1.text;
         }
         else if(commandType == "commit")
         {
            this.commit();
         }
      }
  resetPixelDrawer(param1: number, param2: number): void {
         this.drawnPixels = new Dictionary();
         this.pixelPointerX = param1;
         this.pixelPointerY = param2;
         this.tryToDrawPixel(param1,param2);
      }
  remove(): void {
         StampManager.removeEventListener("multiLoadComplete",$b(this, 'loadedStamps'));
         this.clear();
         this.removeRotateBitmap();
         this.removeChild(this.holder);
         this.removeChild(this.textHolder);
         this.holder = null;
         this.textHolder = null;
         this.drawnPixels = null;
         super.remove();
      }
  clear(): void {
         var _loc_2= null;
         this.holder.graphics.clear();
         var _loc_1= this.textHolder.numChildren;
         while(_loc_1 > 0)
         {
            _loc_1--;
            _loc_2 = (this.textHolder.getChildAt(_loc_1));
            _loc_2.remove();
         }
         super.clear();
      }
  removeRotateBitmap(): void {
         if(this.rotateBitmap != null)
         {
            this.addChildAt(this.bitmapHolder,0);
            this.removeChild(this.rotateBitmap);
            this.rotateBitmap.bitmapData.dispose();
            this.rotateBitmap.bitmapData = null;
            this.rotateBitmap = null;
         }
      }
  usePixelDrawer(param1: number, param2: number): void {
         this.tryToDrawPixel(param1,param2);
         var _loc_3= this.pixelPointerX - param1;
         var _loc_4= this.pixelPointerY - param2;
         var _loc_5= Maths.pythag(_loc_3,_loc_4);
         var _loc_6= Math.atan2(_loc_4,_loc_3);
         var _loc_7= Math.cos(_loc_6);
         var _loc_8= Math.sin(_loc_6);
         var _loc_9= param1;
         var _loc_10= param2;
         var _loc_11= 0;
         while(_loc_5 > 1 && _loc_11 < _loc_5)
         {
            this.tryToDrawPixel(_loc_9,_loc_10);
            _loc_9 += _loc_7;
            _loc_10 += _loc_8;
            _loc_11 += 1;
         }
         this.pixelPointerX = param1;
         this.pixelPointerY = param2;
      }
  addMapText(param1: MapText): void {
         this.textHolder.addChild(param1);
      }
  commit(): void {
         if(this.mode == "brush")
         {
            this.rasterize(this.holder);
         }
         else if(this.mode == "eraser")
         {
            this.erase(this.holder);
         }
         this.addChild(this.holder);
         this.addChild(this.textHolder);
         this.holder.graphics.clear();
      }
  finishedCommands(): void {
         if(MapManager.map.flattenArt)
         {
            this.rasterizeAllText();
         }
         super.finishedCommands();
      }
  set saveString(param1: string) {
         StampManager.removeEventListener("multiLoadComplete",$b(this, 'loadedStamps'));
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= 0;
         var _loc_7= 0;
         var _loc_10= NaN;
         var _loc_11= NaN;
         var _loc_12= null;
         var _loc_13= NaN;
         var _loc_14= null;
         var _loc_17= null;
         super.saveString = param1;
         var _loc_2= param1.split(",");
         var _loc_3= _loc_2.length;
         var _loc_8= 0;
         var _loc_9= 0;
         var _loc_15= {
            "b":"brush",
            "e":"eraser",
            "brush":"brush"
         };
         var _loc_16= 0;
         while(_loc_16 < _loc_3)
         {
            _loc_4 = _loc_2[_loc_16];
            if(_loc_16 == 0)
            {
               this.depth = _loc_4;
            }
            else if(_loc_16 == 1)
            {
               this.sortNum = _loc_4;
            }
            else if(_loc_16 == 2)
            {
               this.alpha = _loc_4;
            }
            else if(_loc_16 == 3)
            {
               this.mapName = _loc_4;
            }
            else
            {
               _loc_17 = ({} as any);
               _loc_14 = _loc_4.charAt(0);
               if(_loc_14 == "+")
               {
                  _loc_17.type = "commit";
               }
               else if(_loc_14 == "m")
               {
                  _loc_4 = _loc_4.substr(1);
                  _loc_5 = _loc_4.split(":");
                  _loc_6 = int(_loc_5[0]);
                  _loc_7 = int(_loc_5[1]);
                  _loc_8 += _loc_6;
                  _loc_9 += _loc_7;
                  _loc_17.type = "moveTo";
                  _loc_17.x = _loc_8;
                  _loc_17.y = _loc_9;
                  if(_loc_5.length > 2)
                  {
                     _loc_10 = int(_loc_5[2]);
                     _loc_11 = int(_loc_5[3]);
                     _loc_12 = _loc_5[4];
                     _loc_13 = Number(_loc_5[5]);
                  }
                  _loc_17.thickness = _loc_10;
                  _loc_17.color = _loc_11;
                  _loc_17.mode = _loc_15[_loc_12];
                  _loc_17.alpha = _loc_13;
               }
               else if(_loc_14 == "s")
               {
                  _loc_4 = _loc_4.substr(1);
                  _loc_5 = _loc_4.split(":");
                  _loc_6 = int(_loc_5[0]);
                  _loc_7 = int(_loc_5[1]);
                  _loc_8 += _loc_6;
                  _loc_9 += _loc_7;
                  _loc_17.type = "stamp";
                  _loc_17.x = _loc_8;
                  _loc_17.y = _loc_9;
                  _loc_17.rotation = int(_loc_5[2]);
                  _loc_17.alpha = Number(_loc_5[3]);
                  _loc_17.scale = Number(_loc_5[4]);
                  _loc_17.stamp = _loc_5[5];
               }
               else if(_loc_14 == "p")
               {
                  _loc_4 = _loc_4.substr(1);
                  _loc_5 = _loc_4.split(":");
                  _loc_6 = int(_loc_5[0]);
                  _loc_7 = int(_loc_5[1]);
                  _loc_8 += _loc_6;
                  _loc_9 += _loc_7;
                  _loc_17.type = "stampv2";
                  _loc_17.x = _loc_8;
                  _loc_17.y = _loc_9;
                  _loc_17.rotation = int(_loc_5[2]);
                  _loc_17.alpha = Number(_loc_5[3]);
                  _loc_17.scale = Number(_loc_5[4]);
                  _loc_17.stamp = _loc_5[5];
                  this.requiredStamps.push(_loc_17.stamp);
               }
               else if(_loc_14 == "t")
               {
                  _loc_4 = _loc_4.substr(1);
                  _loc_5 = _loc_4.split(":");
                  _loc_17.type = "text";
                  _loc_17.x = _loc_5[0];
                  _loc_17.y = _loc_5[1];
                  _loc_17.rotation = _loc_5[2];
                  _loc_17.color = _loc_5[3];
                  _loc_17.size = _loc_5[4];
                  _loc_17.depth = _loc_5[5];
                  _loc_17.text = Data.base64ToStr(_loc_5[6]);
               }
               else
               {
                  _loc_5 = _loc_4.split(":");
                  _loc_6 = int(_loc_5[0]);
                  _loc_7 = int(_loc_5[1]);
                  _loc_8 += _loc_6;
                  _loc_9 += _loc_7;
                  _loc_17.type = "lineTo";
                  _loc_17.x = _loc_8;
                  _loc_17.y = _loc_9;
               }
               if(_loc_14 == "l")
               {
                  this.layerNum = int(_loc_4.substr(1));
               }
               else
               {
                  this.commandArray.push(_loc_17);
               }
            }
            _loc_16++;
         }
         if(!this.stamp && this.requiredStamps.length > 0)
         {
            StampManager.addEventListener("multiLoadComplete",$b(this, 'loadedStamps'),false,0,true);
            StampManager.requestManyStamps(this.requiredStamps);
         }
         else
         {
            this.postSaveString();
         }
      }
  postSaveString(): void {
         var stampId: number = uint(0);
         var stamp: Stamp= null;
         if(!this.stamp && this.requiredStamps.length > 0)
         {
            clearTimeout(this.postSaveStringTimeout);
            for (stampId of $each(this.requiredStamps))
            {
               stamp = StampManager.requestStamp(stampId);
               if(stamp.drawing)
               {
                  this.postSaveStringTimeout = uint(setTimeout($b(this, 'postSaveString'),33));
                  return;
               }
            }
         }
         if(Settings.drawBackgrounds || MapPage.instance instanceof LevelEditorPage || MapPage.instance instanceof BlockEditorPage || this.forceDrawBackgrounds)
         {
            this.performCommands();
         }
         else
         {
            this.finishedCommands();
         }
      }
  loadedStamps(event: Event): void {
         StampManager.removeEventListener("multiLoadComplete",$b(this, 'loadedStamps'));
         this.postSaveString();
      }
  undo(): void {
         var _loc_1= null;
         while(this.commandArray.length > 0)
         {
            _loc_1 = this.commandArray.pop();
            this.undoArray.push(_loc_1);
            if(_loc_1.type == "moveTo" || _loc_1.type == "stamp" || _loc_1.type == "stampv2" || _loc_1.type == "text")
            {
               break;
            }
         }
         this.clear();
         this.performCommands();
      }
  checkRotation(param1: number): void {
         this.removeRotateBitmap();
      }
  addRotateBitmap(): void {
         var _loc_1= null;
         if(this.rotateBitmap == null)
         {
            _loc_1 = new BitmapData(900,900,true,0);
            this.rotateBitmap = new Bitmap(_loc_1,"auto",false);
            this.rotateBitmap.x = -Math.round((_loc_1.width - Settings.gameWidth) / 2) - this.x;
            this.rotateBitmap.y = -Math.round((_loc_1.height - Settings.gameHeight) / 2) - this.y;
            this.drawBGToBitmapData(_loc_1,this.rotateBitmap.x,this.rotateBitmap.y);
            this.removeChild(this.bitmapHolder);
            this.addChildAt(this.rotateBitmap,0);
         }
      }
  rasterizeWithHolder(segtionHolder: DisplayObject): void {
         this.holder.addChild(segtionHolder);
         this.rasterize(this.holder);
         this.holder.removeChild(segtionHolder);
      }
  rasterizeAllText(): void {
         var _loc_4= null;
         var _loc_1= this.textHolder.numChildren;
         var _loc_2= 0;
         var _loc_3= null;
         while(_loc_2 < _loc_1)
         {
            _loc_4 = (this.textHolder.getChildAt(0));
            this.rasterizeWithHolder(_loc_4);
            _loc_4.remove();
            _loc_2++;
         }
      }
  addCommand(param1: any): void {
         var _loc_2= param1.type;
         if(_loc_2 == "commit")
         {
            if(this.commandArray.length > 0)
            {
               if(this.commandArray[this.commandArray.length - 1].type != "commit")
               {
                  super.addCommand(param1);
               }
            }
         }
         else
         {
            super.addCommand(param1);
         }
      }
  get saveString(): string {
         var _loc_4= null;
         var _loc_7= NaN;
         var _loc_8= NaN;
         var _loc_10= NaN;
         var _loc_11= NaN;
         var _loc_12= null;
         var _loc_13= NaN;
         var _loc_16= null;
         var _loc_17= null;
         var _loc_18= null;
         var _loc_1= new Array();
         this.mapName.split(",").join("");
         this.mapName.split(":").join("");
         this.mapName.split(";").join("");
         _loc_1.push(this.depth);
         _loc_1.push(this.sortNum);
         _loc_1.push(this.alpha);
         _loc_1.push(this.mapName);
         _loc_1.push("l" + this.layerNum);
         var _loc_2= 0;
         var _loc_3= this.textHolder.numChildren;
         while(_loc_2 < _loc_3)
         {
            _loc_4 = (this.textHolder.getChildAt(_loc_2));
            _loc_1.push("t" + _loc_4.x + ":" + _loc_4.y + ":" + _loc_4.rotation + ":" + _loc_4.color + ":" + _loc_4.size + ":" + _loc_2 + ":" + Data.strToBase64(_loc_4.text));
            _loc_2++;
         }
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_9= this.commandArray.length;
         var _loc_14= 0;
         while(_loc_14 < _loc_9)
         {
            _loc_16 = this.commandArray[_loc_14];
            if(_loc_16.type == "commit")
            {
               _loc_1.push("+");
            }
            if(_loc_16.type != "commit" && _loc_16.type != "text")
            {
               _loc_7 = Math.round(_loc_16.x - _loc_5);
               _loc_8 = Math.round(_loc_16.y - _loc_6);
               _loc_5 += _loc_7;
               _loc_6 += _loc_8;
            }
            if(_loc_16.type == "moveTo")
            {
               _loc_17 = _loc_16.mode.substr(0,1);
               _loc_18 = "m" + _loc_7 + ":" + _loc_8;
               if(_loc_10 != _loc_16.thickness || _loc_11 != _loc_16.color || _loc_12 != _loc_17 || _loc_13 != _loc_16.alpha)
               {
                  _loc_10 = _loc_16.thickness;
                  _loc_11 = _loc_16.color;
                  _loc_12 = _loc_17;
                  _loc_13 = _loc_16.alpha;
                  _loc_18 += ":" + _loc_10 + ":" + _loc_11 + ":" + _loc_12 + ":" + _loc_13;
               }
               _loc_1.push(_loc_18);
            }
            else if(_loc_16.type == "lineTo")
            {
               _loc_1.push(_loc_7 + ":" + _loc_8);
            }
            else if(_loc_16.type == "stamp")
            {
               _loc_1.push("s" + _loc_7 + ":" + _loc_8 + ":" + _loc_16.rotation + ":" + _loc_16.alpha + ":" + _loc_16.scale + ":" + _loc_16.stamp);
            }
            else if(_loc_16.type == "stampv2")
            {
               _loc_1.push("p" + _loc_7 + ":" + _loc_8 + ":" + _loc_16.rotation + ":" + _loc_16.alpha + ":" + _loc_16.scale + ":" + _loc_16.stamp);
            }
            _loc_14++;
         }
         var _loc_15= _loc_1.join(",");
         return _loc_1.join(",");
      }
  tryToDrawPixel(x: number, y: number): void {
         x = Math.round(x);
         y = Math.round(y);
         var xArray: any= this.drawnPixels[x];
         if(xArray == null)
         {
            this.drawnPixels[x] = xArray = new Dictionary();
         }
         else if(xArray[y] != null)
         {
            return;
         }
         if(this.mode == "brush")
         {
            this.drawPixel(x,y,this.lineColor,this.lineAlpha);
         }
         else if(this.mode == "eraser")
         {
            this.erasePixel(x,y,this.lineAlpha);
         }
         xArray[y] = true;
      }
  drawBGToBitmapData(bitmapData: BitmapData, x: number, y: number): void {
         var hash: number = int(0);
         var bitmap: Bitmap= null;
         var _loc_11= null;
         var _loc_4= Math.floor(x / this.tileSize);
         var _loc_5= Math.floor((x + bitmapData.width) / this.tileSize);
         var _loc_6= Math.floor(y / this.tileSize);
         var _loc_7= Math.floor((y + bitmapData.height) / this.tileSize);
         var _loc_8= _loc_4;
         var _loc_9= _loc_6;
         var _loc_10= new Point();
         while(_loc_8 <= _loc_5)
         {
            _loc_9 = _loc_6;
            while(_loc_9 <= _loc_7)
            {
               hash = int(_loc_8 << 16 | _loc_9 & 0xFFFF);
               bitmap = this.bitmapArray[hash];
               if(bitmap != null)
               {
                  _loc_10.x = _loc_8 * this.tileSize - x;
                  _loc_10.y = _loc_9 * this.tileSize - y;
                  bitmapData = bitmap.bitmapData;
                  bitmapData.copyPixels(bitmapData,bitmapData.rect,_loc_10,null,null,false);
               }
               _loc_9++;
            }
            _loc_8++;
         }
      }
  redo(): void {
         var _loc_1= null;
         var _loc_2= null;
         while(this.undoArray.length > 0)
         {
            _loc_1 = this.undoArray.pop();
            this.preserveUndoArray = true;
            this.addCommand(_loc_1);
            this.preserveUndoArray = false;
            this.performCommands();
            if(this.undoArray.length > 0)
            {
               _loc_2 = this.undoArray[this.undoArray.length - 1];
               if(_loc_2.type == "moveTo" || _loc_2.type == "stamp" || _loc_1.type == "stampv2" || _loc_2.type == "text")
               {
                  break;
               }
            }
         }
         this.commit();
      }
  getByteSaveString(): ByteArray {
         var bitmap: Bitmap= null;
         var x: number = int(0);
         var y: number = int(0);
         var pixels: ByteArray= null;
         this.rasterizeAllText();
         var bytes: ByteArray= new ByteArray();
         bytes.writeUTF(this.mapName);
         bytes.writeDouble(this.depth);
         bytes.writeDouble(this.alpha);
         bytes.writeInt(this.sortNum);
         bytes.writeInt(this.layerNum);
         bytes.writeInt(this.bitmapHolder.numChildren);
         var tile: Rectangle= new Rectangle(0,0,this.tileSize,this.tileSize);
         for (bitmap of $each(this.bitmapArray))
         {
            x = int(Math.floor(bitmap.x / this.tileSize));
            y = int(Math.floor(bitmap.y / this.tileSize));
            bytes.writeInt(x);
            bytes.writeInt(y);
            pixels = bitmap.bitmapData.getPixels(tile);
            pixels.deflate();
            bytes.writeInt(pixels.length);
            bytes.writeBytes(pixels);
         }
         bytes.deflate();
         return bytes;
      }
  setByteSaveString(bytes: ByteArray): void {
         var x: number = int(0);
         var y: number = int(0);
         var layerBytes: ByteArray= null;
         var bitmap: Bitmap= null;
         bytes.inflate();
         this.mapName = bytes.readUTF();
         this.depth = bytes.readDouble();
         this.alpha = bytes.readDouble();
         this.sortNum = bytes.readInt();
         this.layerNum = bytes.readInt();
         var layersCount: number = uint(bytes.readUnsignedInt());
         var tile: Rectangle= new Rectangle(0,0,this.tileSize,this.tileSize);
         var i: number = int(0);
         while(i < layersCount)
         {
            x = int(bytes.readInt());
            y = int(bytes.readInt());
            layerBytes = new ByteArray();
            bytes.readBytes(layerBytes,0,bytes.readInt());
            bitmap = this.createBitmapAtTile(x,y,this.bitmapHolder,this.bitmapArray);
            bitmap.bitmapData.setPixels(tile,layerBytes);
            i++;
         }
         setTimeout($b(this, 'dispatchEvent'),0,new Event("finishDrawing"));
      }
  setByteSaveStringv2(bytes: ByteArray): void {
         var x: number = int(0);
         var y: number = int(0);
         var layerBytes: ByteArray= null;
         var bitmap: Bitmap= null;
         bytes.inflate();
         this.mapName = bytes.readUTF();
         this.depth = bytes.readDouble();
         this.alpha = bytes.readDouble();
         this.sortNum = bytes.readInt();
         this.layerNum = bytes.readInt();
         var layersCount: number = uint(bytes.readUnsignedInt());
         var tile: Rectangle= new Rectangle(0,0,this.tileSize,this.tileSize);
         var i: number = int(0);
         while(i < layersCount)
         {
            x = int(bytes.readInt());
            y = int(bytes.readInt());
            layerBytes = new ByteArray();
            bytes.readBytes(layerBytes,0,bytes.readInt());
            layerBytes.inflate();
            bitmap = this.createBitmapAtTile(x,y,this.bitmapHolder,this.bitmapArray);
            bitmap.bitmapData.setPixels(tile,layerBytes);
            i++;
         }
         setTimeout($b(this, 'dispatchEvent'),0,new Event("finishDrawing"));
      }
  getCacheData(callback: Function): void {
         var data: any= null;
         var bitmapArray: any= null;
         var bitmapIndexes: any[]= null;
         var bitmapIndex: number = int(0);
         var tile: Rectangle= null;
         var saveFunction: Function= null;
         var artMapLayer: ArtMapLayer= null;
         var timeoutFunction: Function= null;
         data = ({} as any);
         data.mapName = this.mapName;
         data.depth = this.depth;
         data.alpha = this.alpha;
         data.sortNum = this.sortNum;
         data.layerNum = this.layerNum;
         bitmapArray = ({} as any);
         bitmapIndexes = Array();
         for (bitmapIndex of $keys(this.bitmapArray))
         {
            bitmapIndexes.push(bitmapIndex);
         }
         data.bitmapArray = bitmapArray;
         tile = new Rectangle(0,0,this.tileSize,this.tileSize);
         saveFunction = function (index: any): any {
            var bitmapIndex: number = int(0);
            var bitmap: Bitmap= null;
            var timeout: number = int(realTimer() + 66);
            var i: number = int(index);
            while(i < bitmapIndexes.length)
            {
               bitmapIndex = int(int(bitmapIndexes[i]));
               bitmap = this.bitmapArray[bitmapIndex];
               bitmapArray[bitmapIndex] = bitmap.bitmapData.encode(tile,new PNGEncoderOptions());
               if(i % 10 == 0 && realTimer() > timeout)
               {
                  break;
               }
               i++;
            }
            if(i == bitmapIndexes.length)
            {
               callback(data);
               return;
            }
            setTimeout(timeoutFunction,0,i + 1);
         };
         artMapLayer = this;
         timeoutFunction = function (index: any): any {
            try
            {
               saveFunction.call(artMapLayer,index);
            }
            catch (ignored)
            {
               callback(null);
            }
         };
         timeoutFunction(0);
      }
  fromCache(data: any, callback: Function): void {
         var bitmapArray: any;
         var bitmapIndexes: any[];
         var bitmapIndex: number = int(0);
         var loadedBitmaps: any[]= null;
         var artMapLayer: ArtMapLayer= null;
         var drawBitmaps= undefined;
         var lockHandler: LockHandler= null;
         var lock: LockHolder= null;
         var bitmapBytes: ByteArray= null;
         var bitmapLock: LockHolder= null;
         var x: number = int(0);
         var y: number = int(0);
         this.mapName = data.mapName;
         this.depth = data.depth;
         this.alpha = data.alpha;
         this.sortNum = data.sortNum;
         this.layerNum = data.layerNum;
         bitmapArray = data.bitmapArray;
         bitmapIndexes = Array();
         for (bitmapIndex of $keys(bitmapArray))
         {
            bitmapIndexes.push(bitmapIndex);
         }
         loadedBitmaps = new Array();
         artMapLayer = this;
         drawBitmaps = function (): any {
            var current: any= null;
            var bitmap: Bitmap= null;
            var bitmapData: BitmapData= null;
            var timeout: number = int(realTimer() + 66);
            while(true)
            {
               current = loadedBitmaps.pop();
               if(!current)
               {
                  break;
               }
               bitmap = artMapLayer.createBitmapAtTile(current.x,current.y,artMapLayer.bitmapHolder,artMapLayer.bitmapArray);
               bitmapData = current.bitmapData;
               bitmap.bitmapData.copyPixels(bitmapData,bitmapData.rect,new Point(0,0));
               if(loadedBitmaps.length % 10 == 0 && realTimer() > timeout)
               {
                  setTimeout(drawBitmaps,0);
                  return;
               }
            }
            callback();
         };
         lockHandler = new LockHandler(drawBitmaps);
         lock = lockHandler.acquireLock();
         for (bitmapIndex of $each(bitmapIndexes))
         {
            x = int((bitmapIndex >> 16 & 0xFFFF) << 16 >> 16);
            y = int((bitmapIndex & 0xFFFF) << 16 >> 16);
            bitmapBytes = $as(bitmapArray[bitmapIndex], ByteArray);
            bitmapLock = lockHandler.acquireLock();
            if(bitmapBytes == null)
            {
               bitmapLock.dispose();
            }
            else
            {
               this.loadBytes(x,y,bitmapBytes,bitmapLock,loadedBitmaps);
            }
         }
         lock.dispose();
      }
  loadBytes(x: number, y: number, bytes: ByteArray, lock: LockHolder, loadedBitmaps: any[]): void {
    x = int(x); y = int(y);
         var loader: Loader= null;
         if(bytes == null)
         {
            lock.dispose();
            return;
         }
         loader = new Loader();
         loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function (event: any): any {
            var bitmapData: BitmapData= loader.content.bitmapData;
            loadedBitmaps.push({
               "x":x,
               "y":y,
               "bitmapData":bitmapData
            });
            lock.dispose();
         });
         loader.loadBytes(bytes);
      }
  constructor() {
         var _loc_1= undefined;
         super();
         this.holder = new Sprite();
         this.textHolder = new Sprite();
         this.drawnPixels = new Dictionary();
         this.addChild(this.holder);
         this.addChild(this.textHolder);
         _loc_1 = true;
         this.mouseEnabled = true;
         this.mouseChildren = _loc_1;
         _loc_1 = true;
         this.textHolder.mouseEnabled = true;
         this.textHolder.mouseChildren = _loc_1;
         _loc_1 = false;
         this.holder.mouseEnabled = false;
         this.holder.mouseChildren = _loc_1;
         this.requiredStamps = new Array();
      }
}
$reg('com.jiggmin.pr3.map.ArtMapLayer', ArtMapLayer);
