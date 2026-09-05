import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';

const base = process.env.FIELD_OS_URL ?? 'http://127.0.0.1:5196';
const output = process.env.FIELD_OS_EVIDENCE ?? `/mnt/zer0models/pokemon-iac/devices/pokedex/field-os/evidence-${Date.now()}`;
const names = ['Bulbasaur', 'Charmander', 'Squirtle', 'Caterpie', 'Pidgey', 'Geodude'];
const ids = [1, 4, 7, 10, 16, 74];
const headless = process.env.FIELD_OS_HEADLESS === '1';
const report = { base, browserMode: headless ? 'headless' : 'headed', viewport: { width: 412, height: 892 }, status: 'running', expectedScenarios: 0, tests: [], errors: [], screenshots: [] };
let browser;
before(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless, args: ['--no-sandbox', '--disable-gpu-sandbox'] });
});
after(async () => {
  await browser?.close();
  report.status = report.tests.length === report.expectedScenarios && report.tests.every(t => t.passed) ? 'browser-green/device-HITL-pending' : 'red';
  fs.writeFileSync(path.join(output, 'regression.json'), JSON.stringify(report, null, 2) + '\n');
});
function scenario(name, body) {
  report.expectedScenarios++;
  test(name, async () => {
    let context, page;
    const errors = [];
    try {
      context = await browser.newContext({ viewport: report.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
        ...(name.startsWith('Opening') ? { recordVideo: { dir: path.join(output, 'video'), size: report.viewport } } : {}),
      });
      page = await context.newPage(); page.setDefaultTimeout(12000); page.on('pageerror', e => errors.push(e.message));
      await body(page, context); assert.deepEqual(errors, []); report.tests.push({ name, passed: true });
    }
    catch (e) { report.tests.push({ name, passed: false, error: String(e) }); throw e; }
    finally { report.errors.push(...errors); await context?.close(); if (page?.video()) report.video = await page.video().path(); }
  });
}
async function openOS(page, route = '/pokedex.html') {
  await page.goto(base + route);
  if (route === '/pokedex-device.html') await page.waitForURL('**/pokedex.html');
  const skip = page.locator('#skip-opening');
  if (await skip.isVisible()) await skip.click();
  await page.locator('#dock [data-nav="dex"]').waitFor({ state: 'visible' });
}
async function nav(page, app) { await page.locator(`#dock [data-nav="${app}"]`).click(); }
async function screenshot(page, name) { await page.screenshot({ path: path.join(output, name + '.png') }); report.screenshots.push(name + '.png'); }
async function controlsClear(page) {
  const result = await page.evaluate(() => [...document.querySelectorAll('#dock button,#scan-trigger,[data-action],#audio-toggle')].map(el => {
    const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { name: el.textContent, visible: r.width >= 44 && r.height >= 44 && r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, tappable: hit === el || el.contains(hit) };
  }));
  assert.equal(result.length, 10); assert.ok(result.every(r => r.visible && r.tappable), JSON.stringify(result));
}

scenario('Opening → BootUp → Ready enters the same live Field OS', async page => {
  await page.goto(base + '/pokedex.html');
  assert.equal(await page.locator('#open-pokedex').count(), 1, 'The main entry must expose Open Pokédex, not a separate viewer/lens link');
  await page.locator('#open-pokedex').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('#open-pokedex').disabled, undefined, { timeout: 25000 });
  await screenshot(page, 'closed-entry');
  await page.evaluate(() => {
    window.observedOpening = [];
    const stage = document.querySelector('#opening-stage');
    new MutationObserver(() => window.observedOpening.push(stage.dataset.phase)).observe(stage, { attributes: true, attributeFilter: ['data-phase'] });
  });
  await page.locator('#open-pokedex').click();
  await page.waitForFunction(() => document.querySelector('#opening-stage').dataset.phase === 'opening');
  await screenshot(page, 'opening');
  await page.waitForFunction(() => document.querySelector('#opening-stage').dataset.phase === 'booting');
  await screenshot(page, 'booting');
  await page.locator('#opening-stage').waitFor({ state: 'hidden', timeout: 25000 });
  assert.ok((await page.evaluate(() => window.observedOpening)).includes('ready'));
  assert.equal(new URL(page.url()).pathname, '/pokedex.html');
  await nav(page, 'dex'); await page.locator('[data-entry="1"]').click();
  assert.equal(await page.locator('#app h1').textContent(), 'Bulbasaur');
  await controlsClear(page); await screenshot(page, 'ready-live-bulbasaur');
  await page.waitForTimeout(900); // Keep the usable entry visible in the review clip.
});

scenario('Dex lists all six named species and each opens visible Pokémon art', async page => {
  await openOS(page); await page.locator('#browse-pokemon').click();
  await page.locator('[data-entry="1"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-entry]').count(), 6);
  for (const name of names) assert.ok((await page.locator('#app').textContent()).includes(name), name + ' must be discoverable by name');
  await screenshot(page, 'dex-six-species');
  for (const [index, id] of ids.entries()) {
    await nav(page, 'dex'); await page.locator(`[data-entry="${id}"]`).click();
    assert.equal(await page.locator('#app h1').textContent(), names[index]);
    const image = page.locator(`.specimen img[alt="${names[index]}"]`);
    assert.equal(await image.count(), 1, names[index] + ' needs actual official art instead of a placeholder shape');
    await image.waitFor({ state: 'visible' });
    await page.waitForFunction(id => { const image = document.querySelector(`.specimen img[data-species="${id}"]`); return image?.complete && image.naturalWidth > 100; }, id);
    await controlsClear(page);
  }
});

scenario('Physical scan identifies Pidgey, registers it and increments research once', async page => {
  await openOS(page); await nav(page, 'dex');
  const row = page.locator('[data-entry="16"]'); assert.match(await row.textContent(), /SEEN/);
  await page.locator('#scan-trigger').click();
  await page.waitForFunction(() => document.querySelector('#scan-title')?.textContent === 'Pidgey');
  await page.locator('[data-cry]').waitFor({ state: 'visible' });
  assert.match(await page.locator('#app').textContent(), /CAUGHT/);
  assert.match(await page.locator('#app').textContent(), /Research level 5\/10/);
  await nav(page, 'party'); assert.match(await page.locator('#app').textContent(), /Pidgey/);
  await nav(page, 'dex'); assert.match(await row.textContent(), /CAUGHT/);
  await page.locator('[data-action="back"]').click(); assert.equal(await page.locator('.home-grid').count(), 1);
  await controlsClear(page);
});

scenario('Research, map sightings, party, utilities, cry/audio and Home remain reachable', async page => {
  await openOS(page); await nav(page, 'research');
  await page.locator('[data-log="1"]').click(); assert.match(await page.locator('#app').textContent(), /9\/10/);
  await nav(page, 'map'); await page.locator('[data-place="Pidgey sighting"]').click();
  assert.match(await page.locator('#toast').textContent(), /Pidgey sighting/);
  await nav(page, 'party'); assert.match(await page.locator('#app').textContent(), /Bulbasaur/);
  await nav(page, 'tools');
  for (const name of ['Camera', 'Comms', 'Journal', 'Weather', 'Music', 'Clock', 'Settings', 'Save']) assert.equal(await page.locator(`[data-tool="${name}"]`).count(), 1);
  await page.locator('#audio-toggle').click(); assert.equal(await page.locator('#audio-toggle').textContent(), 'AUDIO ON');
  await nav(page, 'dex'); await page.locator('[data-entry="4"]').click(); await page.locator('[data-cry]').click();
  assert.match(await page.locator('#toast').textContent(), /VOCALIZATION/);
  await page.locator('[data-action="back"]').click(); assert.equal(await page.locator('.home-grid').count(), 1);
  await page.locator('[data-action="confirm"]').click(); assert.equal(await page.locator('#toast').textContent(), 'CONFIRMED');
  await controlsClear(page); await screenshot(page, 'field-home');
});

scenario('Former physical-device URL enters the functional OS', async page => {
  await openOS(page, '/pokedex-device.html');
  await nav(page, 'dex'); await page.locator('[data-entry="7"]').click();
  assert.equal(await page.locator('#app h1').textContent(), 'Squirtle'); await controlsClear(page);
});

scenario('A missing opening model still exposes all six Pokémon', async page => {
  await page.route('**/field-os-assets/*.glb', route => route.fulfill({ status: 404, body: 'Unavailable' }));
  await page.goto(base + '/pokedex.html');
  await page.locator('#opening-stage').waitFor({ state: 'hidden' });
  await page.locator('#browse-pokemon').click();
  await page.locator('[data-entry="1"]').waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-entry]').count(), 6); await controlsClear(page);
});
