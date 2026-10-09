// Ported from com/jiggmin/pr3/block/BlockSettings.as
import { int, $keys } from '../../../flash/as3.ts';
import { BlockCustomItemSettings, BlockSideSettings, Data, Items, MessagePopup, PlatformRacing3 } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockSettings {
  static IMPERVIOUS: string = "impervious";
  static WEAK: string = "weak";
  static ACTIVE: string = "active";
  static CHKPOINT: string = "checkpoint";
  static START: string = "start";
  static INACTIVE: string = "inactive";
  static CHANGE: string = "change";
  static MOVE: string = "move";
  static WATER: string = "water";
  static GLASS: string = "glass";
  static REACTOR: string = "reactor";
  static GENERATOR: string = "generator";
  static INACTIVE_LUA: string = "lua inactive";
  static WATER_LUA: string = "lua water";
  declare changePattern: any[];
  moveFreq: number = 0;
  declare itemArray: any[];
  declare left: BlockSideSettings;
  changeFreq: number = 0;
  randomChange: boolean = false;
  timeTillBreak: number = 0;
  reflectAngle: number = 0;
  timeTillVanish: number = 0;
  bounciness: number = NaN;
  arrowPower: number = NaN;
  dispenseCoins: number = 0;
  rotationSpeed: number = NaN;
  buttonID: number = 0;
  reactorID: number = 0;
  chkPointReset: boolean = false;
  teleportUses: number = 0;
  teleportCooldown: number = 0;
  randomDestination: boolean = false;
  stats: any = ({} as any);
  code: any = ({} as any);
  lua: any = ({} as any);
  coins: number = 0;
  collapse: boolean = false;
  swimSpeed: number = NaN;
  declare generatorDirection: string;
  generatorFrequency: number = 0;
  generatorBlockID: number = 0;
  predictableItems: boolean = false;
  declare itemType: BlockCustomItemSettings;
  declare blockTag: any[];
  phasingNumber: number = 0;
  defaultMoveFreq: number = 2500;
  defaultChangeFreq: number = 2500;
  defaultRandomChange: boolean = false;
  defaultTimeTillBreak: number = 2500;
  defaultReflectAngle: number = 180;
  defaultTimeTillVanish: number = 0;
  defaultBounciness: number = 1;
  defaultArrowPower: number = 1;
  defaultHealth: number = 100;
  defaultDispenseCoins: number = 3;
  defaultRotationSpeed: number = 1;
  defaultButtonID: number = 0;
  defaultReactorID: number = 0;
  defaultChkpointReset: boolean = false;
  defaultTeleportUses: number = -1;
  defaultTeleportCooldown: number = 3000;
  defaultRandomDestination: boolean = false;
  defaultStats: any = {
         "speed":1,
         "accel":1,
         "jump":1,
         "maxStat":100,
         "setStatsTo":false
      };
  defaultCode: any = ({} as any);
  defaultLua: any = ({} as any);
  defaultCoins: number = 3;
  defaultCollapse: boolean = false;
  defaultSwimSpeed: number = 1;
  defaultGeneratorDirection: string = "Up";
  defaultGeneratorFrequency: number = 2500;
  defaultGeneratorBlockID: number = 601;
  defaultPredictableItems: boolean = false;
  defaultBlockTag: any[] = [];
  defaultPhasingNumber: number = 1;
  temporary: boolean = false;
  declare top: BlockSideSettings;
  declare movePattern: string;
  declare title: string;
  declare category: string;
  declare right: BlockSideSettings;
  declare comment: string;
  defaultMovePattern: string = "up, right, down, left";
  declare defaultChangePattern: any[];
  health: number = 100;
  itemSupply: number = 1;
  declare bottom: BlockSideSettings;
  declare saveString: string;
  statSupply: number = 1;
  declare bump: BlockSideSettings;
  declare type: string;
  compressSettings(): string {
         var side= undefined;
         var _loc_3= null;
         var _loc_1= ({} as any);
         _loc_1.type = this.type;
         _loc_1.health = this.health;
         _loc_1.statSupply = this.statSupply;
         _loc_1.itemSupply = this.itemSupply;
         _loc_1.left = this.left.getSaveObj();
         _loc_1.right = this.right.getSaveObj();
         _loc_1.top = this.top.getSaveObj();
         _loc_1.bottom = this.bottom.getSaveObj();
         _loc_1.bump = this.bump.getSaveObj();
         if(this.canGiveItem() || this.isCustomItem())
         {
            _loc_1.itemArray = this.itemArray;
         }
         if(this.isCustomItem())
         {
            _loc_1.itemType = this.itemType.getSaveObj();
         }
         if(this.movePattern != this.defaultMovePattern)
         {
            _loc_1.movePattern = this.movePattern;
         }
         if(this.moveFreq != this.defaultMoveFreq)
         {
            _loc_1.moveFreq = this.moveFreq;
         }
         if(this.changePattern != this.defaultChangePattern)
         {
            _loc_1.changePattern = this.changePattern;
         }
         if(this.changeFreq != this.defaultChangeFreq)
         {
            _loc_1.changeFreq = this.changeFreq;
         }
         if(this.randomChange != this.defaultRandomChange)
         {
            _loc_1.randomChange = this.randomChange;
         }
         if(this.timeTillBreak != this.defaultTimeTillBreak)
         {
            _loc_1.timeTillBreak = this.timeTillBreak;
         }
         if(this.reflectAngle != this.defaultReflectAngle)
         {
            _loc_1.reflectAngle = this.reflectAngle;
         }
         if(this.timeTillVanish != this.defaultTimeTillVanish)
         {
            _loc_1.timeTillVanish = this.timeTillVanish;
         }
         if(this.bounciness != this.defaultBounciness)
         {
            _loc_1.bounciness = this.bounciness;
         }
         if(this.arrowPower != this.defaultArrowPower)
         {
            _loc_1.arrowPower = this.arrowPower;
         }
         if(this.health != this.defaultHealth)
         {
            _loc_1.health = this.health;
         }
         if(this.dispenseCoins != this.defaultDispenseCoins)
         {
            _loc_1.dispenseCoins = this.dispenseCoins;
         }
         if(this.swimSpeed != this.defaultSwimSpeed)
         {
            _loc_1.swimSpeed = this.swimSpeed;
         }
         if(this.generatorDirection != this.defaultGeneratorDirection)
         {
            _loc_1.generatorDirection = this.generatorDirection;
         }
         if(this.generatorFrequency != this.defaultGeneratorFrequency)
         {
            _loc_1.generatorFrequency = this.generatorFrequency;
         }
         if(this.generatorBlockID != this.defaultGeneratorBlockID)
         {
            _loc_1.generatorBlockID = this.generatorBlockID;
         }
         if(this.predictableItems != this.defaultPredictableItems)
         {
            _loc_1.predictableItems = this.predictableItems;
         }
         if(this.rotationSpeed != this.defaultRotationSpeed)
         {
            _loc_1.rotationSpeed = this.rotationSpeed;
         }
         if(this.buttonID != this.defaultButtonID)
         {
            _loc_1.buttonID = this.buttonID;
         }
         if(this.reactorID != this.defaultReactorID)
         {
            _loc_1.reactorID = this.reactorID;
         }
         if(this.coins != this.defaultCoins)
         {
            _loc_1.coins = this.coins;
         }
         if(this.collapse != this.defaultCollapse)
         {
            _loc_1.collapse = this.collapse;
         }
         if(this.chkPointReset != this.defaultChkpointReset)
         {
            _loc_1.chkPointReset = this.chkPointReset;
         }
         if(this.teleportUses != this.defaultTeleportUses)
         {
            _loc_1.teleportUses = this.teleportUses;
         }
         if(this.teleportCooldown != this.defaultTeleportCooldown)
         {
            _loc_1.teleportCooldown = this.teleportCooldown;
         }
         if(this.randomDestination != this.defaultRandomDestination)
         {
            _loc_1.randomDestination = this.randomDestination;
         }
         if(this.stats != this.defaultStats)
         {
            _loc_1.stats = this.stats;
         }
         if(this.code != this.defaultCode)
         {
            _loc_1.code = ({} as any);
            for (side of $keys(this.code))
            {
               _loc_1.code[side] = Data.strToBase64(this.code[side]);
            }
         }
         if(this.lua != this.defaultLua)
         {
            _loc_1.lua = ({} as any);
            for (side of $keys(this.lua))
            {
               _loc_1.lua[side] = "v2 | " + Data.compressString(this.lua[side]);
            }
         }
         if(this.phasingNumber != this.defaultPhasingNumber)
         {
            _loc_1.phasingNumber = this.phasingNumber;
         }
         if(this.blockTag.length > 0)
         {
            _loc_1.blockTag = this.blockTag;
         }
         var _loc_2= JSON.stringify(_loc_1);
         _loc_2 = "v2 | " + _loc_2;
         if(_loc_2.length > 200000)
         {
            _loc_3 = "The settings for this block are too large! It will not fit in the database.";
            PlatformRacing3.addPopup(new MessagePopup(_loc_3));
            throw new Error(_loc_3);
         }
         return _loc_2;
      }
  decompressSettings(param1: string): void {
         var obj: any= null;
         var side: string= null;
         var lua: string= null;
         var str= param1;
         if(str != null && str != "")
         {
            try
            {
               if(str.substr(0,5) == "v2 | ")
               {
                  str = str.substr(5);
               }
               else
               {
                  str = Data.decompressString(str);
               }
               obj = JSON.parse(str);
               this.type = obj.type;
               this.health = int(obj.health);
               this.statSupply = int(obj.statSupply);
               this.itemSupply = int(obj.itemSupply);
               this.left.setSaveObj(obj.left);
               this.right.setSaveObj(obj.right);
               this.top.setSaveObj(obj.top);
               this.bottom.setSaveObj(obj.bottom);
               this.bump.setSaveObj(obj.bump);
               if(obj.itemArray != null)
               {
                  this.itemArray = obj.itemArray;
               }
               if(obj.movePattern != null)
               {
                  this.movePattern = obj.movePattern;
               }
               if(obj.moveFreq != null)
               {
                  this.moveFreq = int(obj.moveFreq);
               }
               if(obj.changePattern != null)
               {
                  this.changePattern = obj.changePattern;
               }
               if(obj.changeFreq != null)
               {
                  this.changeFreq = int(obj.changeFreq);
               }
               if(obj.randomChange != null)
               {
                  this.randomChange = obj.randomChange;
               }
               if(obj.itemType != null)
               {
                  this.itemType.setSaveObj(obj.itemType);
               }
               if(obj.timeTillBreak != null)
               {
                  this.timeTillBreak = int(obj.timeTillBreak);
               }
               if(obj.reflectAngle != null)
               {
                  this.reflectAngle = int(obj.reflectAngle);
               }
               if(obj.timeTillVanish != null)
               {
                  this.timeTillVanish = int(obj.timeTillVanish);
               }
               if(obj.bounciness != null)
               {
                  this.bounciness = obj.bounciness;
               }
               if(obj.arrowPower != null)
               {
                  this.arrowPower = obj.arrowPower;
               }
               if(obj.health != null)
               {
                  this.health = int(obj.health);
               }
               if(obj.dispenseCoins != null)
               {
                  this.dispenseCoins = int(obj.dispenseCoins);
               }
               if(obj.swimSpeed != null)
               {
                  this.swimSpeed = obj.swimSpeed;
               }
               if(obj.generatorDirection != null)
               {
                  this.generatorDirection = obj.generatorDirection;
               }
               if(obj.generatorFrequency != null)
               {
                  this.generatorFrequency = int(obj.generatorFrequency);
               }
               if(obj.generatorBlockID != null)
               {
                  this.generatorBlockID = int(obj.generatorBlockID);
               }
               if(obj.predictableItems != null)
               {
                  this.predictableItems = obj.predictableItems;
               }
               if(obj.rotationSpeed != null)
               {
                  this.rotationSpeed = obj.rotationSpeed;
               }
               if(obj.buttonID != null)
               {
                  this.buttonID = int(obj.buttonID);
               }
               if(obj.reactorID != null)
               {
                  this.reactorID = int(obj.reactorID);
               }
               if(obj.coins != null)
               {
                  this.coins = int(obj.coins);
               }
               if(obj.collapse != null)
               {
                  this.collapse = obj.collapse;
               }
               if(obj.chkPointReset != null)
               {
                  this.chkPointReset = obj.chkPointReset;
               }
               if(obj.stats != null)
               {
                  obj.stats.speed = int(obj.stats.speed);
                  obj.stats.accel = int(obj.stats.accel);
                  obj.stats.jump = int(obj.stats.jump);
                  obj.stats.maxStat = int(obj.stats.maxStat);
                  obj.stats.setStatsTo = Boolean(obj.stats.setStatsTo);
                  this.stats = obj.stats;
               }
               if(obj.teleportUses != null)
               {
                  this.teleportUses = int(obj.teleportUses);
               }
               if(obj.teleportCooldown != null)
               {
                  this.teleportCooldown = int(obj.teleportCooldown);
               }
               if(obj.randomDestination != null)
               {
                  this.randomDestination = obj.randomDestination;
               }
               if(obj.code != null)
               {
                  for (side of $keys(obj.code))
                  {
                     this.code[side] = Data.base64ToStr(obj.code[side]);
                  }
               }
               if(obj.lua != null)
               {
                  for (side of $keys(obj.lua))
                  {
                     lua = obj.lua[side];
                     if(lua.substr(0,5) == "v2 | ")
                     {
                        this.lua[side] = Data.decompressString(lua.substr(5));
                     }
                     else
                     {
                        this.lua[side] = Data.base64ToStr(lua);
                     }
                  }
               }
               if(obj.phasingNumber != null)
               {
                  this.phasingNumber = int(obj.phasingNumber);
               }
               if(obj.blockTag != null)
               {
                  this.blockTag = obj.blockTag;
               }
            }
            catch (e)
            {
            }
         }
      }
  canGiveItem(): boolean {
         if(this.left.type == BlockSideSettings.GIVE_ITEM || this.right.type == BlockSideSettings.GIVE_ITEM || this.top.type == BlockSideSettings.GIVE_ITEM || this.bottom.type == BlockSideSettings.GIVE_ITEM || this.bump.type == BlockSideSettings.GIVE_ITEM)
         {
            return true;
         }
         return false;
      }
  isGlass(): boolean {
         if(this.left.type == BlockSideSettings.GLASS || this.right.type == BlockSideSettings.GLASS || this.top.type == BlockSideSettings.GLASS || this.bottom.type == BlockSideSettings.GLASS || this.bump.type == BlockSideSettings.GLASS)
         {
            return true;
         }
         return false;
      }
  isReflector(): boolean {
         if(this.left.type == BlockSideSettings.REFLECT || this.right.type == BlockSideSettings.REFLECT || this.top.type == BlockSideSettings.REFLECT || this.bottom.type == BlockSideSettings.REFLECT || this.bump.type == BlockSideSettings.REFLECT)
         {
            return true;
         }
         return false;
      }
  isVanish(): boolean {
         if(this.left.type == BlockSideSettings.VANISH || this.right.type == BlockSideSettings.VANISH || this.top.type == BlockSideSettings.VANISH || this.bottom.type == BlockSideSettings.VANISH || this.bump.type == BlockSideSettings.VANISH)
         {
            return true;
         }
         return false;
      }
  isBounce(): boolean {
         if(this.left.type == BlockSideSettings.BOUNCE || this.right.type == BlockSideSettings.BOUNCE || this.top.type == BlockSideSettings.BOUNCE || this.bottom.type == BlockSideSettings.BOUNCE || this.bump.type == BlockSideSettings.BOUNCE)
         {
            return true;
         }
         return false;
      }
  isTeleport(): boolean {
         if(this.left.type == BlockSideSettings.TELEPORT || this.right.type == BlockSideSettings.TELEPORT || this.top.type == BlockSideSettings.TELEPORT || this.bottom.type == BlockSideSettings.TELEPORT || this.bump.type == BlockSideSettings.TELEPORT)
         {
            return true;
         }
         return false;
      }
  isCrumble(): boolean {
         if(this.left.type == BlockSideSettings.CRUMBLE || this.right.type == BlockSideSettings.CRUMBLE || this.top.type == BlockSideSettings.CRUMBLE || this.bottom.type == BlockSideSettings.CRUMBLE || this.bump.type == BlockSideSettings.CRUMBLE)
         {
            return true;
         }
         return false;
      }
  isArrow(): boolean {
         if(this.left.type == BlockSideSettings.PUSH_UP || this.right.type == BlockSideSettings.PUSH_UP || this.top.type == BlockSideSettings.PUSH_UP || this.bottom.type == BlockSideSettings.PUSH_UP || this.bump.type == BlockSideSettings.PUSH_UP || this.left.type == BlockSideSettings.PUSH_DOWN || this.right.type == BlockSideSettings.PUSH_DOWN || this.top.type == BlockSideSettings.PUSH_DOWN || this.bottom.type == BlockSideSettings.PUSH_DOWN || this.bump.type == BlockSideSettings.PUSH_DOWN || this.left.type == BlockSideSettings.PUSH_LEFT || this.right.type == BlockSideSettings.PUSH_LEFT || this.top.type == BlockSideSettings.PUSH_LEFT || this.bottom.type == BlockSideSettings.PUSH_LEFT || this.bump.type == BlockSideSettings.PUSH_LEFT || this.left.type == BlockSideSettings.PUSH_RIGHT || this.right.type == BlockSideSettings.PUSH_RIGHT || this.top.type == BlockSideSettings.PUSH_RIGHT || this.bottom.type == BlockSideSettings.PUSH_RIGHT || this.bump.type == BlockSideSettings.PUSH_RIGHT)
         {
            return true;
         }
         return false;
      }
  isDispense(): boolean {
         if(this.left.type == BlockSideSettings.DISPENSE || this.right.type == BlockSideSettings.DISPENSE || this.top.type == BlockSideSettings.DISPENSE || this.bottom.type == BlockSideSettings.DISPENSE || this.bump.type == BlockSideSettings.DISPENSE)
         {
            return true;
         }
         return false;
      }
  isWater(): boolean {
         return this.type == BlockSettings.WATER;
      }
  isGenerator(): boolean {
         return this.type == BlockSettings.GENERATOR;
      }
  isRotate(): boolean {
         if(this.left.type == BlockSideSettings.ROTATE_LEFT || this.left.type == BlockSideSettings.ROTATE_RIGHT || this.right.type == BlockSideSettings.ROTATE_LEFT || this.right.type == BlockSideSettings.ROTATE_RIGHT || this.top.type == BlockSideSettings.ROTATE_LEFT || this.top.type == BlockSideSettings.ROTATE_RIGHT || this.bottom.type == BlockSideSettings.ROTATE_LEFT || this.bottom.type == BlockSideSettings.ROTATE_RIGHT || this.bump.type == BlockSideSettings.ROTATE_LEFT || this.bump.type == BlockSideSettings.ROTATE_RIGHT)
         {
            return true;
         }
         return false;
      }
  isButton(): boolean {
         if(this.left.type == BlockSideSettings.BUTTON || this.right.type == BlockSideSettings.BUTTON || this.top.type == BlockSideSettings.BUTTON || this.bottom.type == BlockSideSettings.BUTTON || this.bump.type == BlockSideSettings.BUTTON)
         {
            return true;
         }
         return false;
      }
  isChkpoint(): boolean {
         if(this.left.type == BlockSideSettings.CHECKPOINT || this.right.type == BlockSideSettings.CHECKPOINT || this.top.type == BlockSideSettings.CHECKPOINT || this.bottom.type == BlockSideSettings.CHECKPOINT || this.bump.type == BlockSideSettings.CHECKPOINT)
         {
            return true;
         }
         return false;
      }
  isStat(): boolean {
         if(this.left.type == BlockSideSettings.C_STATS || this.right.type == BlockSideSettings.C_STATS || this.top.type == BlockSideSettings.C_STATS || this.bottom.type == BlockSideSettings.C_STATS || this.bump.type == BlockSideSettings.C_STATS)
         {
            return true;
         }
         return false;
      }
  isCustomItem(): boolean {
         if(this.left.type == BlockSideSettings.C_ITEM || this.right.type == BlockSideSettings.C_ITEM || this.top.type == BlockSideSettings.C_ITEM || this.bottom.type == BlockSideSettings.C_ITEM || this.bump.type == BlockSideSettings.C_ITEM)
         {
            return true;
         }
         return false;
      }
  constructor() {
         
         this.type = BlockSettings.ACTIVE;
         this.left = new BlockSideSettings();
         this.right = new BlockSideSettings();
         this.top = new BlockSideSettings();
         this.bottom = new BlockSideSettings();
         this.bump = new BlockSideSettings();
         this.itemArray = Items.defaultItems;
         this.movePattern = this.defaultMovePattern;
         this.moveFreq = int(this.defaultMoveFreq);
         this.defaultChangePattern = new Array(101,120,114,124);
         this.changePattern = this.defaultChangePattern;
         this.changeFreq = int(this.defaultChangeFreq);
         this.randomChange = this.defaultRandomChange;
         this.timeTillBreak = int(this.defaultTimeTillBreak);
         this.reflectAngle = int(this.defaultReflectAngle);
         this.timeTillVanish = int(this.defaultTimeTillVanish);
         this.bounciness = this.defaultBounciness;
         this.arrowPower = this.defaultArrowPower;
         this.health = int(this.defaultHealth);
         this.dispenseCoins = int(this.defaultDispenseCoins);
         this.rotationSpeed = this.defaultRotationSpeed;
         this.buttonID = int(this.defaultButtonID);
         this.reactorID = int(this.defaultReactorID);
         this.coins = int(this.defaultCoins);
         this.collapse = this.defaultCollapse;
         this.swimSpeed = this.defaultSwimSpeed;
         this.generatorDirection = this.defaultGeneratorDirection;
         this.generatorFrequency = int(this.defaultGeneratorFrequency);
         this.generatorBlockID = int(this.defaultGeneratorBlockID);
         this.itemType = new BlockCustomItemSettings();
         this.chkPointReset = this.defaultChkpointReset;
         this.teleportUses = int(this.defaultTeleportUses);
         this.teleportCooldown = int(this.defaultTeleportCooldown);
         this.randomDestination = this.defaultRandomDestination;
         this.predictableItems = this.defaultPredictableItems;
         this.phasingNumber = int(this.defaultPhasingNumber);
         this.blockTag = this.defaultBlockTag;
         this.stats.speed = 1;
         this.stats.accel = 1;
         this.stats.jump = 1;
         this.stats.maxStat = 100;
         this.stats.setStatsTo = false;
      }
}
$reg('com.jiggmin.pr3.block.BlockSettings', BlockSettings);
