// Ported from com/jiggmin/pr3/map/MapText.as
import { Sprite, TextField, TextFieldAutoSize, TextFormat, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { MapTextDragGraphic, MapTextDynamicGraphic, MapTextHitGraphic, MapTextInputGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MapText extends Sprite {
  active: boolean = false;
  declare dynamicText: TextField;
  declare dragGraphic: any;
  shiftX: number = 10;
  declare inputText: TextField;
  shiftY: number = 10;
  oldRotation: number = NaN;
  oldSize: number = NaN;
  declare hitGraphic: any;
  removed: boolean = false;
  _color: number = 0;
  _size: number = 12;
  focusTimeout: number = 0;
  declare oldText: string;
  oldColor: number = NaN;
  oldTextX: number = 0;
  oldTextY: number = 0;
  get size(): number {
         return this._size;
      }
  set size(param1: number) {
         this._size = param1;
         this.applyFormatting();
      }
  remove(): void {
         this.removeDynamicText();
         this.removeInputText();
         this.removeDragGraphic();
         this.hitGraphic = null;
         clearTimeout(this.focusTimeout);
         this.removed = true;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  isTouchingPos(param1: number, param2: number): boolean {
         var _loc_3= undefined;
         this.hitGraphic.visible = true;
         _loc_3 = this.hitGraphic.hitTestPoint(param1,param2,true);
         this.hitGraphic.visible = false;
         return _loc_3;
      }
  isTouchingDragPos(param1: number, param2: number): boolean {
         return !this.removed && Boolean(this.dragGraphic.hitTestPoint(param1,param2,true));
      }
  applyFormatting(): void {
         var _loc_1= new TextFormat();
         _loc_1.size = this._size;
         _loc_1.color = this._color;
         if(this.inputText != null)
         {
            this.inputText.setTextFormat(_loc_1);
            this.inputText.defaultTextFormat = _loc_1;
         }
         if(this.dynamicText != null)
         {
            this.dynamicText.setTextFormat(_loc_1);
            this.dynamicText.defaultTextFormat = _loc_1;
         }
      }
  gainFocus(): void {
         if(this.active)
         {
            this.stage.focus = this.inputText;
         }
      }
  createInputText(): void {
         var _loc_1= null;
         if(this.inputText == null)
         {
            _loc_1 = new MapTextInputGraphic();
            this.inputText = _loc_1.textBox;
            this.prepareTextBox(this.inputText);
            this.applyFormatting();
         }
      }
  resizeHitGraphic(): void {
         this.hitGraphic.width = this.dynamicText.width;
         this.hitGraphic.height = this.dynamicText.height;
      }
  get text(): string {
         if(this.inputText != null)
         {
            return this.inputText.text;
         }
         if(this.dynamicText != null)
         {
            return this.dynamicText.text;
         }
         return "";
      }
  addDragGraphic(): void {
         var _loc_1= undefined;
         if(this.dragGraphic == null)
         {
            this.dragGraphic = new MapTextDragGraphic();
            _loc_1 = false;
            this.dragGraphic.mouseChildren = false;
            this.dragGraphic.mouseEnabled = _loc_1;
            this.addChild(this.dragGraphic);
         }
      }
  hasChanged(): boolean {
         var _loc_1= false;
         if(this.oldSize != this._size || this.oldColor != this._color || this.oldText != this.text || this.oldTextX != this.x || this.oldTextY != this.y || this.oldRotation != this.rotation)
         {
            _loc_1 = true;
         }
         return _loc_1;
      }
  set color(param1: number) {
         this._color = param1;
         this.applyFormatting();
      }
  prepareTextBox(param1: TextField): void {
         param1.multiline = true;
         param1.wordWrap = false;
         param1.autoSize = TextFieldAutoSize.LEFT;
         param1.x = this.shiftX;
         param1.y = this.shiftY;
         this.applyFormatting();
      }
  set text(param1: string) {
         if(this.dynamicText != null)
         {
            this.dynamicText.text = param1;
         }
         if(this.inputText != null)
         {
            this.inputText.text = param1;
         }
         this.resizeHitGraphic();
      }
  get color(): number {
         return this._color;
      }
  removeDynamicText(): void {
         if(this.dynamicText != null)
         {
            if(this.dynamicText.parent != null)
            {
               this.dynamicText.parent.removeChild(this.dynamicText);
            }
            this.dynamicText = null;
         }
      }
  createDynamicText(): void {
         var _loc_1= null;
         if(this.dynamicText == null)
         {
            _loc_1 = new MapTextDynamicGraphic();
            this.dynamicText = _loc_1.textBox;
            this.dynamicText.text = "";
            this.prepareTextBox(this.dynamicText);
            this.dynamicText.selectable = false;
            this.applyFormatting();
         }
      }
  removeInputText(): void {
         if(this.inputText != null)
         {
            if(this.inputText.parent != null)
            {
               this.inputText.parent.removeChild(this.inputText);
            }
            this.inputText = null;
         }
      }
  deactivate(): void {
         var _loc_1= undefined;
         if(this.active)
         {
            this.active = false;
            this.dynamicText.text = this.inputText.text;
            this.removeChild(this.inputText);
            this.addChild(this.dynamicText);
            this.stage.focus = this.stage;
            _loc_1 = false;
            this.mouseChildren = false;
            this.mouseEnabled = _loc_1;
            this.applyFormatting();
            this.resizeHitGraphic();
            this.removeDragGraphic();
            if(this.dynamicText.text == "")
            {
               this.remove();
            }
         }
      }
  removeDragGraphic(): void {
         if(this.dragGraphic != null)
         {
            this.removeChild(this.dragGraphic);
            this.dragGraphic = null;
         }
      }
  activate(): void {
         var _loc_1= undefined;
         if(!this.active)
         {
            this.active = true;
            this.createInputText();
            this.inputText.text = this.dynamicText.text;
            this.removeChild(this.dynamicText);
            this.addChild(this.inputText);
            this.gainFocus();
            this.focusTimeout = uint(setTimeout($b(this, 'gainFocus'),10));
            _loc_1 = true;
            this.mouseChildren = true;
            this.mouseEnabled = _loc_1;
            this.applyFormatting();
            this.addDragGraphic();
            this.oldSize = this._size;
            this.oldColor = this._color;
            this.oldText = this.dynamicText.text;
            this.oldTextX = int(this.x);
            this.oldTextY = int(this.y);
            this.oldRotation = this.rotation;
         }
      }
  constructor() {
         super();
         this.hitGraphic = new MapTextHitGraphic();
         this.hitGraphic.visible = false;
         this.hitGraphic.x = this.shiftX;
         this.hitGraphic.y = this.shiftY;
         this.addChild(this.hitGraphic);
         this.createDynamicText();
         this.addChild(this.dynamicText);
         this.resizeHitGraphic();
         var _loc_1= false;
         this.mouseChildren = false;
         this.mouseEnabled = _loc_1;
      }
}
$reg('com.jiggmin.pr3.map.MapText', MapText);
