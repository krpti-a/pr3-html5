// Ported from com/jiggmin/pr3/editor/blockEditor/BlockGeneratorSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockGeneratorSettingsUIGraphic, BlockManager, BlockPickerButton, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockGeneratorSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  declare currentOption: any;
  declare blockPickerButton: BlockPickerButton;
  generatorBlockID: number = 0;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.generatorDirection = this.m.generatingDirection.label;
         this.blockSettings.generatorFrequency = int(Number(this.m.generatingFrequency.text) * 1000);
         this.blockSettings.generatorBlockID = int(this.blockPickerButton.value.id);
      }
  prepareLabel(): void {
         this.m.generatingDirection.addOption("Up");
         this.m.generatingDirection.addOption("Down");
         this.m.generatingDirection.addOption("Left");
         this.m.generatingDirection.addOption("Right");
         this.m.generatingDirection.addOption("Self");
         this.m.generatingDirection.label = this.blockSettings.generatorDirection;
      }
  constructor(blockSettings: BlockSettings) {
         super();
         this.blockSettings = blockSettings;
         this.generatorBlockID = int(this.blockSettings.generatorBlockID);
         this.m = new BlockGeneratorSettingsUIGraphic();
         this.prepareLabel();
         this.m.generatingFrequency.maxChars = 5;
         this.m.generatingFrequency.restrict = "-0-9.";
         this.m.generatingFrequency.text = (this.blockSettings.generatorFrequency / 1000).toString();
         this.blockPickerButton = new BlockPickerButton();
         this.blockPickerButton.value = BlockManager.requestBlock(this.generatorBlockID);
         this.m.generatingBlock.addChild(this.blockPickerButton);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockGeneratorSettingsUI', BlockGeneratorSettingsUI);
