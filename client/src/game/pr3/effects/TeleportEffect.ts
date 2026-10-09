// Ported from com/jiggmin/pr3/effects/TeleportEffect.as
import { Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, EffectMapLayer, PoofEffectGraphic, TeleportEffectGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class TeleportEffect extends Effect {
  declare player: ActivePlayer;
  life: number = 53;
  declare m: any;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.player = null;
         this.m.stop();
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         this.matchPlayer();
         var _loc_2= this;
         var _loc_3= this.life - 1;
         _loc_2.life = _loc_3;
         if(this.life <= 0)
         {
            this.remove();
         }
      }
  matchPlayer(): void {
         this.x = this.player.x;
         this.y = this.player.y;
         this.rotation = this.player.rotation;
      }
  constructor(param1: ActivePlayer) {
         super();
         var _loc_2= null;
         this.player = param1;
         this.m = new TeleportEffectGraphic();
         this.addChild(this.m);
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.matchPlayer();
         _loc_2 = new PoofEffectGraphic();
         _loc_2.x = this.x;
         _loc_2.y = this.y;
         _loc_2.rotation = this.rotation;
         EffectMapLayer.addEffect(_loc_2);
      }
}
$reg('com.jiggmin.pr3.effects.TeleportEffect', TeleportEffect);
