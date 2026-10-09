// Ported from com/jiggmin/ui/SliderClass.as
import { Event, MouseEvent, MovieClip, Point } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { Maths } from '../refs.ts';
import { $reg } from '../refs.ts';

export class SliderClass extends Removable {
  declare bg: MovieClip;
  _minimum: number = 0;
  maxPos: number = NaN;
  _snapInterval: number = 1;
  declare thumb: MovieClip;
  thumbPadding: number = 4;
  _maximum: number = 100;
  minPos: number = NaN;
  _value: number = 50;
  set maximum(param1: number) {
         this._maximum = param1;
         if(this._value > this._maximum)
         {
            this._value = this._maximum;
         }
         this.valueToPos();
      }
  posToValue(): number {
         var _loc_1= this._maximum - this._minimum;
         var _loc_2= this.maxPos - this.minPos;
         var _loc_3= (this.thumb.x - this.minPos) / _loc_2;
         var _loc_4= _loc_1 * _loc_3 + this._minimum;
         this._value = Math.round(_loc_4 / this._snapInterval) * this._snapInterval;
         this.valueToPos();
         return this._value;
      }
  remove(): void {
         this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
         this.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         super.remove();
      }
  set width(param1: number) {
         this.bg.width = param1;
         this.minPos = this.thumbPadding;
         this.maxPos = param1 - this.thumbPadding - this.thumb.width;
         this.valueToPos();
      }
  get minimum(): number {
         return this._minimum;
      }
  mouseUpHandler(event: MouseEvent): void {
         this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
      }
  mouseMoveHandler(event: MouseEvent): void {
         var _loc_2= new Point(event.stageX,event.stageY);
         _loc_2 = this.globalToLocal(_loc_2);
         var _loc_3= _loc_2.x - this.thumb.width / 2;
         _loc_3 = Maths.limit(_loc_3,this.minPos,this.maxPos);
         this.thumb.x = _loc_3;
         var _loc_4= this._value;
         var _loc_5= this.posToValue();
         if(_loc_4 != _loc_5)
         {
            this.dispatchEvent(new Event(Event.CHANGE));
         }
      }
  set minimum(param1: number) {
         this._minimum = param1;
         if(this._value < this._minimum)
         {
            this._value = this._minimum;
         }
         this.valueToPos();
      }
  mouseDownHandler(event: MouseEvent): void {
         this.stage.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
         this.mouseMoveHandler(event);
      }
  set snapInterval(param1: number) {
         this._snapInterval = param1;
         this.posToValue();
      }
  get maximum(): number {
         return this._maximum;
      }
  valueToPos(): number {
         var _loc_1= this._maximum - this._minimum;
         var _loc_2= this.maxPos - this.minPos;
         var _loc_3= (this._value - this._minimum) / _loc_1;
         this.thumb.x = _loc_2 * _loc_3 + this.minPos;
         return this.thumb.x;
      }
  set value(param1: number) {
         this._value = Math.round(param1 / this._snapInterval) * this._snapInterval;
         this.valueToPos();
      }
  get value(): number {
         return this._value;
      }
  get width(): any { return super.width; }
  constructor() {
         super();
         this.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
         this.width = this.width;
         this.scaleX = 1;
         this.thumb.buttonMode = true;
         this.thumb.useHandCursor = true;
      }
}
$reg('com.jiggmin.ui.SliderClass', SliderClass);
