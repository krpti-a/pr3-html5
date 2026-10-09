// Ported from com/jiggmin/pr3/items/JetPack.as
import { Event, SoundChannel, getTimer } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { EngineSound, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class JetPack extends Item {
  fuelTime: number = NaN;
  lastFrameTime: number = 0;
  using: boolean = false;
  declare soundChannel: SoundChannel;
  init(itemSettings: any): void {
         super.init(itemSettings);
         this.fuelTime = this.settings.fuel;
      }
  stopSound(): void {
         if(this.soundChannel != null)
         {
            Sounds.stopMovingSound(this.soundChannel);
            this.soundChannel = null;
         }
      }
  startSound(): void {
         if(this.soundChannel == null)
         {
            this.soundChannel = Sounds.startMovingSound(new EngineSound(),this.player,1.25,999);
         }
      }
  tryToUseItem(): void {
         this.using = true;
      }
  enterFrameHandler(event: Event): void {
         var _loc_4= null;
         var _loc_2= getTimer();
         var _loc_3= _loc_2 - this.lastFrameTime;
         this.lastFrameTime = _loc_2;
         if(this.using)
         {
            this.using = false;
            this.startSound();
            if(!this.player.crouching)
            {
               if(this.player.velY < -0.25)
               {
                  this.player.velY -= 0.01 / 33 * _loc_3 * this.settings.force;
               }
               else if(this.player.velY <= 0)
               {
                  this.player.velY -= 0.022 / 33 * _loc_3 * this.settings.force;
               }
               else
               {
                  this.player.velY -= 0.04 / 33 * _loc_3 * this.settings.force;
               }
            }
            if(this.player.itemGraphic.jetPack != null && this.player.itemGraphic.jetPack.anim != null)
            {
               this.player.itemGraphic.jetPack.gotoAndStop("on");
               _loc_4 = this.player.itemGraphic.jetPack.anim;
               if(_loc_4 != null && _loc_4.fire1 != null)
               {
                  _loc_4.fire1.scaleY = Math.random() * 0.5 + 0.5;
                  _loc_4.fire1.alpha = 1;
                  _loc_4.fire2.alpha = Math.random() * 0.5 + 0.5;
               }
            }
            this.fuelTime -= _loc_3;
            if(this.fuelTime <= 0)
            {
               super.useItem();
            }
         }
         else
         {
            this.stopSound();
            if(this.player.itemGraphic != null && this.player.itemGraphic.jetPack != null)
            {
               this.player.itemGraphic.jetPack.gotoAndStop("off");
            }
         }
      }
  useItem(): void {
      }
  remove(): void {
         this.stopSound();
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "jetPack";
         this.lastFrameTime = getTimer();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.items.JetPack', JetPack);
