// Ported from com/jiggmin/pr3/effects/CoinEffect.as
import { Point } from '../../../flash/index.ts';
import { $each } from '../../../flash/as3.ts';
import { RealEffect } from './RealEffect.ts';
import { CoinEffectGraphic, CoinSound, GamePage, LocalPlayer, MatchPage, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class CoinEffect extends RealEffect {
  life: number = 250;
  rotVel: number = 0;
  declare m: any;
  remove(): void {
         if(this.m != null)
         {
            this.m.stop();
            this.removeChild(this.m);
            this.m = null;
         }
         super.remove();
      }
  touchGround(): void {
         this.rotVel = this.velX * 5;
         super.touchGround();
      }
  step(): void {
         var _loc_1= null;
         var _loc_2= null;
         super.step();
         this.m.coin.rotation += this.rotVel;
         if(this.life % 3 == 0)
         {
            _loc_1 = this.localToGlobal(new Point(-this.width / 2,0));
            for (_loc_2 of $each(GamePage.instance.playerArray))
            {
               if(_loc_2.touchingPoint(_loc_1.x,_loc_1.y))
               {
                  if(_loc_2 instanceof LocalPlayer && GamePage.instance instanceof MatchPage)
                  {
                     (GamePage.instance).incCoins();
                  }
                  Sounds.startGameSound(new CoinSound(),_loc_2,0.5);
                  this.remove();
                  break;
               }
            }
         }
         var _loc_3= this;
         var _loc_4= this.life - 1;
         _loc_3.life = _loc_4;
         if(this.life < 100)
         {
            this.alpha = this.life / 100;
         }
         if(this.life <= 0)
         {
            this.remove();
         }
      }
  constructor() {
         super();
         this.m = new CoinEffectGraphic();
         this.addChild(this.m);
         this.bounceY = 0.5;
         this.m.coin.rotation = Math.random() * 360;
      }
}
$reg('com.jiggmin.pr3.effects.CoinEffect', CoinEffect);
