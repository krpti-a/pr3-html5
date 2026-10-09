// Ported from com/jiggmin/stateObject/StateObject.as
import { MovieClip } from '../../flash/index.ts';
import { Removable } from '../basic/Removable.ts';
import { Data } from '../refs.ts';
import { $reg } from '../refs.ts';

export class StateObject extends Removable {
  declare state: string;
  appendString: string = "Graphic";
  declare m: MovieClip;
  prependString: string = "";
  setState(param1: string): void {
         var _loc_2= null;
         if(param1 != this.state)
         {
            this.state = param1;
            if(this.m != null && this.m.parent != null)
            {
               this.m.parent.removeChild(this.m);
               if(this.m instanceof MovieClip)
               {
                  (this.m).stop();
               }
            }
            _loc_2 = param1.substr(0,1).toUpperCase() + param1.substr(1);
            this.m = (Data.stringToObject(this.prependString + _loc_2 + this.appendString));
            this.addChild(this.m);
         }
      }
  getState(): string {
         return this.state;
      }
  getM(): MovieClip {
         return this.m;
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.stateObject.StateObject', StateObject);
