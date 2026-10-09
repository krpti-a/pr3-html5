#!/bin/sh
# Builds the physics-reference SWF: original game-fixed.swf + instrumented Key and ActivePlayer.
# Needs: FFDec CLI (FFDEC env, default $PR3_REPO/reverse/tools/ffdec/ffdec-cli.jar), Java, decompiled sources in $PR3_REPO/reverse/as3-fixed.
# PR3_REPO: the original pr3 repo (default ../pr3 next to this project).
set -e
cd "$(dirname "$0")"
ROOT=${PR3_REPO:-../../../pr3}
FFDEC=${FFDEC:-$ROOT/reverse/tools/ffdec/ffdec-cli.jar}
SRC=$ROOT/reverse/as3-fixed
OUT=${OUT:-.out}
mkdir -p $OUT
# ActivePlayer: deterministic clock in place of getTimer() for stepping, and a log call after each physics step.
perl -pe 's/this\.lastTime = getTimer\(\);/this.lastTime = Key.ptNow();/; s/var currentTime:\* = getTimer\(\);/var currentTime:* = Key.ptNow();/; s/^( *)this\.step\((stepTimeMS|timeElapsed)\);(\r?)$/$1this.step($2);$3\n$1Key.ptStep(this,$2);/' \
    $SRC/com/jiggmin/pr3/player/ActivePlayer.as > $OUT/ActivePlayer.as
test "$(grep -c 'Key.pt' $OUT/ActivePlayer.as)" = 4 || { echo "ActivePlayer patch did not apply"; exit 1; }
java -jar $FFDEC -replace $ROOT/client/pr3-fixed/game-fixed.swf $OUT/tmp.swf com.jiggmin.data.Key as3/Key.as
java -jar $FFDEC -replace $OUT/tmp.swf $OUT/physics-ref.swf com.jiggmin.pr3.player.ActivePlayer $OUT/ActivePlayer.as
rm $OUT/tmp.swf
echo "built $OUT/physics-ref.swf"
