// Ported from LobbyPageGraphic.as
import { MovieClip, SimpleButton } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class LobbyPageGraphic extends MovieClip {
  static __sym = 'LobbyPageGraphic';
  declare playersButton: SimpleButton;
  declare multiPlayerButton: SimpleButton;
  declare chatButton: SimpleButton;
  declare bubble: MovieClip;
  declare modButton: SimpleButton;
  declare customizeButton: SimpleButton;
  declare backButton: SimpleButton;
  declare singlePlayerButton: SimpleButton;
  declare editorButton: SimpleButton;
  frame1(): void {
         this.stop();
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'));
      }
}
$reg('LobbyPageGraphic', LobbyPageGraphic);
