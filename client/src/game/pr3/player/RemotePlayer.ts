// Ported from com/jiggmin/pr3/player/RemotePlayer.as
import { Event } from '../../../flash/index.ts';
import { $keys } from '../../../flash/as3.ts';
import { ActivePlayer } from './ActivePlayer.ts';
import { Maths } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RemotePlayer extends ActivePlayer {
  compensateX: number = 0;
  compensateEase: number = 5;
  compensateY: number = 0;
  declare updateArray: any[];
  compensateTimer: number = 0;
  remove(): void {
         this.updateArray = null;
         super.remove();
      }
  step(param1: number): void {
         super.step(param1);
      }
  enterFrameHandler(event: Event): void {
         var _loc_3= undefined;
         var _loc_4= undefined;
         var _loc_2= null;
         super.enterFrameHandler(event);
         if(this.updateArray.length > 0)
         {
            _loc_2 = this.updateArray.shift();
            this.applyUpdate(_loc_2);
         }
         if(this.compensateTimer > 0)
         {
            _loc_3 = this;
            _loc_4 = this.compensateTimer - 1;
            _loc_3.compensateTimer = _loc_4;
            this.m.x = this.compensateX * this.compensateTimer * (1 / this.scale);
            this.m.y = this.compensateY * this.compensateTimer * (1 / this.scale);
            if(this.m.y > 0 && this.touchingGround)
            {
               this.m.y = 0;
            }
         }
         else
         {
            _loc_3 = 0;
            this.m.y = 0;
            this.m.x = _loc_3;
         }
         this.positionLifeBar();
         if(this.nameBox != null)
         {
            this.nameBox.x = this.m.x;
            this.nameBox.y = this.m.y;
         }
      }
  positionLifeBar(): void {
         super.positionLifeBar();
         if(this.lifeBar != null)
         {
            this.lifeBar.x += this.m.x;
            this.lifeBar.y += this.m.y;
         }
      }
  remoteUseItem(): void {
         if(this.itemClass != null)
         {
            this.itemClass.remoteUseItem();
         }
      }
  applyUpdate(param1: any): void {
         var _loc_6= undefined;
         if(param1.p[0] == null)
         {
            param1.p[0] = this.realX;
         }
         if(param1.p[1] == null)
         {
            param1.p[1] = this.realY;
         }
         if(param1.p[2] == null)
         {
            param1.p[2] = this.velX;
         }
         if(param1.p[3] == null)
         {
            param1.p[3] = this.velY;
         }
         if(param1.p[4] == null)
         {
            param1.p[4] = this.m.scaleX;
         }
         var _loc_2= null;
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_5= NaN;
         for (_loc_2 of $keys(param1))
         {
            if(_loc_2 == "item" && param1["space"] == true)
            {
               this.setVariable("space",true);
            }
            this.setVariable(_loc_2,param1[_loc_2]);
         }
         _loc_3 = this.realX + this.compensateX * this.compensateTimer - param1.p[0];
         _loc_4 = this.realY + this.compensateY * this.compensateTimer - param1.p[1];
         _loc_5 = Maths.pythag(_loc_3,_loc_4);
         this.compensateX = _loc_3 / this.compensateEase;
         this.compensateY = _loc_4 / this.compensateEase;
         this.compensateTimer = this.compensateEase;
         if(param1.teleport == true)
         {
            this.showPoofEffect();
         }
         this.setPosObj(param1);
         if(param1.teleport == true)
         {
            _loc_6 = 0;
            this.compensateY = 0;
            this.compensateX = _loc_6;
            this.showTeleportEffect();
         }
         if(this.velY < 0)
         {
            this.touchingGround = false;
         }
      }
  receiveUpdate(param1: any): void {
         if(this.updateArray != null)
         {
            this.updateArray.push(param1);
         }
      }
  setPosObj(param1: any): void {
         var _loc_2= param1.p;
         this.realX = _loc_2[0];
         this.realY = _loc_2[1];
         this.velX = _loc_2[2];
         this.velY = _loc_2[3];
         this.m.scaleX = _loc_2[4];
         this.m.x = 0;
         this.m.y = 0;
         this.x = this.realX;
         this.y = this.realY;
      }
  constructor() {
         super();
         this.updateArray = new Array();
      }
}
$reg('com.jiggmin.pr3.player.RemotePlayer', RemotePlayer);
