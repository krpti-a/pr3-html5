// Ported from com/jiggmin/popup/Popup.as
import { DisplayObject, Event, MouseEvent, Sprite } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { IntrusiveBGGraphic, Maths, Page, PageEvent, PopupEvent, PupupBGGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Popup extends Removable {
  declare bg: DisplayObject;
  fadeInSpeed: number = 0.12;
  targetAlpha: number = 1;
  availableHeight: number = 480;
  padding: number = 10;
  _dieWithoutFocus: boolean = false;
  maxHeight: number = 900;
  declare holder: Sprite;
  resetFocusOnRemove: boolean = true;
  autoPosition: boolean = true;
  autoHeight: boolean = true;
  declare intrusiveBG: DisplayObject;
  availableWidth: number = 700;
  _intrusive: boolean = true;
  setAutoPosition(param1: boolean): void {
         this.autoPosition = param1;
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$Popup'));
         this.removeFocusListeners();
         if(this.stage != null && this.resetFocusOnRemove)
         {
            if(this.stage.focus != this.stage)
            {
               this.stage.focus = this.stage;
            }
         }
         super.remove();
      }
  addFocusListeners(): void {
         this.removeFocusListeners();
         this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler$Popup'),false,0,true);
         this.addEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'),false,0,true);
         if(this.stage != null)
         {
            this.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
         }
      }
  addPopup(param1: Popup): void {
         this.dispatchEvent(new PopupEvent(PopupEvent.ADD_POPUP,param1));
      }
  addGraphic(param1: DisplayObject): void {
         this.holder.addChild(param1);
         this.redraw();
      }
  addGraphicHandler(param1: DisplayObject): void {
         this.addGraphic(param1);
      }
  setDimensions(param1: number, param2: number): void {
         this.availableWidth = param1;
         this.availableHeight = param2;
         this.redraw();
      }
  enterFrameHandler$Popup(event: Event): void {
         this.alpha += this.fadeInSpeed;
         if(this.alpha >= this.targetAlpha)
         {
            this.alpha = this.targetAlpha;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$Popup'));
         }
      }
  init(): void {
      }
  redraw(): void {
         var _loc_1= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         if(this.autoHeight)
         {
            this.holder.x = this.padding - 1;
            this.holder.y = this.padding - 1;
            this.bg.width = this.holder.width + this.padding * 2;
            this.bg.height = this.holder.height + this.padding * 2;
            this.bg.height = Maths.limit(this.bg.height,15,this.maxHeight);
         }
         if(this.autoPosition)
         {
            _loc_1 = this.holder.getBounds(this);
            _loc_2 = _loc_1.x - this.holder.x;
            _loc_3 = _loc_1.y - this.holder.y;
            this.bg.x = 0;
            this.bg.y = 0;
            this.bg.x += _loc_2;
            this.bg.y += _loc_3;
            this.x = this.availableWidth / 2 - this.bg.width / 2;
            this.y = this.availableHeight / 2 - this.bg.height / 2;
         }
         if(this.intrusive)
         {
            if(this.intrusiveBG == null)
            {
               this.intrusiveBG = new IntrusiveBGGraphic();
               this.addChildAt(this.intrusiveBG,0);
            }
            this.intrusiveBG.x = -this.x;
            this.intrusiveBG.y = -this.y;
            this.intrusiveBG.width = this.availableWidth;
            this.intrusiveBG.height = this.availableHeight;
         }
         else if(this.intrusiveBG != null)
         {
            if(this.intrusiveBG.parent != null)
            {
               this.intrusiveBG.parent.removeChild(this.intrusiveBG);
            }
         }
         this.bg.height = Math.round(this.bg.height);
         this.bg.width = Math.round(this.bg.width);
         this.bg.x = Math.round(this.bg.x);
         this.bg.y = Math.round(this.bg.y);
         this.x = Math.round(this.x);
         this.y = Math.round(this.y);
      }
  removedFromStageHandler(event: Event): void {
         this.stage.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
      }
  setBG(param1: DisplayObject): void {
         this.bg.parent.removeChild(this.bg);
         this.bg = param1;
         this.addChildAt(this.bg,0);
      }
  get dieWithoutFocus(): boolean {
         return this._dieWithoutFocus;
      }
  setPage(param1: Page): void {
         this.dispatchEvent(new PageEvent(PageEvent.SET_PAGE,param1));
      }
  mouseDownHandler(event: MouseEvent): void {
         if(this.removed)
         {
            return;
         }
         var _loc_2= (event.target);
         while(_loc_2 != this)
         {
            if(_loc_2 == this.stage)
            {
               this.remove();
               break;
            }
            if(_loc_2 instanceof Popup)
            {
               if(this.hitTestPoint(event.stageX,event.stageY))
               {
                  break;
               }
               if(this.parent == _loc_2.parent && this.parent.getChildIndex(_loc_2) > this.parent.getChildIndex(this) && this.hitTestObject(_loc_2) && Boolean(_loc_2.hitTestPoint(event.stageX,event.stageY)))
               {
                  break;
               }
            }
            if(_loc_2.parent == null)
            {
               this.remove();
               break;
            }
            _loc_2 = _loc_2.parent;
         }
      }
  set intrusive(param1: boolean) {
         this._intrusive = param1;
      }
  set dieWithoutFocus(param1: boolean) {
         if(param1)
         {
            this.addFocusListeners();
         }
         else
         {
            this.removeFocusListeners();
         }
         this._dieWithoutFocus = param1;
      }
  removeFocusListeners(): void {
         this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler$Popup'));
         this.removeEventListener(Event.REMOVED_FROM_STAGE,$b(this, 'removedFromStageHandler'));
         if(this.stage != null)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         }
      }
  addedToStageHandler$Popup(event: Event): void {
         this.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
      }
  get intrusive(): boolean {
         return this._intrusive;
      }
  constructor() {
         super();
         this.bg = new PupupBGGraphic();
         this.addChild(this.bg);
         this.holder = new Sprite();
         this.addChild(this.holder);
         this.alpha = 0;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$Popup'),false,0,true);
      }
}
$reg('com.jiggmin.popup.Popup', Popup);
