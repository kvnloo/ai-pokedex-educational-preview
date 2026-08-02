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
| Identity | Original names only in ship UI; no Wooloo/Pikachu plates under `shots/` |
| Sheet | `tools/contactsheet.mjs` refuses minimal-capture |

```bash
npm run build && node tools/capture.mjs --label wave1
node tools/contactsheet.mjs --label wave1
# capture.json.source must include browser-threejs
```

## Mode-1 still checklist (vs TW *presentation*, not pixels)

- [ ] Soft key + fill; no flat unlit spheres as final claim
- [ ] Readable creature silhouette at battle distance
- [ ] Sky / grade not pure black void
- [ ] HUD legible without crushing the scene
- [ ] No research A/B chrome in certified shot

## Mode-7 blind

Labels-hidden forced choice: **prefer our still over TW reference** or keep looping.
Mode-3 playtest green alone is **not** wave exit.

## Standing list

Re-measure every land: `shots/playtest/standing-gates.json`.
