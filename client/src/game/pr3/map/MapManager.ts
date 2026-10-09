// Ported from com/jiggmin/pr3/map/MapManager.as
import { MapHolder } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MapManager {
  declare static _mapHolder: MapHolder;
  static init(): void {
         MapManager.clear();
      }
  static get map(): MapHolder {
         return MapManager._mapHolder;
      }
  static clear(): void {
         if(MapManager._mapHolder != null)
         {
            MapManager._mapHolder.remove();
            MapManager._mapHolder = null;
         }
         MapManager._mapHolder = new MapHolder();
         MapManager._mapHolder.createBGMap();
         MapManager._mapHolder.createBlockMap();
         MapManager._mapHolder.selectMap(MapManager._mapHolder.blockMap);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.map.MapManager', MapManager);
