// Ported from com/jiggmin/ui/DropdownEvent.as
import { Event } from '../../flash/index.ts';
import { DropdownOption } from '../refs.ts';
import { $reg } from '../refs.ts';

export class DropdownEvent extends Event {
  static SELECT: string = "select";
  declare _option: DropdownOption;
  get option(): DropdownOption {
         return this._option;
      }
  get data(): any {
         return this._option.data;
      }
  get label(): string {
         return this._option.label;
      }
  clone(): Event {
         return new DropdownEvent(this.type,this._option,this.bubbles,this.cancelable);
      }
  constructor(param1: string, param2: DropdownOption, param3: boolean = false, param4: boolean = false) {
         super(param1,param3,param4);
         this._option = param2;

      }
}
$reg('com.jiggmin.ui.DropdownEvent', DropdownEvent);
