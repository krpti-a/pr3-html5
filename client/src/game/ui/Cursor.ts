// Ported from com/jiggmin/ui/Cursor.as
import { KeyboardEvent, MouseEvent, Stage } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { StateObject } from '../stateObject/StateObject.ts';
import { $reg } from '../refs.ts';

export class Cursor extends StateObject {
  declare static instance: Cursor;
  declare static stageRef: Stage;
  declare static tempHolder: Cursor;
  static setCursor(param1: Cursor, hardRemove: boolean = true): void {
         if(!hardRemove)
         {
            Cursor.tempHolder = Cursor.instance;
         }
         Cursor.removeCursor(hardRemove);
         Cursor.instance = param1;
         Cursor.stageRef.addChild(param1);
      }
  static removeCursor(hardRemove: boolean = true): void {
         if(Cursor.instance != null && hardRemove)
         {
            Cursor.instance.remove();
            Cursor.instance = null;
         }
      }
  static restoreCursor(): void {
         Cursor.setCursor(Cursor.tempHolder);
      }
  init(): void {
         Cursor.stageRef.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'),false,0,true);
         Cursor.stageRef.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
         Cursor.stageRef.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
         Cursor.stageRef.addEventListener(MouseEvent.MOUSE_OVER,$b(this, 'mouseOverHandler'),false,0,true);
         Cursor.stageRef.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'),false,0,true);
         Cursor.stageRef.addEventListener(MouseEvent.MIDDLE_CLICK,$b(this, 'middleMouseDownHandler'),false,0,true);
         Cursor.stageRef.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandle'));
         Cursor.stageRef.addEventListener(KeyboardEvent.KEY_UP,$b(this, 'keyUpHandler'));
      }
  keyDownHandle(event: KeyboardEvent): void {
      }
  keyUpHandler(event: KeyboardEvent): void {
      }
  middleMouseDownHandler(event: MouseEvent): void {
      }
  mouseOverHandler(event: MouseEvent): void {
      }
  mouseDownHandler(event: MouseEvent): void {
      }
  mouseMoveHandler(event: MouseEvent): void {
         this.x = event.stageX;
         this.y = event.stageY;
      }
  pause(): void {
         this.remove();
      }
  mouseOutHandler(event: MouseEvent): void {
      }
  mouseUpHandler(event: MouseEvent): void {
      }
  remove(): void {
         Cursor.stageRef.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'));
         Cursor.stageRef.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         Cursor.stageRef.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
         Cursor.stageRef.removeEventListener(MouseEvent.MOUSE_OVER,$b(this, 'mouseOverHandler'));
         Cursor.stageRef.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'));
         Cursor.stageRef.removeEventListener(MouseEvent.MIDDLE_CLICK,$b(this, 'middleMouseDownHandler'));
         Cursor.stageRef.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandle'));
         Cursor.stageRef.removeEventListener(KeyboardEvent.KEY_UP,$b(this, 'keyUpHandler'));
         Cursor.instance = null;
         super.remove();
      }
  constructor() {
         super();
         this.mouseEnabled = false;
         this.mouseChildren = false;
         this.prependString = "Cursor";
         this.init();
      }
}
$reg('com.jiggmin.ui.Cursor', Cursor);
