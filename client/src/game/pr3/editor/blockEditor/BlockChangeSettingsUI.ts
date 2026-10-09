// Ported from com/jiggmin/pr3/editor/blockEditor/BlockChangeSettingsUI.as
import { Event, Point } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Block, BlockChangeSettingsUIGraphic, BlockManager, BlockPickerPopup, BlockSettings, ChangeBlockPatternDisplay, Cursor, PatternDraggerCursor, PlatformRacing3 } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockChangeSettingsUI extends Removable {
  declare display: ChangeBlockPatternDisplay;
  declare m: any;
  declare blockSettings: BlockSettings;
  declare cursor: PatternDraggerCursor;
  declare blockPicker: BlockPickerPopup;
  pickSource: string = "old";
  pickNewBlockHandler(event: Event): void {
         var _loc_2: Block= null;
         if(this.blockPicker.value != null)
         {
            _loc_2 = (this.blockPicker.value);
            this.cursor.setBlock(_loc_2.clone());
            this.blockPicker.value = null;
            this.pickSource = "new";
         }
      }
  quickAddHandler(event: Event): void {
         if(this.pickSource == "new")
         {
            this.display.addBlock(this.cursor.getBlock());
            $b(this.m, 'scroll').redraw();
            $b(this.m, 'scroll').positionThumb();
         }
      }
  dragDropHandler(event: Event): void {
         var _loc_2: Point= null;
         if(this.mouseX > this.m.bg.x && this.mouseX < this.m.bg.x + this.m.bg.width && this.mouseY > this.m.bg.y && this.mouseY < this.m.bg.y + this.m.bg.height)
         {
            _loc_2 = new Point(this.mouseX,this.mouseY);
            _loc_2 = this.localToGlobal(_loc_2);
            this.display.addBlockAtPos(this.cursor.getBlock(),_loc_2);
            $b(this.m, 'scroll').redraw();
            $b(this.m, 'scroll').positionThumb();
         }
      }
  pickOldBlockHandler(event: Event): void {
         var _loc_2: Block= this.display.selectedBlock;
         this.cursor.setBlock(_loc_2.clone());
         $b(this.m, 'scroll').redraw();
         $b(this.m, 'scroll').positionThumb();
         this.pickSource = "old";
      }
  remove(): void {
         this.blockPicker.removeEventListener(Event.CHANGE,$b(this, 'pickNewBlockHandler'));
         this.display.removeEventListener(Event.SELECT,$b(this, 'pickOldBlockHandler'));
         this.cursor.removeEventListener(PatternDraggerCursor.QUICK_ADD,$b(this, 'quickAddHandler'));
         this.cursor.removeEventListener(PatternDraggerCursor.DRAG_DROP,$b(this, 'dragDropHandler'));
         this.save();
         this.blockPicker.remove();
         this.blockPicker = null;
         this.cursor.remove();
         this.cursor = null;
         this.display.remove();
         this.display = null;
         this.m = null;
         this.blockSettings = null;
         super.remove();
      }
  save(): void {
         var _loc_1: any[]= this.display.getBlockIDArray();
         this.blockSettings.changePattern = _loc_1;
         var _loc_2: number= Number(this.m.freqBox.text) * 1000;
         if(_loc_2 == NaN)
         {
            _loc_2 = 2500;
         }
         this.blockSettings.changeFreq = int(_loc_2);
         this.blockSettings.randomChange = Boolean(this.m.setRandomChange.checked);
      }
  constructor(param1: BlockSettings) {
         super();
         var _loc_5: number= 0;
         this.blockSettings = param1;
         this.m = new BlockChangeSettingsUIGraphic();
         this.m.freqBox.restrict = "0-9.";
         this.m.freqBox.maxChars = 10;
         this.m.freqBox.text = (param1.changeFreq / 1000).toString();
         this.blockPicker = new BlockPickerPopup();
         this.blockPicker.dieWithoutFocus = false;
         this.blockPicker.removeOnPick = false;
         this.blockPicker.y = 250;
         this.blockPicker.x = 8;
         this.m.setRandomChange.textBox.text = "Randomize";
         this.m.setRandomChange.checked = Boolean(param1.randomChange);
         PlatformRacing3.addPopup(this.blockPicker);
         this.display = new ChangeBlockPatternDisplay();
         this.m.patternHolder.addChild(this.display);
         var _loc_2: any[]= param1.changePattern;
         var _loc_3: number = int(int(_loc_2.length));
         var _loc_4: number = int(0);
         while(_loc_4 < _loc_3)
         {
            _loc_5 = Number(_loc_2[_loc_4]);
            this.display.addBlock(BlockManager.requestBlock(_loc_5));
            _loc_4++;
         }
         $b(this.m, 'scroll').target = this.m.patternHolder;
         this.cursor = new PatternDraggerCursor();
         Cursor.setCursor(this.cursor);
         this.blockPicker.addEventListener(Event.CHANGE,$b(this, 'pickNewBlockHandler'),false,0,true);
         this.display.addEventListener(Event.SELECT,$b(this, 'pickOldBlockHandler'),false,0,true);
         this.cursor.addEventListener(PatternDraggerCursor.QUICK_ADD,$b(this, 'quickAddHandler'),false,0,true);
         this.cursor.addEventListener(PatternDraggerCursor.DRAG_DROP,$b(this, 'dragDropHandler'),false,0,true);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockChangeSettingsUI', BlockChangeSettingsUI);
