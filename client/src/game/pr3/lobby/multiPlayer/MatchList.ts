// Ported from com/jiggmin/pr3/lobby/multiPlayer/MatchList.as
import { Event, clearInterval, setInterval } from '../../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../../flash/as3.ts';
import { Page } from '../../../page/Page.ts';
import { BlossomEvent, Color, CreatingMatchPopup, InMatchPopup, MatchListGraphic, MatchListing, MultiPlayerPopup, Popup, PracticePopup, QuickJoinPopup, Removable, SocketManager, StartMatchPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class MatchList extends Page {
  static lobbyIdNext: number = 0;
  lobbyId: number = uint(MatchList.lobbyIdNext++);
  declare cTint: Color;
  refreshInterval: number = 0;
  scrollPos: number = 0;
  declare matchArray: any[];
  declare m: any;
  maxMatches: number = 3;
  highestFullSlot: number = 0;
  declare lotd: MatchListing;
  startX: number = 10;
  levelRefresh: boolean = true;
  spacingY: number = 74;
  startY: number = 27;
  clickMatchCallback(param1: MatchListing): void {
         var _loc_2= param1.getMatchObj();
         param1.beginRemove();
         this.addPopup(new InMatchPopup(_loc_2));
      }
  clickUp(): void {
         var _loc_1= undefined;
         var _loc_2= undefined;
         if(this.canScrollUp())
         {
            _loc_1 = this;
            _loc_2 = this.scrollPos - 1;
            _loc_1.scrollPos = _loc_2;
         }
         this.calcMaxMatches();
      }
  remove(): void {
         clearInterval(this.refreshInterval);
         this.removeMatchListings();
         this.removeLOTD();
         this.matchArray = null;
         this.m = null;
         SocketManager.socket.removeEventListener("receiveMatches",$b(this, 'receiveMatchesHandler'));
         SocketManager.socket.removeEventListener("receiveLOTD",$b(this, 'receiveLOTDHandler'));
         SocketManager.socket.removeEventListener("tournament_status",$b(this, 'recieveTournamentStatusHandler'));
         SocketManager.socket.removeEventListener("force_match",$b(this, 'recieveForceMatchHandler'));
         SocketManager.socket.leaveLobby();
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  analyzeMatchArray(): any[] {
         this.highestFullSlot = int(0);
         var _loc_1= new Array();
         var _loc_2= 0;
         while(_loc_2 < this.maxMatches)
         {
            if(this.matchArray[_loc_2] == null)
            {
               _loc_1.push(_loc_2);
            }
            else
            {
               this.highestFullSlot = int(_loc_2);
            }
            _loc_2++;
         }
         return _loc_1;
      }
  removePopup(param1: Popup): void {
         super.removePopup(param1);
         if(this.popupArray.length <= 0)
         {
            this.startLevelRefresh();
         }
      }
  clickDown(): void {
         var _loc_1= undefined;
         var _loc_2= undefined;
         if(this.canScrollDown())
         {
            _loc_1 = this;
            _loc_2 = this.scrollPos + 1;
            _loc_1.scrollPos = _loc_2;
            this.calcMaxMatches();
            this.refreshMatches();
         }
      }
  addPopup(param1: Popup): void {
         super.addPopup(param1);
         this.stopLevelRefresh();
      }
  clickTournament(): void {
         SocketManager.socket.joinTournament();
      }
  clickQuickJoin(): void {
         if(this.levelRefresh)
         {
            this.removeMatchListings();
            this.removeLOTD();
            this.addPopup(new QuickJoinPopup());
         }
      }
  clickQuickHost(): void {
         if(Boolean(this.levelRefresh) && MultiPlayerPopup.quickLevel != null)
         {
            this.removeMatchListings();
            this.removeLOTD();
            SocketManager.socket.createMatch(MultiPlayerPopup.quickLevel.levelID,MultiPlayerPopup.quickLevel.version,0,99,8,false);
            this.addPopup(new CreatingMatchPopup());
         }
      }
  refreshMatches(): void {
         if(this.lotd == null || Boolean(this.lotd.removed))
         {
            SocketManager.socket.getLOTD();
         }
         SocketManager.socket.getTournament();
         var _loc_1= this.analyzeMatchArray();
         var _loc_2= _loc_1.length;
         if(_loc_2 > 0)
         {
            SocketManager.socket.requestMatches(_loc_2,this.lobbyId);
         }
      }
  stopLevelRefresh(): void {
         clearInterval(this.refreshInterval);
         this.levelRefresh = false;
      }
  receiveLOTDHandler(event: BlossomEvent): void {
         this.removeLOTD();
         var _loc_2= event.raw.lotd;
         this.lotd = new MatchListing(_loc_2,$b(this, 'clickMatchCallback'),false);
         this.lotd.x = this.startX;
         this.lotd.y = this.startY;
         this.lotd.initLevelOfTheDay();
         this.m.holder.addChild(this.lotd);
      }
  recieveTournamentStatusHandler(event: BlossomEvent): void {
         var status= event.raw.status;
         if(status == 0)
         {
            this.cTint.setTint(11382189,0.5);
            this.m.tournamentButton.mouseEnabled = false;
         }
         else if(status == 1)
         {
            this.cTint.setTint(65280,0.5);
            this.m.tournamentButton.mouseEnabled = true;
         }
         else if(status == 2)
         {
            this.cTint.setTint(16766720,0.5);
            this.m.tournamentButton.mouseEnabled = true;
         }
         this.m.tournamentButton.bgHolder.transform.colorTransform = this.cTint;
      }
  recieveForceMatchHandler(event: BlossomEvent): void {
         this.addPopup(new InMatchPopup(event.raw));
      }
  enterFrameHandler(event: Event): void {
         var _loc_2= -this.scrollPos * (this.spacingY * 4);
         var _loc_3= this.m.holder.y - _loc_2;
         if(Math.abs(_loc_3) < 1)
         {
            this.m.holder.y = _loc_2;
         }
         else
         {
            this.m.holder.y -= _loc_3 * 0.25;
         }
         if(this.canScrollUp())
         {
            this.m.upButton.alpha = 1;
         }
         else
         {
            this.m.upButton.alpha = 0.33;
         }
         if(this.canScrollDown())
         {
            this.m.downButton.alpha = 1;
         }
         else
         {
            this.m.downButton.alpha = 0.33;
         }
      }
  receiveMatchesHandler(event: BlossomEvent): void {
         if(event.raw.lobbyId != this.lobbyId)
         {
            return;
         }
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_6= null;
         var _loc_2= event.raw.matches;
         var _loc_3= this.analyzeMatchArray();
         for (_loc_4 of $each(_loc_2))
         {
            if(_loc_3.length > 0)
            {
               _loc_5 = _loc_3.shift();
               _loc_6 = new MatchListing(_loc_4,$b(this, 'clickMatchCallback'),false);
               _loc_6.x = this.startX;
               _loc_6.y = (_loc_5 + 1) * this.spacingY + this.startY;
               _loc_6.addEventListener(Removable.REMOVE,$b(this, 'removeMatchHandler'),false,0,true);
               this.matchArray[_loc_5] = _loc_6;
               this.m.holder.addChild(_loc_6);
            }
         }
         this.analyzeMatchArray();
      }
  clickPractice(): void {
         if(this.levelRefresh)
         {
            this.addPopup(new PracticePopup());
         }
      }
  calcMaxMatches(): void {
         this.maxMatches = int((this.scrollPos + 1) * 4 - 1);
      }
  removeMatchHandler(event: Event): void {
         var _loc_2= (event.target);
         _loc_2.removeEventListener(Removable.REMOVE,$b(this, 'removeMatchHandler'));
         var _loc_3= this.matchArray.indexOf(_loc_2);
         this.matchArray[_loc_3] = null;
      }
  removeLOTD(): void {
         if(this.lotd != null)
         {
            if(this.lotd.removed == false)
            {
               this.lotd.remove();
            }
            this.lotd = null;
         }
      }
  clickStartMatch(): void {
         if(this.levelRefresh)
         {
            this.addPopup(new StartMatchPopup());
         }
      }
  removeMatchListings(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.matchArray))
         {
            if(_loc_1 != null)
            {
               _loc_1.remove();
            }
         }
         this.matchArray = new Array();
      }
  canScrollUp(): boolean {
         if(this.scrollPos > 0)
         {
            return true;
         }
         return false;
      }
  startLevelRefresh(): void {
         this.stopLevelRefresh();
         if(this.matchArray != null)
         {
            this.refreshInterval = uint(setInterval($b(this, 'refreshMatches'),3000));
            this.refreshMatches();
         }
         this.levelRefresh = true;
      }
  canScrollDown(): boolean {
         if(this.scrollPos * 4 <= this.highestFullSlot - 2)
         {
            return true;
         }
         return false;
      }
  constructor() {
         super();
         this.matchArray = new Array();
         this.cTint = new Color();
         this.cTint.setTint(11382189,0.5);
         this.w = 435;
         this.h = 325;
         this.m = new MatchListGraphic();
         this.m.practiceButton.init("Practice",$b(this, 'clickPractice'));
         this.m.tournamentButton.init("Tournament",$b(this, 'clickTournament'));
         this.m.tournamentButton.mouseEnabled = false;
         this.m.tournamentButton.bgHolder.transform.colorTransform = this.cTint;
         this.m.quickJoinButton.init("Quick Join",$b(this, 'clickQuickJoin'));
         this.m.quickHostButton.init("Quick Host",$b(this, 'clickQuickHost'));
         this.m.startMatchButton.init("Start Game",$b(this, 'clickStartMatch'));
         this.m.upButton.init("",$b(this, 'clickUp'));
         this.m.downButton.init("",$b(this, 'clickDown'));
         this.m.upButton.rightArrow.visible = false;
         this.m.downButton.leftArrow.visible = false;
         this.m.holder.mask = this.m.listMask;
         this.addChild(this.m);
         SocketManager.socket.addEventListener("receiveMatches",$b(this, 'receiveMatchesHandler'),false,0,true);
         SocketManager.socket.addEventListener("receiveLOTD",$b(this, 'receiveLOTDHandler'),false,0,true);
         SocketManager.socket.addEventListener("tournament_status",$b(this, 'recieveTournamentStatusHandler'),false,0,true);
         SocketManager.socket.addEventListener("force_match",$b(this, 'recieveForceMatchHandler'),false,0,true);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.startLevelRefresh();
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.MatchList', MatchList);
