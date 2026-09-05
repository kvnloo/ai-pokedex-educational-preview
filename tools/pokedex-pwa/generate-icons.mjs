import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

const output = process.env.POKEDEX_PWA_ICONS ?? '/mnt/zer0models/pokemon-iac/devices/pokedex/pwa/icons-v1';
const sharpPath = process.env.SHARP_MODULE ?? '/home/kvn/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp';
const sharp = createRequire(import.meta.url)(sharpPath);
const source = await readFile(new URL('./icon.svg', import.meta.url));
await mkdir(output, { recursive: true });
const icons = [];
for (const purpose of ['any', 'maskable']) {
  for (const size of [192, 512]) {
    const file = `pokedex-${purpose}-${size}.png`;
    const sourceSize = purpose === 'maskable' ? size : Math.round(size * .88);
    const glyph = await sharp(source).resize(sourceSize, sourceSize).png().toBuffer();
    const bytes = purpose === 'maskable' ? glyph : await sharp({ create: { width: size, height: size, channels: 4, background: '#00000000' } })
      .composite([{ input: glyph, gravity: 'centre' }]).png().toBuffer();
    await writeFile(resolve(output, file), bytes);
    icons.push({ file, size, purpose, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
}
const contract = { assetRoot: output, sourceSha256: createHash('sha256').update(source).digest('hex'), icons };
await writeFile(new URL('./icons.json', import.meta.url), JSON.stringify(contract, null, 2) + '\n');
console.log(JSON.stringify(contract));
