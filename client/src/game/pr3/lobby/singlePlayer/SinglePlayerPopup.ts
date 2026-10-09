// Ported from com/jiggmin/pr3/lobby/singlePlayer/SinglePlayerPopup.as
import { ColorTransform, MovieClip } from '../../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../../flash/as3.ts';
import { LobbyPopup } from '../LobbyPopup.ts';
import { CampaignLevelSelector, OfflineGamePage, PartDescriptions, SelectorEvent, SinglePlayerPopupGraphic, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class SinglePlayerPopup extends LobbyPopup {
  declare static instance: SinglePlayerPopup;
  static selectedSeason: string = "classic";
  declare season: string;
  declare m: any;
  declare selector: CampaignLevelSelector;
  init(): void {
         super.init();
         SinglePlayerPopup.instance = this;
      }
  showPart(param1: MovieClip, param2: number, param3: number): void {
    param2 = int(param2);
         param1.visible = true;
         param1.gotoAndStop(param2);
         param1.colorMC.gotoAndStop(param2);
         var _loc_4= new ColorTransform();
         _loc_4.color = param3;
         param1.colorMC.transform.colorTransform = _loc_4;
      }
  remove(): void {
         this.selector.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectHandler'));
         this.selector.remove();
         this.selector = null;
         SinglePlayerPopup.instance = null;
         super.remove();
      }
  selectHandler(event: SelectorEvent): void {
         var _loc_2= event.data;
         if(_loc_2 != null)
         {
            this.startOfflineGamePage(_loc_2.levelID,_loc_2.version,_loc_2.ghost);
         }
      }
  startOfflineGamePage(levelID: number, levelVersion: number, ghost: any, spect: boolean = false): void {
    levelID = uint(levelID); levelVersion = uint(levelVersion);
         this.setPage(new OfflineGamePage(this.season,levelID,levelVersion,ghost,spect));
      }
  constructor(season: string = null) {
         var _loc_12= undefined;
         super();
         season = "classic";
         this.season = season;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_6= null;
         var _loc_7= NaN;
         var _loc_8= 0;
         var _loc_9= null;
         var _loc_10= null;
         var _loc_11= null;
         this.m = new SinglePlayerPopupGraphic();
         SinglePlayerPopup.instance = this;
         _loc_12 = false;
         this.m.leftFoot.visible = false;
         this.m.rightFoot.visible = _loc_12;
         this.m.body.visible = _loc_12;
         this.m.head.visible = _loc_12;
         this.m.hat.visible = _loc_12;
         this.addGraphic(this.m);
         var _loc_1= SocketManager.socket.countMyGoldMedals(this.season);
         var _loc_2= SocketManager.socket.me.vars.prizes[this.season];
         for (_loc_4 of $each(_loc_2))
         {
            if(_loc_4.medals > _loc_1 && (_loc_3 == null || _loc_4.medals < _loc_3.medals))
            {
               _loc_3 = _loc_4;
            }
         }
         if(_loc_3 == null)
         {
            this.m.gotoAndStop("finished");
            this.m.titleBox.text = "Congratulations! Victory is yours.";
         }
         else
         {
            this.m.gotoAndStop("showPrize");
            _loc_5 = _loc_3.id;
            _loc_6 = PartDescriptions[_loc_3.category + "TitleArray"][_loc_5 - 1] + " " + _loc_3.category.substr(0,1).toUpperCase() + _loc_3.category.substr(1);
            _loc_7 = 16777215;
            if(PartDescriptions[_loc_3.category + "DefaultColorArray"] != null && PartDescriptions[_loc_3.category + "DefaultColorArray"][_loc_5 - 1] != null)
            {
               _loc_7 = PartDescriptions[_loc_3.category + "DefaultColorArray"][_loc_5 - 1];
            }
            _loc_8 = _loc_3.medals - _loc_1;
            _loc_9 = _loc_6.charAt(0).toUpperCase();
            _loc_10 = "";
            _loc_11 = "a";
            if(_loc_8 != 1)
            {
               _loc_10 = "s";
            }
            if(_loc_9 == "A" || _loc_9 == "E" || _loc_9 == "I" || _loc_9 == "O" || _loc_9 == "U")
            {
               _loc_11 = "an";
            }
            if(_loc_3.category == "feet")
            {
               _loc_11 = "";
            }
            this.m.titleBox.text = "Earn " + _loc_8.toString() + " more gold medal" + _loc_10 + " to win " + _loc_11 + ":";
            this.m.bottomBox.text = _loc_6 + "!";
            if(_loc_3.category == "hat")
            {
               this.showPart(this.m.hat,_loc_5,_loc_7);
            }
            else if(_loc_3.category == "head")
            {
               this.showPart(this.m.head,_loc_5,_loc_7);
            }
            else if(_loc_3.category == "body")
            {
               this.showPart(this.m.body,_loc_5,_loc_7);
            }
            else if(_loc_3.category == "feet")
            {
               this.showPart(this.m.leftFoot,_loc_5,_loc_7);
               this.showPart(this.m.rightFoot,_loc_5,_loc_7);
            }
            if(_loc_3.category == "hat")
            {
               if(_loc_3.id == 11)
               {
                  this.m.hat.y += 10;
               }
               else if(_loc_3.id == 7)
               {
                  this.m.hat.x -= 5;
                  this.m.hat.y -= 5;
               }
               else if(_loc_3.id == 8)
               {
                  this.m.hat.x += 10;
                  this.m.hat.y -= 23;
               }
               else if(_loc_3.id == 9)
               {
                  this.m.hat.x += 15;
                  this.m.hat.y -= 5;
               }
            }
         }
         this.selector = new CampaignLevelSelector(this.season);
         this.selector.addEventListener(SelectorEvent.SELECT,$b(this, 'selectHandler'),false,0,true);
         this.selector.x = this.m.width + 10;
         this.addGraphic(this.selector);
      }
}
$reg('com.jiggmin.pr3.lobby.singlePlayer.SinglePlayerPopup', SinglePlayerPopup);
