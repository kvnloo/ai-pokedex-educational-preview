#!/usr/bin/env node
import {
  buildGrookey,
  buildScorbunny,
  buildSobble,
  buildWooloo,
} from '../src/creatures/pokeapiMeshes.ts';
import { evaluateMeshQa } from '../src/creatures/meshQa.ts';

const cases = [
  ['grookey', 810, buildGrookey],
  ['scorbunny', 813, buildScorbunny],
  ['sobble', 816, buildSobble],
  ['wooloo', 831, buildWooloo],
];

const failures = [];
const report = [];
for (const [slug, pokemonId, build] of cases) {
  const root = build(1);
  const qa = evaluateMeshQa(root);
  const provenance = root.userData.provenance;
  const row = {
    slug,
    pokemonId: provenance?.pokemonId,
    meshCount: qa.meshCount,
    triangleCount: qa.triangleCount,
    volumeOverBbox: qa.volumeOverBbox,
    thinRatio: qa.thinRatio,
    qa: qa.ok,
  };
  report.push(row);
  if (!qa.ok) failures.push(`${slug}: ${qa.reasons.join('; ')}`);
  if (provenance?.pokemonId !== pokemonId) failures.push(`${slug}: wrong PokéAPI id`);
  if (provenance?.system !== 'pokeapi+img2threejs') failures.push(`${slug}: missing pipeline provenance`);
  if (!String(provenance?.officialArtworkUrl).endsWith(`/${pokemonId}.png`)) {
    failures.push(`${slug}: wrong official-artwork source`);
  }
  if (!/^[a-f0-9]{64}$/.test(String(provenance?.sourceSha256))) {
    failures.push(`${slug}: missing source hash`);
  }
  if (qa.meshCount < 15) failures.push(`${slug}: too few identity components (${qa.meshCount})`);
  if (qa.triangleCount > 20_000) failures.push(`${slug}: triangle budget exceeded (${qa.triangleCount})`);
}

console.log(JSON.stringify({ report, failures }, null, 2));
if (failures.length > 0) process.exit(1);
