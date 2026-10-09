// Ported from com/jiggmin/pr3/mapPage/MapPage.as
import { Event, Sprite } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Page } from '../../page/Page.ts';
import { GuestNotifGraphic, MapManager, MapNavigator, MenuMusic, PlatformRacing3, SavingStatusPopup, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MapPage extends Page {
  declare static instance: MapPage;
  declare savingPopup: SavingStatusPopup;
  version: number = 0;
  declare navigation: MapNavigator;
  title: string = "";
  declare guestNote: any;
  comment: string = "";
  declare mapHolder: Sprite;
  drawing: boolean = false;
  getSaveObj(bytes: boolean): any {
         return null;
      }
  removeGuestNote(): void {
         if(this.guestNote != null)
         {
            this.removeChild(this.guestNote);
            this.guestNote = null;
         }
      }
  addGuestNote(): void {
         this.removeGuestNote();
         if(Settings.loginType == "guest")
         {
            this.guestNote = new GuestNotifGraphic();
            this.guestNote.x = 200;
            this.addChild(this.guestNote);
         }
      }
  remove(): void {
         MapManager.clear();
         this.removeChild(this.mapHolder);
         this.mapHolder = null;
         this.removeNavigation();
         this.removeSavingPopup();
         this.removeGuestNote();
         super.remove();
         MapPage.instance = null;
      }
  finishDrawingHandler(event: Event): void {
         this.drawing = false;
      }
  reset(): void {
         MapManager.map.removeEventListener("finishDrawing",$b(this, 'finishDrawingHandler'));
         MapManager.clear();
         MapManager.map.addEventListener("finishDrawing",$b(this, 'finishDrawingHandler'),false,0,true);
         this.mapHolder.addChild(MapManager.map);
      }
  addNavigation(): void {
         if(this.navigation == null)
         {
            this.navigation = new MapNavigator();
         }
         this.addChild(this.navigation);
      }
  init(): void {
         MapPage.instance = this;
         this.w = Settings.gameWidth;
         this.h = Settings.gameHeight;
         super.init();
         PlatformRacing3.mutePos3();
         this.addChild(this.mapHolder);
         this.stage.focus = this.stage;
      }
  load(param1: number): void {
    param1 = int(param1);
         this.drawing = true;
      }
  addSavingPopup(): void {
         this.removeSavingPopup();
         this.savingPopup = new SavingStatusPopup();
         this.addPopup(this.savingPopup);
      }
  removeSavingPopup(): void {
         if(this.savingPopup != null)
         {
            if(!this.savingPopup.removed)
            {
               this.savingPopup.remove();
            }
            this.savingPopup = null;
         }
      }
  setSaveObj(param1: any): void {
         this.reset();
      }
  save(bytes: boolean): any {
         return null;
      }
  removeNavigation(): void {
         if(this.navigation != null)
         {
            this.navigation.remove();
            this.navigation = null;
         }
      }
  constructor() {
         super();
         this.mapHolder = new Sprite();
         MenuMusic.glideToVolume(0);
      }
}
$reg('com.jiggmin.pr3.mapPage.MapPage', MapPage);
