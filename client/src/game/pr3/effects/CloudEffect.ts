// Ported from com/jiggmin/pr3/effects/CloudEffect.as
import { Event, Point } from '../../../flash/index.ts';
import { int, $each, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, CloudGraphic, GamePage, Items, LightningEffect, LocalPlayer, Sounds, ZapSound } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class CloudEffect extends Effect {
  declare follow: ActivePlayer;
  declare fromPlayer: ActivePlayer;
  zapTime: number = 270;
  extraZapTime: number = 270;
  declare m: any;
  cooldown: any = 0;
  damage: any = 1;
  zaps: number = 1;
  recovery: number = 2500;
  passCooldown: number = 27;
  canPass: any = true;
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.follow = null;
         this.m.stop();
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  enterFrameHandler(event: Event): void {
         this.matchPlayer();
         if(this.cooldown <= 0 && Boolean($b(this, 'canPass')))
         {
            this.passLightning();
         }
         --this.cooldown;
         --this.zapTime;
         if(this.zapTime <= 0)
         {
            this.follow.checkForDamage(this.fromPlayer,1,0);
            if(this.follow.itemAbbr == Items.LIGHTNING || this.follow.partyHat == true)
            {
               if(this.follow instanceof LocalPlayer)
               {
                  new LightningEffect(this.follow,"surround");
               }
            }
            else if(this.follow instanceof LocalPlayer)
            {
               new LightningEffect(this.follow,"zap");
               if(this.recovery != 2500)
               {
                  this.follow.hitBySnowball = true;
                  this.follow.tempRecoverySpeed = int(this.recovery);
               }
               this.follow.hit(0,0,this.damage);
            }
            Sounds.startSound(new ZapSound(),1.5 * this.damage);
            --this.zaps;
            if(this.zaps <= 0)
            {
               this.remove();
            }
            else
            {
               this.zapTime = int(this.extraZapTime);
            }
         }
      }
  matchPlayer(): void {
         this.x = this.follow.x;
         this.y = this.follow.y - 20;
         this.rotation = this.follow.rotation;
      }
  passLightning(): void {
         var _loc_3= null;
         var _loc_1= false;
         var _loc_2= null;
         for (_loc_2 of $each(GamePage.instance.playerArray))
         {
            if(_loc_2 != null)
            {
               if(_loc_2 != this.follow)
               {
                  _loc_3 = this.follow.localToGlobal(new Point(0,0));
                  _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
                  if(!_loc_1)
                  {
                     _loc_3 = this.follow.localToGlobal(new Point(0,-this.follow.height));
                     _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
                  }
                  if(_loc_1)
                  {
                     this.follow = _loc_2;
                     this.cooldown = this.passCooldown;
                     this.canPass = false;
                     break;
                  }
               }
            }
         }
      }
  constructor(param1: ActivePlayer, param2: ActivePlayer, damage: number = 1, zaptime: number = 270, zaps: number = 1, recovery: number = 2500, extrazaptime: number = 270, passcooldown: number = 27) {
    damage = int(damage); zaptime = int(zaptime); zaps = int(zaps); recovery = int(recovery); extrazaptime = int(extrazaptime); passcooldown = int(passcooldown);
         super();
         this.damage = damage;
         this.follow = param1;
         this.fromPlayer = param2;
         this.zapTime = int(zaptime);
         this.extraZapTime = int(extrazaptime);
         this.zaps = int(zaps);
         this.passCooldown = int(passcooldown);
         this.recovery = int(recovery);
         this.m = new CloudGraphic();
         this.addChild(this.m);
         this.m.scaleX = 0.75;
         this.m.scaleY = 0.75;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.matchPlayer();
      }
}
$reg('com.jiggmin.pr3.effects.CloudEffect', CloudEffect);
