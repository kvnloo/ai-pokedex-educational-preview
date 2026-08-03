#!/usr/bin/env node
/**
 * Deterministic Wave-7 world structure gate.
 *
 * This deliberately inspects authored route metadata rather than pixels: it
 * prevents a future visual refactor from silently collapsing the winding route,
 * irregular terrain masses, grass silhouette mix, or readable destination back
 * into a generic ring arena.
 *
 * Run: node --experimental-strip-types tools/world-structure-golden.mjs
 */
import {
  WORLD_LIGHTING_PROFILE,
  WORLD_ROUTE_BLUEPRINT,
} from '../src/render/worldPresentation.ts';

let passed = 0;
let failed = 0;

function ok(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`ok   ${name}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
}

function directionReversals(points) {
  const deltas = [];
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    if (Math.abs(dx) >= 0.32) deltas.push(Math.sign(dx));
  }
  let reversals = 0;
  for (let i = 1; i < deltas.length; i += 1) {
    if (deltas[i] !== deltas[i - 1]) reversals += 1;
  }
  return reversals;
}

const { path, terrainMasses, grassClusters, destination } = WORLD_ROUTE_BLUEPRINT;

ok('route has enough authored control points', path.centerline.length >= 8);
const reversals = directionReversals(path.centerline);
ok('route exposes at least three meaningful bends', reversals >= 3, `reversals=${reversals}`);
ok(
  'route begins on the preserved spawn corridor',
  Math.abs(path.centerline[0].x) <= 0.2 && path.centerline[0].z >= 9,
);
const routeEnd = path.centerline.at(-1);
ok(
  'route resolves into the destination threshold',
  Math.hypot(routeEnd.x - destination.x, routeEnd.z - destination.z) <= 0.75,
  `routeEnd=${JSON.stringify(routeEnd)} destination=${destination.x},${destination.z}`,
);

const depthBands = new Set(terrainMasses.map((mass) => mass.depthBand));
const vertexCounts = new Set(terrainMasses.map((mass) => mass.points.length));
const centroidKeys = new Set(
  terrainMasses.map((mass) => {
    const center = mass.points.reduce(
      (sum, point) => ({ x: sum.x + point.x / mass.points.length, z: sum.z + point.z / mass.points.length }),
      { x: 0, z: 0 },
    );
    return `${center.x.toFixed(1)},${center.z.toFixed(1)}`;
  }),
);
ok('terrain uses at least seven overlapping authored masses', terrainMasses.length >= 7);
ok('terrain spans near mid and far depth bands', ['near', 'mid', 'far'].every((band) => depthBands.has(band)));
ok('terrain polygon silhouettes vary', vertexCounts.size >= 4, `vertexCounts=${[...vertexCounts]}`);
ok('terrain masses do not share a concentric center', centroidKeys.size === terrainMasses.length);
ok(
  'terrain mass ids are unique',
  new Set(terrainMasses.map((mass) => mass.id)).size === terrainMasses.length,
);

const silhouetteKinds = new Set(grassClusters.flatMap((cluster) => cluster.silhouettes));
const leftClusters = grassClusters.filter((cluster) => cluster.x < 0).length;
const rightClusters = grassClusters.filter((cluster) => cluster.x > 0).length;
const ellipseSignatures = new Set(
  grassClusters.map((cluster) => `${cluster.radiusX.toFixed(2)}:${cluster.radiusZ.toFixed(2)}:${cluster.count}`),
);
ok('grass is authored as multiple clusters', grassClusters.length >= 8);
ok('grass uses at least four silhouettes', silhouetteKinds.size >= 4, `kinds=${[...silhouetteKinds]}`);
ok('grass cluster footprints vary', ellipseSignatures.size >= 6);
ok('grass cluster layout is asymmetric', leftClusters !== rightClusters, `left=${leftClusters} right=${rightClusters}`);
ok(
  'grass clusters remain in the preserved encounter zone',
  grassClusters.every(
    (cluster) =>
      Math.abs(cluster.x) <= 2.6 &&
      cluster.z >= -3.8 &&
      cluster.z <= 1.4 &&
      Math.abs(cluster.x) - cluster.radiusX >= path.safeHalfWidth - 0.05,
  ),
);

ok('destination opening is wide enough to read', destination.openingWidth >= 2.1);
ok('destination opening has vertical silhouette', destination.openingHeight >= 2.4);
ok('destination has a localized warm threshold', destination.thresholdLight === 'warm-local');
ok('far atmosphere is denser than near atmosphere', WORLD_LIGHTING_PROFILE.farFogDensity > WORLD_LIGHTING_PROFILE.nearFogDensity);
ok('world global emissive ceiling is low', WORLD_LIGHTING_PROFILE.globalEmissiveMax <= 0.02);
ok('warm light is explicitly localized', WORLD_LIGHTING_PROFILE.warmLightStrategy === 'localized-rim-bounce');
ok('shadow field remains cool', WORLD_LIGHTING_PROFILE.shadowField === 'cool');

console.log(`\nworld structure: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log('world structure gate green');
