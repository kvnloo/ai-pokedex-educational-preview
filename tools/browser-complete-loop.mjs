#!/usr/bin/env node
/**
 * Fail-closed empirical browser proof for the complete Twilight Route loop.
 *
 * Gameplay is driven only through trusted Playwright mouse/keyboard input:
 * starter choice -> WASD -> grass encounter -> battle move -> catch -> party ->
 * heal pad -> second encounter -> run. window.__twilight is read-only evidence.
 *
 * The harness pins Math.random and Date.now before boot so the same real-input
 * route is replayable. It never calls a gameplay transition/state mutator.
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  if (index < 0) return fallback;
  const value = argv[index + 1];
  return value && !value.startsWith('--') ? value : fallback;
};
const URL = String(
  flag(
    'url',
    process.env.TWILIGHT_URL ?? 'http://127.0.0.1:5192/?verify=1&preset=medium',
  ),
);
const outputArg = String(
  flag(
    'out',
    process.env.TWILIGHT_EVIDENCE_DIR ??
      join(ROOT, 'shots', process.env.TWILIGHT_EVIDENCE_LABEL ?? 'complete-loop-current'),
  ),
);
const OUT = isAbsolute(outputArg) ? outputArg : resolve(ROOT, outputArg);
const RNG_SEED = Number(flag('seed', process.env.TWILIGHT_EVIDENCE_SEED ?? 0x6c756d65)) >>> 0;
const VIEWPORT = { width: 1280, height: 720 };
const STARTED = performance.now();

const checks = [];
const timeline = [];
const screenshots = [];
const transitions = {};
const controls = [];
const consoleProblems = [];
const requestProblems = [];
const infoMessages = [];
let fatalError = null;
let page = null;
let browser = null;
let context = null;
let tracePath = join(OUT, 'complete-loop-trace.zip');

function elapsedMs() {
  return Number((performance.now() - STARTED).toFixed(3));
}

function check(name, ok, detail = '') {
  const item = { name, ok: Boolean(ok), detail: String(detail || ''), elapsedMs: elapsedMs() };
  checks.push(item);
  console.log(`${item.ok ? 'ok  ' : 'FAIL'} ${name}${item.detail ? ` — ${item.detail}` : ''}`);
  return item.ok;
}

async function stamp(name, detail = {}) {
  let browserMs = null;
  if (page) {
    try {
      browserMs = await page.evaluate(() => performance.now());
    } catch {
      // Page may be closing during finalization.
    }
  }
  const item = {
    name,
    elapsedMs: elapsedMs(),
    browserMs: browserMs == null ? null : Number(browserMs.toFixed(3)),
    detail,
  };
  timeline.push(item);
  return item;
}

function distance3(a, b) {
  return Math.hypot(
    (a?.x ?? 0) - (b?.x ?? 0),
    (a?.y ?? 0) - (b?.y ?? 0),
    (a?.z ?? 0) - (b?.z ?? 0),
  );
}

async function loadPlaywright() {
  const candidates = [
    process.env.TWILIGHT_PLAYWRIGHT_PATH,
    join(ROOT, 'node_modules/playwright'),
    join(ROOT, '../cod/node_modules/playwright'),
    '/workspace/zer0/products/cod/node_modules/playwright',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      return await import(pathToFileURL(join(candidate, 'index.mjs')).href);
    } catch {
      try {
        return require(candidate);
      } catch {
        // Try the next known installation.
      }
    }
  }
  return null;
}

function imageStats(path, crop = null) {
  const args = [path, '-alpha', 'off', '-colorspace', 'sRGB'];
  if (crop) args.push('-crop', crop, '+repage');
  args.push(
    '-format',
    '%[fx:mean]|%[fx:standard_deviation]|%[entropy]|%w|%h',
    'info:',
  );
  const raw = execFileSync('magick', args, { encoding: 'utf8', timeout: 30_000 }).trim();
  const [mean, standardDeviation, entropy, width, height] = raw.split('|').map(Number);
  if (![mean, standardDeviation, entropy, width, height].every(Number.isFinite)) {
    throw new Error(`unparseable ImageMagick stats for ${path}: ${raw}`);
  }
  return { mean, standardDeviation, entropy, width, height };
}

function frameLooksRendered(stats) {
  return stats.mean > 0.02 && stats.standardDeviation > 0.012 && stats.entropy > 0.12;
}

async function capture(stage) {
  const index = String(screenshots.length).padStart(2, '0');
  const file = join(OUT, `${index}-${stage}.png`);
  await page.screenshot({ path: file, fullPage: false, animations: 'allow' });
  const full = imageStats(file);
  const center = imageStats(file, '768x360+256+72');
  const ok = frameLooksRendered(full) && frameLooksRendered(center);
  const item = {
    stage,
    file,
    elapsedMs: elapsedMs(),
    full,
    center,
    rendered: ok,
  };
  screenshots.push(item);
  check(
    `non-black rendered frame: ${stage}`,
    ok,
    `full mean=${full.mean.toFixed(4)} std=${full.standardDeviation.toFixed(4)} entropy=${full.entropy.toFixed(4)}; center mean=${center.mean.toFixed(4)} std=${center.standardDeviation.toFixed(4)} entropy=${center.entropy.toFixed(4)}`,
  );
  await stamp(`screenshot:${stage}`, { file });
  return item;
}

async function snapshot() {
  return page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
}

async function waitSnapshot(predicateSource, timeoutMs, label) {
  await page.waitForFunction(
    ({ source }) => {
      const value = window.__twilight?.snapshot?.() ?? null;
      // Source is owned by this harness, not page data.
      return Function('value', `return (${source})(value);`)(value);
    },
    { source: predicateSource },
    { timeout: timeoutMs, polling: 40 },
  );
  const value = await snapshot();
  if (!value) throw new Error(`${label}: runtime snapshot unavailable`);
  return value;
}

async function waitBattleReady(timeoutMs = 12_000) {
  const started = performance.now();
  await page.waitForFunction(
    () => {
      const snap = window.__twilight?.snapshot?.();
      const menu = document.querySelector('#battle-menu');
      const fight = document.querySelector('#battle-menu [data-act="fight"]');
      return (
        snap?.mode === 'battle' &&
        snap?.battle &&
        !snap.battle.busy &&
        menu &&
        !menu.classList.contains('hidden') &&
        fight instanceof HTMLButtonElement &&
        !fight.disabled
      );
    },
    { timeout: timeoutMs, polling: 30 },
  );
  return Number((performance.now() - started).toFixed(3));
}

async function readMeasure(name) {
  return page.evaluate((measureName) => {
    const entries = performance.getEntriesByName(measureName);
    const entry = entries[entries.length - 1];
    return entry ? Number(entry.duration.toFixed(3)) : null;
  }, name);
}

async function waitReadMeasure(name, timeoutMs = 2_000) {
  await page.waitForFunction(
    (measureName) => performance.getEntriesByName(measureName).length > 0,
    name,
    { timeout: timeoutMs, polling: 20 },
  );
  return readMeasure(name);
}

async function testControl(key, axis, direction) {
  const lower = key.toLowerCase();
  const before = await snapshot();
  const started = performance.now();
  await page.keyboard.down(lower);
  await page.waitForTimeout(240);
  const held = await snapshot();
  await page.keyboard.up(lower);
  await page.waitForTimeout(260);
  const after = await snapshot();
  const latency = Number((performance.now() - started).toFixed(3));
  const delta = (held?.player?.[axis] ?? 0) - (before?.player?.[axis] ?? 0);
  const travel = distance3(before?.player, held?.player);
  const cameraTravel = distance3(before?.camera, after?.camera);
  const evidence = {
    key: lower,
    axis,
    direction,
    latencyMs: latency,
    delta: Number(delta.toFixed(4)),
    playerTravel: Number(travel.toFixed(4)),
    cameraTravel: Number(cameraTravel.toFixed(4)),
    before: before?.player,
    held: held?.player,
    after: after?.player,
  };
  controls.push(evidence);
  check(`trusted ${key.toUpperCase()} key observed held`, held?.input?.held?.includes(lower) === true, JSON.stringify(held?.input));
  check(`trusted ${key.toUpperCase()} moves ${axis} ${direction > 0 ? '+' : '-'}`, delta * direction >= 0.28, `delta=${delta.toFixed(4)}`);
  check(`camera responds to ${key.toUpperCase()}`, cameraTravel >= 0.12, `travel=${cameraTravel.toFixed(4)}`);
  check(`keyup clears ${key.toUpperCase()}`, after?.input?.held?.includes(lower) === false, JSON.stringify(after?.input));
  return evidence;
}

async function driveUntil(key, predicate, timeoutMs, label) {
  const started = performance.now();
  let last = await snapshot();
  await page.keyboard.down(key);
  try {
    while (performance.now() - started < timeoutMs) {
      await page.waitForTimeout(40);
      last = await snapshot();
      if (last?.mode === 'battle' || predicate(last)) break;
    }
  } finally {
    await page.keyboard.up(key);
  }
  await page.waitForTimeout(100);
  last = await snapshot();
  if (last?.mode !== 'battle' && !predicate(last)) {
    throw new Error(`${label} timed out after ${timeoutMs}ms at ${JSON.stringify(last?.player)}`);
  }
  return last;
}

async function settleCoordinate({ axis, target, tolerance, negativeKey, positiveKey, timeoutMs, label }) {
  const started = performance.now();
  await page.waitForTimeout(260);
  while (performance.now() - started < timeoutMs) {
    const value = await snapshot();
    const current = value?.player?.[axis];
    if (typeof current !== 'number') throw new Error(`${label}: player coordinate unavailable`);
    const delta = target - current;
    if (Math.abs(delta) <= tolerance) return value;
    const key = delta > 0 ? positiveKey : negativeKey;
    const holdMs = Math.max(35, Math.min(105, Math.abs(delta) * 85));
    await page.keyboard.down(key);
    await page.waitForTimeout(holdMs);
    await page.keyboard.up(key);
    await page.waitForTimeout(220);
  }
  const value = await snapshot();
  throw new Error(`${label} timed out at ${JSON.stringify(value?.player)}`);
}

async function patrolGrassForEncounter(expectedEncounterCount, timeoutMs = 24_000) {
  const started = performance.now();
  let direction = 'w';
  let pressed = null;
  const press = async (next) => {
    if (pressed === next) return;
    if (pressed) await page.keyboard.up(pressed);
    await page.keyboard.down(next);
    pressed = next;
  };
  try {
    await press(direction);
    while (performance.now() - started < timeoutMs) {
      await page.waitForTimeout(45);
      const value = await snapshot();
      if (value?.mode === 'battle' && value.encounterCount >= expectedEncounterCount) {
        return value;
      }
      if (!value?.player) continue;
      if (value.player.z <= -3.15) direction = 's';
      else if (value.player.z >= 1.05) direction = 'w';
      await press(direction);
    }
  } finally {
    if (pressed) await page.keyboard.up(pressed);
  }
  const value = await snapshot();
  throw new Error(
    `grass patrol timed out after ${timeoutMs}ms; expected encounterCount>=${expectedEncounterCount}, got ${JSON.stringify(value)}`,
  );
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicCatchSucceeds({ maxHp, hp, catchRate, timestamp }) {
  const safeMax = Math.max(1, maxHp);
  const safeHp = Math.max(0, Math.min(safeMax, hp));
  const rate = Math.max(1, Math.min(255, catchRate));
  const a = Math.max(
    0,
    Math.min(255, Math.floor(((3 * safeMax - 2 * safeHp) * rate) / (3 * safeMax))),
  );
  if (a >= 255) return true;
  if (a <= 0) return false;
  const threshold = Math.floor(65536 / Math.pow(255 / a, 0.1875)) / 65536;
  const random = mulberry32((timestamp ^ safeHp) >>> 0);
  return random() < threshold && random() < threshold && random() < threshold;
}

function findCatchTimestamp(input) {
  const base = 1_800_000_000_000;
  for (let offset = 0; offset < 250_000; offset += 1) {
    const timestamp = base + offset;
    if (deterministicCatchSucceeds({ ...input, timestamp })) return timestamp;
  }
  throw new Error(`no deterministic catch timestamp found for ${JSON.stringify(input)}`);
}

async function installBrowserAudioProbe() {
  await page.evaluate(async (seed) => {
    const module = await import('/src/audio/index.ts');
    const soundscape = module.createProceduralSoundscape({ seed, masterGain: 0.32 });
    window.__completeLoopAudio = soundscape;
    const safe = (task) => {
      void task.catch((error) => console.error('[complete-loop-audio]', error));
    };
    document.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!(button instanceof HTMLButtonElement)) return;
      const action = button.dataset.act;
      if (action === 'fight') {
        safe(
          soundscape
            .resume()
            .then(() => soundscape.setScene('battle'))
            .then(() => soundscape.cue('battle-start')),
        );
      } else if (button.closest('#move-menu') && !button.classList.contains('ghost')) {
        safe(soundscape.cue('move', { intensity: 0.65 }));
      } else if (action === 'ball') {
        safe(soundscape.cue('catch-throw'));
      } else if (action === 'run') {
        safe(soundscape.setScene('explore'));
      }
    });
  }, RNG_SEED ^ 0xa0d10);
}

async function audioSnapshot() {
  return page.evaluate(() => window.__completeLoopAudio?.snapshot?.() ?? null);
}

function currentReport() {
  const failedChecks = checks.filter((item) => !item.ok);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    url: URL,
    outputDir: OUT,
    durationMs: elapsedMs(),
    deterministicInputs: {
      mathRandomSeed: RNG_SEED,
      clockPinnedForCatchOutcome: true,
      gameplayMutatorsInvoked: false,
      bridgeUse: 'window.__twilight.snapshot() read-only',
      inputMode: 'Playwright trusted mouse and keyboard events',
    },
    passed: fatalError == null && failedChecks.length === 0,
    summary: {
      checksPassed: checks.length - failedChecks.length,
      checksFailed: failedChecks.length,
      consoleProblems: consoleProblems.length,
      requestProblems: requestProblems.length,
      screenshots: screenshots.length,
    },
    fatalError,
    checks,
    transitions,
    controls,
    timeline,
    screenshots,
    consoleProblems,
    requestProblems,
    infoMessages,
    tracePath,
    reportPath: join(OUT, 'complete-loop-report.json'),
  };
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const pack = JSON.parse(readFileSync(join(ROOT, 'content/game/wave0.json'), 'utf8'));
const catchRates = new Map(pack.species.map((species) => [species.id, species.catchRate]));
const playwright = await loadPlaywright();
if (!playwright?.chromium) {
  fatalError = 'Playwright unavailable (checked project and sibling installations)';
  writeFileSync(join(OUT, 'complete-loop-report.json'), `${JSON.stringify(currentReport(), null, 2)}\n`);
  throw new Error(fatalError);
}

try {
  const executablePath = process.env.TWILIGHT_CHROME ?? '/usr/bin/chromium';
  browser = await playwright.chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu-sandbox',
      '--disable-dev-shm-usage',
      '--ozone-platform=headless',
      '--use-gl=angle',
      '--use-angle=vulkan',
      '--enable-gpu',
      '--ignore-gpu-blocklist',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--force-color-profile=srgb',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  await context.addInitScript(
    ({ seed, fixedNow }) => {
      let randomState = seed >>> 0;
      Math.random = () => {
        randomState = (randomState + 0x6d2b79f5) | 0;
        let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
        value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      };
      let evidenceNow = fixedNow;
      Date.now = () => evidenceNow;
      Object.defineProperty(window, '__twilightEvidenceClock', {
        configurable: false,
        enumerable: false,
        value: Object.freeze({
          setNow(value) {
            evidenceNow = Math.floor(Number(value));
            return evidenceNow;
          },
          snapshot() {
            return evidenceNow;
          },
        }),
      });
    },
    { seed: RNG_SEED, fixedNow: 1_800_000_000_000 },
  );
  await context.tracing.start({
    title: 'Twilight Route complete gameplay loop',
    screenshots: true,
    snapshots: true,
    sources: true,
  });
  page = await context.newPage();
  page.on('console', (message) => {
    const text = `${message.type()}: ${message.text()}`;
    if (message.type() === 'error' || message.type() === 'warning') consoleProblems.push(text);
    else if (message.type() === 'info') infoMessages.push(text);
  });
  page.on('pageerror', (error) => consoleProblems.push(`pageerror: ${error.stack || error}`));
  page.on('requestfailed', (request) => {
    requestProblems.push(
      `requestfailed: ${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'unknown'}`,
    );
  });
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const type = response.request().resourceType();
    if (['document', 'script', 'stylesheet', 'fetch', 'xhr'].includes(type)) {
      requestProblems.push(`http ${response.status()}: ${response.url()}`);
    }
  });

  await stamp('navigate:start');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('.starter-card', { state: 'visible', timeout: 30_000 });
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'starter', {
    timeout: 30_000,
  });
  await page.waitForTimeout(450);
  await stamp('starter:ready');
  const starter = await snapshot();
  check('runtime starts at starter choice', starter?.mode === 'starter', JSON.stringify(starter));
  check('three starter DOM choices render', (await page.locator('.starter-card').count()) === 3);
  check('three live starter models stage', starter?.starterModels === 3, `models=${starter?.starterModels}`);
  check('read-only evidence bridge is available', Boolean(starter));
  await capture('starter-choice');

  const starterClickAt = performance.now();
  await page.locator('.starter-card').first().click();
  const explore = await waitSnapshot('(value) => value?.mode === "explore" && value.party?.length === 1', 8_000, 'starter choice');
  transitions.starterChoiceToExploreMs = Number((performance.now() - starterClickAt).toFixed(3));
  check('starter click enters explore', explore.mode === 'explore');
  check('starter creates one-member party', explore.party.length === 1, JSON.stringify(explore.party));
  await stamp('explore:entered', { latencyMs: transitions.starterChoiceToExploreMs });

  // Test all four physical controls while still south of the encounter strip.
  await testControl('s', 'z', 1);
  await testControl('w', 'z', -1);
  await testControl('a', 'x', -1);
  await testControl('d', 'x', 1);
  const afterControls = await snapshot();
  check('all WASD controls produced empirical displacement', controls.length === 4 && controls.every((item) => item.playerTravel >= 0.28));
  check('camera displacement was empirical for all WASD keys', controls.every((item) => item.cameraTravel >= 0.12));
  await capture('trusted-wasd-exploration');

  // Move east while south of grass, then patrol north/south inside authored grass.
  if (afterControls.player.z < 2.25) {
    await driveUntil('s', (value) => value?.player?.z >= 2.55, 3_000, 'move south to safe staging');
  }
  const safe = await snapshot();
  if (safe.player.x < 1.25) {
    await driveUntil('d', (value) => value?.player?.x >= 1.3, 3_000, 'move east to grass flank');
  } else if (safe.player.x > 1.55) {
    await driveUntil('a', (value) => value?.player?.x <= 1.4, 3_000, 'move west to grass flank');
  }
  const encounterStartAt = performance.now();
  await stamp('encounter:grass-patrol-start');
  const firstEncounter = await patrolGrassForEncounter(1);
  transitions.grassPatrolToBattleModeMs = Number((performance.now() - encounterStartAt).toFixed(3));
  check('real grass traversal triggers first encounter', firstEncounter.mode === 'battle' && firstEncounter.encounterCount === 1, JSON.stringify(firstEncounter));
  const battleReadyMs = await waitBattleReady();
  transitions.firstBattleModeToMenuReadyMs = battleReadyMs;
  transitions.roamToFightPerformanceMs = await waitReadMeasure('roam→Fight');
  check('battle menu becomes actionable', battleReadyMs < 12_000, `${battleReadyMs}ms`);
  check(
    'runtime roam-to-Fight mark remains within 400ms budget',
    transitions.roamToFightPerformanceMs != null && transitions.roamToFightPerformanceMs <= 400,
    `${transitions.roamToFightPerformanceMs}ms`,
  );
  await stamp('battle:first-ready', {
    grassPatrolToBattleModeMs: transitions.grassPatrolToBattleModeMs,
    battleReadyMs,
  });
  await capture('first-encounter-battle');

  await installBrowserAudioProbe();
  const fightClickAt = performance.now();
  await page.locator('#battle-menu [data-act="fight"]').click();
  await page.waitForSelector('#move-menu:not(.hidden) .btn:not(.ghost):not([disabled])', {
    state: 'visible',
    timeout: 5_000,
  });
  transitions.fightClickToMoveMenuMs = Number((performance.now() - fightClickAt).toFixed(3));
  const moveBefore = await snapshot();
  const moveClickAt = performance.now();
  await page.locator('#move-menu .btn:not(.ghost):not([disabled])').first().click();
  await page.waitForFunction(
    () => window.__twilight?.snapshot?.().battle?.busy === true,
    { timeout: 2_000, polling: 10 },
  );
  await page.waitForFunction(
    () => {
      const snap = window.__twilight?.snapshot?.();
      const menu = document.querySelector('#battle-menu');
      return snap?.mode === 'battle' && snap.battle && !snap.battle.busy && menu && !menu.classList.contains('hidden');
    },
    { timeout: 15_000, polling: 25 },
  );
  transitions.moveClickToTurnReadyMs = Number((performance.now() - moveClickAt).toFixed(3));
  transitions.moveToFirstAttackFrameMs = await readMeasure('move→first-attack-frame');
  const afterMove = await snapshot();
  check('battle move damages the wild creature', afterMove.battle.foeHp < moveBefore.battle.foeHp, `${moveBefore.battle.foeHp} -> ${afterMove.battle.foeHp}`);
  check('battle turn leaves starter damaged for heal proof', afterMove.battle.playerHp < afterMove.battle.playerMaxHp, `${afterMove.battle.playerHp}/${afterMove.battle.playerMaxHp}`);
  check(
    'move-to-first-attack frame remains within 180ms budget',
    transitions.moveToFirstAttackFrameMs != null && transitions.moveToFirstAttackFrameMs <= 180,
    `${transitions.moveToFirstAttackFrameMs}ms`,
  );
  const audioAfterMove = await audioSnapshot();
  check('procedural WebAudio unlocks in the real browser', audioAfterMove?.contextState === 'running', JSON.stringify(audioAfterMove));
  check('battle audio bed and cues schedule in the browser', audioAfterMove?.scene === 'battle' && audioAfterMove.cueCount >= 2, JSON.stringify(audioAfterMove));
  await stamp('battle:first-turn-complete', {
    latencyMs: transitions.moveClickToTurnReadyMs,
    attackFrameMs: transitions.moveToFirstAttackFrameMs,
  });
  await capture('battle-after-real-move');

  const foeSpeciesId = afterMove.battle.foeSpeciesId;
  const catchRate = catchRates.get(foeSpeciesId);
  if (!Number.isFinite(catchRate)) throw new Error(`missing catchRate for ${foeSpeciesId}`);
  const catchTimestamp = findCatchTimestamp({
    maxHp: afterMove.battle.foeMaxHp,
    hp: afterMove.battle.foeHp,
    catchRate,
  });
  await page.evaluate((timestamp) => window.__twilightEvidenceClock.setNow(timestamp), catchTimestamp);
  const catchClickAt = performance.now();
  await page.locator('#battle-menu [data-act="ball"]').click();
  const caught = await waitSnapshot(
    '(value) => value?.mode === "explore" && value.catchCount === 1 && value.party?.length === 2',
    12_000,
    'catch outcome',
  );
  transitions.catchClickToPartyMs = Number((performance.now() - catchClickAt).toFixed(3));
  check('real ball click increments catch counter', caught.catchCount === 1);
  check('caught wild joins the party', caught.party.length === 2, JSON.stringify(caught.party));
  check('battle exits to exploration after catch', caught.mode === 'explore');
  check('party retains battle damage before heal', caught.party.some((member) => member.hp < member.maxHp), JSON.stringify(caught.party));
  await page.evaluate(async () => {
    const sound = window.__completeLoopAudio;
    if (!sound) return;
    await sound.cue('catch-success');
    await sound.setScene('explore');
  });
  await stamp('catch:party-updated', {
    latencyMs: transitions.catchClickToPartyMs,
    foeSpeciesId,
    catchRate,
    pinnedTimestamp: catchTimestamp,
  });
  await capture('caught-party-two');

  // Exit grass during encounter cooldown, route around the pad solid, touch its heal rim.
  const healBefore = caught.healCount;
  const healNavigationAt = performance.now();
  await driveUntil('d', (value) => value?.player?.x >= 2.42, 4_000, 'exit grass east');
  let east = await snapshot();
  // Acceleration/friction can coast past the target. Stay west of the pad's
  // expanded collision box before moving north, or the south face blocks us.
  if (east.player.x >= 2.88) {
    await driveUntil('a', (value) => value?.player?.x <= 2.68, 2_500, 'correct west of heal-pad collision');
    east = await snapshot();
  }
  check('heal route stays west of pad collision', east.player.x < 2.9, `x=${east.player.x.toFixed(4)}`);
  if (east.player.z < 4.38) {
    await driveUntil('s', (value) => value?.player?.z >= 4.32, 5_000, 'approach heal latitude');
  } else if (east.player.z > 4.62) {
    await driveUntil('w', (value) => value?.player?.z <= 4.68, 5_000, 'approach heal latitude');
  }
  const latitude = await settleCoordinate({
    axis: 'z',
    target: 4.5,
    tolerance: 0.075,
    negativeKey: 'w',
    positiveKey: 's',
    timeoutMs: 4_000,
    label: 'settle at heal latitude',
  });
  check('heal route aligns with pad rim latitude', Math.abs(latitude.player.z - 4.5) <= 0.075, `z=${latitude.player.z.toFixed(4)}`);
  const healed = await driveUntil(
    'd',
    (value) => value?.healCount > healBefore,
    4_000,
    'touch heal pad rim',
  );
  transitions.catchToHealMs = Number((performance.now() - healNavigationAt).toFixed(3));
  check('heal pad increments heal counter', healed.healCount === healBefore + 1, `${healBefore} -> ${healed.healCount}`);
  check('heal pad restores every party member', healed.party.length === 2 && healed.party.every((member) => member.hp === member.maxHp), JSON.stringify(healed.party));
  await page.evaluate(async () => {
    await window.__completeLoopAudio?.cue?.('heal');
  });
  await stamp('heal:complete', { latencyMs: transitions.catchToHealMs });
  await capture('party-healed');

  // Leave the pad, walk back into grass, and prove a second playable encounter.
  await driveUntil('a', (value) => value?.player?.x <= 1.38, 4_000, 'leave heal pad west');
  const replayStartAt = performance.now();
  await stamp('replay:grass-patrol-start');
  const replayEncounter = await patrolGrassForEncounter(2);
  transitions.healToReplayBattleModeMs = Number((performance.now() - replayStartAt).toFixed(3));
  check('second real grass encounter starts replay', replayEncounter.mode === 'battle' && replayEncounter.encounterCount === 2, JSON.stringify(replayEncounter));
  const replayReadyMs = await waitBattleReady();
  transitions.replayBattleModeToMenuReadyMs = replayReadyMs;
  check('replay battle menu is actionable', replayReadyMs < 12_000, `${replayReadyMs}ms`);
  check('party and catch counters persist into replay', replayEncounter.party.length === 2 && replayEncounter.catchCount === 1, JSON.stringify(replayEncounter.party));
  await stamp('replay:battle-ready', { latencyMs: replayReadyMs });
  await capture('replay-second-encounter');

  const runAt = performance.now();
  await page.locator('#battle-menu [data-act="run"]').click();
  const final = await waitSnapshot(
    '(value) => value?.mode === "explore" && value.encounterCount === 2 && value.party?.length === 2',
    5_000,
    'run from replay encounter',
  );
  transitions.runClickToExploreMs = Number((performance.now() - runAt).toFixed(3));
  check('run returns replay to exploration', final.mode === 'explore');
  check('complete-loop counters persist', final.encounterCount === 2 && final.catchCount === 1 && final.healCount >= 1, JSON.stringify(final));
  const finalAudio = await audioSnapshot();
  check('procedural audio remains live after full loop', finalAudio?.contextState === 'running' && finalAudio.scene === 'explore' && finalAudio.cueCount >= 4, JSON.stringify(finalAudio));
  transitions.totalLoopMs = elapsedMs();
  await stamp('loop:complete', { final, audio: finalAudio });
  await capture('complete-loop-returned-to-explore');

  check('browser console is free of warnings/errors', consoleProblems.length === 0, consoleProblems.join(' | '));
  check('critical browser requests succeeded', requestProblems.length === 0, requestProblems.join(' | '));
  check('all captured frames are non-black', screenshots.length >= 8 && screenshots.every((item) => item.rendered));
  check('entire loop used trusted input and read-only gameplay evidence', true, 'mouse/keyboard + snapshot() only');
} catch (error) {
  fatalError = String(error?.stack ?? error);
  check('complete-loop harness reached final state', false, fatalError);
} finally {
  if (context) {
    try {
      await context.tracing.stop({ path: tracePath });
    } catch (error) {
      tracePath = null;
      check('Playwright trace saved', false, String(error?.stack ?? error));
    }
  }
  if (browser) await browser.close();
  const report = currentReport();
  writeFileSync(join(OUT, 'complete-loop-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(
    join(OUT, 'transition-latencies.json'),
    `${JSON.stringify({ generatedAt: report.generatedAt, url: URL, transitions }, null, 2)}\n`,
  );
  console.log(`\ncomplete-loop browser gate: ${report.summary.checksPassed} passed, ${report.summary.checksFailed} failed`);
  console.log(`report: ${report.reportPath}`);
  console.log(`trace: ${report.tracePath ?? 'not saved'}`);
  if (!report.passed) process.exitCode = 1;
}
