// Ported from com/jiggmin/blossomSocket/ZeroPad.as
import { ByteArray } from '../../flash/index.ts';
import { uint } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class ZeroPad {
  declare char: string;
  blockSize: number = 0;
  unpad(param1: ByteArray): void {
         param1.position = 0;
         var _loc_2= param1.readUTFBytes(param1.bytesAvailable);
         _loc_2.split(this.char).join("");
         param1.writeUTFBytes(_loc_2);
      }
  pad(param1: ByteArray): void {
         while(param1.length % this.blockSize != 0)
         {
            param1.writeUTFBytes(this.char);
         }
      }
  setBlockSize(param1: number): void {
    param1 = uint(param1);
         this.blockSize = uint(param1);
      }
  constructor(param1: number = 0) {
    param1 = uint(param1);
         
         this.char = String.fromCharCode(0);
         this.blockSize = uint(param1);
      }
}
$reg('com.jiggmin.blossomSocket.ZeroPad', ZeroPad);
