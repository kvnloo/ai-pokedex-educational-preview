import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import contract from '../../canonical/devices/pokedex-runtime.json';
import acceptance from '../../canonical/devices/pokedex-m4.json';

function verifiedBytes(asset: typeof contract.lods[number], directory: string): Buffer {
  if (!acceptance.assetGatePassed) throw new Error('Device asset has not passed acceptance');
  const bytes = fs.readFileSync(path.join(directory, asset.filename));
  if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) {
    throw new Error('Device artifact differs from its accepted manifest');
  }
  return bytes;
}

function serve(directory: string, req: IncomingMessage, res: ServerResponse, next: () => void): void {
  const url = req.url?.split('?')[0] ?? '';
  if (!url.startsWith('/device-assets/')) return next();
  const asset = contract.lods.find(entry => url === '/device-assets/' + entry.filename);
  if (!asset) { res.statusCode = 404; res.end('Unknown device asset'); return; }
  if (!fs.existsSync(path.join(directory, asset.filename))) { res.statusCode = 404; res.end('Device asset is not installed in this build'); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405; res.setHeader('Allow', 'GET, HEAD'); res.end(); return;
  }
  try {
    const bytes = verifiedBytes(asset, directory);
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Length', bytes.length);
    res.setHeader('Cache-Control', 'private, no-store');
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    res.statusCode = 409;
    res.end('Verified Pokédex artifact is unavailable. Restore the accepted asset version.');
  }
}

/** Only the accepted runtime GLBs enter the private game build. */
export function pokedexDeviceAssets(privateBuild: boolean): Plugin {
  let output = '';
  return {
    name: 'pokedex-device-assets',
    configureServer(server) { server.middlewares.use(serve.bind(null, path.join(contract.assetRoot, 'runtime'))); },
    configurePreviewServer(server) { server.middlewares.use(serve.bind(null, path.join(output, 'device-assets'))); },
    configResolved(config) { output = path.resolve(config.root, config.build.outDir); },
    writeBundle() {
      if (!privateBuild) return;
      const destination = path.join(output, 'device-assets');
      fs.mkdirSync(destination, { recursive: true });
      for (const asset of contract.lods) fs.writeFileSync(path.join(destination, asset.filename), verifiedBytes(asset, path.join(contract.assetRoot, 'runtime')));
    },
  };
}
