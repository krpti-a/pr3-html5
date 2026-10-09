// Ported from com/jiggmin/pr3/game/PrizePopup.as
import { MovieClip } from '../../../flash/index.ts';
import { int, $b } from '../../../flash/as3.ts';
import { ButtonPopup } from '../../popup/ButtonPopup.ts';
import { EditorPopupBGGraphic, PartDescriptions, PrizePopupGraphic } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class PrizePopup extends ButtonPopup {
  prizeID: number = 0;
  declare m: any;
  declare category: string;
  showPart(param1: MovieClip): void {
         param1.visible = true;
         param1.gotoAndStop(this.prizeID);
         param1.colorMC.gotoAndStop(this.prizeID);
      }
  hideParts(): void {
         var _loc_1= false;
         this.m.leftFoot.visible = false;
         this.m.rightFoot.visible = _loc_1;
         this.m.body.visible = _loc_1;
         this.m.head.visible = _loc_1;
         this.m.hat.visible = _loc_1;
         this.m.expBonus.visible = _loc_1;
      }
  clickClose(): void {
         this.remove();
      }
  remove(): void {
         this.m = null;
         super.remove();
      }
  constructor(param1: string, param2: number, param3: string) {
    param2 = int(param2);
         super();
         var _loc_5= undefined;
         var _loc_6= null;
         this.intrusive = false;
         this.setBG(new EditorPopupBGGraphic());
         this.category = param1;
         this.prizeID = int(param2);
         var _loc_4= new PartDescriptions();
         this.m = new PrizePopupGraphic();
         this.hideParts();
         if(param1 == "hat")
         {
            this.showPart(this.m.hat);
            this.m.textBox.text = PartDescriptions.hatTitleArray[param2 - 1];
         }
         else if(param1 == "head")
         {
            this.showPart(this.m.head);
            this.m.textBox.text = PartDescriptions.headTitleArray[param2 - 1] + " Head";
         }
         else if(param1 == "body")
         {
            this.showPart(this.m.body);
            this.m.textBox.text = PartDescriptions.bodyTitleArray[param2 - 1] + " Body";
         }
         else if(param1 == "feet")
         {
            this.showPart(this.m.leftFoot);
            this.showPart(this.m.rightFoot);
            this.m.textBox.text = PartDescriptions.feetTitleArray[param2 - 1] + " Feet";
         }
         if(param3 == "available")
         {
            this.m.titleBox.text = "The winner of this match will earn this prize:";
         }
         else if(param3 == "won")
         {
            this.m.titleBox.text = "You are victorious! Here is your well earned prize:";
         }
         else if(param3 == "exp")
         {
            _loc_5 = "a ";
            _loc_6 = this.m.textBox.text.charAt(0).toUpperCase();
            if(param1 == "feet")
            {
               _loc_5 = "";
            }
            if(_loc_6 == "A" || _loc_6 == "E" || _loc_6 == "I" || _loc_6 == "O" || _loc_6 == "U")
            {
               _loc_5 = "an ";
            }
            this.m.titleBox.text = "You already have " + _loc_5 + this.m.textBox.text + ", so you won a:";
            this.m.textBox.text = "50% Exp Bonus!";
            this.hideParts();
            this.m.expBonus.visible = true;
         }
         this.addGraphic(this.m);
         this.createButton($b(this, 'clickClose'),"Close");
      }
}
$reg('com.jiggmin.pr3.game.PrizePopup', PrizePopup);
