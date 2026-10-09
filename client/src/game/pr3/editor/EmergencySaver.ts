// Ported from com/jiggmin/pr3/editor/EmergencySaver.as
import { BlockEditorPage, LevelEditorPage, SecureSharedObject, Settings, StampEditorPage } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class EmergencySaver {
  static handle: string = "pr3";
  static firstRun: boolean = true;
  static generateErrorMessage(param1: string): string {
         return "You\'re not logged in to sparkworkz anymore (although it possibly still looks like you are), so your " + param1 + " could not be saved. Please log out and then log back in. Your " + param1 + " will still be here in the " + param1 + " editor when you come back. :)";
      }
  static save(param1: any = null, param2: any = null, param3: any = null): void {
         var _loc_3= null;
         if(Settings.userID > 0 && !isNaN(Settings.userID))
         {
            if(param1 == null)
            {
               param1 = LevelEditorPage.tempSavedLevel;
            }
            if(param2 == null)
            {
               param2 = BlockEditorPage.tempSavedBlock;
            }
            if(param3 == null)
            {
               param3 = StampEditorPage.tempSavedStamp;
            }
            _loc_3 = ({} as any);
            _loc_3.userID = Settings.userID;
            _loc_3.savedLevel = param1;
            _loc_3.savedBlock = param2;
            _loc_3.savedStamp = param3;
            SecureSharedObject.setLocal("pr3",_loc_3);
         }
      }
  static check(): void {
         var _loc_1= null;
         if(EmergencySaver.firstRun == true)
         {
            EmergencySaver.firstRun = false;
            _loc_1 = SecureSharedObject.getLocal(EmergencySaver.handle);
            if(_loc_1 != null && _loc_1.userID == Settings.userID)
            {
               LevelEditorPage.tempSavedLevel = _loc_1.savedLevel;
               BlockEditorPage.tempSavedBlock = _loc_1.savedBlock;
               StampEditorPage.tempSavedStamp = _loc_1.savedStamp;
               SecureSharedObject.setLocal(EmergencySaver.handle,null);
            }
         }
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.editor.EmergencySaver', EmergencySaver);
