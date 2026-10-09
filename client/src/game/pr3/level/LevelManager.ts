// Ported from com/jiggmin/pr3/level/LevelManager.as
import { Event, EventDispatcher } from '../../../flash/index.ts';
import { int, uint } from '../../../flash/as3.ts';
import { CachableURLLoader, LevelEvent, MessagePopup, PlatformRacing3, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LevelManager {
  declare static disp: EventDispatcher;
  static dispatchEvent(event: Event): void {
         if(LevelManager.disp == null)
         {
            return;
         }
         LevelManager.disp.dispatchEvent(event);
      }
  static requestLevel(param1: number, param2: boolean = false): void {
    param1 = int(param1);
         var _loc_4;
         var _loc_3= ({} as any);
         _loc_3.p_level_id = param1;
         _loc_4 = false;
         if(!param2)
         {
            Sparkworkz.DataAccess("GetLevel2",_loc_3,function (response: any, error: any): any {
               LevelManager.loadCallback(response,error,param1,0);
            },_loc_4);
         }
         else
         {
            Sparkworkz.DataAccess("GetLockedLevel",_loc_3,function (response: any, error: any): any {
               LevelManager.loadCallback(response,error,param1,0);
            },_loc_4);
         }
      }
  static requestLevelCachable(id: number, version: number): void {
    id = uint(id); version = uint(version);
         CachableURLLoader.loadAndCallback(Sparkworkz.SPARKWORKS_LOCATION + "GetLevel?id=" + id + "&version=" + version,function (response: any, error: any): any {
            LevelManager.loadCallback(response,error,id,version);
         });
      }
  static removeEventListener(param1: string, param2: Function, param3: boolean = false): void {
         if(LevelManager.disp == null)
         {
            return;
         }
         LevelManager.disp.removeEventListener(param1,param2,param3);
      }
  static loadCallback(param1: any, param2: string, levelId: number = 0, levelVersion: number = 0): void {
    levelId = uint(levelId); levelVersion = uint(levelVersion);
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         if(param2 != "")
         {
            LevelManager.dispatchEvent(new LevelEvent(LevelEvent.LEVEL_UNAVAILABLE,{
               "levelID":levelId,
               "version":levelVersion
            }));
            PlatformRacing3.addPopup(new MessagePopup("Your level could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = ({} as any);
            _loc_4.title = _loc_3.title;
            _loc_4.comment = _loc_3.comment;
            _loc_4.version = _loc_3.version;
            _loc_4.mode = _loc_3.mode;
            _loc_4.items = _loc_3.items;
            _loc_4.alienChance = _loc_3.alienChance;
            _loc_4.sfchmChance = _loc_3.sfchm_chance;
            _loc_4.windChance = _loc_3.wind_chance;
            _loc_4.snowChance = _loc_3.snow_chance;
            _loc_4.seconds = _loc_3.seconds;
            _loc_4.songID = _loc_3.song_id;
            _loc_4.gravity = _loc_3.gravity;
            _loc_4.bgImage = _loc_3.bg_image;
            _loc_4.levelData = _loc_3.level_data;
            _loc_4.publish = _loc_3.publish;
            _loc_4.levelID = _loc_3.level_id;
            _loc_4.king_of_the_hat = _loc_3.king_of_the_hat;
            _loc_4.health = _loc_3.health;
            _loc_4.lua = _loc_3.lua;
            _loc_5 = _loc_4.levelData;
            LevelManager.dispatchEvent(new LevelEvent(LevelEvent.LEVEL_AVAILABLE,_loc_4));
         }
      }
  static addEventListener(param1: string, param2: Function, param3: boolean = false, param4: number = 0, param5: boolean = false): void {
    param4 = int(param4);
         if(LevelManager.disp == null)
         {
            LevelManager.disp = new EventDispatcher();
         }
         LevelManager.disp.addEventListener(param1,param2,param3,param4,param5);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.level.LevelManager', LevelManager);
