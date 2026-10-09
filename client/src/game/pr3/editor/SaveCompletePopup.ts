// Ported from com/jiggmin/pr3/editor/SaveCompletePopup.as
import { MouseEvent, URLRequest, navigateToURL } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, SaveCompletePopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SaveCompletePopup extends ButtonPopup {
  declare url: string;
  declare m: any;
  clickClose(): void {
         this.remove();
      }
  remove(): void {
         this.m.twitterButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickTwitterHandler'));
         this.m.facebookButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickFacebookHandler'));
         this.m.emailButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickEmailHandler'));
         this.m = null;
         super.remove();
      }
  clickEmailHandler(event: MouseEvent): void {
         navigateToURL(new URLRequest("mailto:?subject=Check out this level I made!&body=" + this.url));
      }
  clickFacebookHandler(event: MouseEvent): void {
         navigateToURL(new URLRequest("http://www.facebook.com/sharer.php?u=" + this.url));
      }
  clickTwitterHandler(event: MouseEvent): void {
         navigateToURL(new URLRequest("http://twitter.com/home?status=Check out this level I made: " + this.url));
      }
  constructor(param1: number) {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.url = "https://pr3hub.com/?levelId=" + param1.toString();
         this.m = new SaveCompletePopupGraphic();
         this.m.linkBox.text = this.url;
         this.m.twitterButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickTwitterHandler'),false,0,true);
         this.m.facebookButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickFacebookHandler'),false,0,true);
         this.m.emailButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickEmailHandler'),false,0,true);
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickClose'),"Close");
      }
}
$reg('com.jiggmin.pr3.editor.SaveCompletePopup', SaveCompletePopup);
