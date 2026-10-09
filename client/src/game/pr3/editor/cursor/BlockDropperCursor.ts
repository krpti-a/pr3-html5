// Ported from com/jiggmin/pr3/editor/cursor/BlockDropperCursor.as
import { ContextMenuItem, MouseEvent, Point } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { AdvancedHolderCursor } from './AdvancedHolderCursor.ts';
import { Block, Clipboard, ClipboardFormats, ContextMenuEvent, MapHolder, MapManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockDropperCursor extends AdvancedHolderCursor {
  static blockCoordinatesMenuItem: ContextMenuItem = new ContextMenuItem("Copy block coordinates");
  static grapBlockMenuItem: ContextMenuItem = new ContextMenuItem("Grap block");
  static removeBlockMenuItem: ContextMenuItem = new ContextMenuItem("Remove block");
  dropping: boolean = false;
  declare _block: Block;
  runFrame(): void {
         super.runFrame();
         if(this.dropping)
         {
            this.drop(this.me);
         }
      }
  remove(): void {
         MapHolder.customContextMenu.removeEventListener(ContextMenuEvent.MENU_SELECT,$b(this, 'openCustomContextMenuHandler'));
         BlockDropperCursor.blockCoordinatesMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'blockCoordinatesMenuItemHandler'));
         BlockDropperCursor.grapBlockMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'grapBlockMenuItemHandler'));
         BlockDropperCursor.removeBlockMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'removeBlockMenuItemHandler'));
         this._block = null;
         super.remove();
      }
  openCustomContextMenuHandler(e: ContextMenuEvent): void {
         MapHolder.customContextMenu.customItems.push(BlockDropperCursor.blockCoordinatesMenuItem);
         var _loc_2: Point= this.getMapPoint();
         var _loc_3: Block= MapManager.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
         if(_loc_3 != null)
         {
            MapHolder.customContextMenu.customItems.push(BlockDropperCursor.grapBlockMenuItem);
            MapHolder.customContextMenu.customItems.push(BlockDropperCursor.removeBlockMenuItem);
         }
      }
  blockCoordinatesMenuItemHandler(e: ContextMenuEvent): void {
         var pos: any= this.getMapPoint();
         var x: number = int(Math.floor(pos.x / Block.width));
         var y: number = int(Math.floor(pos.y / Block.height));
         Clipboard.generalClipboard.clear();
         Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT,x + ", " + y);
      }
  grapBlockMenuItemHandler(e: ContextMenuEvent): void {
         var _loc_2: Point= this.getMapPoint();
         var _loc_3: Block= MapManager.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
         if(_loc_3 != null)
         {
            this.block = _loc_3.clone();
         }
      }
  removeBlockMenuItemHandler(e: ContextMenuEvent): void {
         var _loc_2: Point= this.getMapPoint();
         var _loc_3: Block= MapManager.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
         if(_loc_3 != null)
         {
            this.map.addCommand({
               "type":"removeBlock",
               "x":_loc_2.x,
               "y":_loc_2.y
            });
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         super.mouseUpHandler(event);
         this.dropping = false;
      }
  middleMouseDownHandler(event: MouseEvent): void {
         var _loc_2: Point= this.getMapPoint();
         var _loc_3: Block= MapManager.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
         if(_loc_3 != null)
         {
            this.block = _loc_3.clone();
         }
      }
  set block(param1: Block) {
         this._block = param1;
         this.graphic = param1;
      }
  mouseDownHandler(event: MouseEvent): void {
         super.mouseDownHandler(event);
         if(this.visible)
         {
            this.dropping = true;
            this.drop(event);
         }
      }
  get block(): Block {
         return this._block;
      }
  drop(event: MouseEvent): void {
         var _loc_2: Point= null;
         if(!this.holdingShift)
         {
            _loc_2 = null;
            if(this.block != null)
            {
               _loc_2 = this.getMapPoint();
               this.map.addCommand({
                  "type":"addBlock",
                  "blockID":this.block.id,
                  "x":_loc_2.x,
                  "y":_loc_2.y
               });
            }
         }
      }
  doShiftAction(): void {
         var endPoint: Point= this.getMapPoint();
         this.map.addCommand({
            "type":"addMultipleBlocks",
            "blockID":this.block.id,
            "startX":this.shiftStartPosition.x,
            "startY":this.shiftStartPosition.y,
            "endX":endPoint.x,
            "endY":endPoint.y
         });
         this.shiftStartPosition = null;
         this.shiftVisualizer.graphics.clear();
      }
  constructor() {
         super();
         this.setState("closedHand");
         MapHolder.customContextMenu.addEventListener(ContextMenuEvent.MENU_SELECT,$b(this, 'openCustomContextMenuHandler'));
         BlockDropperCursor.blockCoordinatesMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'blockCoordinatesMenuItemHandler'));
         BlockDropperCursor.grapBlockMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'grapBlockMenuItemHandler'));
         BlockDropperCursor.removeBlockMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'removeBlockMenuItemHandler'));
      }
}
$reg('com.jiggmin.pr3.editor.cursor.BlockDropperCursor', BlockDropperCursor);
