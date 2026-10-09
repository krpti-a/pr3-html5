// Ported from com/jiggmin/pr3/lobby/customize/ExpBar.as
import { MovieClip, TextField, TextFieldAutoSize, TextFormat } from '../../../../flash/index.ts';
import { int } from '../../../../flash/as3.ts';
import { Removable } from '../../../basic/Removable.ts';
import { EasyProgressBar } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ExpBar extends Removable {
  declare m: MovieClip;
  declare bar: EasyProgressBar;
  declare label: TextField;
  declare progressText: TextField;
  declare percentageText: TextField;
  constructTextField(_text: string, _size: number = 14): TextField {
    _size = int(_size);
         var textField: TextField= new TextField();
         textField.embedFonts = true;
         textField.selectable = false;
         textField.autoSize = TextFieldAutoSize.LEFT;
         var format: TextFormat= new TextFormat();
         format.font = "Action Man";
         format.color = 990323;
         format.size = _size;
         textField.defaultTextFormat = format;
         textField.text = _text;
         textField.height = _size + 10;
         return textField;
      }
  expForRankUp(rank: number): number {
    rank = int(rank);
         return rank == 0 ? 1 : Math.floor(30 * Math.pow(1.25,rank - 1));
      }
  remove(): void {
         this.m.removeChild(this.bar);
         this.m.removeChild(this.label);
         this.m.removeChild(this.progressText);
         this.m.removeChild(this.percentageText);
         this.bar = null;
         this.label = null;
         this.progressText = null;
         this.percentageText = null;
         this.removeChild(this.m);
         this.m = null;
         super.remove();
      }
  constructor(expAmount: number, rank: number, expBarWidth: number) {
    rank = int(rank); expBarWidth = int(expBarWidth);
         var expNeeded: number= NaN;
         super();
         this.m = new MovieClip();
         this.bar = new EasyProgressBar();
         this.bar.width = expBarWidth;
         expNeeded = Number(this.expForRankUp(rank));
         this.bar.percent = expAmount / expNeeded * 100;
         this.bar.selectable = false;
         this.label = this.constructTextField("Rank Progress");
         this.label.y -= this.bar.height;
         this.progressText = this.constructTextField(String(expAmount) + " / " + String(expNeeded),10);
         this.progressText.y += 10;
         var _percent: number= rank == 0 ? 0 : Math.round(this.bar.percent * Math.pow(10,2)) / Math.pow(10,2);
         this.percentageText = this.constructTextField(String(_percent) + "%",10);
         this.percentageText.x = this.bar.x + this.bar.width - this.percentageText.width;
         this.percentageText.y += 10;
         this.m.addChild(this.bar);
         this.m.addChild(this.label);
         this.m.addChild(this.progressText);
         this.m.addChild(this.percentageText);
         this.addChild(this.m);
      }
}
$reg('com.jiggmin.pr3.lobby.customize.ExpBar', ExpBar);
