// Ported from com/jiggmin/pr3/MusicDropdown.as
import { Event, IOErrorEvent, Sound, SoundChannel, SoundLoaderContext, SoundTransform, URLRequest } from '../../flash/index.ts';
import { int, $each, $b } from '../../flash/as3.ts';
import { EasyDropdown } from '../symbols/EasyDropdown.ts';
import { DropdownEvent, DropdownOption, Settings } from '../refs.ts';
import { $reg } from '../refs.ts';

export class MusicDropdown extends EasyDropdown {
  declare sound: Sound;
  declare soundChannel: SoundChannel;
  declare url: string;
  soundCompleteHandler(event: Event): void {
         this.startMusic();
      }
  startMusic(): void {
         var musicFile: string= null;
         var randomSongIndex: number = int(0);
         this.stopMusic();
         if(Settings.musicOn > 0)
         {
            musicFile = this.selectedOption.data.file;
            if(this.selectedOption.data.id == "random")
            {
               randomSongIndex = int(Math.floor(Math.random() * (this.optionArray.length - 8)) + 2);
               musicFile = this.optionArray[randomSongIndex].data.file;
            }
            this.sound = new Sound();
            this.sound.addEventListener(IOErrorEvent.IO_ERROR,$b(this, 'ioErrorHandler'),false,0,true);
            this.sound.load(new URLRequest(this.url + musicFile),new SoundLoaderContext(3000,false));
            this.soundChannel = this.sound.play();
            if(this.soundChannel != null)
            {
               this.soundChannel.addEventListener(Event.SOUND_COMPLETE,$b(this, 'soundCompleteHandler'),false,0,true);
               this.soundChannel.soundTransform = new SoundTransform(Settings.musicOn / 50 * 0.75);
            }
         }
      }
  remove(): void {
         this.removeEventListener(DropdownEvent.SELECT,$b(this, 'selectHandler'));
         this.stopMusic();
         super.remove();
      }
  getSongID(): string {
         return this.selectedOption.data.id;
      }
  ioErrorHandler(event: IOErrorEvent): void {
      }
  stopMusic(): void {
         if(this.sound != null)
         {
            this.sound.removeEventListener(IOErrorEvent.IO_ERROR,$b(this, 'ioErrorHandler'));
            this.sound = null;
         }
         if(this.soundChannel != null)
         {
            this.soundChannel.removeEventListener(Event.SOUND_COMPLETE,$b(this, 'soundCompleteHandler'));
            this.soundChannel.stop();
            this.soundChannel = null;
         }
      }
  selectHandler(event: DropdownEvent): void {
         if(this.selectedOption.data.id != "0")
         {
            this.startMusic();
         }
         else
         {
            this.stopMusic();
         }
      }
  setSongID(songId: string): void {
         var option: DropdownOption= null;
         if(songId == "" || songId == null)
         {
            songId = "random";
         }
         for (option of $each(this.optionArray))
         {
            if(option.data.id == songId)
            {
               this.selectOption(option);
               break;
            }
         }
         if(this.selectedOption == null)
         {
            this.setSongID("random");
         }
         else if(songId != "0")
         {
            this.startMusic();
         }
      }
  constructor() {
         super();
         this.url = Settings.getDomain() + "/music/";
         this.addOption("None",{
            "id":"0",
            "file":""
         });
         this.addOption("Random",{
            "id":"random",
            "file":""
         });
         this.addOption("Ambrient",{
            "id":"1",
            "file":"Ambrient - 166585.mp3"
         });
         this.addOption("Audio Meltdown",{
            "id":"2",
            "file":"Audio Meltdown - 228041.mp3"
         });
         this.addOption("Chrome Tech",{
            "id":"3",
            "file":"Chrome Tech - 233855.mp3"
         });
         this.addOption("Conquering The Summit",{
            "id":"4",
            "file":"Conquering The Summit - 274888.mp3"
         });
         this.addOption("Corrupt Contagion",{
            "id":"5",
            "file":"Corrupt Contagion - 279709.mp3"
         });
         this.addOption("Dark Faction",{
            "id":"6",
            "file":"Dark Faction - 242335.mp3"
         });
         this.addOption("Dark Samhain",{
            "id":"7",
            "file":"Dark Samhain - 284774.mp3"
         });
         this.addOption("Entering The Demon",{
            "id":"8",
            "file":"Entering The Demon - 273325.mp3"
         });
         this.addOption("Exploration Dive",{
            "id":"9",
            "file":"Exploration Dive - 246731.mp3"
         });
         this.addOption("Faulty Apparatus",{
            "id":"10",
            "file":"Faulty Apparatus - 230714.mp3"
         });
         this.addOption("Flying Underground",{
            "id":"11",
            "file":"Flying Underground - 277279.mp3"
         });
         this.addOption("Futher Than Distance",{
            "id":"12",
            "file":"Futher Than Distance - 284373.mp3"
         });
         this.addOption("Gothic Empress",{
            "id":"13",
            "file":"Gothic Empress - 270779.mp3"
         });
         this.addOption("Mainframe Domain",{
            "id":"14",
            "file":"Mainframe Domain - 250444.mp3"
         });
         this.addOption("Mercury Drop",{
            "id":"15",
            "file":"Mercury Drop - 232963.mp3"
         });
         this.addOption("Overlooked Memories",{
            "id":"16",
            "file":"Overlooked Memories - 270172.mp3"
         });
         this.addOption("Recycled Thoughts",{
            "id":"17",
            "file":"Recycled Thoughts - 226887.mp3"
         });
         this.addOption("Red Transparency",{
            "id":"18",
            "file":"Red Transparency - 229701.mp3"
         });
         this.addOption("Resistance Faction",{
            "id":"19",
            "file":"Resistance Faction - 234779.mp3"
         });
         this.addOption("Rough Edges",{
            "id":"20",
            "file":"Rough Edges - 268926.mp3"
         });
         this.addOption("Sky Shift (Remix)",{
            "id":"21",
            "file":"Sky Shift (Remix) - 228947.mp3"
         });
         this.addOption("Stylization",{
            "id":"22",
            "file":"Stylization - 248478.mp3"
         });
         this.addOption("Tell it how it is",{
            "id":"23",
            "file":"Tell it how it is - 235164.mp3"
         });
         this.addOption("Turning Base",{
            "id":"24",
            "file":"Turning Base - 267806.mp3"
         });
         this.addOption("Wave of Thoughts",{
            "id":"25",
            "file":"Wave of Thoughts - 273625.mp3"
         });
         this.addOption("Welcome to Metropolis",{
            "id":"26",
            "file":"Welcome to Metropolis - 276864.mp3"
         });
         this.addOption("Holiday for Mr Anderson",{
            "id":"27",
            "file":"Holiday for Mr Anderson.mp3"
         });
         this.addOption("Thanksgiving",{
            "id":"28",
            "file":"Thanksgiving.mp3"
         });
         this.addOption("Prismatic",{
            "id":"29",
            "file":"Lunanova - Prismatic.mp3"
         });
         this.addOption("Blizzard!",{
            "id":"30",
            "file":"Lunanova - Blizzard!.mp3"
         });
         this.addOption("Extracted Realms",{
            "id":"31",
            "file":"Extracted Realms - 246457.mp3"
         });
         this.addOption("Creeps in the Shadows",{
            "id":"32",
            "file":"Creeps in the Shadows - 235531.mp3"
         });
         this.addEventListener(DropdownEvent.SELECT,$b(this, 'selectHandler'),false,0,true);
      }
}
$reg('com.jiggmin.pr3.MusicDropdown', MusicDropdown);
