#!/usr/bin/env node
import { chmodSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = '/workspace/zer0/products/pokemon-m3-t_fc50f0bf';
const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const evidenceRoot = process.env.TWILIGHT_EVIDENCE_ROOT || '/mnt/zer0models/pokemon-iac/evidence/m3-echoing-stone';
const pending = join(evidenceRoot, `.pending-${process.pid}`);
mkdirSync(evidenceRoot, { recursive: true, mode: 0o700 });
chmodSync(evidenceRoot, 0o700);
mkdirSync(pending, { mode: 0o700 });
const pw = await import(pathToFileURL('/workspace/zer0/products/cod/node_modules/playwright/index.mjs').href);
const browser = await pw.chromium.launch({ executablePath: '/usr/bin/chromium', headless: false, args: ['--no-sandbox', '--disable-gpu-sandbox', '--ozone-platform=headless', '--use-gl=angle', '--use-angle=vulkan', '--enable-gpu', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: pending, size: { width: 1280, height: 720 } } });
await context.addInitScript(() => {
  localStorage.setItem('twilight:world-slice:kanto:pallet-pewter:save-v1', JSON.stringify({
    sliceId: 'world-slice:kanto:pallet-pewter', currentLocationId: 'location:kanto:route-3',
    visitedLocationIds: ['location:kanto:pallet-town','location:kanto:route-1','location:kanto:viridian-city','location:kanto:route-2-south','location:kanto:viridian-forest','location:kanto:route-2-north','location:kanto:pewter-city','location:kanto:route-3'],
    storyEventIds: [], traversedMeters: 40, saveRevision: 8,
  }));
});
const page = await context.newPage();
const problems = [];
page.on('console', message => { if (['warning','error'].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`); });
page.on('pageerror', error => problems.push(`pageerror: ${error.stack || error}`));
const checks = [];
const check = (name, ok, detail = '') => { checks.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`); };
try {
  await page.goto(process.env.TWILIGHT_URL || 'http://127.0.0.1:5180/?verify=1', { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('.starter-card').first().click();
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore');
  check('visible canonical Route 3 label', (await page.locator('#loc-label').textContent())?.trim() === 'route 3');
  check('runtime restored canonical Route 3', (await page.evaluate(() => window.__twilight?.snapshot?.().campaign.currentLocationId)) === 'location:kanto:route-3');
  await page.screenshot({ path: join(pending, 'route-3-arrival.png') });

  await page.keyboard.down('a'); await page.waitForTimeout(420); await page.keyboard.up('a');
  for (let i = 0; i < 28 && (await page.evaluate(() => window.__twilight?.snapshot?.().mode)) !== 'battle'; i++) {
    const key = i % 2 ? 's' : 'w';
    await page.keyboard.down(key); await page.waitForTimeout(650); await page.keyboard.up(key);
  }
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'battle', null, { timeout: 30_000 });
  await page.waitForSelector('#battle-menu:not(.hidden)');
  const initial = await page.evaluate(() => window.__twilight?.snapshot?.().battle);
  check('Route 3 battle activates exact field and ruleset', initial?.field?.id === 'field:route-3:echoing-stone' && initial?.field?.rulesetVersion === 1, JSON.stringify(initial?.field));
  check('visible field status names Echoing Stone v1', /Echoing Stone.*v1/i.test(await page.locator('#field-status').innerText()));
  await page.screenshot({ path: join(pending, 'echo-settled.png') });

  await page.locator('#battle-menu [data-act="fight"]').click();
  await page.getByRole('button', { name: /Growl Down/i }).click();
  await page.waitForTimeout(240);
  const charged = await page.evaluate(() => ({ status: document.querySelector('#field-status')?.getAttribute('data-echo'), summary: document.querySelector('#field-summary')?.textContent, field: window.__twilight?.snapshot?.().battle?.field }));
  check('sound move visibly raises and announces Echo', charged.status === 'charged' && /stone ring rises/i.test(charged.summary || ''), JSON.stringify(charged));
  await page.screenshot({ path: join(pending, 'echo-charged-ring-risen.png') });
  await page.waitForFunction(() => window.__twilight?.snapshot?.().battle?.busy === false, null, { timeout: 15_000 });
  if ((await page.evaluate(() => window.__twilight?.snapshot?.().battle?.field?.echo)) !== null) {
    await page.locator('#battle-menu [data-act="fight"]').click();
    await page.getByRole('button', { name: /Nudge/i }).click();
    await page.waitForFunction(() => window.__twilight?.snapshot?.().battle?.busy === false, null, { timeout: 15_000 });
  }
  const settled = await page.evaluate(() => ({ status: document.querySelector('#field-status')?.getAttribute('data-echo'), summary: document.querySelector('#field-summary')?.textContent, field: window.__twilight?.snapshot?.().battle?.field }));
  check('next contact consumes Echo with plain-language Speed stagger', settled.field?.echo === null && /Speed falls by one stage/i.test(settled.summary || ''), JSON.stringify(settled));
  await page.screenshot({ path: join(pending, 'echo-consumed-ring-settled.png') });
  check('headed run has no console/page problems', problems.length === 0, problems.join(' | '));
} finally {
  await page.close(); await context.close(); await browser.close();
}
const report = { sourceRoot: root, sourceRevision, url: process.env.TWILIGHT_URL || 'http://127.0.0.1:5180/?verify=1', headed: true, checks, problems, passed: checks.filter(x => x.ok).length, total: checks.length };
writeFileSync(join(pending, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
for (const file of ['route-3-arrival.png','echo-settled.png','echo-charged-ring-risen.png','echo-consumed-ring-settled.png']) chmodSync(join(pending, file), 0o600);
const finalDir = join(evidenceRoot, `run-${Date.now()}`);
renameSync(pending, finalDir);
console.log(`evidence ${finalDir}`);
if (report.passed !== report.total || problems.length) process.exit(1);
