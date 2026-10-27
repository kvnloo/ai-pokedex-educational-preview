# Community Gameplay Donor Matrix

## Purpose

Use community and official Pokémon experiments as mechanics references for the full browser adventure game. This document does not authorize copying ROMs, code, art, maps, dialogue, audio, servers, or proprietary data.

## Design donors

### Pokémon Reborn: campaign depth and battlefield context

Primary evidence:

- Reborn's official Field Effects page describes terrain that can dramatically change battle flow and explicitly grounds the idea in anime-style environmental tactics.
- Community documentation describes 37+ fields, move-driven field creation/transformation, field-specific move/type/seed interactions, collectible Field Notes, relationship points, level-cap pressure and challenge modifiers.
- The Reborn accessibility project adds event scanning, pathfinding, auto-walk, custom points of interest and text summaries.

Reusable lessons:

- Battles should inherit a field from the physical location.
- Players should discover and collect tactical knowledge rather than receive every modifier automatically.
- Moves can transform fields, creating authored cause-and-effect rather than static buffs.
- Difficulty is more interesting when it changes composition and constraints, not just enemy levels.
- Relationships and choices can alter scenes without blocking core collection progress.
- Accessibility should be part of the world graph: named exits, events, points of interest and deterministic paths.

Do not copy Reborn's field table, story, characters, maps, scripts or assets. Define an original field grammar using our canonical locations and deterministic battle model.

### ROM hacks and community remixes: faithful improvement loops

Research these as a class, not as files to ingest. High-value patterns include:

- modern quality-of-life layered onto canonical region topology;
- broader encounters and viable team-building earlier in the campaign;
- smarter trainer teams, rematches and postgame loops;
- level caps and anti-grind tuning;
- optional challenge modes;
- expanded side quests and environmental storytelling;
- restored or reinterpreted content;
- difficulty that communicates its rules.

Fail closed on ROM distribution. Do not download or mirror patched ROMs. If Kevin later supplies legally owned dumps, use private hash-bound verification only.

### PokeMMO: one account across multiple regions

Verified official/support descriptions:

- Cross-platform, online-only shared world with real-time player presence, chat, battle and trade.
- Unified account and five-region travel.
- Region travel is progression-gated and anchored at port cities.
- Regional key items, level caps and story progress remain local while Pokémon storage spans the account.
- Global Trade Link provides searchable listings and delivery.

Reusable architecture:

- One account-level trainer identity.
- Region-local campaign state over a global collection/PC.
- Presence channels per map/instance.
- Port-city edges in the canonical world graph.
- PvP matchmaking, direct challenges, parties and events.
- Server-authoritative inventory, trades and battle outcomes.
- Instanced interiors/dungeons when shared density would harm story pacing.

Do not depend on or copy PokeMMO's launcher, ROM requirements, server implementation, economy, maps or assets.

### Pokémon Revolution Online: persistent social progression

Verified community documentation describes:

- guilds, ranks, guild chat and seasonal ladders;
- direct trade, item mail, friends and private messages;
- ranked PvP and rewards;
- daily challenges, events, bosses and original quests;
- co-op dungeons with rooms, puzzles, battles, guardians and score ladders;
- transport systems connecting regions and custom islands.

Reusable lessons:

- Towns need social reasons to revisit them.
- Guilds need cooperative goals beyond a chat badge.
- Seasonal PvE/PvP ladders can coexist with a deterministic solo campaign.
- Co-op dungeons should be bounded instances with explicit objectives and durable results.
- Moderation, reporting, rate limits, anti-cheat and economic controls are product features, not later infrastructure.

### Battle Revolution: private controller, public spectacle

Nintendo and Pokémon's official pages verify:

- Pokémon were copied from DS games into Wii storage and assembled into Battle Passes.
- Up to four DS systems could connect for local battles.
- The DS acted as a private touchscreen controller while the television showed cinematic 3D battles without exposing move choices.

Our browser-native equivalent:

- TV/display opens a cinematic battle URL.
- Host displays a QR code and short pairing code.
- Each phone joins as a private controller through an authenticated session.
- Phone shows team, moves, items, targeting, readiness and private prompts.
- TV shows trainers, Pokémon, arena, timers and resolved actions only.
- Server is authoritative; controller messages are intents, not state mutations.
- Reconnect tokens preserve seats without leaking another player's commands.
- Support spectators, rental teams and 1–4 local battlers.
- WebSocket is the baseline reliable control channel; WebRTC data channels are an optimization. Chromecast/AirPlay are display adapters, while any browser-capable TV remains supported.

Required proof:

- real phone controlling a separate display;
- hidden move selection never visible on TV or other phones;
- reconnect and host migration;
- deterministic replay of the resolved battle;
- latency and packet-loss measurements.

### Mystery Dungeon: direct Pokémon embodiment

Official manuals clarify an important distinction: Mystery Dungeon combat is turn-based and grid-driven. Enemies act only after the player takes an action. It can feel fast because movement, facing and move shortcuts are direct and continuous in presentation.

Reusable tactical mode:

- Player inhabits a Pokémon rather than a trainer.
- Direction, distance, corners, walls, terrain and move shapes matter.
- Every step, item or move advances the simulation.
- Party AI has explicit move permissions and tactics.
- Procedural floors preserve encounter species/objective contracts.
- Hunger, PP, items and rescue objectives create expedition pressure.
- Optional auto-walk stops on danger.

Separate experimental mode:

- A genuinely real-time arena/fighting prototype may use cooldowns, dodges, hitboxes and direct aiming.
- It must be labeled and simulated separately; it is not "Mystery Dungeon combat."
- Promotion requires independent feel testing and must not replace canonical turn battles without evidence.

## Composable product modes

All modes share canonical identity and battle data but have separate contracts:

1. Story Campaign — Ash chronology over canonical region topology; solo-first.
2. Shared World — visible trainers, parties, chat and events layered on campaign maps.
3. Colosseum — cinematic battles with phone-private controls and TV-public rendering.
4. Expedition — direct Pokémon control in tactical procedural dungeons.
5. Arena Lab — optional real-time direct-control experiment.

## Sequencing

1. Finish the Pallet-to-Pewter canonical graph and Ash chronology slice.
2. Add an original Reborn-inspired field-effect grammar to those physical locations.
3. Specify phone→TV Colosseum protocol and prove a synthetic two-device battle.
4. Add map-presence ghosts, then server-authoritative shared players; do not begin with a global economy.
5. Build one tactical Mystery Dungeon-style Viridian Forest expedition using the same move data.
6. Only after solo and small-party proof, scale shared towns, guilds, trading, events and co-op dungeons.

## Non-goals

- No ROM/hack download or redistribution.
- No official or fan-game asset extraction.
- No copying Reborn/PokeMMO/PRO stories, maps, field tables, economies or server code.
- No claim that Mystery Dungeon is real-time fighting.
- No MMO-first rewrite that blocks the deterministic solo campaign.
