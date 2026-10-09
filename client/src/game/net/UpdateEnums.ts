// Ported from net/goldtreeservers/UpdateEnums.as
import { uint } from '../../flash/as3.ts';
import { $reg } from '../refs.ts';

export class UpdateEnums {
  static x: number = uint(1 << 1);
  static y: number = uint(1 << 2);
  static velX: number = uint(1 << 3);
  static velY: number = uint(1 << 4);
  static scaleX: number = uint(1 << 5);
  static space: number = uint(1 << 6);
  static left: number = uint(1 << 7);
  static right: number = uint(1 << 8);
  static down: number = uint(1 << 9);
  static up: number = uint(1 << 10);
  static speed: number = uint(1 << 11);
  static accel: number = uint(1 << 12);
  static jump: number = uint(1 << 13);
  static rot: number = uint(1 << 14);
  static item: number = uint(1 << 15);
  static life: number = uint(1 << 16);
  static hurt: number = uint(1 << 17);
  static coins: number = uint(1 << 18);
  static dash: number = uint(1 << 19);
  static team: number = uint(1 << 20);
  constructor() {
         
      }
}
$reg('net.goldtreeservers.UpdateEnums', UpdateEnums);
