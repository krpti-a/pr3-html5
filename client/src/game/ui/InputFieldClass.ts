// Ported from com/jiggmin/ui/InputFieldClass.as
import { FocusEvent, MovieClip, TextField } from '../../flash/index.ts';
import { int, $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { $reg } from '../refs.ts';

export class InputFieldClass extends Removable {
  declare bg: MovieClip;
  padding: number = 5;
  _hasFocus: boolean = false;
  declare textBox: TextField;
  _displayAsPassword: boolean = false;
  declare _placeholder: string;
  hasPlaceholder: boolean = false;
  get hasFocus(): boolean {
         return this._hasFocus;
      }
  set text(param1: string) {
         this.textBox.text = param1;
      }
  get restrict(): string {
         return this.textBox.restrict;
      }
  remove(): void {
         this.textBox.removeEventListener(FocusEvent.FOCUS_IN,$b(this, 'focusInHandler'));
         this.textBox.removeEventListener(FocusEvent.FOCUS_OUT,$b(this, 'focusOutHandler'));
         this._hasFocus = false;
         super.remove();
      }
  appendText(param1: string): void {
         this.textBox.appendText(param1);
      }
  set wordWrap(param1: boolean) {
         this.textBox.wordWrap = param1;
      }
  set width(param1: number) {
         param1 = Math.round(param1);
         this.textBox.width = param1 - 10;
         this.bg.width = param1;
      }
  get text(): string {
         return this.textBox.text;
      }
  set height(param1: number) {
         param1 = Math.round(param1);
         this.textBox.y = this.padding;
         this.textBox.height = param1 - this.padding * 2;
         this.bg.height = param1;
      }
  aquireFocus(): void {
         this.stage.focus = this.textBox;
      }
  set maxChars(param1: number) {
    param1 = int(param1);
         this.textBox.maxChars = param1;
      }
  focusInHandler(event: FocusEvent): void {
         this.bg.gotoAndStop("on");
         this.textBox.textColor = 0;
         this._hasFocus = true;
         if(Boolean(this.hasPlaceholder) && (this.placeholder != null && this.placeholder != ""))
         {
            this.hasPlaceholder = false;
            this.textBox.text = "";
            this.textBox.displayAsPassword = this.displayAsPassword;
         }
         this.dispatchEvent(event);
      }
  set displayAsPassword(param1: boolean) {
         this.textBox.displayAsPassword = this._displayAsPassword = param1;
         this.textBox.restrict = !param1 ? "a-z äö A-Z ÄÖ 0-9 `~!@#$%&*()_+=[]{}|;\':,./<>? \" \\- \\^ \\ " : null;
      }
  set restrict(param1: string) {
         this.textBox.restrict = param1;
      }
  set multiline(param1: boolean) {
         this.textBox.multiline = param1;
      }
  focusOutHandler(event: FocusEvent): void {
         this.bg.gotoAndStop("off");
         this.textBox.textColor = 2236962;
         this._hasFocus = false;
         this.setPlaceholder();
         this.dispatchEvent(event);
      }
  enable(): void {
         this.textBox.type = "input";
      }
  disable(): void {
         this.textBox.type = "dynamic";
      }
  set placeholder(placeholder: string) {
         this._placeholder = placeholder;
         this.setPlaceholder();
      }
  get placeholder(): string {
         return this._placeholder;
      }
  get displayAsPassword(): boolean {
         return this._displayAsPassword;
      }
  setPlaceholder(): void {
         if(!this.hasPlaceholder && this.placeholder != null && this.placeholder != "")
         {
            if(this.textBox.text == null || this.textBox.text == "")
            {
               this.hasPlaceholder = true;
               this.textBox.text = this.placeholder;
               this.textBox.displayAsPassword = false;
            }
         }
      }
  get width(): any { return super.width; }
  get height(): any { return super.height; }
  constructor() {
         super();
         this.textBox.addEventListener(FocusEvent.FOCUS_IN,$b(this, 'focusInHandler'),false,0,true);
         this.textBox.addEventListener(FocusEvent.FOCUS_OUT,$b(this, 'focusOutHandler'),false,0,true);
         this.x = Math.round(this.x);
         this.y = Math.round(this.y);
         this.width = this.width;
         this.scaleX = 1;
         if(this.scaleY != 1)
         {
            this.height = this.height;
            this.scaleY = 1;
         }
         this._displayAsPassword = this.textBox.displayAsPassword;
         if(!this._displayAsPassword)
         {
            this.textBox.restrict = "a-z äö A-Z ÄÖ 0-9 `~!@#$%&*()_+=[]{}|;\':,./<>? \" \\- \\^ \\ ";
         }
      }
}
$reg('com.jiggmin.ui.InputFieldClass', InputFieldClass);
