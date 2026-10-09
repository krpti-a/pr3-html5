// Ported from com/jiggmin/page/TabPage.as  // @edited: see comments marked "port:"
import { int } from '../../flash/as3.ts';
import { PageHolder } from './PageHolder.ts';
import { Page, Tabs } from '../refs.ts';
import { $reg } from '../refs.ts';

export class TabPage extends PageHolder {
  transformX: number = 4;
  transformY: number = 20;
  declare tabs: Tabs;
  setPage(param1: Page): void {
         super.setPage(param1);
         if(param1 != null)
         {
            param1.x = this.transformX;
            param1.y = this.transformY;
         }
      }
  remove(): void {
         this.tabs.remove();
         this.tabs = null;
         super.remove();
      }
  setTransformX(param1: number): void {
         this.transformX = int(param1);
         if(this.curPage != null)
         {
            this.curPage.x = param1;
         }
      }
  set tabWidth(param1: number) {
         this.tabs.setMaxWidth(param1);
      }
  setTransformY(param1: number): void {
         this.transformY = int(param1);
         if(this.curPage != null)
         {
            this.curPage.y = param1;
         }
      }
  constructor(param1: any[] | ((self: any) => [any[], number]), param2: number = 100, param3: number = 0, param4: string = "", param5: boolean = true) {
         super();
         // port: AS3 subclasses build their tabs (bound to their own methods) before calling super(), which JS
         // forbids; they pass a builder that runs here, once `this` exists
         if(typeof param1 === "function") [param1, param3] = param1(this);
         this.tabs = new Tabs(param1,param3,param2,param4,param5);
         this.addChild(this.tabs);
         this.tabs = this.tabs;
         this.tabWidth = param2;
      }
}
$reg('com.jiggmin.page.TabPage', TabPage);
