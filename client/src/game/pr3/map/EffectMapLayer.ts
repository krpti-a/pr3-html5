// Ported from com/jiggmin/pr3/map/EffectMapLayer.as
import { DisplayObject, MovieClip } from '../../../flash/index.ts';
import { MapLayer } from './MapLayer.ts';
import { MapManager, Removable } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EffectMapLayer extends MapLayer {
  declare static _instance: EffectMapLayer;
  static addEffect(param1: DisplayObject): void {
         if(EffectMapLayer.instance != null)
         {
            EffectMapLayer.instance.addChild(param1);
         }
      }
  static remove(): void {
         if(EffectMapLayer.instance != null)
         {
            EffectMapLayer.instance.remove();
         }
      }
  static get instance(): EffectMapLayer {
         if(EffectMapLayer._instance == null)
         {
            MapManager.map.createEffectMap();
         }
         return EffectMapLayer._instance;
      }
  static clear(): void {
         if(EffectMapLayer.instance != null)
         {
            EffectMapLayer.instance.clear();
         }
      }
  set posX(param1: number) {
         super.posX = Math.round(param1);
      }
  set posY(param1: number) {
         super.posY = Math.round(param1);
      }
  remove(): void {
         this.clear();
         EffectMapLayer._instance = null;
         super.remove();
      }
  clear(): void {
         var _loc_1= null;
         while(this.numChildren > 0)
         {
            _loc_1 = this.getChildAt(0);
            if(_loc_1 instanceof Removable)
            {
               (_loc_1).remove();
            }
            if(_loc_1 instanceof MovieClip)
            {
               (_loc_1).stop();
            }
            if(_loc_1.parent != null)
            {
               _loc_1.parent.removeChild(_loc_1);
            }
         }
      }
  get posX(): any { return super.posX; }
  get posY(): any { return super.posY; }
  constructor() {
         super();
         EffectMapLayer._instance = this;
         this.sortNum = 2000000004;
         this.mouseEnabled = false;
         this.mouseChildren = false;
      }
}
$reg('com.jiggmin.pr3.map.EffectMapLayer', EffectMapLayer);
