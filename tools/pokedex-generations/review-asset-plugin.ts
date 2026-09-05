import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import candidates from '../../canonical/devices/generations/review-candidates.json';

/** Review-only route. Candidate bytes never enter the game's release bundle. */
export function pokedexGenerationReviewAssets(): Plugin {
  return {
    name: 'pokedex-generation-review-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/device-review-assets/')) return next();
        const candidate = candidates.find(item => item.exports.some(asset =>
          url === `/device-review-assets/${item.id}/${asset.level}.glb`));
        const asset = candidate?.exports.find(item => url === `/device-review-assets/${candidate.id}/${item.level}.glb`);
        if (!asset || candidate?.evidenceStatus !== 'complete-for-review') {
          res.statusCode = 404; res.end('Unknown review asset'); return;
        }
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405; res.setHeader('Allow', 'GET, HEAD'); res.end(); return;
        }
        const file = path.join('/mnt/zer0models/pokemon-iac/devices/pokedex', asset.relativePath);
        if (!fs.existsSync(file)) {
          res.statusCode = 404; res.end('Review asset is not installed'); return;
        }
        try {
          const bytes = fs.readFileSync(file);
          if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
            res.statusCode = 409; res.end('Review asset differs from its evidence'); return;
          }
          res.setHeader('Content-Type', 'model/gltf-binary');
          res.setHeader('Content-Length', bytes.length);
          res.setHeader('Cache-Control', 'private, no-store');
          res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch {
          res.statusCode = 503; res.end('Review asset could not be read');
        }
      });
    },
  };
}
