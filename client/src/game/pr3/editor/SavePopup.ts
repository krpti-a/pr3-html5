// Ported from com/jiggmin/pr3/editor/SavePopup.as
import { Event } from '../../../flash/index.ts';
import { $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { Block, CategorySelector, EditorPopupBGGraphic, ListCache, MapManager, MapPage, MessagePopup, SavePopupGraphic, Stamp } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class SavePopup extends ButtonPopup {
  declare mode: string;
  declare m: any;
  finalCheckBoxChange(event: Event): void {
         if(MapManager.map.isV3)
         {
            this.m.finalCheckBox.checked = true;
            return;
         }
         if(this.m.finalCheckBox.checked)
         {
            this.addPopup(new MessagePopup("<b>WARNING! WARNING!\n\nThis is experimental feature!</b> And you should be extra careful about this one! Take a backup of the level to ensure you still have your level if somethings goes wrong! This option will greatly boost the time needed to draw this " + this.mode + " with the cost of \'finalizing\' it by removing persistent undos. Also text will be unmodifiable. After saving this " + this.mode + " one time with this enabled you can not disable it anymore!"));
         }
      }
  remove(): void {
         if(this.stage != null)
         {
            this.stage.focus = this.stage;
         }
         this.m = null;
         super.remove();
      }
  clickSave(): void {
         var oldCategory: string= null;
         var newCategory: string= null;
         if(this.mode == "level")
         {
            (MapPage.instance).publish = this.m.publishCheckBox.checked;
            ListCache.deleteCache("myLevels");
         }
         else
         {
            oldCategory = MapPage.instance.category;
            newCategory = this.m.categoryBox.text;
            MapPage.instance.category = this.m.categoryBox.text;
            ListCache.deleteCache("myBlocks");
            CategorySelector.clearCache("myBlocks","default-all-blocks");
            if(newCategory == "")
            {
               CategorySelector.clearCache("myBlocks","default-all-blocks-without-category");
            }
            else
            {
               CategorySelector.clearCache("myBlocks","category-" + newCategory);
            }
            if(newCategory != oldCategory)
            {
               if(oldCategory == "")
               {
                  CategorySelector.clearCache("myBlocks","default-all-blocks-without-category");
               }
               else
               {
                  CategorySelector.clearCache("myBlocks","category-" + oldCategory);
               }
            }
         }
         MapPage.instance.title = this.m.titleBox.text;
         MapPage.instance.comment = this.m.commentBox.text;
         MapPage.instance.save(this.m.finalCheckBox.checked);
         this.remove();
      }
  clickCancel(): void {
         this.remove();
      }
  constructor(param1: string) {
         super();
         this.mode = param1;
         this.setBG(new EditorPopupBGGraphic());
         this.m = new SavePopupGraphic();
         this.m.commentBox.multiline = true;
         this.m.commentBox.wordWrap = true;
         this.m.commentBox.maxChars = 250;
         this.m.titleBox.text = MapPage.instance.title;
         this.m.commentBox.text = MapPage.instance.comment;
         if(param1 == "level")
         {
            this.m.removeChildAt(1);
            this.m.removeChild(this.m.categoryBox);
            this.m.commentBox.y -= 27;
            this.m.publishCheckBox.y -= 27;
            this.m.finalCheckBox.y -= 27;
            this.m.getChildAt(1).y = this.m.getChildAt(1).y - 27;
            this.m.publishCheckBox.label = "Publish?";
            this.m.publishCheckBox.checked = (MapPage.instance).publish;
            this.m.textBox.text = "Save Level";
         }
         else
         {
            this.m.categoryBox.text = MapPage.instance.category;
            this.m.removeChild(this.m.publishCheckBox);
            this.m.textBox.text = param1 == "block" ? "Save Block" : "Save Stamp";
         }
         this.m.finalCheckBox.checked = MapManager.map.isV3;
         this.m.finalCheckBox.label = "Final";
         this.m.finalCheckBox.addEventListener(Event.CHANGE,$b(this, 'finalCheckBoxChange'),false,0,true);
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickSave'),"Save");
         this.createButton($b(this, 'clickCancel'),"Cancel");
      }
}
$reg('com.jiggmin.pr3.editor.SavePopup', SavePopup);
