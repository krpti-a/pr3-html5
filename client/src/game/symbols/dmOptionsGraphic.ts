// Ported from dmOptionsGraphic.as
import { MovieClip } from '../../flash/index.ts';
import { EasyInput } from '../refs.ts';
import { $reg } from '../refs.ts';

export class dmOptionsGraphic extends MovieClip {
  static __sym = 'dmOptionsGraphic';
  declare healthBox: EasyInput;
  constructor() {
         super();
      }
}
$reg('dmOptionsGraphic', dmOptionsGraphic);
