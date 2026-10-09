// Ported from AcceptThingTransferPopup.as
import { Event } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { ButtonPopup } from '../popup/ButtonPopup.ts';
import { Block, BlossomEvent, ConfirmPopup, ListCache, SavePopupGraphic, SocketManager } from '../refs.ts';
import { $reg } from '../refs.ts';

export class AcceptThingTransferPopup extends ButtonPopup {
  static __sym = 'AcceptThingTransferPopup';
  declare m: any;
  id: number = 0;
  declare type: string;
  clickAdd(): void {
         if(this.m.titleBox.textBox.type == "input")
         {
            this.m.titleBox.disable();
            SocketManager.socket.addEventListener("thingExits",$b(this, 'thingExitsHandler'),false,0,true);
            SocketManager.socket.thingExits(this.type,this.m.titleBox.text,this.m.categoryBox.text);
         }
      }
  clickClose(): void {
         SocketManager.socket.removeEventListener("thingExits",$b(this, 'thingExitsHandler'));
         this.remove();
      }
  thingExitsHandler(event: BlossomEvent): void {
         if(this.m.titleBox.textBox.type == "dynamic")
         {
            this.m.titleBox.enable();
            if(event.raw.exits)
            {
               this.addPopup(new ConfirmPopup($b(this, 'confirmSave'),"Are you sure you want to replace this " + this.type + "?"));
            }
            else
            {
               this.confirmSave();
            }
         }
      }
  confirmSave(): void {
         ListCache.deleteCache("myLevels");
         ListCache.deleteCache("myBlocks");
         SocketManager.socket.acceptThingTransfer(this.id,this.m.titleBox.text,this.m.commentBox.text,this.m.categoryBox.text,this.m.publishCheckBox.checked);
         this.dispatchEvent(new Event("thingAccepted"));
         this.remove();
      }
  constructor(id: number, type: string, title: string) {
    id = int(id);
         super();
         this.id = int(id);
         this.type = type;
         this.m = new SavePopupGraphic();
         this.m.commentBox.multiline = true;
         this.m.commentBox.wordWrap = true;
         this.m.commentBox.maxChars = 250;
         this.m.titleBox.text = title;
         this.m.commentBox.text = "";
         if(type == "level")
         {
            this.m.removeChildAt(1);
            this.m.removeChild(this.m.categoryBox);
            this.m.commentBox.y -= 27;
            this.m.publishCheckBox.y -= 27;
            this.m.getChildAt(1).y = this.m.getChildAt(1).y - 27;
            this.m.publishCheckBox.label = "Publish?";
            this.m.publishCheckBox.checked = false;
            this.m.textBox.text = "Save Level";
         }
         else
         {
            this.m.categoryBox.text = "";
            this.m.removeChild(this.m.publishCheckBox);
            this.m.textBox.text = "Save Block";
         }
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickAdd'),"Add");
         this.createButton($b(this, 'clickClose'),"Close");
      }
}
$reg('AcceptThingTransferPopup', AcceptThingTransferPopup);
