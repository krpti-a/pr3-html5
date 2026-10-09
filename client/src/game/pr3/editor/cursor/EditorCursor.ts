// Ported from com/jiggmin/pr3/editor/cursor/EditorCursor.as
import { Event, Mouse, MouseEvent, MovieClip, Point } from '../../../../flash/index.ts';
import { $b } from '../../../../flash/as3.ts';
import { Cursor } from '../../../ui/Cursor.ts';
import { BlockEditorPageGraphic, CommandMapLayer, MapHolder, MapManager, MapPage } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class EditorCursor extends Cursor {
  active: boolean = true;
  declare editorRef: MovieClip;
  overMenu: boolean = false;
  declare map: MapHolder;
  declare me: MouseEvent;
  enterFrameHandler$EditorCursor(event: Event): void {
         this.runFrame();
      }
  mouseDownHandler(event: MouseEvent): void {
         super.mouseDownHandler(event);
         this.hideOverMenu(event);
      }
  hideOverMenu(event: MouseEvent): void {
         var _loc_3= null;
         this.overMenu = true;
         var _loc_2= (event.target);
         while(_loc_2.parent != null)
         {
            _loc_3 = _loc_2.toString();
            if(_loc_3 == "[object MapHolder]" || _loc_3 == "[object BlockEditorPageGraphic]")
            {
               this.overMenu = false;
               break;
            }
            _loc_2 = _loc_2.parent;
         }
         if(!this.overMenu && this.active)
         {
            this.map.addChild(Cursor.instance);
            this.visible = true;
            Mouse.hide();
         }
         else
         {
            if(this.map.contains(Cursor.instance))
            {
               this.map.removeChild(Cursor.instance);
            }
            this.visible = false;
            Mouse.show();
         }
      }
  runFrame(): void {
      }
  getMapPoint(): Point {
         var _loc_1: CommandMapLayer= MapManager.map.getSelectedMap();
         return new Point(_loc_1.mouseX,_loc_1.mouseY);
      }
  remove(): void {
         this.removeEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$EditorCursor'));
         if(this.map.contains(Cursor.instance))
         {
            this.map.removeChild(Cursor.instance);
         }
         this.map = null;
         this.editorRef = null;
         super.remove();
      }
  mouseUpHandler(event: MouseEvent): void {
         super.mouseUpHandler(event);
         this.hideOverMenu(event);
      }
  mouseMoveHandler(event: MouseEvent): void {
         super.mouseMoveHandler(event);
         this.hideOverMenu(event);
         this.me = event;
      }
  init(): void {
         super.init();
         this.editorRef = MapPage.instance;
         this.map = MapManager.map;
         this.addEventListener(Event.ENTER_FRAME,$b(this, 'enterFrameHandler$EditorCursor'),false,0,true);
      }
  constructor() {
         super();
         this.me = new MouseEvent(MouseEvent.MOUSE_MOVE);
         this.visible = false;
         Mouse.show();
      }
}
$reg('com.jiggmin.pr3.editor.cursor.EditorCursor', EditorCursor);
