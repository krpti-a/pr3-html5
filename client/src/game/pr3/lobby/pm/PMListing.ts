// Ported from com/jiggmin/pr3/lobby/pm/PMListing.as
import { uint, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Data, NameMaker, PMListingGraphic, PlatformRacing3, ReadPMPopup } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PMListing extends Removable {
  _pmID: number = 0;
  declare nameMaker: NameMaker;
  declare m: any;
  clickButton(): void {
         PlatformRacing3.addPopup(new ReadPMPopup(this._pmID));
      }
  get messageID(): number {
         return this._pmID;
      }
  set checked(param1: boolean) {
         this.m.checkBox.checked = param1;
      }
  get checked(): boolean {
         return this.m.checkBox.checked;
      }
  remove(): void {
         this.removeChild(this.m);
         this.m = null;
         this.nameMaker.remove();
         this.nameMaker = null;
         super.remove();
      }
  constructor(id: number, senderId: number, senderUsername: string, senderNameColor: number, title: string, timestamp: number) {
    id = uint(id); senderId = uint(senderId); senderNameColor = uint(senderNameColor); timestamp = uint(timestamp);
         super();
         this.m = new PMListingGraphic();
         this.nameMaker = new NameMaker();
         this._pmID = uint(id);
         if(title == "" || title == null)
         {
            title = "[no title]";
         }
         this.m.nameBox.htmlText = this.nameMaker.makeNameFromParts(senderUsername,0,senderId,senderNameColor);
         this.m.dateBox.text = Data.timestampToDate(timestamp * 1000);
         this.m.button.init(title,$b(this, 'clickButton'));
         this.m.button.align = "left";
         if(this.m.button.width > 200)
         {
            this.m.button.width = 200;
         }
         this.nameMaker.listenForLink(this.m.nameBox);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.lobby.pm.PMListing', PMListing);
