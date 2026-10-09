// Ported from com/jiggmin/pr3/effects/Effect.as
import { Removable } from '../../basic/Removable.ts';
import { EffectMapLayer } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class Effect extends Removable {
  getXPos(): number {
         return this.x;
      }
  constructor() {
         super();
         this.mouseEnabled = false;
         this.mouseChildren = false;
         EffectMapLayer.addEffect(this);
      }
}
$reg('com.jiggmin.pr3.effects.Effect', Effect);
