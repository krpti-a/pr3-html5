// Ported from com/jiggmin/pr3/items/Items.as
import { $each, $keys } from '../../../flash/as3.ts';
import { AngelWings, BlackHole, Block, Item, JetPack, LaserGun, Lightning, PortableBlock, PortableMine, RocketLauncher, Shield, SpeedBurst, SuperJump, Sword, Teleport } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Items {
  declare static lookup: any;
  static itemNameToAbbr: any = {};
  static NONE: string = "n";
  static NONE_TITLE: string = "None";
  static ANGEL_WINGS: string = "a";
  static ANGEL_WINGS_TITLE: string = "Angel\'s Wings";
  static BLACK_HOLE: string = "b";
  static BLACK_HOLE_TITLE: string = "Black Hole";
  static JET_PACK: string = "j";
  static JET_PACK_TITLE: string = "Jet Pack";
  static LASER_GUN: string = "l";
  static LASER_GUN_TITLE: string = "Laser Gun";
  static LIGHTNING: string = "li";
  static LIGHTNING_TITLE: string = "Lightning";
  static PORTABLE_BLOCK: string = "p";
  static PORTABLE_BLOCK_TITLE: string = "Portable Block";
  static PORTABLE_MINE: string = "po";
  static PORTABLE_MINE_TITLE: string = "Portable Mine";
  static ROCKET_LAUNCHER: string = "r";
  static ROCKET_LAUNCHER_TITLE: string = "Rocket Launcher";
  static SHIELD: string = "s";
  static SHIELD_TITLE: string = "Shield";
  static SPEED_BURST: string = "sp";
  static SPEED_BURST_TITLE: string = "Speed Burst";
  static SUPER_JUMP: string = "su";
  static SUPER_JUMP_TITLE: string = "Super Jump";
  static SWORD: string = "sw";
  static SWORD_TITLE: string = "Sword";
  static TELEPORT: string = "t";
  static TELEPORT_TITLE: string = "Teleport";
  static _defaultItems: any[] = new Array(Items.ANGEL_WINGS,Items.BLACK_HOLE,Items.JET_PACK,Items.LASER_GUN,Items.LIGHTNING,Items.PORTABLE_BLOCK,Items.PORTABLE_MINE,Items.ROCKET_LAUNCHER,Items.SHIELD,Items.SPEED_BURST,Items.SUPER_JUMP,Items.SWORD,Items.TELEPORT);
  static allItemProperties: any = {
         "a":{
            "ammo":{"value":3},
            "reload":{"value":0},
            "strength":{"value":1}
         },
         "b":{
            "ammo":{"value":1},
            "reload":{"value":800},
            "duration":{"value":9900},
            "strength":{"value":1},
            "speedx":{"value":0},
            "speedy":{"value":0}
         },
         "j":{
            "fuel":{"value":6600},
            "force":{"value":1}
         },
         "l":{
            "reload":{"value":800},
            "damage":{"value":1},
            "recoil":{"value":0.15},
            "knockback":{"value":1},
            "sap":{"value":0},
            "recovery":{"value":2500},
            "speed":{"value":29},
            "range":{"value":100},
            "repeat":{"value":0},
            "phasing":{"value":0},
            "stampid":{"value":0},
            "xOffset":{"value":0},
            "yOffset":{"value":0},
            "xscale":{"value":1},
            "yscale":{"value":1},
            "stamprot":{"value":0},
            "ammo":{"value":3},
            "rotation":{"value":[0,0]},
            "spread":{"value":0},
            "randomvel":{"value":0},
            "noknockback":{"value":false},
            "transferhit":{"value":false},
            "transferfade":{"value":false},
            "useanimation":{"value":false},
            "croptexture":{"value":false}
         },
         "li":{
            "ammo":{"value":1},
            "damage":{"value":1},
            "reload":{"value":800}
         },
         "p":{
            "ammo":{"value":1},
            "reload":{"value":0},
            "id":{"value":601},
            "speed":{"value":0},
            "pattern":{"value":["0,0"]}
         },
         "po":{},
         "r":{
            "ammo":{"value":1},
            "reload":{"value":0},
            "damage":{"value":1},
            "recoil":{"value":0.4},
            "knockback":{"value":1},
            "sap":{"value":0},
            "recovery":{"value":2500},
            "speed":{"value":14.5},
            "accel":{"value":1},
            "maxvel":{"value":20.5},
            "range":{"value":100},
            "repeat":{"value":0},
            "phasing":{"value":0},
            "stampid":{"value":0},
            "croptexture":{"value":false},
            "xOffset":{"value":0},
            "yOffset":{"value":0},
            "xscale":{"value":1},
            "yscale":{"value":1},
            "stamprot":{"value":0},
            "rotation":{"value":[0,0]},
            "spread":{"value":0},
            "randomvel":{"value":0},
            "noknockback":{"value":false}
         },
         "s":{"duration":{"value":10000}},
         "sp":{
            "strength":{"value":1},
            "duration":{"value":6000}
         },
         "su":{
            "ammo":{"value":1},
            "strength":{"value":0.7},
            "reload":{"value":0}
         },
         "sw":{
            "ammo":{"value":3},
            "reload":{"value":500},
            "damage":{"value":1},
            "slashes":{"value":1},
            "recoil":{"value":0.3},
            "knockback":{"value":1},
            "sap":{"value":0},
            "recovery":{"value":2500},
            "noknockback":{"value":false},
            "stampid":{"value":0},
            "xOffset":{"value":-30.9},
            "yOffset":{"value":-3.7},
            "xscale":{"value":1},
            "yscale":{"value":1},
            "stamprot":{"value":0},
            "useanimation":{"value":false},
            "croptexture":{"value":false}
         },
         "t":{
            "ammo":{"value":1},
            "reload":{"value":0},
            "vertical":{"value":0},
            "horizontal":{"value":3}
         }
      };
  static init(): void {
         Items.lookup = {};
         Items.lookup[Items.ANGEL_WINGS] = Items.ANGEL_WINGS_TITLE;
         Items.lookup[Items.BLACK_HOLE] = Items.BLACK_HOLE_TITLE;
         Items.lookup[Items.JET_PACK] = Items.JET_PACK_TITLE;
         Items.lookup[Items.LASER_GUN] = Items.LASER_GUN_TITLE;
         Items.lookup[Items.LIGHTNING] = Items.LIGHTNING_TITLE;
         Items.lookup[Items.PORTABLE_BLOCK] = Items.PORTABLE_BLOCK_TITLE;
         Items.lookup[Items.PORTABLE_MINE] = Items.PORTABLE_MINE_TITLE;
         Items.lookup[Items.ROCKET_LAUNCHER] = Items.ROCKET_LAUNCHER_TITLE;
         Items.lookup[Items.SHIELD] = Items.SHIELD_TITLE;
         Items.lookup[Items.SPEED_BURST] = Items.SPEED_BURST_TITLE;
         Items.lookup[Items.SUPER_JUMP] = Items.SUPER_JUMP_TITLE;
         Items.lookup[Items.SWORD] = Items.SWORD_TITLE;
         Items.lookup[Items.TELEPORT] = Items.TELEPORT_TITLE;
         Items.lookup[Items.NONE] = Items.NONE_TITLE;
      }
  static getItemAbbr(title: string): string {
         for (var abbr of $keys(Items.lookup))
         {
            if(Items.lookup[abbr] == title)
            {
               return abbr;
            }
         }
         return "";
      }
  static getItemTitle(abbr: string): string {
         return Items.lookup[abbr];
      }
  static getItemProperties(abbr: string): any {
         return Items.allItemProperties[abbr];
      }
  static getItemDefaultValues(abbr: string): any {
         var result: any= {};
         var props: any= Items.getItemProperties(abbr);
         for (var property of $keys(props))
         {
            result[property] = props[property].value;
         }
         return result;
      }
  static getItemClass(abbr: string): Item {
         if(abbr == Items.ANGEL_WINGS)
         {
            return new AngelWings();
         }
         if(abbr == Items.BLACK_HOLE)
         {
            return new BlackHole();
         }
         if(abbr == Items.JET_PACK)
         {
            return new JetPack();
         }
         if(abbr == Items.LASER_GUN)
         {
            return new LaserGun();
         }
         if(abbr == Items.LIGHTNING)
         {
            return new Lightning();
         }
         if(abbr == Items.PORTABLE_BLOCK)
         {
            return new PortableBlock();
         }
         if(abbr == Items.PORTABLE_MINE)
         {
            return new PortableMine();
         }
         if(abbr == Items.ROCKET_LAUNCHER)
         {
            return new RocketLauncher();
         }
         if(abbr == Items.SHIELD)
         {
            return new Shield();
         }
         if(abbr == Items.SPEED_BURST)
         {
            return new SpeedBurst();
         }
         if(abbr == Items.SUPER_JUMP)
         {
            return new SuperJump();
         }
         if(abbr == Items.SWORD)
         {
            return new Sword();
         }
         if(abbr == Items.TELEPORT)
         {
            return new Teleport();
         }
         return null;
      }
  static get defaultItems(): any[] {
         var result: any[]= [];
         for (var item of $each(Items._defaultItems))
         {
            result.push(item);
         }
         return result;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.items.Items', Items);
