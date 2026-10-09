// Ported from com/jiggmin/popup/TextPopup.as
import { TextFieldAutoSize } from '../../flash/index.ts';
import { int } from '../../flash/as3.ts';
import { ButtonPopup } from './ButtonPopup.ts';
import { EasyInput, EasyScroll, EditorPopupBGGraphic, Settings, TextGraphic } from '../refs.ts';
import { $reg } from '../refs.ts';

export class TextPopup extends ButtonPopup {
  static MAX_HEIGHT: number = 0;
  static inputMode: boolean = false;
  declare textGraphic: any;
  declare inputGraphic: EasyInput;
  declare scrollBar: EasyScroll;
  declare text: string;
  setWidth(param1: number): void {
    param1 = int(param1);
         this.textGraphic.textBox.width = param1;
         this.redraw();
      }
  setText(param1: string): void {
         this.textGraphic.textBox.htmlText = param1;
         if(this.textGraphic.height > TextPopup.MAX_HEIGHT)
         {
            if(this.scrollBar == null)
            {
               this.scrollBar = new EasyScroll();
               this.scrollBar.height = TextPopup.MAX_HEIGHT;
               this.scrollBar.x = this.textGraphic.textBox.width;
               this.scrollBar.y = this.padding;
               this.scrollBar.target = this.textGraphic;
               this.addGraphic(this.scrollBar);
               this.scrollBar.redraw();
               this.textGraphic.textBox.y = this.padding;
               this.textGraphic.textBox.x = this.padding;
               this.addChild(this.textGraphic);
               this.scrollBar.scrollPerc = 0;
            }
         }
         else if(this.scrollBar != null)
         {
            this.scrollBar.parent.removeChild(this.scrollBar);
            this.scrollBar = null;
            this.addGraphic(this.textGraphic);
         }
         this.redraw();
      }
  static __init() {
    TextPopup.MAX_HEIGHT = Settings.gameHeight - 80;
  }
  constructor(param1: string, takesInput: boolean = false) {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.textGraphic = new TextGraphic();
         this.textGraphic.textBox.autoSize = TextFieldAutoSize.LEFT;
         this.textGraphic.textBox.wordWrap = true;
         this.addGraphic(this.textGraphic);
         if(takesInput)
         {
            this.inputGraphic = new EasyInput();
            TextPopup.inputMode = true;
            this.addGraphic(this.inputGraphic);
         }
         this.setText(param1);
      }
}
$reg('com.jiggmin.popup.TextPopup', TextPopup);
