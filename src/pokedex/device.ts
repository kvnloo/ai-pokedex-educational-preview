import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PokedexRuntime, type DeviceState } from './deviceRuntime';
import reviewCandidates from '../../canonical/devices/generations/review-candidates.json';
import './device.css';

function required<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error('Missing device control: ' + selector);
  return element;
}
const viewport = required<HTMLDivElement>('#viewport');
const status = required<HTMLSpanElement>('#device-status');
const toggle = required<HTMLButtonElement>('#toggle-lid');
const press = required<HTMLButtonElement>('#press-button');
const lod = required<HTMLSelectElement>('#lod');
const displayMode = required<HTMLSelectElement>('#display-mode');
const cameraView = required<HTMLSelectElement>('#camera-view');
const errorPanel = required<HTMLDivElement>('#load-error');
const requestedCandidate = new URLSearchParams(location.search).get('candidate');
const candidate = import.meta.env.DEV ? reviewCandidates.find(item => item.id === requestedCandidate) : undefined;
if (import.meta.env.DEV) {
  const selector = required<HTMLSelectElement>('#candidate-selector');
  required('#candidate-control').hidden = false;
  for (const item of reviewCandidates) selector.add(new Option(item.title, item.id));
  selector.value = candidate?.id ?? '';
  selector.onchange = () => {
    const url = new URL(location.href);
    if (selector.value) url.searchParams.set('candidate', selector.value);
    else url.searchParams.delete('candidate');
    location.assign(url);
  };
}
if (candidate) {
  document.title = 'Pokédex · ' + candidate.title;
  required('.unit').textContent = candidate.title + ' · REVIEW';
  required('#candidate-notice').hidden = false;
  required('#candidate-notice').textContent = candidate.status;
  required<HTMLAnchorElement>('#render-video').href = candidate.video;
  const comparison = required<HTMLAnchorElement>('#reference-comparison');
  comparison.hidden = false; comparison.href = candidate.comparison;
  lod.replaceChildren(...candidate.exports.map(item => new Option(`${item.label} · ${item.triangles.toLocaleString()} triangles`, String(item.level))));
}
const scene = new THREE.Scene();
scene.background = new THREE.Color('#101419');
scene.fog = new THREE.Fog('#101419', .8, 3);
const camera = new THREE.PerspectiveCamera(42, 1, .001, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.toneMapping = THREE.AgXToneMapping;
renderer.toneMappingExposure = .9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.append(renderer.domElement);
const environment = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
const environmentTarget = environment.fromScene(room, .04);
scene.environment = environmentTarget.texture;
scene.environmentIntensity = .15;
room.dispose();
environment.dispose();
scene.add(new THREE.HemisphereLight(0xb7dbed, 0x332a30, .12));
const key = new THREE.DirectionalLight(0xe4f1ff, 1.5);
key.position.set(-.3, .5, .25);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -.3, right: .3, top: .3, bottom: -.3, near: .001, far: 2 });
key.shadow.bias = -.00001;
key.shadow.normalBias = .00015;
scene.add(key);
const rim = new THREE.DirectionalLight(0xffc5a4, 1.0);
rim.position.set(.3, .25, -.25);
scene.add(rim);
if (candidate) {
  key.position.set(-.3, .5, -.25);
  key.intensity = .8;
  rim.intensity = .5;
  scene.environmentIntensity = .3;
  Object.assign(key.shadow.camera, { left: -.18, right: .18, top: .18, bottom: -.18, far: 1 });
  key.shadow.camera.updateProjectionMatrix();
}
const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: '#171d23', roughness: .8 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -.0013;
floor.receiveShadow = true;
scene.add(floor);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
controls.dampingFactor = .075;
controls.enablePan = false;
controls.minDistance = .19;
controls.maxDistance = 1.2;
controls.maxPolarAngle = Math.PI;
let candidateBounds: THREE.Box3 | null = null;

function framedDistance(bounds: THREE.Box3, direction: THREE.Vector3, aspect: number): number {
  const center = bounds.getCenter(new THREE.Vector3());
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * .84;
  let distance = .1;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(center);
        distance = Math.max(distance, point.dot(direction) + Math.max(Math.abs(point.dot(right)) / (vertical * aspect), Math.abs(point.dot(up)) / vertical));
      }
    }
  }
  return distance;
}

function setCamera(view = 'hero'): void {
  if (candidateBounds) {
    const sphere = candidateBounds.getBoundingSphere(new THREE.Sphere());
    const direction = view === 'front' ? new THREE.Vector3(0, .16, .50)
      : view === 'side' ? new THREE.Vector3(.52, .04, 0)
      : view === 'underside' ? new THREE.Vector3(.26, -.44, .45)
      : new THREE.Vector3(.36, .31, .48);
    direction.normalize();
    const distance = framedDistance(candidateBounds, direction, camera.aspect);
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(direction, distance);
    controls.minDistance = .09; controls.maxDistance = distance * 2;
    controls.update(); return;
  }
  controls.target.set(0, .095, .045);
  if (view === 'front') camera.position.set(0, .20, .54);
  else if (view === 'side') camera.position.set(.52, .14, .065);
  else if (view === 'underside') { camera.position.set(.26, -.44, .45); controls.target.set(0, .035, .04); }
  else camera.position.set(.36, .385, .48);
  controls.update();
}
setCamera();

const liveCanvas = document.createElement('canvas');
liveCanvas.width = 640;
liveCanvas.height = 864;
const liveTexture = new THREE.CanvasTexture(liveCanvas);
liveTexture.colorSpace = THREE.SRGBColorSpace;
liveTexture.flipY = false;
let confirmations = 0;
function drawDisplay(): void {
  const context = liveCanvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#071c23'; context.fillRect(0, 0, 640, 864);
  context.strokeStyle = '#28545b'; context.lineWidth = 2; context.strokeRect(28, 28, 584, 808);
  context.fillStyle = '#8df6e8'; context.font = '600 26px system-ui'; context.fillText('POKÉDEX', 62, 90);
  context.font = '20px system-ui'; context.fillStyle = '#89afb8'; context.fillText((candidate?.title ?? 'PD-01') + '  /  LOCAL SESSION', 62, 131);
  context.strokeStyle = '#6fe4d7'; context.lineWidth = 5; context.beginPath(); context.arc(320, 294, 76, 0, Math.PI * 2); context.stroke();
  context.fillStyle = '#8df6e8'; context.beginPath(); context.arc(320, 294, 17, 0, Math.PI * 2); context.fill();
  context.textAlign = 'center'; context.font = '600 44px system-ui'; context.fillText('Field unit ready', 320, 445);
  context.fillStyle = '#b0c8ce'; context.font = '26px system-ui'; context.fillText('Your next discovery awaits.', 320, 492);
  context.fillStyle = '#18363e'; context.fillRect(62, 552, 516, 124);
  context.fillStyle = '#92b5bf'; context.font = '20px system-ui'; context.fillText('CONFIRMATIONS THIS SESSION', 320, 593);
  context.fillStyle = '#bdfbed'; context.font = '600 40px system-ui'; context.fillText(String(confirmations).padStart(2, '0'), 320, 646);
  context.font = '22px system-ui'; context.fillStyle = '#89afb8'; context.fillText('Press A to confirm', 320, 735);
  context.font = '18px system-ui'; context.fillText(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 320, 791);
  context.textAlign = 'start'; liveTexture.needsUpdate = true;
}
drawDisplay();

let runtime: PokedexRuntime | null = null;
let request = 0;
let loading = true;
let previousState: DeviceState | null = null;
let modelTriangles = 0;
let modelMeshes = 0;
const labels: Record<DeviceState, string> = {
  closed: 'Ready to explore', opening: 'Opening the field unit', booting: 'Initializing the Pokédex',
  ready: 'Pokédex ready', idle: 'Standing by', pressing: 'A · Confirmed', closing: 'Closing the field unit',
};
function updateControls(): void {
  toggle.disabled = loading || !runtime || !(runtime.canOpen || runtime.canClose);
  press.disabled = loading || !runtime?.canPress;
  if (runtime && !loading) {
    status.textContent = labels[runtime.state];
    toggle.innerHTML = (runtime.canOpen ? 'Open Pokédex' : runtime.state === 'closing' ? 'Closing…' : 'Close Pokédex') + '<span>↗</span>';
    document.body.dataset.deviceState = runtime.state;
  }
}
function disposeAsset(root: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  for (const material of materials) {
    for (const value of Object.values(material)) if (value instanceof THREE.Texture && value !== liveTexture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
}
async function loadModel(): Promise<void> {
  const revision = ++request;
  loading = true; status.textContent = 'Loading field unit…'; errorPanel.hidden = true; updateControls();
  const level = lod.value === '1' ? 1 : lod.value === '2' ? 2 : 0;
  try {
    if (import.meta.env.DEV && requestedCandidate && !candidate) throw new Error('Unknown Pokédex review candidate');
    const url = import.meta.env.DEV && candidate ? `${import.meta.env.BASE_URL}device-review-assets/${candidate.id}/${level}.glb`
      : `${import.meta.env.BASE_URL}device-assets/pokedex-v001-lod${level}.glb`;
    const gltf = await new GLTFLoader().loadAsync(url);
    if (revision !== request) { disposeAsset(gltf.scene); return; }
    let next: PokedexRuntime;
    try { next = new PokedexRuntime(gltf.scene, gltf.animations, candidate?.readyContentSource); }
    catch (error) { disposeAsset(gltf.scene); throw error; }
    if (runtime) {
      next.restorePlayback(runtime.capturePlayback());
      scene.remove(runtime.root); runtime.dispose(); disposeAsset(runtime.root);
    }
    runtime = next; scene.add(runtime.root); modelTriangles = 0; modelMeshes = 0;
    if (candidate && !candidateBounds) {
      const playback = runtime.capturePlayback();
      runtime.restorePlayback({ state: 'closed', seconds: 0 });
      runtime.root.updateMatrixWorld(true);
      candidateBounds = new THREE.Box3().setFromObject(runtime.root);
      runtime.restorePlayback({ state: 'idle', seconds: 0 });
      runtime.root.updateMatrixWorld(true);
      candidateBounds.union(new THREE.Box3().setFromObject(runtime.root));
      runtime.restorePlayback(playback);
      floor.position.y = candidateBounds.min.y - .001;
      setCamera(cameraView.value);
    }
    runtime.root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = object.receiveShadow = true;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        // Use a thin reflective cover in this viewer; screen-space refraction blurs the UI.
        // The frozen GLB and Cycles hero retain their authored optical transmission.
        if (material instanceof THREE.MeshPhysicalMaterial && material.transmission > 0) {
          material.transmission = 0; material.transparent = true; material.opacity = .13;
          material.depthWrite = false; material.side = THREE.FrontSide; material.needsUpdate = true;
        }
      }
      modelMeshes++;
      modelTriangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
    });
    runtime.setDisplay(displayMode.value === 'live' ? liveTexture : null);
    required('#asset-metrics').textContent = `${modelTriangles.toLocaleString()} triangles · ${modelMeshes} runtime meshes · ${gltf.animations.length} clips`;
    loading = false; previousState = null; updateControls();
  } catch (error) {
    if (revision !== request) return;
    loading = false; status.textContent = 'Field unit unavailable'; errorPanel.hidden = false;
    required('#error-message').textContent = error instanceof Error ? error.message : 'The device could not be loaded.';
    toggle.disabled = press.disabled = true;
  }
}
function confirm(): void {
  if (!runtime?.canPress || loading) return;
  runtime.press(); confirmations++; drawDisplay(); navigator.vibrate?.(12);
  window.dispatchEvent(new CustomEvent('pokedex:confirm', { detail: { confirmations } }));
}
toggle.addEventListener('click', () => { if (runtime?.canOpen) runtime.open(); else runtime?.close(); });
press.addEventListener('click', confirm);
lod.addEventListener('change', () => void loadModel());
displayMode.addEventListener('change', () => { drawDisplay(); runtime?.setDisplay(displayMode.value === 'live' ? liveTexture : null); });
cameraView.addEventListener('change', () => setCamera(cameraView.value));
required('#reset-view').addEventListener('click', () => { cameraView.value = 'hero'; setCamera(); });
required('#retry').addEventListener('click', () => void loadModel());
renderer.domElement.addEventListener('dblclick', () => { cameraView.value = 'hero'; setCamera(); });
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down: { x: number; y: number; id: number } | null = null;
const activePointers = new Set<number>();
renderer.domElement.addEventListener('pointerdown', event => {
  activePointers.add(event.pointerId);
  down = activePointers.size === 1 && event.button === 0 ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null;
});
renderer.domElement.addEventListener('pointermove', event => {
  if (down?.id === event.pointerId && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) down = null;
});
renderer.domElement.addEventListener('pointercancel', event => { activePointers.delete(event.pointerId); down = null; });
renderer.domElement.addEventListener('pointerup', event => {
  activePointers.delete(event.pointerId);
  if (!down || down.id !== event.pointerId || activePointers.size || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6 || !runtime || loading) { down = null; return; }
  down = null;
  const box = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
  ray.setFromCamera(pointer, camera);
  const hit = ray.intersectObject(runtime.root, true)[0];
  if (!hit) return;
  if (runtime.canOpen) { runtime.open(); return; }
  let object: THREE.Object3D | null = hit.object;
  while (object) { if (object.userData.source_name === (candidate?.buttonSource ?? 'PDX.Button.A')) { confirm(); break; } object = object.parent; }
});
function resize(): void {
  const aspect = viewport.clientWidth / viewport.clientHeight;
  if (candidateBounds) {
    const direction = camera.position.clone().sub(controls.target).normalize();
    const previousFit = framedDistance(candidateBounds, direction, camera.aspect);
    const nextFit = framedDistance(candidateBounds, direction, aspect);
    const distance = camera.position.distanceTo(controls.target) * nextFit / previousFit;
    camera.position.copy(controls.target).addScaledVector(direction, distance);
    controls.maxDistance = nextFit * 2;
  }
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
}
const observer = new ResizeObserver(resize); observer.observe(viewport);
const footer = required<HTMLElement>('.device-footer');
const footerObserver = new ResizeObserver(() => { viewport.style.setProperty('--footer-height', Math.max(110, footer.clientHeight - 20) + 'px'); });
footerObserver.observe(footer);
let last = performance.now();
renderer.setAnimationLoop(now => {
  const delta = Math.min((now - last) / 1000, .05); last = now;
  if (document.hidden) return;
  runtime?.update(delta); controls.update();
  floor.visible = camera.position.y > .008;
  if (runtime?.state !== previousState && runtime && !loading) { previousState = runtime.state; updateControls(); }
  renderer.render(scene, camera);
});
if (import.meta.env.DEV) {
  Object.assign(window, { __pokedexDevice: {
    snapshot: () => ({ state: runtime?.state, loading, lod: lod.value, candidate: candidate?.id ?? 'v001', triangles: modelTriangles, meshes: modelMeshes, drawCalls: renderer.info.render.calls, confirmations, camera: camera.position.toArray(), display: displayMode.value }),
    targets: () => {
      if (!runtime) return null;
      runtime.root.updateMatrixWorld(true);
      const box = renderer.domElement.getBoundingClientRect();
      const project = (point: THREE.Vector3) => {
        point.project(camera);
        return { x: box.x + (point.x + 1) * box.width / 2, y: box.y + (1 - point.y) * box.height / 2 };
      };
      let button: THREE.Object3D | undefined;
      runtime.root.traverse(object => { if (object.userData.source_name === (candidate?.buttonSource ?? 'PDX.Button.A')) button = object; });
      const bounds = new THREE.Box3().setFromObject(runtime.root);
      const corners = [];
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) corners.push(project(new THREE.Vector3(x, y, z)));
        }
      }
      return {
        body: project(bounds.getCenter(new THREE.Vector3())),
        corners,
        viewport: { x: box.x, y: box.y, width: box.width, height: box.height },
        direction: camera.position.clone().sub(controls.target).normalize().toArray(),
        button: button ? project(new THREE.Box3().setFromObject(button).getCenter(new THREE.Vector3())) : null,
        buttonLocal: button?.position.toArray(),
        playback: runtime.capturePlayback(),
      };
    },
  } });
}
if (import.meta.hot) import.meta.hot.dispose(() => {
  request++; renderer.setAnimationLoop(null); observer.disconnect(); footerObserver.disconnect(); controls.dispose();
  if (runtime) { runtime.dispose(); disposeAsset(runtime.root); }
  liveTexture.dispose(); environmentTarget.dispose(); floor.geometry.dispose(); floor.material.dispose(); renderer.dispose();
});
void loadModel();
