// Ported from com/jiggmin/pr3/map/RasterMapLayer.as
import { Bitmap, BitmapData, BlendMode, DisplayObject, Matrix, PixelSnapping, Point, Rectangle, Sprite, StageQuality } from '../../../flash/index.ts';
import { int, uint, $each, $keys } from '../../../flash/as3.ts';
import { CommandMapLayer } from './CommandMapLayer.ts';
import { $reg } from '../../refs.ts';

export class RasterMapLayer extends CommandMapLayer {
  declare bitmapHolder: Sprite;
  baseColor: number = 0;
  declare emptyBitmapData: BitmapData;
  declare bitmapArray: any[];
  optimized: boolean = false;
  erasePixel(x: number, y: number, alpha: number): void {
         var offsetX: number = int(0);
         var offsetY: number = int(0);
         var oldColor: number = uint(0);
         var newColor: number = uint(0);
         x = Math.round(x);
         y = Math.round(y);
         alpha--;
         var bitmap: Bitmap= this.getBitmapAtPos(x,y);
         if(bitmap != null)
         {
            offsetX = int(x - bitmap.x);
            offsetY = int(y - bitmap.y);
            oldColor = uint(bitmap.bitmapData.getPixel32(offsetX,offsetY));
            newColor = uint(uint(Math.abs(Math.round((oldColor >> 24 & 0xFF) * alpha)) << 24 | (oldColor >> 16 & 0xFF) << 16 | (oldColor >> 8 & 0xFF) << 8 | oldColor & 0xFF));
            bitmap.bitmapData.setPixel32(offsetX,offsetY,newColor);
         }
      }
  remove(): void {
         this.clearBitmaps(this.bitmapHolder);
         this.bitmapArray = null;
         this.bitmapHolder = null;
         super.remove();
      }
  drawBitmaps(param1: Sprite, param2: any[], param3: DisplayObject): void {
         var _loc_5= NaN;
         var _loc_6= NaN;
         var _loc_7= NaN;
         var _loc_8= NaN;
         var _loc_9= NaN;
         var _loc_10= NaN;
         var _loc_4= param3.getBounds(param3);
         if(_loc_4.width != 0 && _loc_4.height != 0)
         {
            _loc_5 = Math.floor(_loc_4.x / this.tileSize) * this.tileSize;
            _loc_6 = Math.floor(_loc_4.y / this.tileSize) * this.tileSize;
            _loc_7 = _loc_4.x + _loc_4.width;
            _loc_8 = _loc_4.y + _loc_4.height;
            _loc_9 = _loc_5;
            _loc_10 = _loc_6;
            while(_loc_9 < _loc_7)
            {
               _loc_10 = _loc_6;
               while(_loc_10 < _loc_8)
               {
                  this.drawSeg(_loc_9,_loc_10,param1,param2,param3);
                  _loc_10 += this.tileSize;
               }
               _loc_9 += this.tileSize;
            }
         }
      }
  clear(): void {
         this.clearBitmaps(this.bitmapHolder);
         this.bitmapArray = new Array();
         super.clear();
      }
  addBitmapAtPos(bitmap: Bitmap, bitmapData: BitmapData, x: number, y: number): void {
         var tileX: number = int(Math.floor(x / this.tileSize));
         var tileY: number = int(Math.floor(y / this.tileSize));
         var hash: number = int(tileX << 16 | tileY & 0xFFFF);
         var startPoint: Point= null;
         if(bitmapData != null)
         {
            startPoint = new Point(0,0);
         }
         var bitmap_: Bitmap= this.bitmapArray[hash];
         if(bitmap_ != null)
         {
            bitmap_.bitmapData.copyPixels(bitmap.bitmapData,bitmap.bitmapData.rect,new Point(0,0),bitmapData,startPoint,true);
            bitmap.bitmapData.dispose();
            if(bitmap.parent != null)
            {
               bitmap.parent.removeChild(bitmap);
            }
         }
         else
         {
            if(bitmapData != null)
            {
               bitmap.bitmapData.copyPixels(bitmap.bitmapData,bitmap.bitmapData.rect,new Point(0,0),bitmapData,startPoint,false);
            }
            this.bitmapArray[hash] = bitmap;
            this.bitmapHolder.addChild(bitmap);
         }
      }
  moveBitmaps(bitmapHolder: Sprite, oldBitmapArray: any[], newBitmapArray: any[]): void {
         var hash: number = int(0);
         var bitmap: Bitmap= null;
         for (hash of $keys(newBitmapArray))
         {
            bitmap = oldBitmapArray[hash];
            if(bitmap != null)
            {
               bitmapHolder.addChild(bitmap);
               oldBitmapArray[hash] = null;
            }
         }
      }
  deleteBitmapIfEmpty(bitmap: Bitmap): boolean {
         var tileX: number = int(0);
         var tileY: number = int(0);
         var hash: number = int(0);
         var bitmapData: BitmapData= bitmap.bitmapData;
         var result: any= bitmapData.compare(this.emptyBitmapData);
         if(result == 0)
         {
            tileX = int(Math.round(bitmap.x / this.tileSize));
            tileY = int(Math.round(bitmap.y / this.tileSize));
            hash = int(tileX << 16 | tileY & 0xFFFF);
            this.clearBitmap(bitmap);
            this.bitmapArray[hash] = null;
            return true;
         }
         if(result instanceof BitmapData)
         {
            result.dispose();
         }
         return false;
      }
  clearBitmaps(param1: Sprite): void {
         var _loc_2= null;
         while(param1.numChildren != 0)
         {
            _loc_2 = (param1.getChildAt(0));
            this.clearBitmap(_loc_2);
         }
      }
  clearBitmap(param1: Bitmap): void {
         param1.bitmapData.dispose();
         param1.bitmapData = null;
         if(param1.parent != null)
         {
            param1.parent.removeChild(param1);
         }
         param1 = null;
      }
  drawPixel(x: number, y: number, color: number, alpha: number): void {
    color = uint(color);
         x = Math.round(x);
         y = Math.round(y);
         var tileX: number = int(Math.floor(x / this.tileSize));
         var tileY: number = int(Math.floor(y / this.tileSize));
         var bitmapTile: Bitmap= this.createBitmapAtTile(tileX,tileY,this.bitmapHolder,this.bitmapArray);
         var offsetX: number = int(x - bitmapTile.x);
         var offsetY: number = int(y - bitmapTile.y);
         var oldColor: number = uint(bitmapTile.bitmapData.getPixel32(offsetX,offsetY));
         var oldAlphaAmount: number= (oldColor >> 24 & 0xFF) / 255;
         var amount: number= 1 - alpha;
         var alphaCombined: number= oldAlphaAmount * amount;
         var newAlpha: number= oldAlphaAmount * amount + alpha;
         var newColor: number = uint(uint(Math.round(newAlpha * 255) << 24 | Math.round(((oldColor >> 16 & 0xFF) * alphaCombined + (color >> 16 & 0xFF) * alpha) / newAlpha) << 16 | Math.round(((oldColor >> 8 & 0xFF) * alphaCombined + (color >> 8 & 0xFF) * alpha) / newAlpha) << 8 | Math.round(((oldColor & 0xFF) * alphaCombined + (color & 0xFF) * alpha) / newAlpha)));
         bitmapTile.bitmapData.setPixel32(offsetX,offsetY,newColor);
      }
  deleteEmptyBitmaps(): void {
         var _loc_4= null;
         var _loc_5= false;
         var _loc_1= this.bitmapHolder;
         var _loc_2= 0;
         var _loc_3= _loc_1.numChildren;
         while(_loc_2 < _loc_3)
         {
            _loc_4 = (_loc_1.getChildAt(_loc_2));
            _loc_5 = this.deleteBitmapIfEmpty(_loc_4);
            if(_loc_5)
            {
               _loc_3--;
            }
            else
            {
               _loc_2++;
            }
         }
      }
  doRasterize(bitmapHolder: Sprite, bitmapArray: any[], segtionHolder: DisplayObject): void {
         this.drawBitmaps(bitmapHolder,bitmapArray,segtionHolder);
      }
  erase(segtionHolder: DisplayObject): void {
         var bitmap: Bitmap= null;
         var newBitmapArray: any[]= new Array();
         var resizedBitmapHolder: Sprite= new Sprite();
         this.doRasterize(resizedBitmapHolder,newBitmapArray,segtionHolder);
         var movedBitmapHolder: Sprite= new Sprite();
         this.moveBitmaps(movedBitmapHolder,this.bitmapArray,newBitmapArray);
         resizedBitmapHolder.blendMode = BlendMode.ERASE;
         var newBitmapHolder: Sprite= new Sprite();
         newBitmapHolder.addChild(movedBitmapHolder);
         newBitmapHolder.addChild(resizedBitmapHolder);
         var childrensCount: number = int(movedBitmapHolder.numChildren);
         for(var i: number = int(0); i < childrensCount; i++)
         {
            bitmap = (movedBitmapHolder.getChildAt(i));
            this.drawSeg(bitmap.x,bitmap.y,this.bitmapHolder,this.bitmapArray,newBitmapHolder);
         }
         this.clearBitmaps(resizedBitmapHolder);
         this.clearBitmaps(movedBitmapHolder);
         this.addChild(this.bitmapHolder);
      }
  drawSeg(x: number, y: number, bitmapHolder: Sprite, bitmapArray: any[], segtionHolder: DisplayObject): void {
         var tileX: number = int(Math.floor(x / this.tileSize));
         var tileY: number = int(Math.floor(y / this.tileSize));
         var bitmap: Bitmap= this.createBitmapAtTile(tileX,tileY,bitmapHolder,bitmapArray);
         var matrix: Matrix= new Matrix();
         matrix.createBox(1,1,0,-x,-y);
         bitmap.bitmapData.drawWithQuality(segtionHolder,matrix,null,null,null,false,StageQuality.HIGH);
      }
  rasterize(segtionHolder: DisplayObject): void {
         this.doRasterize(this.bitmapHolder,this.bitmapArray,segtionHolder);
      }
  createBitmapAtTile(x: number, y: number, holder: Sprite, array: any[]): Bitmap {
    x = int(x); y = int(y);
         var bitmapData: BitmapData= null;
         var hash: number = int(x << 16 | y & 0xFFFF);
         var bitmap: Bitmap= array[hash];
         if(bitmap == null)
         {
            try
            {
               bitmapData = new BitmapData(this.tileSize,this.tileSize,true,this.baseColor);
            }
            catch (e)
            {
               throw new Error("Out of memory!");
            }
            bitmap = new Bitmap(bitmapData,PixelSnapping.NEVER);
            bitmap.x = x * this.tileSize;
            bitmap.y = y * this.tileSize;
            array[hash] = bitmap;
            holder.addChild(bitmap);
         }
         return bitmap;
      }
  getBitmapAtPos(x: number, y: number): Bitmap {
         var tileX: number = int(Math.floor(x / this.tileSize));
         var tileY: number = int(Math.floor(y / this.tileSize));
         return this.bitmapArray[tileX << 16 | tileY & 0xFFFF];
      }
  finishedCommands(): void {
         var _loc1_: any[]= null;
         var _loc2_: Rectangle= null;
         var _loc3_: number = int(0);
         var _loc4_: number = int(0);
         var _loc5_: Bitmap= null;
         var _loc6_: any[]= null;
         var _loc7_: number = int(0);
         var _loc8_: any[]= null;
         var _loc9_: any[]= null;
         var _loc10_: any[]= null;
         var _loc11_: Bitmap= null;
         var _loc12_: number = int(0);
         var _loc13_: number = int(0);
         var _loc14_: number = int(0);
         super.finishedCommands();
      }
  combineBitmaps(main: Bitmap, others: any[]): void {
         var other: Bitmap= null;
         var x: number = int(0);
         var y: number = int(0);
         var tileX: number = int(0);
         var tileY: number = int(0);
         if(others.length < 1)
         {
            return;
         }
         var width: number = int(main.bitmapData.width);
         var height: number = int(main.bitmapData.height);
         var onlyMe: boolean= true;
         for (other of $each(others))
         {
            if(other != main)
            {
               onlyMe = false;
               width = int(Math.max(main.bitmapData.width + Math.abs(main.x - other.x),width));
               height = int(Math.max(main.bitmapData.height + Math.abs(main.y - other.y),height));
            }
         }
         if(onlyMe)
         {
            return;
         }
         var bitmapData: BitmapData= new BitmapData(width,height,true,this.baseColor);
         bitmapData.copyPixels(main.bitmapData,main.bitmapData.rect,new Point(0,0));
         var array: any[]= new Array();
         for (other of $each(others))
         {
            if(other != main)
            {
               x = int(Math.abs(other.x - main.x));
               y = int(Math.abs(other.y - main.y));
               bitmapData.copyPixels(other.bitmapData,other.bitmapData.rect,new Point(x,y));
               tileX = int(Math.floor(other.x / this.tileSize));
               tileY = int(Math.floor(other.y / this.tileSize));
               delete this.bitmapArray[tileX << 16 | tileY & 0xFFFF];
               if(this.bitmapHolder.contains(other))
               {
                  this.bitmapHolder.removeChild(other);
               }
            }
         }
         main.bitmapData = bitmapData;
      }
  constructor() {
         super();
         this.bitmapHolder = new Sprite();
         this.bitmapArray = new Array();
         this.tileSize = int(200);
         this.addChild(this.bitmapHolder);
         this.emptyBitmapData = new BitmapData(this.tileSize,this.tileSize,true,this.baseColor);
      }
}
$reg('com.jiggmin.pr3.map.RasterMapLayer', RasterMapLayer);
