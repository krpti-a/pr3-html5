// Ported from com/jiggmin/pr3/lobby/pm/PMList.as
import { DisplayObject, Event } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Lister } from '../../lister/Lister.ts';
import { BlossomEvent, PMListGraphic, PMListing, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PMList extends Lister {
  declare static instance: PMList;
  createBG(): DisplayObject {
         var _loc_1= new PMListGraphic();
         _loc_1.checkAll.addEventListener(Event.CHANGE,$b(this, 'checkAllHandler'),false,0,true);
         return _loc_1;
      }
  removeGraphic(param1: DisplayObject): void {
         var _loc_2= (param1);
         _loc_2.remove();
      }
  deleteSelected(): void {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_1= new Array();
         for (_loc_2 of $each(this.graphicArray))
         {
            _loc_3 = (_loc_2);
            if(_loc_3.checked)
            {
               _loc_1.push(_loc_3.messageID);
            }
         }
         if(_loc_1.length > 0)
         {
            SocketManager.socket.deletePMs(_loc_1);
            this.refresh();
         }
      }
  receivePMsHandler(event: BlossomEvent): void {
         var pm: any= null;
         var data: any= event.raw;
         if(data.requestID == this.requestID)
         {
            this.setTotalResults(data.results);
            for (pm of $each(data.pmArray))
            {
               this.addGraphic(new PMListing(pm.messageID,pm.senderId,pm.senderName,pm.senderNameColor,pm.title,pm.sent_time));
            }
         }
      }
  checkAllHandler(event: Event): void {
         var _loc_4= null;
         var _loc_5= null;
         var _loc_2= (this.bg);
         var _loc_3= _loc_2.checkAll.checked;
         for (_loc_4 of $each(this.graphicArray))
         {
            _loc_5 = (_loc_4);
            _loc_5.checked = _loc_3;
         }
      }
  remove(): void {
         SocketManager.socket.removeEventListener("receivePMs",$b(this, 'receivePMsHandler'));
         var _loc_1= (this.bg);
         _loc_1.checkAll.removeEventListener(Event.CHANGE,$b(this, 'checkAllHandler'));
         PMList.instance = null;
         super.remove();
      }
  requestResults(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= (this.bg);
         _loc_3.checkAll.checked = false;
         SocketManager.socket.getPMs(this.getRequestID(),param1,param2);
      }
  constructor(param1: number = 12) {
         super(param1);
    param1 = int(param1);
         PMList.instance = this;

         this.startY = int(53);
         this.rowHeight = int(20);
         this.setWidth(410);
         this.setHeight(294);
         SocketManager.socket.addEventListener("receivePMs",$b(this, 'receivePMsHandler'),false,0,true);
         this.setPageNum(this.getLastRememberedPage());
      }
}
$reg('com.jiggmin.pr3.lobby.pm.PMList', PMList);
