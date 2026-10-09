// Ported from com/jiggmin/pr3/game/GameHealth.as
import { Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { GamePage, HealthGraphic, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GameHealth extends Removable {
  declare m: any;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'displayHealth'));
         super.remove();
      }
  displayHealth(event: Event): void {
         if((GamePage.instance.levelType == "deathmatch" || GamePage.instance.levelType == "damageDash") && SocketManager.socket != null && GamePage.instance.localPlayer != null && GamePage.instance.localPlayer.lifeBar != null)
         {
            this.m.holder.timeBox.text = String(GamePage.instance.localPlayer.lifeBar.percent + " / " + GamePage.instance.localPlayer.lifeBar.maxPercent);
            this.m.holder2.timeBox.text = String(GamePage.instance.localPlayer.lifeBar.percent + " / " + GamePage.instance.localPlayer.lifeBar.maxPercent);
         }
         else
         {
            this.m.holder.timeBox.text = "";
            this.m.holder2.timeBox.text = "";
         }
      }
  constructor() {
         super();
         this.addChild(this.m = new HealthGraphic());
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'displayHealth'));
      }
}
$reg('com.jiggmin.pr3.game.GameHealth', GameHealth);
