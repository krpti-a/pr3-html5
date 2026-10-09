// Ported from com/jiggmin/pr3/lobby/PublishedLevelSelector.as
import { int } from '../../../flash/as3.ts';
import { LobbyLevelSelector } from './LobbyLevelSelector.ts';
import { ButtonClass, Settings, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class PublishedLevelSelector extends LobbyLevelSelector {
  declare mode: string;
  remove(): void {
         super.remove();
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(this.mode == "liked" && Settings.loginType != "member")
         {
            this.removeLoadingGraphic();
         }
         else
         {
            SocketManager.socket.getLevelList(this.mode,this.getRequestID(),param1,param2);
         }
      }
  makeButtonForLevel(param1: any): ButtonClass {
         var total= undefined;
         var percentageLikes= undefined;
         var percentageDislikes= undefined;
         var _loc_3= undefined;
         var _loc_2= null;
         _loc_2 = super.makeButtonForLevel(param1);
         if(param1.likes != null && param1.dislikes != null)
         {
            _loc_2.thumbs.likesTextBox.text = param1.likes;
            if(param1.likes > 0 || param1.dislikes > 0)
            {
               total = param1.likes + param1.dislikes;
               percentageLikes = param1.likes / total * 49.75;
               percentageDislikes = param1.dislikes / total * 49.75;
            }
         }
         _loc_2.commentBox.text = "[" + param1.mode + "] " + param1.comment;
         if(this.mode == "campaign" && param1.medalsRequired != null && SocketManager.socket != null && SocketManager.socket.countMyMedals(param1.campaignSeason) < param1.medalsRequired)
         {
            _loc_2.data = -1;
            _loc_2.alpha = 0.5;
            _loc_3 = false;
            _loc_2.mouseChildren = false;
            _loc_2.mouseEnabled = _loc_3;
         }
         return _loc_2;
      }
  constructor(param1: string, param2: number = 7) {
         super(param2,20);
    param2 = int(param2);
         this.mode = param1;

         this.cacheSlug = param1;
         this.paginationSlug = this.paginationSlug + " - " + param1;
         if(param1 == "campaign")
         {
            this.cacheSeconds = int(60 * 60);
         }
         if(param1 == "best")
         {
            this.cacheSeconds = int(60 * 10);
         }
         if(param1 == "bestToday")
         {
            this.cacheSeconds = int(60 * 10);
         }
         if(param1 == "newest")
         {
            this.cacheSeconds = int(5);
         }
         if(param1 == "liked")
         {
            this.cacheSeconds = int(60 * 10);
         }
         this.setPageNum(this.getLastRememberedPage());
      }
}
$reg('com.jiggmin.pr3.lobby.PublishedLevelSelector', PublishedLevelSelector);
