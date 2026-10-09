// Ported from com/jiggmin/ui/Pagination.as
import { DisplayObject, Event, MouseEvent, Point, Sprite } from '../../flash/index.ts';
import { int, $each, $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { Maths, PaginationArrowButton, PaginationButton, PaginationPopup, PlatformRacing3 } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Pagination extends Removable {
  static remeber: any = ({} as any);
  maxElements: number = 0;
  posX: number = 0;
  align: string = "left";
  declare buttonArray: any[];
  padding: number = 3;
  declare leftButton: PaginationArrowButton;
  numPages: number = 0;
  declare holder: Sprite;
  declare rightButton: PaginationArrowButton;
  curPage: number = 0;
  declare popup: PaginationPopup;
  declare rememberName: string;
  allowGotoPage: boolean = false;
  setMaxElements(param1: number): void {
    param1 = int(param1);
         this.maxElements = int(param1);
         this.draw();
      }
  setAlign(param1: string): void {
         this.align = param1;
         this.draw();
      }
  setPages(param1: number): void {
    param1 = int(param1);
         var _loc_2= undefined;
         this.numPages = int(param1);
         this.draw();
         if(this.numPages <= 1)
         {
            this.alpha = 0.5;
            _loc_2 = false;
            this.mouseChildren = false;
            this.mouseEnabled = _loc_2;
         }
         else
         {
            this.alpha = 1;
            _loc_2 = true;
            this.mouseChildren = true;
            this.mouseEnabled = _loc_2;
         }
         if(this.curPage > this.numPages)
         {
            this.setCurPage(this.numPages);
         }
      }
  draw(): void {
         var _loc_6= null;
         this.removeGraphics();
         this.posX = int(0);
         this.addGraphic(this.leftButton);
         var _loc_1= this.maxElements;
         if(this.maxElements > this.numPages)
         {
            _loc_1 = this.numPages;
         }
         var _loc_2= this.curPage - Math.floor((_loc_1 - 1) / 2);
         _loc_2 = Maths.limit(_loc_2,1,this.numPages);
         var _loc_3= _loc_1 - (this.curPage - _loc_2) - 1;
         var _loc_4= this.numPages - this.curPage;
         if(this.numPages - this.curPage <= _loc_3)
         {
            _loc_2 -= _loc_3 - _loc_4;
         }
         var _loc_5= 0;
         while(_loc_5 < _loc_1)
         {
            if(_loc_2 > this.numPages)
            {
               break;
            }
            _loc_6 = new PaginationButton();
            if(_loc_2 == this.curPage)
            {
               _loc_6.init(_loc_2.toString(),null);
               _loc_6.selected = true;
            }
            else if(_loc_5 == _loc_1 - 1 && _loc_2 < this.numPages && Boolean(this.allowGotoPage))
            {
               _loc_6.init("...",$b(this, 'clickPageSelector'));
               _loc_6.sendSelf = true;
            }
            else
            {
               _loc_6.init(_loc_2.toString(),$b(this, 'clickPage'));
               _loc_6.sendSelf = true;
               _loc_6.data = _loc_2;
            }
            this.buttonArray.push(_loc_6);
            this.addGraphic(_loc_6);
            _loc_2++;
            _loc_5++;
         }
         this.addGraphic(this.rightButton);
         if(this.align == "right")
         {
            this.holder.x = -this.holder.width;
         }
         if(this.align == "left")
         {
            this.holder.x = 0;
         }
      }
  getPage(): number {
         return this.curPage;
      }
  removePopup(): void {
         if(this.popup != null)
         {
            this.popup.removeEventListener(PaginationPopup.SET_PAGE_NUM,$b(this, 'popupSetPageHandler'));
            if(!this.popup.removed)
            {
               this.popup.remove();
            }
            this.popup = null;
         }
      }
  remove(): void {
         this.removeGraphics();
         this.removePopup();
         this.leftButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickLeftHandler'));
         this.rightButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickRightHandler'));
         this.leftButton = null;
         this.rightButton = null;
         this.buttonArray = null;
         this.holder = null;
         super.remove();
      }
  popupSetPageHandler(event: Event): void {
         this.setCurPage(this.popup.selectedPage);
      }
  addGraphic(param1: DisplayObject): void {
         this.holder.addChild(param1);
         param1.x = this.posX;
         this.posX = int(this.posX + (param1.width + this.padding));
      }
  clickLeftHandler(event: MouseEvent): void {
         this.setCurPage(this.curPage - 1);
      }
  setPage(param1: number): void {
    param1 = int(param1);
         this.curPage = int(param1);
         this.draw();
      }
  clickRightHandler(event: MouseEvent): void {
         this.setCurPage(this.curPage + 1);
      }
  clickPageSelector(param1: PaginationButton): void {
         this.removePopup();
         this.popup = new PaginationPopup(this.curPage,this.numPages);
         this.popup.addEventListener(PaginationPopup.SET_PAGE_NUM,$b(this, 'popupSetPageHandler'),false,0,true);
         PlatformRacing3.addPopup(this.popup);
         var _loc_2= new Point(0,0);
         _loc_2 = param1.localToGlobal(_loc_2);
         _loc_2 = this.popup.parent.globalToLocal(_loc_2);
         this.popup.x = _loc_2.x - this.popup.width / 2;
         this.popup.y = _loc_2.y + param1.height + 5;
      }
  setCurPage(param1: number): void {
    param1 = int(param1);
         param1 = int(int(Maths.limit(param1,1,this.numPages)));
         if(this.curPage != param1)
         {
            this.curPage = int(param1);
            this.dispatchEvent(new Event(Event.CHANGE));
            this.draw();
         }
      }
  clickPage(param1: PaginationButton): void {
         this.setCurPage(int(param1.data));
      }
  setAllowGotoPage(param1: boolean): void {
         this.allowGotoPage = param1;
         this.draw();
      }
  removeGraphics(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.buttonArray))
         {
            _loc_1.remove();
         }
         this.buttonArray = new Array();
      }
  getHolder(): Sprite {
         return this.holder;
      }
  constructor(param1: number = 1, param2: number = 1, param3: number = 4, param4: string = "", param5: boolean = true) {
    param1 = int(param1); param2 = int(param2); param3 = int(param3);
         super();
         this.curPage = int(param1);
         this.maxElements = int(param3);
         this.rememberName = param4;
         this.allowGotoPage = param5;
         this.leftButton = new PaginationArrowButton();
         this.leftButton.rightArrow.visible = false;
         this.leftButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickLeftHandler'),false,0,true);
         this.rightButton = new PaginationArrowButton();
         this.rightButton.leftArrow.visible = false;
         this.rightButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickRightHandler'),false,0,true);
         this.holder = new Sprite();
         this.addChild(this.holder);
         this.setPages(param2);
      }
}
$reg('com.jiggmin.ui.Pagination', Pagination);
