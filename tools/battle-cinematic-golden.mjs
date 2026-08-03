#!/usr/bin/env node
/**
 * Wave-7 authored battle-cinematic contract.
 *
 * This is deliberately fail-closed: the production timing model is imported
 * from the active renderer module, and every required visual phase must own a
 * non-zero, in-budget interval. Browser evidence separately proves that these
 * phases are actually rendered and remain clear of HUD safe zones.
 *
 * Run: node --experimental-strip-types tools/battle-cinematic-golden.mjs
 */
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cinematic = await import(
  pathToFileURL(join(ROOT, 'src/render/cinematicEffects.ts')).href
);

const {
  AUTHORED_ATTACK_TIMELINE,
  attackPhaseAt,
  attackPhaseProgress,
  createCinematicEffects,
  screenRectsOverlap,
} = cinematic;

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`ok   ${name}${detail ? ` — ${detail}` : ''}`);
    return;
  }
  failed += 1;
  console.error(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
}

function equal(name, actual, expected) {
  check(name, Object.is(actual, expected), `got=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}

check('production attack timeline is exported', Boolean(AUTHORED_ATTACK_TIMELINE));
check('attack phase resolver is exported', typeof attackPhaseAt === 'function');
check('attack progress resolver is exported', typeof attackPhaseProgress === 'function');
check('screen overlap predicate is exported', typeof screenRectsOverlap === 'function');

if (AUTHORED_ATTACK_TIMELINE && typeof attackPhaseAt === 'function') {
  const spec = AUTHORED_ATTACK_TIMELINE;
  check('anticipation is 100–140ms', spec.anticipationMs >= 100 && spec.anticipationMs <= 140, `${spec.anticipationMs}ms`);
  check('contact hit-stop is 50–70ms', spec.contactMs >= 50 && spec.contactMs <= 70, `${spec.contactMs}ms`);
  check('target recoil is 160–220ms', spec.recoilMs >= 160 && spec.recoilMs <= 220, `${spec.recoilMs}ms`);
  check('travel has a perceptible interval', spec.travelMs >= 80 && spec.travelMs <= 140, `${spec.travelMs}ms`);
  check('full action settles at 500–650ms', spec.totalMs >= 500 && spec.totalMs <= 650, `${spec.totalMs}ms`);
  equal(
    'timeline total is derived from every authored phase',
    spec.totalMs,
    spec.anticipationMs + spec.travelMs + spec.contactMs + spec.recoilMs + spec.settleMs,
  );

  const a = spec.anticipationMs;
  const t = a + spec.travelMs;
  const c = t + spec.contactMs;
  const r = c + spec.recoilMs;
  equal('phase at confirm is anticipation', attackPhaseAt(0), 'anticipation');
  equal('anticipation owns its last millisecond', attackPhaseAt(a - 1), 'anticipation');
  equal('travel starts on its declared boundary', attackPhaseAt(a), 'travel');
  equal('contact starts on its declared boundary', attackPhaseAt(t), 'contact');
  equal('recoil starts on its declared boundary', attackPhaseAt(c), 'recoil');
  equal('settle starts on its declared boundary', attackPhaseAt(r), 'settle');
  equal('timeline closes to idle', attackPhaseAt(spec.totalMs), 'idle');

  if (typeof attackPhaseProgress === 'function') {
    equal('phase progress starts at zero', attackPhaseProgress(0).progress, 0);
    equal('idle progress resolves complete', attackPhaseProgress(spec.totalMs).progress, 1);
    const midRecoil = c + spec.recoilMs / 2;
    const recoil = attackPhaseProgress(midRecoil);
    equal('mid-recoil identifies recoil', recoil.phase, 'recoil');
    check('mid-recoil progress is normalized', Math.abs(recoil.progress - 0.5) < 1e-9, JSON.stringify(recoil));
  }
}

if (typeof screenRectsOverlap === 'function') {
  const subject = { left: 100, top: 100, right: 200, bottom: 240 };
  check('separated HUD and subject are safe', !screenRectsOverlap(subject, { left: 220, top: 100, right: 320, bottom: 180 }, 8));
  check('HUD inside subject margin is unsafe', screenRectsOverlap(subject, { left: 205, top: 120, right: 260, bottom: 180 }, 8));
  check('true intersection is unsafe', screenRectsOverlap(subject, { left: 180, top: 180, right: 260, bottom: 260 }, 0));
}

// Runtime VFX contract: the travel phase must own a persistent origin→target
// shape, not merely a radial contact burst. A tiny canvas stub is sufficient
// because this test inspects scene wiring rather than browser pixels.
globalThis.document ??= {
  createElement() {
    const gradient = { addColorStop() {} };
    return {
      width: 0,
      height: 0,
      getContext() {
        return {
          fillStyle: '',
          createRadialGradient() { return gradient; },
          fillRect() {},
        };
      },
    };
  },
};
if (typeof createCinematicEffects === 'function') {
  const scene = new THREE.Scene();
  const fx = createCinematicEffects(scene, true);
  check('cinematic effect exposes directed origin-to-target trail', typeof fx.directedTrail === 'function');
  check('cinematic effect exposes deterministic trail clear', typeof fx.clearDirectedTrail === 'function');
  if (typeof fx.directedTrail === 'function' && typeof fx.clearDirectedTrail === 'function') {
    fx.directedTrail(new THREE.Vector3(1, 1, 1), new THREE.Vector3(-1, 2, -1), 0.5, 0xff8844);
    const ribbon = fx.root.getObjectByName('attack-direction-ribbon');
    const head = fx.root.getObjectByName('attack-direction-head');
    check('directed travel creates a visible ribbon', Boolean(ribbon?.visible));
    check('directed travel creates a visible leading head', Boolean(head?.visible));
    fx.clearDirectedTrail();
    check('trail clear hides persistent travel geometry', ribbon?.visible === false && head?.visible === false);
  }
}

const mainSource = readFileSync(join(ROOT, 'src/main.ts'), 'utf8');
const htmlSource = readFileSync(join(ROOT, 'index.html'), 'utf8');
check('active battle flow imports the authored timing model', mainSource.includes('AUTHORED_ATTACK_TIMELINE'));
check('active battle flow owns one authored attack runner', mainSource.includes('async function playAuthoredAttack'));
check('active runner drives the directional trail', mainSource.includes('cinematicFx.directedTrail('));
check('active runner publishes its real rendered phase', mainSource.includes('document.body.dataset.attackPhase = phase'));
check('read-only snapshot reports cinematic phase evidence', mainSource.includes('cinematic: {'));
check('action CSS hides explanatory battle chrome', htmlSource.includes('body[data-attack-phase]:not([data-attack-phase="idle"]) #battle-menu'));
check('action CSS reserves contact composition', htmlSource.includes('body[data-attack-phase="contact"] #battle-action-frame'));

console.log(`\nbattle-cinematic contract: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
