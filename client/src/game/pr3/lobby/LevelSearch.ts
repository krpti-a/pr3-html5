// Ported from com/jiggmin/pr3/lobby/LevelSearch.as
import { int, uint, $b } from '../../../flash/as3.ts';
import { PublishedLevelSelector } from './PublishedLevelSelector.ts';
import { ListCache, MessagePopup, PlatformRacing3, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LevelSearch extends PublishedLevelSelector {
  static mode: string = "title";
  static search: string = "";
  static dir: string = "desc";
  static sort: string = "date";
  remove(): void {
         super.remove();
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= null;
         var _loc_4= false;
         if(LevelSearch.search != "")
         {
            _loc_3 = ({} as any);
            _loc_3.p_mode = this.mode;
            _loc_3.p_sort = LevelSearch.sort;
            _loc_3.p_dir = LevelSearch.dir;
            _loc_3.p_search_str = LevelSearch.search;
            _loc_4 = false;
            Sparkworkz.DataAccess("SearchLevels3",_loc_3,$b(this, 'searchLevelsCallback'),_loc_4);
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  searchLevelsCallback(param1: any, param2: string): void {
         var _loc_3_other= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= 0;
         var _loc_9= null;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("Could not search levels: " + param2));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_7 = this.start + this.count;
            if(_loc_7 > _loc_4)
            {
               _loc_7 = _loc_4;
            }
            this.setTotalResults(_loc_4);
            _loc_8 = 0;
            while(_loc_8 < _loc_4)
            {
               _loc_3_other = _loc_3[_loc_8];
               _loc_6 = ({} as any);
               _loc_6.userID = _loc_3_other.user_id;
               _loc_6.levelID = _loc_3_other.level_id;
               _loc_6.time = _loc_3_other.time;
               _loc_6.title = _loc_3_other.title;
               _loc_6.comment = _loc_3_other.comment;
               _loc_6.likes = uint(_loc_3_other.likes);
               _loc_6.dislikes = uint(_loc_3_other.dislikes);
               _loc_6.plays = _loc_3_other.plays;
               _loc_6.version = _loc_3_other.version;
               _loc_6.mode = _loc_3_other.mode;
               _loc_6.author = _loc_3_other.author_username;
               _loc_6.author_name_color = _loc_3_other.author_name_color;
               if(_loc_3_other.bronze != null)
               {
                  _loc_6.bronze = _loc_3_other.bronze;
                  _loc_6.silver = _loc_3_other.silver;
                  _loc_6.gold = _loc_3_other.gold;
                  _loc_6.medalsRequired = _loc_3_other.medals_required;
                  _loc_6.campaignSeason = _loc_3_other.campaign_sesion;
               }
               _loc_5.push(_loc_6);
               _loc_8++;
            }
            _loc_9 = _loc_5.slice(this.start,_loc_7);
            this.displayList(_loc_9);
            ListCache.saveToCache(this.cacheSlug,this.cacheSeconds,0,999,_loc_4,_loc_5);
         }
      }
  requestResults(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(LevelSearch.search != "")
         {
            this.cacheSlug = "levelSearch - " + LevelSearch.search + LevelSearch.mode + LevelSearch.sort + LevelSearch.dir;
            super.requestResults(param1,param2);
         }
      }
  constructor(param1: number) {
    param1 = int(param1);
         super("search",param1);
         this.cacheSeconds = int(10 * 60);
      }
}
$reg('com.jiggmin.pr3.lobby.LevelSearch', LevelSearch);
