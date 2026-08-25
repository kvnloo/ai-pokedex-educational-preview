#!/usr/bin/env node
/**
 * Twilight Route browser gauntlet harness.
 *
 * Original product-specific implementation informed by the instrumentation
 * patterns in the pinned MIT donors recorded in docs/GAUNTLET-HARNESS-LINEAGE.md.
 * No donor game content, mechanics, identity, maps, or presentation is used.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
  return match ? [match[1], match[2] ?? true] : [arg, true];
}));
const mode = String(args.mode ?? 'all');
const label = String(args.label ?? 'gauntlet');
const port = Number(args.port ?? 4288);
const frames = Number(args.frames ?? 360);
const soakSeconds = Number(args.seconds ?? 20);
const outDir = resolve(String(args.out ?? join(ROOT, 'shots', label)));
const base = `http://127.0.0.1:${port}`;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

async function playwright() {
  const require = createRequire(import.meta.url);
  for (const candidate of [join(ROOT, 'node_modules/playwright'), '/workspace/zer0/products/cod/node_modules/playwright']) {
    if (!existsSync(candidate)) continue;
    try { return await import(pathToFileURL(join(candidate, 'index.mjs')).href); } catch {
      try { return require(candidate); } catch { /* next */ }
    }
  }
  return null;
}
function chrome() {
  return [process.env.TWILIGHT_CHROME, '/usr/bin/chromium', '/usr/bin/google-chrome'].find((path) => path && existsSync(path));
}
async function up() {
  try { return (await fetch(base, { signal: AbortSignal.timeout(800) })).ok; } catch { return false; }
}
let server;
async function serve() {
  if (await up()) throw new Error(`port ${port} is already occupied; refusing stale-runtime evidence`);
  server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0' },
  });
  for (let i = 0; i < 240; i += 1) {
    if (await up()) return;
    if (server.exitCode != null) throw new Error(`preview exited ${server.exitCode}`);
    await sleep(250);
  }
  throw new Error('preview startup timeout');
}
function stop() { if (server && server.exitCode == null) server.kill('SIGTERM'); }
function analyse(path) {
  const script = `from PIL import Image\nimport json,sys\nim=Image.open(sys.argv[1]).convert('RGB'); w,h=im.size; p=list(im.getdata()); L=lambda q:.2126*q[0]+.7152*q[1]+.0722*q[2]\ncols=[sum(L(p[y*w+x]) for y in range(h))/h for x in range(w)]\nrows=[sum(L(p[y*w+x]) for x in range(w))/w for y in range(h)]\nmean=sum(cols)/w; dark=sum(L(q)<10 for q in p)/(w*h)\nseam=max([abs(cols[x]-cols[x-1]) for x in range(1,w)]+[0]); band=max([abs(rows[y]-rows[y-1]) for y in range(1,h)]+[0])\ndef longest(a):\n best=run=0\n for v in a:\n  run=run+1 if v<6 else 0; best=max(best,run)\n return best\nblackBand=max(longest(cols)/w,longest(rows)/h)\nprint(json.dumps({'width':w,'height':h,'meanLuma':round(mean,2),'darkFraction':round(dark,5),'blackBandFraction':round(blackBand,5),'maxColumnStep':round(seam,2),'maxRowStep':round(band,2),'uniqueSample':len(set(p[::max(1,len(p)//8000)]))}))`;
  const result = spawnSync('python3', ['-c', script, path], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`PNG analysis failed: ${result.stderr}`);
  return JSON.parse(result.stdout);
}
async function ready(page) {
  await page.goto(`${base}/?verify=1&preset=medium&capture=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('canvas#viewport', { timeout: 30000 });
  await page.waitForFunction(() => document.querySelectorAll('.starter-card').length === 3, null, { timeout: 30000 });
}
async function selectStarter(page) {
  await page.locator('.starter-card').first().click();
  await page.waitForFunction(() => window.__twilight?.snapshot?.().mode === 'explore', null, { timeout: 15000 });
}
async function shot(page, name, report) {
  const path = join(outDir, `${name}.png`);
  await page.screenshot({ path, type: 'png' });
  const pixels = analyse(path);
  const viewport = await page.evaluate(() => {
    const canvas = document.querySelector('canvas#viewport');
    return { inner: [innerWidth, innerHeight], css: [canvas?.clientWidth ?? 0, canvas?.clientHeight ?? 0], buffer: [canvas?.width ?? 0, canvas?.height ?? 0], snapshot: window.__twilight?.snapshot?.() ?? null };
  });
  const failures = [];
  if (pixels.meanLuma < 25 || pixels.darkFraction > 0.88 || pixels.uniqueSample < 48) failures.push('black-or-flat');
  // A legitimate HUD edge can be sharp. A partial present requires a sustained
  // near-black band, not merely a high-contrast authored edge.
  if (pixels.blackBandFraction > 0.12) failures.push('partial-black-or-tear');
  if (viewport.css[0] < 64 || viewport.css[1] < 64 || viewport.buffer[0] < 64 || viewport.buffer[1] < 64) failures.push('invalid-resize');
  report.push({ name, path, sha256: sha256(path), pixels, viewport, failures });
}
async function runShotset(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  await context.addInitScript(() => { localStorage.clear(); let state = 0x1721c0b8; Math.random = () => ((state = Math.imul(1664525, state) + 1013904223 >>> 0) / 4294967296); });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  const shots = [];
  await ready(page);
  await shot(page, '01-starter', shots);
  await selectStarter(page);
  await sleep(500);
  await shot(page, '02-spawn', shots);
  await page.keyboard.down('KeyW'); await sleep(1600); await page.keyboard.up('KeyW');
  await shot(page, '03-route-forward', shots);
  await page.keyboard.down('KeyA'); await page.keyboard.down('KeyW'); await sleep(1000); await page.keyboard.up('KeyW'); await page.keyboard.up('KeyA');
  await shot(page, '04-route-flank', shots);
  await page.setViewportSize({ width: 390, height: 844 }); await sleep(500);
  await shot(page, '05-mobile-portrait', shots);
  await page.setViewportSize({ width: 844, height: 390 }); await sleep(500);
  await shot(page, '06-mobile-landscape', shots);
  await context.close();
  return shots;
}
async function runProfile(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage(); page.on('pageerror', (e) => errors.push(String(e.message || e)));
  await ready(page); await selectStarter(page);
  const samples = await page.evaluate((count) => new Promise((done) => {
    const rows = []; let last = performance.now(); let index = 0;
    const tick = (now) => {
      const canvas = document.querySelector('canvas#viewport');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      rows.push({ index, dt: now - last, heap: performance.memory?.usedJSHeapSize ?? 0, programs: gl ? Number(gl.getParameter(gl.CURRENT_PROGRAM) != null) : 0 });
      last = now;
      if (++index >= count) done(rows); else requestAnimationFrame(tick);
    }; requestAnimationFrame(tick);
  }), frames);
  await context.close();
  const warm = samples.slice(Math.min(60, Math.floor(samples.length / 5)));
  const sorted = warm.map((row) => row.dt).sort((a, b) => a - b);
  const q = (p) => Number(sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))].toFixed(3));
  const p50 = q(.5); const threshold = Math.max(p50 * 2, p50 + 8);
  const hitches = warm.filter((row) => row.dt > threshold).map((row) => ({ frame: row.index, ms: Number(row.dt.toFixed(3)), attribution: row.programs ? 'render-or-shader-work' : 'main-thread-or-scheduling' }));
  return { frames: warm.length, frameTimeMs: { p50, p95: q(.95), p99: q(.99), max: q(1) }, hitchThresholdMs: threshold, hitchCount: hitches.length, worstHitches: hitches.sort((a,b) => b.ms-a.ms).slice(0, 20), sampleKind: 'presented-rAF-interval' };
}
async function runResilience(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await context.newPage(); page.on('pageerror', (e) => errors.push(String(e.message || e)));
  await ready(page); await selectStarter(page);
  await page.evaluate(() => { window.__gauntletContext = { lost: 0, restored: 0, prevented: 0 }; const c = document.querySelector('canvas#viewport'); c?.addEventListener('webglcontextlost', (e) => { window.__gauntletContext.lost += 1; if (e.defaultPrevented) window.__gauntletContext.prevented += 1; }); c?.addEventListener('webglcontextrestored', () => { window.__gauntletContext.restored += 1; }); });
  const samples = [];
  for (let second = 0; second < soakSeconds; second += 2) {
    await page.setViewportSize(second % 4 ? { width: 844, height: 390 } : { width: 390, height: 844 });
    await page.keyboard.down('KeyW'); await sleep(220); await page.keyboard.up('KeyW'); await sleep(1780);
    samples.push(await page.evaluate(() => ({ t: performance.now(), heap: performance.memory?.usedJSHeapSize ?? 0, snapshot: window.__twilight?.snapshot?.(), canvas: (() => { const c=document.querySelector('canvas#viewport'); return [c?.clientWidth??0,c?.clientHeight??0,c?.width??0,c?.height??0]; })() })));
  }
  const extension = await page.evaluate(() => { const c=document.querySelector('canvas#viewport'); const gl=c?.getContext('webgl2')||c?.getContext('webgl'); const ext=gl?.getExtension('WEBGL_lose_context'); if (!ext) return false; ext.loseContext(); setTimeout(() => ext.restoreContext(), 500); return true; });
  if (extension) await page.waitForFunction(() => window.__gauntletContext?.restored > 0, null, { timeout: 15000 }).catch(() => {});
  await sleep(1000);
  const recoveryPath = join(outDir, 'context-recovery.png'); await page.screenshot({ path: recoveryPath });
  const contextState = await page.evaluate(() => window.__gauntletContext);
  await context.close();
  const heap = samples.map((s) => s.heap).filter(Boolean);
  return { seconds: soakSeconds, samples, heap: { start: heap[0] ?? 0, end: heap.at(-1) ?? 0, growth: heap.length ? heap.at(-1)-heap[0] : 0 }, extensionAvailable: extension, context: contextState, recovery: { path: recoveryPath, sha256: sha256(recoveryPath), pixels: analyse(recoveryPath) } };
}

async function main() {
  if (!['all','shotset','profile','resilience'].includes(mode)) throw new Error(`unknown --mode=${mode}`);
  if (args.build !== 'false') { const built=spawnSync('npm',['run','build'],{cwd:ROOT,stdio:'inherit'}); if (built.status!==0) throw new Error('build failed'); }
  const pw = await playwright(); const executablePath = chrome();
  if (!pw?.chromium || !executablePath) throw new Error('Playwright and Chromium required');
  mkdirSync(outDir, { recursive: true, mode: 0o700 }); chmodSync(outDir, 0o700);
  await serve();
  const browser = await pw.chromium.launch({ executablePath, headless: true, args: ['--no-sandbox','--disable-gpu-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=vulkan','--enable-gpu','--ignore-gpu-blocklist','--disable-background-timer-throttling','--disable-renderer-backgrounding'] });
  const errors=[]; const report={ schemaVersion:1, source:'twilight-route-gauntlet-harness', sourceCommit:spawnSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).stdout.trim(), mode, label, viewportPolicy:'named desktop and mobile vantages', generatedAt:new Date().toISOString() };
  try {
    if (mode==='all'||mode==='shotset') report.shots=await runShotset(browser,errors);
    if (mode==='all'||mode==='profile') report.profile=await runProfile(browser,errors);
    if (mode==='all'||mode==='resilience') report.resilience=await runResilience(browser,errors);
  } finally { await browser.close(); stop(); }
  report.errors=errors; report.failures=[];
  for (const item of report.shots??[]) report.failures.push(...item.failures.map((failure)=>`${item.name}:${failure}`));
  if (report.resilience?.extensionAvailable && (report.resilience.context?.prevented<1||report.resilience.context?.restored<1)) report.failures.push('context-loss-recovery');
  if (report.resilience?.recovery?.pixels?.meanLuma<25) report.failures.push('black-after-context-restore');
  if (errors.length) report.failures.push('page-errors');
  report.ok=report.failures.length===0;
  const reportPath=join(outDir,'gauntlet-report.json'); writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{mode:0o600}); chmodSync(reportPath,0o600);
  console.log(JSON.stringify({report:reportPath,ok:report.ok,shots:report.shots?.length??0,profile:report.profile?.frameTimeMs,resilience:report.resilience&&{seconds:report.resilience.seconds,context:report.resilience.context},failures:report.failures},null,2));
  if (!report.ok) process.exitCode=1;
}
main().catch((error)=>{ stop(); console.error(error); process.exit(1); });
