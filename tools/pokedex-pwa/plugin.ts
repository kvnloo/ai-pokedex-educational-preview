import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import icons from './icons.json';
import candidates from '../../canonical/devices/generations/review-candidates.json';
import activePhoneMesh from '../../canonical/devices/generations/active-phone-mesh.json';

const digest = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex');

/** The public bundle and HMR server never receive an installable private shell. */
export function pokedexPwa(privateBuild: boolean): Plugin {
  let base = '/';
  return {
    name: 'pokedex-private-pwa',
    apply: 'build',
    enforce: 'post',
    configResolved(config) { base = config.base; },
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        if (!privateBuild || !context.filename.endsWith('/pokedex.html')) return;
        return [
          { tag: 'link', attrs: { rel: 'manifest', href: './pokedex.webmanifest' }, injectTo: 'head' },
          { tag: 'link', attrs: { rel: 'apple-touch-icon', href: './pokedex-icons/pokedex-any-192.png' }, injectTo: 'head' },
        ];
      },
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        if (!privateBuild) return;
        if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('Private PWA requires an absolute path BASE_PATH with a trailing slash');
        const html = bundle['pokedex.html'];
        if (!html || html.type !== 'asset' || typeof html.source !== 'string') throw new Error('Compiled Pokédex HTML missing');
        const sourceIcon = readFileSync(new URL('./icon.svg', import.meta.url));
        if (digest(sourceIcon) !== icons.sourceSha256) throw new Error('PWA icon source changed; regenerate icons');
        const files = new Map<string, string | Uint8Array>();
        const collect = (name: string) => {
          if (files.has(name)) return;
          const entry = bundle[name];
          if (!entry) throw new Error(`Pokédex shell dependency missing: ${name}`);
          files.set(name, entry.type === 'chunk' ? entry.code : entry.source);
          if (entry.type === 'chunk') [...entry.imports, ...entry.dynamicImports].forEach(collect);
        };
        collect('pokedex.html');
        // These six official images are the private Field OS display content.
        // The optional opening GLB remains network-only and cannot block the OS.
        for (const file of Object.keys(bundle)) if (/^field-os-assets\/home\/\d+\.png$/.test(file)) collect(file);
        for (const match of html.source.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)) {
          const url = match[1];
          if (!url?.startsWith(base)) throw new Error('Non-local shell dependency');
          collect(url.slice(base.length));
        }
        const manifest = JSON.stringify({
          id: './pokedex.html', name: 'Field Pokédex', short_name: 'Pokédex', lang: 'en',
          description: 'Your private Pokémon field companion.',
          start_url: './pokedex.html?launch=homescreen', scope: './',
          display: 'fullscreen', display_override: ['fullscreen', 'standalone'], orientation: 'any',
          theme_color: '#8f1626', background_color: '#8f1626',
          icons: icons.icons.map(icon => ({ src: `./pokedex-icons/${icon.file}`, sizes: `${icon.size}x${icon.size}`, type: 'image/png', purpose: icon.purpose })),
        }, null, 2) + '\n';
        files.set('pokedex.webmanifest', manifest);
        const candidate = candidates.find(item => item.id === activePhoneMesh.candidate);
        const shell = candidate?.exports.find(item => item.level === 0);
        if (!candidate || !shell || candidate.evidenceStatus !== 'complete-for-review') throw new Error('Active Pokédex phone mesh has no complete review evidence');
        const shellBytes = readFileSync(resolve('/mnt/zer0models/pokemon-iac/devices/pokedex', shell.relativePath));
        if (digest(shellBytes) !== shell.sha256) throw new Error(`Active Pokédex phone mesh hash mismatch: ${candidate.id}`);
        files.set(`pokedex-shell/${candidate.id}.glb`, shellBytes);
        for (const icon of icons.icons) {
          const bytes = readFileSync(resolve(icons.assetRoot, icon.file));
          if (digest(bytes) !== icon.sha256) throw new Error(`PWA icon hash mismatch: ${icon.file}`);
          files.set(`pokedex-icons/${icon.file}`, bytes);
        }
        const worker = readFileSync(new URL('./service-worker.js', import.meta.url), 'utf8');
        const hashes = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, bytes]) => [base + file, digest(bytes)]));
        const version = digest(JSON.stringify(hashes) + worker).slice(0, 16);
        const cachePrefix = `pokedex-private-shell-${digest(base).slice(0, 8)}-`;
        const release = { version, cachePrefix, cacheName: cachePrefix + version, files: Object.keys(hashes), hashes };
        for (const [fileName, source] of files) {
          if (!bundle[fileName]) this.emitFile({ type: 'asset', fileName, source });
        }
        this.emitFile({ type: 'asset', fileName: 'pokedex-sw-v1.js', source: worker.replace('__POKEDEX_RELEASE__', JSON.stringify(release)) });
        this.emitFile({ type: 'asset', fileName: 'pokedex-pwa-release.json', source: JSON.stringify(release, null, 2) + '\n' });
      },
    },
  };
}
