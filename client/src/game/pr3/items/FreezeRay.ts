// Ported from com/jiggmin/pr3/items/FreezeRay.as
import { Event } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { BeamEffect, BeamSound, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class FreezeRay extends Item {
  used: boolean = false;
  useItem(): void {
         if(!this.used)
         {
            this.player.itemGraphic.freezeRay.gotoAndPlay("shoot");
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'sendBeam'),false,0,true);
            this.used = true;
         }
      }
  sendBeam(event: Event): void {
    var _loc_4; // undeclared in decompiled source
         var _loc_1= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var beamDirection: number = int(1);
         var useBeam: boolean= false;
         var usedBeam: boolean= false;
         if(!useBeam && this.player != null && this.player.itemGraphic != null && this.player.itemGraphic.freezeRay != null && this.player.itemGraphic.freezeRay.currentFrame >= 7)
         {
            if(this.player.facing == "right")
            {
               beamDirection = int(1);
               useBeam = true;
            }
            else
            {
               beamDirection = int(-1);
               useBeam = true;
            }
         }
         if(useBeam && !usedBeam)
         {
            Sounds.startGameSound(new BeamSound(),this.player,1.25);
            _loc_1 = this.getItemPoint();
            _loc_2 = _loc_1.x;
            _loc_3 = _loc_1.y;
            _loc_4 = new BeamEffect(this.player);
            _loc_4.x = this.player.x;
            _loc_4.y = this.player.y - 32;
            _loc_4.scaleX = 5 * beamDirection;
            _loc_4.init();
            super.useItem();
            usedBeam = true;
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'sendBeam'));
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "freezeRay";
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.FreezeRay', FreezeRay);
