#!/usr/bin/env node
/**
 * Mode-1 capture — honest browser Three.js stills of the ship scene.
 *
 * - Builds the ship pack
 * - Serves dist via vite preview
 * - Opens headless Chromium (hardware WebGL preferred)
 * - Screenshots the live canvas after boot + starter dismiss
 * - Fail-closed: no browser → exit 1; black/near-void frame → exit 1
 * - Never copies /mnt/zer0models, public/ab, or TW/Wooloo plates
 *
 * Hard gates (aligned with measure black_frame):
 *   mean luma >= 38, unique samples >= 48, near-black fraction < 0.82
 *   black_frame=true ⇔ fail (no pass_hard_gates with void)
 *
 * Usage: node tools/capture.mjs --label wave2 --quality high
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
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

/** Fail-closed thresholds — mean≈27 / unique≈11 near-void must NOT pass. */
const GATE = {
  meanMin: 38,
  uniqueMin: 48,
  nearBlackMax: 0.82,
  nearBlackLuma: 12,
  minDim: 64,
};

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
  const buf = readFileSync(pngPath);
  if (buf.length < 100) {
    return { mean: 0, unique: 0, w: 0, h: 0, nearBlackFrac: 1, ok: false };
  }
  try {
    const r = spawnSync(
      'python3',
      [
        '-c',
        `from PIL import Image; import sys
im=Image.open(sys.argv[1]).convert("RGB")
px=list(im.getdata())
n=len(px)
if n==0: print(0); print(0); print(0,0); print(1); raise SystemExit
def L(p): return 0.2126*p[0]+0.7152*p[1]+0.0722*p[2]
s=sum(L(p) for p in px)/n
uniq=len(set(px[: min(n,8000)]))
nb=sum(1 for p in px if L(p)<${GATE.nearBlackLuma})/n
print(s)
print(uniq)
print(im.size[0], im.size[1])
print(nb)
`,
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
        nearBlackFrac: Number(lines[3]) || 0,
        ok: true,
      };
    }
  } catch {
    /* fall through */
  }
  return { mean: -1, unique: -1, w: 0, h: 0, nearBlackFrac: 1, ok: false };
}

function evaluateHardGates(stats) {
  const hard_failed = [];
  if (!stats.ok || stats.mean < 0) {
    hard_failed.push('luma_unmeasurable');
  }
  if (stats.w < GATE.minDim || stats.h < GATE.minDim) {
    hard_failed.push(`dimensions_${stats.w}x${stats.h}`);
  }
  if (stats.mean >= 0 && stats.mean < GATE.meanMin) {
    hard_failed.push(`near_void_mean_${stats.mean.toFixed(2)}`);
  }
  if (stats.unique >= 0 && stats.unique < GATE.uniqueMin) {
    hard_failed.push(`flat_unique_${stats.unique}`);
  }
  if (stats.nearBlackFrac > GATE.nearBlackMax) {
    hard_failed.push(`near_black_frac_${stats.nearBlackFrac.toFixed(3)}`);
  }
  const black_frame =
    stats.mean < 0 ||
    stats.mean < GATE.meanMin ||
    stats.unique < GATE.uniqueMin ||
    stats.nearBlackFrac > GATE.nearBlackMax ||
    stats.w < GATE.minDim ||
    stats.h < GATE.minDim;
  let pass_hard_gates = hard_failed.length === 0 && !black_frame;
  if (black_frame && pass_hard_gates) {
    hard_failed.push('invariant_black_frame_with_pass');
    pass_hard_gates = false;
  }
  return {
    black_frame: !!black_frame,
    hard_failed,
    pass_hard_gates,
    gates: { ...GATE },
  };
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

/**
 * Force starter UI visible (capture=1 path) and pick first starter so explore+mesh exist.
 */
async function dismissStarterAndAssertScene(page) {
  await page
    .waitForFunction(
      () => {
        const boot = document.getElementById('boot');
        return !boot || boot.classList.contains('done') || !document.body.contains(boot);
      },
      { timeout: 30_000 },
    )
    .catch(() => {});

  await page.evaluate(() => {
    const overlay = document.getElementById('starter-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    overlay.classList.remove('hidden');
    overlay.style.display = 'grid';
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
  });

  await page
    .waitForFunction(
      () => document.querySelectorAll('.starter-card').length > 0,
      { timeout: 15_000 },
    )
    .catch(() => {});

  const clicked = await page.evaluate(() => {
    const card =
      document.querySelector('.starter-card') ||
      document.querySelector('#starter-row .interactive') ||
      document.querySelector('#starter-row button');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });

  if (clicked) {
    console.log('[capture] selected starter → explore');
    await sleep(900);
  } else {
    console.warn('[capture] no starter card found — will assert scene content anyway');
  }

  const sceneInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas#viewport');
    const hasCanvas = !!canvas && canvas.width > 0 && canvas.height > 0;
    const starterHidden = (() => {
      const o = document.getElementById('starter-overlay');
      if (!o) return true;
      if (o.classList.contains('hidden')) return true;
      return getComputedStyle(o).display === 'none';
    })();
    return { hasCanvas, starterHidden };
  });

  if (!sceneInfo.hasCanvas) {
    throw new Error('canvas#viewport missing or zero-size after starter path');
  }

  return { clicked, ...sceneInfo };
}

async function main() {
  console.log(`[capture] label=${label} quality=${quality} ${width}x${height}`);
  console.log(
    `[capture] hard gates: mean>=${GATE.meanMin} unique>=${GATE.uniqueMin} nearBlackFrac<${GATE.nearBlackMax}`,
  );

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
      '[capture] FAIL CLOSED: playwright not available. Refusing minimal-capture / plate copy.',
    );
    process.exit(1);
  }
  if (!chrome) {
    console.error(
      '[capture] FAIL CLOSED: no Chromium binary found. Set TWILIGHT_CHROME. Refusing placeholder.',
    );
    process.exit(1);
  }

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

    await page.waitForSelector('canvas#viewport', { timeout: 30_000 });

    const scene = await dismissStarterAndAssertScene(page);

    await sleep(1400);
    await page.evaluate(async () => {
      for (let i = 0; i < 12; i++) {
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

    const canvas = await page.$('canvas#viewport');
    if (!canvas) {
      throw new Error('canvas#viewport missing after boot');
    }
    await canvas.screenshot({ path: shotPath, type: 'png' });

    const stats = meanLuma(shotPath);
    const gateEval = evaluateHardGates(stats);
    console.log(
      `[capture] luma mean=${stats.mean.toFixed?.(2) ?? stats.mean} unique≈${stats.unique} nearBlack=${(stats.nearBlackFrac ?? 0).toFixed?.(3)} size=${stats.w}x${stats.h}`,
    );
    console.log(
      `[capture] black_frame=${gateEval.black_frame} pass_hard_gates=${gateEval.pass_hard_gates} hard_failed=${JSON.stringify(gateEval.hard_failed)}`,
    );

    const sceneLabel = scene.clicked
      ? 'explore-after-starter'
      : scene.starterHidden
        ? 'boot-or-explore'
        : 'starter-or-boot';

    const report = {
      label,
      shot_dir: outDir,
      shots: [shotPath],
      width,
      height,
      quality,
      gpu,
      source: 'browser-threejs',
      scene: sceneLabel,
      page_errors: pageErrors.slice(0, 20),
      luma: {
        mean: stats.mean,
        unique_samples: stats.unique,
        near_black_frac: stats.nearBlackFrac,
      },
      black_frame: gateEval.black_frame,
      hard_failed: gateEval.hard_failed,
      pass_hard_gates: gateEval.pass_hard_gates,
      gates: gateEval.gates,
      starter_clicked: !!scene.clicked,
      timestamp: new Date().toISOString(),
      notes:
        'Honest WebGL still of ship index.html. Fail-closed on near-void (mean/unique/near-black). No minimal-capture, no plates.',
    };

    if (String(report.source).includes('minimal')) {
      throw new Error('internal: source must not be minimal-capture');
    }

    writeFileSync(join(outDir, 'capture.json'), JSON.stringify(report, null, 2));

    if (!gateEval.pass_hard_gates || gateEval.black_frame) {
      console.error(
        `[capture] FAIL CLOSED: hard gates failed (black_frame=${gateEval.black_frame}). Cannot claim pass_hard_gates.`,
      );
      process.exitCode = 1;
      return;
    }

    console.log(`[capture] wrote ${shotPath} + capture.json (source=${report.source})`);
    console.log(`[capture] DONE for ${label}`);
  } catch (e) {
    console.error('[capture] FAIL:', e?.message || e);
    try {
      const st = existsSync(shotPath) ? meanLuma(shotPath) : null;
      const ge = st
        ? evaluateHardGates(st)
        : {
            black_frame: true,
            hard_failed: ['capture_exception'],
            pass_hard_gates: false,
            gates: GATE,
          };
      writeFileSync(
        join(outDir, 'capture.json'),
        JSON.stringify(
          {
            label,
            shot_dir: outDir,
            shots: existsSync(shotPath) ? [shotPath] : [],
            source: 'browser-threejs',
            black_frame: true,
            hard_failed: [...(ge.hard_failed || []), 'capture_exception'],
            pass_hard_gates: false,
            error: String(e?.message || e),
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
      if (st && (st.mean < GATE.meanMin || st.mean < 0)) {
        try {
          rmSync(shotPath);
        } catch {
          /* */
        }
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
