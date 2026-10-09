// Ported from com/jiggmin/pr3/lister/MyBlockSelectorCategoryEvent.as
import { Event } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { MyBlockSelectorCategory } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MyBlockSelectorCategoryEvent extends Event {
  static LOADED: string = "loaded";
  declare _category: MyBlockSelectorCategory;
  declare _categoryName: string;
  _blocksCount: number = 0;
  declare _blockList: any[];
  get category(): MyBlockSelectorCategory {
         return this._category;
      }
  get categoryName(): string {
         return this._categoryName;
      }
  get blocksCount(): number {
         return this._blocksCount;
      }
  get blockList(): any[] {
         return this._blockList;
      }
  constructor(type: string, param1: any, param2: any, param3: any, param4: any, bubbles: boolean = false, cancelable: boolean = false) {
         super(type,bubbles,cancelable);
         this._category = param1;
         this._categoryName = param2;
         this._blocksCount = int(param3);
         this._blockList = param4;

      }
}
$reg('com.jiggmin.pr3.lister.MyBlockSelectorCategoryEvent', MyBlockSelectorCategoryEvent);
