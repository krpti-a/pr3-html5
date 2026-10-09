// Ported from com/jiggmin/pr3/effects/RealEffect.as
import { Event, Point } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { Effect } from './Effect.ts';
import { Block, BlockMapLayer, GamePage, MapManager, Maths } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class RealEffect extends Effect {
  declare blockMap: BlockMapLayer;
  bounceX: number = 0.75;
  bounceY: number = 0;
  fricX: number = 0.99;
  fricY: number = 1;
  velX: number = 0;
  velY: number = 0;
  touchingLocalPlayer(): boolean {
         var _loc_3= null;
         var _loc_1= false;
         var _loc_2= GamePage.instance.localPlayer;
         if(_loc_2 != null)
         {
            _loc_3 = this.localToGlobal(new Point(0,0));
            _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
            if(!_loc_1)
            {
               _loc_3 = this.localToGlobal(new Point(0,-this.height));
               _loc_1 = _loc_2.touchingPoint(_loc_3.x,_loc_3.y);
            }
         }
         return _loc_1;
      }
  remove(): void {
         this.blockMap = null;
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'));
         super.remove();
      }
  step(): void {
         var _loc_1= null;
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         this.x += this.velX;
         this.y += this.velY;
         this.velY += 0.2;
         this.velX *= this.fricX;
         this.velY *= this.fricY;
         if(Math.abs(this.velX) < 0.001)
         {
            this.velX = 0;
         }
         if(this.velY < 0)
         {
            _loc_1 = this.blockMap.getBlockAtPos(this.x,this.y - 10);
            if(_loc_1 != null && Boolean(_loc_1.active))
            {
               this.y = _loc_1.posY + Block.height + 10;
               this.velY *= -this.bounceY;
            }
         }
         if(this.velY > 0)
         {
            _loc_2 = this.blockMap.getBlockAtPos(this.x,this.y);
            if(_loc_2 != null && Boolean(_loc_2.active))
            {
               this.y = _loc_2.posY;
               if(this.velY > 1)
               {
                  this.velY *= -this.bounceY;
               }
               else
               {
                  this.velY = 0;
               }
               this.touchGround();
            }
         }
         if(this.velX < 0)
         {
            _loc_3 = this.blockMap.getBlockAtPos(this.x - 10,this.y - 1);
            if(_loc_3 != null && Boolean(_loc_3.active))
            {
               this.velX *= -this.bounceX;
            }
         }
         if(this.velX > 0)
         {
            _loc_4 = this.blockMap.getBlockAtPos(this.x + 10,this.y - 1);
            if(_loc_4 != null && Boolean(_loc_4.active))
            {
               this.velX *= -this.bounceX;
            }
         }
         this.velX = Maths.limit(this.velX,-10,10);
         this.velY = Maths.limit(this.velY,-10,10);
      }
  touchGround(): void {
      }
  enterFrameHandler(event: Event): void {
         this.step();
      }
  constructor() {
         super();
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler'),false,0,true);
         this.blockMap = MapManager.map.blockMap;
      }
}
$reg('com.jiggmin.pr3.effects.RealEffect', RealEffect);
