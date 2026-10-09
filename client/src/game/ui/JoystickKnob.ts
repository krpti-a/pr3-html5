// Ported from com/jiggmin/ui/JoystickKnob.as
import { MovieClip } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class JoystickKnob extends MovieClip {
  _origin_x: number = NaN;
  _origin_y: number = NaN;
  get origin_x(): number {
         return this._origin_x;
      }
  set origin_x(o_x: number) {
         this._origin_x = o_x;
      }
  get origin_y(): number {
         return this._origin_y;
      }
  set origin_y(o_y: number) {
         this._origin_y = o_y;
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.ui.JoystickKnob', JoystickKnob);
