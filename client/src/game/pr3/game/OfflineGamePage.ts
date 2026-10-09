// Ported from com/jiggmin/pr3/game/OfflineGamePage.as
import { Event } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { GamePage } from './GamePage.ts';
import { Data, EffectMapLayer, LobbyPage, LocalPlayer, MapManager, OfflineGameGraphic, PlatformRacing3, RecordedPlayer, RunRecorder, Settings, SinglePlayerFinishPopup, SocketManager, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class OfflineGamePage extends GamePage {
  declare season: string;
  declare previousRunStr: string;
  declare ghost: any;
  levelID: number = 0;
  levelVersion: number = 0;
  ready: boolean = false;
  declare runRecorder: RunRecorder;
  declare m: any;
  declare recordedPlayer: RecordedPlayer;
  requestedRun: boolean = false;
  spectate: boolean = true;
  startTime: number = 0;
  initGame(): void {
         if(!this.spectate)
         {
            super.initGame();
         }
      }
  setSaveObj(param1: any): void {
         super.setSaveObj(param1);
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  clickRetry(): void {
         if(!this.ready)
         {
            return;
         }
         this.ready = false;
         this.startTime = uint(0);
         this.removePlayers();
         this.resetBlockSettings();
         EffectMapLayer.clear();
         this.blockIntervalManager.stop();
         this.blockIntervalManager.clear();
         if(this.recordedPlayer != null)
         {
            this.recordedPlayer.remove();
            this.recordedPlayer = null;
         }
         if(this.runRecorder != null)
         {
            this.runRecorder.remove();
            this.runRecorder = null;
         }
         this.timer.pause();
         this.clearLua();
         this.initLua();
         MapManager.map.blockMap.addEventListener("finishDrawing",$b(this, 'retryFinishDrawingHandler'),false,0,true);
         MapManager.map.blockMap.reset();
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  countdownFinished(): void {
         super.countdownFinished();
         this.startGame();
         this.startTime = uint(Data.getSeconds());
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  retryFinishDrawingHandler(event: Event): void {
         this.finishedDrawing();
      }
  remove(): void {
         MapManager.map.blockMap.removeEventListener("finishDrawing",$b(this, 'retryFinishDrawingHandler'));
         this.m = null;
         this.ghost = null;
         this.previousRunStr = null;
         if(this.recordedPlayer != null)
         {
            this.recordedPlayer.remove();
            this.recordedPlayer = null;
         }
         if(this.runRecorder != null)
         {
            this.runRecorder.remove();
            this.runRecorder = null;
         }
         super.remove();
      }
  finishedDrawingInternal(): void {
         var _loc_2= undefined;
         super.finishedDrawingInternal();
         this.ready = true;
         this.removePlayers();
         if(!this.spectate)
         {
            this.createPlayer(SocketManager.socket.me);
            this.positionPlayers();
            this.localPlayer.centerCamera();
         }
         else
         {
            _loc_2 = this.getNextStartPos();
            while(_loc_2 == null)
            {
               _loc_2 = this.getNextStartPos();
            }
            _loc_2.x += 15;
            _loc_2.y += 15;
            this.centerCamera(_loc_2);
         }
         MapManager.map.blockMap.drawBlocks();
         if(!this.requestedRun)
         {
            this.startCountdown();
         }
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  centerCamera(_loc_2: any): void {
         var _loc_3= -this.x + Settings.gameWidth / 2 + _loc_2.x;
         var _loc_4= -this.y + Settings.gameHeight / 2 + _loc_2.y;
         var _loc_5= _loc_3 - MapManager.map.posX;
         var _loc_6= _loc_4 - MapManager.map.posY;
         if(Math.abs(_loc_5) > 1)
         {
            MapManager.map.posX += _loc_5;
         }
         if(Math.abs(_loc_6) > 1)
         {
            MapManager.map.posY += _loc_6;
         }
      }
  clickExit(): void {
         this.setPage(new LobbyPage());
      }
  init(): void {
         var _loc_1= NaN;
         super.init();
         this.addNavigation();
         this.navigation.x = 37;
         this.navigation.y = -35;
         this.loadVersion(this.levelID,this.levelVersion);
         _loc_1 = 0;
         if(this.ghost != null)
         {
            _loc_1 = this.ghost.userID;
         }
         else if(!SocketManager.socket.me.vars.guest)
         {
            _loc_1 = SocketManager.socket.me.userID;
         }
         if(_loc_1 != 0)
         {
            this.getGhostRun(_loc_1);
         }
         this.m = new OfflineGameGraphic();
         this.m.exitButton.init("Exit",$b(this, 'clickExit'));
         this.m.retryButton.init("Retry",$b(this, 'clickRetry'));
         this.m.retryButton.x = this.m.exitButton.x - this.m.retryButton.width - 5;
         this.addChild(this.m);
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  getGhostRunCallback(param1: any, param2: string): void {
         var _loc_3= null;
         this.requestedRun = false;
         if(param2 == "")
         {
            if(param1.NumRows > 0)
            {
               _loc_3 = param1.Row;
               this.previousRunStr = _loc_3.recorded_run;
            }
         }
         if(this.ready)
         {
            this.startCountdown();
         }
      }
  localLoseHat(param1: LocalPlayer, param2: number = 7): any {
         var _loc_3= super.localLoseHat(param1,param2);
         this.createLooseHat(-1,_loc_3.hatNum,_loc_3.hatColor,_loc_3.x,_loc_3.y,_loc_3.velX,_loc_3.velY);
         this.registerHat();
         return _loc_3;
      }
  startCountdown(): void {
         this.m.drawing1.visible = false;
         this.m.drawing2.visible = false;
         this.removeNavigation();
         super.startCountdown();
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  getGhostRun(param1: number): void {
    param1 = int(param1);
         this.requestedRun = true;
         var _loc_2= ({} as any);
         _loc_2.p_level_id = this.levelID;
         _loc_2.p_user_id = param1;
         var _loc_3= false;
         Sparkworkz.DataAccess("GetCampaignRun3",_loc_2,$b(this, 'getGhostRunCallback'),_loc_3);
      }
  startGame(): void {
         super.startGame();
         this.timer.mode = "stopwatch";
         this.timer.setTime(0);
         this.timer.resume();
         if(this.sfchmChance > Math.random() * 100)
         {
            this.startSFCHM();
            if(this.localPlayer != null && this.localPlayer.hatArray != null)
            {
               this.localPlayer.hatArray[1] = 4;
            }
         }
         if(this.snowChance > Math.random() * 100)
         {
            this.startSnow();
         }
         if(this.alienChance > Math.random() * 100)
         {
            this.startAliens();
         }
         if(this.windChance > Math.random() * 100)
         {
            this.startWind();
         }
         this.registerHat();
         if(!this.spectate)
         {
            this.runRecorder = new RunRecorder(this.localPlayer);
         }
         if(this.previousRunStr != null && this.previousRunStr != "")
         {
            this.recordedPlayer = new RecordedPlayer();
            this.recordedPlayer.followPlayer = this.spectate;
            this.recordedPlayer.setRecordedRunStr(this.previousRunStr);
            if(this.ghost != null && this.localPlayer != null && this.localPlayer.hatArray != null && this.localPlayer.hatColorArray != null)
            {
               this.recordedPlayer.setAppearance(this.recordedPlayer.hatArray[1],this.ghost.head,this.ghost.body,this.ghost.feet,this.ghost.hatColor,this.ghost.headColor,this.ghost.bodyColor,this.ghost.feetColor);
            }
            this.playerHolder.addChildAt(this.recordedPlayer,0);
         }
         if(this.localPlayer != null)
         {
            this.localPlayer.allowAlerts = true;
         }
         PlatformRacing3.instance.discord.updateCampaign(this);
      }
  grabHat(param1: any): void {
         if(this.localPlayer != null && this.localPlayer.hatArray != null && this.localPlayer.hatColorArray != null)
         {
            this.localPlayer.hatArray[1] = param1.num;
            this.localPlayer.hatColorArray[1] = param1.color;
         }
         this.registerHat();
      }
  registerHat(): void {
         if(this.localPlayer != null && this.localPlayer.hatArray != null && this.localPlayer.hatColorArray != null && this.localPlayer.hatArray[1] != null && this.localPlayer.hatColorArray[1] != null)
         {
            this.localPlayer.setHats(new Array({
               "num":this.localPlayer.hatArray[1],
               "id":-1,
               "color":this.localPlayer.hatColorArray[1]
            }));
         }
      }
  iFinished(): void {
         var health: number = int(0);
         var _loc_1= NaN;
         var _loc_2= null;
         if(this.localPlayer != null)
         {
            _loc_1 = this.timer.getElapsedMS();
            health = int(int(this.localPlayer.getVars().life));
            super.iFinished();
            if(this.runRecorder != null)
            {
               this.runRecorder.stopRecording();
               _loc_2 = this.runRecorder.getRunStr();
            }
            if(this.levelType == "deathmatch" || this.levelType == "damageDash")
            {
               if(health <= 0)
               {
                  _loc_1 *= -1;
               }
            }
            this.addPopup(new SinglePlayerFinishPopup(this.season,this.levelID,this.version,_loc_1,_loc_2,$b(this, 'clickRetry')));
            this.addNavigation();
            this.endGame();
         }
      }
  constructor(season: string, levelId: number, levelVersion: number = 0, param2: any = null, spect: boolean = false) {
    levelId = uint(levelId); levelVersion = uint(levelVersion);
         super();
         this.season = season;
         this.spectate = spect;
         this.levelID = uint(levelId);
         this.levelVersion = uint(levelVersion);
         this.ghost = param2;
         this.flattenArt = true;
         this.minimapMinX = int(100);
         this.minimapMaxX = int(530);
      }
}
$reg('com.jiggmin.pr3.game.OfflineGamePage', OfflineGamePage);
