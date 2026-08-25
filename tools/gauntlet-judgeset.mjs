#!/usr/bin/env node
/** Freeze an anonymous, hash-bound contact sheet from gauntlet reports. */
import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const argv=process.argv.slice(2); const flag=(name,fallback)=>{const exact=`--${name}`; const i=argv.indexOf(exact); if(i>=0)return argv[i+1]; const prefix=`${exact}=`; const joined=argv.find((value)=>value.startsWith(prefix)); return joined?joined.slice(prefix.length):fallback;};
const reportPath=resolve(flag('report',join(ROOT,'shots/gauntlet/gauntlet-report.json')));
const out=resolve(flag('out',join(ROOT,'shots/gauntlet-judgeset')));
const report=JSON.parse(readFileSync(reportPath,'utf8'));
if (!report.ok || !Array.isArray(report.shots) || report.shots.length<4) throw new Error('refusing incomplete/unverified gauntlet report');
for (const shot of report.shots) if (shot.failures?.length || createHash('sha256').update(readFileSync(shot.path)).digest('hex')!==shot.sha256) throw new Error(`invalid shot ${shot.name}`);
mkdirSync(out,{recursive:true,mode:0o700}); chmodSync(out,0o700);
const sheet=join(out,'contact-sheet.png');
const py=`from PIL import Image,ImageDraw\nimport json,sys,os\nitems=json.loads(sys.argv[1]); W,H=640,360; pad=18; rows=(len(items)+1)//2\nout=Image.new('RGB',(W*2+pad*3,rows*(H+42)+pad),(8,12,18)); d=ImageDraw.Draw(out)\nfor i,item in enumerate(items):\n im=Image.open(item['path']).convert('RGB'); im.thumbnail((W,H)); x=pad+(i%2)*(W+pad); y=pad+(i//2)*(H+42); out.paste(im,(x+(W-im.width)//2,y+(H-im.height)//2)); d.text((x,y+H+8),f\"View {i+1:02d}\",fill=(235,240,246))\nout.save(sys.argv[2])`;
const items=report.shots.map(({path})=>({path})); const result=spawnSync('python3',['-c',py,JSON.stringify(items),sheet],{encoding:'utf8'}); if(result.status!==0)throw new Error(result.stderr);
const publicManifest={schemaVersion:1,policy:'Origin-hidden. Score only pixels using docs/POKEMON-VISUAL-RUBRIC.md. Do not inspect source paths.',sourceCommit:report.sourceCommit,views:report.shots.map((_,i)=>({id:`view-${String(i+1).padStart(2,'0')}`})),contactSheet:'contact-sheet.png',contactSheetSha256:createHash('sha256').update(readFileSync(sheet)).digest('hex')};
writeFileSync(join(out,'manifest.json'),JSON.stringify(publicManifest,null,2)+'\n',{mode:0o600});
const sealed={report:reportPath,inputs:report.shots.map(({name,path,sha256})=>({name,path,sha256}))}; writeFileSync(join(out,'sealed-map.json'),JSON.stringify(sealed,null,2)+'\n',{mode:0o600}); chmodSync(join(out,'sealed-map.json'),0o600);
console.log(JSON.stringify({out,sheet,views:items.length,sha256:publicManifest.contactSheetSha256},null,2));
