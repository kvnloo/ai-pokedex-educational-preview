import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PokedexRuntime } from './deviceRuntime';

type MeshConfig = {
  id: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    lensMm: number;
    sensorMm: number;
    frameMargin: number;
  };
  displayInset: number;
  readyContentSource: string;
  buttonSource: string;
};

declare const __POKEDEX_PHONE_MESH__: MeshConfig;

type MeshSnapshot = {
  candidate: string;
  sourceName: string;
  triangles: number;
  meshes: number;
  aperture: { x: number; y: number; width: number; height: number };
  control: { x: number; y: number };
};

declare global {
  interface Window {
    __pokedexMesh?: { snapshot: () => MeshSnapshot | null };
  }
}

function element<T extends Element>(selector: string, type: { new(): T }): T {
  const result = document.querySelector(selector);
  if (!(result instanceof type)) throw new Error(`Missing mesh-first Pokédex element: ${selector}`);
  return result;
}

function modelUrl(candidate: MeshConfig): string {
  return import.meta.env.DEV
    ? `${import.meta.env.BASE_URL}device-review-assets/${candidate.id}/0.glb`
    : `${import.meta.env.BASE_URL}pokedex-shell/${candidate.id}.glb`;
}

function fitDistance(bounds: THREE.Box3, target: THREE.Vector3, direction: THREE.Vector3, fov: number, aspect: number): number {
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const vertical = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * __POKEDEX_PHONE_MESH__.camera.frameMargin;
  let distance = 0.1;
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(target);
        distance = Math.max(distance, point.dot(direction) + Math.max(
          Math.abs(point.dot(right)) / (vertical * aspect),
          Math.abs(point.dot(up)) / vertical,
        ));
      }
    }
  }
  return distance;
}

export async function mountPokedexShell(): Promise<void> {
  const stage = element('#pokedex-runtime', HTMLElement);
  const canvas = element('#pokedex-shell', HTMLCanvasElement);
  const aperture = element('#display-aperture', HTMLElement);
  const error = element('#mesh-load-error', HTMLElement);
  const candidate = __POKEDEX_PHONE_MESH__;
  document.documentElement.dataset.meshState = 'loading';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#030405');
  const cameraConfig = candidate.camera;
  const fov = THREE.MathUtils.radToDeg(2 * Math.atan(cameraConfig.sensorMm / (2 * cameraConfig.lensMm)));
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.001, 10);
  // glTF converts Blender's Z-up coordinates to Y-up. The reviewed camera
  // metadata is already converted, so the runtime camera must use Y-up too.
  camera.up.set(0, 1, 0);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const environment = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environmentTarget = environment.fromScene(room, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.3;
  room.dispose();
  environment.dispose();
  scene.add(new THREE.HemisphereLight(0xb7dbed, 0x271116, 0.25));
  const key = new THREE.DirectionalLight(0xf2f6ff, 2.6);
  key.position.set(-0.3, -0.45, 0.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a45, 1.4);
  rim.position.set(0.35, 0.2, 0.3);
  scene.add(rim);

  let runtime: PokedexRuntime | null = null;
  let display: THREE.Mesh | null = null;
  let control: THREE.Object3D | null = null;
  let bounds: THREE.Box3 | null = null;
  let triangles = 0;
  let meshes = 0;
  const blackCanvas = document.createElement('canvas');
  blackCanvas.width = blackCanvas.height = 2;
  const blackTexture = new THREE.CanvasTexture(blackCanvas);
  blackTexture.colorSpace = THREE.SRGBColorSpace;

  function projectAperture(): void {
    if (!display) return;
    display.geometry.computeBoundingBox();
    const local = display.geometry.boundingBox;
    if (!local) return;
    display.updateWorldMatrix(true, false);
    const insetX = (local.max.x - local.min.x) * candidate.displayInset;
    const insetZ = (local.max.z - local.min.z) * candidate.displayInset;
    const frontY = local.min.y - 0.00005;
    const localCorners = [
      new THREE.Vector3(local.min.x + insetX, frontY, local.max.z - insetZ),
      new THREE.Vector3(local.max.x - insetX, frontY, local.max.z - insetZ),
      new THREE.Vector3(local.max.x - insetX, frontY, local.min.z + insetZ),
      new THREE.Vector3(local.min.x + insetX, frontY, local.min.z + insetZ),
    ];
    const box = canvas.getBoundingClientRect();
    const points = localCorners.map(point => {
      display?.localToWorld(point);
      point.project(camera);
      return { x: (point.x + 1) * box.width / 2, y: (1 - point.y) * box.height / 2 };
    });
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const width = maxX - minX;
    const height = maxY - minY;
    aperture.style.left = `${minX}px`;
    aperture.style.top = `${minY}px`;
    aperture.style.width = `${width}px`;
    aperture.style.height = `${height}px`;
    aperture.style.clipPath = `polygon(${points.map(point => `${(point.x - minX) / width * 100}% ${(point.y - minY) / height * 100}%`).join(',')})`;
    aperture.style.setProperty('--aperture-width', `${width}px`);
  }

  function resize(): void {
    if (!bounds) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    camera.aspect = width / height;
    const referencePosition = new THREE.Vector3(...cameraConfig.position);
    const target = new THREE.Vector3(...cameraConfig.target);
    const direction = referencePosition.sub(target).normalize();
    const distance = fitDistance(bounds, target, direction, camera.fov, camera.aspect);
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    runtime?.root.updateMatrixWorld(true);
    renderer.render(scene, camera);
    projectAperture();
  }

  try {
    const gltf = await new GLTFLoader().loadAsync(modelUrl(candidate));
    runtime = new PokedexRuntime(gltf.scene, gltf.animations, candidate.readyContentSource);
    runtime.restorePlayback({ state: 'idle', seconds: 0 });
    runtime.setDisplay(blackTexture);
    runtime.update(0);
    runtime.root.traverse(object => {
      if (object.userData.source_name === candidate.buttonSource) control = object;
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = object.receiveShadow = true;
      meshes++;
      triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
      if (object.userData.replaceable_display === true) display = object;
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof THREE.MeshPhysicalMaterial && material.transmission > 0) {
          material.transmission = 0;
          material.transparent = true;
          material.opacity = 0.12;
          material.depthWrite = false;
          material.needsUpdate = true;
        }
      }
    });
    if (!display || !control) throw new Error('Selected Pokédex mesh is missing its display or physical control');
    bounds = new THREE.Box3().setFromObject(runtime.root);
    scene.add(runtime.root);
    resize();
    renderer.setAnimationLoop(() => {
      if (document.hidden || !runtime) return;
      runtime.update(0);
      renderer.render(scene, camera);
    });
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down: { x: number; y: number; id: number } | null = null;
    canvas.addEventListener('pointerdown', event => { down = { x: event.clientX, y: event.clientY, id: event.pointerId }; });
    canvas.addEventListener('pointercancel', () => { down = null; });
    canvas.addEventListener('pointerup', event => {
      if (!down || down.id !== event.pointerId || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7 || !runtime) { down = null; return; }
      down = null;
      const box = canvas.getBoundingClientRect();
      pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(runtime.root, true)[0];
      let object: THREE.Object3D | null = hit?.object ?? null;
      while (object) {
        if (object.userData.source_name === candidate.buttonSource) {
          runtime.press();
          window.dispatchEvent(new Event('pokedex-shell:confirm'));
          navigator.vibrate?.(12);
          break;
        }
        object = object.parent;
      }
    });
    canvas.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && runtime) {
        event.preventDefault();
        runtime.press();
        window.dispatchEvent(new Event('pokedex-shell:confirm'));
      }
    });

    window.__pokedexMesh = { snapshot: () => {
      if (!display || !control) return null;
      const box = aperture.getBoundingClientRect();
      const viewport = canvas.getBoundingClientRect();
      const sourceName = display.userData.source_name;
      const controlCenter = new THREE.Box3().setFromObject(control).getCenter(new THREE.Vector3()).project(camera);
      return typeof sourceName === 'string' ? {
        candidate: candidate.id,
        sourceName,
        triangles,
        meshes,
        aperture: box.toJSON(),
        control: {
          x: (controlCenter.x + 1) * viewport.width / 2 + viewport.left,
          y: (1 - controlCenter.y) * viewport.height / 2 + viewport.top,
        },
      } : null;
    } };
    document.documentElement.dataset.meshCandidate = candidate.id;
    document.documentElement.dataset.meshState = 'ready';
  } catch (loadError) {
    console.error(loadError);
    error.hidden = false;
    aperture.hidden = true;
    document.documentElement.dataset.meshState = 'error';
  }
}
