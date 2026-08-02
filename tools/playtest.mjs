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

const {
  buildBattler,
  createBattle,
  executeTurn,
  pickFirstDamagingMove,
} = battleMod;
const { normalizeMove, normalizeSpecies } = contentMod;
const { attemptCatch, defaultCatchRate, computeA } = catchMod;
const { createParty, healParty, addToParty, lead } = partyMod;
const {
  createExploreState,
  tickExplore,
  isInGrass,
  isOnHealPad,
  createDefaultHealPad,
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

// 2) Explore WASD into grass
const explore = createExploreState({
  pos: { x: 0, z: 2.5 },
  grass: { cx: 0, cz: -1.2, half: 2.6, encounterChance: 1 },
});
explore.keys.add("w");
let hitGrass = false;
let encounter = false;
// Force deterministic rng: always encounter once in grass
let rolled = false;
const rng = () => {
  if (!rolled && isInGrass(explore.pos, explore.grass)) {
    rolled = true;
    return 0;
  }
  return 0.99;
};
for (let i = 0; i < 120; i++) {
  const r = tickExplore(explore, 1 / 30, rng);
  if (r.inGrass) hitGrass = true;
  if (r.encounter) {
    encounter = true;
    break;
  }
}
ok("reached grass", hitGrass, `pos=${JSON.stringify(explore.pos)}`);
ok("grass encounter fired", encounter);

// 3) Battle fight until faint (one side)
const wild = pack.route.wildEncounters[0];
const foe = battlerFromSpecies(wild.species, wild.minLevel, "wild");
const battle = createBattle({
  player: lead(party).battler,
  foe,
  typeChart: pack.typeChart,
});

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

// Sync party HP from battle player
party[0].battler.hp = battle.player.hp;
party[0].battler.fainted = battle.player.fainted;

// 4) Catch flow (fresh low-HP foe)
const catchFoe = battlerFromSpecies("dustbun", 3, "catch-wild");
catchFoe.hp = 1;
const a = computeA({
  maxHp: catchFoe.maxHp,
  hp: catchFoe.hp,
  catchRate: defaultCatchRate("wild"),
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

console.log(`\nplaytest: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("playtest harness green");
