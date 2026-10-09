// Ported from com/jiggmin/pr3/editor/blockEditor/VisualStudioCodeHandler.as
import { Event, setInterval } from '../../../../flash/index.ts';
import { $as } from '../../../../flash/as3.ts';
import { File, FileMode, FileStream, NativeProcess, NativeProcessStartupInfo, PlatformRacing3 } from '../../../refs.ts';
import { $reg } from '../../../refs.ts';

export class VisualStudioCodeHandler {
  static editorFile: File = null;
  static startSession(code: string, codeType: string, updateFallback: Function): number {
         var fileStream: FileStream;
         var tempFolder: File= null;
         var codeFile: File= null;
         var fileLastModifier: number= NaN;
         var documentsDirectory: File= null;
         tempFolder = File.cacheDirectory.resolvePath("PlatformRacing3");
         tempFolder.createDirectory();
         codeFile = tempFolder.resolvePath("code." + codeType);
         fileStream = new FileStream();
         fileStream.open(codeFile,FileMode.WRITE);
         fileStream.writeUTFBytes(code.replace(/\r/g,"\n"));
         fileStream.close();
         if(VisualStudioCodeHandler.editorFile == null)
         {
            documentsDirectory = File.documentsDirectory;
            documentsDirectory.addEventListener(Event.SELECT,function (event: Event): any {
               VisualStudioCodeHandler.editorFile = $as(event.target, File);
               VisualStudioCodeHandler.launchEditor($as(event.target, File),codeFile,tempFolder);
            },false,0,true);
            documentsDirectory.browseForOpen("Select editor");
         }
         else
         {
            VisualStudioCodeHandler.launchEditor(VisualStudioCodeHandler.editorFile,codeFile,tempFolder);
         }
         fileLastModifier = Number(codeFile.modificationDate.getTime());
         return setInterval(function (): any {
            var modificationDate= codeFile.modificationDate.getTime();
            if(modificationDate == fileLastModifier)
            {
               return;
            }
            fileLastModifier = modificationDate;
            var fileStream= new FileStream();
            fileStream.open(codeFile,FileMode.READ);
            updateFallback(fileStream.readUTFBytes(fileStream.bytesAvailable).replace(/\r\n/g,"\n"));
            fileStream.close();
         },200);
      }
  static launchEditor(editorFile: File, codeFile: File, workingDirectory: File): void {
         var startupInfo: NativeProcessStartupInfo= new NativeProcessStartupInfo();
         startupInfo.executable = editorFile;
         startupInfo.arguments = ([codeFile.nativePath]);
         startupInfo.workingDirectory = workingDirectory;
         var process: NativeProcess= new NativeProcess();
         process.start(startupInfo);
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.editor.blockEditor.VisualStudioCodeHandler', VisualStudioCodeHandler);
