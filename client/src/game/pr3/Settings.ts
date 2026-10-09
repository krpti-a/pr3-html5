// Ported from com/jiggmin/pr3/Settings.as
import { Capabilities, SharedObject } from '../../flash/index.ts';
import { $reg } from '../refs.ts';

export class Settings {
  declare static loginType: string;
  declare static server: any;
  declare static myCharacter: any;
  static userID: number = NaN;
  declare static userName: string;
  declare static savedSettings: SharedObject;
  static startMuted: boolean = false;
  static LOGIN_TYPE_MEMBER: string = "member";
  static showTestServer: boolean = false;
  static disableSiteLock: boolean = true;
  static disableSiteLockExternalInterface: boolean = Capabilities.isDebugger;
  static autoPlayLevelID: number = -1;
  static LOGIN_TYPE_GUEST: string = "guest";
  static showStats: boolean = false;
  static traceTraffic: boolean = false;
  static gameHeight: number = 480;
  static gameWidth: number = 675;
  static gameFPS: number = 27;
  static shouldUseHttps: any = false;
  static DOMAIN: string = "pr3hub.com";
  static API_DOMAIN: string = "api.pr3hub.com";
  static isMobile: boolean = false;
  static isSoftDebug: boolean = false;
  static _soundOn: number = 50;
  static _musicOn: number = 50;
  static _drawBackgrounds: boolean = true;
  static init(): void {
         try
         {
            Settings.savedSettings = SharedObject.getLocal("savedSettings");
            Settings._soundOn = Settings.savedSettings.data.soundOn != undefined ? Number(Settings.savedSettings.data.soundOn) : 50;
            Settings._musicOn = Settings.savedSettings.data.musicOn != undefined ? Number(Settings.savedSettings.data.musicOn) : 50;
            Settings._drawBackgrounds = Settings.savedSettings.data.drawBackgrounds != undefined ? Boolean(Settings.savedSettings.data.drawBackgrounds) : true;
         }
         catch (e)
         {
         }
         switch(Capabilities.version.substring(0,3))
         {
            case "IOS":
            case "AND":
               Settings.isMobile = true;
               break;
            default:
               Settings.isMobile = false;
         }
      }
  static clearLoginInfo(): void {
         Settings.loginType = "";
         Settings.userName = "";
         Settings.userID = 0;
         Settings.server = null;
         Settings.myCharacter = null;
      }
  static getDomainScheme(): string {
         if(Settings.shouldUseHttps)
         {
            return "https";
         }
         return "http";
      }
  static getDomain(): string {
         return Settings.getDomainScheme() + "://" + Settings.DOMAIN;
      }
  static getAPIDomain(): string {
         return Settings.getDomainScheme() + "://" + Settings.API_DOMAIN;
      }
  static get soundOn(): number {
         return Settings._soundOn;
      }
  static get musicOn(): number {
         return Settings._musicOn;
      }
  static get drawBackgrounds(): boolean {
         return Settings._drawBackgrounds;
      }
  static set soundOn(newVolume: number) {
         Settings._soundOn = newVolume;
         if(Settings.savedSettings != null)
         {
            Settings.savedSettings.setProperty("soundOn",newVolume);
         }
      }
  static set musicOn(newVolume: number) {
         Settings._musicOn = newVolume;
         if(Settings.savedSettings != null)
         {
            Settings.savedSettings.setProperty("musicOn",newVolume);
         }
      }
  static set drawBackgrounds(newSetting: boolean) {
         Settings._drawBackgrounds = newSetting;
         if(Settings.savedSettings != null)
         {
            Settings.savedSettings.setProperty("drawBackgrounds",newSetting);
         }
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.Settings', Settings);
