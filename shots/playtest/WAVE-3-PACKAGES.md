# Wave 3 packages (synthesize)

**Constraint:** max 4 packages · disjoint `owned_files` · size to finish  
**Rank key:** mode-7 blind A/B delta first, then mode-3/5 playtest integrity  
**Context:** `playtest_pass=true` is **not** wave exit. Wave3 stills still read as toy sphere/cone creatures + cone grass under flat grade; p99=17.5ms fails mode-4; ship `dist` leaks official warehouse; battle shell still skips live rolls / party force-switch / XP grant / gym wire; mode 7 not run (`loop_exit=false`). Prefer-US over Twilight Wings required or keep looping.

## Priority order

| # | id | Title | Primary modes |
|---|-----|--------|----------------|
| 1 | W3-P1 | Creature craft: silhouette + tactile mats + clips | 1, 2, 7, D/H |
| 2 | W3-P2 | Shell wire: overworld+battle juice + loop integrity | 1, 3, 5, 6, A/B/C/E/F/H |
| 3 | W3-P3 | Track S core + content stakes + original names | 3, 6, C/E/I |
| 4 | W3-P4 | Ship-boundary fail-closed + medium preset + gates | 1, 4, 7, F/G/I/J |

---

## W3-P1 — Creature craft: silhouette, materials, attack/faint clips

**Why first (mode-7):** Certified wave3 stills lose labels-hidden A/B to TW because subjects read as plastic sphere stacks. Highest single presentation delta without fighting main ownership: rebuild silhouettes, surface families, and limb-readable clips so battle-distance stills can survive blind prefer-US.

**owned_files (exclusive):**
- `src/render/materials.ts`
- `src/creatures/speciesMeshes.ts`
- `src/creatures/clips.ts`
- `src/creatures/makeCreature.ts` (register builders / MESH_ALIAS cleanup only if present)
- Any thin `src/creatures/*` helpers those import for mesh QA
- Does **not** own `src/main.ts`, `src/battle/**`, `tools/**`, `vite.config.ts`

**Findings addressed (merged D/H):**
- `makeSurfaceMaterial` plastic MeshStandard only → procedural normal/bump or noise roughness per MaterialKind (fur / wet / scale / metal); soft TW read under graded light
- Emberpup (and starters) stacked spheres/cones → stronger primary/secondary forms (muzzle, shoulder, tail fire volume, limb mass)
- `leafkit` only aliases `leafit` → dedicated `buildLeafkit` + SPECIES_BUILDERS entry; drop fragile alias
- Gym/elite ids `ironwisp`, `gloomhorn` fall through to generic → unique builders + material kinds; meshQa coverage
- Attack/faint/idle root-only shared squash → per-kind or per-species clip targets (ears/tail/wings/child meshes) so attack arc and faint collapse read as character, not generic transform

**Acceptance:**
1. Mode-1 still at battle or overworld capture distance: starters + ironwisp + gloomhorn have **distinct** silhouettes (no two share identical mesh graph).
2. Still under soft key+fill: surfaces show roughness/normal variation (not flat plastic blobs); VISUAL-BAR fur/feather/scale checklist items can be honestly checked.
3. Idle + ≥1 attack + faint clips tick with visible secondary motion (not root-only scale/pos for all species).
4. Mesh QA gate still rejects cube/paper-thin; `npm run typecheck` green.
5. Zero official franchise mesh/name assets; original ship ids only.

**verify_cmd:** `npm run typecheck && npm run build`

**categories:** D, H

**Coordination:** P2 re-captures after mesh/mat land. P1 does not edit battle camera or main lighting.

---

## W3-P2 — Shell: overworld feel, battle staging, live loop wire

**Why (mode-7 + playtest):** main.ts is the single call site that turns engine APIs into a playable TW-grade sandwich. Without shell work, P1 silhouettes still sit on flat disc/cone grass with no shadows; battles teleports + instant Fight menu; win skips XP; faint skips force-switch; medium preset ignored → mode-4 p99 tails.

**owned_files (exclusive):**
- `src/main.ts`
- `src/world/explore.ts`
- `index.html` only if HUD/toast/swap UI markup required for force-switch / gym prompts
- Does **not** own `src/battle/**`, `src/creatures/**`, `src/render/materials.ts`, `src/core/Engine.ts`, `tools/**`, `vite.config.ts`, `content/game/**`

**Findings addressed (merged A/B/C/E/F/H call sites in shell):**
- Camera: collision-aware pull-in (ray or sphere vs landmarks) + soft lerp; not fixed height clip through roof/stone/heal pad
- Player `clampPos` only → collide vs heal pad, stone house, path edges (explore.ts)
- Ground disc + dirt strip → micro-relief / layered materials + horizon massing (still non-void)
- Tall grass cone ring → denser instanced/shared-material risk band; readable vs safe path; rustle particle or UI risk cue (not sway-only)
- Foot dust readable plant timing; share materials / throttle grass for F budget
- Shadows: `shadowMap` + key cast + ground receive
- Battle entry: wild appear → settle → partner send-out → then interactive Fight (measure menu≤400ms after staging)
- Party switch: recall sink/scale-out → delay → send-out rise + camera beat; gate menu until staging done
- Crit + SE/NVE stack flashes within 100ms of impact; lunge from attacker side identity
- Player loss: ally sink/scale like foeSink; black-out → `healParty` + warp heal pad before roam
- Win: `grantBattleRewards` + sync party + toast XP/level (import from battle/party APIs)
- Live fight: omit pinned `random` (or `liveRolls:true`) so crit/acc/damage independent; pass `choices.party`; on `needsForceSwitch` open swap / `forceSwitchPlayer`
- Gym/elite landmarks interact → trainer battles from route content; escalate wild band by wins/level if fields exist
- Graphics: `resolvePresetFromQuery` + `applyGraphicsPreset`; construct renderer antialias/DPR from medium-1080p when `?preset=medium-1080p`
- Battle camera punches: impact push-in, SE accent, faint hold, send-out low angle; return to base

**Acceptance:**
1. Explore: cannot walk through heal pad / house; camera does not sit inside solid landmarks.
2. Capture still: ground + dense grass risk band + contact shadow under creature; not toy cone forest on flat disc alone.
3. Battle: directed send-out before Fight interactive; switch shows recall→send-out; faint animates the losing side.
4. Win applies XP/level via `grantBattleRewards`; loss heals party and warps to heal pad.
5. `executeTurn` live path can miss/crit with independent rolls; mid-battle force-switch when bench conscious.
6. Gym or elite stake startable from short demo path interactable.
7. `?preset=medium-1080p` caps pixelRatio≤1 and respects medium antialias flag.
8. `npm run typecheck && npm run test:playtest && npm run build` green.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build && node tools/capture.mjs --label wave3`

**categories:** A, B, C, E, F, H

**Coordination:** Consume P1 meshes/mats and P3 APIs/content. Do not reimplement damage formula in main. Re-capture after land for mode-1/7.

---

## W3-P3 — Track S + ship content: clamp, priority, gym data, original move names

**Why (playtest integrity):** Shell can wire XP/switch only if engine contracts stay correct; content must exercise priority and gym/elite without official move IP strings. Keeps systems goldens honest while P2 owns browser glue.

**owned_files (exclusive):**
- `src/battle/battle.ts`
- `src/battle/party.ts`
- `src/battle/damage.ts`
- `src/battle/catch.ts`
- `src/battle/content.ts`
- `src/battle/types.ts` (if type edits needed)
- `content/game/wave0.json`
- `tools/battle-golden.mjs`
- `tools/playtest.mjs` (content/systems asserts only — not capture/profile)
- Does **not** own `src/main.ts`

**Findings addressed:**
- `resolveDamageRandom` returns raw without `clampDamageRandom` → always clamp / roll unit path
- All moves `priority: 0` → ≥1 priority>0 original move + golden vs higher Spe foe
- `ballMod` support documented/tested (1 / 1.5 / 2); ship can pass from shell later
- Export/stabilize `grantBattleRewards`, force-switch / `needsForceSwitch`, `createBattleFromParty`, party heal helpers for P2
- wave0 `route.gym` / `route.elite` / wild `band` fields complete and original-named; playtest content checks stay green
- Rename ship move display **"Pollen Puff"** → original title (e.g. Spore Drift / Pollen Burst); update goldens/UI keys
- Wave0Pack types in battle/content if pack types live here (not main)

**Acceptance:**
1. Unit roll or out-of-band `random` never breaks 0.85–1.0 damage contract; goldens pass.
2. Priority move acts first vs higher-Speed foe in golden.
3. Catch formula tests cover ballMod tiers; shake seed still matches outcome.
4. `grantBattleRewards` + force-switch path covered by harness; multi-member party wipe only when no conscious reserve.
5. wave0 gym/elite + band fields present with **original** names only; no official move titles in `content/game/`.
6. `npm run test:battle && npm run test:playtest` green.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build`

**categories:** C, E, I

**Coordination:** Land APIs before or with P2. Do not edit presentation shell.

---

## W3-P4 — Ship boundary + medium Engine preset + standing re-measure

**Why (G + I/J critical + F):** Production `dist` still serves `content/canonical` + dex-index with Bulbasaur etc. Standing gates stuck on wave2 labels; mode-4 p99 fail partly from DPR/AA not applied on Engine path; no fail-closed ship-boundary tool. Mode-7 cannot certify identity-safe builds.

**owned_files (exclusive):**
- `vite.config.ts`
- `package.json` (scripts + description only; no src edits)
- `tools/check-ship-boundary.mjs` (new)
- `src/core/Engine.ts` (DPR cap align medium-1080p maxPixelRatio=1)
- `src/core/graphicsPreset.ts` or existing preset module if present (export apply/resolve used by main **import only** — if file missing, create here; P2 imports)
- `tools/profile.mjs` (medium gate flags only if needed)
- `shots/playtest/standing-gates.json`
- `docs/SOL-APPROACH-REVIEW.md` or `docs/VISUAL-BAR.md` (gate note only, optional)
- Does **not** own `src/main.ts` (P2 wires preset call), `src/creatures/**`, `src/battle/**`, `content/game/**`

**Public content policy (implement):**
- Stop shipping full `content/` tree via `public/content` symlink; expose **only** `content/game` (allowlist copy or vite plugin)
- Exclude `content/canonical`, `content/derived`, `content/smoke` from dist
- Strip or relocate `public/ab` research HTML out of ship publicDir
- `check-ship-boundary.mjs`: fail on official name strings, `canonical/`, warehouse paths in dist; wire `npm run verify` / land
- standing-gates: `wave_label=wave3`; land_cmd = typecheck + test:battle + test:playtest + build + capture --label wave3 + profile --label wave3; mode_5/7 required_for_wave_exit documented with re-measure cmds
- package.json description: original product wording, no franchise IP phrasing
- Engine resize: cap `devicePixelRatio` at `MEDIUM_1080P.maxPixelRatio` (1), not `*2`

**Acceptance:**
1. Fresh `npm run build` → `dist/content` has game pack only; **no** `canonical/`, **no** dex-index official species list, **no** Bulbasaur-class strings under dist.
2. `node tools/check-ship-boundary.mjs` exits 0 on clean dist; exits non-zero if warehouse leaked; wired into verify/land.
3. `standing-gates.json` wave_label wave3; mode_4 cmd profiles wave3; mode_5/7 listed required; land_cmd not pinned to wave2.
4. Engine medium path cannot apply DPR 2 via maxPixelRatio*2.
5. package description free of official franchise titles.
6. Does not regress typecheck/build.

**verify_cmd:** `npm run typecheck && npm run build && node tools/check-ship-boundary.mjs && node tools/profile.mjs --label wave3`

**categories:** F, G, I, J

**Coordination:** After P2 applies preset in main, re-run profile until p99≤16.7. Mode-7 ballot only after P1+P2 stills + P4 boundary green.

---

## Deferred (wave 4+ / not in these 4)

- Overnight automated mode-7 ballot harness + fixed TW still plate set
- GLB / HY3D production meshes (code silhouettes until then)
- Bag economy + shop NPC polish beyond heal pad
- Full 6-slot party chrome polish
- Audio / music Track P
- Multi-zone open world beyond wave0 vertical slice
- Frame-budgeted VFX particle pools beyond P2 grass/dust
- Battle still auto-emit in capture.mjs (nice-to-have; P2 can manual scene for mode-1)
- Full 180s profile CI budget expansion

## Parallelism

```
P1 ──────── creature mats/meshes/clips
P3 ──────── battle core + wave0 content
P4 ──────── vite boundary + Engine preset + standing-gates
P2 ──────── main/explore shell (consumes P1 + P3 APIs + P4 preset export)
     └── land order: P1 ∥ P3 ∥ P4 → P2 → re-capture + profile wave3
     └── mode-7 only after P1+P2 stills + P4 identity green
```

## Land checklist (every package)

```bash
npm run typecheck && npm run test:battle && npm run test:playtest && npm run build
```

Black/empty capture = blocker. Ship names only (`content/game/`). Mode-3 green alone ≠ done. Mode 7 prefer-US required for wave exit. p99≤16.7 at medium-1080p required for mode-4 standing gate.
