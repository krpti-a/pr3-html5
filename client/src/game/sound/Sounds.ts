// Ported from com/jiggmin/sound/Sounds.as
import { DisplayObject, Event, Point, Sound, SoundChannel, SoundTransform, Sprite, setInterval } from '../../flash/index.ts';
import { Maths, Settings } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Sounds extends Sprite {
  static moveSoundInterval: number = 0;
  static movingArray: any[] = new Array();
  static calcSoundFromSource(param1: DisplayObject): any {
         var _loc_2= new Point(0,0);
         _loc_2 = param1.localToGlobal(_loc_2);
         var _loc_3= 1000;
         var _loc_4= _loc_2.x - Settings.gameWidth / 2;
         var _loc_5= _loc_2.y - Settings.gameHeight / 2;
         var _loc_6= Maths.pythag(_loc_4,_loc_5);
         if(Maths.pythag(_loc_4,_loc_5) > _loc_3)
         {
            _loc_6 = _loc_3;
         }
         var _loc_7= (_loc_3 - _loc_6) / _loc_3;
         var _loc_8= _loc_4 / _loc_3;
         _loc_8 = Maths.limit(_loc_8,-_loc_3,_loc_3);
         return {
            "volumeMod":_loc_7,
            "pan":_loc_8
         };
      }
  static startSound(param1: Sound, param2: number = 1, param3: number = 0, param4: number = 0, param5: boolean = false): SoundChannel {
         var _loc_6= null;
         var _loc_7= null;
         if((param2 >= 0.1 || param5) && Settings.soundOn > 0)
         {
            _loc_6 = new SoundTransform();
            _loc_6.volume = param2 * (Settings.soundOn / 100);
            _loc_6.pan = param3;
            return param1.play(0,param4,_loc_6);
         }
         return null;
      }
  static startMovingSound(param1: Sound, param2: DisplayObject, param3: number = 1, param4: number = 999): SoundChannel {
         var _loc_6= null;
         var _loc_5= Sounds.startGameSound(param1,param2,param3,param4,true);
         if(_loc_5 != null)
         {
            _loc_5.addEventListener(Event.SOUND_COMPLETE,Sounds.movingSoundCompleteHandler,false,0,true);
            _loc_6 = ({} as any);
            _loc_6.soundChannel = _loc_5;
            _loc_6.volume = param3 * (Settings.soundOn / 100);
            _loc_6.soundSource = param2;
            Sounds.movingArray.push(_loc_6);
         }
         return _loc_5;
      }
  static init(): void {
         Sounds.moveSoundInterval = setInterval(Sounds.moveSounds,100);
      }
  static moveSounds(): void {
         var _loc_3= null;
         var _loc_4= NaN;
         var _loc_5= null;
         var _loc_6= null;
         var _loc_7= null;
         var _loc_8= null;
         var _loc_1= Sounds.movingArray.length;
         var _loc_2= 0;
         while(_loc_2 < _loc_1)
         {
            _loc_3 = Sounds.movingArray[_loc_2];
            _loc_4 = _loc_3.volume;
            _loc_5 = _loc_3.soundChannel;
            _loc_6 = _loc_3.soundSource;
            if(_loc_5 == null || _loc_6.parent == null)
            {
               Sounds.movingArray.splice(_loc_2,1);
               _loc_1--;
            }
            else
            {
               _loc_7 = Sounds.calcSoundFromSource(_loc_6);
               _loc_8 = new SoundTransform(_loc_4 * _loc_7.volumeMod,_loc_7.pan);
               _loc_5.soundTransform = _loc_8;
            }
            _loc_2++;
         }
      }
  static movingSoundCompleteHandler(event: Event): void {
         var _loc_2= (event.target);
         Sounds.stopMovingSound(_loc_2);
      }
  static startGameSound(param1: Sound, param2: DisplayObject, param3: number = 1, param4: number = 0, param5: boolean = false): SoundChannel {
         var _loc_6= Sounds.calcSoundFromSource(param2);
         return Sounds.startSound(param1,param3 * _loc_6.volumeMod,_loc_6.pan,param4,param5);
      }
  static stopMovingSound(param1: SoundChannel): void {
         var _loc_2= 0;
         var _loc_3= 0;
         var _loc_4= null;
         if(param1 != null)
         {
            param1.removeEventListener(Event.SOUND_COMPLETE,Sounds.movingSoundCompleteHandler);
            _loc_2 = Sounds.movingArray.length;
            _loc_3 = 0;
            while(_loc_3 < _loc_2)
            {
               _loc_4 = Sounds.movingArray[_loc_3];
               if(param1 == _loc_4.soundChannel)
               {
                  param1.stop();
                  _loc_4.volume = null;
                  _loc_4.soundSource = null;
                  _loc_4.soundChannel = null;
                  Sounds.movingArray.splice(_loc_3,1);
                  break;
               }
               _loc_3++;
            }
         }
      }
  constructor() {
         super();
      }
}
$reg('com.jiggmin.sound.Sounds', Sounds);
