// Ported from com/jiggmin/pr3/lister/MyLevelSelector.as
import { int, $b } from '../../../flash/as3.ts';
import { LevelSelector } from './LevelSelector.ts';
import { ButtonClass, EditorLevelButton, MessagePopup, PlatformRacing3, Settings, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MyLevelSelector extends LevelSelector {
  makeButton(): ButtonClass {
         return new EditorLevelButton();
      }
  makeButtonForLevel(param1: any): ButtonClass {
         var _loc_2= (super.makeButtonForLevel(param1));
         _loc_2.titleBox.text = param1.title;
         _loc_2.label = param1.title;
         _loc_2.width = 411;
         if(param1.publish == true)
         {
            _loc_2.publishedBox.text = "published";
         }
         else
         {
            _loc_2.publishedBox.text = "not published";
         }
         return _loc_2;
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= null;
         var _loc_4= false;
         if(Settings.loginType == "member")
         {
            _loc_3 = ({} as any);
            _loc_3.p_start = param1;
            _loc_3.p_count = param2;
            _loc_4 = false;
            Sparkworkz.DataAccess("GetMyLevels2",_loc_3,$b(this, 'getMyLevelsCallback'),_loc_4);
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  getMyLevelsCallback(param1: any, param2: string): void {
    var _loc_3_5; // undeclared in decompiled source
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= 0;
         var _loc_7= null;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your levels could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_6 = 0;
            while(_loc_6 < _loc_4)
            {
               _loc_3_5 = _loc_3[_loc_6];
               _loc_7 = ({} as any);
               _loc_7.creatorID = _loc_3_5.user_id;
               _loc_7.levelID = _loc_3_5.level_id;
               _loc_7.lastUpdated = _loc_3_5.last_updated;
               _loc_7.title = _loc_3_5.title;
               _loc_7.comment = _loc_3_5.comment;
               _loc_7.rating = _loc_3_5.rating;
               _loc_7.votes = _loc_3_5.votes;
               _loc_7.plays = _loc_3_5.plays;
               _loc_7.version = _loc_3_5.version;
               _loc_7.mode = _loc_3_5.mode;
               if(_loc_3_5.publish == 1)
               {
                  _loc_7.publish = true;
               }
               else
               {
                  _loc_7.publish = false;
               }
               _loc_5.push(_loc_7);
               _loc_6++;
            }
            this.setList(_loc_5);
         }
      }
  countMyLevelsCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("Your levels could not be counted " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = _loc_3.count;
            this.setTotalResults(_loc_4);
         }
      }
  constructor(param1: number = 7) {
    param1 = int(param1);
         var _loc_2= null;
         var _loc_3= false;
         super(param1,20);
         this.cacheSlug = "myLevels";
         this.cacheSeconds = int(60 * 60);
         this.setPageNum(this.getLastRememberedPage());
         if(Settings.loginType == "member")
         {
            _loc_2 = ({} as any);
            _loc_3 = false;
            Sparkworkz.DataAccess("CountMyLevels2",_loc_2,$b(this, 'countMyLevelsCallback'),_loc_3);
         }
      }
}
$reg('com.jiggmin.pr3.lister.MyLevelSelector', MyLevelSelector);
