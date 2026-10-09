// Ported from com/jiggmin/pr3/lobby/mod/ReportedChatPopup.as
import { Event } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { ArchivablePopup } from './ArchivablePopup.ts';
import { BanDetailsPopupGraphic, Chat, ChatDisplayer, EditorPopupBGGraphic, MessagePopup, NameMaker, Settings, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ReportedChatPopup extends ArchivablePopup {
  chatID: number = NaN;
  picker: number = 0;
  declare chatDisplayer: ChatDisplayer;
  declare m: any;
  nameClickHandler(event: Event): void {
         this.remove();
      }
  sendArchiveRequest(): void {
         var _loc_1= ({} as any);
         _loc_1.p_chat_id = this.chatID;
         var _loc_2= false;
         Sparkworkz.DataAccess("ArchiveFlaggedChat",_loc_1,$b(this, 'archiveCallback'),_loc_2);
      }
  sendTogglePickup(): void {
         var _loc_1= ({} as any);
         _loc_1.p_chat_id = this.chatID;
         _loc_1.p_pick = Settings.userID == this.picker ? "0" : "1";
         var _loc_2= false;
         Sparkworkz.DataAccess("PickFlaggedChat",_loc_1,$b(this, 'archiveCallback'),_loc_2);
      }
  remove(): void {
         this.chatDisplayer.removeEventListener("nameClick",$b(this, 'nameClickHandler'));
         this.chatDisplayer.remove();
         this.chatDisplayer = null;
         this.m = null;
         super.remove();
      }
  messageCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_9= null;
         var _loc_10= null;
         var _loc_11= null;
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Could not retrieve reported chat log: " + param2));
         }
         else if(param1.NumRows <= 0)
         {
            this.addPopup(new MessagePopup("The chat log was not found. chatID: " + this.chatID.toString()));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = JSON.parse(_loc_3.log);
            _loc_5 = _loc_4.length;
            _loc_6 = 0;
            while(_loc_6 < _loc_5)
            {
               _loc_10 = _loc_4[_loc_6];
               _loc_11 = _loc_10.data.data;
               _loc_11.socketID = 0;
               _loc_11.highlight = _loc_11.userID == _loc_3.reported_user_id;
               this.chatDisplayer.addChatObj(_loc_11);
               _loc_6++;
            }
            _loc_8 = new NameMaker();
            _loc_9 = _loc_8.makeNameFromParts(_loc_3.user_name,_loc_3.group,0,_loc_3.user_id,_loc_3.color);
            this.m.textBox.htmlText = "*** Chat reported by " + _loc_9 + " ***\n" + (_loc_3.picker_id != 0 ? "Picked by " + _loc_8.makeNameFromParts(_loc_3.picker_username,_loc_3.picker_group,0,_loc_3.picker_id,_loc_3.picker_color) + "\n" : "") + "\n" + this.m.textBox.htmlText;
         }
      }
  constructor(param1: number, picker: number, archive: boolean, param2: Function = null) {
         super(picker,archive,param2);
    picker = uint(picker);
         this.picker = uint(picker);

         this.chatID = param1;
         this.setBG(new EditorPopupBGGraphic());
         this.m = new BanDetailsPopupGraphic();
         this.m.textBox.height = 425;
         this.addGraphic(this.m);
         this.chatDisplayer = new ChatDisplayer(this.m.textBox.internalTextBox);
         this.chatDisplayer.addEventListener("nameClick",$b(this, 'nameClickHandler'),false,0,true);
         var _loc_3= ({} as any);
         _loc_3.p_chat_id = param1;
         var _loc_4= false;
         Sparkworkz.DataAccess("GetFlaggedChat",_loc_3,$b(this, 'messageCallback'),_loc_4);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ReportedChatPopup', ReportedChatPopup);
