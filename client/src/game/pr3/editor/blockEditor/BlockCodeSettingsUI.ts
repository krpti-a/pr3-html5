// Ported from com/jiggmin/pr3/editor/blockEditor/BlockCodeSettingsUI.as
import { Keyboard, KeyboardEvent, Security, clearInterval } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { AirBlockCodeSettingsUI, BlockCodeSettingsUIGraphic, BlockSettings, EasyButton, MessagePopup, PlatformRacing3, Popup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockCodeSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  declare side: string;
  declare type: string;
  declare codePopup: Popup;
  declare closePopupButton: EasyButton;
  declare fullscreenButton: EasyButton;
  declare openInVsCodeButton: EasyButton;
  editorPollingInterval: number = 0;
  addFullscreenWindow(): void {
         this.m.codeBox.width = this.stage.stageWidth - 50;
         this.m.codeBox.height = this.stage.stageHeight - 120;
         this.codePopup = new Popup();
         this.codePopup.addGraphicHandler(this.m.codeBox);
         this.codePopup.addChild(this.createCloseButton());
         this.codePopup.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'abortCodePopup'),false,0,true);
         this.stage.addChild(this.codePopup);
      }
  createCloseButton(): EasyButton {
         this.closePopupButton = new EasyButton();
         this.closePopupButton.label = "Close";
         this.closePopupButton.setFunc($b(this, 'removeCodePopup'));
         this.closePopupButton.y = 20;
         return this.closePopupButton;
      }
  removeCodePopup(): void {
         this.codePopup.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'abortCodePopup'));
         this.stage.removeChild(this.codePopup);
         this.codePopup.remove();
         this.m.codeBox.height = 170;
         this.m.codeBox.width = 195;
         this.m.addChild(this.m.codeBox);
         this.addChild(this.createFullscreenButton());
      }
  createFullscreenButton(): EasyButton {
         this.fullscreenButton = new EasyButton();
         this.fullscreenButton.label = "Fullscreen Code Window";
         this.fullscreenButton.setFunc($b(this, 'addFullscreenWindow'));
         this.fullscreenButton.x = 0;
         this.fullscreenButton.y = 230;
         return this.fullscreenButton;
      }
  createOpenVSCodeButton(): EasyButton {
         this.openInVsCodeButton = new EasyButton();
         this.openInVsCodeButton.label = "Open in VSCode";
         this.openInVsCodeButton.setFunc($b(this, 'openInVSCode'));
         this.openInVsCodeButton.x = 0;
         this.openInVsCodeButton.y = 250;
         return this.openInVsCodeButton;
      }
  openInVSCode(): void {
    const $this = this;
         clearInterval(this.editorPollingInterval);
         this.editorPollingInterval = uint(AirBlockCodeSettingsUI.openInVSCode(this.m.codeBox.text,this.type,function (text: any): any {
            $this.m.codeBox.text = text;
         }));
      }
  abortCodePopup(e: KeyboardEvent): void {
         if(e.keyCode == Keyboard.ESCAPE)
         {
            this.removeCodePopup();
         }
      }
  remove(): void {
         clearInterval(this.editorPollingInterval);
         this.save();
         this.m = null;
         this.blockSettings = null;
         if(this.codePopup != null)
         {
            this.codePopup.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'abortCodePopup'));
            this.codePopup = null;
         }
         super.remove();
      }
  save(): void {
         var code: string= this.m.codeBox.text;
         this.blockSettings[this.type][this.side] = code;
      }
  constructor(blockSettings: BlockSettings, side: string, type: string) {
         super();
    const $this = this;
         var checkButton: EasyButton= null;

         this.m = new BlockCodeSettingsUIGraphic();
         this.m.x = 0;
         this.m.y = 0;
         this.m.codeBox.height = 170;
         this.m.codeBox.width = 195;
         this.m.codeBox.multiline = true;
         this.m.codeBox.maxChars = 200000;
         this.m.codeBox.restrict = null;
         this.m.codeBox.text = blockSettings[type][side] != null ? blockSettings[type][side] : "";
         this.blockSettings = blockSettings;
         this.side = side;
         this.type = type;
         this.addChild(this.m);
         if(this.type == "lua")
         {
            this.m.noticeText.visible = false;
            checkButton = new EasyButton();
            checkButton.label = "Try To Parse";
            checkButton.setFunc(function (): any {
               var code: string= $this.m.codeBox.text.toLowerCase();
               var result: string= PlatformRacing3.lua.callGlobal("check_parsing_errors",code)[1];
               if(result != null && result.length > 0)
               {
                  PlatformRacing3.addPopup(new MessagePopup("There was a problem parsing the lua:\n\n" + result));
               }
               else
               {
                  PlatformRacing3.addPopup(new MessagePopup("Lua parsed successfully."));
               }
            });
            checkButton.y = 210;
            this.addChild(checkButton);
         }
         this.addChild(this.createFullscreenButton());
         if(Security.sandboxType == Security.APPLICATION)
         {
            this.addChild(this.createOpenVSCodeButton());
         }
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockCodeSettingsUI', BlockCodeSettingsUI);
