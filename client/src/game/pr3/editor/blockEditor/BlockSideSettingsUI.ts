// Ported from com/jiggmin/pr3/editor/blockEditor/BlockSideSettingsUI.as
import { Event, Sprite } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { BlockEditorPage, BlockSideSettings, BlockSideSettingsUIGraphic, DropdownEvent, EasyDropdown, Item, Stats, Teleport } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockSideSettingsUI extends Sprite {
  declare m: any;
  selectOptionHandler(event: DropdownEvent): void {
         this.save();
      }
  remove(): void {
         this.save();
         this.m.topDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m.bottomDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m.leftDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m.rightDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m.bumpDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m = null;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  save(): void {
         var _loc_1= BlockEditorPage.blockSettings;
         _loc_1.top.type = this.m.topDropdown.selectedOption.data;
         _loc_1.bottom.type = this.m.bottomDropdown.selectedOption.data;
         _loc_1.left.type = this.m.leftDropdown.selectedOption.data;
         _loc_1.right.type = this.m.rightDropdown.selectedOption.data;
         _loc_1.bump.type = this.m.bumpDropdown.selectedOption.data;
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  addOptions(param1: EasyDropdown): void {
         param1.addOption("Active",BlockSideSettings.ACTIVE);
         param1.addOption("Inactive",BlockSideSettings.INACTIVE);
         param1.addOption("Be Pushed",BlockSideSettings.BE_PUSHED);
         param1.addOption("Bounce",BlockSideSettings.BOUNCE);
         param1.addOption("Button",BlockSideSettings.BUTTON);
         param1.addOption("Checkpoint",BlockSideSettings.CHECKPOINT);
         param1.addOption("Crumble",BlockSideSettings.CRUMBLE);
         param1.addOption("Code",BlockSideSettings.CODE);
         param1.addOption("Custom Stats",BlockSideSettings.C_STATS);
         param1.addOption("Dec Stats",BlockSideSettings.DEC_STATS);
         param1.addOption("Dispense",BlockSideSettings.DISPENSE);
         param1.addOption("Explode",BlockSideSettings.EXPLODE);
         param1.addOption("Finish",BlockSideSettings.FINISH);
         param1.addOption("Give Item",BlockSideSettings.GIVE_ITEM);
         param1.addOption("Give Custom Item",BlockSideSettings.C_ITEM);
         param1.addOption("Glass",BlockSideSettings.GLASS);
         param1.addOption("Hurt",BlockSideSettings.HURT);
         param1.addOption("Ice",BlockSideSettings.ICE);
         param1.addOption("Inc Health",BlockSideSettings.INC_HEALTH);
         param1.addOption("Inc Stats",BlockSideSettings.INC_STATS);
         param1.addOption("Lua",BlockSideSettings.LUA);
         param1.addOption("Push Down",BlockSideSettings.PUSH_DOWN);
         param1.addOption("Push Left",BlockSideSettings.PUSH_LEFT);
         param1.addOption("Push Right",BlockSideSettings.PUSH_RIGHT);
         param1.addOption("Push Up",BlockSideSettings.PUSH_UP);
         param1.addOption("Reflector",BlockSideSettings.REFLECT);
         param1.addOption("Rotate Left",BlockSideSettings.ROTATE_LEFT);
         param1.addOption("Rotate Right",BlockSideSettings.ROTATE_RIGHT);
         param1.addOption("Safety",BlockSideSettings.SAFETY);
         param1.addOption("Shatter",BlockSideSettings.SHATTER);
         param1.addOption("Teleport",BlockSideSettings.TELEPORT);
         param1.addOption("Vanish",BlockSideSettings.VANISH);
      }
  constructor() {
         super();
         this.m = new BlockSideSettingsUIGraphic();
         this.addOptions(this.m.topDropdown);
         this.addOptions(this.m.bottomDropdown);
         this.addOptions(this.m.leftDropdown);
         this.addOptions(this.m.rightDropdown);
         this.addOptions(this.m.bumpDropdown);
         var _loc_1= BlockEditorPage.blockSettings;
         this.m.topDropdown.selectOptionData(_loc_1.top.type);
         this.m.bottomDropdown.selectOptionData(_loc_1.bottom.type);
         this.m.leftDropdown.selectOptionData(_loc_1.left.type);
         this.m.rightDropdown.selectOptionData(_loc_1.right.type);
         this.m.bumpDropdown.selectOptionData(_loc_1.bump.type);
         this.m.topDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.m.bottomDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.m.leftDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.m.rightDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.m.bumpDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockSideSettingsUI', BlockSideSettingsUI);
