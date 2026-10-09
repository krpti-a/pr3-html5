// Ported from EasyText.as
import { TextClass } from '../ui/TextClass.ts';
import { $reg } from '../refs.ts';

export class EasyText extends TextClass {
  static __sym = 'EasyText';
  constructor() {
         super();
      }
}
$reg('EasyText', EasyText);
