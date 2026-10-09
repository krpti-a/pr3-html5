// Ported from com/jiggmin/pr3/editor/artMenu/ArtLayerMenu.as
import { Event, Keyboard, KeyboardEvent, MouseEvent, Point } from '../../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../../flash/as3.ts';
import { Popup } from '../../../popup/Popup.ts';
import { ArtLayerMenuGraphic, ArtMapLayer, LevelEditorPage, MapManager, Maths, RenameLayerPopup, Settings, TextButton } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ArtLayerMenu extends Popup {
  declare static instance: ArtLayerMenu;
  declare buttonArray: any[];
  declare m: any;
  declare selectedButton: TextButton;
  alphaBoxChangeHandler(event: Event): void {
         var _loc_2: string= this.m.alphaBox.text;
         var _loc_3: number= Number(_loc_2);
         if(isNaN(_loc_3))
         {
            _loc_3 = 0;
         }
         else
         {
            _loc_3 = Number(Maths.limit(_loc_3,0,100));
         }
         if(this.selectedButton != null)
         {
            this.selectedButton.data.alpha = _loc_3 / 100;
         }
      }
  swapDepths(param1: TextButton, param2: TextButton): void {
         var _loc_3: number = int(int(param1.data.sortNum));
         param1.data.sortNum = param2.data.sortNum;
         param2.data.sortNum = _loc_3;
         MapManager.map.sortDepth();
         this.createButtons();
      }
  remove(): void {
         this.removeButtons();
         $b(this.m, 'addButton').removeEventListener(MouseEvent.CLICK,$b(this, 'clickCreateLayerHandler'));
         $b(this.m, 'removeButton').removeEventListener(MouseEvent.CLICK,$b(this, 'clickRemoveLayerHandler'));
         this.m.upButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickMoveUpHandler'));
         this.m.downButton.removeEventListener(MouseEvent.CLICK,$b(this, 'clickMoveDownHandler'));
         this.m.depthBox.removeEventListener(Event.CHANGE,$b(this, 'depthBoxChangeHandler'));
         this.m.alphaBox.removeEventListener(Event.CHANGE,$b(this, 'alphaBoxChangeHandler'));
         this.m.changeLayerButton.removeEventListener(MouseEvent.CLICK,$b(this, 'changeLayerButtonHandler'));
         MapManager.map.removeEventListener("layerChange",$b(this, 'layerChangeHandler'));
         if(this.stage != null)
         {
            this.stage.removeEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'));
         }
         this.buttonArray = null;
         this.m = null;
         this.selectedButton = null;
         super.remove();
      }
  clickRemoveLayerHandler(event: MouseEvent): void {
         var _loc_2: TextButton= null;
         if(this.selectedButton != null)
         {
            _loc_2 = this.selectedButton;
            this.selectedButton = null;
            this.deleteLayer(_loc_2);
         }
      }
  clickMoveDownHandler(event: MouseEvent): void {
         var _loc_3: TextButton= null;
         var _loc_2: number = int(int(this.buttonArray.indexOf(this.selectedButton)));
         if(_loc_2 != -1 && _loc_2 < this.buttonArray.length - 1)
         {
            _loc_3 = this.buttonArray[_loc_2 + 1];
            this.swapDepths(_loc_3,this.selectedButton);
         }
      }
  init(): void {
         super.init();
         this.createButtons();
         MapManager.map.addEventListener("layerChange",$b(this, 'layerChangeHandler'),false,0,true);
         this.stage.addEventListener(KeyboardEvent.KEY_DOWN,$b(this, 'keyDownHandler'),false,0,true);
      }
  depthBoxChangeHandler(event: Event): void {
         var _loc_2: string= null;
         var _loc_3: number= Number(NaN);
         if(this.m.depthBox.text.length > 0)
         {
            _loc_2 = this.m.depthBox.text;
            _loc_3 = Number(_loc_2);
            if(!isNaN(_loc_3))
            {
               _loc_3 = Number(Maths.limit(_loc_3,0,50));
               if(this.selectedButton != null && this.selectedButton.data.depth != _loc_3)
               {
                  this.selectedButton.data.depth = _loc_3;
                  MapManager.map.sortDepth();
                  this.createButtons();
               }
            }
         }
      }
  createLayerHandler(event: Event): void {
         var _loc_2: string= event.target.layerName;
         this.createLayer(_loc_2);
      }
  createLayerButton(param1: string, param2: ArtMapLayer): TextButton {
         var _loc_3: TextButton= new TextButton();
         _loc_3.data = param2;
         _loc_3.sendSelf = true;
         _loc_3.init(param1,$b(this, 'clickLayer'));
         _loc_3.width = 144;
         _loc_3.align = "left";
         this.buttonArray.push(_loc_3);
         this.m.layerHolder.addChild(_loc_3);
         this.positionButtons();
         return _loc_3;
      }
  positionButtons(): void {
         var _loc_2: number = int(0);
         var _loc_3: TextButton= null;
         var _loc_1: number = int(20);
         _loc_2 = int(0);
         for (_loc_3 of $each(this.buttonArray))
         {
            _loc_3.y = _loc_2;
            _loc_2 = int(_loc_2 + (_loc_1));
         }
      }
  removeButtons(): void {
         var _loc_1: TextButton= null;
         for (_loc_1 of $each(this.buttonArray))
         {
            _loc_1.remove();
         }
         this.buttonArray = new Array();
      }
  createButtons(): void {
         var _loc_3: ArtMapLayer= null;
         var _loc_4: number = int(0);
         var _loc_5: TextButton= null;
         this.removeButtons();
         var _loc_1: any[]= MapManager.map.artMapArray;
         _loc_1.sortOn(["layerNum","depth","sortNum"],Array.NUMERIC | Array.DESCENDING);
         var _loc_2: number = uint(_loc_1.length);
         if(_loc_2 == 0)
         {
            this.createLayer("Layer 1");
         }
         else
         {
            _loc_4 = int(0);
            while(_loc_4 < _loc_2)
            {
               _loc_3 = _loc_1[_loc_4];
               _loc_5 = this.createLayerButton(_loc_3.mapName,_loc_3);
               _loc_3.sortNum = _loc_2 - _loc_4 + 100;
               _loc_4++;
            }
            _loc_4 = int(0);
            while(_loc_4 < _loc_2)
            {
               _loc_3 = _loc_1[_loc_4];
               if(_loc_3.selected == true)
               {
                  this.selectLayer(this.buttonArray[_loc_4]);
               }
               _loc_4++;
            }
            if(this.selectedButton == null)
            {
               this.selectLayer(this.buttonArray[0]);
            }
         }
         this.m.layerScroll.redraw();
      }
  deleteLayer(param1: TextButton): void {
         var _loc_2: ArtMapLayer= (param1.data);
         MapManager.map.removeMap(_loc_2);
         this.createButtons();
      }
  layerChangeHandler(event: Event): void {
         this.createButtons();
      }
  clickLayer(param1: TextButton): void {
         this.selectLayer(param1);
      }
  createLayer(param1: string): void {
         var _loc_2: ArtMapLayer= MapManager.map.createArtMap(param1);
         MapManager.map.selectMap(_loc_2);
         _loc_2.sortNum = 999;
         MapManager.map.sortDepth();
         this.createButtons();
      }
  clickMoveUpHandler(event: MouseEvent): void {
         var _loc_3: TextButton= null;
         var _loc_2: number = int(int(this.buttonArray.indexOf(this.selectedButton)));
         if(_loc_2 != -1 && _loc_2 > 0)
         {
            _loc_3 = this.buttonArray[_loc_2 - 1];
            this.swapDepths(_loc_3,this.selectedButton);
         }
      }
  changeLayerButtonHandler(event: MouseEvent): void {
         var index: number = int(int(this.buttonArray.indexOf(this.selectedButton)));
         if(index != -1)
         {
            this.buttonArray[index].data.layerNum = (this.buttonArray[index].data.layerNum + 1) % 4;
            MapManager.map.sortDepth();
            this.createButtons();
         }
      }
  redraw(): void {
         super.redraw();
         this.x = 6;
         this.y = Settings.gameHeight - this.height - 1;
      }
  keyDownHandler(event: KeyboardEvent): void {
         if(event.keyCode == Keyboard.ENTER)
         {
            if(Boolean(this.m.depthBox.hasFocus) || Boolean(this.m.alphaBox.hasFocus))
            {
               this.stage.focus = this.stage;
            }
         }
      }
  selectLayer(param1: TextButton): void {
         var _loc_2: ArtMapLayer= null;
         var _loc_3: string= null;
         var _loc_4: number = int(0);
         var _loc_5: Point= null;
         var _loc_6: number= Number(NaN);
         var _loc_7: number= Number(NaN);
         var _loc_8: number= Number(NaN);
         if(this.selectedButton == param1)
         {
            this.addPopup(new RenameLayerPopup(this.selectedButton));
         }
         else
         {
            if(this.selectedButton != null)
            {
               this.selectedButton.selected = false;
            }
            param1.selected = true;
            this.selectedButton = param1;
            _loc_2 = (this.selectedButton.data);
            MapManager.map.selectMap(_loc_2);
            _loc_3 = _loc_2.depth.toString();
            if(!this.m.depthBox.hasFocus)
            {
               this.m.depthBox.text = _loc_3;
            }
            if(!this.m.alphaBox.hasFocus)
            {
               this.m.alphaBox.text = Math.round(_loc_2.alpha * 100).toString();
            }
            _loc_4 = int(int(this.buttonArray.indexOf(this.selectedButton)));
            if(_loc_4 > 0 && this.buttonArray[_loc_4 - 1].data.depth == this.selectedButton.data.depth)
            {
               this.m.upButton.visible = true;
            }
            else
            {
               this.m.upButton.visible = false;
            }
            if(_loc_4 < this.buttonArray.length - 1 && this.buttonArray[_loc_4 + 1].data.depth == this.selectedButton.data.depth)
            {
               this.m.downButton.visible = true;
            }
            else
            {
               this.m.downButton.visible = false;
            }
            _loc_5 = new Point(0,0);
            _loc_5 = this.selectedButton.localToGlobal(_loc_5);
            _loc_5 = this.m.globalToLocal(_loc_5);
            _loc_6 = _loc_5.y;
            _loc_7 = Number(Maths.limit(_loc_6,32,87));
            _loc_8 = _loc_7 - _loc_6;
            this.m.layerHolder.y += _loc_8;
            this.m.layerScroll.positionThumb();
         }
      }
  clickCreateLayerHandler(event: MouseEvent): void {
         this.createLayer("New Layer");
      }
  constructor() {
         super();
         ArtLayerMenu.instance = this;
         this.buttonArray = new Array();
         this.intrusive = false;
         this.autoPosition = false;
         this.bg.visible = false;
         this.padding = int(0);
         this.m = new ArtLayerMenuGraphic();
         this.m.depthBox.restrict = "0-9.";
         this.m.alphaBox.restrict = "0-9";
         this.m.depthBox.maxChars = 4;
         this.m.alphaBox.maxChars = 3;
         $b(this.m, 'addButton').addEventListener(MouseEvent.CLICK,$b(this, 'clickCreateLayerHandler'),false,0,true);
         $b(this.m, 'removeButton').addEventListener(MouseEvent.CLICK,$b(this, 'clickRemoveLayerHandler'),false,0,true);
         this.m.upButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickMoveUpHandler'),false,0,true);
         this.m.downButton.addEventListener(MouseEvent.CLICK,$b(this, 'clickMoveDownHandler'),false,0,true);
         this.m.depthBox.addEventListener(Event.CHANGE,$b(this, 'depthBoxChangeHandler'),false,0,true);
         this.m.alphaBox.addEventListener(Event.CHANGE,$b(this, 'alphaBoxChangeHandler'),false,0,true);
         this.m.changeLayerButton.addEventListener(MouseEvent.CLICK,$b(this, 'changeLayerButtonHandler'),false,0,true);
         this.addGraphic(this.m);
         if(LevelEditorPage.instance != null)
         {
            this.m.depthCover.visible = false;
         }
         this.m.layerScroll.target = this.m.layerHolder;
         this.m.layerScroll.redraw();
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.ArtLayerMenu', ArtLayerMenu);
