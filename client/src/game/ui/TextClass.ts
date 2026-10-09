// Ported from com/jiggmin/ui/TextClass.as
import { MovieClip, TextField, TextFieldAutoSize } from '../../flash/index.ts';
import { int } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { EasyScroll } from '../refs.ts';
import { $reg } from '../refs.ts';

export class TextClass extends Removable {
  declare bg: MovieClip;
  declare scrollBar: EasyScroll;
  padding: number = 5;
  rightPadding: number = 5;
  targetHeight: number = 100;
  declare textBox: TextField;
  targetWidth: number = 100;
  removeScroll(): void {
         if(this.scrollBar != null)
         {
            this.scrollBar.remove();
            this.scrollBar = null;
         }
      }
  remove(): void {
         this.removeScroll();
         super.remove();
      }
  set height(param1: number) {
         this.targetHeight = int(param1);
         this.redraw();
      }
  get scrollPerc(): number {
         var _loc_1= 0;
         if(this.scrollBar != null)
         {
            _loc_1 = this.scrollBar.scrollPerc;
         }
         return _loc_1;
      }
  set text(param1: string) {
         this.textBox.text = param1;
         this.redraw();
      }
  set width(param1: number) {
         this.targetWidth = int(param1);
         this.redraw();
      }
  addScroll(): void {
         if(this.scrollBar == null)
         {
            this.scrollBar = new EasyScroll();
            this.scrollBar.height = this.targetHeight - this.padding * 2;
            this.scrollBar.x = this.targetWidth - this.scrollBar.width - this.padding;
            this.scrollBar.y = this.padding;
            this.scrollBar.target = this.textBox;
            this.addChild(this.scrollBar);
         }
         this.textBox.width = this.scrollBar.x - this.padding * 2 - this.rightPadding;
         this.scrollBar.y = this.padding;
         this.scrollBar.height = this.targetHeight - this.padding * 2;
      }
  get internalTextBox(): TextField {
         return this.textBox;
      }
  set scrollPerc(param1: number) {
         if(this.scrollBar != null)
         {
            this.scrollBar.scrollPerc = param1;
         }
      }
  get text(): string {
         return this.textBox.text;
      }
  redraw(): void {
         this.textBox.x = this.padding;
         this.textBox.y = this.padding;
         this.textBox.width = this.targetWidth - this.padding * 2 - this.rightPadding;
         this.bg.height = this.targetHeight;
         this.bg.width = this.targetWidth;
         if(this.textBox.height > this.targetHeight - this.padding * 2)
         {
            this.addScroll();
         }
         else
         {
            this.removeScroll();
         }
      }
  get htmlText(): string {
         return this.textBox.htmlText;
      }
  set htmlText(param1: string) {
         this.textBox.htmlText = param1;
         this.redraw();
      }
  get height(): any { return super.height; }
  get width(): any { return super.width; }
  constructor() {
         super();
         this.targetWidth = int(this.width);
         this.targetHeight = int(this.height);
         this.redraw();
         this.scaleX = 1;
         this.scaleY = 1;
         this.textBox.multiline = true;
         this.textBox.autoSize = TextFieldAutoSize.LEFT;
         this.textBox.selectable = true;
      }
}
$reg('com.jiggmin.ui.TextClass', TextClass);
