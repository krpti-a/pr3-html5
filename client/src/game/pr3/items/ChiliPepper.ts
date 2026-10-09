// Ported from com/jiggmin/pr3/items/ChiliPepper.as
import { setTimeout } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { ChiliPepperBarGraphic, ChiliPepperBiteSound, ChiliPepperFireGraphic, ChiliPepperNotchGraphic, GamePage, MatchPage, SocketManager, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ChiliPepper extends Item {
  declare chargeBar: any;
  chargeBarLength: number = 136;
  declare fire: any;
  doSuperDash: boolean = false;
  dashStrength: number = 1.75;
  dashDuration: number = 0.25;
  dashColor: number = 16711680;
  superChargeAmount: number = 2;
  superDashStrength: number = 3;
  superDashDuration: number = 2;
  superDashColor: number = 16734810;
  chargeBlockSize: number = this.chargeBarLength / this.superChargeAmount;
  init(itemSettings: any): void {
         super.init(itemSettings);
         this.createChargeBar();
      }
  useItem(): void {
    const $this = this;
         var unspiceTimer: number= NaN;
         Sounds.startGameSound(new ChiliPepperBiteSound(),this.player);
         this.doChiliDash();
         this.player.spicedVars = {
            "spiced":true,
            "charges":(this.doSuperDash ? 0 : ++this.player.spicedVars.charges),
            "superSpiced":this.doSuperDash,
            "canBeInvincible":this.doSuperDash,
            "pushedPlayers":[]
         };
         setTimeout(function (): any {
            $this.player.spicedVars = {
               "spiced":false,
               "charges":$this.player.spicedVars.charges,
               "superSpiced":false,
               "canBeInvincible":false,
               "pushedPlayers":[]
            };
         },(this.doSuperDash ? this.superDashDuration : this.dashDuration) * 1000);
         if(this.player.spicedVars.charges >= this.superChargeAmount)
         {
            this.doSuperDash = true;
         }
         if(!this.removed)
         {
            this.progressFire();
         }
         super.useItem();
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               SocketManager.socket.sendUseItem();
            }
         }
      }
  remove(): void {
         this.removed = true;
         while(this.chargeBar.numChildren > 0)
         {
            this.chargeBar.removeChildAt(0);
         }
         this.fire = null;
         this.player.removeChild(this.chargeBar);
         super.remove();
      }
  lerp(a: number, b: number, t: number): number {
         return a * (1 - t) + b * t;
      }
  doChiliDash(): void {
         var lerpedX: number= -this.lerp(0,1,(0.5 - this.player.stage.mouseX / this.player.stage.stageWidth) * 2);
         var lerpedY: number= Number(this.lerp(0,1,(0.5 - this.player.stage.mouseY / this.player.stage.stageHeight) * 2));
         var xCircle: number= lerpedX * Math.sqrt(1 - 0.5 * lerpedY ^ 2);
         var yCircle: number= lerpedY * Math.sqrt(1 - 0.5 * lerpedX ^ 2);
         var magnitude= Math.max(Math.abs(xCircle),Math.abs(yCircle)) * 2.5;
         var power: number= this.doSuperDash ? this.superDashStrength : this.dashStrength;
         this.player.velX = xCircle * (1 / magnitude) * power;
         this.player.velY = -(yCircle * (1 / magnitude)) * (power * 0.75);
         this.player.remainingJumpVel = 0;
         if(this.doSuperDash)
         {
            this.player.tint(this.superDashColor,this.superDashDuration);
         }
         else
         {
            this.player.tint(this.dashColor,this.dashDuration);
         }
      }
  createChargeBar(): void {
         this.chargeBar = new ChiliPepperBarGraphic();
         this.player.addChild(this.chargeBar);
         this.chargeBar.y = -(this.player.height * 2 + 25);
         this.createNotches();
         this.fire = new ChiliPepperFireGraphic();
         this.fire.gotoAndStop("uncharged");
         this.chargeBar.addChild(this.fire);
         this.fire.x = -(this.chargeBarLength / 2) + this.player.spicedVars.charges * this.chargeBlockSize;
         if(this.player.spicedVars.charges == this.superChargeAmount)
         {
            this.doSuperDash = true;
            this.fire.gotoAndStop("charged");
         }
      }
  progressFire(): void {
         this.fire.x = -(this.chargeBarLength / 2) + this.player.spicedVars.charges * this.chargeBlockSize;
         if(this.doSuperDash)
         {
            this.fire.gotoAndStop("charged");
         }
         else
         {
            this.fire.gotoAndStop("uncharged");
         }
      }
  createNotches(): void {
         var notch: any= null;
         var chargeBlockSize: number= this.chargeBarLength / this.superChargeAmount;
         for(var i: number = int(1); i < this.superChargeAmount; i++)
         {
            notch = new ChiliPepperNotchGraphic();
            this.chargeBar.addChild(notch);
            notch.x = -(this.chargeBarLength / 2) + i * this.chargeBlockSize;
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "chiliPepper";
      }
}
$reg('com.jiggmin.pr3.items.ChiliPepper', ChiliPepper);
