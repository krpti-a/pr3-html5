// Ported from com/jiggmin/pr3/effects/BlackHoleEffect.as
import { Event, Point, SoundChannel, getTimer } from '../../../flash/index.ts';
import { int, $each, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, BlackHoleGraphic, BlackHoleSound, Data, GamePage, Maths, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlackHoleEffect extends Effect {
  lastFrameTime: number = 0;
  declare m: any;
  declare fromPlayer: ActivePlayer;
  targetAlpha: any = 0;
  declare soundChannel: SoundChannel;
  life: number = 9900;
  strength: number = 1;
  speedx: number = 0;
  speedy: number = 0;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         Sounds.stopMovingSound(this.soundChannel);
         this.soundChannel = null;
         this.fromPlayer = null;
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         var _loc_3: number= Number(NaN);
         var _loc_4: ActivePlayer= null;
         var _loc_5: number= Number(NaN);
         var _loc_6: number= Number(NaN);
         var _loc_7: number= Number(NaN);
         var _loc_8: number= Number(NaN);
         var _loc_9: number= Number(NaN);
         var _loc_10: number= Number(NaN);
         var _loc_11: number= Number(NaN);
         var _loc_12: Point= null;
         var _loc_2: number = int(int(getTimer()));
         _loc_3 = _loc_2 - this.lastFrameTime;
         this.lastFrameTime = _loc_2;
         this.alpha = (Math.random() * 0.25 + 0.75) * this.targetAlpha;
         this.rotation += 1.3;
         if(this.targetAlpha < 1 && this.life > 3300)
         {
            this.targetAlpha += 0.01;
         }
         if(this.life < 3300)
         {
            this.targetAlpha = this.life / 3300;
         }
         var _loc_13: number= this.alpha;
         this.scaleY = this.alpha;
         this.scaleX = _loc_13;
         for (_loc_4 of $each(GamePage.instance.playerArray))
         {
            if(_loc_4 != this.fromPlayer)
            {
               if(!_loc_4.checkForFriendlyFire(this.fromPlayer))
               {
                  _loc_5 = _loc_4.x - this.x;
                  _loc_6 = _loc_4.y - this.y;
                  _loc_7 = Number(Maths.pythag(_loc_5,_loc_6));
                  _loc_8 = 500 - _loc_7;
                  if(_loc_8 > 0)
                  {
                     _loc_9 = Math.atan2(_loc_6,_loc_5);
                     _loc_10 = Math.cos(_loc_9) * _loc_8;
                     _loc_11 = Math.sin(_loc_9) * _loc_8;
                     _loc_12 = Data.rotatePoint(_loc_10,_loc_11,_loc_4.rotation);
                     _loc_4.velX -= _loc_12.x / 2000 * this.alpha / 33 * _loc_3 * this.strength;
                     _loc_4.velY -= _loc_12.y / 2000 * this.alpha / 33 * _loc_3 * this.strength;
                  }
               }
            }
         }
         this.life = int(this.life - (_loc_3));
         this.x += this.speedx;
         this.y += this.speedy;
         if(this.life <= 0)
         {
            this.remove();
         }
      }
  constructor(param1: ActivePlayer, param2: number = 9900, param3: number = 1, speedx: number = 0, speedy: number = 0) {
    param2 = int(param2); speedx = int(speedx); speedy = int(speedy);
         super();
         this.m = new BlackHoleGraphic();
         this.fromPlayer = param1;
         this.addChild(this.m);
         this.lastFrameTime = getTimer();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.soundChannel = Sounds.startMovingSound(new BlackHoleSound(),this,1,1);
         this.alpha = 0;
         this.life = int(param2);
         this.strength = param3;
         this.speedx = speedx;
         this.speedy = speedy;
      }
}
$reg('com.jiggmin.pr3.effects.BlackHoleEffect', BlackHoleEffect);
