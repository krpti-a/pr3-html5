// Ported from com/jiggmin/pr3/menu/ErrorPage.as
import { $b } from '../../../flash/as3.ts';
import { Page } from '../../page/Page.ts';
import { ErrorPageGraphic, MenuPage, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ErrorPage extends Page {
  init(): void {
         super.init();
         SocketManager.close();
      }
  clickConnectButton(): void {
         this.setPage(new MenuPage());
      }
  constructor(param1: string) {
         super();
         var _loc_2= new ErrorPageGraphic();
         _loc_2.textBox.htmlText = param1;
         _loc_2.connectButton.init("Return to Menu",$b(this, 'clickConnectButton'));
         this.addChild(_loc_2);
      }
}
$reg('com.jiggmin.pr3.menu.ErrorPage', ErrorPage);
