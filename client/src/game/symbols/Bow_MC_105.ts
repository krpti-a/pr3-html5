// Ported from PlatformRacing3Client_fla/Bow_MC_105.as
import { MovieClip } from '../../flash/index.ts';
import { $b } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class Bow_MC_105 extends MovieClip {
  static __sym = 'PlatformRacing3Client_fla.Bow_MC_105';
  frame1(): any {
         this.stop();
      }
  frame59(): any {
         this.stop();
      }
  frame63(): any {
         this.gotoAndStop(1);
      }
  constructor() {
         super();
         this.addFrameScript(0,$b(this, 'frame1'),58,$b(this, 'frame59'),62,$b(this, 'frame63'));
      }
}
$reg('PlatformRacing3Client_fla.Bow_MC_105', Bow_MC_105);
