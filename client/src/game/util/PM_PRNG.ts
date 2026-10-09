// Ported from de/polygonal/math/PM_PRNG.as
import { uint } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class PM_PRNG {
  seed: number = 0;
  gen(): number {
         var _loc_1= this.seed * 16807 % 2147483647;
         this.seed = uint(this.seed * 16807 % 2147483647);
         return _loc_1;
      }
  nextIntRange(param1: number, param2: number): number {
         param1 -= 0.4999;
         param2 += 0.4999;
         return Math.round(param1 + (param2 - param1) * this.nextDouble());
      }
  nextDouble(): number {
         return this.gen() / 2147483647;
      }
  nextDoubleRange(param1: number, param2: number): number {
         return param1 + (param2 - param1) * this.nextDouble();
      }
  nextInt(): number {
         return this.gen();
      }
  constructor(param1: number = 1) {
    param1 = uint(param1);
         
         this.seed = uint(param1);
      }
}
$reg('de.polygonal.math.PM_PRNG', PM_PRNG);
