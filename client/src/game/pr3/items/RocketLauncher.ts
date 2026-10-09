// Ported from com/jiggmin/pr3/items/RocketLauncher.as
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { GamePage, LocalPlayer, MatchPage, MissileLauncherSound, RocketEffect, SocketManager, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RocketLauncher extends Item {
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
         var _loc_5= undefined;
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               if(this.player instanceof LocalPlayer)
               {
                  if(this.player.facing == "left")
                  {
                     _loc_1 *= -1;
                     this.player.velX += this.settings.recoil;
                  }
                  else
                  {
                     this.player.velX -= this.settings.recoil;
                  }
               }
               Sounds.startGameSound(new MissileLauncherSound(),this.player,1);
               super.useItem();
               SocketManager.socket.sendUseItem();
            }
         }
         else
         {
            _loc_4 = 0;
            _loc_1 = 29;
            if(this.player instanceof LocalPlayer)
            {
               if(this.player.facing == "left")
               {
                  _loc_1 *= -1;
                  this.player.velX += this.settings.recoil;
               }
               else
               {
                  this.player.velX -= this.settings.recoil;
               }
            }
            Sounds.startGameSound(new MissileLauncherSound(),this.player,1);
            _loc_2 = this.getItemPoint(_loc_1,-15);
            _loc_3 = _loc_2.x;
            _loc_4 = _loc_2.y;
            currentRotation = this.settings.rotation[0];
            if(this.player.facing == "left")
            {
               currentRotation *= -1;
            }
            for(times = int(0); times <= this.settings.repeat; times++)
            {
               extraKnockback = 0;
               extraSpeed = 0;
               if(this.player.tinfoilHat)
               {
                  extraKnockback = 999;
               }
               if(this.settings.randomvel != 0)
               {
                  extraSpeed += Math.floor(Math.random() * (this.settings.randomvel + 1) * 2) - this.settings.randomvel;
               }
               _loc_5 = new RocketEffect(this.player,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.speed + extraSpeed,this.settings.accel,this.settings.maxvel,this.settings.range,currentRotation,this.settings.phasing,this.settings.noknockback);
               _loc_5.x = _loc_3;
               _loc_5.y = _loc_4;
               _loc_5.initTest();
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
                  _loc_5.rotation += Math.floor(Math.random() * (this.settings.spread + 1) * 2) - this.settings.spread;
               }
            }
            super.useItem();
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "rocketLauncher";
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.RocketLauncher', RocketLauncher);
