#!/usr/bin/env python3
"""Generate the deterministic, provenance-complete Kanto opening corpus."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def provenance(source_id, locator, license_class="research-facts", confidence="high"):
    return {"sourceId": source_id, "locator": locator, "sourceRevision": "accessed-2026-08-24", "extractionMethod": "manual factual transcription", "confidence": confidence, "licenseClass": license_class}

def document(kind, key, values):
    return {"schemaVersion": 1, "documentType": kind, key: values}

def write(relative, value):
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n")

sources = []
for source_id, name, url, license_name, policy in [
    ("source:pokeapi", "PokeAPI", "https://github.com/PokeAPI/pokeapi", "BSD-3-Clause", "reusable-metadata"),
    ("source:pret-pokered", "pret/pokered", "https://github.com/pret/pokered", "unknown-upstream-content-rights", "research-only"),
    ("source:pret-pokeyellow", "pret/pokeyellow", "https://github.com/pret/pokeyellow", "unknown-upstream-content-rights", "research-only"),
    ("source:pret-pokefirered", "pret/pokefirered", "https://github.com/pret/pokefirered", "unknown-upstream-content-rights", "research-only"),
    ("source:bulbapedia-ash-kanto", "Bulbapedia Ash Kanto chronology", "https://bulbapedia.bulbagarden.net/wiki/Ash_Ketchum", "CC-BY-SA-2.5", "citation-only"),
    ("source:original-presentation", "Project-authored presentation", "docs/CANONICAL-WORLD-PIPELINE.md", "project-original", "original"),
]:
    sources.append({"id": source_id, "name": name, "url": url, "revision": "accessed-2026-08-24", "license": license_name, "usagePolicy": policy, "provenance": provenance("source:original-presentation", "docs/CANONICAL-WORLD-PIPELINE.md#sources", "project-original")})

game_specs = [
    ("game:red-blue", "Red/Blue", 1, "original-kanto", "source:pret-pokered"),
    ("game:yellow", "Yellow", 1, "original-kanto-special", "source:pret-pokeyellow"),
    ("game:firered-leafgreen", "FireRed/LeafGreen", 3, "kanto-remake", "source:pret-pokefirered"),
]
games = [{"id": gid, "name": name, "generation": generation, "lineage": lineage, "provenance": provenance(source, f"{source}#version-identity")} for gid, name, generation, lineage, source in game_specs]
regions = [{"id": "region:kanto", "name": "Kanto", "gameIds": [game[0] for game in game_specs], "provenance": provenance("source:pokeapi", "api/v2/region/1", "BSD-3-Clause-metadata")}]
location_specs = [("pallet-town", "Pallet Town", "town"), ("route-1", "Route 1", "route"), ("viridian-city", "Viridian City", "city"), ("route-2-south", "Route 2 (south)", "route"), ("viridian-forest", "Viridian Forest", "forest"), ("route-2-north", "Route 2 (north)", "route"), ("pewter-city", "Pewter City", "city"), ("route-3", "Route 3", "route")]
locations = [{"id": f"location:kanto:{slug}", "regionId": "region:kanto", "name": name, "kind": kind, "order": order, "provenance": provenance("source:pokeapi", f"api/v2/location/{slug}", "BSD-3-Clause-metadata", "medium")} for order, (slug, name, kind) in enumerate(location_specs)]

maps = []
for game_id, _, _, _, source in game_specs:
    game_slug = game_id.removeprefix("game:")
    for index, (slug, _, _) in enumerate(location_specs):
        connections, warps = [], []
        for target_index in (index - 1, index + 1):
            if not 0 <= target_index < len(location_specs):
                continue
            route3_edge = {index, target_index} == {len(location_specs) - 2, len(location_specs) - 1}
            if route3_edge:
                direction, offset = (("east", [1, 0]) if target_index > index else ("west", [-1, 0]))
            else:
                direction, offset = (("north", [0, 1]) if target_index > index else ("south", [0, -1]))
            target_slug = location_specs[target_index][0]
            connections.append({"id": f"edge:{game_slug}:{slug}:{target_slug}", "to": f"location:kanto:{target_slug}", "direction": direction, "offset": offset, "oneWay": False, "provenance": provenance(source, f"maps/{slug}#connection-{direction}")})
            warps.append({"id": f"warp:{game_slug}:{slug}:{target_slug}", "toMap": f"map:{game_slug}:{target_slug}", "kind": "boundary-entrance", "oneWay": False, "reciprocalWarpId": f"warp:{game_slug}:{target_slug}:{slug}", "provenance": provenance(source, f"maps/{slug}#entrance-{direction}")})
        maps.append({"id": f"map:{game_slug}:{slug}", "plane": "game", "gameId": game_id, "locationId": f"location:kanto:{slug}", "connections": connections, "warps": warps, "provenance": provenance(source, f"maps/{slug}")})

arcs = [{"id": "arc:ash:kanto:indigo", "plane": "anime", "name": "Kanto / Indigo League", "order": 1, "regionId": "region:kanto", "provenance": provenance("source:bulbapedia-ash-kanto", "Ash_Ketchum#Kanto", "CC-BY-SA-facts-paraphrase", "medium")}]
event_specs = [("ep001:depart-pallet", 1, "pallet-town", "EP001", "Ash begins his journey from Pallet Town."), ("ep001:route-1-crisis", 2, "route-1", "EP001", "A flock encounter turns the first trip north into an emergency."), ("ep002:viridian-arrival", 3, "viridian-city", "EP002", "Ash reaches Viridian City seeking help before continuing."), ("ep003:forest-companion", 4, "viridian-forest", "EP003", "The forest journey adds a companion and a first capture milestone."), ("ep005:pewter-gym", 5, "pewter-city", "EP005", "Ash challenges the Pewter Gym and then continues with Brock.")]
events = [{"id": f"story-event:ash:{slug}", "arcId": "arc:ash:kanto:indigo", "plane": "anime", "order": order, "locationId": f"location:kanto:{location}", "summary": summary, "provenance": provenance("source:bulbapedia-ash-kanto", f"Ash_Ketchum#{episode}", "CC-BY-SA-facts-paraphrase", "medium")} for slug, order, location, episode, summary in event_specs]
divergences = []
for slug, kind, summary, resolution, locator in [("starter-departure", "anime-game", "Ash chronology begins with a late starter handoff; game versions use player-selected starter flows.", "preserve-both", "Ash_Ketchum#EP001"), ("viridian-gym-order", "anime-game", "The opening anime route passes through Viridian without completing its gym.", "preserve-both", "Ash_Ketchum#Viridian"), ("route-2-segmentation", "version-topology", "Route 2 and Viridian Forest remain explicit nodes while each game retains separate maps.", "versioned-maps", "maps/route-2")]:
    source = "source:bulbapedia-ash-kanto" if kind == "anime-game" else "source:pret-pokeyellow"
    divergences.append({"id": f"divergence:kanto:{slug}", "kind": kind, "summary": summary, "resolution": resolution, "provenance": provenance(source, locator, confidence="medium")})
coordinates = {f"location:kanto:{slug}": ([1, 6] if slug == "route-3" else [0, index]) for index, (slug, _, _) in enumerate(location_specs)}
runtime = {"schemaVersion": 1, "documentType": "runtime", "sliceId": "world-slice:kanto:pallet-pewter", "regionId": "region:kanto", "path": list(coordinates), "coordinates": coordinates, "activeGameId": "game:yellow", "ashArcId": "arc:ash:kanto:indigo", "presentationPolicy": {"privateCanonicalAssetsAllowed": True, "distributableAssetsOnly": True, "privateAssetsInPublicArtifactsAllowed": False}, "provenance": provenance("source:original-presentation", "docs/CANONICAL-WORLD-PIPELINE.md#dual-plane-assets", "project-original")}
for path, value in {
    "canonical/sources.json": document("sources", "sources", sources), "canonical/games.json": document("games", "games", games), "canonical/regions.json": document("regions", "regions", regions), "canonical/locations.json": document("locations", "locations", locations), "canonical/maps/kanto-opening.json": document("maps", "maps", maps), "canonical/ash/arcs.json": document("arcs", "arcs", arcs), "canonical/ash/events/kanto-opening.json": document("events", "events", events), "canonical/conflicts.json": document("conflicts", "divergences", divergences), "canonical/runtime/kanto-opening.json": runtime,
}.items():
    write(path, value)
