import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root='/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06';
const output=process.argv[2] ?? `${root}/browser-verified`;
await mkdir(output);
const base='https://0.taila30dc.ts.net:8445';
const comparison=`${base}/devtools/experiments.html?pokemon=charizard&a=charizard-whole-r06-intake&b=charizard-whole-r06&view=head-threequarter`;
const phoneUrl=`${base}/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-whole-r06&view=head-threequarter`;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
const report={comparison,phoneUrl,checks:[],errors:[],deviceAcceptance:false,scope:'Experiment selection, image decoding and published artifact bytes. No phone acceptance or Field OS change.'};
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(comparison);
  assert.equal(await page.locator('#choose-0').inputValue(),'charizard-whole-r06-intake');
  assert.equal(await page.locator('#choose-1').inputValue(),'charizard-whole-r06');
  for (const name of ['front','near','far','threequarter']) {
    await page.locator('#view').selectOption(`head-${name}`);
    await page.waitForFunction(name=>{
      const images=[...document.querySelectorAll('img[data-preview]')];
      return images.length===2 && images.every(image=>image.complete&&image.naturalWidth===720&&image.src.endsWith(`/${name}.png`)) && images[0].src.includes('/matched-intake/') && images[1].src.includes('/reopened/');
    },name);
    report.checks.push({view:`head-${name}`,matchedPairDecoded:true});
  }
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${output}/desktop-comparison.png`});
  const phone=await browser.newPage({viewport:{width:412,height:892},isMobile:true,hasTouch:true});
  phone.on('pageerror',error=>report.errors.push(error.message));
  await phone.goto(phoneUrl);
  await phone.waitForFunction(()=>document.querySelector('#iteration-selector')?.value==='charizard-whole-r06');
  for(const view of ['head-front','head-near','head-far','head-threequarter','whole-front','whole-back','whole-side','whole-threequarter']) {
    await phone.locator(`[data-view="${view}"]`).click();
    await phone.waitForFunction(view=>{
      const image=document.querySelector('.iteration-preview img');
      const name=view.startsWith('head-')?view.slice(5):view;
      return image?.complete&&image.naturalWidth===720&&image.src.endsWith(`/reopened/${name}.png`);
    },view);
    report.checks.push({view,phoneImageDecoded:true});
  }
  await phone.locator('[data-view="head-threequarter"]').click();
  await phone.waitForFunction(()=>document.querySelector('.iteration-preview img')?.src.endsWith('/reopened/threequarter.png'));
  await phone.locator('.iteration-preview img').scrollIntoViewIfNeeded();
  await phone.screenshot({path:`${output}/phone-study.png`});
  report.phone={viewport:[412,892],layoutAcceptance:false};
  report.artifacts=[];
  for(const name of ['charizard-whole-r06-study.glb','charizard-whole-r06-study.blend']) {
    const response=await page.request.get(`${base}/assets/blender/charizard-whole-r06/${name}`);
    assert.equal(response.status(),200);
    const hash=data=>createHash('sha256').update(data).digest('hex');
    const served=hash(await response.body());
    assert.equal(served,hash(await readFile(`${root}/${name}`)));
    report.artifacts.push({name,status:200,sha256:served});
  }
  assert.deepEqual(report.errors,[]);
  await writeFile(`${output}/availability.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
} finally {await browser.close();}
