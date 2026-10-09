// Ported from com/jiggmin/pr3/items/Sword.as
import { Item } from './Item.ts';
import { GamePage, LocalPlayer, MatchPage, SlashEffect, SocketManager, Sounds, SwishSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Sword extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
    var i; // undeclared in decompiled source
         var player_: LocalPlayer= null;
         var _loc_4= undefined;
         var _loc_1= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var extraKnockback: number= NaN;
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               if(!this.customTexture || this.customTexture && this.settings.useanimation == true)
               {
                  this.player.itemGraphic.sword.gotoAndPlay("swing");
               }
               if(this.player instanceof LocalPlayer)
               {
                  if(this.player.facing == "right")
                  {
                     this.player.velX += this.settings.recoil;
                  }
                  else
                  {
                     this.player.velX -= this.settings.recoil;
                  }
               }
               player_ = this.player;
               Sounds.startGameSound(new SwishSound(),this.player,1.25);
               super.useItem();
               SocketManager.socket.sendUseItem();
               if(player_.pirateHat)
               {
                  if(player_.facing == "left")
                  {
                     player_.facing = "right";
                  }
                  else
                  {
                     player_.facing = "left";
                  }
               }
            }
         }
         else
         {
            _loc_4 = null;
            if(this.player instanceof LocalPlayer)
            {
               if(this.player.facing == "right")
               {
                  this.player.velX += this.settings.recoil;
               }
               else
               {
                  this.player.velX -= this.settings.recoil;
               }
            }
            Sounds.startGameSound(new SwishSound(),this.player,1.25);
            if(!this.customTexture || this.customTexture && this.settings.useanimation == true)
            {
               this.player.itemGraphic.sword.gotoAndPlay("swing");
            }
            _loc_1 = this.getItemPoint();
            _loc_2 = _loc_1.x;
            _loc_3 = _loc_1.y;
            extraKnockback = 0;
            if(this.player.tinfoilHat)
            {
               extraKnockback = 999;
            }
            for(i = 0; i < this.settings.slashes; ++i)
            {
               _loc_4 = new SlashEffect(this.player,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.noknockback);
               _loc_4.x = _loc_2 + i * 39;
               if(this.player.facing == "left")
               {
                  _loc_4.x = _loc_2 - i * 39;
               }
               _loc_4.y = _loc_3;
               _loc_4.init();
               if(this.player.pirateHat)
               {
                  if(this.player.facing == "left")
                  {
                     this.player.facing = "right";
                  }
                  else
                  {
                     this.player.facing = "left";
                  }
                  _loc_4 = new SlashEffect(this.player,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.noknockback);
                  _loc_4.x = _loc_2;
                  if(this.player.facing == "left")
                  {
                     _loc_4.x = _loc_2 - i * 39;
                  }
                  _loc_4.y = _loc_3;
                  _loc_4.init();
               }
            }
            super.useItem();
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "sword";
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.Sword', Sword);
