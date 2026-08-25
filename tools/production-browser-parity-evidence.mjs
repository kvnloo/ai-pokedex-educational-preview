#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputIndex = process.argv.indexOf('--out');
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const port = Number(process.env.TWILIGHT_PARITY_PORT ?? 5193);
const baseUrl = `http://127.0.0.1:${port}`;
const require = createRequire(import.meta.url);

async function loadPlaywright() {
  for (const candidate of [
    join(ROOT, 'node_modules/playwright'),
    '/workspace/zer0/products/cod/node_modules/playwright',
  ]) {
    if (!existsSync(candidate)) continue;
    try { return await import(pathToFileURL(join(candidate, 'index.mjs')).href); } catch {}
    try { return require(candidate); } catch {}
  }
  throw new Error('Playwright unavailable');
}

async function waitForPreview(process) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`production preview exited with ${process.exitCode}`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('production preview did not become ready');
}

execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit' });
const preview = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
  cwd: ROOT,
  stdio: 'ignore',
});
let browser;
try {
  await waitForPreview(preview);
  const playwright = await loadPlaywright();
  browser = await playwright.chromium.launch({
    executablePath: process.env.TWILIGHT_CHROME ?? '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${baseUrl}/?verify=1&parityEvidence=1`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForFunction(() => typeof window.__twilight?.parityEvidence === 'function', undefined, { timeout: 30_000 });
  const evidence = await page.evaluate(() => window.__twilight.parityEvidence());
  if (evidence.source !== 'production-browser-application') throw new Error('browser parity evidence did not originate from production application');
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  if (outputPath) writeFileSync(outputPath, serialized, { mode: 0o600 });
  process.stdout.write(serialized);
} finally {
  if (browser) await browser.close();
  preview.kill('SIGTERM');
}
