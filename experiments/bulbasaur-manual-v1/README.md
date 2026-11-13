# Bulbasaur manual geometry E1/E2 handoff

This directory contains only original executable contracts and authoring scripts. Official and generated reference pixels, `.blend` masters, renders, ballots, and evidence remain under the private 4 TB root.

Private root: `/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur/production/manual-v1/`

Authority split:

- Official canonical artwork SHA-256 `7233d8d8b03b5fa91d835a3069d25769155db93c9ef91b6066e215ed3895e9d8` owns observed identity.
- Klein B SHA-256 `6701f463d21ae548d3ea69e6600339e7807f08c54e4c763805f0f89ad088f6ef` is a structural/style hypothesis only.
- Rear cranium, hidden far paws, full bulb radial continuation, torso depth, and vine socket placement are explicitly inferred with confidence labels in `landmark-contract.v1.json`.
- No Hunyuan, Tripo, Omni, Anima, Z-Image, or other generated mesh is imported or used as a shrinkwrap/copy source.

Hidden-anatomy diagrams (semantic, not pixel observations):

```text
SIDE (+X camera)                         REAR (+Y camera)
           inferred bulb apex [low]             /\  /\
             /\ /\                            /  \/  \
 head -->  (____)==== broad saddle ====       ( six radial ) [low]
           /    \                              (   lobes    )
  observed near paws  inferred far paw        L paw      paw R [medium]
---------- exact common ground ----------  ---------- exact ground ----------
```

Build each bounded hypothesis from factory startup:

`blender --background --factory-startup --python-exit-code 1 --python tools/build_bulbasaur_manual_v1.py -- --variant A --contract experiments/bulbasaur-manual-v1/landmark-contract.v1.json --out PRIVATE/hypothesis-A`

Repeat for `B` and `C`. Each build authors 55 named, closed components and emits 60 renders: 12 frozen roles for clay, flat albedo, component ID, wireframe, and grazing light. The builder is non-certifying. The pre-created reviewer task must freeze its ballot before reading `DECODE.private.json`, then return one E2 winner or `NO_WINNER`.

Scope stop: no retopo, UV, rig, animation, move, runtime, publication, or merge work is authorized before an E2 winner.
