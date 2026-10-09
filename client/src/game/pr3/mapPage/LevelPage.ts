// Ported from com/jiggmin/pr3/mapPage/LevelPage.as
import { int, uint, $b } from '../../../flash/as3.ts';
import { MapPage } from './MapPage.ts';
import { Items, LevelEditorPage, LevelEvent, LevelManager, MapManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LevelPage extends MapPage {
  static DEATHMATCH: string = "deathmatch";
  static TDEATHMATCH: string = "teamDeathmatch";
  static COIN_FIEND: string = "coinFiend";
  static DAMAGE_DASH: string = "damageDash";
  static RACE: string = "race";
  static HAT_ATTACK: string = "hatAttack";
  static KING_OF_HAT: string = "kingOfTheHat";
  declare itemArray: any[];
  sfchmChance: number = 0;
  gravity: number = 1;
  publish: boolean = false;
  snowChance: number = 0;
  alienChance: number = 0;
  windChance: number = 0;
  levelType: string = "race";
  seconds: number = 120;
  minRank: number = 0;
  declare hatInfo: string;
  startHealth: number = 5;
  extraHealth: number = 0;
  lua: string = "";
  wantedLevelID: number = 0;
  wantedLevelVersion: number = 0;
  songID: string = "random";
  flattenArt: boolean = false;
  loadedLevelId: number = 0;
  initLua(): void {
      }
  getSaveObj(bytes: boolean): any {
         var _loc_1= ({} as any);
         _loc_1.title = this.title;
         _loc_1.comment = this.comment;
         _loc_1.version = this.version;
         _loc_1.mode = this.levelType;
         _loc_1.items = this.itemArray.join(",");
         _loc_1.alienChance = this.alienChance;
         _loc_1.sfchmChance = this.sfchmChance;
         _loc_1.snowChance = this.snowChance;
         _loc_1.windChance = this.windChance;
         _loc_1.seconds = this.seconds;
         _loc_1.songID = this.songID;
         _loc_1.gravity = this.gravity;
         _loc_1.minRank = this.minRank;
         _loc_1.bgImage = MapManager.map.bgImage;
         _loc_1.bgColor = MapManager.map.bgColor;
         _loc_1.publish = this.publish;
         _loc_1.levelData = bytes ? MapManager.map.getByteSaveString() : MapManager.map.saveString;
         _loc_1.king_of_the_hat = this.hatInfo;
         _loc_1.health = this.startHealth;
         _loc_1.extraHealth = this.extraHealth;
         _loc_1.lua = this.lua;
         return _loc_1;
      }
  setSaveObj(param1: any): void {
         this.reset();
         if(param1.publish == "0")
         {
            param1.publish = false;
         }
         this.loadedLevelId = uint(param1.levelID);
         this.title = param1.title;
         this.comment = param1.comment;
         this.version = int(param1.version);
         this.levelType = param1.mode;
         this.itemArray = param1.items.split(",");
         this.alienChance = int(param1.alienChance);
         this.sfchmChance = int(param1.sfchmChance);
         this.snowChance = int(param1.snowChance);
         this.windChance = int(param1.windChance);
         this.seconds = int(param1.seconds);
         this.songID = param1.songID;
         this.gravity = param1.gravity;
         this.minRank = int(param1.minRank);
         this.publish = param1.publish;
         this.hatInfo = param1.king_of_the_hat;
         this.startHealth = int(param1.health);
         this.extraHealth = int(param1.extraHealth);
         this.lua = param1.lua;
         if(!(this instanceof LevelEditorPage))
         {
            this.initLua();
         }
         MapManager.map.flattenArt = this.flattenArt;
         MapManager.map.setBG(param1.bgImage);
         MapManager.map.cacheKey = this.flattenArt ? {
            "id":int(param1.levelID),
            "version":int(param1.version)
         } : null;
         MapManager.map.saveString = param1.levelData;
      }
  remove(): void {
         LevelManager.removeEventListener(LevelEvent.LEVEL_AVAILABLE,$b(this, 'levelAvailableHandler'));
         LevelManager.removeEventListener(LevelEvent.LEVEL_UNAVAILABLE,$b(this, 'levelUnavailableHandler'));
         this.itemArray = null;
         super.remove();
      }
  reset(): void {
         super.reset();
         this.loadedLevelId = uint(0);
         this.itemArray = Items.defaultItems;
         this.songID = "random";
         this.alienChance = int(0);
         this.sfchmChance = int(0);
         this.snowChance = int(0);
         this.windChance = int(0);
         this.title = "";
         this.comment = "";
         this.version = int(0);
         this.levelType = "race";
         this.seconds = int(120);
         this.gravity = 1;
         this.minRank = int(0);
         this.publish = false;
         this.hatInfo = "";
         this.startHealth = int(5);
         this.extraHealth = int(0);
         this.lua = "";
      }
  load(levelId: number): void {
    levelId = int(levelId);
         super.load(levelId);
         this.wantedLevelID = uint(levelId);
         LevelManager.requestLevel(levelId);
      }
  loadVersion(levelId: number, levelVersion: number): void {
    levelId = uint(levelId); levelVersion = uint(levelVersion);
         if(levelVersion == 0)
         {
            this.load(levelId);
            return;
         }
         super.load(levelId);
         this.wantedLevelID = uint(levelId);
         this.wantedLevelVersion = uint(levelVersion);
         LevelManager.requestLevelCachable(levelId,levelVersion);
      }
  levelAvailableHandler(event: LevelEvent): void {
         var level= event.level;
         if(level.version == this.wantedLevelVersion && level.levelID == this.wantedLevelID)
         {
            this.setSaveObj(level);
         }
         else if(this.wantedLevelVersion == 0 && level.levelID == this.wantedLevelID)
         {
            this.setSaveObj(level);
         }
      }
  levelUnavailableHandler(event: LevelEvent): void {
         var level= event.level;
         if(level.version == this.wantedLevelVersion && level.levelID == this.wantedLevelID)
         {
            this.levelUnavailable();
         }
         else if(this.wantedLevelVersion == 0 && level.levelID == this.wantedLevelID)
         {
            this.levelUnavailable();
         }
      }
  levelUnavailable(): void {
         this.drawing = false;
      }
  constructor() {
         super();
         this.itemArray = new Array();
         LevelManager.addEventListener(LevelEvent.LEVEL_AVAILABLE,$b(this, 'levelAvailableHandler'),false,0,true);
         LevelManager.addEventListener(LevelEvent.LEVEL_UNAVAILABLE,$b(this, 'levelUnavailableHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.mapPage.LevelPage', LevelPage);
