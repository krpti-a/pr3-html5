// Ported from com/jiggmin/data/Stats.as
import { Event, Sprite, System, setInterval } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { Data, StatsGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Stats extends Sprite {
  frames: number = 0;
  lastMS: number = NaN;
  declare m: any;
  calcStats(): void {
         var _loc_1= Number(System.privateMemory / 1024 / 1024).toFixed(1) + "Mb";
         this.m.memBox.text = _loc_1;
         this.m.fpsBox.text = this.frames.toString();
         this.frames = int(0);
      }
  enterFrameHandler(event: Event): void {
         var _loc_2= this;
         var _loc_3= this.frames + 1;
         _loc_2.frames = _loc_3;
      }
  constructor() {
         super();
         this.m = new StatsGraphic();
         this.addChild(this.m);
         this.lastMS = Data.getMS();
         setInterval($b(this, 'calcStats'),1000);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.data.Stats', Stats);
