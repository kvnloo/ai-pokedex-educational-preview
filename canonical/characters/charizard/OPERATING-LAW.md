# Kevin's Charizard operating law

Applies to the existing Astra Charizard lane. Root is sole Blender author. Preserve r03 and all subsequent rollback sources. No merge, push or publication. Kevin must accept the visual result before production texture, rig or animation work. Textures follow topology lock.

## Effort by stage

| Stage | Requested effort |
| --- | --- |
| Reference analysis and modeling plan | xhigh |
| Rough blockout | high |
| Proportion and silhouette comparison | xhigh |
| Sculpt and form refinement | xhigh |
| Small claws, nostrils and teeth after shape lock | high |
| Retopology and deformation topology | xhigh |
| Materials and simple Pokémon shading | high |
| Rig, weights and deformation debugging | xhigh |
| Bounded final inspect-everything audit | max |

Default: xhigh. Never begin with max or use it to compensate for a weak workflow. Requested effort is not proof of the live runtime setting; record actual configuration evidence separately.

## Shape gates

- Enormous pear-shaped abdomen; no muscular humanoid torso.
- Short, chunky, cartoonishly broad head; no realistic dragon skull.
- Thick, continuous S neck from chest to skull.
- Arms noticeably undersized relative to legs.
- Huge thighs, squat lower legs, oversized three-clawed feet.
- Visually enormous wings.
- Tail grows structurally from the pelvis.
- Separate wing membranes, spars and torso during construction.

Keep editable components: body, head/neck, wings, tail, eyes and hard parts. Do not construct or refine the character as one giant mesh. Use matched official-art views and whole-body silhouette checks after meaningful edits. Preserve rollback and reject regressions before details.

Kevin's subsequent decomposition addendum authorizes bpy construction and rendered inspection for the coarse blockout. Use simple separate meshes and explicit render/critique/repair cycles. Native CUA remains available for form correction; do not substitute a continuous scripted detail pass for visual evaluation. Tail flame is runtime VFX/SFX, never connected character geometry. `FlameSocket` and `energyBaked=false` remain part of the physical asset contract.

Immediate tail-flame rule: physical exports contain only the character's physical components and a small empty `FlameSocket` at the tail tip. No mesh, curve, volume or child geometry on that socket. Never generate, sculpt, retopologize or UV fire, glow, plasma or flame blobs as character topology. Flame visuals belong to a separate runtime particle, sprite, volume or shader effect. Check this at every physical export, not at a later pipeline stage.

Current priority: coarse component blockout and silhouette fidelity at xhigh. Independently control body, head/neck, wing membranes, wing spars, tail, eyes, and hard parts. Keep existing dense studies as rollback/reference candidates. No surface detail until proportions pass.

After every blockout revision render orthographic front, side, rear and three-quarter views. Explicitly audit silhouette, torso-to-head ratio, wing span, leg mass, arm length, head profile, neck thickness and tail attachment. Reference views that are missing remain unverified; do not label inferred views ground truth. Repair failed proportions before refinement. Repeat comparison checks before every major pipeline transition.

Progression: rough sculpt/blockout, form refinement, deformation retopology, topology lock, UVs/textures and rigging, explicit quality evaluation, redo failed stages. Kevin remains the visual gate. Use max only for a bounded major final or technical checkpoint once the character is unmistakably Charizard, never primitive placement.
