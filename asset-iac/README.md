# Assets-as-Code control plane

Git contains only schemas, manifests, recipes, lock descriptors, orchestration, tests, and the small repository-original stand-in. Generated and private bytes live under `POKEMON_IAC_ROOT` (default `/mnt/zer0models/pokemon-iac`). The data root must be a real directory, never a symlink.

## Commands

```sh
npm ci
npm run assets:doctor -- --profile distributable
npm run assets:plan -- --profile distributable
npm run assets:bootstrap -- --profile distributable
npm run assets:build -- --profile distributable
npm run assets:verify -- --profile distributable
npm run build:distributable

npm run recreate:private
```

`recreate:private` is the one-command private recreation entrypoint after prerequisites and owner-supplied sources are restored. For this minimal graph it expects:

```text
$POKEMON_IAC_ROOT/sources/owner-supplied/pokemon-kanto-art.bin
sha256:2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881
bytes:1
```

The one-byte fixture hash is intentionally demonstrative and does not represent or acquire copyrighted art. If absent, the command exits with `OWNER_SOURCE_REQUIRED` and the exact hash/size. There is no network/mirror adapter for owner-supplied data.

## Guarantees and scope

- Linux-only secure ingestion uses `lstat`, `O_NOFOLLOW`, descriptor identity before/after streaming, source pathname revalidation, private same-filesystem temp objects, `fsync`, atomic hard-link create-if-absent publication, and full rehash of existing CAS objects.
- Source, terms, recipe, graph, profile, tool/model/container pins, and references validate before execution.
- Checkpoints bind canonical recipe/source inputs to output hashes. Missing, malformed, or changed output invalidates only that node; valid reruns are cache hits.
- Reports are written under `$POKEMON_IAC_ROOT/reports` with mode `0600`; data directories are `0700`.
- `distributable` selects only distributable sources/recipes and runs a private hash/path leak scan. It can execute against a new isolated root without mounting private storage.
- The synthetic transform is byte reproducible. The private receipt is only structurally reproducible. No quality-reproducible generation is claimed by this minimal graph.
- Lock digests identify the exact declared execution identities (`node-v26.4.0`, no-model transform v1, host-node/no-container v1); they are not falsely represented as downloaded binary or image digests.

Run `npm run test:assets-iac` for adversarial ingestion, corrupted CAS, pin, mutation, partial output, checkpoint, and permission coverage.
