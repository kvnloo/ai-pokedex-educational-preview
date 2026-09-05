# Pokédex generations: Kevin's addendum consumed

Root/Astra is the sole author of all Blender assets. Chief of Staff coordinates and inspects evidence only. The stopped worker's checkout and private files remain unmodified. Rejected hybrid v001 is an immutable historical asset, not an approved starting design. No push or merge without Kevin's approval.

Active lane: `.worktrees/pokedex-generations`, branch `codex/pokedex-generations`, based on committed `a12f2cc`. The earlier lane's unrelated uncommitted `public-pokedex` Vite configuration edit is preserved and not imported. The stopped lane remains at `0548c5b` with its original untracked files. Its scripts are copied verbatim to `tools/pokedex-generations/inherited-worker` solely for provenance; do not execute their hard-coded output writers against the original files.

## Candidate identity

- Board-01 is concept **v2**, family `concept-board01`, rooted at private `v002/astra-r01`. It retains the graphite interior, single large face button, notched upper bezel, silver exterior wedge and cyan lock.
- Board-02 is concept **v3**, family `concept-board02`, rooted at private `v003/astra-r01`. It retains the red interior, four-button cluster, red upper panel, split red/silver exterior lock and edge indicators.
- Concept version numbers do not mean Pokémon generation numbers. Neither board is silently assigned to Kanto or Johto. Ash's eight era devices are distinct families with their own anime references and selectable candidates.

## Reuse decision after inspection

| Existing artifact | Decision | Evidence and required work |
| --- | --- | --- |
| v001 hybrid source/GLBs/video | Rejected design; preserve untouched | Kevin rejected the hybrid. Snapshot records every existing file hash. Runtime checks do not override visual rejection. |
| Both original board JPGs | Reuse as strict references | Inspected both complete boards. They remain separate design contracts. |
| Worker `references.json`, fitted `contract.json`, camera helpers and overlays | Reuse as provisional calibration | Actual rigid camera fitting and separate control landmarks are useful. Worker IoU scores measure manual silhouette traces; they do not prove mechanical validity or all panel details. Re-render and inspect after geometry corrections. |
| `board01/static.blend` and `board02/static.blend` | Reuse layout studies only | Camera/screen/ring/control placement and distinct color blocking are retained as guides. Rounded slabs, surface-mounted fake vents/seams, oversized optical stacks and overlapping shell construction need replacement. |
| `board01/board01.blend` | Reject as accepted production source | Independent Blender evaluation finds 1,143 collapsed triangles, 24 objects without UVs and 19 non-manifold objects, including graphics/curves. Thirty-six NLA strips exist but there is no rendered playback evidence. |
| `board01/board01.glb` | Reject as runtime-ready | Actual JSON contains only Idle, ButtonPress, Opening, BootUp and Ready; Closed is absent. Twenty-four mesh primitives have no UVs. No texture images. The worker validation log is empty. |
| `board02/static.blend` | Reject as runtime-ready | 1,783 collapsed triangles, 20 objects without UVs and 16 non-manifold objects in evaluated geometry. No animated source, GLB or video exists for this variant. |
| Worker animation code | Replace | It scales physical ring geometry to imitate breathing and leaves emission constantly on; constant clip tracks were omitted on export. Use real hinge/control motion, emission signal tracks and explicit terminal samples. |
| `review.json` / `overlay-gate.json` accepted flags | Reject as authority; preserve historical claim | No inherited acceptance is promoted. Root supplies independent geometry, visuals, GLB reopening and rendered-video evidence. |

The audit loaded each .blend into its own Blender scene through MCP and did not save over the inputs. `canonical/devices/generations/inherited-audit.json` contains per-object measurements and sampled bounds. `intake-snapshot.json` records 869 v001 files, 135 stopped-worker private files and 13 source files. No animation videos were present in v002 at intake.

## Current scope and sequence

The Charizard S+ goal remains unfinished and preserved. The explicit Pokédex generation addendum takes current Blender priority. First deliver a two-candidate v2/v3 comparison batch, then build the eight Ash-era families in pairs. No more competing Blender authors or disconnected game products.

The pstack shared-state principle led to a fresh isolated lane rather than edits to either dirty checkout. Its domain-modeling principle separates era, device family, candidate revision, visual acceptance and collection unlocks so that a concept version cannot accidentally become an era or a reviewer flag become Kevin's choice.
