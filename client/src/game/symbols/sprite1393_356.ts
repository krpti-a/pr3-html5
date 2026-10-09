// Ported from PlatformRacing3Client_fla/sprite1393_356.as
import { MovieClip, SimpleButton, TextField } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { EasyButton, EasyDropdown, EasyInput } from '../refs.ts';
import { $reg } from '../refs.ts';

export class sprite1393_356 extends MovieClip {
  static __sym = 'PlatformRacing3Client_fla.sprite1393_356';
  declare backBtn: SimpleButton;
  declare emailField: EasyInput;
  declare gotoEditorButton: EasyButton;
  declare joinServerButton: MovieClip;
  declare logoffButton: EasyButton;
  declare nameBox: TextField;
  declare passwordField: EasyInput;
  declare playAsGuestBtn: SimpleButton;
  declare registerBtn: SimpleButton;
  declare retypePasswordField: EasyInput;
  declare serverDropdown: EasyDropdown;
  declare userNameField: EasyInput;
  frame1(): any {
         this.stop();
      }
  frame2(): any {
         this.stop();
      }
  frame3(): any {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'),1,$b(this, 'frame2'),2,$b(this, 'frame3'));
      }
}
$reg('PlatformRacing3Client_fla.sprite1393_356', sprite1393_356);
