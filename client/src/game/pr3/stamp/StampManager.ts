// Ported from com/jiggmin/pr3/stamp/StampManager.as
import { Event, EventDispatcher, Matrix, StageQuality, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $keys } from '../../../flash/as3.ts';
import { CactusGraphic, Data, ItemStamp1, ItemStamp10, ItemStamp11, ItemStamp12, ItemStamp13, ItemStamp14, ItemStamp15, ItemStamp16, ItemStamp17, ItemStamp18, ItemStamp19, ItemStamp2, ItemStamp20, ItemStamp21, ItemStamp22, ItemStamp3, ItemStamp4, ItemStamp5, ItemStamp6, ItemStamp7, ItemStamp8, ItemStamp9, MapHolder, PetrifiedTreeGraphic, Rock2Graphic, RockGraphic, SkyscraperGraphic, Sparkworkz, Spire2Graphic, SpireGraphic, Stamp, StampEvent, StampSettings, Tree2Graphic, Tree3Graphic, TreeGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class StampManager {
  static stampBeingDrawn: number = 0;
  static drawTimeout: number = 0;
  declare static drawingMap: MapHolder;
  declare static eventDispatcher: EventDispatcher;
  static classicStamps: any[] = new Array();
  static classicStampsVar: any[] = new Array();
  static stampArray: any[] = new Array();
  static stampVarArray: any[] = new Array();
  static stampLoadArray: any[] = new Array();
  static stampDrawArray: any[] = new Array();
  static init(): void {
         var stamp: Stamp= null;
         var stampSettings: StampSettings= null;
         var _classicStamps: any[]= ["CactusGraphic","PetrifiedTreeGraphic","RockGraphic","Rock2Graphic","SkyscraperGraphic","SpireGraphic","Spire2Graphic","TreeGraphic","Tree2Graphic","Tree3Graphic","ItemStamp1","ItemStamp2","ItemStamp3","ItemStamp4","ItemStamp5","ItemStamp6","ItemStamp7","ItemStamp8","ItemStamp9","ItemStamp10","ItemStamp11","ItemStamp12","ItemStamp13","ItemStamp14","ItemStamp15","ItemStamp16","ItemStamp17","ItemStamp18","ItemStamp19","ItemStamp20","ItemStamp21","ItemStamp22"];
         for(var i: number = int(0); i < _classicStamps.length; i++)
         {
            stamp = new Stamp(i + 1,Data.stringToObjectToBitmapData(_classicStamps[i]));
            stampSettings = new StampSettings();
            stampSettings.classic = true;
            StampManager.stampArray[i + 1] = stamp;
            StampManager.stampVarArray[i + 1] = stampSettings;
            StampManager.classicStamps[i + 1] = stamp;
            StampManager.classicStampsVar[i + 1] = stampSettings;
         }
         StampManager.drawingMap = new MapHolder();
         StampManager.drawingMap.forceDrawBackgrounds = true;
         StampManager.drawingMap.stamp = true;
         StampManager.drawingMap.addEventListener("finishDrawing",StampManager.finishDrawingStampHandler,false,0,true);
         StampManager.eventDispatcher = new EventDispatcher();
      }
  static get finishedWithRequests(): boolean {
         return StampManager.stampBeingDrawn == 0 && StampManager.stampLoadArray.length <= 0 && StampManager.stampDrawArray.length <= 0;
      }
  static requestStamp(id: number): Stamp {
    id = uint(id);
         var stamp: Stamp= StampManager.stampArray[id];
         if(stamp == null)
         {
            stamp = StampManager.createTemporaryBlock(id);
            if(StampManager.stampLoadArray.indexOf(id) == -1)
            {
               StampManager.stampLoadArray.push(id);
            }
            StampManager.requestManyStampsInternal([id]);
         }
         else
         {
            StampManager.dispatchEvent(new StampEvent(StampEvent.STAMP_AVAILABLE,stamp));
         }
         return stamp.clone();
      }
  static getStamp(id: number): Stamp {
    id = uint(id);
         return StampManager.stampArray[id].clone();
      }
  static clearStamp(id: number): void {
    id = uint(id);
         if(StampManager.classicStamps[id] == null)
         {
            StampManager.stampArray[id] = null;
            StampManager.stampVarArray[id] = null;
         }
      }
  static clearCache(): void {
         var _stampId: string= null;
         var stampId: number = int(0);
         StampManager.stampArray = new Array();
         StampManager.stampVarArray = new Array();
         for (_stampId of $keys(StampManager.classicStamps))
         {
            stampId = int(int(_stampId));
            StampManager.stampArray[stampId] = StampManager.classicStamps[stampId];
            StampManager.stampVarArray[stampId] = StampManager.classicStampsVar[stampId];
         }
      }
  static requestManyStamps(stamps: any[]): void {
         var id: number = uint(0);
         var stamp: Stamp= null;
         var ids: any[]= new Array();
         for (id of $each(stamps.concat()))
         {
            stamp = StampManager.stampArray[id];
            if(stamp == null)
            {
               if(StampManager.stampLoadArray.indexOf(id) == -1)
               {
                  StampManager.stampLoadArray.push(id);
                  ids.push(id);
               }
            }
            else
            {
               StampManager.dispatchEvent(new StampEvent(StampEvent.STAMP_AVAILABLE,stamp));
            }
         }
         StampManager.requestManyStampsInternal(ids);
      }
  static requestManyStampsInternal(ids: any[]): void {
         var request: any= null;
         if(ids.length > 0)
         {
            request = ({} as any);
            request.p_stamp_array = ids.join(",");
            Sparkworkz.DataAccess("GetManyStamps",request,StampManager.loadManyStampsCallback,false);
         }
         else
         {
            StampManager.dispatchEvent(new Event("multiLoadComplete"));
         }
      }
  static loadManyStampsCallback(response: any, error: string): void {
         var i: number = int(0);
         var stamp: any= null;
         if(error == "")
         {
            for(i = int(0); i < response.NumRows; i++)
            {
               stamp = response.Row[i];
               StampManager.processLoadedStampData(stamp.stamp_id,stamp);
            }
         }
         StampManager.dispatchEvent(new Event("multiLoadComplete"));
      }
  static processLoadedStampData(id: number, data: any): void {
    id = uint(id);
         var index: number = int(int(StampManager.stampLoadArray.indexOf(id)));
         if(index != -1)
         {
            StampManager.stampLoadArray.splice(index,1);
         }
         var stamp: Stamp= StampManager.stampArray[id];
         if(stamp == null)
         {
            stamp = StampManager.createTemporaryBlock(id);
         }
         var stampSettings: StampSettings= StampManager.stampVarArray[id];
         stampSettings.title = data.title;
         stampSettings.comment = data.comemnt;
         stampSettings.category = data.category;
         stampSettings.art = data.art;
         stampSettings.drawing = true;
         StampManager.stampVarArray[id] = stampSettings;
         StampManager.dispatchEvent(new StampEvent(StampEvent.STAMP_AVAILABLE,stamp));
         if(StampManager.stampDrawArray.indexOf(id) == -1)
         {
            StampManager.stampDrawArray.push(id);
         }
         StampManager.drawNextStamp();
      }
  static createTemporaryBlock(id: number): Stamp {
    id = uint(id);
         var stamp: Stamp= new Stamp(id,Data.stringToObjectToBitmapDataSizeOverride("CactusGraphic",256,256));
         var settings: StampSettings= new StampSettings();
         settings.temporary = true;
         StampManager.stampArray[id] = stamp;
         StampManager.stampVarArray[id] = settings;
         return stamp;
      }
  static getVars(id: number): StampSettings {
    id = uint(id);
         return StampManager.stampVarArray[id];
      }
  static drawNextStamp(): void {
         var id: number = uint(0);
         var stamp: Stamp= null;
         if(StampManager.stampDrawArray.length > 0 && StampManager.stampBeingDrawn == 0)
         {
            id = uint(uint(StampManager.stampBeingDrawn = uint(StampManager.stampDrawArray.shift())));
            stamp = StampManager.stampArray[id];
            if(stamp != null)
            {
               StampManager.drawingMap.saveString = stamp.vars.art;
            }
            else
            {
               StampManager.drawNextStamp();
            }
         }
      }
  static finishDrawingStampHandler(event: Event): void {
         var stamp: Stamp= null;
         var matrix: Matrix= null;
         if(StampManager.stampBeingDrawn != 0)
         {
            stamp = StampManager.stampArray[StampManager.stampBeingDrawn];
            matrix = new Matrix();
            matrix.createBox(1,1,0,-(700 / 2 - stamp.bitmapData.height / 2),-(480 / 2 - stamp.bitmapData.width / 2));
            stamp.bitmapData.fillRect(stamp.bitmapData.rect,0);
            stamp.bitmapData.drawWithQuality(StampManager.drawingMap,matrix,null,null,null,false,StageQuality.HIGH);
            StampManager.stampVarArray[StampManager.stampBeingDrawn].drawing = false;
            StampManager.drawingMap.reset();
            StampManager.stampBeingDrawn = uint(0);
            clearTimeout(StampManager.drawTimeout);
            StampManager.drawTimeout = uint(setTimeout(StampManager.drawNextStamp,10));
         }
      }
  static removeEventListener(type: string, listener: Function, useCapture: boolean = false): void {
         StampManager.eventDispatcher.removeEventListener(type,listener,useCapture);
      }
  static addEventListener(type: string, listener: Function, useCapture: boolean = false, priority: number = 0, useWeakReference: boolean = false): void {
    priority = int(priority);
         StampManager.eventDispatcher.addEventListener(type,listener,useCapture,priority,useWeakReference);
      }
  static dispatchEvent(event: Event): void {
         StampManager.eventDispatcher.dispatchEvent(event);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.stamp.StampManager', StampManager);
