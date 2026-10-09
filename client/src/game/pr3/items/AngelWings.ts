// Ported from com/jiggmin/pr3/items/AngelWings.as
import { Event } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { Sounds, WingFlapSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class AngelWings extends Item {
  flapCounter: number = 0;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(this.flapCounter == 0)
         {
            this.flapCounter = int(15);
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
            this.player.itemGraphic.angelWings.gotoAndPlay("flap");
            Sounds.startGameSound(new WingFlapSound(),this.player,1);
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         if(this.player.velY > 0)
         {
            this.player.velY = 0;
         }
         if(this.player.velY > -0.5)
         {
            this.player.velY -= 0.03 * this.settings.strength;
         }
         if(this.player.facing == "right")
         {
            this.player.velX += 0.06 * this.settings.strength;
         }
         else
         {
            this.player.velX -= 0.06 * this.settings.strength;
         }
         --this.flapCounter;
         if(this.flapCounter <= 0)
         {
            super.useItem();
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "angelWings";
      }
}
$reg('com.jiggmin.pr3.items.AngelWings', AngelWings);
