// Ported from com/jiggmin/page/PageHolder.as
import { Event } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { Page, PageEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PageHolder extends Removable {
  declare curPage: Page;
  setPage(param1: Page): void {
         this.removePage();
         this.curPage = param1;
         if(param1 != null)
         {
            this.curPage.addEventListener(PageEvent.SET_PAGE,$b(this, 'setPageHandler'),false,0,true);
            this.addChild(this.curPage);
            this.curPage.init();
         }
         this.dispatchEvent(new Event(PageEvent.SET_PAGE));
      }
  removePage(): void {
         if(this.curPage != null)
         {
            this.curPage.removeEventListener(PageEvent.SET_PAGE,$b(this, 'setPageHandler'));
            this.curPage.remove();
         }
      }
  remove(): void {
         this.removePage();
         super.remove();
      }
  setPageHandler(event: PageEvent): void {
         var _loc_2= event.getPage();
         this.setPage(_loc_2);
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.page.PageHolder', PageHolder);
