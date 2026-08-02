import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

/**
 * Ship only content/game under /content (not the full research warehouse).
 * public/content historically symlinked the entire content/ tree — that leaks
 * canonical/derived/smoke into dist. This plugin copies the game pack only.
 */
function shipGameContentOnly(): Plugin {
  const gameSrc = path.resolve(__dirname, 'content/game');
  const virtualPublic = path.resolve(__dirname, 'public');

  const copyGame = (outDir: string) => {
    const dest = path.join(outDir, 'content', 'game');
    fs.mkdirSync(dest, { recursive: true });
    if (!fs.existsSync(gameSrc)) {
      throw new Error(`[ship] content/game missing at ${gameSrc}`);
    }
    fs.cpSync(gameSrc, dest, { recursive: true });
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
    },
    writeBundle(_opts, _bundle) {
      const outDir = path.resolve(__dirname, 'dist');
      // Remove any accidental content/ab copies from publicDir.
      for (const leak of ['content/canonical', 'content/derived', 'content/smoke', 'ab', 'content']) {
        const p = path.join(outDir, leak);
        if (fs.existsSync(p)) {
          fs.rmSync(p, { recursive: true, force: true });
        }
      }
      copyGame(outDir);
    },
    // Keep unused var referenced for future publicDir hybrid
    configResolved() {
      void virtualPublic;
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
  // Ship publicDir with research ab/ excluded via plugin cleanup + empty public content.
  // public/content symlink is ignored: we do not rely on it for ship (plugin copies game pack).
  publicDir: 'public',
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
    // Vite copies public/ first; our writeBundle strips warehouse + ab then installs game pack.
    copyPublicDir: true,
    rollupOptions: {
      // Ship surface is the main demo only. Research A/B viewer (ab.html) is
      // intentionally excluded from the production multi-page bundle.
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
