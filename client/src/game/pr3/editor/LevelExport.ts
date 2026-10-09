// Ported from com/jiggmin/pr3/editor/LevelExport.as
import { Bitmap, ByteArray, Dictionary, Event, Rectangle } from '../../../flash/index.ts';
import { int, $as, $each, $keys } from '../../../flash/as3.ts';
import { ArtMapLayer, Block, Data, File, FileMode, FileStream, LevelEditorPage, MapManager, PNGEncoderOptions } from '../../refs.ts';
import { $reg } from '../../refs.ts';

export class LevelExport {
  static startExport(): void {
         var documentsDirectory: File= File.documentsDirectory;
         documentsDirectory.addEventListener(Event.SELECT,LevelExport.selectExportDirectory,false,0,true);
         documentsDirectory.browseForDirectory("Level export");
      }
  static selectExportDirectory(event: Event): void {
         var artLayer: ArtMapLayer= null;
         var artDataStream: FileStream= null;
         var blocks: any[]= null;
         var exportedBlocks: any= null;
         var block: Block= null;
         var blocksDataStream: FileStream= null;
         var levelDataStream: FileStream= null;
         var layerDirectory: File= null;
         var data: any= null;
         var blocksDataDirectory: File= null;
         var title: string= LevelEditorPage.instance.title;
         if(title == null || title.length <= 0)
         {
            title = "New level";
         }
         var rootDirectory: File= $as(event.target, File);
         var levelDirectory: File= rootDirectory.resolvePath(title);
         var artDirectory: File= levelDirectory.resolvePath("Art");
         var blocksDirectory: File= levelDirectory.resolvePath("Blocks");
         var artLayers: any[]=  [];
         for (artLayer of $each(MapManager.map.artMapArray))
         {
            layerDirectory = artDirectory.resolvePath(artLayer.mapName + "_" + artLayer.sortNum);
            layerDirectory.createDirectory();
            artLayers.push(LevelExport.exportLayer(artLayer,layerDirectory));
         }
         artDataStream = new FileStream();
         artDataStream.open(artDirectory.resolvePath("art.json"),FileMode.WRITE);
         artDataStream.writeUTFBytes(JSON.stringify(artLayers));
         artDataStream.close();
         blocks =  [];
         exportedBlocks = new Dictionary();
         for (block of $each(MapManager.map.blockMap.createUberArray()))
         {
            if(exportedBlocks[block.id] !== true)
            {
               exportedBlocks[block.id] = true;
               blocksDataDirectory = blocksDirectory.resolvePath("Data");
               blocksDataDirectory.createDirectory();
               LevelExport.exportBlock(block,blocksDataDirectory);
            }
            data = ({} as any);
            data.id = block.id;
            data.x = block.tileX;
            data.y = block.tileY;
            blocks.push(data);
         }
         blocksDataStream = new FileStream();
         blocksDataStream.open(blocksDirectory.resolvePath("blocks.json"),FileMode.WRITE);
         blocksDataStream.writeUTFBytes(JSON.stringify(blocks));
         blocksDataStream.close();
         levelDataStream = new FileStream();
         levelDataStream.open(levelDirectory.resolvePath("level.json"),FileMode.WRITE);
         levelDataStream.writeUTFBytes(JSON.stringify(LevelEditorPage.instance.getSaveObj(false)));
         levelDataStream.close();
      }
  static exportBlock(block: Block, destination: File): void {
         var encoded: ByteArray= block.bitmapData.encode(block.bitmapData.rect,new PNGEncoderOptions());
         var streamPng: FileStream= new FileStream();
         streamPng.open(destination.resolvePath(block.id + ".png"),FileMode.WRITE);
         streamPng.writeBytes(encoded);
         streamPng.close();
         var streamData: FileStream= new FileStream();
         streamData.open(destination.resolvePath(block.id + ".json"),FileMode.WRITE);
         streamData.writeUTFBytes(JSON.stringify(block.vars));
         streamData.close();
      }
  static exportLayer(artLayer: ArtMapLayer, destination: File): any {
         var bitmapIndex: string= null;
         var data: any= null;
         var bitmap: Bitmap= null;
         var encoded: ByteArray= null;
         var stream: FileStream= null;
         var tile: Rectangle= new Rectangle(0,0,artLayer.tileSize,artLayer.tileSize);
         for (bitmapIndex of $keys(artLayer.bitmapArray))
         {
            bitmap = artLayer.bitmapArray[int(bitmapIndex)];
            if(bitmap != null)
            {
               encoded = bitmap.bitmapData.encode(tile,new PNGEncoderOptions());
               stream = new FileStream();
               stream.open(destination.resolvePath(bitmapIndex + ".png"),FileMode.WRITE);
               stream.writeBytes(encoded);
               stream.close();
            }
         }
         data = ({} as any);
         data.mapName = artLayer.mapName;
         data.depth = artLayer.depth;
         data.alpha = artLayer.alpha;
         data.sortNum = artLayer.sortNum;
         data.layerNum = artLayer.layerNum;
         return data;
      }
  constructor() {
         
      }
}
$reg('com.jiggmin.pr3.editor.LevelExport', LevelExport);
