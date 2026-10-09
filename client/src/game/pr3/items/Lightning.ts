// Ported from com/jiggmin/pr3/items/Lightning.as
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { GamePage, Items, LightningEffect, LocalPlayer, Sounds, ZapSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Lightning extends Item {
  sap: number = 0;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         var _loc_1= GamePage.instance.localPlayer;
         if(_loc_1 != null)
         {
            _loc_1.checkForDamage(this.player,this.settings.damage,this.sap);
            if(this.player instanceof LocalPlayer)
            {
               new LightningEffect(_loc_1,"launch");
            }
            else if(_loc_1.itemAbbr == Items.LIGHTNING || _loc_1.partyHat == true || Boolean(_loc_1.checkForFriendlyFire(this.player)))
            {
               new LightningEffect(_loc_1,"surround");
            }
            else
            {
               new LightningEffect(_loc_1,"zap");
               _loc_1.hit(0,0,this.settings.damage);
            }
            Sounds.startSound(new ZapSound(),1.5);
         }
         super.useItem();
      }
  constructor() {
         super();
         this.itemKeyframeName = "lightning";
         this.sap = int(0);
      }
}
$reg('com.jiggmin.pr3.items.Lightning', Lightning);
