# AI Pokédex — Educational Capability Study

> **Unofficial, non-commercial educational experiment.** This repository explores what contemporary AI-assisted tools can and cannot do when used for interface prototyping, visual analysis, reference organization, and experimental 3D reconstruction.

## Purpose

This project exists to study and document AI capabilities and limitations. It is a personal learning artifact and technical demonstration—not an official product, commercial game, replacement for any original work, or claim of ownership over Pokémon intellectual property.

The project specifically explores:

- AI-assisted interface and interaction prototyping;
- retrieval, organization, and comparison of visual references;
- provenance-aware experiment records;
- image-to-3D reconstruction and the errors produced by single-view inference;
- human review of AI-generated outputs;
- reproducible web deployment through GitHub Actions;
- the gap between a visually plausible AI output and a production-ready asset.

Outputs are presented as experiments, not authoritative depictions. AI-generated or AI-assisted material may be inaccurate, incomplete, anatomically inconsistent, stylistically derivative, or otherwise unsuitable for production.

## Intellectual-property and affiliation notice

Pokémon, Pokédex, Charizard, related character names, designs, imagery, lore, and trademarks are the property of their respective rights holders. Pokémon is associated with Nintendo, Game Freak, Creatures, and The Pokémon Company.

I do **not** claim to own those characters, names, designs, trademarks, source artwork, game data, or other third-party intellectual property. Any third-party material shown or referenced remains the property of its respective owner and is used here only as limited subject matter for education, commentary, technical analysis, comparison, and experimentation.

This repository is:

- unofficial;
- fan-made;
- non-commercial;
- not sponsored, approved, licensed, or endorsed by Nintendo, Game Freak, Creatures, The Pokémon Company, or any other rights holder;
- not offered as a substitute for official games, artwork, databases, merchandise, or media;
- not intended to imply authorship, ownership, partnership, or affiliation.

The presence of a source citation, disclaimer, or educational purpose does not transfer ownership, create endorsement, or automatically determine whether a particular use is legally permitted. Rights holders may request review or removal of material they own.

## AI disclosure

AI tools assisted with portions of the research, code, interface design, image experimentation, and 3D-reconstruction workflow. Human direction, selection, testing, and review remain part of the process. This repository does not present AI outputs as handmade official artwork or as work created by the original Pokémon artists.

Where experiments use an official reference image, the intent is to observe model behavior and failure modes—not to reproduce, sell, or pass off the reference as original work. Generated artifacts should not be interpreted as licensed assets.

## Public preview scope

The GitHub Pages build is intentionally narrow and read-only:

- one Charizard record;
- one attributed official HOME image obtained through the public PokeAPI sprite repository;
- a mobile Pokédex interaction prototype;
- no account system, monetization, advertising, analytics, or user uploads;
- no downloadable mesh archive in the public build;
- no claim that the visual presentation is an official Pokédex.

The broader local research workspace may contain private experiment data and generated artifacts that are deliberately excluded from this public repository.

## Data and image sources

Species facts are derived from [PokéAPI](https://pokeapi.co/). The displayed HOME image is referenced from the public [PokeAPI sprites repository](https://github.com/PokeAPI/sprites). Those projects have their own terms and provenance; inclusion here does not imply that they endorse this experiment.

## Responsible use

Do not use this repository or its outputs to misrepresent official provenance, impersonate a rights holder, train or distribute a commercial character-asset pack, or sell third-party intellectual property. If you build on the technical patterns, use original or properly licensed subject matter for production work.

## Deployment

GitHub Actions publishes the contents of `site/` to GitHub Pages on pushes to `cos/pokedex-preview-20260905` and through manual workflow dispatch. The workflow uses GitHub’s official Pages actions and deploys only the explicit static preview directory.

## Removal/contact

If you are a rights holder or authorized representative and believe material here should be corrected or removed, open a GitHub issue identifying the specific file or page and the basis for the request. A clear request will be reviewed promptly.

## No legal advice

This README records the creator’s intent and disclosures. It is not legal advice and does not guarantee that every use qualifies for any particular legal exception. Consult qualified counsel for legal guidance.
