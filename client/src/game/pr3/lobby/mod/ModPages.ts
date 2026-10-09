// Ported from com/jiggmin/pr3/lobby/mod/ModPages.as  // @edited: see comments marked "port:"
import { $b } from '../../../../flash/as3.ts';
import { TabPage } from '../../../page/TabPage.ts';
import { BanLogPage, Chat, ReportedChatPage, ReportedMessagesPage, Tab } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ModPages extends TabPage {
  clickChat(): void {
         this.setPage(new ReportedChatPage(false));
      }
  clickArchivedChat(): void {
         this.setPage(new ReportedChatPage(true));
      }
  clickMessages(): void {
         this.setPage(new ReportedMessagesPage(false));
      }
  clickArchivedMessages(): void {
         this.setPage(new ReportedMessagesPage(true));
      }
  remove(): void {
         super.remove();
      }
  clickBans(): void {
         this.setPage(new BanLogPage());
      }
  constructor() {
         // port: tabs are built in TabPage's constructor (see TabPage)
         super((self: any) => [[new Tab($b(self, 'clickBans'),"Ban Log"), new Tab($b(self, 'clickChat'),"Reported Chat"), new Tab($b(self, 'clickMessages'),"Reported Messages"), new Tab($b(self, 'clickArchivedChat'),"Archived Reported Chat"), new Tab($b(self, 'clickArchivedMessages'),"Archived Reported Messages")], 0],610,0,"modPages");

      }
}
$reg('com.jiggmin.pr3.lobby.mod.ModPages', ModPages);
