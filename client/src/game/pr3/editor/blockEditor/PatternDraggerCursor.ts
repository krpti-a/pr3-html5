// Ported from com/jiggmin/pr3/editor/blockEditor/PatternDraggerCursor.as
import { Event, MouseEvent, Point, clearTimeout, setTimeout } from '../../../../flash/index.ts';
import { uint, $b } from '../../../../flash/as3.ts';
import { Cursor } from '../../../ui/Cursor.ts';
import { Block, Maths } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PatternDraggerCursor extends Cursor {
  static DRAG_DROP: string = "dragDrop";
  static QUICK_ADD: string = "quickAdd";
  declare block: Block;
  quickTimeout: number = 0;
  declare pickupPos: Point;
  quickClick: boolean = false;
  dontDrag: boolean = false;
  remove(): void {
         clearTimeout(this.quickTimeout);
         this.removeBlock();
         super.remove();
      }
  removeBlock(): void {
         if(this.block != null)
         {
            this.block.remove();
            this.block = null;
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         var _loc_2= NaN;
         var _loc_3= NaN;
         var _loc_4= NaN;
         if(this.block != null)
         {
            _loc_2 = this.x - this.pickupPos.x;
            _loc_3 = this.y - this.pickupPos.y;
            _loc_4 = Maths.pythag(_loc_2,_loc_3);
            if(_loc_4 <= 3 && this.quickClick == true)
            {
               this.dispatchEvent(new Event(PatternDraggerCursor.QUICK_ADD));
            }
            else
            {
               this.dispatchEvent(new Event(PatternDraggerCursor.DRAG_DROP));
            }
            this.removeBlock();
         }
      }
  setBlock(param1: Block): void {
         this.removeBlock();
         this.block = param1;
         param1.x = -param1.width / 2;
         param1.y = -param1.height / 2;
         this.pickupPos.x = this.x;
         this.pickupPos.y = this.y;
         this.addChild(param1);
         this.quickClick = true;
         clearTimeout(this.quickTimeout);
         this.quickTimeout = uint(setTimeout($b(this, 'endQuickClick'),300));
      }
  endQuickClick(): void {
         this.quickClick = false;
      }
  getBlock(): Block {
         return this.block.clone();
      }
  constructor() {
         super();
         this.pickupPos = new Point();
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.PatternDraggerCursor', PatternDraggerCursor);
