// Ported from com/jiggmin/pr3/items/Bow.as
import { Event, SoundChannel } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { ArrowEffect, Bow_DrawbackSound, Bow_FireSound, GamePage, MatchPage, SocketManager, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Bow extends Item {
  _pulling: boolean = false;
  pullBackForce: number = 0;
  using: boolean = false;
  declare pullBackSound: SoundChannel;
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  tryToUseItem(): void {
         this.using = true;
      }
  enterFrameHandler(event: Event): void {
         var currentRotation= undefined;
         var times: number = int(0);
         var extraKnockback: number= NaN;
         var _loc_1= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var _loc_4= null;
         if(Boolean(this.using) && (this.pullBackForce < this.settings.maxforce || !this.settings.autofire))
         {
            this.using = false;
            if(this._pulling == false && !this.reloading && this.player.itemGraphic.bow != null)
            {
               this.pullBackSound = Sounds.startGameSound(new Bow_DrawbackSound(),this.player,1.5);
               this.player.itemGraphic.bow.gotoAndPlay("pull");
               this._pulling = true;
            }
            if(this.pullBackForce < this.settings.maxforce)
            {
               this.pullBackForce = int(this.pullBackForce + (this.settings.pullspeed));
            }
         }
         else if(Boolean(this._pulling) && this.player.itemGraphic.bow != null)
         {
            if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
            {
               if(GamePage.instance.localPlayer == this.player)
               {
                  this.player.itemGraphic.bow.gotoAndPlay("release");
                  Sounds.startGameSound(new Bow_FireSound(),this.player,1.5);
                  super.useItem();
                  SocketManager.socket.sendUseItem();
                  this.pullBackForce = int(0);
                  this._pulling = false;
                  this.pullBackSound = null;
               }
            }
            else
            {
               this.player.itemGraphic.bow.gotoAndPlay("release");
               Sounds.startGameSound(new Bow_FireSound(),this.player,1.5);
               currentRotation = this.settings.rotation[0];
               if(this.player.facing == "left")
               {
                  currentRotation *= -1;
               }
               for(times = int(0); times <= this.settings.repeat; times++)
               {
                  extraKnockback = 0;
                  if(this.player.tinfoilHat)
                  {
                     extraKnockback = 999;
                  }
                  _loc_1 = this.getItemPoint();
                  _loc_2 = _loc_1.x;
                  _loc_3 = _loc_1.y;
                  _loc_4 = new ArrowEffect(this.player,this.pullBackForce * 0.5,this.settings.damage,this.settings.knockback + extraKnockback,this.settings.sap,this.settings.recovery,this.settings.range,this.settings.phasing,currentRotation,this.settings.noknockback);
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
               }
               super.useItem();
               this.pullBackForce = int(0);
               this._pulling = false;
               this.pullBackSound = null;
            }
         }
      }
  useItem(): void {
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  constructor() {
         super();
         this.localOnly = true;
         this.itemKeyframeName = "bow";
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.items.Bow', Bow);
