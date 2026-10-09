// Ported from com/jiggmin/pr3/editor/blockEditor/BlockSettingsPopup.as
import { Event } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Popup } from '../../../popup/Popup.ts';
import { BlockAdvancedSettingsUI, BlockArrowSettingsUI, BlockBounceSettingsUI, BlockChangeSettingsUI, BlockChkpointSettingsUI, BlockCodeSettingsUI, BlockCrumbleSettingsUI, BlockCustomItemSettingsUI, BlockDispenseSettingsUI, BlockEditorPage, BlockGeneratorSettingsUI, BlockGlassSettingsUI, BlockItemSettingsUI, BlockMoveSettingsUI, BlockReactorSettingsUI, BlockReflectSettingsUI, BlockRotateSettingsUI, BlockSettings, BlockSettingsPopupGraphic, BlockSettingsSelector, BlockSideSettings, BlockSideSettingsUI, BlockStatSettingsUI, BlockTeleportSettingsUI, BlockVanishSettingsUI, BlockWaterSettingsUI, DropdownEvent, EditorPopupBGGraphic, Item, Removable, Settings, Teleport } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockSettingsPopup extends Popup {
  declare static instance: BlockSettingsPopup;
  declare m: any;
  declare moreOptions: BlockSideSettingsUI;
  declare selector: BlockSettingsSelector;
  declare moveOptions: BlockMoveSettingsUI;
  declare startOptions: BlockCodeSettingsUI;
  declare inactiveLuaOptions: BlockCodeSettingsUI;
  declare waterLuaOptions: BlockCodeSettingsUI;
  declare waterOptions: BlockWaterSettingsUI;
  declare changeOptions: BlockChangeSettingsUI;
  declare reactorOptions: BlockReactorSettingsUI;
  declare generatorOptions: BlockGeneratorSettingsUI;
  declare advancedOptions: BlockAdvancedSettingsUI;
  declare moreOptionsItems: any;
  remove(): void {
         this.removeMoreOptions();
         this.removeMoveOptions();
         this.removeChangeOptions();
         this.removeReactorOptions();
         this.removeStartOptions();
         this.removeInactiveLuaOptions();
         this.removeWaterLuaOptions();
         this.removeWaterOptions();
         this.removeGeneratorOptions();
         this.removeAdvancedOptions();
         this.m.typeDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectTypeHandler'));
         this.m = null;
         BlockSettingsPopup.instance = null;
         super.remove();
      }
  addMoreOptions(): void {
         if(this.selector == null)
         {
            this.selector = new BlockSettingsSelector();
         }
         if(this.moreOptions == null)
         {
            this.moreOptions = new BlockSideSettingsUI();
            this.moreOptions.y = 70;
            this.moreOptions.addEventListener(Event.CHANGE,$b(this, 'moreOptionsChangeHandler'),false,0,true);
            this.m.addChildAt(this.moreOptions,0);
            this.moreOptionsChangeHandler();
         }
         this.redraw();
      }
  removeMoreOptions(): void {
         var item: Removable= null;
         if(this.selector != null)
         {
            if(this.m.contains(this.selector))
            {
               this.m.removeChild(this.selector);
            }
            for (item of $each(this.moreOptionsItems))
            {
               item.remove();
            }
            this.moreOptionsItems = ({} as any);
            this.selector.remove();
            this.selector = null;
         }
         if(this.moreOptions != null)
         {
            this.moreOptions.removeEventListener(Event.CHANGE,$b(this, 'moreOptionsChangeHandler'));
            this.moreOptions.remove();
            this.moreOptions = null;
         }
         this.redraw();
      }
  addStartOptions(): void {
         if(this.startOptions == null)
         {
            this.startOptions = new BlockCodeSettingsUI(BlockEditorPage.blockSettings,"none","code");
            this.startOptions.y = 70;
            this.m.addChildAt(this.startOptions,0);
         }
         this.redraw();
      }
  removeStartOptions(): void {
         if(this.startOptions != null)
         {
            this.startOptions.remove();
            this.startOptions = null;
         }
         this.redraw();
      }
  addInactiveLuaOptions(): void {
         if(this.inactiveLuaOptions == null)
         {
            this.inactiveLuaOptions = new BlockCodeSettingsUI(BlockEditorPage.blockSettings,"inside","lua");
            this.inactiveLuaOptions.y = 70;
            this.m.addChildAt(this.inactiveLuaOptions,0);
         }
         this.redraw();
      }
  removeInactiveLuaOptions(): void {
         if(this.inactiveLuaOptions != null)
         {
            this.inactiveLuaOptions.remove();
            this.inactiveLuaOptions = null;
         }
         this.redraw();
      }
  addWaterLuaOptions(): void {
         if(this.waterLuaOptions == null)
         {
            this.waterLuaOptions = new BlockCodeSettingsUI(BlockEditorPage.blockSettings,"inside","lua");
            this.waterLuaOptions.y = 70;
            this.m.addChildAt(this.waterLuaOptions,0);
         }
         this.redraw();
      }
  removeWaterLuaOptions(): void {
         if(this.waterLuaOptions != null)
         {
            this.waterLuaOptions.remove();
            this.waterLuaOptions = null;
         }
         this.redraw();
      }
  addWaterOptions(): void {
         if(this.waterOptions == null)
         {
            this.waterOptions = new BlockWaterSettingsUI(BlockEditorPage.blockSettings);
            this.waterOptions.y = 70;
         }
         this.redraw();
      }
  removeWaterOptions(): void {
         if(this.waterOptions != null)
         {
            this.waterOptions.remove();
            this.waterOptions = null;
         }
         this.redraw();
      }
  addGeneratorOptions(): void {
         if(this.generatorOptions == null)
         {
            this.generatorOptions = new BlockGeneratorSettingsUI(BlockEditorPage.blockSettings);
            this.generatorOptions.y = 70;
            this.m.addChildAt(this.generatorOptions,0);
         }
         this.redraw();
      }
  removeGeneratorOptions(): void {
         if(this.generatorOptions != null)
         {
            this.generatorOptions.remove();
            this.generatorOptions = null;
         }
         this.redraw();
      }
  addChangeOptions(): void {
         if(this.changeOptions == null)
         {
            this.changeOptions = new BlockChangeSettingsUI(BlockEditorPage.blockSettings);
            this.changeOptions.y = 70;
            this.m.addChildAt(this.changeOptions,0);
         }
         this.redraw();
      }
  removeMoveOptions(): void {
         if(this.moveOptions != null)
         {
            this.moveOptions.remove();
            this.moveOptions = null;
         }
         this.redraw();
      }
  addReactorOptions(): void {
         if(this.reactorOptions == null)
         {
            this.reactorOptions = new BlockReactorSettingsUI(BlockEditorPage.blockSettings);
            this.reactorOptions.y = 70;
            this.m.addChildAt(this.reactorOptions,0);
         }
         this.redraw();
      }
  addMoreOption(name: string, itemSettings: Removable): void {
         if(this.moreOptionsItems[name] == null)
         {
            this.moreOptionsItems[name] = itemSettings;
            this.selector.addDropdownOption(name);
         }
      }
  removeMoreOption(name: string): void {
         if(this.moreOptionsItems[name] != null)
         {
            delete this.moreOptionsItems[name];
            this.selector.removeDropdownOption(name);
         }
      }
  getMoreOption(name: string): Removable {
         return this.moreOptionsItems[name];
      }
  moreOptionsChangeHandler(event: Event = null): void {
         var side: string= null;
         var showMoreOptions: boolean= false;
         var item: Removable= null;
         var itemSettings: BlockItemSettingsUI= null;
         var glassSettings: BlockGlassSettingsUI= null;
         var reflectSettings: BlockReflectSettingsUI= null;
         var vanishSettings: BlockVanishSettingsUI= null;
         var bounceSettings: BlockBounceSettingsUI= null;
         var teleportSettings: BlockTeleportSettingsUI= null;
         var arrowSettings: BlockArrowSettingsUI= null;
         var crumbleSettings: BlockCrumbleSettingsUI= null;
         var dispenseSettings: BlockDispenseSettingsUI= null;
         var rotationSettings: BlockRotateSettingsUI= null;
         var checkpointSettings: BlockChkpointSettingsUI= null;
         var statSettings: BlockStatSettingsUI= null;
         var customItemSettings: BlockCustomItemSettingsUI= null;
         var codeSettings: BlockCodeSettingsUI= null;
         if(BlockEditorPage.blockSettings.canGiveItem())
         {
            itemSettings = new BlockItemSettingsUI(BlockEditorPage.blockSettings);
            itemSettings.y = 30;
            this.addMoreOption("Item Options",itemSettings);
         }
         else
         {
            this.removeMoreOption("Item Options");
         }
         if(BlockEditorPage.blockSettings.isGlass())
         {
            glassSettings = new BlockGlassSettingsUI(BlockEditorPage.blockSettings);
            glassSettings.y = 30;
            this.addMoreOption("Glass Options",glassSettings);
         }
         else
         {
            this.removeMoreOption("Glass Options");
         }
         if(BlockEditorPage.blockSettings.isReflector())
         {
            reflectSettings = new BlockReflectSettingsUI(BlockEditorPage.blockSettings);
            reflectSettings.y = 30;
            this.addMoreOption("Reflect Options",reflectSettings);
         }
         else
         {
            this.removeMoreOption("Reflect Options");
         }
         if(BlockEditorPage.blockSettings.isVanish())
         {
            vanishSettings = new BlockVanishSettingsUI(BlockEditorPage.blockSettings);
            vanishSettings.y = 30;
            this.addMoreOption("Vanish Options",vanishSettings);
         }
         else
         {
            this.removeMoreOption("Vanish Options");
         }
         if(BlockEditorPage.blockSettings.isBounce())
         {
            bounceSettings = new BlockBounceSettingsUI(BlockEditorPage.blockSettings);
            bounceSettings.y = 30;
            this.addMoreOption("Bounce Options",bounceSettings);
         }
         else
         {
            this.removeMoreOption("Bounce Options");
         }
         if(BlockEditorPage.blockSettings.isTeleport())
         {
            teleportSettings = new BlockTeleportSettingsUI(BlockEditorPage.blockSettings);
            teleportSettings.y = 30;
            this.addMoreOption("Teleport Options",teleportSettings);
         }
         else
         {
            this.removeMoreOption("Teleport Options");
         }
         if(BlockEditorPage.blockSettings.isArrow())
         {
            arrowSettings = new BlockArrowSettingsUI(BlockEditorPage.blockSettings);
            arrowSettings.y = 30;
            this.addMoreOption("Arrow Options",arrowSettings);
         }
         else
         {
            this.removeMoreOption("Arrow Options");
         }
         if(BlockEditorPage.blockSettings.isCrumble())
         {
            crumbleSettings = new BlockCrumbleSettingsUI(BlockEditorPage.blockSettings);
            crumbleSettings.y = 30;
            this.addMoreOption("Crumble Options",crumbleSettings);
         }
         else
         {
            this.removeMoreOption("Crumble Options");
         }
         if(BlockEditorPage.blockSettings.isDispense())
         {
            dispenseSettings = new BlockDispenseSettingsUI(BlockEditorPage.blockSettings);
            dispenseSettings.y = 30;
            this.addMoreOption("Dispense Options",dispenseSettings);
         }
         else
         {
            this.removeMoreOption("Dispense Options");
         }
         if(BlockEditorPage.blockSettings.isRotate())
         {
            rotationSettings = new BlockRotateSettingsUI(BlockEditorPage.blockSettings);
            rotationSettings.y = 30;
            this.addMoreOption("Rotation Settings",rotationSettings);
         }
         else
         {
            this.removeMoreOption("Rotation Settings");
         }
         if(BlockEditorPage.blockSettings.isChkpoint())
         {
            checkpointSettings = new BlockChkpointSettingsUI(BlockEditorPage.blockSettings);
            checkpointSettings.x = 35;
            checkpointSettings.y = 40;
            this.addMoreOption("Checkpoint Options",checkpointSettings);
         }
         else
         {
            this.removeMoreOption("Checkpoint Options");
         }
         if(BlockEditorPage.blockSettings.isStat())
         {
            statSettings = new BlockStatSettingsUI(BlockEditorPage.blockSettings);
            statSettings.x = 85;
            statSettings.y = 90;
            this.addMoreOption("Stat Options",statSettings);
         }
         else
         {
            this.removeMoreOption("Stat Options");
         }
         if(BlockEditorPage.blockSettings.isCustomItem())
         {
            customItemSettings = new BlockCustomItemSettingsUI(BlockEditorPage.blockSettings);
            customItemSettings.x = 0;
            customItemSettings.y = 40;
            this.addMoreOption("Custom Item Options",customItemSettings);
         }
         else
         {
            this.removeMoreOption("Custom Item Options");
         }
         var sides: any[]= new Array("left","right","top","bottom","bump");
         for (side of $each(sides))
         {
            if(BlockEditorPage.blockSettings[side].type == BlockSideSettings.CODE || BlockEditorPage.blockSettings[side].type == BlockSideSettings.LUA)
            {
               codeSettings = new BlockCodeSettingsUI(BlockEditorPage.blockSettings,side,BlockEditorPage.blockSettings[side].type);
               codeSettings.y = 30;
               this.addMoreOption("Code Options: " + side,codeSettings);
            }
            else
            {
               this.removeMoreOption("Code Options: " + side);
            }
         }
         showMoreOptions = false;
         for (item of $each(this.moreOptionsItems))
         {
            if(item != null)
            {
               showMoreOptions = true;
               break;
            }
         }
         if(showMoreOptions)
         {
            if(this.selector != null && !this.m.contains(this.selector))
            {
               this.m.addChildAt(this.selector,1);
               this.redraw();
            }
         }
         else if(this.selector != null && Boolean(this.m.contains(this.selector)))
         {
            this.m.removeChild(this.selector);
            this.redraw();
         }
      }
  selectTypeHandler(event: DropdownEvent): void {
         BlockEditorPage.blockSettings.type = event.option.data;
         if(event.option.data == BlockSettings.ACTIVE || event.option.data == BlockSettings.MOVE || event.option.data == BlockSettings.IMPERVIOUS || event.option.data == BlockSettings.WEAK)
         {
            this.addMoreOptions();
            this.moreOptionsChangeHandler();
         }
         else
         {
            this.removeMoreOptions();
         }
         if(event.option.data == BlockSettings.MOVE)
         {
            this.addMoveOptions();
         }
         else
         {
            this.removeMoveOptions();
         }
         if(event.option.data == BlockSettings.START)
         {
            this.addStartOptions();
         }
         else
         {
            this.removeStartOptions();
         }
         if(event.option.data == BlockSettings.WATER)
         {
            this.addWaterOptions();
         }
         else
         {
            this.removeWaterOptions();
         }
         if(event.option.data == BlockSettings.INACTIVE_LUA)
         {
            this.addInactiveLuaOptions();
         }
         else
         {
            this.removeInactiveLuaOptions();
         }
         if(event.option.data == BlockSettings.WATER_LUA)
         {
            this.addWaterLuaOptions();
         }
         else
         {
            this.removeWaterLuaOptions();
         }
         if(event.option.data == BlockSettings.CHANGE)
         {
            this.removeAdvancedOptions();
            this.addChangeOptions();
         }
         else
         {
            this.removeChangeOptions();
            this.addAdvancedOptions();
         }
         if(event.option.data == BlockSettings.GENERATOR)
         {
            this.addGeneratorOptions();
         }
         else
         {
            this.removeGeneratorOptions();
         }
         if(event.option.data == BlockSettings.REACTOR)
         {
            this.addReactorOptions();
         }
         else
         {
            this.removeReactorOptions();
         }
         if(this.advancedOptions != null)
         {
            this.removeAdvancedOptions();
            this.addAdvancedOptions();
            this.advancedOptions.y = this.bg.height - this.advancedOptions.height - 10;
         }
      }
  redraw(): void {
         super.redraw();
         this.y = -2;
         this.x = 5;
         if(this.moveOptions != null)
         {
            this.bg.height = 470;
         }
         else if(this.moreOptions != null)
         {
            if(BlockEditorPage.blockSettings.isCustomItem())
            {
               this.bg.height = 400;
            }
            else if(this.advancedOptions != null)
            {
               this.bg.height = 270;
            }
            else
            {
               this.bg.height = 235;
            }
         }
         else if(this.changeOptions != null)
         {
            this.bg.height = 265;
         }
         else if(this.reactorOptions != null)
         {
            this.bg.height = this.reactorOptions.height + 110;
         }
         else if(this.startOptions != null)
         {
            this.bg.height = 390;
         }
         else if(this.inactiveLuaOptions != null)
         {
            this.bg.height = 390;
         }
         else if(this.waterLuaOptions != null)
         {
            this.bg.height = 390;
         }
         else if(this.waterOptions != null)
         {
            this.bg.height = 113;
         }
         else if(this.generatorOptions != null)
         {
            this.bg.height = this.generatorOptions.height + 110;
         }
         else
         {
            this.bg.height = 113;
         }
         this.bg.y = 9;
      }
  removeChangeOptions(): void {
         if(this.changeOptions != null)
         {
            this.changeOptions.remove();
            this.changeOptions = null;
         }
         this.redraw();
      }
  removeReactorOptions(): void {
         if(this.reactorOptions != null)
         {
            this.reactorOptions.remove();
            this.reactorOptions = null;
         }
         this.redraw();
      }
  addMoveOptions(): void {
         if(this.moveOptions == null)
         {
            this.moveOptions = new BlockMoveSettingsUI(BlockEditorPage.blockSettings);
            this.moveOptions.y = 230;
            this.m.addChildAt(this.moveOptions,0);
         }
         this.redraw();
      }
  addAdvancedOptions(param1: number = 0): void {
    param1 = int(param1);
         if(this.advancedOptions == null)
         {
            this.advancedOptions = new BlockAdvancedSettingsUI(BlockEditorPage.blockSettings);
            this.advancedOptions.y = this.bg.height;
            this.advancedOptions.x = param1;
            this.m.addChildAt(this.advancedOptions,0);
         }
         this.redraw();
      }
  removeAdvancedOptions(): void {
         if(this.advancedOptions != null)
         {
            this.advancedOptions.remove();
            this.advancedOptions = null;
         }
         this.redraw();
      }
  save(): void {
         var item: Removable= null;
         if(this.moreOptions != null)
         {
            this.moreOptions.save();
         }
         if(this.moveOptions != null)
         {
            this.moveOptions.save();
         }
         if(this.startOptions != null)
         {
            this.startOptions.save();
         }
         if(this.inactiveLuaOptions != null)
         {
            this.inactiveLuaOptions.save();
         }
         if(this.waterLuaOptions != null)
         {
            this.waterLuaOptions.save();
         }
         if(this.waterOptions != null)
         {
            this.waterOptions.save();
         }
         if(this.generatorOptions != null)
         {
            this.generatorOptions.save();
         }
         if(this.changeOptions != null)
         {
            this.changeOptions.save();
         }
         if(this.reactorOptions != null)
         {
            this.reactorOptions.save();
         }
         if(this.advancedOptions != null)
         {
            this.advancedOptions.save();
         }
         for (item of $each(this.moreOptionsItems))
         {
            item.save();
         }
      }
  constructor() {
         super();
         this.m = new BlockSettingsPopupGraphic();
         this.moreOptionsItems = ({} as any);
         this.setBG(new EditorPopupBGGraphic());
         this.intrusive = false;
         BlockSettingsPopup.instance = this;
         this.addGraphic(this.m);
         this.m.typeDropdown.addOption("Active",BlockSettings.ACTIVE);
         this.m.typeDropdown.addOption("Inactive",BlockSettings.INACTIVE);
         this.m.typeDropdown.addOption("Impervious",BlockSettings.IMPERVIOUS);
         this.m.typeDropdown.addOption("Start Position",BlockSettings.START);
         this.m.typeDropdown.addOption("Water",BlockSettings.WATER);
         this.m.typeDropdown.addOption("Move",BlockSettings.MOVE);
         this.m.typeDropdown.addOption("Change",BlockSettings.CHANGE);
         this.m.typeDropdown.addOption("Weak",BlockSettings.WEAK);
         this.m.typeDropdown.addOption("Reactor",BlockSettings.REACTOR);
         this.m.typeDropdown.addOption("Generator",BlockSettings.GENERATOR);
         this.m.typeDropdown.addOption("Lua Inactive",BlockSettings.INACTIVE_LUA);
         this.m.typeDropdown.addOption("Lua Water",BlockSettings.WATER_LUA);
         this.m.typeDropdown.maxHeight = 250;
         this.m.typeDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectTypeHandler'),false,0,true);
         this.m.typeDropdown.selectOptionData(BlockEditorPage.blockSettings.type);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockSettingsPopup', BlockSettingsPopup);
