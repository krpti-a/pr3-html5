// Ported from com/jiggmin/data/Data.as
import { BitmapData, ByteArray, DisplayObject, Matrix, Point, Rectangle, Stage, getDefinitionByName, stage } from '../../flash/index.ts';
import { int, $Class, $as } from '../../flash/as3.ts';
import { Base64, Hex, Maths } from '../refs.ts';
import { $reg } from '../refs.ts';

export class Data {
  declare static stage: Stage;
  static selectRand(param1: any[]): any {
         var _loc_2= Math.floor(Math.random() * param1.length);
         return param1[_loc_2];
      }
  static strToBase64(param1: string): string {
         var _loc_2= new ByteArray();
         _loc_2.writeUTFBytes(param1);
         return Data.binaryToBase64(_loc_2);
      }
  static argbToHex(param1: number, param2: number, param3: number, param4: number): number {
         return param1 << 24 | param2 << 16 | param3 << 8 | param4;
      }
  static stringToBitmapData(param1: string): BitmapData {
         var _loc_2= $as(getDefinitionByName(param1), $Class);
         return new _loc_2(0,0);
      }
  static formatSeconds(param1: any, param2: string = "seconds"): string {
         var _loc_3= Math.floor(param1 / 60);
         var _loc_4= Math.floor(param1 % 60);
         var _loc_5= Math.round(param1 % 1 * 999);
         var _loc_6= Data.padToLength(1,"0",_loc_3.toString());
         var _loc_7= Data.padToLength(2,"0",_loc_4.toString());
         var _loc_8= Data.padToLength(3,"0",_loc_5.toString());
         var _loc_9= _loc_6 + ":" + _loc_7;
         if(param2 == "decimal")
         {
            _loc_9 += "." + _loc_8;
         }
         return _loc_9;
      }
  static getSeconds(): number {
         return Math.round(Data.getMS() / 1000);
      }
  static binaryToBase64(param1: ByteArray): string {
         return Base64.encodeByteArray(param1);
      }
  static padToLength(param1: number, param2: string, param3: string): string {
         while(param3.length < param1)
         {
            param3 = param2 + param3;
         }
         return param3;
      }
  static filterSwearing(param1: string): string {
         return param1;
      }
  static stringToObject(param1: string): any {
         var _loc_2: any= $as(getDefinitionByName(param1), $Class);
         return new _loc_2();
      }
  static stringToObjectToBitmapData(id: string): BitmapData {
         var object: DisplayObject= (Data.stringToObject(id));
         var bitmapData: BitmapData= new BitmapData(object.width,object.height,true,0);
         bitmapData.draw(object);
         return bitmapData;
      }
  static stringToObjectToBitmapDataSizeOverride(id: string, width: number, height: number): BitmapData {
    width = int(width); height = int(height);
         var object: DisplayObject= (Data.stringToObject(id));
         var bitmapData: BitmapData= new BitmapData(width,height,true,0);
         bitmapData.draw(object);
         return bitmapData;
      }
  static compressString(param1: string): string {
         var _loc_2: ByteArray= new ByteArray();
         _loc_2.writeUTFBytes(param1);
         _loc_2.compress();
         return Data.binaryToBase64(_loc_2);
      }
  static hexToBinary(param1: string): ByteArray {
         return Hex.toArray(param1);
      }
  static base64ToBinary(param1: string): ByteArray {
         return Base64.decodeToByteArray(param1);
      }
  static decompressString(param1: string): string {
         var _loc_2: ByteArray= Data.base64ToBinary(param1);
         _loc_2.uncompress();
         return _loc_2.toString();
      }
  static binaryToHex(param1: ByteArray): string {
         return Hex.fromArray(param1);
      }
  static formatNumber(param1: number): string {
         var _loc_2: any[]= [];
         while(param1 > 0)
         {
            _loc_2.push(param1 % 1000);
            param1 = Math.floor(param1 / 1000);
         }
         return _loc_2.reverse().join(",");
      }
  static base64ToStr(param1: string): string {
         var _loc_2: ByteArray= Data.base64ToBinary(param1);
         return _loc_2.toString();
      }
  static hexToArgb(param1: number): any {
         var _loc_2: any= {};
         _loc_2.alpha = param1 >> 24 & 0xFF;
         _loc_2.red = param1 >> 16 & 0xFF;
         _loc_2.green = param1 >> 8 & 0xFF;
         _loc_2.blue = param1 & 0xFF;
         return _loc_2;
      }
  static hideNumber(param1: number): number {
         return param1 * 3.13 - 2.6987;
      }
  static randIndex(param1: any[]): any {
         return param1[Math.floor(Math.random() * param1.length)];
      }
  static linesIntersect(param1: Point, param2: Point, param3: Point, param4: Point, param5: boolean = true): Point {
         var _loc_6: Point= null;
         var _loc_7: number= Number(NaN);
         var _loc_8: number= Number(NaN);
         var _loc_9: number= Number(NaN);
         var _loc_10: number= Number(NaN);
         var _loc_11: number= Number(NaN);
         var _loc_12: number= Number(NaN);
         _loc_7 = param2.y - param1.y;
         _loc_9 = param1.x - param2.x;
         _loc_11 = param2.x * param1.y - param1.x * param2.y;
         _loc_8 = param4.y - param3.y;
         _loc_10 = param3.x - param4.x;
         _loc_12 = param4.x * param3.y - param3.x * param4.y;
         var _loc_13: number= _loc_7 * _loc_10 - _loc_8 * _loc_9;
         if(_loc_7 * _loc_10 - _loc_8 * _loc_9 == 0)
         {
            return null;
         }
         _loc_6 = new Point();
         _loc_6.x = (_loc_9 * _loc_12 - _loc_10 * _loc_11) / _loc_13;
         _loc_6.y = (_loc_8 * _loc_11 - _loc_7 * _loc_12) / _loc_13;
         if(param5)
         {
            if(Math.pow(_loc_6.x - param2.x + (_loc_6.y - param2.y),2) > Math.pow(param1.x - param2.x + (param1.y - param2.y),2))
            {
               return null;
            }
            if(Math.pow(_loc_6.x - param1.x + (_loc_6.y - param1.y),2) > Math.pow(param1.x - param2.x + (param1.y - param2.y),2))
            {
               return null;
            }
            if(Math.pow(_loc_6.x - param4.x + (_loc_6.y - param4.y),2) > Math.pow(param3.x - param4.x + (param3.y - param4.y),2))
            {
               return null;
            }
            if(Math.pow(_loc_6.x - param3.x + (_loc_6.y - param3.y),2) > Math.pow(param3.x - param4.x + (param3.y - param4.y),2))
            {
               return null;
            }
         }
         return _loc_6;
      }
  static addColors(param1: number, param2: number): number {
         var _loc_3: any= Data.hexToArgb(param1);
         var _loc_4: any= Data.hexToArgb(param2);
         var _loc_5: number= _loc_3.alpha / 255;
         var _loc_6: number= _loc_4.alpha / 255;
         var _loc_7: number= 1 - _loc_6;
         var _loc_8: number= _loc_5 * _loc_7;
         var _loc_9: number= _loc_5 * _loc_7 + _loc_6;
         var _loc_10: number= (_loc_3.red * _loc_8 + _loc_4.red * _loc_6) / _loc_9;
         var _loc_11: number= (_loc_3.blue * _loc_8 + _loc_4.blue * _loc_6) / _loc_9;
         var _loc_12: number= (_loc_3.green * _loc_8 + _loc_4.green * _loc_6) / _loc_9;
         var _loc_13= ({} as any);
         _loc_13.red = Math.round(_loc_10);
         _loc_13.blue = Math.round(_loc_11);
         _loc_13.green = Math.round(_loc_12);
         _loc_13.alpha = Math.round(_loc_9 * 255);
         return Data.argbToHex(_loc_13.alpha,_loc_13.red,_loc_13.green,_loc_13.blue);
      }
  static cleanHTML(param1: string): string {
         param1 = param1.replace(/&/gi,"&amp;");
         param1 = param1.replace(/>/gi,"&gt;");
         return param1.replace(/</gi,"&lt;");
      }
  static rotatePoint(x: number, y: number, rotation: number): Point {
         rotation = Maths.DEG_RAD * -rotation;
         return new Point(x * Math.cos(rotation) - y * Math.sin(rotation),y * Math.cos(rotation) + x * Math.sin(rotation));
      }
  static revealNumber(param1: number): number {
         return (param1 + 2.6987) / 3.13;
      }
  static describeTime(param1: number): string {
         var _loc_2: string= "";
         var _loc_3: number= 0;
         if(param1 < 60)
         {
            _loc_2 = "second";
            _loc_3 = param1;
         }
         else if(param1 < 60 * 60)
         {
            _loc_2 = "minute";
            _loc_3 = param1 / 60;
         }
         else if(param1 < 60 * 60 * 24)
         {
            _loc_2 = "hour";
            _loc_3 = param1 / 60 / 60;
         }
         else if(param1 < 60 * 60 * 24 * 30)
         {
            _loc_2 = "day";
            _loc_3 = param1 / 60 / 60 / 24;
         }
         else if(param1 < 60 * 60 * 24 * 30 * 12)
         {
            _loc_2 = "month";
            _loc_3 = param1 / 60 / 60 / 24 / 30;
         }
         else
         {
            _loc_2 = "year";
            _loc_3 = param1 / 60 / 60 / 24 / 30 / 12;
         }
         _loc_3 = Math.round(_loc_3 * 10) / 10;
         var _loc_4= _loc_3 + " " + _loc_2;
         if(_loc_3 != 1)
         {
            _loc_4 += "s";
         }
         return _loc_4;
      }
  static alphaToHex(param1: number, param2: number = 0): string {
         var _loc_3: number= param1 * 255;
         var _loc_4: string= _loc_3.toString(16).toUpperCase();
         var _loc_5: string= param2.toString(16).toUpperCase();
         _loc_5 = Data.padToLength(6,"0",_loc_5);
         return "0x" + _loc_4 + _loc_5;
      }
  static uncleanHTML(param1: string): string {
         param1 = param1.replace(/&gt;/gi,">");
         param1 = param1.replace(/&lt;/gi,"<");
         return param1.replace(/&amp;/gi,"&");
      }
  static getMS(): number {
         var _loc_1: any= new Date();
         return _loc_1.time;
      }
  static timestampToDate(param1: number): string {
         var _loc_2: any= new Date();
         _loc_2.setTime(param1);
         var _loc_3: any[]= new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
         var _loc_4: string= _loc_3[_loc_2.getMonth()];
         var _loc_5: string= _loc_3[_loc_2.getMonth()] + " " + _loc_2.getDate();
         return _loc_3[_loc_2.getMonth()] + " " + _loc_2.getDate();
      }
  static timestampToDateAdvanced(param1: number): string {
         var _loc_2: any= new Date();
         _loc_2.setTime(param1);
         _loc_2 = new Date(_loc_2.getTime() - _loc_2.getTimezoneOffset() * 60 * 1000);
         var _loc_3: any[]= new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
         var _loc_4: string= _loc_3[_loc_2.getMonth()];
         var _loc_5: string= _loc_3[_loc_2.getMonth()] + " " + _loc_2.getDate();
         var minutes: string= String(_loc_2.getUTCMinutes());
         if(minutes.length == 1)
         {
            minutes = "0" + minutes;
         }
         var hours: number = int(_loc_2.getUTCHours());
         if(hours > 12)
         {
            hours = int(hours - (12));
            minutes += "PM";
         }
         else if(hours == 0)
         {
            minutes += "AM";
            hours = int(12);
         }
         else if(hours < 12)
         {
            minutes += "AM";
         }
         else
         {
            minutes += "PM";
         }
         return _loc_3[_loc_2.getMonth()] + " " + _loc_2.getDate() + " " + _loc_2.getUTCFullYear() + " " + hours + ":" + minutes;
      }
  static levelTypeToHuman(levelType: string): string {
         if(levelType == "race")
         {
            return "Race";
         }
         if(levelType == "deathmatch")
         {
            return "Deathmatch";
         }
         if(levelType == "teamDeathmatch")
         {
            return "Team Deathmatch";
         }
         if(levelType == "coinFiend")
         {
            return "Coin Fiend";
         }
         if(levelType == "hatAttack")
         {
            return "Hat Attack";
         }
         if(levelType == "kingOfTheHat")
         {
            return "King of the Hat";
         }
         if(levelType == "damageDash")
         {
            return "Damage Dash";
         }
         return "Undefined";
      }
  static transformDisplayObject(object: DisplayObject, angleDegrees: number = NaN, _xscale: number = NaN, _yscale: number = NaN): void {
         angleDegrees = isNaN(angleDegrees) ? 0 : angleDegrees;
         _xscale = isNaN(_xscale) ? 1 : _xscale;
         _yscale = isNaN(_yscale) ? 1 : _yscale;
         var matrix: Matrix= object.transform.matrix;
         var rect: Rectangle= object.getBounds(object.parent);
         var centerX: number= rect.left + rect.width / 2;
         var centerY: number= rect.top + rect.height / 2;
         matrix.translate(-centerX,-centerY);
         matrix.rotate(angleDegrees / 180 * Math.PI);
         matrix.scale(_xscale,_yscale);
         matrix.translate(centerX,centerY);
         object.transform.matrix = matrix;
         object.rotation = Math.round(object.rotation);
      }
  static cropBitmapData(source: BitmapData): BitmapData {
         var notAlphaBounds: Rectangle= source.getColorBoundsRect(4278190080,0,false);
         var cropped: BitmapData= new BitmapData(notAlphaBounds.width,notAlphaBounds.height,true,0);
         cropped.copyPixels(source,notAlphaBounds,new Point());
         return cropped;
      }
  static clone(obj: any): any {
         var temp: ByteArray= new ByteArray();
         temp.writeObject(obj);
         temp.position = 0;
         return temp.readObject();
      }
  fitGraphicInBox(param1: DisplayObject, param2: number, param3: number): void {
         var _loc_4= 1;
         param1.scaleY = 1;
         param1.scaleX = _loc_4;
         if(param1.width > param2)
         {
            param1.height *= param2 / param1.width;
            param1.width = param2;
         }
         if(param1.height > param3)
         {
            param1.width *= param3 / param1.height;
            param1.height = param3;
         }
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.data.Data', Data);
