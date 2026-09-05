import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectGlb } from './glb-qa.mjs';

export const repository = fileURLToPath(new URL('../../', import.meta.url));
export const contract = JSON.parse(fs.readFileSync(path.join(repository, 'canonical/opening/contract.json'), 'utf8'));
export const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const hashPattern = /^[a-f0-9]{64}$/;

export function implementationSha256() {
  const files = ['private.html', 'vite.config.ts', 'src/privateOpening/main.ts', 'src/privateOpening/arena.ts', 'tools/private-opening/roster.mjs', 'tools/private-opening/encounter-browser.mjs', 'src/privateOpening/assets.ts', 'src/privateOpening/journey.ts', 'src/privateOpening/style.css', 'tools/private-opening/gate.mjs', 'tools/private-opening/glb-qa.mjs', 'tools/private-opening/vite-plugin.mjs', 'tools/private-opening/browser.mjs'];
  return digest(Buffer.concat(files.flatMap(file => [Buffer.from(file+'\0'),fs.readFileSync(path.join(repository,file))])));
}

// Resolve every component without following links; only regular files are inputs.
// The final descriptor is revalidated after reading. Inputs are never copied to Git.
export function privateBytes(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.split(/[\\/]/).some(p => !p || p === '.' || p === '..')) {
    throw new Error('PRIVATE_PATH_REJECTED');
  }
  const base = path.resolve(root);
  const file = path.join(base, relative);
  let current = path.parse(file).root;
  for (const part of file.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`PRIVATE_SYMLINK_REJECTED: ${relative}`);
  }
  const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size > 128 * 1024 * 1024) throw new Error(`PRIVATE_FILE_REJECTED: ${relative}`);
    const bytes = fs.readFileSync(fd);
    const after = fs.fstatSync(fd);
    const named = fs.lstatSync(file);
    if (named.isSymbolicLink() || before.ino !== named.ino || before.dev !== named.dev || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw new Error(`PRIVATE_INPUT_CHANGED: ${relative}`);
    }
    return bytes;
  } finally { fs.closeSync(fd); }
}

export function sourceReadiness(root = contract.assetRoot) {
  try {
    const bytes = privateBytes(root, contract.sourceLedger);
    const ledger = JSON.parse(bytes);
    if (ledger.schemaVersion !== 2 || !Array.isArray(ledger.records)) throw new Error('generated provenance ledger v2 required');
    const recipeHash = digest(fs.readFileSync(path.join(repository, 'tools/private-opening/author_blender.py')));
    if (ledger.records.length !== contract.characters.length) throw new Error('exact character provenance required');
    for (const character of contract.characters) {
      const rows = ledger.records.filter(r => r.characterId === character.id);
      if (rows.length !== 1) throw new Error('exactly one provenance record per character');
      const row = rows[0];
      if (row.method !== 'generated-from-scratch' || row.scope !== 'private-local') throw new Error('original private procedural provenance required');
      if (!Array.isArray(row.externalInputs) || row.externalInputs.length) throw new Error('external binary inputs prohibited');
      if (row.specificationSha256 !== digest(Buffer.from(JSON.stringify(character))) || row.recipeSha256 !== recipeHash) throw new Error('specification/recipe integrity mismatch');
      if (!Number.isFinite(Date.parse(row.generatedAt)) || Date.parse(row.generatedAt) > Date.now()) throw new Error('invalid generation date');
    }
    return {ok:true, code:'GENERATED_PROVENANCE_VERIFIED', errors:[], ledgerSha256:digest(bytes)};
  } catch (error) {
    return {ok:false, code:'GENERATED_PROVENANCE_REQUIRED', errors:[error.message]};
  }
}

export function writeGeneratedProvenance(root = contract.assetRoot) {
  const directory=path.resolve(root,'sources');
  let current=path.parse(directory).root;
  for(const part of directory.slice(current.length).split(path.sep)) {
    current=path.join(current,part);
    if(fs.existsSync(current)) {const stat=fs.lstatSync(current);if(stat.isSymbolicLink()||!stat.isDirectory())throw new Error('PRIVATE_PROVENANCE_PATH_REJECTED');}
    else fs.mkdirSync(current,{mode:0o700});
  }
  const ledgerPath=path.join(root,contract.sourceLedger);
  if(fs.existsSync(ledgerPath)&&fs.lstatSync(ledgerPath).isSymbolicLink())throw new Error('PRIVATE_PROVENANCE_SYMLINK_REJECTED');
  const recipeSha256 = digest(fs.readFileSync(path.join(repository, 'tools/private-opening/author_blender.py')));
  if (sourceReadiness(root).ok) return sourceReadiness(root);
  const file = path.join(root, contract.sourceLedger);
  if (fs.existsSync(file)) fs.renameSync(file, file+'.preserved-'+Date.now());
  const ledger = {schemaVersion:2, records:contract.characters.map(character => ({
    characterId:character.id, method:'generated-from-scratch', scope:'private-local',
    specificationSha256:digest(Buffer.from(JSON.stringify(character))), recipeSha256,
    generatedAt:new Date().toISOString(), externalInputs:[],
    basis:'Textual species/character design specification; original mesh, material and hierarchical animation code. Fan art; no official binary inputs.'
  }))};
  fs.writeFileSync(file, JSON.stringify(ledger,null,2)+'\n', {mode:0o600});
  return sourceReadiness(root);
}

function evidenceFile(root, record, label) {
  if (!record || typeof record.path !== 'string' || !record.path.startsWith('evidence/') || !hashPattern.test(record.sha256)) throw new Error(`${label}: evidence path/hash required`);
  const bytes = privateBytes(root, record.path);
  if (digest(bytes) !== record.sha256) throw new Error(`${label}: evidence hash mismatch`);
  return bytes;
}

export function openingReadiness({ root = contract.assetRoot, promoted = false } = {}) {
  const sources = sourceReadiness(root);
  if (!sources.ok) return sources;
  const errors = [];
  const assets = [];
  let receipt;
  try { receipt = JSON.parse(privateBytes(root, 'candidates/receipt.json')); }
  catch (error) { return { ...sources, ok: false, code: 'BLENDER_CANDIDATE_REQUIRED', errors: [error.message] }; }
  const contractSha256 = digest(fs.readFileSync(path.join(repository, 'canonical/opening/contract.json')));
  const recipeSha256 = digest(fs.readFileSync(path.join(repository, 'tools/private-opening/author_blender.py')));
  if (receipt.ledgerSha256 !== sources.ledgerSha256 || receipt.contractSha256 !== contractSha256 || receipt.recipeSha256 !== recipeSha256) errors.push('candidate inputs changed; rebuild and re-review');
  if (!String(receipt.blenderVersion).startsWith('5.2.')) errors.push('Blender 5.2 candidate required');
  for (const character of contract.characters) {
    try {
      const entry = receipt.assets?.find(a => a.id === character.id);
      if (!entry || entry.path !== character.candidate || !hashPattern.test(entry.sha256)) throw new Error('missing candidate receipt');
      if(!entry.blend || entry.blend.path!==`candidates/${character.id}.blend` || digest(privateBytes(root,entry.blend.path))!==entry.blend.sha256) throw new Error('authored Blender source integrity failure');
      const bytes = privateBytes(root, entry.path);
      if (digest(bytes) !== entry.sha256 || bytes.length !== entry.bytes || bytes.toString('ascii', 0, 4) !== 'glTF' || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(8) !== bytes.length) throw new Error('GLB integrity failure');
      const measured=inspectGlb(bytes),gltf=measured.gltf;
      if(!gltf.nodes?.some(n=>n.extras?.canonicalId===character.canonicalId&&n.extras?.form===character.form)) throw new Error('embedded canonical identity mismatch');
      const nodes=new Set((gltf.nodes??[]).map(n=>n.name));
      for(const name of character.sockets) if(!nodes.has('socket.'+name)) throw new Error(`GLB socket missing: ${name}`);
      const materials=new Set((gltf.materials??[]).map(m=>m.name));
      for(const name of character.materials) if(!materials.has(name)) throw new Error(`GLB material missing: ${name}`);
      const clips=new Set((gltf.animations??[]).filter(a=>a.channels?.length).map(a=>a.name));
      for(const name of character.clips) if(!clips.has(name)) throw new Error(`GLB animation missing: ${name}`);
      const qa = entry.meshQa;
      if (!qa || qa.ok !== true || qa.triangles < 100 || qa.triangles > 90000 || qa.nonFiniteVertices !== 0 || qa.degenerateTriangles !== 0 || qa.nonManifoldEdges !== 0 || qa.components < 1) throw new Error('structural mesh QA required');
      if(measured.triangles!==qa.triangles) throw new Error('mesh QA triangle count does not match actual GLB');
      for (const key of ['materials', 'sockets', 'clips']) for (const name of character[key]) if (!entry[key]?.includes(name)) throw new Error(`missing ${key}: ${name}`);
      assets.push({ ...character, sha256: entry.sha256, bytes: entry.bytes, href: `/private-opening/assets/${character.id}.glb` });
    } catch (error) { errors.push(`${character.name}: ${error.message}`); }
  }
  if (promoted && !errors.length) {
    try {
      const review = JSON.parse(privateBytes(root, 'evidence/promotion.json'));
      if (review.ledgerSha256 !== sources.ledgerSha256 || review.contractSha256 !== contractSha256 || review.recipeSha256 !== recipeSha256) throw new Error('promotion input hashes are stale');
      if(review.implementationSha256!==implementationSha256()) throw new Error('promotion runtime evidence is stale');
      for (const asset of assets) {
        const verdict = review.characters?.find(v => v.id === asset.id);
        if (!verdict || verdict.assetSha256 !== asset.sha256 || verdict.recognizable !== true || typeof verdict.reviewer !== 'string' || !verdict.reviewer.trim()) throw new Error(`${asset.name}: visual review required for exact GLB`);
        for (const view of contract.recognitionViews) evidenceFile(root, verdict.views?.[view], `${asset.name}/${view}`);
        evidenceFile(root, verdict.motion, `${asset.name}/motion`);
      }
      for (const name of contract.promotionChecks) {
        const result = review.checks?.[name];
        if (!result || result.ok !== true) throw new Error(`${name}: passing result required`);
        evidenceFile(root, result, name);
      }
    } catch (error) { errors.push(error.message); }
  }
  return { ok: !errors.length, code: errors.length ? 'CHARACTER_ACCEPTANCE_REQUIRED' : promoted ? 'PROMOTED' : 'CANDIDATE_REVIEW_ONLY', errors, assets, ledgerSha256: sources.ledgerSha256, contractSha256, recipeSha256 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = process.argv.includes('--record-provenance') ? writeGeneratedProvenance() : process.argv.includes('--sources') ? sourceReadiness() : openingReadiness({ promoted: process.argv.includes('--promoted') });
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 2;
}
