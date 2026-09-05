# Pokédex field-OS research brief

## Product conclusion

The Pokédex should behave as a context-aware field instrument, not an app launcher. Its primary loop is:

`detect → scan → identify → register → inspect / hear → locate → research → act`

The persistent hardware scan trigger is therefore available from every screen. A successful scan updates the encyclopedia and research state, then reveals the species entry with a registration ritual.

## Source-backed capabilities

- Core-series Pokédex: records encountered and caught species, species data, forms, habitat/distribution and completion progress.
- Anime Pokédex: identifies Pokémon, gives spoken descriptions, plays/recognizes cries and acts as a field reference.
- Rotom-era devices: add map/navigation, camera, communications, trainer services and context-aware assistance.
- Legends research model: observations and explicit research tasks make the Pokédex something the player actively builds rather than passively reads.
- Pokémon Game Sound Library: demonstrates first-party music-player conventions including play/pause, previous/next, repeat, shuffle and playlists; shipped prototype uses an original procedural cue rather than copied soundtrack audio.

## Sources

- [Pokédex overview — Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9dex)
- [Rotom Pokédex — Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Rotom_Pok%C3%A9dex)
- [Rotom Phone — Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Rotom_Phone)
- [Pokémon Game Sound Library — Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Game_Sound_Library)
- [Pokémon HOME features — The Pokémon Company](https://home.pokemon.com/en-us/features/)

## Implemented information architecture

- Persistent: Scan trigger, route/time/weather/battery context, audio state, A/B controls.
- Primary dock: Field, Dex, Map, Research, Party, Tools.
- Contextual tools: Camera, Comms, Journal, Weather, Music, Clock, Settings, Save.
- Audio: original Web Audio procedural field cue, boot/select/scan/register/cry cues, user-gesture gated, muteable, reduced-motion aware.
- State coupling: scan registers Pidgey and increments research; map pins surface sightings; save reports field-log synchronization.

## Fast-model review

- Cerebras/custom route: recommended grouping tools contextually under Field, Pokédex, World, Trainer and Media rather than presenting ten equal top-level apps.
- Groq `qwen/qwen3.8-27b`: emphasized physical wake, staged identification, tactile detents, cry playback, proximity feedback and a durable “data added” ritual.

These are advisory syntheses. Product decisions and implementation were reviewed against the cited sources and the live visual artifact.
