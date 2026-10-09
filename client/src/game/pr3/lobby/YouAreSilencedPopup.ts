// Ported from com/jiggmin/pr3/lobby/YouAreSilencedPopup.as
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { BanDetailsPopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class YouAreSilencedPopup extends ButtonPopup {
  declare txt: string;
  declare textGraphic: any;
  remove(): void {
         this.textGraphic = null;
         this.txt = "";
         super.remove();
      }
  init(): void {
         super.init();
         this.textGraphic.textBox.text = this.txt;
      }
  clickClose(): void {
         this.remove();
      }
  constructor(param1: string) {
         super();
         this.txt = param1;
         this.textGraphic = new BanDetailsPopupGraphic();
         this.addGraphic(this.textGraphic);
         this.createButton($b(this, 'clickClose'),"Close");
      }
}
$reg('com.jiggmin.pr3.lobby.YouAreSilencedPopup', YouAreSilencedPopup);
