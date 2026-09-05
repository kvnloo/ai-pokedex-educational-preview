import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const lane = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const candidates = JSON.parse(fs.readFileSync(path.join(lane, 'canonical/devices/generations/review-candidates.json')));
const output = '/mnt/zer0models/pokemon-iac/devices/pokedex/review-batches/runtime-evidence/candidates';
const base = process.env.POKEDEX_GENERATIONS_URL ?? 'https://0.taila30dc.ts.net:8471';
const packageRoot = [path.join(lane, 'node_modules/playwright'), '/workspace/zer0/products/cod/node_modules/playwright'].find(fs.existsSync);
if (!packageRoot) throw new Error('Playwright is unavailable');
const { chromium } = await import(pathToFileURL(path.join(packageRoot, 'index.mjs')).href);
fs.mkdirSync(output, { recursive: true });
const report = { base, checks: [], errors: [], screenshots: [] };
function check(name, pass, detail) {
  report.checks.push({ name, pass, detail });
  console.log((pass ? 'PASS ' : 'FAIL ') + name);
  if (!pass) throw new Error(name + ': ' + JSON.stringify(detail));
}
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: false, args: ['--no-sandbox', '--disable-gpu-sandbox'] });
try {
  for (const candidate of candidates) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    page.on('pageerror', error => report.errors.push(error.message));
    const snap = () => page.evaluate(() => window.__pokedexDevice.snapshot());
    const state = value => page.waitForFunction(expected => window.__pokedexDevice?.snapshot().state === expected, value, { timeout: 20000 });
    const loaded = triangles => page.waitForFunction(count => !window.__pokedexDevice?.snapshot().loading && window.__pokedexDevice.snapshot().triangles === count, triangles);
    const screenshot = async name => { const file = path.join(output, candidate.id + '-' + name + '.png'); await page.screenshot({ path: file }); report.screenshots.push(file); };
    await page.goto(`${base}/pokedex-device.html?candidate=${candidate.id}`, { waitUntil: 'networkidle' });
    await loaded(candidate.exports[0].triangles);
    check(candidate.id + ' hero geometry loads', (await snap()).candidate === candidate.id, await snap());
    await screenshot('closed');
    let targets = await page.evaluate(() => window.__pokedexDevice.targets());
    await page.mouse.move(targets.body.x, targets.body.y); await page.mouse.down();
    await page.mouse.move(targets.body.x + 50, targets.body.y, { steps: 8 });
    await page.mouse.move(targets.body.x, targets.body.y, { steps: 8 }); await page.mouse.up();
    check(candidate.id + ' orbit is not a tap', (await snap()).state === 'closed');
    await page.locator('#reset-view').click();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 370, id: 0 }, { x: 230, y: 370, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 120, y: 370, id: 0 }, { x: 260, y: 370, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    check(candidate.id + ' pinch is not a tap', (await snap()).state === 'closed');
    await page.locator('#reset-view').click();
    targets = await page.evaluate(() => window.__pokedexDevice.targets());
    await page.touchscreen.tap(targets.body.x, targets.body.y);
    await state('opening'); check(candidate.id + ' physical shell opens', true);
    await state('booting'); await screenshot('boot');
    await state('idle'); await screenshot('ready');
    targets = await page.evaluate(() => window.__pokedexDevice.targets());
    check(candidate.id + ' physical A is addressable', targets.button !== null, targets.button);
    await page.touchscreen.tap(targets.button.x, targets.button.y);
    await state('pressing');
    check(candidate.id + ' physical mesh tap confirms once', (await snap()).confirmations === 1);
    await state('idle');
    await page.locator('.inspector summary').click();
    await page.selectOption('#display-mode', 'live');
    await page.selectOption('#lod', '1'); await loaded(candidate.exports[1].triangles);
    check(candidate.id + ' reduced export keeps idle/live state', (await snap()).state === 'idle' && (await snap()).display === 'live', await snap());
    await page.selectOption('#lod', '0'); await page.selectOption('#lod', '1'); await page.selectOption('#lod', '0');
    await loaded(candidate.exports[0].triangles);
    check(candidate.id + ' latest detail request wins', (await snap()).state === 'idle');
    await screenshot('inspector');
    await page.locator('.inspector summary').click(); await screenshot('live');
    await page.locator('#press-button').click(); await state('pressing'); await state('idle');
    check(candidate.id + ' live screen confirmation increments', (await snap()).confirmations === 2);
    await page.locator('.inspector summary').click();
    await page.selectOption('#camera-view', 'underside'); await page.locator('.inspector summary').click(); await screenshot('underside');
    await page.locator('#reset-view').click();
    await page.locator('.inspector summary').click();
    const failedUrl = `**/device-review-assets/${candidate.id}/1.glb`;
    await page.route(failedUrl, route => route.abort());
    await page.selectOption('#lod', '1'); await page.locator('#load-error').waitFor({ state: 'visible' });
    check(candidate.id + ' failed detail load disables actions', await page.locator('#press-button').isDisabled());
    await page.unroute(failedUrl); await page.locator('#retry').click(); await loaded(candidate.exports[1].triangles);
    check(candidate.id + ' retry restores prior state', (await snap()).state === 'idle');
    await page.selectOption('#lod', '0'); await loaded(candidate.exports[0].triangles);
    await page.selectOption('#display-mode', 'original'); await page.locator('.inspector summary').click();
    await page.locator('#toggle-lid').click(); await state('closed');
    check(candidate.id + ' closing returns to rest', await page.locator('#press-button').isDisabled());
    await page.locator('#toggle-lid').click(); await state('idle');
    const beforeResize = await page.evaluate(() => window.__pokedexDevice.targets().direction);
    for (const size of [{ width: 844, height: 390 }, { width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      await page.waitForFunction(width => innerWidth === width && document.querySelector('canvas').getBoundingClientRect().width === document.querySelector('#viewport').clientWidth, size.width);
      const layout = await page.evaluate(() => ({ width: innerWidth, screenHeight: innerHeight, scrollWidth: document.documentElement.scrollWidth, viewport: document.querySelector('canvas').getBoundingClientRect().toJSON() }));
      check(candidate.id + ' layout ' + size.width, layout.width >= layout.scrollWidth && layout.viewport.height > 0 && layout.viewport.bottom <= layout.screenHeight && layout.viewport.top >= 0, layout);
      const framing = await page.evaluate(() => window.__pokedexDevice.targets());
      check(candidate.id + ' resize keeps full device in frame ' + size.width, framing.corners.every(point => point.x >= framing.viewport.x && point.x <= framing.viewport.x + framing.viewport.width && point.y >= framing.viewport.y && point.y <= framing.viewport.y + framing.viewport.height), framing);
      check(candidate.id + ' resize preserves orbit ' + size.width, framing.direction.every((value, i) => Math.abs(value - beforeResize[i]) < .001), framing.direction);
      await screenshot('resized-' + size.width);
    }
    await page.close();
  }
  check('No page exceptions', report.errors.length === 0, report.errors);
  report.passed = true;
} catch (error) {
  report.passed = false; report.failure = String(error); process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(output, 'browser-check.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, failure: report.failure }));
  await browser.close();
}
