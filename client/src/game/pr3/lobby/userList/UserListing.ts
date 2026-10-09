// Ported from com/jiggmin/pr3/lobby/userList/UserListing.as
import { uint } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { NameMaker, UserListingGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class UserListing extends Removable {
  declare userName: string;
  declare nameMaker: NameMaker;
  rank: number = NaN;
  declare m: any;
  hats: number = NaN;
  remove(): void {
         this.nameMaker.remove();
         this.nameMaker = null;
         super.remove();
      }
  constructor(socketId: number, userId: number, username: string, rank: number, hatsCount: number, status: string, nameColor: number) {
    socketId = uint(socketId); userId = uint(userId); rank = uint(rank); hatsCount = uint(hatsCount); nameColor = uint(nameColor);
         super();
         this.m = new UserListingGraphic();
         this.addChild(this.m);
         this.userName = username;
         this.rank = rank;
         this.hats = hatsCount;
         this.nameMaker = new NameMaker();
         this.nameMaker.listenForLink(this.m.nameBox);
         this.m.nameBox.htmlText = this.nameMaker.makeNameFromParts(username,socketId,userId,nameColor);
         this.m.statusBox.text = status;
         this.m.rankBox.text = rank.toString();
         this.m.hatBox.text = hatsCount.toString();
      }
}
$reg('com.jiggmin.pr3.lobby.userList.UserListing', UserListing);
