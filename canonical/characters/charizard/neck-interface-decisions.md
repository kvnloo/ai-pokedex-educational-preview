# Neck interface experiment decisions

Retained source: whole-r38/charizard-hybrid-r38-bilateral.blend. No neck fix has passed.

| Trial | Controlled change | Observed result | Decision |
| --- | --- | --- | --- |
| R39 | Native terminal-face extrusion .035; original96 neck vertices fixed | Upper step persists; new front lip beneath chin | Reject; no cap-extension amplitude loop |
| R40 | Jaw4/7 only: localX .85, localZ +.015 | Minor underside change; no clear step reduction | Reject; no further corner nudges |
| R41 | Duplicate jaw+neck, subdivision3 conversion, voxel .003, masked Smooth50 then90 | Thick projecting jaw band persists; underjaw ripples and rough mouth rim | Reject; no more smoothing on this source |

Evidence lives in each trial directory. R41 masks held fully protected vertices fixed (maximum displacement0), so inadequate visible improvement cannot be described as a failed mask application. The initially requested90px brush setting failed; first stroke used verified prior50px, later corrected via sculpt.unified_paint_settings to90px. The two strokes must remain separate experimental events.

The next hypothesis must address actual jaw-throat surface continuity while preserving mouth rim and chin projection. It must not merely repeat cap embedding, corner adjustment or voxel smoothing with another amplitude. Existing evidence does not prove an optimal replacement method. Keep the upper skull, body, eyes and horns independently editable.

Tool execution lesson: Blender MCP can return isError=false while its text says Error executing code. Inspect the content before dependent CUA edits; do not batch a setting mutation and dependent stroke without checking its result.
