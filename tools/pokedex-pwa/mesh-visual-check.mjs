import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const base = process.env.POKEDEX_PWA_URL ?? 'http://127.0.0.1:5195';
const output = process.env.POKEDEX_MESH_EVIDENCE ?? `/mnt/zer0models/pokemon-iac/devices/pokedex/pwa/mesh-evidence-${Date.now()}`;
const playwright = process.env.PLAYWRIGHT_MODULE ?? '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwright).href);

fs.mkdirSync(output, { recursive: true });
const failures = [];
const report = { base, checkedAt: new Date().toISOString(), candidate: 'v003-r08', checks: [], screenshots: [], failures };

function check(name, pass, detail) {
  report.checks.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
  if (!pass) failures.push({ name, detail });
}

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: false,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
});

try {
  for (const [name, width, height] of [['portrait', 412, 892], ['landscape', 892, 412]]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${base}/pokedex.html?candidate=v003-r08`);

    const genericCount = await page.locator('.device, .hardware-bar, .physical-controls, .lens, .led, .dpad, .scan-trigger, .face-buttons').count();
    const genericCss = await page.evaluate(() => {
      const obsolete = ['.device', '.hardware-bar', '.physical-controls', '.lens', '.led', '.dpad', '.scan-trigger', '.face-buttons'];
      const selectors = [];
      const visit = rules => {
        for (const rule of rules) {
          if ('selectorText' in rule && obsolete.some(selector => rule.selectorText.split(',').some(part => part.trim().startsWith(selector)))) selectors.push(rule.selectorText);
          if ('cssRules' in rule) visit(rule.cssRules);
        }
      };
      for (const sheet of document.styleSheets) visit(sheet.cssRules);
      return selectors;
    });
    check(`${name} has no generic CSS hardware`, genericCount === 0 && genericCss.length === 0, { genericCount, genericCss });

    let ready = false;
    try {
      await page.waitForFunction(() => document.documentElement.dataset.meshState === 'ready', undefined, { timeout: 30000 });
      ready = true;
    } catch {
      // Report the missing runtime below while preserving the baseline capture.
    }
    check(`${name} renders the selected mesh`, ready, await page.evaluate(() => ({ state: document.documentElement.dataset.meshState, canvas: !!document.querySelector('#pokedex-shell') })));

    const screenshot = path.join(output, `${name}.png`);
    await page.screenshot({ path: screenshot });
    report.screenshots.push(screenshot);

    if (ready) {
      const measurements = await page.evaluate(() => {
        const rect = element => element.getBoundingClientRect();
        const apertureElement = document.querySelector('#display-aperture');
        const canvasElement = document.querySelector('#pokedex-shell');
        if (!(apertureElement instanceof HTMLElement) || !(canvasElement instanceof HTMLCanvasElement)) return null;
        const aperture = rect(apertureElement);
        const canvas = rect(canvasElement);
        const hitVisible = element => {
          const box = rect(element);
          const style = getComputedStyle(element);
          if (box.width <= 0 || box.height <= 0 || style.visibility === 'hidden' || style.display === 'none') return false;
          const x = Math.max(0, Math.min(innerWidth - 1, box.left + box.width / 2));
          const y = Math.max(0, Math.min(innerHeight - 1, box.top + box.height / 2));
          const hit = document.elementFromPoint(x, y);
          return hit === element || element.contains(hit);
        };
        const interactive = [...document.querySelectorAll('button:not([hidden]), a:not([hidden]), [tabindex]:not([tabindex="-1"])')].filter(hitVisible);
        const outside = interactive.filter(element => {
          if (element === canvasElement || element.closest('dialog:not([open])')) return false;
          const box = rect(element);
          return box.left < aperture.left - 0.5 || box.top < aperture.top - 0.5 || box.right > aperture.right + 0.5 || box.bottom > aperture.bottom + 0.5;
        }).map(element => ({ selector: element.id || element.getAttribute('data-nav') || element.getAttribute('aria-label'), box: rect(element).toJSON() }));
        return {
          aperture: aperture.toJSON(),
          canvas: canvas.toJSON(),
          outside,
          clipPath: getComputedStyle(apertureElement).clipPath,
          overflow: getComputedStyle(apertureElement).overflow,
          mesh: window.__pokedexMesh?.snapshot?.(),
        };
      });
      check(`${name} uses the exact active V3 R08 candidate`, measurements?.mesh?.candidate === 'v003-r08' && measurements.mesh.sourceName === 'v003/r08/GEO-display-glass', measurements?.mesh);
      check(`${name} matches the reviewed open-device orientation`, measurements?.mesh?.control !== undefined
        && measurements.mesh.aperture.y + measurements.mesh.aperture.height / 2 < measurements.mesh.control.y, measurements?.mesh);
      check(`${name} clips app UI to the projected display aperture`, measurements !== null && measurements.outside.length === 0 && measurements.overflow === 'hidden' && measurements.clipPath !== 'none', measurements);
      const minimumApertureHeight = name === 'portrait' ? 120 : 90;
      check(`${name} keeps the projected opening inside the WebGL viewport`, measurements !== null && measurements.aperture.left >= measurements.canvas.left && measurements.aperture.top >= measurements.canvas.top && measurements.aperture.right <= measurements.canvas.right && measurements.aperture.bottom <= measurements.canvas.bottom && measurements.aperture.width >= 100 && measurements.aperture.height >= minimumApertureHeight, measurements);

      await page.locator('#dock [data-nav="dex"]').click();
      check(`${name} keeps the real screen interactive`, await page.locator('[data-entry="1"]').isVisible());
    }
    check(`${name} has no uncaught runtime errors`, errors.length === 0, errors);
    await context.close();
  }

  const noWebgl = await browser.newContext({ viewport: { width: 412, height: 892 }, reducedMotion: 'reduce' });
  await noWebgl.addInitScript(() => {
    const nativeGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return typeof kind === 'string' && kind.startsWith('webgl') ? null : nativeGetContext.call(this, kind, ...args);
    };
  });
  const noWebglPage = await noWebgl.newPage();
  const noWebglErrors = [];
  noWebglPage.on('pageerror', error => noWebglErrors.push(error.message));
  await noWebglPage.goto(`${base}/pokedex.html`);
  await noWebglPage.waitForFunction(() => document.documentElement.dataset.meshState === 'error');
  check('WebGL failure exposes the in-app mesh error state', await noWebglPage.locator('#mesh-load-error').isVisible(), noWebglErrors);
  check('WebGL failure does not leave an unhandled rejection', noWebglErrors.length === 0, noWebglErrors);
  await noWebgl.close();
} finally {
  report.status = failures.length === 0 ? 'passed' : 'failed';
  fs.writeFileSync(path.join(output, 'mesh-visual-report.json'), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}

if (failures.length) {
  throw new Error(`${failures.length} mesh-first visual checks failed. See ${path.join(output, 'mesh-visual-report.json')}`);
}
