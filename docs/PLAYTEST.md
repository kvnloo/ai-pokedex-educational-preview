# Playtest (Mode 3)

Headless exercise of the Wave-0 loop using the pure simulation.

## Run

```bash
npm run test:playtest
# or directly
node tools/playtest.mjs
```

## Current gates (playtest.mjs)

- Loads only `content/game/wave0.json` (original names)
- Starter selection works
- Explore tick + grass encounter
- Battle creation + turn execution without throw
- Catch attempt + outcome
- Heal pad + party heal
- No official Pokémon names leak into ship content

## Related

- `npm run test:battle` — golden damage vectors
- `npm run typecheck && npm run build`
- Visual bar: prompt.md modes 1/7 + docs/VISUAL-BAR.md (to be expanded)

Hard failures here must be fixed before any claim of "playable".
