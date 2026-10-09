// Ported from com/jiggmin/pr3/lobby/LobbyPopup.as
import { Popup } from '../../popup/Popup.ts';
import { PopupLightBGGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LobbyPopup extends Popup {
  cropY: number = 95;
  redraw(): void {
         super.redraw();
         this.y += this.cropY;
      }
  setDimensions(param1: number, param2: number): void {
         super.setDimensions(param1,param2 - this.cropY);
      }
  constructor() {
         super();
         this.intrusive = false;
         this.setBG(new PopupLightBGGraphic());
      }
}
$reg('com.jiggmin.pr3.lobby.LobbyPopup', LobbyPopup);
