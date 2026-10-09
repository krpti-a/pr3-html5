// Ported from EasySlider.as
import { SliderClass } from '../ui/SliderClass.ts';
import { $reg } from '../refs.ts';

export class EasySlider extends SliderClass {
  static __sym = 'EasySlider';
  constructor() {
         super();
      }
}
$reg('EasySlider', EasySlider);
