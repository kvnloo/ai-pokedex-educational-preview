import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {contract,digest,repository} from './gate.mjs';
import {rosterIds,rosterAsset} from './roster.mjs';
const ids=process.argv.slice(2);if(!ids.length)ids.push(...rosterIds);for(const id of ids)if(!rosterIds.includes(id))throw new Error('Unknown encounter');
process.env.PLAYWRIGHT_BROWSERS_PATH=path.join(contract.assetRoot,'tools/playwright');
const {chromium}=await import(pathToFileURL('/workspace/zer0/products/cod/node_modules/playwright/index.mjs'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const output=fs.mkdtempSync(path.join(contract.assetRoot,'evidence/encounters-'));fs.chmodSync(output,0o700);
const checks=[];function check(name,ok){checks.push({name,ok});if(!ok)throw new Error(name);}
try{
for(const id of ids){
 const dir=path.join(output,id);fs.mkdirSync(dir,{mode:0o700});
 const context=await browser.newContext({viewport:{width:1440,height:960},recordVideo:{dir,size:{width:1440,height:960}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url='http://127.0.0.1:5181/private.html?slice='+id+'&verify=1';
 await page.goto(url);await page.waitForFunction(()=>window.__encounter);
 const snap=()=>page.evaluate(()=>window.__encounter.snapshot());
 check(id+' exact authored GLB',(await snap()).assetSha256===rosterAsset(id).sha256);
 await page.locator('#reset').click();await page.locator('#opening').focus();
 await page.waitForTimeout(350);await page.screenshot({path:path.join(dir,'playable.png')});
 async function walk(key,done){await page.keyboard.down(key);try{for(let i=0;i<250;i++){if(done(await snap()))return;await page.waitForTimeout(75);}throw new Error(id+' movement timeout');}finally{await page.keyboard.up(key);}}
 await walk('a',s=>s.x< -2.9);await walk('w',s=>s.z< -1.9);
 await walk('d',s=>s.x>2.9);await walk('s',s=>s.z>2.9);await walk('a',s=>s.x<.1);
 check(id+' playable ring objective',(await snap()).collected.length===3);
 await page.keyboard.press('Space');await page.waitForTimeout(450);check(id+' signature input',(await snap()).action>0);
 await page.screenshot({path:path.join(dir,'signature-move.png')});
 await page.reload();await page.waitForFunction(()=>window.__encounter);check(id+' saved completion',(await snap()).collected.length===3);
 for(const view of contract.recognitionViews){await page.goto(url+'&view='+view);await page.waitForFunction(()=>window.__encounter);await page.waitForTimeout(300);await page.screenshot({path:path.join(dir,view+'.png')});}
 check(id+' nonempty live geometry',(await snap()).triangles>100);check(id+' browser errors',errors.length===0);
 await context.close();
 const files=fs.readdirSync(dir).map(file=>({path:file,sha256:digest(fs.readFileSync(path.join(dir,file)))}));
 fs.writeFileSync(path.join(dir,'evidence.json'),JSON.stringify({id,assetSha256:rosterAsset(id).sha256,visualAcceptance:'requires actual image and motion inspection',files},null,2));
 console.log('PASS',id,dir);
}
}catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();fs.writeFileSync(path.join(output,'checks.json'),JSON.stringify(checks,null,2));console.log('EVIDENCE',output);}
