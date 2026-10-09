// Ported from com/jiggmin/pr3/game/blockInterval/BlockIntervalManager.as
import { Sprite, clearInterval, getTimer, setInterval } from '../../../../flash/index.ts';
import { int, uint, $each, $b } from '../../../../flash/as3.ts';
import { Block, BlockFreqGroup, ChangeBlockFreqGroup, GeneratorBlockFreqGroup, MoveBlockFreqGroup, PM_PRNG } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockIntervalManager extends Sprite {
  static TYPE_CHANGE: number = 1;
  static TYPE_MOVE: number = 0;
  static TYPE_GLASS: number = 2;
  static TYPE_GENERATOR: number = 3;
  lastMS: number = NaN;
  stepFreq: number = 100;
  declare numberGenerator: PM_PRNG;
  stepInterval: number = 0;
  declare categories: any[];
  syncWithServer: boolean = false;
  getNeededBlocks(): any[] {
         var _loc_3: ChangeBlockFreqGroup= null;
         var _loc_4: any[]= null;
         var _loc_1: any[]= new Array();
         var _loc_2: any[]= this.categories[BlockIntervalManager.TYPE_CHANGE];
         for (_loc_3 of $each(_loc_2))
         {
            _loc_4 = _loc_3.getNeededBlocks();
            _loc_1 = _loc_1.concat(_loc_4);
         }
         return _loc_1;
      }
  doFullStep(type: number, freq: number): void {
    type = int(type); freq = int(freq);
         this.categories[type][freq].step(freq);
      }
  getGroup(param1: number, param2: number, param3: boolean = false): BlockFreqGroup {
    param1 = int(param1); param2 = int(param2);
         var _loc_4: any[]= this.categories[param2];
         var _loc_5: BlockFreqGroup= _loc_4[param1];
         if(_loc_4[param1] == null && param3)
         {
            if(param2 == BlockIntervalManager.TYPE_MOVE)
            {
               _loc_5 = new MoveBlockFreqGroup(param1);
            }
            else if(param2 == BlockIntervalManager.TYPE_CHANGE)
            {
               _loc_5 = new ChangeBlockFreqGroup(param1);
            }
            else if(param2 != BlockIntervalManager.TYPE_GLASS)
            {
               if(param2 == BlockIntervalManager.TYPE_GENERATOR)
               {
                  _loc_5 = new GeneratorBlockFreqGroup(param1);
               }
            }
            _loc_4[param1] = _loc_5;
         }
         return _loc_5;
      }
  start(): void {
         this.lastMS = getTimer();
         if(!this.syncWithServer)
         {
            this.stepInterval = uint(setInterval($b(this, 'step'),this.stepFreq));
         }
      }
  remove(): void {
         this.stop();
         this.clear();
         this.categories = null;
         this.numberGenerator = null;
      }
  addBlock(param1: Block, typeOfBlock: number): void {
    typeOfBlock = int(typeOfBlock);
         var _loc_3: number = int(1000);
         if(typeOfBlock == BlockIntervalManager.TYPE_MOVE)
         {
            param1.randMovePattern = this.createRandPattern();
            _loc_3 = int(param1.vars.moveFreq);
         }
         else if(typeOfBlock == BlockIntervalManager.TYPE_CHANGE)
         {
            _loc_3 = int(param1.vars.changeFreq);
         }
         else
         {
            if(typeOfBlock != BlockIntervalManager.TYPE_GENERATOR)
            {
               throw new Error("BlockIntervalManager::addBlock() - unknown value for type");
            }
            _loc_3 = int(param1.vars.generatorFrequency);
         }
         var _loc_4: BlockFreqGroup= this.getGroup(_loc_3,typeOfBlock,true);
         _loc_4.addBlock(param1);
      }
  clear(): void {
         var _loc_1: any[]= null;
         var _loc_2: BlockFreqGroup= null;
         for (_loc_1 of $each(this.categories))
         {
            for (_loc_2 of $each(_loc_1))
            {
               _loc_2.remove();
            }
         }
         this.createCategories();
      }
  createRandPattern(param1: number = 10): string {
    param1 = int(param1);
         var _loc_4: number = int(0);
         var _loc_2: string= "";
         var _loc_3: number = int(0);
         while(_loc_3 < param1)
         {
            _loc_4 = int(int(this.numberGenerator.nextIntRange(1,4)));
            if(_loc_4 == 1)
            {
               _loc_2 += "u";
            }
            else if(_loc_4 == 2)
            {
               _loc_2 += "d";
            }
            else if(_loc_4 == 3)
            {
               _loc_2 += "l";
            }
            else if(_loc_4 == 4)
            {
               _loc_2 += "r";
            }
            _loc_3++;
         }
         return _loc_2;
      }
  removeBlock(param1: Block, param2: number): void {
    param2 = int(param2);
         var _loc_3: number = int(1000);
         if(param2 == BlockIntervalManager.TYPE_MOVE)
         {
            _loc_3 = int(param1.vars.moveFreq);
         }
         else if(param2 == BlockIntervalManager.TYPE_CHANGE)
         {
            _loc_3 = int(param1.vars.changeFreq);
         }
         else
         {
            if(param2 != BlockIntervalManager.TYPE_GENERATOR)
            {
               throw new Error("BlockIntervalManager::removeBlock() - unknown value for type");
            }
            _loc_3 = int(param1.vars.generatorFrequency);
         }
         var _loc_4: BlockFreqGroup= this.getGroup(_loc_3,param2,false);
         if(_loc_4 != null)
         {
            _loc_4.removeBlock(param1);
         }
      }
  createCategories(): void {
         this.categories = new Array();
         this.categories[BlockIntervalManager.TYPE_MOVE] = new Array();
         this.categories[BlockIntervalManager.TYPE_CHANGE] = new Array();
         this.categories[BlockIntervalManager.TYPE_GENERATOR] = new Array();
      }
  stop(): void {
         if(!this.syncWithServer)
         {
            clearInterval(this.stepInterval);
         }
      }
  step(): void {
         var _loc_3: any[]= null;
         var _loc_4: BlockFreqGroup= null;
         var _loc_1: number = int(int(getTimer()));
         var _loc_2: number = int(_loc_1 - this.lastMS);
         this.lastMS = _loc_1;
         for (_loc_3 of $each(this.categories))
         {
            for (_loc_4 of $each(_loc_3))
            {
               if(_loc_4 != null)
               {
                  _loc_4.step(_loc_2);
               }
            }
         }
      }
  constructor(syncWithServer: boolean) {
         super();
         syncWithServer = false;
         this.categories = new Array();
         this.numberGenerator = new PM_PRNG();
         this.createCategories();
         this.syncWithServer = syncWithServer;
      }
}
$reg('com.jiggmin.pr3.game.blockInterval.BlockIntervalManager', BlockIntervalManager);
