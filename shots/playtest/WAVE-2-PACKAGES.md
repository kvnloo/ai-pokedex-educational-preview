# Wave 2 packages (synthesize)

**Constraint:** max 4 packages · disjoint `owned_files` · size to finish  
**Rank key:** mode-7 blind A/B delta first, then mode-3/5 playtest integrity  
**Context:** `playtest_pass=false` is **not** the blocker narrative — mode 3 green alone still ≠ exit. Wave2 capture is near-void (`black_frame=true`, luma≈27); starter overlay never gets `.show`; runtime meshes are local sphere blobs; crit/catch/switch/XP integrity gaps remain. Mode 7 must prefer US over Twilight Wings or loop.

## Priority order

| # | id | Title | Primary modes |
|---|-----|--------|----------------|
| 1 | W2-P1 | Graded sky + boot explore + creature wire + juice marks | 1, 2, 5, 7, A/B/D/H/I/J |
| 2 | W2-P2 | Systems: crit/acc/catch/party faint/XP/content gate | 3, 5, 6, C/E |
| 3 | W2-P3 | Capture + standing gates fail-closed on near-void | 1, 7, G |
| 4 | W2-P4 | Frame-time instrument + medium preset + profile gate | 4, F |

---

## W2-P1 — Graded sky, starter boot, ship creatures, battle AV wire

**Why first (mode-7):** Certified still is navy void + cone field with no subject. Blind panel cannot prefer US. Highest single A/B delta: graded twilight sky, lit terrain/grass, show starter → explore with `makeCreatureMesh` silhouettes, soft GI/tone map, and battle AV that actually fires (crit boolean, first-attack-frame on rAF, clips tick).

**owned_files (exclusive):**
- `src/main.ts`
- `index.html` (starter overlay CSS/show path, enable swap/status buttons, battle HUD only)
- `src/world/explore.ts` (if camera/explore soft-follow touch needed for framed still)
- Does **not** own `src/battle/**`, `tools/capture.mjs`, `src/creatures/**` (import only), `src/core/Engine.ts`

**Findings addressed (merged A/B/D/H/I/J call sites):**
- Starter overlay never `.show` → capture stuck `boot-or-starter`, no player mesh (H critical)
- `scene.background`/`Fog` 0x0a1528 void; underexposed ground/grass; no ACES/exposure/hemi
- Local `makeCreatureMesh` sphere blob — replace with `src/creatures` factory + assertQa path
- SPECIES_COLOR `leafit` vs ship `leafkit`
- Crit AV: treat `hit.critical === true` (not numeric >1)
- First-attack-frame mark after rAF when lunge paints (not sync with move-confirm)
- Remove entry `flashHit('hit')` pollution; optional short send-out staging
- Catch: pass `speciesCatchRate` for foe (not only default 190) at attemptCatch call site
- Wire `playAttack`/`playFaint`/`tickCreatureClip`; enable status + swap UI when party>1 → call `switchPlayerTo`
- Ball throw arc / shake marks (thin presentation; outcome still from attemptCatch seed)
- Victory reward message / XP grant **call** using APIs from P2 if present; toast progression beat
- Bright grass albedo variety; path/heal-pad landmarks on disc for town+route read

**Acceptance:**
1. Cold boot adds `#starter-overlay.show` once cards exist; capture dismisses starter and lands explore with player mesh in frame.
2. Mode-1 still: `black_frame=false`, mean luma clearly mid-scene (≫40 target), graded sky not pure navy void; readable ground + grass + creature silhouette.
3. Runtime battle/explore meshes from `makeCreatureMesh(speciesId, …)` only (no local 3-sphere factory); mesh QA path exercised.
4. Crit damage events fire distinct crit AV; first-attack-frame measure is post-paint (can fail ≤180ms budget honestly).
5. Status moves selectable; Creature/swap enabled when `party.length > 1` and wires switch API.
6. `leafkit` (and all wave0 starter ids) color/map correctly.
7. Ship names only in UI strings.

**verify_cmd:** `npm run typecheck && npm run test:playtest && npm run build && node tools/capture.mjs --label wave2`

**categories:** A, B, D, H, I, J

**Coordination:** P2 lands battle event shapes / force-switch / XP helpers first or same window; P1 consumes. P3 re-captures after P1. Re-run capture before any mode-7 claim.

---

## W2-P2 — Track S integrity: rolls, faint/switch, catch species, XP, route stakes

**Why:** Mode-3/5 integrity + skill expression. Crits dead in live (`critRoll` default 1); accuracy skipped without rolls; player faint always ends battle; catch ignores species rates; no XP; status/switch only useful if sim supports; content lacks gym/elite gate + encounter escalation.

**owned_files (exclusive):**
- `src/battle/battle.ts`
- `src/battle/party.ts`
- `src/battle/damage.ts`
- `src/battle/catch.ts`
- `src/battle/content.ts`
- `src/battle/types.ts`
- `content/game/wave0.json`
- `tools/battle-golden.mjs`
- `tools/playtest.mjs` (extend asserts only: XP, switch/faint, status, species catch, gym node presence)

**Findings addressed:**
- Live `executeTurn` omits `critRoll` / uses wrong damage random band — fix **defaults inside executeTurn** when UI omits rolls (independent per actor)
- Accuracy check when `move.accuracy != null` without requiring pre-supplied rolls
- On player faint: if conscious reserve, emit switch prompt / do not set `winner=foe` until party wipe
- `speciesCatchRate` exported/used consistently; goldens for dustbun=255 / sparkmoth=120 band
- XP/level (or money) on player win; party sync
- Status stage moves apply in sim; foe AI can prefer effective/status when advantageous
- wave0: trainer/gym or elite gate node (original names) + weighted/escalating wild table
- Playtest asserts multi-win progression / switch-when-party≥2 / status usable / gym node

**Acceptance:**
1. Without UI-supplied rolls: crit can land (~classic rate); damage band 0.85–1.0 via `rollDamageRandom`; accuracy can miss; per-side independent rolls.
2. Player faint with conscious reserve → force-switch path; black-out only when `anyConscious(party)` false.
3. Catch a-value uses foe species catch rate; goldens cover species rates.
4. Win grants XP/level (measurable in playtest); party HP/XP sync across battles.
5. wave0 has original-named gym/elite gate + non-flat encounter stakes.
6. `npm run test:battle && npm run test:playtest` green; no official Pokémon names in `content/game/`.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build`

**categories:** C, E

**Coordination:** Export stable APIs (`speciesCatchRate`, switch prompt events, `grantBattleRewards`) for P1 UI wire. Do not edit `src/main.ts`.

---

## W2-P3 — Capture / standing gates: near-void fails closed

**Why (G + mode-1 certification):** Capture hard black gate is mean&lt;4 while measure sets `black_frame` at mean≈27; standing gates still wave1-labeled and pass void stills. Without fail-closed G, land claims lie.

**owned_files (exclusive):**
- `tools/capture.mjs`
- `tools/contactsheet.mjs` (if sheet thresholds touch)
- `shots/playtest/standing-gates.json`
- `docs/VISUAL-BAR.md` (sky/grade checklist re-measure note only)
- `shots/wave2/capture.json` / re-measure artifacts after P1 (write path)
- Does **not** own `src/main.ts` lighting (P1)

**Findings addressed:**
- Black/near-void threshold raise (mean floor ~35–40 + unique + near-black fraction)
- Starter dismiss: require `.starter-card`, force-show path if needed for capture=1, assert explore+mesh before shot
- standing-gates: shot-non-black matches measure `black_frame`; label wave2+; mode_4/mode_5/mode_7 entries stubs or real cmds
- `black_frame=true` → hard fail / hard_failed; refuse land while void
- VISUAL-BAR sky/grade checkbox re-certified on wave label

**Acceptance:**
1. Capture with near-void scene (mean≈27 / unique≈11) **exits non-zero** or writes hard_failed; cannot claim pass_hard_gates.
2. Honest post-P1 capture: `source` browser-threejs, `black_frame=false`, scene explore-or-battle with content.
3. `standing-gates.json` re-measure cmds use current wave label (wave2+); include non-black + playtest; document mode_5/7 as required for wave exit.
4. No Wooloo/TW plate pollution; ship names only.

**verify_cmd:** `node tools/capture.mjs --label wave2 && node -e "const c=require('./shots/wave2/capture.json'); if(c.black_frame) process.exit(1)"`

**categories:** G, H (capture path only)

**Coordination:** Run after P1 lighting/boot land. Empty/black capture = blocker (do not soft-pass).

---

## W2-P4 — Category F: live frame ring + medium preset + profile script

**Why:** Mode 4 unmeasured; Engine.frameTimes dead; no 3-minute profile. Wave exit eventually needs F; size-bounded instrument now so standing list can re-measure.

**owned_files (exclusive):**
- `src/core/Engine.ts` (export/reuse ring buffer helpers if kept)
- `tools/profile.mjs` (new)
- `package.json` (script `test:profile` / `profile` only)
- `shots/playtest/standing-gates.json` **only if P3 already landed structure** — prefer P4 append via owned profile artifact path under `shots/wave2/profile.json`; if standing-gates edit conflicts, P3 owns JSON and P4 only documents profile cmd in package acceptance (P3 adds mode_4 entry calling profile).
- Thin read-only notes in docs — avoid `src/main.ts` ownership: export a tiny `src/core/frameStats.ts` **or** patch Engine only and have profile drive via Playwright like playtest.

**Preferred owned set (disjoint):**
- `src/core/frameStats.ts` (new: ring buffer + p99)
- `src/core/Engine.ts` (wire frameStats if Engine used; else leave)
- `tools/profile.mjs`
- `package.json` (scripts)
- `shots/wave2/profile.json` (artifact)

**Findings addressed:**
- No per-frame ms / p99 on ship path — profile harness drives explore+battle ≥3 min (or shortened CI window with same counters) at 1080p medium
- medium preset: DPR cap 1–1.5, optional AA off (profile page query or harness flags)
- standing mode_4 entry (via P3 gates file coordination)
- Export p99 and count frames >50 ms after warm-up

**Acceptance:**
1. `npm run profile` (or `node tools/profile.mjs`) writes JSON with p99_ms, max_ms, frames_over_50ms, warm-up excluded.
2. Gate documented: p99 ≤16.7 ms; zero >50 ms after warm-up (fail or advisory flag explicit in JSON).
3. Medium 1080p preset defined and used by profile only.
4. Does not regress typecheck/build.

**verify_cmd:** `npm run typecheck && npm run build && node tools/profile.mjs --seconds 30` (full 180s on land CI when budget allows)

**categories:** F

**Coordination:** If profile needs a main.ts mark hook, expose `window.__frameStats` from a **one-line** import of `frameStats` — if that requires main edit, land a micro follow in P1 only after P4 API exists (P1 already owns main).

---

## Deferred (wave 3+)

- Full overnight mode-7 ballot automation + labeled TW still set
- GLB / HY3D production meshes (code silhouettes stay until then)
- Bag economy + shop NPCs polish
- Full 6-slot party UI chrome
- Dust particles / grass shader rustle
- Frame-budgeted VFX pool replacing remaining timers
- Canonical warehouse dist exclusion hardening beyond vite
- Multi-zone open world beyond wave0 vertical slice
- Audio / music Track P

## Parallelism

```
P2 ──────────── battle/content systems (APIs)
P4 ──────────── frameStats + profile (no main)
P1 ──────────── main/html presentation (consumes P2 + creatures)
P3 ──────────── capture/gates after P1 (fail-closed)
     └── land order: P2 ∥ P4 → P1 → P3 re-capture
     └── mode-7 only after P1+P3 green stills
```

## Land checklist (every package)

```bash
npm run typecheck && npm run test:battle && npm run test:playtest && npm run build
```

Black/empty capture = blocker. Ship names only (`content/game/`). Mode-3 green alone ≠ done. Mode 7 prefer-US required for wave exit.
