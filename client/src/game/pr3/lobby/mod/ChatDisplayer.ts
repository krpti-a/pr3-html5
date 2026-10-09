// Ported from com/jiggmin/pr3/lobby/mod/ChatDisplayer.as
import { Event, TextField } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Chat } from '../../chat/Chat.ts';
import { $reg } from '../../../refs.ts';

export class ChatDisplayer extends Chat {
  declare targetTextBox: TextField;
  nameClickHandler(event: Event): void {
         this.dispatchEvent(new Event("nameClick"));
      }
  remove(): void {
         this.nameMaker.removeEventListener("nameClick",$b(this, 'nameClickHandler'));
         this.targetTextBox.text = "";
         this.targetTextBox = null;
         super.remove();
      }
  showMessageText(param1: string): void {
         this.targetTextBox.htmlText = param1;
      }
  constructor(param1: TextField) {
         super();
         this.targetTextBox = param1;
         this.nameMaker.listenForLink(param1);
         this.nameMaker.addEventListener("nameClick",$b(this, 'nameClickHandler'),false,0,true);
         this.maxMessages = int(500);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ChatDisplayer', ChatDisplayer);
