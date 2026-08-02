/**
 * Twilight Route — Wave-0 playable shell.
 * Loads content/game/wave0.json only (ship pack). Pure battle sim + Three presentation.
 * W1-P3: battle juice sandwich + soft camera explore feel.
 */
import * as THREE from 'three';
import {
  buildBattler,
  createBattle,
  executeTurn,
  pickFirstDamagingMove,
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
import { attemptCatch, defaultCatchRate } from './battle/catch.ts';
import { createParty, healParty, addToParty, type PartyMember } from './battle/party.ts';

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

  // Soft follow state (lagged yaw + lerped position)
  const camFollow = {
    yaw: 0,
    pos: new THREE.Vector3(0, 3.2, 7.5),
    look: new THREE.Vector3(0, 0.8, 0),
    dist: 5.2,
    height: 3.15,
    ready: false,
  };

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

  // Tall grass ring (encounter zone) — keep refs for rustle telegraph
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x2d6b3a, roughness: 0.85 });
  const grassBlades: THREE.Mesh[] = [];
  const grassBaseRot: number[] = [];
  for (let i = 0; i < 40; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7 + Math.random() * 0.4, 5), grassMat);
    const a = (i / 40) * Math.PI * 2;
    const r = 2.2 + Math.random() * 1.8;
    blade.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r - 1.2);
    blade.rotation.z = (Math.random() - 0.5) * 0.2;
    grassBaseRot.push(blade.rotation.z);
    grassBlades.push(blade);
    scene.add(blade);
  }

  // Foot-plant dust (simple sprite-ish discs)
  const dustPool: THREE.Mesh[] = [];
  const dustMat = new THREE.MeshBasicMaterial({
    color: 0xc8b89a,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  for (let i = 0; i < 12; i++) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.12, 8), dustMat.clone());
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
  let foeSink = 0; // faint staging sink
  let playerBobPhase = 0;

  let explore: ExploreState | null = null;
  let party: PartyMember[] = [];
  const healPad = createDefaultHealPad();
  let healCooldown = 0;
  let grassRustleBoost = 0;

  // Displayed HP for smooth bars (pre-tween snapshot)
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

  function flashHit(kind: 'hit' | 'se' | 'nve' | 'crit'): void {
    if (!flash) return;
    flash.classList.remove('se', 'nve', 'crit', 'on');
    if (kind === 'se') flash.classList.add('se');
    else if (kind === 'nve') flash.classList.add('nve');
    else if (kind === 'crit') flash.classList.add('crit');
    // force reflow so class re-triggers
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

  function enterBattle(wildSpecies: string, wildLevel: number): void {
    mark('roam-to-fight-start');
    mode = 'battle';
    foeSink = 0;
    playerLunge = 0;
    foeLunge = 0;
    clearEffClasses();

    // Prefer party lead HP if present (P4 may own deeper sync; call site wire)
    const leadBattler =
      party.length > 0
        ? { ...party[0].battler, id: 'player' }
        : battlerFromSpecies(playerSpeciesId, raw.route.playerDefaultLevel, 'player');
    playerSpeciesId = leadBattler.speciesId || playerSpeciesId;

    const foe = battlerFromSpecies(wildSpecies, wildLevel, 'wild');
    battle = createBattle({ player: leadBattler, foe, typeChart: raw.typeChart });

    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;

    if (foeMesh) scene.remove(foeMesh);
    foeMesh = makeCreatureMesh(SPECIES_COLOR[wildSpecies] ?? 0xaaaaaa, 0.95);
    foeMesh.position.set(-1.6, 0, -0.8);
    scene.add(foeMesh);
    if (playerMesh) playerMesh.position.set(1.8, 0, 1.4);

    battleRoot?.classList.add('active');
    battleMenu?.classList.remove('hidden');
    moveMenu?.classList.add('hidden');
    setMsg(`A wild ${foe.name} appeared!`);
    syncBattleHud({ enemyDur: 0, allyDur: 0 });
    showToast('Battle!');
    flashHit('hit');

    // Interactive Fight menu ready — mode-5 ≤400ms from roam
    requestAnimationFrame(() => {
      mark('roam-to-fight-ready');
      measureLog('roam→Fight', 'roam-to-fight-start', 'roam-to-fight-ready', 400);
    });
  }

  function exitBattle(msg: string): void {
    mode = 'explore';
    battle = null;
    battleRoot?.classList.remove('active');
    clearEffClasses();
    foeSink = 0;
    if (foeMesh) {
      scene.remove(foeMesh);
      foeMesh = null;
    }
    if (playerMesh && explore) {
      playerMesh.position.set(explore.pos.x, 0, explore.pos.z);
    } else if (playerMesh) {
      playerMesh.position.set(0, 0, 1.2);
    }
    showToast(msg);
  }

  async function stageFaintAndExit(win: boolean): Promise<void> {
    const faintName = win ? battle?.foe.name : battle?.player.name;
    setMsg(`${faintName ?? 'Foe'} fainted!`);
    battleMsg?.classList.add('faint-beat');
    // Directed sink: foe sinks if player won
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
    setMsg(win ? 'You win!' : 'You were defeated…');
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

  /** Lunge attacker toward target over ms; returns at impact (~end of lunge) */
  async function playLunge(who: 'player' | 'foe', ms = 140): Promise<void> {
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const u = clamp((now - t0) / ms, 0, 1);
        // ease-out punch
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
    critical?: number;
    message?: string;
  };

  function collectHits(log: BattleEvent[], fromIndex: number): JuiceHit[] {
    const hits: JuiceHit[] = [];
    for (let i = fromIndex; i < log.length; i++) {
      const e = log[i] as BattleEvent & { critical?: number };
      if (e.type === 'damage' && e.side && e.damage != null) {
        hits.push({
          side: e.side,
          damage: e.damage,
          effectiveness: e.effectiveness,
          critical: e.critical,
          message: e.message,
        });
      }
    }
    return hits;
  }

  async function doPlayerMove(index: number): Promise<void> {
    if (!battle || busy || battle.over) return;
    busy = true;
    clearEffClasses();
    moveMenu?.classList.add('hidden');

    mark('move-confirm');
    // First attack frame ASAP — lunge starts immediately (≤180ms budget)
    const lungeP = playLunge('player', 150);
    mark('first-attack-frame');
    measureLog('move→first-attack-frame', 'move-confirm', 'first-attack-frame', 180);

    const logStart = battle.log.length;
    const foeIdx = pickFirstDamagingMove(battle.foe);
    const random = 0.9 + Math.random() * 0.1;
    executeTurn(battle, {
      playerMoveIndex: index,
      foeMoveIndex: foeIdx,
      random,
    });

    const hits = collectHits(battle.log, logStart);
    const msgs = battle.log.slice(logStart).filter((e) => e.message).map((e) => e.message!);

    // Wait for player lunge impact, then flash + HP
    await lungeP;

    // Present hits in order (player then foe typically)
    for (const hit of hits) {
      const isPlayerHit = hit.side === 'player'; // damage to player
      // If foe is dealing damage next after player, lunge foe first
      if (isPlayerHit && hits.indexOf(hit) > 0) {
        await playLunge('foe', 130);
      }

      // Impact AV within 100ms of hit: SE / NVE / crit distinct
      const crit = (hit.critical ?? 1) > 1;
      const eff = hit.effectiveness ?? 1;
      if (crit) {
        flashHit('crit');
        battleMsg?.classList.add('eff-crit');
        setMsg(hit.message ? `${hit.message} Critical hit!` : 'Critical hit!');
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

      // HP tween after impact — duration scales with dmg fraction
      if (hit.side === 'foe') {
        const dur = hpDrainMs(hit.damage, battle.foe.maxHp);
        dispEnemyHp = battle.foe.hp;
        setHpBar(enemyHp, dispEnemyHp, battle.foe.maxHp, dur);
        await waitMs(dur);
      } else {
        const dur = hpDrainMs(hit.damage, battle.player.maxHp);
        dispAllyHp = battle.player.hp;
        setHpBar(allyHp, dispAllyHp, battle.player.maxHp, dur);
        if (allyHpText) allyHpText.textContent = `${battle.player.hp}/${battle.player.maxHp}`;
        await waitMs(dur);
      }
      clearEffClasses();
    }

    if (hits.length === 0) {
      setMsg(msgs.join(' ') || '…');
      await waitMs(280);
    }

    // Sync true HP
    dispEnemyHp = battle.foe.hp;
    dispAllyHp = battle.player.hp;
    syncBattleHud();

    if (battle.over) {
      const win = battle.winner === 'player';
      await stageFaintAndExit(!!win);
    } else {
      busy = false;
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
        explore = createExploreState({ speed: 4.6, runMultiplier: 1.85 });
        party = createParty([{
          battler: battlerFromSpecies(id, raw.route.playerDefaultLevel, 'player'),
        }]);
        bindExploreKeys(explore.keys);

        // Seed soft camera behind player (no hard snap every frame)
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
      };
      starterRow.appendChild(card);
    }
  }

  battleMenu?.querySelectorAll('[data-act]').forEach((el) => {
    el.addEventListener('click', () => {
      const act = (el as HTMLElement).dataset.act;
      if (act === 'fight') renderMoveMenu();
      else if (act === 'run' && battle) {
        exitBattle('Got away safely!');
      } else if (act === 'ball' && battle && !battle.over) {
        if (busy) return;
        busy = true;
        const foe = battle.foe;
        const res = attemptCatch({
          maxHp: foe.maxHp,
          hp: foe.hp,
          catchRate: defaultCatchRate('wild'),
          seed: (Date.now() ^ foe.hp) >>> 0,
        });
        setMsg(res.messages.join(' '));
        for (let i = 0; i < res.shakes; i++) {
          if (foeMesh) {
            const origX = foeMesh.position.x;
            foeMesh.position.x = origX + (i % 2 ? 0.15 : -0.15);
            setTimeout(() => {
              if (foeMesh) foeMesh.position.x = origX;
            }, 180 + i * 120);
          }
        }
        setTimeout(() => {
          if (res.caught) {
            const member = { battler: { ...foe } };
            addToParty(party, member);
            exitBattle('Gotcha! ' + foe.name + ' joined the party!');
            busy = false;
          } else {
            busy = false;
            battleMenu?.classList.remove('hidden');
          }
        }, 900);
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

    if (mode === 'explore' && explore && playerMesh) {
      if (healCooldown > 0) healCooldown = Math.max(0, healCooldown - dt);

      const res = tickExplore(explore, dt);
      playerMesh.position.x = explore.pos.x;
      playerMesh.position.z = explore.pos.z;
      // Foot bob from gait
      playerBobPhase += res.speed * dt * 8;
      const bob = Math.sin(playerBobPhase) * 0.04 * Math.min(1, res.speed / 2);
      playerMesh.position.y = bob;
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

      // Soft camera: lag yaw + lerp position (no hard snap)
      const yawBlend = 1 - Math.exp(-4.2 * dt);
      const posBlend = 1 - Math.exp(-6.5 * dt);
      const lookBlend = 1 - Math.exp(-8 * dt);
      // wrap-safe yaw lag toward player facing
      let dy = explore.yaw - camFollow.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      camFollow.yaw += dy * yawBlend;

      const idealX = playerMesh.position.x - Math.sin(camFollow.yaw) * camFollow.dist;
      const idealZ = playerMesh.position.z - Math.cos(camFollow.yaw) * camFollow.dist;
      const idealY = camFollow.height;
      // Simple ground-plane "collision": keep camera outside a small radius of player
      camFollow.pos.x += (idealX - camFollow.pos.x) * posBlend;
      camFollow.pos.z += (idealZ - camFollow.pos.z) * posBlend;
      camFollow.pos.y += (idealY - camFollow.pos.y) * posBlend;

      const lx = playerMesh.position.x;
      const ly = 0.7 + bob;
      const lz = playerMesh.position.z;
      camFollow.look.x += (lx - camFollow.look.x) * lookBlend;
      camFollow.look.y += (ly - camFollow.look.y) * lookBlend;
      camFollow.look.z += (lz - camFollow.look.z) * lookBlend;

      camera.position.copy(camFollow.pos);
      camera.lookAt(camFollow.look);
    } else if (mode === 'battle') {
      // Battle staging positions + lunge / faint sink
      if (playerMesh) {
        const baseX = 1.8;
        const baseZ = 1.4;
        // Lunge toward foe (-x, -z)
        playerMesh.position.x = baseX - playerLunge * 0.9;
        playerMesh.position.z = baseZ - playerLunge * 0.55;
        playerMesh.position.y = Math.sin(t * 1.6) * 0.05;
        playerMesh.rotation.y = -0.55;
      }
      if (foeMesh) {
        const baseX = -1.6;
        const baseZ = -0.8;
        foeMesh.position.x = baseX + foeLunge * 0.9;
        foeMesh.position.z = baseZ + foeLunge * 0.55;
        foeMesh.position.y = Math.sin(t * 1.8 + 1) * 0.05 - foeSink * 1.1;
        foeMesh.rotation.y = 0.55;
        foeMesh.scale.setScalar(Math.max(0.05, 1 - foeSink * 0.35));
      }
      // Soft battle camera hold
      const bx = 0.3;
      const by = 2.6;
      const bz = 6.2;
      camera.position.x += (bx - camera.position.x) * Math.min(1, 3 * dt);
      camera.position.y += (by - camera.position.y) * Math.min(1, 3 * dt);
      camera.position.z += (bz - camera.position.z) * Math.min(1, 3 * dt);
      camera.lookAt(0.1, 0.7 - foeSink * 0.3, 0.2);
    } else {
      if (playerMesh) {
        playerMesh.position.y = Math.sin(t * 1.6) * 0.06;
        playerMesh.rotation.y = Math.sin(t * 0.4) * 0.15;
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

boot().catch(fatal);
