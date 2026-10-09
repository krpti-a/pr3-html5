// Ported from com/jiggmin/pr3/lobby/LobbyLevelSelector.as
import { int, $b } from '../../../flash/as3.ts';
import { LevelSelector } from '../lister/LevelSelector.ts';
import { BlossomEvent, SocketManager } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LobbyLevelSelector extends LevelSelector {
  receiveLevelListHandler(event: BlossomEvent): void {
         var _loc_2= event.raw;
         if(_loc_2.requestID == this.requestID)
         {
            this.setTotalResults(_loc_2.results);
            this.setList(_loc_2.levels);
         }
      }
  remove(): void {
         if(SocketManager.socket != null)
         {
            SocketManager.socket.removeEventListener("receiveLevelList",$b(this, 'receiveLevelListHandler'));
         }
         super.remove();
      }
  constructor(param1: number = 7, extraWidth: number = 0) {
    param1 = int(param1); extraWidth = int(extraWidth);
         super(param1,extraWidth);
         if(SocketManager.socket != null)
         {
            SocketManager.socket.addEventListener("receiveLevelList",$b(this, 'receiveLevelListHandler'),false,0,true);
         }
      }
}
$reg('com.jiggmin.pr3.lobby.LobbyLevelSelector', LobbyLevelSelector);
