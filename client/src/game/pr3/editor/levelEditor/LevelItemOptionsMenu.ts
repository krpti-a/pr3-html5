// Ported from com/jiggmin/pr3/editor/levelEditor/LevelItemOptionsMenu.as
import { clearInterval, setInterval } from '../../../../flash/index.ts';
import { int, uint, $keys, $b } from '../../../../flash/as3.ts';
import { EditorPopup } from '../EditorPopup.ts';
import { Block, Bow, Buzzsaw, EasyButton, EasyCheckBox, Grenade, Heart, Items, LevelItemOptionsMenuGraphic, LevelPage, Lightning, MapPage, Napalm, Retreater, Shield, Snowball, Sword, Teleport } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class LevelItemOptionsMenu extends EditorPopup {
  declare hatInfo: any;
  checkRowHeight: number = 20;
  declare level: LevelPage;
  checkX: number = 0;
  checkY: number = 61;
  saveInterval: number = 0;
  declare itemCheckArray: any[];
  checkColumnWidth: number = 140;
  declare m: any;
  checkRow: number = 0;
  checkMaxRows: number = 6;
  checkColumn: number = 0;
  checkStatus: boolean = false;
  declare toggleButton: EasyButton;
  remove(): void {
         clearInterval(this.saveInterval);
         this.save();
         this.level = null;
         this.itemCheckArray = null;
         this.m = null;
         super.remove();
      }
  addItems(): void {
         this.addItem("Angel\'s Wings",Items.ANGEL_WINGS);
         this.addItem("Black Hole",Items.BLACK_HOLE);
         this.addItem("Bow",Items.BOW);
         this.addItem("Buzzsaw",Items.BUZZSAW);
         this.addItem("Chili Pepper",Items.CHILI_PEPPER);
         this.addItem("Freeze Ray",Items.FREEZE_RAY);
         this.addItem("Heart",Items.HEART);
         this.addItem("Grenade",Items.GRENADE);
         this.addItem("Jet Pack",Items.JET_PACK);
         this.addItem("Laser Gun",Items.LASER_GUN);
         this.addItem("Lightning",Items.LIGHTNING);
         this.addItem("Lightning Cloud",Items.LIGHTNING_CLOUD);
         this.addItem("Napalm",Items.NAPALM);
         this.addItem("Portable Block",Items.PORTABLE_BLOCK);
         this.addItem("Portable Mine",Items.PORTABLE_MINE);
         this.addItem("Retreater",Items.RETREATER);
         this.addItem("Rocket Launcher",Items.ROCKET_LAUNCHER);
         this.addItem("Shield",Items.SHIELD);
         this.addItem("Snowball",Items.SNOWBALL);
         this.addItem("Speed Burst",Items.SPEED_BURST);
         this.addItem("Super Jump",Items.SUPER_JUMP);
         this.addItem("Super Teleport",Items.SUPER_TELEPORT);
         this.addItem("Sword",Items.SWORD);
         this.addItem("Teleport",Items.TELEPORT);
      }
  addQuickToggle(): void {
         this.toggleButton = new EasyButton();
         this.toggleButton.label = "Disable All Items";
         this.toggleButton.setFunc($b(this, 'toggleAll'));
         this.toggleButton.x = this.m.width - 5 - this.toggleButton.width;
         this.toggleButton.y = 5;
         this.toggleButton.setFunc($b(this, 'toggleAll'));
         this.m.addChild(this.toggleButton);
      }
  toggleAll(): void {
         for(var index: number = int(0); index < this.m.numChildren; index++)
         {
            if(this.m.getChildAt(index) instanceof EasyCheckBox)
            {
               this.m.getChildAt(index).checked = this.checkStatus;
            }
         }
         if(!this.checkStatus)
         {
            this.checkStatus = true;
            this.toggleButton.label = "Enable All Items";
         }
         else
         {
            this.checkStatus = false;
            this.toggleButton.label = "Disable All Items";
         }
      }
  addItem(param1: string, param2: string): void {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_3= null;
         _loc_3 = new EasyCheckBox();
         _loc_3.label = param1;
         this.itemCheckArray[param2] = _loc_3;
         if(this.level.itemArray.indexOf(param2) != -1)
         {
            _loc_3.checked = true;
         }
         _loc_3.x = this.checkColumn * this.checkColumnWidth + this.checkX;
         _loc_3.y = this.checkRow * this.checkRowHeight + this.checkY;
         this.m.addChild(_loc_3);
         _loc_4 = this;
         _loc_5 = this.checkRow + 1;
         _loc_4.checkRow = _loc_5;
         if(this.checkRow > this.checkMaxRows)
         {
            this.checkRow = int(0);
            _loc_4 = this;
            _loc_5 = this.checkColumn + 1;
            _loc_4.checkColumn = _loc_5;
         }
      }
  save(): void {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_9= 0;
         var _loc_10= 0;
         var _loc_1= new Array();
         for (_loc_2 of $keys(this.itemCheckArray))
         {
            _loc_7 = this.itemCheckArray[_loc_2];
            if(_loc_7.checked)
            {
               _loc_1.push(_loc_2);
            }
         }
         this.level.itemArray = _loc_1;
      }
  constructor() {
         super();
         this.itemCheckArray = new Array();
         this.m = new LevelItemOptionsMenuGraphic();
         this.addGraphic(this.m);
         this.intrusive = false;
         this.level = (MapPage.instance);
         this.addItems();
         this.addQuickToggle();
         this.saveInterval = uint(setInterval($b(this, 'save'),500));
      }
}
$reg('com.jiggmin.pr3.editor.levelEditor.LevelItemOptionsMenu', LevelItemOptionsMenu);
