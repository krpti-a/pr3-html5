// Ported from com/jiggmin/pr3/lobby/mod/BanDetailsPopup.as
import { $b } from '../../../../flash/as3.ts';
import { ButtonPopup } from '../../../popup/ButtonPopup.ts';
import { BanDetailsPopupGraphic, ConfirmPopup, Data, EditorPopupBGGraphic, MessagePopup, NameMaker, Sparkworkz } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BanDetailsPopup extends ButtonPopup {
  banID: number = NaN;
  declare m: any;
  liftingBan: boolean = false;
  declare nameMaker: NameMaker;
  confirmLiftBan(): void {
         this.liftingBan = true;
         var _loc_1= ({} as any);
         _loc_1.p_ban_id = this.banID;
         var _loc_2= false;
         Sparkworkz.DataAccess("LiftBan",_loc_1,$b(this, 'liftBanCallback'),_loc_2);
         this.addPopup(new MessagePopup("The ban has been lifted, oh kind soul."));
         this.remove();
      }
  liftBanCallback(param1: any, param2: string): void {
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Could not lift ban: " + param2));
         }
         else if(!this.removed)
         {
            this.remove();
         }
      }
  remove(): void {
         this.nameMaker.remove();
         this.nameMaker = null;
         this.m = null;
         super.remove();
      }
  clickClose(): void {
         this.remove();
      }
  clickLiftBan(): void {
         if(!this.liftingBan)
         {
            this.addPopup(new ConfirmPopup($b(this, 'confirmLiftBan'),"Are you sure you want to lift this ban?"));
         }
      }
  banDetailsCallback(param1: any, param2: string): void {
         var _loc_3= null;
         var _loc_4= null;
         var _loc_5= null;
         var _loc_6= NaN;
         var _loc_7= NaN;
         var _loc_8= null;
         var _loc_9= null;
         var _loc_10= null;
         var _loc_11= null;
         if(param2 != "")
         {
            this.addPopup(new MessagePopup("Could not retrieve ban record: " + param2));
         }
         else if(param1.NumRows <= 0)
         {
            this.addPopup(new MessagePopup("No record was found for this ban. banID: " + this.banID.toString()));
         }
         else if(!this.removed)
         {
            _loc_3 = param1.Row;
            _loc_4 = "";
            _loc_5 = _loc_3.banned_ip;
            _loc_6 = Number(_loc_3.expire_time);
            _loc_7 = Number(_loc_3.ban_time);
            if(_loc_10 == "")
            {
               _loc_10 = "Guest";
            }
            if(_loc_5 != "")
            {
               _loc_5 = " (" + _loc_5 + ")";
            }
            _loc_8 = Data.describeTime(_loc_6 - _loc_7);
            _loc_9 = this.nameMaker.makeNameFromParts(_loc_3.mod_name,_loc_3.mod_group,0,_loc_3.mod_user_id,_loc_3.mod_name_color);
            _loc_10 = "";
            if(_loc_3.banned_user_id == 0)
            {
               _loc_10 = "guest";
            }
            else
            {
               _loc_10 = this.nameMaker.makeNameFromParts(_loc_3.banned_name,_loc_3.banned_group,0,_loc_3.banned_user_id,_loc_3.banned_name_color);
            }
            if(_loc_3.lifted == 1 || _loc_3.lifted == "1")
            {
               _loc_4 = _loc_4 + "*** This ban has been lifted by " + this.nameMaker.makeNameFromParts(_loc_3.listed_username,_loc_3.lifted_group,0,_loc_3.lifted_by,_loc_3.listed_color) + ". *** \n\n";
            }
            else
            {
               this.createButtonToStart($b(this, 'clickLiftBan'),"Lift Ban");
            }
            _loc_4 += _loc_9 + " " + _loc_3.ban_type + "ed " + _loc_10 + _loc_5 + (_loc_3.expire_time == "-1" ? " permanently" : " for " + _loc_8) + "\n\n";
            _loc_4 += "Ban Reason: " + _loc_3.reason + "\n\n";
            if(_loc_3.log != "")
            {
               _loc_11 = Data.cleanHTML(_loc_3.log);
               _loc_4 += "-------\n" + _loc_11 + "\n\n";
            }
            this.m.textBox.htmlText = _loc_4;
         }
      }
  constructor(param1: number) {
         super();
         this.banID = param1;
         this.setBG(new EditorPopupBGGraphic());
         this.m = new BanDetailsPopupGraphic();
         this.addGraphic(this.m);
         this.nameMaker = new NameMaker();
         this.nameMaker.listenForLink(this.m.textBox);
         this.createButton($b(this, 'clickClose'),"Close");
         var _loc_2= ({} as any);
         _loc_2.p_ban_id = param1;
         var _loc_3= false;
         Sparkworkz.DataAccess("GetBanDetails",_loc_2,$b(this, 'banDetailsCallback'),_loc_3);
      }
}
$reg('com.jiggmin.pr3.lobby.mod.BanDetailsPopup', BanDetailsPopup);
