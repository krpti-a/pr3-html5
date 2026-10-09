// Ported from com/jiggmin/pr3/items/PortableMine.as
import { PortableBlock } from './PortableBlock.ts';
import { $reg } from '../../refs.ts';

export class PortableMine extends PortableBlock {
  constructor() {
         super();
         this.itemKeyframeName = "portableMine";
         this.settings.id = 602;
         this.settings.pattern = ["0,0"];
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.PortableMine', PortableMine);
