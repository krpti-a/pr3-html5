// Ported from com/jiggmin/pr3/lister/MyStampSelector.as
import { Event } from '../../../flash/index.ts';
import { int, $each, $b } from '../../../flash/as3.ts';
import { CategorySelector } from './CategorySelector.ts';
import { ImageButton, MessagePopup, PlatformRacing3, Settings, Sparkworkz, StampEvent, StampManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class MyStampSelector extends CategorySelector {
  static lastCategoryPage: any = ({} as any);
  buttonSize: number = 36;
  stampsPerPage: number = 0;
  clickOnMouseDown: boolean = false;
  declare list: any[];
  declare requestArray: any[];
  getMyStampsCategorysCallback(response: any, error: string): void {
         var row: any= null;
         var i= undefined;
         var currentRow: any= null;
         if(error != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your stamp categorys could not be loaded. " + error));
         }
         else
         {
            row = response.Row;
            for(i = 0; i < response.NumRows; i++)
            {
               currentRow = row[i];
               this.addCategoryAutomSelect(currentRow.category,"category-" + currentRow.category);
            }
         }
      }
  requestResults(start: number, count: number): void {
    start = int(start); count = int(count);
    const $this = this;
         var request: any= null;
         if(Settings.loginType == "member")
         {
            request = ({} as any);
            request.p_category = this.getLastRememberedCategoryID();
            Sparkworkz.DataAccess("CountMyStamps",request,function (response: any, error: string): any {
               var row: any= null;
               var request: any= null;
               if(error != "")
               {
                  PlatformRacing3.addPopup(new MessagePopup("A list of your stamps could not be loaded. " + error));
               }
               else
               {
                  row = response.Row;
                  if(Settings.loginType == "member")
                  {
                     $this.setCategoryResultsCount(row.category,row.count);
                     request = ({} as any);
                     request.p_start = start;
                     request.p_count = count;
                     request.p_category = String(row.category);
                     Sparkworkz.DataAccess("GetMyStamps",request,$b($this, 'getMyStampsCallback'),false);
                  }
               }
            },false);
         }
         else
         {
            this.removeLoadingGraphic();
         }
      }
  getMyStampsCallback(response: any, error: string): void {
         var row: any= null;
         var stamps: any[]= null;
         var i: number = int(0);
         var stamp: any= null;
         if(error != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("A list of your stamps could not be loaded. " + error));
         }
         else
         {
            row = response.Row;
            stamps = new Array();
            for(i = int(0); i < response.NumRows; i++)
            {
               stamp = ({} as any);
               stamp.stampId = row.stamp_id[i];
               stamps.push(stamp);
            }
            this.setCategoryData(response.category,stamps);
            this.removeGraphics();
            this.setTotalResults(this.getLastRememberedCategoryResultsCount());
            this.setList(this.getLastRememberedCategoryData());
            this.updateCategoryDropdownSize();
         }
      }
  displayList(stamps: any[]): void {
         var stamp: any= null;
         this.list = stamps;
         this.requestArray = new Array();
         for (stamp of $each(stamps))
         {
            this.requestArray.push(Number(stamp.stampId));
         }
         StampManager.requestManyStamps(this.requestArray);
      }
  remove(): void {
         MyStampSelector.lastCategoryPage[this.cacheSlug] = this.getLastRememberedPage();
         this.list = null;
         StampManager.removeEventListener(StampEvent.STAMP_AVAILABLE,$b(this, 'stampAvailableHandler'));
         super.remove();
      }
  stampAvailableHandler(event: StampEvent): void {
         var index: number = int(0);
         var stampButton: ImageButton= null;
         var requestArrayIndex: number = int(int(this.requestArray.indexOf(event.stamp.id)));
         if(requestArrayIndex != -1)
         {
            this.requestArray.splice(requestArrayIndex,1);
            index = int(0);
            while(index < this.list.length)
            {
               if(event.stamp.id == this.list[index].stampId)
               {
                  break;
               }
               index++;
            }
            this.column = int(index % this.columns);
            this.row = int(Math.floor(index / this.columns));
            stampButton = new ImageButton();
            stampButton.data = event.stamp.id;
            stampButton.toolTip = event.stamp.vars.title + "\n" + event.stamp.vars.comment;
            stampButton.height = this.buttonSize;
            stampButton.width = this.buttonSize;
            stampButton.addGraphic(event.stamp.clone());
            stampButton.label = event.stamp.vars.title;
            stampButton.clickOnMouseDown = this.clickOnMouseDown;
            this.addButton(stampButton,event.stamp.vars.title);
            this.dispatchEvent(new Event("redraw"));
            this.updateCategoryDropdownChildIndex();
         }
      }
  constructor(stampsPerPage: number = 15, clickOnMouseDown: boolean = false) {
         super(stampsPerPage,"All","default-all-stamps");
    stampsPerPage = int(stampsPerPage);
         this.requestArray = new Array();
         this.list = new Array();
         this.stampsPerPage = int(stampsPerPage);
         this.clickOnMouseDown = clickOnMouseDown;
         StampManager.addEventListener(StampEvent.STAMP_AVAILABLE,$b(this, 'stampAvailableHandler'),false,0,true);

         this.addCategoryAutomSelect("No category","default-all-stamps-without-category");
         this.pagination.setAllowGotoPage(false);
         this.pagination.setMaxElements(3);
         this.cacheSlug = "myStamps";
         this.cacheSeconds = int(0);
         this.columns = int(5);
         this.setWidth(191 + 191);
         this.setHeight(145);
         this.startY = int(30);
         if(Settings.loginType == "member")
         {
            Sparkworkz.DataAccess("GetMyStampCategorys",({} as any),$b(this, 'getMyStampsCategorysCallback'),false);
         }
         else
         {
            this.setCategoryDropdownVisiblity(false);
         }
      }
}
$reg('com.jiggmin.pr3.lister.MyStampSelector', MyStampSelector);
