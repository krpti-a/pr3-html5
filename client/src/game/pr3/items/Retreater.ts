// Ported from com/jiggmin/pr3/items/Retreater.as
import { Point } from '../../../flash/index.ts';
import { int } from '../../../flash/as3.ts';
import { Item } from './Item.ts';
import { $reg } from '../../refs.ts';

export class Retreater extends Item {
  marking: boolean = true;
  coords: any[] = null;
  marksLeft: number = 1;
  init(itemSettings: any): void {
         super.init(itemSettings);
         this.coords = new Array();
         this.player.itemGraphic.retreater.gotoAndStop("idle");
         this.marksLeft = int(this.settings.interval);
         if(this.settings.interval > 1)
         {
            this.player.itemGraphic.retreater.marksLeft.text = this.marksLeft;
         }
         else
         {
            this.player.itemGraphic.retreater.marksLeft.visible = false;
         }
      }
  useItem(): void {
    var coord; // undeclared in decompiled source
         if(this.marking)
         {
            this.player.itemGraphic.retreater.gotoAndStop("marking");
            this.coords.insertAt(0,new Point(this.player.realX,this.player.realY));
            --this.marksLeft;
         }
         else
         {
            coord = this.coords.pop();
            this.player.showPoofEffect();
            this.player.setRealX(coord.x);
            this.player.setRealY(coord.y);
            this.player.showTeleportEffect();
            --this.marksLeft;
         }
         this.player.itemGraphic.retreater.marksLeft.text = this.marksLeft;
         if(!this.marksLeft)
         {
            this.marking = !this.marking;
            this.marksLeft = int(this.settings.interval);
            if(this.marking)
            {
               this.player.itemGraphic.retreater.gotoAndStop("idle");
            }
            else
            {
               this.player.itemGraphic.retreater.gotoAndStop("retreating");
            }
         }
         this.player.itemGraphic.retreater.marksLeft.text = this.marksLeft;
         super.useItem();
      }
  constructor() {
         super();
         this.itemKeyframeName = "retreater";
      }
}
$reg('com.jiggmin.pr3.items.Retreater', Retreater);
