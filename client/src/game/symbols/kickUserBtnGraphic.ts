// Ported from kickUserBtnGraphic.as
import { SimpleButton } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class kickUserBtnGraphic extends SimpleButton {
  static __sym = 'kickUserBtnGraphic';
  constructor() {
         super();
      }
}
$reg('kickUserBtnGraphic', kickUserBtnGraphic);
