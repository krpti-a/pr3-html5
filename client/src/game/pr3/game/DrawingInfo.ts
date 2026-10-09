// Ported from com/jiggmin/pr3/game/DrawingInfo.as
import { DropShadowFilter, MouseEvent, MovieClip, TextField, TextFieldAutoSize, TextFormat, clearInterval, clearTimeout, setInterval, setTimeout } from '../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { BlossomRoom, BlossomUser, Data, DrawingInfoGraphic, DrawingStatus, EasyScroll, GamePage, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class DrawingInfo extends Removable {
  declare m: any;
  declare userArray: any[];
  declare userGraphicArray: any[];
  declare container: MovieClip;
  padding: number = 5;
  rightPadding: number = 30;
  targetHeight: number = 160;
  targetWidth: number = 280;
  triggerFinishTimeout: number = 0;
  declare room: BlossomRoom;
  declare textFields: any;
  declare drawingStatus: any;
  declare scrollBar: EasyScroll;
  secondInterval: number = 0;
  scrollEnabled: boolean = false;
  mouseClickingScroll: boolean = false;
  overScrollBar: boolean = false;
  initListeners(): void {
         this.container.addEventListener(MouseEvent.ROLL_OVER,$b(this, 'mouseOver'));
         this.container.addEventListener(MouseEvent.ROLL_OUT,$b(this, 'mouseLeave'));
         this.scrollBar.addEventListener(MouseEvent.ROLL_OVER,$b(this, 'mouseOver'));
         this.scrollBar.addEventListener(MouseEvent.ROLL_OUT,$b(this, 'mouseLeave'));
         GamePage.instance.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDown'));
         GamePage.instance.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUp'));
      }
  mouseOver(e: MouseEvent): void {
         if(!this.scrollBar.hasEventListener(MouseEvent.ROLL_OVER) && !this.scrollBar.hasEventListener(MouseEvent.ROLL_OUT))
         {
            this.scrollBar.addEventListener(MouseEvent.ROLL_OVER,$b(this, 'mouseOver'));
            this.scrollBar.addEventListener(MouseEvent.ROLL_OUT,$b(this, 'mouseLeave'));
            GamePage.instance.stage.addEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDown'));
            GamePage.instance.stage.addEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUp'));
         }
         if(this.scrollBar != null)
         {
            clearInterval(this.secondInterval);
            this.overScrollBar = true;
            this.scrollBar.alpha = 0.5;
            this.scrollBar.mouseEnabled = true;
            this.scrollBar.mouseChildren = true;
            this.scrollEnabled = true;
         }
      }
  mouseLeave(e: MouseEvent): void {
         this.overScrollBar = false;
         if(this.scrollBar != null && !this.mouseClickingScroll)
         {
            clearInterval(this.secondInterval);
            this.secondInterval = uint(setInterval($b(this, 'hideScroll'),3000));
         }
      }
  mouseDown(e: MouseEvent): void {
         if(this.scrollBar != null && Boolean(this.scrollBar.hitTestPoint(e.stageX,e.stageY)))
         {
            this.mouseClickingScroll = true;
         }
      }
  mouseUp(e: MouseEvent): void {
         this.mouseClickingScroll = false;
         if(this.scrollBar != null && !this.overScrollBar && !this.scrollBar.hitTestPoint(e.stageX,e.stageY))
         {
            clearInterval(this.secondInterval);
            this.secondInterval = uint(setInterval($b(this, 'hideScroll'),3000));
         }
      }
  hideScroll(): void {
         if(this.scrollBar != null && !this.mouseClickingScroll)
         {
            this.scrollBar.mouseEnabled = false;
            this.scrollBar.mouseChildren = false;
            this.scrollBar.alpha = 0;
            clearInterval(this.secondInterval);
            this.scrollBar.removeEventListener(MouseEvent.ROLL_OVER,$b(this, 'mouseOver'));
            this.scrollBar.removeEventListener(MouseEvent.ROLL_OUT,$b(this, 'mouseLeave'));
            GamePage.instance.stage.removeEventListener(MouseEvent.MOUSE_DOWN,$b(this, 'mouseDown'));
            GamePage.instance.stage.removeEventListener(MouseEvent.MOUSE_UP,$b(this, 'mouseUp'));
            this.scrollEnabled = false;
         }
      }
  showDrawingStatus(): void {
         var drawing= undefined;
         var _loc_2= null;
         var _loc_1= 0;
         for (_loc_2 of $each(this.userArray))
         {
            this.textFields[_loc_2.socketID].text = _loc_2.userName;
            if(!_loc_2.vars.drawing)
            {
               drawing = this.drawingStatus[_loc_2.socketID];
               if(drawing != null)
               {
                  if(this.container.contains(drawing))
                  {
                     this.container.removeChild(drawing);
                     this.drawingStatus[_loc_2.socketID] = null;
                  }
               }
            }
         }
         if(this.scrollBar != null)
         {
            this.redraw();
            this.scrollBar.x = this.targetWidth - this.scrollBar.width - this.padding + 10;
            this.scrollBar.y = this.padding;
            this.scrollBar.height = this.targetHeight - this.padding * 2;
            this.scrollBar.redraw();
            if(!this.scrollEnabled)
            {
               this.hideScroll();
            }
         }
      }
  addUser(param1: BlossomUser): void {
         var nameHolderFormat: TextFormat= null;
         this.userArray.push(param1);
         nameHolderFormat = new TextFormat();
         nameHolderFormat.font = "Action Man";
         nameHolderFormat.size = 14;
         var nameHolder: TextField= new TextField();
         nameHolder.embedFonts = true;
         nameHolder.autoSize = TextFieldAutoSize.LEFT;
         nameHolder.y = (this.userArray.length - 1) * 22;
         nameHolder.defaultTextFormat = nameHolderFormat;
         nameHolder.textColor = 16777215;
         nameHolder.filters = [new DropShadowFilter(1,1)];
         var drawingStatus: any= new DrawingStatus();
         drawingStatus.y = nameHolder.y;
         drawingStatus.x = 110;
         this.textFields[param1.socketID] = nameHolder;
         this.drawingStatus[param1.socketID] = drawingStatus;
         this.container.addChild(nameHolder);
         this.container.addChild(drawingStatus);
         if(this.userArray.length > 8)
         {
            this.addScroll();
         }
         param1.vars.drawing = true;
         param1.vars.gone = false;
         this.showDrawingStatus();
      }
  addScroll(): void {
         if(this.scrollBar == null)
         {
            this.scrollBar = new EasyScroll();
            this.initListeners();
         }
         if(this.scrollBar != null)
         {
            this.redraw();
            this.scrollBar.height = this.targetHeight - this.padding * 2;
            this.scrollBar.x = this.targetWidth - this.scrollBar.width - this.padding + 10;
            this.scrollBar.y = this.padding;
            this.scrollBar.target = this.container;
            this.addChild(this.scrollBar);
            this.scrollBar.height = this.targetHeight - this.padding * 2;
            this.scrollBar.redraw();
            this.hideScroll();
         }
      }
  removeScroll(): void {
         if(this.scrollBar != null)
         {
            this.scrollBar.remove();
            this.scrollBar = null;
         }
      }
  remove(): void {
         clearTimeout(this.triggerFinishTimeout);
         this.userArray = null;
         this.m = null;
         this.room = null;
         this.scrollBar = null;
         this.container = null;
         this.hideScroll();
         this.removeScroll();
         super.remove();
      }
  playerFinishedDrawing(param1: any): void {
         param1.vars.drawing = false;
         this.showDrawingStatus();
      }
  removeUser(param1: BlossomUser): void {
         var user: BlossomUser= null;
         var drawing: any= null;
         var textField= undefined;
         var _loc_2= this.userArray.indexOf(param1);
         if(_loc_2 != -1)
         {
            this.userArray.splice(_loc_2,1);
            drawing = this.drawingStatus[param1.socketID];
            if(drawing != null)
            {
               if(this.contains(drawing))
               {
                  this.container.removeChild(drawing);
               }
               this.drawingStatus[param1.socketID] = null;
            }
            textField = this.textFields[param1.socketID];
            if(textField != null)
            {
               this.container.removeChild(textField);
               this.textFields[param1.socketID] = null;
            }
         }
         var i: number = int(0);
         for (user of $each(this.userArray))
         {
            this.textFields[user.socketID].y = i * 22;
            drawing = this.drawingStatus[user.socketID];
            if(drawing != null)
            {
               drawing.y = i * 22;
            }
            i++;
         }
         this.showDrawingStatus();
      }
  redraw(): void {
         if(this.container != null && this.scrollBar != null)
         {
            this.targetWidth = int(this.container.width - this.padding * 2 + this.rightPadding);
            this.scrollBar.alpha = 0.5;
         }
      }
  triggerFinish(): void {
         var timeToPass: number= Number(GamePage.instance.getGameTimer().getElapsedMS());
         if(GamePage.instance.levelType == "deathmatch" || GamePage.instance.levelType == "damageDash")
         {
            if(GamePage.instance.localPlayer != null)
            {
               if(GamePage.instance.localPlayer.getVars().life <= 0)
               {
                  timeToPass *= -1;
               }
            }
         }
         SocketManager.socket.finishMatch(timeToPass);
      }
  ordinal(number: number): string {
    number = int(number);
         var last: number = int(number % 10);
         var two_last: number = int(number % 100);
         if(last == 1 && two_last != 11)
         {
            return number + "st";
         }
         if(last == 2 && two_last != 12)
         {
            return number + "nd";
         }
         if(last == 3 && two_last != 13)
         {
            return number + "rd";
         }
         return number + "th";
      }
  playerFinished(param1: any): void {
         var text: string= null;
         var _loc_5= null;
         var player_name= null;
         var finish_time= undefined;
         var finish_place= null;
         var _loc_2= param1;
         var _loc_3= 0;
         var _loc_4= 0;
         for (_loc_5 of $each(_loc_2))
         {
            player_name = _loc_5.name;
            finish_time = _loc_5.finish_time;
            finish_place = _loc_5.finish_place;
            if(finish_time == null)
            {
               finish_time = "";
            }
            text = player_name;
            if(GamePage.instance.levelType == "coinFiend")
            {
               text += "     " + _loc_5.coins;
            }
            else if(GamePage.instance.levelType == "damageDash")
            {
               if(_loc_5.dash > 0)
               {
                  text += "     " + _loc_5.dash;
               }
               else
               {
                  text += "     0";
               }
            }
            else if(GamePage.instance.levelType == "kingOfTheHat")
            {
               text += "     " + _loc_5.koth;
            }
            else if(finish_time != "forfeit" && finish_time != "")
            {
               text += "     " + Data.formatSeconds(Number(finish_time),"decimal");
            }
            else
            {
               text += "     " + finish_time;
            }
            if(finish_place != null)
            {
               text += "     " + this.ordinal(finish_place);
            }
            if(_loc_5.gone)
            {
               text += "     (gone)";
            }
            if(this.textFields != null && this.textFields[_loc_5.socketID] != null)
            {
               this.textFields[_loc_5.socketID].text = text;
            }
            if(GamePage.instance.levelType == "deathmatch" && finish_time != "")
            {
               _loc_4++;
            }
            _loc_3++;
         }
         if(GamePage.instance.levelType == "deathmatch" && _loc_4 >= _loc_2.length - 1)
         {
            clearTimeout(this.triggerFinishTimeout);
            this.triggerFinishTimeout = uint(setTimeout($b(this, 'triggerFinish'),2000));
         }
         if(this.scrollBar != null)
         {
            this.redraw();
            this.scrollBar.x = this.targetWidth - this.scrollBar.width - this.padding + 10;
            this.scrollBar.y = this.padding;
            this.scrollBar.height = this.targetHeight - this.padding * 2;
            this.scrollBar.redraw();
            if(!this.scrollEnabled)
            {
               this.hideScroll();
            }
         }
      }
  constructor(param1: BlossomRoom) {
         super();
         this.m = new DrawingInfoGraphic();
         this.userArray = new Array();
         this.textFields = ({} as any);
         this.drawingStatus = ({} as any);
         this.room = param1;
         this.container = new MovieClip();
         this.addChild(this.container);
      }
}
$reg('com.jiggmin.pr3.game.DrawingInfo', DrawingInfo);
