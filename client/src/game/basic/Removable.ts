// Ported from com/jiggmin/basic/Removable.as
import { Event, MovieClip } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class Removable extends MovieClip {
  static REMOVE: string = "remove";
  removed: boolean = false;
  removeFromParent: boolean = true;
  remove(): void {
         this.stop();
         if(this.removeFromParent)
         {
            if(this.parent != null)
            {
               this.parent.removeChild(this);
            }
         }
         if(!this.removed)
         {
            this.removed = true;
            this.dispatchEvent(new Event(Removable.REMOVE));
         }
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.basic.Removable', Removable);
