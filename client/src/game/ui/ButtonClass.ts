// Ported from com/jiggmin/ui/ButtonClass.as
import { DisplayObject, Event, MouseEvent, MovieClip, TextField, TextFieldAutoSize } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Tipable } from '../basic/Tipable.ts';
import { $reg } from '../refs.ts';

export class ButtonClass extends Tipable {
  _align: string = "center";
  declare downArrow: MovieClip;
  declare earnMoreMedals: MovieClip;
  _selected: boolean = false;
  clickOnMouseDown: boolean = false;
  spaceX: number = 0;
  declare data: any;
  declare upArrow: MovieClip;
  declare addFriendsMessage: MovieClip;
  imagePadding: number = 3;
  declare textHolder: MovieClip;
  declare leftArrow: MovieClip;
  declare func: Function;
  declare bg: MovieClip;
  declare thumbLines: MovieClip;
  declare dateBox: TextField;
  declare rightArrow: MovieClip;
  declare bgHolder: MovieClip;
  declare titleBox: TextField;
  declare image: DisplayObject;
  declare stars: any;
  _autoResize: boolean = true;
  declare medals: MovieClip;
  declare imageHolder: MovieClip;
  h: number = NaN;
  declare commentBox: TextField;
  declare _label: string;
  w: number = NaN;
  sendSelf: boolean = false;
  declare publishedBox: TextField;
  set label(param1: string) {
         if(this.textHolder != null && param1 != null)
         {
            this.textHolder.textBox.text = param1;
            this.resize();
         }
         this._label = param1;
      }
  get label(): string {
         return this._label;
      }
  get align(): string {
         return this._align;
      }
  remove(): void {
         this.removeEventListener(MouseEvent.MOUSE_OVER,$b(this, 'mouseOverHandler'));
         this.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'));
         this.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         this.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
         this.removeEventListener(MouseEvent.CLICK,$b(this, 'mouseClickHandler'));
         this.removeEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'));
         this.image = null;
         this.data = null;
         super.remove();
      }
  set autoResize(param1: boolean) {
         this._autoResize = param1;
         this.resize();
      }
  init(param1: string, param2: Function): void {
         this.label = param1;
         this.setFunc(param2);
      }
  set align(param1: string) {
         this._align = param1;
         this.resize();
      }
  set width(param1: number) {
         this.autoResize = false;
         this.w = param1;
         this.resize();
      }
  setSpaceX(param1: number): void {
         this.spaceX = param1;
         this.resize();
      }
  triggerClickCallback(): void {
         if(this.func != null)
         {
            if(this.sendSelf)
            {
               this.func(this);
            }
            else
            {
               this.func();
            }
         }
      }
  addGraphic(param1: DisplayObject): void {
         if(this.imageHolder != null)
         {
            this.imageHolder.addChild(param1);
            this.image = param1;
            this.resize();
         }
      }
  get selected(): boolean {
         return this._selected;
      }
  mouseOutHandler(event: MouseEvent): void {
         this.gotoUp();
      }
  mouseDownHandler(event: MouseEvent): void {
         this.gotoAndStop("down");
         if(this.clickOnMouseDown)
         {
            this.triggerClickCallback();
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         this.gotoAndStop("over");
      }
  resize(): void {
         var _loc_3= undefined;
         var _loc_4= undefined;
         var _loc_2= 0;
         _loc_3 = 0;
         var _loc_1= this.width;
         if(this.textHolder != null)
         {
            if(this._autoResize)
            {
               this.textHolder.textBox.x = this.spaceX;
               this.w = this.textHolder.width + this.spaceX * 2;
            }
            else if(this._align == "left")
            {
               this.textHolder.textBox.x = this.spaceX;
            }
            else if(this._align == "center")
            {
               this.textHolder.textBox.x = (this.bgHolder.width - this.textHolder.width) / 2;
            }
            else if(this._align == "right")
            {
               this.textHolder.textBox.x = this.bgHolder.width - this.textHolder.width - this.spaceX;
            }
            this.textHolder.scaleX = 1;
            if(this.textHolder.width > this.w - this.spaceX * 2 - this.textHolder.x * 2)
            {
               this.textHolder.width = this.w - this.spaceX * 2 - this.textHolder.x * 2;
            }
         }
         if(this.imageHolder != null && this.image != null)
         {
            _loc_4 = 1;
            this.image.scaleY = 1;
            this.image.scaleX = _loc_4;
            _loc_2 = this.w - this.imagePadding * 2;
            _loc_3 = this.h - this.imagePadding * 2;
            if(this.image.width > _loc_2)
            {
               this.image.height *= _loc_2 / this.image.width;
               this.image.width = _loc_2;
            }
            if(this.image.height > _loc_3)
            {
               this.image.width *= _loc_3 / this.image.height;
               this.image.height = _loc_3;
            }
            this.image.x = Math.round((_loc_2 - this.image.width) / 2) + this.imagePadding;
            this.image.y = Math.round((_loc_3 - this.image.height) / 2) + this.imagePadding;
         }
         if(this.bgHolder != null)
         {
            this.bgHolder.bg.width = this.w;
            this.bgHolder.bg.height = this.h;
         }
         if(this.width != _loc_1)
         {
            this.dispatchEvent(new Event(Event.RESIZE));
         }
      }
  get autoResize(): boolean {
         return this._autoResize;
      }
  setFunc(param1: Function): void {
         this.func = param1;
      }
  set height(param1: number) {
         this.h = param1;
         this.resize();
      }
  gotoUp(): void {
         if(this.selected)
         {
            this.gotoAndStop("selected");
         }
         else
         {
            this.gotoAndStop("up");
         }
      }
  removedFromStageHandler(event: Event): void {
         this.removeFromParent = false;
         this.remove();
      }
  set x(param1: number) {
         super.x = Math.round(param1);
      }
  mouseOverHandler(event: MouseEvent): void {
         this.gotoAndStop("over");
      }
  mouseClickHandler(event: MouseEvent): void {
         if(!this.clickOnMouseDown)
         {
            this.triggerClickCallback();
         }
      }
  set y(param1: number) {
         super.y = Math.round(param1);
      }
  set selected(param1: boolean) {
         this._selected = param1;
         this.gotoUp();
      }
  get width(): any { return super.width; }
  get height(): any { return super.height; }
  get x(): any { return super.x; }
  get y(): any { return super.y; }
  constructor() {
         super();
         if(this.textHolder != null)
         {
            this.textHolder.textBox.autoSize = TextFieldAutoSize.LEFT;
            this.spaceX = this.textHolder.textBox.x;
         }
         this.addEventListener(MouseEvent.MOUSE_OVER,$b(this, 'mouseOverHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'mouseOutHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
         this.addEventListener(MouseEvent.CLICK,$b(this, 'mouseClickHandler'),false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'),false,0,true);
         this.useHandCursor = true;
         this.buttonMode = true;
         this.mouseChildren = false;
         this.x = Math.round(this.x);
         this.y = Math.round(this.y);
         if(this.scaleX != 1)
         {
            this._autoResize = false;
            this.width = this.width;
            this.scaleX = 1;
         }
         if(this.scaleY != 1)
         {
            this.height = this.height;
            this.scaleY = 1;
         }
      }
}
$reg('com.jiggmin.ui.ButtonClass', ButtonClass);
