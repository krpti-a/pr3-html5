// Ported from EasyDropdown.as
import { DropdownClass } from '../ui/DropdownClass.ts';
import { $reg } from '../refs.ts';

export class EasyDropdown extends DropdownClass {
  static __sym = 'EasyDropdown';
  constructor() {
         super();
      }
}
$reg('EasyDropdown', EasyDropdown);
