// Ported from com/jiggmin/pr3/items/Item.as
import { Bitmap, Event, Point, clearTimeout, setTimeout } from '../../../flash/index.ts';
import { int, uint, $keys, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { ActivePlayer, Data, EffectMapLayer, GamePage, Items, LocalPlayer, StampManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Item extends Removable {
  space: boolean = false;
  reloadTimeout: number = 0;
  reloadTime: number = 10;
  usesEncrypted: number = 0;
  declare player: ActivePlayer;
  reloading: boolean = false;
  localOnly: boolean = false;
  damage: number = 1;
  settings: any = {};
  itemKeyframeName: string = "";
  customTexture: boolean = false;
  setSpace(param1: boolean): void {
         this.space = param1;
         if(this.space == true)
         {
            this.tryToUseItem();
            this.startWait();
         }
         else
         {
            this.stopWait();
         }
      }
  getItemPoint(param1: number = 0, param2: number = 0): Point {
         var _loc_3= new Point(param1,param2);
         _loc_3 = this.player.curItemHolder.localToGlobal(_loc_3);
         return EffectMapLayer.instance.globalToLocal(_loc_3);
      }
  getUses(): number {
         return Math.round((this.usesEncrypted + 3) / 5.68);
      }
  tryToUseItem(): void {
         var uses: number = int(this.getUses());
         if(!this.localOnly || this.player instanceof LocalPlayer)
         {
            if(this.space && uses > 0 && !this.reloading)
            {
               if(this.localOnly)
               {
                  GamePage.instance.localUseItem();
               }
               this.useItem();
            }
         }
      }
  setUses(uses: number): void {
    uses = int(uses);
         this.settings.ammo = uses;
         this.usesEncrypted = uses * 5.68 - 3;
         if(this.player != null && this.player instanceof LocalPlayer)
         {
            GamePage.instance.itemDisplay.ammoDisplay.gotoAndStop(uses + 1);
         }
      }
  remoteUseItem(): void {
         this.useItem();
      }
  enterFrameHandler$Item(event: Event): void {
         this.tryToUseItem();
      }
  finishReloading(): void {
         this.reloading = false;
      }
  stopWait(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$Item'));
      }
  remove(): void {
         clearTimeout(this.reloadTimeout);
         this.stopWait();
         super.remove();
      }
  setPlayer(param1: ActivePlayer): void {
         this.player = param1;
      }
  startWait(): void {
         this.stopWait();
         if(!this.removed)
         {
            this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$Item'),false,0,true);
         }
      }
  useItem(): void {
         var newUses: number = int(this.getUses() - 1);
         this.setUses(newUses);
         if(newUses <= 0)
         {
            this.player.setVariable("item",Items.NONE);
         }
         else
         {
            clearTimeout(this.reloadTimeout);
            if(Number(this.settings.reload) >= 0)
            {
               this.reloading = true;
               this.reloadTimeout = uint(setTimeout($b(this, 'finishReloading'),this.settings.reload));
            }
         }
      }
  init(itemSettings: any): void {
         var property: any= null;
         var propertyVars: any= null;
         var defaultValue: any= null;
         var customValueIndex: number = int(0);
         var customValue: any= null;
         var propertySettings: any= Items.getItemProperties(itemSettings[0]);
         this.settings.type = itemSettings[0];
         this.settings.typename = Items.lookup[this.settings.type].toLowerCase().replace(" ","").replace("\'s","");
         if(this.player != null)
         {
            for (property of $keys(propertySettings))
            {
               propertyVars = propertySettings[property];
               defaultValue = propertyVars.value;
               if(propertyVars.setFunction != null)
               {
                  propertyVars.setFunction.call(this,defaultValue);
               }
               else
               {
                  this.settings[property] = defaultValue;
               }
               customValueIndex = int(itemSettings.indexOf(property) + 1);
               if(customValueIndex)
               {
                  customValue = itemSettings[customValueIndex];
                  if(propertyVars.type == "int" || propertyVars.type == "Number")
                  {
                     if(isNaN(Number(customValue)))
                     {
                        continue;
                     }
                     customValue = propertyVars.type == "int" ? int(customValue) : Number(customValue);
                     if(propertyVars.range != undefined)
                     {
                        customValue = Math.min(Math.max(Number(customValue),propertyVars.range.min),propertyVars.range.max);
                     }
                  }
                  else if(propertyVars.type == "Boolean")
                  {
                     customValue = customValue == "true" || customValue == true || customValue == "1" || customValue == 1 ? true : false;
                  }
                  if(propertyVars.setFunction != null)
                  {
                     propertyVars.setFunction.call(this,customValue);
                  }
                  else if(customValue != null)
                  {
                     this.settings[property] = customValue;
                  }
               }
            }
            if(this.settings.ammo != null)
            {
               this.setUses(this.settings.ammo);
            }
            this.updateDisplay();
         }
      }
  updateDisplay(): void {
         var stamp= undefined;
         this.player.itemGraphic[this.itemKeyframeName].gotoAndStop(0);
         this.customTexture = false;
         if(int(this.settings.stampid) != 0)
         {
            this.customTexture = true;
            stamp = StampManager.requestStamp(this.settings.stampid);
            if(this.settings.croptexture)
            {
               stamp = new Bitmap(Data.cropBitmapData(stamp.bitmapData));
            }
            Data.transformDisplayObject(stamp,this.settings.stamprot,this.settings.xscale,this.settings.yscale);
            this.player.itemGraphic[this.itemKeyframeName].getChildAt(0).removeChildren();
            this.player.itemGraphic[this.itemKeyframeName].getChildAt(0).addChild(stamp);
         }
         else
         {
            this.player.reCreateItemGraphic();
            Data.transformDisplayObject(this.player.itemGraphic[this.itemKeyframeName],this.settings.stamprot,this.settings.xscale,this.settings.yscale);
         }
         if(!isNaN(this.settings.xOffset))
         {
            this.player.itemGraphic[this.itemKeyframeName].x = this.settings.xOffset;
         }
         if(!isNaN(this.settings.yOffset))
         {
            this.player.itemGraphic[this.itemKeyframeName].y = this.settings.yOffset;
         }
      }
  constructor() {
         super();
         this.setUses(1);
         this.settings.reload = this.reloadTime;
      }
}
$reg('com.jiggmin.pr3.items.Item', Item);
