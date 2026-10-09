// Ported from com/jiggmin/pr3/map/CommandMapLayer.as
import { Event, clearTimeout, realTimer, setTimeout } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { TileMapLayer } from './TileMapLayer.ts';
import { $reg } from '../../refs.ts';

export class CommandMapLayer extends TileMapLayer {
  startExecTime2: number = NaN;
  maxExecTime: number = 66;
  commandPos: number = 0;
  declare commandArray: any[];
  declare undoArray: any[];
  commandTimeout: number = 0;
  preserveUndoArray: boolean = false;
  forceCommandBreak: boolean = false;
  remove(): void {
         clearTimeout(this.commandTimeout);
         this.undoArray = new Array();
         this.commandArray = new Array();
         super.remove();
      }
  clear(): void {
         clearTimeout(this.commandTimeout);
         this.commandPos = int(0);
         super.clear();
      }
  doCommand(param1: any): void {
      }
  performCommands(): void {
         this._drawing = true;
         clearTimeout(this.commandTimeout);
         var commandsCount: number = int(int(this.commandArray.length));
         var startExecTime: number = int(realTimer() + this.maxExecTime);
         while(this.commandPos < commandsCount)
         {
            this.doCommand(this.commandArray[this.commandPos++]);
            if(this.forceCommandBreak || this.commandPos % 100 == 0 && realTimer() > startExecTime)
            {
               this.forceCommandBreak = false;
               break;
            }
         }
         if(this.commandPos >= commandsCount)
         {
            this._drawing = false;
            this.finishedCommands();
         }
         else
         {
            this.commandTimeout = uint(setTimeout($b(this, 'performCommands'),0));
         }
      }
  finishedCommands(): void {
         this.requestShowAll();
         setTimeout($b(this, 'dispatchEvent'),0,new Event("finishDrawing"));
      }
  requestShowAll(): void {
      }
  set saveString(param1: string) {
         this.undoArray = new Array();
         this.commandArray = new Array();
         this.clear();
      }
  undo(): void {
         var _loc_1= null;
         if(this.commandArray.length > 0)
         {
            _loc_1 = this.commandArray.pop();
            this.undoArray.push(_loc_1);
            if(_loc_1.type == "endGroupCommand")
            {
               while(_loc_1.type != "startGroupCommand")
               {
                  _loc_1 = this.commandArray.pop();
                  this.undoArray.push(_loc_1);
               }
            }
         }
         this.clear();
         this.performCommands();
      }
  get saveString(): string {
         return "";
      }
  CommandMap(): void {
      }
  addCommand(param1: any): void {
         if(!this.preserveUndoArray)
         {
            this.undoArray = new Array();
         }
         this.commandArray.push(param1);
         this.performCommands();
      }
  redo(): void {
         var _loc_1= null;
         if(this.undoArray.length > 0)
         {
            _loc_1 = this.undoArray.pop();
            this.preserveUndoArray = true;
            this.addCommand(_loc_1);
            if(_loc_1.type == "startGroupCommand")
            {
               while(_loc_1.type != "endGroupCommand")
               {
                  _loc_1 = this.undoArray.pop();
                  this.addCommand(_loc_1);
               }
            }
            this.preserveUndoArray = false;
            this.performCommands();
         }
      }
  constructor() {
         super();
         this.commandArray = new Array();
         this.undoArray = new Array();
      }
}
$reg('com.jiggmin.pr3.map.CommandMapLayer', CommandMapLayer);
