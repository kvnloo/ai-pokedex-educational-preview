/**
 * Wooloo A/B viewer — Firefox/Zen friendly.
 * Open: http://127.0.0.1:5180/ab.html
 *
 * Default: decimated preview (~8k tris). Optional full research GLB via ?full=1
 * (480k tris / 8.3MB can hang Firefox while "Loading mesh…" with no progress).
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const stats = document.getElementById('stats') as HTMLElement;
const refimg = document.getElementById('refimg') as HTMLImageElement | null;

const params = new URLSearchParams(location.search);
const useFull = params.get('full') === '1';
const publicGlb = useFull ? '/ab/wooloo_shape.glb' : '/ab/wooloo_preview.glb';

function setStats(html: string): void {
  if (stats) stats.innerHTML = html;
}

refimg?.addEventListener('error', () => {
  setStats('Ref image failed (/ab/wooloo_ref.png). Hard-refresh Ctrl+Shift+R.');
});
refimg?.addEventListener('load', () => {
  /* ok */
});

// Explicit WebGL1 fallback helps some Firefox/Zen configs
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: false,
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f18);
const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
camera.position.set(1.8, 1.3, 2.4);

scene.add(new THREE.AmbientLight(0xb8d4ff, 0.6));
const key = new THREE.DirectionalLight(0xfff2dd, 1.25);
key.position.set(3, 5, 2);
scene.add(key);
const fill = new THREE.DirectionalLight(0x88aaff, 0.4);
fill.position.set(-3, 1, -2);
scene.add(fill);
const grid = new THREE.GridHelper(4, 16, 0x2a3a50, 0x1a2535);
scene.add(grid);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0.55, 0);

function resize(): void {
  const parent = canvas.parentElement;
  const w = Math.max(1, parent?.clientWidth ?? window.innerWidth - 280);
  const h = Math.max(1, parent?.clientHeight ?? window.innerHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', resize);
// layout after first paint (Firefox sometimes reports 0 on first frame)
requestAnimationFrame(() => {
  resize();
  requestAnimationFrame(resize);
});
resize();

setStats(
  `Fetching <code>${publicGlb}</code>…<br>` +
    (useFull
      ? '<span style="color:#ff8f7a">full 8.3MB / ~480k tris — may stall on Firefox</span>'
      : 'preview decimate ~8k tris (add <code>?full=1</code> for raw Hunyuan)'),
);

const loader = new GLTFLoader();
const t0 = performance.now();

// Prefer fetch+parse so we control progress on Firefox (XHR total often 0)
async function loadGlb(url: string): Promise<void> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const total = Number(res.headers.get('content-length') || 0);
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = await res.arrayBuffer();
    return parseBuffer(buf);
  }
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      const pct = total ? Math.round((100 * received) / total) : null;
      setStats(
        pct != null
          ? `Downloading… ${pct}% (${(received / 1e6).toFixed(2)} MB)`
          : `Downloading… ${(received / 1e6).toFixed(2)} MB`,
      );
    }
  }
  const buf = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  setStats(`Parsing GLB (${(received / 1e6).toFixed(2)} MB)…`);
  return parseBuffer(buf.buffer);
}

function parseBuffer(buffer: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    loader.parse(
      buffer,
      '',
      (gltf) => {
        onGltf(gltf);
        resolve();
      },
      (err) => reject(err),
    );
  });
}

function onGltf(gltf: { scene: THREE.Group }): void {
  const root = gltf.scene;
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  const s = 1.25 / Math.max(size.x, size.y, size.z, 1e-6);
  root.scale.setScalar(s);
  root.position.y += (size.y * s) / 2;
  controls.target.set(0, (size.y * s) / 2, 0);
  controls.update();

  let tris = 0;
  let meshes = 0;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh && mesh.geometry) {
      meshes += 1;
      const idx = mesh.geometry.index;
      tris += idx ? idx.count / 3 : mesh.geometry.attributes.position.count / 3;
      // Replace materials — untextured Hunyuan often ships odd defaults
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xf0ebe3,
        roughness: 0.68,
        metalness: 0.04,
        side: THREE.DoubleSide,
      });
      mesh.geometry.computeVertexNormals();
    }
  });

  const ms = Math.round(performance.now() - t0);
  const note =
    tris > 50000
      ? '<span style="color:#ff8f7a">Huge mesh — expect jank on Firefox</span>'
      : tris < 200
        ? '<span style="color:#ff8f7a">Near-empty / block geometry — Hunyuan input was weak</span>'
        : '<span style="color:#7dffa8">Preview OK for orbit</span>';

  setStats(
    `Loaded OK in ${ms}ms<br>Meshes: ${meshes}<br>≈ tris: ${Math.round(tris).toLocaleString()}<br>` +
      `File: <code>${publicGlb}</code><br>${note}<br>` +
      (useFull
        ? '<a href="/ab.html">use preview mesh</a>'
        : '<a href="/ab.html?full=1">load raw Hunyuan 480k</a>'),
  );
  resize();
}

loadGlb(publicGlb).catch((err) => {
  console.error(err);
  setStats(
    `Load failed: <code>${publicGlb}</code><br>${String(err)}<br>` +
      `Hard-refresh. Prefer <code>http://127.0.0.1:5180/ab.html</code> (not file://).<br>` +
      `If Zen still stalls, try Chromium once to compare.`,
  );
});

// Timeout watchdog — Firefox silent stalls
window.setTimeout(() => {
  if (stats && /Fetching|Downloading|Parsing|Loading mesh/i.test(stats.textContent || '')) {
    setStats(
      (stats.innerHTML || '') +
        '<br><span style="color:#ff8f7a">Still working after 15s — large parse or GPU hitch. Wait or use preview (no ?full=1).</span>',
    );
  }
}, 15000);

function tick(): void {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
