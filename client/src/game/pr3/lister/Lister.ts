// Ported from com/jiggmin/pr3/lister/Lister.as
import { DisplayObject, Event, Sprite } from '../../../flash/index.ts';
import { int, $each, $b } from '../../../flash/as3.ts';
import { ListCache, LoadingGraphic, NoResultsFoundGraphic, Pagination } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Lister extends Sprite {
  static paginationMemory: any = ({} as any);
  static nextRequestID: number = 1;
  declare loadingGraphic: LoadingGraphic;
  count: number = 0;
  columnWidth: number = 40;
  targetHeight: number = 300;
  cacheSeconds: number = 60;
  rowHeight: number = 40;
  declare pagination: Pagination;
  declare noResultsGraphic: any;
  targetWidth: number = 400;
  startX: number = 0;
  startY: number = 25;
  declare bg: DisplayObject;
  cacheSlug: string = "";
  declare graphicArray: any[];
  column: number = 0;
  row: number = 0;
  columns: number = 1;
  removed: boolean = false;
  start: number = 0;
  paginationSlug: string = "";
  requestID: number = 0;
  results: number = 0;
  pageNum: number = 1;
  resultsPerPage: number = 0;
  displayList(param1: any[]): void {
         this.removeLoadingGraphic();
         this.removeNoResultsGraphic();
         if(param1.length == 0)
         {
            this.addNoResultsGraphic();
         }
      }
  setWidth(param1: number): void {
         this.targetWidth = int(param1);
         this.pagination.setAlign("right");
         this.pagination.x = param1;
         this.bg.width = param1;
      }
  addGraphic(param1: DisplayObject): void {
         var _loc_2= undefined;
         var _loc_3= undefined;
         param1.x = this.column * this.columnWidth + this.startX;
         param1.y = this.row * this.rowHeight + this.startY;
         this.addChild(param1);
         this.graphicArray.push(param1);
         _loc_2 = this;
         _loc_3 = this.column + 1;
         _loc_2.column = _loc_3;
         if(this.column >= this.columns)
         {
            this.column = int(0);
            _loc_2 = this;
            _loc_3 = this.row + 1;
            _loc_2.row = _loc_3;
         }
      }
  remove(): void {
         this.removed = true;
         this.removeGraphics();
         this.removeLoadingGraphic();
         this.removeNoResultsGraphic();
         this.pagination.removeEventListener(Event.CHANGE,$b(this, 'selectPageHandler'));
         this.pagination.remove();
         this.pagination = null;
         this.bg = null;
         this.graphicArray = null;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  addLoadingGraphic(): void {
         this.removeLoadingGraphic();
         this.loadingGraphic = new LoadingGraphic();
         this.positionLoadingGraphic();
         this.addChild(this.loadingGraphic);
      }
  setTotalResults(param1: number): void {
    param1 = int(param1);
         this.results = int(param1);
         var _loc_2= Math.ceil(param1 / this.resultsPerPage);
         if(this.pagination != null)
         {
            this.pagination.setPages(_loc_2);
         }
         if(this.cacheSlug != "" && this.cacheSeconds > 0)
         {
            ListCache.updateTotalResults(this.cacheSlug,param1);
         }
      }
  positionLoadingGraphic(): void {
         if(this.loadingGraphic != null)
         {
            this.loadingGraphic.x = this.targetWidth / 2 - this.loadingGraphic.width / 2;
            this.loadingGraphic.y = this.targetHeight / 2 - this.loadingGraphic.height / 2;
         }
      }
  setColumns(param1: number): void {
    param1 = int(param1);
         this.columns = int(param1);
      }
  selectPageHandler(event: Event): void {
         var _loc_2= this.pagination.getPage();
         this.setPageNum(_loc_2);
      }
  setList(param1: any[]): void {
         this.removeLoadingGraphic();
         if(this.cacheSlug != "" && this.cacheSeconds > 0)
         {
            ListCache.saveToCache(this.cacheSlug,this.cacheSeconds,$b(this, 'start'),this.count,this.results,param1);
         }
         this.displayList(param1);
      }
  removeGraphics(): void {
         var _loc_1= null;
         for (_loc_1 of $each(this.graphicArray))
         {
            this.removeGraphic(_loc_1);
         }
         this.graphicArray = new Array();
         this.column = int(0);
         this.row = int(0);
      }
  setHeight(param1: number): void {
         this.targetHeight = int(param1);
         this.bg.height = param1;
      }
  setPageNum(param1: number): void {
    param1 = int(param1);
         this.pageNum = int(param1);
         this.start = int((param1 - 1) * this.resultsPerPage);
         this.count = int(this.resultsPerPage);
         this.removeGraphics();
         Lister.paginationMemory[this.paginationSlug] = param1;
         this.pagination.setPage(param1);
         this.requestResults($b(this, 'start'),this.count);
      }
  removeLoadingGraphic(): void {
         if(this.loadingGraphic != null)
         {
            if(this.loadingGraphic.parent != null)
            {
               this.loadingGraphic.parent.removeChild(this.loadingGraphic);
            }
            this.loadingGraphic = null;
         }
      }
  createBG(): DisplayObject {
         var _loc_1= new Sprite();
         _loc_1.graphics.beginFill(0,0.5);
         _loc_1.graphics.drawRect(0,0,100,100);
         _loc_1.graphics.endFill();
         _loc_1.visible = false;
         return _loc_1;
      }
  getRequestID(): number {
         this.requestID = int(Lister.nextRequestID++);
         return this.requestID;
      }
  getLastRememberedPage(): number {
         var _loc_1= 1;
         if(Lister.paginationMemory[this.paginationSlug] != null)
         {
            _loc_1 = Lister.paginationMemory[this.paginationSlug];
         }
         return _loc_1;
      }
  removeGraphic(param1: DisplayObject): void {
         if(param1.parent == this)
         {
            this.removeChild(param1);
         }
      }
  removeNoResultsGraphic(): void {
         if(this.noResultsGraphic != null)
         {
            if(this.noResultsGraphic.parent != null)
            {
               this.noResultsGraphic.parent.removeChild(this.noResultsGraphic);
            }
            this.noResultsGraphic = null;
         }
      }
  refresh(): void {
         if(this.cacheSlug != "")
         {
            ListCache.deleteCache(this.cacheSlug);
         }
         this.setPageNum(this.pageNum);
      }
  requestResultsFromServer(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         this.addLoadingGraphic();
      }
  requestResults(param1: number, param2: number): void {
    param1 = int(param1); param2 = int(param2);
         var _loc_3= ListCache.getFromCache(this.cacheSlug,param1,param2);
         if(_loc_3 != false)
         {
            this.setTotalResults(_loc_3.totResults);
            this.displayList(_loc_3.list);
         }
         else
         {
            this.addLoadingGraphic();
            this.requestResultsFromServer(param1,param2);
         }
      }
  addNoResultsGraphic(): void {
         this.removeNoResultsGraphic();
         this.noResultsGraphic = new NoResultsFoundGraphic();
         this.noResultsGraphic.x = this.targetWidth / 2 - this.noResultsGraphic.width / 2;
         this.noResultsGraphic.y = this.targetHeight / 2 - this.noResultsGraphic.height / 2;
         this.addChild(this.noResultsGraphic);
      }
  setResultsPerPage(param1: number): void {
    param1 = int(param1);
         this.resultsPerPage = int(param1);
         this.setPageNum(this.pageNum);
      }
  redraw(): void {
         var _loc_4= undefined;
         var _loc_5= undefined;
         var _loc_3= null;
         this.row = int(0);
         this.column = int(0);
         var _loc_1= 0;
         var _loc_2= this.graphicArray.length;
         _loc_1 = 0;
         while(_loc_1 < _loc_2)
         {
            _loc_3 = this.graphicArray[_loc_1];
            _loc_3.x = this.column * this.columnWidth + this.startX;
            _loc_3.y = this.row * this.rowHeight + this.startY;
            _loc_4 = this;
            _loc_5 = this.column + 1;
            _loc_4.column = _loc_5;
            if(this.column >= this.columns)
            {
               this.column = int(0);
               _loc_4 = this;
               _loc_5 = this.row + 1;
               _loc_4.row = _loc_5;
            }
            _loc_1++;
         }
         this.positionLoadingGraphic();
      }
  getTargetHeight(): number {
         return this.targetHeight;
      }
  getTargetWidth(): number {
         return this.targetWidth;
      }
  constructor(param1: number = 7, extraWidth: number = 0) {
    param1 = int(param1); extraWidth = int(extraWidth);
         super();
         this.graphicArray = new Array();
         this.resultsPerPage = int(param1);
         this.bg = this.createBG();
         this.addChild(this.bg);
         this.pagination = new Pagination();
         this.pagination.addEventListener(Event.CHANGE,$b(this, 'selectPageHandler'),false,0,true);
         this.pagination.setPages(0);
         this.addChild(this.pagination);
         this.paginationSlug = this.toString();
         this.setWidth(400 + extraWidth);
         this.setHeight(245);
      }
}
$reg('com.jiggmin.pr3.lister.Lister', Lister);
