// Ported from com/jiggmin/pr3/editor/blockEditor/BlockSettingsSelector.as
import { $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { BlockSettingsPopup, DropdownEvent, EasyDropdown } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockSettingsSelector extends Removable {
  declare settingsDropdown: EasyDropdown;
  declare currentOption: Removable;
  addDropdownOption(name: string): void {
         this.settingsDropdown.addOption(name);
         this.settingsDropdown.selectOptionLabel(name);
      }
  removeDropdownOption(name: string): void {
         this.settingsDropdown.removeOptionByLabel(name);
      }
  selectTypeHandler(event: DropdownEvent): void {
         if(this.currentOption != null)
         {
            this.removeChild(this.currentOption);
         }
         this.addChildAt(this.currentOption = BlockSettingsPopup.instance.getMoreOption(event.label),0);
      }
  constructor() {
         super();
         this.settingsDropdown = new EasyDropdown();
         this.settingsDropdown.maxHeight = 200;
         this.settingsDropdown.width = 200;
         this.settingsDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectTypeHandler'),false,0,true);
         this.x = 265;
         this.y = 5;
         this.addChild(this.settingsDropdown);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockSettingsSelector', BlockSettingsSelector);
