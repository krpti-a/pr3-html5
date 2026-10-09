// Ported from EasyProgressBar.as
import { ProgressBarClass } from '../ui/ProgressBarClass.ts';
import { $reg } from '../refs.ts';

export class EasyProgressBar extends ProgressBarClass {
  static __sym = 'EasyProgressBar';
  constructor() {
         super();
      }
}
$reg('EasyProgressBar', EasyProgressBar);
