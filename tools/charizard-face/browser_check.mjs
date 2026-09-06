import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';

const base='https://0.taila30dc.ts.net:8445';
const out='/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04/head-r18';
const report={checkedAt:new Date().toISOString(),checks:[],errors:[]};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
function check(name,pass){report.checks.push({name,pass});if(!pass)throw new Error(name);}
try{
  const desktop=await browser.newContext({viewport:{width:1400,height:820}});
  const page=await desktop.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>report.errors.push(error.message));
  report.comparisonUrl=base+'/devtools/experiments.html?pokemon=charizard&a=charizard-head-r09&b=charizard-head-r18&view=face-negative-side';
  await page.goto(report.comparisonUrl);
  await page.locator('#choose-1').waitFor();
  check('correct rejected eye baseline and current eye checkpoint',await page.locator('#choose-0').inputValue()==='charizard-head-r09'&&await page.locator('#choose-1').inputValue()==='charizard-head-r18');
  for(const view of ['head-front','head-right','head-left','head-rear','head-top','head-threequarter','face-reference','face-front','face-negative-side','face-positive-side','face-top']){
    await page.locator('#view').selectOption(view);
    await page.waitForFunction(view=>{const images=[...document.querySelectorAll('img[data-preview]')];return images.length===2&&images.every(image=>image.complete&&image.naturalWidth===(view.startsWith('face-')?1000:900)&&image.src.endsWith(view+'.png'));},view);
    check('matched comparison decodes '+view,true);
  }
  await page.locator('#view').selectOption('face-negative-side');
  await page.waitForFunction(()=>[...document.querySelectorAll('img[data-preview]')].every(image=>image.complete&&image.naturalWidth===1000&&image.src.endsWith('face-negative-side.png')));
  await page.locator('#comparison').scrollIntoViewIfNeeded();
  await page.evaluate(()=>scrollTo(0,document.querySelector('#comparison').getBoundingClientRect().top+scrollY-12));
  await page.screenshot({path:path.join(out,'comparison-preview.png')});
  const phone=await browser.newContext({viewport:{width:412,height:892},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const mobile=await phone.newPage();mobile.setDefaultTimeout(15000);
  mobile.on('pageerror',error=>report.errors.push(error.message));
  report.phoneUrl=base+'/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-head-r18&view=face-negative-side';
  await mobile.goto(report.phoneUrl);await mobile.locator('#iteration-selector').waitFor();
  await mobile.waitForFunction(()=>{const image=document.querySelector('.iteration-preview img');return image?.complete&&image.naturalWidth===1000&&image.src.endsWith('face-negative-side.png');});
  const bounds=await mobile.locator('.iteration-preview img').boundingBox();
  check('phone reveals the exact eye preview',bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=412&&bounds.y+bounds.height<=892);
  await mobile.screenshot({path:path.join(out,'phone-preview.png')});
  for(const id of ['charizard-head-r07','charizard-head-r09','charizard-head-r13','charizard-head-r14','charizard-head-r15','charizard-head-r18']){
    await mobile.locator('#iteration-selector').selectOption(id);
    await mobile.locator('[data-view="head-top"]').click();
    await mobile.waitForFunction(id=>{const image=document.querySelector('.iteration-preview img');return image?.complete&&image.naturalWidth===900&&image.src.includes('/'+id+'/')&&image.src.endsWith('head-top.png');},id);
    check('phone switches checkpoint '+id,true);
  }
  check('no horizontal page overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  check('no uncaught JavaScript errors',report.errors.length===0);
  report.status='browser-pass/device-review-pending';
}catch(error){report.status='failed';report.error=String(error);throw error;}
finally{fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify(report,null,2));
