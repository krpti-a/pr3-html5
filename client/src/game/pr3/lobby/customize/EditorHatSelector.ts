// Ported from com/jiggmin/pr3/lobby/customize/EditorHatSelector.as
import { ColorTransform, MouseEvent } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { EditorHatSelectorGraphic, Player } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class EditorHatSelector extends Removable {
  declare variable: string;
  index: number = 0;
  declare array: any[];
  declare player: Player;
  declare m: any;
  changePart(): void {
         var hat: any= null;
         var hatID= this.array[this.index];
         this.player.hatArray[1] = hatID;
         var hats: any[]= new Array();
         var i= 1;
         while(i < this.player.hatGraphicArray.length)
         {
            hat = ({} as any);
            hat.num = this.player.hatArray[i];
            hat.color = this.player.hatColorArray[i];
            hats.push(hat);
            i++;
         }
         this.player.setHats(hats);
         this.m.hat.gotoAndStop(hatID);
         this.m.hat.colorMC.gotoAndStop(hatID);
      }
  remove(): void {
         this.m.leftButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'));
         this.m.rightButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickRight'));
         this.removeChild(this.m);
         this.m = null;
         this.array = null;
         this.player = null;
         super.remove();
      }
  clickLeft(event: MouseEvent): void {
         var _loc_2= this;
         var _loc_3= this.index - 1;
         _loc_2.index = _loc_3;
         if(this.index < 0)
         {
            this.index = int(this.array.length - 1);
         }
         this.changePart();
      }
  clickRight(event: MouseEvent): void {
         var _loc_2= this;
         var _loc_3= this.index + 1;
         _loc_2.index = _loc_3;
         if(this.index > this.array.length - 1)
         {
            this.index = int(0);
         }
         this.changePart();
      }
  getValue(): number {
         return this.array[this.index];
      }
  constructor(param1: Player, param2: string, param3: number, param4: number, param5: any[]) {
    param3 = int(param3); param4 = int(param4);
         super();
         this.m = new EditorHatSelectorGraphic();
         this.array = new Array();
         this.player = param1;
         this.variable = param2;
         for (var hatID of $each(param5))
         {
            if(hatID >= 1 && hatID <= 19)
            {
               this.array.push(hatID);
            }
         }
         if(this.array.length == 0)
         {
            this.array.push(1);
         }
         var _loc_9= this.array.indexOf(param3);
         if(this.array.indexOf(param3) != -1)
         {
            this.index = int(_loc_9);
         }
         if(this.player.hatArray[1] != null)
         {
            var initialHatID: number = int(int(this.player.hatArray[1]));
            if(initialHatID < 1 || initialHatID > 19)
            {
               initialHatID = int(1);
            }
            this.m.hat.gotoAndStop(initialHatID);
            this.m.hat.colorMC.gotoAndStop(initialHatID);
         }
         var clrTrans: ColorTransform= new ColorTransform();
         clrTrans.color = this.player.hatColorArray[1];
         this.m.hat.colorMC.transform.colorTransform = clrTrans;
         this.m.hat.scaleX = 0.5;
         this.m.hat.scaleY = 0.5;
         this.addChild(this.m);
         this.m.leftButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'),false,0,true);
         this.m.rightButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickRight'),false,0,true);
         if(this.array.length <= 1)
         {
            this.alpha = 0.33;
            this.mouseEnabled = false;
            this.mouseChildren = false;
         }
      }
}
$reg('com.jiggmin.pr3.lobby.customize.EditorHatSelector', EditorHatSelector);
