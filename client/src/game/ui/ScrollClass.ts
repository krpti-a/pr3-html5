// Ported from com/jiggmin/ui/ScrollClass.as
import { DisplayObject, Event, MouseEvent, MovieClip, Point, Rectangle, Sprite } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { ArrowButton, Maths, ThumbButton } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ScrollClass extends Removable {
  declare bg: MovieClip;
  minY: number = 0;
  scrollVel: number = NaN;
  holdPosY: number = 0;
  declare rect: Sprite;
  declare upButton: ArrowButton;
  declare thumbButton: ThumbButton;
  declare _target: DisplayObject;
  declare downButton: ArrowButton;
  maxY: number = 100;
  targetStartY: number = NaN;
  handleArrowPress(param1: number): void {
         this.scrollVel = param1;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'continueScroll'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
      }
  remove(): void {
         this.thumbButton.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressThumbHandler'));
         this.upButton.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressUpHandler'));
         this.downButton.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressDownHandler'));
         if(this.stage != null)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
            this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'));
         }
         if(this.target != null)
         {
            this.target.mask = null;
            this.target = null;
         }
         if(this.rect.parent != null)
         {
            this.rect.parent.removeChild(this.rect);
            this.rect = null;
         }
         super.remove();
      }
  redraw(): void {
         var _loc_1= undefined;
         _loc_1 = null;
         if(this.target != null)
         {
            if(this.target.mask != null)
            {
               if(this.target.mask.parent != null)
               {
                  this.target.mask.parent.removeChild(this.target.mask);
               }
               this.target.mask = null;
            }
            _loc_1 = this.getTargetBounds();
            this.rect.width = _loc_1.width + 2;
            --_loc_1.x;
            this.rect.y = this.y;
            this.target.parent.addChild(this.rect);
            this.target.mask = this.rect;
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.thumbButton.height = this.height / 4;
            this.thumbButton.thumbLines.y = this.thumbButton.height / 2 - this.thumbButton.thumbLines.height / 2;
            this.figureMaxY();
            if(_loc_1.height < this.height)
            {
               this.thumbButton.visible = false;
               this.alpha = 0.5;
            }
            else
            {
               this.thumbButton.visible = true;
               this.alpha = 1;
            }
         }
      }
  pressDownHandler(event: MouseEvent): void {
         this.handleArrowPress(1);
      }
  mouseUpHandler(event: MouseEvent): void {
         if(this.stage != null)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'));
            this.stage.removeEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'));
         }
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'continueScroll'));
      }
  get scrollPerc(): number {
         return (this.thumbButton.y - this.minY) / (this.maxY - this.minY);
      }
  continueScroll(event: Event): void {
         this.doScroll();
      }
  set height(param1: number) {
         param1 = Math.round(param1);
         this.bg.height = param1;
         this.bg.y = 0;
         this.downButton.y = Math.round(param1 - this.downButton.height);
         this.rect.height = param1;
         this.minY = Math.round(this.upButton.height + 1);
         this.figureMaxY();
      }
  get target(): DisplayObject {
         return this._target;
      }
  mouseMoveHandler(event: MouseEvent): void {
         var _loc_2= new Point(event.stageX,event.stageY);
         _loc_2 = this.globalToLocal(_loc_2);
         var _loc_3= _loc_2.y;
         _loc_3 += this.holdPosY;
         _loc_3 = Maths.limit(_loc_3,this.minY,this.maxY);
         this.thumbButton.y = _loc_3;
         this.positionTarget();
      }
  getTargetBounds(): Rectangle {
         var _loc_1= null;
         if(this.target != null)
         {
            _loc_1 = this.target.getBounds(this.target.parent);
            if(_loc_1.width == 0 && _loc_1.height == 0)
            {
               _loc_1.x = this.target.x;
               _loc_1.y = this.target.y;
            }
            return _loc_1;
         }
         return new Rectangle();
      }
  positionTarget(): void {
         var _loc_1= NaN;
         var _loc_2= null;
         var _loc_3= NaN;
         if(this.target != null)
         {
            _loc_1 = (this.thumbButton.y - this.minY) / (this.maxY - this.minY);
            _loc_2 = this.target.getBounds(this.target.parent);
            _loc_3 = -_loc_1 * (_loc_2.height - this.height);
            this.target.y = this.targetStartY + _loc_3 + (_loc_2.y - this.target.y);
         }
      }
  set target(param1: DisplayObject) {
         var _loc_2= null;
         this._target = param1;
         if(param1 != null)
         {
            _loc_2 = this.getTargetBounds();
            this.targetStartY = _loc_2.y;
         }
         this.redraw();
      }
  set scrollPerc(param1: number) {
         param1 = Number(Maths.limit(param1,0,1));
         var _loc_2= (this.maxY - this.minY) * param1 + this.minY;
         this.thumbButton.y = _loc_2;
         this.positionTarget();
      }
  pressUpHandler(event: MouseEvent): void {
         this.handleArrowPress(-1);
      }
  doScroll(): void {
         this.thumbButton.y += this.scrollVel;
         this.thumbButton.y = Maths.limit(this.thumbButton.y,this.minY,this.maxY);
         this.positionTarget();
      }
  figureMaxY(): void {
         this.maxY = Math.round(this.downButton.y - 1 - this.thumbButton.height);
      }
  positionThumb(): void {
         var _loc_1= null;
         var _loc_2= NaN;
         if(this.target != null)
         {
            _loc_1 = this.target.getBounds(this.target.parent);
            _loc_2 = (-_loc_1.y + this.targetStartY) / (_loc_1.height - this.height);
            this.thumbButton.y = _loc_2 * (this.maxY - this.minY) + this.minY;
            this.thumbButton.y = Maths.limit(this.thumbButton.y,this.minY,this.maxY);
         }
      }
  pressThumbHandler(event: MouseEvent): void {
         this.holdPosY = -event.localY;
         this.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUpHandler'),false,0,true);
         this.stage.addEventListener(MouseEvent.MOUSE_MOVE,$b(this, 'mouseMoveHandler'),false,0,true);
      }
  get height(): any { return super.height; }
  constructor() {
         var _loc_1= undefined;
         var _loc_2= undefined;
         super();
         _loc_1 = NaN;
         this.thumbButton.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressThumbHandler'),false,0,true);
         this.upButton.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressUpHandler'),false,0,true);
         this.downButton.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'pressDownHandler'),false,0,true);
         this.upButton.downArrow.visible = false;
         this.downButton.upArrow.visible = false;
         this.rect = new Sprite();
         this.rect.graphics.beginFill(0,1);
         this.rect.graphics.drawRect(0,0,100,100);
         this.rect.graphics.endFill();
         _loc_1 = this.height;
         _loc_2 = 1;
         this.scaleY = 1;
         this.scaleX = _loc_2;
         this.height = _loc_1;
         this.thumbButton.y = this.minY;
      }
}
$reg('com.jiggmin.ui.ScrollClass', ScrollClass);
