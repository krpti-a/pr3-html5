// Ported from com/jiggmin/pr3/items/Heart.as
import { Item } from './Item.ts';
import { BumpHeartSound, Maths, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Heart extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(this.player.lifeBar != null)
         {
            Sounds.startGameSound(new BumpHeartSound(),this.player,10);
            if(this.player.getVars().life < this.player.lifeBar.maxPercent)
            {
               this.player.setVariable("life",Maths.limit(this.player.getVars().life + this.settings.heal,0,this.player.lifeBar.maxPercent));
               super.useItem();
            }
            else
            {
               this.player.lifeBar.maxPercent += this.settings.heal;
               this.player.setVariable("life",Maths.limit(this.player.getVars().life + this.settings.heal,0,this.player.lifeBar.maxPercent));
               super.useItem();
            }
         }
         else
         {
            super.useItem();
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "heart";
      }
}
$reg('com.jiggmin.pr3.items.Heart', Heart);
