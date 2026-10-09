// Ported from com/jiggmin/pr3/stamp/StampSettings.as

import { $reg } from '../../refs.ts';

export class StampSettings {
  declare title: string;
  declare comment: string;
  declare category: string;
  declare art: string;
  temporary: boolean = false;
  drawing: boolean = false;
  classic: boolean = false;
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.stamp.StampSettings', StampSettings);
