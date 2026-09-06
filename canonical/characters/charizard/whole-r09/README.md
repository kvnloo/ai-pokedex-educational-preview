# r09: physical tail and native horn study

Retained as an unfinished local study, not an accepted Charizard. Root is the sole Blender author. The xhigh critic only inspected images. Field OS on 8469 is unchanged; no merge or push.

Private source: `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r09/charizard-home-native-r09-horn-isolated.blend`. The matching GLB uses the same stem. Both were reopened. The current physical study has 345,177 vertices, 690,350 triangles, one mesh plus `FlameSocket`, and zero non-manifold edges. There are no materials, UVs, textures, rigs or animation clips. Self-intersections and deformation are not certified. This density is unsuitable for the final game asset.

The source is a full working-session checkpoint containing historic studies. It is not yet a clean component-only hero file. Private binaries and screenshots remain outside Git; `manifest.json` records their hashes. The final source and GLB are listed explicitly above so backups and rejected trials cannot be confused with the retained study.

## What changed

The raw official HOME-derived Charizard was copied through the GUI. Native Smooth strokes on the wings and Elastic Grab horn sweeps produced only small changes. Mechanical MCP work removed the connected fire volume, archived it in a hidden excluded collection, capped the physical tail, and added a parented `FlameSocket`. Its local +Z axis follows the cut normal. `energyBaked=false` survives GLB reopening. Actual runtime flame VFX remains pending.

The first native horn taper exposed neck geometry behind a screen-space mask. It was rejected and the complete pre-pinch checkpoint reopened. The retained second pass hid the body in Edit Mode before masking the skull and roots. Four native Pinch strokes at 80 px and strength 1 changed 1,041 vertices, with no movement in hidden or masked vertices and none below Z=.5. No script computed anatomical vertex positions.

Root inspected four fixed whole-body views and head closeups; the xhigh critic compared the matched before/after images. The taper is modestly better at whole-body scale. Rounded tips, shaft waviness, a taper shoulder and a shallow tip dent remain. The nose/jaw, hands, wing membranes and tail still need substantial work. See `adjudication.json` for retained and rejected artifacts.

## Evidence and continuation

- `flame-separation.json` and `glb-reopen.json`: initial physical-tail checks. Polygon count 690,294 differs from exported triangle count 690,350.
- `horn-isolated-native-delta.json` and `horn-isolated-reopen.json`: retained native change and round trip.
- `consumed-directives/` and `queue-consumption.json`: the four read-only SQLite notes applied during the active turn. Queue rows were not modified.
- `browser-study.json`: phone-sized inspector and desktop selector/image checks. These do not constitute S25 device or model-quality acceptance.

Mechanical helpers live in `tools/charizard-whole/*r09.py`. They do not replay native strokes. `separate_flame_r09.py` requires the untouched pre-separation intake and must not be rerun on the current mesh. Open the retained source in a separate MCP call before `export_horn_r09.py`: reopening and exporting in one callback invalidates Blender's UI context. All exports must specify both selection and active-scene scope. Never mutate shared review mesh data.

Native control lessons: verify the active brush after search/selection before sculpting; the first click may only leave the search field. `xdotool type` consumes following arguments as text, so terminate that command before subsequent keys. Allow mode changes to settle and inspect the actual state. Hide protected geometry before a screen-space mask when another surface lies behind the target.

Next: separate the head/neck, body, wings, tail and hard components into controllable components, preserving this whole-body rollback. Continue a bounded native shape correction, starting with muzzle/jaw or replacement horn construction. Do not repeat ineffective micro-strokes or advance to texture/rig work before the shape gate.
