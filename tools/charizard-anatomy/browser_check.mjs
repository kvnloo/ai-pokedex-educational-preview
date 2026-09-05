import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';

const base = 'https://0.taila30dc.ts.net:8445';
const out = '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02a';
const query = '?pokemon=charizard&a=charizard-tail-r01&b=charizard-tail-r02a&view=root-side';
const report = { checkedAt: new Date().toISOString(), checks: [], errors: [] };
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
function check(name, pass) {
  report.checks.push({ name, pass });
  if (!pass) throw new Error(name);
}
try {
  const desktop = await browser.newContext({ viewport: { width: 1400, height: 820 } });
  const page = await desktop.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(base + '/devtools/experiments.html' + query);
  await page.locator('#choose-1').waitFor();
  check('correct parent and candidate', await page.locator('#choose-0').inputValue() === 'charizard-tail-r01' && await page.locator('#choose-1').inputValue() === 'charizard-tail-r02a');
  for (const view of ['root-side', 'root-rear', 'fair-minusY', 'fair-plusX', 'fair-plusY', 'fair-minusX', 'fair-threequarter']) {
    await page.locator('#view').selectOption(view);
    await page.waitForFunction(() => [...document.querySelectorAll('img[data-preview]')].length === 2 && [...document.querySelectorAll('img[data-preview]')].every(img => img.complete && img.naturalWidth > 0));
    check('both comparison images decode: ' + view, true);
  }
  await page.locator('#view').selectOption('root-side');
  await page.waitForFunction(() => [...document.querySelectorAll('img[data-preview]')].every(img => img.complete && img.naturalWidth > 0));
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.getElementById('comparison').getBoundingClientRect().top + window.scrollY - 12));
  await page.screenshot({ path: path.join(out, 'comparison-preview.png') });
  const phone = await browser.newContext({ viewport: { width: 412, height: 892 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const mobile = await phone.newPage();
  mobile.on('pageerror', error => report.errors.push(error.message));
  const image = 'assets/blender/charizard-tail-r02a/charizard-tail-r02a-root-side.png';
  report.phoneUrl = base + '/devtools/pokedex.html?' + new URLSearchParams({ pokemon: 'charizard', tab: 'iterations', run: 'charizard-tail-r02a', view: 'root-side' });
  mobile.setDefaultTimeout(15000);
  await mobile.goto(report.phoneUrl);
  await mobile.locator('#iteration-selector').waitFor();
  await mobile.waitForFunction(() => document.querySelector('.iteration-preview img')?.complete && document.querySelector('.iteration-preview img')?.naturalWidth > 0);
  check('phone opens exact mesh preview', (await mobile.locator('.iteration-preview img').getAttribute('src')).endsWith(image));
  const preview = await mobile.locator('.iteration-preview img').boundingBox();
  check('phone reveals preview inside viewport', preview.x >= 0 && preview.y >= 0 && preview.x + preview.width <= 412 && preview.y + preview.height <= 892);
  await mobile.screenshot({ path: path.join(out, 'phone-preview.png') });
  for (const revision of ['r01', 'r02a']) {
    await mobile.locator('#iteration-selector').selectOption('charizard-tail-' + revision);
    await mobile.locator('[data-view="root-side"]').click();
    await mobile.waitForFunction(revision => {
      const img = document.querySelector('.iteration-preview img');
      return img?.complete && img.naturalWidth > 0 && img.src.endsWith('charizard-tail-' + revision + '-root-side.png');
    }, revision);
    check('phone switches to ' + revision + ' close-up', true);
  }
  check('phone has no horizontal page overflow', await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  check('no JavaScript errors', report.errors.length === 0);
  report.status = 'simulated-browser-pass; real-device review pending';
} finally {
  fs.writeFileSync(path.join(out, 'browser-check.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
