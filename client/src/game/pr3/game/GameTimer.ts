// Ported from com/jiggmin/pr3/game/GameTimer.as
import { Event, clearInterval, getTimer, setInterval } from '../../../flash/index.ts';
import { int, uint, $b } from '../../../flash/as3.ts';
import { Removable } from '../../basic/Removable.ts';
import { Data, GamePage, SocketManager, TimerGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GameTimer extends Removable {
  mode: string = "countdown";
  declare m: any;
  timerStarted: boolean = false;
  timerSpeed: number = 1000;
  time: number = 120;
  startTime: number = NaN;
  secondInterval: number = 0;
  currentDisplayTime: number = 0;
  timerSpeedAmount: number = 0;
  lastTimerTimer: number = 0;
  getElapsedTime(): number {
         return this.getElapsedMS() / 1000;
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         clearInterval(this.secondInterval);
         super.remove();
      }
  pause(): void {
         this.displayTime();
         clearInterval(this.secondInterval);
         if(this.timerStarted)
         {
            this.timerStarted = false;
         }
      }
  displayTime(): void {
         var elapsedTime: number = int(0);
         if(this.timerStarted)
         {
            elapsedTime = int(this.getElapsedTime());
            if(this.mode == "countdown")
            {
               this.currentDisplayTime = int(this.time - elapsedTime);
            }
            else if(this.mode == "stopwatch")
            {
               this.currentDisplayTime = int(elapsedTime);
            }
         }
         var timeToDisplay= Data.formatSeconds(Math.floor(this.currentDisplayTime));
         if(GamePage.instance.levelType == "kingOfTheHat" && SocketManager.socket != null)
         {
            SocketManager.socket.kothTime(timeToDisplay);
         }
         this.m.holder.timeBox.text = timeToDisplay;
         this.m.holder2.timeBox.text = timeToDisplay;
      }
  go(event: Event): void {
         var _loc_2= undefined;
         _loc_2 = this.m.holder.scaleX * 0.9;
         this.m.holder.scaleY = this.m.holder.scaleX * 0.9;
         this.m.holder.scaleX = _loc_2;
         if(this.m.holder.scaleX <= 1)
         {
            _loc_2 = 1;
            this.m.holder.scaleY = 1;
            this.m.holder.scaleX = _loc_2;
            this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         }
      }
  getTime(): number {
         return this.time;
      }
  startAnim(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'go'));
         this.m.holder.scaleY = 3;
         this.m.holder.scaleX = 3;
      }
  getElapsedMS(): number {
         var now: number= Number(getTimer());
         var elapsedTime: number= now - this.lastTimerTimer;
         if(this.timerSpeed != 1000)
         {
            this.timerSpeedAmount += elapsedTime - elapsedTime * this.timerSpeed / 1000;
         }
         return (this.lastTimerTimer = now) - this.startTime + this.timerSpeedAmount;
      }
  setTime(param1: number): void {
         clearInterval(this.secondInterval);
         this.time = int(param1);
         this.currentDisplayTime = int(param1);
         this.displayTime();
      }
  resume(): void {
         clearInterval(this.secondInterval);
         this.secondInterval = uint(setInterval($b(this, 'tick'),1000));
         this.timerStarted = true;
         this.startTime = this.lastTimerTimer = getTimer();
         this.tick();
         if(this.mode == "stopwatch")
         {
            this.m.holder.timeBox.textColor = 466539;
         }
      }
  tick(): void {
         var timeToPass: number= NaN;
         var i= undefined;
         var _loc_1= NaN;
         var _loc_2= NaN;
         this.displayTime();
         if(this.mode == "countdown")
         {
            _loc_1 = this.getElapsedTime();
            _loc_2 = Math.floor(this.time - _loc_1);
            this.m.holder.timeBox.textColor = _loc_2 <= 30 ? 16711680 : 466539;
            if(_loc_2 < 10)
            {
               this.startAnim();
            }
            if(_loc_2 <= 0)
            {
               if(GamePage.instance.levelType == "coinFiend" || GamePage.instance.levelType == "kingOfTheHat" || GamePage.instance.levelType == "damageDash")
               {
                  if(SocketManager.socket != null)
                  {
                     if(GamePage.instance.localPlayer != null)
                     {
                        for(i = 0; i < GamePage.instance.localPlayer.hatArray.length; i++)
                        {
                           GamePage.instance.localLoseHat(GamePage.instance.localPlayer,15);
                        }
                     }
                     timeToPass = this.getElapsedMS();
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
               }
               else
               {
                  GamePage.instance.endGame();
               }
               this.pause();
            }
         }
      }
  getCurrentDisplayTime(): number {
         return this.currentDisplayTime;
      }
  constructor() {
         super();
         this.addChild(this.m = new TimerGraphic());
      }
}
$reg('com.jiggmin.pr3.game.GameTimer', GameTimer);
