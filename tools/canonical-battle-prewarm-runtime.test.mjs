#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { executeCanonicalBattlePrewarm } from '../src/render/canonicalBattlePrewarmRuntime.ts';

const plan = [{ speciesId: 'bulbasaur', scale: 0.9, key: 'bulbasaur@0.900' }];

test('substitutable renderer wrappers cannot hold production completion authority', async () => {
  const wrapper = {
    compileAsync: async () => {},
    render: () => {},
    getContext: () => ({ finish() {} }),
  };
  await assert.rejects(() => executeCanonicalBattlePrewarm({
    plan,
    renderer: wrapper,
    makeMesh() { throw new Error('must not reach mesh construction'); },
    curtainOpaque: () => true,
  }), /requires THREE.WebGLRenderer/);
});

test('production authority directly observes compile programs, draw calls, finish, and framebuffer pixels', () => {
  const source = readFileSync(new URL('../src/render/canonicalBattlePrewarmRuntime.ts', import.meta.url), 'utf8');
  assert.match(source, /options\.renderer instanceof THREE\.WebGLRenderer/);
  assert.match(source, /context\.getExtension\('KHR_parallel_shader_compile'\)/);
  assert.match(source, /await renderer\.compileAsync\(scene, camera\)/);
  assert.match(source, /renderer\.compile\(scene, camera\)/);
  assert.match(source, /renderer\.info\.programs/);
  assert.match(source, /renderer\.info\.render\.calls/);
  assert.match(source, /context\.finish\(\)/);
  assert.match(source, /renderer\.readRenderTargetPixels/);
  assert.doesNotMatch(source, /waitForGpu/);
  assert.doesNotMatch(source, /type PrewarmRenderer/);
});

test('receipt truthfully limits WebGL completion claim to an observed boundary', () => {
  const source = readFileSync(new URL('../src/render/canonicalBattlePrewarmRuntime.ts', import.meta.url), 'utf8');
  assert.match(source, /observed-not-independent-gpu-attestation/);
  assert.doesNotMatch(source, /gpuCompleteMs/);
});
