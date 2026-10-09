// Ported from com/jiggmin/pr3/game/FinishPopup.as
import { MovieClip } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { BonusListingGraphic, CheerSound, ConfirmPopup, CustomizePopup, Data, EasyScroll, EditorPopupBGGraphic, FinishPopupGraphic, LobbyPage, Maths, MessagePopup, NameMaker, SocketManager, Sounds, Sparkworkz, VoteThumbs } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class FinishPopup extends ButtonPopup {
  leveledUp: boolean = false;
  nextListingY: number = 40;
  declare m: any;
  declare voteThumbs: VoteThumbs;
  declare nameMaker: NameMaker;
  declare levelID: any;
  declare bonusItems: any[];
  declare scrollBar: EasyScroll;
  _padding: number = 5;
  rightPadding: number = 30;
  bottomPadding: number = 55;
  targetHeight: number = 150;
  targetWidth: number = 280;
  declare buttonContainer: MovieClip;
  declare userType: string;
  setFeaturedLevelCallback(param1: any, param2: string): void {
         if(param2 != "")
         {
            if(!this.removed)
            {
               this.addPopup(new MessagePopup("Could not set featured level " + param2));
            }
         }
      }
  addListing(param1: string, param2: string): void {
         var _loc_3= null;
         _loc_3 = new BonusListingGraphic();
         _loc_3.textBox.text = param1;
         _loc_3.bonusBox.text = param2;
         _loc_3.x = 0;
         _loc_3.y = this.nextListingY;
         this.m.addChild(_loc_3);
         this.nextListingY = int(this.nextListingY + (25));
         this.bonusItems.push(_loc_3);
      }
  addScroll(): void {
         if(this.scrollBar == null)
         {
            this.scrollBar = new EasyScroll();
         }
         if(this.scrollBar != null)
         {
            this.redrawScroll();
            this.scrollBar.height = this.targetHeight - this._padding * 2;
            this.scrollBar.x = this.targetWidth - this.scrollBar.width - this._padding + 10;
            this.scrollBar.y = this._padding;
            this.scrollBar.target = this.m;
            this.addGraphic(this.scrollBar);
            this.scrollBar.redraw();
            this.scrollBar.scrollPerc = 1;
            this.positionBackground();
         }
      }
  positionBackground(): void {
         var _loc_2= undefined;
         var _loc_1= this.holder.getBounds(this);
         _loc_2 = _loc_1.x - this.holder.x;
         var _loc_3= _loc_1.y - this.holder.y;
         this.bg.x = 0;
         this.bg.y = 0;
         this.bg.x += _loc_2;
         this.x = this.availableWidth / 2 - this.bg.width / 2;
         this.y = this.availableHeight / 2 - this.bg.height / 2;
      }
  redrawScroll(): void {
         if(this.scrollBar != null)
         {
            this.targetWidth = int(this.m.width - this.padding * 2 + this.rightPadding);
            this.targetHeight = int(this.bg.height - 20 - this.bottomPadding);
            if(Boolean(SocketManager.socket.me.hasPermission("access_unpublish_level")) || Boolean(SocketManager.socket.me.hasPermission("access_feature_level")))
            {
               this.changeButtonPos(40,this.targetHeight + 10);
            }
            else
            {
               this.changeButtonPos(80,this.targetHeight + 10);
            }
         }
      }
  changeButtonPos(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         this.buttonContainer.x += param1;
         this.buttonContainer.y = param2;
      }
  removeScroll(): void {
         if(this.scrollBar != null)
         {
            this.scrollBar.remove();
            this.scrollBar = null;
         }
      }
  remove(): void {
         if(this.voteThumbs != null)
         {
            this.voteThumbs.remove();
         }
         this.m = null;
         this.voteThumbs = null;
         if(this.stage != null)
         {
            this.stage.focus = this.stage;
         }
         this.removeScroll();
         this.nameMaker.remove();
         this.nameMaker = null;
         this.bonusItems = null;
         this.buttonContainer = null;
         super.remove();
      }
  clickUnpublish(): void {
         this.addPopup(new ConfirmPopup($b(this, 'confirmUnpublish'),"Are you sure you want to unpublish this level?"));
      }
  clickLobby(): void {
         if(this.leveledUp)
         {
            this.setPage(new LobbyPage("customize"));
         }
         else
         {
            this.setPage(new LobbyPage());
         }
      }
  confirmUnpublish(): void {
         SocketManager.socket.unpublishLevel(this.levelID);
      }
  confirmFeature(): void {
         var _loc_1= { p_level_id: this.levelID };
         var _loc_2= false;
         Sparkworkz.DataAccess("SetLOTD",_loc_1,$b(this, 'setFeaturedLevelCallback'),_loc_2);
      }
  clickFeature(): void {
         this.addPopup(new ConfirmPopup($b(this, 'confirmFeature'),"Are you sure you want to set this level as the Level of the Day? (This may take up to an hour to take effect)"));
      }
  clickClose(): void {
         this.remove();
      }
  constructor(param1: number, param2: any, param3: string, authorName: string = "Bob", authorUserId: number = 0, authorColor: number = 0) {
    param1 = int(param1); authorUserId = uint(authorUserId); authorColor = uint(authorColor);
         var _loc_7= undefined;
         super();
         _loc_7 = 0;
         var _loc_11= null;
         var _loc_12= 0;
         var _loc_13= 0;
         var _loc_14= 0;
         var _loc_15= 0;
         var _loc_16= null;
         var _loc_17= null;
         this.m = new FinishPopupGraphic();
         this.nameMaker = new NameMaker();
         this.setBG(new EditorPopupBGGraphic());
         this.bonusItems = new Array();
         this.buttonContainer = new MovieClip();
         this.addChild(this.buttonContainer);
         this.maxHeight = int(450);
         this.autoPosition = false;
         this.levelID = param1;
         this.m.bottom.levelUpAnim.visible = false;
         this.addGraphic(this.m);
         _loc_7 = 0;
         var _loc_9= this.nameMaker.makeNameFromParts(Data.cleanHTML(authorName),0,authorUserId,authorColor);
         this.m.titleBox.htmlText = "<font size=\'18\'>" + Data.cleanHTML(param3) + "</font><font color=\'#1D5497\' size=\'12\'> by </font><font size=\'14\'>" + _loc_9 + "</font>";
         this.nameMaker.listenForLink(this.m.titleBox);
         if(param2 != null)
         {
            _loc_7 = param2.totExpGain;
            for (_loc_11 of $each(param2.expArray))
            {
               _loc_16 = _loc_11[0];
               _loc_17 = String(_loc_11[1]);
               this.addListing(_loc_16,_loc_17);
            }
            _loc_12 = param2.rank;
            _loc_13 = param2.curExp;
            _loc_14 = _loc_13 + param2.totExpGain;
            _loc_15 = param2.maxExp;
            if(_loc_14 >= _loc_15)
            {
               _loc_14 = _loc_15;
               this.m.bottom.levelUpAnim.visible = true;
               this.leveledUp = true;
               CustomizePopup.leveledUp = true;
               Sounds.startSound(new CheerSound(),1);
            }
            else
            {
               this.m.bottom.rankProgressBox.text = _loc_14 + " / " + _loc_15;
            }
            this.m.bottom.progressBar.percent = _loc_14 / _loc_15 * 100;
         }
         else
         {
            this.addListing("--","--");
            this.m.bottom.rankProgressBox.text = "-- / --";
         }
         this.voteThumbs = new VoteThumbs(param1);
         this.voteThumbs.x = 156;
         this.voteThumbs.y = 107;
         this.m.bottom.addChild(this.voteThumbs);
         this.m.bottom.y = this.nextListingY + 10;
         var _loc_10= this.m.bottom.totalListing;
         _loc_10.textBox.text = "Total Exp Gain";
         _loc_10.bonusBox.text = String(_loc_7);
         this.addChild(this.createButton($b(this, 'clickClose'),"Close"));
         if(SocketManager.socket.me.hasPermission("access_unpublish_level"))
         {
            this.addChild(this.createButton($b(this, 'clickUnpublish'),"Unpublish"));
         }
         if(SocketManager.socket.me.hasPermission("access_feature_level"))
         {
            this.addChild(this.createButton($b(this, 'clickFeature'),"Feature"));
         }
         this.addChild(this.createButton($b(this, 'clickLobby'),"Return to Lobby"));
         if(this.bonusItems.length > 8 && this.scrollBar == null)
         {
            this.addScroll();
         }
         else if(this.bonusItems.length <= 8 && this.scrollBar == null)
         {
            this.autoHeight = false;
            this.holder.x = this.padding - 1;
            this.holder.y = this.padding - 1;
            this.bg.width = this.holder.width + this.padding * 2;
            this.bg.height = this.holder.height + 20 * 2;
            this.bg.height = Maths.limit(this.bg.height,15,this.maxHeight);
            this.targetHeight = int(this.bg.height - 20 - this.bottomPadding);
            if(Boolean(SocketManager.socket.me.hasPermission("access_unpublish_level")) || Boolean(SocketManager.socket.me.hasPermission("access_feature_level")))
            {
               this.changeButtonPos(40,this.targetHeight + 40);
            }
            else
            {
               this.changeButtonPos(175,this.targetHeight + 40);
            }
            this.positionBackground();
         }
         for(var i= 0; i < this.buttonArray.length; i++)
         {
            this.buttonContainer.addChild(this.buttonArray[i]);
         }
      }
}
$reg('com.jiggmin.pr3.game.FinishPopup', FinishPopup);
