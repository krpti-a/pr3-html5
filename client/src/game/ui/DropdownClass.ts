// Ported from com/jiggmin/ui/DropdownClass.as
import { Event, MouseEvent, MovieClip } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { Page } from '../page/Page.ts';
import { DropdownButton, DropdownEvent, DropdownOption, DropdownPopup, Removable } from '../refs.ts';
import { $reg } from '../refs.ts';

export class DropdownClass extends Page {
  declare arrow: MovieClip;
  declare _selectedOption: DropdownOption;
  ignoreClick: boolean = false;
  declare list: DropdownPopup;
  openDir: string = "down";
  declare optionArray: any[];
  _maxHeight: number = 200;
  declare button: DropdownButton;
  get selectedOptionIndex(): number {
         var _loc_1= 0;
         if(this._selectedOption == null)
         {
            return -1;
         }
         return this.optionArray.indexOf(this._selectedOption);
      }
  get maxHeight(): number {
         return this._maxHeight;
      }
  remove(): void {
         this.button.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'));
         this.button.remove();
         this.removeListPopup();
         super.remove();
      }
  removeListPopup(): void {
         if(this.list != null)
         {
            this.list.removeEventListener(DropdownEvent.SELECT,$b(this, 'clickOption'));
            this.list.removeEventListener(Removable.REMOVE,$b(this, 'removeListHandler'));
            this.list = null;
            this.dispatchEvent(new Event(Event.CLOSE));
         }
      }
  set width(param1: number) {
         this.scaleX = 1;
         this.button.width = param1;
         this.button.height = this.height - 1;
         this.arrow.x = this.button.width - 17;
      }
  addListPopup(): void {
         this.removeListPopup();
         this.list = new DropdownPopup(this.maxHeight - this.height);
         this.list.setAutoPosition(false);
         this.list.x = 0;
         this.list.y = this.height - 2;
         this.list.width = this.width;
         this.list.addEventListener(DropdownEvent.SELECT,$b(this, 'clickOption'),false,0,true);
         this.list.addEventListener(Removable.REMOVE,$b(this, 'removeListHandler'),false,0,true);
         this.addPopup(this.list);
         this.dispatchEvent(new Event(Event.OPEN));
      }
  clearOptions(): void {
         this.optionArray = new Array();
         this.selectedOption = null;
         if(this.list != null)
         {
            this.list.clearButtons();
         }
      }
  clickButton(): void {
         var _loc_1= 0;
         var _loc_2= 0;
         var _loc_3= null;
         var _loc_4= false;
         if(!this.ignoreClick)
         {
            this.addListPopup();
            _loc_2 = this.optionArray.length;
            _loc_1 = 0;
            while(_loc_1 < _loc_2)
            {
               _loc_3 = this.optionArray[_loc_1];
               if(_loc_3 == this.selectedOption)
               {
                  _loc_4 = true;
               }
               else
               {
                  _loc_4 = false;
               }
               this.list.addButton(_loc_3,_loc_4);
               _loc_1++;
            }
            if(this.openDir == "up")
            {
               this.list.y -= 195;
            }
         }
         else
         {
            this.ignoreClick = false;
         }
      }
  selectOptionData(param1: any): void {
         var _loc_2= 0;
         var _loc_4= null;
         var _loc_3= this.optionArray.length;
         _loc_2 = 0;
         while(_loc_2 < _loc_3)
         {
            _loc_4 = this.optionArray[_loc_2];
            if(_loc_4.data === param1)
            {
               this.selectOption(_loc_4);
               break;
            }
            _loc_2++;
         }
      }
  set maxHeight(param1: number) {
         this._maxHeight = param1;
      }
  set selectedOption(param1: DropdownOption) {
         this.selectOption(param1);
      }
  set label(param1: string) {
         this.button.label = param1;
      }
  get label(): string {
         return this.button.label;
      }
  selectOption(param1: DropdownOption): void {
         if(param1 != this._selectedOption)
         {
            this._selectedOption = param1;
            if(param1 != null)
            {
               this.button.label = param1.label;
               this.dispatchEvent(new DropdownEvent(DropdownEvent.SELECT,param1));
            }
            else
            {
               this.button.label = "null";
            }
         }
      }
  selectOptionLabel(param1: string): void {
         var _loc_2= 0;
         var _loc_4= null;
         var _loc_3= this.optionArray.length;
         _loc_2 = 0;
         while(_loc_2 < _loc_3)
         {
            _loc_4 = this.optionArray[_loc_2];
            if(_loc_4.label == param1)
            {
               this.selectOption(_loc_4);
               break;
            }
            _loc_2++;
         }
      }
  removeListHandler(event: Event): void {
         this.removeListPopup();
      }
  get selectedOption(): DropdownOption {
         return this._selectedOption;
      }
  selectOptionByIndex(param1: number): void {
    param1 = int(param1);
         this.selectOption(this.optionArray[param1]);
      }
  selectRandomOption(): void {
         var _loc_1= 0;
         var _loc_2= null;
         if(this.optionArray.length > 0)
         {
            _loc_1 = Math.floor(Math.random() * this.optionArray.length);
            _loc_2 = this.optionArray[_loc_1];
            this.selectOption(_loc_2);
         }
      }
  clickOption(event: DropdownEvent): void {
         var _loc_2= event.option;
         this.selectOption(_loc_2);
      }
  addOption(param1: string, param2: any = "", param3: boolean = false): void {
         var _loc_4= new DropdownOption(param1,param2);
         this.optionArray.push(_loc_4);
         if(param3)
         {
            this.selectedOption = _loc_4;
         }
         if(this.list != null)
         {
            this.list.addButton(_loc_4,false);
         }
      }
  removeOptionByLabel(label: string): void {
         for(var i= 0; i < this.optionArray.length; i++)
         {
            if(this.optionArray[i]._label == label)
            {
               if(this.selectedOption._label == label)
               {
                  if(i > 0 && this.optionArray[i - 1] != null)
                  {
                     this.selectOption(this.optionArray[i - 1]);
                  }
                  if(this.optionArray[i + 1] != null)
                  {
                     this.selectOption(this.optionArray[i + 1]);
                  }
               }
               this.optionArray.splice(i,1);
            }
         }
      }
  mouseDownHandler(event: MouseEvent): void {
         if(this.countPopups() > 0)
         {
            this.ignoreClick = true;
         }
         else
         {
            this.ignoreClick = false;
         }
      }
  getOptions(): any[] {
         return this.optionArray.slice();
      }
  getOptionsArray(): any[] {
         return this.optionArray;
      }
  compareLabels(index: number, label: string): boolean {
    index = int(index);
         if(this.optionArray[index]._label == label)
         {
            return true;
         }
         return false;
      }
  get width(): any { return super.width; }
  constructor() {
         var _loc_1= undefined;
         super();
         this.optionArray = new Array();
         this.width = this.width;
         this.scaleX = 1;
         this.button.autoResize = false;
         this.button.align = "left";
         this.button.init("",$b(this, 'clickButton'));
         _loc_1 = false;
         this.arrow.mouseChildren = false;
         this.arrow.mouseEnabled = _loc_1;
         this.button.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler'),false,0,true);
      }
}
$reg('com.jiggmin.ui.DropdownClass', DropdownClass);
