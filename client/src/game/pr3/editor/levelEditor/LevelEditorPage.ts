// Ported from com/jiggmin/pr3/editor/levelEditor/LevelEditorPage.as
import { Event, Keyboard, Mouse, MouseEvent, clearInterval, setInterval, setTimeout } from '../../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../../flash/as3.ts';
import { GamePage } from '../../game/GamePage.ts';
import { AdminLevelSearch, Block, BlockMenu, CommandMapLayer, Data, EditorHatSelector, EditorMenu, EditorPageGraphic, EffectMapLayer, EmergencySaver, ErrorPage, Key, LevelPage, LoadingLevelPopup, LocalPlayer, MapManager, MessagePopup, PlatformRacing3, SaveCompletePopup, Settings, SocketManager, Sparkworkz, StatSliders, TestLevelControlsGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class LevelEditorPage extends GamePage {
  declare static tempSavedLevel: any;
  declare static instance: LevelEditorPage;
  declare loadingPopup: LoadingLevelPopup;
  declare testMenu: any;
  declare editorMenu: EditorMenu;
  statInterval: number = 0;
  hatInterval: number = 0;
  declare statSliders: StatSliders;
  declare hatSelector: EditorHatSelector;
  cancelLoad(event: Event): void {
         this.wantedLevelID = uint(0);
      }
  iFinished(): void {
         super.iFinished();
         this.removeStatSliders();
         this.removeHatSelector();
         setTimeout($b(this, 'stopTest'),0);
      }
  startGame(): void {
         var splitted: any[]= null;
         var hatId: number = int(0);
         var hatColor: number = int(0);
         var block: Block= null;
         this.positionPlayers();
         super.startGame();
         if(this.localPlayer == null)
         {
            return;
         }
         if(Settings.myCharacter != null)
         {
            this.localPlayer.setHats(new Array({
               "num":Settings.myCharacter.hat,
               "color":Settings.myCharacter.hatColor
            }));
         }
         if(this.sfchmChance > Math.random() * 100)
         {
            this.startSFCHM();
            this.localPlayer.setHats(new Array({
               "num":4,
               "color":Settings.myCharacter.hatColor
            }));
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
         var i: number = int(0);
         if(this.levelType == LevelPage.KING_OF_HAT)
         {
            splitted = this.hatInfo.split(":");
            hatId = int(int(splitted[0]));
            hatColor = int(int(splitted[1]));
            for (block of $each(MapManager.map.blockMap.createUberArray()))
            {
               if(block.canFinish())
               {
                  MapManager.map.blockMap.removeTile(block.tileX,block.tileY);
                  this.createLooseHat(-1,hatId,hatColor,block.posX + Block.halfWidth,block.posY + Block.halfHeight,0,0);
               }
            }
         }
      }
  remove(): void {
         clearInterval(this.hatInterval);
         clearInterval(this.statInterval);
         LevelEditorPage.tempSavedLevel = this.getSaveObj(false);
         this.editorMenu.remove();
         this.editorMenu = null;
         this.removeLoadingPopup();
         Mouse.show();
         LevelEditorPage.instance = null;
         this.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         PlatformRacing3.instance.stage.removeEventListener(Event.ENTER_FRAME,$b(this, 'adminHotkeyListener'));
         super.remove();
      }
  clickExitTest(): void {
         this.stopTest();
      }
  addGuestNote(): void {
         super.addGuestNote();
         if(this.guestNote != null)
         {
            this.guestNote.x = this.editorMenu.x - this.editorMenu.width - 60;
         }
      }
  reset(): void {
         super.reset();
         MapManager.map.setBG("BG" + Math.ceil(Math.random() * 7));
         if(MapManager.map.blockMap == null)
         {
            MapManager.map.createBlockMap();
         }
         this.editorMenu.selectSubMenu("BlockMenu");
      }
  addLoadingPopup(): void {
         this.removeLoadingPopup();
         this.loadingPopup = new LoadingLevelPopup();
         this.loadingPopup.addEventListener(Event.CANCEL,$b(this, 'cancelLoad'),false,0,true);
         this.addPopup(this.loadingPopup);
      }
  startTest(): void {
         this.removePlayers();
         var _loc_1= new LocalPlayer();
         _loc_1.allowAlerts = true;
         var _loc_2= Settings.myCharacter;
         if(_loc_2 == null)
         {
            _loc_2 = ({} as any);
            _loc_2.rank = 0;
            _loc_2.speed = 50;
            _loc_2.accel = 50;
            _loc_2.jump = 50;
            _loc_2.hat = 1;
            _loc_2.head = Math.floor(1 + Math.random() * 3);
            _loc_2.body = Math.floor(1 + Math.random() * 3);
            _loc_2.feet = Math.floor(1 + Math.random() * 3);
            _loc_2.hatColor = Math.round(Math.random() * 16777215);
            _loc_2.headColor = Math.round(Math.random() * 16777215);
            _loc_2.bodyColor = Math.round(Math.random() * 16777215);
            _loc_2.feetColor = Math.round(Math.random() * 16777215);
            Settings.myCharacter = _loc_2;
         }
         _loc_1.setStats(_loc_2.speed,_loc_2.accel,_loc_2.jump);
         _loc_1.setAppearance(_loc_2.hat,_loc_2.head,_loc_2.body,_loc_2.feet,_loc_2.hatColor,_loc_2.headColor,_loc_2.bodyColor,_loc_2.feetColor);
         this.playerArray.push(_loc_1);
         this.playerHolder.addChild(_loc_1);
         this.testMenu.visible = true;
         this.timer.visible = true;
         this.removeNavigation();
         this.editorMenu.remove();
         this.createMinimap();
         MapManager.map.scale = 1;
         this.addStatSliders();
         this.addHatSelector();
         this.removeGuestNote();
         this.initLua();
         this.initGame();
         this.startGame();
      }
  updateStats(): void {
         if(this.statSliders == null)
         {
            return;
         }
         var _loc_2= null;
         var _loc_3= null;
         var _loc_1= this.statSliders.getStats();
         if(_loc_1.changed)
         {
            _loc_2 = Settings.myCharacter;
            _loc_2.speed = _loc_1.speed;
            _loc_2.accel = _loc_1.accel;
            _loc_2.jump = _loc_1.jump;
            this.localPlayer.setStats(_loc_1.speed,_loc_1.accel,_loc_1.jump);
         }
         else
         {
            _loc_3 = this.localPlayer.getVars();
            this.statSliders.setMaxStat("speed",_loc_3.maxStat);
            this.statSliders.setMaxStat("accel",_loc_3.maxStat);
            this.statSliders.setMaxStat("jump",_loc_3.maxStat);
            this.statSliders.setStat("speed",_loc_3.velLevel);
            this.statSliders.setStat("accel",_loc_3.accelLevel);
            this.statSliders.setStat("jump",_loc_3.jumpLevel);
         }
      }
  updateHat(): void {
         Settings.myCharacter.hat = this.hatSelector.getValue();
      }
  init(): void {
         SocketManager.close();
         LevelEditorPage.instance = this;
         this.addChild(new EditorPageGraphic());
         super.init();
         this.editorMenu = new EditorMenu("level");
         this.editorMenu.selectSubMenu("BlockMenu");
         this.addPopup(this.editorMenu);
         this.addNavigation();
         this.reset();
         this.testMenu.exitButton.init("Exit",$b(this, 'clickExitTest'));
         this.addChild(this.testMenu);
         this.testMenu.visible = false;
         if(EffectMapLayer.instance != null)
         {
            EffectMapLayer.instance.remove();
         }
         var _loc_1= LevelEditorPage.tempSavedLevel;
         if(_loc_1 != null)
         {
            this.setSaveObj(_loc_1);
         }
         this.addGuestNote();
      }
  removeStatSliders(): void {
         if(this.statSliders != null)
         {
            this.statSliders.remove();
            this.statSliders = null;
         }
         clearInterval(this.statInterval);
      }
  removeHatSelector(): void {
         if(this.hatSelector != null)
         {
            this.hatSelector.remove();
            this.hatSelector = null;
         }
         clearInterval(this.hatInterval);
      }
  localLoseHat(param1: LocalPlayer, param2: number = 7): any {
         var hat: any= null;
         var _loc_3= super.localLoseHat(param1,param2);
         this.createLooseHat(-1,_loc_3.hatNum,_loc_3.hatColor,_loc_3.x,_loc_3.y,_loc_3.velX,_loc_3.velY);
         var hats: any[]= new Array();
         for(var i= 1; i < param1.hatGraphicArray.length; i++)
         {
            hat = ({} as any);
            hat.num = param1.hatArray[i];
            hat.color = param1.hatColorArray[i];
            hats.push(hat);
         }
         param1.setHats(hats);
         return _loc_3;
      }
  addStatSliders(): void {
         var _loc_1= Settings.myCharacter;
         this.removeStatSliders();
         this.statSliders = new StatSliders(300,_loc_1.speed,_loc_1.accel,_loc_1.jump,-1);
         this.statSliders.total = int.MAX_VALUE;
         this.statSliders.hidePointsRemaining();
         var _loc_2= 0.66;
         this.statSliders.scaleY = 0.66;
         this.statSliders.scaleX = _loc_2;
         this.statSliders.y = Settings.gameHeight - this.statSliders.height - 15;
         this.statSliders.x = 13;
         this.testMenu.statSlidersBG.y = this.statSliders.y - 2;
         this.testMenu.statSlidersBG.width = this.statSliders.width + 15;
         this.testMenu.statSlidersBG.height = this.statSliders.height + 13;
         this.testMenu.addChild(this.statSliders);
         this.statInterval = uint(setInterval($b(this, 'updateStats'),500));
      }
  addHatSelector(): void {
         this.removeHatSelector();
         var character= Settings.myCharacter;
         var hatsArray: any[]= new Array(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,42,43);
         this.hatSelector = new EditorHatSelector(this.localPlayer,"hat1",character.hat,character.hatColor,hatsArray);
         this.hatSelector.y = Settings.gameHeight - this.statSliders.height - 55;
         this.hatSelector.x = 20;
         this.testMenu.addChild(this.hatSelector);
         this.hatInterval = uint(setInterval($b(this, 'updateHat'),500));
      }
  load(param1: number): void {
    param1 = int(param1);
         super.load(param1);
         this.addLoadingPopup();
      }
  saveCallback(param1: any, param2: string): void {
         this.removeSavingPopup();
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Your level could not be saved. " + param2));
         }
         else if(param1.Row.saved == 0)
         {
            this.setPage(new ErrorPage(EmergencySaver.generateErrorMessage("level")));
         }
         else
         {
            this.addPopup(new SaveCompletePopup(param1.Row.level_id));
         }
      }
  grabHat(param1: any): void {
         this.addHat(param1.num,param1.color);
      }
  stopTest(): void {
         this.editorMenu.visible = true;
         this.testMenu.visible = false;
         this.timer.visible = false;
         this.timer.pause();
         this.removePlayers();
         this.addNavigation();
         this.removeMinimap();
         this.editorMenu = new EditorMenu("level");
         this.addPopup(this.editorMenu);
         EffectMapLayer.remove();
         this.blockIntervalManager.stop();
         this.blockIntervalManager.clear();
         this.musicDropdown.setSongID("0");
         this.removeStatSliders();
         this.removeHatSelector();
         this.addGuestNote();
         this.finishPositions = new Array();
         this.startPositions = new Array();
         this.buttonsPressed = new Array();
         this.clearLua();
         MapManager.map.blockMap.reset();
         MapManager.map.setBGColor(-1);
         MapManager.map.setRot(0);
      }
  setSaveObj(param1: any): void {
         super.setSaveObj(param1);
         this.removeLoadingPopup();
         if(this.title == null || this.title.length <= 0)
         {
            PlatformRacing3.instance.discord.updateTitle("In Level Editor");
         }
         else
         {
            PlatformRacing3.instance.discord.updateTitle("In Level Editor","Editing: " + this.title);
         }
      }
  removeLoadingPopup(): void {
         if(this.loadingPopup != null)
         {
            if(!this.loadingPopup.removed)
            {
               this.loadingPopup.remove();
            }
            this.loadingPopup.removeEventListener(Event.CANCEL,$b(this, 'cancelLoad'));
            this.loadingPopup = null;
         }
      }
  save(bytes: boolean): any {
         var _loc_1= this.getSaveObj(bytes);
         var _loc_2= ({} as any);
         _loc_2.p_ip = "000.000.000.000";
         _loc_2.p_title = Data.cleanHTML(_loc_1.title);
         _loc_2.p_comment = Data.cleanHTML(_loc_1.comment);
         _loc_2.p_mode = _loc_1.mode;
         _loc_2.p_items = _loc_1.items;
         _loc_2.p_alien = _loc_1.alienChance;
         _loc_2.p_sfchm = _loc_1.sfchmChance;
         _loc_2.p_snow = _loc_1.snowChance;
         _loc_2.p_wind = _loc_1.windChance;
         _loc_2.p_seconds = _loc_1.seconds;
         _loc_2.p_song_id = _loc_1.songID;
         _loc_2.p_gravity = _loc_1.gravity;
         _loc_2.p_bg_image = _loc_1.bgImage;
         _loc_2.p_level_data = _loc_1.levelData;
         _loc_2.p_lua = _loc_1.lua;
         if(GamePage.instance.levelType == LevelPage.KING_OF_HAT)
         {
            _loc_2.p_king_of_the_hat = _loc_1.king_of_the_hat;
         }
         if(GamePage.instance.levelType == LevelPage.DEATHMATCH || GamePage.instance.levelType == LevelPage.DAMAGE_DASH)
         {
            _loc_2.p_health = _loc_1.health;
         }
         if(_loc_1.publish)
         {
            _loc_2.p_publish = 1;
         }
         else
         {
            _loc_2.p_publish = 0;
         }
         var _loc_3= false;
         Sparkworkz.DataAccess("SaveLevel4",_loc_2,$b(this, 'saveCallback'),_loc_3);
         this.addSavingPopup();
         return _loc_1;
      }
  addHat(id: number, color: number): void {
    id = uint(id); color = uint(color);
         var hat: any= null;
         var hats: any[]= new Array();
         for(var i= 1; i < this.localPlayer.hatGraphicArray.length; i++)
         {
            hat = ({} as any);
            hat.num = this.localPlayer.hatArray[i];
            hat.color = this.localPlayer.hatColorArray[i];
            if(!(hat.num == 0 || hat.num == 1))
            {
               hats.push(hat);
            }
         }
         hat = ({} as any);
         hat.num = id;
         hat.color = color;
         hats.push(hat);
         this.localPlayer.setHats(hats);
         this.doKOTHLogic();
      }
  mouseDownHandler(event: MouseEvent): void {
         var layer: CommandMapLayer= null;
         if(this.localPlayer != null)
         {
            if(Key.isDown(Keyboard.CONTROL))
            {
               layer = MapManager.map.blockMap;
               this.localPlayer.showPoofEffect();
               this.localPlayer.setRealX(layer.mouseX);
               this.localPlayer.setRealY(layer.mouseY);
               this.localPlayer.showTeleportEffect();
            }
         }
      }
  levelUnavailable(): void {
         super.levelUnavailable();
         this.removeLoadingPopup();
      }
  adminHotkeyListener(event: Event): void {
         if(Boolean(Key.isDown(Keyboard.SHIFT)) && Boolean(Key.isDown(Keyboard.CONTROL)) && Boolean(Key.isPressed(Keyboard.L)))
         {
            this.addChild(new AdminLevelSearch());
         }
      }
  constructor(admin: boolean = false) {
         super();
         this.testMenu = new TestLevelControlsGraphic();
         this.autoDisplayMinimap = false;
         this.minimapMinX = int(190);
         this.minimapMaxX = int(530);
         this.musicDropdown.visible = false;
         this.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
         if(admin)
         {
            PlatformRacing3.instance.stage.addEventListener(Event.ENTER_FRAME,$b(this, 'adminHotkeyListener'),false,100,true);
         }
      }
}
$reg('com.jiggmin.pr3.editor.levelEditor.LevelEditorPage', LevelEditorPage);
