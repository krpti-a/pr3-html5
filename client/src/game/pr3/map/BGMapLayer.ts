// Ported from com/jiggmin/pr3/map/BGMapLayer.as
import { ColorTransform, DisplayObject, MovieClip } from '../../../flash/index.ts';
import { MapLayer } from './MapLayer.ts';
import { BG0, Data } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BGMapLayer extends MapLayer {
  declare bg: DisplayObject;
  declare bgImage: string;
  setBGImage(param1: string): void {
         var str= param1;
         this.bgImage = str;
         this.removeBG();
         try
         {
            this.bg = (Data.stringToObject(this.bgImage));
         }
         catch (e)
         {
            this.bgImage = "BG0";
            this.bg = (Data.stringToObject(this.bgImage));
         }
         this.addChild(this.bg);
         this.calcColor();
      }
  removeBG(): void {
         if(this.bg != null)
         {
            if(this.bg instanceof MovieClip)
            {
               (this.bg).stop();
            }
            if(this.bg.parent != null)
            {
               this.bg.parent.removeChild(this.bg);
            }
            this.bg = null;
         }
      }
  remove(): void {
         this.removeBG();
         super.remove();
      }
  calcColor(): void {
         var _loc_1= null;
         if(this.bgImage == "BGNone")
         {
            _loc_1 = new ColorTransform();
            _loc_1.color = this.bgColor;
            this.transform.colorTransform = _loc_1;
         }
         else
         {
            super.calcColor();
         }
      }
  constructor() {
         super();
         this.depth = 0;
      }
}
$reg('com.jiggmin.pr3.map.BGMapLayer', BGMapLayer);
