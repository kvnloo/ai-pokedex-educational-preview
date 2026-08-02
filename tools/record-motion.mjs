#!/usr/bin/env node
/** Record honest browser motion for side-by-side motion judging.
 *
 * Uses trusted Playwright pointer/keyboard input, records the rendered page (not
 * a research plate), and writes runtime snapshots alongside the WebM.
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.TWILIGHT_URL || 'http://127.0.0.1:5180/?verify=1&preset=medium';
const label = process.env.TWILIGHT_MOTION_LABEL || 'motion';
const outDir = join(ROOT, 'shots', label);
const finalVideo = join(outDir, 'motion.webm');

async function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    join(ROOT, 'node_modules/playwright'),
    join(ROOT, '../cod/node_modules/playwright'),
    '/workspace/zer0/products/cod/node_modules/playwright',
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      return await import(pathToFileURL(join(candidate, 'index.mjs')).href);
    } catch {
      try {
        return require(candidate);
      } catch {
        // try the next installation
      }
    }
  }
  return import('playwright').catch(() => null);
}

function chromePath() {
  return [process.env.TWILIGHT_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(
    (candidate) => candidate && existsSync(candidate),
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function snapshot(page, name, snapshots) {
  const value = await page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
  snapshots.push({ name, at: new Date().toISOString(), value });
  return value;
}

async function main() {
  const pw = await loadPlaywright();
  const executablePath = chromePath();
  if (!pw?.chromium || !executablePath) throw new Error('Playwright + Chromium are required');
  mkdirSync(outDir, { recursive: true });

  const browser = await pw.chromium.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox', '--disable-gpu-sandbox', '--disable-dev-shm-usage',
      '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--window-size=1280,720',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.message ?? error)));
  const snapshots = [];

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('canvas#viewport', { timeout: 30_000 });
  await page.waitForFunction(() => document.querySelectorAll('.starter-card').length === 3, null, { timeout: 30_000 });
  await snapshot(page, 'starter', snapshots);

  const cards = page.locator('.starter-card');
  for (let index = 0; index < 3; index += 1) {
    await cards.nth(index).hover();
    await sleep(650);
  }
  await cards.nth(0).click();
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore', null, { timeout: 15_000 });
  await snapshot(page, 'explore-start', snapshots);
  await sleep(700);

  // Trusted movement: sprint into the grass, then arc across the route.
  await page.keyboard.down('ShiftLeft');
  await page.keyboard.down('KeyW');
  await sleep(2800);
  await page.keyboard.down('KeyD');
  await sleep(1300);
  await page.keyboard.up('KeyD');
  await page.keyboard.up('KeyW');
  await page.keyboard.up('ShiftLeft');
  await snapshot(page, 'after-run', snapshots);

  // If an encounter starts during the motion take, include at least one honest
  // battle action; otherwise finish with a slower camera-follow walk.
  const inBattle = await page.evaluate(() => window.__twilight?.snapshot?.().mode === 'battle');
  if (inBattle) {
    await snapshot(page, 'battle', snapshots);
    const fight = page.locator('[data-act="fight"]');
    if (await fight.isVisible().catch(() => false)) await fight.click();
    await sleep(400);
    const move = page.locator('#move-menu button').first();
    if (await move.isVisible().catch(() => false)) await move.click();
    await sleep(1800);
    await snapshot(page, 'battle-action', snapshots);
  } else {
    await page.keyboard.down('KeyA');
    await page.keyboard.down('KeyW');
    await sleep(1800);
    await page.keyboard.up('KeyW');
    await page.keyboard.up('KeyA');
    await snapshot(page, 'walk-finish', snapshots);
  }
  await sleep(500);

  await page.close();
  await context.close();
  const rawVideo = video ? await video.path() : null;
  if (!rawVideo || !existsSync(rawVideo)) throw new Error('Playwright did not produce a video');
  if (rawVideo !== finalVideo) copyFileSync(rawVideo, finalVideo);
  await browser.close();

  const report = {
    source: 'browser-threejs-playwright-video',
    url,
    video: finalVideo,
    trusted_input: true,
    snapshots,
    page_errors: pageErrors,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(join(outDir, 'motion.json'), JSON.stringify(report, null, 2));
  if (pageErrors.length) throw new Error(`page errors: ${pageErrors.join('; ')}`);
  console.log(JSON.stringify({ video: finalVideo, snapshots: snapshots.map((item) => item.name) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
