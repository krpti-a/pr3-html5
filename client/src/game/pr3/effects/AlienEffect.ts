// Ported from com/jiggmin/pr3/effects/AlienEffect.as
import { Event, getTimer } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { ActivePlayer, AlienGraphic, BlockMapLayer, CurveLaserEffect, LaserSound, MapManager, Maths, PM_PRNG, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class AlienEffect extends Effect {
  declare m: any;
  minX: number = NaN;
  minY: number = NaN;
  padding: number = 500;
  aimAngle: number = 0;
  aimAngleRandomness: number = 1;
  maxVel: number = 10;
  velX: number = 0;
  velY: number = 0;
  maxAccel: number = 0.5;
  maxX: number = NaN;
  maxY: number = NaN;
  shootCounter: number = 0;
  shootFreq: number = 200;
  shootFreqMin: number = NaN;
  shootThreshold: number = 150;
  reload: number = 0;
  bDamage: number = 0;
  bKnockback: number = NaN;
  bRecovery: number = 0;
  bSpeed: number = NaN;
  bRange: number = NaN;
  bMaxVel: number = NaN;
  bAccel: number = NaN;
  bRotateMultiplier: number = NaN;
  bRotateBaseline: number = NaN;
  bExplodeOnHit: boolean = false;
  lastMS: number = NaN;
  declare randGenerator: PM_PRNG;
  speedMultiplier: number = NaN;
  declare owner: ActivePlayer;
  enterFrameHandler(event: Event): void {
         var _loc_2: number= getTimer() - this.lastMS;
         var _loc_3: number= 1000 / 30;
         while(_loc_2 > _loc_3)
         {
            _loc_2 -= _loc_3;
            this.lastMS += _loc_3;
            this.step();
         }
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         this.randGenerator = null;
         this.m = null;
         super.remove();
      }
  step(): void {
         var _loc_1: CurveLaserEffect= null;
         this.velX += this.randGenerator.nextDoubleRange(-this.maxAccel,this.maxAccel);
         this.velY += this.randGenerator.nextDoubleRange(-this.maxAccel,this.maxAccel);
         this.velX = Maths.limit(this.velX,-this.maxVel,this.maxVel);
         this.velY = Maths.limit(this.velY,-this.maxVel,this.maxVel);
         this.x += this.velX * this.speedMultiplier;
         this.y += this.velY * this.speedMultiplier;
         if(this.x < this.minX && this.velX < 0 || this.x > this.maxX && this.velX > 0)
         {
            this.velX *= -1;
         }
         if(this.y < this.minY && this.velY < 0 || this.y > this.maxY && this.velY > 0)
         {
            this.velY *= -1;
         }
         --this.shootCounter;
         if(this.shootCounter < this.shootThreshold && this.shootCounter % this.reload == 0)
         {
            Sounds.startGameSound(new LaserSound(),this,1.5);
            _loc_1 = new CurveLaserEffect(this.owner,this.randGenerator.nextIntRange(1,1000),this.bRotateMultiplier,this.bExplodeOnHit,this.bDamage,this.bKnockback,this.bRecovery,this.bSpeed,this.bRange,this.bMaxVel,this.bAccel,this.bRotateBaseline);
            _loc_1.x = this.x;
            _loc_1.y = this.y;
            _loc_1.rotation = this.aimAngle;
            this.parent.addChildAt(_loc_1,0);
         }
         if(this.shootCounter <= 0)
         {
            this.shootCounter = int(this.shootFreqMin >= this.shootFreq ? this.shootFreq : int(this.randGenerator.nextIntRange(this.shootFreqMin,this.shootFreq)));
            this.aimAngle += (Number(this.randGenerator.nextIntRange(1,6 * 60)) - this.aimAngle) * this.aimAngleRandomness;
         }
      }
  constructor(param1: number) {
         super();
         this.m = new AlienGraphic();
         this.addChild(this.m);
         this.shootCounter = int(this.shootFreq);
         this.shootFreqMin = this.shootFreq / 4;
         this.randGenerator = new PM_PRNG(param1);
         var _loc_2: BlockMapLayer= MapManager.map.blockMap;
         this.maxY = _loc_2.maxY + this.padding;
         this.minY = _loc_2.minY - this.padding;
         this.maxX = _loc_2.maxX + this.padding;
         this.minX = _loc_2.minX - this.padding;
         this.x = this.randGenerator.nextIntRange(this.minX,this.maxX);
         this.y = this.randGenerator.nextIntRange(this.minY,this.maxY);
         this.reload = int(5);
         this.bDamage = int(1);
         this.bKnockback = 1;
         this.bRecovery = int(2500);
         this.bSpeed = 14.5;
         this.bRange = 100;
         this.bMaxVel = 20.5;
         this.bAccel = 1;
         this.bRotateMultiplier = 1;
         this.bRotateBaseline = 0;
         this.bExplodeOnHit = true;
         this.speedMultiplier = 1;
         this.aimAngle = this.randGenerator.nextIntRange(1,6 * 60);
         this.maxAccel = 0.5;
         this.lastMS = getTimer();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.effects.AlienEffect', AlienEffect);
