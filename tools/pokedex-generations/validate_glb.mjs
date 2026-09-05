import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const require = createRequire('/tmp/pokedex-gltf-validation/package.json');
const validator = require('gltf-validator');
const candidate = process.argv[2];
if (!/^v00[23]-r08$/.test(candidate)) throw new Error('Pass a candidate id');
const quality = process.argv[3] === '--quality-q2';
if (process.argv[3] && !quality) throw new Error('Unknown export profile');
const root = `/mnt/zer0models/pokemon-iac/devices/pokedex/${candidate.slice(0,4)}/astra-r08/${quality ? 'quality-q2/' : ''}runtime`;
const expected = { Closed: .5, Opening: 2, BootUp: 2.5, Ready: 1, Idle: 3, ButtonPress: .8 };
const results = [];
for (const level of [0]) {
  const path = `${root}/${candidate}-lod${level}.glb`;
  const bytes = await fs.readFile(path);
  const report = await validator.validateBytes(new Uint8Array(bytes), { uri: path, maxIssues: 100 });
  const jsonLength = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const clips = gltf.animations.map(animation => {
    const inputs = animation.samplers.map(s => gltf.accessors[s.input]);
    const start = Math.min(...inputs.map(a => a.min[0]));
    const end = Math.max(...inputs.map(a => a.max[0]));
    const targets = animation.channels.map(c => `${c.target.node}:${c.target.path}`);
    return { name: animation.name, start, end, duration: end - start, channels: targets.length, uniqueChannels: new Set(targets).size };
  });
  const triangles = gltf.meshes.flatMap(m => m.primitives).reduce((sum, p) => sum + gltf.accessors[p.indices].count / 3, 0);
  const bindings = gltf.materials.filter(m => m.extras?.power_signal).map(m => ({material:m.name, signal:m.extras.power_signal, maximum:m.extras.max_emission, resolved:gltf.nodes.some(n => n.name === m.extras.power_signal)}));
  const checks = {
    validatorErrors: report.issues.numErrors === 0,
    sixNamedClips: clips.length === 6 && clips.every(c => Object.hasOwn(expected, c.name)),
    clipDurations: clips.every(c => c.start === 0 && Math.abs(c.duration - expected[c.name]) < .0001),
    uniqueChannels: clips.every(c => c.channels === c.uniqueChannels),
    budget: triangles <= (quality ? 150000 : [80000, 35000, 15000][level]),
    signalsResolve: bindings.length > 0 && bindings.every(b => b.resolved && Number.isFinite(b.maximum)),
    replaceableScreen: gltf.nodes.some(n => n.extras?.replaceable_display === true),
    noPointerExtension: !gltf.extensionsUsed?.includes('KHR_animation_pointer'),
  };
  const result = {level,path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,triangles,clips,bindings,checks,passed:Object.values(checks).every(Boolean),validator:report};
  await fs.writeFile(`${root}/lod${level}-validation.json`, JSON.stringify(result, null, 2));
  results.push({level,triangles,checks,issues:{errors:report.issues.numErrors,warnings:report.issues.numWarnings,codes:[...new Set(report.issues.messages.map(m=>m.code))]}});
}
console.log(JSON.stringify(results, null, 2));
if (results.some(r => !Object.values(r.checks).every(Boolean))) process.exitCode = 1;
