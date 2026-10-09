// Ported from com/jiggmin/pr3/items/Buzzsaw.as
import { Point } from '../../../flash/index.ts';
import { Item } from './Item.ts';
import { Block, BlockSideSettings, BuzzsawEffect, GamePage, MapManager, MatchPage, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Buzzsaw extends Item {
  init(itemSettings: any): void {
         super.init(itemSettings);
      }
  useItem(): void {
         if(GamePage.instance instanceof MatchPage && Boolean((GamePage.instance).antiCheat))
         {
            if(GamePage.instance.localPlayer == this.player)
            {
               SocketManager.socket.sendUseItem();
            }
         }
         var roundedPlayerPt: Point= this.shiftPlayerPos();
         var blockOnPlayer: Block= MapManager.map.blockMap.getBlockAtPos(roundedPlayerPt.x,roundedPlayerPt.y);
         if(blockOnPlayer != null && blockOnPlayer.active)
         {
            if(blockOnPlayer.vars["left"].type != BlockSideSettings.INACTIVE && blockOnPlayer.vars["right"].type != BlockSideSettings.INACTIVE)
            {
               super.useItem();
               return;
            }
         }
         var itemPoint: Point= this.getItemPoint();
         var saw: BuzzsawEffect= new BuzzsawEffect(this.player,this.settings.damage,this.settings.duration,this.settings.horizontalforce,this.settings.verticalforce,this.settings.gravity,this.settings.postgravity,this.settings.overrides);
         saw.x = itemPoint.x;
         saw.y = itemPoint.y;
         saw.initTest();
         super.useItem();
      }
  shiftPlayerPos(): Point {
         var roundedPlayerPt: Point= new Point(this.player.x,this.player.y);
         if(this.player.rotation == 0 || Math.abs(this.player.rotation) == 180)
         {
            roundedPlayerPt.y += this.player.rotation == 0 ? -1 : 1;
         }
         else
         {
            roundedPlayerPt.x += this.player.rotation == 90 ? 1 : -1;
         }
         return roundedPlayerPt;
      }
  remove(): void {
         super.remove();
      }
  constructor() {
         super();
         this.itemKeyframeName = "buzzsaw";
      }
}
$reg('com.jiggmin.pr3.items.Buzzsaw', Buzzsaw);
