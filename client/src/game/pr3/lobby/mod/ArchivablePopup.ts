// Ported from com/jiggmin/pr3/lobby/mod/ArchivablePopup.as
import { uint, $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { MessagePopup, Settings } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ArchivablePopup extends ButtonPopup {
  declare refreshCallback: Function;
  sendingArchiveRequest: boolean = false;
  sendingTogglePickupRequest: boolean = false;
  remove(): void {
         this.refreshCallback = null;
         super.remove();
      }
  sendArchiveRequest(): void {
      }
  clickClose(): void {
         this.remove();
      }
  clickArchive(): void {
         if(!this.sendingArchiveRequest)
         {
            this.sendArchiveRequest();
            this.sendingArchiveRequest = true;
         }
      }
  togglePickup(): void {
         if(!this.sendingTogglePickupRequest)
         {
            this.sendTogglePickup();
            this.sendingTogglePickupRequest = true;
         }
      }
  sendTogglePickup(): void {
      }
  archiveCallback(param1: any, param2: string): void {
         this.sendingArchiveRequest = false;
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Could not archive: " + param2));
         }
         else if(!this.removed)
         {
            if(this.refreshCallback != null)
            {
               this.refreshCallback();
            }
            this.remove();
         }
      }
  constructor(picker: number, archive: boolean, param1: Function = null) {
    picker = uint(picker);
         super();
         this.refreshCallback = param1;
         if(!archive)
         {
            if(Settings.userID == picker)
            {
               this.createButton($b(this, 'togglePickup'),"Release");
               this.createButton($b(this, 'clickArchive'),"Mark as solved");
            }
            else if(picker == 0)
            {
               this.createButton($b(this, 'togglePickup'),"Pickup");
            }
         }
         this.createButton($b(this, 'clickClose'),"Close");
      }
}
$reg('com.jiggmin.pr3.lobby.mod.ArchivablePopup', ArchivablePopup);
