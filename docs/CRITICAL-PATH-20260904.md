# Critical-path audit — 2026-09-04

Worktree: `pokemon-codex-astra-critical`, branch
`codex/astra-critical-path-20260904`, clean starting revision
`c7571a89c2799213cabf3777b6cd73fc8b7743c6`. The main checkout was not read,
modified, cleaned, stashed, reset, or merged. Worktree registrations were read
only. No applicable `AGENTS.md` exists in this worktree or its ancestor chain.
`docs/COMMUNITY-GAMEPLAY-DONORS.md` is absent, including the searched Git history;
the donor direction embedded in `prompt.md` and the full-goal document remains
binding. No donor content was acquired.

Durable evidence root:
`/mnt/zer0models/pokemon-iac/evidence/astra-critical-20260904/`.
`freeze.json` records HEAD, branch, clean status/diff/untracked state, worktree
registrations and storage (3.7 TB volume, approximately 1.6 TB used). The filtered
Kanban inventory is `kanban-freeze.json`; `gauntlet-lineage.json` records prior
task `t_9edaee6c`, its exact revisions and session lineage. Its completion claim
does not supersede current executable acceptance defects.

The `twilight-route` board reports empty, and task creation failed with an invalid
SQLite header. Older M1/M2 task IDs are unavailable from the accessible board.
The database was not repaired or replaced. This file is the local execution
record while that external coordination store is unavailable.

## Dependency decision

- M0: isolated revision and ship boundary reproduced; inherited private evidence
  manifest verifies 12 files. No private assets, ROMs or donor bytes added.
- M1: reopened by independently reproduced validator omissions. Fix chronology
  uniqueness and enforce validation in builds first, then repair active-version
  topology joins. No M1 milestone promotion from these bounded repairs alone.
- M2: existing objective browser run passes 21 checks, but source inspection
  finds distance-only location advancement and no persisted party. The standalone
  `CampaignEngine` replay tests do not prove the browser uses that journal.
  These remain acceptance blockers, as do unverified real touch/controller
  devices and the complete presentation bar.
- M7: not dependency-ready. No regional expansion or engine work begun.

## Slice 1 — chronology and build enforcement

Owner: Codex critical-path implementer; independent audit: `canonical_audit`.
Files: canonical validator/adversarial tests, build-gate test, Vite configuration,
package test entry and this report. No canonical facts or presentation changed.

RED: duplicate `(arcId, order)` was accepted, recorded in `slice1-red.log`.
GREEN: reject tied event orders within an arc and tied arc orders. Accept shuffled
records, revisits and arc-local numbering. Every production/private Vite build
executes the existing strict AJV, provenance, reference and generated-coordinate
gate before emitting a bundle. A failed gate cannot trigger the content-copy
close hook or mask its error. Four disposable-fixture build tests prove schema
and chronology rejection for both profiles without changing the real corpus.

Exact commit: `9577814c3ed2597d0ec2573c9c3612b944d4e070`. The independent
`slice1-independent-review.json` accepts the narrow repair. Its first production
run passed 68 checks and failed battle-entry latency (443.4 ms / 400 ms budget).
That run overlapped a build/check process. The fresh repeat without concurrent
test/build work passed 70/70 (198.9 ms). Both traces and all ten PNGs per run are
retained in `slice1-runtime/` and `slice1-runtime-r2/`. This does not establish
stable performance. The reviewer inspected genuine battle/reload output and
confirmed that reload returns to starter selection, not a restored party.

`slice1-committed-checks.json` binds successful schema/reference, adversarial,
build rejection, typecheck, build and ship checks to that commit. Battle (127),
campaign replay (6), field (10), encounter drought, private-canonical and
ship-boundary tests also pass. The additional asset-IaC suite failed closed
under system Node 26.7.0 because its lock requires 26.4.0; no pins were relaxed.

Computer-use attempts could not inspect the runtime: isolated-browser setup
exited before DevTools, and attachment to a dedicated headless process was
refused for missing launch-time profile authorization. No permission UI was
clicked or profile authorization bypassed. Browser interaction uses the existing
trusted Playwright harness and captures were visually inspected with `view_image`.
There is no computer-use acceptance claim, native-runtime claim, or DCC work.

## Slice 2 — versioned topology joins

RED: swapping Route 1 and Viridian Forest in the runtime path was accepted
(`slice2-red.log`). GREEN: require a directed active-version connection or warp
for each runtime transition, reject cross-version reciprocal and one-way warps,
reject ambiguous maps at the same version/location, and require normalized
edge displacement to agree with its named direction. Intentional same-version
one-way travel remains valid; backwards traversal is rejected. Anime event
ordering remains independent of topology.

Six real build-rejection fixtures now cover schema, chronology and topology in
both profiles. Canonical facts and generated outputs remain unchanged. Exact
revision, committed tests, runtime evidence and independent review follow.
Neither slice certifies full M1, M2 or full-game completion.
