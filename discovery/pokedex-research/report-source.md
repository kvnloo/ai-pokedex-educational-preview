# A Pokédex that feels like an instrument

Prepared for phone use over Tailscale, 5 September 2026.

The strongest design is a modern handheld with one dominant Pokémon display and immediate access to its entry, measurements, voice and observations. Its character comes from the interaction: identify a species, examine it, hear its entry and move naturally to the next. Red casing, a blue lens and layered lighting support that behavior. Parallax is our design choice, not a claim about a specific canonical model.

## What changed over time

The anime's early device is a spoken encyclopedia and trainer identifier. Bulbapedia ties identification to *Pokémon Emergency* and documents spoken species lookup throughout the series. These are episode-indexed secondary findings; the relevant footage was not inspected. Regional redesigns from Johto to Kalos do not justify assuming every device gained every later function. [Pokédex animation history](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex).

The Nintendo DS games made navigation tactile. Their manual documents seen/caught records, numerical and alphabetical search, cries, habitat, size comparison and a touch dial, with explicit previous/next actions. This directly supports thumb navigation and an information panel beside the visual specimen. [Diamond manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/DS_Pokemon_Diamond?_a=DATAg1AAZAA0).

The real Pokédex 3D software extended the device fantasy. Nintendo's 2011 announcement describes search, sorting, filters, sharing, SpotPass and AR markers. The 2012 Pro release added a large detailed collection with moves, stats, evolutions, all-angle 3D viewing, cries, AR photos and quizzes. These are companion applications, not evidence that every main-series Pokédex had those features. [Pokédex 3D announcement](https://www.nintendo.com/en-gb/News/2011/June-7th-Nintendo-3DS-system-update-adds-Internet-Browser-online-store-and-Pokedex-3D-253238.html), [Pokédex 3D Pro](https://www.nintendo.com/en-gb/News/2012/In-Nintendo-eShop-now-Pokedex-3D-Pro-664409.html).

The 3DS main-series manual also describes viewing a Pokémon's movement, cry and location. This gives animated model inspection a stronger basis than decorative idle motion alone. [Alpha Sapphire manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/manual-3DS-pokemon-alpha-sapphire-version-en?_a=DATC1RAAZAA0).

Rotom Dex turns the tool into a companion. Nintendo documents personality, location and destination guidance, QR-based species information and habitat discovery, and the Poké Finder camera with evaluated photographs and unlockable zoom. These are distinct functions, not a license to pretend that a webpage recognizes camera images. [Pokémon Sun](https://www.nintendo.com/en-za/Games/Nintendo-3DS-games/Pokemon-Sun-1092368.html).

The show goes further. Episode-indexed secondary descriptions document video handling, voice sampling and photographic database updates. An official synopsis for *Alolan Open House!* corroborates use of voice sampling. That supports a future observation journal and a clear voice interface; voice imitation is not needed for this application. [Rotom Dex in the anime](https://bulbapedia.bulbagarden.net/wiki/Rotom_Pok%C3%A9dex_(anime)), [Alolan Open House](https://www.pokemon.com/us/animation/seasons/20/episode-24-alolan-open-house).

Sword and Shield places the Pokédex inside a Rotom Phone. Its official site explicitly records discovered/caught Pokémon and describes functions outside the encyclopedia, including bicycle assistance. Scarlet and Violet similarly distinguishes the Pokédex app from the map app, whose information includes location, towns, Pokémon Centers and wild Pokémon. A modern design should retain a clear species-view focus rather than mix every phone function into one screen. [Sword and Shield](https://swordshield.pokemon.com/en-gb/gameplay/about-pokedex-rotom-phone/), [Scarlet and Violet announcement](https://www.nintendo.com/en-ca/whatsnew/new-details-revealed-for-pokemon-scarlet-and-pokemon-violet-including-tera-raid-battles/).

Legends: Arceus is a useful separate branch. Its fictional setting is historical, even though its release is modern. Its official gameplay page requires repeated study and research tasks to flesh out entries, beyond one capture. Observation progress can therefore become meaningful gameplay later; downloaded assets and viewed web pages must never masquerade as captures or completed research. [Arceus research](https://legends.arceus.pokemon.com/en-us/gameplay/).

## Function inventory and implementation decisions

| Function family | Evidence | Application decision |
| --- | --- | --- |
| Species name, number, type and short entry | Manuals; existing canonical data | Primary display, available immediately |
| Height, weight and size comparison | DS manual | Numeric measurements now; honest scale comparison later |
| Voice and cry | Anime history; DS and Pro sources | User-triggered entry narration now; species cry only from an actual sourced recording |
| Search, ordering and filters | DS and 3D sources | Search sheet; number/name lookup; clear next/previous controls |
| Seen/caught and completion | DS manual; game sources | Integrate real game state later; do not infer captures from reference browsing |
| Habitat/location | DS, Sun, Scarlet/Violet | Show sourced species habitat; world map only when connected to actual game locations |
| 3D examination, movement, stats, evolution and moves | Pro and 3DS manual | Official image first; selected experiment views now; interactive rigged asset after it exists |
| Forms and region grouping | Secondary cross-generation history | Preserve explicit species/form identity; never mix normal Charizard with Mega/Gigantamax references |
| Photos, videos and observations | Sun; episode-indexed Rotom evidence | Reference gallery with source details, fullscreen inspection and explicit selection |
| Companion identity and notifications | Rotom official material; phone-era sources | Responsive instrument feedback; no invented conversational intelligence |
| Research tasks and progression | Arceus | Later tasks based on real game events, separately from asset-development experiments |
| AR, QR and recognition | 3D/Sun sources | Research backlog; require working detection before showing a scan-success state |
| Quizzes | Pro release | Optional later learning mode, outside the Charizard critical path |

## The first phone implementation

The entry screen uses official HOME art, an inset display, restrained depth, readable type badges and a tactile control area. Entry, Images and Iterations form distinct panels. A horizontal swipe changes the Pokémon, while vertical movement keeps scrolling. Search and previous/next remain usable without gestures. Device tilt is opt-in and calibrated; touch/pointer fallback works without sensor permission. Reduced-motion preference disables continuous movement.

Images preserve provenance and the user's actual reference choices. Iterations show the actual run and review state, including failures, and link to comparable camera views. A beautiful interface must not label a rejected mesh as finished. The initial application can display all species' existing records without producing additional Pokémon assets.

Cardtwin's local implementation supplies tested ideas for tilt calibration, bounded rotation, damping and touch arbitration. Reuse its math selectively rather than importing an entire 3D rendering stack. The current Pokédex data already contains 1,025 species, stats, dimensions and flavor text; using those local records avoids a network request for each swipe.

## Evidence limits and remaining research

This is a function-focused research pass, not an exhaustive episode catalogue. The early-generation/anime detail relies partly on clearly labeled secondary sources. Several official episode pages were accessible only through indexed summaries; no episode footage was inspected. The detailed Johto–Kalos device progression remains a gap. Exact form/search options differ by game, and functions of Pokégear, PokéNav, DexNav or the general Rotom Phone are not automatically Pokédex functions.

The correspondence with real technology is an interpretation: touch interfaces, stereoscopic/AR viewers and connected smartphone apps became possible on their respective hardware. The sources demonstrate the functions and devices, but do not establish a single causal design history. Current remote-site availability is not evidence that discontinued companion software is still purchasable.

Discovery stopped after the main interaction decisions had primary support and remaining gaps could be labeled without changing the first mobile implementation. Further research should target the unsupported anime eras and actual footage, not repeat these broad searches.
