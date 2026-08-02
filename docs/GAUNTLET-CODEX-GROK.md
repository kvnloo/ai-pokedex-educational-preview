# Gauntlet-level quality without Claude Code

You are out of Claude tokens. The quality bar people associate with “Claude Code
gauntlet loops” is **not Claude-specific** — it is a *process pattern*. Your machine
already has the right primitives on **Codex (Sol Advisor)** and **Grok Build**.

## What the viral Claude gauntlet actually is

Matt Shumer’s pattern (somethingbig.ai/gauntlet-loop), stripped of brand:

1. **Hard goal + real reference bar** (not “make it nice”).
2. **Lead architect** decomposes; does not implement everything.
3. **Builder subagents** own disjoint slices (worktrees / file ownership).
4. **Blind harsh critic** — never the builder grading itself; side-by-side vs reference.
5. **Loop until critic prefers US** — playtest green is necessary, not sufficient.
6. **Hours/overnight**, not one shot. Force “no good enough / no stop early.”

Claude Opus was just the first host that stayed stubborn for long enough.

## Your stack → same pattern

| Gauntlet role | Claude Code | **Your substitute** |
|---|---|---|
| Lead architect | Opus session | **Grok Build session `/effort high`** *or* **Codex Sol primary high** |
| Routine builders | Subagents | **Codex Luna (max)** *or* Grok `agent()` children **minimal** |
| Hard builders | Subagents | **Codex Terra (max)** *or* Grok execute children |
| Blind critic | Separate subagent | **Codex `sol_advisor_sol_reviewer`** *or* Grok critic panel + mode-7 |
| Deterministic multi-hour loop | Chat “keep going” | **Grok workflow `.rhai`** (`ultracode-wave`) — *this is the moat* |
| Measurement | Screenshots / play | `tools/playtest`, `tools/capture`, real GLB A/B |

### Prefer Grok workflows for overnight grind

Claude’s advantage was *persistence*. Grok’s advantage is **Rhai workflows** that
cannot politely stop after three rounds:

```text
# in repo (after ultracode-wave.rhai is copied/adapted)
cd /home/kvn/workspace/zer0/products/pokemon
grok   # session: model high effort
/effort high
/workflow ultracode-wave {"max_rounds":48,"max_packages":4,"blind_votes":3}
# agent_budget 256–1024
# watch: /workflows
```

Rules already in COD’s `ultracode-wave.rhai` (reuse for pokemon):

- Source of truth = `prompt.md` (modes 1–7, categories).
- Children: **low/minimal** effort (token-min workers).
- Orchestrator session: **high**.
- Stop only when **mode-7 double-blind** prefers US — never on playtest alone.
- Disjoint package file ownership every wave.

Copy COD’s workflow into this repo and retarget references (TW stills, dex, battle):

```bash
cp /home/kvn/workspace/zer0/products/cod/.grok/workflows/ultracode-wave.rhai \
   .grok/workflows/ultracode-wave.rhai
# then edit: product name, measure cmds, visual refs → TW keyframes
```

See also `docs/GROK-WORKFLOW.md` and personas in `.grok/personas/` (`reasoning_effort = "minimal"`).

### Prefer Codex Sol Advisor for commitment boundaries + implementation volume

When you need **human-grade architecture decisions** or **feature packages** mid-day:

```bash
cd /home/kvn/workspace/zer0/products/pokemon
codex exec --sandbox danger-full-access \
  -c model="gpt-5.6-sol" -c model_reasoning_effort="high" \
  'CONFIRMED: primary is Sol/High.
   Use $sol-advisor:orchestration.
   <five-part goal>
   Spawn Luna for routine, Terra for hard, Sol reviewer before done.'
```

Lanes (already installed):

| agent_type | model | effort | use |
|---|---|---|---|
| `sol_advisor_luna_implementer` | gpt-5.6-luna | max | CRUD, wiring, sync tools |
| `sol_advisor_terra_implementer` | gpt-5.6-terra | max | battle formulas, mesh pipeline |
| `sol_advisor_sol_reviewer` | gpt-5.6-sol | high | fresh ship \| fix-first \| rethink |

Sol orchestration **requires** companion preflight:

```bash
sh ~/.codex/.tmp/marketplaces/sol-advisor/plugins/sol-advisor/scripts/install-agents.sh --check
```

If the skill asks “confirm Sol/High”, answer in the prompt:  
`CONFIRMED by operator: CLI set model=gpt-5.6-sol effort=high.`

### Hermes role (this chat)

Hermes is the **meta-orchestrator**: downloads, Hunyuan kicks, sync tools, spinning
Codex/Grok, synthesizing Sol verdicts for you. Do not ask Hermes alone to be the
overnight gauntlet — its `delegate_task` is leaf-depth-1 and not a 48-round workflow.

## Anti-patterns that kill “gauntlet quality”

1. **One agent implements and self-reviews** — always split builder ≠ critic.
2. **Stills-only loops** — COD lesson: photographs well, unplayable. Use playtest + A/B.
3. **“Good enough” early exit** — ban it in prompts and encode stop conditions in Rhai.
4. **High effort on every child** — burns tokens; keep workers minimal, architect high.
5. **Overlapping file ownership** — two fixers thrash the same path.
6. **No numeric gates** — if you can’t measure it, you can’t loop it.

## Recommended operating mode for Twilight Route

| Cadence | Engine | What |
|---|---|---|
| **Day / attention** | Codex Sol + Luna/Terra | Architecture, dex UI, battle slice packages + Sol review |
| **Night / volume** | Grok `ultracode-wave` | Measure → audit → fix → blind A/B vs TW stills |
| **Mesh A/B** | Hunyuan API + img2threejs | One hero species at a time; pick winner with Sol critic |
| **Meta** | Hermes | Kick jobs, keep docs honest, surface blockers |

## Minimal “gauntlet prompt” you can paste into Grok or Codex

```
Build Twilight Route to the visual bar of Pokémon: Twilight Wings and the
mechanics cadence of modern Pokémon games. Source of truth: prompt.md.

Process (non-negotiable):
1. Decompose into disjoint packages with owned files.
2. For each package: implement → measure with the mode that would expose failure
   (play / motion / still / typecheck — see prompt.md modes 1–7).
3. Spawn a BLIND critic that has not seen builder reasoning. Critic does labels-hidden
   A/B vs TW keyframe stills (and playtest gates). Builder never self-grades.
4. Loop until critic prefers US. Playtest green alone is NOT exit.
5. Do not stop early. No “good enough.” Fan out subagents. Children = minimal effort.
6. Report: measurements, packages, critic votes, remaining fails.
```

## Bottom line

You do **not** need Claude for gauntlet quality. You need:

- **Grok workflows** for relentless multi-hour loops (already proven on COD), and  
- **Codex Sol Advisor** for architect + Luna/Terra volume + independent Sol review.

Claude was the demo host. Your factory already has the better overnight engine.
