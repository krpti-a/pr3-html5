// Ported from com/jiggmin/pr3/items/Napalm.as
import { SoundChannel, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { uint, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { Napalm1Sound, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Napalm extends Item {
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
            this.stopTimeout = uint(setTimeout($b(this, 'endNapalm'),this.settings.duration));
            this.player.napalm = true;
            Sounds.startGameSound(new Napalm1Sound(),this.player,2);
         }
      }
  endNapalm(): void {
         super.useItem();
      }
  remove(): void {
         this.player.napalm = false;
         clearTimeout(this.stopTimeout);
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "napalm";
      }
}
$reg('com.jiggmin.pr3.items.Napalm', Napalm);
