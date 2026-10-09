// Ported from com/jiggmin/pr3/lobby/chat/CreateRoomPopup.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { BlossomSocket, CreateRoomGuestGraphic, CreateRoomPopupGraphic, EditorPopupBGGraphic, MessagePopup, MiscEvent } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class CreateRoomPopup extends ButtonPopup {
  declare socket: BlossomSocket;
  declare m: any;
  clickOK(): void {
         var _loc_1= null;
         if(this.m.roomNameBox.text != "")
         {
            _loc_1 = ({} as any);
            _loc_1.roomName = this.m.roomNameBox.text;
            _loc_1.pass = "";
            _loc_1.note = this.m.noteBox.text;
            this.dispatchEvent(new MiscEvent("createRoom",_loc_1));
            this.remove();
         }
         else
         {
            this.addPopup(new MessagePopup("Please enter a name for this room."));
         }
      }
  clickCancel(): void {
         this.remove();
      }
  remove(): void {
         this.m = null;
         this.socket = null;
         super.remove();
      }
  constructor(param1: BlossomSocket) {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.socket = param1;
         if(param1.me.vars.guest)
         {
            this.addGraphic(new CreateRoomGuestGraphic());
         }
         else
         {
            this.m = new CreateRoomPopupGraphic();
            this.m.noteBox.multiline = true;
            this.m.noteBox.wordWrap = true;
            this.m.noteBox.maxChars = 250;
            this.addGraphic(this.m);
            this.createButton($b(this, 'clickOK'),"OK");
         }
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.lobby.chat.CreateRoomPopup', CreateRoomPopup);
