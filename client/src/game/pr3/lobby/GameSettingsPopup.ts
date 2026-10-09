// Ported from com/jiggmin/pr3/lobby/GameSettingsPopup.as
import { Event } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { DropdownEvent, EasyDropdown, EasySlider, EditorPopupBGGraphic, GameSettingsPopupGraphic, MenuMusic, Settings } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class GameSettingsPopup extends ButtonPopup {
  declare m: any;
  selectBackgroundHandler(event: DropdownEvent): void {
         Settings.drawBackgrounds = Boolean(event.data);
      }
  selectMusicHandler(event: Event): void {
         var volume: number= Number(this.m.musicSlider.value);
         Settings.musicOn = volume;
         this.m.musicVolumeText.text = int(Settings.musicOn) + "%";
         MenuMusic.setVolume(volume / 50 * 0.25);
      }
  clickOK(): void {
         this.remove();
      }
  selectSoundHandler(event: Event): void {
         Settings.soundOn = Number(this.m.soundSlider.value);
         this.m.soundVolumeText.text = int(Settings.soundOn) + "%";
      }
  remove(): void {
         this.m.musicSlider.removeEventListener(Event.CHANGE,$b(this, 'selectMusicHandler'));
         this.m.soundSlider.removeEventListener(Event.CHANGE,$b(this, 'selectSoundHandler'));
         this.m.backgroundDropdown.removeEventListener(Event.SELECT,$b(this, 'selectBackgroundHandler'));
         this.m = null;
         super.remove();
      }
  createNumberSlider(param1: EasySlider, param2: number = 50): void {
         param1.minimum = 0;
         param1.maximum = 100;
         param1.value = param2;
      }
  createBooleanDropdown(param1: EasyDropdown, param2: boolean = true): void {
         param1.addOption("On",true);
         param1.addOption("Off",false);
         param1.selectOptionData(param2);
      }
  constructor() {
         super();
         this.setBG(new EditorPopupBGGraphic());
         this.padding = int(20);
         this.m = new GameSettingsPopupGraphic();
         this.addGraphic(this.m);
         this.createNumberSlider(this.m.musicSlider,Settings.musicOn);
         this.createNumberSlider(this.m.soundSlider,Settings.soundOn);
         this.createBooleanDropdown(this.m.backgroundDropdown,Settings.drawBackgrounds);
         this.m.musicSlider.addEventListener(Event.CHANGE,$b(this, 'selectMusicHandler'),false,0,true);
         this.m.soundSlider.addEventListener(Event.CHANGE,$b(this, 'selectSoundHandler'),false,0,true);
         this.m.backgroundDropdown.addEventListener(Event.SELECT,$b(this, 'selectBackgroundHandler'),false,0,true);
         this.m.musicVolumeText.text = int(Settings.musicOn) + "%";
         this.m.soundVolumeText.text = int(Settings.soundOn) + "%";
         this.createButton($b(this, 'clickOK'),"OK");
      }
}
$reg('com.jiggmin.pr3.lobby.GameSettingsPopup', GameSettingsPopup);
