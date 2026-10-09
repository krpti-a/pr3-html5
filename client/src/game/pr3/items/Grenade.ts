// Ported from com/jiggmin/pr3/items/Grenade.as
import { Point } from '../../../flash/index.ts';
import { Item } from './Item.ts';
import { GamePage, GrenadeEffect, MatchPage, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Grenade extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               SocketManager.socket.sendUseItem();
            }
         }
         var extraKnockback: number= 0;
         if(this.player.tinfoilHat)
         {
            extraKnockback = 999;
         }
         var itemPoint: Point= this.getItemPoint();
         var grenade: GrenadeEffect= new GrenadeEffect(this.player,this.settings.blastdelay,this.settings.throwforcex,this.settings.throwforcey,this.settings.blastradius,this.settings.hurtarea,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.recovery,this.settings.blastdamage,this.settings.blastrecovery);
         grenade.x = itemPoint.x;
         grenade.y = itemPoint.y;
         grenade.initTest();
         super.useItem();
      }
  remove(): void {
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "grenade";
      }
}
$reg('com.jiggmin.pr3.items.Grenade', Grenade);
