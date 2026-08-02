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