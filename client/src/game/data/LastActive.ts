// Ported from com/jiggmin/data/LastActive.as
import { KeyboardEvent, MouseEvent, Stage, getTimer } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class LastActive {
  static _lastActive: number = NaN;
  static init(param1: Stage): void {
         param1.addEventListener(MouseEvent.MOUSE_MOVE,LastActive.mouseMoveHandler,false,0,true);
         param1.addEventListener(KeyboardEvent.KEY_DOWN,LastActive.keyDownHandler,false,0,true);
         LastActive._lastActive = getTimer();
      }
  static get elapsed(): number {
         return getTimer() - LastActive.lastActive;
      }
  static mouseMoveHandler(event: MouseEvent): void {
         LastActive._lastActive = getTimer();
      }
  static keyDownHandler(event: KeyboardEvent): void {
         LastActive._lastActive = getTimer();
      }
  static get lastActive(): number {
         return LastActive._lastActive;
      }
  static reset(): void {
         LastActive._lastActive = getTimer();
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.LastActive', LastActive);
