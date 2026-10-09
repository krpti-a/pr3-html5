// Ported from com/jiggmin/pr3/editor/OptionMenu.as
import { DisplayObject, Sprite } from '../../../flash/index.ts';
import { $each, $b } from '../../../flash/as3.ts';
import { EditorPopup } from './EditorPopup.ts';
import { ArtMenu, BlockDropperMenu, BlockKillerMenu, BlockMenu, BlockMoverMenu, BlockSettingsPopup, BrushMenu, ButtonClass, EraserMenu, ImageButton, LevelItemOptionsMenu, LevelOptionsMenu, Popup, StampMenu, TextMenu } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class OptionMenu extends EditorPopup {
  declare optionHolder: Sprite;
  declare subMenu: Popup;
  declare subMenuButtonArray: any[];
  preventReload: boolean = false;
  maxRows: any = 10;
  toolTipAlign: string = "right";
  declare selectedSubMenu: string;
  toolTipPadding: number = 5;
  buttonSpacing: number = 35;
  createButton(param1: DisplayObject, param2: Function, param3: string = "", param4: number = 3): ImageButton {
         var _loc_5= new ImageButton();
         _loc_5.imagePadding = param4;
         _loc_5.width = 30;
         _loc_5.height = 30;
         _loc_5.addGraphic(param1);
         _loc_5.toolTip = param3;
         _loc_5.toolTipAlign = this.toolTipAlign;
         _loc_5.toolTipPadding = this.toolTipPadding;
         _loc_5.init("",param2);
         this.positionGraphic(_loc_5);
         this.optionHolder.addChild(_loc_5);
         this.redraw();
         return _loc_5;
      }
  createSubMenuButton(param1: DisplayObject, param2: string, param3: string = ""): ButtonClass {
         var _loc_4= this.createButton(param1,null,param3);
         _loc_4.data = param2;
         _loc_4.sendSelf = true;
         _loc_4.init("",$b(this, 'clickSubMenuHandler'));
         this.subMenuButtonArray.push(_loc_4);
         return _loc_4;
      }
  remove(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.subMenuButtonArray))
         {
            _loc_1.remove();
         }
         this.subMenuButtonArray = null;
         this.removeSubMenu();
         super.remove();
      }
  positionSubMenu(): void {
         if(this.subMenu != null)
         {
            this.subMenu.y = this.y + this.height + 5;
         }
      }
  selectSubMenu(param1: string): void {
         var _loc_2= null;
         for (_loc_2 of $each(this.subMenuButtonArray))
         {
            if(_loc_2.data == param1)
            {
               this.clickSubMenuHandler(_loc_2);
            }
         }
      }
  removeSubMenu(): void {
         if(this.subMenu != null)
         {
            this.subMenu.remove();
            this.subMenu = null;
         }
      }
  clickSubMenuHandler(param1: ImageButton): void {
         var _loc_2= null;
         if(param1.selected == false || !this.preventReload)
         {
            this.removeSubMenu();
            for (_loc_2 of $each(this.subMenuButtonArray))
            {
               _loc_2.selected = false;
            }
            param1.selected = true;
            this.subMenu = this.createMenu(param1.data);
            this.selectedSubMenu = param1.data;
            this.addPopup(this.subMenu);
            this.positionSubMenu();
         }
      }
  addOption(param1: DisplayObject): void {
         this.positionGraphic(param1);
         this.optionHolder.addChild(param1);
         this.redraw();
      }
  redraw(): void {
         if(this.optionHolder != null)
         {
            super.redraw();
            this.x = 5;
            this.y = 5;
         }
      }
  createMenu(param1: string): Popup {
         if(param1 == "BlockMenu")
         {
            return new BlockMenu();
         }
         if(param1 == "ArtMenu")
         {
            return new ArtMenu();
         }
         if(param1 == "BrushMenu")
         {
            return new BrushMenu();
         }
         if(param1 == "LevelOptionsMenu")
         {
            return new LevelOptionsMenu();
         }
         if(param1 == "LevelItemOptionsMenu")
         {
            return new LevelItemOptionsMenu();
         }
         if(param1 == "BlockDropperMenu")
         {
            return new BlockDropperMenu();
         }
         if(param1 == "BlockMoverMenu")
         {
            return new BlockMoverMenu();
         }
         if(param1 == "BlockKillerMenu")
         {
            return new BlockKillerMenu();
         }
         if(param1 == "EraserMenu")
         {
            return new EraserMenu();
         }
         if(param1 == "StampMenu")
         {
            return new StampMenu();
         }
         if(param1 == "BlockSettingsPopup")
         {
            return new BlockSettingsPopup();
         }
         if(param1 == "TextMenu")
         {
            return new TextMenu();
         }
         return null;
      }
  positionGraphic(param1: DisplayObject): void {
         var _loc_2= this.optionHolder.numChildren;
         var _loc_3= Math.floor(_loc_2 / this.maxRows);
         var _loc_4= _loc_2 % this.maxRows;
         param1.x = _loc_3 * this.buttonSpacing;
         param1.y = _loc_4 * this.buttonSpacing;
         param1.width = 30;
         param1.height = 30;
      }
  constructor() {
         super();
         this.subMenuButtonArray = new Array();
         this.optionHolder = new Sprite();
         this.addGraphic(this.optionHolder);
         this.intrusive = false;
      }
}
$reg('com.jiggmin.pr3.editor.OptionMenu', OptionMenu);
