// Ported from com/jiggmin/pr3/lobby/mod/ReportedMessageSelector.as
import { int, $b } from '../../../../flash/as3.ts';
import { ModSelector } from './ModSelector.ts';
import { Data, MessagePopup, NameMaker, PlatformRacing3, ReportedMessagePopup, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ReportedMessageSelector extends ModSelector {
  archive: boolean = false;
  archiveNum: number = 0;
  selectSomething(param1: any): void {
         super.selectSomething(param1);
         PlatformRacing3.addPopup(new ReportedMessagePopup(param1.messageID,param1.pickerId,this.archive,$b(this, 'refresh')));
      }
  makeDate(param1: any): string {
         return Data.timestampToDate(param1.reportedTime * 1000);
      }
  makeTitle(param1: any): string {
         return new NameMaker().makeNameFromParts(param1.fromName,param1.fromGroup,0,0,param1.fromColor) + ": " + param1.title + (param1.pickerId != 0 ? " (Picked by: " + new NameMaker().makeNameFromParts(param1.pickerUsername,param1.pickerGroup,0,param1.pickerId,param1.pickerColor) + ")" : "");
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(this.archiveNum === undefined) return;
         var _loc_3= ({} as any);
         _loc_3.p_start = param1;
         _loc_3.p_count = param2;
         _loc_3.p_archive = this.archiveNum;
         var _loc_4= false;
         Sparkworkz.DataAccess("GetFlaggedMessages",_loc_3,$b(this, 'messageCallback'),_loc_4);
      }
  messageCallback(param1: any, param2: string): void {
         var _loc_3_other= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("Could not retrieve messages: " + param2));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_7 = 0;
            while(_loc_7 < _loc_4)
            {
               _loc_3_other = _loc_3[_loc_7];
               _loc_6 = ({} as any);
               _loc_6.messageID = Number(_loc_3_other.message_id);
               _loc_6.title = _loc_3_other.title;
               _loc_6.fromName = _loc_3_other.from_name;
               _loc_6.fromGroup = _loc_3_other.from_group;
               _loc_6.fromColor = _loc_3_other.from_color;
               _loc_6.reportedTime = _loc_3_other.reported_time;
               _loc_6.pickerId = _loc_3_other.picker_id;
               _loc_6.pickerUsername = _loc_3_other.picker_username;
               _loc_6.pickerColor = _loc_3_other.picker_color;
               _loc_6.pickerGroup = _loc_3_other.picker_group;
               _loc_5.push(_loc_6);
               _loc_7++;
            }
            this.setList(_loc_5);
         }
      }
  constructor(param1: boolean) {
         super();
         this.archive = param1;
         if(param1)
         {
            this.archiveNum = int(1);
         }
         this.setPageNum(this.getLastRememberedPage());
         var _loc_2= ({} as any);
         _loc_2.p_archive = this.archiveNum;
         var _loc_3= false;
         Sparkworkz.DataAccess("CountFlaggedMessages",_loc_2,$b(this, 'countTotResultsCallback'),_loc_3);

      }
}
$reg('com.jiggmin.pr3.lobby.mod.ReportedMessageSelector', ReportedMessageSelector);
