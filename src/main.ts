/**
 * Twilight Route — Wave-0 playable shell.
 * Loads content/game/wave0.json only (ship pack). Pure battle sim + Three presentation.
 * W2-P1: graded sky, starter boot, ship creature meshes, battle AV marks.
 */
import * as THREE from 'three';
import {
  buildBattler,
  createBattle,
  executeTurn,
  pickFirstDamagingMove,
  switchPlayerTo,
} from './battle/battle.ts';
import { normalizeMove, normalizeSpecies } from './battle/content.ts';
import type { BattleEvent, BattleState, Battler, MoveDef, TypeChart } from './battle/types.ts';
import {
  createExploreState,
  tickExplore,
  bindExploreKeys,
  isOnHealPad,
  createDefaultHealPad,
  type ExploreState,
} from './world/explore.ts';
import { attemptCatch, speciesCatchRate } from './battle/catch.ts';
import { createParty, healParty, addToParty, syncBattlerToParty, type PartyMember } from './battle/party.ts';
import {
  makeCreatureMesh,
  SPECIES_COLOR,
  getClipState,
  playAttack,
  playFaint,
  tickCreatureClip,
} from './creatures/index.ts';

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
    wildEncounters: { species: string; minLevel: number; maxLevel: number; weight: number }[];
    playerDefaultLevel: number;
  };
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

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

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

  // Soft follow state (lagged yaw + lerped position)
  const camFollow = {
    yaw: 0,
    pos: new THREE.Vector3(0, 3.2, 7.5),
    look: new THREE.Vector3(0, 0.8, 0),
    dist: 5.2,
    height: 3.15,
    ready: false,
  };

  // Soft GI bar: ambient + hemi + key + fill (readable under ACES)
  scene.add(new THREE.AmbientLight(0xd8e6ff, 0.42));
  const hemi = new THREE.HemisphereLight(0xffe2c4, 0x3a6b48, 0.85);
  hemi.position.set(0, 12, 0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2dd, 1.55);
  key.position.set(5, 12, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x88aadd, 0.55);
  fill.position.set(-6, 4, -3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffb090, 0.35);
  rim.position.set(-2, 2, 6);
  scene.add(rim);

  // Brighter ground disc + path strip + town/heal landmarks
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

  // Dirt path toward grass / hollow
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 10),
    new THREE.MeshStandardMaterial({ color: 0xc4a878, roughness: 0.95, metalness: 0 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, 1.5);
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
  scene.add(stone);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.45, 4),
    new THREE.MeshStandardMaterial({ color: 0xd47858, roughness: 0.65 }),
  );
  roof.position.set(5.2, 0.75, 5.6);
  roof.rotation.y = Math.PI / 4;
  scene.add(roof);

  // Tall grass ring (encounter zone) — brighter albedo variety
  const grassColors = [0x5cbc6a, 0x48a858, 0x6fd47a, 0x3d9a52, 0x7ae08a];
  const grassBlades: THREE.Mesh[] = [];
  const grassBaseRot: number[] = [];
  for (let i = 0; i < 48; i++) {
    const gCol = grassColors[i % grassColors.length];
    const grassMat = new THREE.MeshStandardMaterial({
      color: gCol,
      roughness: 0.72,
      metalness: 0.02,
      emissive: gCol,
      emissiveIntensity: 0.06,
    });
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.75 + Math.random() * 0.45, 5), grassMat);
    const a = (i / 48) * Math.PI * 2;
    const r = 2.0 + Math.random() * 2.0;
    blade.position.set(Math.cos(a) * r, 0.38, Math.sin(a) * r - 1.2);
    blade.rotation.z = (Math.random() - 0.5) * 0.2;
    grassBaseRot.push(blade.rotation.z);
    grassBlades.push(blade);
    scene.add(blade);
  }

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
  const dustLife: { mesh: THREE.Mesh; t: number; life: number }[] = [];

  function spawnDust(x: number, z: number, side: number): void {
    const mesh = dustPool[dustIdx % dustPool.length];
    dustIdx++;
    mesh.visible = true;
    mesh.position.set(x + side * 0.12, 0.04, z);
    mesh.scale.setScalar(0.6 + Math.random() * 0.4);
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5;
    dustLife.push({ mesh, t: 0, life: 0.35 });
  }

  let playerMesh: THREE.Group | null = null;
  let foeMesh: THREE.Group | null = null;
  let mode: 'starter' | 'explore' | 'battle' = 'starter';
  let battle: BattleState | null = null;
  let playerSpeciesId = 'emberpup';
  let busy = false;

  // Lunge offsets (rAF-driven)
  let playerLunge = 0;
  let foeLunge = 0;
  let foeSink = 0;
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
  scene.add(ballMesh);

  let explore: ExploreState | null = null;
  let party: PartyMember[] = [];
  const healPad = createDefaultHealPad();
  let healCooldown = 0;
  let grassRustleBoost = 0;

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
  const swapBtn = battleMenu?.querySelector('[data-act="swap"]') as HTMLButtonElement | null;

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

  function flashHit(kind: 'hit' | 'se' | 'nve' | 'crit'): void {
    if (!flash) return;
    flash.classList.remove('se', 'nve', 'crit', 'on');
    if (kind === 'se') flash.classList.add('se');
    else if (kind === 'nve') flash.classList.add('nve');
    else if (kind === 'crit') flash.classList.add('crit');
    void flash.offsetWidth;
    flash.classList.add('on');
    setTimeout(() => {
      flash.classList.remove('on', 'se', 'nve', 'crit');
    }, kind === 'crit' ? 140 : 90);
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
    const table = raw.route.wildEncounters;
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

  function enterBattle(wildSpecies: string, wildLevel: number): void {
    mark('roam-to-fight-start');
    mode = 'battle';
    foeSink = 0;
    playerLunge = 0;
    foeLunge = 0;
    ballArcT = -1;
    ballMesh.visible = false;
    clearEffClasses();

    const leadBattler =
      party.length > 0
        ? { ...party[0].battler, id: 'player' }
        : battlerFromSpecies(playerSpeciesId, raw.route.playerDefaultLevel, 'player');
    playerSpeciesId = leadBattler.speciesId || playerSpeciesId;

    const foe = battlerFromSpecies(wildSpecies, wildLevel, 'wild');
    battle = createBattle({ player: leadBattler, foe, typeChart: raw.typeChart });

    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;

    // Send-out staging: rebuild player mesh from party species, foe appears
    if (playerMesh) scene.remove(playerMesh);
    playerMesh = shipCreatureMesh(playerSpeciesId, 1);
    playerMesh.position.set(1.8, 0, 1.4);
    scene.add(playerMesh);

    if (foeMesh) scene.remove(foeMesh);
    foeMesh = shipCreatureMesh(wildSpecies, 0.95);
    foeMesh.position.set(-1.6, 0, -0.8);
    scene.add(foeMesh);

    battleRoot?.classList.add('active');
    battleMenu?.classList.remove('hidden');
    moveMenu?.classList.add('hidden');
    setMsg(`A wild ${foe.name} appeared!`);
    syncBattleHud({ enemyDur: 0, allyDur: 0 });
    showToast('Battle!');
    // No entry flashHit('hit') — keeps impact AV grammar clean for real hits
    updateSwapButton();

    requestAnimationFrame(() => {
      mark('roam-to-fight-ready');
      measureLog('roam→Fight', 'roam-to-fight-start', 'roam-to-fight-ready', 400);
    });
  }

  function exitBattle(msg: string): void {
    mode = 'explore';
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
    ballArcT = -1;
    ballMesh.visible = false;
    if (foeMesh) {
      scene.remove(foeMesh);
      foeMesh = null;
    }
    // Restore explore player mesh silhouette
    if (playerMesh) {
      scene.remove(playerMesh);
      playerMesh = shipCreatureMesh(playerSpeciesId, 1);
      scene.add(playerMesh);
    }
    if (playerMesh && explore) {
      playerMesh.position.set(explore.pos.x, 0, explore.pos.z);
    } else if (playerMesh) {
      playerMesh.position.set(0, 0, 1.2);
    }
    showToast(msg);
    updateSwapButton();
  }

  async function stageFaintAndExit(win: boolean): Promise<void> {
    const faintName = win ? battle?.foe.name : battle?.player.name;
    setMsg(`${faintName ?? 'Foe'} fainted!`);
    battleMsg?.classList.add('faint-beat');
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
        else foeSink = 0;
        if (u < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    if (win) {
      setMsg('You win! Growth from the battle settles in.');
      showToast('Victory — partner grew stronger.');
    } else {
      setMsg('You were defeated…');
    }
    await waitMs(480);
    battleMsg?.classList.remove('faint-beat');
    exitBattle(win ? 'Victory — back to the hollow.' : 'Fled to heal…');
    busy = false;
  }

  function renderMoveMenu(): void {
    if (!battle || !moveMenu) return;
    moveMenu.innerHTML = '';
    moveMenu.classList.remove('hidden');
    battleMenu?.classList.add('hidden');
    battle.player.moves.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.innerHTML = `${m.name}<span class="sub">${m.type} · ${m.category === 'status' ? 'status' : `pwr ${m.power ?? '—'}`}</span>`;
      // Status moves selectable (category C/E skill expression)
      btn.disabled = busy;
      btn.onclick = () => void doPlayerMove(i);
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
        if (!battle || busy) return;
        busy = true;
        switchPlayerTo(battle, party, i);
        playerSpeciesId = battle.player.speciesId;
        if (playerMesh) scene.remove(playerMesh);
        playerMesh = shipCreatureMesh(playerSpeciesId, 1);
        playerMesh.position.set(1.8, 0, 1.4);
        scene.add(playerMesh);
        dispAllyHp = battle.player.hp;
        syncBattleHud();
        setMsg(battle.log[battle.log.length - 1]?.message ?? `Go! ${battle.player.name}!`);
        moveMenu.classList.add('hidden');
        battleMenu?.classList.remove('hidden');
        busy = false;
        updateSwapButton();
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

  /** Lunge attacker toward target over ms; returns at impact (~end of lunge) */
  async function playLunge(who: 'player' | 'foe', ms = 140): Promise<void> {
    const mesh = who === 'player' ? playerMesh : foeMesh;
    const st = mesh ? getClipState(mesh) : undefined;
    if (st) playAttack(st);
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / ms, 0, 1);
        const punch = Math.sin(u * Math.PI);
        if (who === 'player') playerLunge = punch * 0.55;
        else foeLunge = punch * 0.55;
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

  async function doPlayerMove(index: number): Promise<void> {
    if (!battle || busy || battle.over) return;
    busy = true;
    updateSwapButton();
    clearEffClasses();
    moveMenu?.classList.add('hidden');

    mark('move-confirm');
    // Start lunge; first-attack-frame only after a painted frame (honest mode-5)
    const lungeP = playLunge('player', 150);
    requestAnimationFrame(() => {
      mark('first-attack-frame');
      measureLog('move→first-attack-frame', 'move-confirm', 'first-attack-frame', 180);
    });

    const logStart = battle.log.length;
    const foeIdx = pickFirstDamagingMove(battle.foe);
    const random = 0.85 + Math.random() * 0.15;
    executeTurn(battle, {
      playerMoveIndex: index,
      foeMoveIndex: foeIdx,
      random,
    });

    const hits = collectHits(battle.log, logStart);
    const msgs = battle.log.slice(logStart).filter((e) => e.message).map((e) => e.message!);

    await lungeP;

    for (const hit of hits) {
      const isPlayerHit = hit.side === 'player';
      if (isPlayerHit && hits.indexOf(hit) > 0) {
        await playLunge('foe', 130);
      }

      const crit = isCritEvent(hit.critical);
      const eff = hit.effectiveness ?? 1;
      if (crit) {
        flashHit('crit');
        battleMsg?.classList.add('eff-crit');
        setMsg(hit.message ? `${hit.message}` : 'Critical hit!');
        if (hit.message && !/critical/i.test(hit.message)) {
          setMsg(`${hit.message} Critical hit!`);
        }
      } else if (eff >= 2) {
        flashHit('se');
        battleMsg?.classList.add('eff-se');
        setMsg(hit.message ?? "It's super effective!");
      } else if (eff > 0 && eff <= 0.5) {
        flashHit('nve');
        battleMsg?.classList.add('eff-nve');
        setMsg(hit.message ?? "It's not very effective…");
      } else {
        flashHit('hit');
        setMsg(hit.message ?? (msgs.join(' ') || '…'));
      }

      if (hit.side === 'foe') {
        const dur = hpDrainMs(hit.damage, battle.foe.maxHp);
        dispEnemyHp = battle.foe.hp;
        setHpBar(enemyHp, dispEnemyHp, battle.foe.maxHp, dur);
        await waitMs(dur);
      } else if (hit.damage > 0) {
        const dur = hpDrainMs(hit.damage, battle.player.maxHp);
        dispAllyHp = battle.player.hp;
        setHpBar(allyHp, dispAllyHp, battle.player.maxHp, dur);
        if (allyHpText) allyHpText.textContent = `${battle.player.hp}/${battle.player.maxHp}`;
        await waitMs(dur);
      } else {
        await waitMs(220);
      }
      clearEffClasses();
    }

    if (hits.length === 0) {
      setMsg(msgs.join(' ') || '…');
      await waitMs(280);
    }

    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;
    syncBattleHud();

    if (battle.over) {
      const win = battle.winner === 'player';
      await stageFaintAndExit(!!win);
    } else {
      busy = false;
      battleMenu?.classList.remove('hidden');
      updateSwapButton();
    }
  }

  // Starter picker — show overlay once cards exist
  if (starterRow) {
    starterRow.innerHTML = '';
    for (const id of raw.route.starterChoices) {
      const sp = speciesById.get(id);
      if (!sp) continue;
      const card = document.createElement('button');
      card.className = 'starter-card interactive';
      const accent = SHIP_COLOR[id] ?? 0x7ec8ff;
      card.style.setProperty('--accent-c', `#${accent.toString(16).padStart(6, '0')}`);
      card.innerHTML = `<div class="preview"><div class="preview-orb"></div></div><div class="name">${sp.name}</div><div class="types">${sp.types.join(' · ')}</div><div class="blurb">${sp.flavor ?? ''}</div>`;
      card.onclick = () => {
        playerSpeciesId = id;
        if (playerMesh) scene.remove(playerMesh);
        playerMesh = shipCreatureMesh(id, 1);
        playerMesh.position.set(0, 0, 1.2);
        scene.add(playerMesh);
        starterOverlay?.classList.remove('show');
        starterOverlay?.classList.add('hidden');
        if (starterOverlay) starterOverlay.style.display = 'none';
        mode = 'explore';
        explore = createExploreState({ speed: 4.6, runMultiplier: 1.85 });
        party = createParty([
          {
            battler: battlerFromSpecies(id, raw.route.playerDefaultLevel, 'player'),
          },
        ]);
        bindExploreKeys(explore.keys);

        const y0 = explore.yaw || 0;
        camFollow.yaw = y0;
        camFollow.ready = true;
        const px0 = playerMesh.position.x;
        const pz0 = playerMesh.position.z;
        camFollow.pos.set(
          px0 - Math.sin(y0) * camFollow.dist,
          camFollow.height,
          pz0 - Math.cos(y0) * camFollow.dist,
        );
        camFollow.look.set(px0, 0.75, pz0);
        camera.position.copy(camFollow.pos);
        camera.lookAt(camFollow.look);

        showToast(`${sp.name} joined you. WASD to walk the grass.`);
        updateSwapButton();
      };
      starterRow.appendChild(card);
    }
    // Cold boot: reveal starter once cards exist (capture + human)
    if (starterRow.children.length > 0) {
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
        exitBattle('Got away safely!');
      } else if (act === 'ball' && battle && !battle.over) {
        if (busy) return;
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
            if (res.caught) {
              mark('ball-catch-ok');
              const member = { battler: { ...foe } };
              addToParty(party, member);
              exitBattle('Gotcha! ' + foe.name + ' joined the party!');
              busy = false;
              updateSwapButton();
            } else {
              mark('ball-catch-fail');
              busy = false;
              battleMenu?.classList.remove('hidden');
              updateSwapButton();
            }
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
    renderer.setSize(w, h);
  });

  progress(1, 'Ready');
  showToast('Twilight Route · Wave-0 · original ship pack only');
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

    // Dust life
    for (let i = dustLife.length - 1; i >= 0; i--) {
      const d = dustLife[i];
      d.t += dt;
      const u = d.t / d.life;
      const mat = d.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.5 * (1 - u);
      d.mesh.scale.setScalar(0.6 + u * 1.4);
      if (u >= 1) {
        d.mesh.visible = false;
        dustLife.splice(i, 1);
      }
    }

    // Grass ambient sway + rustle boost
    grassRustleBoost = Math.max(0, grassRustleBoost - dt * 3.5);
    for (let i = 0; i < grassBlades.length; i++) {
      const b = grassBlades[i];
      const base = grassBaseRot[i];
      const sway = Math.sin(t * 2.1 + i * 0.4) * 0.08 + grassRustleBoost * Math.sin(t * 18 + i) * 0.35;
      b.rotation.z = base + sway;
      b.scale.y = 1 + grassRustleBoost * 0.08 * Math.sin(t * 12 + i);
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

      if (res.footPlant) {
        const side = explore.footPhase === 0 ? -1 : 1;
        spawnDust(explore.pos.x, explore.pos.z, side);
      }

      if (res.grassRustle || (res.inGrass && res.moved)) {
        if (res.grassRustle) grassRustleBoost = Math.min(1, grassRustleBoost + 0.65);
      }

      if (healCooldown <= 0 && isOnHealPad(explore.pos, healPad) && party.length > 0) {
        healParty(party);
        healCooldown = 2.5;
        showToast('Healed at the pad.');
        playerMesh.scale.setScalar(1.1);
        setTimeout(() => {
          if (playerMesh) playerMesh.scale.setScalar(1);
        }, 160);
      }

      if (res.encounter && !busy) {
        busy = true;
        const w = pickWild();
        enterBattle(w.species, w.level);
        busy = false;
      }

      const yawBlend = 1 - Math.exp(-4.2 * dt);
      const posBlend = 1 - Math.exp(-6.5 * dt);
      const lookBlend = 1 - Math.exp(-8 * dt);
      let dy = explore.yaw - camFollow.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      camFollow.yaw += dy * yawBlend;

      const idealX = playerMesh.position.x - Math.sin(camFollow.yaw) * camFollow.dist;
      const idealZ = playerMesh.position.z - Math.cos(camFollow.yaw) * camFollow.dist;
      const idealY = camFollow.height;
      camFollow.pos.x += (idealX - camFollow.pos.x) * posBlend;
      camFollow.pos.z += (idealZ - camFollow.pos.z) * posBlend;
      camFollow.pos.y += (idealY - camFollow.pos.y) * posBlend;

      const lx = playerMesh.position.x;
      const ly = 0.7;
      const lz = playerMesh.position.z;
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
      if (playerMesh) {
        const baseX = 1.8;
        const baseZ = 1.4;
        playerMesh.position.x = baseX - playerLunge * 0.9;
        playerMesh.position.z = baseZ - playerLunge * 0.55;
        playerMesh.position.y = 0;
        playerMesh.rotation.y = -0.55;
        const st = getClipState(playerMesh);
        if (st) {
          st.baseY = 0;
          st.baseRotY = -0.55;
        }
      }
      if (foeMesh) {
        const baseX = -1.6;
        const baseZ = -0.8;
        foeMesh.position.x = baseX + foeLunge * 0.9;
        foeMesh.position.z = baseZ + foeLunge * 0.55;
        foeMesh.position.y = -foeSink * 1.1;
        foeMesh.rotation.y = 0.55;
        foeMesh.scale.setScalar(Math.max(0.05, 1 - foeSink * 0.35));
        const st = getClipState(foeMesh);
        if (st) {
          st.baseY = -foeSink * 1.1;
          st.baseRotY = 0.55;
        }
      }
      tickMeshClips(dt, t);
      // Restore battle XZ after clip z lunge
      if (playerMesh) {
        const baseX = 1.8;
        const baseZ = 1.4;
        playerMesh.position.x = baseX - playerLunge * 0.9;
        playerMesh.position.z = baseZ - playerLunge * 0.55;
      }
      if (foeMesh) {
        const baseX = -1.6;
        const baseZ = -0.8;
        foeMesh.position.x = baseX + foeLunge * 0.9;
        foeMesh.position.z = baseZ + foeLunge * 0.55;
      }
      const bx = 0.3;
      const by = 2.6;
      const bz = 6.2;
      camera.position.x += (bx - camera.position.x) * Math.min(1, 3 * dt);
      camera.position.y += (by - camera.position.y) * Math.min(1, 3 * dt);
      camera.position.z += (bz - camera.position.z) * Math.min(1, 3 * dt);
      camera.lookAt(0.1, 0.7 - foeSink * 0.3, 0.2);
    } else {
      // Starter mode: idle camera over hollow + soft sky
      camera.position.x += (0 - camera.position.x) * Math.min(1, 2 * dt);
      camera.position.y += (3.4 - camera.position.y) * Math.min(1, 2 * dt);
      camera.position.z += (8.2 - camera.position.z) * Math.min(1, 2 * dt);
      camera.lookAt(0, 0.6, 0);
      if (playerMesh) tickMeshClips(dt, t);
    }

    // Subtle heal pad pulse
    healGlow.material.opacity = 0.35 + Math.sin(t * 2.4) * 0.12;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch(fatal);
