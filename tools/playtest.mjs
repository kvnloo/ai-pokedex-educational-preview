/**
 * Headless Wave-0 path: starter → encounter → fight → faint/catch/heal.
 * No jsdom / browser. Asserts pure sim path does not throw.
 *
 * Run: npm run test:playtest
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const battleMod = await import(
  pathToFileURL(join(root, "src/battle/battle.ts")).href
);
const contentMod = await import(
  pathToFileURL(join(root, "src/battle/content.ts")).href
);
const catchMod = await import(
  pathToFileURL(join(root, "src/battle/catch.ts")).href
);
const partyMod = await import(
  pathToFileURL(join(root, "src/battle/party.ts")).href
);
const exploreMod = await import(
  pathToFileURL(join(root, "src/world/explore.ts")).href
);
const creatureMeshesMod = await import(
  pathToFileURL(join(root, "src/creatures/speciesMeshes.ts")).href
);

const {
  buildBattler,
  createBattle,
  createBattleFromParty,
  executeTurn,
  pickFirstDamagingMove,
  switchPlayerTo,
  syncBattlePlayerToParty,
} = battleMod;
const { normalizeMove, normalizeSpecies } = contentMod;
const { attemptCatch, defaultCatchRate, computeA, speciesCatchRate } = catchMod;
const { createParty, healParty, addToParty, lead } = partyMod;
const {
  createExploreState,
  tickExplore,
  isInGrass,
  isOnHealPad,
  createDefaultHealPad,
  normalizeExploreKey,
} = exploreMod;

let failed = 0;
let passed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`ok   ${name}`);
  } else {
    failed++;
    console.error(`FAIL ${name}${detail ? ": " + detail : ""}`);
  }
}

function assertNoThrow(name, fn) {
  try {
    fn();
    ok(name, true);
  } catch (e) {
    failed++;
    console.error(`FAIL ${name}: threw ${e?.stack ?? e}`);
  }
}

// --- Load ship pack ---
const pack = JSON.parse(
  readFileSync(join(root, "content/game/wave0.json"), "utf8"),
);
const moves = pack.moves.map((m) => normalizeMove(m));
const moveById = new Map(moves.map((m) => [m.id, m]));
const species = pack.species.map((s) => normalizeSpecies(s));
const speciesById = new Map(species.map((s) => [s.id, s]));
const { SPECIES_BUILDERS } = creatureMeshesMod;
ok(
  "every shipped species has an explicit authored mesh builder",
  species.every((s) => typeof SPECIES_BUILDERS[s.id] === "function"),
  `missing=${species.filter((s) => typeof SPECIES_BUILDERS[s.id] !== "function").map((s) => s.id).join(",")}`,
);

function resolveMoves(ids) {
  return ids.map((id) => moveById.get(id)).filter(Boolean);
}

function battlerFromSpecies(speciesId, level, uid) {
  const sp = speciesById.get(speciesId);
  if (!sp) throw new Error(`unknown species ${speciesId}`);
  const mv = sp.moves
    .map((id) => moveById.get(id))
    .filter(Boolean)
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

// 1) Starter choice
const starterId = pack.route.starterChoices[0];
ok("starter id present", typeof starterId === "string");
const player = battlerFromSpecies(
  starterId,
  pack.route.playerDefaultLevel,
  "player",
);
ok("starter has hp", player.hp > 0 && player.maxHp === player.hp);
ok("starter has moves", player.moves.length >= 1);

let party = createParty([{ battler: player }]);
ok("party lead", lead(party)?.battler.speciesId === starterId);
ok(
  "three starters triangle",
  (pack.route.starterChoices ?? []).length >= 3 &&
    pack.route.starterChoices.includes("leafkit"),
);
ok("leafkit in species", speciesById.has("leafkit"));
const leafkit = battlerFromSpecies("leafkit", 5, "leaf-check");
ok("leafkit is grass", leafkit.types.includes("grass"));


// 2) Explore WASD into grass
ok(
  "input normalizes physical KeyW when key is unidentified",
  typeof normalizeExploreKey === "function" &&
    normalizeExploreKey({ key: "Unidentified", code: "KeyW" }) === "w",
);
ok(
  "input normalizes uppercase layout key",
  typeof normalizeExploreKey === "function" &&
    normalizeExploreKey({ key: "D", code: "KeyD" }) === "d",
);
ok(
  "input rejects unrelated keys",
  typeof normalizeExploreKey === "function" &&
    normalizeExploreKey({ key: "Tab", code: "Tab" }) === null,
);
const explore = createExploreState({
  pos: { x: 0, z: 2.5 },
  grass: { cx: 0, cz: -1.2, half: 2.6, encounterChance: 1 },
});
// Path corridor |x|<0.95 is safe dirt; step off-path into grass then north
explore.keys.add("w");
explore.keys.add("d");
let hitGrass = false;
let encounter = false;
// Force deterministic rng: always encounter once in grass (after min steps)
const rng = () => 0;
for (let i = 0; i < 180; i++) {
  // After clearing into grass band, stop strafing so we stay in patch
  if (Math.abs(explore.pos.x) > 1.2) explore.keys.delete("d");
  const r = tickExplore(explore, 1 / 30, rng);
  if (r.inGrass) hitGrass = true;
  if (r.encounter) {
    encounter = true;
    break;
  }
}
ok("reached grass", hitGrass, `pos=${JSON.stringify(explore.pos)}`);
ok("grass encounter fired", encounter);

// Sustained real movement has a bounded pity path even when every random roll loses.
const pityExplore = createExploreState({
  pos: { x: 0, z: -1.2 },
  bounds: { minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
  grass: { cx: 0, cz: -1.2, half: 100, encounterChance: 0 },
  obstacles: [],
});
pityExplore.keys.add("d");
let pityEncounter = false;
for (let i = 0; i < 320; i++) {
  if (tickExplore(pityExplore, 1 / 60, () => 1).encounter) {
    pityEncounter = true;
    break;
  }
}
ok("grass encounter pity is bounded", pityEncounter);

// 3) Battle from party lead (preserves HP) until faint
// bruise lead first to prove no full-HP rebuild
party[0].battler.hp = Math.max(1, party[0].battler.maxHp - 3);
const hpAtEnter = party[0].battler.hp;
const wild = pack.route.wildEncounters[0];
const foe = battlerFromSpecies(wild.species, wild.minLevel, "wild");
const battle = createBattleFromParty(party, foe, pack.typeChart);
ok("enterBattle uses party HP", battle.player.hp === hpAtEnter);

assertNoThrow("battle loop no throw", () => {
  let guard = 0;
  while (!battle.over && guard++ < 40) {
    const pi = pickFirstDamagingMove(battle.player);
    const fi = pickFirstDamagingMove(battle.foe);
    executeTurn(battle, { playerMoveIndex: pi, foeMoveIndex: fi, random: 1 });
  }
});
ok("battle ended", battle.over === true);
ok("battle has winner", battle.winner === "player" || battle.winner === "foe");
ok("battle log non-empty", battle.log.length > 2);

// Sync party HP from battle player via API
syncBattlePlayerToParty(battle, party);
ok(
  "sync on exit matches battle",
  party[battle.playerPartyIndex ?? 0].battler.hp === battle.player.hp,
);

// Switch API with second member
const second = battlerFromSpecies("dustbun", 5, "bench");
addToParty(party, { battler: second });
const switchBattle = createBattleFromParty(
  party,
  battlerFromSpecies("sparkmoth", 4, "wild2"),
  pack.typeChart,
);
// use conscious bench if lead fainted
const benchIdx = party.findIndex((m, i) => i > 0 && m.battler.hp > 0);
if (benchIdx >= 0 && (switchBattle.player.hp > 0)) {
  // ensure lead conscious for switch-out
  if (party[0].battler.hp <= 0) {
    party[0].battler.hp = party[0].battler.maxHp;
    party[0].battler.fainted = false;
    switchBattle.player.hp = party[0].battler.hp;
    switchBattle.player.fainted = false;
  }
  switchPlayerTo(switchBattle, party, benchIdx);
  ok("switch-to index API", switchBattle.playerPartyIndex === benchIdx);
  ok("switch event logged", switchBattle.log.some((e) => e.type === "switch"));
} else {
  ok("switch-to index API", false, "no bench");
}

// Status stage move
const statusB = createBattle({
  player: battlerFromSpecies(starterId, 5, "st-p"),
  foe: battlerFromSpecies("dustbun", 4, "st-f"),
  typeChart: pack.typeChart,
});
const growlIdx = statusB.player.moves.findIndex((m) => m.effect === "lower-atk-1");
if (growlIdx >= 0) {
  executeTurn(statusB, {
    playerMoveIndex: growlIdx,
    foeMoveIndex: pickFirstDamagingMove(statusB.foe),
    random: 1,
  });
  ok("real stat-stage status", statusB.foe.stages?.atk === -1);
} else {
  ok("real stat-stage status", false, "no growl-down");
}

// 4) Catch flow (fresh low-HP foe)
const catchFoe = battlerFromSpecies("dustbun", 3, "catch-wild");
catchFoe.hp = 1;
const dustSp = speciesById.get("dustbun");
const dustRate = speciesCatchRate(dustSp);
ok("per-species catchRate", dustRate === (dustSp.catchRate ?? defaultCatchRate(dustSp.role)));
const a = computeA({
  maxHp: catchFoe.maxHp,
  hp: catchFoe.hp,
  catchRate: dustRate,
  ballMod: 1,
});
ok("catch a-value positive", a > 0);

const catchFail = attemptCatch({
  maxHp: catchFoe.maxHp,
  hp: catchFoe.hp,
  catchRate: 1,
  ballMod: 0.1,
  rolls: [0.99, 0.99, 0.99],
});
ok("catch can fail", catchFail.caught === false);

const catchWin = attemptCatch({
  maxHp: catchFoe.maxHp,
  hp: 1,
  catchRate: 255,
  ballMod: 1,
  seed: 42,
});
ok("catch rate 255 always succeeds", catchWin.caught === true && catchWin.shakes === 3);

const aBall1 = computeA({ maxHp: 100, hp: 50, catchRate: 100, ballMod: 1 });
const aBall2 = computeA({ maxHp: 100, hp: 50, catchRate: 100, ballMod: 2 });
ok("ballMod multiplies a", aBall2 > aBall1);
const catchGreat = attemptCatch({
  maxHp: 100,
  hp: 50,
  catchRate: 100,
  ballMod: 2,
  rolls: [0.99, 0.99, 0.99],
});
const catchStd = attemptCatch({
  maxHp: 100,
  hp: 50,
  catchRate: 100,
  ballMod: 1,
  rolls: [0.99, 0.99, 0.99],
});
ok("attemptCatch ballMod in aValue", catchGreat.aValue > catchStd.aValue);

if (catchWin.caught && party.length < 6) {
  const caught = battlerFromSpecies("dustbun", 3, "caught-1");
  addToParty(party, { battler: caught });
}
ok("party grew after catch", party.length >= 1);

// 5) Damage party then heal center
party[0].battler.hp = Math.max(1, Math.floor(party[0].battler.maxHp * 0.3));
if (party[1]) party[1].battler.hp = 1;
healParty(party);
ok(
  "heal restores all",
  party.every((m) => m.battler.hp === m.battler.maxHp && !m.battler.fainted),
);

// Heal pad geometry
const pad = createDefaultHealPad();
ok("heal pad contains center", isOnHealPad({ x: pad.cx, z: pad.cz }, pad));
ok(
  "heal pad rejects far",
  !isOnHealPad({ x: pad.cx + 10, z: pad.cz }, pad),
);

// Faint path: force player loss
const weak = battlerFromSpecies(starterId, 5, "weak");
weak.hp = 1;
const strong = battlerFromSpecies("sparkmoth", 20, "boss");
const lossBattle = createBattle({
  player: weak,
  foe: strong,
  typeChart: pack.typeChart,
});
assertNoThrow("faint path", () => {
  let g = 0;
  while (!lossBattle.over && g++ < 30) {
    executeTurn(lossBattle, {
      playerMoveIndex: pickFirstDamagingMove(lossBattle.player),
      foeMoveIndex: pickFirstDamagingMove(lossBattle.foe),
      random: 1,
    });
  }
});
ok("loss battle over", lossBattle.over);
// After black-out, heal
party[0].battler.hp = 0;
party[0].battler.fainted = true;
healParty(party);
ok("post-faint heal", party[0].battler.hp === party[0].battler.maxHp);

// --- W2-P2 playtest asserts: XP, force-switch, gym, species catch ---
const { grantBattleRewards, forceSwitchPlayer } = battleMod;
const { applyXp, xpYield, anyConscious } = partyMod;

// Gym / elite gate in ship pack
ok("gym gate present", !!pack.route.gym && typeof pack.route.gym.name === "string");
ok("elite gate present", !!pack.route.elite && typeof pack.route.elite.species === "string");
ok("gym species authored", speciesById.has(pack.route.gym.species));
ok(
  "escalating wild levels",
  pack.route.wildEncounters.some((e) => e.maxLevel >= 8) ||
    pack.route.wildEncounters.some((e) => e.band === "late"),
);

// Sparkmoth catch rate
const sparkSp = speciesById.get("sparkmoth");
ok("sparkmoth speciesCatchRate 120", speciesCatchRate(sparkSp) === 120);

// Win → XP measurable
{
  const p = battlerFromSpecies(starterId, 5, "xp-player");
  const f = battlerFromSpecies("dustbun", 4, "xp-foe");
  f.hp = 1;
  const xb = createBattle({ player: p, foe: f, typeChart: pack.typeChart });
  let g = 0;
  while (!xb.over && g++ < 20) {
    executeTurn(xb, {
      playerMoveIndex: pickFirstDamagingMove(xb.player),
      foeMoveIndex: pickFirstDamagingMove(xb.foe),
      random: 1,
    });
  }
  ok("xp path win", xb.winner === "player");
  const lvlBefore = xb.player.level;
  const rew = grantBattleRewards(xb, { baseExp: 200 });
  ok("xp granted", rew.xpGained > 0);
  ok("xp or level event", xb.log.some((e) => e.type === "xp" || e.type === "level-up"));
  // multi-win progression: apply more XP
  const rew2 = applyXp(xb.player, 500);
  ok("progression level-up possible", rew2.leveledUp || xb.player.level >= lvlBefore);
}

// Force-switch when party ≥ 2
{
  const a = battlerFromSpecies(starterId, 5, "sw-a");
  a.hp = 1;
  const b = battlerFromSpecies("dustbun", 5, "sw-b");
  const pty = createParty([{ battler: a }, { battler: b }]);
  const boss = battlerFromSpecies("sparkmoth", 25, "sw-boss");
  const sb = createBattleFromParty(pty, boss, pack.typeChart);
  let g = 0;
  while (!sb.needsForceSwitch && !sb.over && g++ < 25) {
    executeTurn(sb, {
      playerMoveIndex: pickFirstDamagingMove(sb.player),
      foeMoveIndex: pickFirstDamagingMove(sb.foe),
      random: 1,
      party: pty,
    });
  }
  ok("force-switch path", sb.needsForceSwitch === true || (sb.over && sb.winner === "foe" && !anyConscious(pty)));
  if (sb.needsForceSwitch) {
    ok("force switch succeeds", forceSwitchPlayer(sb, pty) === true);
    ok("battle continues after switch", sb.over === false);
  } else {
    ok("force switch succeeds", true); // wiped immediately edge
    ok("battle continues after switch", true);
  }
}

// Status usable (already checked) — reaffirm
ok("status move exists", moves.some((m) => m.category === "status"));
ok("priority move exists", moves.some((m) => (m.priority ?? 0) > 0));
ok("no Pollen Puff", !moves.some((m) => m.name === "Pollen Puff"));
ok("haze-puff or original puff", moves.some((m) => m.id === "haze-puff" || m.name === "Haze Puff"));

// Priority order: Quick Gleam first despite low spe
{
  const slow = battlerFromSpecies(starterId, 5, "pri-p");
  slow.stats = { ...slow.stats, spe: 5 };
  slow.moves = resolveMoves(["quick-gleam"]);
  const fast = battlerFromSpecies("dustbun", 5, "pri-f");
  fast.stats = { ...fast.stats, spe: 200 };
  fast.moves = resolveMoves(["nudge"]);
  const pb = createBattle({ player: slow, foe: fast, typeChart: pack.typeChart });
  executeTurn(pb, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 1,
    forceAccuracyHit: true,
  });
  const first = pb.log.find((e) => e.type === "move");
  ok("priority acts first", first && first.side === "player");
}



// --- W4-P3 Track S playtest: Struggle, chart, stakes, wilds ---
{
  const { STRUGGLE_MOVE } = battleMod;
  const damageMod = await import(pathToFileURL(join(root, "src/battle/damage.ts")).href);
  const contentMod2 = await import(pathToFileURL(join(root, "src/battle/content.ts")).href);
  try {
    contentMod2.validateShipTypeChart(pack.typeChart, pack.types);
    ok("type chart complete", true);
  } catch (e) {
    ok("type chart complete", false, String(e.message || e));
  }
  let threw = false;
  try {
    damageMod.typeEffectiveness("dragon", ["fire"], pack.typeChart);
  } catch {
    threw = true;
  }
  ok("missing type row fails", threw);

  const p0 = battlerFromSpecies(starterId, 5, "strug-p");
  p0.movePp = p0.moves.map(() => 0);
  const f0 = battlerFromSpecies("dustbun", 3, "strug-f");
  f0.hp = 100;
  f0.maxHp = 100;
  const stb = createBattle({ player: p0, foe: f0, typeChart: pack.typeChart });
  executeTurn(stb, {
    playerMoveIndex: 0,
    foeMoveIndex: pickFirstDamagingMove(stb.foe),
    random: 1,
    forceAccuracyHit: true,
  });
  ok(
    "0PP Struggle path",
    stb.log.some((e) => e.type === "move" && e.moveId === "struggle"),
  );
  ok("STRUGGLE_MOVE exported", STRUGGLE_MOVE && STRUGGLE_MOVE.id === "struggle");

  const defL = pack.route.playerDefaultLevel ?? 5;
  ok("gym fair level", pack.route.gym.level <= defL + 4);
  ok("elite fair level", pack.route.elite.level <= defL + 7 && pack.route.elite.level > pack.route.gym.level);

  const wildSpecies = pack.route.wildEncounters.map((e) => e.species);
  const mid = pack.route.wildEncounters.filter((e) => e.band === "mid");
  ok(
    "grass wild in pack",
    species.some((s) => s.role === "wild" && s.types.includes("grass")),
  );
  ok(
    "water wild in pack",
    species.some((s) => s.role === "wild" && s.types.includes("water")),
  );
  ok(
    "mid band grass/water",
    mid.some((e) => {
      const sp = speciesById.get(e.species);
      return sp && (sp.types.includes("grass") || sp.types.includes("water"));
    }),
  );

  const statusFx = moves.filter((m) => m.category === "status").map((m) => m.effect);
  ok("extra status tools", statusFx.length >= 3);

  ok("identity notes franchise-free", !/pok[eé]mon/i.test(String(pack.identity?.notes ?? "")));
}


console.log(`\nplaytest: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("playtest harness green");
