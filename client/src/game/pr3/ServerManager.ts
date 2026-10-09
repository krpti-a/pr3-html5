// Ported from com/jiggmin/pr3/ServerManager.as
import { clearInterval, setInterval } from '../../flash/index.ts';
import { int } from '../../flash/as3.ts';
import { DropdownClass, MessagePopup, PlatformRacing3, Settings, Sparkworkz } from '../refs.ts';
import { $reg } from '../refs.ts';

export class ServerManager {
  static refreshInterval: number = 0;
  declare static displayTarget: DropdownClass;
  static _serverArray: any[] = new Array();
  static refreshRate: number = 30;
  static addServer(param1: string, param2: string, param3: number, param4: string, param5: string): void {
    param3 = int(param3);
         if(param5 == "" || param5 == null)
         {
         }
         var _loc_6= ({} as any);
         _loc_6.name = param1;
         _loc_6.address = param2;
         _loc_6.port = param3;
         _loc_6.status = param4;
         _loc_6.playersOnline = ServerManager.statusToPlayers(param4);
         _loc_6.key = param5;
         ServerManager._serverArray.push(_loc_6);
      }
  static statusToPlayers(param1: string): number {
         var _loc_4= null;
         var _loc_2= param1.indexOf(" online");
         var _loc_3= -1;
         if(_loc_2 != -1)
         {
            _loc_4 = param1.substr(0,_loc_2);
            _loc_3 = int(_loc_4);
         }
         return _loc_3;
      }
  static startRefreshing(): void {
         clearInterval(ServerManager.refreshInterval);
         ServerManager.refreshInterval = setInterval(ServerManager.loadServers,ServerManager.refreshRate * 1000);
         ServerManager.loadServers();
      }
  static loadServers(): void {
         var _loc_1= ({} as any);
         var _loc_2= false;
         Sparkworkz.DataAccess("GetServers2",_loc_1,ServerManager.loadServersCallback,_loc_2);
      }
  static get randomServer(): any {
         var _loc_1= Math.floor(Math.random() * ServerManager._serverArray.length);
         return ServerManager._serverArray[_loc_1];
      }
  static loadServersCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= 0;
         var _loc_5= 0;
         var _loc_6= null;
         if(param2 != "")
         {
            PlatformRacing3.addPopup(new MessagePopup("The server list could not be loaded: " + param2));
         }
         else
         {
            ServerManager._serverArray = new Array();
            if(Settings.showTestServer)
            {
               ServerManager.addServer("Test Server","208.78.96.138",1627,"online?","MGJMNThIM2JuU2M5dndnaA==");
            }
            _loc_3 = param1.Row;
            _loc_4 = param1.NumRows;
            _loc_5 = 0;
            while(_loc_5 < _loc_4)
            {
               _loc_6 = _loc_3[_loc_5];
               ServerManager.addServer(_loc_6.server_name,_loc_6.address,_loc_6.port,_loc_6.status,"NO-ENCRYPT-KEY");
               _loc_5++;
            }
            ServerManager.displayServers();
         }
      }
  static stopRefreshing(): void {
         clearInterval(ServerManager.refreshInterval);
      }
  static setDisplayTarget(param1: DropdownClass): void {
         ServerManager.displayTarget = param1;
         ServerManager.displayServers();
      }
  static displayServers(): void {
         var _loc_2= null;
         var _loc_4= 0;
         var _loc_1= ServerManager._serverArray.length;
         var _loc_3= -1;
         if(ServerManager.displayTarget != null && _loc_1 > 0)
         {
            _loc_3 = ServerManager.displayTarget.selectedOptionIndex;
            ServerManager.displayTarget.clearOptions();
            _loc_4 = 0;
            while(_loc_4 < _loc_1)
            {
               _loc_2 = ServerManager._serverArray[_loc_4];
               ServerManager.displayTarget.addOption(_loc_2.name + " (" + _loc_2.status + ")",_loc_2);
               if(_loc_3 == -1 && _loc_2.playersOnline < 180 && _loc_2.playersOnline != -1)
               {
                  _loc_3 = _loc_4;
               }
               _loc_4++;
            }
            if(_loc_3 == -1)
            {
               ServerManager.displayTarget.selectRandomOption();
            }
            else if(Settings.showTestServer)
            {
               ServerManager.displayTarget.selectOptionByIndex(0);
            }
            else
            {
               ServerManager.displayTarget.selectOptionByIndex(_loc_3);
            }
         }
      }
  static clearDisplayTarget(): void {
         ServerManager.displayTarget = null;
      }
  static get serverArray(): any[] {
         return ServerManager._serverArray;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.ServerManager', ServerManager);
