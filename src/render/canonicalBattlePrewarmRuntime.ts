import * as THREE from 'three';
import {
  verifyCanonicalRenderObject,
  type CanonicalRenderBinding,
} from '../creatures/canonicalObjectProvenance.ts';
import { CANONICAL_PRIVATE_SOURCE_SHA256 } from '../creatures/privateCanonical.ts';
import type { CanonicalBattlePrewarmEntry } from '../creatures/canonicalBattlePrewarm.ts';

export type CanonicalBattlePrewarmReceipt = {
  completed: true;
  keys: string[];
  meshCount: number;
  bindings: CanonicalRenderBinding[];
  renderer: 'THREE.WebGLRenderer';
  drawCalls: number;
  nonClearPixels: number;
  completionBoundary: 'gl.finish+readPixels-observed-not-independent-gpu-attestation';
  compileMs: number;
  drawSubmitMs: number;
  gpuObservedMs: number;
  totalMs: number;
};

type CanonicalBattlePrewarmOptions = {
  plan: readonly CanonicalBattlePrewarmEntry[];
  renderer: THREE.WebGLRenderer;
  makeMesh(speciesId: string, scale: number): THREE.Object3D;
  curtainOpaque(): boolean;
};

export async function executeCanonicalBattlePrewarm(
  options: CanonicalBattlePrewarmOptions,
): Promise<CanonicalBattlePrewarmReceipt> {
  if (!(options.renderer instanceof THREE.WebGLRenderer)) {
    throw new Error('Canonical prewarm production authority requires THREE.WebGLRenderer');
  }
  if (!options.curtainOpaque()) {
    throw new Error('Canonical battle prewarm requires an opaque boot curtain');
  }
  if (options.plan.length === 0) throw new Error('Canonical battle prewarm plan is empty');

  const started = performance.now();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010101);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x303030, 3));
  const camera = new THREE.OrthographicCamera(-4, 4, 2, -2, 0.1, 20);
  camera.position.set(0, 1, 6);
  camera.lookAt(0, 0.6, 0);
  camera.updateMatrixWorld(true);
  const root = new THREE.Group();
  root.name = 'canonical-battle-prewarm';
  const bindings: CanonicalRenderBinding[] = [];
  const meshes: Array<{ mesh: THREE.Object3D; entry: CanonicalBattlePrewarmEntry; sourceSha256: string }> = [];
  for (const [index, entry] of options.plan.entries()) {
    const exactKey = `${entry.speciesId}@${entry.scale.toFixed(3)}`;
    if (entry.key !== exactKey) {
      throw new Error(`exact prewarm key mismatch: expected ${exactKey}, received ${entry.key}`);
    }
    const sourceSha256 = CANONICAL_PRIVATE_SOURCE_SHA256[entry.speciesId];
    if (!sourceSha256) throw new Error(`Canonical source SHA unavailable for ${entry.speciesId}`);
    const mesh = options.makeMesh(entry.speciesId, entry.scale);
    mesh.position.x += (index - (options.plan.length - 1) / 2) * 1.15;
    mesh.userData.prewarmKey = entry.key;
    root.add(mesh);
    meshes.push({ mesh, entry, sourceSha256 });
  }
  scene.add(root);
  scene.updateMatrixWorld(true);
  for (const { mesh, entry, sourceSha256 } of meshes) {
    bindings.push(await verifyCanonicalRenderObject(mesh, { speciesId: entry.speciesId, sourceSha256, scale: entry.scale }));
  }

  const renderer = options.renderer;
  const target = new THREE.WebGLRenderTarget(128, 64, {
    depthBuffer: true,
    stencilBuffer: false,
    colorSpace: THREE.SRGBColorSpace,
  });
  const previousTarget = renderer.getRenderTarget();
  const context = renderer.getContext();
  try {
    for (const { mesh, entry, sourceSha256 } of meshes) {
      await verifyCanonicalRenderObject(mesh, { speciesId: entry.speciesId, sourceSha256, scale: entry.scale });
    }
    const programsBefore = renderer.info.programs?.length ?? 0;
    const compileStarted = performance.now();
    if (context.getExtension('KHR_parallel_shader_compile')) {
      await renderer.compileAsync(scene, camera);
    } else {
      renderer.compile(scene, camera);
    }
    const compileEnded = performance.now();
    const programsAfter = renderer.info.programs?.length ?? 0;
    if (programsAfter <= programsBefore) {
      throw new Error('Canonical compile produced no observable WebGL program');
    }
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, true);
    scene.updateMatrixWorld(true);
    for (const { mesh, entry, sourceSha256 } of meshes) {
      await verifyCanonicalRenderObject(mesh, { speciesId: entry.speciesId, sourceSha256, scale: entry.scale });
    }
    const callsBefore = renderer.info.render.calls;
    renderer.render(scene, camera);
    const drawEnded = performance.now();
    const drawCalls = renderer.info.render.calls - callsBefore;
    if (drawCalls <= 0) throw new Error('Canonical hidden draw produced no renderer draw call');

    context.finish();
    const pixels = new Uint8Array(target.width * target.height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, pixels);
    const gpuEnded = performance.now();
    let nonClearPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] !== 0 || pixels[index + 1] !== 0 || pixels[index + 2] !== 0 || pixels[index + 3] !== 0) {
        nonClearPixels += 1;
      }
    }
    if (nonClearPixels === 0) throw new Error('Canonical hidden draw produced no observable framebuffer pixels');
    if (context.getError() !== context.NO_ERROR) throw new Error('Canonical hidden draw ended with a WebGL error');
    for (const { mesh, entry, sourceSha256 } of meshes) {
      await verifyCanonicalRenderObject(mesh, { speciesId: entry.speciesId, sourceSha256, scale: entry.scale });
    }
    if (!options.curtainOpaque()) {
      throw new Error('Canonical battle prewarm boot curtain released before observed draw completion');
    }
    return {
      completed: true,
      keys: options.plan.map((entry) => entry.key),
      meshCount: root.children.length,
      bindings,
      renderer: 'THREE.WebGLRenderer',
      drawCalls,
      nonClearPixels,
      completionBoundary: 'gl.finish+readPixels-observed-not-independent-gpu-attestation',
      compileMs: compileEnded - compileStarted,
      drawSubmitMs: drawEnded - compileEnded,
      gpuObservedMs: gpuEnded - drawEnded,
      totalMs: gpuEnded - started,
    };
  } finally {
    renderer.setRenderTarget(previousTarget);
    target.dispose();
  }
}
