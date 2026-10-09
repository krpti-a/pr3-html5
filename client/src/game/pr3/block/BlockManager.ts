// Ported from com/jiggmin/pr3/block/BlockManager.as
import { BitmapData, ByteArray, Event, EventDispatcher, LoaderInfo, Matrix, Point, Rectangle, StageQuality, clearTimeout, realTimer, setTimeout } from '../../../flash/index.ts';
import { int, uint, $Array, $as, $each } from '../../../flash/as3.ts';
import { Block, BlockEvent, BlockSettings, BlockSideSettings, Data, Heart, Item, Items, LoadingBlockBitmapData, MapHolder, MapManager, MessageChannel, NotFoundBlockBitmapData, PortableBlockBitmap, PortableMineBitmap, Sparkworkz, Teleport, Worker, WorkerDomain, WorkerState } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class BlockManager {
  declare static drawingMap: MapHolder;
  declare static disp: EventDispatcher;
  declare static loadingBlockImage: BitmapData;
  declare static errorBlockImage: BitmapData;
  static drawTimeout: number = 0;
  static drawStarted: number = 0;
  declare static LOADING_BLOCK: BlockSettings;
  static loadQueue: any[] = new Array();
  static blockArray: any[] = new Array();
  static blockBeingLoaded: number = 0;
  static blockBeingDrawn: number = 0;
  static multiLoadArray: any[] = new Array();
  static blockVarArray: any[] = new Array();
  static blockArrays: any[] = new Array();
  static drawQueue: any[] = new Array();
  static gcKeepAlive: any[] = new Array();
  static freeDataWorkers: any[] = new Array();
  static busyDataWorkers: any[] = new Array();
  static clearBlock(param1: number): void {
         BlockManager.blockArray[param1] = null;
         BlockManager.blockVarArray[param1] = null;
      }
  static get finishedWithRequests(): boolean {
         if(BlockManager.blockBeingDrawn == 0 && BlockManager.drawQueue.length <= 0 && BlockManager.multiLoadArray.length <= 0 && BlockManager.loadQueue.length <= 0 && BlockManager.blockBeingLoaded == 0 && BlockManager.busyDataWorkers.length == 0)
         {
            return true;
         }
         return false;
      }
  static abortLoading(): void {
         var blockId= undefined;
         var worker: Worker= null;
         var messageChannel: MessageChannel= null;
         for (blockId of $each(BlockManager.drawQueue))
         {
            delete BlockManager.blockArray[blockId];
         }
         if(BlockManager.blockBeingDrawn != 0)
         {
            delete BlockManager.blockArray[BlockManager.blockBeingDrawn];
         }
         clearTimeout(BlockManager.drawTimeout);
         BlockManager.blockBeingLoaded = 0;
         BlockManager.blockBeingDrawn = 0;
         BlockManager.drawingMap.reset();
         BlockManager.loadQueue.length = 0;
         BlockManager.drawQueue.length = 0;
         BlockManager.multiLoadArray.length = 0;
         for (worker of $each(BlockManager.busyDataWorkers))
         {
            messageChannel = $as(worker.getSharedProperty("outgoingMessageChannel"), MessageChannel);
            messageChannel.send(["abortDraw"]);
            BlockManager.freeDataWorkers.push(worker);
         }
         BlockManager.busyDataWorkers.length = 0;
      }
  static createWorkers(loaderInfo: LoaderInfo, amount: number): void {
    amount = int(amount);
         var totalWorkers= undefined;
         var i: number = int(0);
         var removed: any[]= null;
         var worker: Worker= null;
         var workerIncomingMessageChannel: MessageChannel= null;
         var workerOutgoingMessageChannel: MessageChannel= null;
         if(WorkerDomain.isSupported)
         {
            totalWorkers = BlockManager.freeDataWorkers.length + BlockManager.busyDataWorkers.length;
            if(totalWorkers > amount)
            {
               removed = new Array();
               for (worker of $each(BlockManager.freeDataWorkers))
               {
                  if(totalWorkers-- > amount)
                  {
                     worker.terminate();
                     BlockManager.gcKeepAlive.splice(worker,1);
                     BlockManager.gcKeepAlive.splice(worker.getSharedProperty("incomingMessageChannel"),1);
                     BlockManager.gcKeepAlive.splice(worker.getSharedProperty("outgoingMessageChannel"),1);
                     removed.push(worker);
                  }
               }
               for (worker of $each(removed))
               {
                  BlockManager.freeDataWorkers.splice(worker,1);
               }
               return;
            }
            i = int(0);
            while(i < amount - totalWorkers)
            {
               worker = WorkerDomain.current.createWorker(loaderInfo.bytes);
               workerIncomingMessageChannel = worker.createMessageChannel(Worker.current);
               workerIncomingMessageChannel.addEventListener(Event.CHANNEL_MESSAGE,BlockManager.workerIncomingChannelMessage,false,0,true);
               worker.setSharedProperty("incomingMessageChannel",workerIncomingMessageChannel);
               workerOutgoingMessageChannel = Worker.current.createMessageChannel(worker);
               worker.setSharedProperty("outgoingMessageChannel",workerOutgoingMessageChannel);
               worker.addEventListener(Event.WORKER_STATE,BlockManager.workerStateHandler,false,0,true);
               worker.start();
               BlockManager.gcKeepAlive.push(worker);
               BlockManager.gcKeepAlive.push(workerOutgoingMessageChannel);
               BlockManager.gcKeepAlive.push(workerIncomingMessageChannel);
               i++;
            }
         }
      }
  static workerStateHandler(event: Event): void {
         var worker: Worker= (event.currentTarget);
         if(worker.state == WorkerState.RUNNING)
         {
            BlockManager.freeDataWorkers.push(worker);
         }
      }
  static workerIncomingChannelMessage(event: Event): void {
         var worker: Worker= null;
         var byteArray: ByteArray= null;
         var blockId: number = uint(0);
         var block: Block= null;
         var messageChannel: MessageChannel= $as(event.currentTarget, MessageChannel);
         var message: any[]= $as(messageChannel.receive(), $Array);
         if(message != null)
         {
            if(message[0] == "drawnBlock")
            {
               worker = $as(messageChannel.receive(true), Worker);
               byteArray = $as(messageChannel.receive(true), ByteArray);
               BlockManager.busyDataWorkers.splice(worker,1);
               BlockManager.freeDataWorkers.push(worker);
               blockId = uint(uint(message[1]));
               if(blockId > 0)
               {
                  try
                  {
                     block = BlockManager.blockArray[blockId];
                     block.bitmapData.setPixels(new Rectangle(0,0,Block.width,Block.height),byteArray);
                  }
                  catch (e)
                  {
                     BlockManager.drawQueue.push(blockId);
                  }
                  BlockManager.drawNextBlock();
               }
            }
         }
      }
  static requestBlock(param1: number): Block {
         var _loc_2= null;
         if(BlockManager.blockArray[param1] == null)
         {
            _loc_2 = BlockManager.createTemporaryBlock(param1);
            BlockManager.addToLoadQueue(param1);
         }
         else
         {
            _loc_2 = BlockManager.blockArray[param1];
            BlockManager.dispatchEvent(new BlockEvent(BlockEvent.BLOCK_AVAILABLE,_loc_2));
         }
         return _loc_2.clone();
      }
  static removeEventListener(param1: string, param2: Function, param3: boolean = false): void {
         if(BlockManager.disp == null)
         {
            return;
         }
         BlockManager.disp.removeEventListener(param1,param2,param3);
      }
  static drawNextBlock(): void {
         var worker: Worker= null;
         var messageChannel: MessageChannel= null;
         var _loc_1= NaN;
         var _loc_2= null;
         if(BlockManager.drawQueue.length > 0)
         {
            if(WorkerDomain.isSupported)
            {
               if(BlockManager.freeDataWorkers.length == 0 && BlockManager.busyDataWorkers.length > 0)
               {
                  return;
               }
               if(BlockManager.blockBeingDrawn > 0)
               {
                  return;
               }
            }
            else
            {
               if(BlockManager.blockBeingDrawn > 0)
               {
                  return;
               }
               if(BlockManager.drawStarted == 0)
               {
                  BlockManager.drawStarted = uint(realTimer());
               }
               else if(realTimer() - BlockManager.drawStarted > 66)
               {
                  BlockManager.drawStarted = uint(0);
                  BlockManager.drawTimeout = uint(setTimeout(BlockManager.drawNextBlock,0));
                  return;
               }
            }
            _loc_1 = BlockManager.drawQueue.shift();
            _loc_2 = BlockManager.blockArray[_loc_1];
            if(_loc_2 != null)
            {
               if(BlockManager.freeDataWorkers.length == 0)
               {
                  BlockManager.blockBeingDrawn = _loc_1;
                  BlockManager.drawingMap.saveString = _loc_2.vars.saveString;
               }
               else
               {
                  worker = BlockManager.freeDataWorkers.shift();
                  BlockManager.busyDataWorkers.push(worker);
                  messageChannel = $as(worker.getSharedProperty("outgoingMessageChannel"), MessageChannel);
                  messageChannel.send(["drawBlock",_loc_1,MapManager.map.flattenArt,_loc_2.vars.saveString]);
               }
            }
            else
            {
               BlockManager.drawNextBlock();
            }
         }
      }
  static bit(param1: string): BitmapData {
         return Data.stringToBitmapData(param1);
      }
  static dispatchEvent(event: Event): void {
         if(BlockManager.disp == null)
         {
            return;
         }
         BlockManager.disp.dispatchEvent(event);
      }
  static init(): void {
         BlockManager.loadingBlockImage = new LoadingBlockBitmapData(40,40);
         BlockManager.errorBlockImage = new NotFoundBlockBitmapData(40,40);
         BlockManager.drawingMap = new MapHolder();
         BlockManager.drawingMap.forceDrawBackgrounds = true;
         BlockManager.drawingMap.addEventListener("finishDrawing",BlockManager.finishDrawingBlockHandler,false,0,true);
         BlockManager.createDefaultBlocks();
      }
  static createTemporaryBlock(param1: number): Block {
         var _loc_2= new BitmapData(40,40,true,0);
         _loc_2.copyPixels(BlockManager.loadingBlockImage,_loc_2.rect,new Point(),null,null,false);
         var _loc_4= new Block(_loc_2,param1);
         BlockManager.addBlock(_loc_4,BlockManager.LOADING_BLOCK);
         return _loc_4;
      }
  static createDefaultBlocks(): void {
         var _loc_66= undefined;
         var heartBlock= undefined;
         var glassBlock= undefined;
         var metalBlock= undefined;
         var hardBlock= undefined;
         var waffleBlock= undefined;
         var upTrapBlock= undefined;
         var downTrapBlock= undefined;
         var leftTrapBlock= undefined;
         var rightTrapBlock= undefined;
         var imperviousBlock= undefined;
         var _loc_35= null;
         var _loc_36= null;
         var _loc_37= null;
         var _loc_38= null;
         var _loc_39= null;
         var _loc_40= null;
         var _loc_41= null;
         var _loc_42= null;
         var _loc_43= null;
         var _loc_44= null;
         var _loc_45= null;
         var _loc_46= null;
         var _loc_47= null;
         var _loc_48= null;
         var _loc_49= null;
         var _loc_50= null;
         var _loc_51= null;
         var _loc_52= null;
         var _loc_53= null;
         var _loc_54= null;
         var _loc_55= null;
         var _loc_56= null;
         var _loc_57= null;
         var _loc_58= null;
         var _loc_59= null;
         var _loc_60= null;
         var _loc_61= null;
         var _loc_62= null;
         var _loc_63= null;
         var _loc_64= null;
         var _loc_65= null;
         var _loc_1= new BlockSettings();
         _loc_1.title = "Start Block";
         _loc_1.comment = "Marks a poNumber where players may start the race";
         _loc_1.type = BlockSettings.START;
         var _loc_2= new BlockSettings();
         _loc_2.title = "Basic Block 1";
         _loc_2.comment = "Bland, but at least it gets the job done.";
         var _loc_3= new BlockSettings();
         _loc_3.title = "Basic Block 2";
         _loc_3.comment = "Bland, but at least it comes with peanuts.";
         var _loc_4= new BlockSettings();
         _loc_4.title = "Basic Block 3";
         _loc_4.comment = "Bland, but at least it\'s hardy.";
         var _loc_5= new BlockSettings();
         _loc_5.title = "Basic Block 4";
         _loc_5.comment = "Bland, but at least it looks like a waffle.";
         var _loc_6= new BlockSettings();
         _loc_6.title = "Brick Block";
         _loc_6.comment = "A block of poorly mortared bricks that will shatter if bumped from below.";
         _loc_6.bump.type = BlockSideSettings.SHATTER;
         var _loc_7= new BlockSettings();
         _loc_7.title = "Crumble Block";
         _loc_7.comment = "This will crumble into pieces if it is hit too hard.";
         _loc_66 = BlockSideSettings.CRUMBLE;
         _loc_7.bump.type = BlockSideSettings.CRUMBLE;
         _loc_7.right.type = _loc_66;
         _loc_7.left.type = _loc_66;
         _loc_7.bottom.type = _loc_66;
         _loc_7.top.type = _loc_66;
         var _loc_8= new BlockSettings();
         _loc_8.title = "Finish Block";
         _loc_8.comment = "Bumping this marks the end of the race.";
         _loc_8.type = BlockSettings.IMPERVIOUS;
         _loc_8.bump.type = BlockSideSettings.FINISH;
         var _loc_9= new BlockSettings();
         _loc_9.title = "Happy Block";
         _loc_9.comment = "It\'s so happy! This block will share its happiness with you by boosting your stats if bumped.";
         _loc_9.bump.type = BlockSideSettings.INC_STATS;
         var _loc_10= new BlockSettings();
         _loc_10.title = "Happy Block";
         _loc_10.comment = "It\'s so happy! This block will share its happiness with you by boosting your stats if bumped. (Design by Jacob K.)";
         _loc_10.bump.type = BlockSideSettings.INC_STATS;
         var _loc_11= new BlockSettings();
         _loc_11.title = "Ice Block";
         _loc_11.comment = "Sliperyyyyiiiee.";
         _loc_66 = BlockSideSettings.ICE;
         _loc_11.left.type = BlockSideSettings.ICE;
         _loc_11.right.type = _loc_66;
         _loc_11.bottom.type = _loc_66;
         _loc_11.top.type = _loc_66;
         var _loc_12= new BlockSettings();
         _loc_12.title = "Infinite Items Block";
         _loc_12.comment = "Items for all! Free items for all!";
         _loc_12.bump.type = BlockSideSettings.GIVE_ITEM;
         _loc_12.itemSupply = int.MAX_VALUE;
         var _loc_13= new BlockSettings();
         _loc_13.title = "Item Block";
         _loc_13.comment = "One item per customer.";
         _loc_13.bump.type = BlockSideSettings.GIVE_ITEM;
         var _loc_14= new BlockSettings();
         _loc_14.title = "Mine Block";
         _loc_14.comment = "Mines explode rather painfully if you touch them.";
         _loc_66 = BlockSideSettings.EXPLODE;
         _loc_14.bump.type = BlockSideSettings.EXPLODE;
         _loc_14.right.type = _loc_66;
         _loc_14.left.type = _loc_66;
         _loc_14.bottom.type = _loc_66;
         _loc_14.top.type = _loc_66;
         var _loc_15= new BlockSettings();
         _loc_15.title = "Move Block";
         _loc_15.comment = "Where is it going?";
         _loc_15.type = BlockSettings.MOVE;
         _loc_15.movePattern = "random";
         var _loc_16= new BlockSettings();
         _loc_16.title = "Push Block";
         _loc_16.comment = "You can push this block around. Bully.";
         _loc_66 = BlockSideSettings.BE_PUSHED;
         _loc_16.right.type = BlockSideSettings.BE_PUSHED;
         _loc_16.left.type = _loc_66;
         _loc_16.bottom.type = _loc_66;
         _loc_16.top.type = _loc_66;
         var _loc_17= new BlockSettings();
         _loc_17.title = "Rotate Left Block";
         _loc_17.comment = "The world is spinning!";
         _loc_17.bump.type = BlockSideSettings.ROTATE_LEFT;
         var _loc_18= new BlockSettings();
         _loc_18.title = "Rotate Right Block";
         _loc_18.comment = "The world is still spinning, but in the opposite direction!";
         _loc_18.bump.type = BlockSideSettings.ROTATE_RIGHT;
         var _loc_19= new BlockSettings();
         _loc_19.title = "Sad Block";
         _loc_19.comment = "I\'m so depressed.";
         _loc_19.bump.type = BlockSideSettings.DEC_STATS;
         var _loc_20= new BlockSettings();
         _loc_20.title = "Sad Block";
         _loc_20.comment = "I\'m so depressed. (Design by Jacob K.)";
         _loc_20.bump.type = BlockSideSettings.DEC_STATS;
         var _loc_21= new BlockSettings();
         _loc_21.title = "Safety Net Block";
         _loc_21.comment = "Protects from long falls by teleporting you back to your last safe location.";
         _loc_66 = BlockSideSettings.SAFETY;
         _loc_21.right.type = BlockSideSettings.SAFETY;
         _loc_21.left.type = _loc_66;
         _loc_21.bottom.type = _loc_66;
         _loc_21.top.type = _loc_66;
         var _loc_22= new BlockSettings();
         _loc_22.title = "Vanish Block";
         _loc_22.comment = "Touch it, and poof! It\'s gone. No worries, though. It\'ll come back.";
         _loc_66 = BlockSideSettings.VANISH;
         _loc_22.bump.type = BlockSideSettings.VANISH;
         _loc_22.right.type = _loc_66;
         _loc_22.left.type = _loc_66;
         _loc_22.bottom.type = _loc_66;
         _loc_22.top.type = _loc_66;
         var _loc_23= new BlockSettings();
         _loc_23.title = "Water Block";
         _loc_23.comment = "Swim!";
         _loc_23.type = BlockSettings.WATER;
         var _loc_24= new BlockSettings();
         _loc_24.title = "Red Teleport Block";
         _loc_24.comment = "Teleport to another red teleport block of the same type";
         _loc_66 = BlockSideSettings.TELEPORT;
         _loc_24.bump.type = BlockSideSettings.TELEPORT;
         _loc_24.right.type = _loc_66;
         _loc_24.left.type = _loc_66;
         _loc_24.bottom.type = _loc_66;
         _loc_24.top.type = _loc_66;
         _loc_66 = 1;
         _loc_24.right.teleportID = int(1);
         _loc_24.left.teleportID = int(_loc_66);
         _loc_24.bottom.teleportID = int(_loc_66);
         _loc_24.top.teleportID = int(_loc_66);
         var _loc_25= new BlockSettings();
         _loc_25.title = "Blue Teleport Block";
         _loc_25.comment = "Teleport to another blue teleport block of the same type";
         _loc_66 = BlockSideSettings.TELEPORT;
         _loc_25.bump.type = BlockSideSettings.TELEPORT;
         _loc_25.right.type = _loc_66;
         _loc_25.left.type = _loc_66;
         _loc_25.bottom.type = _loc_66;
         _loc_25.top.type = _loc_66;
         _loc_66 = 2;
         _loc_25.right.teleportID = int(2);
         _loc_25.left.teleportID = int(_loc_66);
         _loc_25.bottom.teleportID = int(_loc_66);
         _loc_25.top.teleportID = int(_loc_66);
         var _loc_26= new BlockSettings();
         _loc_26.title = "yellow Teleport Block";
         _loc_26.comment = "Teleport to another yellow teleport block of the same type.";
         _loc_66 = BlockSideSettings.TELEPORT;
         _loc_26.bump.type = BlockSideSettings.TELEPORT;
         _loc_26.right.type = _loc_66;
         _loc_26.left.type = _loc_66;
         _loc_26.bottom.type = _loc_66;
         _loc_26.top.type = _loc_66;
         _loc_66 = 3;
         _loc_26.right.teleportID = int(3);
         _loc_26.left.teleportID = int(_loc_66);
         _loc_26.bottom.teleportID = int(_loc_66);
         _loc_26.top.teleportID = int(_loc_66);
         var _loc_27= new BlockSettings();
         _loc_27.title = "Bounce Block";
         _loc_27.comment = "It\'s like a trampoline that doesn\'t obey the laws of physics.";
         _loc_66 = BlockSideSettings.BOUNCE;
         _loc_27.right.type = BlockSideSettings.BOUNCE;
         _loc_27.left.type = _loc_66;
         _loc_27.bottom.type = _loc_66;
         _loc_27.top.type = _loc_66;
         var _loc_28= new BlockSettings();
         _loc_28.title = "Change Block";
         _loc_28.comment = "Multiple personality disorder in block form.";
         _loc_28.type = BlockSettings.CHANGE;
         _loc_28.changePattern = new Array(1,5,6,8,9,10,11,12,15,16,17,18,19,20,21,22,23,24,26,27,28,29);
         var _loc_29= new BlockSettings();
         _loc_29.title = "Up Block";
         _loc_29.comment = "Ride it to the top of the world.";
         _loc_66 = BlockSideSettings.PUSH_UP;
         _loc_29.bump.type = BlockSideSettings.PUSH_UP;
         _loc_29.right.type = _loc_66;
         _loc_29.left.type = _loc_66;
         _loc_29.bottom.type = _loc_66;
         _loc_29.top.type = _loc_66;
         var _loc_30= new BlockSettings();
         _loc_30.title = "Down Block";
         _loc_30.comment = "You may have to super jump to escape its grasp.";
         _loc_66 = BlockSideSettings.PUSH_DOWN;
         _loc_30.bump.type = BlockSideSettings.PUSH_DOWN;
         _loc_30.right.type = _loc_66;
         _loc_30.left.type = _loc_66;
         _loc_30.bottom.type = _loc_66;
         _loc_30.top.type = _loc_66;
         var _loc_31= new BlockSettings();
         _loc_31.title = "Left Block";
         _loc_31.comment = "Travel left with super speed! (Or right very slowly.)";
         _loc_66 = BlockSideSettings.PUSH_LEFT;
         _loc_31.bump.type = BlockSideSettings.PUSH_LEFT;
         _loc_31.right.type = _loc_66;
         _loc_31.left.type = _loc_66;
         _loc_31.bottom.type = _loc_66;
         _loc_31.top.type = _loc_66;
         var _loc_32= new BlockSettings();
         _loc_32.title = "Right Block";
         _loc_32.comment = "It\'s like a conveyer belt. Except cooler.";
         _loc_66 = BlockSideSettings.PUSH_RIGHT;
         _loc_32.bump.type = BlockSideSettings.PUSH_RIGHT;
         _loc_32.right.type = _loc_66;
         _loc_32.left.type = _loc_66;
         _loc_32.bottom.type = _loc_66;
         _loc_32.top.type = _loc_66;
         var heartBlockSettings= new BlockSettings();
         heartBlockSettings.title = "Heart Block";
         heartBlockSettings.comment = "Increases health by one";
         heartBlockSettings.bump.type = BlockSideSettings.INC_HEALTH;
         var glassBlockSettings= new BlockSettings();
         glassBlockSettings.title = "Glass Block";
         glassBlockSettings.comment = "Whatever comes at me bounces right back, and whoever stands on me might just fall";
         glassBlockSettings.type = BlockSettings.WEAK;
         glassBlockSettings.top.type = BlockSideSettings.REFLECT;
         glassBlockSettings.right.type = BlockSideSettings.REFLECT;
         glassBlockSettings.left.type = BlockSideSettings.REFLECT;
         glassBlockSettings.bottom.type = BlockSideSettings.REFLECT;
         glassBlockSettings.bump.type = BlockSideSettings.REFLECT;
         var upTrapBlockSettings= new BlockSettings();
         upTrapBlockSettings.title = "Up Trap Block";
         upTrapBlockSettings.comment = "A handy platform! (Design by lp9)";
         upTrapBlockSettings.top.type = BlockSideSettings.ACTIVE;
         upTrapBlockSettings.right.type = BlockSideSettings.INACTIVE;
         upTrapBlockSettings.left.type = BlockSideSettings.INACTIVE;
         upTrapBlockSettings.bottom.type = BlockSideSettings.INACTIVE;
         upTrapBlockSettings.bump.type = BlockSideSettings.INACTIVE;
         var downTrapBlockSettings= new BlockSettings();
         downTrapBlockSettings.title = "Down Trap Block";
         downTrapBlockSettings.comment = "It\'s a trap! (Design by lp9)";
         downTrapBlockSettings.top.type = BlockSideSettings.INACTIVE;
         downTrapBlockSettings.right.type = BlockSideSettings.INACTIVE;
         downTrapBlockSettings.left.type = BlockSideSettings.INACTIVE;
         downTrapBlockSettings.bottom.type = BlockSideSettings.ACTIVE;
         downTrapBlockSettings.bump.type = BlockSideSettings.ACTIVE;
         var leftTrapBlockSettings= new BlockSettings();
         leftTrapBlockSettings.title = "Left Trap Block";
         leftTrapBlockSettings.comment = "It\'s a one-way exit. (Design by lp9)";
         leftTrapBlockSettings.top.type = BlockSideSettings.INACTIVE;
         leftTrapBlockSettings.right.type = BlockSideSettings.INACTIVE;
         leftTrapBlockSettings.left.type = BlockSideSettings.ACTIVE;
         leftTrapBlockSettings.bottom.type = BlockSideSettings.INACTIVE;
         leftTrapBlockSettings.bump.type = BlockSideSettings.INACTIVE;
         var rightTrapBlockSettings= new BlockSettings();
         rightTrapBlockSettings.title = "Right Trap Block";
         rightTrapBlockSettings.comment = "The only way is forward! (Design by lp9)";
         rightTrapBlockSettings.top.type = BlockSideSettings.INACTIVE;
         rightTrapBlockSettings.right.type = BlockSideSettings.ACTIVE;
         rightTrapBlockSettings.left.type = BlockSideSettings.INACTIVE;
         rightTrapBlockSettings.bottom.type = BlockSideSettings.INACTIVE;
         rightTrapBlockSettings.bump.type = BlockSideSettings.INACTIVE;
         var imperviousBlockSettings= new BlockSettings();
         imperviousBlockSettings.title = "Impervious Block";
         imperviousBlockSettings.comment = "Woo! I\'m invincible!";
         imperviousBlockSettings.type = BlockSettings.IMPERVIOUS;
         var _loc_33= 0;
         var _loc_34= new Array("Classic","Desert","Metal","Jungle","Space","Water");
         for (_loc_35 of $each(_loc_34))
         {
            _loc_38 = new Block(BlockManager.bit(_loc_35 + "Start"),0 + _loc_33);
            _loc_39 = new Block(BlockManager.bit(_loc_35 + "Basic"),1 + _loc_33);
            if(_loc_35 == "Classic")
            {
               metalBlock = new Block(BlockManager.bit(_loc_35 + "Metal"),2 + _loc_33);
               hardBlock = new Block(BlockManager.bit(_loc_35 + "Hard"),3 + _loc_33);
               waffleBlock = new Block(BlockManager.bit(_loc_35 + "Waffle"),4 + _loc_33);
               upTrapBlock = new Block(BlockManager.bit(_loc_35 + "UpTrap"),32 + _loc_33);
               downTrapBlock = new Block(BlockManager.bit(_loc_35 + "DownTrap"),33 + _loc_33);
               leftTrapBlock = new Block(BlockManager.bit(_loc_35 + "LeftTrap"),34 + _loc_33);
               rightTrapBlock = new Block(BlockManager.bit(_loc_35 + "RightTrap"),35 + _loc_33);
               imperviousBlock = new Block(BlockManager.bit(_loc_35 + "Impervious"),36 + _loc_33);
            }
            _loc_40 = new Block(BlockManager.bit(_loc_35 + "Brick"),5 + _loc_33);
            _loc_41 = new Block(BlockManager.bit(_loc_35 + "Crumble"),6 + _loc_33);
            _loc_42 = new Block(BlockManager.bit(_loc_35 + "Finish"),7 + _loc_33);
            _loc_43 = new Block(BlockManager.bit(_loc_35 + "Happy"),8 + _loc_33);
            _loc_44 = new Block(BlockManager.bit(_loc_35 + "Ice"),9 + _loc_33);
            _loc_45 = new Block(BlockManager.bit(_loc_35 + "InfiniteItem"),10 + _loc_33);
            _loc_46 = new Block(BlockManager.bit(_loc_35 + "Item"),11 + _loc_33);
            _loc_47 = new Block(BlockManager.bit(_loc_35 + "Mine"),12 + _loc_33);
            _loc_48 = new Block(BlockManager.bit(_loc_35 + "Move"),13 + _loc_33);
            _loc_49 = new Block(BlockManager.bit(_loc_35 + "Push"),14 + _loc_33);
            _loc_50 = new Block(BlockManager.bit(_loc_35 + "RotateLeft"),15 + _loc_33);
            _loc_51 = new Block(BlockManager.bit(_loc_35 + "RotateRight"),16 + _loc_33);
            _loc_52 = new Block(BlockManager.bit(_loc_35 + "Sad"),17 + _loc_33);
            _loc_53 = new Block(BlockManager.bit(_loc_35 + "SafetyNet"),18 + _loc_33);
            _loc_54 = new Block(BlockManager.bit(_loc_35 + "Vanish"),19 + _loc_33);
            _loc_55 = new Block(BlockManager.bit(_loc_35 + "Water"),20 + _loc_33);
            _loc_56 = new Block(BlockManager.bit(_loc_35 + "RedTeleport"),21 + _loc_33);
            _loc_57 = new Block(BlockManager.bit(_loc_35 + "BlueTeleport"),22 + _loc_33);
            _loc_58 = new Block(BlockManager.bit(_loc_35 + "YellowTeleport"),23 + _loc_33);
            _loc_59 = new Block(BlockManager.bit(_loc_35 + "Bounce"),24 + _loc_33);
            _loc_60 = new Block(BlockManager.bit(_loc_35 + "Change"),25 + _loc_33);
            _loc_61 = new Block(BlockManager.bit(_loc_35 + "Up"),26 + _loc_33);
            _loc_62 = new Block(BlockManager.bit(_loc_35 + "Down"),27 + _loc_33);
            _loc_63 = new Block(BlockManager.bit(_loc_35 + "Left"),28 + _loc_33);
            _loc_64 = new Block(BlockManager.bit(_loc_35 + "Right"),29 + _loc_33);
            heartBlock = new Block(BlockManager.bit(_loc_35 + "Heart"),30 + _loc_33);
            glassBlock = new Block(BlockManager.bit(_loc_35 + "Glass"),31 + _loc_33);
            BlockManager.addBlock(_loc_38,_loc_1);
            BlockManager.addBlock(_loc_39,_loc_2);
            BlockManager.addBlock(_loc_40,_loc_6);
            BlockManager.addBlock(_loc_41,_loc_7);
            BlockManager.addBlock(_loc_42,_loc_8);
            if(_loc_33 == 0)
            {
               BlockManager.addBlock(_loc_43,_loc_10);
               BlockManager.addBlock(_loc_52,_loc_20);
               BlockManager.addBlock(metalBlock,_loc_3);
               BlockManager.addBlock(hardBlock,_loc_4);
               BlockManager.addBlock(waffleBlock,_loc_5);
            }
            else
            {
               BlockManager.addBlock(_loc_43,_loc_9);
               BlockManager.addBlock(_loc_52,_loc_19);
            }
            BlockManager.addBlock(_loc_44,_loc_11);
            BlockManager.addBlock(_loc_45,_loc_12);
            BlockManager.addBlock(_loc_46,_loc_13);
            BlockManager.addBlock(_loc_47,_loc_14);
            BlockManager.addBlock(_loc_48,_loc_15);
            BlockManager.addBlock(_loc_49,_loc_16);
            BlockManager.addBlock(_loc_50,_loc_17);
            BlockManager.addBlock(_loc_51,_loc_18);
            BlockManager.addBlock(_loc_53,_loc_21);
            BlockManager.addBlock(_loc_54,_loc_22);
            BlockManager.addBlock(_loc_55,_loc_23);
            BlockManager.addBlock(_loc_56,_loc_24);
            BlockManager.addBlock(_loc_57,_loc_25);
            BlockManager.addBlock(_loc_58,_loc_26);
            BlockManager.addBlock(_loc_59,_loc_27);
            BlockManager.addBlock(_loc_60,_loc_28);
            BlockManager.addBlock(_loc_61,_loc_29);
            BlockManager.addBlock(_loc_62,_loc_30);
            BlockManager.addBlock(_loc_63,_loc_31);
            BlockManager.addBlock(_loc_64,_loc_32);
            BlockManager.addBlock(heartBlock,heartBlockSettings);
            BlockManager.addBlock(glassBlock,glassBlockSettings);
            BlockManager.addBlock(upTrapBlock,upTrapBlockSettings);
            BlockManager.addBlock(downTrapBlock,downTrapBlockSettings);
            BlockManager.addBlock(leftTrapBlock,leftTrapBlockSettings);
            BlockManager.addBlock(rightTrapBlock,rightTrapBlockSettings);
            BlockManager.addBlock(imperviousBlock,imperviousBlockSettings);
            _loc_33 += 100;
            _loc_65 = _loc_35.toLowerCase();
            BlockManager.blockArrays[_loc_65] = new Array(_loc_38,_loc_39,_loc_40,_loc_41,_loc_42,_loc_44,_loc_45,_loc_46,_loc_47,_loc_48,_loc_49,_loc_50,_loc_51,_loc_43,_loc_52,_loc_53,_loc_54,_loc_55,_loc_56,_loc_57,_loc_58,_loc_59,_loc_60,_loc_61,_loc_62,_loc_63,_loc_64);
         }
         _loc_36 = new Block(BlockManager.bit("PortableBlockBitmap"),1 + _loc_33);
         _loc_37 = new Block(BlockManager.bit("PortableMineBitmap"),2 + _loc_33);
         BlockManager.addBlock(_loc_36,_loc_7);
         BlockManager.addBlock(_loc_37,_loc_14);
      }
  static addBlock(param1: Block, param2: BlockSettings): void {
         BlockManager.blockArray[param1.id] = param1;
         BlockManager.blockVarArray[param1.id] = param2;
      }
  static loadNextBlock(): void {
         var _loc_1= null;
         var _loc_2= false;
         if(BlockManager.loadQueue.length > 0)
         {
            BlockManager.blockBeingLoaded = BlockManager.loadQueue.shift();
            _loc_1 = ({} as any);
            _loc_1.p_block_id = BlockManager.blockBeingLoaded;
            _loc_2 = false;
            Sparkworkz.DataAccess("GetBlock2",_loc_1,BlockManager.loadBlockCallback,_loc_2);
         }
         else
         {
            BlockManager.dispatchEvent(new Event("loadedAllBlocks"));
         }
      }
  static addEventListener(param1: string, param2: Function, param3: boolean = false, param4: number = 0, param5: boolean = false): void {
         if(BlockManager.disp == null)
         {
            BlockManager.disp = new EventDispatcher();
         }
         BlockManager.disp.addEventListener(param1,param2,param3,param4,param5);
      }
  static addToDrawQueue(param1: number): void {
         if(BlockManager.drawQueue.indexOf(param1) == -1)
         {
            BlockManager.drawQueue.push(param1);
         }
         BlockManager.drawNextBlock();
      }
  static processLoadedBlockData(param1: number, param2: any): void {
         var _loc_3= BlockManager.blockArray[param1];
         if(_loc_3 == null)
         {
            _loc_3 = BlockManager.createTemporaryBlock(param1);
         }
         var _loc_4= new BlockSettings();
         _loc_4.title = param2.title;
         _loc_4.comment = param2.comment;
         _loc_4.saveString = param2.image_data;
         _loc_4.category = param2.category;
         _loc_4.decompressSettings(param2.settings);
         BlockManager.addBlock(_loc_3,_loc_4);
         BlockManager.dispatchEvent(new BlockEvent(BlockEvent.BLOCK_AVAILABLE,_loc_3));
         BlockManager.addToDrawQueue(_loc_3.id);
      }
  static finishDrawingBlockHandler(event: Event): void {
         var _loc_2= null;
         var _loc_3= null;
         if(BlockManager.blockBeingDrawn != 0)
         {
            _loc_2 = BlockManager.blockArray[BlockManager.blockBeingDrawn];
            _loc_3 = new Matrix();
            _loc_3.createBox(1,1,0,-(700 / 2 - Block.width / 2),-(480 / 2 - Block.height / 2));
            _loc_2.bitmapData.fillRect(_loc_2.bitmapData.rect,0);
            _loc_2.bitmapData.drawWithQuality(BlockManager.drawingMap,_loc_3,null,null,null,false,StageQuality.HIGH);
            BlockManager.drawingMap.reset();
            BlockManager.blockBeingDrawn = 0;
            BlockManager.drawNextBlock();
         }
      }
  static addToLoadQueue(param1: number): void {
         if(BlockManager.loadQueue.indexOf(param1) == -1)
         {
            if(BlockManager.multiLoadArray.indexOf(param1) == -1)
            {
               BlockManager.loadQueue.push(param1);
            }
         }
         if(BlockManager.blockBeingLoaded == 0)
         {
            BlockManager.loadNextBlock();
         }
      }
  static getBlockVars(param1: number): BlockSettings {
         return BlockManager.blockVarArray[param1];
      }
  static loadBlockCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         if(param2 != "" || Number(param1.NumRows) <= 0)
         {
            if(param2 != "")
            {
            }
            _loc_3 = BlockManager.blockArray[BlockManager.blockBeingLoaded];
            _loc_4 = new BlockSettings();
            _loc_3.bitmapData.copyPixels(BlockManager.errorBlockImage,_loc_3.bitmapData.rect,new Point(),null,null,false);
            BlockManager.addBlock(_loc_3,_loc_4);
            BlockManager.dispatchEvent(new BlockEvent(BlockEvent.BLOCK_AVAILABLE,_loc_3));
         }
         else
         {
            _loc_5 = param1.Row;
            BlockManager.processLoadedBlockData(_loc_5.block_id,_loc_5);
         }
         BlockManager.blockBeingLoaded = 0;
         BlockManager.loadNextBlock();
      }
  static clearCache(): void {
         var _loc_1= null;
         for (_loc_1 of $each(BlockManager.blockArray))
         {
            if(_loc_1 != null)
            {
               if(_loc_1.bitmapData != null)
               {
                  _loc_1.bitmapData.dispose();
               }
               _loc_1.remove();
            }
         }
         BlockManager.blockArray = new Array();
         BlockManager.blockVarArray = new Array();
         BlockManager.createDefaultBlocks();
      }
  static loadManyBlocksCallback(param1: any, param2: string): void {
         var blockId: number = uint(0);
         var block: Block= null;
         var _loc_3= null;
         var _loc_4= NaN;
         var _loc_5= NaN;
         if(param2 != "")
         {
            for (blockId of $each(BlockManager.multiLoadArray))
            {
               block = BlockManager.blockArray[blockId];
               if(block == null)
               {
                  block = BlockManager.createTemporaryBlock(blockId);
               }
               block.bitmapData.copyPixels(BlockManager.errorBlockImage,block.bitmapData.rect,new Point(),null,null,false);
               BlockManager.addBlock(block,new BlockSettings());
               BlockManager.dispatchEvent(new BlockEvent(BlockEvent.BLOCK_AVAILABLE,block));
            }
         }
         else
         {
            _loc_4 = param1.NumRows;
            _loc_5 = 0;
            while(_loc_5 < _loc_4)
            {
               _loc_3 = param1.Row[_loc_5];
               BlockManager.processLoadedBlockData(_loc_3.block_id,_loc_3);
               _loc_5 += 1;
            }
         }
         BlockManager.multiLoadArray = new Array();
         BlockManager.dispatchEvent(new Event("multiLoadComplete"));
      }
  static getBlock(param1: number): Block {
         var _loc_2= BlockManager.blockArray[param1];
         return _loc_2.clone();
      }
  static requestManyBlocks(param1: any[]): void {
         var _loc_3= NaN;
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= false;
         param1 = param1.concat();
         var _loc_2= new Array();
         for (_loc_3 of $each(param1))
         {
            if(BlockManager.blockArray[_loc_3] == null && BlockManager.multiLoadArray[_loc_3] == null)
            {
               _loc_2.push(_loc_3);
            }
            else
            {
               _loc_4 = BlockManager.blockArray[_loc_3];
               if(_loc_4.vars.temporary == false)
               {
                  BlockManager.dispatchEvent(new BlockEvent(BlockEvent.BLOCK_AVAILABLE,_loc_4));
               }
            }
         }
         if(_loc_2.length > 0)
         {
            BlockManager.multiLoadArray = _loc_2;
            _loc_5 = ({} as any);
            _loc_5.p_block_array = _loc_2.join(",");
            _loc_6 = false;
            Sparkworkz.DataAccess("GetManyBlocks",_loc_5,BlockManager.loadManyBlocksCallback,_loc_6);
         }
         else
         {
            BlockManager.dispatchEvent(new Event("multiLoadComplete"));
         }
      }
  static __init() {
    BlockManager.LOADING_BLOCK = new BlockSettings();
    BlockManager.LOADING_BLOCK.temporary = true;
    BlockManager.LOADING_BLOCK.type = BlockSettings.IMPERVIOUS;
  }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.block.BlockManager', BlockManager);
