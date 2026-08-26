#!/usr/bin/env node
/**
 * Real-browser objective gate for Twilight Route.
 * Canonical Pallet-to-Pewter traversal, story, battle boundary, controls and persistence.
 * This intentionally fails closed when the runtime does not expose read-only evidence.
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_ROOT = process.env.TWILIGHT_EVIDENCE_ROOT
  || '/mnt/zer0models/pokemon-iac/evidence/canonical-repair';
let OUT = join(EVIDENCE_ROOT, `.pending-${process.pid}`);
const URL = process.env.TWILIGHT_URL || 'http://127.0.0.1:5180/?verify=1';
const HEADED = process.argv.includes('--headed');
const require = createRequire(import.meta.url);

async function loadPlaywright() {
  const candidates = [
    join(ROOT, 'node_modules/playwright'),
    join(ROOT, '../cod/node_modules/playwright'),
    '/workspace/zer0/products/cod/node_modules/playwright',
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try { return await import(pathToFileURL(join(p, 'index.mjs')).href); } catch {}
    try { return require(p); } catch {}
  }
  return null;
}

function distance3(a, b) {
  return Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.y ?? 0) - (b?.y ?? 0), (a?.z ?? 0) - (b?.z ?? 0));
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

const pw = await loadPlaywright();
if (!pw?.chromium) throw new Error('Playwright unavailable');
const chrome = process.env.TWILIGHT_CHROME || '/usr/bin/chromium';
mkdirSync(EVIDENCE_ROOT, { recursive: true, mode: 0o700 });
chmodSync(EVIDENCE_ROOT, 0o700);
mkdirSync(OUT, { mode: 0o700 });
const browser = await pw.chromium.launch({
  executablePath: chrome,
  headless: !HEADED,
  args: [
    '--no-sandbox', '--disable-gpu-sandbox', '--disable-dev-shm-usage',
    '--ozone-platform=headless', '--use-gl=angle', '--use-angle=vulkan',
    '--enable-gpu', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--force-color-profile=srgb',
  ],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleProblems = [];
page.on('console', m => {
  if (m.type() === 'error' || m.type() === 'warning') consoleProblems.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', e => consoleProblems.push(`pageerror: ${e.stack || e}`));

try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('.starter-card', { timeout: 30_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, 'starter.png') });
  chmodSync(join(OUT, 'starter.png'), 0o600);

  const starter = await page.evaluate(() => {
    const bridge = window.__twilight;
    return {
      cards: document.querySelectorAll('.starter-card').length,
      previewOrbs: document.querySelectorAll('.preview-orb').length,
      bridge: !!bridge && typeof bridge.snapshot === 'function',
      snapshot: bridge?.snapshot?.() ?? null,
    };
  });
  check('three starter choices render', starter.cards === 3, JSON.stringify(starter));
  check('starter cards contain no placeholder orbs', starter.previewOrbs === 0, `previewOrbs=${starter.previewOrbs}`);
  check('read-only runtime evidence bridge exists', starter.bridge, JSON.stringify(starter.snapshot));
  check('three live starter models stage in world', starter.snapshot?.starterModels === 3, `starterModels=${starter.snapshot?.starterModels}`);
  check('runtime begins in starter mode', starter.snapshot?.mode === 'starter', `mode=${starter.snapshot?.mode}`);
  const canonical = starter.snapshot?.canonicalWorld;
  check('browser consumes normalized canonical game', canonical?.activeGameId === 'game:yellow', JSON.stringify(canonical));
  check('browser consumes normalized Pallet through post-Pewter Route 3 traversal',
    canonical?.path?.[0] === 'location:kanto:pallet-town'
      && canonical?.path?.at(-1) === 'location:kanto:route-3'
      && canonical?.path?.length === 8,
    JSON.stringify(canonical?.path));
  check('browser consumes derived traversal coordinates',
    canonical?.coordinates?.['location:kanto:pallet-town']?.[1] === 0
      && canonical?.coordinates?.['location:kanto:pewter-city']?.[1] === 6,
    JSON.stringify(canonical?.coordinates));

  await page.locator('.starter-card').first().click();
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.screenshot({ path: join(OUT, 'explore-before-w.png') });
  chmodSync(join(OUT, 'explore-before-w.png'), 0o600);
  check('starter selection enters explore', before?.mode === 'explore', `mode=${before?.mode}`);
  check('canonical battle boundary is stable outside battle', before?.battle === null
    && before?.canonicalWorld?.sliceId === 'world-slice:kanto:pallet-pewter'
    && before?.canonicalWorld?.presentationPolicy?.privateAssetsInPublicArtifactsAllowed === false,
  JSON.stringify({ battle: before?.battle, canonicalWorld: before?.canonicalWorld }));

  await page.keyboard.down('w');
  await page.waitForTimeout(900);
  const held = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.keyboard.up('w');
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.screenshot({ path: join(OUT, 'explore-after-w.png') });
  chmodSync(join(OUT, 'explore-after-w.png'), 0o600);

  const playerTravel = distance3(before?.player, held?.player);
  const cameraTravel = distance3(before?.camera, after?.camera);
  check('trusted W key is observed as held', held?.input?.held?.includes('w') === true, JSON.stringify(held?.input));
  check('trusted W displaces player', playerTravel >= 0.75, `travel=${playerTravel.toFixed(3)}`);
  check('follow camera responds to W', cameraTravel >= 0.35, `travel=${cameraTravel.toFixed(3)}`);
  check('keyup clears W', after?.input?.held?.includes('w') === false, JSON.stringify(after?.input));
  check('canonical traversal starts behaviorally in Pallet', after?.campaign?.currentLocationId === canonical.path[0], JSON.stringify(after?.campaign));

  let sawBattle = false;
  for (let step = 0; step < 12; step += 1) {
    if ((await page.evaluate(() => window.__twilight?.snapshot?.().mode)) === 'battle') {
      sawBattle = true;
      await page.locator('#battle-menu [data-act="run"]').click();
      await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore');
    }
    const key = step % 2 === 0 ? 'w' : 's';
    await page.keyboard.down(key);
    await page.waitForTimeout(800);
    await page.keyboard.up(key);
    const progress = await page.evaluate(() => window.__twilight?.snapshot?.().campaign ?? null);
    if (progress?.currentLocationId === canonical.path.at(-1)) break;
  }
  if ((await page.evaluate(() => window.__twilight?.snapshot?.().mode)) === 'battle') {
    sawBattle = true;
    await page.locator('#battle-menu [data-act="run"]').click();
    await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore');
  }
  const route3 = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  check('trusted movement traverses normalized Pallet to Route 3 path',
    route3?.campaign?.currentLocationId === canonical.path.at(-1)
      && JSON.stringify(route3?.campaign?.visitedLocationIds) === JSON.stringify(canonical.path),
    JSON.stringify(route3?.campaign));
  check('normalized story triggers fire once in canonical order',
    JSON.stringify(route3?.campaign?.storyEventIds) === JSON.stringify(canonical.events.map(event => event.id)),
    JSON.stringify(route3?.campaign?.storyEventIds));
  check('Route 1 traversal crosses a real encounter and battle boundary', sawBattle && route3?.encounterCount >= 1, `sawBattle=${sawBattle} encounters=${route3?.encounterCount}`);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__twilight?.snapshot?.().campaign?.currentLocationId === 'location:kanto:route-3');
  const reloaded = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  check('canonical traversal save reload restores Route 3 and ordered story',
    reloaded?.campaign?.currentLocationId === route3?.campaign?.currentLocationId
      && JSON.stringify(reloaded?.campaign?.storyEventIds) === JSON.stringify(route3?.campaign?.storyEventIds)
      && reloaded?.campaign?.saveRevision > 0,
    JSON.stringify(reloaded?.campaign));
  const pixels = await page.locator('#viewport').screenshot();
  const nonBlackBytes = pixels.reduce((count, byte) => count + (byte > 8 ? 1 : 0), 0);
  check('reloaded canonical traversal renders non-black canvas evidence', nonBlackBytes > pixels.length * 0.01, `nonBlackBytes=${nonBlackBytes}/${pixels.length}`);
  check('live browser has no console/page errors', consoleProblems.length === 0, consoleProblems.join(' | '));
} finally {
  await browser.close();
}

const report = {
  url: URL,
  generatedAt: new Date().toISOString(),
  checks,
  consoleProblems,
  passed: checks.filter(x => x.ok).length,
  failed: checks.filter(x => !x.ok).length,
};
const captureNames = ['explore-after-w.png', 'explore-before-w.png', 'starter.png'];
const contentHash = createHash('sha256');
for (const name of captureNames) {
  const digest = createHash('sha256').update(readFileSync(join(OUT, name))).digest('hex');
  contentHash.update(`${name}\0${digest}\n`);
}
const finalOut = join(EVIDENCE_ROOT, contentHash.digest('hex'));
renameSync(OUT, finalOut);
OUT = finalOut;
report.evidenceDirectory = OUT;
writeFileSync(join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
chmodSync(join(OUT, 'report.json'), 0o600);
console.log(`\nobjective browser gate: ${report.passed} passed, ${report.failed} failed`);
console.log(`evidence: ${OUT}`);
if (report.failed) process.exit(1);
