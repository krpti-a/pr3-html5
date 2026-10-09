// Ported from com/jiggmin/blossomSocket/Encryptor.as
import { ByteArray } from '../../flash/index.ts';
import { AESKey, Base64, CBCMode, ZeroPad } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Encryptor {
  declare mode: CBCMode;
  setKey(param1: string): void {
         var _loc_2= this.stringToBinary(param1);
         var _loc_3= new ZeroPad();
         var _loc_4= new AESKey(_loc_2);
         this.mode = new CBCMode(_loc_4,_loc_3);
      }
  encrypt(param1: string): string {
         var _loc_2= new ByteArray();
         _loc_2.writeUTFBytes(param1);
         this.mode.encrypt(_loc_2);
         return this.binaryToString(_loc_2);
      }
  stringToBinary(param1: string): ByteArray {
         return Base64.decodeToByteArray(param1);
      }
  remove(): void {
         this.mode = null;
      }
  binaryToString(param1: ByteArray): string {
         return Base64.encodeByteArray(param1);
      }
  decrypt(param1: string): string {
         var _loc_2= this.stringToBinary(param1);
         this.mode.decrypt(_loc_2);
         _loc_2.position = 0;
         return _loc_2.readUTFBytes(_loc_2.bytesAvailable);
      }
  setIV(param1: string): void {
         var _loc_2= this.stringToBinary(param1);
         (this.mode).IV = _loc_2;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.blossomSocket.Encryptor', Encryptor);
