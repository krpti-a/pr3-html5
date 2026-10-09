// Ported from com/jiggmin/pr3/editor/EditorJumpMenu.as
import { Security } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { JumpMenu } from '../../ui/JumpMenu.ts';
import { AirEditorJumpMenu, Block, BlockEditorPage, LevelEditorPage, LoadPopup, LoginPopup, MapManager, MapPage, MenuPage, MessagePopup, Popup, SavePopup, Settings, Stamp, StampEditorPage } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EditorJumpMenu extends JumpMenu {
  declare mode: string;
  declare guestMessage: string;
  clickMainMenu(): void {
         if(!MapManager.map.blockMap.drawing)
         {
            this.setPage(new MenuPage());
         }
      }
  clickSave(): void {
         if(Settings.loginType == Settings.LOGIN_TYPE_MEMBER)
         {
            this.addPopup(new SavePopup(this.mode));
         }
         else
         {
            this.addPopup(new MessagePopup(this.guestMessage));
         }
         this.remove();
      }
  clickLevelEditor(): void {
         if(!MapManager.map.blockMap.drawing)
         {
            this.setPage(new LevelEditorPage());
         }
      }
  clickStampEditor(): void {
         if(!MapManager.map.blockMap.drawing)
         {
            this.setPage(new StampEditorPage());
         }
      }
  clickUndo(): void {
         MapManager.map.undo();
      }
  clickRedo(): void {
         MapManager.map.redo();
      }
  clickLobby(): void {
         if(!MapManager.map.blockMap.drawing)
         {
            this.addPopup(new LoginPopup());
         }
      }
  getLoadPopup(): Popup {
         return null;
      }
  clickBlockEditor(): void {
         if(!MapManager.map.blockMap.drawing)
         {
            this.setPage(new BlockEditorPage());
         }
      }
  clickLoad(): void {
         if(Settings.loginType == Settings.LOGIN_TYPE_MEMBER)
         {
            this.addPopup(new LoadPopup(this.mode));
         }
         else
         {
            this.addPopup(new MessagePopup(this.guestMessage));
         }
         this.remove();
      }
  clickNew(): void {
         MapPage.instance.reset();
         this.remove();
      }
  getSavePopup(): Popup {
         return null;
      }
  constructor(param1: string) {
         super();
         this.mode = param1;
         this.guestMessage = "Guests can not load or save " + param1 + "s.";
         this.createButton("Undo (Ctrl+Z)",$b(this, 'clickUndo'));
         this.createButton("Redo (Ctrl+Y)",$b(this, 'clickRedo'));
         this.createSeparator();
         this.createButton("New",$b(this, 'clickNew'));
         this.createButton("Load",$b(this, 'clickLoad'));
         this.createButton("Save",$b(this, 'clickSave'));
         this.createSeparator();
         if(Security.sandboxType == Security.APPLICATION && param1 == "level")
         {
            this.createButton("Export (for ROP)",AirEditorJumpMenu.clickExport);
            this.createSeparator();
         }
         if(param1 == "level")
         {
            this.createButton("Goto Block Editor",$b(this, 'clickBlockEditor'));
            this.createButton("Goto Stamp Editor",$b(this, 'clickStampEditor'));
         }
         else if(param1 == "block")
         {
            this.createButton("Goto Level Editor",$b(this, 'clickLevelEditor'));
            this.createButton("Goto Stamp Editor",$b(this, 'clickStampEditor'));
         }
         else
         {
            this.createButton("Goto Level Editor",$b(this, 'clickLevelEditor'));
            this.createButton("Goto Block Editor",$b(this, 'clickBlockEditor'));
         }
         if(Settings.server == null)
         {
            this.createButton("Goto Main Menu",$b(this, 'clickMainMenu'));
         }
         else
         {
            this.createButton("Goto Lobby",$b(this, 'clickLobby'));
         }
      }
}
$reg('com.jiggmin.pr3.editor.EditorJumpMenu', EditorJumpMenu);
