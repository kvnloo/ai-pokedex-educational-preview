import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { contract, digest, implementationSha256, repository } from './gate.mjs';

if(process.argv.includes('--expect-blocked'))throw new Error('Boundary checks belong in unit tests; visual capture requires loaded characters.');
const target=process.env.OPENING_URL??'http://127.0.0.1:5181/private.html?verify=1';
if(!['127.0.0.1','localhost','[::1]'].includes(new URL(target).hostname)) throw new Error('PRIVATE_LOCAL_BROWSER_ONLY');
let playwright;
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.OPENING_PLAYWRIGHT_BROWSERS_PATH ?? path.join(contract.assetRoot,'tools/playwright');
for(const candidate of [path.join(repository,'node_modules/playwright/index.mjs'),'/workspace/zer0/products/cod/node_modules/playwright/index.mjs']) if(fs.existsSync(candidate)) {playwright=await import(pathToFileURL(candidate));break;}
if(!playwright) throw new Error('Playwright unavailable');
fs.mkdirSync(path.join(contract.assetRoot,'evidence'),{recursive:true,mode:0o700});
const output=fs.mkdtempSync(path.join(contract.assetRoot,'evidence','candidate-browser-'));fs.chmodSync(output,0o700);
const checks=[];let browser;let context;
const check=(name,ok,detail='')=>{checks.push({name,ok:Boolean(ok),detail});if(!ok) throw new Error(name+': '+detail);};
try {
  browser=await playwright.chromium.launch({executablePath:process.env.OPENING_CHROME??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  context=await browser.newContext({viewport:{width:1280,height:800},recordVideo:{dir:output,size:{width:1280,height:800}}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(target,{waitUntil:'networkidle'});
  {

    await page.waitForFunction(()=>window.__opening?.snapshot?.());
    const snap=()=>page.evaluate(()=>window.__opening.snapshot());
    const initial=await snap();check('correct canonical UI names',await page.locator('#partner').innerText().then(t=>t.includes('ASH KETCHUM')&&t.includes('Pikachu')));
    check('dedicated IDs loaded',initial.characters.map(c=>c.canonicalId).join(',')==='trainer:ash-ketchum:kanto-original,pokemon:025:standard');
    await page.locator('#reset').click();await page.locator('#opening').focus();
    async function walk(key,predicate) {
      await page.keyboard.down(key);
      try { for(let i=0;i<160;i++) {if(predicate(await snap())) return;await page.waitForTimeout(100);} throw new Error('movement timed out: '+key); }
      finally {await page.keyboard.up(key);}
    }
    await walk('w',s=>s.journey.player.z<.25);await walk('d',s=>s.journey.player.x>1.0);
    await page.keyboard.press('e');check('Pikachu joins through interaction',(await snap()).journey.partner==='pikachu');
    await page.keyboard.press('c');await page.waitForTimeout(700);
    await page.screenshot({path:path.join(output,'pallet-meeting.png')});
    await page.keyboard.press('c');
    await walk('a',s=>s.journey.player.x<.15);await walk('w',s=>s.journey.completed);
    check('Route 1 reached spatially with partner',(await snap()).journey.location==='route-1');
    await page.keyboard.press('Space');await page.waitForTimeout(300);await page.screenshot({path:path.join(output,'route-1-thundershock.png')});
    await page.waitForTimeout(2100);await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>window.__opening?.snapshot?.());
    check('reload restores partner and progress',(await snap()).journey.completed&&(await snap()).journey.partner==='pikachu');
    for(const character of contract.characters) for(const view of contract.recognitionViews) {
      const url=new URL(target);url.searchParams.set('inspect',character.id);url.searchParams.set('view',view);
      await page.goto(url.href,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__opening?.snapshot?.());await page.waitForTimeout(250);
      await page.screenshot({path:path.join(output,`${character.id}-${view}.png`)});
    }
    check('live scene submits nonempty geometry',(await snap()).triangles>100);
  }
  check('no uncaught browser exceptions',errors.length===0,errors.join('\n'));
} catch(error) {checks.push({name:'harness completion',ok:false,detail:String(error.stack??error)});process.exitCode=1;}
finally {
  await context?.close();await browser?.close();
  const files=fs.readdirSync(output).map(file=>{const bytes=fs.readFileSync(path.join(output,file));fs.chmodSync(path.join(output,file),0o600);return {path:file,sha256:digest(bytes),bytes:bytes.length};});
  const report={mode:'candidate-gameplay-tests',visualAcceptance:false,implementationSha256:implementationSha256(),checks,files,output};
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});console.log(JSON.stringify(report,null,2));
}
