// Ported from com/jiggmin/popup/ToolTipPopup.as
import { DisplayObject, Event } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { TextPopup } from './TextPopup.ts';
import { Maths } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ToolTipPopup extends TextPopup {
  declare target: DisplayObject;
  declare toolTip: string;
  toolTipAlign: string = "right";
  toolTipPadding: number = 2;
  addedToStageHandler(event: Event): void {
         var _loc_2= this.target.getBounds(this.stage);
         if(this.toolTipAlign == "left")
         {
            if(_loc_2.left - this.toolTipPadding > this.width)
            {
               this.x = _loc_2.left - this.width - this.toolTipPadding;
            }
            else
            {
               this.x = _loc_2.right + this.toolTipPadding;
            }
            this.y = _loc_2.top;
         }
         else if(this.toolTipAlign == "right")
         {
            if(_loc_2.right + this.width < this.stage.stageWidth)
            {
               this.x = _loc_2.right + this.toolTipPadding;
            }
            else
            {
               this.x = _loc_2.left - this.width - this.toolTipPadding;
            }
            this.y = _loc_2.top;
         }
         else if(this.toolTipAlign == "top")
         {
            if(_loc_2.top - this.toolTipPadding > this.height)
            {
               this.y = _loc_2.top - this.height - this.toolTipPadding;
            }
            else
            {
               this.y = _loc_2.bottom + this.toolTipPadding;
            }
            this.x = _loc_2.left + (_loc_2.width - this.width) / 2;
         }
         else if(this.toolTipAlign == "bottom")
         {
            if(_loc_2.bottom + this.height + this.toolTipPadding < this.stage.stageHeight)
            {
               this.y = _loc_2.bottom + this.toolTipPadding;
            }
            else
            {
               this.y = _loc_2.top - this.height - this.toolTipPadding;
            }
            this.x = _loc_2.left;
         }
         this.x = Maths.limit(this.x,this.toolTipPadding,this.stage.stageWidth - this.width - this.toolTipPadding);
         this.y = Maths.limit(this.y,this.toolTipPadding,this.stage.stageHeight - this.height - this.toolTipPadding);
         this.x = Math.round(this.x);
         this.y = Math.round(this.y);
      }
  remove(): void {
         this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'));
         this.target = null;
         super.remove();
      }
  constructor(param1: string, param2: DisplayObject, param3: string = "right", param4: number = 2, param5: number = 200) {
    param4 = int(param4); param5 = int(param5);
         super(param1);
         this.intrusive = false;
         this.setWidth(param5);
         this.target = param2;
         this.toolTip = param1;
         this.toolTipAlign = param3;
         this.toolTipPadding = int(param4);
         this.mouseEnabled = false;
         this.mouseChildren = false;
         this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'),false,0,true);
      }
}
$reg('com.jiggmin.popup.ToolTipPopup', ToolTipPopup);
