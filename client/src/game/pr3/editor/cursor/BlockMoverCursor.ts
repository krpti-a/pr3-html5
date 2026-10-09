// Ported from com/jiggmin/pr3/editor/cursor/BlockMoverCursor.as
import { ContextMenuItem, MouseEvent, Sprite } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { AdvancedHolderCursor } from './AdvancedHolderCursor.ts';
import { Block, Clipboard, ClipboardFormats, ContextMenuEvent, MapHolder } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockMoverCursor extends AdvancedHolderCursor {
  static blockCoordinatesMenuItem: ContextMenuItem = new ContextMenuItem("Copy block coordinates");
  static copyBlocksMenuItem: ContextMenuItem = new ContextMenuItem("Copy blocks");
  static lastCopiedBlocksMenuItem: ContextMenuItem = new ContextMenuItem("Last copied blocks");
  heldBlock: Block = null;
  heldBlocks: any[] = null;
  lastCopiedBlocks: any[] = null;
  lastCopiedBlocksSprite: Sprite = null;
  remove(): void {
         MapHolder.customContextMenu.removeEventListener(ContextMenuEvent.MENU_SELECT,$b(this, 'openCustomContextMenuHandler'));
         BlockMoverCursor.blockCoordinatesMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'blockCoordinatesMenuItemHandler'));
         BlockMoverCursor.copyBlocksMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'copyBlocksMenuItemHandler'));
         BlockMoverCursor.lastCopiedBlocksMenuItem.removeEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'lastCopiedBlocksMenuItemHandler'));
         super.remove();
      }
  openCustomContextMenuHandler(e: ContextMenuEvent): void {
    var _loc_3; // undeclared in decompiled source
         MapHolder.customContextMenu.customItems.push(BlockMoverCursor.blockCoordinatesMenuItem);
         var _loc_2= this.getMapPoint();
         _loc_3 = this.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
         if(_loc_3 != null)
         {
            MapHolder.customContextMenu.customItems.push(BlockMoverCursor.copyBlocksMenuItem);
         }
         if(this.lastCopiedBlocks != null)
         {
            MapHolder.customContextMenu.customItems.push(BlockMoverCursor.lastCopiedBlocksMenuItem);
         }
      }
  blockCoordinatesMenuItemHandler(e: ContextMenuEvent): void {
         var pos: any= this.getMapPoint();
         var x: number = int(Math.floor(pos.x / Block.width));
         var y: number = int(Math.floor(pos.y / Block.height));
         Clipboard.generalClipboard.clear();
         Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT,x + ", " + y);
      }
  lastCopiedBlocksMenuItemHandler(e: ContextMenuEvent): void {
         this.heldBlocks = this.lastCopiedBlocks.concat();
         this.setGraphic(this.lastCopiedBlocksSprite,-20,-20);
      }
  copyBlocksMenuItemHandler(e: ContextMenuEvent): void {
         var _loc_4= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var sprite: Sprite= null;
         var blocks: any[]= null;
         var startX: number = int(0);
         var startY: number = int(0);
         var endX: number = int(0);
         var endY: number = int(0);
         var xNeg: boolean= false;
         var yNeg: boolean= false;
         var x= 0;
         var y= 0;
         var block: Block= null;
         var blockC: Block= null;
         if(!this.holdingShift)
         {
            this.setState("closedHand");
            _loc_4 = null;
            _loc_2 = this.getMapPoint();
            _loc_3 = this.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
            if(_loc_3 != null)
            {
               if(this.shiftVisualizer.hitTestObject(this))
               {
                  this.map.addCommand({"type":"startGroupCommand"});
                  sprite = new Sprite();
                  blocks = new Array();
                  startX = int(Math.floor(this.shiftStartPosition.x / Block.height));
                  startY = int(Math.floor(this.shiftStartPosition.y / Block.width));
                  endX = int(Math.ceil(this.shiftVisualizer.getBounds(this.shiftVisualizer).right / Block.height));
                  endY = int(Math.ceil(this.shiftVisualizer.getBounds(this.shiftVisualizer).bottom / Block.width));
                  xNeg = startX - endX < 0;
                  yNeg = startY - endY < 0;
                  x = startX;
                  while(xNeg ? x < endX : x > endX)
                  {
                     y = startY;
                     while(yNeg ? y < endY : y > endY)
                     {
                        block = this.map.blockMap.getBlockAtPos(x * Block.height,y * Block.width);
                        if(block != null)
                        {
                           blockC = block.clone();
                           blockC.x = block.x - this.shiftStartPosition.x;
                           blockC.y = block.y - this.shiftStartPosition.y;
                           sprite.addChild(blockC);
                           blocks.push(blockC);
                        }
                        if(yNeg)
                        {
                           y++;
                        }
                        else
                        {
                           y--;
                        }
                     }
                     if(xNeg)
                     {
                        x++;
                     }
                     else
                     {
                        x--;
                     }
                  }
                  this.lastCopiedBlocks = blocks.concat();
                  this.lastCopiedBlocksSprite = sprite;
                  this.heldBlocks = blocks;
                  this.setGraphic(sprite,-20,-20);
                  this.shiftStartPosition = null;
                  this.shiftVisualizer.graphics.clear();
               }
               else
               {
                  this.heldBlock = _loc_3.clone();
                  this.graphic = this.heldBlock;
                  _loc_4 = this.getMapPoint();
               }
            }
         }
      }
  mouseUpHandler(event: MouseEvent): void {
         var _loc_2= undefined;
         var i= undefined;
         var block: Block= null;
         super.mouseUpHandler(event);
         if(!this.holdingShift)
         {
            this.setState("openHand");
            _loc_2 = null;
            this.graphic = new Sprite();
            if(this.heldBlock != null)
            {
               _loc_2 = this.getMapPoint();
               this.map.addCommand({
                  "type":"addBlock",
                  "blockID":this.heldBlock.id,
                  "x":_loc_2.x,
                  "y":_loc_2.y
               });
               this.heldBlock.remove();
               this.heldBlock = null;
            }
            else if(this.heldBlocks != null)
            {
               _loc_2 = this.getMapPoint();
               for(i = 0; i < this.heldBlocks.length; i++)
               {
                  block = this.heldBlocks[i];
                  this.map.addCommand({
                     "type":"addBlock",
                     "blockID":block.id,
                     "x":_loc_2.x + block.x,
                     "y":_loc_2.y + block.y
                  });
               }
               this.map.addCommand({"type":"endGroupCommand"});
               this.heldBlocks.length = 0;
               this.heldBlocks = null;
            }
         }
      }
  mouseDownHandler(event: MouseEvent): void {
         var _loc_4= undefined;
         var _loc_2= undefined;
         var _loc_3= undefined;
         var sprite: Sprite= null;
         var blocks: any[]= null;
         var startX: number = int(0);
         var startY: number = int(0);
         var endX: number = int(0);
         var endY: number = int(0);
         var xNeg: boolean= false;
         var yNeg: boolean= false;
         var x= 0;
         var y= 0;
         var block: Block= null;
         var blockC: Block= null;
         super.mouseDownHandler(event);
         if(!this.holdingShift && this.heldBlocks == null && this.heldBlock == null)
         {
            this.setState("closedHand");
            _loc_4 = null;
            _loc_2 = this.getMapPoint();
            _loc_3 = this.map.blockMap.getBlockAtPos(_loc_2.x,_loc_2.y);
            if(_loc_3 != null)
            {
               if(this.shiftVisualizer.hitTestObject(this))
               {
                  this.map.addCommand({"type":"startGroupCommand"});
                  sprite = new Sprite();
                  blocks = new Array();
                  startX = int(Math.floor(this.shiftStartPosition.x / Block.height));
                  startY = int(Math.floor(this.shiftStartPosition.y / Block.width));
                  endX = int(Math.ceil(this.shiftVisualizer.getBounds(this.shiftVisualizer).right / Block.height));
                  endY = int(Math.ceil(this.shiftVisualizer.getBounds(this.shiftVisualizer).bottom / Block.width));
                  xNeg = startX - endX < 0;
                  yNeg = startY - endY < 0;
                  x = startX;
                  while(xNeg ? x < endX : x > endX)
                  {
                     y = startY;
                     while(yNeg ? y < endY : y > endY)
                     {
                        block = this.map.blockMap.getBlockAtPos(x * Block.height,y * Block.width);
                        if(block != null)
                        {
                           blockC = block.clone();
                           blockC.x = block.x - this.shiftStartPosition.x;
                           blockC.y = block.y - this.shiftStartPosition.y;
                           sprite.addChild(blockC);
                           blocks.push(blockC);
                           this.map.addCommand({
                              "type":"removeBlock",
                              "x":block.x,
                              "y":block.y
                           });
                        }
                        if(yNeg)
                        {
                           y++;
                        }
                        else
                        {
                           y--;
                        }
                     }
                     if(xNeg)
                     {
                        x++;
                     }
                     else
                     {
                        x--;
                     }
                  }
                  this.heldBlocks = blocks;
                  this.setGraphic(sprite,-20,-20);
                  this.shiftStartPosition = null;
                  this.shiftVisualizer.graphics.clear();
               }
               else
               {
                  this.heldBlock = _loc_3.clone();
                  this.graphic = this.heldBlock;
                  _loc_4 = this.getMapPoint();
                  this.map.addCommand({
                     "type":"removeBlock",
                     "x":_loc_4.x,
                     "y":_loc_4.y
                  });
               }
            }
         }
      }
  constructor() {
         super();
         this.setState("openHand");
         MapHolder.customContextMenu.addEventListener(ContextMenuEvent.MENU_SELECT,$b(this, 'openCustomContextMenuHandler'));
         BlockMoverCursor.blockCoordinatesMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'blockCoordinatesMenuItemHandler'));
         BlockMoverCursor.copyBlocksMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'copyBlocksMenuItemHandler'));
         BlockMoverCursor.lastCopiedBlocksMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,$b(this, 'lastCopiedBlocksMenuItemHandler'));
      }
}
$reg('com.jiggmin.pr3.editor.cursor.BlockMoverCursor', BlockMoverCursor);
