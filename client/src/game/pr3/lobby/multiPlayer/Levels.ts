// Ported from com/jiggmin/pr3/lobby/multiPlayer/Levels.as  // @edited: see comments marked "port:"
import { int, $b } from '../../../../flash/as3.ts';
import { TabPage } from '../../../page/TabPage.ts';
import { EasyButton, LevelSearch, LevelSearchPopup, LevelSelector, MyLevelSelector, PlatformRacing3, PublishedLevelSelector, SelectorEvent, Tab } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class Levels extends TabPage {
  declare static instance: Levels;
  static searchIndex: number = 0;
  declare selector: LevelSelector;
  resultsPerPage: number = 0;
  targetHeight: number = 0;
  addSelector(param1: LevelSelector): void {
         this.removeSelector();
         this.selector = param1;
         param1.x = this.transformX;
         param1.y = this.transformY;
         param1.setHeight(this.targetHeight);
         param1.addEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'),false,0,true);
         param1.addEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmLevelHandler'),false,0,true);
         this.addChild(param1);
      }
  clickSearchButton(): void {
         PlatformRacing3.addPopup(new LevelSearchPopup());
      }
  clickMyLevels(): void {
         this.addSelector(new MyLevelSelector(this.resultsPerPage));
      }
  remove(): void {
         Levels.instance = null;
         this.removeSelector();
         super.remove();
      }
  search(param1: string, param2: string, param3: string, param4: string): void {
         LevelSearch.mode = param1;
         LevelSearch.sort = param2;
         LevelSearch.dir = param3;
         LevelSearch.search = param4;
         this.tabs.tabArray[Levels.searchIndex].select();
      }
  selectLevelHandler(event: SelectorEvent): void {
         this.dispatchEvent(new SelectorEvent(SelectorEvent.SELECT,event.data));
      }
  removeSelector(): void {
         if(this.selector != null)
         {
            this.selector.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectLevelHandler'));
            this.selector.removeEventListener(SelectorEvent.CONFIRM,$b(this, 'confirmLevelHandler'));
            this.selector.remove();
            this.selector = null;
         }
      }
  clickBest(): void {
         this.addSelector(new PublishedLevelSelector("best",this.resultsPerPage));
      }
  confirmLevelHandler(event: SelectorEvent): void {
         this.dispatchEvent(new SelectorEvent(SelectorEvent.CONFIRM,event.data));
      }
  clickNewest(): void {
         this.addSelector(new PublishedLevelSelector("newest",this.resultsPerPage));
      }
  clickBestToday(): void {
         this.addSelector(new PublishedLevelSelector("best_today",this.resultsPerPage));
      }
  clickSearch(): void {
         this.addSelector(new LevelSearch(this.resultsPerPage));
      }
  searchUserName(param1: string): void {
         this.search("user","date","desc",param1);
      }
  clickCampaign(): void {
         this.addSelector(new PublishedLevelSelector("campaign",this.resultsPerPage));
      }
  clickLiked(): void {
         this.addSelector(new PublishedLevelSelector("liked",this.resultsPerPage));
      }
  constructor(param1: number = 245, param2: number = 7, searchOnly: boolean = false) {
         // port: the AS3 builds the tabs before super(); here they're built in TabPage's constructor (see
         // TabPage). targetHeight/resultsPerPage are set inside too, since the tab page uses them while
         // constructing, and again below because field initializers run after super() in JS.
         super((self: any) => {
            Levels.instance = self;
            self.targetHeight = int(param1);
            self.resultsPerPage = int(param2);
            var campaignTab: Tab= new Tab($b(self, 'clickCampaign'),"Campaign");
            var bestTab: Tab= new Tab($b(self, 'clickBest'),"Best");
            var todayBTab: Tab= new Tab($b(self, 'clickBestToday'),"Best Today");
            var newestTab: Tab= new Tab($b(self, 'clickNewest'),"Newest");
            var myLevelsTab: Tab= new Tab($b(self, 'clickMyLevels'),"My Levels");
            var searchTab: Tab= new Tab($b(self, 'clickSearch'),"Search");
            var likedTab: Tab= new Tab($b(self, 'clickLiked'),"Liked");
            var tabArray: any[] = searchOnly ? [searchTab] : [campaignTab,bestTab,todayBTab,newestTab,myLevelsTab,likedTab,searchTab];
            Levels.searchIndex = tabArray.indexOf(searchTab);
            return [tabArray, searchOnly ? 0 : 2];
         },400,searchOnly ? 0 : 2,"levels");
    param1 = int(param1); param2 = int(param2);
    var searchButton; // undeclared in decompiled source
         var _loc_12= undefined;
         var _loc_11= null;
         Levels.instance = this;
         this.targetHeight = int(param1);
         this.resultsPerPage = int(param2);

         _loc_12 = 0;
         this.selector.x = 0;
         this.transformX = int(_loc_12);
         _loc_12 = 21;
         this.selector.y = 21;
         this.transformY = int(_loc_12);
         searchButton = new EasyButton();
         searchButton.x = 0;
         searchButton.y = 23;
         searchButton.init("Search",$b(this, 'clickSearchButton'));
         this.addChild(searchButton);
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.Levels', Levels);
