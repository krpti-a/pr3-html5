// Ported from com/jiggmin/pr3/editor/levelEditor/LevelOptionsMenu.as
import { ColorTransform, DisplayObject, Event, MouseEvent, clearInterval, setInterval } from '../../../../flash/index.ts';
import { int, uint, $keys, $b } from '../../../../flash/as3.ts';
import { EditorPopup } from '../EditorPopup.ts';
import { Data, DropdownEvent, EZColorPicker, EasyInput, HatGraphic, LevelOptionsMenuGraphic, LevelPage, MapPage, Maths, MusicDropdown, PartSelectorGraphic, dmOptionsGraphic } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class LevelOptionsMenu extends EditorPopup {
  declare hatInfo: any;
  declare level: LevelPage;
  declare chanceArray: any[];
  declare musicDropdown: MusicDropdown;
  saveInterval: number = 0;
  declare m: any;
  declare hatSelector: any;
  declare hatGraphic: HatGraphic;
  declare colorPicker: EZColorPicker;
  declare dmOptions: dmOptionsGraphic;
  declare hpOptions: dmOptionsGraphic;
  addChance(param1: EasyInput, param2: string): void {
         param1.restrict = "0-9";
         param1.maxChars = 3;
         param1.text = this.level[param2 + "Chance"].toString();
         this.chanceArray[param2] = param1;
      }
  remove(): void {
         clearInterval(this.saveInterval);
         this.save();
         this.musicDropdown.remove();
         this.removeDMOptions();
         this.removeHatSelector();
         this.m.levelTypeDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectTypeHandler'));
         this.level = null;
         this.musicDropdown = null;
         this.chanceArray = null;
         this.m = null;
         super.remove();
      }
  selectTypeHandler(event: DropdownEvent): void {
         var levelType= event.option.data;
         if(levelType == LevelPage.KING_OF_HAT)
         {
            this.createHatSelector();
         }
         else
         {
            this.removeHatSelector();
         }
         if(levelType == LevelPage.DEATHMATCH || levelType == LevelPage.DAMAGE_DASH)
         {
            this.addDMOptions();
         }
         else
         {
            this.removeDMOptions();
         }
      }
  createHatSelector(): void {
         var hatInfoArray= undefined;
         if(this.hatSelector == null)
         {
            this.hatInfo = ({} as any);
            if(this.level.hatInfo != "")
            {
               hatInfoArray = this.level.hatInfo.split(":");
               this.hatInfo.hat = hatInfoArray[0];
               this.hatInfo.color = hatInfoArray[1];
            }
            else
            {
               this.hatInfo.hat = 2;
               this.hatInfo.color = 0;
            }
            this.hatSelector = new PartSelectorGraphic();
            this.m.addChild(this.hatSelector);
            this.hatSelector.x = 350;
            this.hatSelector.y = 190;
            this.hatSelector.width = 176.1;
            this.hatSelector.height = 38.35;
            this.hatGraphic = new HatGraphic();
            this.hatGraphic.x = 110;
            this.hatGraphic.y = 18;
            this.hatGraphic.scaleX /= 1.5;
            this.hatGraphic.scaleY /= 1.5;
            this.hatSelector.addChild(this.hatGraphic);
            this.colorPicker = new EZColorPicker();
            this.colorPicker.setColor(this.hatInfo.color);
            this.colorPicker.width = 24;
            this.colorPicker.height = 24;
            this.colorPicker.openSide = "left";
            this.colorPicker.x = -15;
            this.colorPicker.y = 3;
            this.hatSelector.addChild(this.colorPicker);
            this.colorPicker.addEventListener(Event.CHANGE,$b(this, 'changeColorHandler'),false,0,true);
            this.hatSelector.leftButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'),false,0,true);
            this.hatSelector.rightButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickRight'),false,0,true);
            this.changeHat();
         }
      }
  removeHatSelector(): void {
         if(this.hatSelector != null && Boolean(this.m.contains(this.hatSelector)))
         {
            this.m.removeChild(this.hatSelector);
            this.colorPicker.removeEventListener(Event.CHANGE,$b(this, 'changeColorHandler'));
            this.hatSelector.leftButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickLeft'));
            this.hatSelector.rightButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickRight'));
            this.hatSelector = null;
            this.hatGraphic = null;
            this.colorPicker = null;
         }
      }
  addDMOptions(): void {
         if(this.dmOptions == null)
         {
            this.dmOptions = new dmOptionsGraphic();
            this.dmOptions.x = 400;
            this.dmOptions.y = 200;
            this.m.addChild(this.dmOptions);
            this.dmOptions.healthBox.text = this.level.startHealth.toString();
            this.dmOptions.healthBox.maxChars = 8;
            this.dmOptions.healthBox.restrict = "0-9";
         }
      }
  removeDMOptions(): void {
         if(this.dmOptions != null && Boolean(this.m.contains(this.dmOptions)))
         {
            this.m.removeChild(this.dmOptions);
            this.dmOptions = null;
         }
      }
  addHealthOptions(): void {
         if(this.hpOptions == null)
         {
            this.hpOptions = new dmOptionsGraphic();
            this.hpOptions.x = 400;
            this.hpOptions.y = 200;
            this.m.addChild(this.hpOptions);
            this.hpOptions.healthBox.text = this.level.extraHealth.toString();
            this.hpOptions.healthBox.maxChars = 8;
            this.hpOptions.healthBox.restrict = "0-9";
         }
      }
  removeHealthOptions(): void {
         if(this.hpOptions != null && Boolean(this.m.contains(this.hpOptions)))
         {
            this.m.removeChild(this.hpOptions);
            this.hpOptions = null;
         }
      }
  changeHat(): void {
         this.hatGraphic.gotoAndStop(this.hatInfo.hat);
         this.hatGraphic.colorMC.gotoAndStop(this.hatInfo.hat);
         this.setGraphicColor(this.hatGraphic.colorMC,this.hatInfo.color);
         this.level.hatInfo = this.hatInfo.hat + ":" + this.hatInfo.color;
      }
  clickLeft(e: MouseEvent): void {
         if(this.hatInfo.hat > 2)
         {
            --this.hatInfo.hat;
            if(this.hatInfo.hat == 40 || this.hatInfo.hat == 41)
            {
               this.hatInfo.hat = 39;
            }
         }
         else
         {
            this.hatInfo.hat = 43;
         }
         this.changeHat();
      }
  clickRight(e: MouseEvent): void {
         if(this.hatInfo.hat < 43)
         {
            this.hatInfo.hat += 1;
            if(this.hatInfo.hat == 40 || this.hatInfo.hat == 41)
            {
               this.hatInfo.hat = 43;
            }
         }
         else
         {
            this.hatInfo.hat = 2;
         }
         this.changeHat();
      }
  getColor(): number {
         return this.colorPicker.getColor();
      }
  changeColorHandler(event: Event): void {
         var color= this.colorPicker.getColor();
         this.hatInfo.color = color;
         this.changeHat();
      }
  setGraphicColor(param1: DisplayObject, param2: number): void {
    param2 = uint(param2);
         var colTrans= new ColorTransform();
         colTrans.color = param2;
         param1.transform.colorTransform = colTrans;
      }
  save(): void {
         var _loc_2= null;
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= 0;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_9= 0;
         var _loc_10= 0;
         var _loc_1= new Array();
         if(this.m.levelTypeDropdown.selectedOption != null)
         {
            this.level.levelType = this.m.levelTypeDropdown.selectedOption.data;
         }
         if(this.m.levelTypeDropdown.selectedOption.data == LevelPage.DEATHMATCH)
         {
            this.level.startHealth = int(Maths.limit(Number(this.dmOptions.healthBox.text),1,99999999));
         }
         for (_loc_3 of $keys(this.chanceArray))
         {
            _loc_8 = this.chanceArray[_loc_3];
            _loc_9 = int(_loc_8.text);
            _loc_9 = Maths.limit(_loc_9,0,100);
            this.level[_loc_3 + "Chance"] = _loc_9;
         }
         _loc_4 = this.m.timeBox.text.split(":");
         _loc_5 = 0;
         if(_loc_4.length == 1)
         {
            _loc_5 = int(_loc_4[0]);
         }
         else
         {
            _loc_10 = int(_loc_4[0]);
            _loc_5 = int(_loc_4[1]);
            _loc_5 += _loc_10 * 60;
         }
         if(isNaN(_loc_5))
         {
            _loc_5 = 5;
         }
         if(_loc_5 != 0 && this.m.levelTypeDropdown.selectedOption.data != LevelPage.KING_OF_HAT)
         {
            _loc_5 = Maths.limit(_loc_5,5,3600);
         }
         this.level.seconds = int(_loc_5);
         var _loc_6= Number(this.m.gravityBox.text);
         if(isNaN(_loc_6))
         {
            _loc_6 = 0;
         }
         _loc_6 = Maths.limit(_loc_6,-10,10);
         this.level.gravity = _loc_6;
         this.level.songID = this.musicDropdown.getSongID();
      }
  constructor() {
         super();
         this.chanceArray = new Array();
         this.musicDropdown = new MusicDropdown();
         this.m = new LevelOptionsMenuGraphic();
         this.addGraphic(this.m);
         this.intrusive = false;
         this.level = (MapPage.instance);
         this.m.levelTypeDropdown.addOption("Race",LevelPage.RACE);
         this.m.levelTypeDropdown.addOption("Deathmatch",LevelPage.DEATHMATCH);
         this.m.levelTypeDropdown.addOption("Hat Attack",LevelPage.HAT_ATTACK);
         this.m.levelTypeDropdown.addOption("King of the Hat",LevelPage.KING_OF_HAT);
         this.m.levelTypeDropdown.addOption("Damage Dash",LevelPage.DAMAGE_DASH);
         this.m.levelTypeDropdown.addOption("Coin Fiend",LevelPage.COIN_FIEND);
         this.m.levelTypeDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectTypeHandler'),false,0,true);
         this.m.levelTypeDropdown.selectOptionData(this.level.levelType);
         this.m.levelTypeDropdown.width = 200;
         this.musicDropdown.x = 80;
         this.musicDropdown.y = 52;
         this.musicDropdown.width = 200;
         this.musicDropdown.setSongID(this.level.songID);
         this.m.addChild(this.musicDropdown);
         this.m.timeBox.restrict = "0-9:";
         this.m.timeBox.maxChars = 6;
         this.m.timeBox.text = Data.formatSeconds(this.level.seconds);
         this.m.gravityBox.restrict = "0-9.\\-";
         this.m.gravityBox.maxChars = 4;
         this.m.gravityBox.text = this.level.gravity.toString();
         this.addChance(this.m.sfchmBox,"sfchm");
         this.addChance(this.m.snowBox,"snow");
         this.addChance(this.m.windBox,"wind");
         this.addChance(this.m.aliensBox,"alien");
         this.saveInterval = uint(setInterval($b(this, 'save'),500));
      }
}
$reg('com.jiggmin.pr3.editor.levelEditor.LevelOptionsMenu', LevelOptionsMenu);
