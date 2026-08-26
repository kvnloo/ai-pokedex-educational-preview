# The prompt

This is the prompt that governs this repository.

```
I want you to build a beautiful browser-based 3D creature-collector demo at the level of the most recent Pokémon games, with the cinematic presentation quality of Pokémon: Twilight Wings. It should be utterly exceptional, visually beautiful, and satisfying to play, with every visible part done at AAA quality—from the creatures and environment to movement, battles, catching, animation, lighting, materials, UI, effects, sound, and anything else you can identify.

Use the complete private Twilight Wings reference corpus already downloaded with yt-dlp and extracted with ffmpeg under /mnt/zer0models/pokemon_anime. Study the full frames and keyframes, select the most relevant visual and motion references, and use img2threejs plus the available original-asset pipeline to turn those studies into high-fidelity original creature and environment work. The references are a quality and craft target; the shipped game must use original creatures, names, characters, story, models, textures, and audio, and must never ship official frames or ripped assets.

Fan out sub-agents across every independent product domain and have them build in parallel. On every iteration, use separate agents that did not implement the work as harsh visual and gameplay critics. They must inspect the real browser, play the complete loop, compare current captures and motion side-by-side against the extracted reference frames and the previous build with labels hidden, and state which is better and why. Builders must not certify their own work. If the result is not genuinely at the target bar, synthesize the criticism into disjoint fix packages and keep looping.

Do not stop at plans, scaffolding, primitive placeholder art, typecheck, unit tests, screenshots that merely exist, or a mechanically green simulation. Do not wait for routine human approval between iterations. Keep working end-to-end until the real browser supports a polished starter choice → WASD exploration → encounter → battle → catch → party → heal → replay loop, the controls have been empirically verified, the captures are genuine and non-black, independent critics find no blocking defects, and the blind panel prefers the new build. Do this in Three.js and TypeScript. Fan out sub-agents and ultracode until it is fully done.
```

Subsequent direction, also binding:

```
The current build is far below the bar: it reads as sphere-stack creatures, an empty test scene, generic web UI, and WASD has failed in the real browser. Replace those foundations rather than polishing them. The COD and Halo sibling projects are the minimum internal benchmark for authored presentation and visible production effort.

If a tool returns empty output, a warning, a timeout, or a soft failure, inspect local state and pivot immediately instead of stopping. Preserve deterministic battle rules and the research/shipping boundary, but let the primary agent decide implementation details. Use the verification method that can expose each claim: browser input for controls, played sessions for feel, motion for animation, profiles for smoothness, and blind comparisons for presentation.
```

Canonical-world direction, also binding:

```
This repository is the full browser-based Pokémon adventure game, not the CardTwin trading-card product. Rebuild the production plan around a canonical world graph rather than inventing disconnected test scenes.

Maintain two separate but joinable source planes:

1. Game topology: regions, world-map connectivity, towns, routes, interiors, warps, encounters, trainers, gyms, story flags, and version provenance derived from legally obtained game data and independently reusable schemas/tools.
2. Ash chronology: episode/arcs, companions, teams, captures/releases/evolutions, badges, battles, revisits, and location sequence from Kanto through Orange Islands, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Journeys/Galar, and the final Ash arc.

Join both planes through stable region/location/event IDs. The first playable campaign follows Ash's Kanto story from Pallet Town, but anime chronology must remain distinct from game-version topology where the show diverges from Red/Blue/Yellow or FireRed/LeafGreen.

Do not download, distribute, commit, or ship commercial ROMs, ripped sprites, maps, audio, dialogue, episode frames, or proprietary assets. A local ROM build/verification lane may operate only on dumps Kevin legally owns and supplies; record only hashes and private provenance, never ROM bytes. Public decompilation repositories are research/build references with unclear asset licensing, not permission to redistribute their copyrighted content. The shipped game must use original or separately licensed art/audio while preserving factual topology and chronology through a provenance-tracked clean data model.

Generate each game's overall map from normalized map nodes, connections, and warps; do not use a single flattened ripped image as the authoritative world. Every imported fact must retain source, version, confidence, and extraction method. Conflicts between anime, game versions, remakes, and community sources must remain explicit rather than silently merged.
```

Community-gameplay direction, also binding:

```
Use community Pokémon games and adjacent official modes as mechanics donors, not asset donors. Research and preserve the design lessons that made long-form fan games more interactive while keeping our implementation original and lawful.

- Reborn-style campaign depth: location-specific field effects, discoverable battle knowledge, meaningful difficulty/level caps, relationship-state consequences, dense authored quests, accessible navigation, optional challenge modifiers, and eighteen-type progression rather than flat badge repetition.
- ROM-hack lessons: quality-of-life, encounter diversity, smarter trainer composition, difficulty curves, branching or expanded stories, rematch/endgame loops, and faithful upgrades to original world graphs. Never download, embed, or redistribute hacked ROM files.
- MMO layer: many visible players sharing towns/routes, presence channels, parties, guilds, chat, direct battles, trading, events, co-op dungeons, region travel, a global market, anti-cheat, moderation, instancing and scalable authoritative simulation. The Ash campaign must remain playable solo and deterministic.
- Battle Revolution layer: the television is a cinematic public renderer while each phone is a private controller showing commands, teams and move selection. Support QR/deep-link pairing, hidden-information input, reconnect, spectators and up to four local battlers. Prefer standards-based second-screen transport (WebRTC/WebSocket) and Cast/AirPlay-compatible display handoff; Chromecast is one adapter, not the architecture.
- Pokémon-control layer: let players directly inhabit a Pokémon for bounded dungeon/encounter modes, with directional movement, positioning, move ranges, terrain, team AI and dungeon objectives. Mystery Dungeon is actually action-triggered turn/grid combat rather than real-time fighting; preserve its readable tactical causality while optionally prototyping a separate real-time arena mode. Never mislabel one as the other.

Keep these as composable modes over the canonical world graph and battle rules. Do not entangle MMO, second-screen or direct-control experiments with the first Pallet-to-Pewter canonical-data milestone. Each mode requires a written contract, deterministic simulation tests, real-device/browser proof and an independent playtest before promotion.
```

Private educational recreation direction, superseding conflicting asset language:

```
This project is Kevin's private, noncommercial educational experiment: an artistic recreation of the real Pokémon game intended to test whether AI can build a AAA-level Pokémon videogame. It will not be sold, redistributed, publicly broadcast, or represented as an official product.

Use original Pokémon artwork and canonical Pokémon identity in the private local experience when the source is lawfully possessed or available through an authorized official/public endpoint. Keep all official Pokémon presentation assets in a private asset plane on the 4 TB drive, outside Git and outside distributable builds. Record source URL or owner-provided provenance, acquisition date, content hash, usage scope and takedown/rebuild instructions. Git may contain identifiers, manifests, adapters, hashes and original code, but not copied official art bytes, ROMs, ripped maps, sprites, audio, dialogue, episode frames or patched ROMs.

Do not scrape around access controls, download commercial ROMs, bypass DRM, or obtain leaked/private asset packs. Kevin-supplied cartridge dumps and privately retained official art may be used locally with hash-bound provenance. Any preview, external artifact, public stream, PR, demo or distributable package must replace official assets with original/separately licensed stand-ins and pass a no-private-assets boundary check.

Therefore `originalAssetsOnly` is not the rule for the private local runtime. The rule is `privateCanonicalAssetsAllowed`, with fail-closed separation between private local assets and anything distributable or publishable.
```

Assets-as-Code direction, also binding:

```
The complete private game must be reproducible as Infrastructure-as-Code / Assets-as-Code. Git is the control plane: it stores versioned source manifests, authorized acquisition adapters, hashes, schemas, pipeline code, locked tool/model/container versions, prompts, seeds, transforms, generation graphs, quality gates and build orchestration—not private official asset bytes.

From a fresh clone, one documented bootstrap command must be able to provision tools onto the approved workspace/4 TB layout, verify or reacquire every lawfully available source, regenerate every derived model/texture/animation/audio/environment asset, validate hashes and provenance, build the browser game, and produce the private local runtime. The pipeline must be resumable, content-addressed, deterministic where tools permit, idempotent, offline-cache-aware and fail closed on source/hash/license drift.

Each asset recipe must declare: stable asset ID; source owner/URL or `owner-supplied` requirement; expected source hash; acquisition date/terms; private/distributable classification; tool/model/container digest; prompt and negative prompt; seed; preprocessing; transforms; output schema; expected hashes or perceptual acceptance envelope; dependencies; GPU/VRAM/storage estimate; verification commands; and safe fallback. Generated outputs and authorized source caches live on the 4 TB private asset plane and can be deleted/rebuilt.

Do not imply impossible recovery: if an official source cannot be lawfully reacquired, the pipeline must stop with an explicit `owner-supplied source required` gate and verify the replacement by hash. Never bypass access controls or put copyrighted bytes/secrets into Git to make bootstrap appear complete. Maintain a distributable profile that substitutes original/separately licensed stand-ins and a private profile that reconstructs Kevin's canonical-art experience.
```