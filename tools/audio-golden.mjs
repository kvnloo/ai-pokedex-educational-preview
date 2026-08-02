#!/usr/bin/env node
/**
 * Deterministic goldens for the original procedural soundscape.
 * Run: node --experimental-strip-types tools/audio-golden.mjs
 */
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const audio = await import(pathToFileURL(join(ROOT, 'src/audio/cuePlan.ts')).href);
const runtime = await import(pathToFileURL(join(ROOT, 'src/audio/soundscape.ts')).href);

let passed = 0;
let failed = 0;
function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`ok   ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
  }
}

const first = audio.buildCuePlan('catch-success', { seed: 73, intensity: 0.8 });
const replay = audio.buildCuePlan('catch-success', { seed: 73, intensity: 0.8 });
check(
  'cue plans replay exactly for the same seed',
  JSON.stringify(first) === JSON.stringify(replay),
  `${JSON.stringify(first)} != ${JSON.stringify(replay)}`,
);

const cues = [
  'starter-confirm',
  'step',
  'grass-rustle',
  'encounter',
  'battle-start',
  'move',
  'hit',
  'catch-throw',
  'catch-shake',
  'catch-success',
  'heal',
  'victory',
  'ui-confirm',
];
const plans = cues.map((cue, index) => audio.buildCuePlan(cue, { seed: 100 + index }));
check('every gameplay cue has scheduled events', plans.every((plan) => plan.events.length > 0));
check(
  'gameplay cues have distinct procedural signatures',
  new Set(plans.map((plan) => JSON.stringify(plan.events))).size === plans.length,
);
check(
  'organic impact cues include synthesized noise',
  ['grass-rustle', 'hit'].every((cue) =>
    audio.buildCuePlan(cue, { seed: 9 }).events.some((event) => event.kind === 'noise'),
  ),
);

const scenes = ['starter', 'explore', 'battle'];
const scenePlans = scenes.map((scene) => audio.buildScenePlan(scene, { seed: 41 }));
check('every scene has a layered ambient bed', scenePlans.every((plan) => plan.voices.length >= 2));
check(
  'scene beds remain distinct',
  new Set(scenePlans.map((plan) => JSON.stringify(plan.voices))).size === scenes.length,
);
check(
  'ambient plans replay exactly',
  JSON.stringify(audio.buildScenePlan('explore', { seed: 41 })) ===
    JSON.stringify(audio.buildScenePlan('explore', { seed: 41 })),
);

let factoryCalls = 0;
const lazySoundscape = runtime.createProceduralSoundscape({
  contextFactory: () => {
    factoryCalls += 1;
    throw new Error('factory should stay lazy');
  },
});
check('soundscape construction is autoplay-safe and lazy', factoryCalls === 0);
check('lazy soundscape reports an uninitialized context', lazySoundscape.snapshot().contextState === 'uninitialized');
lazySoundscape.dispose();
check('dispose before unlock does not create an AudioContext', factoryCalls === 0);

class FakeParam {
  constructor(value = 0) {
    this.value = value;
    this.events = [];
  }
  setValueAtTime(value, time) { this.value = value; this.events.push(['set', value, time]); }
  linearRampToValueAtTime(value, time) { this.value = value; this.events.push(['linear', value, time]); }
  exponentialRampToValueAtTime(value, time) { this.value = value; this.events.push(['exponential', value, time]); }
  setTargetAtTime(value, time, constant) { this.value = value; this.events.push(['target', value, time, constant]); }
  cancelScheduledValues(time) { this.events.push(['cancel', time]); }
}
class FakeNode {
  constructor() { this.connections = []; }
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.connections.length = 0; }
}
class FakeSource extends FakeNode {
  constructor() {
    super();
    this.frequency = new FakeParam(440);
    this.detune = new FakeParam(0);
    this.playbackRate = new FakeParam(1);
    this.type = 'sine';
    this.loop = false;
    this.onended = null;
    this.started = [];
    this.stopped = [];
  }
  start(time = 0) { this.started.push(time); }
  stop(time = 0) { this.stopped.push(time); }
}
class FakeContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 3;
    this.sampleRate = 48000;
    this.destination = new FakeNode();
    this.sources = [];
  }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
  createGain() { const node = new FakeNode(); node.gain = new FakeParam(1); return node; }
  createDynamicsCompressor() {
    const node = new FakeNode();
    node.threshold = new FakeParam(-24);
    node.knee = new FakeParam(30);
    node.ratio = new FakeParam(12);
    node.attack = new FakeParam(0.003);
    node.release = new FakeParam(0.25);
    return node;
  }
  createStereoPanner() { const node = new FakeNode(); node.pan = new FakeParam(0); return node; }
  createOscillator() { const node = new FakeSource(); this.sources.push(node); return node; }
  createBufferSource() { const node = new FakeSource(); this.sources.push(node); return node; }
  createBiquadFilter() {
    const node = new FakeNode();
    node.type = 'lowpass';
    node.frequency = new FakeParam(350);
    node.Q = new FakeParam(1);
    return node;
  }
  createBuffer(_channels, length) {
    const channels = [new Float32Array(length), new Float32Array(length)];
    return { getChannelData: (index) => channels[index] ?? channels[0] };
  }
}

const fakeContext = new FakeContext();
let realFactoryCalls = 0;
const soundscape = runtime.createProceduralSoundscape({
  seed: 90210,
  contextFactory: () => {
    realFactoryCalls += 1;
    return fakeContext;
  },
});
const resumed = await soundscape.resume();
check('resume lazily creates and unlocks one context', realFactoryCalls === 1 && resumed.contextState === 'running');
await soundscape.resume();
check('resume reuses the existing context', realFactoryCalls === 1);
const exploreAudio = await soundscape.setScene('explore');
check('scene starts a layered explore bed', exploreAudio.scene === 'explore' && exploreAudio.activeVoices >= 3);
const hitAudio = await soundscape.cue('hit', { intensity: 0.7, seed: 3 });
check('cue scheduling increments diagnostics', hitAudio.cueCount === 1);
soundscape.setMuted(true);
check('mute is reflected without disposing voices', soundscape.snapshot().muted === true);
soundscape.setMasterGain(0.4);
check('master gain clamps and reports', soundscape.snapshot().masterGain === 0.4);
soundscape.dispose();
check(
  'dispose closes the context and clears voices',
  fakeContext.state === 'closed' && soundscape.snapshot().disposed && soundscape.snapshot().activeVoices === 0,
);

console.log(`\naudio golden: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
