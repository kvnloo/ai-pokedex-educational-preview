import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

assert.ok(process.argv[2]?.startsWith('/'), 'Pass a new absolute evidence directory as the first argument');
const output = process.argv[2].replace(/\/$/, '') + '/';
const base = 'https://0.taila30dc.ts.net:8445';
const a = 'charizard-home-head-r07-intake';
const choices = [
  {id:'charizard-home-head-r07-study', folder:'reopened-repaired'},
];
const names = ['front', 'near', 'far', 'threequarter'];
const pathFor = (folder, name) => `/assets/blender/charizard-head-baselines-r07/${folder}/${name}.png`;
const comparison = `${base}/devtools/experiments.html?pokemon=charizard&a=${a}&b=${choices[0].id}&view=head-threequarter`;
const phoneUrl = `${base}/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=${choices[0].id}&view=head-threequarter`;
const report = {
  startedAt:new Date().toISOString(), status:'running', comparison, phoneUrl,
  script:fileURLToPath(import.meta.url),
  scriptSHA256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),
  scope:'Read-only selection, exact image paths, 800-pixel image decoding and page errors. No model quality, visual, device or layout acceptance.',
  deviceAcceptance:false, layoutAcceptance:false, visualAcceptance:false,
  checks:[], pageerrors:[], blockedWriteRequests:[], cleanup:{browserClosed:false},
};
let browser;
let failure;
try {
  browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,timeout:30000});
  report.browser={version:browser.version(),headless:true};
  async function newPage(options) {
    const context=await browser.newContext(options);
    await context.route('**/*', async route => {
      const request=route.request();
      if (!['GET','HEAD','OPTIONS'].includes(request.method())) {
        report.blockedWriteRequests.push({method:request.method(),url:request.url()});
        await route.abort();
      } else await route.continue();
    });
    const page=await context.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(30000);
    page.on('pageerror',error=>report.pageerrors.push({url:page.url(),message:error.message}));
    return page;
  }
  async function decodedImages(page, selector, paths) {
    await page.waitForFunction(({selector,paths})=>{
      const images=[...document.querySelectorAll(selector)];
      return images.length===paths.length && images.every((image,i)=>
        image.complete && image.naturalWidth===800 && image.naturalHeight>0 && new URL(image.currentSrc||image.src).pathname===paths[i]);
    },{selector,paths});
    const images=await page.locator(selector).evaluateAll(async elements=>{
      await Promise.all(elements.map(image=>image.decode()));
      return elements.map(image=>({src:image.currentSrc||image.src,width:image.naturalWidth,height:image.naturalHeight}));
    });
    assert.deepEqual(images.map(image=>new URL(image.src).pathname),paths);
    assert.ok(images.every(image=>image.width===800 && image.height>0));
    return images;
  }
  const desktop=await newPage({viewport:{width:1440,height:1100}});
  await desktop.goto(comparison,{waitUntil:'domcontentloaded'});
  await desktop.waitForFunction(({a,b})=>document.querySelector('#choose-0')?.value===a && document.querySelector('#choose-1')?.value===b,{a,b:choices[0].id});
  for (const [index,choice] of choices.entries()) {
    await desktop.locator('#choose-1').selectOption(choice.id);
    for (const name of names) {
      const view=`head-${name}`;
      await desktop.locator('#view').selectOption(view);
      const images=await decodedImages(desktop,'img[data-preview]',[pathFor('matched-intake',name),pathFor(choice.folder,name)]);
      assert.equal(await desktop.locator('#choose-0').inputValue(),a);
      assert.equal(await desktop.locator('#choose-1').inputValue(),choice.id);
      assert.equal(await desktop.locator('#view').inputValue(),view);
      report.checks.push({kind:'comparison',a,b:choice.id,view,selectorIDsCorrect:true,images,passed:true});
    }
    if(index===0) {
      await desktop.locator('#comparison').scrollIntoViewIfNeeded();
      const screenshot='comparison-threequarter.png';
      const bytes=await desktop.screenshot();
      await writeFile(output+screenshot,bytes,{flag:'wx'});
      report.screenshot={path:output+screenshot,sha256:createHash('sha256').update(bytes).digest('hex'),a,b:choice.id,view:'head-threequarter',viewport:[1440,1100],visualAcceptance:false};
    }
  }
  const phone=await newPage({viewport:{width:412,height:892},isMobile:true,hasTouch:true});
  await phone.goto(phoneUrl,{waitUntil:'domcontentloaded'});
  await phone.waitForFunction(a=>document.querySelector('#iteration-selector')?.value===a,choices[0].id);
  assert.equal(await phone.locator('#iteration-selector').inputValue(),choices[0].id);
  assert.equal(await phone.locator('#panel-iterations').isVisible(),true);
  assert.equal(await phone.locator('[data-view="head-threequarter"]').getAttribute('aria-pressed'),'true');
  const initial=await decodedImages(phone,'.iteration-preview img',[pathFor('reopened-repaired','threequarter')]);
  report.phone={viewport:[412,892],emulated:true,deviceAcceptance:false,layoutAcceptance:false,initialUrl:phone.url(),initialImages:initial};
  for (const name of names) {
    const view=`head-${name}`;
    await phone.locator(`#panel-iterations [data-view="${view}"]`).click();
    const images=await decodedImages(phone,'.iteration-preview img',[pathFor('reopened-repaired',name)]);
    assert.equal(await phone.locator('#iteration-selector').inputValue(),choices[0].id);
    assert.equal(await phone.locator(`#panel-iterations [data-view="${view}"]`).getAttribute('aria-pressed'),'true');
    report.checks.push({kind:'phone',run:choices[0].id,view,selectorIDCorrect:true,images,passed:true});
  }
  await phone.screenshot({path:output+'phone-study.png',fullPage:true});
  assert.equal(report.checks.filter(x=>x.kind==='comparison').length,4);
  assert.equal(report.checks.filter(x=>x.kind==='phone').length,4);
  assert.deepEqual(report.pageerrors,[]);
  assert.deepEqual(report.blockedWriteRequests,[]);
  report.status='passed';
} catch(error) {
  failure=error;
  report.status='failed';
  report.failure={name:error.name,message:error.message,stack:error.stack};
} finally {
  try {
    if(browser) await browser.close();
    report.cleanup.browserClosed=true;
  } catch(error) {
    report.cleanup.error=error.message;
    report.status='failed';
    failure ||= error;
  }
  report.finishedAt=new Date().toISOString();
  await writeFile(output+'result.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,pageerrors:report.pageerrors.length,blockedWriteRequests:report.blockedWriteRequests.length,output,cleanup:report.cleanup,failure:report.failure}));
if(failure) process.exitCode=1;
