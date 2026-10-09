// Ported from com/jiggmin/pr3/lister/MyBlockSelectorCategory.as
import { int, $b } from '../../../flash/as3.ts';
import { Selector } from './Selector.ts';
import { MessagePopup, MyBlockSelectorCategoryEvent, PlatformRacing3, Settings, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MyBlockSelectorCategory extends Selector {
  blocksPerPage: number = 15;
  declare categoryName: string;
  blockCountCallbackDone: any = false;
  blocksCount: number = 0;
  getMyBlocksAfterBlockCountCallbackDone: any = false;
  getMyBlocksStart: any = 0;
  getMyBlocksCount: any = 15;
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         if(Settings.loginType == "member")
         {
            if(this.blockCountCallbackDone)
            {
               if(!this.getMyBlocksAfterBlockCountCallbackDone)
               {
                  this.getMyBlocks(param1,param2);
               }
               else
               {
                  this.getMyBlocksStart = param1;
                  this.getMyBlocksCount = param2;
               }
            }
            else
            {
               this.getMyBlocksAfterBlockCountCallbackDone = true;
               this.getMyBlocksStart = param1;
               this.getMyBlocksCount = param2;
            }
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  getBlocksCount(): void {
         var _loc_3= null;
         var _loc_4= false;
         if(Settings.loginType == "member")
         {
            _loc_3 = ({} as any);
            _loc_3.p_category = this.categoryName;
            _loc_4 = false;
            Sparkworkz.DataAccess("CountMyBlocks2",_loc_3,$b(this, 'countMyBlocksCallback'),_loc_4);
         }
      }
  countMyBlocksCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your blocks could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = _loc_3.count;
            this.setTotalResults(_loc_4);
            this.blocksCount = int(_loc_4);
            this.blockCountCallbackDone = true;
            if(this.getMyBlocksAfterBlockCountCallbackDone)
            {
               this.getMyBlocks(this.getMyBlocksStart,this.getMyBlocksCount);
               this.getMyBlocksAfterBlockCountCallbackDone = false;
            }
         }
      }
  getMyBlocks(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= null;
         var _loc_4= false;
         if(Settings.loginType == "member")
         {
            _loc_3 = ({} as any);
            _loc_3.p_start = param1;
            _loc_3.p_count = param2;
            _loc_3.p_category = this.categoryName;
            _loc_4 = false;
            Sparkworkz.DataAccess("GetMyBlocks2",_loc_3,$b(this, 'getMyBlocksCallback'),_loc_4);
         }
      }
  getMyBlocksCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your blocks could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = new Array();
            _loc_7 = 0;
            while(_loc_7 < _loc_4)
            {
               _loc_8 = _loc_3[_loc_7].block_id;
               _loc_6 = ({} as any);
               _loc_6.blockID = _loc_8;
               _loc_5.push(_loc_6);
               _loc_7++;
            }
            this.setList(_loc_5);
            this.dispatchEvent(new MyBlockSelectorCategoryEvent(MyBlockSelectorCategoryEvent.LOADED,this,this.getCategoryName(),this.blocksCount,_loc_5));
         }
      }
  remove(): void {
         super.remove();
      }
  setBlocksPage(page: number): void {
    page = int(page);
         this.setPageNum(page);
      }
  getCategoryName(): string {
         return this.categoryName;
      }
  constructor(categoryName: string, blocksPerPage: number = 15) {
         super(this.blocksPerPage);
    blocksPerPage = int(blocksPerPage);
         this.blocksPerPage = int(blocksPerPage);
         this.categoryName = categoryName;

         this.pagination.setAllowGotoPage(false);
         this.pagination.setMaxElements(6);
         this.cacheSlug = "myBlocksCategory-" + this.categoryName;
         this.cacheSeconds = int(60 * 60);
         this.columns = int(5);
         this.setWidth(191);
         this.setHeight(145);
         this.startY = int(30);
         this.getBlocksCount();
      }
}
$reg('com.jiggmin.pr3.lister.MyBlockSelectorCategory', MyBlockSelectorCategory);
