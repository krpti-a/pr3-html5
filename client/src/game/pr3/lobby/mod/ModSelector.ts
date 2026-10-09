// Ported from com/jiggmin/pr3/lobby/mod/ModSelector.as
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Selector } from '../../lister/Selector.ts';
import { ButtonClass, MessagePopup, PlatformRacing3, SelectorEvent, SimpleListingButton, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ModSelector extends Selector {
  declare list: any[];
  displayList(param1: any[]): void {
         var _loc_2= null;
         var _loc_3= null;
         this.list = param1;
         this.removeGraphics();
         for (_loc_2 of $each(param1))
         {
            _loc_3 = this.makeButton(_loc_2);
            this.addButton(_loc_3,this.makeTitle(_loc_2));
            _loc_3.data = _loc_2;
         }
      }
  remove(): void {
         this.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectHandler'));
         this.list = null;
         super.remove();
      }
  makeButton(param1: any): ButtonClass {
         var _loc_2= new SimpleListingButton();
         _loc_2.dateBox.text = this.makeDate(param1);
         _loc_2.titleBox.htmlText = this.makeTitle(param1);
         if(this.row % 2 == 1)
         {
            _loc_2.bg.gotoAndStop(2);
         }
         return _loc_2;
      }
  makeTitle(param1: any): string {
         return "title";
      }
  selectHandler(event: SelectorEvent): void {
         this.selectSomething(event.data);
      }
  archivePage(param1: string): void {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= false;
         if(this.list != null)
         {
            for (_loc_2 of $each(this.list))
            {
               _loc_3 = ({} as any);
               if(param1 == "ArchiveFlaggedMessage")
               {
                  _loc_3.p_message_id = _loc_2.messageID;
               }
               else
               {
                  _loc_3.p_chat_id = _loc_2.chatID;
               }
               _loc_4 = false;
               Sparkworkz.DataAccess(param1,_loc_3,$b(this, 'archivePageCallback'),_loc_4);
            }
         }
         this.setPageNum(this.pageNum);
      }
  archivePageCallback(param1: any, param2: string): void {
      }
  countTotResultsCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("ModLister::countTotResultsCallback() - Could not count total results " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = _loc_3.count;
            this.setTotalResults(_loc_4);
         }
      }
  makeDate(param1: any): string {
         return "date";
      }
  selectSomething(param1: any): void {
      }
  constructor() {
         super(12);
         this.rowHeight = int(20);
         this.setWidth(550);
         this.setHeight(280);
         this.setPageNum(this.getLastRememberedPage());
         this.addEventListener(SelectorEvent.SELECT,$b(this, 'selectHandler'),false,0,true);
         this.addEventListener(SelectorEvent.CONFIRM,$b(this, 'selectHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ModSelector', ModSelector);
