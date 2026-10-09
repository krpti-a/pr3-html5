// Ported from com/jiggmin/pr3/editor/settingPopup/StampPickerPopup.as
import { Event } from '../../../../flash/index.ts';
import { int, $each, $b } from '../../../../flash/as3.ts';
import { PickerPopup } from './PickerPopup.ts';
import { MapPage, MyStampSelector, SelectorEvent, StampEditorPage, StampManager, Tab, Tabs } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class StampPickerPopup extends PickerPopup {
  declare tabs: Tabs;
  declare customStampSelector: MyStampSelector;
  clickClassic(): void {
         var stamp: any= null;
         if(this.customStampSelector != null)
         {
            this.customStampSelector.removeEventListener(SelectorEvent.SELECT,$b(this, 'selectCustomStampHandler'));
            this.customStampSelector.removeEventListener("redraw",$b(this, 'selectorRedrawHandler'));
            this.customStampSelector.remove();
            this.customStampSelector = null;
         }
         this.removeButtons();
         for (stamp of $each(StampManager.classicStamps))
         {
            this.addButton(stamp,stamp);
         }
      }
  selectCustomStampHandler(event: SelectorEvent): void {
         this.value = StampManager.requestStamp(event.data);
         if(this.removeOnPick)
         {
            this.remove();
         }
         else if(this.customStampSelector != null)
         {
            this.customStampSelector.deselect();
         }
      }
  selectorRedrawHandler(event: Event): void {
         this.redraw();
      }
  clickCustom(): void {
         this.removeButtons();
         if(this.customStampSelector == null)
         {
            this.customStampSelector = new MyStampSelector();
            this.customStampSelector.y = this.startY;
            this.customStampSelector.setWidth(400);
            this.customStampSelector.setHeight(100);
            this.customStampSelector.columns = int(10);
            this.customStampSelector.addEventListener(SelectorEvent.SELECT,$b(this, 'selectCustomStampHandler'),false,0,true);
            this.customStampSelector.addEventListener("redraw",$b(this, 'selectorRedrawHandler'),false,0,true);
            this.customStampSelector.redraw();
            this.addGraphic(this.customStampSelector);
         }
      }
  constructor() {
         super();
         this.startY = int(25);
         var tabs: any[]= Array();
         tabs.push(new Tab($b(this, 'clickClassic'),"Classic"));
         if(!(MapPage.instance instanceof StampEditorPage))
         {
            tabs.push(new Tab($b(this, 'clickCustom'),"Custom"));
         }
         this.addGraphic(new Tabs(tabs,0,400,"stampSelector"));
      }
}
$reg('com.jiggmin.pr3.editor.settingPopup.StampPickerPopup', StampPickerPopup);
