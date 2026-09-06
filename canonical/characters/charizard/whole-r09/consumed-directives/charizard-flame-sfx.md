Kevin steer — apply as soon as this is read. Do not wait for a later pipeline stage.

TAIL FLAME IS NOT MESH.

The Charizard tail flame must not be modeled as connected geometry on the tail. It is runtime SFX / VFX (particles, additive volume, emissive sprite, or shader), not sculpted clay.

Do now:
- Separate any flame/fire volume from the physical tail mesh.
- Keep a small empty/socket at the tail tip (FlameSocket) as the only attachment.
- Physical GLB = body + tail tip only. energyBaked=false.
- Do not Hunyuan/sculpt glow, plasma, or fire blobs.
- Do not retopo or UV the flame as character topology.

This matches physical-asset + runtime-energy split. Continue component blockout + critic loop at xhigh. No merge/push.
