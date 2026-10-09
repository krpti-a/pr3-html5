// Ported from com/jiggmin/pr3/map/MapHolder.as
import { BitmapData, ByteArray, ContextMenu, Event, Mouse, Point, SharedObject, Sprite, clearTimeout, realTimer, setTimeout } from '../../../flash/index.ts';
import { int, uint, $String, $each, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { ArtMapLayer, BGMapLayer, Block, BlockMapLayer, CommandMapLayer, ContextMenuEvent, Data, EffectMapLayer, MapLayer, Settings, TileMapLayer, Worker } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MapHolder extends Removable {
  static CACHE_VERSION: number = 2;
  static WRITE_ART_CACHE = false;
  static WRITE_ART_CACHE = false;
  static customContextMenu: ContextMenu = new ContextMenu();
  declare artDrawQueue: any[];
  flattenArtMapsTimeout: number = 0;
  declare _shiftHolder: Sprite;
  declare _blockMapArray: any[];
  declare _artMapArray: any[];
  declare _mapArray: any[];
  forceDrawBackgrounds: boolean = false;
  stamp: boolean = false;
  declare selectedMap: CommandMapLayer;
  flattenArt: boolean = false;
  declare bgMap: BGMapLayer;
  rot: number = 0;
  _bgColor: number = 0;
  _posX: number = NaN;
  _posY: number = NaN;
  declare _rotationHolder: Sprite;
  isV3: boolean = false;
  declare cacheKey: any;
  static openCustomContextMenuHandler(e: ContextMenuEvent): void {
         MapHolder.customContextMenu.customItems.length = 0;
         Mouse.show();
      }
  get posX(): number {
         return this._posX;
      }
  get posY(): number {
         return this._posY;
      }
  set posX(param1: number) {
         var _loc_2= null;
         this._posX = param1;
         for (_loc_2 of $each(this.mapArray))
         {
            _loc_2.posX = param1;
         }
      }
  redo(): void {
         if(this.selectedMap != null)
         {
            this.selectedMap.redo();
         }
      }
  get blockMapArray(): any[] {
         return this._blockMapArray;
      }
  remove(): void {
         clearTimeout(this.flattenArtMapsTimeout);
         this.removeMaps();
         this._mapArray = null;
         this._artMapArray = null;
         this._blockMapArray = null;
         this.artDrawQueue = null;
         super.remove();
      }
  setRot(param1: number): void {
         var _loc_2= null;
         this.rotationHolder.rotation = param1;
         this.rot = int(param1);
         for (_loc_2 of $each(this.artMapArray))
         {
            _loc_2.checkRotation(param1);
         }
      }
  get bgImage(): string {
         return this.bgMap.bgImage;
      }
  set posY(param1: number) {
         var _loc_2= null;
         this._posY = param1;
         for (_loc_2 of $each(this.mapArray))
         {
            _loc_2.posY = param1;
         }
      }
  getSelectedMap(): CommandMapLayer {
         if(this.selectedMap == null)
         {
            this.selectMap(this.blockMap);
         }
         return this.selectedMap;
      }
  set scale(param1: number) {
         var _loc_2= param1;
         this.rotationHolder.scaleY = param1;
         this.rotationHolder.scaleX = _loc_2;
      }
  createArtMap(param1: string = ""): ArtMapLayer {
         var _loc_2= new ArtMapLayer();
         _loc_2.mapName = param1;
         _loc_2.forceDrawBackgrounds = this.forceDrawBackgrounds;
         _loc_2.stamp = this.stamp;
         this.artMapArray.push(_loc_2);
         this.addMap(_loc_2);
         if(this.selectedMap == null)
         {
            this.selectMap(_loc_2);
         }
         return _loc_2;
      }
  get bgColor(): number {
         return this._bgColor;
      }
  get blockMap(): BlockMapLayer {
         return this.blockMapArray[0];
      }
  createBlockMap(): BlockMapLayer {
         var _loc_1= new BlockMapLayer();
         this.blockMapArray.push(_loc_1);
         this.addMap(_loc_1);
         return _loc_1;
      }
  get drawing(): boolean {
         var _loc_2= null;
         var _loc_1= false;
         for (_loc_2 of $each(this.mapArray))
         {
            if(_loc_2.drawing)
            {
               _loc_1 = true;
               break;
            }
         }
         return _loc_1;
      }
  removeMap(param1: MapLayer): void {
         var _loc_2= 0;
         param1.removeEventListener("finishDrawing",$b(this, 'finishDrawingLayerHandler'));
         if(param1 instanceof ArtMapLayer)
         {
            _loc_2 = this.artMapArray.indexOf(param1);
            if(_loc_2 != -1)
            {
               this.artMapArray.splice(_loc_2,1);
            }
         }
         else if(param1 instanceof BlockMapLayer)
         {
            _loc_2 = this.blockMapArray.indexOf(param1);
            if(_loc_2 != -1)
            {
               this.blockMapArray.splice(_loc_2,1);
            }
         }
         _loc_2 = this.mapArray.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.mapArray.splice(_loc_2,1);
         }
         if(param1.removed == false)
         {
            param1.remove();
         }
      }
  clearMap(param1: MapLayer): void {
         if(param1 instanceof TileMapLayer)
         {
            (param1).clear();
         }
      }
  removeMaps(): void {
         var _loc_1= null;
         while(this.mapArray.length > 0)
         {
            _loc_1 = this.mapArray[0];
            this.removeMap(_loc_1);
         }
      }
  setBG(param1: string): void {
         this.bgMap.setBGImage(param1);
      }
  createMap(): MapLayer {
         var _loc_1= new MapLayer();
         this.addMap(_loc_1);
         return _loc_1;
      }
  sortDepth(): void {
         var onTopOfBlocks: any[];
         var mapLayer: MapLayer= null;
         var blockMapIndex: number = int(0);
         var artMapLayer: MapLayer= null;
         var artMapLayerIndex: number = int(0);
         this.mapArray.sortOn(["layerNum","depth","sortNum"],Array.NUMERIC);
         onTopOfBlocks = this.mapArray.filter(function (item: MapLayer, index: number, array: any[]): any { index = int(index);
            if(item != null && item.layerNum == 2)
            {
               return true;
            }
            return false;
         });
         if(onTopOfBlocks != null && onTopOfBlocks.length > 0)
         {
            blockMapIndex = int(this.mapArray.indexOf(this.blockMap) + 1);
            for (artMapLayer of $each(onTopOfBlocks))
            {
               artMapLayerIndex = int(this.mapArray.indexOf(artMapLayer));
               if(artMapLayerIndex != -1)
               {
                  this.mapArray.splice(artMapLayerIndex,1);
                  this.mapArray.insertAt(blockMapIndex,artMapLayer);
               }
            }
         }
         for (mapLayer of $each(this.mapArray))
         {
            this._shiftHolder.addChild(mapLayer);
         }
      }
  selectMap(param1: CommandMapLayer): void {
         if(this.selectedMap != null)
         {
            this.selectedMap.selected = false;
         }
         param1.selected = true;
         this.selectedMap = param1;
      }
  get rotationHolder(): Sprite {
         return this._rotationHolder;
      }
  reset(): void {
         this.removeMaps();
         this.setBGColor(-1);
         this.posX = 0;
         this.posY = 0;
         this.setRot(0);
         this.artDrawQueue = new Array();
         this.selectedMap = null;
         clearTimeout(this.flattenArtMapsTimeout);
      }
  get scale(): number {
         return this.rotationHolder.scaleX;
      }
  createBGMap(): BGMapLayer {
         if(this.bgMap != null)
         {
            this.bgMap.remove();
         }
         this.bgMap = new BGMapLayer();
         this.addChildAt(this.bgMap,0);
         return this.bgMap;
      }
  set saveString(param1: string) {
         var versionString: string;
         var save: any= null;
         var decompressedStr: string= null;
         var bytes: ByteArray= null;
         var blockMapCount: number = int(0);
         var layersCount: number = uint(0);
         var i: number = int(0);
         var len: number = uint(0);
         var blockBytes: ByteArray= null;
         var version: number = uint(0);
         var layerBytes: ByteArray= null;
         var layer: any= null;
         var str= param1;
         while(this.artMapArray.length > 0)
         {
            this.removeMap(this.artMapArray[0]);
         }
         this.selectedMap = null;
         if(this.blockMap == null)
         {
            this.createBlockMap();
         }
         versionString = str.substr(0,5);
         if(versionString == "v3 | ")
         {
            this.isV3 = true;
            save = ({} as any);
            save.artArray = new Array();
            save.luaArray = new Array();
            bytes = Data.base64ToBinary(str.substr(5));
            blockMapCount = int(bytes.readInt());
            if(blockMapCount > 0)
            {
               bytes.readUnsignedInt();
               len = uint(bytes.readUnsignedInt());
               if(len > 0)
               {
                  blockBytes = new ByteArray();
                  bytes.readBytes(blockBytes,0,len);
                  blockBytes.inflate();
                  save.blockStr = blockBytes.readUTFBytes(blockBytes.length);
               }
            }
            layersCount = uint(bytes.readUnsignedInt());
            for(i = int(0); i < layersCount; i++)
            {
               version = uint(bytes.readUnsignedInt());
               len = uint(bytes.readUnsignedInt());
               if(len > 0)
               {
                  layerBytes = new ByteArray();
                  bytes.readBytes(layerBytes,0,len);
                  layer = ({} as any);
                  layer.version = version;
                  layer.bytes = layerBytes;
                  save.artArray.push(layer);
               }
            }
         }
         else
         {
            this.isV3 = false;
            if(versionString == "v2 | ")
            {
               str = str.substr(5);
            }
            else
            {
               try
               {
                  decompressedStr = Data.decompressString(str);
                  str = decompressedStr;
               }
               catch (e)
               {
               }
            }
            save = JSON.parse(str);
         }
         this.tryLoadCache(function (loadedFromCache: any): any {
            if(!loadedFromCache)
            {
               this.artDrawQueue = save.artArray;
            }
            else
            {
               this.sortDepth();
            }
            if(save.blockStr != null)
            {
               this.blockMap.addEventListener("finishDrawing",$b(this, 'finishDrawingLayerHandler'),false,0,true);
               this.blockMap.saveString = save.blockStr;
               this.selectMap(this.blockMap);
            }
            else
            {
               this.finishDrawingLayerHandler(new Event("finishDrawing"));
            }
         });
      }
  tryLoadCache(callback: Function): void {
         var cache: SharedObject;
         var artMapArray: any[]= null;
         var artLoader: Function= null;
         if(this.cacheKey == null)
         {
            callback.call(this,false);
            return;
         }
         if(!Settings.drawBackgrounds)
         {
            callback.call(this,true);
            return;
         }
         cache = SharedObject.getLocal("level/art/" + this.cacheKey.id);
         if(cache.data.cacheVersion !== MapHolder.CACHE_VERSION || cache.data.version !== this.cacheKey.version)
         {
            callback.call(this,false);
            return;
         }
         artMapArray = cache.data.artMapArray;
         cache = null;
         artLoader = function (index: number): any { index = int(index);
            var artLayerCallback: Function;
            var layer: ArtMapLayer;
            var mapHolder: MapHolder= null;
            var artLayerData: any= artMapArray[index];
            if(artLayerData == null)
            {
               callback.call(this,true);
               return;
            }
            mapHolder = this;
            artLayerCallback = function (): any {
               artLoader.call(mapHolder,index + 1);
            };
            layer = this.createArtMap();
            setTimeout($b(layer, 'fromCache'),0,artLayerData,artLayerCallback);
         };
         artLoader.call(this,0);
      }
  get mapArray(): any[] {
         return this._mapArray;
      }
  get artMapArray(): any[] {
         return this._artMapArray;
      }
  posToBlock(param1: number, param2: number): Block {
         var _loc_3= null;
         if(this.blockMap != null)
         {
            _loc_3 = this.blockMap.getBlockAtPos(param1,param2);
         }
         return _loc_3;
      }
  addCommand(param1: any): void {
         if(this.selectedMap != null)
         {
            this.selectedMap.addCommand(param1);
         }
      }
  undo(): void {
         if(this.selectedMap != null)
         {
            this.selectedMap.undo();
         }
      }
  get saveString(): string {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         var _loc_1= ({} as any);
         if(this.blockMap != null)
         {
            _loc_4 = this.blockMap.saveString;
            if(_loc_4 != "")
            {
               _loc_1.blockStr = _loc_4;
            }
         }
         _loc_1.artArray = new Array();
         for (_loc_2 of $each(this.artMapArray))
         {
            _loc_5 = _loc_2.saveString;
            _loc_1.artArray.push(_loc_5);
         }
         _loc_3 = JSON.stringify(_loc_1);
         return "v2 | " + _loc_3;
      }
  getByteSaveString(): string {
         var artMap: ArtMapLayer= null;
         var blockBytes: ByteArray= null;
         var mapBytes: ByteArray= null;
         var bytes: ByteArray= new ByteArray();
         if(this.blockMap != null)
         {
            bytes.writeInt(1);
            bytes.writeInt(0);
            blockBytes = new ByteArray();
            blockBytes.writeUTFBytes(this.blockMap.saveString);
            blockBytes.deflate();
            bytes.writeInt(blockBytes.length);
            bytes.writeBytes(blockBytes);
         }
         else
         {
            bytes.writeInt(0);
         }
         bytes.writeInt(this.artMapArray.length);
         for (artMap of $each(this.artMapArray))
         {
            mapBytes = artMap.getByteSaveString();
            bytes.writeInt(1);
            bytes.writeInt(mapBytes.length);
            bytes.writeBytes(mapBytes);
         }
         return "v3 | " + Data.binaryToBase64(bytes);
      }
  createEffectMap(): EffectMapLayer {
         var _loc_1= new EffectMapLayer();
         this.addMap(_loc_1);
         return _loc_1;
      }
  finishDrawingLayerHandler(event: Event): void {
         var _loc_2= null;
         var _loc_3= null;
         if(event.target != null)
         {
            event.target.removeEventListener("finishDrawing",$b(this, 'finishDrawingLayerHandler'));
         }
         if(this.artDrawQueue.length > 0)
         {
            _loc_3 = this.artDrawQueue.pop();
            _loc_2 = this.createArtMap();
            _loc_2.addEventListener("finishDrawing",$b(this, 'finishDrawingLayerHandler'),false,0,true);
            if(_loc_3 instanceof $String)
            {
               _loc_2.saveString = _loc_3;
            }
            else if(_loc_3.version == 1)
            {
               _loc_2.setByteSaveStringv2(_loc_3.bytes);
            }
            else
            {
               _loc_2.setByteSaveString(_loc_3.bytes);
            }
            this.sortDepth();
         }
         else
         {
            this.sortDepth();
            if(this.flattenArt)
            {
               this.flattenArtMaps();
            }
            else
            {
               this.dispatchEvent(new Event("finishDrawing"));
            }
         }
         this.dispatchEvent(new Event("layerChange"));
      }
  flattenArtMaps(): void {
    const $this = this;
         var _loc_1= 0;
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= false;
         var _loc_5= NaN;
         var _loc_6= 0;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_9= null;
         var _loc_10= 0;
         var _loc_11= 0;
         var _loc_12= null;
         var _loc_13= NaN;
         var _loc_14= null;
         var _loc_15= NaN;
         if(this._artMapArray.length > 1)
         {
            this._artMapArray.sortOn(["layerNum","depth","sortNum"],Array.NUMERIC);
            _loc_1 = this._artMapArray.length;
            _loc_4 = false;
            _loc_5 = realTimer();
            _loc_6 = 33;
            _loc_8 = new BitmapData(200,200,true);
            _loc_9 = new Point(0,0);
            _loc_10 = 0;
            while(_loc_10 < _loc_1)
            {
               _loc_2 = this._artMapArray[_loc_10];
               _loc_11 = _loc_10 + 1;
               while(_loc_11 < _loc_1)
               {
                  _loc_3 = this._artMapArray[_loc_11];
                  if(_loc_2.depth == _loc_3.depth && _loc_2.layerNum == _loc_3.layerNum)
                  {
                     if(_loc_2.alpha < 1)
                     {
                        _loc_12 = this.createArtMap();
                        _loc_12.depth = _loc_2.depth;
                        --_loc_2.sortNum;
                        _loc_3 = _loc_2;
                        _loc_2 = _loc_12;
                        this._artMapArray.sortOn(["layerNum","depth","sortNum"],Array.NUMERIC);
                        _loc_1++;
                     }
                     if(_loc_3.alpha < 1)
                     {
                        _loc_13 = Number(Data.alphaToHex(_loc_3.alpha));
                        _loc_8.fillRect(_loc_8.rect,_loc_13);
                        _loc_7 = _loc_8;
                     }
                     else
                     {
                        _loc_7 = null;
                     }
                     while(_loc_3.bitmapHolder.numChildren > 0)
                     {
                        _loc_14 = (_loc_3.bitmapHolder.getChildAt(0));
                        _loc_2.addBitmapAtPos(_loc_14,_loc_7,_loc_14.x,_loc_14.y);
                        _loc_15 = realTimer() - _loc_5;
                        if(_loc_15 > _loc_6)
                        {
                           _loc_4 = true;
                           break;
                        }
                     }
                     if(_loc_4)
                     {
                        break;
                     }
                     this.removeMap(_loc_3);
                     _loc_1--;
                     _loc_11--;
                  }
                  _loc_11++;
               }
               if(_loc_4)
               {
                  break;
               }
               _loc_10++;
            }
            _loc_8.dispose();
            if(!_loc_4)
            {
               this.sortDepth();
               this.cacheArt(function (): any {
                  $this.dispatchEvent(new Event("finishDrawing"));
               });
            }
            else
            {
               clearTimeout(this.flattenArtMapsTimeout);
               this.flattenArtMapsTimeout = uint(setTimeout($b(this, 'flattenArtMaps'),33));
            }
         }
         else
         {
            this.cacheArt(function (): any {
               $this.dispatchEvent(new Event("finishDrawing"));
            });
         }
      }
  cacheArt(callback: Function): void {
         var cache: SharedObject= null;
         if(this.cacheKey == null)
         {
            callback.call(this);
            return;
         }
         if(!Settings.drawBackgrounds || !MapHolder.WRITE_ART_CACHE)
         {
            callback.call(this);
            return;
         }
         cache = SharedObject.getLocal("level/art/" + this.cacheKey.id);
         if(cache.data.cacheVersion === MapHolder.CACHE_VERSION && cache.data.version === this.cacheKey.version)
         {
            callback.call(this);
            return;
         }
         this.getCacheData(function (data: any): any {
            if(data != null)
            {
               cache.setProperty("artMapArray",data);
               cache.setProperty("version",this.cacheKey.version);
               cache.setProperty("cacheVersion",MapHolder.CACHE_VERSION);
               try
               {
                  cache.flush();
               }
               catch (ignored)
               {
               }
            }
            callback.call(this);
         });
      }
  getCacheData(callback: Function): void {
         var data: any[]= null;
         var artSaver: Function= null;
         data = new Array();
         artSaver = function (index: number): any { index = int(index);
            var artLayerCallback: Function;
            var mapHolder: MapHolder= null;
            var artLayer: ArtMapLayer= this._artMapArray[index];
            if(artLayer == null)
            {
               callback.call(this,data);
               return;
            }
            mapHolder = this;
            artLayerCallback = function (artLayerData: any): any {
               if(artLayerData == null)
               {
                  callback.call(mapHolder,null);
                  return;
               }
               data.push(artLayerData);
               artSaver.call(mapHolder,index + 1);
            };
            setTimeout($b(artLayer, 'getCacheData'),0,artLayerCallback);
         };
         artSaver.call(this,0);
      }
  addMap(param1: MapLayer): void {
         this.mapArray.push(param1);
         param1.posX = this.posX;
         param1.posY = this.posY;
         param1.bgColor = this.bgColor;
         this.sortDepth();
      }
  setBGColor(param1: number): void {
    param1 = int(param1);
         var _loc_2= null;
         this._bgColor = int(param1);
         for (_loc_2 of $each(this.mapArray))
         {
            _loc_2.bgColor = param1;
         }
      }
  requestActivateShowAll(): void {
         var map= undefined;
         for (map of $each(this.mapArray))
         {
            if(map instanceof TileMapLayer)
            {
               map.requestActivateShowAll();
            }
         }
      }
  static __init() {
    MapHolder.customContextMenu.addEventListener(ContextMenuEvent.MENU_SELECT,MapHolder.openCustomContextMenuHandler);
  }
  constructor() {
         super();
         this._blockMapArray = new Array();
         this._artMapArray = new Array();
         this._mapArray = new Array();
         this._rotationHolder = new Sprite();
         this._shiftHolder = new Sprite();
         this._rotationHolder.x = Settings.gameWidth / 2;
         this._rotationHolder.y = Settings.gameHeight / 2;
         this._shiftHolder.x = -this._rotationHolder.x;
         this._shiftHolder.y = -this._rotationHolder.y;
         this._rotationHolder.addChild(this._shiftHolder);
         this.addChild(this._rotationHolder);
         this.reset();
         if(Boolean(Worker.isSupported) && Boolean(Worker.current.isPrimordial))
         {
            this.contextMenu = MapHolder.customContextMenu;
         }
      }
}
$reg('com.jiggmin.pr3.map.MapHolder', MapHolder);
