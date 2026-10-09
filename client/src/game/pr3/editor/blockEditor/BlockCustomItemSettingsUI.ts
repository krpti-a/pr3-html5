// Ported from com/jiggmin/pr3/editor/blockEditor/BlockCustomItemSettingsUI.as
import { Event, FocusEvent, MovieClip, TextField, TextFormat } from '../../../../flash/index.ts';
import { int, $keys, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Block, BlockCustomItemSettings, BlockCustomItemSettingsUIGraphic, BlockEditorPage, BlockManager, BlockPickerButton, BlockSettings, Bow, Buzzsaw, DropdownEvent, EasyButton, EasyCheckBox, EasyDropdown, EasyInput, Grenade, Heart, Items, Lightning, Napalm, Popup, Retreater, Shield, Snowball, Stamp, StampManager, StampPickerButton, Sword, Teleport } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockCustomItemSettingsUI extends Removable {
  declare m: any;
  declare blockSettings: BlockSettings;
  declare showMoreButton: EasyButton;
  declare closePopupButton: EasyButton;
  declare itemsPopup: Popup;
  declare texturePicker: StampPickerButton;
  declare textureText: TextField;
  declare itemVarsSettings: any;
  declare itemAbbr: string;
  columnWidth: number = 200;
  columnHeaderHeight: number = 30;
  declare itemVars: any;
  declare itemSettings: MovieClip;
  stampID: number = 0;
  remove(): void {
         this.save();
         if(this.texturePicker != null)
         {
            this.texturePicker.removeEventListener(Event.CHANGE,$b(this, 'changedValue'));
         }
         this.m.itemDropdown.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'));
         this.m = null;
         if(this.parent != null)
         {
            this.parent.removeChild(this);
         }
      }
  selectOptionHandler(event: DropdownEvent): void {
         this.save();
         this.itemAbbr = this.m.itemDropdown.selectedOption.data;
         this.blockSettings.itemType.type = this.itemAbbr;
         this.selectItem();
      }
  addOptions(param1: EasyDropdown): void {
         param1.addOption("Angel Wings",Items.ANGEL_WINGS);
         param1.addOption("Black Hole",Items.BLACK_HOLE);
         param1.addOption("Bow",Items.BOW);
         param1.addOption("Buzzsaw",Items.BUZZSAW);
         param1.addOption("Chili Pepper",Items.CHILI_PEPPER);
         param1.addOption("Grenade",Items.GRENADE);
         param1.addOption("Heart",Items.HEART);
         param1.addOption("Jetpack",Items.JET_PACK);
         param1.addOption("Laser Gun",Items.LASER_GUN);
         param1.addOption("Lightning",Items.LIGHTNING);
         param1.addOption("Lightning Cloud",Items.LIGHTNING_CLOUD);
         param1.addOption("Napalm",Items.NAPALM);
         param1.addOption("Portable Block",Items.PORTABLE_BLOCK);
         param1.addOption("Retreater",Items.RETREATER);
         param1.addOption("Rocket Launcher",Items.ROCKET_LAUNCHER);
         param1.addOption("Shield",Items.SHIELD);
         param1.addOption("Snowball",Items.SNOWBALL);
         param1.addOption("Speed Burst",Items.SPEED_BURST);
         param1.addOption("Super Jump",Items.SUPER_JUMP);
         param1.addOption("Sword",Items.SWORD);
         param1.addOption("Teleport",Items.TELEPORT);
      }
  selectItem(): void {
         var willOverflow: boolean= false;
         var addTexturePicker: boolean= false;
         if(this.texturePicker != null)
         {
            this.texturePicker.remove();
            this.texturePicker = null;
         }
         if(this.showMoreButton != null)
         {
            this.showMoreButton.remove();
            this.showMoreButton = null;
         }
         if(this.itemSettings != null)
         {
            this.itemSettings = null;
         }
         switch(this.itemAbbr)
         {
            case Items.LASER_GUN:
            case Items.SWORD:
            case Items.ROCKET_LAUNCHER:
            case Items.BOW:
               willOverflow = true;
               addTexturePicker = true;
               break;
            case Items.BUZZSAW:
            case Items.GRENADE:
               willOverflow = true;
         }
         this.itemVars = BlockEditorPage.blockSettings.itemType.settings[this.itemAbbr];
         this.itemVarsSettings = Items.getItemProperties(this.itemAbbr);
         this.itemSettings = this.constructUI();
         if(!willOverflow)
         {
            if(this.itemSettings != null)
            {
               this.itemSettings.x = 0;
               this.itemSettings.y = 65;
               this.m.addChildAt(this.itemSettings,0);
            }
         }
         else
         {
            this.addChild(this.createShowButton());
         }
         if(addTexturePicker)
         {
            this.m.addChild(this.createStampButton());
         }
      }
  changedValue(e: Event): void {
         this.stampID = int(this.texturePicker.value.id);
         var stamp: Stamp= StampManager.requestStamp(this.stampID);
         this.texturePicker.scaleX = Math.min(100 / stamp.width,100 / stamp.height);
         this.texturePicker.scaleY = Math.min(100 / stamp.width,100 / stamp.height);
      }
  showCustomUI(): void {
         this.showMoreButton.remove();
         this.itemsPopup = new Popup();
         if(this.itemSettings != null)
         {
            this.itemSettings.x = 0;
            this.itemSettings.y = 0;
            this.itemsPopup.addGraphicHandler(this.itemSettings);
            this.itemsPopup.addChild(this.createCloseButton());
            this.stage.addChild(this.itemsPopup);
         }
      }
  removeCustomUI(): void {
         this.stage.removeChild(this.itemsPopup);
         this.itemsPopup.remove();
         this.addChild(this.createShowButton());
      }
  createShowButton(): EasyButton {
         this.showMoreButton = new EasyButton();
         this.showMoreButton.label = "Show Customizable Fields";
         this.showMoreButton.setFunc($b(this, 'showCustomUI'));
         this.showMoreButton.x = 0;
         this.showMoreButton.y = 200;
         return this.showMoreButton;
      }
  createCloseButton(): EasyButton {
         this.closePopupButton = new EasyButton();
         this.closePopupButton.label = "Close";
         this.closePopupButton.setFunc($b(this, 'removeCustomUI'));
         return this.closePopupButton;
      }
  createStampButton(): StampPickerButton {
         this.texturePicker = new StampPickerButton();
         this.stampID = int(this.itemVars.stampid);
         var stamp: Stamp= StampManager.requestStamp(this.stampID);
         this.texturePicker.buttonValue = stamp;
         this.texturePicker.x = 0;
         this.texturePicker.y = 85;
         this.texturePicker.scaleX = Math.min(100 / stamp.width,100 / stamp.height);
         this.texturePicker.scaleY = Math.min(100 / stamp.width,100 / stamp.height);
         this.texturePicker.addEventListener(Event.CHANGE,$b(this, 'changedValue'));
         return this.texturePicker;
      }
  save(): void {
         if(this.itemSettings != null)
         {
            this.saveItemSettings();
            if(this.itemSettings.parent)
            {
               this.itemSettings.parent.removeChild(this.itemSettings);
            }
            this.itemSettings = null;
         }
         this.blockSettings.itemArray = [this.itemAbbr];
         this.blockSettings.itemSupply = int(Number(this.m.supplyBox.text));
         this.dispatchEvent(new Event(Event.CHANGE));
      }
  saveItemSettings(): void {
         var property: any= null;
         for (property of $keys(this.itemVarsSettings))
         {
            if(this.itemVarsSettings[property].uimetadata != null && this.itemVarsSettings[property].uimetadata.getmethod != null)
            {
               this.itemVars[property] = this.itemVarsSettings[property].uimetadata.getmethod.call(this);
            }
            else if(!(this.itemVarsSettings[property].uimetadata != null && this.itemVarsSettings[property].uimetadata.showinput == false))
            {
               this.itemVars[property] = this.itemSettings.getChildByName(property).text;
            }
         }
      }
  sortFunc(property1: string, property2: string): number {
         var _property1: string= property1;
         var _property2: string= property2;
         if(this.itemVarsSettings[_property1].uimetadata != null && this.itemVarsSettings[_property1].uimetadata.overridepos == "bottom")
         {
            return 1;
         }
         if(this.itemVarsSettings[_property2].uimetadata != null && this.itemVarsSettings[_property2].uimetadata.overridepos == "bottom")
         {
            return -1;
         }
         var _prop1special: boolean= this.itemVarsSettings[_property1].type == "Boolean" || this.itemVarsSettings[_property1].uimetadata != null && this.itemVarsSettings[_property1].uimetadata.method != null;
         var _prop2special: boolean= this.itemVarsSettings[_property2].type == "Boolean" || this.itemVarsSettings[_property2].uimetadata != null && this.itemVarsSettings[_property2].uimetadata.method != null;
         if(_prop1special || _prop2special)
         {
            if(_prop1special && !_prop2special)
            {
               return 1;
            }
            if(!_prop1special && _prop2special)
            {
               return -1;
            }
         }
         if(this.itemVarsSettings[_property1].uimetadata != null && this.itemVarsSettings[_property1].uimetadata.display != null)
         {
            _property1 = this.itemVarsSettings[_property1].uimetadata.display;
         }
         if(this.itemVarsSettings[_property2].uimetadata != null && this.itemVarsSettings[_property2].uimetadata.display != null)
         {
            _property2 = this.itemVarsSettings[_property2].uimetadata.display;
         }
         if(_property1 < _property2)
         {
            return -1;
         }
         if(_property1 > _property2)
         {
            return 1;
         }
         return 0;
      }
  constructUI(): MovieClip {
    var exists, _prop, updatePropertyTarget, updatePropertyField; // undeclared in decompiled source
         var _property: any= null;
         var propertyIndex= undefined;
         var property: string= null;
         var label: TextField= null;
         var input: any= null;
         var format: TextFormat= null;
         var columnName: any= null;
         var index: number = int(0);
         var mc: MovieClip= new MovieClip();
         var updateArray: any[]= new Array();
         var column: string= "basic";
         var columns: any= {"basic":{
            "count":0,
            "pos":0
         }};
         var columnCountIndex: number = int(0);
         var lastInputHeight: number = int(0);
         var basicHeader: TextField= this.constructUIColumnHeader("basic",columnCountIndex);
         mc.addChild(basicHeader);
         var sortedKeys: any[]= new Array();
         for (_property of $keys(this.itemVarsSettings))
         {
            if(!(this.itemVarsSettings[_property].uimetadata != null && this.itemVarsSettings[_property].uimetadata.showinput == false))
            {
               sortedKeys.push(_property);
            }
         }
         sortedKeys.sort($b(this, 'sortFunc'));
         for (propertyIndex of $keys(sortedKeys))
         {
            property = sortedKeys[propertyIndex];
            if(property == "stampid")
            {
               this.stampID = int(this.itemVars[property]);
            }
            else
            {
               label = new TextField();
               input = this.constructUIInput(this.itemVarsSettings,property);
               label.embedFonts = true;
               label.height = input.height;
               label.selectable = false;
               label.y += input.height * sortedKeys.indexOf(property);
               label.name = property + "Label";
               format = new TextFormat();
               format.font = "Action Man";
               format.color = 990323;
               format.size = 14;
               label.defaultTextFormat = format;
               if(this.itemVarsSettings[property].uimetadata != null && this.itemVarsSettings[property].uimetadata.display != null)
               {
                  label.text = this.itemVarsSettings[property].uimetadata.display;
               }
               else
               {
                  label.text = property;
               }
               column = "basic";
               if(this.itemVarsSettings[property].uimetadata != null && this.itemVarsSettings[property].uimetadata.column != null)
               {
                  column = this.itemVarsSettings[property].uimetadata.column;
                  exists = false;
                  for (columnName of $keys(columns))
                  {
                     if(column == columnName)
                     {
                        exists = true;
                        break;
                     }
                  }
                  if(!exists)
                  {
                     columnCountIndex++;
                     columns[column] = {
                        "count":0,
                        "pos":columnCountIndex
                     };
                     mc.addChild(this.constructUIColumnHeader(column,columnCountIndex));
                  }
               }
               if(lastInputHeight == 0)
               {
                  lastInputHeight = int(int(input.height));
               }
               label.x = $b(columns[column], 'pos') * this.columnWidth;
               label.y = columns[column].count * 25 + this.columnHeaderHeight + (lastInputHeight - 25);
               input.x = label.x + label.width;
               input.y = label.y;
               ++columns[column].count;
               input.name = property;
               mc.addChild(label);
               mc.addChild(input);
               if(this.itemVarsSettings[property].type == "Boolean")
               {
                  label.visible = false;
                  input.x = label.x;
               }
               if(this.itemVarsSettings[property].uimetadata != null)
               {
                  updateArray.push(property);
               }
               lastInputHeight = int(int(input.height));
            }
         }
         for (property of $keys(updateArray))
         {
            _prop = updateArray[property];
            if(this.itemVarsSettings[_prop].uimetadata.onupdate != null)
            {
               updatePropertyTarget = this.itemVarsSettings[_prop].uimetadata.onupdate[0];
               updatePropertyField = this.itemVarsSettings[_prop].uimetadata.onupdate[1];
               this.itemVarsSettings[updatePropertyTarget].uimetadata[updatePropertyField].call(mc,this.itemVars[_prop]);
            }
            if(this.itemVarsSettings[_prop].uimetadata.position != null)
            {
               index = int(mc.numChildren - 1 - this.itemVarsSettings[_prop].uimetadata.position);
               mc.setChildIndex(mc.getChildByName(_prop),index);
            }
         }
         if(columnCountIndex == 0)
         {
            mc.removeChild(basicHeader);
            for(index = int(0); index < mc.numChildren; index++)
            {
               mc.getChildAt(index).y = mc.getChildAt(index).y - this.columnHeaderHeight;
            }
         }
         return mc;
      }
  constructUIColumnHeader(columnName: string, position: number): TextField {
    position = int(position);
         var columnHeader: TextField= new TextField();
         columnHeader.embedFonts = true;
         columnHeader.width = this.columnWidth;
         columnHeader.selectable = false;
         columnHeader.x = position * this.columnWidth;
         var format: TextFormat= new TextFormat();
         format.font = "Action Man";
         format.color = 990323;
         format.size = 20;
         columnHeader.defaultTextFormat = format;
         columnHeader.text = columnName + " fields";
         return columnHeader;
      }
  constructUIInput(settings: any, property: string): any {
         var input: any= null;
         if(settings[property].uimetadata != null && settings[property].uimetadata.method != null)
         {
            input = this.constructSpecialUIInput(settings,property,settings[property].uimetadata.method);
         }
         if(input == null)
         {
            if(settings[property].type == "int" || settings[property].type == "Number")
            {
               input = this.constructNumericalUIInput(settings,property);
            }
            else if(settings[property].type == "Boolean")
            {
               input = this.constructBooleanUIInput(settings,property);
            }
            else
            {
               if(settings[property].type != "String")
               {
                  throw new Error("BlockCustomItemSettings.constructUIInput could not construct " + "proper input with property " + property + " (type:" + settings[property].type + ")");
               }
               input = this.constructStringUIInput(settings,property);
            }
         }
         return input;
      }
  constructNumericalUIInput(settings: any, property: string): EasyInput {
    var negLog, posLog; // undeclared in decompiled source
         var _input: EasyInput= new EasyInput();
         _input.width *= 0.5;
         _input.maxChars = 6;
         if(this.itemVars[property])
         {
            _input.text = this.itemVars[property];
         }
         else
         {
            _input.text = settings[property].value;
         }
         var restrict: string= "0-9";
         if(settings[property].type == "Number")
         {
            restrict += ".";
         }
         if(settings[property].range.min < 0)
         {
            restrict += "\\-";
         }
         if(settings[property].uimetadata != null && Boolean(settings[property].uimetadata.specialchars))
         {
            restrict += settings[property].uimetadata.specialchars;
         }
         _input.restrict = restrict;
         negLog = Math.log(Math.abs(settings[property].range.min)) / Math.log(10);
         posLog = Math.log(settings[property].range.max) / Math.log(10);
         _input.maxChars = 1 + Math.max(Math.floor(negLog) + 1,Math.floor(posLog));
         _input.addEventListener(FocusEvent.FOCUS_OUT,$b(this, 'helperFormatNumericalUIInput'),false,0,true);
         this.formatNumericalUIInput(_input,property);
         return _input;
      }
  constructBooleanUIInput(settings: any, property: string): EasyCheckBox {
         var _input: EasyCheckBox= new EasyCheckBox();
         if(settings[property].uimetadata != null && settings[property].uimetadata.display != null)
         {
            _input.label = settings[property].uimetadata.display;
         }
         else
         {
            _input.label = property;
         }
         _input.checked = this.itemVars[property] == "true" || this.itemVars[property] == true ? true : false;
         return _input;
      }
  constructStringUIInput(settings: any, property: string): EasyInput {
         var _input: EasyInput= new EasyInput();
         if(settings[property].uimetadata != null)
         {
            if(settings[property].uimetadata.width != null)
            {
               _input.width = settings[property].uimetadata.width;
            }
            else
            {
               _input.width *= 0.5;
            }
            if(settings[property].uimetadata.height != null)
            {
               _input.height = settings[property].uimetadata.height;
            }
            if(settings[property].uimetadata.maxchars != null)
            {
               _input.maxChars = settings[property].uimetadata.maxchars;
            }
            else
            {
               _input.maxChars = 6;
            }
         }
         else
         {
            _input.width *= 0.5;
            _input.maxChars = 6;
         }
         var restrict: string= "0-9";
         if(settings[property].uimetadata != null)
         {
            if(settings[property].uimetadata.restrict)
            {
               restrict = settings[property].uimetadata.restrict;
            }
            else if(settings[property].uimetadata.specialchars)
            {
               restrict += settings[property].uimetadata.specialchars;
            }
         }
         _input.restrict = restrict;
         if(this.itemVars[property])
         {
            _input.text = this.itemVars[property];
         }
         else
         {
            _input.text = settings[property].value;
         }
         return _input;
      }
  constructSpecialUIInput(settings: any, property: string, method: string): Removable {
    var dropdownOptions; // undeclared in decompiled source
         var button: BlockPickerButton= null;
         var dropdown: EasyDropdown= null;
         var option= undefined;
         if(method == "BlockPickerButton")
         {
            button = new BlockPickerButton();
            button.value = BlockManager.requestBlock(this.itemVars[property]);
            button.setAlignXPopupsTo("center");
            button.addEventListener("blockPickerChange",$b(this, 'setBlockPickerValueUIInput'),false,0,true);
            return button;
         }
         if(method == "EasyDropdown")
         {
            dropdown = new EasyDropdown();
            dropdownOptions = settings[property].uimetadata.options;
            for (option of $keys(dropdownOptions))
            {
               dropdown.addOption(dropdownOptions[option],dropdownOptions[option]);
            }
            dropdown.selectOptionLabel(this.itemVars[property]);
            if(settings[property].uimetadata.onupdate != null)
            {
               dropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'helperUpdateDropdownUIInput'),false,0,true);
            }
            return dropdown;
         }
         throw new Error("BlockCustomItemSettings.constructUIInput could not construct proper " + "*SPECIAL* input with property " + property + " (method:" + method + ")");
      }
  helperFormatNumericalUIInput(e: Event): void {
         this.formatNumericalUIInput(e.currentTarget,e.currentTarget.name);
      }
  formatNumericalUIInput(input: EasyInput, property: string): void {
    var adjusted; // undeclared in decompiled source
         var inp: string= input.text;
         if(this.itemVarsSettings[property].type == "int")
         {
            inp = parseInt(inp);
         }
         else if(this.itemVarsSettings[property].type == "Number")
         {
            inp = Number(inp);
         }
         adjusted = Math.max(Math.min(inp,this.itemVarsSettings[property].range.max),this.itemVarsSettings[property].range.min);
         if(isNaN(adjusted))
         {
            adjusted = "";
         }
         input.text = adjusted;
      }
  setBlockPickerValueUIInput(e: Event): void {
    var _inp; // undeclared in decompiled source
         _inp = e.currentTarget;
         this.itemVars.id = _inp.value.id;
      }
  helperUpdateDropdownUIInput(e: DropdownEvent): void {
         this.updateDropdownUIInput(e.currentTarget);
      }
  updateDropdownUIInput(input: EasyDropdown): void {
    var _property, updatePropertyTarget, updatePropertyField; // undeclared in decompiled source
         _property = input.name;
         updatePropertyTarget = this.itemVarsSettings[_property].uimetadata.onupdate[0];
         updatePropertyField = this.itemVarsSettings[_property].uimetadata.onupdate[1];
         this.itemVarsSettings[updatePropertyTarget].uimetadata[updatePropertyField].call(this.itemSettings,input.selectedOption.data);
      }
  constructor(param1: BlockSettings) {
         super();
         this.blockSettings = param1;
         this.m = new BlockCustomItemSettingsUIGraphic();
         this.m.supplyBox.restrict = "0-9";
         this.m.supplyBox.maxChars = 5;
         this.m.supplyBox.text = param1.itemSupply.toString();
         this.itemAbbr = BlockCustomItemSettings.legacyConvert(this.blockSettings.itemType.type);
         this.addOptions(this.m.itemDropdown);
         this.m.itemDropdown.selectOptionData(this.itemAbbr);
         this.m.itemDropdown.addEventListener(DropdownEvent.SELECT,$b(this, 'selectOptionHandler'),false,0,true);
         this.addChild(this.m);
         this.selectItem();
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockCustomItemSettingsUI', BlockCustomItemSettingsUI);
