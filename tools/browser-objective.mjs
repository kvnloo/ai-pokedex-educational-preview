#!/usr/bin/env node
/**
 * Real-browser objective gate for Twilight Route.
 * Phase 1: authored starter scene + trusted keyboard/player/camera displacement.
 * This intentionally fails closed when the runtime does not expose read-only evidence.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'shots', process.env.TWILIGHT_EVIDENCE_LABEL || 'objective-current');
const URL = process.env.TWILIGHT_URL || 'http://127.0.0.1:5180/?verify=1';
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
mkdirSync(OUT, { recursive: true });
const browser = await pw.chromium.launch({
  executablePath: chrome,
  headless: true,
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

  await page.locator('.starter-card').first().click();
  await page.waitForTimeout(700);
  const before = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.screenshot({ path: join(OUT, 'explore-before-w.png') });
  check('starter selection enters explore', before?.mode === 'explore', `mode=${before?.mode}`);

  await page.keyboard.down('w');
  await page.waitForTimeout(900);
  const held = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.keyboard.up('w');
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  await page.screenshot({ path: join(OUT, 'explore-after-w.png') });

  const playerTravel = distance3(before?.player, held?.player);
  const cameraTravel = distance3(before?.camera, after?.camera);
  check('trusted W key is observed as held', held?.input?.held?.includes('w') === true, JSON.stringify(held?.input));
  check('trusted W displaces player', playerTravel >= 0.75, `travel=${playerTravel.toFixed(3)}`);
  check('follow camera responds to W', cameraTravel >= 0.35, `travel=${cameraTravel.toFixed(3)}`);
  check('keyup clears W', after?.input?.held?.includes('w') === false, JSON.stringify(after?.input));
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
writeFileSync(join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nobjective browser gate: ${report.passed} passed, ${report.failed} failed`);
if (report.failed) process.exit(1);
