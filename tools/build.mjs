// Bundles the client (TypeScript) into public/game.js with esbuild.
import * as esbuild from 'esbuild';
const watch = process.argv.includes('--watch');
const opts = {
  entryPoints: { game: 'client/src/main.ts', viewer: 'client/src/viewer.ts' },
  bundle: true, format: 'esm', target: 'es2022', outdir: 'public', sourcemap: true,
  minify: !watch, keepNames: true, logLevel: 'info',
  define: { __BUILD__: JSON.stringify(Date.now().toString(36)) },
  tsconfigRaw: { compilerOptions: { useDefineForClassFields: false, experimentalDecorators: false } },
};
if (watch) await (await esbuild.context(opts)).watch();
else await esbuild.build(opts);
