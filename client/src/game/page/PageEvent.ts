// Ported from com/jiggmin/page/PageEvent.as
import { Event } from '../../flash/index.ts';
import { Page } from '../refs.ts';
import { $reg } from '../refs.ts';

export class PageEvent extends Event {
  static SET_PAGE: string = "setPage";
  declare page: Page;
  clone(): Event {
         return new PageEvent(this.type,this.page,this.bubbles,this.cancelable);
      }
  getPage(): Page {
         return this.page;
      }
  constructor(param1: string, param2: Page, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this.page = param2;

      }
}
$reg('com.jiggmin.page.PageEvent', PageEvent);
