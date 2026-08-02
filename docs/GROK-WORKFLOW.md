# Grok-native workflows for this repo

This project does **not** use Claude “gauntlet loop” folklore as the execution engine.
Quality waves run through **Grok Build workflows** (deterministic Rhai orchestration +
child agents). Source of product truth remains `prompt.md`.

## What Grok workflows actually are

| Piece | Where | What it does |
|---|---|---|
| Workflow script | `.grok/workflows/<name>.rhai` (project) or `~/.grok/workflows/` (user) | Deterministic orchestrator: `phase` → `agent` / `parallel` → `complete` |
| Authoring skill | `~/.grok/bundled/skills/create-workflow/SKILL.md` | Full Rhai host API reference |
| Launch | In a `grok` session: `/workflow <name> {json args}` | Background multi-agent run |
| Dashboard | `/workflows` | Live phases, agent roster, pause/resume/stop |
| Headless | `grok -p '/workflow <name> …' --cwd <repo>` | Same, from shell |
| Agent budget | `agent_budget` 1–1024 (default 128) | Cap on logical child `agent()` + `parallel` slots |
| Goals | `/goal` | Separate path (token budget, not agent-count budget) |
| Session loops | `/loop [interval] <prompt>` | Recurring single-session wakeups, not fan-out |

### Host API (subset used here)

- `agent(prompt, #{ label, capability_mode, output_schema, agent_type, model, isolation_worktree, resume_from })`
- `parallel([ #{ prompt, label, … }, … ])` — barrier; admits as one unit against budget
- `phase(title)`, `log(msg)`, `complete(value)`, `pause` / `await_user`
- `budget()` → `{ total, spent, reserved, remaining }`
- `write_scratch_file` / `read_scratch_file`, `git_diff_since`, `fingerprint`, `json_encode`
- `args` — launch JSON object (or `()`)

Control flow must be pure from `args` + host results (no wall clock / RNG in script).

### Effort model (critical)

| Layer | How effort is set |
|---|---|
| **Session orchestrator** (you / outer `grok`) | `/effort high` or `grok --effort high` — keep high for planning |
| **Workflow children** | (1) prompt preamble `REASONING EFFORT: minimal` (2) project personas with `reasoning_effort = "minimal"` |
| **CLI levels** | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` |

**This repo pins every workflow child to `minimal`.** Do not raise child effort inside
worker prompts. Personas live in `.grok/personas/`:

- `min-worker.toml` — implement / measure / land
- `min-audit.toml` — read-only audits
- `min-critic.toml` — blind / harsh critique

Personas set `reasoning_effort = "minimal"`. Prompts still lead with the same line so a
child that resolves without a persona stays cheap.

> Note: Grok docs say the parent does not pass a persona name on `spawn_subagent`;
> resolution is role/persona config driven. Workflows therefore **always** inject the
> minimal preamble in every `agent()` prompt (COD `ultracode-wave` pattern), and we keep
> personas for any interactive / Task-tool spawns that resolve them.

## Standard quality wave (pokemon)

Saved as `.grok/workflows/ultracode-wave.rhai` (adapted from COD).

```text
/effort high
/workflow ultracode-wave {"max_rounds":24,"max_packages":4,"blind_votes":3}
# model/tool launch may pass agent_budget: 256–1024
```

Phases per round:

1. **Measure** — playtest + screenshots (modes 3 + 1)
2. **Audit** — parallel category auditors A–G (read-only, minimal)
3. **Synthesize** — disjoint file-owned packages
4. **Fix** — one child per package (read-write/execute, minimal)
5. **Land** — typecheck + re-measure
6. **Critique** — category critics + mode-7 double-blind vs Twilight Wings stills
7. **Loop** — stop only when blind panel prefers us (playtest green is necessary, not sufficient)

Watch progress: `/workflows`.

## Hermes session note

This Hermes chat is **not** the Grok workflow runner. From Hermes:

1. Author/edit `.rhai` + `prompt.md` + game code here.
2. Launch waves with `grok` against `/home/kvn/workspace/zer0/products/pokemon`.
3. If Hermes `delegate_task` is used as a stopgap, every child prompt must start with
   `REASONING EFFORT: minimal. TOKEN-MIN. Tools > talk.` — Hermes has no first-class
   effort pin equivalent to Grok personas.

## Do not

- Invent Claude-only gauntlet flags or assume nested subagents (Grok depth = 1).
- Set child effort to high/xhigh/max inside a wave.
- Claim quality from stills alone (see `prompt.md` verification doctrine).
- Ship Twilight Wings frames or Nintendo assets in the product tree.
