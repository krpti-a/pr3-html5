// Ported from com/jiggmin/sound/MenuMusic.as
import { IOErrorEvent, Sound, SoundChannel, SoundLoaderContext, SoundTransform, URLRequest, clearInterval, setInterval } from '../../flash/index.ts';
import { Settings, Sounds } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MenuMusic {
  declare static channel: SoundChannel;
  static glideAmmount: number = NaN;
  static glideInterval: number = 0;
  static targetVolume: number = NaN;
  declare static song: Sound;
  static volume: number = NaN;
  static playing: boolean = false;
  static glideFreq: number = 100;
  static stop(): void {
         if(MenuMusic.channel != null)
         {
            MenuMusic.channel.stop();
            MenuMusic.channel = null;
            MenuMusic.playing = false;
         }
      }
  static glide(): void {
         MenuMusic.volume += MenuMusic.glideAmmount;
         MenuMusic.channel.soundTransform = new SoundTransform(MenuMusic.volume);
         if(MenuMusic.glideAmmount > 0 && MenuMusic.volume >= MenuMusic.targetVolume)
         {
            MenuMusic.finishGlide();
         }
         else if(MenuMusic.glideAmmount < 0 && MenuMusic.volume <= MenuMusic.targetVolume)
         {
            MenuMusic.finishGlide();
         }
      }
  static start(): void {
         var sound: Sound= null;
         var url: string= null;
         var musicFile: string= null;
         if(MenuMusic.channel == null)
         {
            sound = new Sound();
            sound.addEventListener(IOErrorEvent.IO_ERROR,function (event: IOErrorEvent): any {
            },false,0,true);
            url = Settings.getDomain() + "/music/";
            musicFile = "Mainframe Domain - 250444.mp3";
            sound.load(new URLRequest(url + musicFile),new SoundLoaderContext(3000,false));
            MenuMusic.channel = Sounds.startSound(sound,0.1,0,999);
            MenuMusic.playing = true;
         }
      }
  static glideToVolume(param1: number, param2: number = 2): void {
         var _loc_3= NaN;
         var _loc_4= NaN;
         var _loc_5= NaN;
         if(MenuMusic.channel == null && param1 > 0)
         {
            MenuMusic.start();
            MenuMusic.setVolume(0);
         }
         if(MenuMusic.channel != null)
         {
            _loc_3 = param2 * 1000;
            _loc_4 = param1 - MenuMusic.volume;
            _loc_5 = _loc_3 / MenuMusic.glideFreq;
            MenuMusic.glideAmmount = _loc_4 / _loc_5;
            MenuMusic.targetVolume = param1;
            clearInterval(MenuMusic.glideInterval);
            MenuMusic.glideInterval = setInterval(MenuMusic.glide,MenuMusic.glideFreq);
         }
      }
  static isPlaying(): boolean {
         return MenuMusic.playing;
      }
  static finishGlide(): void {
         MenuMusic.volume = MenuMusic.targetVolume;
         MenuMusic.channel.soundTransform = new SoundTransform(MenuMusic.volume);
         clearInterval(MenuMusic.glideInterval);
         if(MenuMusic.volume == 0)
         {
            MenuMusic.stop();
         }
      }
  static setVolume(param1: number): void {
         if(MenuMusic.channel != null)
         {
            MenuMusic.volume = param1;
            MenuMusic.targetVolume = param1;
            clearInterval(MenuMusic.glideInterval);
            MenuMusic.channel.soundTransform = new SoundTransform(MenuMusic.volume);
         }
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.sound.MenuMusic', MenuMusic);
