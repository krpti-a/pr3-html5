// Ported from com/jiggmin/pr3/items/LaserGun.as
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { GamePage, LaserEffect, LaserSound, LocalPlayer, MatchPage, SocketManager, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LaserGun extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         var _loc_4= undefined;
         var _loc_1= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var currentRotation= undefined;
         var times: number = int(0);
         var extraKnockback: number= NaN;
         var extraSpeed: number= NaN;
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               if(!this.customTexture || this.customTexture && this.settings.useanimation == true)
               {
                  this.player.itemGraphic.laserGun.gotoAndPlay(0);
               }
               if(this.player instanceof LocalPlayer)
               {
                  if(this.player.facing == "left")
                  {
                     this.player.velX += this.settings.recoil;
                  }
                  else
                  {
                     this.player.velX -= this.settings.recoil;
                  }
               }
               super.useItem();
               Sounds.startGameSound(new LaserSound(),this.player,1.5);
               SocketManager.socket.sendUseItem();
            }
         }
         else
         {
            _loc_4 = null;
            if(!this.customTexture || this.customTexture && this.settings.useanimation == true)
            {
               this.player.itemGraphic.laserGun.gotoAndPlay(0);
            }
            if(this.player instanceof LocalPlayer)
            {
               if(this.player.facing == "left")
               {
                  this.player.velX += this.settings.recoil;
               }
               else
               {
                  this.player.velX -= this.settings.recoil;
               }
            }
            Sounds.startGameSound(new LaserSound(),this.player,1.5);
            _loc_1 = this.getItemPoint();
            _loc_2 = _loc_1.x;
            _loc_3 = _loc_1.y;
            currentRotation = this.settings.rotation[0];
            if(this.player.facing == "left")
            {
               currentRotation *= -1;
            }
            super.useItem();
            for(times = int(0); times <= this.settings.repeat; times++)
            {
               extraKnockback = 0;
               extraSpeed = 0;
               if(this.player.tinfoilHat)
               {
                  extraKnockback = 999;
               }
               if(this.player.policeHat)
               {
                  extraSpeed = this.settings.speed * 0.15;
               }
               if(this.settings.randomvel != 0)
               {
                  extraSpeed += Math.floor(Math.random() * (this.settings.randomvel + 1) * 2) - this.settings.randomvel;
               }
               _loc_4 = new LaserEffect(this.player,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.speed + extraSpeed,this.settings.range,currentRotation,this.settings.phasing,false,this.settings.transferhit,this.settings.transferfade,this.settings.noknockback);
               _loc_4.x = _loc_2;
               _loc_4.y = _loc_3;
               _loc_4.initTest();
               if(this.player.facing == "left")
               {
                  currentRotation -= this.settings.rotation[1];
               }
               else
               {
                  currentRotation += this.settings.rotation[1];
               }
               if(this.settings.spread != 0)
               {
                  _loc_4.rotation += Math.floor(Math.random() * (this.settings.spread + 1) * 2) - this.settings.spread;
               }
            }
         }
      }
  constructor() {
         super();
         this.localOnly = true;
         this.itemKeyframeName = "laserGun";
      }
}
$reg('com.jiggmin.pr3.items.LaserGun', LaserGun);
