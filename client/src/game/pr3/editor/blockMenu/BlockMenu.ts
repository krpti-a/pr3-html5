// Ported from com/jiggmin/pr3/editor/blockMenu/BlockMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { Block, BlockDropperButtonGraphic, BlockDropperMenu, BlockKillerButtonGraphic, BlockKillerMenu, BlockMoverButtonGraphic, BlockMoverMenu, MapManager } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class BlockMenu extends OptionMenu {
  static lastSelected: any = "BlockDropperMenu";
  init(): void {
         MapManager.map.selectMap(MapManager.map.blockMap);
         this.selectSubMenu(BlockMenu.lastSelected);
         super.init();
      }
  remove(): void {
         if(this.selectedSubMenu != null)
         {
            BlockMenu.lastSelected = this.selectedSubMenu;
         }
         super.remove();
      }
  constructor() {
         super();
         this.createSubMenuButton(new BlockMoverButtonGraphic(),"BlockMoverMenu","Block Mover \nMove blocks with masterful grace!");
         this.createSubMenuButton(new BlockKillerButtonGraphic(),"BlockKillerMenu","Block Killer \nDelete blocks via a massive swath of destruction!");
         this.createSubMenuButton(new BlockDropperButtonGraphic(),"BlockDropperMenu","Block Dropper \nPaint the world with blocks!");
      }
}
$reg('com.jiggmin.pr3.editor.blockMenu.BlockMenu', BlockMenu);
