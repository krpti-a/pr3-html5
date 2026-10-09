#!/bin/sh
# PR3_REPO: the original pr3 repo (default ../pr3), which holds the decompiled sources in reverse/.
# Re-runs the AS3 -> TS conversion (handwritten/@edited files are kept) and re-applies patches.
cd "$(dirname "$0")/../.." && FORCE=1 node tools/as3ts/convert.ts "${PR3_REPO:-../pr3}/reverse/as3-fixed" client/src/game tools/as3ts/files.txt && node tools/as3ts/patch.mjs
