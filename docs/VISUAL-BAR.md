# Visual bar (mode 1 / mode 7)

Presentation target: *Pokémon: Twilight Wings* cinematic anime — soft GI, graded skies,
tactile materials, emotional battle framing. **Ship stills must be real browser Three.js
frames**, not research plates.

## Capture honesty (hard)

| Gate | Pass |
|---|---|
| `tools/capture.mjs` source | `browser-threejs` (never `minimal-capture`) |
| Fail closed | No Chromium / no playwright → exit 1 (no `/mnt/zer0models` or `public/ab` copy) |
| Frame content | Non-black WebGL of ship `index.html` scene (starter/explore/battle) |
| Near-void | `black_frame=false` and `pass_hard_gates=true` — mean luma **≥ 38**, unique samples **≥ 48**, near-black frac **&lt; 0.82** (mean≈27 void **fails**) |
| Identity | Original names only in ship UI; no Wooloo/Pikachu plates under `shots/` |
| Sheet | `tools/contactsheet.mjs` refuses minimal-capture **and** `black_frame` |

```bash
npm run build && node tools/capture.mjs --label wave2
node tools/contactsheet.mjs --label wave2
# capture.json: source=browser-threejs, black_frame=false, pass_hard_gates=true
```

## Mode-1 still checklist (vs TW *presentation*, not pixels)

Re-measure on current wave label still (`shots/wave2/shot-000.png` or later):

- [ ] Soft key + fill; no flat unlit spheres as final claim
- [ ] Readable creature silhouette at battle distance
- [ ] **Sky / grade not pure black or near-void navy** (mean luma mid-scene, not ≈27 flat)
- [ ] Ground + grass readable under graded sky (not empty canvas)
- [ ] HUD legible without crushing the scene
- [ ] No research A/B chrome in certified shot

## Mode-7 blind

Labels-hidden forced choice: **prefer our still over TW reference** or keep looping.
Mode-3 playtest green alone is **not** wave exit. Mode **5** instrumented latencies also required.

## Standing list

Re-measure every land: `shots/playtest/standing-gates.json` (wave2+ labels; modes 1/3/4/5/7).
