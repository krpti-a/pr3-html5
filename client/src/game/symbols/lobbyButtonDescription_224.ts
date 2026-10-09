// Ported from PlatformRacing3_fla/lobbyButtonDescription_224.as
import { MovieClip, TextField } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class lobbyButtonDescription_224 extends MovieClip {
  static __sym = 'PlatformRacing3_fla.lobbyButtonDescription_224';
  declare titleBox: TextField;
  declare tab: MovieClip;
  declare bg: MovieClip;
  declare textBox: TextField;
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('PlatformRacing3_fla.lobbyButtonDescription_224', lobbyButtonDescription_224);
