// Ported from EasyScroll.as
import { ScrollClass } from '../ui/ScrollClass.ts';
import { $reg } from '../refs.ts';

export class EasyScroll extends ScrollClass {
  static __sym = 'EasyScroll';
  constructor() {
         super();
      }
}
$reg('EasyScroll', EasyScroll);
