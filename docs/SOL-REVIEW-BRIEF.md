# Sol Advisor brief — overall approach review

## Product
`/home/kvn/workspace/zer0/products/pokemon` — "Twilight Route"
Browser Three.js creature-collector: Pokémon mechanics + Twilight Wings cinematic bar.
Reference corpus: `/mnt/zer0models/pokemon_anime` (TW episodes 2,5,6,7 downloaded; frames extracted).
Mesh gen: local Hunyuan3D API :8081 + img2threejs forge at `~/workspace/img2threejs`.
Wooloo A/B under `/mnt/zer0models/pokemon_anime/pipeline/ab_test/wooloo/`.

## Read first (in order)
1. `prompt.md` — design target, two-track fidelity, verification doctrine
2. `docs/DATA-ARCHITECTURE.md` — national-dex storage (1025 species)
3. `docs/GROK-WORKFLOW.md` — Grok-native waves; children minimal effort
4. `content/schema/*.json`
5. `package.json`, `index.html`, `tools/hy3d_generate.sh`

## What we want from you
NOT implementation of the full game. **Architecture / approach critique** as Sol Advisor:

A. **Is the overall stack coherent?** Three.js COD-style engine + PokéAPI canonical data + Hunyuan/img2threejs presentation + Grok ultracode waves + TW story.

B. **Data architecture** — JSONL species + derived dex-index shards vs alternatives (SQLite-in-browser, single JSON, protobuf). Gaps for moves/learnsets/forms/battle?

C. **Mesh pipeline** — Hunyuan shape (12GB VRAM) vs img2threejs procedural; clean-up path for game-ready meshes (poly budget, LODs, materials, animation sockets).

D. **Story** — bind vertical slice to Twilight Wings exact plot (John / flying taxi / gym leaders) vs generic LeafGreen pallet clone (bar to beat: pallet-town-3d-one.vercel.app).

E. **Risks** — IP/asset shipping, scope explosion, verification modes ignored (stills-only), token burn.

F. **Concrete next 5 work packages** with owned paths and acceptance tests — ready for Luna/Terra if you choose to implement **only tiny missing glue** (e.g. pokeapi-sync stub), otherwise stop at review.

## Constraints
- Children in Grok workflows: reasoning_effort minimal (personas in `.grok/personas/`).
- No Nintendo binary assets in repo.
- Prefer playable vertical slice over full dex meshes on day one; full dex **text** is fine.

## Deliverable
Write `docs/SOL-APPROACH-REVIEW.md` with:
- Verdict: ship-direction / fix-first / rethink
- Findings ranked by severity
- Recommended architecture adjustments (if any)
- Next 5 packages
- What Sol/Luna/Terra should own going forward vs Hermes vs Grok workflows
