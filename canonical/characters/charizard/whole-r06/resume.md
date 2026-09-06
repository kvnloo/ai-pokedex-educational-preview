# Resume r06 Charizard work

The unbounded vertical-slice goal is active. Root/Astra is sole Blender author. Official Pokémon inputs only. No S+/AAA acceptance, promotion, merge or push. Fullscreen and physical Pokédex polish remain paused for the Field OS phone retest. Its browser repair is complete; do not rerun unchanged suites each goal turn.

## Frozen study

Asset milestone `9f63353d9ae8e94f49fe2d4050ebbd3a6f3c9ad9`. Independent script/receipt review found no remaining precommit blocker.

Lane `/mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/charizard-anatomy`, branch `codex/charizard-anatomy`.

Private root `/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r06`.

- `charizard-whole-r06-study.blend`: 28,901,243 bytes, SHA256 `93f96697cb9ce4e5f8f8214c1ee4e11a9d97df1d8c52086174bcbfaaf6fb08e6`.
- `charizard-whole-r06-study.glb`: 7,082,744 bytes, SHA256 `1eb2b7e113f5d2d198f5cc50609882341e174ed8c0aa522422338d3516a65dc7`.
- Four meshes, 148,364 vertices, 296,720 triangles. Source and GLB reopened, eight GLB renders inspected. No textures, rig, clips, attacks or game integration. Neck-region intersection audit is limited; see `review.md`.

Retain the shorter muzzle, three-degree jaw closure, small lip cleanup and linear neck bridge as study gains. Fitted eyes are visible but gaze and lids fail. Exact Boolean neck union and default curved bridge were rejected and preserved. r03 remains the previously frozen overall candidate. The r04 primitive face remains rejected. Do not alter frozen sources.

## Native Blender state

Owned PID2418389, port9876, DISPLAY=:1, Xwindow10485762. Focus via `hyprctl dispatch focuswindow pid:2418389`; screenshot rectangle `3012,509 1896x979`. Do not touch other Blender processes. Every MCP call uses exactly:

`Use actual Blender GUI computer use and manually sculpt/model/retopologize the entire character wherever that is the fastest path.`

Read MCP output before dependent GUI input. Tool `isError:false` can contain execution errors. Native GUI delivery is not operation completion; poll resulting geometry before repeating an action. Push native undo after MCP preparation and inspect mode after undo.

Working scene `EDIT-charizard-whole-r06`, Object Mode. Global filepath still points to frozen r04-focused source. NEVER Ctrl+S. Save new scene-only libraries at new paths. Current working and export scenes remain loaded alongside r04/r05; verification and intake scenes were removed after inspection. Do not reconstruct the 94-scene memory problem.

Visible asset objects:

- `GEO-charizard-neck-bridge-r06`, 137,700 vertices / 275,404 triangles. Native polygon count258313. Identity matrix. `Bridge_Linear_r06` value1 is required; Basis contains the rejected curved bridge.
- `GEO-charizard-eye--1-whole-r06` and `GEO-charizard-eye-1-whole-r06`, each3074 vertices /6144 triangles, `Fit_RawHead_r06` value1. Provisional vertex colors, no final eye material.
- `GEO-charizard-flame-whole-r06`,4516 vertices /9028 triangles. Render visible, possibly viewport hidden.

Preserved and hidden: body `GEO-charizard-body-whole-r06`, raw head `GEO-charizard-raw-head-r06`, rejected Boolean `GEO-charizard-body-joined-r06`, mouth cutter. Raw-head active key `Refine_LowerLip_r06` value1 includes preceding muzzle/jaw changes. These are source parts, not a finished rig.

Head frame origin `(-.085,-.77,.49)`, side `(-.8660254,.5,0)`, forward `(-.49446818,-.856444,.14834046)`, up `(.07417023,.12846661,.98893636)`. Raw-head matrix carries this frame. Joined body is in world coordinates. Recorded bridge polygon indices precede the final one-face triangulation.

## Next useful work

Compare the untouched HOME61061 head with illustration61062 under dedicated head cameras before committing to more edits of the current face. HOME has not lost a fair head comparison. Illustration61062 was selected earlier for wings/toes. Then correct forward gaze and eyelid seating, the artificial mouth curve and hanging jaw, nasal shape, horns and inherited rear-head bumps. Whole-body tail, hands, feet and wings plus all finish/deformation work remain.

HOME GLB: main workspace `assets/experiments/charizard-home-raw/charizard-home-raw-61061.glb`, SHA256 `69287dfd7f7f2e6a5bcf8c2b7281c08fe4a14c1b086f3d6e7eb7e8f0f96d83dd`, original364846 vertices /729692 triangles. Input `assets/references/objects/ff/ffe2db1065f91feda24f21c81c461e4ca6b863cf31afb4e4918aba79fb31ee70.png`.

Illustration GLB: main workspace `assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb`, SHA256 `f9f0b2c3f2e189dcdd1c72190e8c79b7b958a2dd4f3bacb2d844ec37b330ed8e`. Input `assets/references/objects/b6/b6d5b8ee9fb05dc6f53294b2cae660dec770b92762cdb19d16bcbd679e1ba43a.png`.

`checkpoint.json` hashes98 files including intermediate captures, rejected sources, final source/GLB and browser evidence. Scripts are staged operator recipes that require their documented transitional Blender state, not an unattended one-command replay. `review.md` records inline operations, GUI/mode observations, causal limits and known failures.

## Preview and other scope

Comparison: https://0.taila30dc.ts.net:8445/devtools/experiments.html?pokemon=charizard&a=charizard-whole-r06-intake&b=charizard-whole-r06&view=head-threequarter

Individual study: https://0.taila30dc.ts.net:8445/devtools/pokedex.html?pokemon=charizard&tab=iterations&run=charizard-whole-r06&view=head-threequarter

The older `/devtools/` route is the Reference desk and discards the iteration selection. Use `/devtools/pokedex.html`. The verified route decodes all eight views; real-device/layout acceptance is not established. Human reviews and Field OS8469 were unchanged by r06.

Restored Field OS: https://0.taila30dc.ts.net:8469/pokedex.html

Implementation `fa975753269125aebcf471a04515664b90d7fc7c`, release `f85e3ae295feec02`, repair lane HEAD `44218507331caf4b12930ce041d45b57828b9feb`. All six species entries/images, Pidgey scan/registration, Research/Map/Party/Tools/Home and persistent controls passed browser checks at412×892. Published18file hashes matched. Actual installed S25 touch/audio/GPU acceptance remains Kevin's gate. Correct Home says `BROWSE POKÉMON ·6ENTRIES`. Old installed SW may persist until an online load and closure of app plus all8469tabs. Do not clear user data.

Hermes Telegram target1083429746. r03 delivery16979 succeeded previously. Prior Field OS delivery exited143 with empty receipt and remains unconfirmed; do not blindly retry. r06 preview delivery succeeded with exit0, success:true, Telegram message17015, mirrored:true. See delivery.json. Do not resend this preview automatically.

Physical device roadmap remains board01=v2 and board02=v3, with distinct generation assets and story unlocks. Preserve stopped-worker artifacts and v001. No physical-device acceptance or new polish during the phone retest gate.
