// Ported from com/jiggmin/pr3/SiteLock.as
import { ExternalInterface, Stage, stage } from '../../flash/index.ts';
import { $each } from '../../flash/as3.ts';
import { Settings } from '../refs.ts';
import { $reg } from '../refs.ts';

export class SiteLock {
  static extractDomainFromURL(param1: string): string {
         var _loc_2= undefined;
         var _loc_3= undefined;
         var _loc_4= undefined;
         if(param1 != null)
         {
            _loc_2 = param1.indexOf("://") + 3;
            _loc_3 = param1.indexOf("/",_loc_2);
            _loc_4 = param1.substring(_loc_2,_loc_3);
            return param1.substring(_loc_2,_loc_3);
         }
         return param1;
      }
  static domainIsAllowed(param1: string): boolean {
         return true;
      }
  static domainIsBlock(param1: string): boolean {
         var _loc_4= null;
         var _loc_2= false;
         var _loc_3= new Array("kongregate.com","www.kongregate.com");
         for (_loc_4 of $each(_loc_3))
         {
            if(_loc_4 == param1)
            {
               _loc_2 = true;
               break;
            }
         }
         return _loc_2;
      }
  static canPlay(param1: Stage): boolean {
         var loaderURL: string= null;
         var jsURL: string= null;
         var loaderDomain: string= null;
         var jsDomain: string= null;
         var stage= param1;
         var urlIsGood: boolean= true;
         try
         {
            loaderURL = stage.loaderInfo.url;
            if(!Settings.disableSiteLockExternalInterface)
            {
               jsURL = ExternalInterface.call("function(){return window.top.location.href}").toString();
            }
         }
         catch (error)
         {
            urlIsGood = false;
         }
         if(urlIsGood)
         {
            loaderDomain = SiteLock.extractDomainFromURL(loaderURL);
            jsDomain = SiteLock.extractDomainFromURL(jsURL);
            if(!SiteLock.domainIsAllowed(loaderDomain) || !SiteLock.domainIsAllowed(jsDomain) || Boolean(SiteLock.domainIsBlock(loaderDomain)) || Boolean(SiteLock.domainIsBlock(jsDomain)))
            {
               urlIsGood = false;
            }
         }
         return urlIsGood;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.SiteLock', SiteLock);
