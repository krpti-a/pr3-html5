// Ported from com/jiggmin/pr3/lobby/mod/ReportedMessagePopup.as
import { Event } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { ArchivablePopup } from './ArchivablePopup.ts';
import { BanDetailsPopupGraphic, Data, EditorPopupBGGraphic, MessagePopup, NameMaker, Settings, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ReportedMessagePopup extends ArchivablePopup {
  declare static instance: ReportedMessagePopup;
  messageID: number = NaN;
  declare log: string;
  pickerId: number = 0;
  declare m: any;
  declare nameMaker: NameMaker;
  messageCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_9= null;
         var _loc_10= null;
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Could not retrieve reported message: " + param2));
         }
         else if(param1.NumRows <= 0)
         {
            this.addPopup(new MessagePopup("The message was not found. messageID: " + this.messageID.toString()));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = "";
            _loc_5 = Data.cleanHTML(_loc_3.title);
            _loc_6 = Data.cleanHTML(_loc_3.message);
            _loc_7 = _loc_3.from_group;
            _loc_8 = _loc_3.to_group;
            _loc_9 = this.nameMaker.makeNameFromParts(_loc_3.from_name,_loc_7,0,_loc_3.from_user_id,_loc_3.from_color);
            _loc_10 = this.nameMaker.makeNameFromParts(_loc_3.to_name,_loc_8,0,_loc_3.to_user_id,_loc_3.to_color);
            this.m.textBox.htmlText = "This is a message sent from " + _loc_9 + " to " + _loc_10 + "<br/>" + (_loc_3.picker_id != 0 ? "Picked by " + this.nameMaker.makeNameFromParts(_loc_3.picker_username,_loc_3.picker_group,0,_loc_3.picker_id,_loc_3.picker_color) + "\n" : "") + "<br/>" + _loc_5 + "<br/>" + _loc_6;
            this.log = "This is a message sent from " + _loc_3.from_name + " to " + _loc_3.to_name + "\n\n" + _loc_3.title + "\n" + _loc_3.message;
         }
      }
  getLog(): string {
         return this.log;
      }
  nameClickHandler(event: Event): void {
         this.remove();
      }
  sendArchiveRequest(): void {
         var _loc_1= ({} as any);
         _loc_1.p_message_id = this.messageID;
         var _loc_2= false;
         Sparkworkz.DataAccess("ArchiveFlaggedMessage",_loc_1,$b(this, 'archiveCallback'),_loc_2);
      }
  sendTogglePickup(): void {
         var _loc_1= ({} as any);
         _loc_1.p_message_id = this.messageID;
         _loc_1.p_pick = Settings.userID == this.pickerId ? "0" : "1";
         var _loc_2= false;
         Sparkworkz.DataAccess("PickFlaggedMessage",_loc_1,$b(this, 'archiveCallback'),_loc_2);
      }
  remove(): void {
         this.nameMaker.removeEventListener("nameClick",$b(this, 'nameClickHandler'));
         this.nameMaker.remove();
         this.nameMaker = null;
         if(ReportedMessagePopup.instance == this)
         {
            ReportedMessagePopup.instance = null;
         }
         this.m = null;
         super.remove();
      }
  constructor(param1: number, pickerId: number, archive: boolean, param2: Function = null) {
         super(pickerId,archive,param2);
    pickerId = uint(pickerId);
         this.pickerId = uint(pickerId);
         ReportedMessagePopup.instance = this;

         this.messageID = param1;
         this.setBG(new EditorPopupBGGraphic());
         this.m = new BanDetailsPopupGraphic();
         this.addGraphic(this.m);
         this.nameMaker = new NameMaker();
         this.nameMaker.listenForLink(this.m.textBox);
         this.nameMaker.addEventListener("nameClick",$b(this, 'nameClickHandler'),false,0,true);
         var _loc_3= ({} as any);
         _loc_3.p_message_id = param1;
         var _loc_4= false;
         Sparkworkz.DataAccess("GetFlaggedMessage",_loc_3,$b(this, 'messageCallback'),_loc_4);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ReportedMessagePopup', ReportedMessagePopup);
