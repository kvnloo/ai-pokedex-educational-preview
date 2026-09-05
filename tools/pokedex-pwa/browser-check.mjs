import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const base = process.env.POKEDEX_PWA_URL ?? 'http://127.0.0.1:5195';
const output = process.env.POKEDEX_PWA_EVIDENCE ?? `/mnt/zer0models/pokemon-iac/devices/pokedex/pwa/evidence-${Date.now()}`;
const playwright = process.env.PLAYWRIGHT_MODULE ?? '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwright).href);
fs.mkdirSync(output, { recursive: true });
const report = { status: 'running', base, checkedAt: new Date().toISOString(), displaySimulation: 'matchMedia injection for installed modes; real Chromium Fullscreen API tested separately', checks: [], screenshots: [], errors: [] };
const check = (name, pass, detail) => {
  report.checks.push({ name, pass, detail });
  console.log((pass ? 'PASS ' : 'FAIL ') + name);
  if (!pass) throw new Error(name + ': ' + JSON.stringify(detail));
};
const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(output, 'chromium-profile-')), {
  executablePath: '/usr/bin/chromium', headless: false, args: ['--no-sandbox', '--disable-gpu-sandbox'],
  // The separate Field OS regression plays the 3D entry. This suite verifies
  // installed/offline access with the supported direct-entry motion preference.
  viewport: { width: 412, height: 892 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
});
const browser = context.browser();
async function enterOs(page) {
  if (await page.locator('#skip-opening').isVisible()) {
    try { await page.locator('#skip-opening').click({ timeout: 5000 }); }
    catch (error) { if (!(await page.locator('#field-os').isVisible())) throw error; }
  }
  await page.locator('#field-os').waitFor({ state: 'visible' });
}
try {
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  page.setDefaultTimeout(15000);
  await page.goto(`${base}/pokedex.html`); await enterOs(page);
  const manifestResponse = await context.request.get(`${base}/pokedex.webmanifest`);
  check('manifest available with JSON manifest MIME', manifestResponse.ok() && /application\/(manifest\+json|json)/.test(manifestResponse.headers()['content-type']));
  const manifest = await manifestResponse.json();
  check('manifest app identity, scope, launch and fullscreen fallback', manifest.id === './pokedex.html' && manifest.start_url === './pokedex.html?launch=homescreen' && manifest.scope === './' && manifest.display === 'fullscreen' && JSON.stringify(manifest.display_override) === '["fullscreen","standalone"]' && manifest.orientation === 'any' && manifest.theme_color === '#8f1626' && manifest.background_color === '#8f1626', manifest);
  const release = await (await context.request.get(`${base}/pokedex-pwa-release.json`)).json();
  report.release = release;
  let shellBytes = 0;
  for (const [file, hash] of Object.entries(release.hashes)) {
    const response = await context.request.get(base + file);
    const bytes = await response.body(); shellBytes += bytes.length;
    check('compiled file hash ' + file, response.ok() && createHash('sha256').update(bytes).digest('hex') === hash);
  }
  check('offline Field OS includes six official images and excludes models, APIs and the main game', shellBytes < 2000000 && release.files.filter(file => file.startsWith('/field-os-assets/home/')).length === 6 && release.files.every(file => !/private-assets|device-assets|main-|\.glb|\.map|api\/|references/.test(file)), { shellBytes, count: release.files.length });
  for (const icon of manifest.icons) {
    const measurements = await page.evaluate(async src => {
      const image = new Image(); image.src = src; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
      const pixel = [...ctx.getImageData(0, 0, 1, 1).data];
      return { width: image.width, height: image.height, pixel };
    }, icon.src);
    const size = Number(icon.sizes.split('x')[0]);
    check(`${icon.purpose} icon ${size}`, measurements.width === size && measurements.height === size && (icon.purpose === 'maskable' ? measurements.pixel[3] === 255 : measurements.pixel[3] === 0), measurements);
  }
  check('one-time hint visible on initial tab visit', await page.locator('#app-mode-tip').isVisible());
  await page.locator('#app-mode-tip').click();
  check('display dialog explains browser chrome and manual install', await page.locator('#display-options').isVisible() && (await page.locator('#display-options').innerText()).includes('cannot hide it automatically'));
  await page.screenshot({ path: path.join(output, 'browser-install-dialog.png') }); report.screenshots.push('browser-install-dialog.png');
  await page.keyboard.press('Escape');
  check('Escape closes dialog without changing app', !(await page.locator('#display-options').isVisible()) && await page.locator('.home-grid').isVisible());
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  const protocol = await context.newCDPSession(page);
  const installability = await protocol.send('Page.getInstallabilityErrors');
  check('Chromium reports no manifest/installability errors', installability.installabilityErrors.length === 0, installability);
  await page.reload(); await enterOs(page);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  check('one-time hint stays dismissed after reload', !(await page.locator('#app-mode-tip').isVisible()));
  const worker = await page.evaluate(async () => ({ controller: navigator.serviceWorker.controller.scriptURL, caches: await caches.keys(), files: await Promise.all((await caches.keys()).filter(k => k.startsWith('pokedex-private-shell-')).map(async k => (await (await caches.open(k)).keys()).map(r => new URL(r.url).pathname))) }));
  check('actual browser service worker controls private app and caches exact release', worker.controller.endsWith('/pokedex-sw-v1.js') && worker.caches.includes(release.cacheName) && JSON.stringify(worker.files.flat().sort()) === JSON.stringify([...release.files].sort()), worker);
  await context.setOffline(true);
  await page.reload(); await enterOs(page);
  check('actual offline home-screen start URL loads and works', await page.locator('.home-grid').isVisible());
  await page.goto(`${base}/pokedex.html?launch=homescreen`); await enterOs(page);
  await page.locator('[data-nav="dex"]').last().click();
  check('offline navigation and Pokédex entries work', await page.locator('[data-entry="1"]').isVisible());
  await page.locator('[data-entry="1"]').click();
  check('offline entry content works', (await page.locator('#app').textContent()).includes('Bulbasaur'));
  const uncached = await page.evaluate(async () => {
    const paths = ['/private-assets/charizard.glb', '/api/private-profile', '/pokedex-device.html'];
    return Promise.all(paths.map(async p => { try { await fetch(p); return false; } catch { return true; } }));
  });
  check('offline other game routes receive no false shell fallback', uncached.every(Boolean), uncached);
  await context.setOffline(false);
  await page.locator('[data-nav="tools"]').click(); await page.locator('[data-tool="Settings"]').click();
  check('permanent display settings remain reachable', await page.locator('#display-options').isVisible());
  await page.evaluate(() => {
    window.installPromptCalls = 0;
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt: async () => { window.installPromptCalls++; }, userChoice: Promise.resolve({ outcome: 'accepted' }) });
    window.dispatchEvent(event);
  });
  await page.locator('#install-pokedex').click();
  check('simulated beforeinstallprompt consumed once, without claiming tab is fullscreen', await page.evaluate(() => window.installPromptCalls === 1 && document.documentElement.dataset.displayMode === 'browser') && !(await page.locator('#install-pokedex').isVisible()) && (await page.locator('#display-feedback').innerText()).includes('home screen'));
  await page.locator('#fullscreen-pokedex').click();
  await page.waitForFunction(() => document.fullscreenElement !== null);
  await page.waitForFunction(() => document.documentElement.dataset.displayMode === 'fullscreen');
  check('real gesture-driven Fullscreen API updates actual display mode', await page.evaluate(() => !!document.fullscreenElement && document.documentElement.dataset.displayMode === 'fullscreen'), await page.evaluate(() => ({ media: matchMedia('(display-mode: fullscreen)').matches, element: !!document.fullscreenElement, mode: document.documentElement.dataset.displayMode })));
  await page.evaluate(() => document.exitFullscreen());
  await page.waitForFunction(() => document.documentElement.dataset.displayMode === 'browser');
  check('leaving fullscreen restores browser mode', true);
  await page.close();

  const cases = [
    ['portrait-384', 384, 832, 'standalone', [0, 0, 0, 0]],
    ['portrait-412', 412, 892, 'fullscreen', [0, 0, 0, 0]],
    ['landscape-832', 832, 384, 'standalone', [0, 0, 0, 0]],
    ['landscape-892', 892, 412, 'fullscreen', [0, 0, 0, 0]],
    ['portrait-safe', 412, 892, 'standalone', [32, 0, 24, 0]],
    ['landscape-safe', 892, 412, 'standalone', [0, 12, 24, 40]],
    ['tab-landscape-short', 832, 320, 'browser', [0, 0, 0, 0]],
    ['desktop-installed', 1440, 900, 'standalone', [0, 0, 0, 0]],
    ['desktop-tab', 1440, 900, 'browser', [0, 0, 0, 0]],
  ];
  for (const [name, width, height, mode, safe] of cases) {
    const c = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 1000, hasTouch: true, reducedMotion: 'reduce' });
    await c.addInitScript(({ mode }) => {
      const nativeMatch = window.matchMedia.bind(window);
      window.matchMedia = query => {
        const result = nativeMatch(query);
        if (query === '(display-mode: standalone)' || query === '(display-mode: fullscreen)') {
          Object.defineProperty(result, 'matches', { value: query === `(display-mode: ${mode})` });
        }
        return result;
      };
    }, { mode });
    const p = await c.newPage(); p.on('pageerror', e => report.errors.push(e.message));
    await p.goto(`${base}/pokedex.html`); await enterOs(p);
    await p.evaluate(safe => ['top', 'right', 'bottom', 'left'].forEach((edge, i) => document.documentElement.style.setProperty('--safe-' + edge, safe[i] + 'px')), safe);
    await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (mode !== 'browser') await p.waitForFunction(() => {
      const device = document.querySelector('.device'), r = device.getBoundingClientRect();
      return r.x === 0 && r.y === 0 && r.width === innerWidth && r.height === innerHeight && getComputedStyle(device).borderTopLeftRadius === '0px';
    }, undefined, { timeout: 3000 });
    const measure = () => p.evaluate(({ safe }) => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      const selectors = ['#dock', '#audio-toggle', '#scan-trigger', '[data-action="back"]', '[data-action="confirm"]', ...Array.from(document.querySelectorAll('#dock button'), (_, i) => `#dock button:nth-child(${i + 1})`)];
      const boxes = selectors.map(selector => {
        const el = document.querySelector(selector), r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return { selector, rect: r.toJSON(), inSafeViewport: r.left >= safe[3] && r.top >= safe[0] && r.right <= innerWidth - safe[1] && r.bottom <= innerHeight - safe[2], hit: el === hit || el.contains(hit) };
      });
      return { device: rect('.device'), app: rect('#app'), dock: rect('#dock'), boxes, safeStyle: document.documentElement.getAttribute('style'), padding: getComputedStyle(document.querySelector('.device')).padding, scrollWidth: document.documentElement.scrollWidth, innerWidth, innerHeight, mode: document.documentElement.dataset.displayMode, radius: getComputedStyle(document.querySelector('.device')).borderTopLeftRadius, reducedMotion: getComputedStyle(document.querySelector('.radar'), '::before').animationDuration };
    }, { safe });
    const m = await measure();
    check(name + ' controls and dock inside safe viewport and hit-testable', m.boxes.every(b => b.inSafeViewport && b.hit) && m.app.bottom <= m.dock.top + .1 && m.scrollWidth === width, m);
    check(name + ' display-mode detection', m.mode === mode, m.mode);
    if (mode !== 'browser' || width < 1000) check(name + ' device fills viewport edge to edge', m.device.x === 0 && m.device.y === 0 && m.device.width === width && m.device.height === height && m.radius === '0px');
    else check(name + ' desktop browser frame preserved', m.device.width < width && m.radius !== '0px');
    if (mode !== 'browser') check(name + ' installed app has no install hint', !(await p.locator('#app-mode-tip').isVisible()));
    check(name + ' reduced motion honored', Number.parseFloat(m.reducedMotion) <= .001, m.reducedMotion);
    await p.screenshot({ path: path.join(output, name + '.png') }); report.screenshots.push(name + '.png');
    const before = m.dock;
    await p.locator('#app').evaluate(el => { el.scrollTop = el.scrollHeight; });
    const after = await p.locator('#dock').boundingBox();
    check(name + ' internal scrolling leaves dock stationary', Math.abs(before.y - after.y) < .1);
    for (const app of ['dex', 'map', 'research', 'party', 'tools', 'home']) {
      await p.locator(`#dock [data-nav="${app}"]`).click();
      check(name + ' dock navigation ' + app, await p.locator(`#dock [data-nav="${app}"]`).evaluate(el => el.classList.contains('active')));
    }
    await c.close();
  }
  check('no uncaught application errors', report.errors.length === 0, report.errors);
  report.status = 'simulated-green/device-HITL-pending';
} catch (error) {
  report.status = 'failed'; report.failure = String(error); throw error;
} finally {
  fs.writeFileSync(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  await context.close();
}
