# Mesh pipeline (Wooloo-class / anime plate → GLB)

Media and generated meshes for the Pokémon anime A/B path live **only** under:

`/mnt/zer0models/pokemon_anime/`

Do **not** copy official Twilight Wings (or other copyrighted) frames into `products/pokemon/public`. The web app should import meshes via a local pointer/symlink or build-time copy of **derivative GLBs** only, never source plates.

## Layout

| Path | Role |
|------|------|
| `frames/<videoId>/f_XXXX.jpg` | Extracted frames |
| `keyframes/<videoId>/k_XXXX.jpg` | Keyframes |
| `pipeline/ab_test/wooloo/ref/` | v1 plates (contaminated: person/hands → boxy Hunyuan) |
| `pipeline/ab_test/wooloo/ref_v2/` | v2 subject-only plates |
| `pipeline/ab_test/wooloo/hunyuan/` | Shape GLBs |

## Best Wooloo plate (v2)

- **Primary:** `/mnt/zer0models/pokemon_anime/pipeline/ab_test/wooloo/ref_v2/wooloo_solo_v2.png` (640²)
- Also: `wooloo_plate_512.png`, `wooloo_plate_640.png`, `wooloo_plate_768.png`
- Source: TW Ep2 *Training* `ZOSoQxSHKKE` frame `f_0384.jpg`, tight crop, trainer removed, plain bg
- Provenance: `ref_v2/SOURCE.txt`

## Regen path

1. **Plate** — solo creature, 512–768 square, plain/extended background, no hands/people/props.
2. **Hunyuan shape-only** (API `http://127.0.0.1:8081`, health `/health`):

```bash
# from products/pokemon
bash tools/hy3d_generate.sh \
  /mnt/zer0models/pokemon_anime/pipeline/ab_test/wooloo/ref_v2/wooloo_solo_v2.png \
  /mnt/zer0models/pokemon_anime/pipeline/ab_test/wooloo/hunyuan/hero_v2_shape.glb \
  0
```

3. **Decimate ~8k faces** (Blender; pattern from `tools/decimate_glb.py`):

```bash
blender --background --python /tmp/decimate_hero_v2.py
# or edit tools/decimate_glb.py src/dst paths then:
# blender --background --python tools/decimate_glb.py
```

Outputs:

- Raw: `.../hunyuan/hero_v2_shape.glb`
- Decimated: `.../hunyuan/hero_v2_shape_8k.glb`

4. **Import into app (pointer only)** — example:

```bash
# derivative mesh only — never TW frames
mkdir -p public/ab
ln -sfn /mnt/zer0models/pokemon_anime/pipeline/ab_test/wooloo/hunyuan/hero_v2_shape_8k.glb \
  public/ab/wooloo_preview.glb
# or copy at build time from the same path
```

## Failure mode to avoid

v1 `wooloo_plate_768.png` included a person holding Wooloo. Hunyuan filled volume (`volume_ratio ~0.97`) → useless box mesh `wooloo_shape.glb`. Always strip non-subject pixels before shape gen.

## Identity / licensing note

Official Twilight Wings frames and crops stay under `/mnt/zer0models`. `products/pokemon/public` may hold only generated/derivative assets (GLB, non-official placeholders) referenced by path pointer.
