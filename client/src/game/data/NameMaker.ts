// Ported from com/jiggmin/data/NameMaker.as
import { Event, Sprite, TextEvent } from '../../flash/index.ts';
import { uint, $uint, $as, $b } from '../../flash/as3.ts';
import { BlossomUser, PlatformRacing3, UserPopup } from '../refs.ts';
import { $reg } from '../refs.ts';

export class NameMaker extends Sprite {
  declare listenArray: any[];
  clickLinkHandler(event: TextEvent): void {
         PlatformRacing3.addPopup(new UserPopup(event.text));
         this.dispatchEvent(new Event("nameClick"));
      }
  makeName(user: BlossomUser, color: string = ""): string {
         return this.makeNameFromParts(user.userName,user.socketID,user.userID,$as(color, $uint));
      }
  remove(): void {
         var _loc_3= undefined;
         var _loc_1= 0;
         var _loc_2= this.listenArray.length;
         _loc_1 = 0;
         while(_loc_1 < _loc_2)
         {
            _loc_3 = this.listenArray[_loc_1];
            if(_loc_3 != null)
            {
               _loc_3.removeEventListener(TextEvent.LINK,$b(this, 'clickLinkHandler'));
               _loc_3 = null;
            }
            _loc_1++;
         }
         this.listenArray = null;
      }
  listenForLink(param1: any): void {
         this.listenArray.push(param1);
         param1.addEventListener(TextEvent.LINK,$b(this, 'clickLinkHandler'),false,0,true);
      }
  makeNameFromParts(username: string, socketId: number, userId: number, color: number): string {
    socketId = uint(socketId); userId = uint(userId); color = uint(color);
         return "<font color=\"#" + color.toString(16) + "\"><a href=\"event:" + socketId + ":" + userId + ":" + username + "\">" + username + "</a></font>";
      }
  constructor() {
         super();
         this.listenArray = new Array();
      }
}
$reg('com.jiggmin.data.NameMaker', NameMaker);
