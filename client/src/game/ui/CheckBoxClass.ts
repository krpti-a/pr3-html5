// Ported from com/jiggmin/ui/CheckBoxClass.as
import { Event, MouseEvent, MovieClip, TextField, TextFieldAutoSize } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { CheckButton } from '../refs.ts';
import { $reg } from '../refs.ts';

export class CheckBoxClass extends Removable {
  static groups: any[] = new Array();
  declare _group: string;
  declare check: MovieClip;
  _checked: boolean = false;
  declare button: CheckButton;
  declare textBox: TextField;
  clickHandler(event: MouseEvent): void {
         this.toggleChecked();
      }
  set group(param1: string) {
         var _loc_2= null;
         var _loc_3= 0;
         if(this._group != null)
         {
            _loc_2 = CheckBoxClass.groups[this._group];
            if(_loc_2 != null)
            {
               _loc_3 = _loc_2.indexOf(this);
               if(_loc_3 != -1)
               {
                  _loc_2.splice(_loc_3,1);
               }
            }
         }
         if(CheckBoxClass.groups[param1] == null)
         {
            CheckBoxClass.groups[param1] = new Array();
         }
         CheckBoxClass.groups[param1].push(this);
         this._group = param1;
      }
  remove(): void {
         this.removeEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'));
         super.remove();
      }
  displayChecked(): void {
         if(this.checked)
         {
            this.check.visible = true;
         }
         else
         {
            this.check.visible = false;
         }
      }
  get checked(): boolean {
         return this._checked;
      }
  set label(param1: string) {
         this.textBox.text = param1;
      }
  get label(): string {
         return this.textBox.text;
      }
  set checked(param1: boolean) {
         var _loc_2= null;
         var _loc_3= 0;
         var _loc_4= null;
         if(param1 && this.group != null)
         {
            _loc_2 = CheckBoxClass.groups[this.group];
            _loc_3 = 0;
            while(_loc_3 < _loc_2.length)
            {
               _loc_4 = _loc_2[_loc_3];
               _loc_4.checked = false;
               _loc_3++;
            }
         }
         if(this._checked != param1)
         {
            this._checked = param1;
            this.dispatchEvent(new Event(Event.CHANGE));
         }
         this.displayChecked();
      }
  toggleChecked(): void {
         this.checked = !this.checked;
         this.displayChecked();
      }
  get group(): string {
         return this._group;
      }
  constructor() {
         super();
         this.addEventListener(MouseEvent.CLICK,$b(this, 'clickHandler'),false,0,true);
         var _loc_1= false;
         this.check.mouseChildren = false;
         this.check.mouseEnabled = _loc_1;
         this.textBox.autoSize = TextFieldAutoSize.LEFT;
         this.label = "";
         this.displayChecked();
      }
}
$reg('com.jiggmin.ui.CheckBoxClass', CheckBoxClass);
