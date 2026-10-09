// Ported from com/jiggmin/pr3/editor/LoadPopup.as
import { int, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { Block, BlockManager, ConfirmPopup, EditorPopupBGGraphic, ListCache, LoadPopupGraphic, MapPage, MyBlockSelector, MyLevelSelector, MyStampSelector, Selector, SelectorEvent, Sparkworkz, Stamp, StampManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LoadPopup extends ButtonPopup {
  declare mode: string;
  declare m: any;
  declare selector: Selector;
  clickDelete(): void {
         if(this.selector.selectedData != null)
         {
            this.addPopup(new ConfirmPopup($b(this, 'confirmDelete'),"Are you sure you want to delete this " + this.mode + "?"));
         }
      }
  remove(): void {
         this.selector.removeEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmChoiceHandler'));
         this.selector.remove();
         this.selector = null;
         this.m = null;
         super.remove();
      }
  confirmChoiceHandler(event: SelectorEvent): void {
         this.clickLoad();
      }
  confirmDelete(): void {
         var blockCategory: string= null;
         var stampCategory: string= null;
         var _loc_2= null;
         var _loc_3= false;
         var _loc_4= null;
         var _loc_1= this.getSelectedID();
         if(_loc_1 > 0)
         {
            _loc_2 = ({} as any);
            _loc_3 = false;
            if(this.mode == "level")
            {
               _loc_2.p_level_id = _loc_1;
               _loc_4 = "DeleteLevel2";
               ListCache.deleteCache("myLevels");
            }
            else if(this.mode == "block")
            {
               blockCategory = BlockManager.getBlock(_loc_1).vars.category;
               BlockManager.clearBlock(_loc_1);
               _loc_2.p_block_id = _loc_1;
               _loc_4 = "DeleteBlock2";
               ListCache.deleteCache("myBlocks");
               ListCache.deleteCache("myBlocksCategory-default-all-blocks");
               if(blockCategory == "")
               {
                  ListCache.deleteCache("myBlocksCategory-default-all-blocks-without-category");
               }
               else
               {
                  ListCache.deleteCache("myBlocksCategory-category-" + blockCategory);
               }
            }
            else if(this.mode == "stamp")
            {
               stampCategory = StampManager.getStamp(_loc_1).vars.category;
               StampManager.clearStamp(_loc_1);
               _loc_2.p_stamp_id = _loc_1;
               _loc_4 = "DeleteStamp";
               ListCache.deleteCache("default-all-stamps");
               if(stampCategory == "")
               {
                  ListCache.deleteCache("default-all-stamps-without-category");
               }
               else
               {
                  ListCache.deleteCache("myStamps-category-" + stampCategory);
               }
            }
            Sparkworkz.DataAccess(_loc_4,_loc_2,$b(this, 'deleteCallback'),_loc_3);
         }
      }
  getSelectedID(): number {
         if(this.selector instanceof MyLevelSelector)
         {
            return this.selector.selectedData.levelID;
         }
         if(this.selector instanceof MyBlockSelector)
         {
            return int(this.selector.selectedData);
         }
         if(this.selector instanceof MyStampSelector)
         {
            return int(this.selector.selectedData);
         }
         return 0;
      }
  clickLoad(): void {
         var _loc_1= 0;
         if(this.selector.selectedData != null)
         {
            _loc_1 = this.getSelectedID();
            if(_loc_1 > 0)
            {
               MapPage.instance.load(_loc_1);
               this.remove();
            }
         }
      }
  deleteCallback(param1: any, param2: string): void {
         if(this.selector instanceof MyBlockSelector)
         {
         }
         if(this.selector != null)
         {
            this.selector.refresh();
         }
      }
  clickCancel(): void {
         this.remove();
      }
  constructor(param1: string) {
         super();
         this.m = new LoadPopupGraphic();
         this.mode = param1;
         this.setBG(new EditorPopupBGGraphic());
         if(param1 == "level")
         {
            this.selector = new MyLevelSelector();
            this.m.textBox.text = "Load Level";
         }
         else if(param1 == "block")
         {
            this.selector = new MyBlockSelector();
            this.m.textBox.text = "Load Block";
         }
         else if(param1 == "stamp")
         {
            this.selector = new MyStampSelector();
            this.m.textBox.text = "Load Stamp";
         }
         this.selector.y = 40;
         this.addGraphic(this.m);
         this.addGraphic(this.selector);
         this.createButton($b(this, 'clickLoad'),"Load");
         this.createButton($b(this, 'clickDelete'),"Delete");
         this.createButton($b(this, 'clickCancel'),"Cancel");
         this.selector.addEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmChoiceHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.editor.LoadPopup', LoadPopup);
