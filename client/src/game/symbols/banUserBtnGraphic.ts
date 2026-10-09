// Ported from banUserBtnGraphic.as
import { SimpleButton } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class banUserBtnGraphic extends SimpleButton {
  static __sym = 'banUserBtnGraphic';
  constructor() {
         super();
      }
}
$reg('banUserBtnGraphic', banUserBtnGraphic);
