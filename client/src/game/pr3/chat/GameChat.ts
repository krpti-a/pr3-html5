// Ported from com/jiggmin/pr3/chat/GameChat.as
import { Event, FocusEvent, Keyboard, KeyboardEvent, MouseEvent } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Chat } from './Chat.ts';
import { GameChatGraphic, PlatformRacing3 } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GameChat extends Chat {
  static inChatMode: boolean = false;
  declare m: any;
  exitChatMode(): void {
         GameChat.inChatMode = false;
         this.m.bg.visible = false;
         this.m.inputGraphic.visible = false;
         this.m.instructions.visible = true;
         if(this.stage != null)
         {
            this.stage.focus = this.stage;
         }
         this.m.inputGraphic.inputBox.removeEventListener(FocusEvent.FOCUS_OUT,$b(this, 'focusOutHandler'));
         this.m.inputGraphic.inputBox.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyInput'));
      }
  enterFrameHandler(event: Event): void {
         this.m.textHolder2.textBox.scrollV = this.m.textHolder.textBox.scrollV;
      }
  mouseWheelHandler(event: MouseEvent): void {
         if(this.messageObjArray.length > 0)
         {
            event.stopPropagation();
         }
      }
  enterChatMode(): void {
         GameChat.inChatMode = true;
         this.m.bg.visible = true;
         this.m.inputGraphic.visible = true;
         this.m.instructions.visible = false;
         this.m.inputGraphic.inputBox.aquireFocus();
         this.m.inputGraphic.inputBox.addEventListener(FocusEvent.FOCUS_OUT,$b(this, 'focusOutHandler'),false,0,true);
         this.m.inputGraphic.inputBox.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyInput'),false,0,true);
      }
  focusOutHandler(event: FocusEvent): void {
         this.exitChatMode();
      }
  showMessageText(param1: string): void {
         if(this.m != null)
         {
            this.m.textHolder.textBox.htmlText = param1;
            this.m.textHolder.textBox.scrollV = this.m.textHolder.textBox.maxScrollV;
            this.m.textHolder2.textBox.htmlText = param1;
            this.m.textHolder2.textBox.scrollV = this.m.textHolder2.textBox.maxScrollV;
         }
      }
  keyDownHandler(event: KeyboardEvent): void {
         var _loc_2= event.keyCode;
         if(_loc_2 == Keyboard.ENTER)
         {
            if(!GameChat.inChatMode)
            {
               this.enterChatMode();
            }
            else
            {
               this.exitChatMode();
            }
         }
      }
  getMessageToSend(): string {
         var _loc_1= null;
         if(GameChat.inChatMode)
         {
            _loc_1 = this.m.inputGraphic.inputBox.text;
            this.m.inputGraphic.inputBox.text = "";
            return _loc_1;
         }
         return "";
      }
  remove(): void {
         this.exitChatMode();
         PlatformRacing3.instance.stage.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'));
         this.m.instructions.removeEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'));
         this.m.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.m.removeEventListener(MouseEvent.MOUSE_WHEEL,$b(this, 'mouseWheelHandler'));
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  clickHandler(event: MouseEvent): void {
         this.enterChatMode();
      }
  constructor(param1: string) {
         super();
         this.m = new GameChatGraphic();
         this.joinRoom(param1,"","",false,false);
         PlatformRacing3.instance.stage.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'),false,0,true);
         this.m.instructions.addEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'),false,0,true);
         this.m.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.m.addEventListener(MouseEvent.MOUSE_WHEEL,$b(this, 'mouseWheelHandler'),false,0,true);
         this.m.inputGraphic.inputBox.maxChars = 250;
         this.nameMaker.listenForLink(this.m.textHolder.textBox);
         this.addChild(this.m);
         this.maxMessages = int(30);
         this.messageArray = new Array(this.maxMessages);
         this.exitChatMode();
      }
}
$reg('com.jiggmin.pr3.chat.GameChat', GameChat);
