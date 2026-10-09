// Ported from com/jiggmin/pr3/game/blockInterval/MoveBlockList.as
import { int, $each } from '../../../../flash/as3.ts';
import { BlockList } from './BlockList.ts';
import { Block } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class MoveBlockList extends BlockList {
  patternIndex: number = 0;
  maxPatternIndex: number = 0;
  maxRandIndex: number = 0;
  randIndex: number = 0;
  declare repeatCounters: any[];
  declare movePattern: string;
  assignMoveCommands(): void {
         var _loc_15= undefined;
         var _loc_16= undefined;
         var _loc_1= null;
         var _loc_2= null;
         var _loc_3= false;
         var _loc_4= 0;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= NaN;
         var _loc_8= 0;
         var _loc_9= null;
         var _loc_10= 0;
         var _loc_11= 0;
         var _loc_12= null;
         var _loc_13= 0;
         var _loc_14= null;
         if(this.initialized)
         {
            _loc_1 = this.movePattern.charAt(this.patternIndex);
            if(Boolean(this.charIsNumeric(_loc_1)) && this.patternIndex > 0)
            {
               _loc_3 = false;
               _loc_4 = this.patternIndex;
               do
               {
                  _loc_5 = this.movePattern.charAt(++_loc_4);
               }
               while(this.charIsNumeric(_loc_5));
               _loc_6 = this.movePattern.substr(this.patternIndex,_loc_4 - this.patternIndex);
               _loc_7 = Number(_loc_6);
               if(this.repeatCounters[this.patternIndex] == null)
               {
                  this.repeatCounters[this.patternIndex] = 0;
               }
               _loc_8 = this.repeatCounters[this.patternIndex];
               if(++_loc_8 >= _loc_7)
               {
                  _loc_8 = 0;
               }
               else
               {
                  _loc_3 = true;
               }
               this.repeatCounters[this.patternIndex] = _loc_8;
               if(_loc_3)
               {
                  _loc_9 = this.movePattern.charAt(this.patternIndex - 1);
                  if(_loc_9 == ")")
                  {
                     _loc_10 = 0;
                     _loc_11 = 0;
                     _loc_13 = this.patternIndex - 1;
                     while(_loc_13 > 0)
                     {
                        _loc_12 = this.movePattern.charAt(_loc_13);
                        if(_loc_12 == ")")
                        {
                           _loc_10++;
                        }
                        else
                        {
                           _loc_11++;
                        }
                        if(_loc_10 == _loc_11)
                        {
                           break;
                        }
                        _loc_13--;
                     }
                     this.patternIndex = int(_loc_13);
                  }
                  else
                  {
                     --this.patternIndex;
                  }
               }
               else
               {
                  this.patternIndex = int(_loc_4);
               }
               if(this.patternIndex > this.maxPatternIndex)
               {
                  this.patternIndex = int(0);
               }
               _loc_1 = this.movePattern.charAt(this.patternIndex);
            }
            for (_loc_2 of $each(this.blockVector))
            {
               if(!_loc_2.paused)
               {
                  if(_loc_1 == "*")
                  {
                     _loc_14 = _loc_2.randMovePattern.charAt(this.randIndex);
                     _loc_2.assignMoveBlockMoveCommand(_loc_14);
                  }
                  else
                  {
                     _loc_2.assignMoveBlockMoveCommand(_loc_1);
                  }
               }
            }
            if(_loc_1 == "*")
            {
               _loc_15 = this;
               _loc_16 = this.randIndex + 1;
               _loc_15.randIndex = _loc_16;
               if(this.randIndex > this.maxRandIndex)
               {
                  this.randIndex = int(0);
               }
            }
            _loc_15 = this;
            _loc_16 = this.patternIndex + 1;
            _loc_15.patternIndex = _loc_16;
            if(this.patternIndex > this.maxPatternIndex)
            {
               this.patternIndex = int(0);
            }
         }
      }
  executeMoveCommands(): void {
         var _loc_1= null;
         if(this.initialized)
         {
            for (_loc_1 of $each(this.blockVector))
            {
               if(!_loc_1.paused)
               {
                  _loc_1.executeMoveBlockMoveCommand();
               }
            }
         }
      }
  init(param1: Block): void {
         super.init(param1);
         this.movePattern = param1.vars.movePattern;
         this.movePattern = this.movePattern.replace(/up/g,"u");
         this.movePattern = this.movePattern.replace(/down/g,"d");
         this.movePattern = this.movePattern.replace(/right/g,"r");
         this.movePattern = this.movePattern.replace(/left/g,"l");
         this.movePattern = this.movePattern.replace(/wait/g,"-");
         this.movePattern = this.movePattern.replace(/return/g,"@");
         this.movePattern = this.movePattern.replace(/random/g,"*");
         this.movePattern = this.movePattern.replace(/[^0-9udrl\-\*\@]/g,"");
         if(this.movePattern == "")
         {
            this.movePattern = "*";
         }
         this.maxPatternIndex = int(this.movePattern.length - 1);
         this.maxRandIndex = int(param1.randMovePattern.length - 1);
      }
  charIsNumeric(param1: string): boolean {
         if(param1 == "0" || param1 == "1" || param1 == "2" || param1 == "3" || param1 == "4" || param1 == "5" || param1 == "6" || param1 == "7" || param1 == "8" || param1 == "9")
         {
            return true;
         }
         return false;
      }
  constructor(param1: Block) {
         super(param1);
         this.repeatCounters = new Array();

      }
}
$reg('com.jiggmin.pr3.game.blockInterval.MoveBlockList', MoveBlockList);
