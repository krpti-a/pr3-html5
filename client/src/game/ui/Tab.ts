// Ported from com/jiggmin/ui/Tab.as
import { MouseEvent } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { Removable } from '../basic/Removable.ts';
import { TabGraphic, Tabs } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Tab extends Removable {
  declare func: Function;
  declare m: any;
  declare tabs: Tabs;
  setTabs(param1: Tabs): void {
         this.tabs = param1;
      }
  activate(): void {
         this.deactivate();
         this.addEventListener(MouseEvent.CLICK,$b(this, 'onClick'));
         this.addEventListener(MouseEvent.MOUSE_OVER,$b(this, 'onOver'));
         this.addEventListener(MouseEvent.MOUSE_OUT,$b(this, 'onOut'));
      }
  onClick(event: MouseEvent): void {
         this.select();
      }
  remove(): void {
         this.deactivate();
         this.removeChild(this.m);
         this.m = null;
         this.tabs = null;
         this.func = null;
         super.remove();
      }
  onOut(event: MouseEvent): void {
         this.m.bg.gotoAndStop("up");
      }
  onOver(event: MouseEvent): void {
         this.m.bg.gotoAndStop("over");
         this.tabs.placeOnTop(this);
      }
  deactivate(): void {
         this.m.bg.gotoAndStop("up");
         this.removeEventListener(MouseEvent.CLICK,$b(this, 'onClick'));
         this.removeEventListener(MouseEvent.MOUSE_OVER,$b(this, 'onOver'));
         this.removeEventListener(MouseEvent.MOUSE_OUT,$b(this, 'onOut'));
      }
  select(): void {
         this.tabs.select(this);
         this.func();
         this.deactivate();
         this.m.bg.gotoAndStop("selected");
      }
  constructor(param1: Function, param2: string) {
         super();
         this.m = new TabGraphic();
         this.func = param1;
         this.m.textBox.text = param2;
         this.m.textBox.autoSize = "left";
         this.m.bg.width = this.m.textBox.width + 10;
         this.addChild(this.m);
         this.activate();
      }
}
$reg('com.jiggmin.ui.Tab', Tab);
