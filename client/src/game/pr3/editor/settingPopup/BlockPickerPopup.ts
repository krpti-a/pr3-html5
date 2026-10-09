// Ported from com/jiggmin/pr3/editor/settingPopup/BlockPickerPopup.as
import { Event } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { PickerPopup } from './PickerPopup.ts';
import { Block, BlockManager, MyBlockSelector, SelectorEvent, Tab, Tabs } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockPickerPopup extends PickerPopup {
  declare static myBlocks: any[];
  declare blockArray: any[];
  declare blockRequestArray: any[];
  declare customBlockSelector: MyBlockSelector;
  declare tabs: Tabs;
  clickIndustrial(): void {
         this.addBlocks(BlockManager.blockArrays["metal"]);
      }
  addBlock(param1: Block): void {
         this.addButton(param1,param1,param1.vars.title + "\n" + param1.vars.comment);
      }
  clickJungle(): void {
         this.addBlocks(BlockManager.blockArrays["jungle"]);
      }
  removeCustomBlockSelector(): void {
         if(this.customBlockSelector != null)
         {
            this.customBlockSelector.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectCustomBlockHandler'));
            this.customBlockSelector.removeEventListener("redraw",$b(this, 'selectorRedrawHandler'));
            this.customBlockSelector.remove();
            this.customBlockSelector = null;
         }
      }
  addBlocks(param1: any[]): void {
         var _loc_2= null;
         this.removeCustomBlockSelector();
         this.removeButtons();
         this.blockArray = param1;
         for (_loc_2 of $each(param1))
         {
            this.addBlock(_loc_2.clone());
         }
      }
  clickClassic(): void {
         this.addBlocks(BlockManager.blockArrays["classic"]);
      }
  remove(): void {
         this.removeCustomBlockSelector();
         this.tabs.remove();
         this.tabs = null;
         this.blockArray = null;
         super.remove();
      }
  clickSpace(): void {
         this.addBlocks(BlockManager.blockArrays["space"]);
      }
  clickWater(): void {
         this.addBlocks(BlockManager.blockArrays["water"]);
      }
  selectCustomBlockHandler(event: SelectorEvent): void {
         var _loc_2= event.data;
         this.value = BlockManager.requestBlock(_loc_2);
         if(this.removeOnPick)
         {
            this.remove();
         }
         else if(this.customBlockSelector != null)
         {
            this.customBlockSelector.deselect();
         }
      }
  selectorRedrawHandler(event: Event): void {
         this.redraw();
      }
  clickCustom(): void {
         this.removeButtons();
         this.removeCustomBlockSelector();
         this.customBlockSelector = new MyBlockSelector(40,true);
         this.customBlockSelector.y = this.startY;
         this.customBlockSelector.setWidth(400);
         this.customBlockSelector.setHeight(100);
         this.customBlockSelector.columns = int(10);
         this.customBlockSelector.addEventListener(SelectorEvent.SELECT,$b(this, 'selectCustomBlockHandler'),false,0,true);
         this.customBlockSelector.addEventListener("redraw",$b(this, 'selectorRedrawHandler'),false,0,true);
         this.customBlockSelector.redraw();
         this.addGraphic(this.customBlockSelector);
      }
  clickDesert(): void {
         this.addBlocks(BlockManager.blockArrays["desert"]);
      }
  constructor() {
         super();
         this.blockArray = new Array();
         this.blockRequestArray = new Array();
         this.columns = int(10);
         this.startY = int(25);
         var _loc_1= new Tab($b(this, 'clickClassic'),"Classic");
         var _loc_2= new Tab($b(this, 'clickDesert'),"Desert");
         var _loc_3= new Tab($b(this, 'clickIndustrial'),"Industrial");
         var _loc_4= new Tab($b(this, 'clickJungle'),"Jungle");
         var _loc_5= new Tab($b(this, 'clickWater'),"Underwater");
         var _loc_6= new Tab($b(this, 'clickSpace'),"Space");
         var _loc_7= new Tab($b(this, 'clickCustom'),"Custom");
         var _loc_8= new Array(_loc_1,_loc_2,_loc_3,_loc_4,_loc_5,_loc_6,_loc_7);
         this.tabs = new Tabs(_loc_8,0,400,"blockSelector");
         this.addGraphic(this.tabs);
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.BlockPickerPopup', BlockPickerPopup);
