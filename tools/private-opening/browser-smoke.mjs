import fs from 'node:fs';
import path from 'node:path';
import {chromium} from '/workspace/zer0/products/cod/node_modules/playwright/index.mjs';
import {contract,digest} from './gate.mjs';
import {rosterIds,rosterAsset} from './roster.mjs';
const output=fs.mkdtempSync(path.join(contract.assetRoot,'evidence/compiled-browser-'));fs.chmodSync(output,0o700);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
function check(name,ok){checks.push({name,ok});if(!ok)throw new Error(name);}
try {
 for(const route of ['/private.html','/private-opening/catalog','/private-opening/assets/pikachu.glb','/private-opening/roster/giratina-origin.glb']) {
  const res=await page.request.get('http://127.0.0.1:4180'+route);check('public blocks '+route,res.status()===404);
 }
 const hostile=await page.request.get('http://127.0.0.1:4181/private-opening/roster/charizard.glb',{headers:{Origin:'https://untrusted.example'}});check('private rejects cross origin',hostile.status()===403);
 const wrongHost=await page.request.get('http://127.0.0.1:4181/private-opening/catalog',{headers:{Host:'untrusted.example'}});check('private rejects foreign host',wrongHost.status()===403);
 await page.goto('http://127.0.0.1:4181/private.html?verify=1&portrait=1');await page.waitForFunction(()=>window.__opening);check('compiled opening ready',await page.locator('body').getAttribute('data-ready')==='true');
 check('all seven slice links present',await page.locator('#chapters a').count()===7);
 await page.screenshot({path:path.join(output,'pallet-town.png')});
 for(const id of rosterIds) {
  await page.locator(`#chapters a[href="/private.html?slice=${id}"]`).click();await page.waitForFunction(()=>window.__encounter);
  check('compiled '+id+' exact identity',await page.evaluate(()=>window.__encounter.snapshot().id)===id);
  check('compiled '+id+' exact model',await page.evaluate(()=>window.__encounter.snapshot().assetSha256)===rosterAsset(id).sha256);
  await page.locator('#camera').click();await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');
  check('keyboard works after button '+id,await page.evaluate(()=>window.__encounter.snapshot().x)>0);
  await page.locator('#camera').click();await page.waitForTimeout(200);await page.screenshot({path:path.join(output,id+'.png')});
 }
 check('no browser console or page errors',errors.length===0);
}finally{await browser.close();const files=fs.readdirSync(output).map(file=>({path:file,sha256:digest(fs.readFileSync(path.join(output,file)))}));fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify({checks,errors,files},null,2));console.log(JSON.stringify({checks,errors,output},null,2));}
