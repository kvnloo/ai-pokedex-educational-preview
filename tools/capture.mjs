#!/usr/bin/env node
/**
 * Mode-1 capture — honest browser Three.js stills of the ship scene.
 *
 * - Builds the ship pack
 * - Serves dist via vite preview
 * - Opens headless Chromium (hardware WebGL preferred)
 * - Screenshots the live canvas after boot + starter dismiss
 * - Fail-closed: no browser → exit 1; black/empty frame → exit 1
 * - Never copies /mnt/zer0models, public/ab, or TW/Wooloo plates
 *
 * Usage: node tools/capture.mjs --label wave1 --quality high
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  if (i < 0) return d;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};
const has = (n) => args.includes(`--${n}`);

const label = String(flag('label', 'wave'));
const quality = String(flag('quality', 'high'));
const width = Number(flag('w', 1280));
const height = Number(flag('h', 720));
const port = Number(flag('port', 4187));
const outDir = join(ROOT, 'shots', label);

const GPU_ARGS = [
  '--no-sandbox',
  '--disable-gpu-sandbox',
  '--disable-dev-shm-usage',
  '--ozone-platform=headless',
  '--use-gl=angle',
  '--use-angle=vulkan',
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--enable-gpu-rasterization',
  '--force-color-profile=srgb',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--autoplay-policy=no-user-gesture-required',
  '--mute-audio',
];

const CHROME_CANDIDATES = [
  process.env.TWILIGHT_CHROME,
  process.env.BLACKOUT_CHROME,
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
];

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (c && existsSync(c)) return c;
  return undefined;
}

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    join(ROOT, 'node_modules/playwright'),
    join(ROOT, '../cod/node_modules/playwright'),
    '/workspace/zer0/products/cod/node_modules/playwright',
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        return await import(pathToFileURL(join(p, 'index.mjs')).href);
      } catch {
        try {
          return require(p);
        } catch {
          /* next */
        }
      }
    }
  }
  try {
    return await import('playwright');
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function isUp(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return r.ok || r.status === 404;
  } catch {
    return false;
  }
}

function meanLuma(pngPath) {
  // Minimal PNG decode for RGB/RGBA 8-bit via sharp-less zlib inflate of IDAT.
  // Prefer a cheap Node path: sample with chromium-less using pure parse if possible.
  // Fallback: use `identify`/`convert` or a tiny custom reader.
  const buf = readFileSync(pngPath);
  if (buf.length < 100) return 0;
  // Use dynamic import of 'zlib' + parse IHDR + inflate — or shell out to python.
  try {
    const r = spawnSync(
      'python3',
      [
        '-c',
        `from PIL import Image; import sys
im=Image.open(sys.argv[1]).convert("RGB")
px=list(im.getdata())
n=len(px)
if n==0: print(0); raise SystemExit
s=sum(0.2126*r+0.7152*g+0.0722*b for r,g,b in px)/n
print(s)
uniq=len(set(px[: min(n,5000)]))
print(uniq)
print(im.size[0], im.size[1])`,
        pngPath,
      ],
      { encoding: 'utf8' },
    );
    if (r.status === 0) {
      const lines = r.stdout.trim().split('\n');
      return {
        mean: Number(lines[0]) || 0,
        unique: Number(lines[1]) || 0,
        w: Number((lines[2] || '').split(/\s+/)[0]) || 0,
        h: Number((lines[2] || '').split(/\s+/)[1]) || 0,
      };
    }
  } catch {
    /* fall through */
  }
  // Without PIL: reject tiny files / pure black heuristic via raw scan of non-compressed
  // (most screenshots are compressed — require PIL or fail closed on unknown)
  return { mean: -1, unique: -1, w: 0, h: 0 };
}

let serverProc = null;

async function startPreview() {
  const url = `http://127.0.0.1:${port}`;
  if (await isUp(url)) return url;

  serverProc = spawn(
    'npx',
    ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    },
  );
  serverProc.unref?.();

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await isUp(url)) return url;
    if (serverProc.exitCode != null) {
      throw new Error(`preview server exited early (code ${serverProc.exitCode})`);
    }
    await sleep(250);
  }
  throw new Error(`preview did not come up on ${url}`);
}

async function stopPreview() {
  if (serverProc) {
    try {
      serverProc.kill('SIGTERM');
    } catch {
      /* */
    }
    try {
      serverProc.kill('SIGKILL');
    } catch {
      /* */
    }
    serverProc = null;
  }
}

async function main() {
  console.log(`[capture] label=${label} quality=${quality} ${width}x${height}`);

  if (!has('no-build')) {
    console.log('[capture] building...');
    const b = spawnSync('npm', ['run', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      encoding: 'utf8',
    });
    if (b.status !== 0) {
      console.error('[capture] build failed');
      process.exit(1);
    }
  }

  const pw = await loadPlaywright();
  const chrome = findChrome();
  if (!pw || !pw.chromium) {
    console.error(
      '[capture] FAIL CLOSED: playwright not available. Install playwright or ensure cod sibling has it. Refusing minimal-capture / plate copy.',
    );
    process.exit(1);
  }
  if (!chrome) {
    console.error(
      '[capture] FAIL CLOSED: no Chromium binary found. Set TWILIGHT_CHROME. Refusing placeholder.',
    );
    process.exit(1);
  }

  // Clean prior shot dir content for this label (keep parent)
  mkdirSync(outDir, { recursive: true });
  const shotPath = join(outDir, 'shot-000.png');
  if (existsSync(shotPath)) rmSync(shotPath);

  let base;
  try {
    base = await startPreview();
  } catch (e) {
    console.error('[capture] FAIL CLOSED: preview server:', e);
    process.exit(1);
  }

  let browser;
  let gpu = 'unknown';
  try {
    browser = await pw.chromium.launch({
      executablePath: chrome,
      args: [...GPU_ARGS, `--window-size=${width},${height}`],
      timeout: 60_000,
      headless: true,
    });
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e?.message || e)));

    const target = `${base}/?capture=1&quality=${encodeURIComponent(quality)}`;
    console.log(`[capture] goto ${target}`);
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Wait for WebGL canvas
    await page.waitForSelector('canvas#viewport', { timeout: 30_000 });

    // Dismiss boot + pick first starter if present (ship scene = explore)
    await page
      .waitForFunction(
        () => {
          const boot = document.getElementById('boot');
          return !boot || boot.classList.contains('done') || !document.body.contains(boot);
        },
        { timeout: 30_000 },
      )
      .catch(() => {});

    // Click first starter card if starter overlay visible
    const clicked = await page.evaluate(() => {
      const overlay = document.getElementById('starter-overlay');
      const hidden =
        !overlay ||
        overlay.classList.contains('hidden') ||
        getComputedStyle(overlay).display === 'none';
      if (hidden) return false;
      const card = document.querySelector('.starter-card, #starter-row .interactive, #starter-row button');
      if (card) {
        (card).click();
        return true;
      }
      return false;
    });
    if (clicked) {
      console.log('[capture] selected starter → explore');
      await sleep(800);
    }

    // Let a few frames render
    await sleep(1200);
    await page.evaluate(async () => {
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => requestAnimationFrame(r));
      }
    });

    gpu = await page.evaluate(() => {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'no-webgl';
      const d = gl.getExtension('WEBGL_debug_renderer_info');
      return d ? String(gl.getParameter(d.UNMASKED_RENDERER_WEBGL)) : 'webgl';
    });
    console.log(`[capture] GPU: ${gpu}`);

    // Prefer canvas element screenshot (Three.js ship scene)
    const canvas = await page.$('canvas#viewport');
    if (!canvas) {
      throw new Error('canvas#viewport missing after boot');
    }
    await canvas.screenshot({ path: shotPath, type: 'png' });

    // Validate non-black / non-empty
    const stats = meanLuma(shotPath);
    console.log(
      `[capture] luma mean=${stats.mean.toFixed?.(2) ?? stats.mean} unique≈${stats.unique} size=${stats.w}x${stats.h}`,
    );
    if (stats.mean < 0) {
      throw new Error(
        'cannot validate PNG luma (PIL missing?) — fail closed rather than certify blind',
      );
    }
    if (stats.w < 64 || stats.h < 64) {
      throw new Error(`shot too small ${stats.w}x${stats.h}`);
    }
    if (stats.mean < 4) {
      throw new Error(
        `shot appears black/empty (mean luma ${stats.mean}) — black capture is a blocker`,
      );
    }
    if (stats.unique < 8) {
      throw new Error(`shot too flat (unique samples ${stats.unique})`);
    }

    // Ban TW/Wooloo plate fingerprint: refuse if we accidentally wrote a known square plate size-only is weak;
    // stronger: ensure capture was browser (we already did). Extra: no wooloo path in report.

    const report = {
      label,
      shot_dir: outDir,
      shots: [shotPath],
      width,
      height,
      quality,
      gpu,
      source: 'browser-threejs',
      scene: clicked ? 'explore-after-starter' : 'boot-or-starter',
      page_errors: pageErrors.slice(0, 20),
      luma: { mean: stats.mean, unique_samples: stats.unique },
      timestamp: new Date().toISOString(),
      notes:
        'Honest WebGL still of ship index.html. No minimal-capture, no /mnt/zer0models, no public/ab plate copy.',
    };

    // Standing gate: land refuses minimal-capture
    if (String(report.source).includes('minimal')) {
      throw new Error('internal: source must not be minimal-capture');
    }

    writeFileSync(join(outDir, 'capture.json'), JSON.stringify(report, null, 2));
    console.log(`[capture] wrote ${shotPath} + capture.json (source=${report.source})`);
    console.log(`[capture] DONE for ${label}`);
  } catch (e) {
    console.error('[capture] FAIL:', e?.message || e);
    // Remove partial black shots so they cannot be certified
    try {
      if (existsSync(shotPath)) {
        const st = meanLuma(shotPath);
        if (st.mean < 4 || st.mean < 0) rmSync(shotPath);
      }
    } catch {
      /* */
    }
    process.exitCode = 1;
  } finally {
    try {
      await browser?.close();
    } catch {
      /* */
    }
    await stopPreview();
  }
}

main().catch(async (e) => {
  console.error(e);
  await stopPreview();
  process.exit(1);
});
