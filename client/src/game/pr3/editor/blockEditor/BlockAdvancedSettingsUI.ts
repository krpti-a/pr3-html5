// Ported from com/jiggmin/pr3/editor/blockEditor/BlockAdvancedSettingsUI.as
import { Event, FocusEvent, MovieClip, Sprite, TextField, TextFieldAutoSize, TextFormat } from '../../../../flash/index.ts';
import { int, $b } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { Block, BlockSettings, EasyButton, EasyInput, Maths, Popup, Settings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockAdvancedSettingsUI extends Removable {
  declare static settingsKeys: any;
  static settingsDefinitions: any[] = BlockAdvancedSettingsUI.constructAdvancedSettings();
  declare blockSettings: BlockSettings;
  declare settingsPopup: Popup;
  declare blockSettingsUI: MovieClip;
  declare openPopupButton: EasyButton;
  declare closePopupButton: EasyButton;
  static helperFormatNumericalUIInput(e: Event): void {
         BlockAdvancedSettingsUI.formatNumericalUIInput(e.currentTarget,BlockAdvancedSettingsUI.settingsDefinitions[BlockAdvancedSettingsUI.settingsKeys[e.currentTarget.name]]);
      }
  static formatNumericalUIInput(input: EasyInput, settings: any): void {
         var adjusted: number= NaN;
         var inp: string= input.text;
         if(settings.type == "int")
         {
            adjusted = Number(parseInt(inp));
         }
         else if(settings.type == "Number")
         {
            adjusted = Number(inp);
         }
         if(settings.range != undefined)
         {
            adjusted = Number(Maths.limit(adjusted,settings.range.min,settings.range.max));
         }
         if(isNaN(adjusted))
         {
            input.text = "";
         }
         else
         {
            input.text = String(adjusted);
         }
      }
  static helperCustomFormat(f: Function): Function {
         return function (e: Event): any {
            f(BlockAdvancedSettingsUI.settingsDefinitions[BlockAdvancedSettingsUI.settingsKeys[e.currentTarget.name]],e.currentTarget);
         };
      }
  static constructAdvancedSettings(): any[] {
         var i: number = 0;
         var arr: any[]= [{
            "name":"Coin Fiend Value",
            "varName":"coins",
            "type":"int",
            "maxChars":2,
            "restrict":"0-9"
         },{
            "name":"Phasing Thickness",
            "varName":"phasingNumber",
            "type":"int",
            "maxChars":6,
            "range":{
               "min":-99999,
               "max":99999
            }
         },{
            "name":"Lua Block Tag",
            "varName":"blockTag",
            "type":"String",
            "maxChars":32,
            "width":150,
            "codeText":true,
            "customLoad":function (settingDefinition: any, uiElement: EasyInput, blockSettings: BlockSettings): void {
               var arr= blockSettings[settingDefinition.varName];
               uiElement.text = arr.join(",");
            },
            "customSave":function (settingDefinition: any, uiElement: EasyInput, blockSettings: BlockSettings): void {
               if(uiElement.text.length > 0)
               {
                  blockSettings[settingDefinition.varName] = uiElement.text.split(",");
               }
               else
               {
                  blockSettings[settingDefinition.varName] = [];
               }
            },
            "customFormat":function (settingDefinition: any, uiElement: EasyInput): void {
               var str= undefined;
               var trimmed= undefined;
               var arr= uiElement.text.split(",");
               for(var i= 0; i < arr.length; i++)
               {
                  str = arr[i];
                  trimmed = String(str).replace(/(^\s+|\s+$)/g,"");
                  arr[i] = trimmed;
               }
               uiElement.text = arr.join(",");
            }
         }];
         BlockAdvancedSettingsUI.settingsKeys = ({} as any);
         for(i = 0; i < arr.length; i++)
         {
            BlockAdvancedSettingsUI.settingsKeys[arr[i].varName] = i;
         }
         return arr;
      }
  createShowButton(): EasyButton {
         this.openPopupButton = new EasyButton();
         this.openPopupButton.label = "Show Advanced Settings";
         this.openPopupButton.setFunc($b(this, 'showCustomUI'));
         this.openPopupButton.x = 0;
         this.openPopupButton.y = 0;
         return this.openPopupButton;
      }
  createCloseButton(): EasyButton {
         this.closePopupButton = new EasyButton();
         this.closePopupButton.label = "Close";
         this.closePopupButton.setFunc($b(this, 'removeCustomUI'));
         return this.closePopupButton;
      }
  showCustomUI(): void {
         this.settingsPopup = new Popup();
         if(this.blockSettingsUI != null)
         {
            this.blockSettingsUI.x = 0;
            this.blockSettingsUI.y = 0;
            this.settingsPopup.addGraphicHandler(this.blockSettingsUI);
            this.settingsPopup.addChild(this.createCloseButton());
            this.stage.addChild(this.settingsPopup);
         }
      }
  removeCustomUI(): void {
         this.stage.removeChild(this.settingsPopup);
         this.settingsPopup.remove();
      }
  remove(): void {
         this.save();
         this.openPopupButton = null;
         this.closePopupButton = null;
         this.settingsPopup = null;
         super.remove();
      }
  save(): void {
         var settingDefinition: any= null;
         var input: EasyInput= null;
         for(var i: number = int(0); i < BlockAdvancedSettingsUI.settingsDefinitions.length; i++)
         {
            settingDefinition = BlockAdvancedSettingsUI.settingsDefinitions[i];
            input = this.blockSettingsUI.getChildByName(settingDefinition.varName);
            if(settingDefinition.customSave != undefined)
            {
               settingDefinition.customSave(settingDefinition,input,this.blockSettings);
               continue;
            }
            switch(settingDefinition.type)
            {
               case "int":
                  this.blockSettings[settingDefinition.varName] = int(input.text);
                  break;
               case "Number":
                  this.blockSettings[settingDefinition.varName] = Number(input.text);
                  break;
               case "String":
                  this.blockSettings[settingDefinition.varName] = String(input.text);
            }
         }
      }
  constructUI(): MovieClip {
         var i: number = int(0);
         var settingDefinition: any= null;
         var label: TextField= null;
         var format: TextFormat= null;
         var input: EasyInput= null;
         var mc: MovieClip= new MovieClip();
         var maxWidth: number = int(100);
         var header: Sprite= new Sprite();
         header.graphics.drawRect(0,0,1,1);
         mc.addChild(header);
         var baseHeight: number = int(12);
         var baseInputHeight: number = int(23);
         var verticalSpacing: number = int(2);
         var horizontalSpacing: number = int(2);
         var height: number = int(baseHeight);
         for(i = int(0); i < BlockAdvancedSettingsUI.settingsDefinitions.length; i++)
         {
            settingDefinition = BlockAdvancedSettingsUI.settingsDefinitions[i];
            label = new TextField();
            label.embedFonts = true;
            label.height = settingDefinition.height != undefined ? Number(settingDefinition.height) : baseInputHeight;
            label.selectable = false;
            label.y = height;
            label.name = settingDefinition.varName + "Label";
            label.autoSize = TextFieldAutoSize.LEFT;
            format = new TextFormat();
            format.font = "Action Man";
            format.color = 990323;
            format.size = 14;
            label.defaultTextFormat = format;
            label.text = settingDefinition.name;
            if(label.width > maxWidth)
            {
               maxWidth = int(label.width);
            }
            height = int(height + (label.height + verticalSpacing));
            mc.addChild(label);
         }
         height = int(baseHeight);
         for(i = int(0); i < BlockAdvancedSettingsUI.settingsDefinitions.length; i++)
         {
            settingDefinition = BlockAdvancedSettingsUI.settingsDefinitions[i];
            input = this.constructUIInput(settingDefinition,settingDefinition.varName);
            label = mc.getChildByName(settingDefinition.varName + "Label");
            input.x = label.x + maxWidth + horizontalSpacing;
            input.y = height;
            height = int(height + (label.height + verticalSpacing));
            mc.addChild(input);
         }
         return mc;
      }
  constructUIInput(settings: any, property: string): EasyInput {
         var format: TextFormat= null;
         var _input: EasyInput= new EasyInput();
         _input.width = settings.width != undefined ? Number(settings.width) : _input.width / 2;
         _input.maxChars = settings.maxChars != undefined ? int(settings.maxChars) : 6;
         if(settings.height != undefined)
         {
            _input.height = settings.height;
         }
         if(settings.customLoad != undefined)
         {
            settings.customLoad(settings,_input,this.blockSettings);
         }
         else
         {
            _input.text = String(this.blockSettings[property]);
         }
         if(settings.restrict != undefined)
         {
            _input.restrict = String(settings.restrict);
         }
         else
         {
            switch(settings.type)
            {
               case "int":
                  _input.restrict = "0-9\\-";
                  break;
               case "Number":
                  _input.restrict = "0-9\\-\\.";
                  break;
               case "String":
            }
         }
         if(settings.codeText == true)
         {
            format = _input.textBox.defaultTextFormat;
            format.font = "Courier New";
            _input.textBox.embedFonts = false;
            _input.textBox.defaultTextFormat = format;
            _input.textBox.y += 2;
            _input.text = String(this.blockSettings[property]);
         }
         _input.name = property;
         if(settings.customFormat != undefined)
         {
            _input.addEventListener(FocusEvent.FOCUS_OUT,BlockAdvancedSettingsUI.helperCustomFormat(settings.customFormat),false,0,true);
         }
         else
         {
            switch(settings.type)
            {
               case "int":
               case "Number":
                  _input.addEventListener(FocusEvent.FOCUS_OUT,BlockAdvancedSettingsUI.helperFormatNumericalUIInput,false,0,true);
                  BlockAdvancedSettingsUI.formatNumericalUIInput(_input,settings);
            }
         }
         return _input;
      }
  constructor(settings: BlockSettings) {
         super();
         this.blockSettings = settings;
         this.blockSettingsUI = this.constructUI();
         this.addChild(this.createShowButton());
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.BlockAdvancedSettingsUI', BlockAdvancedSettingsUI);
