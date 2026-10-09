// Ported from com/jiggmin/pr3/lobby/mod/ReportedMessagesPage.as
import { $b } from '../../../../flash/as3.ts';
import { Page } from '../../../page/Page.ts';
import { EasyButton, ReportedMessageSelector, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ReportedMessagesPage extends Page {
  declare archiveAllButton: EasyButton;
  declare archivePageButton: EasyButton;
  declare list: ReportedMessageSelector;
  archiveAllCallback(param1: any, param2: string): void {
         this.setPage(new ReportedMessagesPage());
      }
  clickArchiveAll(): void {
         var _loc_1= ({} as any);
         var _loc_2= false;
         Sparkworkz.DataAccess("ArchiveAllFlaggedMessages",_loc_1,$b(this, 'archiveAllCallback'),_loc_2);
         this.archiveAllButton.visible = false;
      }
  clickArchivePage(): void {
         this.list.archivePage("ArchiveFlaggedMessage");
      }
  remove(): void {
         this.list.remove();
         this.list = null;
         this.archiveAllButton = null;
         this.archivePageButton = null;
         super.remove();
      }
  constructor(param1: boolean = false) {
         super();
         this.list = new ReportedMessageSelector(param1);
         this.list.x = 15;
         this.addChild(this.list);
         if(param1)
         {
         }
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ReportedMessagesPage', ReportedMessagesPage);
