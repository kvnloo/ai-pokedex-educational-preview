# Sol approach review — Twilight Route

**Verdict: fix-first.** Keep the direction, but do not start a full game/content wave yet. The newly documented research/game identity split is the correct decision; it now needs build-time enforcement. The stack becomes coherent once the project (1) prevents official-reference data from entering shippable original game content, (2) defines a deterministic simulation boundary, (3) turns raw mesh generation into a validated asset pipeline, and (4) replaces “exact Twilight Wings plot” with an original story that preserves its emotional and cinematic grammar.

This is an approach review, not an implementation sign-off. The inspected repository was a live scaffold: it advanced from a 20-species smoke output to a committed 1,025-species research warehouse, safer smoke-output isolation, a Three.js bootstrap, and a documented identity split while this review was in progress. Several architecture-described schemas, validators, workflows, and game systems remained absent. The recommendations therefore target the intended architecture and the latest observed boundary, not the completeness of any earlier snapshot.

## Findings ranked by severity

### Critical

1. **The product identity boundary is documented but not enforced.** `prompt.md` now correctly distinguishes the PokéAPI research warehouse from original player-facing content, but `public/content` currently points at the whole `content` tree and the bootstrap loads `/content/derived/dex-index.json`. That distribution shape can expose the official-name warehouse even if the UI only displays a count today. “Full dex text is fine” works for private research; the public build must derive from an explicit game-only allowlist and fail closed on mixed provenance. The current `public/ab/wooloo_ref.png` is an official Twilight Wings crop, and `public/ab/wooloo_shape.glb` is its generated likeness; Vite’s `publicDir` exposes `public/`, and the A/B entry makes these study artifacts build-visible violations. They must be moved outside the product tree and build; labeling them non-shipping is insufficient.
2. **An exact Twilight Wings plot adaptation breaks the same boundary.** John, the flying taxi, named leaders, locations, and shot-for-shot story beats are useful study material, not a safe product identity. The slice should retain the emotional structure—an isolated child, a meaningful invitation, aerial travel, admired champions, and a stadium payoff—using original characters, creatures, places, dialogue, and staging.
3. **Raw mesh generation is being treated too close to runtime output.** A shape-only Hunyuan GLB or an img2threejs procedural result is a source asset. It is not game-ready until it passes topology, scale, material, rig, animation, compression, provenance, and browser-performance gates. Generating 1,025 meshes before proving this path would multiply cleanup debt.

### High

4. **“Three.js COD-style engine” is a presentation choice, not yet an engine architecture.** Three.js + TypeScript is appropriate, but battle rules must be a pure deterministic package with no DOM/Three imports. Overworld, battle presentation, UI, and telemetry should consume simulation commands/events. Otherwise timing polish and rules correctness will become inseparable.
5. **The data design is directionally right but incomplete for battle.** JSONL canonical records plus derived browser shards is the best default. Missing contracts include moves, move effects, versioned learnsets, abilities, forms/varieties, evolutions, items/balls, growth curves, natures, status, stat stages, priorities, targeting, encounter tables, and an explicit battle ruleset/version. Species identity and battle-ready form identity also need separate keys.
6. **The architecture described in documentation is ahead of the repository gates.** The 1,025-species warehouse and isolated smoke output now exist, but the committed baseline tracks exactly three schemas (`dex-index`, `species`, and `type`); concurrent uncommitted additions do not yet establish accepted validation or derivation gates. `tools/validate-content.mjs`, `tools/build-derived.mjs`, and the documented `.grok/workflows/ultracode-wave.rhai` remain absent. The current sync tool still couples network acquisition and derivation, which prevents clean offline reproducibility tests.
7. **The quality loop can certify screenshots while missing play quality.** `prompt.md` correctly defines seven verification modes, but the workflow must make modes 3 and 5 mandatory for every gameplay package, mode 4 mandatory before a performance claim, and modes 1, 2, and 7 mandatory for presentation certification. A still-only result is evidence for composition only.

### Medium

8. **The proposed Grok wave is too expensive as a default.** Up to 24 rounds with category-wide fan-out and blind panels can burn large budgets without improving a poorly specified slice. Start with one measured baseline, at most four disjoint packages, a two-round cap, and an explicit human/Sol escalation when the same gate fails twice. Minimal-effort children are suitable for narrow measurements and mechanical fixes, not architecture or ambiguous art direction.
9. **Content provenance is not reproducible enough yet.** A per-run `syncedAt` changes every row, PokéAPI endpoint state is not a pinned release, and numeric PokéAPI type IDs should not be assumed to equal an internal contiguous enum. Pin a raw snapshot/hash, keep acquisition metadata in the manifest, and map external IDs to stable internal IDs during derivation.
10. **The Hunyuan wrapper needs hardening before batch use.** It interpolates paths and configuration into a Python heredoc, has no response-size/content validation, and does not emit a provenance sidecar. Pass values through arguments or environment, validate GLB structure, and record generator version, seed, source rights, settings, and output hash.

## A. Overall stack coherence

The components are individually reasonable, but they need explicit seams:

```text
reference warehouse (PokéAPI/TW study; non-shipping)
                 │ curated, licensed/original projection
                 ▼
game content ──> deterministic simulation ──> event log
                                             ├─ Three.js presentation
                                             ├─ UI/audio/camera direction
                                             └─ trace + replay verification

original concept art ─> generation ─> cleanup/rig/LOD/compress ─> asset manifest
```

- **Three.js/Vite/TypeScript:** good for a browser vertical slice. Keep rendering replaceable and avoid inventing a broad “engine” before one route and one battle are fun.
- **PokéAPI:** good as a versioned research/acquisition source for mechanics facts. It should not be fetched by the player or treated as an immutable rules specification.
- **Hunyuan3D + img2threejs:** complementary. Use Hunyuan for selected organic hero forms after original concept approval; use procedural factories for placeholders, environmental variation, and designs whose topology/materials benefit from parameters. Choose per asset after the same runtime gates, not by generator prestige.
- **Grok ultracode waves:** useful after interfaces and numeric gates exist. They are an execution/measurement mechanism, not a product architecture or final authority.
- **Twilight Wings:** use as a lighting, staging, motion, and emotional reference corpus. Do not make its characters, creatures, plot text, or frames the shippable content layer.

Recommended module boundary:

- `src/sim/**`: pure, seeded, deterministic commands, reducers, rules, and events.
- `src/content/**`: validated runtime types and loaders; no acquisition logic.
- `src/overworld/**`: navigation, encounters, and interaction state.
- `src/presentation/**`: Three.js scenes, cameras, VFX, animation, and asset adapters.
- `src/ui/**`: accessible menus driven by state/events.
- `src/telemetry/**`: verification timestamps, replay capture, and performance marks.

## B. Data architecture

Retain **canonical JSONL + derived JSON shards**.

| Option | Decision | Reason |
|---|---|---|
| JSONL warehouse + JSON shards | Use | Reviewable source records, deterministic derivation, simple CDN/runtime loading. |
| SQLite in browser | Do not use for the player | WASM/startup and binary-review cost add little for 1,025 index rows. It remains reasonable for private analysis/editor tooling. |
| One JSON file | Use only for the tiny demo pack | Simple initially, but full forms/learnsets/moves become an unnecessary boot payload and merge hotspot. |
| Protobuf | Defer | It adds codegen/debugging complexity. Adopt only if measured parse or transfer cost remains material after Brotli and sensible shards. |

Required adjustments:

1. Split `content/reference/**` (official/reference warehouse, excluded from a public build by default) from `content/game/**` (original, ship-eligible records). Derived output must name its distribution profile and refuse mixed provenance.
2. Separate `Species` (dex identity), `Form` (types/stats/abilities), and `BattleLoadout` (level, moves, IV/EV-like values, status). A national ID alone cannot identify a battle participant.
3. Add normalized move, ability, form, evolution, item, growth, learnset, encounter, and versioned ruleset schemas. Learnset rows need source game/version group and acquisition method; moves need effect semantics or explicit engine handler IDs, not prose alone.
4. Make sync, validate, and derive distinct commands. Given a pinned raw cache and config, derivation must be byte-deterministic; timestamps belong in manifests rather than every gameplay row.
5. Validate referential integrity, uniqueness, evolution acyclicity, type-chart completeness, supported effect handlers, shard coverage, and presentation-pointer resolution. JSON Schema alone cannot enforce these joins.
6. Build a small battle projection containing only the fields the simulator needs. Do not give the battle engine encyclopedia records or full learnsets.

## C. Mesh pipeline

Use a staged pipeline, with generated files quarantined until accepted:

```text
original concept + rights record
  -> raw generation
  -> silhouette/scale approval
  -> retopology + UV/material cleanup
  -> rig + semantic anchors + clips
  -> LODs + KTX2/mesh compression
  -> automated GLB validation
  -> browser motion/performance capture
  -> ship manifest
```

Initial per-creature budget for the slice:

- LOD0: 12k–20k triangles for a battle hero; LOD1 about 50%; LOD2 10%–20%.
- At most 2–3 material slots; 2K texture ceiling for a hero and 1K for common/mobile use; prefer KTX2.
- One canonical unit/scale and forward axis; grounded bounds and collision proxy.
- Required semantic nodes/anchors: root, body/hips, head, mouth or attack origin, hit target, ground contact, and camera focus. Species-specific limbs may extend this contract.
- Required clips: idle, locomotion if used in the overworld, attack, hit reaction, faint, and send-out/recall compatibility. Validate clip presence and duration ranges automatically.
- Record source concept, creator/tool versions, prompt/settings, seed, hashes, cleanup author, license, and `shipAllowed` in a sidecar/manifest.

Hunyuan's 12 GB shape-only mode is appropriate for A/B silhouette exploration, not final texture or topology. img2threejs is preferable where deterministic parametric geometry, expressive deformation, or code-owned materials matter. Wooloo A/B remains study-only reference work and must remain outside the product tree and build; it cannot be made safe by labeling the current files non-shipping. Replace it with an original creature design and rights-cleared source input before any product use.

## D. Story direction

Choose neither an exact Twilight Wings adaptation nor a generic Pallet Town clone.

Build a short original “invitation flight” slice:

1. The player meets an isolated young fan in a hill clinic or observatory.
2. A letter/invitation creates a concrete desire to reach an exhibition.
3. Starter choice and a nearby route encounter establish the player/creature bond.
4. An original aerial courier and creature carry the pair toward the arena.
5. Distant encounters with original arena leaders show the region at work without turning the slice into a cameo checklist.
6. A battle/catch obstacle makes the trip playable rather than a cut-scene replica.
7. Arrival at the lit arena pays off the sky/stadium motif and ends the demo.

This preserves the John/flying-taxi/gym-leader emotional geometry while avoiding official characters, dialogue, creature likenesses, and traced compositions. The Pallet clone is a useful baseline for immediate readability and time-to-interaction; it is not the art or narrative template. Twilight Route should win through directed camera language, soft light, creature acting, and a complete playable emotional beat.

## E. Risk controls

| Risk | Control |
|---|---|
| Official IP or generated derivative assets enter a build | Separate reference/game roots; rights manifest; deny-by-default ship allowlist; scan build output for official names, corpus paths, and unapproved hashes. |
| Scope expands to a full-dex 3D game | Freeze content expansion until one original starter trio, one wild creature, one route, one battle, one catch, one heal, and one story payoff pass all required gates. |
| Stills substitute for gameplay | Store per-package evidence requirements; gameplay changes cannot pass without played-session traces, and performance claims cannot pass without a sustained profile. |
| Agent/token burn | Two-round default, four-package maximum, fixed fixtures, small evidence packets, and escalation instead of repeated unconstrained prompting. |
| Browser performance collapses under art ambition | Asset budgets at import time, warmup before profiling, event/VFX pooling, adaptive DPR, compressed assets, and p99 trace gates on a named reference machine. |
| Data drift or invented mechanics | Pinned source snapshots, versioned ruleset, golden fixtures, deterministic seeded replays, and explicit unsupported-effect failures. |
| Concurrent waves overwrite work | Disjoint owned paths, captured base revision, no shared-file parallelism, and parent inspection of the accumulated diff before landing. |

## F. Next five work packages

These are sequential commitment packages. Each should land independently; package 5 should not begin until packages 1–4 expose their tested interfaces.

### 1. Product boundary and vertical-slice contract

**Suggested lane:** Sol owns the decisions; Luna may implement the exact scanner/test after the document is settled.

**Owned paths:** `docs/PRODUCT-BOUNDARY.md`, `docs/VERTICAL-SLICE.md`, `content/manifests/SHIP_POLICY.json`, `tools/check-ship-boundary.mjs`, `tests/ship-boundary/**`. For live build-boundary cleanup/reconfiguration only, this package also owns `public/ab/**`, `ab.html`, `src/ab/**`, `public/content`, `src/main.ts`, and `vite.config.ts`; it must not absorb unrelated feature work in those paths.

**Acceptance:** The docs name the original cast, locations, seven playable story beats, demo content cap, and reference-versus-game policy. A fixture test proves the ship check rejects an official name, a `/mnt/zer0models` reference, a copied frame/hash, and an asset without `shipAllowed: true`; the live Vite build audit proves `public/ab/wooloo_ref.png` and every Wooloo-derived GLB/binary are removed or relocated outside the product tree and build (never merely build-excluded), while non-binary A/B code/config surfaces in `public/ab/**`, `ab.html`, `src/ab/**`, `public/content`, `src/main.ts`, and `vite.config.ts` are removed, reconfigured, or explicitly excluded; the production build manifest passes.

### 2. Reproducible content contracts

**Suggested lane:** Terra settles entity/ruleset boundaries; Luna can fill mechanical schemas and fixtures from that spec.

**Owned paths:** `content/schema/**`, `content/reference/**`, `content/game/**`, `content/manifests/**`, `tools/pokeapi-sync.mjs`, `tools/validate-content.mjs`, `tools/build-derived.mjs`, `tests/content/**`, content-related `package.json` scripts. Migration/classification-only scope also covers current `content/canonical/**`, `content/derived/**`, and `content/smoke/**` so they are preserved, classified, or migrated into research/game/distribution roots; this package must not absorb unrelated feature work there.

**Acceptance:** A 20-record offline fixture and the intended full reference catalog pass schemas and referential checks; a missing move/form/type fails with a precise path; current `content/canonical/**`, `content/derived/**`, and `content/smoke/**` have an explicit research/game/distribution classification or migration record, and a runtime-shard check prevents research content from entering game shards; two derives from the same raw snapshot have identical hashes; runtime shards contain only the selected distribution profile; validation and derivation make no network requests.

### 3. Deterministic battle kernel

**Suggested lane:** Terra.

**Owned paths:** `src/sim/**`, `tests/sim/**`, `content/game/demo/battle/**`.

**Acceptance:** Golden tests cover damage, STAB, dual-type effectiveness, immunity, crit, priority/speed ties, switching, status, XP/level, catch shakes, flee, party-six, and blackout. One thousand seeded replays produce identical event logs across two runs. The package imports no DOM or Three.js modules and fails explicitly on unsupported move effects.

### 4. Game-ready mesh conditioning and manifest

**Suggested lane:** Terra for the pipeline and anchor contract; Luna for bounded validators once the contract is fixed.

**Owned paths:** `tools/hy3d_generate.sh`, `tools/mesh/**`, `content/presentation/**`, `public/assets/creatures/original/**`, `tests/mesh/**`.

**Acceptance:** One original starter and one original wild creature pass automated scale, triangle, material, texture, LOD, anchor, clip, license, and hash checks. A headless browser capture exercises idle/attack/hit/faint without missing resources, and a fixture with an excessive triangle count or missing rights record fails. No official reference frame or generated official likeness is present in build output.

### 5. Instrumented invitation-flight vertical slice

**Suggested lane:** Terra owns integration; Luna handles spec-determined UI/telemetry wiring in disjoint paths; Grok runs bounded measurement/fix waves only after the baseline is playable.

**Owned paths:** `src/app/**`, `src/overworld/**`, `src/presentation/**`, `src/ui/**`, `src/telemetry/**`, `tests/e2e/**`, `docs/VISUAL-BAR.md`, `.grok/workflows/ultracode-wave.rhai`. After package 1's ship-boundary cleanup passes, integration-only scope also owns `src/main.ts`, `index.html`, `vite.config.ts`, `package.json`, and `package-lock.json` to wire this slice and its test runner; it is limited to slice integration/configuration and must not absorb unrelated feature work.

**Acceptance:** A scripted cold run reaches player control or a meaningful story interaction within 20 seconds, completes starter choice → route → encounter → four-command battle → catch → heal → aerial/stadium payoff, and records timestamps for every transition. Fight menu interactive within 400 ms of free-roam battle start; move confirm reaches its first attack frame within 180 ms; a named 1080p-medium reference run meets the documented p99/long-frame gates after warmup. Evidence includes a played-session trace, motion clip, sustained profile, still comparison, and labels-hidden A/B—not stills alone. The workflow defaults to two rounds/four packages, keeps children at minimal effort, and stops/escalates on a repeated failed gate.

## Ownership going forward

| Lane | Owns | Must not own |
|---|---|---|
| **Sol primary** | Product/IP boundary, architecture, package specs, commitment decisions, diff/evidence acceptance. | Mechanical implementation volume. |
| **Fresh Sol reviewer** | Context-clean final review with `ship`, `fix-first`, or `rethink`. | Implementing its own fixes or replacing human legal judgment. |
| **Terra** | Deterministic simulation, content model boundaries, asset pipeline, difficult integration/debugging. | Unbounded redesign outside a settled package. |
| **Luna** | Schemas, validators, fixtures, scripts, UI wiring, and other spec-determined glue. | Ambiguous product/architecture choices. |
| **Hermes** | Human-facing intake, reference cataloging, launching/monitoring Grok runs, and concise run summaries. | Acting as the quality gate or claiming a workflow result without primary verification. |
| **Grok workflows** | High-volume minimal-effort audits, measurements, disjoint bounded fixes, replay/profile collection, blind ballot collection. | Architecture, IP decisions, self-certification, or unlimited “until perfect” loops. |

The immediate commitment should be package 1, then the content/simulation contracts. Do not commission full-dex meshes or a broad ultracode wave before those gates exist.
