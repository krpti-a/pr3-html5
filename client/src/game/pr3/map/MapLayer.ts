// Ported from com/jiggmin/pr3/map/MapLayer.as
import { ColorTransform, Sprite } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { Maths } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MapLayer extends Sprite {
  declare mapName: string;
  _layerNum: number = 1;
  _sortNum: number = 0;
  _drawing: boolean = false;
  _removed: boolean = false;
  _posX: number = 0;
  _posY: number = 0;
  _bgColor: number = -1;
  _z: number = 1;
  get depth(): number {
         return this._z;
      }
  get posX(): number {
         return this._posX;
      }
  get posY(): number {
         return this._posY;
      }
  set posY(param1: number) {
         this._posY = param1;
         this.y = param1 * this.depth;
      }
  remove(): void {
         this._removed = true;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  set depth(param1: number) {
         this._z = param1;
         this.posX = this._posX;
         this.posY = this._posY;
         this.calcColor();
      }
  set posX(param1: number) {
         this._posX = param1;
         this.x = param1 * this.depth;
      }
  set sortNum(param1: number) {
    param1 = int(param1);
         this._sortNum = int(param1);
      }
  set layerNum(param1: number) {
    param1 = int(param1);
         this._layerNum = int(param1);
      }
  calcColor(): void {
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= null;
         var _loc_1= this.alpha;
         if(this.bgColor != -1)
         {
            _loc_2 = Maths.hexToRGB(this.bgColor);
            _loc_3 = (1 - this.depth) * 0.4 + 0.25;
            if(_loc_3 < 0)
            {
               _loc_3 = 0;
            }
            if(_loc_3 > 0.75)
            {
               _loc_3 = 0.75;
            }
            _loc_4 = new ColorTransform(1 - _loc_3,1 - _loc_3,1 - _loc_3,1,_loc_2.r * _loc_3,_loc_2.g * _loc_3,_loc_2.b * _loc_3,0);
            this.transform.colorTransform = _loc_4;
         }
         else
         {
            this.transform.colorTransform = new ColorTransform();
         }
         this.alpha = _loc_1;
      }
  get sortNum(): number {
         return this._sortNum;
      }
  get layerNum(): number {
         return this._layerNum;
      }
  get drawing(): boolean {
         return this._drawing;
      }
  get removed(): boolean {
         return this._removed;
      }
  get bgColor(): number {
         return this._bgColor;
      }
  set bgColor(param1: number) {
    param1 = int(param1);
         this._bgColor = int(param1);
         this.calcColor();
      }
  constructor() {
         super();
         this.mouseEnabled = false;
         this.mouseChildren = false;
      }
}
$reg('com.jiggmin.pr3.map.MapLayer', MapLayer);
