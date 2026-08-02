/**
 * Twilight Route — Wave-0 playable shell.
 * Loads content/game/wave0.json only (ship pack). Pure battle sim + Three presentation.
 * W3-P2: collision cam/player, dense grass+shadows, battle staging, XP/blackout, live rolls, gym.
 */
import * as THREE from 'three';
import {
  buildBattler,
  createBattle,
  createBattleFromParty,
  executeTurn,
  effectiveStat,
  forceSwitchPlayer,
  grantBattleRewards,
  pickFoeMove,
  rollCritical,
  switchPlayerTo,
} from './battle/battle.ts';
import { calcDamage, rollDamageRandom, stabMultiplier, typeEffectiveness } from './battle/damage.ts';
import { normalizeMove, normalizeSpecies } from './battle/content.ts';
import type { BattleEvent, BattleState, Battler, MoveDef, TypeChart } from './battle/types.ts';
import {
  createExploreState,
  tickExplore,
  bindExploreKeys,
  isOnHealPad,
  createDefaultHealPad,
  cameraCollisionDist,
  GRASS_PATH_HALF,
  type ExploreState,
} from './world/explore.ts';
import { addCinematicScenery } from './world/scenery.ts';
import { attemptCatch, speciesCatchRate } from './battle/catch.ts';
import { createParty, healParty, addToParty, partyCanAdd, syncBattlerToParty, leadIndex, type PartyMember } from './battle/party.ts';
import {
  makeCreatureMesh,
  SPECIES_COLOR,
  getClipState,
  playAttack,
  playFaint,
  tickCreatureClip,
} from './creatures/index.ts';
import {
  applyGraphicsPreset,
  resolvePresetFromQuery,
  MEDIUM_1080P,
} from './core/frameStats.ts';

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

interface Wave0Pack {
  typeChart: TypeChart;
  moves: Record<string, unknown>[];
  species: Record<string, unknown>[];
  route: {
    name: string;
    starterChoices: string[];
    wildEncounters: {
      species: string;
      minLevel: number;
      maxLevel: number;
      weight: number;
      band?: string;
    }[];
    playerDefaultLevel: number;
    gym?: {
      id: string;
      name: string;
      leaderName?: string;
      species: string;
      level: number;
      description?: string;
    };
    elite?: {
      id: string;
      name: string;
      trainerName?: string;
      species: string;
      level: number;
      description?: string;
    };
  };
}

interface TwilightRuntimeSnapshot {
  mode: 'starter' | 'explore' | 'battle';
  starterModels: number;
  player: { x: number; y: number; z: number } | null;
  camera: { x: number; y: number; z: number };
  cameraLook: { x: number; y: number; z: number };
  input: { held: string[] };
  party: { speciesId: string; name: string; hp: number; maxHp: number }[];
  battle: null | {
    kind: 'wild' | 'gym' | 'elite';
    playerHp: number;
    playerMaxHp: number;
    foeHp: number;
    foeMaxHp: number;
    foeSpeciesId: string;
    busy: boolean;
  };
  healCount: number;
  encounterCount: number;
  catchCount: number;
}

declare global {
  interface Window {
    __twilight?: { snapshot: () => TwilightRuntimeSnapshot };
  }
}

/** Ship id → mesh builder id (leafkit uses leafit silhouette until builders expand). */
const MESH_ALIAS: Record<string, string> = {
  leafkit: 'leafit',
};

/** Extended palette: ship pack ids including leafkit. */
const SHIP_COLOR: Record<string, number> = {
  ...SPECIES_COLOR,
  leafkit: SPECIES_COLOR.leafit ?? 0x5cbc6a,
  emberpup: SPECIES_COLOR.emberpup ?? 0xe87840,
  dewkin: SPECIES_COLOR.dewkin ?? 0x4aa8e8,
  dustbun: SPECIES_COLOR.dustbun ?? 0xe8e0d4,
  sparkmoth: SPECIES_COLOR.sparkmoth ?? 0xc9d44a,
  ironwisp: SPECIES_COLOR.ironwisp ?? 0xc9d0e0,
  gloomhorn: SPECIES_COLOR.gloomhorn ?? 0x6a4a7a,
};

/** Mode-5 marks: free-roam→Fight ≤400ms, move→first attack frame ≤180ms */
function mark(name: string): void {
  try {
    performance.mark(name);
  } catch {
    /* ignore */
  }
}

function measureLog(name: string, start: string, end: string, budgetMs: number): void {
  try {
    performance.measure(name, start, end);
    const entries = performance.getEntriesByName(name);
    const last = entries[entries.length - 1] as PerformanceMeasure | undefined;
    if (last) {
      const ok = last.duration <= budgetMs;
      console.info(
        `[mode5] ${name}: ${last.duration.toFixed(1)}ms (budget ${budgetMs}ms) ${ok ? 'OK' : 'OVER'}`,
      );
    }
  } catch {
    /* ignore */
  }
}

function waitMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

/** HP drain duration scales with damage fraction — never instant, never multi-second slog */
function hpDrainMs(damage: number, maxHp: number): number {
  const frac = clamp(damage / Math.max(1, maxHp), 0, 1);
  return Math.round(180 + frac * 720); // 180–900ms
}

/** Runtime meshes from creatures factory only; mesh QA exercised by default. */
function shipCreatureMesh(speciesId: string, scale = 1): THREE.Group {
  const meshId = MESH_ALIAS[speciesId] ?? speciesId;
  const root = makeCreatureMesh(meshId, scale, {
    assertQa: true,
    idlePhaseSeed: Math.random() * Math.PI * 2 + speciesId.length,
    colorOverride: SHIP_COLOR[speciesId],
  });
  root.userData.speciesId = speciesId;
  return root;
}

function isCritEvent(critical: unknown): boolean {
  if (critical === true) return true;
  if (typeof critical === 'number' && critical > 1) return true;
  return false;
}

async function boot(): Promise<void> {
  progress(0.08, 'Loading wave0 ship pack');
  const res = await fetch('/content/game/wave0.json');
  if (!res.ok) throw new Error(`wave0 pack missing (${res.status}). Expected content/game/wave0.json`);
  const raw = (await res.json()) as Wave0Pack;
  const moves = raw.moves.map((m) => normalizeMove(m));
  const moveById = new Map(moves.map((m) => [m.id, m]));
  const species = raw.species.map((s) => normalizeSpecies(s));
  const speciesById = new Map(species.map((s) => [s.id, s]));

  progress(0.25, 'Init renderer');
  const canvas = document.getElementById('viewport') as HTMLCanvasElement | null;
  if (!canvas) throw new Error('#viewport missing');

  // Graphics: medium-1080p from query caps DPR ≤1, AA off, cheap shadows
  const gfxPreset = resolvePresetFromQuery(
    typeof location !== 'undefined' ? location.search : '',
  );
  const useMedium =
    gfxPreset?.id === MEDIUM_1080P.id ||
    (typeof location !== 'undefined' && /preset=medium/i.test(location.search));
  const antialias = useMedium ? false : (gfxPreset?.antialias ?? true);
  const maxPr = useMedium ? (gfxPreset?.maxPixelRatio ?? 1) : Math.min(2, gfxPreset?.maxPixelRatio ?? 2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias, powerPreference: useMedium ? 'low-power' : 'high-performance' });
  if (useMedium && gfxPreset) {
    applyGraphicsPreset(renderer, gfxPreset);
    // Lock buffer to preset size (no expand under medium); CSS still fills window
    renderer.setSize(gfxPreset.width, gfxPreset.height, false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, maxPr));
  } else {
    renderer.setPixelRatio(Math.min(devicePixelRatio, maxPr));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = useMedium ? 1.22 : 1.35;
  renderer.shadowMap.enabled = true;
  // Three r185 maps the old soft mode to PCF with a deprecation warning.
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  // Graded twilight sky — warm horizon, cool zenith (not near-black navy void)
  const sky = new THREE.Color(0x6a8ec8);
  scene.background = sky;
  scene.fog = new THREE.Fog(0x8eabcc, 18, 55);

  // Soft gradient dome for richer sky read in stills
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(48, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x3a5a9a) },
        midColor: { value: new THREE.Color(0xc48a6a) },
        botColor: { value: new THREE.Color(0xf0c4a0) },
      },
      vertexShader: `
        varying vec3 vW;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 botColor;
        varying vec3 vW;
        void main() {
          float h = normalize(vW).y;
          vec3 col = mix(botColor, midColor, smoothstep(-0.15, 0.25, h));
          col = mix(col, topColor, smoothstep(0.2, 0.85, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  scene.add(skyDome);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.2, 7.5);
  camera.lookAt(0, 0.8, 0);

  // Soft follow state (lagged yaw + lerped position + collision pull-in)
  const camFollow = {
    yaw: Math.PI,
    pos: new THREE.Vector3(0, 2.65, 5.4),
    look: new THREE.Vector3(0, 0.85, 0),
    // Soft third-person: room for route + grass band + landmarks in stills
    dist: 4.85,
    height: 2.55,
    ready: false,
  };

  // Battle camera punch state (impact / SE / faint / send-out)
  const battleCam = {
    base: new THREE.Vector3(0.3, 2.6, 6.2),
    punch: 0,
    lowAngle: 0,
    lookY: 0.7,
  };

  // Soft GI bar: ambient + hemi + key + fill (readable under ACES)
  scene.add(new THREE.AmbientLight(0xd8e6ff, 0.42));
  const hemi = new THREE.HemisphereLight(0xffe2c4, 0x3a6b48, 0.85);
  hemi.position.set(0, 12, 0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dd, 1.55);
  key.position.set(5, 12, 4);
  key.castShadow = true;
  const shadowMapSize = useMedium ? 512 : 1024;
  key.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = useMedium ? 28 : 40;
  const fr = useMedium ? 9 : 14;
  key.shadow.camera.left = -fr;
  key.shadow.camera.right = fr;
  key.shadow.camera.top = fr;
  key.shadow.camera.bottom = -fr;
  key.shadow.bias = -0.0008;
  if (useMedium) {
    key.intensity = 1.25;
    hemi.intensity = 0.7;
  }
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aadd, 0.55);
  fill.position.set(-6, 4, -3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffb090, 0.35);
  rim.position.set(-2, 2, 6);
  scene.add(rim);
  const scenery = addCinematicScenery(scene, useMedium);

  // Ground disc with micro-relief ring layers + horizon massing
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(12, 64),
    new THREE.MeshStandardMaterial({
      color: 0x4a8a55,
      roughness: 0.88,
      metalness: 0.02,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Layered ground rings (micro-relief read, still non-void)
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x477f50,
    roughness: 0.92,
    metalness: 0.02,
  });
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.35 + i * 2.25, 3.46 + i * 2.25, 64), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.012 + i * 0.004;
    ring.receiveShadow = true;
    scene.add(ring);
  }
  // Horizon berm masses (silhouette against sky)
  const bermMat = new THREE.MeshStandardMaterial({ color: 0x3a6b48, roughness: 0.9, metalness: 0 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.22;
    const berm = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 + (i % 3) * 0.28, 2), bermMat);
    berm.scale.set(1.65 + (i % 2) * 0.22, 0.46 + (i % 3) * 0.08, 1.08);
    berm.rotation.set(i * 0.13, i * 0.71, i * 0.09);
    berm.position.set(Math.cos(a) * 10.8, -0.28, Math.sin(a) * 10.8);
    berm.receiveShadow = true;
    berm.castShadow = true;
    scene.add(berm);
  }

  // Dirt path toward grass / hollow
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 10),
    new THREE.MeshStandardMaterial({ color: 0xc4a878, roughness: 0.95, metalness: 0 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, 1.5);
  path.receiveShadow = true;
  scene.add(path);

  // Heal pad landmark (town edge)
  const healPadMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.45, 0.08, 32),
    new THREE.MeshStandardMaterial({
      color: 0x7ec8ff,
      emissive: 0x3a80c0,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.15,
    }),
  );
  healPadMesh.position.set(4.5, 0.04, 4.5);
  healPadMesh.receiveShadow = true;
  healPadMesh.castShadow = true;
  scene.add(healPadMesh);
  const healGlow = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.5, 32),
    new THREE.MeshBasicMaterial({ color: 0xa8dcff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  healGlow.rotation.x = -Math.PI / 2;
  healGlow.position.set(4.5, 0.09, 4.5);
  scene.add(healGlow);

  // Town stone marker (Lumen Hollow read)
  const stone = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.55, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x9aa8b8, roughness: 0.7, metalness: 0.05 }),
  );
  stone.position.set(5.2, 0.28, 5.6);
  stone.castShadow = true;
  stone.receiveShadow = true;
  scene.add(stone);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.45, 4),
    new THREE.MeshStandardMaterial({ color: 0xd47858, roughness: 0.65 }),
  );
  roof.position.set(5.2, 0.75, 5.6);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);

  // Gym / elite stake posts (interact with E)
  const gymPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 1.6, 10),
    new THREE.MeshStandardMaterial({
      color: 0xe8d070,
      emissive: 0x886020,
      emissiveIntensity: 0.25,
      metalness: 0.35,
      roughness: 0.45,
    }),
  );
  gymPost.position.set(-5.75, 0.8, 3.15);
  gymPost.castShadow = true;
  scene.add(gymPost);
  const gymOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfff0a0,
      emissive: 0xffc040,
      emissiveIntensity: 0.55,
      metalness: 0.2,
      roughness: 0.3,
    }),
  );
  gymOrb.position.set(-5.75, 1.75, 3.15);
  gymOrb.castShadow = true;
  scene.add(gymOrb);

  const elitePost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.3, 1.8, 10),
    new THREE.MeshStandardMaterial({
      color: 0x6a4a8a,
      emissive: 0x3a2060,
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.4,
    }),
  );
  elitePost.position.set(-6.25, 0.9, 0.25);
  elitePost.castShadow = true;
  scene.add(elitePost);
  const eliteOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xb090e0,
      emissive: 0x6040a0,
      emissiveIntensity: 0.5,
      metalness: 0.25,
      roughness: 0.35,
    }),
  );
  eliteOrb.position.set(-6.25, 1.95, 0.25);
  eliteOrb.castShadow = true;
  scene.add(eliteOrb);

  // Tall grass risk strip — path corridor clear; multi-blade clumps; dark undergrowth flanks
  const grassColors = [0x3d8a4a, 0x2f6f3c, 0x4a9a58, 0x286838, 0x55a864, 0x347844, 0x3a7a48];
  const grassMats = grassColors.map(
    (gCol) =>
      new THREE.MeshStandardMaterial({
        color: gCol,
        roughness: 0.82,
        metalness: 0.02,
        emissive: gCol,
        emissiveIntensity: 0.04,
      }),
  );
  // Continuous undergrowth flanks (path intentionally clear) — readable risk strip vs lawn
  const underMat = new THREE.MeshStandardMaterial({
    color: 0x1a3824,
    roughness: 0.96,
    metalness: 0,
  });
  for (const side of [-1, 1] as const) {
    const undergrowth = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 5.1), underMat);
    undergrowth.rotation.x = -Math.PI / 2;
    // Centers sit outside path half so strip reads continuous on each flank
    undergrowth.position.set(side * (GRASS_PATH_HALF + 0.88), 0.022, -1.2);
    undergrowth.receiveShadow = true;
    scene.add(undergrowth);
  }

  const grassBlades: THREE.Mesh[] = [];
  const grassBaseRot: number[] = [];
  const GRASS_N = useMedium ? 110 : 220;
  const grassGeo = new THREE.ConeGeometry(0.075, 0.88, useMedium ? 4 : 5);
  const grassGeoTall = new THREE.ConeGeometry(0.06, 1.15, useMedium ? 3 : 4);
  let placed = 0;
  let attempts = 0;
  while (placed < GRASS_N && attempts < GRASS_N * 12) {
    attempts++;
    // Dense rectangular band matching grass.half (~2.6) around cz=-1.2; reject path
    const gx = (Math.random() * 2 - 1) * 2.55;
    const gz = -1.2 + (Math.random() * 2 - 1) * 2.45;
    if (Math.abs(gx) < GRASS_PATH_HALF) continue;
    // Prefer flanks density (more blades near path edge for silhouette)
    if (Math.abs(gx) > 2.35 && Math.random() < 0.35) continue;
    const clump = 1 + ((placed + attempts) % 3); // multi-blade volume clumps
    for (let c = 0; c < clump && placed < GRASS_N; c++) {
      const mat = grassMats[placed % grassMats.length];
      const tall = c === 0 && Math.random() > 0.45;
      const blade = new THREE.Mesh(tall ? grassGeoTall : grassGeo, mat);
      const ox = gx + (c - (clump - 1) * 0.5) * 0.11 + (Math.random() - 0.5) * 0.06;
      const oz = gz + (Math.random() - 0.5) * 0.12;
      if (Math.abs(ox) < GRASS_PATH_HALF) continue;
      const h = tall ? 0.52 + Math.random() * 0.22 : 0.38 + Math.random() * 0.22;
      blade.position.set(ox, h * 0.5, oz);
      blade.rotation.z = (Math.random() - 0.5) * 0.32;
      blade.rotation.y = Math.random() * Math.PI;
      blade.scale.y = 0.95 + Math.random() * 0.55;
      blade.scale.x = 0.85 + Math.random() * 0.4;
      blade.scale.z = 0.85 + Math.random() * 0.35;
      blade.castShadow = !useMedium && placed % 8 === 0;
      grassBaseRot.push(blade.rotation.z);
      grassBlades.push(blade);
      scene.add(blade);
      placed++;
    }
  }

  // Local rustle particles (part telegraph under feet — not sway-only)
  const rustlePool: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const p = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 6),
      new THREE.MeshBasicMaterial({
        color: 0x8fd49a,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    p.rotation.x = -Math.PI / 2;
    p.visible = false;
    scene.add(p);
    rustlePool.push(p);
  }
  let rustleIdx = 0;
  const rustleLife: { mesh: THREE.Mesh; t: number; life: number; vy: number }[] = [];
  function spawnGrassPart(x: number, z: number): void {
    const mesh = rustlePool[rustleIdx % rustlePool.length];
    rustleIdx++;
    mesh.visible = true;
    mesh.position.set(x + (Math.random() - 0.5) * 0.35, 0.08, z + (Math.random() - 0.5) * 0.35);
    mesh.scale.setScalar(0.5 + Math.random() * 0.6);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.6;
    rustleLife.push({ mesh, t: 0, life: 0.28 + Math.random() * 0.12, vy: 0.55 + Math.random() * 0.4 });
  }

  // Contact blob shadow under active creatures (readable stills)
  const contactShadowMat = new THREE.MeshBasicMaterial({
    color: 0x1a2018,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const playerContact = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), contactShadowMat);
  playerContact.rotation.x = -Math.PI / 2;
  playerContact.position.y = 0.03;
  scene.add(playerContact);
  const foeContact = new THREE.Mesh(new THREE.CircleGeometry(0.42, 16), contactShadowMat.clone());
  foeContact.rotation.x = -Math.PI / 2;
  foeContact.position.y = 0.03;
  foeContact.visible = false;
  scene.add(foeContact);

  // Foot-plant dust
  const dustPool: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 8),
      new THREE.MeshBasicMaterial({
        color: 0xd8c8a8,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    d.rotation.x = -Math.PI / 2;
    d.visible = false;
    scene.add(d);
    dustPool.push(d);
  }
  let dustIdx = 0;
  const dustLife: { mesh: THREE.Mesh; t: number; life: number; vy?: number }[] = [];

  function spawnDust(x: number, z: number, side: number, inGrass = false, runBlend = 0): void {
    const mesh = dustPool[dustIdx % dustPool.length];
    dustIdx++;
    mesh.visible = true;
    const scale = (0.85 + Math.random() * 0.55) * (1 + runBlend * 0.45);
    mesh.position.set(x + side * 0.14, 0.05, z);
    mesh.scale.setScalar(scale);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(inGrass ? 0x6a9a58 : 0xd8c8a8);
    mat.opacity = 0.55 + runBlend * 0.15;
    dustLife.push({ mesh, t: 0, life: 0.42 + runBlend * 0.12, vy: 0.35 + runBlend * 0.25 });
  }

  let playerMesh: THREE.Group | null = null;
  let foeMesh: THREE.Group | null = null;
  let mode: 'starter' | 'explore' | 'battle' = 'starter';
  let battle: BattleState | null = null;
  let playerSpeciesId = 'emberpup';
  let busy = false;
  let battleKind: 'wild' | 'gym' | 'elite' = 'wild';
  let wildWins = 0;
  let gymCleared = false;
  let healCount = 0;
  let encounterCount = 0;
  let catchCount = 0;
  let starterFocus = 0;

  // In-world companion ceremony: three real runtime meshes, not CSS stand-ins.
  const starterStage = new THREE.Group();
  starterStage.name = 'companion-ceremony';
  const starterMeshes: THREE.Group[] = [];
  const starterLights: THREE.PointLight[] = [];
  const starterXs = [-2.15, 0, 2.15];
  const daisMat = new THREE.MeshStandardMaterial({ color: 0x273c3d, roughness: 0.78, metalness: 0.12 });
  const inlayMat = new THREE.MeshStandardMaterial({
    color: 0xd6b878,
    emissive: 0x6b421f,
    emissiveIntensity: 0.24,
    roughness: 0.44,
    metalness: 0.38,
  });
  for (let i = 0; i < raw.route.starterChoices.length; i++) {
    const id = raw.route.starterChoices[i]!;
    const x = starterXs[i] ?? (i - 1) * 2.15;
    const alcove = new THREE.Group();
    alcove.position.set(x, 0, 0.55);

    const dais = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.94, 0.2, 48), daisMat);
    dais.position.y = 0.1;
    dais.receiveShadow = true;
    alcove.add(dais);
    const inlay = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.025, 8, 48), inlayMat.clone());
    inlay.rotation.x = Math.PI / 2;
    inlay.position.y = 0.215;
    alcove.add(inlay);

    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.62, 0.22, -0.14),
      new THREE.Vector3(-0.78, 1.25, -0.16),
      new THREE.Vector3(0, 2.02, -0.18),
      new THREE.Vector3(0.78, 1.25, -0.16),
      new THREE.Vector3(0.62, 0.22, -0.14),
    ]);
    const arch = new THREE.Mesh(new THREE.TubeGeometry(archCurve, 32, 0.035, 8, false), inlayMat.clone());
    arch.castShadow = true;
    alcove.add(arch);

    const creature = shipCreatureMesh(id, 1.18);
    creature.position.set(0, 0.22, 0.04);
    const stageClip = getClipState(creature);
    if (stageClip) stageClip.baseY = 0.22;
    creature.userData.stageBaseY = 0.22;
    creature.userData.stageIndex = i;
    enableCast(creature);
    alcove.add(creature);
    starterMeshes.push(creature);

    const accent = SHIP_COLOR[id] ?? 0xffcf88;
    const light = new THREE.PointLight(accent, i === 0 ? 2.4 : 1.5, 5.5, 1.8);
    light.position.set(0, 1.45, 1.05);
    alcove.add(light);
    starterLights.push(light);
    starterStage.add(alcove);
  }
  scene.add(starterStage);
  document.body.dataset.mode = 'starter';

  // Lunge offsets (rAF-driven)
  let playerLunge = 0;
  let foeLunge = 0;
  let foeSink = 0;
  let playerSink = 0;
  let playerBobPhase = 0;
  let ballArcT = -1; // -1 idle; 0..1 throw progress
  const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xff5a5a,
      metalness: 0.35,
      roughness: 0.35,
      emissive: 0x440000,
      emissiveIntensity: 0.2,
    }),
  );
  ballMesh.visible = false;
  ballMesh.castShadow = true;
  scene.add(ballMesh);

  let explore: ExploreState | null = null;
  let party: PartyMember[] = [];
  const healPad = createDefaultHealPad();
  let healCooldown = 0;
  let grassRustleBoost = 0;
  let interactArmed = true;

  let dispEnemyHp = 0;
  let dispAllyHp = 0;

  const loc = document.getElementById('loc-label');
  if (loc) loc.textContent = raw.route.name;

  // --- UI refs ---
  const starterOverlay = document.getElementById('starter-overlay');
  const starterRow = document.getElementById('starter-row');
  const battleRoot = document.getElementById('battle-root');
  const battleMsg = document.getElementById('battle-msg');
  const battleMenu = document.getElementById('battle-menu');
  const moveMenu = document.getElementById('move-menu');
  const enemyName = document.getElementById('enemy-name');
  const enemyLvl = document.getElementById('enemy-lvl');
  const enemyHp = document.getElementById('enemy-hp');
  const allyName = document.getElementById('ally-name');
  const allyLvl = document.getElementById('ally-lvl');
  const allyHp = document.getElementById('ally-hp');
  const allyHpText = document.getElementById('ally-hp-text');
  const toast = document.getElementById('toast');
  const flash = document.getElementById('battle-flash');
  const partyStrip = document.getElementById('party-strip');
  const swapBtn = battleMenu?.querySelector('[data-act="swap"]') as HTMLButtonElement | null;

  window.__twilight = {
    snapshot: (): TwilightRuntimeSnapshot => ({
      mode,
      starterModels: starterStage.parent ? starterMeshes.length : 0,
      player: playerMesh
        ? { x: playerMesh.position.x, y: playerMesh.position.y, z: playerMesh.position.z }
        : null,
      camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      cameraLook: { x: camFollow.look.x, y: camFollow.look.y, z: camFollow.look.z },
      input: { held: explore ? [...explore.keys].sort() : [] },
      party: party.map((member) => ({
        speciesId: member.battler.speciesId,
        name: member.battler.name,
        hp: member.battler.hp,
        maxHp: member.battler.maxHp,
      })),
      battle: battle
        ? {
            kind: battleKind,
            playerHp: battle.player.hp,
            playerMaxHp: battle.player.maxHp,
            foeHp: battle.foe.hp,
            foeMaxHp: battle.foe.maxHp,
            foeSpeciesId: battle.foe.speciesId,
            busy,
          }
        : null,
      healCount,
      encounterCount,
      catchCount,
    }),
  };

  function renderPartyStrip(): void {
    if (!partyStrip) return;
    partyStrip.innerHTML = '';
    if (party.length === 0) {
      partyStrip.classList.remove('show');
      return;
    }
    partyStrip.classList.add('show');
    for (const member of party) {
      const b = member.battler;
      const slot = document.createElement('div');
      slot.className = `party-slot${b.hp <= 0 || b.fainted ? ' fainted' : ''}`;
      const accent = SHIP_COLOR[b.speciesId] ?? 0x9ec8d8;
      slot.style.setProperty('--slot-accent', `#${accent.toString(16).padStart(6, '0')}`);
      const ratio = clamp(b.hp / Math.max(1, b.maxHp), 0, 1);
      slot.innerHTML = `<span class="party-mark">${b.name.slice(0, 1)}</span><span class="party-copy"><strong>${b.name}</strong><small>Lv.${b.level} · ${b.hp}/${b.maxHp}</small><i><b style="transform:scaleX(${ratio})"></b></i></span>`;
      partyStrip.appendChild(slot);
    }
  }

  function showToast(text: string, ms = 2800): void {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms);
  }

  function setMsg(text: string): void {
    if (battleMsg) battleMsg.textContent = text;
  }

  function clearEffClasses(): void {
    battleMsg?.classList.remove('eff-se', 'eff-nve', 'eff-crit', 'faint-beat');
    flash?.classList.remove('se', 'nve', 'crit');
  }

  function setHpBar(el: HTMLElement | null, hp: number, max: number, durMs?: number): void {
    if (!el) return;
    const t = Math.max(0, Math.min(1, hp / Math.max(1, max)));
    if (durMs != null) el.style.setProperty('--hp-dur', `${durMs}ms`);
    el.style.transform = `scaleX(${t})`;
    el.style.background =
      t > 0.5
        ? 'linear-gradient(90deg,#3ecf72,#5ce08a)'
        : t > 0.2
          ? 'linear-gradient(90deg,#e6d35a,#ffd56a)'
          : 'linear-gradient(90deg,#ff6b5a,#ff8f7a)';
  }

  function syncBattleHud(opts?: { enemyDur?: number; allyDur?: number }): void {
    if (!battle) return;
    if (enemyName) enemyName.textContent = battle.foe.name;
    if (enemyLvl) enemyLvl.textContent = `Lv.${battle.foe.level}`;
    if (allyName) allyName.textContent = battle.player.name;
    if (allyLvl) allyLvl.textContent = `Lv.${battle.player.level}`;
    setHpBar(enemyHp, dispEnemyHp, battle.foe.maxHp, opts?.enemyDur);
    setHpBar(allyHp, dispAllyHp, battle.player.maxHp, opts?.allyDur);
    if (allyHpText) allyHpText.textContent = `${Math.round(dispAllyHp)}/${battle.player.maxHp}`;
  }

  function updateSwapButton(): void {
    if (!swapBtn) return;
    const can = party.length > 1 && mode === 'battle' && !busy;
    swapBtn.disabled = !can;
    const sub = swapBtn.querySelector('.sub');
    if (sub) sub.textContent = can ? 'Switch partner' : party.length > 1 ? 'Busy…' : 'Need 2+ party';
  }

  function flashHit(kind: 'hit' | 'se' | 'nve' | 'crit', opts?: { layer?: boolean }): void {
    if (!flash) return;
    if (!opts?.layer) {
      flash.classList.remove('se', 'nve', 'crit', 'on');
    }
    if (kind === 'se') flash.classList.add('se');
    else if (kind === 'nve') flash.classList.add('nve');
    else if (kind === 'crit') flash.classList.add('crit');
    void flash.offsetWidth;
    flash.classList.add('on');
    // Battle cam punch on impact (crit stacks over SE)
    const punch = kind === 'crit' ? 0.55 : kind === 'se' ? 0.42 : 0.28;
    battleCam.punch = Math.max(battleCam.punch, punch);
    if (kind === 'se' || kind === 'crit') battleCam.lowAngle = 0.25;
    setTimeout(() => {
      flash.classList.remove('on', 'se', 'nve', 'crit');
    }, kind === 'crit' ? 140 : 90);
  }

  /** Stack effectiveness tint + crit accent within 100ms of hit (not mutually exclusive). */
  function flashEffectivenessAndCrit(eff: number, crit: boolean): void {
    if (eff >= 2) flashHit('se');
    else if (eff > 0 && eff <= 0.5) flashHit('nve');
    else if (!crit) flashHit('hit');
    if (crit) {
      // Layer crit within same impact window (≤100ms of hit)
      if (eff >= 2 || (eff > 0 && eff <= 0.5)) {
        setTimeout(() => flashHit('crit', { layer: true }), 45);
      } else {
        flashHit('crit');
      }
    }
  }

  function battlerFromSpecies(speciesId: string, level: number, uid: string): Battler {
    const sp = speciesById.get(speciesId);
    if (!sp) throw new Error(`unknown species ${speciesId}`);
    const mv: MoveDef[] = sp.moves
      .map((id) => moveById.get(id))
      .filter((m): m is MoveDef => !!m)
      .slice(0, 4);
    return buildBattler({
      id: uid,
      name: sp.name,
      speciesId: sp.id,
      types: sp.types,
      level,
      baseStats: sp.baseStats,
      moves: mv,
    });
  }

  function pickWild(): { species: string; level: number } {
    let table = raw.route.wildEncounters;
    // Escalate band by wins / lead level
    const leadLv = party[0]?.battler.level ?? raw.route.playerDefaultLevel;
    if (wildWins >= 3 || leadLv >= 8) {
      const late = table.filter((e) => e.band === 'late' || e.band === 'mid');
      if (late.length) table = late;
    } else if (wildWins >= 1 || leadLv >= 6) {
      const mid = table.filter((e) => e.band !== 'late');
      if (mid.length) table = mid;
    } else {
      const early = table.filter((e) => !e.band || e.band === 'early');
      if (early.length) table = early;
    }
    const total = table.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    for (const e of table) {
      r -= e.weight;
      if (r <= 0) {
        const level =
          e.minLevel + Math.floor(Math.random() * (e.maxLevel - e.minLevel + 1));
        return { species: e.species, level };
      }
    }
    const e = table[0];
    return { species: e.species, level: e.minLevel };
  }

  function tickMeshClips(dt: number, wallT: number): void {
    if (playerMesh) {
      const st = getClipState(playerMesh);
      if (st) tickCreatureClip(playerMesh, st, dt, wallT);
    }
    if (foeMesh) {
      const st = getClipState(foeMesh);
      if (st) tickCreatureClip(foeMesh, st, dt, wallT);
    }
  }

  function enableCast(root: THREE.Object3D): void {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        // Medium: blob contact only — skip mesh shadow casters (F budget)
        o.castShadow = !useMedium;
        o.receiveShadow = !useMedium;
      }
    });
  }

  /** Directed send-out: rise from below + scale-in + low cam */
  async function stageSendOut(who: 'player' | 'foe', speciesId: string, scale = 1): Promise<void> {
    battleCam.lowAngle = 0.55;
    battleCam.punch = 0.2;
    if (who === 'player') {
      if (playerMesh) scene.remove(playerMesh);
      playerMesh = shipCreatureMesh(speciesId, scale);
      enableCast(playerMesh);
      playerMesh.position.set(1.8, -0.9, 1.4);
      playerMesh.scale.setScalar(0.15);
      scene.add(playerMesh);
    } else {
      if (foeMesh) scene.remove(foeMesh);
      foeMesh = shipCreatureMesh(speciesId, scale);
      enableCast(foeMesh);
      foeMesh.position.set(-1.6, -0.9, -0.8);
      foeMesh.scale.setScalar(0.15);
      scene.add(foeMesh);
      foeContact.visible = true;
    }
    // Snappy send-out — free-roam→Fight budget ≤400ms with parallel staging
    const ms = 160;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / ms, 0, 1);
        const ease = 1 - Math.pow(1 - u, 2.4);
        const mesh = who === 'player' ? playerMesh : foeMesh;
        if (mesh) {
          mesh.position.y = -0.9 + ease * 0.9;
          mesh.scale.setScalar(0.15 + ease * 0.85);
        }
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    if (who === 'player' && playerMesh) {
      playerMesh.position.y = 0;
      playerMesh.scale.setScalar(1);
    }
    if (who === 'foe' && foeMesh) {
      foeMesh.position.y = 0;
      foeMesh.scale.setScalar(1);
    }
  }

  /** Recall sink / scale-out before switch-in */
  async function stageRecall(who: 'player' | 'foe'): Promise<void> {
    const mesh = who === 'player' ? playerMesh : foeMesh;
    if (!mesh) return;
    const ms = 280;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / ms, 0, 1);
        mesh.position.y = -u * 0.85;
        mesh.scale.setScalar(Math.max(0.05, 1 - u));
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  async function enterBattle(
    foeSpecies: string,
    foeLevel: number,
    kind: 'wild' | 'gym' | 'elite' = 'wild',
  ): Promise<void> {
    mark('roam-to-fight-start');
    mode = 'battle';
    document.body.dataset.mode = 'battle';
    encounterCount += 1;
    battleKind = kind;
    foeSink = 0;
    playerSink = 0;
    playerLunge = 0;
    foeLunge = 0;
    ballArcT = -1;
    ballMesh.visible = false;
    clearEffClasses();
    battleCam.punch = 0;
    battleCam.lowAngle = 0.4;
    battleCam.lookY = 0.7;

    // Conscious lead — never open with fainted party[0] after force-switch / mid-party KO
    if (party.length > 0) {
      const li = leadIndex(party);
      const lead = party[li]?.battler;
      if (!lead || lead.hp <= 0 || lead.fainted) {
        // Full black-out: refuse battle, heal + warp
        healParty(party);
        warpToHealPad();
        mode = 'explore';
        document.body.dataset.mode = 'explore';
        healCount += 1;
        renderPartyStrip();
        showToast('No conscious partners — healed at the pad.');
        return;
      }
      playerSpeciesId = lead.speciesId || playerSpeciesId;
    }
    const foe = battlerFromSpecies(foeSpecies, foeLevel, kind === 'wild' ? 'wild' : kind);
    if (party.length > 0) {
      battle = createBattleFromParty(party, foe, raw.typeChart);
      playerSpeciesId = battle.player.speciesId || playerSpeciesId;
    } else {
      const leadBattler = battlerFromSpecies(playerSpeciesId, raw.route.playerDefaultLevel, 'player');
      battle = createBattle({ player: leadBattler, foe, typeChart: raw.typeChart, playerPartyIndex: 0 });
    }

    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;

    battleRoot?.classList.add('active');
    // Hide menu until staging done
    battleMenu?.classList.add('hidden');
    moveMenu?.classList.add('hidden');

    if (kind === 'wild') {
      setMsg(`A wild ${foe.name} appeared!`);
    } else if (kind === 'gym') {
      const g = raw.route.gym;
      setMsg(`${g?.leaderName ?? 'Gym Leader'} challenges you with ${foe.name}!`);
    } else {
      const e = raw.route.elite;
      setMsg(`${e?.trainerName ?? 'Elite'} bars the path with ${foe.name}!`);
    }
    syncBattleHud({ enemyDur: 0, allyDur: 0 });
    showToast(kind === 'wild' ? 'Battle!' : kind === 'gym' ? 'Gym battle!' : 'Elite gate!');

    // Parallel send-outs under free-roam→Fight ≤400ms budget
    await Promise.all([
      stageSendOut('foe', foeSpecies, 0.95),
      stageSendOut('player', playerSpeciesId, 1),
    ]);
    setMsg(`Go! ${battle.player.name}!`);

    battleMenu?.classList.remove('hidden');
    updateSwapButton();

    requestAnimationFrame(() => {
      mark('roam-to-fight-ready');
      measureLog('roam→Fight', 'roam-to-fight-start', 'roam-to-fight-ready', 400);
    });
  }

  function warpToHealPad(): void {
    if (!explore) return;
    // Place just outside heal pad solid so player can walk rim
    explore.pos.x = 3.1;
    explore.pos.z = 4.5;
    explore.vel.x = 0;
    explore.vel.z = 0;
    if (playerMesh) {
      playerMesh.position.set(explore.pos.x, 0, explore.pos.z);
    }
  }

  function exitBattle(msg: string): void {
    mode = 'explore';
    document.body.dataset.mode = 'explore';
    if (battle && party.length > 0) {
      try {
        syncBattlerToParty(party, battle.player, battle.playerPartyIndex ?? 0);
      } catch {
        /* ignore */
      }
    }
    battle = null;
    battleRoot?.classList.remove('active');
    clearEffClasses();
    foeSink = 0;
    playerSink = 0;
    ballArcT = -1;
    ballMesh.visible = false;
    foeContact.visible = false;
    battleCam.punch = 0;
    battleCam.lowAngle = 0;
    if (foeMesh) {
      scene.remove(foeMesh);
      foeMesh = null;
    }
    // Restore explore player mesh silhouette
    if (playerMesh) {
      scene.remove(playerMesh);
      playerMesh = shipCreatureMesh(playerSpeciesId, 1);
      enableCast(playerMesh);
      scene.add(playerMesh);
    }
    if (playerMesh && explore) {
      playerMesh.position.set(explore.pos.x, 0, explore.pos.z);
    } else if (playerMesh) {
      playerMesh.position.set(0, 0, 1.2);
    }
    renderPartyStrip();
    showToast(msg);
    updateSwapButton();
  }

  async function stageFaintAndExit(win: boolean): Promise<void> {
    const faintName = win ? battle?.foe.name : battle?.player.name;
    setMsg(`${faintName ?? 'Foe'} fainted!`);
    battleMsg?.classList.add('faint-beat');
    battleCam.punch = 0.35;
    battleCam.lowAngle = 0.45;
    if (win && foeMesh) {
      const st = getClipState(foeMesh);
      if (st) playFaint(st);
    } else if (!win && playerMesh) {
      const st = getClipState(playerMesh);
      if (st) playFaint(st);
    }
    const sinkMs = 520;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / sinkMs, 0, 1);
        if (win) foeSink = u * 0.85;
        else {
          foeSink = 0;
          playerSink = u * 0.85;
        }
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    if (win && battle) {
      const rew = grantBattleRewards(battle, { party, baseExp: battleKind === 'gym' ? 120 : battleKind === 'elite' ? 160 : 50 });
      for (const m of rew.messages) {
        setMsg(m);
        showToast(m, 3200);
        await waitMs(420);
      }
      if (rew.leveledUp && party[0]) {
        playerSpeciesId = battle.player.speciesId;
      }
      wildWins += 1;
      if (battleKind === 'gym') {
        gymCleared = true;
        showToast('Gym cleared — elite gate unlocked.');
      }
      setMsg('You win! Growth from the battle settles in.');
      showToast(battleKind === 'gym' ? 'Gym badge earned!' : 'Victory — partner grew stronger.');
    } else {
      setMsg('You were defeated…');
      // Black-out → heal + warp heal pad
      healParty(party);
      warpToHealPad();
      showToast('Blacked out… healed at the pad.');
    }
    await waitMs(480);
    battleMsg?.classList.remove('faint-beat');
    exitBattle(win ? 'Victory — back to the hollow.' : 'Blacked out — back at the heal pad.');
    busy = false;
  }

  /** When active faints but reserves remain — force-switch UI path */
  async function handleForceSwitch(): Promise<void> {
    if (!battle || !battle.needsForceSwitch) return;
    battleCam.lowAngle = 0.35;
    setMsg(`${battle.player.name} fainted! Choose a partner!`);
    if (playerMesh) {
      const st = getClipState(playerMesh);
      if (st) playFaint(st);
    }
    const sinkMs = 400;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / sinkMs, 0, 1);
        playerSink = u * 0.85;
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    playerSink = 0;
    // Auto-pick first conscious if only one, else open swap menu
    const conscious = party
      .map((m, i) => ({ m, i }))
      .filter(({ m, i }) => i !== (battle!.playerPartyIndex ?? 0) && m.battler.hp > 0 && !m.battler.fainted);
    if (conscious.length === 0) {
      const ok = forceSwitchPlayer(battle, party);
      if (!ok) {
        await stageFaintAndExit(false);
        return;
      }
    }
    // Open force-swap (no back)
    await openForceSwapMenu();
  }

  function openForceSwapMenu(): Promise<void> {
    return new Promise((resolve) => {
      if (!battle || !moveMenu) {
        resolve();
        return;
      }
      moveMenu.innerHTML = '';
      moveMenu.classList.remove('hidden');
      battleMenu?.classList.add('hidden');
      setMsg('Who will you send out?');
      party.forEach((m, i) => {
        const b = m.battler;
        const btn = document.createElement('button');
        btn.className = 'btn';
        const active = (battle!.playerPartyIndex ?? 0) === i;
        btn.innerHTML = `${b.name}<span class="sub">Lv.${b.level} · ${b.hp}/${b.maxHp}${active ? ' · fainted' : ''}</span>`;
        btn.disabled = busy || b.hp <= 0 || !!b.fainted || active;
        btn.onclick = () => {
          void (async () => {
            if (!battle) return;
            busy = true;
            await stageRecall('player');
            const ok = forceSwitchPlayer(battle, party, i);
            if (!ok) {
              await stageFaintAndExit(false);
              resolve();
              return;
            }
            playerSpeciesId = battle.player.speciesId;
            await stageSendOut('player', playerSpeciesId, 1);
            dispAllyHp = battle.player.hp;
            syncBattleHud();
            setMsg(`Go! ${battle.player.name}!`);
            moveMenu.classList.add('hidden');
            battleMenu?.classList.remove('hidden');
            busy = false;
            updateSwapButton();
            resolve();
          })();
        };
        moveMenu.appendChild(btn);
      });
    });
  }

  function renderMoveMenu(): void {
    if (!battle || !moveMenu) return;
    moveMenu.innerHTML = '';
    moveMenu.classList.remove('hidden');
    battleMenu?.classList.add('hidden');
    const pps = battle.player.movePp;
    let anyPp = false;
    battle.player.moves.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      const ppLeft = pps ? pps[i]! : m.pp;
      if (ppLeft > 0) anyPp = true;
      const ppMax = m.pp;
      btn.innerHTML = `${m.name}<span class="sub">${m.type} · ${m.category === 'status' ? 'status' : `pwr ${m.power ?? '—'}`} · PP ${ppLeft}/${ppMax}</span>`;
      // 0-PP moves disabled; Struggle offered when all empty (no Fight soft-lock)
      btn.disabled = busy || ppLeft <= 0;
      btn.onclick = () => void doPlayerMove(i);
      moveMenu.appendChild(btn);
    });
    if (!anyPp && battle.player.moves.length > 0) {
      const str = document.createElement('button');
      str.className = 'btn';
      str.innerHTML = `Struggle<span class="sub">desperate · typeless · recoil</span>`;
      str.disabled = busy;
      str.onclick = () => void doPlayerMove(0, true);
      moveMenu.appendChild(str);
    }
    const back = document.createElement('button');
    back.className = 'btn ghost';
    back.textContent = 'Back';
    back.onclick = () => {
      moveMenu.classList.add('hidden');
      battleMenu?.classList.remove('hidden');
    };
    moveMenu.appendChild(back);
  }

  function renderSwapMenu(): void {
    if (!battle || !moveMenu || party.length < 2) return;
    moveMenu.innerHTML = '';
    moveMenu.classList.remove('hidden');
    battleMenu?.classList.add('hidden');
    party.forEach((m, i) => {
      const b = m.battler;
      const btn = document.createElement('button');
      btn.className = 'btn';
      const active = (battle!.playerPartyIndex ?? 0) === i || battle!.player.speciesId === b.speciesId;
      btn.innerHTML = `${b.name}<span class="sub">Lv.${b.level} · ${b.hp}/${b.maxHp}${active ? ' · out' : ''}</span>`;
      btn.disabled = busy || b.hp <= 0 || !!b.fainted || active;
      btn.onclick = () => {
        void (async () => {
          if (!battle || busy) return;
          busy = true;
          updateSwapButton();
          await stageRecall('player');
          switchPlayerTo(battle, party, i);
          playerSpeciesId = battle.player.speciesId;
          await stageSendOut('player', playerSpeciesId, 1);
          dispAllyHp = battle.player.hp;
          syncBattleHud();
          setMsg(battle.log[battle.log.length - 1]?.message ?? `Go! ${battle.player.name}!`);
          // Voluntary switch spends the turn — foe acts
          await resolveFoeOnlyTurn();
          moveMenu.classList.add('hidden');
          if (!battle.over && !battle.needsForceSwitch) {
            battleMenu?.classList.remove('hidden');
          }
          if (!battle.over && !battle.needsForceSwitch) busy = false;
          updateSwapButton();
        })();
      };
      moveMenu.appendChild(btn);
    });
    const back = document.createElement('button');
    back.className = 'btn ghost';
    back.textContent = 'Back';
    back.onclick = () => {
      moveMenu.classList.add('hidden');
      battleMenu?.classList.remove('hidden');
    };
    moveMenu.appendChild(back);
  }

  /**
   * Lunge attacker; fires onApex at punch peak (u≈0.5), then returns to rest.
   * Juice sandwich: flash+HP at apex, not at rest.
   */
  async function playLunge(
    who: 'player' | 'foe',
    ms = 140,
    onApex?: () => void,
  ): Promise<void> {
    const mesh = who === 'player' ? playerMesh : foeMesh;
    const st = mesh ? getClipState(mesh) : undefined;
    if (st) playAttack(st);
    const t0 = performance.now();
    let apexDone = false;
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / ms, 0, 1);
        const punch = Math.sin(u * Math.PI);
        if (who === 'player') playerLunge = punch * 0.55;
        else foeLunge = punch * 0.55;
        if (!apexDone && u >= 0.48) {
          apexDone = true;
          onApex?.();
        }
        if (u < 1) requestAnimationFrame(step);
        else {
          if (who === 'player') playerLunge = 0;
          else foeLunge = 0;
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  type JuiceHit = {
    side: 'player' | 'foe';
    damage: number;
    effectiveness?: number;
    critical?: boolean | number;
    message?: string;
  };

  function collectHits(log: BattleEvent[], fromIndex: number): JuiceHit[] {
    const hits: JuiceHit[] = [];
    for (let i = fromIndex; i < log.length; i++) {
      const e = log[i];
      if (e.type === 'damage' && e.side && e.damage != null) {
        hits.push({
          side: e.side,
          damage: e.damage,
          effectiveness: e.effectiveness,
          critical: e.critical,
          message: e.message,
        });
      }
      // Standalone crit event also counts
      if (e.type === 'crit') {
        const last = hits[hits.length - 1];
        if (last) last.critical = true;
      }
    }
    return hits;
  }

  /** Deep-ish battler clone so catch member does not share refs with live foe */
  function cloneBattlerForParty(b: Battler): Battler {
    return {
      ...b,
      id: `caught-${b.speciesId}-${Date.now()}`,
      types: b.types.slice(),
      moves: b.moves.map((m) => ({ ...m })),
      movePp: b.movePp ? b.movePp.slice() : b.moves.map((m) => m.pp),
      stages: b.stages ? { ...b.stages } : { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      baseStats: b.baseStats ? { ...b.baseStats } : b.baseStats,
    };
  }

  /** Parse lower-atk-1 / raise-def-1 style status effects (matches battle engine). */
  function parseShellStatusEffect(
    effect: string | undefined,
  ): { stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe'; delta: number } | null {
    if (!effect) return null;
    const m = /^(lower|raise)-([a-z]+)-(\d+)$/i.exec(effect);
    if (!m) return null;
    const dir = m[1]!.toLowerCase() === 'lower' ? -1 : 1;
    const rawStat = m[2]!.toLowerCase();
    const map: Record<string, 'atk' | 'def' | 'spa' | 'spd' | 'spe'> = {
      atk: 'atk',
      attack: 'atk',
      def: 'def',
      defense: 'def',
      spa: 'spa',
      spatk: 'spa',
      spd: 'spd',
      spdef: 'spd',
      spe: 'spe',
      speed: 'spe',
    };
    const stat = map[rawStat];
    if (!stat) return null;
    const n = Math.max(1, parseInt(m[3]!, 10) || 1);
    return { stat, delta: dir * n };
  }

  function applyShellStage(
    target: Battler,
    side: 'player' | 'foe',
    stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe',
    delta: number,
    moveName: string,
  ): string {
    if (!target.stages) target.stages = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const before = target.stages[stat] ?? 0;
    const after = Math.max(-6, Math.min(6, before + delta));
    target.stages[stat] = after;
    const applied = after - before;
    if (applied === 0) {
      const msg = `${target.name}'s ${stat.toUpperCase()} won't go any ${delta < 0 ? 'lower' : 'higher'}!`;
      battle?.log.push({ type: 'status', side, stageStat: stat, stageDelta: 0, message: msg });
      return msg;
    }
    const dir = applied < 0 ? 'fell' : 'rose';
    const hard = Math.abs(applied) >= 2 ? ' sharply' : '';
    const msg = `${target.name}'s ${stat.toUpperCase()} ${dir}${hard}! (${moveName})`;
    battle?.log.push({ type: 'status', side, stageStat: stat, stageDelta: applied, message: msg });
    return msg;
  }

  /** Foe acts alone (after catch fail or voluntary switch). Shell-side half-turn. */
  async function resolveFoeOnlyTurn(): Promise<void> {
    if (!battle || battle.over) return;
    const foeIdx = pickFoeMove(battle.foe, battle.player, raw.typeChart);
    let move = battle.foe.moves[foeIdx];
    if (!move) return;

    // Spend PP if available; 0-PP → Struggle
    if (!battle.foe.movePp || battle.foe.movePp.length !== battle.foe.moves.length) {
      battle.foe.movePp = battle.foe.moves.map((m) => m.pp);
    }
    const pp = battle.foe.movePp[foeIdx]!;
    let usesStruggle = false;
    if (pp > 0) battle.foe.movePp[foeIdx] = pp - 1;
    else {
      usesStruggle = true;
      move = {
        id: 'struggle',
        name: 'Struggle',
        type: 'normal',
        category: 'physical',
        power: 50,
        accuracy: null,
        pp: 1,
        priority: 0,
      };
    }

    battle.log.push({
      type: 'move',
      side: 'foe',
      moveId: move.id,
      message: `${battle.foe.name} used ${move.name}!`,
    });

    // Accuracy
    if (move.accuracy != null) {
      if (Math.random() * 100 >= move.accuracy) {
        battle.log.push({
          type: 'miss',
          side: 'foe',
          moveId: move.id,
          message: `${battle.foe.name}'s attack missed!`,
        });
        setMsg(`${battle.foe.name}'s attack missed!`);
        await playLunge('foe', 100);
        await waitMs(220);
        return;
      }
    }

    if (!usesStruggle && (move.category === 'status' || move.power == null || move.power <= 0)) {
      // Apply status stage deltas (same contract as executeTurn)
      const parsed = parseShellStatusEffect(move.effect);
      let statusMsg = `${battle.foe.name} used ${move.name}!`;
      if (parsed) {
        const tSide: 'player' | 'foe' = parsed.delta < 0 ? 'player' : 'foe';
        const target = tSide === 'player' ? battle.player : battle.foe;
        statusMsg = applyShellStage(target, tSide, parsed.stat, parsed.delta, move.name);
      } else {
        battle.log.push({ type: 'message', side: 'foe', message: `${move.name} had no effect.` });
        statusMsg = `${move.name} had no effect.`;
      }
      await playLunge('foe', 120, () => {
        setMsg(statusMsg);
      });
      await waitMs(280);
      syncBattleHud();
      return;
    }

    const atk = effectiveStat(battle.foe, move.category === 'physical' ? 'atk' : 'spa');
    const def = effectiveStat(battle.player, move.category === 'physical' ? 'def' : 'spd');
    const stab = usesStruggle ? 1 : stabMultiplier(move.type, battle.foe.types);
    const eff = usesStruggle ? 1 : typeEffectiveness(move.type, battle.player.types, battle.typeChart);
    const crit = rollCritical(Math.random());
    const result = calcDamage({
      level: battle.foe.level,
      attack: atk,
      defense: def,
      power: move.power!,
      stab,
      typeEffectiveness: eff,
      random: rollDamageRandom(Math.random()),
      critical: crit.multiplier,
    });
    const dealt = Math.min(result.damage, Math.max(0, battle.player.hp));
    battle.player.hp = Math.max(0, battle.player.hp - dealt);
    battle.log.push({
      type: 'damage',
      side: 'player',
      damage: dealt,
      effectiveness: eff,
      critical: crit.isCrit,
      moveId: move.id,
      message: `${battle.foe.name} hits ${battle.player.name} for ${dealt}!`,
    });

    let impactDur = 0;
    await playLunge('foe', 130, () => {
      if (!battle) return;
      flashEffectivenessAndCrit(eff, crit.isCrit);
      impactDur = hpDrainMs(dealt, battle.player.maxHp);
      dispAllyHp = battle.player.hp;
      setHpBar(allyHp, dispAllyHp, battle.player.maxHp, impactDur);
      if (allyHpText) allyHpText.textContent = `${battle.player.hp}/${battle.player.maxHp}`;
      setMsg(
        crit.isCrit && eff >= 2
          ? `Critical hit! Super effective! (${dealt})`
          : crit.isCrit
            ? `Critical hit! ${dealt} damage!`
            : eff >= 2
              ? `It's super effective! (${dealt})`
              : `${battle.foe.name} hits for ${dealt}!`,
      );
    });
    await waitMs(Math.max(impactDur, 80));

    if (battle.player.hp <= 0) {
      battle.player.fainted = true;
      battle.log.push({ type: 'faint', side: 'player', message: `${battle.player.name} fainted!` });
      const hasReserve = party.some(
        (m, i) => i !== (battle!.playerPartyIndex ?? 0) && m.battler.hp > 0 && !m.battler.fainted,
      );
      if (hasReserve) {
        battle.needsForceSwitch = true;
        await handleForceSwitch();
      } else {
        battle.over = true;
        battle.winner = 'foe';
        await stageFaintAndExit(false);
      }
    } else {
      syncBattleHud();
    }
  }

  async function doPlayerMove(index: number, forceStruggle = false): Promise<void> {
    if (!battle || busy || battle.over) return;
    const pp = battle.player.movePp;
    const allEmpty =
      !!pp &&
      battle.player.moves.length > 0 &&
      battle.player.moves.every((_, i) => (pp[i] ?? 0) <= 0);
    if (!forceStruggle && pp && (pp[index] ?? 0) <= 0) {
      if (allEmpty) {
        // Fall through as Struggle via engine 0-PP substitute
        forceStruggle = true;
      } else {
        showToast('No PP left!');
        return;
      }
    }
    busy = true;
    updateSwapButton();
    clearEffClasses();
    moveMenu?.classList.add('hidden');

    mark('move-confirm');

    const logStart = battle.log.length;
    const foeIdx = pickFoeMove(battle.foe, battle.player, raw.typeChart);
    // Live rolls: omit pinned random so crit/acc/damage independent
    // 0-PP / Struggle: engine substitutes when chosen move PP is 0
    executeTurn(battle, {
      playerMoveIndex: index,
      foeMoveIndex: foeIdx,
      party,
      liveRolls: true,
    });

    const hits = collectHits(battle.log, logStart);
    const msgs = battle.log.slice(logStart).filter((e) => e.message).map((e) => e.message!);

    // Lunge the attacker; flash+HP at apex (u≈0.5), not at rest
    let firstAttackMarked = false;
    for (const hit of hits) {
      const attacker: 'player' | 'foe' = hit.side === 'foe' ? 'player' : 'foe';
      const crit = isCritEvent(hit.critical);
      const eff = hit.effectiveness ?? 1;
      let drainMs = 0;
      await playLunge(attacker, attacker === 'player' ? 150 : 130, () => {
        if (!firstAttackMarked) {
          firstAttackMarked = true;
          mark('first-attack-frame');
          measureLog('move→first-attack-frame', 'move-confirm', 'first-attack-frame', 180);
        }
        flashEffectivenessAndCrit(eff, crit);
        if (crit) battleMsg?.classList.add('eff-crit');
        if (eff >= 2) battleMsg?.classList.add('eff-se');
        else if (eff > 0 && eff <= 0.5) battleMsg?.classList.add('eff-nve');

        if (crit && eff >= 2) {
          setMsg(hit.message ? `${hit.message} Critical hit!` : "Critical hit! It's super effective!");
        } else if (crit) {
          setMsg(
            hit.message && !/critical/i.test(hit.message)
              ? `${hit.message} Critical hit!`
              : hit.message ?? 'Critical hit!',
          );
        } else if (eff >= 2) {
          setMsg(hit.message ?? "It's super effective!");
        } else if (eff > 0 && eff <= 0.5) {
          setMsg(hit.message ?? "It's not very effective…");
        } else {
          setMsg(hit.message ?? (msgs.join(' ') || '…'));
        }

        if (hit.side === 'foe') {
          drainMs = hpDrainMs(hit.damage, battle!.foe.maxHp);
          dispEnemyHp = battle!.foe.hp;
          setHpBar(enemyHp, dispEnemyHp, battle!.foe.maxHp, drainMs);
        } else if (hit.damage > 0) {
          drainMs = hpDrainMs(hit.damage, battle!.player.maxHp);
          dispAllyHp = battle!.player.hp;
          setHpBar(allyHp, dispAllyHp, battle!.player.maxHp, drainMs);
          if (allyHpText) allyHpText.textContent = `${battle!.player.hp}/${battle!.player.maxHp}`;
        } else {
          drainMs = 220;
        }
      });
      // Hold contact / drain after apex; lunge already zeroed at end of playLunge
      await waitMs(Math.max(drainMs, 80));
      clearEffClasses();
    }

    if (hits.length === 0) {
      // Status / miss — apex-timed first-attack-frame mark
      await playLunge('player', 150, () => {
        mark('first-attack-frame');
        measureLog('move→first-attack-frame', 'move-confirm', 'first-attack-frame', 180);
        setMsg(msgs.join(' ') || '…');
      });
      await waitMs(280);
    }

    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;
    syncBattleHud();

    if (battle.over) {
      const win = battle.winner === 'player';
      await stageFaintAndExit(!!win);
    } else if (battle.needsForceSwitch) {
      await handleForceSwitch();
    } else {
      busy = false;
      battleMenu?.classList.remove('hidden');
      updateSwapButton();
    }
  }

  // Starter picker — show overlay once cards exist
  if (starterRow) {
    starterRow.innerHTML = '';
    for (const [index, id] of raw.route.starterChoices.entries()) {
      const sp = speciesById.get(id);
      if (!sp) continue;
      const card = document.createElement('button');
      card.className = 'starter-card interactive';
      card.dataset.species = id;
      const accent = SHIP_COLOR[id] ?? 0x7ec8ff;
      card.style.setProperty('--accent-c', `#${accent.toString(16).padStart(6, '0')}`);
      card.innerHTML = `<span class="starter-index">0${index + 1}</span><span class="starter-copy"><span class="name">${sp.name}</span><span class="types">${sp.types.join(' · ')}</span><span class="blurb">${sp.flavor ?? ''}</span></span><span class="starter-choose">Choose</span>`;
      const focusStarter = () => {
        starterFocus = index;
        for (const [j, button] of [...starterRow.querySelectorAll('.starter-card')].entries()) {
          button.classList.toggle('selected', j === index);
        }
      };
      card.addEventListener('mouseenter', focusStarter);
      card.addEventListener('focus', focusStarter);
      card.onclick = () => {
        playerSpeciesId = id;
        scene.remove(starterStage);
        if (playerMesh) scene.remove(playerMesh);
        playerMesh = shipCreatureMesh(id, 1);
        enableCast(playerMesh);
        // Spawn at explore default — no hard pop pos.z 1.2 vs 2.5
        const spawnPos = { x: 0, z: 2.5 };
        playerMesh.position.set(spawnPos.x, 0, spawnPos.z);
        scene.add(playerMesh);
        starterOverlay?.classList.remove('show');
        starterOverlay?.classList.add('hidden');
        if (starterOverlay) starterOverlay.style.display = 'none';
        mode = 'explore';
        document.body.dataset.mode = 'explore';
        explore = createExploreState({
          speed: 4.6,
          runMultiplier: 1.85,
          pos: { ...spawnPos },
          yaw: Math.PI,
        });
        party = createParty([
          {
            battler: battlerFromSpecies(id, raw.route.playerDefaultLevel, 'player'),
          },
        ]);
        bindExploreKeys(explore.keys);
        canvas.tabIndex = 0;
        canvas.focus({ preventScroll: true });

        const y0 = explore.yaw || 0;
        camFollow.yaw = y0;
        camFollow.ready = true;
        const px0 = explore.pos.x;
        const pz0 = explore.pos.z;
        playerMesh.position.set(px0, 0, pz0);
        camFollow.pos.set(
          px0 - Math.sin(y0) * camFollow.dist,
          camFollow.height,
          pz0 - Math.cos(y0) * camFollow.dist,
        );
        camFollow.look.set(px0, 0.75, pz0);
        camera.position.copy(camFollow.pos);
        camera.lookAt(camFollow.look);

        renderPartyStrip();
        showToast(`${sp.name} chose you. Follow the lantern path into the whispergrass.`);
        updateSwapButton();
      };
      starterRow.appendChild(card);
    }
    // Cold boot: reveal starter once cards exist (capture + human)
    if (starterRow.children.length > 0) {
      starterRow.querySelector('.starter-card')?.classList.add('selected');
      starterOverlay?.classList.add('show');
      starterOverlay?.classList.remove('hidden');
      if (starterOverlay) starterOverlay.style.display = '';
    }
  }

  battleMenu?.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => {
      const act = (el as HTMLElement).dataset.act;
      if (act === 'fight') renderMoveMenu();
      else if (act === 'swap') {
        if (party.length > 1) renderSwapMenu();
      } else if (act === 'run' && battle) {
        if (battleKind !== 'wild') {
          showToast("Can't run from a trainer battle!");
          return;
        }
        exitBattle('Got away safely!');
      } else if (act === 'ball' && battle && !battle.over) {
        if (battleKind !== 'wild') {
          showToast("Can't catch a trainer's creature!");
          return;
        }
        if (busy) return;
        if (!partyCanAdd(party)) {
          showToast('Party is full — can\'t catch more!');
          setMsg('Your party is full!');
          return;
        }
        busy = true;
        updateSwapButton();
        const foe = battle.foe;
        const sp = speciesById.get(foe.speciesId);
        const rate = speciesCatchRate({
          catchRate: (sp as { catchRate?: number } | undefined)?.catchRate,
          role: (sp as { role?: string } | undefined)?.role ?? 'wild',
        });
        mark('ball-throw-start');
        ballArcT = 0;
        ballMesh.visible = true;
        const res = attemptCatch({
          maxHp: foe.maxHp,
          hp: foe.hp,
          catchRate: rate,
          seed: (Date.now() ^ foe.hp) >>> 0,
        });
        setMsg('You threw a ball!');
        // Arc presentation then shakes
        const arcMs = 420;
        setTimeout(() => {
          mark('ball-throw-impact');
          setMsg(res.messages.join(' '));
          for (let i = 0; i < res.shakes; i++) {
            mark(`ball-shake-${i}`);
            if (foeMesh) {
              const origX = foeMesh.position.x;
              setTimeout(() => {
                if (foeMesh) foeMesh.position.x = origX + (i % 2 ? 0.15 : -0.15);
                setTimeout(() => {
                  if (foeMesh) foeMesh.position.x = origX;
                }, 90);
              }, 180 + i * 140);
            }
          }
          setTimeout(() => {
            ballMesh.visible = false;
            ballArcT = -1;
            void (async () => {
              if (!battle) {
                busy = false;
                return;
              }
              if (res.caught) {
                mark('ball-catch-ok');
                if (!partyCanAdd(party)) {
                  showToast('Party is full — can\'t catch more!');
                  setMsg('Your party is full!');
                  busy = false;
                  battleMenu?.classList.remove('hidden');
                  updateSwapButton();
                  return;
                }
                const member = { battler: cloneBattlerForParty(foe) };
                const ok = addToParty(party, member);
                if (!ok) {
                  showToast('Party is full!');
                  busy = false;
                  battleMenu?.classList.remove('hidden');
                  updateSwapButton();
                  return;
                }
                catchCount += 1;
                renderPartyStrip();
                exitBattle('Gotcha! ' + foe.name + ' joined the party!');
                busy = false;
                updateSwapButton();
              } else {
                mark('ball-catch-fail');
                setMsg('Oh no! It broke free!');
                // Failed catch spends the turn — foe acts
                await resolveFoeOnlyTurn();
                if (battle && !battle.over && !battle.needsForceSwitch) {
                  busy = false;
                  battleMenu?.classList.remove('hidden');
                }
                updateSwapButton();
              }
            })();
          }, 900 + res.shakes * 140);
        }, arcMs);
      }
    });
  });

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (useMedium && gfxPreset) {
      // Keep render buffer locked to preset (F gate work path)
      renderer.setSize(gfxPreset.width, gfxPreset.height, false);
      renderer.setPixelRatio(Math.min(devicePixelRatio, maxPr));
    } else {
      renderer.setSize(w, h);
    }
  });

  progress(1, 'Ready');
  showToast(
    useMedium
      ? `Twilight Route · medium preset DPR≤${maxPr}`
      : 'Twilight Route · Wave-0 · original ship pack only',
  );
  requestAnimationFrame(() => {
    bootEl?.classList.add('done');
    setTimeout(() => bootEl?.remove(), 900);
  });

  let t0 = performance.now();
  let lastFrame = performance.now();
  const tick = (now: number) => {
    const dt = Math.min(0.1, Math.max(0.005, (now - lastFrame) / 1000));
    lastFrame = now;
    const t = (now - t0) / 1000;
    scenery.update(t);

    // Dust life (upward drift + soft fade)
    for (let i = dustLife.length - 1; i >= 0; i--) {
      const d = dustLife[i] as { mesh: THREE.Mesh; t: number; life: number; vy?: number };
      d.t += dt;
      const u = d.t / d.life;
      const mat = d.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 * (1 - u);
      d.mesh.position.y += (d.vy ?? 0.3) * dt;
      d.mesh.scale.setScalar(0.85 + u * 1.6);
      if (u >= 1) {
        d.mesh.visible = false;
        dustLife.splice(i, 1);
      }
    }

    // Grass rustle particles
    for (let i = rustleLife.length - 1; i >= 0; i--) {
      const r = rustleLife[i];
      r.t += dt;
      const u = r.t / r.life;
      r.mesh.position.y += r.vy * dt;
      const mat = r.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 * (1 - u);
      if (u >= 1) {
        r.mesh.visible = false;
        rustleLife.splice(i, 1);
      }
    }

    // Grass ambient sway (subset on medium) + local rustle boost
    grassRustleBoost = Math.max(0, grassRustleBoost - dt * 3.5);
    const swayStep = useMedium ? 2 : 1;
    for (let i = 0; i < grassBlades.length; i += swayStep) {
      const b = grassBlades[i];
      const base = grassBaseRot[i];
      const local =
        explore && mode === 'explore'
          ? Math.hypot(b.position.x - explore.pos.x, b.position.z - explore.pos.z)
          : 99;
      const near = local < 1.1 ? grassRustleBoost : grassRustleBoost * 0.15;
      const sway = Math.sin(t * 2.1 + i * 0.4) * 0.06 + near * Math.sin(t * 18 + i) * 0.4;
      b.rotation.z = base + sway;
    }

    // Ball throw arc (player → foe)
    if (ballArcT >= 0 && ballArcT < 1) {
      ballArcT = Math.min(1, ballArcT + dt / 0.42);
      const u = ballArcT;
      const sx = 1.8;
      const sz = 1.4;
      const ex = -1.6;
      const ez = -0.8;
      const x = sx + (ex - sx) * u;
      const z = sz + (ez - sz) * u;
      const y = 0.6 + Math.sin(u * Math.PI) * 1.4;
      ballMesh.position.set(x, y, z);
      ballMesh.rotation.x += dt * 12;
      ballMesh.rotation.z += dt * 9;
    }

    // Decay battle cam punches
    battleCam.punch *= Math.exp(-dt * 4.5);
    battleCam.lowAngle *= Math.exp(-dt * 2.8);

    if (mode === 'explore' && explore && playerMesh) {
      if (healCooldown > 0) healCooldown = Math.max(0, healCooldown - dt);

      const res = tickExplore(explore, dt);
      playerMesh.position.x = explore.pos.x;
      playerMesh.position.z = explore.pos.z;
      playerBobPhase += res.speed * dt * 8;
      // Clip idle handles bob; keep base at 0
      const st = getClipState(playerMesh);
      if (st) {
        st.baseY = 0;
        st.baseRotY = explore.yaw;
      }
      playerMesh.position.y = 0;
      playerMesh.rotation.y = explore.yaw;

      playerContact.position.set(explore.pos.x, 0.03, explore.pos.z);
      playerContact.visible = true;

      if (res.footPlant) {
        const side = explore.footPhase === 0 ? -1 : 1;
        spawnDust(explore.pos.x, explore.pos.z, side, res.inGrass, explore.runBlend);
      }

      if (res.grassRustle || (res.inGrass && res.moved)) {
        if (res.grassRustle) {
          grassRustleBoost = Math.min(1, grassRustleBoost + 0.75);
          spawnGrassPart(explore.pos.x, explore.pos.z);
          spawnGrassPart(explore.pos.x, explore.pos.z);
        }
      }

      // Heal on pad rim (solid blocks center)
      if (healCooldown <= 0 && isOnHealPad(explore.pos, healPad) && party.length > 0) {
        healParty(party);
        healCooldown = 2.5;
        healCount += 1;
        renderPartyStrip();
        showToast('Moonwell restored every partner.');
        playerMesh.scale.setScalar(1.1);
        setTimeout(() => {
          if (playerMesh) playerMesh.scale.setScalar(1);
        }, 160);
      }

      // Gym / elite interact (E)
      const wantInteract = explore.keys.has('e');
      if (!wantInteract) interactArmed = true;
      if (res.nearInteract && interactArmed && wantInteract && !busy) {
        interactArmed = false;
        if (res.nearInteract === 'gym' && raw.route.gym) {
          busy = true;
          void enterBattle(raw.route.gym.species, raw.route.gym.level, 'gym').finally(() => {
            busy = false;
          });
        } else if (res.nearInteract === 'elite' && raw.route.elite) {
          if (!gymCleared) {
            showToast('Clear the gym lantern first.');
          } else {
            busy = true;
            void enterBattle(raw.route.elite.species, raw.route.elite.level, 'elite').finally(() => {
              busy = false;
            });
          }
        }
      } else if (res.nearInteract && !busy) {
        // Soft prompt
        if (Math.floor(t * 2) % 4 === 0) {
          /* toast throttled below via flag */
        }
      }

      if (res.encounter && !busy) {
        busy = true;
        const w = pickWild();
        void enterBattle(w.species, w.level, 'wild').finally(() => {
          busy = false;
        });
      }

      const yawBlend = 1 - Math.exp(-4.2 * dt);
      const posBlend = 1 - Math.exp(-6.5 * dt);
      const lookBlend = 1 - Math.exp(-8 * dt);
      let dy = explore.yaw - camFollow.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      camFollow.yaw += dy * yawBlend;

      // Collision-aware camera pull-in vs landmarks
      const safeDist = cameraCollisionDist(
        playerMesh.position.x,
        playerMesh.position.z,
        camFollow.yaw,
        camFollow.dist,
        explore.obstacles,
      );
      const idealX = playerMesh.position.x - Math.sin(camFollow.yaw) * safeDist;
      const idealZ = playerMesh.position.z - Math.cos(camFollow.yaw) * safeDist;
      const idealY = camFollow.height + (camFollow.dist - safeDist) * 0.15;
      camFollow.pos.x += (idealX - camFollow.pos.x) * posBlend;
      camFollow.pos.z += (idealZ - camFollow.pos.z) * posBlend;
      camFollow.pos.y += (idealY - camFollow.pos.y) * posBlend;

      // Look slightly ahead of player toward facing so route + grass + landmarks read in stills
      const lookLead = 1.35;
      const lx = playerMesh.position.x + Math.sin(camFollow.yaw) * lookLead;
      const ly = 0.85;
      const lz = playerMesh.position.z + Math.cos(camFollow.yaw) * lookLead;
      camFollow.look.x += (lx - camFollow.look.x) * lookBlend;
      camFollow.look.y += (ly - camFollow.look.y) * lookBlend;
      camFollow.look.z += (lz - camFollow.look.z) * lookBlend;

      camera.position.copy(camFollow.pos);
      camera.lookAt(camFollow.look);
      tickMeshClips(dt, t);
      // Re-apply XZ after clip (clip may touch z on attack)
      playerMesh.position.x = explore.pos.x;
      playerMesh.position.z = explore.pos.z;
    } else if (mode === 'battle') {
      playerContact.visible = true;
      // Staging base Z; clip may write relative Z delta; shell lunge composes after tick
      const PLAYER_BATTLE_Z = 1.4;
      const FOE_BATTLE_Z = -0.8;
      if (playerMesh) {
        playerMesh.position.x = 1.8;
        playerMesh.position.z = 0; // clip writes Z delta from 0
        playerMesh.position.y = -playerSink * 1.1;
        playerMesh.rotation.y = -0.55;
        if (playerSink > 0) {
          playerMesh.scale.setScalar(Math.max(0.05, 1 - playerSink * 0.35));
        }
        const st = getClipState(playerMesh);
        if (st) {
          st.baseY = -playerSink * 1.1;
          st.baseRotY = -0.55;
        }
      }
      if (foeMesh) {
        foeMesh.position.x = -1.6;
        foeMesh.position.z = 0;
        foeMesh.position.y = -foeSink * 1.1;
        foeMesh.rotation.y = 0.55;
        if (foeSink > 0) {
          foeMesh.scale.setScalar(Math.max(0.05, 1 - foeSink * 0.35));
        }
        const st = getClipState(foeMesh);
        if (st) {
          st.baseY = -foeSink * 1.1;
          st.baseRotY = 0.55;
        }
      }
      tickMeshClips(dt, t);
      // baseZ + clipΔ + shell lunge (never absolute-overwrite staging)
      if (playerMesh) {
        const clipZ = playerMesh.position.z; // attack: -lunge; idle: 0
        playerMesh.position.x = 1.8 - playerLunge * 0.9;
        playerMesh.position.z = PLAYER_BATTLE_Z + clipZ - playerLunge * 0.55;
        playerContact.position.set(playerMesh.position.x, 0.03, playerMesh.position.z);
      }
      if (foeMesh) {
        const clipZ = foeMesh.position.z;
        foeMesh.position.x = -1.6 + foeLunge * 0.9;
        // Foe faces +Z toward player; clip -lunge is toward camera, flip for stage
        foeMesh.position.z = FOE_BATTLE_Z - clipZ + foeLunge * 0.55;
        foeContact.position.set(foeMesh.position.x, 0.03, foeMesh.position.z);
        foeContact.visible = true;
      }
      // Battle camera: base + impact punch + send-out low angle
      const punch = battleCam.punch;
      const low = battleCam.lowAngle;
      const bx = battleCam.base.x + punch * 0.15;
      const by = battleCam.base.y - low * 0.85 - punch * 0.2;
      const bz = battleCam.base.z - punch * 1.1 - low * 0.4;
      camera.position.x += (bx - camera.position.x) * Math.min(1, 3 * dt);
      camera.position.y += (by - camera.position.y) * Math.min(1, 3 * dt);
      camera.position.z += (bz - camera.position.z) * Math.min(1, 3 * dt);
      camera.lookAt(0.1, battleCam.lookY - foeSink * 0.3 - playerSink * 0.15 - low * 0.2, 0.2);
    } else {
      // Starter ceremony: slow cinematic drift while all three live models idle.
      const ceremonyX = Math.sin(t * 0.18) * 0.16;
      camera.position.x += (ceremonyX - camera.position.x) * Math.min(1, 2 * dt);
      camera.position.y += (2.85 - camera.position.y) * Math.min(1, 2 * dt);
      camera.position.z += (7.25 - camera.position.z) * Math.min(1, 2 * dt);
      camera.lookAt(0, 0.82, 0.55);
      for (let i = 0; i < starterMeshes.length; i++) {
        const model = starterMeshes[i]!;
        const st = getClipState(model);
        if (st) tickCreatureClip(model, st, dt, t);
        const targetScale = i === starterFocus ? 1.08 : 0.92;
        const easedScale = model.scale.x + (targetScale - model.scale.x) * Math.min(1, dt * 7);
        model.scale.setScalar(easedScale);
        starterLights[i]!.intensity += ((i === starterFocus ? 2.8 : 1.15) - starterLights[i]!.intensity) * Math.min(1, dt * 7);
      }
      playerContact.visible = false;
    }

    // Subtle heal pad pulse
    healGlow.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.12;
    gymOrb.position.y = 1.75 + Math.sin(t * 2.1) * 0.06;
    eliteOrb.position.y = 1.95 + Math.sin(t * 1.7 + 1) * 0.07;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch(fatal);
