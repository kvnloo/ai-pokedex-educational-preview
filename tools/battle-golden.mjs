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
const { rollDamageRandom, clampDamageRandom, DAMAGE_RANDOM_MIN, DAMAGE_RANDOM_MAX } = damageMod;

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
assertEq("clampDamageRandom high", clampDamageRandom(1.5), 1.0);
assertEq("clampDamageRandom low", clampDamageRandom(0.1), 0.85);
assertEq("clampDamageRandom mid", clampDamageRandom(0.92), 0.92);

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

// --- W2-P2: live rolls, force-switch, XP, species catch, gym gate ---
const {
  grantBattleRewards,
  forceSwitchPlayer,
  pickFoeMove,
} = battleMod;
const { applyXp, xpYield, anyConscious, consciousIndices } = partyMod;

// Live rolls: without random pin, damage uses 0.85–1.0 band via seeded rng
{
  let i = 0;
  const seq = [0, 0.5, 0.99, 0.2, 0.8, 0.1, 0.3, 0.4];
  const rng = () => seq[i++ % seq.length];
  const liveB = createBattle({
    player: buildBattler({
      id: "lp",
      name: ember.name,
      speciesId: ember.id,
      types: ember.types,
      level: 5,
      baseStats: ember.baseStats,
      moves: resolveMoves(ember.moves),
    }),
    foe: buildBattler({
      id: "lf",
      name: dust.name,
      speciesId: dust.id,
      types: dust.types,
      level: 4,
      baseStats: dust.baseStats,
      moves: resolveMoves(dust.moves),
    }),
    typeChart: wave0.typeChart,
  });
  executeTurn(liveB, {
    playerMoveIndex: pickFirstDamagingMove(liveB.player),
    foeMoveIndex: pickFirstDamagingMove(liveB.foe),
    rng,
    // no random → live mode
  });
  assertEq("live turn advances", liveB.turn, 1);
  assertEq(
    "live can deal damage or miss",
    liveB.log.some((e) => e.type === "damage" || e.type === "miss"),
    true,
  );
}

// Accuracy miss when roll high
{
  const missB = createBattle({
    player: buildBattler({
      id: "mp",
      name: ember.name,
      speciesId: ember.id,
      types: ember.types,
      level: 5,
      baseStats: ember.baseStats,
      moves: resolveMoves(["wool-rush"]), // acc 95
    }),
    foe: buildBattler({
      id: "mf",
      name: dust.name,
      speciesId: dust.id,
      types: dust.types,
      level: 4,
      baseStats: dust.baseStats,
      moves: resolveMoves(["nudge"]),
    }),
    typeChart: wave0.typeChart,
  });
  executeTurn(missB, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 1,
    accuracyRolls: [0.99, 0], // player misses (99>=95), foe hits
  });
  assertEq("accuracy miss event", missB.log.some((e) => e.type === "miss"), true);
}

// Crit via live-ish critRoll low
{
  const cB = createBattle({
    player: buildBattler({
      id: "crp",
      name: ember.name,
      speciesId: ember.id,
      types: ember.types,
      level: 5,
      baseStats: ember.baseStats,
      moves: resolveMoves(ember.moves),
    }),
    foe: buildBattler({
      id: "crf",
      name: dust.name,
      speciesId: dust.id,
      types: dust.types,
      level: 4,
      baseStats: dust.baseStats,
      moves: resolveMoves(dust.moves),
    }),
    typeChart: wave0.typeChart,
  });
  executeTurn(cB, {
    playerMoveIndex: pickFirstDamagingMove(cB.player),
    foeMoveIndex: pickFirstDamagingMove(cB.foe),
    random: 1,
    critRoll: 0, // < 1/16
  });
  assertEq("critRoll 0 lands crit", cB.log.some((e) => e.type === "crit"), true);
}

// Force-switch: player faint with reserve does not end battle
{
  const leadB = buildBattler({
    id: "fs-lead",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(ember.moves),
    hp: 1,
  });
  const reserveB = buildBattler({
    id: "fs-res",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 5,
    baseStats: dust.baseStats,
    moves: resolveMoves(dust.moves),
  });
  const fparty = createParty([{ battler: leadB }, { battler: reserveB }]);
  const strongFoe = buildBattler({
    id: "fs-foe",
    name: "Sparkmoth",
    speciesId: "sparkmoth",
    types: ["bug", "electric"],
    level: 20,
    baseStats: speciesById.get("sparkmoth").baseStats,
    moves: resolveMoves(speciesById.get("sparkmoth").moves),
  });
  let fs = createBattleFromParty(fparty, strongFoe, wave0.typeChart);
  // Ensure foe moves first by high spe already; force damage to KO lead
  let guard = 0;
  while (!fs.needsForceSwitch && !fs.over && guard++ < 20) {
    executeTurn(fs, {
      playerMoveIndex: pickFirstDamagingMove(fs.player),
      foeMoveIndex: pickFirstDamagingMove(fs.foe),
      random: 1,
      party: fparty,
    });
  }
  assertEq("force-switch needed", fs.needsForceSwitch === true, true);
  assertEq("not over while reserve", fs.over, false);
  assertEq("force-switch event", fs.log.some((e) => e.type === "force-switch"), true);
  const okSwitch = forceSwitchPlayer(fs, fparty);
  assertEq("forceSwitchPlayer ok", okSwitch, true);
  assertEq("active is reserve", fs.player.id, "fs-res");
  assertEq("needsForceSwitch cleared", fs.needsForceSwitch, false);
}

// XP grant on win
{
  const p = buildBattler({
    id: "xp-p",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(ember.moves),
  });
  const f = buildBattler({
    id: "xp-f",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 4,
    baseStats: dust.baseStats,
    moves: resolveMoves(dust.moves),
    hp: 1,
  });
  let xb = createBattle({ player: p, foe: f, typeChart: wave0.typeChart });
  executeTurn(xb, {
    playerMoveIndex: pickFirstDamagingMove(xb.player),
    foeMoveIndex: pickFirstDamagingMove(xb.foe),
    random: 1,
  });
  // may need more turns if player didn't KO
  let g = 0;
  while (!xb.over && g++ < 15) {
    executeTurn(xb, {
      playerMoveIndex: pickFirstDamagingMove(xb.player),
      foeMoveIndex: pickFirstDamagingMove(xb.foe),
      random: 1,
    });
  }
  assertEq("xp battle player win", xb.winner, "player");
  const beforeLevel = xb.player.level;
  const beforeXp = xb.player.xp ?? 0;
  const reward = grantBattleRewards(xb, { baseExp: 50 });
  assertEq("xp gained positive", reward.xpGained > 0, true);
  assertEq("xp event logged", xb.log.some((e) => e.type === "xp"), true);
  assertEq("player xp increased", (xb.player.xp ?? 0) + (reward.leveledUp ? xb.player.xpToNext : 0) >= beforeXp, true);
  // Level-up with large XP
  const pup = buildBattler({
    id: "lv-p",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(ember.moves),
  });
  const lvl = applyXp(pup, 999);
  assertEq("level up from applyXp", lvl.leveledUp, true);
  assertEq("level increased", pup.level > 5, true);
  assertEq("xpYield L4", xpYield(4, 50), Math.floor((50 * 4) / 7));
}

// Species catch rates sparkmoth
const spark = speciesById.get("sparkmoth");
assertEq("sparkmoth catchRate 120", speciesCatchRate(spark), 120);


// --- W3-P3: damage random clamp, priority, ballMod ---
{
  // Explicit random outside band is clamped in executeTurn path
  const clampB = createBattle({
    player: buildBattler({
      id: "clp",
      name: ember.name,
      speciesId: ember.id,
      types: ember.types,
      level: 5,
      baseStats: ember.baseStats,
      moves: resolveMoves(["nudge"]),
    }),
    foe: buildBattler({
      id: "clf",
      name: dust.name,
      speciesId: dust.id,
      types: dust.types,
      level: 4,
      baseStats: dust.baseStats,
      moves: resolveMoves(["nudge"]),
    }),
    typeChart: wave0.typeChart,
  });
  const foeHpBefore = clampB.foe.hp;
  executeTurn(clampB, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 2.0, // illegal — must clamp to 1.0
    forceCrit: false,
    forceAccuracyHit: true,
  });
  const dmgEvt = clampB.log.find((e) => e.type === "damage" && e.side === "player");
  assertEq("clamped random still damages", !!dmgEvt && dmgEvt.damage > 0, true);
  // Compare vs random 1.0 reference
  const refB = createBattle({
    player: buildBattler({
      id: "clp2",
      name: ember.name,
      speciesId: ember.id,
      types: ember.types,
      level: 5,
      baseStats: ember.baseStats,
      moves: resolveMoves(["nudge"]),
    }),
    foe: buildBattler({
      id: "clf2",
      name: dust.name,
      speciesId: dust.id,
      types: dust.types,
      level: 4,
      baseStats: dust.baseStats,
      moves: resolveMoves(["nudge"]),
    }),
    typeChart: wave0.typeChart,
  });
  executeTurn(refB, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 1.0,
    forceCrit: false,
    forceAccuracyHit: true,
  });
  const d1 = clampB.log.find((e) => e.type === "damage" && e.side === "player")?.damage;
  const d2 = refB.log.find((e) => e.type === "damage" && e.side === "player")?.damage;
  assertEq("random 2.0 clamps to 1.0 damage", d1, d2);
}

// Priority: Quick Gleam (+1) outspeeds higher spe foe with priority 0
{
  const slow = buildBattler({
    id: "pri-slow",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: { ...ember.baseStats, spe: 10 },
    moves: resolveMoves(["quick-gleam"]),
  });
  const fast = buildBattler({
    id: "pri-fast",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 5,
    baseStats: { ...dust.baseStats, spe: 200 },
    moves: resolveMoves(["nudge"]),
  });
  const pb = createBattle({ player: slow, foe: fast, typeChart: wave0.typeChart });
  executeTurn(pb, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 1,
    forceCrit: false,
    forceAccuracyHit: true,
  });
  const firstMove = pb.log.find((e) => e.type === "move");
  assertEq("priority move acts first", firstMove?.side, "player");
  assertEq("priority move id", firstMove?.moveId, "quick-gleam");
  assertEq(
    "quick-gleam priority 1",
    movesById.get("quick-gleam")?.priority,
    1,
  );
}

// ballMod affects a-value
{
  const base = {
    maxHp: 100,
    hp: 50,
    catchRate: 100,
  };
  const a1 = catchMod.computeA({ ...base, ballMod: 1 });
  const a15 = catchMod.computeA({ ...base, ballMod: 1.5 });
  const a2 = catchMod.computeA({ ...base, ballMod: 2 });
  assertEq("ballMod 1.5 raises a", a15 > a1, true);
  assertEq("ballMod 2 raises a further", a2 > a15, true);
  // attemptCatch with high ballMod more likely / higher aValue
  const c1 = catchMod.attemptCatch({ ...base, ballMod: 1, rolls: [0.99, 0.99, 0.99] });
  const c2 = catchMod.attemptCatch({ ...base, ballMod: 2, rolls: [0.99, 0.99, 0.99] });
  assertEq("attemptCatch uses ballMod in a", c2.aValue > c1.aValue, true);
}

// No official move name Pollen Puff
assertEq(
  "no official Pollen Puff",
  moves.some((m) => m.name === "Pollen Puff" || m.id === "pollen-puff"),
  false,
);
assertEq("haze-puff present", movesById.has("haze-puff"), true);

// Gym / elite content
assertEq("gym node present", !!wave0.route?.gym?.id, true);
assertEq("elite node present", !!wave0.route?.elite?.id, true);
assertEq("gym original name", typeof wave0.route?.gym?.name === "string", true);
assertEq(
  "wild bands escalate",
  (wave0.route?.wildEncounters ?? []).some((e) => e.band === "late" || e.maxLevel >= 8),
  true,
);
assertEq("ironwisp species", speciesById.has("ironwisp"), true);
assertEq("gloomhorn species", speciesById.has("gloomhorn"), true);

// Foe AI prefers SE
{
  const foeAi = buildBattler({
    id: "ai-f",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(["nudge", "cinder-spark"]),
  });
  const grassDef = buildBattler({
    id: "ai-p",
    name: "Leafkit",
    speciesId: "leafkit",
    types: ["grass"],
    level: 5,
    baseStats: speciesById.get("leafkit").baseStats,
    moves: resolveMoves(["nudge"]),
  });
  const idx = pickFoeMove(foeAi, grassDef, wave0.typeChart);
  assertEq("foe AI prefers fire SE", foeAi.moves[idx].type, "fire");
}


// --- W4-P3 Track S: Struggle, type chart completeness, fair stakes ---
{
  const { assertTypeChartComplete } = damageMod;
  const { validateShipTypeChart } = contentMod;
  const { STRUGGLE_MOVE } = battleMod;

  assertEq("STRUGGLE_MOVE power", STRUGGLE_MOVE.power, 50);
  assertEq("STRUGGLE_MOVE type", STRUGGLE_MOVE.type, "normal");

  try {
    assertTypeChartComplete(wave0.typeChart, wave0.types);
    validateShipTypeChart(wave0.typeChart, wave0.types);
    passed++;
    console.log("ok   type chart complete");
  } catch (e) {
    failed++;
    console.error(`FAIL type chart complete: ${e.message || e}`);
  }

  let threwRow = false;
  try {
    typeEffectiveness("dragon", ["normal"], wave0.typeChart);
  } catch {
    threwRow = true;
  }
  assertEq("missing chart row throws", threwRow, true);

  let threwCell = false;
  try {
    typeEffectiveness("fire", ["dragon"], wave0.typeChart);
  } catch {
    threwCell = true;
  }
  assertEq("missing chart cell throws", threwCell, true);

  const p = buildBattler({
    id: "str-p",
    name: ember.name,
    speciesId: ember.id,
    types: ember.types,
    level: 5,
    baseStats: ember.baseStats,
    moves: resolveMoves(["nudge"]),
  });
  p.movePp = [0];
  const f = buildBattler({
    id: "str-f",
    name: dust.name,
    speciesId: dust.id,
    types: dust.types,
    level: 4,
    baseStats: dust.baseStats,
    moves: resolveMoves(["nudge"]),
  });
  f.hp = 200;
  f.maxHp = 200;
  const sb = createBattle({ player: p, foe: f, typeChart: wave0.typeChart });
  const hpBefore = sb.player.hp;
  executeTurn(sb, {
    playerMoveIndex: 0,
    foeMoveIndex: 0,
    random: 1,
    forceAccuracyHit: true,
  });
  assertEq(
    "0PP uses Struggle move event",
    sb.log.some((e) => e.type === "move" && e.moveId === "struggle" && e.side === "player"),
    true,
  );
  assertEq(
    "0PP Struggle message",
    sb.log.some((e) => e.type === "message" && /no PP left/i.test(e.message || "")),
    true,
  );
  assertEq(
    "Struggle recoil applied",
    sb.player.hp < hpBefore ||
      sb.log.some((e) => e.type === "damage" && /recoil/i.test(e.message || "")),
    true,
  );

  const defL = wave0.route?.playerDefaultLevel ?? 5;
  const gymL = wave0.route?.gym?.level ?? 99;
  const eliteL = wave0.route?.elite?.level ?? 99;
  assertEq("gym level fair (<= default+4)", gymL <= defL + 4, true);
  assertEq("elite above gym", eliteL > gymL, true);
  assertEq("elite level fair (<= default+7)", eliteL <= defL + 7, true);

  const wilds = wave0.route?.wildEncounters ?? [];
  const mid = wilds.filter((e) => e.band === "mid");
  const hasGrassWild = species.some((s) => s.role === "wild" && s.types.includes("grass"));
  const hasWaterWild = species.some((s) => s.role === "wild" && s.types.includes("water"));
  assertEq("grass wild species", hasGrassWild, true);
  assertEq("water wild species", hasWaterWild, true);
  assertEq(
    "mid band includes grass or water wild",
    mid.some((e) => {
      const sp = speciesById.get(e.species);
      return sp && (sp.types.includes("grass") || sp.types.includes("water"));
    }),
    true,
  );
  assertEq("mid band not empty", mid.length >= 2, true);

  const statusEffects = moves
    .filter((m) => m.category === "status")
    .map((m) => m.effect)
    .filter(Boolean);
  assertEq("status effect count >= 3", statusEffects.length >= 3, true);
  assertEq(
    "has raise-def status",
    statusEffects.some((e) => /^raise-def-/.test(e)),
    true,
  );
  assertEq(
    "has lower-spa or raise-spd status",
    statusEffects.some((e) => /^lower-spa-/.test(e) || /^raise-spd-/.test(e)),
    true,
  );

  const notes = String(wave0.identity?.notes ?? "");
  assertEq("identity.notes franchise-free", /pok[eé]mon/i.test(notes), false);
}


console.log("");
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
