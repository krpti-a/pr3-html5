// Ported from com/jiggmin/sound/Mute.as
import { Capabilities, SoundMixer, SoundTransform } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class Mute {
  static baseVolume: number = 1;
  static muted: boolean = Capabilities.isDebugger;
  static doMute(keepOldValue: boolean = false): void {
         if(keepOldValue)
         {
            Mute.muted = !Mute.muted;
         }
         if(Mute.muted)
         {
            Mute.unmuteSound();
         }
         else
         {
            Mute.muteSound();
         }
      }
  static unmuteSound(): void {
         Mute.muted = false;
         SoundMixer.soundTransform = new SoundTransform(Mute.baseVolume,0);
      }
  static muteSound(): void {
         Mute.muted = true;
         SoundMixer.soundTransform = new SoundTransform(0,0);
      }
  static getMuted(): boolean {
         return Mute.muted;
      }
  static setBaseVolume(volume: number = 1): void {
         Mute.baseVolume = volume;
         if(!Mute.muted)
         {
            Mute.unmuteSound();
         }
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.sound.Mute', Mute);
