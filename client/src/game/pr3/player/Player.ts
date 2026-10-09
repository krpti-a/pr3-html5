// Ported from com/jiggmin/pr3/player/Player.as
import { ColorTransform, DisplayObject, GlowFilter, MovieClip, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { StateObject } from '../../stateObject/StateObject.ts';
import { CloudGraphic, Data, HatGraphic, IceBlockGraphic, IceParticleGraphic, Item, ItemGraphic, Items, NameBoxGraphic, NapalmGraphic, ParticleEffect, ShieldGraphic, TypingGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Player extends StateObject {
  _shield: boolean = false;
  _napalm: boolean = false;
  _clouded: boolean = false;
  _iced: boolean = false;
  declare itemClass: Item;
  body: number = 1;
  feet: number = 1;
  itemName: string = "None";
  declare shieldGraphic: any;
  declare napalmGraphic: any;
  declare iceBlockGraphic: any;
  declare cloudGraphic: any;
  declare typingGraphic: any;
  _scale: number = NaN;
  declare nameBox: any;
  feetColor: number = 16777215;
  head: number = 1;
  bodyColor: number = 16777215;
  headColor: number = 16777215;
  feetColorOriginal: number = -1;
  bodyColorOriginal: number = -1;
  headColorOriginal: number = -1;
  dyeColor: number = -1;
  itemAbbr: string = "n";
  declare itemGraphic: any;
  lastHatX: number = 0;
  lastHatY: number = 0;
  hatArray: any[] = new Array();
  hatColorArray: any[] = new Array();
  hatGraphicArray: any[] = new Array();
  declare curItemHolder: MovieClip;
  myBlur: GlowFilter = new GlowFilter();
  followPlayer: boolean = false;
  outlineColor: number = -1;
  outlineThickness: number = 10;
  declare spicedVars: any;
  remove(): void {
         this.removeNameBox();
         this.shieldGraphic = null;
         this.napalmGraphic = null;
         this.cloudGraphic = null;
         this.typingGraphic = null;
         this.iceBlockGraphic = null;
         this.curItemHolder = null;
         super.remove();
      }
  set scale(param1: number) {
         this._scale = param1;
         var _loc_2= param1;
         this.scaleY = param1;
         this.scaleX = _loc_2;
      }
  setItem(whichItem: string, itemSettings: any = ""): void {
         this.itemAbbr = whichItem;
         this.itemName = Items.getItemTitle(whichItem);
         this.showAppearance();
      }
  setName(param1: string): void {
         this.createNameBox();
         var _loc_2= param1;
         this.nameBox.box2.text = param1;
         this.nameBox.box1.text = _loc_2;
      }
  removeNameBox(): void {
         if(this.nameBox != null)
         {
            if(this.nameBox.parent != null)
            {
               this.nameBox.parent.removeChild(this.nameBox);
            }
            this.nameBox.text = "";
            this.nameBox = null;
         }
      }
  createNameBox(): void {
         this.removeNameBox();
         this.nameBox = new NameBoxGraphic();
         this.nameBox.alpha = 0.5;
         var _loc_1= 1 / this.scaleX;
         this.nameBox.scaleY = 1 / this.scaleX;
         this.nameBox.scaleX = _loc_1;
         this.addChild(this.nameBox);
      }
  set facing(param1: string) {
         if(param1 == "right")
         {
            this.m.scaleX = 1;
         }
         else
         {
            this.m.scaleX = -1;
         }
      }
  setHats(hats: any[]): void {
         var hat: any= null;
         var i= 1;
         while(i < this.hatGraphicArray.length)
         {
            if(this.m.head.contains(this.hatGraphicArray[i]))
            {
               this.m.head.removeChild(this.hatGraphicArray[i]);
            }
            i++;
         }
         this.hatArray = new Array();
         this.hatColorArray = new Array();
         this.hatGraphicArray = new Array();
         var counter= 1;
         for (hat of $each(hats))
         {
            this.hatArray[counter] = int(hat.num) >= 1 && int(hat.num) <= 19 ? int(hat.num) : 1;
            var _loc5_: number = NaN;
            this.hatColorArray[_loc5_ = counter++] = hat.color;
         }
         this.showAppearance();
      }
  showAppearance(): void {
         var hat: HatGraphic= null;
         if(this.outlineColor >= 0)
         {
            this.myBlur.blurX = 3;
            this.myBlur.blurY = 3;
            this.myBlur.strength = this.outlineThickness;
            this.myBlur.quality = 5;
            this.myBlur.color = this.outlineColor;
            this.m.filters = [this.myBlur];
         }
         else if(this.m.filters.length > 0)
         {
            this.m.filters = [];
         }
         var fakeHatId: number = int(-1);
         var currentDate: string= Data.timestampToDate(new Date().getTime());
         if(currentDate == "Apr 1" && false)
         {
            fakeHatId = int(4);
         }
         else if(currentDate == "Apr 17")
         {
            fakeHatId = int(13);
         }
         var i: number = int(1);
         while(i < this.hatArray.length)
         {
            if(this.hatGraphicArray[i])
            {
               if(this.m.head.contains(this.hatGraphicArray[i]))
               {
                  this.m.head.removeChild(this.hatGraphicArray[i]);
               }
            }
            hat = new HatGraphic();
            if(i <= 4)
            {
               if(i == 1)
               {
                  this.lastHatX = int(hat.x = this.m.head.hat1.x);
                  this.lastHatY = int(hat.y = this.m.head.hat1.y);
               }
               else if(i == 2)
               {
                  this.lastHatX = int(hat.x = this.lastHatX - 5);
                  this.lastHatY = int(hat.y = this.lastHatY - 15);
               }
               else
               {
                  this.lastHatX = int(hat.x = this.lastHatX - i);
                  this.lastHatY = int(hat.y = this.lastHatY - 15);
               }
            }
            else
            {
               hat.x = this.lastHatX;
               this.lastHatY = int(hat.y = this.lastHatY - 15);
            }
            var displayHatId: number = int(fakeHatId == -1 ? int(this.hatArray[i]) : fakeHatId);
            if(displayHatId < 1 || displayHatId > 19)
            {
               displayHatId = int(1);
            }
            hat.gotoAndStop(displayHatId);
            hat.colorMC.gotoAndStop(displayHatId);
            if(displayHatId == 14)
            {
               hat.y += 10;
            }
            this.m.head.addChild(hat);
            this.setGraphicColor(hat.colorMC,this.hatColorArray[i]);
            this.hatGraphicArray[i] = hat;
            i++;
         }
         var safeHead: number = int(this.head >= 1 && this.head <= 26 ? this.head : 1);
         var safeBody: number = int(this.body >= 1 && this.body <= 26 ? this.body : 1);
         var safeFeet: number = int(this.feet >= 1 && this.feet <= 26 ? this.feet : 1);
         this.head = int(safeHead);
         this.body = int(safeBody);
         this.feet = int(safeFeet);
         this.m.head.gotoAndStop(safeHead);
         this.m.body.gotoAndStop(safeBody);
         this.m.lFoot.gotoAndStop(safeFeet);
         this.m.rFoot.gotoAndStop(safeFeet);
         this.m.head.colorMC.gotoAndStop(safeHead);
         this.m.body.colorMC.gotoAndStop(safeBody);
         this.m.lFoot.colorMC.gotoAndStop(safeFeet);
         this.m.rFoot.colorMC.gotoAndStop(safeFeet);
         if(this.dyeColor >= 0)
         {
            this.setGraphicColor(this.m.head.colorMC,this.dyeColor);
            this.setGraphicColor(this.m.body.colorMC,this.dyeColor);
            this.setGraphicColor(this.m.lFoot.colorMC,this.dyeColor);
            this.setGraphicColor(this.m.rFoot.colorMC,this.dyeColor);
         }
         else
         {
            this.setGraphicColor(this.m.head.colorMC,this.headColor);
            this.setGraphicColor(this.m.body.colorMC,this.bodyColor);
            this.setGraphicColor(this.m.lFoot.colorMC,this.feetColor);
            this.setGraphicColor(this.m.rFoot.colorMC,this.feetColor);
         }
         this.itemGraphic.gotoAndStop(this.itemName);
         this.curItemHolder = this.m.item;
      }
  reCreateItemGraphic(): void {
         this.curItemHolder.removeChild(this.itemGraphic);
         this.itemGraphic = null;
         this.itemGraphic = new ItemGraphic();
         this.curItemHolder.addChild(this.itemGraphic);
         this.showAppearance();
      }
  get scale(): number {
         return this._scale;
      }
  loseHat(): any {
         var _loc_1= 0;
         var _loc_2= 0;
         var _loc_3= 4;
         while(_loc_3 >= 1)
         {
            if(this.hatArray[_loc_3] != null && this.hatArray[_loc_3] != 1)
            {
               _loc_1 = this.hatArray[_loc_3];
               _loc_2 = this.hatColorArray[_loc_3];
               this.hatArray[_loc_3] = 1;
               break;
            }
            _loc_3--;
         }
         var _loc_4= ({} as any);
         _loc_4.hatNum = _loc_1;
         _loc_4.hatColor = _loc_2;
         this.showAppearance();
         return _loc_4;
      }
  setState(param1: string): void {
         var _loc_2= 1;
         if(this.m != null)
         {
            _loc_2 = this.m.scaleX;
         }
         if(param1 != this.state)
         {
            super.setState(param1);
            this.showAppearance();
            this.curItemHolder.addChild(this.itemGraphic);
            this.m.scaleX = _loc_2;
         }
         if($b(this, 'shieldGraphic') != null)
         {
            this.addChild($b(this, 'shieldGraphic'));
         }
         if(this.napalmGraphic != null)
         {
            this.addChild(this.napalmGraphic);
         }
         if(this.iceBlockGraphic != null)
         {
            this.addChild(this.iceBlockGraphic);
         }
         if(this.cloudGraphic != null)
         {
            this.addChild(this.cloudGraphic);
         }
         if(this.typingGraphic != null)
         {
            this.addChild(this.typingGraphic);
         }
      }
  set shield(param1: boolean) {
         var _loc_2= undefined;
         if(param1)
         {
            if($b(this, 'shieldGraphic') == null)
            {
               this.shieldGraphic = new ShieldGraphic();
               _loc_2 = 1 / this.scale;
               $b(this, 'shieldGraphic').scaleY = 1 / this.scale;
               $b(this, 'shieldGraphic').scaleX = _loc_2;
               this.addChild($b(this, 'shieldGraphic'));
            }
         }
         else if($b(this, 'shieldGraphic') != null)
         {
            this.removeChild($b(this, 'shieldGraphic'));
            this.shieldGraphic = null;
         }
         this._shield = param1;
      }
  set napalm(param1: boolean) {
         var _loc_2= undefined;
         if(param1)
         {
            if(this.napalmGraphic == null)
            {
               this.napalmGraphic = new NapalmGraphic();
               _loc_2 = 1 / this.scale;
               this.napalmGraphic.scaleY = 1 / this.scale;
               this.napalmGraphic.scaleX = _loc_2;
               this.addChild(this.napalmGraphic);
            }
         }
         else if(this.napalmGraphic != null)
         {
            this.removeChild(this.napalmGraphic);
            this.napalmGraphic = null;
         }
         this._napalm = param1;
      }
  set iced(param1: boolean) {
         var _loc_2= undefined;
         var i: number = int(0);
         var _loc_7= undefined;
         var _loc_9= undefined;
         if(param1)
         {
            if(this.iceBlockGraphic == null)
            {
               this.iceBlockGraphic = new IceBlockGraphic();
               _loc_2 = 1 / this.scale;
               this.iceBlockGraphic.scaleY = 1 / this.scale;
               this.iceBlockGraphic.scaleX = _loc_2;
               this.addChild(this.iceBlockGraphic);
               setTimeout($b(this, 'endIce'),5000);
            }
         }
         else if(this.iceBlockGraphic != null)
         {
            i = int(0);
            while(i < 32)
            {
               _loc_7 = new IceParticleGraphic();
               _loc_9 = new ParticleEffect(_loc_7,0.75,0.95,0.05,5,5,20,0,-5);
               _loc_9.x = this.x + (Math.random() - 0.5) * 90;
               _loc_9.y = this.y + (Math.random() - 0.5) * 115;
               i++;
            }
            this.removeChild(this.iceBlockGraphic);
            this.iceBlockGraphic = null;
         }
         this._iced = param1;
      }
  set clouded(param1: boolean) {
         if(param1)
         {
            if(this.cloudGraphic == null)
            {
               this.cloudGraphic = new CloudGraphic();
               this.cloudGraphic.scaleY = 0.8 / this.scale;
               this.cloudGraphic.scaleX = 0.8 / this.scale;
               this.addChild(this.cloudGraphic);
            }
         }
         else if(this.cloudGraphic != null)
         {
            this.removeChild(this.cloudGraphic);
            this.cloudGraphic = null;
         }
         this._clouded = param1;
      }
  set typingEffect(param1: boolean) {
         if(param1)
         {
            if(this.typingGraphic == null)
            {
               this.typingGraphic = new TypingGraphic();
               this.addChild(this.typingGraphic);
            }
         }
         else if(this.typingGraphic != null)
         {
            this.removeChild(this.typingGraphic);
            this.typingGraphic = null;
         }
      }
  get facing(): string {
         if(this.m.scaleX > 0)
         {
            return "right";
         }
         return "left";
      }
  setGraphicColor(param1: DisplayObject, param2: number): void {
    param2 = uint(param2);
         var _loc_3= new ColorTransform();
         _loc_3.color = param2;
         param1.transform.colorTransform = _loc_3;
      }
  get shield(): boolean {
         return this._shield;
      }
  get napalm(): boolean {
         return this._napalm;
      }
  get iced(): boolean {
         return this._iced;
      }
  get clouded(): boolean {
         return this._clouded;
      }
  endIce(): void {
         this.iced = false;
      }
  setAppearance(param1: number, param2: number, param3: number, param4: number, param5: number, param6: number, param7: number, param8: number): void {
    param1 = int(param1); param2 = int(param2); param3 = int(param3); param4 = int(param4); param5 = int(param5); param6 = int(param6); param7 = int(param7); param8 = int(param8);
         var Hat: HatGraphic= null;
         param1 = int(param1 >= 1 && param1 <= 19 ? param1 : 1);
         param2 = int(param2 >= 1 && param2 <= 26 ? param2 : 1);
         param3 = int(param3 >= 1 && param3 <= 26 ? param3 : 1);
         param4 = int(param4 >= 1 && param4 <= 26 ? param4 : 1);
         this.hatColorArray[1] = param5;
         this.hatArray[1] = param1;
         if(param1 > 1)
         {
            this.hatArray[1] = param1;
            if(this.hatGraphicArray[1] == null)
            {
               Hat = new HatGraphic();
               Hat.x = this.m.head.hat1.x;
               Hat.y = this.m.head.hat1.y;
               this.m.head.addChild(Hat);
               this.hatGraphicArray[1] = Hat;
            }
         }
         this.head = int(param2);
         this.body = int(param3);
         this.feet = int(param4);
         this.headColor = int(param6);
         this.bodyColor = int(param7);
         this.feetColor = int(param8);
         this.showAppearance();
      }
  initSpicedVars(): void {
         this.spicedVars = {
            "spiced":false,
            "charges":0,
            "superSpiced":false,
            "canBeInvincible":false,
            "pushedPlayers":[]
         };
      }
  constructor() {
         super();
         this.itemGraphic = new ItemGraphic();
         this.prependString = "Player";
         this.setState("stand");
         this.showAppearance();
         this.scale = 0.4;
      }
}
$reg('com.jiggmin.pr3.player.Player', Player);
