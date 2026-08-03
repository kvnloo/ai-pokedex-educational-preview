#!/usr/bin/env node
/**
 * Mode-4 sustained profile — category F gates.
 *
 * Runs headless Chromium at medium 1080p preset, samples presented-frame
 * intervals (rAF-to-rAF timestamp delta) as the primary gate metric. Work-time
 * (rAF start → post-task MessageChannel) is recorded secondary. Prefers
 * window.__frameStats when Engine (or app) publishes it.
 *
 * Drives explore+battle input and forces a Fight-spam / grass walk window so
 * battle VFX load is present during the measure window.
 *
 * Gates (documented + checked when --gate; fail-closed):
 *   presented-frame p99_ms ≤ 20 (vsync-floor aware)
 *   work-time p99_ms ≤ 16.7
 *   frames_over_50ms === 0  (post warm-up only)
 *
 * Usage:
 *   node tools/profile.mjs --seconds 30
 *   node tools/profile.mjs --seconds 180 --gate
 *   node tools/profile.mjs --label wave5 --gate
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
const label = String(flag('label', 'wave6'));
const outPath = String(
  flag('out', join(ROOT, 'shots', label, 'profile.json')),
);
const wantGate = has('gate');
const noBuild = has('no-build');

/** Medium 1080p preset (mirrors src/core/frameStats.ts MEDIUM_1080P). */
const PRESET = {
  id: 'medium-1080p',
  width: 1920,
  height: 1080,
  maxPixelRatio: 1,
  antialias: false,
  warmupFrames: 120,
};

const GATES = {
  // Presented rAF-to-rAF floors near display refresh (~16.67ms @60Hz). Gate at
  // 20ms so timer/vsync noise does not false-fail while still requiring ≥50fps p99.
  // CPU work-time must independently remain inside one 60Hz frame budget.
  p99_ms_max: 20,
  long_frame_ms: 50,
  long_frame_max_count: 0,
  /** Reference CPU budget (work-time secondary, not fail-closed alone). */
  work_p99_ms_max: 16.7,
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

function summarize(times, warmupFrames, presetId, sampleKind) {
  const counted = times.slice(Math.min(warmupFrames, times.length));
  const sorted = counted.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const max_ms = n ? sorted[n - 1] : 0;
  const sum = counted.reduce((a, b) => a + b, 0);
  const p99_ms = percentile(sorted, 99);
  const frames_over_16_7ms = counted.filter((t) => t > 16.7).length;
  const frames_over_20ms = counted.filter((t) => t > GATES.p99_ms_max).length;
  // "over 50ms" is intentionally strict-greater-than; an exact 50.000ms
  // sample is reported by max_ms but is not described as over the threshold.
  const frames_over_50ms = counted.filter((t) => t > GATES.long_frame_ms).length;
  const gate_p99_ok = n > 0 && p99_ms <= GATES.p99_ms_max;
  const gate_long_ok = frames_over_50ms <= GATES.long_frame_max_count;
  return {
    preset: presetId,
    width: PRESET.width,
    height: PRESET.height,
    maxPixelRatio: PRESET.maxPixelRatio,
    antialias: PRESET.antialias,
    sample_kind: sampleKind,
    warmup_frames: warmupFrames,
    samples_total: times.length,
    counted: n,
    p50_ms: round3(percentile(sorted, 50)),
    p95_ms: round3(percentile(sorted, 95)),
    p99_ms: round3(p99_ms),
    max_ms: round3(max_ms),
    mean_ms: round3(n ? sum / n : 0),
    frames_over_16_7ms,
    frames_over_20ms,
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

/** Fail-closed gate: exit non-zero when --gate and p99/long not both ok. */
function enforceGate(report) {
  if (!wantGate) return;
  if (!report) {
    console.error('[profile] GATE FAIL: no report (mode_4 category F)');
    process.exit(2);
  }
  const p99Ok = report.gates?.p99_ok === true;
  const longOk = report.gates?.long_ok === true;
  const workOk = report.gates?.work_p99_ok === true;
  const battleOk = report.gates?.battle_vfx_ok === true;
  const ok = report.gates?.ok === true && p99Ok && longOk && workOk && battleOk && report.counted > 0;
  if (!ok) {
    console.error(
      `[profile] GATE FAIL mode_4 category F p99_ok=${report.gates?.p99_ok} work_p99_ok=${report.gates?.work_p99_ok} long_ok=${report.gates?.long_ok} battle_vfx_ok=${report.gates?.battle_vfx_ok} p99_ms=${report.p99_ms} work_p99_ms=${report.work_time?.p99_ms} counted=${report.counted} sample_kind=${report.sample_kind}`,
    );
    process.exit(2);
  }
  console.log('[profile] GATE OK mode_4 category F (presented-frame)');
}

async function main() {
  console.log(
    `[profile] preset=${PRESET.id} ${PRESET.width}x${PRESET.height} aa=${PRESET.antialias} seconds=${seconds} warmup≈${warmupSec}s label=${label}`,
  );
  console.log(
    `[profile] gates: p99_ms≤${GATES.p99_ms_max}; frames_over_50ms≤${GATES.long_frame_max_count} post warm-up (presented-frame); --gate=${wantGate}`,
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

    // Dual sampler:
    //   presented: rAF-to-rAF timestamp delta (primary gate)
    //   work-time: MessageChannel post-task (secondary)
    // Prefer window.__frameStats.times when Engine/app publishes presented samples.
    await page.addInitScript(
      ({ warmupHint }) => {
        window.__profile = {
          times: [],
          workTimes: [],
          longFrames: [],
          running: true,
          warmupHint,
          kind: 'presented-frame',
          source: 'inject',
        };
        let lastPresented = 0;
        let lastState = null;
        let frameStart = 0;
        let pending = false;
        const ch = new MessageChannel();
        ch.port1.onmessage = () => {
          pending = false;
          const p = window.__profile;
          if (!p || !p.running) return;
          const work = performance.now() - frameStart;
          // Do not clamp-out long spikes for gate honesty; only drop non-positive.
          if (work > 0 && work < 5000) p.workTimes.push(work);
        };
        const wrap = (now) => {
          const p = window.__profile;
          if (!p || !p.running) return;
          if (lastPresented > 0) {
            const presented = now - lastPresented;
            // Keep multi-second tab freezes out of percentile as sampling artifacts,
            // but retain hitches up to 250ms (gate cares about >50ms).
            if (presented > 0 && presented < 2500) {
              p.times.push(presented);
              if (presented > 50) {
                const body = document.body;
                p.longFrames.push({
                  sampleIndex: p.times.length - 1,
                  ms: presented,
                  mode: body?.dataset.mode ?? '',
                  attackPhase: body?.dataset.attackPhase ?? '',
                  attackSide: body?.dataset.attackSide ?? '',
                  bodyClass: body?.className ?? '',
                  previousState: lastState,
                });
                if (p.longFrames.length > 64) p.longFrames.shift();
              }
            }
          }
          lastPresented = now;
          const stateBody = document.body;
          lastState = {
            mode: stateBody?.dataset.mode ?? '',
            attackPhase: stateBody?.dataset.attackPhase ?? '',
            attackSide: stateBody?.dataset.attackSide ?? '',
            bodyClass: stateBody?.className ?? '',
          };
          frameStart = performance.now();
          if (!pending) {
            pending = true;
            ch.port2.postMessage(null);
          }
          // If Engine published __frameStats, mirror its presented samples as source of truth.
          const bridge = window.__frameStats;
          if (bridge && Array.isArray(bridge.times) && bridge.times.length > p.times.length) {
            p.source = 'engine-__frameStats';
            p.kind = bridge.kind || 'presented-frame';
            // Prefer live bridge array; take a snapshot length marker only
          }
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

    // Apply medium preset sizing
    await page.evaluate(
      ({ w, h, pr }) => {
        const canvas = document.getElementById('viewport');
        if (canvas) {
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }
        window.dispatchEvent(new Event('resize'));
        const r = window.__renderer;
        if (r && typeof r.setPixelRatio === 'function') {
          r.setPixelRatio(Math.min(window.devicePixelRatio || 1, pr));
          r.setSize(w, h, false);
        }
      },
      { w: PRESET.width, h: PRESET.height, pr: PRESET.maxPixelRatio },
    );

    // Clear samples after boot
    await page.evaluate(() => {
      if (window.__profile) {
        window.__profile.times = [];
        window.__profile.workTimes = [];
        window.__profile.longFrames = [];
      }
      if (window.__frameStats && typeof window.__frameStats.reset === 'function') {
        window.__frameStats.reset();
      }
    });

    console.log(`[profile] warm-up ${warmupSec}s…`);
    await sleep(Math.max(0, warmupSec * 1000));

    const afterWarm = await page.evaluate(() => {
      const bridge = window.__frameStats;
      if (bridge && Array.isArray(bridge.times) && bridge.times.length > 0) {
        return bridge.times.length;
      }
      return window.__profile?.times?.length ?? 0;
    });

    // Drive explore + force battle VFX for measure window
    const measureMs = Math.max(1, seconds) * 1000;
    console.log(`[profile] measuring ${seconds}s (explore+battle VFX input)…`);
    const endAt = Date.now() + measureMs;
    // Path corridor |x|<0.95 is safe dirt — short strafe (~0.35s) then north into grass band.
    // After battle_root.active, spam Fight / move buttons for VFX load.
    const battleKeys = ['KeyZ', 'Enter', 'Digit1', 'ArrowUp', 'ArrowDown', 'KeyZ', 'Enter'];
    let step = 0;
    let battleForced = false;
    // Enter the authored grass through the same trusted-key route used by the
    // complete-loop proof. Snapshot reads guide input but never mutate state.
    const readSnapshot = () => page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
    const driveUntil = async (key, predicate, timeoutMs) => {
      const started = Date.now();
      await page.keyboard.down(key);
      try {
        while (Date.now() - started < timeoutMs && Date.now() < endAt) {
          await sleep(40);
          const value = await readSnapshot();
          if (value?.mode === 'battle' || predicate(value)) return value;
        }
      } finally {
        await page.keyboard.up(key);
      }
      return readSnapshot();
    };
    let profileState = await readSnapshot();
    if (profileState?.mode === 'explore' && profileState.player?.z < 2.25) {
      profileState = await driveUntil('s', (value) => value?.player?.z >= 2.55, 3_000);
    }
    if (profileState?.mode === 'explore' && profileState.player?.x < 1.25) {
      profileState = await driveUntil('d', (value) => value?.player?.x >= 1.3, 3_000);
    }
    let grassKey = 'w';
    await page.keyboard.down(grassKey);
    try {
      for (let g = 0; g < 240 && Date.now() < endAt && !battleForced; g++) {
        await sleep(50);
        profileState = await readSnapshot();
        if (profileState?.mode === 'battle') {
          battleForced = true;
          break;
        }
        if (!profileState?.player) continue;
        const nextKey = profileState.player.z <= -3.15 ? 's' : profileState.player.z >= 1.05 ? 'w' : grassKey;
        if (nextKey !== grassKey) {
          await page.keyboard.up(grassKey);
          grassKey = nextKey;
          await page.keyboard.down(grassKey);
        }
      }
    } finally {
      await page.keyboard.up(grassKey);
    }

    while (Date.now() < endAt) {
      // Keep re-entering grass if battle ended
      if (!battleForced && step % 40 === 0) {
        await page.keyboard.down('KeyD');
        await sleep(300);
        await page.keyboard.up('KeyD');
        await page.keyboard.down('KeyW');
        await sleep(600);
        await page.keyboard.up('KeyW');
      }
      const key = battleKeys[step % battleKeys.length];
      await page.keyboard.down(key);
      await sleep(70);
      await page.keyboard.up(key);

      // Force Fight / move select clicks every few steps (battle VFX path)
      if (step % 4 === 0) {
        const clicked = await page.evaluate(() => {
          const isShown = (el) => {
            if (!el) return false;
            const st = getComputedStyle(el);
            if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return false;
            // battle-root may use opacity/transform without offsetParent
            const root = document.getElementById('battle-root');
            if (root && !root.classList.contains('active')) {
              return false;
            }
            return true;
          };
          const tryClick = (sel) => {
            const el = document.querySelector(sel);
            if (el && isShown(el)) {
              el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              el.click();
              return true;
            }
            return false;
          };
          // Prefer Fight then first move
          const ids = [
            '[data-act="fight"]',
            '#battle-menu button.primary',
            '#battle-menu button',
            '#move-menu button',
            '[data-act="move"]',
            '#btn-fight',
            '#cmd-fight',
            '#fight',
            '[data-cmd="fight"]',
            '#move-list button',
            '.move-btn',
            '#btn-move-0',
            '#moves button',
          ];
          for (const id of ids) {
            if (tryClick(id)) return true;
          }
          const btns = document.querySelectorAll(
            '#battle-root button, #battle-ui button, #battle-hud button, .battle-panel button, #cmd-row button',
          );
          for (const b of btns) {
            if (isShown(b)) {
              b.click();
              return true;
            }
          }
          // Detect battle mode (CSS: #battle-root.active { display:block })
          const br = document.getElementById('battle-root');
          if (br && br.classList.contains('active')) {
            return 'in-battle';
          }
          return false;
        });
        if (clicked) battleForced = true;
      }

      // Periodically open fight submenu via Z/Enter sequence
      if (step % 11 === 0) {
        await page.keyboard.press('KeyZ');
        await sleep(40);
        await page.keyboard.press('Enter');
      }

      step += 1;
      await sleep(30);
    }

    const harvested = await page.evaluate(() => {
      const bridge = window.__frameStats;
      const prof = window.__profile;
      // Prefer Engine bridge presented samples when present and non-empty.
      if (bridge && Array.isArray(bridge.times) && bridge.times.length > 30) {
        return {
          times: bridge.times.slice(),
          workTimes: Array.isArray(bridge.workTimes)
            ? bridge.workTimes.slice()
            : (prof?.workTimes ?? []).slice(),
          source: 'engine-__frameStats',
          kind: bridge.kind || 'presented-frame',
          snapshot: typeof bridge.snapshot === 'function' ? bridge.snapshot() : null,
          longFrames: Array.isArray(bridge.longFrames) ? bridge.longFrames.slice() : [],
        };
      }
      return {
        times: (prof?.times ?? []).slice(),
        workTimes: (prof?.workTimes ?? []).slice(),
        source: prof?.source || 'inject',
        kind: 'presented-frame',
        snapshot: null,
        longFrames: (prof?.longFrames ?? []).slice(),
      };
    });

    const times = harvested.times;
    const warmupFrames = Math.max(PRESET.warmupFrames, afterWarm);
    report = summarize(
      times,
      Math.min(warmupFrames, Math.floor(times.length * 0.1)),
      PRESET.id,
      harvested.kind || 'presented-frame',
    );
    report.seconds_requested = seconds;
    report.warmup_sec = warmupSec;
    report.label = label;
    report.page_errors = pageErrors.slice(0, 20);
    report.timestamp = new Date().toISOString();
    report.source = 'browser-threejs-profile';
    report.metric_source = harvested.source;
    report.battle_vfx_forced = battleForced;
    report.long_frame_events = (harvested.longFrames ?? []).filter(
      (event) => event.sampleIndex >= Math.min(warmupFrames, Math.floor(times.length * 0.1)),
    );

    // Independent CPU work-time gate.
    let workP99Ok = false;
    if (harvested.workTimes?.length) {
      const w = summarize(
        harvested.workTimes,
        Math.min(PRESET.warmupFrames, Math.floor(harvested.workTimes.length * 0.1)),
        PRESET.id,
        'work-time',
      );
      report.work_time = {
        counted: w.counted,
        p50_ms: w.p50_ms,
        p95_ms: w.p95_ms,
        p99_ms: w.p99_ms,
        max_ms: w.max_ms,
        mean_ms: w.mean_ms,
        frames_over_16_7ms: w.frames_over_16_7ms,
        frames_over_20ms: w.frames_over_20ms,
        frames_over_50ms: w.frames_over_50ms,
      };
      workP99Ok = w.counted > 0 && w.p99_ms <= GATES.work_p99_ms_max;
    }
    report.gates.work_p99_ms_max = GATES.work_p99_ms_max;
    report.gates.work_p99_ok = workP99Ok;
    report.gates.ok = report.gates.ok && workP99Ok;
    report.gates.battle_vfx_required = true;
    report.gates.battle_vfx_ok = battleForced;
    report.gates.ok = report.gates.ok && battleForced;
    if (harvested.snapshot) {
      report.engine_snapshot = harvested.snapshot;
    }
    report.notes =
      'Mode-4 F: presented-frame (rAF-to-rAF) p99≤20ms, CPU work-time p99≤16.7ms, and zero presented frames >50ms after warm-up at medium-1080p (aa=false) during battle VFX. ' +
      'The 20ms presented threshold is vsync-floor aware; work-time independently enforces the 60Hz CPU budget.';

    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
    console.log(`[profile] wrote ${outPath}`);
    console.log(
      `[profile] counted=${report.counted} p99_ms=${report.p99_ms} work_p99_ms=${report.work_time?.p99_ms ?? 'missing'} max_ms=${report.max_ms} frames_over_50ms=${report.frames_over_50ms} gates.ok=${report.gates.ok} p99_ok=${report.gates.p99_ok} work_p99_ok=${report.gates.work_p99_ok} battle_vfx_ok=${report.gates.battle_vfx_ok} kind=${report.sample_kind} metric_source=${report.metric_source}`,
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

  enforceGate(report);
  console.log('[profile] done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
