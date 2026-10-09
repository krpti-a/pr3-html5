package com.jiggmin.data
{
   import com.jiggmin.pr3.*;
   import com.jiggmin.pr3.editor.levelEditor.LevelEditorPage;
   import com.jiggmin.pr3.map.MapManager;
   import flash.display.*;
   import flash.events.*;
   import flash.external.ExternalInterface;

   // Physics reference harness (injected into the original SWF with FFDec; see tools/physics/README.md).
   // Original com.jiggmin.data.Key plus: a scripted keyboard (ptSched), a deterministic clock
   // (ptNow, used by the patched ActivePlayer instead of getTimer) and a scenario driver that
   // opens the level editor with a given level and starts its offline test mode.
   public class Key
   {

      private static var initialized:Boolean = false;

      private static var keysDown:Object = new Object();

      private static var keysPressed:Object = new Object();

      public static var ptFrame:int = 0;

      public static var ptF:int = -1;

      public static var ptSched:Array = null;

      public static var ptCfg:Object = null;

      public static var ptStage:int = 0;

      public static var ptWait:int = 0;

      public static var ptSteps:Array = [];

      public function Key()
      {
         super();
      }

      public static function init(stage:Stage) : void
      {
         if(!Key.initialized)
         {
            Key.initialized = true;
            stage.addEventListener(KeyboardEvent.KEY_DOWN,Key.keyDown);
            stage.addEventListener(KeyboardEvent.KEY_UP,Key.keyUp);
            stage.addEventListener(Event.DEACTIVATE,Key.clearKeys);
            stage.addEventListener(Event.ENTER_FRAME,Key.enterFrame);
         }
      }

      public static function get isReady() : Boolean
      {
         return Key.initialized;
      }

      private static function clearKeys(event:Event) : void
      {
         Key.keysDown = new Object();
         Key.keysPressed = new Object();
      }

      public static function isDown(key:uint) : Boolean
      {
         if(!Key.initialized)
         {
            throw new Error("Key class has yet been initialized.");
         }
         if(Key.ptSched != null)
         {
            return Key.ptScheduled(key);
         }
         return key in keysDown;
      }

      public static function ptScheduled(key:uint) : Boolean
      {
         var s:Array = null;
         if(Key.ptF < 0)
         {
            return false;
         }
         for each(s in Key.ptSched)
         {
            if(s[2] == key && Key.ptF >= s[0] && Key.ptF < s[1])
            {
               return true;
            }
         }
         return false;
      }

      public static function isPressed(key:uint) : Boolean
      {
         if(!Key.initialized)
         {
            throw new Error("Key class has yet been initialized.");
         }
         return key in keysPressed;
      }

      public static function ptNow() : Number
      {
         return Math.floor(Key.ptFrame * 100 / 3);
      }

      public static function ptStep(p:*, t:Number) : void
      {
         Key.ptSteps.push([Key.ptF,t,p.x,p.y,p.velX,p.velY,p.realX,p.realY,p.rotation,p.getState(),p.remainingJumpVel,p.superJumpVel]);
      }

      private static function ptDrive() : void
      {
         if(Key.ptStage == 0)
         {
            if(Key.ptFrame == 2)
            {
               Key.ptCfg = ExternalInterface.call("ptConfig");
               if(Key.ptCfg == null)
               {
                  Key.ptStage = 9;
                  return;
               }
            }
            if(Key.ptCfg != null && PlatformRacing3.instance != null && Key.ptFrame > 60)
            {
               Settings.myCharacter = Key.ptCfg.character;
               LevelEditorPage.tempSavedLevel = Key.ptCfg.level;
               PlatformRacing3.setPage(new LevelEditorPage());
               Key.ptStage = 1;
               Key.ptWait = 0;
            }
         }
         else if(Key.ptStage == 1)
         {
            Key.ptWait++;
            if(LevelEditorPage.instance != null && MapManager.map != null && !MapManager.map.drawing && Key.ptWait > 60 && Key.ptFrame % 3 == 0)
            {
               Key.ptSched = Key.ptCfg.sched;
               Key.ptF = 0;
               LevelEditorPage.instance.startTest();
               Key.ptStage = 2;
            }
         }
         else if(Key.ptStage == 2)
         {
            if(Key.ptF >= Key.ptCfg.frames)
            {
               ExternalInterface.call("ptDone",Key.ptSteps);
               Key.ptStage = 3;
            }
         }
      }

      private static function keyDown(event:KeyboardEvent) : void
      {
         Key.keysDown[event.keyCode] = true;
      }

      private static function keyUp(event:KeyboardEvent) : void
      {
         if(event.keyCode in Key.keysDown)
         {
            delete Key.keysDown[event.keyCode];
         }
         Key.keysPressed[event.keyCode] = true;
      }

      private static function enterFrame(event:Event) : void
      {
         Key.keysPressed = new Object();
         Key.ptFrame++;
         if(Key.ptF >= 0)
         {
            Key.ptF++;
         }
         Key.ptDrive();
      }
   }
}
