import fs from 'node:fs';
import path from 'node:path';
import {contract,repository,privateBytes,digest} from './gate.mjs';
import {inspectGlb} from './glb-qa.mjs';
export const rosterIds=['charizard','dragonite','mew','blaziken','giratina-altered','giratina-origin'];
export function rosterAsset(id,root=contract.assetRoot) {
  if(!rosterIds.includes(id)) throw new Error('Unknown private species');
  const base=`roster/${id}/`,receipt=JSON.parse(privateBytes(root,base+'receipt.json'));
  if(receipt.method!=='generated-from-scratch'||receipt.scope!=='private-local'||!Array.isArray(receipt.externalInputs)||receipt.externalInputs.length||!receipt.blenderVersion?.startsWith('5.2.'))throw new Error('Original Blender 5.2 provenance required');
  for(const name of [`tools/private-opening/species/${id}.py`,'tools/private-opening/species/common.py','tools/private-opening/author_blender.py'])if(receipt.recipeHashes?.[name]!==digest(fs.readFileSync(path.join(repository,name))))throw new Error('Recipe integrity mismatch');
  const asset=receipt.specification;
  const dex=[6,149,151,257,487,487][rosterIds.indexOf(id)],form=id.startsWith('giratina-')?id.slice(9):'standard';
  if(asset.id!==id||asset.nationalDexId!==dex||asset.form!==form||asset.canonicalId!==`pokemon:${String(dex).padStart(3,'0')}:${form}`)throw new Error('Species identity mismatch');
  const bytes=privateBytes(root,base+'model.glb');
  if(digest(bytes)!==receipt.sha256||bytes.length!==receipt.bytes||digest(privateBytes(root,base+'model.blend'))!==receipt.blendSha256)throw new Error('Private model integrity mismatch');
  const qa=inspectGlb(bytes);
  if(!receipt.meshQa?.ok||qa.triangles!==receipt.meshQa.triangles||!qa.gltf.nodes.some(n=>n.extras?.canonicalId===asset.canonicalId&&n.extras?.form===form))throw new Error('Mesh identity/QA mismatch');
  for(const clip of ['idle','walk','run','greet','special'])if(!qa.gltf.animations?.some(a=>a.name===clip&&a.channels.length))throw new Error('Animation missing');
  return {...asset,sha256:receipt.sha256,bytes:receipt.bytes,materials:receipt.materials,sockets:receipt.sockets,clips:receipt.clips,href:`/private-opening/roster/${id}.glb`};
}
