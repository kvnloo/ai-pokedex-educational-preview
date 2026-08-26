# Pokémon browser visual rubric

Score every named view independently from 0–10. A passing wave requires: no hard failure; candidate beats the frozen prior on at least four categories; no category regresses by more than 0.5; total improves by at least 3 points; and the fresh non-builder critic returns `PASS`.

| Category | Weight | 0–3 | 4–6 | 7–8 | 9–10 |
|---|---:|---|---|---|---|
| Canonical identity readability | 20 | generic/incorrect | named silhouette only | species readable in pose and materials | instantly readable across all vantages |
| Route composition and destination | 15 | empty/confusing | path exists | layered route with readable goal | authored depth and persistent landmark continuity |
| Creature grounding and scale | 15 | floats/clips | contact weak | planted and proportionate | weight, contact, and scale survive motion |
| Twilight lighting and materials | 15 | flat/crushed | functional | warm/cool separation and material response | controlled cinematic hierarchy without washout |
| Motion and camera continuity | 15 | rigid/jitter/cuts | mechanically legible | weighty locomotion and stable follow | anticipation, parallax, and authored settle |
| HUD and mobile legibility | 10 | blocks subject/unreadable | usable one viewport | clear at desktop and phone rotations | hierarchy remains elegant under stress |
| Battle/event payoff | 10 | text-only | generic flash | readable anticipation/contact/recoil | staged event with causal visual aftermath |

Hard failures: black/partial frame; invalid resize buffer; placeholder or wrong identity; hidden critical HUD; page error; gameplay/canonical regression; context restoration failure; evidence not bound to the exact commit; or origin leakage in an anonymous judgeset.

A technical green run is not a visual pass. Motion/camera and battle payoff require recorded motion; settled stills can score only the other categories. Candidate-vs-prior and candidate-vs-target are separate verdicts.
