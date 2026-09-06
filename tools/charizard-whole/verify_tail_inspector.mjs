import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r03';
const output = `${root}/browser`;
await mkdir(output, { recursive: true });
const base = 'https://0.taila30dc.ts.net:8445';
const url = `${base}/devtools/experiments.html?pokemon=charizard&a=charizard-whole-r03-match-r01&b=charizard-whole-r03&view=fair-threequarter`;
const views = {
  'fair-minusY': 'front', 'fair-plusX': 'right', 'fair-plusY': 'rear', 'fair-minusX': 'left',
  'fair-threequarter': 'threequarter', 'face-negative-side': 'face-near',
  'face-positive-side': 'face-far', 'face-front': 'face-front',
};
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const report = { url, checks: [], errors: [], deviceAcceptance: false,
  scope: 'Inspector selection and image/video availability. No mobile layout approval or Field OS deployment change.' };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(url);
  await page.locator('#choose-1').selectOption('charizard-whole-r03');
  for (const revision of ['r02', 'r03']) {
    await page.locator('#choose-1').selectOption(`charizard-whole-${revision}`);
    for (const [view, filename] of Object.entries(views)) {
      await page.locator('#view').selectOption(view);
      await page.waitForFunction(({ revision, filename }) => {
        const images = [...document.querySelectorAll('img[data-preview]')];
        return images.length === 2 && images.every(image => image.complete && image.naturalWidth === 720 &&
          image.src.endsWith(`/${filename}.png`)) && images[1].src.includes(`/after-whole-${revision}/`);
      }, { revision, filename });
      report.checks.push({ revision, view, bothImagesDecoded: true });
    }
  }
  await page.locator('#view').selectOption('fair-threequarter');
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/desktop-comparison.png` });
  const phone = await browser.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  await phone.goto(url);
  await phone.waitForFunction(() => {
    const images = [...document.querySelectorAll('img[data-preview]')];
    return images.length === 2 && images.every(image => image.complete && image.naturalWidth === 720);
  });
  await phone.locator('#comparison').scrollIntoViewIfNeeded();
  await phone.screenshot({ path: `${output}/phone-availability.png` });
  report.phone = { viewport: [412, 915], imagesDecoded: true, layoutAcceptance: false };
  const videoName = 'turntable-whole-r01-vs-whole-r03.mp4';
  const response = await page.request.get(`${base}/assets/blender/charizard-whole-r03/${videoName}`);
  assert.equal(response.status(), 200);
  const local = await readFile(`${root}/${videoName}`);
  const served = await response.body();
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash(served), hash(local));
  report.video = { status: 200, sha256: hash(served), exactPublishedBytes: true };
  assert.deepEqual(report.errors, []);
  await writeFile(`${output}/availability.json`, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify(report) + '\n');
} finally {
  await browser.close();
}
