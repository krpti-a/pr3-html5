// Ported from com/jiggmin/pr3/editor/blockEditor/ChangeBlockPatternDisplay.as
import { Event, Point, Sprite } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Block, BlockButton, ImageButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ChangeBlockPatternDisplay extends Sprite {
  spacing: number = 40;
  maxBlocks: number = 150;
  declare selectedBlock: Block;
  declare buttonVector: ImageButton[];
  startX: number = 0;
  startY: number = 0;
  columns: number = 6;
  onlyOne: boolean = false;
  clickButton(param1: ImageButton): void {
         var _loc_2= (param1.data);
         this.selectedBlock = _loc_2;
         this.dispatchEvent(new Event(Event.SELECT));
         if(!this.onlyOne)
         {
            this.selectedBlock = null;
            this.removeButton(param1);
         }
      }
  removeButton(param1: ImageButton): void {
         var _loc_2= this.buttonVector.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.buttonVector.splice(_loc_2,1);
            this.redraw(_loc_2);
         }
         param1.remove();
      }
  popBlock(): void {
         this.removeButton(this.buttonVector[this.buttonVector.length - 1]);
      }
  getBlockIDArray(): any[] {
         var _loc_4= null;
         var _loc_5= null;
         var _loc_1= new Array();
         var _loc_2= this.buttonVector.length;
         var _loc_3= 0;
         while(_loc_3 < _loc_2)
         {
            _loc_4 = this.buttonVector[_loc_3];
            _loc_5 = (_loc_4.data);
            _loc_1[_loc_3] = _loc_5.id;
            _loc_3++;
         }
         return _loc_1;
      }
  remove(): void {
         this.buttonVector = null;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  createButton(param1: Block): ImageButton {
         var _loc_2= new BlockButton(param1,$b(this, 'clickButton'));
         _loc_2.clickOnMouseDown = true;
         return _loc_2;
      }
  addBlock(param1: Block): void {
         var _loc_2= null;
         if(true || this.buttonVector.length < this.maxBlocks)
         {
            if(Boolean(this.onlyOne) && this.buttonVector.length != 0)
            {
               this.popBlock();
            }
            _loc_2 = this.createButton(param1);
            this.buttonVector.push(_loc_2);
            this.redraw(this.buttonVector.length - 1);
         }
      }
  addBlockAtPos(param1: Block, param2: Point): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= 0;
         var _loc_6= 0;
         var _loc_7= null;
         if(true || this.buttonVector.length < this.maxBlocks)
         {
            _loc_3 = this.globalToLocal(param2);
            _loc_4 = Math.floor(_loc_3.y / this.spacing);
            _loc_5 = Math.floor(_loc_3.x / this.spacing);
            _loc_6 = _loc_4 * this.columns + _loc_5;
            if(_loc_6 >= this.buttonVector.length)
            {
               this.addBlock(param1);
            }
            else
            {
               _loc_7 = this.createButton(param1);
               this.buttonVector.splice(_loc_6,0,_loc_7);
               this.redraw(_loc_6);
            }
         }
      }
  redraw(param1: number = 0): void {
    param1 = int(param1);
         var _loc_3= 0;
         var _loc_4= null;
         var _loc_2= this.buttonVector.length;
         _loc_3 = param1;
         while(_loc_3 < _loc_2)
         {
            _loc_4 = this.buttonVector[_loc_3];
            _loc_4.x = _loc_3 % this.columns * this.spacing + this.startX;
            _loc_4.y = Math.floor(_loc_3 / this.columns) * this.spacing + this.startY;
            this.addChild(_loc_4);
            _loc_3++;
         }
      }
  constructor(onlyOne: boolean = false) {
         super();
         this.buttonVector =  [];
         this.onlyOne = onlyOne;
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.ChangeBlockPatternDisplay', ChangeBlockPatternDisplay);
