/**
 * Golden vectors for Wave-0 damage formula.
 * damage = floor(floor(floor(2L/5+2)*A/D*Power/50)+2) * STAB * type * random
 * random fixed at 1.0
 *
 * Run: npm run test:battle
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const damageMod = await import(
  pathToFileURL(join(root, "src/battle/damage.ts")).href
);
const battleMod = await import(
  pathToFileURL(join(root, "src/battle/battle.ts")).href
);
const contentMod = await import(
  pathToFileURL(join(root, "src/battle/content.ts")).href
);

const { calcDamage, calcMoveDamage, typeEffectiveness, stabMultiplier } =
  damageMod;
const {
  buildBattler,
  createBattle,
  executeTurn,
  pickFirstDamagingMove,
  statAtLevel,
} = battleMod;
const { normalizeMove, normalizeSpecies } = contentMod;

let failed = 0;
let passed = 0;

function assertEq(name, actual, expected) {
  const ok = Object.is(actual, expected) || actual === expected;
  if (!ok) {
    failed++;
    console.error(
      `FAIL ${name}: got ${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`,
    );
  } else {
    passed++;
    console.log(`ok   ${name}`);
  }
}

// --- Hand-computed golden vectors (random=1, crit=1) ---
assertEq(
  "neutral L50 A100 D100 Pw40",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 1,
    random: 1,
  }).damage,
  19,
);

assertEq(
  "STAB 1.5",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1.5,
    typeEffectiveness: 1,
    random: 1,
  }).damage,
  28,
);

assertEq(
  "SE 2x",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 2,
    random: 1,
  }).damage,
  38,
);

assertEq(
  "STAB+SE",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1.5,
    typeEffectiveness: 2,
    random: 1,
  }).damage,
  57,
);

assertEq(
  "NVE 0.5",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 0.5,
    random: 1,
  }).damage,
  9,
);

assertEq(
  "immune 0",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 0,
    random: 1,
  }).damage,
  0,
);

assertEq(
  "low level starter-ish",
  calcDamage({
    level: 5,
    attack: 12,
    defense: 11,
    power: 40,
    stab: 1.5,
    typeEffectiveness: 2,
    random: 1,
  }).damage,
  15,
);

assertEq(
  "power 60",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 60,
    stab: 1,
    typeEffectiveness: 1,
    random: 1,
  }).damage,
  28,
);

assertEq(
  "uneven A/D",
  calcDamage({
    level: 50,
    attack: 80,
    defense: 120,
    power: 40,
    stab: 1,
    typeEffectiveness: 1,
    random: 1,
  }).damage,
  13,
);

const chart = {
  fire: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    grass: 2,
    electric: 1,
    bug: 2,
  },
};
assertEq(
  "dual type product",
  typeEffectiveness("fire", ["bug", "electric"], chart),
  2,
);

assertEq("stab yes", stabMultiplier("fire", ["fire"]), 1.5);
assertEq("stab no", stabMultiplier("fire", ["water"]), 1);

const wave0 = JSON.parse(
  readFileSync(join(root, "content/game/wave0.json"), "utf8"),
);

const moves = wave0.moves.map((m) => normalizeMove(m));
const species = wave0.species.map((s) => normalizeSpecies(s));
const movesById = new Map(moves.map((m) => [m.id, m]));
const speciesById = new Map(species.map((s) => [s.id, s]));

const ember = speciesById.get("emberpup");
const dust = speciesById.get("dustbun");
if (!ember || !dust) {
  console.error(
    "FAIL wave0 missing emberpup/dustbun; have:",
    [...speciesById.keys()].join(","),
  );
  process.exit(1);
}

const resolveMoves = (ids) =>
  ids.map((id) => movesById.get(id)).filter(Boolean);

const player = buildBattler({
  id: "p1",
  name: ember.name,
  speciesId: ember.id,
  types: ember.types,
  level: wave0.route?.playerDefaultLevel ?? 5,
  baseStats: ember.baseStats,
  moves: resolveMoves(ember.moves),
});

const foe = buildBattler({
  id: "w1",
  name: dust.name,
  speciesId: dust.id,
  types: dust.types,
  level: 4,
  baseStats: dust.baseStats,
  moves: resolveMoves(dust.moves),
});

assertEq("hp L5 base45", statAtLevel(45, 5, "hp"), 19);
assertEq("player maxHp", player.maxHp, 19);
assertEq("atk L5 base52", statAtLevel(52, 5, "other"), 10);

const fireMove =
  movesById.get("cinder-spark") ||
  movesById.get("ember-spark") ||
  player.moves.find((m) => m.type === "fire");
if (!fireMove) {
  console.error("FAIL no fire move on emberpup");
  process.exit(1);
}

const dmg = calcMoveDamage({
  level: player.level,
  attackStat: player.stats.spa,
  defenseStat: foe.stats.spd,
  power: fireMove.power,
  moveType: fireMove.type,
  attackerTypes: player.types,
  defenderTypes: foe.types,
  typeChart: wave0.typeChart,
  random: 1,
});
// spa L5 base60=11; dust spd L4 base45=8; base dmg path → 9 with STAB
assertEq("emberpup fire vs dustbun", dmg.damage, 9);

let battle = createBattle({
  player,
  foe,
  typeChart: wave0.typeChart,
});
battle = executeTurn(battle, {
  playerMoveIndex: pickFirstDamagingMove(player),
  foeMoveIndex: pickFirstDamagingMove(foe),
  random: 1,
});

assertEq("battle log has move", battle.log.some((e) => e.type === "move"), true);
assertEq("turn advanced", battle.turn, 1);
assertEq(
  "someone took damage",
  battle.player.hp < battle.player.maxHp || battle.foe.hp < battle.foe.maxHp,
  true,
);

assertEq(
  "base field on neutral",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 1,
    random: 1,
  }).base,
  19,
);

const names = species.map((s) => s.name);
for (const banned of ["Pikachu", "Charmander", "Bulbasaur", "Squirtle"]) {
  assertEq(`no official name ${banned}`, names.includes(banned), false);
}
assertEq("has Emberpup", names.includes("Emberpup"), true);
assertEq("has Dustbun", names.includes("Dustbun"), true);
assertEq("move count >= 6", moves.length >= 6, true);


// --- W1-P4 systems: crit, stages, switch, party HP, grass starter, catchRate ---
const { rollCritical, stageMultiplier, effectiveStat, switchPlayerTo, createBattleFromParty, syncBattlePlayerToParty } = battleMod;
const partyMod = await import(pathToFileURL(join(root, "src/battle/party.ts")).href);
const catchMod = await import(pathToFileURL(join(root, "src/battle/catch.ts")).href);
const { createParty, addToParty, syncBattlerToParty, battlerFromPartyMember } = partyMod;
const { speciesCatchRate, defaultCatchRate } = catchMod;
const { rollDamageRandom, DAMAGE_RANDOM_MIN, DAMAGE_RANDOM_MAX } = damageMod;

assertEq("crit force", rollCritical(0, true).isCrit, true);
assertEq("crit force mult", rollCritical(0, true).multiplier, 1.5);
assertEq("crit no force high roll", rollCritical(0.5, false).isCrit, false);
assertEq("crit base rate low roll", rollCritical(0).isCrit, true);
assertEq("crit base rate mid roll", rollCritical(0.1).isCrit, false);

assertEq(
  "crit multiplies damage",
  calcDamage({
    level: 50,
    attack: 100,
    defense: 100,
    power: 40,
    stab: 1,
    typeEffectiveness: 1,
    random: 1,
    critical: 1.5,
  }).damage,
  28,
);

assertEq("stage 0 mult", stageMultiplier(0), 1);
assertEq("stage +1 mult", stageMultiplier(1), 1.5);
assertEq("stage -1 mult", stageMultiplier(-1), 2 / 3);

assertEq("random band min", DAMAGE_RANDOM_MIN, 0.85);
assertEq("random band max", DAMAGE_RANDOM_MAX, 1.0);
assertEq("rollDamageRandom 0", rollDamageRandom(0), 0.85);
assertEq("rollDamageRandom 1", rollDamageRandom(1), 1.0);

const leaf = speciesById.get("leafkit");
assertEq("grass starter exists", !!leaf, true);
assertEq("leafkit grass type", leaf?.types?.[0], "grass");
assertEq(
  "three starters",
  (wave0.route?.starterChoices ?? []).length >= 3,
  true,
);
assertEq(
  "starters include leafkit",
  (wave0.route?.starterChoices ?? []).includes("leafkit"),
  true,
);

// Status stage: Growl Down lowers atk
const statusBattle = createBattle({
  player: buildBattler({
    id: "sp",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(["growl-down", "nudge"]),
  }),
  foe: buildBattler({
    id: "sf",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 4,
    baseStats: dust.baseStats,
    moves: resolveMoves(["nudge"]),
  }),
  typeChart: wave0.typeChart,
});
const atkBefore = statusBattle.foe.stats.atk;
executeTurn(statusBattle, {
  playerMoveIndex: 0, // growl-down
  foeMoveIndex: 0,
  random: 1,
});
assertEq(
  "status event emitted",
  statusBattle.log.some((e) => e.type === "status" && e.stageStat === "atk"),
  true,
);
assertEq("foe atk stage -1", statusBattle.foe.stages?.atk, -1);
assertEq(
  "effective atk reduced",
  effectiveStat(statusBattle.foe, "atk") < atkBefore,
  true,
);

// Crit flag on damage event
const critBattle = createBattle({
  player: buildBattler({
    id: "cp",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(ember.moves),
  }),
  foe: buildBattler({
    id: "cf",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 4,
    baseStats: dust.baseStats,
    moves: resolveMoves(dust.moves),
  }),
  typeChart: wave0.typeChart,
});
executeTurn(critBattle, {
  playerMoveIndex: pickFirstDamagingMove(critBattle.player),
  foeMoveIndex: pickFirstDamagingMove(critBattle.foe),
  random: 1,
  forceCrit: true,
});
assertEq(
  "crit event in log",
  critBattle.log.some((e) => e.type === "crit" && e.critical === true),
  true,
);
assertEq(
  "damage event critical flag",
  critBattle.log.some((e) => e.type === "damage" && e.critical === true),
  true,
);

// Party HP preserved into battle + sync on exit
const bruised = buildBattler({
  id: "party-lead",
  name: ember.name,
  speciesId: ember.id,
  types: ember.types,
  level: 5,
  baseStats: ember.baseStats,
  moves: resolveMoves(ember.moves),
  hp: 5,
});
const party = createParty([{ battler: bruised }]);
const buddy = buildBattler({
  id: "party-2",
  name: dust.name,
  speciesId: dust.id,
  types: dust.types,
  level: 5,
  baseStats: dust.baseStats,
  moves: resolveMoves(dust.moves),
});
addToParty(party, { battler: buddy });
const wildFoe = buildBattler({
  id: "wild",
  name: dust.name,
  speciesId: dust.id,
  types: dust.types,
  level: 3,
  baseStats: dust.baseStats,
  moves: resolveMoves(dust.moves),
});
let pb = createBattleFromParty(party, wildFoe, wave0.typeChart);
assertEq("enter from party preserves HP", pb.player.hp, 5);
assertEq("party index tracked", pb.playerPartyIndex, 0);

// switch to index 1
switchPlayerTo(pb, party, 1);
assertEq("switched name", pb.player.id, "party-2");
assertEq("switch event", pb.log.some((e) => e.type === "switch"), true);
// outgoing HP synced (still 5)
assertEq("outgoing HP synced", party[0].battler.hp, 5);

// deal damage and sync exit
executeTurn(pb, {
  playerMoveIndex: pickFirstDamagingMove(pb.player),
  foeMoveIndex: pickFirstDamagingMove(pb.foe),
  random: 1,
});
syncBattlePlayerToParty(pb, party);
assertEq(
  "sync exit wrote HP",
  party[1].battler.hp === pb.player.hp,
  true,
);

// per-species catch rate
assertEq("dustbun catchRate field", dust.catchRate ?? speciesCatchRate(dust), 255);
assertEq("ember starter catch", speciesCatchRate(ember), 45);
assertEq("default wild", defaultCatchRate("wild"), 190);
assertEq(
  "species overrides role",
  speciesCatchRate({ catchRate: 200, role: "starter" }),
  200,
);

console.log("");
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
