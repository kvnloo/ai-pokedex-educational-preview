Kevin addendum — apply now in the existing Charizard Astra/Blender lane. Do not start a competing thread. Do not treat this as a new product.

Public Astra character examples reinforce: decompose first. One posted workflow generated separate head, hair, and body, then assembled/corrected in Blender. Higgsfield-style pipeline: model creation → retopology → UVs → rigging → explicit quality evaluation → redo if the gate fails.

For Charizard, independently controllable blockout components:
- body
- head-neck
- wings (membrane separate from spars)
- tail
- eyes
- claws / horns / teeth

More important than Max: a critic loop. Do NOT do a single continuous modeling pass. Do NOT just “model Charizard accurately from this picture.”

Blender Studio character-design guidance: early phase = proportions and overall appearance, rough blocks/blobs, no detail. Organic characters that will deform: rough sculpt → refinement → retopology.

Astra can operate Blender via bpy and inspect preview renders. Use that.

Instruction for the current xhigh work (default ~80% of the project):

Reconstruct Charizard faithfully rather than designing your own dragon. Treat the supplied official references as ground truth. First create only a coarse blockout using simple separate meshes. Do not add surface detail. Render orthographic front, side, rear, and three-quarter views. Compare each render against the references and explicitly audit silhouette, torso-to-head ratio, wing span, leg mass, arm length, head profile, neck thickness, and tail attachment. Correct the blockout until those proportions are convincing before proceeding. Only then refine the forms. Preserve Charizard's stylized Pokémon anatomy rather than introducing realistic reptilian or humanoid anatomy. Keep wings, claws, horns, eyes, teeth and other structurally distinct elements separate where useful. Before every major pipeline transition, render comparison views and correct visible discrepancies.

Only after the model looks unmistakably like Charizard, switch Astra to max for a bounded checkpoint:

Perform a final reference-fidelity and production-readiness audit. Inspect the model from all major viewpoints, identify discrepancies in silhouette and volume before looking at minor details, fix them, then inspect topology, shading and intersections. Repeat render → critique → repair until additional passes produce no meaningful improvement.

Do not burn Max while placing primitive spheres for the thighs. Launch demos are not proof that one-shot reconstruction is solved. Strongest pattern: decomposition + multiview reference + explicit quality gates + iterative renders.

xhigh for ~80% of the project. Max only for major final/technical checkpoints.

Preserve rollback checkpoints. No merge/push/publication. Textures after topology lock. Kevin remains visual gate.
