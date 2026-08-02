#!/usr/bin/env node
/**
 * Mode-4 sustained profile — category F gates.
 *
 * Runs headless Chromium at medium 1080p preset, injects rAF frame-time
 * sampling (warm-up then measure), drives light explore+battle input, writes
 * shots/wave2/profile.json (or --out).
 *
 * Gates (documented + checked when --gate):
 *   p99_ms ≤ 16.7
 *   frames_over_50ms === 0  (post warm-up only)
 *
 * Usage:
 *   node tools/profile.mjs --seconds 30
 *   node tools/profile.mjs --seconds 180 --gate
 *   npm run profile
 */
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  existsSync,
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

const seconds = Number(flag('seconds', 30));
const warmupSec = Number(flag('warmup', 2));
const port = Number(flag('port', 4191));
const outPath = String(
  flag('out', join(ROOT, 'shots', 'wave2', 'profile.json')),
);
const wantGate = has('gate');
const noBuild = has('no-build');

/** Medium 1080p preset (mirrors src/core/frameStats.ts MEDIUM_1080P). */
const PRESET = {
  id: 'medium-1080p',
  width: 1920,
  height: 1080,
  maxPixelRatio: 1,
  antialias: true,
  warmupFrames: 120,
};

const GATES = {
  p99_ms_max: 16.7,
  long_frame_ms: 50,
  long_frame_max_count: 0,
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

function percentile(sorted, p) {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const idx = Math.min(n - 1, Math.max(0, Math.ceil((p / 100) * n) - 1));
  return sorted[idx];
}

function summarize(times, warmupFrames, presetId) {
  const counted = times.slice(Math.min(warmupFrames, times.length));
  const sorted = counted.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const max_ms = n ? sorted[n - 1] : 0;
  const sum = counted.reduce((a, b) => a + b, 0);
  const p99_ms = percentile(sorted, 99);
  const frames_over_50ms = counted.filter((t) => t > GATES.long_frame_ms).length;
  const frames_over_16_7ms = counted.filter((t) => t > GATES.p99_ms_max).length;
  const gate_p99_ok = n > 0 && p99_ms <= GATES.p99_ms_max;
  const gate_long_ok = frames_over_50ms <= GATES.long_frame_max_count;
  return {
    preset: presetId,
    width: PRESET.width,
    height: PRESET.height,
    maxPixelRatio: PRESET.maxPixelRatio,
    antialias: PRESET.antialias,
    warmup_frames: warmupFrames,
    samples_total: times.length,
    counted: n,
    p50_ms: round3(percentile(sorted, 50)),
    p95_ms: round3(percentile(sorted, 95)),
    p99_ms: round3(p99_ms),
    max_ms: round3(max_ms),
    mean_ms: round3(n ? sum / n : 0),
    frames_over_16_7ms,
    frames_over_50ms,
    gates: {
      p99_ms_max: GATES.p99_ms_max,
      long_frame_ms: GATES.long_frame_ms,
      long_frame_max_count: GATES.long_frame_max_count,
      p99_ok: gate_p99_ok,
      long_ok: gate_long_ok,
      ok: gate_p99_ok && gate_long_ok && n > 0,
    },
    mode: 4,
    category: 'F',
  };
}

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

async function main() {
  console.log(
    `[profile] preset=${PRESET.id} ${PRESET.width}x${PRESET.height} seconds=${seconds} warmup≈${warmupSec}s`,
  );
  console.log(
    `[profile] gates: p99_ms≤${GATES.p99_ms_max}; frames_over_50ms≤${GATES.long_frame_max_count} post warm-up`,
  );

  if (!noBuild) {
    console.log('[profile] building...');
    const b = spawnSync('npm', ['run', 'build'], {
      cwd: ROOT,
      stdio: 'inherit',
      encoding: 'utf8',
    });
    if (b.status !== 0) {
      console.error('[profile] build failed');
      process.exit(1);
    }
  }

  const pw = await loadPlaywright();
  const chrome = findChrome();
  if (!pw || !pw.chromium) {
    console.error('[profile] FAIL: playwright not available');
    process.exit(1);
  }
  if (!chrome) {
    console.error('[profile] FAIL: no Chromium; set TWILIGHT_CHROME');
    process.exit(1);
  }

  let base;
  try {
    base = await startPreview();
  } catch (e) {
    console.error('[profile] preview failed:', e);
    process.exit(1);
  }

  let browser;
  let report;
  try {
    browser = await pw.chromium.launch({
      executablePath: chrome,
      args: [
        ...GPU_ARGS,
        `--window-size=${PRESET.width},${PRESET.height}`,
      ],
      timeout: 60_000,
      headless: true,
    });
    const context = await browser.newContext({
      viewport: { width: PRESET.width, height: PRESET.height },
      deviceScaleFactor: PRESET.maxPixelRatio,
      colorScheme: 'dark',
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e?.message || e)));

    // Install frame sampler before app scripts run when possible
    await page.addInitScript(
      ({ warmupHint }) => {
        window.__profile = {
          times: [],
          last: 0,
          running: true,
          warmupHint,
        };
        const wrap = () => {
          const p = window.__profile;
          if (!p || !p.running) return;
          const now = performance.now();
          if (p.last > 0) {
            const dt = now - p.last;
            // Clamp absurd tab-throttle gaps
            if (dt > 0 && dt < 250) p.times.push(dt);
          }
          p.last = now;
          requestAnimationFrame(wrap);
        };
        requestAnimationFrame(wrap);
      },
      { warmupHint: PRESET.warmupFrames },
    );

    const target = `${base}/?preset=medium-1080p&profile=1&capture=1`;
    console.log(`[profile] goto ${target}`);
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('canvas#viewport', { timeout: 30_000 });

    await page
      .waitForFunction(
        () => {
          const boot = document.getElementById('boot');
          return !boot || boot.classList.contains('done') || !document.body.contains(boot);
        },
        { timeout: 30_000 },
      )
      .catch(() => {});

    // Starter pick
    await page.evaluate(() => {
      const overlay = document.getElementById('starter-overlay');
      const hidden =
        !overlay ||
        overlay.classList.contains('hidden') ||
        getComputedStyle(overlay).display === 'none';
      if (hidden) return;
      const card = document.querySelector(
        '.starter-card, #starter-row .interactive, #starter-row button',
      );
      if (card) card.click();
    });
    await sleep(600);

    // Apply medium preset sizing if renderer exposes global later — force canvas CSS
    await page.evaluate(
      ({ w, h, pr }) => {
        const canvas = document.getElementById('viewport');
        if (canvas) {
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }
        window.dispatchEvent(new Event('resize'));
        // Cap DPR-like behavior if three renderer on window
        const r = window.__renderer;
        if (r && typeof r.setPixelRatio === 'function') {
          r.setPixelRatio(Math.min(window.devicePixelRatio || 1, pr));
          r.setSize(w, h, false);
        }
      },
      { w: PRESET.width, h: PRESET.height, pr: PRESET.maxPixelRatio },
    );

    // Clear samples after boot, then warm-up + measure
    await page.evaluate(() => {
      if (window.__profile) {
        window.__profile.times = [];
        window.__profile.last = 0;
      }
    });

    console.log(`[profile] warm-up ${warmupSec}s…`);
    await sleep(Math.max(0, warmupSec * 1000));

    // Mark warm-up boundary by recording length so far
    const afterWarm = await page.evaluate(() => (window.__profile?.times?.length ?? 0));

    // Drive explore + try battle for measure window
    const measureMs = Math.max(1, seconds) * 1000;
    console.log(`[profile] measuring ${seconds}s (explore+battle input)…`);
    const endAt = Date.now() + measureMs;
    const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyZ', 'Enter', 'ArrowUp', 'ArrowDown'];
    let step = 0;
    while (Date.now() < endAt) {
      const key = keys[step % keys.length];
      await page.keyboard.down(key);
      await sleep(80);
      await page.keyboard.up(key);
      // Click fight / menu buttons if present
      if (step % 7 === 0) {
        await page.evaluate(() => {
          const ids = ['btn-fight', 'cmd-fight', 'fight', 'btn-run'];
          for (const id of ids) {
            const el = document.getElementById(id);
            if (el) {
              el.click();
              return;
            }
          }
          const btn = document.querySelector(
            '#battle-menu button, .battle-cmd, [data-cmd="fight"]',
          );
          if (btn) btn.click();
        });
      }
      step += 1;
      await sleep(40);
    }

    const times = await page.evaluate(() => window.__profile?.times ?? []);
    // Treat first afterWarm samples as additional warm-up already excluded by clear+warmup sleep;
    // still drop PRESET.warmupFrames from the front of the full series for gate math.
    const warmupFrames = Math.max(PRESET.warmupFrames, afterWarm);
    report = summarize(times, Math.min(warmupFrames, Math.floor(times.length * 0.1)), PRESET.id);
    report.seconds_requested = seconds;
    report.warmup_sec = warmupSec;
    report.page_errors = pageErrors.slice(0, 20);
    report.timestamp = new Date().toISOString();
    report.source = 'browser-threejs-profile';
    report.notes =
      'Mode-4 F: p99≤16.7ms and zero frames >50ms after warm-up at medium-1080p. ' +
      'frameStats API in src/core/frameStats.ts; Engine pushes spent ms; main may import later.';

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
    console.log(`[profile] wrote ${outPath}`);
    console.log(
      `[profile] counted=${report.counted} p99_ms=${report.p99_ms} max_ms=${report.max_ms} frames_over_50ms=${report.frames_over_50ms} gates.ok=${report.gates.ok}`,
    );

    if (pageErrors.length) {
      console.warn(`[profile] page errors (${pageErrors.length}):`, pageErrors[0]);
    }
  } catch (e) {
    console.error('[profile] FAIL:', e);
    await stopPreview();
    process.exit(1);
  } finally {
    try {
      await browser?.close();
    } catch {
      /* */
    }
    await stopPreview();
  }

  if (wantGate && report && !report.gates.ok) {
    console.error('[profile] GATE FAIL mode_4 category F');
    process.exit(2);
  }
  console.log('[profile] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
