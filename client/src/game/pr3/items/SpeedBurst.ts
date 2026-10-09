// Ported from com/jiggmin/pr3/items/SpeedBurst.as
import { Event, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { uint, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { EffectMapLayer, SlowDownSound, Sounds, SpeedSparkleGraphic, SpeedUpSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SpeedBurst extends Item {
  used: boolean = false;
  stopTimeout: number = 0;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  endSpeedBurst(): void {
         Sounds.startGameSound(new SlowDownSound(),this,1.5);
         super.useItem();
      }
  enterFrameHandler(event: Event): void {
         var _loc_2= null;
         _loc_2 = new SpeedSparkleGraphic();
         _loc_2.x = this.player.x + Math.random() * 20 - 10;
         _loc_2.y = this.player.y - Math.random() * 55;
         var _loc_3= Math.random();
         _loc_2.scaleY = Math.random();
         _loc_2.scaleX = _loc_3;
         EffectMapLayer.addEffect(_loc_2);
      }
  useItem(): void {
         var speedDuration= 0;
         if(!this.used)
         {
            this.used = true;
            speedDuration = this.settings.duration;
            this.stopTimeout = uint(setTimeout($b(this, 'endSpeedBurst'),speedDuration));
            this.player.itemAccelBoost = 2;
            this.player.speedBurstSpeedBoost = 0.2 * this.settings.strength;
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
            Sounds.startGameSound(new SpeedUpSound(),this.player,1.5);
         }
      }
  remove(): void {
         this.player.itemAccelBoost = 1;
         this.player.speedBurstSpeedBoost = 0;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         clearTimeout(this.stopTimeout);
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "speedBurst";
      }
}
$reg('com.jiggmin.pr3.items.SpeedBurst', SpeedBurst);
