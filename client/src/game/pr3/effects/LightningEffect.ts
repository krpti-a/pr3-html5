// Ported from com/jiggmin/pr3/effects/LightningEffect.as
import { Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { LightningEffectGraphic, Player } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LightningEffect extends Effect {
  declare player: Player;
  declare m: any;
  pos(): void {
         this.x = this.player.x;
         this.y = this.player.y;
      }
  go(event: Event): void {
         this.pos();
         this.alpha -= 0.1;
         if(this.alpha <= 0)
         {
            this.remove();
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         this.removeChild(this.m);
         this.m = null;
         this.player = null;
         super.remove();
      }
  constructor(param1: Player, param2: string = "zap") {
         super();
         this.m = new LightningEffectGraphic();
         this.player = param1;
         this.m.gotoAndStop(param2);
         this.addChild(this.m);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'go'),false,0,true);
         this.pos();
      }
}
$reg('com.jiggmin.pr3.effects.LightningEffect', LightningEffect);
