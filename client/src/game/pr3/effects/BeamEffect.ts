// Ported from com/jiggmin/pr3/effects/BeamEffect.as
import { DisplayObject, Event } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { ProjectileEffect } from './ProjectileEffect.ts';
import { ActivePlayer, BeamEffectGraphic, GamePage, MatchPage } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BeamEffect extends ProjectileEffect {
  hitSpace: number = 39;
  declare m: any;
  growing: number = 0;
  declare freezer: ActivePlayer;
  init(): void {
      }
  go(event: Event): void {
         this.checkObjectForPlayers(this.m);
         this.x = this.freezer.x;
         this.y = this.freezer.y - 32;
         if(this.growing == 0)
         {
            this.scaleY += 0.3;
            if(this.scaleY >= 1)
            {
               this.growing = int(1);
            }
         }
         else if(this.growing == 1)
         {
            this.scaleY -= 0.008;
            if(this.scaleY <= 0.9)
            {
               this.growing = int(2);
            }
         }
         else if(this.growing == 2)
         {
            this.scaleY -= 0.2;
            if(this.scaleY <= 0)
            {
               this.remove();
            }
         }
      }
  checkObjectForPlayers(object: DisplayObject): void {
         if(!(GamePage.instance instanceof MatchPage) || !(GamePage.instance).antiCheat)
         {
            super.checkObjectForPlayers(object);
         }
      }
  remove(): void {
         if(this.m != null)
         {
            this.m.stop();
            if(this.m.parent != null)
            {
               this.m.parent.removeChild(this.m);
            }
            this.m = null;
         }
         super.remove();
      }
  hit(params: any): void {
      }
  constructor(param1: ActivePlayer) {
         super(param1);
         this.m = new BeamEffectGraphic();

         this.scaleY = 0.1;
         this.scaleX = 0.5;
         this.velX = 5 * this.scaleX;
         this.hitSpace = int(this.hitSpace * (this.scaleX));
         this.life = int(50);
         this.hitVelX = 0.75 * this.scaleX;
         this.hitVelY = -0.33;
         this.freezer = param1;
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.effects.BeamEffect', BeamEffect);
