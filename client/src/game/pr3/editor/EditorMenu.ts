// Ported from com/jiggmin/pr3/editor/EditorMenu.as
import { DisplayObject, Keyboard, KeyboardEvent, Security, clearInterval, setInterval } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { OptionMenu } from './OptionMenu.ts';
import { AirBlockCodeSettingsUI, ArtButtonGraphic, ArtLayerMenu, ArtMenu, BlockButtonGraphic, BlockDropperMenu, BlockMenu, BlockSettingsPopup, BrushMenu, EasyButton, EasyCodeInput, EditorFancyBGGraphic, EditorJumpMenu, ExtraOptionsButtonGraphic, ImageButton, ItemSettingsButtonGraphic, Items, JumpMenu, Key, LevelEditorPage, LevelItemOptionsMenu, LevelOptionsMenu, LuaSettingsButtonGraphic, MapManager, MapPage, MessagePopup, PlatformRacing3, Popup, Settings, SettingsButtonGraphic, TestLevelButtonGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EditorMenu extends OptionMenu {
  static lastSelected: string = "BlockMenu";
  declare mode: string;
  declare fancyBG: any;
  checkDrawingInterval: number = 0;
  declare codeBox: EasyCodeInput;
  declare codePopup: Popup;
  editorPollingInterval: number = 0;
  addFullscreenWindow(): void {
         this.codeBox.text = LevelEditorPage.instance.lua;
         this.codeBox.width = this.stage.stageWidth - 50;
         this.codeBox.height = this.stage.stageHeight - 120;
         this.codePopup = new Popup();
         this.codePopup.addGraphicHandler(this.codeBox);
         this.codePopup.addChild(this.createCloseButton());
         this.codePopup.addChild(this.createParseButton());
         if(Security.sandboxType == Security.APPLICATION)
         {
            this.codePopup.addChild(this.createOpenVSCodeButton());
         }
         this.codePopup.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'abortCodePopup'),false,0,true);
         this.stage.addChild(this.codePopup);
      }
  abortCodePopup(e: KeyboardEvent): void {
         if(e.keyCode == Keyboard.ESCAPE)
         {
            this.removeCodePopup();
         }
      }
  createCloseButton(): EasyButton {
         var closeButton: EasyButton= null;
         closeButton = new EasyButton();
         closeButton.label = "Close";
         closeButton.setFunc($b(this, 'removeCodePopup'));
         closeButton.y = -10;
         return closeButton;
      }
  createParseButton(): EasyButton {
         var checkButton: EasyButton= null;
         checkButton = new EasyButton();
         checkButton.label = "Try To Parse";
         checkButton.setFunc($b(this, 'parseCode'));
         checkButton.x = this.stage.stageWidth - 50 - checkButton.width;
         checkButton.y = -10;
         return checkButton;
      }
  createOpenVSCodeButton(): EasyButton {
         var editorButton: EasyButton= null;
         editorButton = new EasyButton();
         editorButton.label = "Open in VSCode";
         editorButton.setFunc($b(this, 'openInVSCode'));
         editorButton.x = this.stage.stageWidth - 140 - editorButton.width;
         editorButton.y = -10;
         return editorButton;
      }
  openInVSCode(): void {
    const $this = this;
         clearInterval(this.editorPollingInterval);
         this.editorPollingInterval = uint(AirBlockCodeSettingsUI.openInVSCode(this.codeBox.text,"lua",function (text: any): any {
            $this.codeBox.text = text;
         }));
      }
  removeCodePopup(): void {
         LevelEditorPage.instance.lua = this.codeBox.text;
         this.codePopup.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'abortCodePopup'));
         this.stage.removeChild(this.codePopup);
         this.codePopup.remove();
      }
  parseCode(): void {
         var code: string= this.codeBox.text;
         var result: string= PlatformRacing3.lua.callGlobal("check_parsing_errors",code)[1];
         if(result != null && result.length > 0)
         {
            this.removeCodePopup();
            PlatformRacing3.addPopup(new MessagePopup("There was a problem parsing the LUA:\n\n" + result));
         }
         else
         {
            this.removeCodePopup();
            PlatformRacing3.addPopup(new MessagePopup("Lua parsed successfully."));
         }
      }
  remove(): void {
         clearInterval(this.editorPollingInterval);
         clearInterval(this.checkDrawingInterval);
         this.fancyBG = null;
         if(this.stage != null)
         {
            this.stage.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'));
         }
         super.remove();
      }
  positionSubMenu(): void {
         var _loc_1= 0;
         var _loc_2= 0;
         if(this.selectedSubMenu == "BlockMenu" || this.selectedSubMenu == "ArtMenu")
         {
            this.subMenu.y = 5;
            this.subMenu.x = 5;
         }
         else if(this.selectedSubMenu != "BlockSettingsPopup")
         {
            if(this.subMenu != null)
            {
               _loc_1 = 30;
               _loc_2 = 410;
               this.subMenu.x = Settings.gameWidth / 2 - this.subMenu.width / 2;
               this.subMenu.y = (_loc_2 - _loc_1 - this.subMenu.height) / 2 + _loc_1;
            }
         }
      }
  addJumpMenu(param1: JumpMenu): void {
         if(this.mode == "level")
         {
            param1.x = this.x + 20;
         }
         else
         {
            param1.x = this.x - 30;
         }
         param1.y = this.y + this.height - 15;
         this.addPopup(param1);
      }
  keyDownHandler(event: KeyboardEvent): void {
         if(Key.isDown(Keyboard.CONTROL))
         {
            if(event.keyCode == 90)
            {
               MapManager.map.undo();
            }
            else if(event.keyCode == 89)
            {
               MapManager.map.redo();
            }
            else if(event.keyCode == 69)
            {
               if(this.selectedSubMenu == "BlockMenu")
               {
                  this.toggleVisibility(BlockDropperMenu.instance);
                  this.toggleVisibility(this.subMenu);
               }
               else if(this.selectedSubMenu == "ArtMenu")
               {
                  this.toggleVisibility(ArtLayerMenu.instance);
                  this.toggleVisibility(BrushMenu.instance);
                  this.toggleVisibility(this.subMenu);
               }
            }
            else if(event.keyCode == 82)
            {
               this.toggleVisibility(this.fancyBG.parent);
            }
            else if(event.keyCode == 84)
            {
            }
         }
      }
  toggleVisibility(shit: any): void {
         if(shit.visible)
         {
            shit.visible = false;
         }
         else
         {
            shit.visible = true;
         }
      }
  clickTestLevel(): void {
         if(!MapPage.instance.drawing && !MapManager.map.drawing)
         {
            LevelEditorPage.instance.startTest();
         }
      }
  clickListMenu(): void {
         this.addJumpMenu(new EditorJumpMenu(this.mode));
      }
  createButton(param1: DisplayObject, param2: Function, param3: string = "", param4: number = 3): ImageButton {
         var _loc_5= super.createButton(param1,param2,param3,0);
         var _loc_6= 32;
         _loc_5.height = 32;
         _loc_5.width = _loc_6;
         return _loc_5;
      }
  init(): void {
         this.selectSubMenu(EditorMenu.lastSelected);
         this.stage.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'),false,0,true);
         super.init();
      }
  checkDrawing(): void {
         var _loc_1= undefined;
         if(Boolean(MapPage.instance.drawing) || Boolean(MapManager.map.drawing))
         {
            this.alpha = 0.5;
            _loc_1 = false;
            this.mouseChildren = false;
            this.mouseEnabled = _loc_1;
         }
         else
         {
            this.alpha = 1;
            _loc_1 = true;
            this.mouseChildren = true;
            this.mouseEnabled = _loc_1;
         }
      }
  redraw(): void {
         super.redraw();
         if(this.mode == "level")
         {
            this.x = this.availableWidth - this.width;
         }
         else
         {
            this.x = this.availableWidth - this.width + 113;
         }
         this.y = 0;
      }
  positionGraphic(param1: DisplayObject): void {
         param1.x = this.optionHolder.numChildren * this.buttonSpacing + 11;
         param1.y = 5;
      }
  constructor(param1: string) {
         var _loc_3= undefined;
         super();
         var _loc_2= null;
         this.bg.visible = false;
         this.padding = int(0);
         this.toolTipAlign = "bottom";
         this.toolTipPadding = int(15);
         this.buttonSpacing = int(39);
         this.mode = param1;
         this.fancyBG = new EditorFancyBGGraphic();
         this.fancyBG.width *= 1.1;
         this.addGraphic(this.fancyBG);
         this.fancyBG.parent.addChildAt(this.fancyBG,0);
         this.codeBox = new EasyCodeInput();
         this.codeBox.multiline = true;
         this.codeBox.maxChars = 200000;
         this.codeBox.restrict = null;
         if(param1 == "level")
         {
            EditorMenu.lastSelected = "BlockMenu";
            this.createSubMenuButton(new BlockButtonGraphic(),"BlockMenu","Blocks \nDesign a level.");
         }
         else if(EditorMenu.lastSelected == "BlockMenu")
         {
            EditorMenu.lastSelected = "ArtMenu";
         }
         this.createSubMenuButton(new ArtButtonGraphic(),"ArtMenu","Art \nAwesome-ize your level with drawings and stamps.");
         if(param1 == "level")
         {
            this.createSubMenuButton(new SettingsButtonGraphic(),"LevelOptionsMenu","Settings \nAdjust the settings for this map.");
         }
         if(param1 == "level")
         {
            this.createButton(new LuaSettingsButtonGraphic(),$b(this, 'addFullscreenWindow'),"Global LUA \nType LUA code that\'ll affect the entire level.");
         }
         if(param1 == "level")
         {
            this.createSubMenuButton(new ItemSettingsButtonGraphic(),"LevelItemOptionsMenu","Items \nChoose which items appear from item blocks.");
         }
         if(param1 == "block")
         {
            this.createSubMenuButton(new SettingsButtonGraphic(),"BlockSettingsPopup","Settings \nControl how your block interacts with the world.");
         }
         this.createButton(new ExtraOptionsButtonGraphic(),$b(this, 'clickListMenu'),"Menu \nSave, load, undo, redo, or exit.");
         if(param1 == "level")
         {
            _loc_2 = this.createButton(new TestLevelButtonGraphic(),$b(this, 'clickTestLevel'),"Test Level \nSee your level in action!");
            _loc_3 = 41;
            _loc_2.height = 41;
            _loc_2.width = _loc_3;
            _loc_2.x = 250;
         }
         this.checkDrawingInterval = uint(setInterval($b(this, 'checkDrawing'),100));
         this.checkDrawing();
      }
}
$reg('com.jiggmin.pr3.editor.EditorMenu', EditorMenu);
