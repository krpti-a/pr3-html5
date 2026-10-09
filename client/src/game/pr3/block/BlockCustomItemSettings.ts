// Ported from com/jiggmin/pr3/block/BlockCustomItemSettings.as
import { $keys } from '../../../flash/as3.ts';
import { Items } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockCustomItemSettings {
  declare type: string;
  declare itemSettingsString: string;
  declare settings: any;
  static legacyConvert(legacyStr: string): string {
         var conversionMap: any= {
            "laserGun":"l",
            "bow":"bo",
            "speedBurst":"sp",
            "superJump":"su",
            "jetPack":"j",
            "lightning":"li",
            "teleport":"t",
            "angelWings":"a",
            "blackHole":"b",
            "sword":"sw",
            "shield":"s",
            "rocketLauncher":"r",
            "portableBlock":"p",
            "portableMine":"po",
            "retreater":"re"
         };
         if(legacyStr in conversionMap)
         {
            return conversionMap[legacyStr];
         }
         return legacyStr;
      }
  constructSettings(): any {
         var item: string= null;
         var obj: any= {};
         var allItems: any= Items.allItemProperties;
         for (item of $keys(allItems))
         {
            obj[item] = Items.getItemDefaultValues(item);
         }
         return obj;
      }
  getSaveObj(): any {
         var property: string= null;
         this.type = BlockCustomItemSettings.legacyConvert(this.type);
         var obj: any= {"type":this.type};
         for (property of $keys(this.settings[this.type]))
         {
            obj[property] = this.settings[this.type][property];
         }
         return obj;
      }
  setSaveObj(param1: any): void {
         var property: any= null;
         var propertyStringArray: any[]= null;
         this.type = BlockCustomItemSettings.legacyConvert(param1.type);
         var propertySettings: any= Items.getItemProperties(this.type);
         if(param1.itemSettingsString == null)
         {
            for (property of $keys(propertySettings))
            {
               this.settings[this.type][property] = param1[property];
            }
         }
         else
         {
            propertyStringArray = param1.itemSettingsString.split("|");
            for (property of $keys(propertySettings))
            {
               if(propertyStringArray.indexOf(property) == -1)
               {
                  this.settings[this.type][property] = propertySettings[property].value;
               }
               else
               {
                  this.settings[this.type][property] = propertyStringArray[propertyStringArray.indexOf(property) + 1];
               }
            }
         }
      }
  constructor() {
         
         this.type = Items.LASER_GUN;
         this.settings = this.constructSettings();
      }
}
$reg('com.jiggmin.pr3.block.BlockCustomItemSettings', BlockCustomItemSettings);
