// Ported from com/jiggmin/pr3/editor/artMenu/ArtMenu.as
import { OptionMenu } from '../OptionMenu.ts';
import { ArtLayerMenu, BGPickerButton, BrushMenu, EraserButtonGraphic, EraserMenu, LevelEditorPage, MapPage, PaintButtonGraphic, Stamp, StampButtonGraphic, StampMenu, TextButtonGraphic, TextMenu } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class ArtMenu extends OptionMenu {
  static lastSelected: string = "BrushMenu";
  declare bgPicker: BGPickerButton;
  declare layerPopup: ArtLayerMenu;
  init(): void {
         this.selectSubMenu(ArtMenu.lastSelected);
         this.layerPopup = new ArtLayerMenu();
         this.addPopup(this.layerPopup);
         super.init();
      }
  remove(): void {
         ArtMenu.lastSelected = this.selectedSubMenu;
         if(this.layerPopup != null)
         {
            this.layerPopup.remove();
            this.layerPopup = null;
         }
         if(this.bgPicker != null)
         {
            this.bgPicker.remove();
            this.bgPicker = null;
         }
         super.remove();
      }
  constructor() {
         super();
         if(MapPage.instance instanceof LevelEditorPage)
         {
            this.bgPicker = new BGPickerButton();
            this.addOption(this.bgPicker);
         }
         this.createSubMenuButton(new PaintButtonGraphic(),"BrushMenu","Paintbrush \nPaint the world with color!");
         this.createSubMenuButton(new EraserButtonGraphic(),"EraserMenu","Eraser \nRestore pristine clean to the land.");
         this.createSubMenuButton(new StampButtonGraphic(),"StampMenu","Stamp \nStamp an image into existence!");
         this.createSubMenuButton(new TextButtonGraphic(),"TextMenu","Text \nType words!");
      }
}
$reg('com.jiggmin.pr3.editor.artMenu.ArtMenu', ArtMenu);
