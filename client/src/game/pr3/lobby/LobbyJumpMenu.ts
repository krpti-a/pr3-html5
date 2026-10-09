// Ported from com/jiggmin/pr3/lobby/LobbyJumpMenu.as
import { int, $b } from '../../../flash/as3.ts';
import { JumpMenu } from '../../ui/JumpMenu.ts';
import { Block, BlockDropperMenu, BlockEditorPage, ChangeLogPopup, GameSettingsPopup, LevelEditorPage, MenuPage, Settings, SocketManager, Stamp, StampEditorPage, StampMenu } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LobbyJumpMenu extends JumpMenu {
  clickLevelEditor(): void {
         try
         {
            this.setPage(new LevelEditorPage(SocketManager.socket.me.hasPermission("access_bypass_chat_flood")));
         }
         finally
         {
            SocketManager.close();
         }
      }
  clickLogout(): void {
         try
         {
            LevelEditorPage.tempSavedLevel = null;
            BlockEditorPage.tempSavedBlock = null;
            StampEditorPage.tempSavedStamp = null;
            BlockDropperMenu.savedBlockID = int(-1);
            StampMenu.savedStamp = int(-1);
            this.setPage(new MenuPage());
         }
         finally
         {
            SocketManager.close();
         }
      }
  clickSettings(): void {
         this.addPopup(new GameSettingsPopup());
         this.remove();
      }
  clickBlockEditor(): void {
         try
         {
            this.setPage(new BlockEditorPage());
         }
         finally
         {
            SocketManager.close();
         }
      }
  clickChangeLog(): void {
         this.addPopup(new ChangeLogPopup());
         this.remove();
      }
  clickStampEditor(): void {
         try
         {
            this.setPage(new StampEditorPage());
         }
         finally
         {
            SocketManager.close();
         }
      }
  constructor() {
         super();
         this.createButton("Goto Level Editor",$b(this, 'clickLevelEditor'));
         this.createButton("Goto Block Editor",$b(this, 'clickBlockEditor'));
         this.createButton("Goto Stamp Editor",$b(this, 'clickStampEditor'));
         this.createSeparator();
         this.createButton("Game Settings",$b(this, 'clickSettings'));
         this.createButton("Log Out",$b(this, 'clickLogout'));
      }
}
$reg('com.jiggmin.pr3.lobby.LobbyJumpMenu', LobbyJumpMenu);
