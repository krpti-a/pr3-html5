// Ported from com/jiggmin/pr3/editor/blockEditor/BlockItemSettingsUI.as
import { int, $keys, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Block, BlockItemSettingsUIGraphic, BlockSettings, Bow, Buzzsaw, EasyButton, EasyCheckBox, Grenade, Heart, Items, Lightning, Napalm, Retreater, Shield, Snowball, Sword, Teleport } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockItemSettingsUI extends Removable {
  checkRow: number = 0;
  checkColumnWidth: number = 130;
  declare m: any;
  declare blockSettings: BlockSettings;
  checkY: number = 40;
  checkMaxRows: number = 9;
  declare checkBoxArray: any[];
  checkRowHeight: number = 15;
  checkColumn: number = 0;
  checkX: number = 0;
  checkStatus: boolean = false;
  declare toggleButton: EasyButton;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         this.checkBoxArray = null;
         super.remove();
      }
  addItem(param1: string, param2: string): void {
         var _loc_3: EasyCheckBox= null;
         _loc_3 = new EasyCheckBox();
         _loc_3.label = param1;
         if(this.blockSettings.itemArray.indexOf(param2) != -1)
         {
            _loc_3.checked = true;
         }
         _loc_3.x = this.checkColumn * this.checkColumnWidth + this.checkX;
         _loc_3.y = this.checkRow * this.checkRowHeight + this.checkY;
         this.m.addChild(_loc_3);
         ++this.checkRow;
         if(this.checkRow > this.checkMaxRows)
         {
            this.checkRow = int(0);
            ++this.checkColumn;
         }
         this.checkBoxArray[param2] = _loc_3;
      }
  addQuickToggle(): void {
         this.toggleButton = new EasyButton();
         this.toggleButton.label = "Disable All Items";
         this.toggleButton.setFunc($b(this, 'toggleAll'));
         this.toggleButton.x = this.m.width - this.toggleButton.width - 5;
         this.toggleButton.y = this.m.height;
         this.toggleButton.setFunc($b(this, 'toggleAll'));
         this.m.addChild(this.toggleButton);
      }
  toggleAll(): void {
         for(var index: number = int(0); index < this.m.numChildren; index++)
         {
            if(this.m.getChildAt(index) instanceof EasyCheckBox && this.m.getChildAt(index).textBox.text != "Predictable")
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
  save(): void {
         var _loc_2= undefined;
         var _loc_3= null;
         var _loc_1= new Array();
         for (_loc_2 of $keys(this.checkBoxArray))
         {
            _loc_3 = this.checkBoxArray[_loc_2];
            if(_loc_3.checked)
            {
               _loc_1.push(_loc_2);
            }
         }
         this.blockSettings.itemArray = _loc_1;
         this.blockSettings.itemSupply = int(Number(this.m.supplyBox.text));
         this.blockSettings.predictableItems = Boolean(this.m.setPredictableItems.checked);
      }
  constructor(param1: BlockSettings) {
         super();
         this.checkBoxArray = new Array();
         this.blockSettings = param1;
         this.m = new BlockItemSettingsUIGraphic();
         this.m.supplyBox.restrict = "0-9";
         this.m.supplyBox.maxChars = 5;
         this.m.supplyBox.text = param1.itemSupply.toString();
         this.m.setPredictableItems.textBox.text = "Predictable";
         this.m.setPredictableItems.checked = Boolean(param1.predictableItems);
         this.addChild(this.m);
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
         this.addQuickToggle();
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockItemSettingsUI', BlockItemSettingsUI);
