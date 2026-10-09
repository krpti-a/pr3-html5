// Ported from com/jiggmin/pr3/editor/blockEditor/BlockEditorPage.as
import { int, $b } from '../../../../flash/as3.ts';
import { MapPage } from '../../mapPage/MapPage.ts';
import { ArtMenu, Block, BlockEditorCoverGraphic, BlockEditorPageGraphic, BlockManager, BlockSettings, BlockSettingsPopup, CheckerBGGraphic, Data, EditorMenu, EffectMapLayer, EmergencySaver, ErrorPage, MapManager, MessagePopup, PlatformRacing3, SocketManager, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockEditorPage extends MapPage {
  declare static blockSettings: BlockSettings;
  declare static tempSavedBlock: any;
  declare editorMenu: EditorMenu;
  currentBlockID: number = -1;
  declare cover: any;
  category: string = "";
  saveCallback(param1: any, param2: string): void {
         this.removeSavingPopup();
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Your block could not be saved. " + param2));
         }
         else if(param1.Row.saved == 0)
         {
            this.setPage(new ErrorPage(EmergencySaver.generateErrorMessage("block")));
         }
      }
  getSaveObj(bytes: boolean): any {
         var _loc_1: any= ({} as any);
         _loc_1.title = this.title;
         _loc_1.comment = this.comment;
         _loc_1.version = this.version;
         _loc_1.settings = BlockEditorPage.blockSettings.compressSettings();
         _loc_1.blockData = bytes ? MapManager.map.getByteSaveString() : MapManager.map.saveString;
         _loc_1.blockID = this.currentBlockID;
         _loc_1.category = this.category;
         return _loc_1;
      }
  addCover(): void {
         var _loc_1: boolean= false;
         MapManager.map.createEffectMap();
         this.cover = new BlockEditorCoverGraphic();
         _loc_1 = false;
         this.cover.mouseChildren = false;
         this.cover.mouseEnabled = _loc_1;
         EffectMapLayer.addEffect(this.cover);
      }
  load(param1: number): void {
    param1 = int(param1);
         super.load(param1);
         this.reset();
         this.currentBlockID = int(param1);
         var _loc_2: Block= BlockManager.requestBlock(param1);
         this.title = _loc_2.vars.title;
         this.comment = _loc_2.vars.comment;
         this.category = _loc_2.vars.category;
         BlockEditorPage.blockSettings = new BlockSettings();
         BlockEditorPage.blockSettings.decompressSettings(_loc_2.vars.compressSettings());
         MapManager.map.saveString = _loc_2.vars.saveString;
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
  addGuestNote(): void {
         super.addGuestNote();
         if(this.guestNote != null)
         {
            this.guestNote.x = this.editorMenu.x - this.editorMenu.width - 60;
         }
      }
  remove(): void {
         this.cover = null;
         this.editorMenu.remove();
         this.editorMenu = null;
         BlockEditorPage.tempSavedBlock = this.getSaveObj(false);
         super.remove();
      }
  init(): void {
         SocketManager.close();
         this.addChild(new BlockEditorPageGraphic());
         var _loc_1: any= new CheckerBGGraphic();
         var _loc_3: boolean= false;
         _loc_1.mouseChildren = false;
         _loc_1.mouseEnabled = _loc_3;
         this.addChild(_loc_1);
         super.init();
         MapManager.clear();
         this.editorMenu = new EditorMenu("block");
         this.addPopup(this.editorMenu);
         this.reset();
         this.addNavigation();
         EmergencySaver.check();
         var _loc_2: any= BlockEditorPage.tempSavedBlock;
         if(_loc_2 != null)
         {
            this.setSaveObj(_loc_2);
         }
         else
         {
            PlatformRacing3.instance.discord.updateTitle("In Block Editor");
         }
         this.addGuestNote();
      }
  reset(): void {
         super.reset();
         this.currentBlockID = int(-1);
         this.category = "";
         this.title = "";
         this.comment = "";
         this.version = int(0);
         this.editorMenu.selectSubMenu("ArtMenu");
         BlockEditorPage.blockSettings = new BlockSettings();
         this.addCover();
      }
  save(bytes: boolean): any {
         if(this.currentBlockID != -1)
         {
            BlockManager.clearBlock(this.currentBlockID);
         }
         else
         {
            BlockManager.clearCache();
         }
         if(BlockSettingsPopup.instance != null)
         {
            BlockSettingsPopup.instance.save();
         }
         var _loc_1: any= this.getSaveObj(bytes);
         var _loc_2: any= ({} as any);
         _loc_2.p_ip = "000.000.000.000";
         _loc_2.p_title = Data.cleanHTML(_loc_1.title);
         _loc_2.p_comment = Data.cleanHTML(_loc_1.comment);
         _loc_2.p_image_data = _loc_1.blockData;
         _loc_2.p_settings = _loc_1.settings;
         _loc_2.p_category = Data.cleanHTML(_loc_1.category);
         var _loc_3: boolean= false;
         Sparkworkz.DataAccess("SaveBlock4",_loc_2,$b(this, 'saveCallback'),_loc_3);
         this.addSavingPopup();
         this.editorMenu.selectSubMenu("ArtMenu");
         return null;
      }
  setSaveObj(param1: any): void {
         this.reset();
         this.title = param1.title;
         this.comment = param1.comment;
         this.version = int(param1.version);
         BlockEditorPage.blockSettings.decompressSettings(param1.settings);
         this.currentBlockID = int(param1.blockID);
         this.category = param1.category;
         MapManager.map.saveString = param1.blockData;
         if(this.title == null || this.title.length <= 0)
         {
            PlatformRacing3.instance.discord.updateTitle("In Block Editor");
         }
         else
         {
            PlatformRacing3.instance.discord.updateTitle("In Block Editor","Editing: " + this.title);
         }
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockEditorPage', BlockEditorPage);
