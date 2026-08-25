# Assets as Code

## Objective

A fresh clone must be able to reconstruct the complete private local game without storing private official asset bytes in Git. Git is the control plane; `/mnt/zer0models` is the rebuildable private data plane.

## Profiles

### `private-local`

- May resolve lawfully sourced original Pokémon artwork and Kevin-supplied private sources.
- Never publishes, broadcasts or packages private official bytes.
- Requires hash-bound provenance and private storage.

### `distributable`

- Uses original or separately licensed stand-ins only.
- Must build without access to the private asset store.
- Is the only profile allowed for public previews, streams, PR artifacts or distributable bundles.

## Desired commands

```text
npm run assets:doctor
npm run assets:plan -- --profile private-local
npm run assets:bootstrap -- --profile private-local
npm run assets:build -- --profile private-local
npm run assets:verify -- --profile private-local
npm run build:private

npm run assets:bootstrap -- --profile distributable
npm run assets:verify -- --profile distributable
npm run build:distributable
```

One top-level command should eventually compose these steps:

```text
npm run recreate:private
```

It must be resumable and safe to rerun.

## Repository layout

```text
asset-iac/
  schema/
    source.schema.json
    recipe.schema.json
    lock.schema.json
  sources/
    pokemon-official-art.manifest.json
    twilight-reference.manifest.json
    owner-supplied-roms.manifest.json
  recipes/
    creatures/
    characters/
    environments/
    animation/
    effects/
    audio/
  graphs/
    kanto-pallet-pewter.json
  profiles/
    private-local.json
    distributable.json
  locks/
    tools.lock.json
    models.lock.json
    containers.lock.json
  scripts/
    doctor.*
    plan.*
    bootstrap.*
    build.*
    verify.*
  reports/                 # compact committed summaries only
```

Generated/private data belongs under:

```text
/mnt/zer0models/pokemon-iac/
  sources/                 # authorized source cache
  cas/                     # content-addressed immutable objects
  work/                    # rebuildable intermediates
  outputs/                 # generated private assets
  reports/                 # heavyweight logs/evidence
  models/                  # pinned model cache
```

The repository may expose a canonical symlink only after target verification. Destructive cleanup requires approval.

## Source manifest

Every source entry declares:

- stable `sourceId`;
- owner/provider;
- official/public URL or `owner-supplied` classification;
- expected digest and byte size when known;
- acquisition adapter and version;
- acquisition date and terms snapshot;
- private/distributable policy;
- required credentials by symbolic name only—never secrets;
- offline cache policy;
- drift behavior;
- replacement/takedown procedure.

If a source cannot be lawfully reacquired, bootstrap returns `OWNER_SOURCE_REQUIRED` with the expected hash. It must not search mirrors or bypass access controls.

## Asset recipe

Every generated asset declares:

- stable `assetId` and semantic role;
- source IDs and dependency asset IDs;
- profile eligibility;
- exact tool, model and container digests;
- prompt, negative prompt and seed;
- preprocessing and transforms;
- coordinate/unit/color-space conventions;
- output format and schema;
- deterministic hash when possible;
- otherwise a bounded perceptual/geometry acceptance envelope;
- GPU, VRAM, RAM, disk and time estimate;
- verification commands;
- safe fallback and failure policy.

## Reproducibility levels

1. Byte deterministic — output hash must match.
2. Structurally deterministic — topology, dimensions, IDs and metrics match; encoded bytes may differ.
3. Quality reproducible — stochastic generation may differ, but fixed prompts/seeds/tool digests plus critic thresholds and selection receipts reproduce an accepted-quality asset.

Never claim byte determinism for a stochastic or nondeterministic toolchain.

## Pipeline invariants

- Content-address sources and outputs.
- Pin every tool/model/container revision.
- Hash while ingesting; reject source mutation and symlinks.
- Publish CAS objects atomically and never overwrite corrupted objects.
- Persist checkpoints after each node.
- Reuse valid cached nodes; rebuild only invalidated descendants.
- Record lineage from final asset to every source and recipe.
- Keep generation and acceptance separate.
- Store heavy evidence on the 4 TB volume and compact signed summaries in Git.
- Run private-asset leak scanning before every distributable build.

## Fresh-clone acceptance test

In a disposable environment:

1. Clone the repository.
2. Run `assets:doctor`.
3. Provision tools/models using lock files.
4. Restore any explicitly owner-supplied, hash-matched sources.
5. Run the private asset graph from empty outputs.
6. Build and exercise the Kanto browser slice.
7. Compare deterministic hashes and quality envelopes.
8. Run the distributable profile without mounting private sources.
9. Prove no private hash/byte/URL leakage in distributable artifacts.
10. Preserve a machine-readable rebuild report with durations, cache hits, hashes, failures and resource use.

## Failure semantics

Fail closed on:

- missing or changed source terms;
- source hash drift;
- unpinned model/tool/container;
- unavailable owner-supplied input;
- nondeterministic output falsely declared deterministic;
- private bytes entering Git or distributable outputs;
- missing provenance;
- corrupted CAS objects;
- partial output represented as complete.
