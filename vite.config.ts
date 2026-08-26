import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const PRIVATE_ASSET_ROOT = process.env.POKEMON_PRIVATE_ASSET_ROOT
  ?? '/mnt/zer0models/pokemon_anime/pipeline/pokeapi';
const PRIVATE_CANONICAL_ASSETS: Record<string, { relativePath: string; sha256: string }> = {
  bulbasaur: { relativePath: 'kanto-starters/bulbasaur/hunyuan/bulbasaur_shape_8k.glb', sha256: 'cad6e93a2e77d21148f932c27688ff07c5028eb87f3ba9f891a2f3f5ad8e1354' },
  charmander: { relativePath: 'kanto-starters/charmander/hunyuan/charmander_shape_8k.glb', sha256: '82c90f71d325d3e93803978cb66e8b6eaceeda5d4280706d9eb388a81975acd2' },
  squirtle: { relativePath: 'kanto-starters/squirtle/hunyuan/squirtle_shape_8k.glb', sha256: 'b41a8ef1fc5caef02ea38eca7fa795ba974645f090e8a0574509d58c381e5805' },
  pidgey: { relativePath: 'kanto-private/pidgey/hunyuan/pidgey_klein_shape_8k.glb', sha256: '1685b6f5b9215645d274d31480cf9de8c26011aa7e424700f38b9d70cae4e261' },
  caterpie: { relativePath: 'kanto-private/caterpie/hunyuan/caterpie_klein_shape_8k.glb', sha256: '0a2093b6a4053a075c515591ae9a8f9c88b27fa66c27b72493cdac3648e247f2' },
  geodude: { relativePath: 'kanto-private/geodude/hunyuan/geodude_klein_shape_8k.glb', sha256: 'f337566e5eece5d263cd7725d65563d31c0418fd138fa45663be679728d8d809' },
};

function privateAssetMiddleware(req: { url?: string }, res: import('http').ServerResponse, next: () => void): void {
  const url = req.url?.split('?')[0] ?? '';
  if (!url.startsWith('/private-assets/')) return next();
  const match = /^\/private-assets\/([a-z0-9-]+)\.glb$/.exec(url);
  const asset = match ? PRIVATE_CANONICAL_ASSETS[match[1]!] : undefined;
  if (!asset) { res.statusCode = 404; res.end('Canonical private asset is not allowlisted'); return; }
  const file = path.resolve(PRIVATE_ASSET_ROOT, asset.relativePath);
  if (!file.startsWith(path.resolve(PRIVATE_ASSET_ROOT) + path.sep) || !fs.existsSync(file)) {
    res.statusCode = 404; res.end('Canonical private asset is missing'); return;
  }
  const bytes = fs.readFileSync(file);
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  if (actual !== asset.sha256) { res.statusCode = 409; res.end('Canonical private asset hash mismatch'); return; }
  res.setHeader('Content-Type', 'model/gltf-binary');
  res.setHeader('Cache-Control', 'private, no-store');
  res.end(bytes);
}

/**
 * Ship only content/game under /content (not the full research warehouse).
 * public/ historically had content → ../content symlink and ab/ research viewer
 * — both must never enter dist. publicDir is disabled; this plugin copies the
 * game pack only.
 */
function shipGameContentOnly(includePrivatePack: boolean): Plugin {
  const gameSrc = path.resolve(__dirname, 'content/game');

  const copyGame = (outDir: string) => {
    const dest = path.join(outDir, 'content', 'game');
    fs.mkdirSync(dest, { recursive: true });
    if (!fs.existsSync(gameSrc)) {
      throw new Error(`[ship] content/game missing at ${gameSrc}`);
    }
    for (const entry of fs.readdirSync(gameSrc, { withFileTypes: true })) {
      if (!includePrivatePack && entry.name === 'kanto-private.json') continue;
      fs.cpSync(path.join(gameSrc, entry.name), path.join(dest, entry.name), { recursive: true });
    }
  };

  const stripWarehouse = (outDir: string) => {
    for (const leak of [
      'content/canonical',
      'content/derived',
      'content/smoke',
      'content/manifests',
      'content/schema',
      'ab',
      'content',
    ]) {
      const p = path.join(outDir, leak);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    }
  };

  return {
    name: 'ship-game-content-only',
    configureServer(server) {
      server.middlewares.use(privateAssetMiddleware);
      // Dev: serve /content/game/* from content/game without exposing warehouse.
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/content/')) return next();
        // Block warehouse paths in dev too (fail closed for local research leaks).
        if (
          url.startsWith('/content/canonical') ||
          url.startsWith('/content/derived') ||
          url.startsWith('/content/smoke') ||
          url.startsWith('/content/manifests') ||
          url.startsWith('/content/schema') ||
          url === '/content' ||
          url === '/content/'
        ) {
          res.statusCode = 404;
          res.end('Not found (ship boundary)');
          return;
        }
        if (url.startsWith('/content/game/')) {
          const rel = url.slice('/content/game/'.length);
          const file = path.resolve(gameSrc, rel);
          if (!file.startsWith(gameSrc) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            res.statusCode = 404;
            res.end('Not found');
            return;
          }
          res.setHeader('Content-Type', file.endsWith('.json') ? 'application/json' : 'application/octet-stream');
          fs.createReadStream(file).pipe(res);
          return;
        }
        res.statusCode = 404;
        res.end('Not found (ship boundary)');
      });
      // Block research A/B viewer in dev as well when requested via /ab
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (url === '/ab' || url.startsWith('/ab/')) {
          res.statusCode = 404;
          res.end('Not found (ship boundary)');
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(privateAssetMiddleware);
    },
    writeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      stripWarehouse(outDir);
      copyGame(outDir);
    },
    closeBundle() {
      // Second pass after any late public copies
      const outDir = path.resolve(__dirname, 'dist');
      stripWarehouse(outDir);
      copyGame(outDir);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const privateBuild = command === 'build' && mode === 'private-local';
  return {
    base: process.env.BASE_PATH ?? '/',
    resolve: {
      alias: {
        ...(command === 'build' && !privateBuild
          ? { '@/creatures/privateCanonical.ts': path.resolve(__dirname, 'src/creatures/privateCanonical.distributable.ts') }
          : {}),
        '@': path.resolve(__dirname, 'src'),
      },
    },
  // Do not copy public/ (contains content→warehouse symlink and ab/ research).
  // Game pack is installed by shipGameContentOnly plugin only.
  publicDir: false,
  server: {
    port: 5180,
    strictPort: true,
    host: '0.0.0.0', // Zen/LAN + 127.0.0.1
    fs: { allow: ['.'] },
  },
  preview: {
    port: 4180,
    strictPort: true,
    host: '0.0.0.0', // Zen/LAN + 127.0.0.1
  },
  plugins: [shipGameContentOnly(privateBuild)],
  build: {
    target: 'es2022',
    sourcemap: true,
    copyPublicDir: false,
    rollupOptions: {
      // Ship surface is the main demo only. Research A/B viewer (ab.html) is
      // intentionally excluded from the production multi-page bundle.
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  };
});
