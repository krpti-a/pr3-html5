// Ported from com/jiggmin/pr3/items/Shield.as
import { SoundChannel, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { uint, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { Shield1Sound, Shield2Sound, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Shield extends Item {
  declare soundChannel: SoundChannel;
  used: boolean = false;
  stopTimeout: number = 0;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(!this.used)
         {
            this.used = true;
            this.stopTimeout = uint(setTimeout($b(this, 'endShield'),this.settings.duration));
            this.player.shield = true;
            this.soundChannel = Sounds.startMovingSound(new Shield2Sound(),this.player,1,999);
            Sounds.startGameSound(new Shield1Sound(),this.player,1);
         }
      }
  endShield(): void {
         super.useItem();
      }
  remove(): void {
         if(this.soundChannel != null)
         {
            Sounds.stopMovingSound(this.soundChannel);
            this.soundChannel = null;
         }
         this.player.shield = false;
         clearTimeout(this.stopTimeout);
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "shield";
      }
}
$reg('com.jiggmin.pr3.items.Shield', Shield);
