// Ported from com/jiggmin/pr3/lobby/customize/PartSelector.as
import { Event, MouseEvent, TextField } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Color, EZColorPicker, PartSelectorGraphic, Player } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PartSelector extends Removable {
  declare variable: string;
  declare colorPicker: EZColorPicker;
  index: number = 0;
  declare array: any[];
  declare textBox: TextField;
  declare titleArray: any[];
  declare player: Player;
  declare m: any;
  declare descriptionArray: any[];
  changePart(): void {
         var _loc_1= this.array[this.index];
         var _loc_2= this.variable;
         if(_loc_2 != "hat1")
         {
            this.player[this.variable] = _loc_1;
         }
         else
         {
            this.player.hatArray[1] = _loc_1;
         }
         if(_loc_2 == "hat1")
         {
            _loc_2 = "hat";
         }
         this.player.showAppearance();
         if(this.textBox != null)
         {
            this.textBox.text = this.titleArray[_loc_1 - 1] + ": " + this.descriptionArray[_loc_1 - 1];
         }
         else if(this.titleArray != null)
         {
            try
            {
               this.m.nameBox.text = this.titleArray[_loc_1 - 1];
            }
            catch (error)
            {
               this.m.nameBox.text = "undefined";
            }
         }
      }
  remove(): void {
         this.colorPicker.removeEventListener(Event.CHANGE,$b(this, 'changeColorHandler'));
         this.m.leftButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'));
         this.m.rightButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickRight'));
         this.removeChild(this.m);
         this.colorPicker.remove();
         this.colorPicker = null;
         this.m = null;
         this.array = null;
         this.player = null;
         this.textBox = null;
         super.remove();
      }
  getColor(): number {
         return this.colorPicker.getColor();
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
  changeColorHandler(event: Event): void {
         var _loc_2= this.colorPicker.getColor();
         var _loc_3= this.variable + "Color";
         if(_loc_3 != "hat1Color")
         {
            this.player[_loc_3] = _loc_2;
         }
         else
         {
            this.player.hatColorArray[1] = _loc_2;
         }
         var _loc_4= _loc_3;
         if(_loc_3 == "hat1Color")
         {
            _loc_4 = "hatColor";
         }
         this.player.showAppearance();
      }
  getValue(): number {
         return this.array[this.index];
      }
  constructor(param1: Player, param2: string, param3: number, param4: number, param5: any[], param6: any[] = null, param7: any[] = null, param8: TextField = null) {
    param3 = int(param3); param4 = int(param4);
         super();
         this.m = new PartSelectorGraphic();
         this.array = new Array();
         this.player = param1;
         this.variable = param2;
         for (var partID of $each(param5))
         {
            if(param2 == "hat1" && partID >= 1 && partID <= 19 || param2 != "hat1" && partID >= 1 && partID <= 26)
            {
               this.array.push(partID);
            }
         }
         if(this.array.length == 0)
         {
            this.array.push(1);
         }
         this.titleArray = param6;
         this.descriptionArray = param7;
         this.textBox = param8;
         var _loc_9= this.array.indexOf(param3);
         if(this.array.indexOf(param3) != -1)
         {
            this.index = int(_loc_9);
         }
         this.addChild(this.m);
         this.colorPicker = new EZColorPicker();
         this.colorPicker.setColor(param4);
         this.colorPicker.width = 24;
         this.colorPicker.height = 24;
         this.colorPicker.openSide = "left";
         this.colorPicker.x = -15;
         this.colorPicker.y = 3;
         this.m.addChild(this.colorPicker);
         this.colorPicker.addEventListener(Event.CHANGE,$b(this, 'changeColorHandler'),false,0,true);
         this.m.leftButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'),false,0,true);
         this.m.rightButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickRight'),false,0,true);
         this.changePart();
         if(this.array.length <= 1)
         {
            this.alpha = 0.33;
            this.mouseEnabled = false;
            this.mouseChildren = false;
         }
      }
}
$reg('com.jiggmin.pr3.lobby.customize.PartSelector', PartSelector);
