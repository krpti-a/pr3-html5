// Ported from com/jiggmin/pr3/items/PortableBlock.as
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { Block, MapManager, MineAppearSound, PortableBlockEffect, Sounds } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class PortableBlock extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
    var patternIndex, relativeX, relativeY; // undeclared in decompiled source
         var targetXPoint= undefined;
         var targetYPoint= undefined;
         var fillFrom= undefined;
         var fillTo= undefined;
         var fillFromX= undefined;
         var fillFromY= undefined;
         var itemPoint= null;
         var placeBlockHere= null;
         var targetPlacement= null;
         var markForFill: boolean= false;
         var fillCount= 1;
         var fillingX= 0;
         var doingX: boolean= false;
         var fillingY= 0;
         var doingY: boolean= false;
         var placedOne: boolean= false;
         for(var bPoint: number = int(0); bPoint < this.settings.pattern.length; bPoint++)
         {
            patternIndex = this.settings.pattern[bPoint].split(",");
            if(patternIndex == "f")
            {
               markForFill = true;
            }
            else
            {
               relativeX = patternIndex[0];
               relativeY = patternIndex[1];
               itemPoint = this.getItemPoint();
               if(markForFill)
               {
                  fillFrom = this.settings.pattern[bPoint - 2].split(",");
                  fillFromX = fillFrom[0];
                  fillFromY = fillFrom[1];
                  if(fillFromX == relativeX || fillFromY == relativeY)
                  {
                     if(fillFromX != relativeX)
                     {
                        fillCount = int(Math.abs(relativeX - fillFromX));
                        fillingX = int(fillCount);
                        doingX = true;
                     }
                     else
                     {
                        fillCount = int(Math.abs(relativeY - fillFromY));
                        fillingY = int(fillCount);
                        doingY = true;
                     }
                  }
                  markForFill = false;
               }
               while(fillCount >= 0)
               {
                  if(this.player.facing == "left")
                  {
                     targetXPoint = Math.floor((itemPoint.x - 40 * (relativeX - fillingX)) / Block.width) * Block.width + Block.width / 2;
                  }
                  else
                  {
                     targetXPoint = Math.floor((itemPoint.x + 40 * (relativeX - fillingX)) / Block.width) * Block.width + Block.width / 2;
                  }
                  targetYPoint = Math.floor((itemPoint.y - 40 * (relativeY - fillingY)) / Block.width) * Block.width + Block.width / 2;
                  targetPlacement = MapManager.map.blockMap.getBlockAtPos(targetXPoint,targetYPoint);
                  if(targetPlacement == null || !targetPlacement.active)
                  {
                     placeBlockHere = new PortableBlockEffect(this.settings.id,this.player,this.settings.speed);
                     placeBlockHere.x = targetXPoint;
                     placeBlockHere.y = targetYPoint;
                     placedOne = true;
                  }
                  if(doingX)
                  {
                     fillingX--;
                  }
                  else if(doingY)
                  {
                     fillingY--;
                  }
                  fillCount--;
               }
               doingX = false;
               doingY = false;
               fillingX = 0;
               fillingY = 0;
               fillCount = 1;
            }
         }
         if(placedOne)
         {
            super.useItem();
         }
         try
         {
            Sounds.startGameSound(new MineAppearSound(),placeBlockHere,1.5);
         }
         catch (TypeError)
         {
         }
      }
  constructor() {
         super();
         this.itemKeyframeName = "portableBlock";
         this.localOnly = true;
      }
}
$reg('com.jiggmin.pr3.items.PortableBlock', PortableBlock);
