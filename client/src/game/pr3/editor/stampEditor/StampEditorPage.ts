// Ported from com/jiggmin/pr3/editor/stampEditor/StampEditorPage.as
import { int, uint, $b } from '../../../../flash/as3.ts';
import { MapPage } from '../../mapPage/MapPage.ts';
import { ArtMenu, BlockEditorPageGraphic, CheckerBGGraphic, Data, EditorMenu, EffectMapLayer, EmergencySaver, ErrorPage, MapManager, MessagePopup, SocketManager, Sparkworkz, Stamp, StampEditorCoverGraphic, StampManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampEditorPage extends MapPage {
  declare static tempSavedStamp: any;
  declare editorMenu: EditorMenu;
  currentStampId: number = 0;
  category: string = "";
  declare cover: any;
  init(): void {
         var _loc_1: any= null;
         SocketManager.close();
         this.addChild(new BlockEditorPageGraphic());
         _loc_1 = new CheckerBGGraphic();
         _loc_1.mouseChildren = false;
         _loc_1.mouseEnabled = false;
         this.addChild(_loc_1);
         super.init();
         MapManager.clear();
         this.addPopup(this.editorMenu = new EditorMenu("stamp"));
         this.reset();
         this.addNavigation();
         EmergencySaver.check();
         if(StampEditorPage.tempSavedStamp != null)
         {
            this.setSaveObj(StampEditorPage.tempSavedStamp);
         }
         this.addGuestNote();
      }
  addGuestNote(): void {
         super.addGuestNote();
         if(this.guestNote != null)
         {
            this.guestNote.x = this.editorMenu.x - this.editorMenu.width - 60;
         }
      }
  remove(): void {
         this.editorMenu.remove();
         this.editorMenu = null;
         StampEditorPage.tempSavedStamp = this.getSaveObj(false);
         super.remove();
      }
  reset(): void {
         super.reset();
         this.currentStampId = uint(0);
         this.category = "";
         this.title = "";
         this.comment = "";
         this.version = int(0);
         this.editorMenu.selectSubMenu("ArtMenu");
         this.addCover();
      }
  getSaveObj(bytes: boolean): any {
         var data: any= ({} as any);
         data.title = this.title;
         data.comment = this.comment;
         data.category = this.category;
         data.art = bytes ? MapManager.map.getByteSaveString() : MapManager.map.saveString;
         return data;
      }
  setSaveObj(data: any): void {
         this.reset();
         this.title = data.title;
         this.comment = data.comment;
         this.category = data.category;
         MapManager.map.saveString = data.art;
      }
  save(bytes: boolean): any {
         if(this.currentStampId > 0)
         {
            StampManager.clearStamp(this.currentStampId);
         }
         else
         {
            StampManager.clearCache();
         }
         var data: any= this.getSaveObj(bytes);
         var request: any= ({} as any);
         request.p_title = Data.cleanHTML(data.title);
         request.p_comment = Data.cleanHTML(data.comment);
         request.p_category = Data.cleanHTML(data.category);
         request.p_art = data.art;
         Sparkworkz.DataAccess("SaveStamp",request,$b(this, 'saveCallback'),false);
         this.addSavingPopup();
         this.editorMenu.selectSubMenu("ArtMenu");
         return null;
      }
  addCover(): void {
         MapManager.map.createEffectMap();
         this.cover = new StampEditorCoverGraphic();
         var _loc_1= false;
         this.cover.mouseChildren = false;
         this.cover.mouseEnabled = _loc_1;
         EffectMapLayer.addEffect(this.cover);
      }
  saveCallback(response: any, error: string): void {
         this.removeSavingPopup();
         if(error != "")
         {
            this.addPopup(new MessagePopup("Your stamp could not be saved. " + error));
         }
         else if(response.Row.saved == 0)
         {
            this.setPage(new ErrorPage(EmergencySaver.generateErrorMessage("stamp")));
         }
      }
  load(stampId: number): void {
    stampId = int(stampId);
         super.load(stampId);
         this.reset();
         this.currentStampId = uint(stampId);
         var stamp: Stamp= StampManager.requestStamp(stampId);
         this.title = stamp.vars.title;
         this.comment = stamp.vars.comment;
         this.category = stamp.vars.category;
         MapManager.map.saveString = stamp.vars.art;
         this.addCover();
         if(this.title == null)
         {
            this.title = "";
         }
         if(this.comment == null)
         {
            this.comment = "";
         }
         if(this.category == null)
         {
            this.category = "";
         }
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.stampEditor.StampEditorPage', StampEditorPage);
