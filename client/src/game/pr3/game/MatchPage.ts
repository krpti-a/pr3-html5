// Ported from com/jiggmin/pr3/game/MatchPage.as
import { Dictionary, clearInterval, setInterval } from '../../../flash/index.ts';
import { int, uint, $keys, $b } from '../../../flash/as3.ts';
import { GamePage } from './GamePage.ts';
import { ActivePlayer, AlienEffect, ArrowEffect, Block, BlockIntervalManager, BlossomEvent, BlossomRoom, BlossomUser, Data, DrawingInfo, FinishPopup, GameChat, GameEventLuaWrapper, LaserEffect, LocalPlayer, MapManager, MatchGraphic, PM_PRNG, PlatformRacing3, RemotePlayer, RocketEffect, SlashEffect, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MatchPage extends GamePage {
  declare static instance: MatchPage;
  declare hatArray: any[];
  dash: number = NaN;
  declare roomName: string;
  authorUserID: number = NaN;
  lastCoins: number = NaN;
  lastDash: number = NaN;
  declare events: any;
  levelID: number = 0;
  levelVersion: number = 0;
  declare userDict: any;
  begunMatch: boolean = false;
  declare authorName: string;
  authorModerator: boolean = false;
  declare chat: GameChat;
  declare room: BlossomRoom;
  declare finishData: any;
  declare drawingInfo: DrawingInfo;
  declare m: any;
  coinInterval: number = 0;
  dashInterval: number = 0;
  antiCheat: boolean = false;
  declare entitys: any;
  startTime: number = 0;
  _serverSeed: number = 0;
  get serverSeed(): number {
         return this._serverSeed;
      }
  setSaveObj(param1: any): void {
         super.setSaveObj(param1);
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  removePlayer(param1: ActivePlayer): void {
         if(param1 != null && !param1.removed)
         {
            param1.beginFadeOut();
         }
         var playerIndex= this.playerArray.indexOf(param1);
         if(playerIndex != -1)
         {
            this.playerArray.removeAt(playerIndex);
            if(this.luaGame != null)
            {
               this.luaGame.playerRemoved.call(param1.lua);
            }
         }
         if(param1 == this.localPlayer)
         {
            this.localPlayer = null;
            this.addNavigation();
         }
      }
  iFinished(): void {
    var timeToPass; // undeclared in decompiled source
         timeToPass = this.getGameTimer().getElapsedMS();
         if(this.levelType == "deathmatch" || this.levelType == "damageDash")
         {
            if(this.localPlayer != null)
            {
               if(this.localPlayer.getVars().life <= 0)
               {
                  timeToPass *= -1;
               }
            }
         }
         super.iFinished();
         SocketManager.socket.finishMatch(timeToPass);
      }
  remove(): void {
         this.room.removeEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'));
         this.room.removeEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'));
         this.room.removeEventListener("explodeBlock",$b(this, 'explodeBlockHandler'));
         this.room.removeEventListener("shatterBlock",$b(this, 'shatterBlockHandler'));
         this.room.removeEventListener("useItem",$b(this, 'remoteUseItemHandler'));
         this.room.removeEventListener("morphBlock",$b(this, 'morphBlockHandler'));
         this.room.removeEventListener("moveBlock",$b(this, 'moveBlockHandler'));
         this.room.removeEventListener("gameEvent",$b(this, 'gameEventHandler'));
         this.room.removeEventListener("chatBubble",$b(this, 'chatBubbleHandler'));
         SocketManager.socket.removeEventListener("beginMatch",$b(this, 'beginMatchHandler'));
         SocketManager.socket.removeEventListener("endGame",$b(this, 'endGameHandler'));
         SocketManager.socket.removeEventListener("youFinished",$b(this, 'youFinishedHandler'));
         SocketManager.socket.removeEventListener("setPlayerHats",$b(this, 'setPlayerHatsHandler'));
         SocketManager.socket.removeEventListener("addHat",$b(this, 'addHatHandler'));
         SocketManager.socket.removeEventListener("removeHat",$b(this, 'removeHatHandler'));
         SocketManager.socket.removeEventListener("update",$b(this, 'posUpdateHandler'));
         SocketManager.socket.removeEventListener("finishDrawing",$b(this, 'remoteFinishDrawingHandler'));
         SocketManager.socket.removeEventListener("playerFinished",$b(this, 'playerFinishedHandler'));
         SocketManager.socket.removeEventListener("coins",$b(this, 'coinsHandler'));
         SocketManager.socket.removeEventListener("dash",$b(this, 'dashHandler'));
         SocketManager.socket.removeEventListener("receiveEvents",$b(this, 'receiveEventsHandler'));
         SocketManager.socket.removeEventListener("receiveForfiet",$b(this, 'receiveForfietHandler'));
         SocketManager.socket.removeEventListener("prize",$b(this, 'prizeHandler'));
         SocketManager.socket.removeEventListener("spawnAliens",$b(this, 'spawnAliensHandler'));
         SocketManager.socket.removeEventListener("enableAntiCheat",$b(this, 'enableAntiCheatHandler'));
         SocketManager.socket.removeEventListener("spawnEntity",$b(this, 'spawnEntityHandler'));
         SocketManager.socket.removeEventListener("removeEntity",$b(this, 'removeEntityHandler'));
         clearInterval(this.coinInterval);
         clearInterval(this.dashInterval);
         this.room.remove();
         this.chat.remove();
         this.drawingInfo.remove();
         this.room = null;
         this.drawingInfo = null;
         this.chat = null;
         this.userDict = null;
         this.m = null;
         super.remove();
      }
  beginMatchHandler(event: BlossomEvent): void {
         if(this.localPlayer != null && this.begunMatch == false)
         {
            this.startCountdown();
            this.positionPlayers();
            this.localPlayer.centerCamera();
            MapManager.map.blockMap.drawBlocks();
            this.removeNavigation();
            this.begunMatch = true;
         }
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  setPlayerHatsHandler(event: BlossomEvent): void {
         var _loc_4= 0;
         var _loc_5= 0;
         var _loc_2= this.room.socketIDToUser(event.raw.socketID);
         var _loc_3= this.userDict[_loc_2];
         if(_loc_3 == null || Boolean(_loc_3.removed))
         {
            return;
         }
         _loc_3.setHats(event.raw.hatArray);
         this.hatArray = event.raw.hatArray;
         if(this.levelType == "hatAttack" && _loc_2.socketID == SocketManager.socket.socketID)
         {
            if(event.raw.hatArray.length == this.drawingInfo.userArray.length)
            {
               _loc_4 = event.raw.hatArray.length;
               _loc_5 = 0;
               while(_loc_5 < _loc_4)
               {
                  this.localLoseHat(this.localPlayer,15);
                  _loc_5++;
               }
               this.iFinished();
            }
         }
         else if(this.levelType == "kingOfTheHat" && _loc_2.socketID == SocketManager.socket.socketID)
         {
            if(this.hasGameStarted)
            {
               this.doKOTHLogic();
            }
         }
      }
  init(): void {
         MatchPage.instance = this;
         super.init();
         this.room = new BlossomRoom(SocketManager.socket,this.roomName,"","game");
         this.room.addEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'),false,0,true);
         this.room.addEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'),false,0,true);
         this.room.addEventListener("explodeBlock",$b(this, 'explodeBlockHandler'),false,0,true);
         this.room.addEventListener("shatterBlock",$b(this, 'shatterBlockHandler'),false,0,true);
         this.room.addEventListener("useItem",$b(this, 'remoteUseItemHandler'),false,0,true);
         this.room.addEventListener("morphBlock",$b(this, 'morphBlockHandler'),false,0,true);
         this.room.addEventListener("moveBlock",$b(this, 'moveBlockHandler'),false,0,true);
         this.room.addEventListener("gameEvent",$b(this, 'gameEventHandler'),false,0,true);
         this.room.addEventListener("chatBubble",$b(this, 'chatBubbleHandler'),false,0,true);
         SocketManager.socket.addEventListener("endGame",$b(this, 'endGameHandler'),false,0,true);
         SocketManager.socket.addEventListener("youFinished",$b(this, 'youFinishedHandler'),false,0,true);
         SocketManager.socket.addEventListener("beginMatch",$b(this, 'beginMatchHandler'),false,0,true);
         SocketManager.socket.addEventListener("setPlayerHats",$b(this, 'setPlayerHatsHandler'),false,0,true);
         SocketManager.socket.addEventListener("addHat",$b(this, 'addHatHandler'),false,0,true);
         SocketManager.socket.addEventListener("removeHat",$b(this, 'removeHatHandler'),false,0,true);
         SocketManager.socket.addEventListener("update",$b(this, 'posUpdateHandler'),false,0,true);
         SocketManager.socket.addEventListener("finishDrawing",$b(this, 'remoteFinishDrawingHandler'),false,0,true);
         SocketManager.socket.addEventListener("playerFinished",$b(this, 'playerFinishedHandler'),false,0,true);
         SocketManager.socket.addEventListener("coins",$b(this, 'coinsHandler'),false,0,true);
         SocketManager.socket.addEventListener("dash",$b(this, 'dashHandler'),false,0,true);
         SocketManager.socket.addEventListener("receiveEvents",$b(this, 'receiveEventsHandler'),false,0,true);
         SocketManager.socket.addEventListener("receiveForfiet",$b(this, 'receiveForfietHandler'),false,0,true);
         SocketManager.socket.addEventListener("prize",$b(this, 'prizeHandler'),false,0,true);
         SocketManager.socket.addEventListener("spawnAliens",$b(this, 'spawnAliensHandler'),false,0,true);
         SocketManager.socket.addEventListener("enableAntiCheat",$b(this, 'enableAntiCheatHandler'),false,0,true);
         SocketManager.socket.addEventListener("spawnEntity",$b(this, 'spawnEntityHandler'),false,0,true);
         SocketManager.socket.addEventListener("removeEntity",$b(this, 'removeEntityHandler'),false,0,true);
         this.m.exitButton.init("Exit",$b(this, 'clickExit'));
         this.addChild(this.m);
         this.drawingInfo = new DrawingInfo(this.room);
         this.drawingInfo.x = 8;
         this.drawingInfo.y = 6;
         this.m.addChild(this.drawingInfo);
         this.chat = new GameChat(this.roomName);
         this.chat.x = 8;
         this.chat.y = 247;
         this.parent.addChild(this.chat);
         this.addNavigation();
         this.loadVersion(this.levelID,this.levelVersion);
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  receiveForfietHandler(event: BlossomEvent): void {
         var _loc_2= this.room.socketIDToUser(event.raw.socketID);
         var _loc_3= this.userDict[_loc_2];
         this.removePlayer(_loc_3);
         if(!this.begunMatch)
         {
            this.drawingInfo.removeUser(_loc_2);
         }
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  addNavigation(): void {
         super.addNavigation();
         this.navigation.x = 37;
         this.navigation.y = -35;
      }
  remoteUseItemHandler(event: BlossomEvent): void {
         var _loc_2= event.fromUser;
         var _loc_3= this.userDict[_loc_2];
         if(_loc_3 != null && !_loc_3.removed)
         {
            (_loc_3).setPosObj(event.data);
            (_loc_3).remoteUseItem();
         }
      }
  morphBlockHandler(event: BlossomEvent): void {
         this.blockIntervalManager.doFullStep(BlockIntervalManager.TYPE_CHANGE,event.data.freq);
      }
  moveBlockHandler(event: BlossomEvent): void {
         this.blockIntervalManager.doFullStep(BlockIntervalManager.TYPE_MOVE,event.data.freq);
      }
  gameEventHandler(event: BlossomEvent): void {
         this.luaGame.gameEvent.call(new GameEventLuaWrapper(event.data,this.userDict[event.fromUser].lua));
      }
  chatBubbleHandler(event: BlossomEvent): void {
         var user= this.userDict[event.fromUser];
         if(user instanceof ActivePlayer)
         {
            if(event.data.id == 0)
            {
               (user).typing = false;
            }
            else if(event.data.id == 1)
            {
               (user).typing = true;
            }
         }
      }
  userJoinRoomHandler(event: BlossomEvent): void {
         var _loc_2= event.fromUser;
         var _loc_3= this.createPlayer(_loc_2);
         this.userDict[_loc_2] = _loc_3;
         if(_loc_3 instanceof LocalPlayer)
         {
            (_loc_3).setRoom(this.room);
         }
         else if(_loc_3 instanceof RemotePlayer)
         {
            (_loc_3).setName(_loc_2.userName);
         }
         this.drawingInfo.addUser(_loc_2);
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  endGameHandler(event: BlossomEvent): void {
         this.endGame();
         this.timer.pause();
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  userLeaveRoomHandler(event: BlossomEvent): void {
         var _loc_2= event.fromUser;
         this.removeUser(_loc_2);
      }
  remoteFinishDrawingHandler(event: BlossomEvent): void {
         var user= this.room.socketIDToUser(event.raw.socketID);
         if(user == null)
         {
            return;
         }
         this.drawingInfo.playerFinishedDrawing(user);
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  grabHat(param1: any): void {
         SocketManager.socket.getHat(param1.id);
      }
  addHatHandler(event: BlossomEvent): void {
         var _loc_2= event.raw.id;
         var _loc_3= event.raw.num;
         var _loc_4= event.raw.color;
         this.createLooseHat(_loc_2,_loc_3,_loc_4,event.raw.x,event.raw.y,event.raw.velX,event.raw.velY);
      }
  localShatterBlock(param1: Block, reason: any = null): void {
         var _loc_2= undefined;
         super.localShatterBlock(param1,reason);
         if(param1.removed)
         {
            _loc_2 = null;
            if(this.room != null)
            {
               _loc_2 = ({} as any);
               _loc_2.tileX = param1.tileX;
               _loc_2.tileY = param1.tileY;
               this.room.sendToRoom(_loc_2,false,"shatterBlock");
            }
         }
      }
  countdownFinished(): void {
         super.countdownFinished();
         this.startGame();
         this.startTime = uint(Data.getSeconds());
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  incDash(): void {
         var _loc_1= Math.round(Data.revealNumber(this.dash));
         _loc_1 += 1;
         this.dash = Data.hideNumber(_loc_1);
      }
  localExplodeBlock(param1: Block, reason: any = null): void {
         var _loc_2= undefined;
         super.localExplodeBlock(param1,reason);
         if(param1.removed)
         {
            _loc_2 = null;
            if(this.room != null)
            {
               _loc_2 = ({} as any);
               _loc_2.tileX = param1.tileX;
               _loc_2.tileY = param1.tileY;
               this.room.sendToRoom(_loc_2,false,"explodeBlock");
            }
         }
      }
  finishedDrawingInternal(): void {
         super.finishedDrawingInternal();
         SocketManager.socket.finishDrawing();
      }
  posUpdateHandler(event: BlossomEvent): void {
         var _loc_2= this.room.socketIDToUser(event.raw.socketID);
         var _loc_3= this.userDict[_loc_2];
         if(_loc_3 != null)
         {
            if(_loc_3 instanceof RemotePlayer)
            {
               (_loc_3).receiveUpdate(event.raw);
            }
            else if(_loc_3 instanceof LocalPlayer)
            {
               if(event.raw.p[0] == null)
               {
                  event.raw.p[0] = _loc_3.realX;
               }
               if(event.raw.p[1] == null)
               {
                  event.raw.p[1] = _loc_3.realY;
               }
               if(event.raw.p[2] == null)
               {
                  event.raw.p[2] = _loc_3.velX;
               }
               if(event.raw.p[3] == null)
               {
                  event.raw.p[3] = _loc_3.velY;
               }
               (_loc_3).setPosObj(event.raw);
               if(event.raw.life != null)
               {
                  (_loc_3).setVariable("life",event.raw.life);
               }
               if(event.raw.item != null)
               {
                  (_loc_3).setVariable("item",event.raw.item);
               }
               if(event.raw.hurt != null)
               {
                  (_loc_3).setVariable("hurt",event.raw.hurt);
               }
            }
         }
      }
  receiveEventsHandler(event: BlossomEvent): void {
         var _loc_2= event.raw.events;
         this.events = _loc_2;
      }
  spawnAliensHandler(event: BlossomEvent): void {
         var random: PM_PRNG= new PM_PRNG(event.raw.seed);
         for(var i: number = int(0); i < event.raw.count; i++)
         {
            new AlienEffect(random.nextInt());
         }
      }
  enableAntiCheatHandler(event: BlossomEvent): void {
         this.antiCheat = true;
      }
  spawnEntityHandler(event: BlossomEvent): void {
         var entity: any= null;
         if(event.raw.entityType == "laser")
         {
            entity = new LaserEffect(event.raw.fromPlayer == SocketManager.socket.socketID ? GamePage.instance.localPlayer : (GamePage.instance).getUser(event.raw.fromPlayer));
         }
         else if(event.raw.entityType == "sword_slash")
         {
            entity = new SlashEffect(event.raw.fromPlayer == SocketManager.socket.socketID ? GamePage.instance.localPlayer : (GamePage.instance).getUser(event.raw.fromPlayer));
         }
         else if(event.raw.entityType == "rocket")
         {
            entity = new RocketEffect(event.raw.fromPlayer == SocketManager.socket.socketID ? GamePage.instance.localPlayer : (GamePage.instance).getUser(event.raw.fromPlayer));
         }
         else if(event.raw.entityType == "bow_arrow")
         {
            entity = new ArrowEffect(event.raw.fromPlayer == SocketManager.socket.socketID ? GamePage.instance.localPlayer : (GamePage.instance).getUser(event.raw.fromPlayer),0);
         }
         if(entity != null)
         {
            entity.fromPacket(event.raw);
            this.entitys[event.raw.id] = entity;
         }
      }
  removeEntityHandler(event: BlossomEvent): void {
         var entity: any= this.entitys[event.raw.id];
         if(entity != null && !entity.removed)
         {
            entity.remove();
            this.entitys[event.raw.id] = null;
         }
      }
  localUseItem(): void {
         var _loc_1= undefined;
         super.localUseItem();
         if(this.localPlayer != null)
         {
            _loc_1 = this.localPlayer.getPosObj();
            this.room.sendToRoom(_loc_1,false,"useItem");
         }
      }
  removeHatHandler(event: BlossomEvent): void {
         var _loc_2= event.raw.id;
         var _loc_3= this.looseHatArray[_loc_2];
         if(_loc_3 != null)
         {
            if(!_loc_3.removed)
            {
               _loc_3.remove();
            }
            this.looseHatArray[_loc_2] = null;
         }
      }
  clickExit(): void {
         if(this.finishData == null)
         {
            SocketManager.socket.forfiet();
         }
         this.endGame();
      }
  playerFinishedHandler(event: BlossomEvent): void {
         var _loc_2= this.room.socketIDToUser(event.raw.socketID);
         this.drawingInfo.playerFinished(event.raw.finishArray);
         var _loc_3= this.userDict[_loc_2];
         this.removePlayer(_loc_3);
      }
  youFinishedHandler(event: BlossomEvent): void {
         this.finishData = event.raw;
         PlatformRacing3.instance.discord.updateMatch(this);
      }
  prizeHandler(event: BlossomEvent): void {
         var _loc_2= event.raw.category;
         var _loc_3= event.raw.id;
         var _loc_4= event.raw.status;
         this.addPrizePopup(_loc_2,_loc_3,_loc_4);
      }
  sendCoinUpdate(): void {
         var _loc_1= NaN;
         if(this.coins != this.lastCoins)
         {
            _loc_1 = Math.round(Data.revealNumber(this.coins));
            SocketManager.socket.updateCoins(_loc_1);
            this.lastCoins = this.coins;
         }
      }
  sendDashUpdate(): void {
         var _loc_1= NaN;
         if(this.dash != this.lastDash)
         {
            _loc_1 = Math.round(Data.revealNumber(this.dash));
            SocketManager.socket.updateDash(_loc_1);
            this.lastDash = this.dash;
         }
      }
  coinsHandler(event: BlossomEvent): void {
         this.drawingInfo.playerFinished(event.raw.array);
      }
  dashHandler(event: BlossomEvent): void {
         this.drawingInfo.playerFinished(event.raw.array);
      }
  localLoseHat(param1: LocalPlayer, param2: number = 7): any {
         var _loc_3= super.localLoseHat(param1,param2);
         SocketManager.socket.loseHat(_loc_3.x,_loc_3.y,_loc_3.velX,_loc_3.velY);
         return _loc_3;
      }
  removeUser(param1: BlossomUser): void {
         var _loc_2= this.userDict[param1];
         this.removePlayer(_loc_2);
         delete this.userDict[param1];
      }
  startGame(): void {
         var id= undefined;
         super.startGame();
         if(this.levelType == "coinFiend")
         {
            this.coinInterval = uint(setInterval($b(this, 'sendCoinUpdate'),1000));
         }
         if(this.levelType == "damageDash")
         {
            this.dashInterval = uint(setInterval($b(this, 'sendDashUpdate'),1000));
         }
         for (id of $keys(this.events))
         {
            if(this.events[id] == "snow")
            {
               this.startSnow();
            }
            if(this.events[id] == "wind")
            {
               this.startWind();
            }
            if(this.events[id] == "sfchm")
            {
               this.startSFCHM();
            }
            if(this.events[id] == "aliens")
            {
               this.startAliens();
            }
         }
         this.removePrizePopup();
      }
  shatterBlockHandler(event: BlossomEvent): void {
         var _loc_2= MapManager.map.blockMap.getBlockAtTile(event.data.tileX,event.data.tileY);
         if(_loc_2 != null)
         {
            this.shatterBlock(_loc_2);
         }
      }
  endGame(): void {
         if(this.localPlayer != null)
         {
            this.removePlayer(this.localPlayer);
         }
         this.playVictorySound();
         this.addPopup(new FinishPopup(this.levelID,this.finishData,this.title,this.authorName,this.authorUserID,this.authorModerator));
         SocketManager.socket.removeEventListener("endGame",$b(this, 'endGameHandler'));
         this.addNavigation();
         super.endGame();
      }
  explodeBlockHandler(event: BlossomEvent): void {
         var _loc_2= MapManager.map.blockMap.getBlockAtTile(event.data.tileX,event.data.tileY);
         if(_loc_2 != null)
         {
            this.explodeBlock(_loc_2);
         }
      }
  getUser(socketId: number): ActivePlayer {
    socketId = uint(socketId);
         return this.userDict[this.room.socketIDToUser(socketId)];
      }
  sendGameEvent(data: any, sendToSelf: any = false): void {
         this.room.sendToRoom(data,sendToSelf,"gameEvent");
      }
  levelUnavailable(): void {
         super.levelUnavailable();
         if(this.finishData == null)
         {
            SocketManager.socket.forfiet();
         }
      }
  constructor(levelId: number, levelVersion: number, roomName: string, authorName: string, authorModerator: boolean, authorUserID: number, randomSeed: number) {
    levelId = uint(levelId); levelVersion = uint(levelVersion); randomSeed = int(randomSeed);
         super();
         this.userDict = new Dictionary(true);
         this.m = new MatchGraphic();
         this.levelID = uint(levelId);
         this.levelVersion = uint(levelVersion);
         this.roomName = roomName;
         this.authorName = authorName;
         this.authorModerator = authorModerator;
         this.authorUserID = authorUserID;
         this.flattenArt = true;
         this.minimapMinX = int(165);
         this.minimapMaxX = int(555);
         var _loc_6= Data.hideNumber(0);
         this.dash = Data.hideNumber(0);
         this.lastCoins = _loc_6;
         this.lastDash = _loc_6;
         this._serverSeed = int(randomSeed);
         this.entitys = ({} as any);
      }
}
$reg('com.jiggmin.pr3.game.MatchPage', MatchPage);
