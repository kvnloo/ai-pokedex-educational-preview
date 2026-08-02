# Twilight Route — Architecture

A browser creature-collector in Three.js + TypeScript. Lineage: **COD product
architecture** (`products/cod/docs/ARCHITECTURE.md`) retargeted to Pokémon-class
mechanics and Twilight Wings presentation. Product truth: `prompt.md`. Data
truth: `docs/DATA-ARCHITECTURE.md`. Approach gates: `docs/SOL-APPROACH-REVIEW.md`.

## Ground rules

1. **No Nintendo binary assets.** No ripped models, sprites, music, or TW frames
   in the product tree. Procedural code meshes, original art, or rights-cleared
   derivatives only. Study corpus lives under `/mnt/zer0models/pokemon_anime`
   and is never `publicDir`.
2. **TypeScript, strict.** `npm run typecheck` clean for files you own.
3. **Systems, not god-objects.** Everything the frame loop touches implements
   `System` (`src/core/Engine.ts`) and is registered in `src/main.ts`.
4. **Talk through the bus.** Cross-system communication uses `bus` from
   `src/core/EventBus.ts`. FX, audio, and HUD are *pure listeners* — gameplay
   must not import them.
5. **Determinism for Track S.** All gameplay randomness from `src/core/Rand.ts`.
   Never `Math.random()` in sim/battle/catch. Presentation may use a separate
   stream. Capture/playtest runs must be reproducible for a given seed.
6. **Fixed step for simulation.** Overworld movement, encounter rolls, battle
   turn resolution, catch RNG live in `fixedUpdate`. Presentation (meshes,
   camera lag, HP bar tweens, VFX) lives in `update` / `lateUpdate`.
7. **Sim ≠ presentation.** Battle rules are pure TS with **zero** DOM/Three
   imports (`src/battle/**` today → migrate to `src/sim/**`). Presentation
   consumes events only.
8. **Content is data.** Ship pack `content/game/**`. Research warehouse
   `content/canonical/**` (or future `content/reference/**`) is not the player
   build surface. See data architecture doc.
9. **Budget-aware.** Honour `settings.gfx`; low preset must run on iGPU.

## Frame schedule

```
input.beginFrame
  → N × fixedUpdate   overworld → encounters → battle sim → party/progress
  → update            world present → creature anim → fx → audio → camera → ui
  → lateUpdate        camera-attached FX, culling, LOD
  → render            RenderSystem
input.endFrame
```

Systems declare `order` from `ORDER` in `src/core/Engine.ts`.

## Module map and ownership

| Path | System | Responsibility |
|---|---|---|
| `src/core/` | — | Engine loop, time, input, events, settings, RNG, capture hooks |
| `src/sim/` | (pure lib) | Battle, catch, party, formulas — **no Three/DOM** |
| `src/content/` | — | Loaders for `content/game` only; validated types |
| `src/battle/` | *(legacy → sim)* | Wave-0 pure battle (move into `sim/` when touching) |
| `src/overworld/` | `overworld` | Avatar move, grass zones, heal pads, interactables |
| `src/presentation/` | `present` | Three scenes, creature factories, battle staging, lighting |
| `src/fx/` | `fx` | Hit flashes, SE/NVE colors, ball arc, dust, transitions |
| `src/audio/` | `audio` | Synthesised SFX / WebAudio (no ripped music) |
| `src/ui/` | `hud` | Starter picker, battle menus, party strip, messages |
| `src/game/` | `director` | Mode flow: boot → starter → explore → battle → catch → heal |
| `src/pokedex/` | `dex` | 3D dex UI over derived shards (research/private build flags) |
| `src/render/` | `render` | Renderer, tone map, resize (thin until post stack needed) |

**Do not edit files outside the directory you own** in a package wave. Shared
contracts (`src/core/*`, event names) get an explicit cross-package note.

## Content seams

```
content/canonical|reference   research warehouse (PokéAPI / study) — non-ship default
content/game/**               original ship pack (wave0.json, …)
content/derived/**            indexes/charts for tools & optional private dex
public/                       only ship-safe runtime assets (never TW frames)
```

Runtime player path loads **`/content/game/...` only**.

## Mesh pipeline (presentation)

```
concept + rights
  → gen (Hunyuan / img2threejs / procedural factory)
  → mesh_qa (reject cube vol_ratio>0.75, paper-thin min/max<0.12)
  → retopo/LOD/materials
  → presentation pointer on content row
  → ship manifest
```

Raw multi-MB shapes are not battle meshes. See `docs/MESH-PIPELINE.md`,
`tools/mesh_qa.py`.

## Key contracts

- `src/core/Engine.ts` — `System`, `EngineContext`, `ORDER`
- `src/core/EventBus.ts` — `GameEvents` vocabulary
- `src/core/Rand.ts` — seeded RNG
- `src/battle/*` / `src/sim/*` — damage, turns, catch (pure)
- `content/game/wave0.json` — Wave-0 ship pack

## Verification

```bash
npm run typecheck
npm run test:battle
npm run test:playtest
npm run build
# mode-1 stills (must be browser-threejs; refuse minimal-capture):
# node tools/capture.mjs --label wave1
# node tools/contactsheet.mjs --label wave1
# later: node tools/perf-session.mjs
```

Standing re-measure list: `shots/playtest/standing-gates.json`.
Visual bar: `docs/VISUAL-BAR.md`. Capture fail-closed without browser; black shots are blockers.

Modes 1–7 and categories A–G live in `prompt.md`. Stills-only waves must not
claim play quality. Gauntlet/ultracode: `.grok/workflows/ultracode-wave.rhai`
with children **minimal** effort; stop on mode-7 blind win, not vibes.

## Quality bar

Adversarial critic compares against Twilight Wings *presentation* (lighting,
staging, motion grammar) and against Pokémon-class *feel* (battle juice,
encounter cadence). Standard is not “good for a browser demo” — it is blind
side-by-side competence on the modes that matter for the claim.

## Wave-0 vertical slice (must ship first)

1. Boot beautiful route (original names)
2. Choose 1 of 3 starters
3. Grass → encounter transition
4. Turn battle Fight/Bag/Creature/Run, types, HP, faint
5. Catch + shakes
6. Party HUD + heal center
7. Procedural creatures + TW-inspired grade

Expand content only after mode-3 fun.
