// Ported from com/jiggmin/ui/DropdownPopup.as
import { Dictionary, Event, MouseEvent, Sprite } from '../../flash/index.ts';
import { int, $keys, $b } from '../../flash/as3.ts';
import { Popup } from '../popup/Popup.ts';
import { DropdownEvent, DropdownOption, DropdownOptionButton, EasyScroll, EditorPopupBGGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class DropdownPopup extends Popup {
  declare optionHolder: Sprite;
  declare scrollBar: EasyScroll;
  declare buttonDic: any;
  targetWidth: number = 200;
  set width(param1: number) {
         this.targetWidth = int(param1);
         this.redraw();
      }
  addedToStageHandler(event: Event): void {
         this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'));
         this.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'clickStage'),false,0,true);
         this.intrusive = false;
      }
  setMaxHeight(param1: number): void {
    param1 = int(param1);
         this.maxHeight = int(param1);
         this.redraw();
      }
  remove(): void {
         if(this.stage)
         {
            this.stage.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'clickStage'));
            this.removeEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'));
            this.clearButtons();
            this.buttonDic = null;
            this.removeScroll();
            super.remove();
         }
      }
  addScroll(): void {
         if(this.scrollBar == null)
         {
            this.scrollBar = new EasyScroll();
            this.scrollBar.height = this.maxHeight - this.padding * 2;
            this.scrollBar.target = this.optionHolder;
            this.holder.addChild(this.scrollBar);
         }
         this.setButtonWidth(this.targetWidth - this.padding * 3 - this.scrollBar.width);
         this.scrollBar.x = this.optionHolder.width + this.padding;
         this.scrollBar.redraw();
      }
  removeScroll(): void {
         if(this.scrollBar != null)
         {
            this.scrollBar.remove();
            this.scrollBar = null;
         }
         this.setButtonWidth(this.targetWidth - this.padding * 2);
      }
  clickButton(event: MouseEvent): void {
         var _loc_2= (event.target);
         var _loc_3= this.buttonDic[_loc_2];
         this.dispatchEvent(new DropdownEvent(DropdownEvent.SELECT,_loc_3));
         this.remove();
      }
  addButton(param1: DropdownOption, param2: boolean = false): void {
         var _loc_3= new DropdownOptionButton();
         _loc_3.align = "left";
         _loc_3.init(param1.label,null);
         if(this.optionHolder.height != 0)
         {
            _loc_3.y = Math.round(this.optionHolder.height + 1);
         }
         _loc_3.selected = param2;
         this.optionHolder.addChild(_loc_3);
         this.buttonDic[_loc_3] = param1;
         this.redraw();
         _loc_3.addEventListener(MouseEvent.CLICK,$b(this, 'clickButton'),false,0,true);
      }
  clearButtons(): void {
         var _loc_1= null;
         for (_loc_1 of $keys(this.buttonDic))
         {
            _loc_1.removeEventListener(MouseEvent.CLICK,$b(this, 'clickButton'));
            _loc_1.remove();
         }
         this.buttonDic = new Dictionary(true);
         this.redraw();
      }
  clickStage(event: MouseEvent): void {
         var _loc_2= false;
         var _loc_3= (event.target);
         while(_loc_3.parent != null)
         {
            if(_loc_3 == this)
            {
               _loc_2 = true;
               break;
            }
            _loc_3 = _loc_3.parent;
         }
         if(!_loc_2)
         {
            this.remove();
         }
      }
  redraw(): void {
         if(this.optionHolder.height + this.padding * 2 > this.maxHeight)
         {
            this.addScroll();
         }
         else
         {
            this.removeScroll();
         }
         super.redraw();
      }
  setButtonWidth(param1: number): void {
         var _loc_2= null;
         for (_loc_2 of $keys(this.buttonDic))
         {
            _loc_2.width = param1;
         }
      }
  get width(): any { return super.width; }
  constructor(param1: number) {
         super();
         this.buttonDic = new Dictionary(true);
         this.setBG(new EditorPopupBGGraphic());
         this.maxHeight = int(param1);
         this.optionHolder = new Sprite();
         this.holder.addChild(this.optionHolder);
         this.addEventListener(Event.ADDED_TO_STAGE,$b(this, 'addedToStageHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.DropdownPopup', DropdownPopup);
