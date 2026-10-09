// Ported from com/jiggmin/pr3/lobby/multiPlayer/InMatchPopup.as
import { $each, $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { BlossomEvent, MatchListing, PlatformRacing3, PlayerListing, SocketManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class InMatchPopup extends ButtonPopup {
  declare static instance: InMatchPopup;
  declare match: MatchListing;
  clickedPlay: boolean = false;
  remove(): void {
         if(InMatchPopup.instance == this)
         {
            InMatchPopup.instance = null;
         }
         if(SocketManager.socket != null)
         {
            if(!this.match.started && SocketManager.socket.me != null)
            {
               PlatformRacing3.instance.discord.updateTitle("In Multiplayer Lobby","As: " + SocketManager.socket.me.userName);
            }
            SocketManager.socket.removeEventListener("matchOwner",$b(this, 'matchOwnerHandler'));
         }
         this.match.getRoom().removeEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'));
         this.match.getRoom().removeEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'));
         this.match.remove();
         this.match = null;
         super.remove();
      }
  clickCancel(): void {
         this.remove();
      }
  redrawHandler(): void {
         super.redraw();
      }
  clickPlay(): void {
         if(!this.clickedPlay)
         {
            this.clickedPlay = true;
            SocketManager.socket.forceMatchStart();
         }
      }
  matchOwnerHandler(event: BlossomEvent): void {
         var player: PlayerListing= null;
         var data: any= event.raw;
         if(data.matchName == this.match.matchName)
         {
            if(Boolean($b(data, 'play')) && !this.match.ply)
            {
               this.createButton($b(this, 'clickPlay'),"Play");
            }
            else if(!$b(data, 'play'))
            {
               this.removeButtonByLabel("Play");
            }
            if(Boolean(data.ban) && Boolean(!this.match.ban) || Boolean(data.kick) && Boolean(!this.match.kick))
            {
               for (player of $each(this.match.playerListingArray))
               {
                  if(player.socketID != SocketManager.socket.socketID)
                  {
                     player.setKickVisible(data.kick);
                     player.setBanVisible(data.ban);
                     player.mouseChildren = true;
                     player.mouseEnabled = true;
                  }
               }
            }
            else if(!data.ban && !data.kick)
            {
               for (player of $each(this.match.playerListingArray))
               {
                  if(player.socketID != SocketManager.socket.socketID)
                  {
                     player.setKickVisible(false);
                     player.setBanVisible(false);
                     player.mouseChildren = false;
                     player.mouseEnabled = false;
                  }
               }
            }
            this.match.ply = $b(data, 'play');
            this.match.kick = data.kick;
            this.match.ban = data.ban;
         }
      }
  userLeaveRoomHandler(event: BlossomEvent): void {
         if(SocketManager.socket.socketID == event.socketID)
         {
            this.remove();
         }
         else
         {
            PlatformRacing3.instance.discord.updateMatchlisting(this.match);
         }
      }
  userJoinRoomHandler(event: BlossomEvent): void {
         PlatformRacing3.instance.discord.updateMatchlisting(this.match);
      }
  init(): void {
         super.init();
         PlatformRacing3.instance.discord.updateMatchlisting(this.match);
      }
  constructor(param1: any) {
         super();
         if(InMatchPopup.instance != null)
         {
            InMatchPopup.instance.remove();
         }
         InMatchPopup.instance = this;
         this.createButton($b(this, 'clickCancel'),"Cancel");
         SocketManager.socket.addEventListener("matchOwner",$b(this, 'matchOwnerHandler'),false,0,true);
         this.match = new MatchListing(param1,null,true,this);
         this.match.getRoom().addEventListener(BlossomEvent.USER_JOIN_ROOM,$b(this, 'userJoinRoomHandler'),false,0,true);
         this.match.getRoom().addEventListener(BlossomEvent.USER_LEAVE_ROOM,$b(this, 'userLeaveRoomHandler'),false,0,true);
         this.addGraphic(this.match);
      }
}
$reg('com.jiggmin.pr3.lobby.multiPlayer.InMatchPopup', InMatchPopup);
