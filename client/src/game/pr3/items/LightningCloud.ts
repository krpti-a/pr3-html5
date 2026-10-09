// Ported from com/jiggmin/pr3/items/LightningCloud.as
import { SoundChannel } from '../../../flash/index.ts';
import { Item } from './Item.ts';
import { CloudEffect, Shield1Sound, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LightningCloud extends Item {
  declare soundChannel: SoundChannel;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
    var cloud; // undeclared in decompiled source
         cloud = new CloudEffect(this.player,this.player,this.settings.damage,this.settings.zaptime,this.settings.zaps,this.settings.recovery,this.settings.extrazaptime,this.settings.passcooldown);
         Sounds.startGameSound(new Shield1Sound(),this.player,1);
         super.useItem();
      }
  constructor() {
         super();
         this.itemKeyframeName = "lightningCloud";
      }
}
$reg('com.jiggmin.pr3.items.LightningCloud', LightningCloud);
