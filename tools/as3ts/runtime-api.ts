// Members of the flash-lite runtime classes that ported subclasses may reference implicitly.
const m = (s: string) => new Map(s.split(/\s+/).filter(Boolean).map(x => { const [n, k] = x.split(':'); return [n, k === 'm' ? 'method' : 'var'] as [string, string]; }));
export const RUNTIME_MEMBERS: Record<string, Map<string, string>> = {
  EventDispatcher: m('addEventListener:m removeEventListener:m dispatchEvent:m hasEventListener:m willTrigger:m'),
  DisplayObject: m(`x y z scaleX scaleY scaleZ rotation rotationX rotationY rotationZ alpha visible name parent root stage mask filters transform width height
    blendMode cacheAsBitmap opaqueBackground scrollRect scale9Grid loaderInfo mouseX mouseY accessibilityProperties
    getBounds:m getRect:m localToGlobal:m globalToLocal:m hitTestPoint:m hitTestObject:m`),
  InteractiveObject: m('mouseEnabled doubleClickEnabled tabEnabled tabIndex focusRect contextMenu needsSoftKeyboard'),
  DisplayObjectContainer: m(`numChildren mouseChildren tabChildren addChild:m addChildAt:m removeChild:m removeChildAt:m removeChildren:m getChildAt:m
    getChildByName:m getChildIndex:m setChildIndex:m swapChildren:m swapChildrenAt:m contains:m getObjectsUnderPoint:m`),
  Sprite: m('graphics buttonMode useHandCursor hitArea dropTarget soundTransform startDrag:m stopDrag:m'),
  MovieClip: m(`currentFrame totalFrames framesLoaded currentLabel currentFrameLabel currentLabels currentScene isPlaying enabled trackAsMenu
    gotoAndStop:m gotoAndPlay:m play:m stop:m nextFrame:m prevFrame:m addFrameScript:m`),
  Shape: m('graphics'),
  Bitmap: m('bitmapData smoothing pixelSnapping'),
  SimpleButton: m('upState overState downState hitTestState enabled useHandCursor trackAsMenu soundTransform'),
  TextField: m(`text htmlText textColor textWidth textHeight autoSize wordWrap multiline type selectable border borderColor background backgroundColor
    embedFonts maxChars restrict displayAsPassword defaultTextFormat length numLines scrollV maxScrollV bottomScrollV scrollH maxScrollH
    appendText:m replaceText:m setTextFormat:m getTextFormat:m setSelection:m getLineText:m getCharBoundaries:m`),
  BitmapData: m(`width height rect transparent draw:m drawWithQuality:m copyPixels:m fillRect:m getPixel:m getPixel32:m setPixel:m setPixel32:m
    applyFilter:m clone:m dispose:m lock:m unlock:m colorTransform:m getColorBoundsRect:m floodFill:m hitTest:m setPixels:m getPixels:m scroll:m`),
  Sound: m('length url bytesLoaded bytesTotal play:m load:m close:m'),
  Event: m('type bubbles cancelable target currentTarget eventPhase stopPropagation:m stopImmediatePropagation:m preventDefault:m isDefaultPrevented:m clone:m'),
  Error: m('message name errorID getStackTrace:m'),
  Timer: m('delay repeatCount currentCount running start:m stop:m reset:m'),
  Socket: m('connected bytesAvailable timeout endian connect:m close:m flush:m readBytes:m readUnsignedShort:m readShort:m readInt:m writeBytes:m writeShort:m writeByte:m writeInt:m writeUTFBytes:m'),
};
export const RUNTIME_CLASS_BASES: Record<string, string> = {
  DisplayObject: 'EventDispatcher', InteractiveObject: 'DisplayObject', DisplayObjectContainer: 'InteractiveObject', Sprite: 'DisplayObjectContainer',
  MovieClip: 'Sprite', Shape: 'DisplayObject', Bitmap: 'DisplayObject', SimpleButton: 'InteractiveObject', TextField: 'InteractiveObject',
  Stage: 'DisplayObjectContainer', Timer: 'EventDispatcher', Sound: 'EventDispatcher', Socket: 'EventDispatcher',
  MouseEvent: 'Event', KeyboardEvent: 'Event', TimerEvent: 'Event', TextEvent: 'Event', ErrorEvent: 'TextEvent', IOErrorEvent: 'ErrorEvent', ProgressEvent: 'Event', FocusEvent: 'Event',
};
export const RUNTIME_EXPORTS = new Set(`Point Rectangle Matrix ColorTransform Transform Event MouseEvent KeyboardEvent FocusEvent TextEvent TimerEvent ErrorEvent IOErrorEvent
  SecurityErrorEvent ProgressEvent HTTPStatusEvent DataEvent EventDispatcher DisplayObject InteractiveObject DisplayObjectContainer Sprite MovieClip Shape
  StaticText SimpleButton BitmapData Bitmap Stage LoaderInfo TextField TextFormat TextFieldAutoSize TextFieldType TextFormatAlign AntiAliasType GridFitType TextLineMetrics
  getTimer setTimeout setInterval clearTimeout clearInterval Timer Dictionary getQualifiedClassName trace navigateToURL describeType ByteArray
  Sound SoundChannel SoundTransform SoundMixer SoundLoaderContext SharedObject URLRequest URLRequestHeader URLRequestMethod URLLoaderDataFormat URLVariables URLLoader
  BitmapFilter GlowFilter DropShadowFilter BlurFilter ColorMatrixFilter BevelFilter BitmapFilterQuality Keyboard KeyLocation Mouse MouseCursor ContextMenu ContextMenuItem
  Capabilities System Security Multitouch MultitouchInputMode StageDisplayState StageQuality BlendMode PixelSnapping GradientType SpreadMethod InterpolationMethod
  LineScaleMode CapsStyle JointStyle ExternalInterface getDefinitionByName Font stage`.split(/\s+/).filter(Boolean));
