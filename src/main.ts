/**
 * Twilight Route — Wave-0 playable shell.
 * Loads content/game/wave0.json only (ship pack). Pure battle sim + Three presentation.
 */
import * as THREE from 'three';
import {
  buildBattler,
  createBattle,
  executeTurn,
  pickFirstDamagingMove,
} from './battle/battle.ts';
import { normalizeMove, normalizeSpecies } from './battle/content.ts';
import type { BattleState, Battler, MoveDef, TypeChart } from './battle/types.ts';

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

const SPECIES_COLOR: Record<string, number> = {
  emberpup: 0xe87840,
  dewkin: 0x4aa8e8,
  leafit: 0x5cbc6a,
  dustbun: 0xe8e0d4,
  sparkmoth: 0xc9d44a,
};

function makeCreatureMesh(color: number, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.55 * scale, 32, 24),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.08,
      emissive: color,
      emissiveIntensity: 0.12,
    }),
  );
  body.position.y = 0.55 * scale;
  const earL = new THREE.Mesh(
    new THREE.SphereGeometry(0.14 * scale, 16, 12),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
  );
  earL.position.set(-0.28 * scale, 1.0 * scale, 0.05 * scale);
  const earR = earL.clone();
  earR.position.x *= -1;
  g.add(body, earL, earR);
  return g;
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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1528);
  scene.fog = new THREE.Fog(0x0a1528, 12, 40);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3.2, 7.5);
  camera.lookAt(0, 0.8, 0);

  scene.add(new THREE.AmbientLight(0xb8d4ff, 0.55));
  const key = new THREE.DirectionalLight(0xfff0dd, 1.2);
  key.position.set(4, 10, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x6688cc, 0.35);
  fill.position.set(-5, 3, -2);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(10, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a3428, roughness: 0.92 }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Tall grass ring (encounter zone)
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x2d6b3a, roughness: 0.85 });
  for (let i = 0; i < 40; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7 + Math.random() * 0.4, 5), grassMat);
    const a = (i / 40) * Math.PI * 2;
    const r = 2.2 + Math.random() * 1.8;
    blade.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r - 1.2);
    blade.rotation.z = (Math.random() - 0.5) * 0.2;
    scene.add(blade);
  }

  let playerMesh: THREE.Group | null = null;
  let foeMesh: THREE.Group | null = null;
  let mode: 'starter' | 'explore' | 'battle' = 'starter';
  let battle: BattleState | null = null;
  let playerSpeciesId = 'emberpup';
  let busy = false;

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

  function showToast(text: string, ms = 2800): void {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), ms);
  }

  function setMsg(text: string): void {
    if (battleMsg) battleMsg.textContent = text;
  }

  function setHpBar(el: HTMLElement | null, hp: number, max: number): void {
    if (!el) return;
    const t = Math.max(0, Math.min(1, hp / Math.max(1, max)));
    el.style.transform = `scaleX(${t})`;
    el.style.background =
      t > 0.5
        ? 'linear-gradient(90deg,#3ecf72,#5ce08a)'
        : t > 0.2
          ? 'linear-gradient(90deg,#e6d35a,#ffd56a)'
          : 'linear-gradient(90deg,#ff6b5a,#ff8f7a)';
  }

  function syncBattleHud(): void {
    if (!battle) return;
    if (enemyName) enemyName.textContent = battle.foe.name;
    if (enemyLvl) enemyLvl.textContent = `Lv.${battle.foe.level}`;
    if (allyName) allyName.textContent = battle.player.name;
    if (allyLvl) allyLvl.textContent = `Lv.${battle.player.level}`;
    setHpBar(enemyHp, battle.foe.hp, battle.foe.maxHp);
    setHpBar(allyHp, battle.player.hp, battle.player.maxHp);
    if (allyHpText) allyHpText.textContent = `${battle.player.hp}/${battle.player.maxHp}`;
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

  function enterBattle(wildSpecies: string, wildLevel: number): void {
    mode = 'battle';
    const player = battlerFromSpecies(playerSpeciesId, raw.route.playerDefaultLevel, 'player');
    const foe = battlerFromSpecies(wildSpecies, wildLevel, 'wild');
    battle = createBattle({ player, foe, typeChart: raw.typeChart });

    if (foeMesh) scene.remove(foeMesh);
    foeMesh = makeCreatureMesh(SPECIES_COLOR[wildSpecies] ?? 0xaaaaaa, 0.95);
    foeMesh.position.set(-1.6, 0, -0.8);
    scene.add(foeMesh);
    if (playerMesh) playerMesh.position.set(1.8, 0, 1.4);

    battleRoot?.classList.add('active');
    battleMenu?.classList.remove('hidden');
    moveMenu?.classList.add('hidden');
    setMsg(`A wild ${foe.name} appeared!`);
    syncBattleHud();
    showToast('Battle!');
    if (flash) {
      flash.classList.add('on');
      setTimeout(() => flash.classList.remove('on'), 120);
    }
  }

  function exitBattle(msg: string): void {
    mode = 'explore';
    battle = null;
    battleRoot?.classList.remove('active');
    if (foeMesh) {
      scene.remove(foeMesh);
      foeMesh = null;
    }
    if (playerMesh) playerMesh.position.set(0, 0, 1.2);
    showToast(msg);
  }

  function renderMoveMenu(): void {
    if (!battle || !moveMenu) return;
    moveMenu.innerHTML = '';
    moveMenu.classList.remove('hidden');
    battleMenu?.classList.add('hidden');
    battle.player.moves.forEach((m, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.innerHTML = `${m.name}<span class="sub">${m.type} · pwr ${m.power ?? '—'}</span>`;
      btn.disabled = busy || m.category === 'status';
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

  async function doPlayerMove(index: number): Promise<void> {
    if (!battle || busy || battle.over) return;
    busy = true;
    moveMenu?.classList.add('hidden');
    const foeIdx = pickFirstDamagingMove(battle.foe);
    // mild variance for feel; goldens use 1.0
    const random = 0.9 + Math.random() * 0.1;
    executeTurn(battle, {
      playerMoveIndex: index,
      foeMoveIndex: foeIdx,
      random,
    });
    const lastMsgs = battle.log.slice(-6).filter((e) => e.message);
    setMsg(lastMsgs.map((e) => e.message).join(' ') || '…');
    syncBattleHud();
    if (flash) {
      flash.classList.add('on');
      setTimeout(() => flash.classList.remove('on'), 80);
    }
    await new Promise((r) => setTimeout(r, 500));
    busy = false;
    if (battle.over) {
      const win = battle.winner === 'player';
      setMsg(win ? 'You win!' : 'You were defeated…');
      setTimeout(() => exitBattle(win ? 'Victory — back to the hollow.' : 'Fled to heal…'), 1200);
    } else {
      battleMenu?.classList.remove('hidden');
    }
  }

  // Starter picker
  if (starterRow) {
    starterRow.innerHTML = '';
    for (const id of raw.route.starterChoices) {
      const sp = speciesById.get(id);
      if (!sp) continue;
      const card = document.createElement('button');
      card.className = 'starter-card interactive';
      card.style.setProperty('--accent-c', `#${(SPECIES_COLOR[id] ?? 0x7ec8ff).toString(16).padStart(6, '0')}`);
      card.innerHTML = `<div class="name">${sp.name}</div><div class="types">${sp.types.join(' · ')}</div><div class="blurb">${sp.flavor ?? ''}</div>`;
      card.onclick = () => {
        playerSpeciesId = id;
        if (playerMesh) scene.remove(playerMesh);
        playerMesh = makeCreatureMesh(SPECIES_COLOR[id] ?? 0x7ec8ff, 1);
        playerMesh.position.set(0, 0, 1.2);
        scene.add(playerMesh);
        starterOverlay?.classList.add('hidden');
        starterOverlay && (starterOverlay.style.display = 'none');
        mode = 'explore';
        showToast(`${sp.name} joined you. Walk the grass (click) to encounter.`);
      };
      starterRow.appendChild(card);
    }
  }

  // Explore: click canvas → chance of encounter
  canvas.addEventListener('pointerdown', () => {
    if (mode !== 'explore' || busy) return;
    if (Math.random() < 0.55) {
      const w = pickWild();
      enterBattle(w.species, w.level);
    } else {
      showToast('Rustling… nothing this time.');
    }
  });

  battleMenu?.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => {
      const act = (el as HTMLElement).dataset.act;
      if (act === 'fight') renderMoveMenu();
      else if (act === 'run' && battle) {
        exitBattle('Got away safely!');
      } else if (act === 'ball') {
        setMsg('Balls come later — fight for Wave-0.');
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
  const tick = (now: number) => {
    const t = (now - t0) / 1000;
    if (playerMesh) {
      playerMesh.position.y = Math.sin(t * 1.6) * 0.06;
      playerMesh.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
    if (foeMesh) {
      foeMesh.position.y = Math.sin(t * 1.8 + 1) * 0.05;
      foeMesh.rotation.y = -0.4 + Math.sin(t * 0.5) * 0.1;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch(fatal);
