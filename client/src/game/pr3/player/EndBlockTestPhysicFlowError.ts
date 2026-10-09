// Ported from com/jiggmin/pr3/player/EndBlockTestPhysicFlowError.as

import { $reg } from '../../refs.ts';

export class EndBlockTestPhysicFlowError extends Error {
  static INSTANCE: EndBlockTestPhysicFlowError = new EndBlockTestPhysicFlowError();
  constructor() {
         super();
      }
}
$reg('com.jiggmin.pr3.player.EndBlockTestPhysicFlowError', EndBlockTestPhysicFlowError);
