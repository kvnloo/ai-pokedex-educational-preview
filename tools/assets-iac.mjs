#!/usr/bin/env node
import Ajv2020 from 'ajv/dist/2020.js';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { executeGraph, ingestSource, validatePinBindings, verifyStableFile } from './assets-iac-lib.mjs';

const repo = path.resolve(import.meta.dirname, '..');
const root = path.resolve(process.env.POKEMON_IAC_ROOT ?? '/mnt/zer0models/pokemon-iac');
const action = process.argv[2] ?? 'doctor';
const profileName = process.argv.includes('--profile') ? process.argv[process.argv.indexOf('--profile') + 1] : 'distributable';
const json = async (relative) => JSON.parse(await readFile(path.join(repo, relative), 'utf8'));
const manifest = await json('asset-iac/sources/kanto.manifest.json');
const recipes = await json('asset-iac/recipes/kanto-minimal.json');
const graph = await json('asset-iac/graphs/kanto-pallet-pewter.json');
const profile = await json(`asset-iac/profiles/${profileName}.json`).catch(() => { throw new Error(`UNKNOWN_PROFILE: ${profileName}`); });
const locks = {
  tool: await json('asset-iac/locks/tools.lock.json'),
  model: await json('asset-iac/locks/models.lock.json'),
  container: await json('asset-iac/locks/containers.lock.json'),
};

async function ensureRoot() {
  try {
    const value = await lstat(root);
    if (value.isSymbolicLink()) throw new Error(`DATA_ROOT_SYMLINK: ${root}`);
    if (!value.isDirectory()) throw new Error(`DATA_ROOT_NOT_DIRECTORY: ${root}`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    await mkdir(root, { recursive: true, mode: 0o700 });
  }
  for (const directory of ['sources', 'cas', 'work', 'outputs', 'reports', 'models']) await mkdir(path.join(root, directory), { recursive: true, mode: 0o700 });
}

function eligibleRecipes() { return recipes.recipes.filter((recipe) => recipe.profiles.includes(profileName)); }
function expectedGraphNodes() {
  return graph.nodes.flatMap((node) => {
    const recipe = recipes.recipes.find((candidate) => candidate.assetId === node.recipe);
    if (!recipe) throw new Error(`GRAPH_RECIPE_MISSING: ${node.recipe}`);
    if (!recipe.profiles.includes(profileName)) return [];
    return [{ id: node.id, dependsOn: node.dependsOn, input: { recipe, sourceDigests: undefined }, output: path.join(root, 'outputs', profile.outputNamespace, `${node.id}.json`) }];
  });
}
function requiredSources() {
  const ids = new Set(eligibleRecipes().flatMap((recipe) => recipe.sources));
  return manifest.sources.filter((source) => ids.has(source.sourceId));
}

async function validateControlPlane() {
  for (const [schemaFile, document] of [
    ['source.schema.json', manifest], ['recipe.schema.json', recipes],
    ['lock.schema.json', locks.tool], ['lock.schema.json', locks.model], ['lock.schema.json', locks.container],
    ['profile.schema.json', await json('asset-iac/profiles/private-local.json')], ['profile.schema.json', await json('asset-iac/profiles/distributable.json')],
    ['graph.schema.json', graph],
  ]) {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const schema = await json(`asset-iac/schema/${schemaFile}`);
    const validate = ajv.compile(schema);
    if (!validate(document)) throw new Error(`SCHEMA_INVALID ${schemaFile}: ${ajv.errorsText(validate.errors)}`);
  }
  for (const recipe of recipes.recipes) validatePinBindings(recipe.pins, locks, process.version);
  const sourceIds = new Set(manifest.sources.map(({ sourceId }) => sourceId));
  const recipeIds = new Set(recipes.recipes.map(({ assetId }) => assetId));
  for (const recipe of recipes.recipes) {
    for (const sourceId of recipe.sources) if (!sourceIds.has(sourceId)) throw new Error(`DANGLING_SOURCE: ${recipe.assetId} -> ${sourceId}`);
    for (const dependency of recipe.dependencies) if (!recipeIds.has(dependency)) throw new Error(`DANGLING_ASSET: ${recipe.assetId} -> ${dependency}`);
  }
  for (const node of graph.nodes) {
    if (!recipeIds.has(node.recipe)) throw new Error(`DANGLING_GRAPH_RECIPE: ${node.recipe}`);
    for (const dependency of node.dependsOn) if (!graph.nodes.some(({ id }) => id === dependency)) throw new Error(`DANGLING_GRAPH_NODE: ${dependency}`);
  }
  for (const source of requiredSources()) {
    if (!profile.allowedPolicies.includes(source.policy)) throw new Error(`PROFILE_POLICY_VIOLATION: ${source.sourceId}`);
  }
}

async function locate(source) {
  if (source.classification === 'repository-original') return path.join(repo, source.locator);
  if (source.classification === 'owner-supplied') return path.join(root, 'sources', source.locator);
  throw new Error(`ADAPTER_UNIMPLEMENTED: ${source.sourceId}`);
}

async function bootstrap() {
  await ensureRoot();
  await validateControlPlane();
  const observations = [];
  for (const source of requiredSources()) {
    const location = await locate(source);
    try {
      const result = await ingestSource(location, path.join(root, 'cas'), { expectedSha256: source.expectedSha256 });
      if (result.bytes !== source.expectedBytes) throw new Error(`SOURCE_SIZE_DRIFT: ${source.sourceId}`);
      observations.push({ sourceId: source.sourceId, ...result, casPath: path.relative(root, result.casPath) });
    } catch (error) {
      if (source.classification === 'owner-supplied' && /SOURCE_MISSING/.test(error.message)) {
        throw new Error(`OWNER_SOURCE_REQUIRED: ${source.sourceId} expected sha256:${source.expectedSha256} bytes:${source.expectedBytes}`);
      }
      throw error;
    }
  }
  await writeReport('bootstrap', { profile: profileName, observations });
  return observations;
}

async function writeReport(kind, body) {
  await ensureRoot();
  const report = { schemaVersion: 1, kind, profile: profileName, graphId: graph.graphId, generatedAt: new Date().toISOString(), ...body };
  const target = path.join(root, 'reports', `${kind}-${profileName}.json`);
  await writeFile(target, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  return target;
}

async function buildAssets() {
  const observations = await bootstrap();
  const sourceDigests = Object.fromEntries(observations.map((item) => [item.sourceId, item.digest]));
  const nodes = expectedGraphNodes().map((node) => ({ ...node, input: { ...node.input, sourceDigests } }));
  const result = await executeGraph({ nodes }, path.join(root, 'work', profileName, 'checkpoints.json'));
  await writeReport('build', { nodes: result.nodes });
  return result;
}

async function verifyAssets() {
  await validateControlPlane();
  const reportFile = path.join(root, 'reports', `build-${profileName}.json`);
  const checkpointFile = path.join(root, 'work', profileName, 'checkpoints.json');
  let report;
  let checkpoint;
  try { report = JSON.parse(await readFile(reportFile, 'utf8')); } catch { throw new Error(`BUILD_REPORT_MISSING: ${reportFile}`); }
  try { checkpoint = JSON.parse(await readFile(checkpointFile, 'utf8')); } catch { throw new Error(`CHECKPOINT_MISSING: ${checkpointFile}`); }
  const expectedIds = expectedGraphNodes().map(({ id }) => id);
  const reportIds = Array.isArray(report.nodes) ? report.nodes.map((node) => node?.id) : [];
  const checkpointIds = checkpoint.nodes && typeof checkpoint.nodes === 'object' && !Array.isArray(checkpoint.nodes)
    ? Object.keys(checkpoint.nodes) : [];
  const assertInventory = (kind, ids) => {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    const missing = expectedIds.filter((id) => !ids.includes(id));
    const extra = ids.filter((id) => !expectedIds.includes(id));
    if (duplicates.length || missing.length || extra.length || ids.length !== expectedIds.length) {
      throw new Error(`${kind}_NODE_INVENTORY_MISMATCH: expected=${JSON.stringify(expectedIds)} actual=${JSON.stringify(ids)}`);
    }
  };
  assertInventory('BUILD_REPORT', reportIds);
  assertInventory('CHECKPOINT', checkpointIds);
  const reportById = new Map(report.nodes.map((node) => [node.id, node]));
  for (const id of expectedIds) {
    const node = reportById.get(id);
    const output = path.join(root, 'outputs', profile.outputNamespace, `${node.id}.json`);
    const committed = checkpoint.nodes?.[node.id];
    if (!committed?.complete || committed.inputHash !== node.inputHash || committed.outputHash !== node.outputHash
      || committed.outputBytes !== node.outputBytes
      || JSON.stringify(committed.dependencyOutputHashes) !== JSON.stringify(node.dependencyOutputHashes)) {
      throw new Error(`CHECKPOINT_REPORT_MISMATCH: ${node.id}`);
    }
    await verifyStableFile(output, node.outputHash, node.outputBytes);
    JSON.parse(await readFile(output, 'utf8'));
  }
  if (profileName === 'distributable') await leakScan(path.join(root, 'outputs', profile.outputNamespace));
  await writeReport('verify', { verifiedNodes: report.nodes.length, reproducibility: eligibleRecipes().map(({ assetId, reproducibility, acceptance }) => ({ assetId, reproducibility, acceptance })) });
}

async function leakScan(directory) {
  const privateSources = manifest.sources.filter((source) => source.policy === 'private-only');
  const needles = privateSources.flatMap((source) => [source.expectedSha256, source.locator]).filter(Boolean);
  const walk = async (current) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const candidate = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`DISTRIBUTABLE_SYMLINK: ${candidate}`);
      if (entry.isDirectory()) await walk(candidate);
      else {
        const bytes = await readFile(candidate);
        const text = bytes.toString('utf8');
        if (needles.some((needle) => text.includes(needle))) throw new Error(`PRIVATE_ASSET_LEAK: ${candidate}`);
      }
    }
  };
  await walk(directory);
}

async function main() {
  if (action === 'doctor') {
    await ensureRoot(); await validateControlPlane();
    console.log(JSON.stringify({ ok: true, root, profile: profileName, node: process.version }));
  } else if (action === 'plan') {
    await validateControlPlane();
    console.log(JSON.stringify({ profile: profileName, graph: graph.graphId, sources: requiredSources().map((source) => ({ sourceId: source.sourceId, classification: source.classification, expectedSha256: source.expectedSha256 })), assets: eligibleRecipes().map((recipe) => ({ assetId: recipe.assetId, reproducibility: recipe.reproducibility, resources: recipe.resources })) }, null, 2));
  } else if (action === 'bootstrap') {
    const result = await bootstrap(); console.log(JSON.stringify({ ok: true, observations: result.length }));
  } else if (action === 'build') {
    const result = await buildAssets(); console.log(JSON.stringify({ ok: true, nodes: result.nodes }));
  } else if (action === 'verify') {
    await verifyAssets(); console.log(JSON.stringify({ ok: true, profile: profileName }));
  } else if (action === 'leak-scan') {
    await leakScan(process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'outputs', 'distributable')); console.log(JSON.stringify({ ok: true }));
  } else throw new Error(`UNKNOWN_ACTION: ${action}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
