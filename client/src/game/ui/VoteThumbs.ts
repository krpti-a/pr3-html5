// Ported from com/jiggmin/ui/VoteThumbs.as
import { MouseEvent } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { SocketManager, VoteThumbsGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class VoteThumbs extends Removable {
  declare m: any;
  courseID: number = 0;
  rating: number = 3;
  clickHandler(event: MouseEvent): void {
         if(event.target == this.m.up)
         {
            if(this.m.up.currentFrame == 2 && this.rating == 1)
            {
               SocketManager.socket.rateLevel(this.courseID,-1);
               this.rating = 3;
            }
            else
            {
               this.rating = 1;
            }
            event.target.gotoAndStop(2);
            this.m.down.gotoAndStop(1);
         }
         else if(event.target == this.m.down)
         {
            if(this.m.down.currentFrame == 2 && this.rating == -1)
            {
               this.rating = 3;
            }
            else
            {
               this.rating = -1;
            }
            event.target.gotoAndStop(2);
            this.m.up.gotoAndStop(1);
         }
      }
  overHandler(event: MouseEvent): void {
         event.target.gotoAndStop(2);
      }
  remove(): void {
         if(this.rating != 3)
         {
            SocketManager.socket.rateLevel(this.courseID,this.rating);
         }
         this.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'clickHandler'));
         this.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'outHandler'));
         this.removeEventListener(MouseEvent.MOUSE_OVER,$b(this, 'overHandler'));
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  outHandler(event: MouseEvent): void {
         if(this.rating == -1)
         {
            this.m.down.gotoAndStop(3);
            this.m.up.gotoAndStop(1);
         }
         else if(this.rating == 1)
         {
            this.m.down.gotoAndStop(1);
            this.m.up.gotoAndStop(3);
         }
         else
         {
            this.m.down.gotoAndStop(1);
            this.m.up.gotoAndStop(1);
         }
      }
  constructor(param1: number) {
    param1 = int(param1);
         super();
         this.m = new VoteThumbsGraphic();
         this.m.up.gotoAndStop(1);
         this.m.down.gotoAndStop(1);
         this.m.mouseEnabled = false;
         this.courseID = int(param1);
         this.addChild(this.m);
         this.addEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'outHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_OVER,$b(this, 'overHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.VoteThumbs', VoteThumbs);
