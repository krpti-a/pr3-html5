// Ported from com/jiggmin/pr3/lobby/customize/PartDescriptions.as
import { Lightning } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class PartDescriptions {
  declare static headDescriptionArray: any[];
  declare static bodyDescriptionArray: any[];
  declare static feetDescriptionArray: any[];
  static NO_HAT: number = 1;
  static EXP_HAT: number = 2;
  static PROPELLER_HAT: number = 3;
  static COWBOY_HAT: number = 4;
  static CROWN_HAT: number = 5;
  static SANTA_HAT: number = 6;
  static ACCEL_HAT: number = 7;
  static JUMP_HAT: number = 8;
  static SPEED_HAT: number = 9;
  static PRANK_HAT: number = 10;
  static CARDBOARD_HAT: number = 11;
  static TOP_HAT: number = 12;
  static PARTY_HAT: number = 13;
  static PARASOL_HAT: number = 14;
  static PIRATE_HAT: number = 15;
  static MEDICAL_HAT: number = 16;
  static RUBBER_HAT: number = 17;
  static SHARK_HAT: number = 18;
  static HAPPY_HAT: number = 19;
  static POLICE_HAT: number = 20;
  static USHANKA_HAT: number = 21;
  static TOQUE_HAT: number = 22;
  static FEZ_HAT: number = 23;
  static WITCH_HAT: number = 24;
  static HALO_HAT: number = 25;
  static CARDBOARD_TWO_HAT: number = 26;
  static ROCK_HAT: number = 27;
  static BUNNY_HAT: number = 28;
  static BULL_HAT: number = 29;
  static BERET: number = 30;
  static TINFOIL: number = 31;
  static GLUE: number = 32;
  static TRAFFIC_CONE: number = 33;
  static MAGNET_HELMET: number = 34;
  static PET_SQUID: number = 35;
  static CAMO_CAP: number = 36;
  static ROCKET_HAT: number = 37;
  static FAN_HAT: number = 38;
  static SPOOKY_HAT: number = 39;
  static EXTRATERRESTRIAL_HAT: number = 40;
  static ALIEN_HAT: number = 41;
  static NATURE_HAT: number = 42;
  static HYPERJUMP_HAT: number = 43;
  static BANANA_PEEL: number = 44;
  static headTitleArray: any[] = new Array("Alien","Bigfoot","Bird","Brain","Cactus","Cthulhu","Dino","Eye","Hare","Monster","Mushroom","Panda","Platypus","Robot","Skeleton","Spartan","Tiki","Tortoise","Viking","Whale","Bosh","Ghost","Cranberry","Penguin","Reindeer","Donkey");
  static bodyTitleArray: any[] = new Array("Alien","Bigfoot","Bird","Brain","Cactus","Cthulhu","Dino","Eye","Hare","Monster","Mushroom","Panda","Platypus","Robot","Skeleton","Spartan","Tiki","Tortoise","Viking","Whale","Bosh","Ghost","Turkey","Penguin","Reindeer","Donkey");
  static feetTitleArray: any[] = new Array("Alien","Bigfoot","Bird","Brain","Cactus","Cthulhu","Dino","Eye","Hare","Monster","Mushroom","Panda","Platypus","Robot","Skeleton","Spartan","Tiki","Tortoise","Viking","Whale","Bosh","Ghost","Turkey","Penguin","Reindeer","Donkey");
  static hatDescriptionArray: any[] = new Array("Collect hats to unlock awesome bonuses and abilities!","Keep the sun out of your eyes! Increases exp gain by %50.","Your super jumps go even higher!","Super flying powers are gained when this mighty hat is worn.","Blocks an attack, and then falls off!","Temporarily turn anything you stand on to ice!","Boosts your traction by 5 points and speeds up crawling!","Boosts your jumping by 5 points and speeds up your super jump!","Boosts your speed by 5 points and lengthens speed bursts!","If someone steals Pedro from you, they will be punished!","It doesn\'t do a thing, but you can imagine it does!","Use the magic power of bunnies to walk through certain blocks!","Lightning doesn\'t like parties!","Hold up to catch the air and glide!","Use pirate sword skills to slice both directions at once!","Recover from injuries faster!","You\'re very, very bouncy!","Swim faster! (Also scare lifeguards)","Boosts speed, acceleration, and jumping by 3 points!");
  static hatTitleArray: any[] = new Array("Your head is naked","Baseball Cap","Propeller Hat","Cowboy Hat","Crown","Santa Hat","Mining Helmet","Aviator Cap","Winged Helmet","Pedro the Snail","Cardboard Box","Top Hat","Party Hat","Parasol Hat","Pirate Hat","Nurse Hat","Bouncy Hat","Shark Fin","Happy Hat");
  static hatDefaultColorArray: any[] = new Array(0,26316,26316,6697728,16776960,10027008,16763904,6697728,16711680,16777215,9724182);
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.lobby.customize.PartDescriptions', PartDescriptions);
