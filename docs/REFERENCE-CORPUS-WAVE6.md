# Wave 6 private reference study

> Study-only provenance. The pixels remain under `/mnt/zer0models/pokemon_anime` and
> must never be copied into `public/`, `dist/`, or shipped assets. The game uses
> original creatures, characters, places, models, textures, writing, and audio.

## Complete-corpus pass

`tools/index-reference-corpus.py` scanned every extracted still available to this
repository session:

- full frames: **1,745**
- keyframes: **436**
- total images: **2,181**
- composition/look clusters: **64**
- high-change motion candidates: **80**
- deterministic seed: **7**

Private outputs:

- `/mnt/zer0models/pokemon_anime/pipeline/reference_index/sol/manifest.json`
- `/mnt/zer0models/pokemon_anime/pipeline/reference_index/sol/composition-clusters.jpg`
- `/mnt/zer0models/pokemon_anime/pipeline/reference_index/sol/motion-peaks.jpg`

The index uses frame-wide color/value statistics, saturation, luma distribution,
edge energy, center/border contrast, vertical composition, color histograms,
MiniBatch K-means representatives, and non-maximum-suppressed adjacent-frame deltas.
This is a coverage/selection aid, not an artistic quality verdict.

## Selected visual craft references

### Creature silhouette, surface, and staging

- `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0066.jpg` — readable subject grouping against a lush, high-key ground plane.
- `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0353.jpg` — broad anatomical masses, overlap, weight, and non-spherical limb attachment.
- `/mnt/zer0models/pokemon_anime/keyframes/3-144RjSRWI/k_0144.jpg` — silhouette-breaking edge light and impact readability.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0434.jpg` — large-subject stadium framing with strong action diagonal.
- `/mnt/zer0models/pokemon_anime/keyframes/ZOSoQxSHKKE/k_0066.jpg` — close emotional action pose with readable face/hand direction.

Original-game translation: continuous torso-to-neck and limb-root forms; explicit
paws, joints, cheeks, eyelids, mouth planes, tail roots, and material breakup;
silhouette must survive at overworld camera distance.

### Route/world composition and atmospheric depth

- `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0326.jpg` — meadow density, foreground occlusion, bright foliage hierarchy.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0144.jpg` — layered cloud value groups and warm/cool sky rhythm.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0123.jpg` — autumn light, architecture/foliage balance, depth planes.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0477.jpg` — long-distance path scale and negative space.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0129.jpg` — soft sunlit exterior and character/environment value separation.

Original-game translation: authored foreground/midground/background landmarks;
curved route rather than a rectangular strip; clustered foliage species and scale;
soft aerial perspective; warm focal path against cooler shadow fields.

### Battle framing, attacks, hit reactions, and VFX

- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0445.jpg` — energy arc silhouette and directional value contrast.
- `/mnt/zer0models/pokemon_anime/frames/liZuy6ufYMs/f_0295.jpg` — arena light rhythm, scale, and crowd depth.
- `/mnt/zer0models/pokemon_anime/keyframes/3-144RjSRWI/k_0165.jpg` — blown-out attack apex with controlled silhouette loss.
- `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0118.jpg` — vortex/charge buildup with radial motion cues.
- `/mnt/zer0models/pokemon_anime/frames/ZOSoQxSHKKE/f_0290.jpg` — facial anticipation before impact.
- `/mnt/zer0models/pokemon_anime/keyframes/ZOSoQxSHKKE/k_0064.jpg` — reaction close-up, warm rim, clear eyeline.
- `/mnt/zer0models/pokemon_anime/keyframes/ZOSoQxSHKKE/k_0044.jpg` — multi-subject confrontation and foreground depth.

Original-game translation: anticipation → first attack frame → apex → contact →
recoil → settle; camera impulse tied to contact, not menu click; particles follow
attack direction and decay without hiding the subjects.

### Twilight lighting and soft GI target

- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0122.jpg` — warm backlight silhouette with interior bounce.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0300.jpg` — peach/violet sky and warm fur/hair edge response.
- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0337.jpg` — moonlit blue value grouping.
- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0314.jpg` — saturated arena practicals against a deep blue field.
- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0410.jpg` — cool rain/night key and hard rim separation.
- `/mnt/zer0models/pokemon_anime/frames/liZuy6ufYMs/f_0233.jpg` — restrained warm interior practical and skin bounce.

Original-game translation: warm low key plus cool sky fill; non-uniform exposure;
contact shadows under every subject; rough materials broaden highlights while wet,
eye, and water materials retain controlled specular response.

### Emotional starter/character ceremony

- `/mnt/zer0models/pokemon_anime/frames/3-144RjSRWI/f_0077.jpg`
- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0295.jpg`
- `/mnt/zer0models/pokemon_anime/frames/liZuy6ufYMs/f_0244.jpg`
- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0296.jpg`
- `/mnt/zer0models/pokemon_anime/keyframes/ZOSoQxSHKKE/k_0066.jpg`
- `/mnt/zer0models/pokemon_anime/frames/CIxj6cUMm7M/f_0241.jpg`

Original-game translation: one clear focal subject, visible eyes and pose, asymmetric
camera drift, motivated light, quiet negative space, and UI that supports rather
than covers the ceremony.

## Motion selection

High-change candidates inspected for locomotion/body mechanics, attack timing,
camera transitions, atmospheric motion, and emotional acting include:

- locomotion/creature weight: `3-144RjSRWI/k_0026.jpg`, `ZOSoQxSHKKE/f_0071.jpg`, `ZOSoQxSHKKE/k_0022.jpg`, `ZOSoQxSHKKE/k_0044.jpg`, `ZOSoQxSHKKE/k_0020.jpg`
- attacks/hit reactions: `3-144RjSRWI/k_0165.jpg`, `ZOSoQxSHKKE/f_0118.jpg`, `ZOSoQxSHKKE/f_0299.jpg`, `ZOSoQxSHKKE/f_0290.jpg`, `ZOSoQxSHKKE/f_0284.jpg`, `ZOSoQxSHKKE/k_0041.jpg`, `ZOSoQxSHKKE/k_0064.jpg`
- camera/transition choreography: `3-144RjSRWI/f_0448.jpg`, `3-144RjSRWI/f_0294.jpg`, `3-144RjSRWI/k_0077.jpg`, `CIxj6cUMm7M/f_0316.jpg`, `ZOSoQxSHKKE/f_0370.jpg`
- atmosphere: `3-144RjSRWI/f_0294.jpg`, `CIxj6cUMm7M/f_0273.jpg`, `CIxj6cUMm7M/k_0049.jpg`, `ZOSoQxSHKKE/f_0370.jpg`, `liZuy6ufYMs/f_0068.jpg`, `liZuy6ufYMs/k_0013.jpg`
- emotional acting: `3-144RjSRWI/f_0484.jpg`, `3-144RjSRWI/k_0022.jpg`, `3-144RjSRWI/k_0051.jpg`, `CIxj6cUMm7M/f_0283.jpg`, `CIxj6cUMm7M/f_0095.jpg`, `CIxj6cUMm7M/k_0081.jpg`, `liZuy6ufYMs/k_0037.jpg`

Adjacent-frame delta detects cuts as well as motion, so implementation timing must
be checked against sequential source frames around each candidate and against the
real browser recording, not inferred from a single peak image.
