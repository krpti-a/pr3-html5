// Ported from EasyCodeInput.as
import { EasyInput } from './EasyInput.ts';
import { $reg } from '../refs.ts';

export class EasyCodeInput extends EasyInput {
  static __sym = 'EasyCodeInput';
  constructor() {
         super();
      }
}
$reg('EasyCodeInput', EasyCodeInput);
