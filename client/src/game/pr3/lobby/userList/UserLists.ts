// Ported from com/jiggmin/pr3/lobby/userList/UserLists.as  // @edited: see comments marked "port:"
import { $b } from '../../../../flash/as3.ts';
import { TabPage } from '../../../page/TabPage.ts';
import { Tab, UserList, UserListSearch, UserListsSearchGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class UserLists extends TabPage {
  declare search: any;
  declare list: UserList;
  setList(param1: UserList): void {
         this.removeList();
         this.list = param1;
         this.list.y = 20;
         this.addChild(this.list);
      }
  clickSearchButton(): void {
         UserListSearch.searchStr = $b(this, 'search').searchBox.text;
         this.tabs.tabArray[3].select();
      }
  remove(): void {
         this.removeList();
         this.list = null;
         this.search = null;
         super.remove();
      }
  removeList(): void {
         if(this.list != null)
         {
            this.list.remove();
            this.list = null;
         }
      }
  clickIgnored(): void {
         this.setList(new UserList("ignored"));
      }
  clickFriends(): void {
         this.setList(new UserList("friends"));
      }
  clickSearch(): void {
         this.setList(new UserListSearch());
      }
  clickOnline(): void {
         this.setList(new UserList("online"));
      }
  constructor() {
         // port: tabs are built in TabPage's constructor (see TabPage)
         super((self: any) => [[new Tab($b(self, 'clickOnline'),"Online"), new Tab($b(self, 'clickFriends'),"Friends"), new Tab($b(self, 'clickIgnored'),"Ignored"), new Tab($b(self, 'clickSearch'),"Search")], 0],610,0,"userLists");
         this.search = new UserListsSearchGraphic();
         $b(this, 'search').searchButton.init("Search",$b(this, 'clickSearchButton'));
         $b(this, 'search').y = 20;
         this.addChild($b(this, 'search'));

         this.setTransformX(0);
      }
}
$reg('com.jiggmin.pr3.lobby.userList.UserLists', UserLists);
