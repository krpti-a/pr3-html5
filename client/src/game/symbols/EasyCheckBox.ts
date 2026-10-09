// Ported from EasyCheckBox.as
import { CheckBoxClass } from '../ui/CheckBoxClass.ts';
import { $reg } from '../refs.ts';

export class EasyCheckBox extends CheckBoxClass {
  static __sym = 'EasyCheckBox';
  constructor() {
         super();
      }
}
$reg('EasyCheckBox', EasyCheckBox);
