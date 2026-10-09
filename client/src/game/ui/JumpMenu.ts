// Ported from com/jiggmin/ui/JumpMenu.as
import { int, $b } from '../../flash/as3.ts';
import { FocusPopup } from '../popup/FocusPopup.ts';
import { EditorPopupBGGraphic, JumpMenuSeparatorGraphic, TextButton } from '../refs.ts';
import { $reg } from '../refs.ts';

export class JumpMenu extends FocusPopup {
  posY: number = 0;
  init(): void {
         super.init();
         this.createSeparator();
         this.createButton("Never Mind",$b(this, 'clickClose'));
      }
  clickClose(): void {
         this.remove();
      }
  createSeparator(): void {
         var _loc_1= null;
         _loc_1 = new JumpMenuSeparatorGraphic();
         _loc_1.y = this.posY + 5;
         this.addGraphic(_loc_1);
         this.posY = int(this.posY + (10));
      }
  createButton(param1: string, param2: Function): void {
         var _loc_3= null;
         _loc_3 = new TextButton();
         _loc_3.width = 120;
         _loc_3.y = this.posY;
         _loc_3.init(param1,param2);
         _loc_3.align = "left";
         this.addGraphic(_loc_3);
         this.posY = int(this.posY + (20));
      }
  constructor() {
         super();
         super.init();
         this.autoPosition = false;
         this.bg.parent.removeChild(this.bg);
         this.bg = new EditorPopupBGGraphic();
         this.addChildAt(this.bg,0);
      }
}
$reg('com.jiggmin.ui.JumpMenu', JumpMenu);
