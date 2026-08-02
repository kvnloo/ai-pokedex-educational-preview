# The prompt

This is the original prompt that produced this repository, kept verbatim as the record.

```
can you build a fully realistic game using this material as reference
@url:`https://www.youtube.com/playlist?list=PLQWzKIaERirwfvHB3m8CjnTK6ZzNA8wvJ`
use yt-dl (alr installed) to download the entire episode in the highest quality then extract
all of the frames. finally look thru the frames to find the most relevant ones for extracting
game visuals, animations, mechanics, etc. i want to start off by just making a beautiful
interactive demo that copies the mechanics of pokemon in 3d. let's start off by copying the
prompt from ../products/cod and also doing additional research on pokemon games i saw on x
that people have been creating pokemon game clones using the gauntlet loops.

@url:`https://x.com/0xPaulius/status/2082791042156253317?s=20` here is the post
@url:`https://x.com/TCG_Family_2020/status/2083658874612060341?s=20`
the viral prompt is prompt.md from cod
```

COD prompt structure (verbatim core), adapted:

```
I want you to build a creature-collector at the level of the most recent Pokémon games, with
presentation quality matching Pokémon: Twilight Wings (the official Galar shorts). It should
be utterly perfect, visually beautiful, with every single thing done at AAA quality—from
materials to battle juice to anything you could think of.

Fan out sub-agents and have sub-agents tackle each one individually so that the game is
utterly perfect. You should /loop on each item and have a separate sub-agent check it
visually to ensure it looks triple A. That separate sub-agent should be a really harsh
critic, and if it doesn't look triple A, it should keep going.

Don't stop until each sub-agent is utterly wowed with the quality when compared with the
actual reference. It should literally compare them side by side blind and say which one looks
better. Do this in ThreeJS. /loop until it's utterly perfect. Fan out sub-agents and ultracode.
```

---

# The design target

**Mechanics:** classic Pokémon core loop — third-person overworld exploration, tall-grass
wild encounters, turn-based battles (Fight / Bag / Creature / Run), type chart, status,
switching, XP/level, catching, party of 6, heal center, basic shops/NPCs.

**Presentation bar:** *Pokémon: Twilight Wings* cinematic anime — soft global illumination,
rich graded skies, tactile fur/feather/scale materials, expressive creature idle/attack
animation, emotional framing in battle, premium HUD. Not GBA pixel art. Not low-poly toy.

**Identity:** original region, original creatures, original names, original music. Mechanics
are Track S (simulation facts). Art/audio are Track P (same feel, original execution).

**Engine constraint (COD lineage):** browser Three.js + TypeScript, **zero binary Nintendo
assets**. Meshes, textures, SFX authored in code or as original project art. Reference
footage under `/mnt/zer0models/pokemon_anime` is **study only** — never ship frames, rips,
or traced geometry.

---

# Two-track fidelity

| Track | Domain | Done means |
|---|---|---|
| **S — Simulation** | stats, type chart, damage formula, encounter rates, catch rate, turn order, status, XP curve | numeric gates; golden tests |
| **P — Presentation** | creature silhouettes, town lighting, battle staging, VFX, UI, audio | Twilight Wings side-by-side + played-session feel |

Hard rules:
- No official Pokémon names, sprites, models, maps, or music in repo or build.
- Reference frames stay outside the product tree (symlink study corpus only).
- “Looks like Twilight Wings” is measured by blind forced-choice against graded stills, not vibes.

---

# Reference corpus

| Source | Role |
|---|---|
| YouTube playlist `PLQWzKIaERirwfvHB3m8CjnTK6ZzNA8wvJ` — *Pokémon: Twilight Wings* (eps 1–7 + Gathering of Stars) | Visual/animation bar |
| `/mnt/zer0models/pokemon_anime/videos` | Master downloads |
| `/mnt/zer0models/pokemon_anime/frames` + `keyframes` | Study stills (lighting, staging, creature motion silhouettes) |
| X: @0xPaulius Pallet Town 3D / gauntlet-loop clone culture | Process + ambition reference (first-person LeafGreen toy ≠ our bar) |
| Official Pokémon games (gen 8–9 feel for battle UI rhythm) | Mechanics cadence |

---

# Verification doctrine

Same lesson as COD: **a loop that only looks at frames produces a game that photographs well
and plays badly.** Feel is measured by playing.

## Seven verification modes

| # | Mode | Exposes | Instrument |
|---|---|---|---|
| 1 | Still frame | Lighting, materials, composition | Screenshot + `docs/VISUAL-BAR.md` vs Twilight Wings stills |
| 2 | Motion clip | Idle bob, attack arcs, camera moves, grass sway | ≥60 fps sequences |
| 3 | Played session | Encounter cadence, battle snappiness, catch satisfaction | Scripted + human playtest |
| 4 | Sustained profile | Hitching, GC spikes during battle VFX | p99 frame time |
| 5 | Instrumented event trace | Input→menu open, move confirm→HP bar, ball throw timing | Timestamp log |
| 6 | Loop analysis | Catch→heal→route→boss reward cadence | Multi-session sim |
| 7 | Blind A/B | Beats reference presentation / rival clones | Labels-hidden forced choice |

## Check categories

### A. Overworld feel
- Third-person camera: collision-aware, soft follow, no hard pops on turn.
- Walk/run acceleration curves; foot plant timing vs dust.
- Tall grass: readable risk, encounter telegraph without cheap jumpscares.
- Time-to-first-interesting-moment from cold boot: **≤ 20 s**.

### B. Battle juice (the Pokémon gunfeel sandwich)
Input → menu confirm → creature lunge → hit flash → HP tween → message → reward, all tight.
- Menu open from free roam battle start: **≤ 400 ms** to interactive Fight menu.
- Move confirm → first attack frame: **≤ 180 ms**.
- HP bar drain duration scales with damage fraction; never instant, never multi-second slog.
- Super-effective / not-effective / crit each have distinct AV feedback within 100 ms of hit.
- Faint, recall, send-out staging must feel *directed* (Twilight Wings framing).

### C. Systems integrity (Track S)
- Damage formula documented and golden-tested (level, attack/defense, power, STAB, type, crit, random band).
- Type chart complete for types we ship; missing effectiveness is a defect.
- Speed-based turn order stable; priority moves respected.
- Catch rate formula documented; ball modifiers; shake count presentation matches outcome seed.
- Party of 6, switching mid-battle, black-out → heal center.

### D. Creature presentation
- Every creature has idle, faint, and ≥1 attack clip (code-authored OK).
- Silhouette readable at battle distance and overworld scale.
- Materials: fur/feather/scale/metal read under TW-like soft light.
- No two consecutive wilds of same species with identical idle phase (desync).

### E. Fun and addiction
- Route loop: grass → battle → reward → heal → new grass, with escalating stakes.
- Starter choice is emotional and mechanical (type triangle).
- First gym/elite gate within a short demo path for the vertical slice.
- Skill expression: type knowledge + switching + status, not menu mashing alone.

### F. Performance
- p99 frame time **≤ 16.7 ms** at 1080p medium preset during battle VFX.
- Zero frames > 50 ms after warm-up during a 3-minute explore+battle session.

### G. Regression
- Every certified gate enters the standing list; every wave re-measures it.

---

# Demo vertical slice (Wave 0 — ship first)

1. Boot to a beautiful starter town + adjacent route (original names).
2. Choose 1 of 3 starters.
3. Walk into tall grass → wild encounter transition.
4. Full turn-based battle (Fight/Bag/Creature/Run) with 4 moves, type chart, HP, faint.
5. Catch flow with ball throw arc + shakes.
6. Party HUD + simple heal at center.
7. All procedural meshes/materials; TW-inspired lighting/grade.

Do not expand content until the slice is fun under mode 3 (played session).

---

# How to run a wave

1. **Audit** — visual *and* systems domains every time.
2. **Synthesise** — rank by blind side-by-side delta; disjoint file ownership.
3. **Fix** — one package per agent + numeric acceptance test.
4. **Critique** — independent re-measure; labels-hidden vs TW stills and vs prior build.
5. **Land** — typecheck, build, regression list, commit with measurements.
6. **Loop** on failures.

Size waves to finish. A mid-edit dead wave lands nothing.

---

# Legal / ethics note

This is a mechanics-and-craft research artifact. It is not an official Pokémon product.
Do not distribute ripped assets. Prefer original creatures so the project can be shown publicly.
