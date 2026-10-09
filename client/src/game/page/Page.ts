// Ported from com/jiggmin/page/Page.as
import { Event } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { PageEvent, Popup, PopupEvent } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Page extends Removable {
  declare popupArray: any[];
  h: number = 0;
  w: number = 0;
  popupRemoveHandler(event: Event): void {
         var _loc_2= (event.target);
         this.removePopup(_loc_2);
      }
  removePopups(): void {
         while(this.popupArray.length > 0)
         {
            this.removePopup(this.popupArray[0]);
         }
         this.popupArray = null;
      }
  remove(): void {
         this.removePopups();
         super.remove();
      }
  removePopup(param1: Popup): void {
         param1.removeEventListener(PageEvent.SET_PAGE,$b(this, 'setPageHandler'));
         param1.removeEventListener(PopupEvent.ADD_POPUP,$b(this, 'addPopupHandler'));
         param1.removeEventListener(Removable.REMOVE,$b(this, 'popupRemoveHandler'));
         var _loc_2= this.popupArray.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.popupArray.splice(_loc_2,1);
            if(!param1.removed)
            {
               param1.remove();
            }
         }
      }
  addPopup(param1: Popup): void {
         param1.setDimensions(this.w,this.h);
         param1.addEventListener(PageEvent.SET_PAGE,$b(this, 'setPageHandler'),false,0,true);
         param1.addEventListener(PopupEvent.ADD_POPUP,$b(this, 'addPopupHandler'),false,0,true);
         param1.addEventListener(Removable.REMOVE,$b(this, 'popupRemoveHandler'),false,0,true);
         this.addChild(param1);
         this.popupArray.push(param1);
         param1.init();
      }
  setPage(param1: Page): void {
         this.dispatchEvent(new PageEvent(PageEvent.SET_PAGE,param1));
      }
  init(): void {
      }
  countPopups(): number {
         return this.popupArray.length;
      }
  setPageHandler(event: PageEvent): void {
         var _loc_2= event.getPage();
         this.setPage(_loc_2);
      }
  addPopupHandler(event: PopupEvent): void {
         var _loc_2= event.getPopup();
         this.addPopup(_loc_2);
      }
  constructor() {
         super();
         this.popupArray = new Array();
      }
}
$reg('com.jiggmin.page.Page', Page);
