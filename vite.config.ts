import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

/**
 * Ship only content/game under /content (not the full research warehouse).
 * public/ historically had content → ../content symlink and ab/ research viewer
 * — both must never enter dist. publicDir is disabled; this plugin copies the
 * game pack only.
 */
function shipGameContentOnly(): Plugin {
  const gameSrc = path.resolve(__dirname, 'content/game');

  const copyGame = (outDir: string) => {
    const dest = path.join(outDir, 'content', 'game');
    fs.mkdirSync(dest, { recursive: true });
    if (!fs.existsSync(gameSrc)) {
      throw new Error(`[ship] content/game missing at ${gameSrc}`);
    }
    fs.cpSync(gameSrc, dest, { recursive: true });
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

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: {
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
  plugins: [shipGameContentOnly()],
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
});
