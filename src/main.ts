/**
 * Twilight Route bootstrap — minimal until systems land.
 * Keeps Vite/tsc green; full game boots from here.
 */

const bootFill = document.getElementById('boot-fill') as HTMLElement | null;
const bootStatus = document.getElementById('boot-status') as HTMLElement | null;
const bootEl = document.getElementById('boot');

function progress(pct: number, label: string): void {
  if (bootFill) bootFill.style.width = `${Math.round(pct * 100)}%`;
  if (bootStatus) bootStatus.textContent = label;
}

function fatal(err: unknown): void {
  console.error(err);
  const box = document.getElementById('fatal');
  const txt = document.getElementById('fatal-text');
  if (txt) txt.textContent = String((err as Error)?.stack ?? err);
  box?.classList.add('show');
  bootEl?.classList.add('done');
}

async function boot(): Promise<void> {
  progress(0.1, 'Loading content index');
  let dexCount = 0;
  try {
    const res = await fetch('/content/derived/dex-index.json');
    if (res.ok) {
      const idx = (await res.json()) as { count?: number };
      dexCount = idx.count ?? 0;
    }
  } catch {
    /* content optional until sync */
  }

  progress(0.4, 'Init renderer');
  const canvas = document.getElementById('viewport') as HTMLCanvasElement | null;
  if (!canvas) throw new Error('#viewport missing');

  // Lazy three — keeps first paint light if import fails in tests
  const THREE = await import('three');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a1528, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 2.2, 5.5);
  camera.lookAt(0, 0.8, 0);

  scene.add(new THREE.AmbientLight(0xb8d4ff, 0.55));
  const key = new THREE.DirectionalLight(0xfff0dd, 1.15);
  key.position.set(4, 8, 3);
  scene.add(key);

  // Placeholder orb — stands in until creature factories land
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 48, 32),
    new THREE.MeshStandardMaterial({
      color: 0x7ec8ff,
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0x1a3a60,
      emissiveIntensity: 0.25,
    }),
  );
  orb.position.y = 0.9;
  scene.add(orb);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(6, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a2838, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent =
      dexCount > 0
        ? `Twilight Route · ${dexCount} species indexed · vertical slice boot`
        : 'Twilight Route · run npm run content:sync · vertical slice boot';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4200);
  }

  const loc = document.getElementById('loc-label');
  if (loc) loc.textContent = 'Lumen Hollow';

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  progress(0.9, 'Ready');
  let t0 = performance.now();
  const tick = (now: number) => {
    const t = (now - t0) / 1000;
    orb.position.y = 0.9 + Math.sin(t * 1.4) * 0.08;
    orb.rotation.y = t * 0.35;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  progress(1, 'Ready');
  requestAnimationFrame(() => {
    bootEl?.classList.add('done');
    setTimeout(() => bootEl?.remove(), 900);
  });
}

boot().catch(fatal);
