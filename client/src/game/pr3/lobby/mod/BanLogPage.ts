// Ported from com/jiggmin/pr3/lobby/mod/BanLogPage.as
import { Page } from '../../../page/Page.ts';
import { BanLogSelector } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BanLogPage extends Page {
  declare list: BanLogSelector;
  remove(): void {
         this.list.remove();
         this.list = null;
         super.remove();
      }
  constructor() {
         super();
         this.list = new BanLogSelector();
         this.list.x = 15;
         this.addChild(this.list);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.BanLogPage', BanLogPage);
