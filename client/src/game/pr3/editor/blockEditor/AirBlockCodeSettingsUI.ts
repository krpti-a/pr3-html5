// Ported from com/jiggmin/pr3/editor/blockEditor/AirBlockCodeSettingsUI.as
import { VisualStudioCodeHandler } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class AirBlockCodeSettingsUI {
  static openInVSCode(code: string, codeType: string, updateFallback: Function): number {
         return VisualStudioCodeHandler.startSession(code,codeType,updateFallback);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.AirBlockCodeSettingsUI', AirBlockCodeSettingsUI);
