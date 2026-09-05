import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sourceReadiness, openingReadiness, contract, digest, privateBytes, writeGeneratedProvenance } from './gate.mjs';
import { privateOpeningPlugin } from './vite-plugin.mjs';
import { scanFiles } from './boundary.mjs';
import { inspectGlb } from './glb-qa.mjs';
import { newJourney, advanceJourney, meetPartner, restoreJourney, SOLIDS } from '../../src/privateOpening/journey.ts';

function fixture(fn) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'opening-gate-test-'));
  try { return fn(root); } finally { fs.rmSync(root,{recursive:true,force:true}); }
}
test('private procedural authoring requires no owner images',()=>fixture(root=>{
  assert.equal(sourceReadiness(root).code,'GENERATED_PROVENANCE_REQUIRED');
  assert.equal(writeGeneratedProvenance(root).ok,true);
  assert.equal(sourceReadiness(root).ok,true);
  assert.equal(openingReadiness({root}).code,'BLENDER_CANDIDATE_REQUIRED');
  assert.deepEqual(fs.readdirSync(path.join(root,'sources')),['ledger.json']);
}));
for(const defect of ['scope','method','specificationSha256','recipeSha256','externalInputs','generatedAt','duplicate']) {
  test(`generated provenance rejects ${defect}`,()=>fixture(root=>{
    writeGeneratedProvenance(root);
    const file=path.join(root,contract.sourceLedger),ledger=JSON.parse(fs.readFileSync(file));
    if(defect==='duplicate') ledger.records.push(ledger.records[0]);
    else ledger.records[0][defect]=defect==='externalInputs'?['official.png']:'invalid';
    fs.writeFileSync(file,JSON.stringify(ledger));
    assert.equal(sourceReadiness(root).ok,false);
  }));
}
test('private reads reject symlinked ancestor and absolute paths',()=>fixture(root=>{
  fs.mkdirSync(path.join(root,'real'));fs.writeFileSync(path.join(root,'real/value'),'test');fs.symlinkSync(path.join(root,'real'),path.join(root,'alias'));
  assert.throws(()=>privateBytes(root,'alias/value'),/SYMLINK/);assert.throws(()=>privateBytes(root,'/etc/passwd'),/PATH_REJECTED/);
}));
test('private endpoint rejects off-host, cross-origin, POST, and unknown names',()=>{
  const callbacks=[];privateOpeningPlugin(true).configureServer({middlewares:{use:fn=>callbacks.push(fn)}});
  for(const [headers,url,method,expected] of [
    [{host:'evil.example'},'/private-opening/catalog','GET',403],
    [{host:'localhost',origin:'https://evil.example'},'/private-opening/catalog','GET',403],
    [{host:'127.0.0.1','sec-fetch-site':'cross-site'},'/private-opening/catalog','GET',403],
    [{host:'localhost'},'/private-opening/catalog','POST',405],
    [{host:'localhost'},'/private-opening/assets/standin.glb','GET',404],
  ]) {
    const res={statusCode:200,setHeader(){},end(){}};callbacks[0]({headers,url,method},res,()=>assert.fail('must not fall through'));assert.equal(res.statusCode,expected);
  }
});
test('walk distance and north fence do not advance the story without Pikachu',()=>{
  const s=newJourney();for(let i=0;i<500;i++) advanceJourney(s,0,-1,.05);
  assert.ok(s.player.z>=-8);assert.equal(s.location,'pallet-town');assert.deepEqual(s.journal,[]);assert.equal(meetPartner(s),false);
});
test('meet, spatial exit, follow, return, and save reload preserve identity and progress',()=>{
  let s=newJourney();for(let i=0;i<40;i++) advanceJourney(s,0,-1,.05);
  for(let i=0;i<10;i++) advanceJourney(s,1,0,.05);
  assert.equal(meetPartner(s),true);assert.equal(meetPartner(s),false);
  for(let i=0;i<10;i++) advanceJourney(s,-1,0,.05);
  for(let i=0;i<150;i++) advanceJourney(s,0,-1,.05);
  assert.equal(s.location,'route-1');assert.equal(s.completed,true);assert.deepEqual(s.journal,['met-pikachu','departed-pallet','reached-route-1']);
  s=restoreJourney(JSON.stringify(s));assert.equal(s.partner,'pikachu');assert.equal(s.completed,true);
  for(let i=0;i<90;i++) advanceJourney(s,0,1,.05);
  assert.equal(s.location,'pallet-town');assert.equal(s.journal.length,3);assert.equal(s.completed,true);
});
test('houses collide, diagonal speed is bounded, and invalid input does not move',()=>{
  const s=newJourney();s.player={x:SOLIDS[0].x,z:5,heading:0};for(let i=0;i<100;i++) advanceJourney(s,0,-1,.05);
  assert.ok(s.player.z>=SOLIDS[0].z+SOLIDS[0].halfZ);
  const a=newJourney(), b=newJourney();advanceJourney(a,0,-1,.05);advanceJourney(b,1,-1,.05);
  assert.ok(Math.abs(Math.hypot(a.player.x,a.player.z-4)-Math.hypot(b.player.x,b.player.z-4))<1e-10);
  const old=JSON.stringify(a);advanceJourney(a,NaN,0,.1);advanceJourney(a,1,0,Infinity);assert.equal(JSON.stringify(a),old);
});
test('invalid and foreign-species saves reset without relabeling',()=>{
  for(const patch of [{partner:'emberpup'},{version:2},{player:{x:999,z:0,heading:0}},{completed:true},{location:'route-1'},{journal:['departed-pallet']},{partner:'pikachu',journal:[]}]) {
    assert.deepEqual(restoreJourney(JSON.stringify({...newJourney(),...patch})),newJourney());
  }
  assert.deepEqual(restoreJourney('{invalid'),newJourney());
});
test('later roster stays sequential and Giratina forms preserve one National Dex ID',()=>{
  const queue=JSON.parse(fs.readFileSync(new URL('../../canonical/opening/roster-order.json',import.meta.url))).queue;
  assert.deepEqual(queue.map(q=>q.id),['opening','charizard','dragonite','mew','blaziken','giratina']);
  for(let i=1;i<queue.length;i++) assert.deepEqual(queue[i].requires,[queue[i-1].id]);
  assert.equal(queue.at(-1).nationalDexId,487);assert.deepEqual(queue.at(-1).forms,['altered','origin']);
});
test('boundary scanner includes untracked private binary paths and renamed known bytes',()=>fixture(root=>{
  fs.mkdirSync(path.join(root,'canonical/opening'),{recursive:true});fs.writeFileSync(path.join(root,'canonical/opening/leak.glb'),'private-fixture');fs.writeFileSync(path.join(root,'renamed.txt'),'private-fixture');
  const errors=scanFiles(root,['canonical/opening/leak.glb','renamed.txt'],new Set([digest(Buffer.from('private-fixture'))]));
  assert.equal(errors.length,3);assert.ok(errors.some(e=>e.startsWith('renamed.txt')));
}));
function triangleFixture(mutate=()=>{}) {
  const binary=Buffer.alloc(36);[0,0,0,1,0,0,0,1,0].forEach((v,i)=>binary.writeFloatLE(v,i*4));
  const doc={asset:{version:'2.0'},buffers:[{byteLength:36}],bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3'}],meshes:[{primitives:[{attributes:{POSITION:0}}]}]};
  mutate(doc,binary);const json=Buffer.from(JSON.stringify(doc));const padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
  const header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+padded.length+binary.length,8);header.writeUInt32LE(padded.length,12);header.write('JSON',16);
  const binHeader=Buffer.alloc(8);binHeader.writeUInt32LE(binary.length);binHeader.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,padded,binHeader,binary]);
}
test('independent GLB QA measures geometry and rejects corrupt or external inputs',()=>{
  assert.equal(inspectGlb(triangleFixture()).triangles,1);
  for(const mutate of [
    (doc)=>doc.buffers[0].uri='https://outside.example/geometry.bin',
    (doc)=>doc.bufferViews[0].byteOffset=1000,
    (_,bytes)=>bytes.writeFloatLE(NaN,0),
    (_,bytes)=>bytes.fill(0),
    (doc)=>doc.accessors[0].count=4,
  ]) assert.throws(()=>inspectGlb(triangleFixture(mutate)));
  assert.throws(()=>inspectGlb(Buffer.from('not a glb')));
});

test('generated provenance cannot write through a symlinked source directory',()=>fixture(root=>{
  fs.mkdirSync(path.join(root,'elsewhere'));fs.symlinkSync(path.join(root,'elsewhere'),path.join(root,'sources'));
  assert.throws(()=>writeGeneratedProvenance(root),/PRIVATE_PROVENANCE_PATH_REJECTED/);
  assert.deepEqual(fs.readdirSync(path.join(root,'elsewhere')),[]);
}));
