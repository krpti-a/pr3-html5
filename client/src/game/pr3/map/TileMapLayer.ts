// Ported from com/jiggmin/pr3/map/TileMapLayer.as
import { DisplayObject, DisplayObjectContainer } from '../../../flash/index.ts';
import { int, $each } from '../../../flash/as3.ts';
import { MapLayer } from './MapLayer.ts';
import { Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class TileMapLayer extends MapLayer {
  lastLeftTile: number = -99999;
  tileSize: number = 200;
  declare map: any[];
  lastTopTile: number = -99999;
  lastBottomTile: number = -99999;
  lastRightTile: number = -99999;
  _selected: boolean = false;
  showAll: boolean = false;
  remove(): void {
         this.map = null;
         super.remove();
      }
  isTileWithinView(param1: number, param2: number): boolean {
    param1 = int(param1); param2 = int(param2);
         if(this.showAll)
         {
            return true;
         }
         if(param1 >= this.lastLeftTile && param1 <= this.lastRightTile && param2 >= this.lastTopTile && param2 <= this.lastBottomTile)
         {
            return true;
         }
         return false;
      }
  attachTilesInView(param1: DisplayObjectContainer): void {
         if(this.showAll)
         {
            return;
         }
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
         var _loc_4= 1 / _loc_3;
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
         var _loc_13= _loc_11 + Math.ceil(_loc_5 * _loc_4 / this.tileSize) + 1;
         var _loc_14= _loc_12 + Math.ceil(_loc_6 * _loc_4 / this.tileSize) + 1;
         var _loc_15= _loc_11 - this.lastLeftTile;
         var _loc_16= _loc_13 - this.lastRightTile;
         var _loc_17= _loc_12 - this.lastTopTile;
         var _loc_18= _loc_14 - this.lastBottomTile;
         _loc_19 = 0;
         if(Math.abs(_loc_15) > 5 || Math.abs(_loc_16) > 5 || Math.abs(_loc_17) > 5 || Math.abs(_loc_18) > 5)
         {
            param1.removeChildren();
            _loc_19 = 0;
            while(_loc_11 + _loc_19 <= _loc_13)
            {
               this.setColumn(_loc_11 + _loc_19,_loc_12,_loc_14,param1,"add");
               _loc_19++;
            }
         }
         else
         {
            _loc_19 = 0;
            while(_loc_19 != _loc_15)
            {
               if(_loc_15 > 0)
               {
                  this.setColumn(this.lastLeftTile + _loc_19,this.lastTopTile,this.lastBottomTile,param1,"remove");
                  _loc_19++;
               }
               else
               {
                  _loc_19--;
                  this.setColumn(this.lastLeftTile + _loc_19,_loc_12,_loc_14,param1,"add");
               }
            }
            _loc_19 = 0;
            while(_loc_19 != _loc_16)
            {
               if(_loc_16 > 0)
               {
                  _loc_19++;
                  this.setColumn(this.lastRightTile + _loc_19,_loc_12,_loc_14,param1,"add");
               }
               else
               {
                  this.setColumn(this.lastRightTile + _loc_19,this.lastTopTile,this.lastBottomTile,param1,"remove");
                  _loc_19--;
               }
            }
            _loc_19 = 0;
            while(_loc_19 != _loc_17)
            {
               if(_loc_17 > 0)
               {
                  this.setRow(this.lastTopTile + _loc_19,this.lastLeftTile,this.lastRightTile,param1,"remove");
                  _loc_19++;
               }
               else
               {
                  _loc_19--;
                  this.setRow(this.lastTopTile + _loc_19,_loc_11,_loc_13,param1,"add");
               }
            }
            _loc_19 = 0;
            while(_loc_19 != _loc_18)
            {
               if(_loc_18 > 0)
               {
                  _loc_19++;
                  this.setRow(this.lastBottomTile + _loc_19,_loc_11,_loc_13,param1,"add");
               }
               else
               {
                  this.setRow(this.lastBottomTile + _loc_19,this.lastLeftTile,this.lastRightTile,param1,"remove");
                  _loc_19--;
               }
            }
         }
         this.lastBottomTile = int(_loc_14);
         this.lastTopTile = int(_loc_12);
         this.lastLeftTile = int(_loc_11);
         this.lastRightTile = int(_loc_13);
      }
  clear(): void {
         this.map = new Array();
      }
  removeTile(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(this.map[param1] != null)
         {
            this.map[param1][param2] = null;
         }
      }
  setColumn(param1: number, param2: number, param3: number, param4: DisplayObjectContainer, param5: string): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         var _loc_6= 0;
         _loc_6 = param2;
         while(_loc_6 <= param3)
         {
            this.modifyDisplay(param1,_loc_6,param4,param5);
            _loc_6++;
         }
      }
  get selected(): boolean {
         return this._selected;
      }
  setRow(param1: number, param2: number, param3: number, param4: DisplayObjectContainer, param5: string): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         var _loc_6= 0;
         _loc_6 = param2;
         while(_loc_6 <= param3)
         {
            this.modifyDisplay(_loc_6,param1,param4,param5);
            _loc_6++;
         }
      }
  createUberArray(): any[] {
         var _loc_2= null;
         var _loc_3= undefined;
         var _loc_1= new Array();
         for (_loc_2 of $each(this.map))
         {
            if(_loc_2 != null)
            {
               for (_loc_3 of $each(_loc_2))
               {
                  if(_loc_3 != null)
                  {
                     _loc_1[_loc_1.length] = _loc_3;
                  }
               }
            }
         }
         return _loc_1;
      }
  runUberForEach(func: Function): void {
         var column: any[]= null;
         var tile= undefined;
         for (column of $each(this.map))
         {
            if(column != null)
            {
               for (tile of $each(column))
               {
                  if(tile != null)
                  {
                     func(tile);
                  }
               }
            }
         }
      }
  addTile(param1: any, param2: number, param3: number): void {
    param2 = int(param2); param3 = int(param3);
         var xMap: any[]= this.map[param2];
         if(xMap == null)
         {
            xMap = this.map[param2] = new Array();
         }
         xMap[param3] = param1;
      }
  modifyDisplay(param1: number, param2: number, param3: DisplayObjectContainer, param4: string): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_5= null;
         if(this.map[param1] != null && this.map[param1][param2] != null)
         {
            _loc_5 = (this.map[param1][param2]);
            if(param4 == "add")
            {
               param3.addChild(_loc_5);
            }
            else if(_loc_5.parent != null)
            {
               _loc_5.parent.removeChild(_loc_5);
            }
         }
      }
  set selected(param1: boolean) {
         this._selected = param1;
      }
  requestActivateShowAll(): void {
      }
  activateShowAll(holder: DisplayObjectContainer): void {
         var xMap= undefined;
         var object: DisplayObject= null;
         if(this.showAll)
         {
            return;
         }
         this.showAll = true;
         for (xMap of $each(this.map))
         {
            if(xMap != null)
            {
               for (object of $each(xMap))
               {
                  if(object != null)
                  {
                     holder.addChild(object);
                  }
               }
            }
         }
      }
  constructor() {
         super();
         this.map = new Array();
      }
}
$reg('com.jiggmin.pr3.map.TileMapLayer', TileMapLayer);
