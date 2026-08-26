# Exact-build external trust root

Certification and private preview MUST start through `tools/verified-launcher.mjs` (or `tools/run-private-preview.mjs`) with two values copied from the reviewed task/revision, outside the served directory:

- `EXPECTED_MANIFEST_SHA256`: SHA-256 of the reviewed `dist/build-manifest.json`
- `EXPECTED_GIT_SHA`: the reviewed clean commit

The launcher rejects links and non-regular inputs, verifies the external manifest root before parsing it, requires the reviewed clean Git SHA, checks the exact file set and every byte hash, copies through exclusive names into a private read-only directory, and only serves files after rehashing each response. `/.well-known/launcher-receipt.json` exposes the external-root-bound receipt; each served response has `x-verified-sha256`. The browser certification harness requires the independently supplied expected manifest SHA and verifies both receipt and response bytes.

## Threat model and limitation

An already-running application cannot authenticate itself against an attacker that consistently replaces its manifest, entry, and assets. Runtime manifest checks are drift diagnostics only, not an immutable trust root. Authority is the expected SHA held outside the served tree and checked by the out-of-process launcher before any reviewed entry executes. Compromise of the launcher process, expected-root channel, OS/kernel, or reviewed source is outside this claim. The read-only directory protects against accidental same-user mutation, not a privileged attacker; certification retains the launcher receipt and exact reviewed values as evidence.

Example:

```text
EXPECTED_GIT_SHA=<reviewed-commit> EXPECTED_MANIFEST_SHA256=<reviewed-manifest-sha256> npm run preview:verified
node tools/browser-complete-loop.mjs --url http://127.0.0.1:5292/ --require-production --expected-manifest-sha256 <reviewed-manifest-sha256>
```
