// Ported from com/jiggmin/pr3/lister/LevelSelector.as
import { int, uint, $each } from '../../../flash/as3.ts';
import { Selector } from './Selector.ts';
import { ButtonClass, Data, LevelListingButton } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LevelSelector extends Selector {
  storageExpireTime: number = 0;
  declare listCache: any;
  displayList(param1: any[]): void {
         var _loc_2= null;
         var _loc_3= null;
         this.removeGraphics();
         super.displayList(param1);
         for (_loc_2 of $each(param1))
         {
            _loc_3 = this.makeButtonForLevel(_loc_2);
            this.addButton(_loc_3,_loc_2.title);
         }
      }
  makeButtonForLevel(param1: any): ButtonClass {
         var _loc_3= null;
         var _loc_2= Data.filterSwearing(Data.cleanHTML(param1.comment));
         _loc_3 = this.makeButton();
         _loc_3.titleBox.htmlText = param1.title + " <font color=\'#1D5497\' size=\'10\'>by </font><font color=\'#" + uint(param1.author_name_color).toString(16) + "\' size=\'12\'>" + param1.author + "</font>";
         if(_loc_3.commentBox != null)
         {
            _loc_3.commentBox.text = _loc_2;
         }
         _loc_3.data = param1;
         _loc_3.toolTip = "Plays: " + param1.plays.toString() + "\nComment: " + _loc_2;
         _loc_3.width = this.targetWidth;
         return _loc_3;
      }
  setWidth(param1: number): void {
         var _loc_2= null;
         super.setWidth(param1);
         for (_loc_2 of $each(this.graphicArray))
         {
            _loc_2.width = param1;
         }
      }
  remove(): void {
         this.listCache = null;
         super.remove();
      }
  makeButton(): ButtonClass {
         return new LevelListingButton();
      }
  constructor(param1: number = 7, extraWidth: number = 0) {
    param1 = int(param1); extraWidth = int(extraWidth);
         super(param1,extraWidth);
         this.rowHeight = int(32);
         this.setWidth(370 + extraWidth);
      }
}
$reg('com.jiggmin.pr3.lister.LevelSelector', LevelSelector);
