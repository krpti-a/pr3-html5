// Ported from com/jiggmin/pr3/lobby/ChangeLogPopup.as
import { TextEvent, Timer, TimerEvent, URLRequest, navigateToURL } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { ChangeLogPopupGraphic, EditorPopupBGGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class ChangeLogPopup extends ButtonPopup {
  declare m: any;
  firstText: boolean = false;
  textLogToAdd: string = "";
  _loc_2: any = false;
  timerTillAddText(e: TimerEvent): void {
         this.addText("the changelog was scrapped");
      }
  addText(text: string): void {
         this.textLogToAdd += text + "\n";
         this.m.changeLogText.htmlText = this.textLogToAdd;
      }
  addLink(link: string): void {
         this.textLogToAdd += "Example: " + "<a href=\'" + link + "\'>" + "<font color=\'#0033FF\'>" + link + "</font>" + "</a>" + "";
         this.m.changeLogText.addEventListener(TextEvent.LINK,$b(this, 'linkClickHandler'));
         this.m.changeLogText.htmlText = this.textLogToAdd;
      }
  linkClickHandler(e: TextEvent): void {
         navigateToURL(new URLRequest(e.text));
      }
  clickOK(): void {
         this.remove();
      }
  remove(): void {
         this.m = null;
         super.remove();
      }
  constructor() {
         super();
         this.m = new ChangeLogPopupGraphic();
         this.setBG(new EditorPopupBGGraphic());
         this.addGraphic(this.m);
         var myTimer: Timer= new Timer(100,1);
         myTimer.addEventListener(TimerEvent.TIMER,$b(this, 'timerTillAddText'));
         myTimer.start();
         this.createButton($b(this, 'clickOK'),"OK");
      }
}
$reg('com.jiggmin.pr3.lobby.ChangeLogPopup', ChangeLogPopup);
