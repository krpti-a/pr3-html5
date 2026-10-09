// Ported from com/jiggmin/pr3/block/BlockSideSettings.as
import { int } from '../../../flash/as3.ts';
import { $reg } from '../../refs.ts';

export class BlockSideSettings {
  static EXPLODE: string = "explode";
  static TELEPORT: string = "teleport";
  static ACTIVE: string = "active";
  static BOUNCE: string = "bounce";
  static HURT: string = "hurt";
  static SAFETY: string = "safety";
  static FINISH: string = "finish";
  static CRUMBLE: string = "crumble";
  static PUSH_RIGHT: string = "pushRight";
  static GIVE_ITEM: string = "giveItem";
  static PUSH_LEFT: string = "pushLeft";
  static ROTATE_RIGHT: string = "rotateRight";
  static PUSH_UP: string = "pushUp";
  static PUSH_DOWN: string = "pushDown";
  static DEC_STATS: string = "decStats";
  static INACTIVE: string = "inactive";
  static ICE: string = "ice";
  static BE_PUSHED: string = "bePushed";
  static SHATTER: string = "shatter";
  static ROTATE_LEFT: string = "rotateLeft";
  static VANISH: string = "vanish";
  static INC_STATS: string = "incStats";
  static INC_HEALTH: string = "incHealth";
  static REFLECT: string = "reflect";
  static GLASS: string = "glass";
  static CHECKPOINT: string = "checkpoint";
  static C_STATS: string = "customStats";
  static CODE: string = "code";
  static BUTTON: string = "button";
  static C_ITEM: string = "customItem";
  static DISPENSE: string = "dispense";
  static SHOOT: string = "shoot";
  static LUA: string = "lua";
  teleportID: number = 0;
  incSpeed: number = 5;
  incAccel: number = 5;
  incJump: number = 5;
  declare type: string;
  getSaveObj(): any {
         var _loc_1= ({} as any);
         _loc_1.type = this.type;
         if(this.type == BlockSideSettings.TELEPORT)
         {
            _loc_1.teleportID = this.teleportID;
         }
         else if(this.type == BlockSideSettings.INC_STATS)
         {
         }
         return _loc_1;
      }
  setSaveObj(param1: any): void {
         this.type = param1.type;
         if(param1.teleportID != null)
         {
            this.teleportID = int(param1.teleportID);
         }
      }
  constructor() {
         
         this.type = BlockSideSettings.ACTIVE;
      }
}
$reg('com.jiggmin.pr3.block.BlockSideSettings', BlockSideSettings);
