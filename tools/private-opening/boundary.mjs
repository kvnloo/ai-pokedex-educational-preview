import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { contract, repository, digest, privateBytes } from './gate.mjs';

const binary=/\.(png|jpe?g|webp|gif|glb|gltf|blend\d*|mp4|webm|zip|gb|gbc|gba|nds|3ds|cia)$/i;
export function scanFiles(root, files, hashes) {
  const errors=[];
  for(const relative of files) {
    const file=path.join(root,relative);
    const stat=fs.lstatSync(file);
    if(stat.isSymbolicLink()) {errors.push(`${relative}: symlink is not scannable private-boundary evidence`);continue;}
    if(!stat.isFile()) continue;
    if(binary.test(relative) && /^(canonical\/|src\/privateOpening\/|tools\/private-opening\/|shots\/canonical)/.test(relative)) errors.push(`${relative}: private artifact belongs outside Git`);
    if(hashes.has(digest(fs.readFileSync(file)))) errors.push(`${relative}: known private source or candidate bytes`);
  }
  return errors;
}
export function scanBoundary() {
  const hashes=new Set();
  const assetManifest=JSON.parse(fs.readFileSync(path.join(repository,'canonical/assets.json')));
  for(const asset of assetManifest.assets) if(asset.scope==='private-canonical-reference') hashes.add(asset.sourceSha256);
  for(const file of ['sources/ledger.json','candidates/receipt.json']) {
    if(!fs.existsSync(path.join(contract.assetRoot,file))) continue;
    const manifest=JSON.parse(privateBytes(contract.assetRoot,file));
    for(const entry of manifest.records??manifest.assets??[]) if(entry.sha256) hashes.add(entry.sha256);
  }
  // Include authored Blender sources, every species revision, and visual evidence,
  // so renaming private bytes anywhere in the worktree cannot bypass the scan.
  const hashTree=dir=>{
    if(!fs.existsSync(dir))return;
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      const file=path.join(dir,entry.name);
      if(entry.isSymbolicLink())throw new Error('Private artifact tree contains symlink');
      if(entry.isDirectory())hashTree(file);
      else if(binary.test(entry.name))hashes.add(digest(fs.readFileSync(file)));
    }
  };
  for(const dir of ['candidates','roster','evidence'])hashTree(path.join(contract.assetRoot,dir));
  const charizard='/mnt/zer0models/pokemon_anime/pipeline/golden/charizard-006';
  if(fs.existsSync(path.join(charizard,'source-ledger.v1.json'))) for(const row of JSON.parse(privateBytes(charizard,'source-ledger.v1.json')).records) hashes.add(row.sha256);
  const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:repository,encoding:'utf8'}).split('\0').filter(Boolean);
  const walk=(dir)=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(repository,path.join(dir,e.name))]):[];
  const all=[...new Set([...files,...walk(path.join(repository,'dist')),...walk(path.join(repository,'public'))])];
  const errors=scanFiles(repository,all,hashes);
  return {ok:errors.length===0,scannedFiles:all.length,knownPrivateHashes:hashes.size,errors,sourcePresence:fs.existsSync(path.join(contract.assetRoot,'sources/ledger.json')),note:'Original procedural geometry, authored sources and evidence remain private. No publication performed.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {const result=scanBoundary();console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;}
