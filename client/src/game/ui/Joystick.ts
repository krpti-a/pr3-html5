// Ported from com/jiggmin/ui/Joystick.as
import { Event, MovieClip, Rectangle } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { JoystickKnob, TouchEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Joystick extends MovieClip {
  left: boolean = false;
  right: boolean = false;
  up: boolean = false;
  down: boolean = false;
  my_x: number = NaN;
  my_y: number = NaN;
  declare knob: JoystickKnob;
  touchId: number = 0;
  init(e: Event = null): void {
         if(this.hasEventListener(Event.ADDED_TO_STAGE))
         {
            this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'init'));
         }
         this.x = this.my_x + this.width / 2;
         this.y = this.stage.stageHeight - this.my_y - this.height / 2;
         this.knob = new JoystickKnob();
         this.knob.x = 0;
         this.knob.y = 0;
         this.knob.origin_x = 0;
         this.knob.origin_y = 0;
         this.addChild(this.knob);
         this.addEventListener(TouchEvent.TOUCH_BEGIN,$b(this, 'snapKnob'));
         this.knob.addEventListener(TouchEvent.TOUCH_END,$b(this, 'mouseDown'));
         this.stage.addEventListener(TouchEvent.TOUCH_END,$b(this, 'mouseReleased'));
         this.knob.buttonMode = true;
      }
  snapKnob(event: TouchEvent): void {
         if(this.touchId == 0)
         {
            this.knob.x = this.mouseX;
            this.knob.y = this.mouseY;
            this.mouseDown(event);
         }
      }
  mouseDown(event: TouchEvent): void {
         if(this.touchId == 0)
         {
            this.touchId = int(event.touchPointID);
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'knobMoved'));
            this.knob.startDrag(false,new Rectangle(-this.width / 2,-this.height / 2,this.width,this.height));
         }
      }
  mouseReleased(event: TouchEvent): void {
         if(this.touchId == event.touchPointID)
         {
            this.touchId = int(0);
            this.knob.stopDrag();
            if(this.hasEventListener(Event.ENTER_FRAME))
            {
               this.removeEventListener(Event.ENTER_FRAME,$b(this, 'knobMoved'));
            }
            this.knob.x = this.knob.origin_x;
            this.knob.y = this.knob.origin_y;
            this.right = false;
            this.left = false;
            this.up = false;
            this.down = false;
         }
      }
  knobMoved(event: Event): void {
         if(this.knob.x > 35)
         {
            this.right = true;
            this.left = false;
         }
         else if(this.knob.x < -35)
         {
            this.right = false;
            this.left = true;
         }
         else
         {
            this.right = false;
            this.left = false;
         }
         if(this.knob.y > 40)
         {
            this.down = true;
            this.up = false;
         }
         else if(this.knob.y < -40)
         {
            this.down = false;
            this.up = true;
         }
         else
         {
            this.down = false;
            this.up = false;
         }
      }
  constructor(margin_left: number, margin_bottom: number) {
         super();
         this.my_x = margin_left;
         this.my_y = margin_bottom;
         if(this.stage)
         {
            this.init();
         }
         else
         {
            this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'init'));
         }
      }
}
$reg('com.jiggmin.ui.Joystick', Joystick);
