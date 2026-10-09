// Ported from SlimInput.as
import { InputFieldClass } from '../ui/InputFieldClass.ts';
import { $reg } from '../refs.ts';

export class SlimInput extends InputFieldClass {
  static __sym = 'SlimInput';
  constructor() {
         super();
      }
}
$reg('SlimInput', SlimInput);
