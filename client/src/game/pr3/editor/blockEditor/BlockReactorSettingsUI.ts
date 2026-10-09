// Ported from com/jiggmin/pr3/editor/blockEditor/BlockReactorSettingsUI.as
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockManager, BlockPickerButton, BlockReactorSettingsUIGraphic, BlockSettings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockReactorSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  declare blockPickerButton: BlockPickerButton;
  selectedBlockID: number = 0;
  remove(): void {
         this.save();
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         this.blockSettings.reactorID = int(this.blockPickerButton.value.id);
      }
  constructor(blockSettings: BlockSettings) {
         super();
         this.blockSettings = blockSettings;
         this.selectedBlockID = int(this.blockSettings.reactorID);
         this.m = new BlockReactorSettingsUIGraphic();
         this.blockPickerButton = new BlockPickerButton();
         this.blockPickerButton.value = BlockManager.requestBlock(this.selectedBlockID);
         this.m.reactingBlock.addChild(this.blockPickerButton);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockReactorSettingsUI', BlockReactorSettingsUI);
