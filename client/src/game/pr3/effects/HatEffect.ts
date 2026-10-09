// Ported from com/jiggmin/pr3/effects/HatEffect.as
import { ColorTransform, Point } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { RealEffect } from './RealEffect.ts';
import { GamePage, HatGraphic, MapManager, MatchPage } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class HatEffect extends RealEffect {
  color: number = 0;
  num: number = 0;
  declare m: HatGraphic;
  waitSteps: number = 30;
  id: number = 0;
  remove(): void {
         this.m = null;
         super.remove();
         if(GamePage.instance != null && MatchPage.instance != null && MatchPage.instance.levelType != null && MatchPage.instance.levelType == "kingOfTheHat")
         {
            GamePage.instance.minimap.removeMiniHat(this.id);
         }
      }
  step(): void {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_3= null;
         super.step();
         if(this.waitSteps > 0)
         {
            _loc_4 = this;
            _loc_5 = this.waitSteps - 1;
            _loc_4.waitSteps = _loc_5;
         }
         else if(this.touchingLocalPlayer())
         {
            _loc_3 = ({} as any);
            _loc_3.id = this.id;
            _loc_3.num = this.num;
            _loc_3.color = this.color;
            GamePage.instance.grabHat(_loc_3);
            this.remove();
         }
         var _loc_1= 400;
         var _loc_2= MapManager.map.blockMap;
         if(_loc_2 != null)
         {
            if(this.x > _loc_2.maxX + _loc_1)
            {
               this.gotoSafePosition();
            }
            if(this.x < _loc_2.minX - _loc_1)
            {
               this.gotoSafePosition();
            }
            if(this.y > _loc_2.maxY + _loc_1)
            {
               this.gotoSafePosition();
            }
            if(this.y < _loc_2.minY - _loc_1 && MapManager.map.rot != 0)
            {
               this.gotoSafePosition();
            }
            if(MatchPage.instance != null && MatchPage.instance != null && MatchPage.instance.levelType != null && MatchPage.instance.levelType == "kingOfTheHat")
            {
               GamePage.instance.minimap.moveMiniHat(new Point(this.x,this.y),this.id,this.num,this.color);
            }
         }
      }
  gotoSafePosition(): void {
         var _loc_1= null;
         _loc_1 = GamePage.instance.getNextStartPos();
         this.x = _loc_1.x + 20;
         this.y = _loc_1.y;
      }
  constructor(param1: number, param2: number, param3: number) {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         var _loc_5= undefined;
         super();
         this.m = new HatGraphic();
         if(param1 < 1 || param1 > 19)
         {
            param1 = int(1);
         }
         this.id = int(param3);
         this.num = int(param1);
         this.color = int(param2);
         _loc_5 = 0.4;
         this.scaleY = 0.4;
         this.scaleX = _loc_5;
         this.m.gotoAndStop(param1);
         this.m.colorMC.gotoAndStop(param1);
         var _loc_4= new ColorTransform();
         _loc_4.color = param2;
         this.m.colorMC.transform.colorTransform = _loc_4;
         this.addChild(this.m);
         this.velY = -5;
         this.fricX = 0.95;
         if(GamePage.instance != null && MatchPage.instance != null && MatchPage.instance.levelType != null && MatchPage.instance.levelType == "kingOfTheHat")
         {
            GamePage.instance.minimap.createMiniHat(new Point(this.x,this.y),this.id);
         }
      }
}
$reg('com.jiggmin.pr3.effects.HatEffect', HatEffect);
