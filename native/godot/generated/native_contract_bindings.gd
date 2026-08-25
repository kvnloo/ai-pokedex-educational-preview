# Generated from contracts/shared/v1/client-contract.schema.json. Do not edit.
class_name NativeContractBindings
extends RefCounted

const LEGACY_SCHEMA_VERSION := "native-preflight/v1"
const SCHEMA_VERSION := "authoritative-client/v1"
const FIXTURE_KINDS := ["movement_intent", "battle_replay", "save_snapshot"]
const INTENT_ONLY_CLIENT := true
const AUTHORITATIVE_DOMAINS := ["world", "battle", "story", "save", "inventory", "economy"]
const CANONICAL_RUNTIME := "canonical/runtime/kanto-opening.json"
const CANONICAL_MAPS := "canonical/maps/kanto-opening.json"
const ASSET_RECIPE := "asset-iac/recipes/kanto-minimal.json"
const ASSET_GRAPH := "asset-iac/graphs/kanto-pallet-pewter.json"
const ASSET_MANIFESTS := {"distributable":"asset-iac/manifests/distributable.json", "private-local":"asset-iac/manifests/private-local.json"}

static func validate_fixture(value: Dictionary, expected_kind: String) -> bool:
    var schema = value.get("schema_version")
    return schema in [SCHEMA_VERSION, LEGACY_SCHEMA_VERSION] and value.get("kind") == expected_kind
