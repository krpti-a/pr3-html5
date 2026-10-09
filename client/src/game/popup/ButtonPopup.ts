// Ported from com/jiggmin/popup/ButtonPopup.as
import { DisplayObject, Event, Sprite } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { FocusPopup } from './FocusPopup.ts';
import { EasyButton } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ButtonPopup extends FocusPopup {
  declare buttonArray: any[];
  declare graphicHolder: Sprite;
  declare buttonHolder: Sprite;
  buttonResizeHandler(event: Event): void {
         this.positionButtons();
      }
  addGraphic(param1: DisplayObject): void {
         this.graphicHolder.addChild(param1);
         this.redraw();
      }
  remove(): void {
         var _loc_1= 0;
         var _loc_3= null;
         var _loc_2= this.buttonArray.length;
         _loc_1 = 0;
         while(_loc_1 < _loc_2)
         {
            _loc_3 = this.buttonArray[_loc_1];
            _loc_3.remove();
            _loc_1++;
         }
         this.buttonArray = null;
         super.remove();
      }
  createButton(param1: Function, param2: string): EasyButton {
         var _loc_3= new EasyButton();
         _loc_3.setFunc(param1);
         _loc_3.label = param2;
         this.addButton(_loc_3);
         return _loc_3;
      }
  createButtonToStart(param1: Function, param2: string): EasyButton {
         var _loc_3= new EasyButton();
         _loc_3.setFunc(param1);
         _loc_3.label = param2;
         this.addButtonToStart(_loc_3);
         return _loc_3;
      }
  removeButtonByLabel(label: string): void {
         for(var i= 0; i < this.buttonArray.length; i++)
         {
            if(this.buttonArray[i].label == label)
            {
               this.removeButton(this.buttonArray[i]);
               break;
            }
         }
      }
  hasButtonByLabel(label: string): boolean {
         for(var i= 0; i < this.buttonArray.length; i++)
         {
            if(this.buttonArray[i].label == label)
            {
               return true;
            }
         }
         return false;
      }
  redraw(): void {
         this.positionButtons();
         super.redraw();
      }
  positionButtons(): void {
         var _loc_7= undefined;
         var _loc_1= 0;
         var _loc_3= null;
         var _loc_5= NaN;
         var _loc_2= this.buttonArray.length;
         var _loc_4= this.graphicHolder.width;
         _loc_5 = 0;
         _loc_1 = 0;
         while(_loc_1 < _loc_2)
         {
            _loc_3 = this.buttonArray[_loc_1];
            _loc_3.x = Math.round(_loc_5);
            _loc_5 += _loc_3.width + 5;
            _loc_1++;
         }
         var _loc_6= this.graphicHolder;
         _loc_7 = _loc_6.getBounds(_loc_6.parent);
         this.buttonHolder.x = Math.round(_loc_6.width - this.buttonHolder.width) - 5;
         this.buttonHolder.y = Math.round(_loc_7.y + _loc_7.height + this.padding);
      }
  addButton(param1: EasyButton): void {
         param1.addEventListener(Event.RESIZE,$b(this, 'buttonResizeHandler'),false,0,true);
         this.buttonArray.push(param1);
         this.buttonHolder.addChild(param1);
         this.redraw();
      }
  addButtonToStart(param1: EasyButton): void {
         param1.addEventListener(Event.RESIZE,$b(this, 'buttonResizeHandler'),false,0,true);
         if(this.buttonArray != null)
         {
            this.buttonArray.unshift(param1);
         }
         this.buttonHolder.addChild(param1);
         this.redraw();
      }
  removeButton(button: EasyButton): void {
         button.removeEventListener(Event.RESIZE,$b(this, 'buttonResizeHandler'));
         this.buttonArray.splice(button,1);
         this.buttonHolder.removeChild(button);
         this.redraw();
      }
  getButtonByLabel(label: string): EasyButton {
         for(var i= 0; i < this.buttonArray.length; i++)
         {
            if(this.buttonArray[i].label == label)
            {
               return this.buttonArray[i];
            }
         }
      }
  constructor() {
         super();
         this.buttonArray = new Array();
         this.buttonHolder = new Sprite();
         this.graphicHolder = new Sprite();
         this.holder.addChild(this.buttonHolder);
         this.holder.addChild(this.graphicHolder);
         this.intrusive = true;
         this.autoPosition = true;
         this.dieWithoutFocus = false;
      }
}
$reg('com.jiggmin.popup.ButtonPopup', ButtonPopup);
