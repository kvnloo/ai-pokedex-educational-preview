import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {rosterAsset,rosterIds} from './roster.mjs';
import {contract} from './gate.mjs';

test('unknown species cannot select arbitrary private paths',()=>{
  for(const id of ['../sources/ledger','pikachu','giratina','giratina-origin/../../etc'])assert.throws(()=>rosterAsset(id),/Unknown private species/);
});
for(const defect of ['external-input','public-scope','recipe','identity','glb-hash'])test(`roster gate rejects ${defect}`,()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'roster-integrity-'));
  try{
    const dir=path.join(root,'roster/charizard');fs.mkdirSync(dir,{recursive:true});
    const receipt=JSON.parse(fs.readFileSync(path.join(contract.assetRoot,'roster/charizard/receipt.json')));
    if(defect==='external-input')receipt.externalInputs=['official-model.glb'];
    if(defect==='public-scope')receipt.scope='distributable';
    if(defect==='recipe')receipt.recipeHashes={};
    if(defect==='identity')receipt.specification.nationalDexId=149;
    if(defect==='glb-hash'){fs.writeFileSync(path.join(dir,'model.glb'),'not generated geometry');}
    fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(receipt));
    assert.throws(()=>rosterAsset('charizard',root));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('each final authored model has distinct bytes and exact identity; both forms remain Dex 487',()=>{
 const assets=rosterIds.map(id=>rosterAsset(id));
 assert.equal(new Set(assets.map(a=>a.sha256)).size,6);
 assert.deepEqual(assets.slice(-2).map(a=>[a.nationalDexId,a.form]),[[487,'altered'],[487,'origin']]);
});
