// Ported from com/jiggmin/pr3/items/SuperJump.as
import { Item } from './Item.ts';
import { Sounds, SuperJumpSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SuperJump extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(!this.player.crouching)
         {
            Sounds.startGameSound(new SuperJumpSound(),this.player,2);
            if(this.player.velY > 0)
            {
               this.player.velY = 0;
            }
            this.player.velY -= this.settings.strength;
            super.useItem();
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "superJump";
      }
}
$reg('com.jiggmin.pr3.items.SuperJump', SuperJump);
