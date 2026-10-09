// Ported from com/jiggmin/ui/colorPicker/ColorPickerPopup.as
import { Bitmap, BitmapData, DisplayObject, Event, Mouse, MouseEvent, Point, Rectangle, Sprite } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { Popup } from '../../popup/Popup.ts';
import { ColorConversion, ColorPickerCrosshairsGraphic, ColorPickerHueArrowGraphic, Cursor, DefaultColors, EasyButton, EasyInput, EditorPopupBGGraphic, Eyedropper, Maths } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ColorPickerPopup extends Popup {
  declare lastColorH: Sprite;
  declare paletteHolder: Sprite;
  declare eyedropper: Eyedropper;
  declare crosshairs: any;
  originalColor: number = 0;
  declare palette: any[];
  declare hoverColorH: Sprite;
  declare sbBitmapData: BitmapData;
  declare hexBox: EasyInput;
  declare savedCursor: Cursor;
  brightness: number = 50;
  saturation: number = 0;
  color: number = -1;
  declare hueArrow: any;
  hue: number = 0;
  declare hueBar: Sprite;
  declare sbBox: Sprite;
  tempColor: number = -1;
  eyedropperChangeHandler(event: Event): void {
         this.tempColor = int(this.eyedropper.color);
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  mouseUpHandler(event: MouseEvent): void {
         Mouse.show();
         this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'sbBoxMouseMoveHandler'));
         this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'hueBarMouseMoveHandler'));
      }
  remove(): void {
         if(!this.removed)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
            this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'sbBoxMouseMoveHandler'));
            this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'hueBarMouseMoveHandler'));
            this.sbBox.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'sbBoxMouseDownHandler'));
            this.hueBar.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'hueBarMouseDownHandler'));
            this.hexBox.removeEventListener(Event.CHANGE,$b(this, 'hexChangeHandler'));
            this.paletteHolder.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'paletteMouseMoveHandler'));
            this.paletteHolder.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'paletteMouseDownHandler'));
            this.paletteHolder.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'paletteMouseOutHandler'));
            this.eyedropper.removeEventListener(Event.CHANGE,$b(this, 'eyedropperChangeHandler'));
            this.eyedropper.removeEventListener(Event.COMPLETE,$b(this, 'eyedropperCompleteHandler'));
            this.sbBitmapData.dispose();
            if(Cursor.instance != null)
            {
               Cursor.removeCursor();
               if(this.savedCursor != null)
               {
                  Cursor.setCursor(this.savedCursor);
                  this.savedCursor.init();
               }
            }
            else if(this.savedCursor != null)
            {
               this.savedCursor.remove();
            }
            this.sbBox = null;
            this.hueBar = null;
            this.paletteHolder = null;
            this.sbBitmapData = null;
            this.hueArrow = null;
            this.crosshairs = null;
            this.eyedropper = null;
            this.savedCursor = null;
            this.hexBox = null;
         }
         super.remove();
      }
  hueBarMouseDownHandler(event: MouseEvent): void {
         Mouse.hide();
         this.hueBarMouseMoveHandler(event);
         this.stage.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'hueBarMouseMoveHandler'),false,0,true);
      }
  init(): void {
         super.init();
         this.eyedropper = new Eyedropper();
         this.eyedropper.shieldGraphic(this);
         this.eyedropper.addEventListener(Event.CHANGE,$b(this, 'eyedropperChangeHandler'),false,0,true);
         this.eyedropper.addEventListener(Event.COMPLETE,$b(this, 'eyedropperCompleteHandler'),false,0,true);
         if(Cursor.instance != null)
         {
            this.savedCursor = Cursor.instance;
            this.savedCursor.pause();
         }
         Cursor.setCursor(this.eyedropper);
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
      }
  eyedropperCompleteHandler(event: Event): void {
         this.tempColor = int(-1);
         this.setColor(this.eyedropper.color);
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  applyColor(param1: boolean = true): void {
         this.color = int(ColorConversion.hsbtohex24(this.hue,this.saturation,this.brightness));
         if(!this.hexBox.hasFocus)
         {
            this.hexBox.text = ColorConversion.toHexadecimalString(this.color);
         }
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  paletteMouseDownHandler(event: MouseEvent): void {
         var _loc_2= this.hoverColorH.x / 10;
         var _loc_3= this.hoverColorH.y / 10;
         this.setColor(this.palette[_loc_2][_loc_3]);
         this.lastColorH.x = _loc_2 * 10;
         this.lastColorH.y = _loc_3 * 10;
         this.lastColorH.visible = true;
         this.remove();
      }
  paletteMouseMoveHandler(event: MouseEvent): void {
         var _loc_3= undefined;
         var _loc_4= undefined;
         var _loc_2= new Point(event.stageX,event.stageY);
         _loc_2 = this.paletteHolder.globalToLocal(_loc_2);
         _loc_3 = Math.floor(_loc_2.x / 10);
         _loc_4 = Math.floor(_loc_2.y / 10);
         _loc_3 = Maths.limit(_loc_3,0,19);
         _loc_4 = Maths.limit(_loc_4,0,11);
         this.hoverColorH.x = _loc_3 * 10;
         this.hoverColorH.y = _loc_4 * 10;
         this.hoverColorH.visible = true;
         this.tempColor = int(this.palette[_loc_3][_loc_4]);
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  hexChangeHandler(event: Event): void {
         var _loc_2= null;
         var _loc_3= 0;
         if(this.hexBox.hasFocus)
         {
            _loc_2 = this.hexBox.text;
            _loc_3 = 0;
            if(_loc_2 != "")
            {
               _loc_2 = _loc_2.split("#").join("");
               _loc_2 = _loc_2.split("0x").join("");
               _loc_3 = Number("0x" + _loc_2);
               if(isNaN(_loc_3))
               {
                  _loc_3 = 0;
               }
            }
            this.setColor(_loc_3);
         }
      }
  paletteMouseOutHandler(event: MouseEvent): void {
         this.tempColor = int(-1);
         this.hoverColorH.visible = false;
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  getColor(): number {
         if(this.tempColor != -1)
         {
            return this.tempColor;
         }
         return this.color;
      }
  clickCancel(): void {
         this.color = int(this.originalColor);
         this.dispatchEvent(new Event(Event.CHANGE));
         this.remove();
      }
  fillSBBitmapData(param1: number): void {
         var _loc_5= NaN;
         var _loc_6= NaN;
         var _loc_7= NaN;
         var _loc_8= null;
         var _loc_10= 0;
         var _loc_2= this.sbBitmapData;
         var _loc_3= _loc_2.width;
         var _loc_4= _loc_2.height;
         var _loc_9= 0;
         while(_loc_9 < _loc_3)
         {
            _loc_6 = _loc_9 / _loc_3 * 100;
            _loc_10 = 0;
            while(_loc_10 < _loc_4)
            {
               _loc_7 = 100 - _loc_10 / _loc_4 * 100;
               _loc_5 = ColorConversion.hsbtohex24(param1,_loc_6,_loc_7);
               _loc_2.setPixel(_loc_9,_loc_10,_loc_5);
               _loc_10++;
            }
            _loc_9++;
         }
      }
  drawSBBox(param1: number, param2: number): Sprite {
    param1 = int(param1); param2 = int(param2);
         var _loc_5= undefined;
         this.sbBitmapData = new BitmapData(param1,param2,false,0);
         var _loc_3= new Bitmap(this.sbBitmapData);
         this.crosshairs = new ColorPickerCrosshairsGraphic();
         _loc_5 = false;
         this.crosshairs.mouseChildren = false;
         this.crosshairs.mouseEnabled = _loc_5;
         _loc_5 = 20;
         this.crosshairs.y = 20;
         this.crosshairs.x = _loc_5;
         var _loc_4= new Sprite();
         _loc_4.addChild(_loc_3);
         _loc_4.addChild(this.crosshairs);
         return _loc_4;
      }
  setColor(param1: number): void {
    param1 = int(param1);
         var _loc_2= null;
         if(this.color != param1)
         {
            this.color = int(param1);
            _loc_2 = ColorConversion.hex24tohsb(param1);
            this.hue = _loc_2.hue;
            this.hueArrow.y = Math.round(60 - this.hue / 360 * 60);
            this.fillSBBitmapData(this.hue);
            this.saturation = _loc_2.saturation;
            this.crosshairs.x = Math.round(this.saturation / 100 * 60);
            this.brightness = _loc_2.brightness;
            this.crosshairs.y = Math.round(60 - this.brightness / 100 * 60);
            this.applyColor();
         }
      }
  shieldGraphic(param1: DisplayObject): void {
         this.eyedropper.shieldGraphic(param1);
      }
  drawColors(): void {
         var _loc_2= 0;
         var _loc_3= null;
         var _loc_5= 0;
         var _loc_7= 0;
         this.paletteHolder.graphics.clear();
         this.paletteHolder.graphics.lineStyle(1,0,1,true);
         this.palette = DefaultColors.createDefaultPalette();
         var _loc_1= this.palette.length;
         var _loc_4= 10;
         var _loc_6= 0;
         while(_loc_6 < _loc_1)
         {
            _loc_3 = this.palette[_loc_6];
            _loc_2 = _loc_3.length;
            _loc_7 = 0;
            while(_loc_7 < _loc_2)
            {
               _loc_5 = _loc_3[_loc_7];
               if(_loc_5 == this.color)
               {
                  this.lastColorH.visible = true;
                  this.lastColorH.x = _loc_6 * _loc_4;
                  this.lastColorH.y = _loc_7 * _loc_4;
               }
               this.paletteHolder.graphics.beginFill(_loc_5);
               this.paletteHolder.graphics.drawRect(_loc_6 * _loc_4,_loc_7 * _loc_4,_loc_4,_loc_4);
               this.paletteHolder.graphics.endFill();
               _loc_7++;
            }
            _loc_6++;
         }
      }
  highlightCurColor(): void {
         var _loc_2= 0;
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_7= 0;
         var _loc_1= this.palette.length;
         var _loc_5= 10;
         var _loc_6= 0;
         while(_loc_6 < _loc_1)
         {
            _loc_3 = this.palette[_loc_6];
            _loc_2 = _loc_3.length;
            _loc_7 = 0;
            while(_loc_7 < _loc_2)
            {
               _loc_4 = _loc_3[_loc_7];
               if(_loc_4 == this.color)
               {
                  this.lastColorH.visible = true;
                  this.lastColorH.x = _loc_6 * _loc_5;
                  this.lastColorH.y = _loc_7 * _loc_5;
               }
               _loc_7++;
            }
            _loc_6++;
         }
      }
  drawPaletteHighlight(): Sprite {
         var _loc_1= new Sprite();
         _loc_1.graphics.lineStyle(1,16777215,1,true);
         _loc_1.graphics.drawRect(0,0,10,10);
         return _loc_1;
      }
  drawHueBar(param1: number, param2: number): Sprite {
    param1 = int(param1); param2 = int(param2);
         var _loc_4= 0;
         var _loc_5= NaN;
         var _loc_3= new BitmapData(param1,param2,false,16777215);
         var _loc_6= 0;
         while(_loc_6 < param2)
         {
            _loc_4 = 360 - 360 * (_loc_6 / param2);
            _loc_5 = ColorConversion.hsbtohex24(_loc_4,100,100);
            _loc_3.fillRect(new Rectangle(0,_loc_6,param1,1),_loc_5);
            _loc_6++;
         }
         this.hueArrow = new ColorPickerHueArrowGraphic();
         this.hueArrow.x = param1 + 1;
         this.hueArrow.y = param2;
         var _loc_9= false;
         this.hueArrow.mouseChildren = false;
         this.hueArrow.mouseEnabled = _loc_9;
         var _loc_7= new Sprite();
         _loc_7.graphics.beginFill(0,0);
         _loc_7.graphics.drawRect(0,0,param1 + 10,param2);
         _loc_7.graphics.endFill();
         var _loc_8= new Sprite();
         _loc_7.addChild(new Bitmap(_loc_3));
         _loc_8.addChild(this.hueArrow);
         _loc_8.addChild(_loc_7);
         return _loc_8;
      }
  clickOK(): void {
         this.remove();
      }
  drawOutline(param1: number, param2: number): Sprite {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= new Sprite();
         _loc_3.graphics.lineStyle(1,3355443,1,true);
         _loc_3.graphics.moveTo(0,param2);
         _loc_3.graphics.lineTo(0,0);
         _loc_3.graphics.lineTo(param1,0);
         _loc_3.graphics.lineStyle(1,16777215,1,true);
         _loc_3.graphics.lineTo(param1,param2);
         _loc_3.graphics.lineTo(0,param2);
         return _loc_3;
      }
  hueBarMouseMoveHandler(event: MouseEvent): void {
         var _loc_2= new Point(event.stageX,event.stageY);
         _loc_2 = this.hueBar.globalToLocal(_loc_2);
         var _loc_3= _loc_2.y;
         _loc_3 = Maths.limit(_loc_3,0,60);
         this.hueArrow.y = Math.round(_loc_3);
         this.hue = 360 - 360 * (_loc_3 / 60);
         this.fillSBBitmapData(this.hue);
         this.applyColor();
         this.lastColorH.visible = false;
      }
  sbBoxMouseMoveHandler(event: MouseEvent): void {
         var _loc_2= new Point(event.stageX,event.stageY);
         _loc_2 = this.sbBox.globalToLocal(_loc_2);
         var _loc_3= _loc_2.x;
         var _loc_4= _loc_2.y;
         _loc_3 = Maths.limit(_loc_3,0,60);
         _loc_4 = Maths.limit(_loc_4,0,60);
         this.crosshairs.x = Math.round(_loc_3);
         this.crosshairs.y = Math.round(_loc_4);
         this.saturation = 100 * (_loc_3 / 60);
         this.brightness = 100 - 100 * (_loc_4 / 60);
         this.applyColor();
         this.lastColorH.visible = false;
      }
  sbBoxMouseDownHandler(event: MouseEvent): void {
         Mouse.hide();
         this.sbBoxMouseMoveHandler(event);
         this.stage.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'sbBoxMouseMoveHandler'),false,0,true);
      }
  constructor(param1: number) {
    param1 = int(param1);
         super();
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         this.intrusive = false;
         this.dieWithoutFocus = true;
         this.autoPosition = false;
         this.setBG(new EditorPopupBGGraphic());
         _loc_2 = new EasyButton();
         _loc_2.init("OK",$b(this, 'clickOK'));
         _loc_2.x = 120;
         _loc_2.y = 0;
         _loc_2.width = 55;
         _loc_2.align = "center";
         this.addGraphic(_loc_2);
         _loc_3 = new EasyButton();
         _loc_3.init("Cancel",$b(this, 'clickCancel'));
         _loc_3.x = 120;
         _loc_3.y = 25;
         _loc_3.width = 55;
         _loc_3.align = "center";
         this.addGraphic(_loc_3);
         this.hexBox = new EasyInput();
         this.hexBox.x = 0;
         this.hexBox.y = 0;
         this.hexBox.width = 80;
         this.hexBox.restrict = "0123456789abcdefABCDEF#x";
         this.addGraphic(this.hexBox);
         this.hueBar = this.drawHueBar(15,60);
         this.hueBar.x = 65;
         this.hueBar.y = Math.round(this.hexBox.y + this.hexBox.height + 5);
         this.addGraphic(this.hueBar);
         _loc_4 = this.drawOutline(15,60);
         _loc_4.x = this.hueBar.x;
         _loc_4.y = this.hueBar.y;
         this.addGraphic(_loc_4);
         this.sbBox = this.drawSBBox(60,60);
         this.sbBox.x = 0;
         this.sbBox.y = Math.round(this.hexBox.y + this.hexBox.height + 5);
         this.addGraphic(this.sbBox);
         _loc_5 = this.drawOutline(60,60);
         _loc_5.x = this.sbBox.x;
         _loc_5.y = this.sbBox.y;
         this.addGraphic(_loc_5);
         this.lastColorH = this.drawPaletteHighlight();
         this.lastColorH.visible = false;
         this.hoverColorH = this.drawPaletteHighlight();
         this.hoverColorH.visible = false;
         this.paletteHolder = new Sprite();
         this.paletteHolder.x = 0;
         this.paletteHolder.y = Math.round(this.sbBox.y + this.sbBox.height + 5);
         this.paletteHolder.mouseChildren = false;
         this.paletteHolder.addChild(this.lastColorH);
         this.paletteHolder.addChild(this.hoverColorH);
         this.drawColors();
         this.addGraphic(this.paletteHolder);
         this.setColor(param1);
         this.originalColor = int(param1);
         this.highlightCurColor();
         this.hueBar.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'hueBarMouseDownHandler'),false,0,true);
         this.sbBox.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'sbBoxMouseDownHandler'),false,0,true);
         this.hexBox.addEventListener(Event.CHANGE,$b(this, 'hexChangeHandler'),false,0,true);
         this.paletteHolder.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'paletteMouseMoveHandler'),false,0,true);
         this.paletteHolder.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'paletteMouseDownHandler'),false,0,true);
         this.paletteHolder.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'paletteMouseOutHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.colorPicker.ColorPickerPopup', ColorPickerPopup);
