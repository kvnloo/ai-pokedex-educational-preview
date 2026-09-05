import type { Plugin } from 'vite';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import assets from '../../canonical/devices/field-os/assets.json';

function verified(file: string, sha256: string): Buffer {
  const bytes = readFileSync(file);
  if (createHash('sha256').update(bytes).digest('hex') !== sha256) throw new Error('Field OS asset hash mismatch');
  return bytes;
}

/** Exact private presentation assets. The research warehouse is never exposed. */
export function fieldOsAssets(privateBuild: boolean): Plugin {
  let output = '';
  const files = new Map<string, { path: string; sha256: string; type: 'image/png' | 'model/gltf-binary' }>([
    ...assets.images.map(image => [`/field-os-assets/home/${image.nationalId}.png`, { path: join(assets.referenceRoot, image.object), sha256: image.sha256, type: 'image/png' }] as const),
    [`/field-os-assets/${assets.opening.filename}`, { ...assets.opening, type: 'model/gltf-binary' }] as const,
  ]);
  return {
    name: 'private-field-os-assets',
    configResolved(config) { output = resolve(config.root, config.build.outDir); },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';
        if (!pathname.startsWith('/field-os-assets/')) return next();
        const file = files.get(pathname);
        if (!file) { res.statusCode = 404; res.end('Unknown Field OS asset'); return; }
        if (req.method !== 'GET' && req.method !== 'HEAD') { res.statusCode = 405; res.end(); return; }
        try {
          const bytes = verified(file.path, file.sha256);
          res.setHeader('Content-Type', file.type); res.setHeader('Cache-Control', 'private, no-store');
          res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch { res.statusCode = 409; res.end('Verified Field OS asset unavailable'); }
      });
    },
    generateBundle() {
      if (!privateBuild) return;
      for (const [url, file] of files) {
        if (file.type === 'image/png') this.emitFile({ type: 'asset', fileName: url.slice(1), source: verified(file.path, file.sha256) });
      }
    },
    writeBundle() {
      if (!privateBuild) return;
      const directory = join(output, 'field-os-assets'); mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, assets.opening.filename), verified(assets.opening.path, assets.opening.sha256));
    },
  };
}
