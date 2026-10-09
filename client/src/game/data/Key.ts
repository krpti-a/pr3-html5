// Ported from com/jiggmin/data/Key.as
import { Event, KeyboardEvent, Stage, stage } from '../../flash/index.ts';
import { uint } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class Key {
  static initialized: boolean = false;
  static keysDown: any = ({} as any);
  static keysPressed: any = ({} as any);
  static init(stage: Stage): void {
         if(!Key.initialized)
         {
            Key.initialized = true;
            stage.addEventListener(KeyboardEvent.KEY_DOWN,Key.keyDown);
            stage.addEventListener(KeyboardEvent.KEY_UP,Key.keyUp);
            stage.addEventListener(Event.DEACTIVATE,Key.clearKeys);
            stage.addEventListener(Event.ENTER_FRAME,Key.enterFrame);
         }
      }
  static get isReady(): boolean {
         return Key.initialized;
      }
  static clearKeys(event: Event): void {
         Key.keysDown = ({} as any);
         Key.keysPressed = ({} as any);
      }
  static isDown(key: number): boolean {
    key = uint(key);
         if(!Key.initialized)
         {
            throw new Error("Key class has yet been initialized.");
         }
         return key in Key.keysDown;
      }
  static isPressed(key: number): boolean {
    key = uint(key);
         if(!Key.initialized)
         {
            throw new Error("Key class has yet been initialized.");
         }
         return key in Key.keysPressed;
      }
  static keyDown(event: KeyboardEvent): void {
         Key.keysDown[event.keyCode] = true;
      }
  static keyUp(event: KeyboardEvent): void {
         if(event.keyCode in Key.keysDown)
         {
            delete Key.keysDown[event.keyCode];
         }
         Key.keysPressed[event.keyCode] = true;
      }
  static enterFrame(event: Event): void {
         Key.keysPressed = ({} as any);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.Key', Key);
