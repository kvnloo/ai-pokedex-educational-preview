import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PokedexRuntime, type DeviceState } from './deviceRuntime';

declare const __POKEDEX_OPENING_ASSET__: {
  filename: string;
  readyContentSource: string;
};

export async function createEntryScene(viewport: HTMLElement, signal: AbortSignal, onPhase: (phase: DeviceState) => void) {
  const response = await fetch(`${import.meta.env.BASE_URL}field-os-assets/${__POKEDEX_OPENING_ASSET__.filename}`, { signal });
  if (!response.ok) throw new Error('Opening asset unavailable');
  const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  gltf.scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  const releaseModel = () => {
    gltf.scene.traverse(object => { if (object instanceof THREE.Mesh) object.geometry.dispose(); });
    materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
  };
  if (signal.aborted) { releaseModel(); throw new DOMException('Opening cancelled', 'AbortError'); }
  let runtime: PokedexRuntime;
  let renderer: THREE.WebGLRenderer;
  try {
    runtime = new PokedexRuntime(gltf.scene, gltf.animations, __POKEDEX_OPENING_ASSET__.readyContentSource);
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  } catch (error) { releaseModel(); throw error; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.AgXToneMapping;
  const world = new THREE.Scene(); world.background = new THREE.Color('#101419');
  world.add(gltf.scene, new THREE.HemisphereLight(0xe0f5ff, 0x553330, 1.3));
  const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(-.3, .5, .4); world.add(light);
  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(); const target = environment.fromScene(room, .04);
  world.environment = target.texture; world.environmentIntensity = .35;
  room.dispose(); environment.dispose();
  const camera = new THREE.PerspectiveCamera(40, 1, .001, 10);
  runtime.restorePlayback({ state: 'idle', seconds: 0 }); runtime.root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(runtime.root);
  runtime.restorePlayback({ state: 'closed', seconds: 0 }); runtime.root.updateMatrixWorld(true);
  bounds.union(new THREE.Box3().setFromObject(runtime.root));
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const resize = () => {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    const halfAngle = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect));
    camera.position.copy(sphere.center).addScaledVector(new THREE.Vector3(.25, .2, .5).normalize(), sphere.radius / Math.sin(halfAngle) * 1.1);
    camera.lookAt(sphere.center); camera.updateProjectionMatrix();
    renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  };
  viewport.append(renderer.domElement); const observer = new ResizeObserver(resize); observer.observe(viewport); resize();
  let disposed = false, last = performance.now(), previous: DeviceState | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); runtime.dispose();
    releaseModel(); target.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
  renderer.setAnimationLoop(now => {
    const delta = Math.min((now - last) / 1000, .05); last = now;
    if (document.hidden || disposed) return;
    runtime.update(delta);
    if (previous !== runtime.state) { previous = runtime.state; onPhase(runtime.state); }
    if (!disposed) renderer.render(world, camera);
  });
  return { open: () => runtime.open(), dispose };
}
