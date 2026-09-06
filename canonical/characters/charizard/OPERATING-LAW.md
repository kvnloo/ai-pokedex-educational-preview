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

Continue the hybrid method: native CUA anatomy/form edits; MCP/bpy for bounded mechanical checkpoints, cameras, component separation, sockets and export verification. Tail flame is runtime VFX/SFX, never connected character geometry. `FlameSocket` and `energyBaked=false` remain part of the physical asset contract.

Current priority: component-wise head and silhouette fidelity at xhigh. Production materials, rigging and animation are gated, not the next milestone.
