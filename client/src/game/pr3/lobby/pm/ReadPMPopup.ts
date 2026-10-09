// Ported from com/jiggmin/pr3/lobby/pm/ReadPMPopup.as
import { Event, TextEvent } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { AcceptThingTransferPopup, BlossomEvent, ConfirmPopup, Data, EasyButton, EditorPopupBGGraphic, PMList, ReadPMPopupGraphic, SendPMPopup, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ReadPMPopup extends ButtonPopup {
  declare reportButton: EasyButton;
  declare message: string;
  declare m: any;
  pmID: number = 0;
  declare json: any;
  clickDelete(): void {
         this.addPopup(new ConfirmPopup($b(this, 'confirmDelete'),"Are you sure you want to delete this message?"));
      }
  remove(): void {
         this.m.messageBox.removeEventListener(TextEvent.LINK,$b(this, 'clickLinkHandler'));
         SocketManager.socket.removeEventListener("receivePM",$b(this, 'receivePMHandler'));
         this.reportButton = null;
         this.m = null;
         super.remove();
      }
  clickLinkHandler(event: TextEvent): void {
         var popup: AcceptThingTransferPopup= new AcceptThingTransferPopup(int(event.text),this.json.thing_type,this.json.thing_title);
         popup.addEventListener("thingAccepted",$b(this, 'thingAcceptHandler'));
         this.addPopup(popup);
      }
  clickReply(): void {
         var _loc_1= this.message;
         if(_loc_1.length > 500)
         {
            _loc_1 = _loc_1.substr(0,500);
         }
         var _loc_2= this.m.titleBox.text;
         var _loc_3= "Re: ";
         if(_loc_2.indexOf(_loc_3) != 0)
         {
            _loc_2 = _loc_3 + _loc_2;
         }
         this.addPopup(new SendPMPopup(this.m.fromBox.text,_loc_2,_loc_1));
         this.resetFocusOnRemove = false;
         this.remove();
      }
  thingAcceptHandler(event: Event): void {
         this.confirmDelete();
      }
  receivePMHandler(event: BlossomEvent): void {
         var data: any= event.raw;
         this.m.titleBox.text = data.title == "" || data.title == null ? "[no title]" : data.title;
         this.m.fromBox.text = data.senderName;
         if(!data.handleAsJson)
         {
            this.message = Data.filterSwearing(data.message);
            if(!data.allowHTML)
            {
               this.message = Data.cleanHTML(this.message);
            }
         }
         else
         {
            this.json = JSON.parse(data.message);
            this.message = this.buildFromJson(this.json);
         }
         this.m.messageBox.htmlText = this.message;
      }
  buildFromJson(json: any): string {
         if(json.message_type == "thing_receive")
         {
            return json.thing_sender + " has sent you a " + json.thing_type + " titled \'" + json.thing_title + "\'! Click on following link if you want accept it: <a href=\"event:" + json.thing_id + "\"><u><font color=\"#000000\">Copy \'" + json.thing_title + "\' to my account.</font></u></a>";
         }
      }
  confirmDelete(): void {
         var _loc_1= new Array();
         _loc_1[0] = this.pmID;
         SocketManager.socket.deletePMs(_loc_1);
         if(PMList.instance != null)
         {
            PMList.instance.refresh();
         }
         this.remove();
      }
  confirmReport(): void {
         SocketManager.socket.reportPM(this.pmID);
         this.remove();
      }
  redraw(): void {
         super.redraw();
         if(this.reportButton != null)
         {
            this.reportButton.x = -95;
         }
      }
  clickReport(): void {
         this.addPopup(new ConfirmPopup($b(this, 'confirmReport'),"Are you sure you want to report this message to the moderators?"));
      }
  clickClose(): void {
         this.remove();
      }
  constructor(param1: number) {
    param1 = int(param1);
         super();
         this.m = new ReadPMPopupGraphic();
         this.pmID = int(param1);
         this.setBG(new EditorPopupBGGraphic());
         this.addGraphic(this.m);
         SocketManager.socket.getPM(param1);
         SocketManager.socket.addEventListener("receivePM",$b(this, 'receivePMHandler'),false,0,true);
         this.reportButton = this.createButton($b(this, 'clickReport'),"Report");
         this.createButton($b(this, 'clickDelete'),"Delete");
         this.createButton($b(this, 'clickReply'),"Reply");
         this.createButton($b(this, 'clickClose'),"Close");
         this.m.messageBox.addEventListener(TextEvent.LINK,$b(this, 'clickLinkHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.pm.ReadPMPopup', ReadPMPopup);
