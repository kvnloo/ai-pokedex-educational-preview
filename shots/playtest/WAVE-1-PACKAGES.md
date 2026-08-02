# Wave 1 packages (synthesize)

**Constraint:** max 4 packages · disjoint `owned_files` · size to finish  
**Rank key:** mode-7 blind A/B delta first, then mode-3/5 playtest integrity  
**Context:** `playtest_pass=true` (mode 3 green is **not** wave exit). Capture is `minimal-capture` + Wooloo plate — mode 1/7 evidence invalid until P1 lands.

## Priority order

| # | id | Title | Primary modes |
|---|-----|--------|----------------|
| 1 | W1-P1 | Honest browser capture + ship-boundary purge | 1, 7, H/I/J/G |
| 2 | W1-P2 | Creature silhouette + materials + clips module | 1, 2, 7, D |
| 3 | W1-P3 | Battle juice sandwich + instrumented marks | 2, 5, 7, B |
| 4 | W1-P4 | Systems slice: party HP, crit, grass starter, status | 3, 6, C/E |

---

## W1-P1 — Honest browser capture + ship-boundary purge

**Why first:** Every mode-1/7 claim is inadmissible while `source=minimal-capture` and Wooloo/TW plates land in `shots/`. Without real frames, presentation packages cannot be certified.

**owned_files (exclusive):**
- `tools/capture.mjs`
- `tools/contactsheet.mjs` (if touched for non-ref sheets)
- `vite.config.ts` (exclude research from ship)
- `public/ab/**` (remove or gate out of ship publicDir)
- `ab.html`
- `src/ab/viewer.ts`
- `shots/wave1/capture.json`
- `shots/wave1/shot-000.png`
- `shots/_sheets/preview.png`
- `shots/playtest/standing-gates.json` (new)
- `docs/VISUAL-BAR.md` (new, minimal checklist)
- `docs/ARCHITECTURE.md` (verify block only)

**Findings addressed:** capture placeholder; Wooloo path pollution; public ab/Wooloo brand surface; dist/canonical ship risk via public content link; standing gates missing; report honesty.

**Acceptance:**
1. `node tools/capture.mjs --label wave1` produces `capture.json` with `source` containing `browser-threejs` (or equivalent) **and not** `minimal-capture`.
2. Shot is non-black WebGL of ship scene (starter/explore/battle); fail closed if browser capture unavailable (no `/mnt/zer0models` or `public/ab` copy).
3. No Wooloo / TW plate under `shots/wave1/` or `shots/_sheets/`.
4. Ship build does not serve research Wooloo GLB/HTML as product surface (ab gated or removed from default public).
5. `shots/playtest/standing-gates.json` lists re-measureable mode-1 + mode-3 gates; wave land refuses `minimal-capture`.

**verify_cmd:** `npm run build && node tools/capture.mjs --label wave1 && node -e "const c=require('./shots/wave1/capture.json'); if(String(c.source).includes('minimal')) process.exit(1)"`

**categories:** G, H, I, J

---

## W1-P2 — Creature silhouette + materials + presentation module

**Why:** Mode-7 loses instantly on sphere+ears vs TW. Mesh QA before browser. Distinct species read under soft GI.

**owned_files (exclusive):**
- `src/creatures/**` (new: mesh factory, materials, idle phase seed, mesh QA helpers)
- `src/render/**` (optional lighting helpers if extracted)
- Does **not** own `src/main.ts` battle flow — only export APIs main will import in a thin wire (if main wire conflicts, P3 owns the call site after P2 lands API).

**Coordination:** P2 lands `makeCreatureMesh(speciesId, opts)` + `meshQaReject(mesh)` + materials. P3 imports and deletes inline sphere mesh from main in the same land window if needed; **file ownership of `src/main.ts` stays P3**. P2 may open a one-line re-export stub only inside `src/creatures/`.

**Findings addressed:** identical sphere mesh; flat materials; empty `src/creatures/`; no idle/attack/faint clips; no idle phase desync; silhouette/material bar.

**Acceptance:**
1. ≥3 ship species (Emberpup, Dewkin, + grass starter id from content once P4 adds it, or placeholder third in creatures registry) have distinct proportions/appendages readable at battle distance.
2. Materials show fur/feather/scale/metal **read** (roughness/emissive/layer proxies OK) under soft key+fill.
3. Idle phase seeded per instance; attack lunge + faint clip functions exportable for battle.
4. Mesh QA rejects cube volume/bbox > 0.75 and paper-thin min/max < 0.12 (unit test or node script).
5. No official Pokémon names in ship-facing creature ids.

**verify_cmd:** `npm run typecheck && node --experimental-strip-types -e "import './src/creatures/index.ts'"` (or dedicated mesh QA script) `&& npm run build`

**categories:** D, H, J

---

## W1-P3 — Battle juice sandwich + overworld soft follow

**Why:** Mode-5 hard gates (≤400 ms menu, ≤180 ms first attack frame) unmeasurable; HP drain fixed; SE/crit late/missing; camera pops; mode-2 has no lunge. Highest *play feel* delta after real stills exist.

**owned_files (exclusive):**
- `src/main.ts`
- `src/world/explore.ts`
- `index.html` (HP bar transition / battle HUD CSS only)

**Findings addressed:** camera hard snap; walk accel; foot bob/dust; grass rustle telegraph; lunge before hit flash; HP duration scales with dmg; SE/NVE/crit AV ≤100 ms; faint/send-out staging; performance.mark thresholds; soft camera lerp; enterBattle party battler wire **call site** (logic helpers may live in battle/party — P4 owns those APIs).

**Acceptance:**
1. `performance.mark`/`measure` for free-roam→interactive Fight ≤400 ms and move-confirm→first attack frame ≤180 ms (logged; playtest or mode-5 logger asserts when available).
2. On move confirm: attacker lunge starts immediately; hit flash at impact; HP tween after impact; drain duration = clamp(f(dmg/maxHp), ~180–900 ms).
3. SE / NVE / crit each distinct AV within 100 ms of impact (crit requires P4 critical flag in events).
4. Camera soft-follows (lerp position + lagged yaw); no hard snap on turn.
5. Explore: accel/friction velocity; run ramp on Shift; yaw blend toward move heading.
6. Faint: sink/hold message beats before exitBattle (not bare 1100 ms toast-only).

**verify_cmd:** `npm run typecheck && npm run test:playtest && npm run build`

**categories:** A, B, F (marks only; full p99 profiler deferred)

**Note:** Do not expand nested `setTimeout` storms; prefer rAF-timed VFX where cheap.

---

## W1-P4 — Systems integrity for vertical slice skill + integrity

**Why:** Mode-3 stays green while multi-battle integrity is broken (always full-HP rebuild). No grass starter kills type triangle (E + mode-7 emotional framing). Crit hardcoded blocks B AV. Status stubs collapse skill expression.

**owned_files (exclusive):**
- `src/battle/battle.ts`
- `src/battle/party.ts`
- `src/battle/damage.ts`
- `src/battle/catch.ts`
- `src/battle/content.ts`
- `src/battle/types.ts`
- `content/game/wave0.json`
- `tools/battle-golden.mjs`
- `tools/playtest.mjs` (extend gates only)

**Findings addressed:** party lead HP into battle + sync on exit; switch API + TurnChoices; crit roll + damage event flag; accuracy/PP basics; status stage (growl-down); speed-tie RNG; damage random 0.85–1.0; grass starter + starterChoices[3]; species catchRate; XP/level stub if timeboxed; black-out heal path API.

**Acceptance:**
1. `createBattle` accepts active battler from party; exit syncs HP/faint; playtest multi-fight without full heal between shows reduced HP.
2. Crit not always 1; golden covers crit and non-crit; events carry `critical` for UI.
3. Random band 0.85–1.0 documented + golden-aligned.
4. Wave0 has fire/water/**grass** starters; playtest starter triangle present.
5. ≥1 status/stat stage move applies (e.g. Atk −1); status moves not pure no-ops in sim.
6. Switch-to party index API exists (UI wire may be thin in main via P3 follow-up same wave).
7. `npm run test:battle && npm run test:playtest` green; no official names in `content/game/`.

**verify_cmd:** `npm run typecheck && npm run test:battle && npm run test:playtest && npm run build`

**categories:** C, E

---

## Deferred (wave 2+)

- Full Engine integration + p99 profile tool (`tools/profile.mjs`, 3 min session, F gates)
- Gym/elite trainer gate content beyond one tougher wild tier
- Full party-of-6 UI polish + bag economy
- GLB pipeline / HY3D production meshes
- Canonical warehouse exclusion from dist (after publicDir fix; complete content ship boundary)
- Mode-7 labeled ballot automation + overnight Grok votes
- Dust particles / full grass shader rustle polish
- Frame-budgeted VFX pool replacing all timers

## Parallelism

```
P1 ──────────── capture honesty (blocks certification)
P2 ──────────── creatures (blocks mode-7 win)
P3 ──────────── main/explore/html juice (blocks mode 5)
P4 ──────────── battle/content systems (blocks integrity)
     └── land order preferred: P4 ∥ P2 → P3 (consumes APIs) → P1 (screenshots post-juice)
     └── or P1 early with pre-juice stills then re-capture after P2/P3
```

**Re-capture rule:** After P2+P3 land, re-run P1 capture so mode-1/7 stills show real creatures + battle HUD.

## Land checklist (every package)

```bash
npm run typecheck && npm run test:battle && npm run test:playtest && npm run build
```

Black/empty capture = blocker. Ship names only (`content/game/`). Mode-3 green alone ≠ done.
