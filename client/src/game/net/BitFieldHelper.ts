// Ported from net/goldtreeservers/BitFieldHelper.as
import { int } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class BitFieldHelper {
  bitField: number = 0;
  add(flag: number): void {
    flag = int(flag);
         this.bitField |= flag;
      }
  remove(flag: number): void {
    flag = int(flag);
         this.bitField &= ~flag;
      }
  has(flag: number): boolean {
    flag = int(flag);
         return (this.bitField & flag) == flag;
      }
  get(): number {
         return this.bitField;
      }
  constructor(bitField: number) {
    bitField = int(bitField);
         
         this.bitField = int(bitField);
      }
}
$reg('net.goldtreeservers.BitFieldHelper', BitFieldHelper);
