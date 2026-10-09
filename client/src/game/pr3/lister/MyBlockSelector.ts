// Ported from com/jiggmin/pr3/lister/MyBlockSelector.as
import { Event } from '../../../flash/index.ts';
import { int, $each, $b } from '../../../flash/as3.ts';
import { CategorySelector } from './CategorySelector.ts';
import { BlockEvent, BlockManager, DropdownEvent, ImageButton, MessagePopup, MyBlockSelectorCategoryEvent, PlatformRacing3, Settings, Sparkworkz } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MyBlockSelector extends CategorySelector {
  static lastCategory: string = new String();
  static lastCategoryPage: any = ({} as any);
  static getMyBlocksStart: any = ({} as any);
  static getMyBlocksCount: any = ({} as any);
  clickOnMouseDown: boolean = true;
  declare requestArray: any[];
  buttonSize: number = 36;
  declare list: any[];
  blocksPerPage: number = 15;
  myBlockSelectorCategoryEvent(event: MyBlockSelectorCategoryEvent): void {
         event.category.removeEventListener(MyBlockSelectorCategoryEvent.LOADED,$b(this, 'myBlockSelectorCategoryEvent'));
      }
  selectBlockCategory(event: DropdownEvent): void {
         MyBlockSelector.lastCategoryPage[this.cacheSlug] = this.getLastRememberedPage();
         var eventData= event.data;
         if(eventData.getCategoryName().indexOf("default-") == 0)
         {
         }
         event.data.addEventListener(MyBlockSelectorCategoryEvent.LOADED,$b(this, 'myBlockSelectorCategoryEvent'),false,0,true);
         this.cacheSlug = "myBlocksCategory-" + event.data.getCategoryName();
         if(MyBlockSelector.lastCategoryPage[this.cacheSlug] != null)
         {
            this.setPageNum(MyBlockSelector.lastCategoryPage[this.cacheSlug]);
         }
         else
         {
            this.setPageNum(1);
         }
      }
  remove(): void {
         MyBlockSelector.lastCategoryPage[this.cacheSlug] = this.getLastRememberedPage();
         this.list = null;
         BlockManager.removeEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'));
         super.remove();
      }
  blockAvailableHandler(event: BlockEvent): void {
         var _loc_8= undefined;
         var _loc_4= 0;
         var _loc_5= 0;
         var _loc_6= null;
         var _loc_7= null;
         var _loc_2= event.block;
         var _loc_3= this.requestArray.indexOf(_loc_2.id);
         if(_loc_3 != -1)
         {
            this.requestArray.splice(_loc_3,1);
            _loc_4 = this.list.length;
            _loc_5 = 0;
            while(_loc_5 < _loc_4)
            {
               _loc_7 = this.list[_loc_5];
               if(_loc_2.id == _loc_7.blockID)
               {
                  break;
               }
               _loc_5++;
            }
            _loc_6 = new ImageButton();
            _loc_6.data = _loc_2.id;
            _loc_6.toolTip = _loc_2.vars.title + "\n" + _loc_2.vars.comment;
            _loc_8 = this.buttonSize;
            _loc_6.height = this.buttonSize;
            _loc_6.width = _loc_8;
            _loc_6.addGraphic(_loc_2.clone());
            _loc_6.label = _loc_2.vars.title;
            _loc_6.clickOnMouseDown = this.clickOnMouseDown;
            this.column = int(_loc_5 % this.columns);
            this.row = int(Math.floor(_loc_5 / this.columns));
            this.addButton(_loc_6,_loc_2.vars.title);
            this.dispatchEvent(new Event("redraw"));
            this.updateCategoryDropdownChildIndex();
         }
      }
  displayList(param1: any[]): void {
         var _loc_2= null;
         this.list = param1;
         this.requestArray = new Array();
         for (_loc_2 of $each(param1))
         {
            this.requestArray.push(new Number(_loc_2.blockID));
         }
         BlockManager.requestManyBlocks(this.requestArray);
      }
  getMyBlockCategorysCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_7= 0;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your block categorys could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_7 = 0;
            while(_loc_7 < _loc_4)
            {
               _loc_5 = _loc_3[_loc_7].category;
               this.addCategoryAutomSelect(_loc_5,"category-" + _loc_5);
               _loc_7++;
            }
         }
      }
  requestResults(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= null;
         var _loc_4= false;
         if(Settings.loginType == "member")
         {
            MyBlockSelector.getMyBlocksStart[this.getLastRememberedCategoryID()] = param1;
            MyBlockSelector.getMyBlocksCount[this.getLastRememberedCategoryID()] = param2;
            _loc_3 = ({} as any);
            _loc_3.p_category = this.getLastRememberedCategoryID();
            _loc_4 = false;
            Sparkworkz.DataAccess("CountMyBlocks2",_loc_3,$b(this, 'countMyBlocksCallback'),_loc_4);
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  countMyBlocksCallback(param1: any, param2: string): void {
         var _loc_5= undefined;
         var _loc_6= undefined;
         var _loc_3= null;
         var _loc_4= 0;
         var category: string= "";
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your blocks could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = _loc_3.count;
            category = _loc_3.category;
            this.setCategoryResultsCount(category,_loc_4);
            _loc_5 = null;
            _loc_6 = false;
            if(Settings.loginType == "member")
            {
               _loc_5 = ({} as any);
               _loc_5.p_start = MyBlockSelector.getMyBlocksStart[_loc_3.category];
               _loc_5.p_count = MyBlockSelector.getMyBlocksCount[_loc_3.category];
               _loc_5.p_category = category;
               _loc_6 = false;
               Sparkworkz.DataAccess("GetMyBlocks2",_loc_5,$b(this, 'getMyBlocksCallback'),_loc_6);
            }
         }
      }
  getMyBlocksCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= 0;
         var _loc_8= 0;
         var category: string= "";
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your blocks could not be loaded. " + param2));
         }
         else
         {
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            category = param1.category;
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
            this.setCategoryData(category,_loc_5);
            this.removeGraphics();
            this.setTotalResults(this.getLastRememberedCategoryResultsCount());
            this.setList(this.getLastRememberedCategoryData());
            this.updateCategoryDropdownSize();
         }
      }
  constructor(param1: number = 15, param2: boolean = false) {
         super(param1,"All","default-all-blocks");
    param1 = int(param1);
         this.requestArray = new Array();
         this.list = new Array();
         this.blocksPerPage = int(param1);
         this.clickOnMouseDown = param2;
         BlockManager.addEventListener(BlockEvent.BLOCK_AVAILABLE,$b(this, 'blockAvailableHandler'),false,0,true);

         this.addCategoryAutomSelect("No category","default-all-blocks-without-category");
         this.pagination.setAllowGotoPage(true);
         this.pagination.setMaxElements(4);
         this.cacheSlug = "myBlocks";
         this.cacheSeconds = int(0);
         this.columns = int(5);
         this.setWidth(191 + 191);
         this.setHeight(145);
         this.startY = int(30);
         if(Settings.loginType != "member")
         {
            this.setCategoryDropdownVisiblity(false);
         }
         var _loc_3= null;
         var _loc_4= false;
         if(Settings.loginType == "member")
         {
            _loc_3 = ({} as any);
            _loc_3.p_category = param2;
            _loc_4 = false;
            Sparkworkz.DataAccess("GetMyBlockCategorys",_loc_3,$b(this, 'getMyBlockCategorysCallback'),_loc_4);
         }
      }
}
$reg('com.jiggmin.pr3.lister.MyBlockSelector', MyBlockSelector);
