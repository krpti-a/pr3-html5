// Manual fixes to the converted AS3 (see patch.mjs).
export const PATCHES = [
  // Lua (a PR3 Reborn addition) is not supported: drop the embedded Lua bootstrap script
  ['pr3/PlatformRacing3.ts', '  static _init_: any = PlatformRacing3__init_;\n', ''],
  ['pr3/PlatformRacing3.ts', '         PlatformRacing3.lua.doString(String(new PlatformRacing3._init_()));\n', ''],
  // latency probe as JSON messages (was binary packets 15/33)
  ['blossomSocket/BlossomSocket.ts', `         var data: ByteArray= new ByteArray();
         data.writeShort(15);
         this.sendBytes(data);`, `         this.send({ t: 'test_ping' });`],
  ['blossomSocket/BlossomSocket.ts', `         var data: ByteArray= new ByteArray();
         data.writeShort(33);
         data.writeInt(this.ping);
         this.sendBytes(data);`, `         this.send({ t: 'report_ping', ping: this.ping });`],
  // Work budgets and network timing use wall-clock time (see realTimer in flash/utils.ts); physics keeps
  // the deterministic frame clock.
  ['pr3/map/CommandMapLayer.ts', 'getTimer', 'realTimer'],
  ['pr3/map/ArtMapLayer.ts', 'getTimer', 'realTimer'],
  ['pr3/map/MapHolder.ts', 'getTimer', 'realTimer'],
  ['pr3/game/Minimap.ts', 'getTimer', 'realTimer'],
  ['pr3/block/BlockManager.ts', 'getTimer', 'realTimer'],
  ['blossomSocket/BlossomSocket.ts', 'getTimer', 'realTimer'],
  // The level-art cache (PNG-encoded tiles in a SharedObject) can't fit browser storage for big levels and
  // costs ~0.5 s per load; don't write it (reading still works if an entry exists).
  ['pr3/map/MapHolder.ts', `         if(!Settings.drawBackgrounds)
         {
            callback.call(this);
            return;
         }`, `         if(!Settings.drawBackgrounds || !MapHolder.WRITE_ART_CACHE)
         {
            callback.call(this);
            return;
         }`],
  ['pr3/map/MapHolder.ts', `  static CACHE_VERSION: number = 2;`, `  static CACHE_VERSION: number = 2;
  static WRITE_ART_CACHE = false;`],
  // E4X: `Row.block_id[i]` is the i-th row's block_id (an XMLList); the JSON responses expose rows as Row[i]
  ['pr3/lister/MyBlockSelector.ts', '_loc_8 = _loc_3.block_id[_loc_7];', '_loc_8 = _loc_3[_loc_7].block_id;'],
  ['pr3/lister/MyBlockSelectorCategory.ts', '_loc_8 = _loc_3.block_id[_loc_7];', '_loc_8 = _loc_3[_loc_7].block_id;'],
  // E4X params (no XML class in the port): the API layer takes a plain object
  ['pr3/lobby/multiPlayer/StartMatchPopup.ts', '_loc_1 = new XML("<Params><p_level_id>" + this.selectedLevel.levelID + "</p_level_id></Params>");', '_loc_1 = { p_level_id: this.selectedLevel.levelID };'],
  ['pr3/game/FinishPopup.ts', 'var _loc_1= new XML("<Params><p_level_id>" + this.levelID + "</p_level_id></Params>");', 'var _loc_1= { p_level_id: this.levelID };'],
  // ModSelector requests the first page from Lister's constructor, before archiveNum is set (AS3 field
  // initializers run before the constructor, TS ones after super()): skip that request, load once it's known
  ["pr3/lobby/mod/ReportedMessageSelector.ts", "  requestResultsFromServer(param1: number, param2: number): void {\n    param1 = int(param1); param2 = int(param2);\n         var _loc_3= ({} as any);", "  requestResultsFromServer(param1: number, param2: number): void {\n    param1 = int(param1); param2 = int(param2);\n         if(this.archiveNum === undefined) return;\n         var _loc_3= ({} as any);"],
  ["pr3/lobby/mod/ReportedMessageSelector.ts", "         if(param1)\n         {\n            this.archiveNum = int(1);\n         }\n", "         if(param1)\n         {\n            this.archiveNum = int(1);\n         }\n         this.setPageNum(this.getLastRememberedPage());\n"],
  ["pr3/lobby/mod/ReportedChatSelector.ts", "  requestResultsFromServer(param1: number, param2: number): void {\n    param1 = int(param1); param2 = int(param2);\n         var _loc_3= ({} as any);", "  requestResultsFromServer(param1: number, param2: number): void {\n    param1 = int(param1); param2 = int(param2);\n         if(this.archiveNum === undefined) return;\n         var _loc_3= ({} as any);"],
  ["pr3/lobby/mod/ReportedChatSelector.ts", "         if(param1)\n         {\n            this.archiveNum = int(1);\n         }\n", "         if(param1)\n         {\n            this.archiveNum = int(1);\n         }\n         this.setPageNum(this.getLastRememberedPage());\n"],
];

// AS3 private members are per-class: a subclass may declare its own private member with the same name
// without overriding the ancestor's. In TS they'd share one name, so the ancestor's private is renamed
// to `name$Class` (every occurrence in its file, including $b(this, 'name') strings).
// Found by comparing class members of the decompiled sources (tools/as3ts/shadowed.mjs).
export const PRIVATE_RENAMES = [
  ['popup/Popup.ts', 'enterFrameHandler'],         // fade-in; shadowed by Minimap
  ['popup/Popup.ts', 'addedToStageHandler'],       // click-outside-to-close; shadowed by DropdownPopup, ToolTipPopup
  ['basic/Tipable.ts', 'mouseDownHandler'],         // hide tooltip on press; shadowed by ButtonClass
  ['pr3/items/Item.ts', 'enterFrameHandler'],       // tryToUseItem each frame; shadowed by AngelWings, Bow, JetPack, SpeedBurst
  ['pr3/editor/cursor/EditorCursor.ts', 'enterFrameHandler'], // runFrame; shadowed by DrawCursor
];
