# Wave 4 packages (synthesize)

**Constraint:** max 4 packages · disjoint `owned_files` · size to finish  
**Rank key:** mode-7 blind A/B delta first, then mode-3/5 playtest integrity, then hard F gate  
**Context:** `playtest_pass=true` is **not** wave exit. Mode-4 hard fail (`p99_ms=17.5 > 16.7`, `gates.ok=false`). Mode-5 free-roam→Fight ≤400ms structurally broken (~1140ms staging). Catch fail / voluntary switch skip foe turn; party-full catch lies. Emberpup still snowman/plastic at overworld distance. Standing gates still pin wave3 and profile without `--gate`. Mode 7 must prefer US over Twilight Wings or keep looping. Ship names only.

## Priority order

| # | id | Title | Primary modes |
|---|-----|--------|----------------|
| 1 | W4-P1 | Creature craft: silhouette + fur + clip gait | 1, 2, 7, D |
| 2 | W4-P2 | Shell: camera/grass, battle juice, loop integrity, medium GPU | 1, 3, 4, 5, A/B/C/E/F/H/J |
| 3 | W4-P3 | Track S: Struggle, type chart, content stakes | 3, 6, C/E |
| 4 | W4-P4 | Gates + ship-boundary + work-time profile | 1, 4, F/G/H/I |

---

## W4-P1 — Creature craft: silhouette, tactile fur, leg gait + attack compose

**Why first (mode-7):** Labels-hidden stills lose to TW when Emberpup reads as stacked orange spheres + plastic fur. Highest presentation delta without main ownership: rebuild long-axis canine volume, fur map/normal strength, quadruped leg secondary motion, attack clip that can compose with shell lunge once P2 stops zeroing clip Z.

**owned_files (exclusive):**
- `src/creatures/speciesMeshes.ts`
- `src/render/materials.ts`
- `src/creatures/clips.ts`
- Thin `src/creatures/*` helpers only if required for builders/clip tags (not `main.ts`)
- Does **not** own `src/main.ts`, `src/battle/**`, `src/world/**`, `tools/**`, `content/**`, `vite.config.ts`

**Findings addressed:**
- Emberpup rear/3/4 silhouette snowman (capsule+spheres) → elongated torso, neck, ears, multi-lobe flame that peeks past body
- Fur smooth toon/plastic → higher-res/repeat fur maps, stronger normalScale, subtle albedo variation (D materials)
- secondaryMotion missing legFL/FR/BL/BR → phase-offset stride on rotation.x; amplify on attackAmt
- Attack clip duration vs playLunge desync (clip side) → align attack clip impact window (~p0.5) with ~150–220ms lunge so P2 can compose
- Document clip root.z contract for P2 (compose, do not own main restore)

**Acceptance:**
1. Mode-1 overworld still: Emberpup reads as low long canine (not snowman); flame/legs resolve at follow distance.
2. Soft key+fill still: fur grain/normal reads (not flat plastic orange).
3. Idle shows leg plant/stride secondary; attack secondary amplifies; no root-only-only motion for quadruped.
4. Mesh QA still rejects cube/paper-thin; original ship ids only.
5. `npm run typecheck && npm run build` green.

**verify_cmd:** `npm run typecheck && npm run build`

**categories:** D

**Coordination:** Land before/with P2 re-capture. P2 owns composing clip Z with lunge (stop restore-overwrite). P1 does not edit battle camera or grass.

---

## W4-P2 — Shell: overworld feel, battle staging/lunge, catch/switch turns, medium GPU

**Why (mode-7 + playtest + F):** Single call site for camera pops, grass telegraph, free-roam→Fight budget, attacker-correct lunge sandwich, catch/switch turn consumption, medium shadow/AA/grass cost. Without shell, P1 silhouettes sit on sparse path-bleeding grass under crane cam; mode-5 always OVER 400ms; catch spam risk-free; p99 stays ~17.5.

**owned_files (exclusive):**
- `src/main.ts`
- `src/world/explore.ts`
- `index.html` only if menu PP / bag catch UI markup required
- Does **not** own `src/creatures/**`, `src/render/materials.ts`, `src/battle/**`, `tools/**`, `src/core/frameStats.ts`, `content/game/**`, `package.json`, `vite.config.ts`

**Findings addressed (A/B/C/E/F/H/J shell call sites):**
- Starter→explore hard pop: pass spawn `pos` into `createExploreState`; init camFollow from explore.pos only
- Crane framing → intimate third-person (height ~2.1–2.4, dist ~3.2–3.8, lookY up, bias behind move yaw)
- Tall grass: exclude path |x|<~0.95; denser/taller band; darker undergrowth material
- Nearby blade part/sink on footPlant/inGrass; optional rustle under feet
- Foot dust: larger soft puffs, upward drift, runBlend-scaled; dirt vs grass tint
- Encounter: N grassSteps / rustle pulses before first roll; ramp chance; pre-encounter wind-up AV
- Mode-5 budget: shorten send-out (~180–220ms), overlap foe settle + partner ball, or mark ready at first interactive Fight with staging documented; target free-roam→Fight ≤400ms interactive
- Lunge sandwich: lunge dealing side per hit; drop wrong player-first + indexOf>0 foe gate; first-attack-frame at lunge punch / attack apex
- Compose clip root Z with playerLunge/foeLunge (stop zeroing clip attack translation); sink vs clip scale: intentional multiply / baseScale on send-out
- Catch fail → foe half-turn / executeTurn before menu return
- Voluntary switch → foe move after switchPlayerTo
- Catch success: honor party-of-6 (box/reject message); deep clone before addToParty
- Fight menu: disable 0-PP moves; live foe AI `pickFoeMove` (not pickFirstDamagingMove)
- Medium preset path: BasicShadowMap or shadows off / blob-only; map 512; tight frustum; grass InstancedMesh or castShadow false; AA false on medium; cheaper tone/lights if needed; sway subset; lock buffer to preset size (no resize expand under medium)
- Progression soft gates: gymCleared/eliteCleared; elite after gym; optional under-level toast
- Starter picker: shipCreatureMesh in cards + type triangle / gym teaser one-liner if markup available
- Optional: battle mid-juice capture path under shots/wave4 (if capture hooks live in main only)

**Acceptance:**
1. No hard pop starter→explore; cam follows spawn pos; framing intimate third-person (creature large in still).
2. Tall grass risk band distinct from path/lawn; path clear; part/rustle under feet in grass.
3. Free-roam→interactive Fight ≤400ms measured (or staging parallelized under budget); lunge order matches hit.side; move→first-attack-frame at visual apex path.
4. Failed catch and voluntary switch each give foe a real action before menu; full party catch does not claim "joined" falsely; clone not shared refs.
5. 0-PP moves not selectable; live turns use pickFoeMove.
6. `?preset=medium-1080p`: AA off or preset-faithful, cheaper shadows, fewer grass draw/casters; work path ready for P4 re-profile.
7. Elite soft-blocked until gym clear (or equivalent ordered gate).
8. `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build` green.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build && node tools/capture.mjs --label wave4`

**categories:** A, B, C, E, F, H, J

**Coordination:** Consumes P1 meshes/clips and P3 Struggle/chart APIs. Does not reimplement damage formula. P4 owns gated profile tooling and standing-gates wave label.

---

## W4-P3 — Track S + content: Struggle, chart honesty, escalating fun stakes

**Why (playtest / mode-6):** Shell can disable 0-PP and call pickFoeMove only if engine substitutes Struggle and chart defects fail loud; route fun needs gym/elite levels and wild type pressure that make catching/switching beat STAB mash.

**owned_files (exclusive):**
- `src/battle/battle.ts`
- `src/battle/damage.ts`
- `src/battle/party.ts`
- `src/battle/catch.ts`
- `src/battle/content.ts`
- `src/battle/types.ts` (only if needed)
- `content/game/wave0.json`
- `tools/battle-golden.mjs`
- `tools/playtest.mjs` (systems asserts only)
- Does **not** own `src/main.ts`, `src/creatures/**`, `tools/profile.mjs`, `tools/check-ship-boundary.mjs`

**Findings addressed:**
- 0-PP path: substitute Struggle (typeless recoil) before ordering; goldens
- typeEffectiveness: missing row/key is defect (assert at pack load or hard error in debug), not silent 1
- Status lane: 2–3 real status effects on wild/gym learnsets (speed/spa/accuracy drops) + data P2 can toast
- Gym ~8–9 / elite ~11–12 (or XP/heal milestones) so monotype demo path is fair vs playerDefaultLevel 5
- Wild mid/late: grass/water (or dual) species so type triangle + catch/switch express
- Mid-band filter data/weights: mid-only after wins; late after 3 wins not early-dominated
- identity.notes: zero franchise tokens (no `Pokémon` / unicode escape); original names only in ship pack
- Keep pickFoeMove SE preference golden; shell wires live call (P2)

**Acceptance:**
1. Golden: 0 PP → Struggle resolves with recoil; both sides cannot no-op forever.
2. Missing type chart entries fail load/test (not silent neutral).
3. wave0: gym/elite levels fair for short demo; ≥1 grass/water wild; ≥2 status tools beyond lower-atk-1.
4. notes/strings: no franchise marks after JSON.parse.
5. `npm run typecheck && npm run test:battle && npm run test:playtest` green.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest`

**categories:** C, E, I

**Coordination:** P2 calls Struggle-ready executeTurn and pickFoeMove. P4 check-ship must catch unicode franchise after P3 rewrites notes.

---

## W4-P4 — Regression gates, ship-boundary decode, work-time profile

**Why (G + hard F loop close):** Wave4 re-measures still pin wave3; `profile` exits 0 with `gates.ok=false`; ship check misses `Pok\u00e9mon`. Without gate enforcement + work-time sampling, category F never blocks land and p99≤16.7 on pure vsync rAF stays nearly unreachable.

**owned_files (exclusive):**
- `tools/profile.mjs`
- `tools/check-ship-boundary.mjs`
- `src/core/frameStats.ts`
- `shots/playtest/standing-gates.json`
- `package.json` (scripts only: profile/verify/land gate flags + wave label)
- `vite.config.ts` (publicDir allowlist / no research leak into dist)
- Does **not** own `src/main.ts` (instrument hook: expose only via frameStats API that main may already call; if inject needed, document one-line import for P2 — do not edit main in this package unless already importing frameStats; prefer profile.mjs + frameStats export)
- Does **not** own `content/game/wave0.json` (P3 rewrites notes)

**Findings addressed:**
- standing-gates wave_label + all mode_* / land_cmd → wave4; profile with `--seconds 180 --gate`
- land_cmd / npm run profile: `--gate`; non-zero exit when `gates.ok=false`
- profile.mjs: default or land path fail-closed on p99; prefer spent-ms / work-time (rAF-to-rAF vsync floor documented; measure inside tick if app exposes `__frameStats`)
- MEDIUM_1080P.antialias=false in frameStats; profile PRESET sync
- check-ship: JSON.parse / unescape before FORBIDDEN_STRINGS; fixture for `Pok\u00e9mon`
- vite: stop admitting full public research tree (allowlist; no ab/content warehouse into ship dist)

**Acceptance:**
1. `node tools/profile.mjs --label wave4 --gate` exits non-zero when p99>16.7 or frames_over_50ms>0.
2. standing-gates.json wave_label=wave4; mode_4 cmd includes 180s + gate; land_cmd gated.
3. `npm run profile` targets wave4 + gate; verify/land path can block on F.
4. `npm run check:ship` (or package script) fails on unicode franchise in wave0 if present; passes after P3 clean notes.
5. dist ship surface does not include research warehouse paths after build.
6. frameStats medium preset antialias false; notes document work-time vs vsync sampling.

**verify_cmd:** `npm run typecheck && npm run build && node tools/check-ship-boundary.mjs && node tools/profile.mjs --label wave4 --seconds 45 --gate || true`

**categories:** F, G, H, I

**Coordination:** Re-run gated profile after P2 medium GPU cuts. Treat gates.ok as hard wave fail. Do not claim land green while p99_ok false.

---

## Deferred (next wave / out of size)

- Full mode-7 overnight blind panel host (requires stills after P1+P2 land)
- Directed mode-5 staging as separate cinematic mode if ≤400ms still impossible after compress
- Box storage UI beyond honest reject when party full
- Ultra/high preset soft shadows + MSAA polish
- Multi-route content expansion beyond vertical slice
- Audio / music pass
- Shader grass sway (if InstancedMesh still CPU-heavy after P2)

## Package file-ownership matrix (must stay disjoint)

| File | Owner |
|------|--------|
| `src/creatures/speciesMeshes.ts`, `clips.ts`, `src/render/materials.ts` | W4-P1 |
| `src/main.ts`, `src/world/explore.ts` | W4-P2 |
| `src/battle/**`, `content/game/wave0.json`, battle/playtest tools | W4-P3 |
| `tools/profile.mjs`, `tools/check-ship-boundary.mjs`, `src/core/frameStats.ts`, `shots/playtest/standing-gates.json`, `package.json`, `vite.config.ts` | W4-P4 |
