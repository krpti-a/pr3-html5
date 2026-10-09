// Ported from com/jiggmin/basic/Tipable.as
import { MouseEvent, clearTimeout, setTimeout } from '../../flash/index.ts';
import { int, uint, $b } from '../../flash/as3.ts';
import { Removable } from './Removable.ts';
import { ToolTipPopup } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Tipable extends Removable {
  _toolTipAlign: string = "right";
  _toolTipPadding: number = 2;
  _toolTipWidth: number = 200;
  declare toolTipDisplay: ToolTipPopup;
  timeout: number = 0;
  _toolTip: string = "";
  _toolTipWait: number = 500;
  rollOutHandler(event: MouseEvent): void {
         this.removeToolTip();
      }
  set toolTip(param1: string) {
         this._toolTip = param1;
      }
  set toolTipAlign(param1: string) {
         this._toolTipAlign = param1;
      }
  remove(): void {
         this.removeEventListener(MouseEvent.ROLL_OVER,$b(this, 'rollOverHandler'));
         this.removeEventListener(MouseEvent.ROLL_OUT,$b(this, 'rollOutHandler'));
         this.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler$Tipable'));
         this.removeToolTip();
         super.remove();
      }
  set toolTipWidth(param1: number) {
    param1 = int(param1);
         this._toolTipWidth = int(param1);
      }
  rollOverHandler(event: MouseEvent): void {
         this.removeToolTip();
         this.timeout = uint(setTimeout($b(this, 'addToolTip'),this.toolTipWait));
      }
  addToolTip(): void {
         if(this.toolTip != "")
         {
            this.toolTipDisplay = new ToolTipPopup(this.toolTip,this,this.toolTipAlign,this.toolTipPadding,this.toolTipWidth);
            this.stage.addChild(this.toolTipDisplay);
         }
      }
  set toolTipPadding(param1: number) {
    param1 = int(param1);
         this._toolTipPadding = int(param1);
      }
  get toolTipAlign(): string {
         return this._toolTipAlign;
      }
  mouseDownHandler$Tipable(event: MouseEvent): void {
         this.removeToolTip();
      }
  get toolTip(): string {
         return this._toolTip;
      }
  get toolTipPadding(): number {
         return this._toolTipPadding;
      }
  set toolTipWait(param1: number) {
    param1 = int(param1);
         this._toolTipWait = int(param1);
      }
  get toolTipWait(): number {
         return this._toolTipWait;
      }
  get toolTipWidth(): number {
         return this._toolTipWidth;
      }
  removeToolTip(): void {
         clearTimeout(this.timeout);
         if(this.toolTipDisplay != null)
         {
            this.toolTipDisplay.remove();
            this.toolTipDisplay = null;
         }
      }
  constructor() {
         super();
         this.addEventListener(MouseEvent.ROLL_OVER,$b(this, 'rollOverHandler'),false,0,true);
         this.addEventListener(MouseEvent.ROLL_OUT,$b(this, 'rollOutHandler'),false,0,true);
         this.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDownHandler$Tipable'),false,0,true);
      }
}
$reg('com.jiggmin.basic.Tipable', Tipable);
