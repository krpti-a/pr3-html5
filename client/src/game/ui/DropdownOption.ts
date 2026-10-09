// Ported from com/jiggmin/ui/DropdownOption.as

import { $reg } from '../refs.ts';

export class DropdownOption {
  _label: string = "";
  declare _data: any;
  get data(): any {
         return this._data;
      }
  get label(): string {
         return this._label;
      }
  constructor(param1: string, param2: any) {
         
         if(param1 == null)
         {
            throw new Error("label can not be null");
         }
         this._label = param1;
         this._data = param2;
      }
}
$reg('com.jiggmin.ui.DropdownOption', DropdownOption);
