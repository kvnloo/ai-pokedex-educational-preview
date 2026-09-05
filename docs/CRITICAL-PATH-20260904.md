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

Validation and exact revision evidence are appended after the committed runtime
run and independent review. This report does not certify full-game completion.
