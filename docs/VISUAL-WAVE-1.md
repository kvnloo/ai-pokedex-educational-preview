# Visual wave 1 acceleration report

## Scope

Base: independently approved browser M2 `7e01d16bbd7c5c1d58177d4abaa512600026d2e6`. This worktree is isolated from dirty `main` and native/M3 worktrees.

## Builder hypothesis

The largest reliability gap exposed before aesthetic iteration was that a mobile GPU context reclaim could permanently black the playable route, while the existing single-still capture could not exercise recovery or rotation. The builder added a visible, non-terminal context-loss path and product-specific evidence instrumentation without changing canonical data or gameplay rules.

## Fresh critic checkpoint

The fresh critic must review the frozen anonymous judgeset, the before/after motion, and this exact commit. Mechanical harness output does not certify visual target quality. Repair any critic blocker before approval; preserve all rejected artifacts.

## Acceleration measurement

Empirical Wave-1 run (`--frames=240 --seconds=8`, RTX 3080 Ti hardware-WebGL Chromium path):

- Six named desktop/mobile views were captured in one browser launch.
- One `gauntlet:capture` command replaced separate build, desktop capture, two phone rotations, pixel-integrity analysis, profiler distribution, mobile soak, context-loss exercise, hashing, and report assembly.
- End-to-end harness wall time was 27.341 seconds. Presented-frame distribution was p50 16.7 ms, p95 16.8 ms, p99 16.8 ms, max 16.8 ms; the exercised context emitted lost/restored/prevented = 1/1/1.
- Contact-sheet assembly is one deterministic command with six hash-bound inputs, public anonymous view IDs, and a mode-0600 sealed origin map.
- Compared with the prior one-still capture, one invocation now yields six viewport stills plus profile and resilience evidence. This removes at least seven separate harness invocations and makes a full first-pass packet practical in under 30 seconds; it does not claim to replace independent visual judgment or the longer release soak.

Evidence root: `/mnt/zer0models/pokemon-iac/evidence/t_1721c0b8-wave1`. Anonymous judgeset: `/mnt/zer0models/pokemon-iac/evidence/t_1721c0b8-judgeset`.
