#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT_DIR = ROOT / "contracts" / "native"
FIXTURE_DIR = CONTRACT_DIR / "fixtures"
SHARED_DIR = ROOT / "contracts" / "shared"
BINDING = ROOT / "native" / "godot" / "generated" / "native_contract_bindings.gd"


def render_binding(shared: dict) -> str:
    domains = json.dumps(shared["authoritativeDomains"], separators=(",", ":")).replace(",", ", ")
    kinds = json.dumps(shared["fixtureKinds"], separators=(",", ":")).replace(",", ", ")
    manifests = json.dumps(shared["assetManifests"], separators=(",", ":")).replace(",", ", ")
    return f'''# Generated from contracts/shared/v1/client-contract.schema.json. Do not edit.\nclass_name NativeContractBindings\nextends RefCounted\n\nconst LEGACY_SCHEMA_VERSION := "native-preflight/v1"\nconst SCHEMA_VERSION := "{shared["schemaVersion"]}"\nconst FIXTURE_KINDS := {kinds}\nconst INTENT_ONLY_CLIENT := true\nconst AUTHORITATIVE_DOMAINS := {domains}\nconst CANONICAL_RUNTIME := "{shared["canonicalRuntime"]}"\nconst CANONICAL_MAPS := "{shared["canonicalMaps"]}"\nconst ASSET_RECIPE := "{shared["assetRecipe"]}"\nconst ASSET_GRAPH := "{shared["assetGraph"]}"\nconst ASSET_MANIFESTS := {manifests}\n\nstatic func validate_fixture(value: Dictionary, expected_kind: String) -> bool:\n    var schema = value.get("schema_version")\n    return schema in [SCHEMA_VERSION, LEGACY_SCHEMA_VERSION] and value.get("kind") == expected_kind\n'''


def load_json(path: Path) -> dict:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return value


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def replay_final_state(replay: dict) -> tuple[str, str]:
    hp = dict(replay["initial_hp"])
    events = replay["events"]
    require([event["sequence"] for event in events] == list(range(1, len(events) + 1)), "battle event sequences must be contiguous")
    for event in events:
        require(event["type"] == "damage", "preflight replay only supports authoritative damage events")
        hp[event["target"]] = max(0, hp[event["target"]] - event["amount"])
    winner = replay["expected_winner"]
    canonical = f'{replay["schema_version"]}|training_red:{hp["training_red"]}|training_blue:{hp["training_blue"]}|winner:{winner}|events:{len(events)}'
    return canonical, hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate() -> dict:
    contract = load_json(CONTRACT_DIR / "v1" / "contract.json")
    require(contract["schema_version"] == "native-preflight/v1", "unsupported schema version")
    require(contract["intent_only_client"] is True, "native client must emit intents only")

    fixture_names = ["canonical-scene.json", "movement-intent.json", "battle-replay.json"]
    fixtures = [load_json(FIXTURE_DIR / name) for name in fixture_names]
    expected_kinds = contract["fixture_kinds"]
    for fixture, expected_kind in zip(fixtures, expected_kinds, strict=True):
        require(fixture.get("schema_version") == contract["schema_version"], f"{expected_kind} schema mismatch")
        require(fixture.get("kind") == expected_kind, f"expected {expected_kind} fixture")

    scene, intent, replay = fixtures
    require(intent["expected_cell"] in [cell["grid"] for cell in scene["cells"]], "movement target must exist in canonical scene")
    require(intent["sequence"] > 0 and intent["intent_id"], "movement intent identity/sequence required")
    _, final_hash = replay_final_state(replay)
    require(final_hash == replay["expected_final_hash"], "battle replay final hash mismatch")

    shared = load_json(SHARED_DIR / "v1" / "contract.json")
    shared_schema = load_json(SHARED_DIR / "v1" / "client-contract.schema.json")
    for key in ("schemaVersion", "intentOnlyClient", "authoritativeDomains", "fixtureKinds", "canonicalRuntime", "canonicalMaps", "assetRecipe", "assetGraph", "assetManifests"):
        require(shared_schema["properties"][key]["const"] == shared[key], f"shared contract/schema drift: {key}")
    require(shared["intentOnlyClient"] is True, "shared client must emit intents only")

    runtime = load_json(ROOT / shared["canonicalRuntime"])
    maps = load_json(ROOT / shared["canonicalMaps"])
    shared_fixture_names = ["movement-intent.json", "battle-replay.json", "save.json"]
    intent_shared, replay_shared, save_shared = [load_json(SHARED_DIR / "fixtures" / name) for name in shared_fixture_names]
    for fixture, expected_kind in zip((intent_shared, replay_shared, save_shared), shared["fixtureKinds"], strict=True):
        require(fixture.get("schema_version") == shared["schemaVersion"], f"{expected_kind} shared schema mismatch")
        require(fixture.get("kind") == expected_kind, f"expected shared {expected_kind} fixture")

    origin = runtime["path"][0]
    target = intent_shared["expected_location_id"]
    require(intent_shared["from_location_id"] == origin, "movement intent must start at canonical path origin")
    require(target in runtime["path"], "movement target must exist in canonical runtime path")
    origin_map = next((value for value in maps["maps"] if value["gameId"] == runtime["activeGameId"] and value["locationId"] == origin), None)
    if origin_map is None:
        raise ValueError("canonical origin map missing for active game")
    require(any(edge["to"] == target for edge in origin_map["connections"]), "movement target must be an authoritative canonical edge")

    _, shared_final_hash = replay_final_state(replay_shared)
    require(shared_final_hash == replay_shared["expected_final_hash"], "shared battle replay final hash mismatch")
    require(save_shared["location_id"] == target, "save snapshot must consume authoritative movement result")
    require(save_shared["last_battle_replay_id"] == replay_shared["replay_id"], "save/replay identity mismatch")
    require(save_shared["last_battle_final_hash"] == shared_final_hash, "save/replay hash mismatch")

    recipe = load_json(ROOT / shared["assetRecipe"])
    graph = load_json(ROOT / shared["assetGraph"])
    recipe_ids = {value["assetId"] for value in recipe["recipes"]}
    require(all(node["recipe"] in recipe_ids for node in graph["nodes"]), "asset graph must resolve stable recipe IDs")
    for profile, manifest_path in shared["assetManifests"].items():
        manifest = load_json(ROOT / manifest_path)
        require(manifest["profile"] == profile, f"asset manifest profile mismatch: {profile}")
        for asset in manifest["assets"]:
            require(asset["assetId"] in recipe_ids, f"asset manifest references unknown stable ID: {asset['assetId']}")
            require(set(asset["formats"]) == {"glb", "ktx2", "animations", "materials"}, "asset manifest format inventory drift")
            require(not (asset["privateOnly"] and asset["loadable"]), "private receipt must not be client-loadable")
    expected_binding = render_binding(shared)
    return {
        "authoritative_domains": shared["authoritativeDomains"],
        "binding_current": BINDING.exists() and BINDING.read_text(encoding="utf-8") == expected_binding,
        "browser_final_hash": shared_final_hash,
        "canonical_cell": origin,
        "canonical_slice_id": runtime["sliceId"],
        "expected_final_hash": replay_shared["expected_final_hash"],
        "legacy_expected_final_hash": replay["expected_final_hash"],
        "legacy_replay_final_hash": final_hash,
        "movement_target": target,
        "native_final_hash": shared_final_hash,
        "replay_final_hash": shared_final_hash,
        "save_location": save_shared["location_id"],
        "schema_version": contract["schema_version"],
        "shared_expected_final_hash": replay_shared["expected_final_hash"],
        "shared_schema_version": shared["schemaVersion"],
        "validated_fixtures": len(fixtures),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and validate native preflight bindings")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    if args.write:
        shared = load_json(SHARED_DIR / "v1" / "contract.json")
        BINDING.parent.mkdir(parents=True, exist_ok=True)
        BINDING.write_text(render_binding(shared), encoding="utf-8")
    report = validate()
    if not report["binding_current"]:
        raise ValueError("generated GDScript binding is stale; run with --write")
    print(json.dumps(report, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
