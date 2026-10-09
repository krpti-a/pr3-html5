// Ported from com/jiggmin/pr3/lobby/WelcomePopup.as
import { MouseEvent } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Popup } from '../../popup/Popup.ts';
import { EditorPopupBGGraphic, OfflineGamePage, WelcomePopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class WelcomePopup extends Popup {
  declare m: any;
  clickSkipHandler(event: MouseEvent): void {
         this.remove();
      }
  remove(): void {
         this.m.playButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickPlayHandler'));
         this.m.skipButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickSkipHandler'));
         this.m = null;
         super.remove();
      }
  clickPlayHandler(event: MouseEvent): void {
         this.setPage(new OfflineGamePage("reborn",225));
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.m = new WelcomePopupGraphic();
         this.addGraphic(this.m);
         this.m.playButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickPlayHandler'),false,0,true);
         this.m.skipButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickSkipHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.lobby.WelcomePopup', WelcomePopup);
