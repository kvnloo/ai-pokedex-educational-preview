#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const URL = process.env.TWILIGHT_URL ?? 'http://127.0.0.1:5192/?verify=1&preset=medium';
const OUT = resolve(process.env.TWILIGHT_INPUT_EVIDENCE_DIR ?? join(ROOT, 'shots', 'headed-input-current'));
const require = createRequire(import.meta.url);
const checks = [];
const check = (name, ok, detail = '') => { checks.push({ name, ok: Boolean(ok), detail }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
const snap = page => page.evaluate(() => window.__twilight?.snapshot?.() ?? null);
const distance = (a, b) => Math.hypot((a?.x ?? 0) - (b?.x ?? 0), (a?.z ?? 0) - (b?.z ?? 0));

async function playwright() {
  for (const candidate of [join(ROOT, 'node_modules/playwright'), '/workspace/zer0/products/cod/node_modules/playwright']) {
    if (!existsSync(candidate)) continue;
    try { return await import(pathToFileURL(join(candidate, 'index.mjs')).href); } catch {}
    try { return require(candidate); } catch {}
  }
  throw new Error('Playwright unavailable');
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true, mode: 0o700 });
chmodSync(OUT, 0o700);
let browser;
try {
  const pw = await playwright();
  browser = await pw.chromium.launch({ executablePath: process.env.TWILIGHT_CHROME ?? '/usr/bin/chromium', headless: false, args: ['--no-sandbox', '--disable-background-timer-throttling'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, hasTouch: true });
  await context.addInitScript(() => {
    const axes = [0, 0, 0, 0];
    const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
    const pad = { axes, buttons, connected: true, id: 'Playwright standards-shape controller', index: 0, mapping: 'standard', timestamp: 0 };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [pad, null, null, null] });
    Object.defineProperty(window, '__headedInputController', { value: { axes, buttons, pad }, configurable: false });
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('.starter-card').first().click();
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore');

  const touchBefore = await snap(page);
  const box = await page.locator('#touch-pad').boundingBox();
  if (!box) throw new Error('touch pad has no headed layout box');
  const cdp = await context.newCDPSession(page);
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const east = { x: box.x + box.width * 0.85, y: center.y };
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...center, id: 1, radiusX: 6, radiusY: 6, force: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...east, id: 1, radiusX: 6, radiusY: 6, force: 1 }] });
  await page.waitForTimeout(250);
  const touchHeld = await snap(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  check('headed trusted touch displaces player', (touchHeld.player.x - touchBefore.player.x) >= 0.7, `${touchBefore.player.x} -> ${touchHeld.player.x}`);

  await page.waitForFunction(() => navigator.getGamepads().some(Boolean), { timeout: 10000 });
  const controllerBefore = await snap(page);
  await page.evaluate(() => { window.__headedInputController.axes[1] = 1; window.__headedInputController.pad.timestamp = performance.now(); });
  await page.waitForTimeout(250);
  const controllerHeld = await snap(page);
  await page.evaluate(() => { window.__headedInputController.axes[1] = 0; });
  check('headed standard Gamepad API controller displaces player', (controllerHeld.player.z - controllerBefore.player.z) >= 0.7, `${controllerBefore.player.z} -> ${controllerHeld.player.z}`);

  for (let segment = 0; segment < 30; segment += 1) {
    const state = await snap(page);
    if (state.mode === 'battle') {
      await page.locator('#battle-menu [data-act="run"]').click();
      await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore');
      continue;
    }
    if (state.player.x <= -4.65) break;
    await page.keyboard.down('a');
    await page.waitForTimeout(250);
    await page.keyboard.up('a');
  }
  await page.evaluate(() => { const button = window.__headedInputController.buttons[0]; button.pressed = true; button.touched = true; button.value = 1; });
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'battle', { timeout: 5000 });
  await page.evaluate(() => { const button = window.__headedInputController.buttons[0]; button.pressed = false; button.touched = false; button.value = 0; });
  const action = await snap(page);
  check('headed controller action enters gym battle', action?.battle?.kind === 'gym', JSON.stringify(action?.battle));

  const shot = join(OUT, 'touch-controller-action.png');
  await page.screenshot({ path: shot });
  chmodSync(shot, 0o600);
} finally {
  if (browser) await browser.close();
}
const report = { generatedAt: new Date().toISOString(), url: URL, headed: true, checks, passed: checks.every(item => item.ok) };
const reportPath = join(OUT, 'report.json');
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
chmodSync(reportPath, 0o600);
console.log(`headed input gate: ${checks.filter(item => item.ok).length}/${checks.length}`);
if (!report.passed) process.exitCode = 1;
