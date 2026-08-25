extends Node3D

const Bindings = preload("res://generated/native_contract_bindings.gd")
const EXPECTED_HASH := "395db323b45f3a5d5379a68702c3f8e96e14e5362aa927f67b232c030d7ac1d6"
const RESIZE_STABLE_FRAMES := 3
const RESIZE_TIMEOUT_FRAMES := 600

var _frame_limit := 24
var _warmup_frames := 0
var _requested_dimensions := Vector2i(960, 540)
var _performance_tier := "preflight"
var _p95_budget_ms := 0.0
var _p99_budget_ms := 0.0
var _shader_prewarm_frames := 0
var _import_prewarmed := false
var _target_hardware := "NVIDIA GeForce RTX 3080 Ti"
var _seen_frames := 0
var _resize_stable_frames := 0
var _resize_wait_frames := 0
var _client_size_converged := false
var _frame_times_ms: Array[float] = []
var _report_path := "res://evidence/headless-report.json"
var _capture_path := ""
var _asset_profile := "distributable"
var _asset_manifest: Dictionary
var _resolved_asset: Dictionary
var _resolved_asset_id := ""
var _asset_formats: Array = []
var _private_source_loaded := false
var _finishing := false
var _contract_only := false
var _scene_fixture: Dictionary
var _runtime_fixture: Dictionary
var _maps_document: Dictionary
var _intent_fixture: Dictionary
var _replay_fixture: Dictionary
var _save_fixture: Dictionary
var _asset_loaded := false
var _movement_cell := [0, 0]
var _movement_from := ""
var _movement_location := ""
var _final_hash := ""


func _ready() -> void:
    _parse_arguments()
    get_window().unresizable = true
    get_window().borderless = true
    get_window().size = _requested_dimensions
    get_window().content_scale_size = _requested_dimensions
    _scene_fixture = _load_legacy_fixture("canonical-scene.json", "canonical_scene")
    _runtime_fixture = _load_repository_json(Bindings.CANONICAL_RUNTIME)
    _maps_document = _load_repository_json(Bindings.CANONICAL_MAPS)
    _intent_fixture = _load_shared_fixture("movement-intent.json", "movement_intent")
    _replay_fixture = _load_shared_fixture("battle-replay.json", "battle_replay")
    _save_fixture = _load_shared_fixture("save.json", "save_snapshot")
    _resolve_asset_manifest()
    _build_scene()
    _consume_movement_intent()
    _final_hash = _replay_battle()
    if _final_hash != EXPECTED_HASH:
        push_error("battle replay hash mismatch")
        get_tree().quit(2)
        return
    if _contract_only:
        _finishing = true
        _write_contract_only_report.call_deferred()


func _process(delta: float) -> void:
    if not _contract_only and not _client_size_has_converged():
        return
    _seen_frames += 1
    if _seen_frames <= _warmup_frames:
        return
    _frame_times_ms.append(delta * 1000.0)
    if not _finishing and _frame_times_ms.size() >= _frame_limit:
        _finishing = true
        _finalize.call_deferred()


func _client_size_has_converged() -> bool:
    if _client_size_converged:
        return true
    var client_viewport_dimensions := Vector2i(get_viewport().get_visible_rect().size)
    var drawing_buffer_dimensions := Vector2i(get_viewport().get_texture().get_size())
    _resize_wait_frames += 1
    if client_viewport_dimensions == _requested_dimensions and drawing_buffer_dimensions == _requested_dimensions:
        _resize_stable_frames += 1
    else:
        _resize_stable_frames = 0
        get_window().size = _requested_dimensions
        get_window().content_scale_size = _requested_dimensions
    if _resize_stable_frames >= RESIZE_STABLE_FRAMES:
        _client_size_converged = true
        return true
    if _resize_wait_frames >= RESIZE_TIMEOUT_FRAMES:
        push_error("client viewport/drawing buffer did not converge to %s: viewport=%s drawing_buffer=%s" % [_requested_dimensions, client_viewport_dimensions, drawing_buffer_dimensions])
        get_tree().quit(4)
    return false


func _parse_arguments() -> void:
    for argument in OS.get_cmdline_user_args():
        if argument.begins_with("--report="):
            _report_path = argument.trim_prefix("--report=")
        elif argument.begins_with("--capture="):
            _capture_path = argument.trim_prefix("--capture=")
        elif argument.begins_with("--frames="):
            _frame_limit = maxi(1, int(argument.trim_prefix("--frames=")))
        elif argument.begins_with("--warmup="):
            _warmup_frames = maxi(0, int(argument.trim_prefix("--warmup=")))
        elif argument.begins_with("--asset-profile="):
            _asset_profile = argument.trim_prefix("--asset-profile=")
        elif argument.begins_with("--resolution="):
            var dimensions := argument.trim_prefix("--resolution=").split("x")
            if dimensions.size() == 2:
                _requested_dimensions = Vector2i(maxi(1, int(dimensions[0])), maxi(1, int(dimensions[1])))
        elif argument.begins_with("--performance-tier="):
            _performance_tier = argument.trim_prefix("--performance-tier=")
        elif argument.begins_with("--p95-budget-ms="):
            _p95_budget_ms = maxf(0.0, float(argument.trim_prefix("--p95-budget-ms=")))
        elif argument.begins_with("--p99-budget-ms="):
            _p99_budget_ms = maxf(0.0, float(argument.trim_prefix("--p99-budget-ms=")))
        elif argument.begins_with("--shader-prewarm-frames="):
            _shader_prewarm_frames = maxi(0, int(argument.trim_prefix("--shader-prewarm-frames=")))
        elif argument == "--import-prewarmed":
            _import_prewarmed = true
        elif argument == "--contract-only":
            _contract_only = true


func _write_contract_only_report() -> void:
    var report := {
        "asset_loaded": _asset_loaded,
        "asset_formats": _asset_formats,
        "asset_profile": _asset_profile,
        "canonical_path_count": _runtime_fixture["path"].size(),
        "canonical_slice_id": _runtime_fixture["sliceId"],
        "display_driver": DisplayServer.get_name(),
        "final_hash": _final_hash,
        "intent_only_client": Bindings.INTENT_ONLY_CLIENT,
        "movement_cell": _movement_cell,
        "movement_from": _movement_from,
        "movement_location": _movement_location,
        "presentation_asset_classification": _resolved_asset["classification"],
        "private_source_loaded": _private_source_loaded,
        "renderer": "dummy (no rendering)",
        "resolved_asset_id": _resolved_asset_id,
        "save_location": _save_fixture["location_id"],
        "schema_version": Bindings.SCHEMA_VERSION,
    }
    var report_file := FileAccess.open(_report_path, FileAccess.WRITE)
    if report_file == null:
        push_error("cannot write contract-only report: %s" % _report_path)
        get_tree().quit(2)
        return
    report_file.store_string(JSON.stringify(report, "  ") + "\n")
    print("NATIVE_HEADLESS_CONTRACT_REPORT ", JSON.stringify(report))
    get_tree().quit(0)


func _repository_root() -> String:
    return ProjectSettings.globalize_path("res://").path_join("../..").simplify_path()


func _load_json(path: String) -> Dictionary:
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        push_error("cannot open authoritative JSON: %s" % path)
        get_tree().quit(2)
        return {}
    var value = JSON.parse_string(file.get_as_text())
    if not value is Dictionary:
        push_error("authoritative JSON is not an object: %s" % path)
        get_tree().quit(2)
        return {}
    return value


func _load_repository_json(relative_path: String) -> Dictionary:
    return _load_json(_repository_root().path_join(relative_path))


func _load_contract_fixture(directory: String, file_name: String, expected_kind: String) -> Dictionary:
    var value := _load_json(_repository_root().path_join(directory).path_join(file_name))
    if not Bindings.validate_fixture(value, expected_kind):
        push_error("invalid %s fixture" % expected_kind)
        get_tree().quit(2)
        return {}
    return value


func _load_legacy_fixture(file_name: String, expected_kind: String) -> Dictionary:
    return _load_contract_fixture("contracts/native/fixtures", file_name, expected_kind)


func _load_shared_fixture(file_name: String, expected_kind: String) -> Dictionary:
    return _load_contract_fixture("contracts/shared/fixtures", file_name, expected_kind)


func _resolve_asset_manifest() -> void:
    if not Bindings.ASSET_MANIFESTS.has(_asset_profile):
        push_error("unsupported asset resolver profile: %s" % _asset_profile)
        get_tree().quit(2)
        return
    _asset_manifest = _load_repository_json(Bindings.ASSET_MANIFESTS[_asset_profile])
    if _asset_manifest.get("profile") != _asset_profile:
        push_error("asset resolver profile/manifest mismatch")
        get_tree().quit(2)
        return
    for asset in _asset_manifest["assets"]:
        if asset.get("privateOnly", false) and asset.get("loadable", false):
            _private_source_loaded = true
        if _resolved_asset.is_empty() and asset.get("loadable", false):
            _resolved_asset = asset
    if _resolved_asset.is_empty():
        push_error("asset resolver profile has no loadable presentation")
        get_tree().quit(2)
        return
    _resolved_asset_id = _resolved_asset["assetId"]
    _asset_formats = _resolved_asset["formats"].keys()
    _asset_formats.sort()


func _build_scene() -> void:
    var environment := WorldEnvironment.new()
    var environment_resource := Environment.new()
    environment_resource.background_mode = Environment.BG_COLOR
    environment_resource.background_color = Color("071225")
    environment_resource.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    environment_resource.ambient_light_color = Color("4b6f99")
    environment_resource.ambient_light_energy = 0.65
    environment.environment = environment_resource
    add_child(environment)

    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-48.0, -32.0, 0.0)
    sun.light_energy = 1.4
    sun.shadow_enabled = true
    add_child(sun)

    var cyan_light := OmniLight3D.new()
    cyan_light.light_color = Color("18cfff")
    cyan_light.light_energy = 5.0
    cyan_light.omni_range = 7.0
    cyan_light.position = Vector3(0.0, 2.2, 0.0)
    add_child(cyan_light)

    for index in range(_runtime_fixture["path"].size()):
        var location_id: String = _runtime_fixture["path"][index]
        var coordinate: Array = _runtime_fixture["coordinates"][location_id]
        var tile := MeshInstance3D.new()
        var mesh := BoxMesh.new()
        mesh.size = Vector3(1.8, 0.12, 1.8)
        tile.mesh = mesh
        tile.position = Vector3(float(coordinate[0]) * 2.0, 0.0, -float(coordinate[1]) * 2.0)
        var material := StandardMaterial3D.new()
        material.albedo_color = Color("4d8f55") if index == 0 else Color("315d48")
        material.metallic = 0.35
        material.roughness = 0.42
        tile.material_override = material
        add_child(tile)

    var glb_entries: Array = _resolved_asset["formats"]["glb"]
    var asset = load(glb_entries[0]["uri"]) if not glb_entries.is_empty() else null
    if asset is PackedScene:
        var instance = asset.instantiate()
        instance.position = Vector3(0.0, 0.12, 0.0)
        add_child(instance)
        _asset_loaded = true

    var camera := Camera3D.new()
    camera.position = Vector3(8.0, 9.0, 8.0)
    camera.look_at_from_position(camera.position, Vector3(0.0, 0.0, -6.0))
    camera.fov = 42.0
    add_child(camera)


func _consume_movement_intent() -> void:
    _movement_from = _intent_fixture["from_location_id"]
    _movement_location = _intent_fixture["expected_location_id"]
    if _movement_from != _runtime_fixture["path"][0] or not _movement_location in _runtime_fixture["path"]:
        push_error("movement intent is outside canonical runtime path")
        get_tree().quit(2)
        return
    var active_map: Dictionary = {}
    for map in _maps_document["maps"]:
        if map["gameId"] == _runtime_fixture["activeGameId"] and map["locationId"] == _movement_from:
            active_map = map
            break
    var authoritative_target := false
    for edge in active_map.get("connections", []):
        if edge["to"] == _movement_location:
            authoritative_target = true
            break
    if not authoritative_target:
        push_error("movement intent target is not an authoritative canonical edge")
        get_tree().quit(2)
        return
    var coordinate: Array = _runtime_fixture["coordinates"][_movement_location]
    _movement_cell = [int(coordinate[0]), int(coordinate[1])]
    if _save_fixture["location_id"] != _movement_location or _save_fixture["last_intent_sequence"] != _intent_fixture["sequence"]:
        push_error("authoritative save snapshot does not acknowledge movement intent")
        get_tree().quit(2)


func _replay_battle() -> String:
    var hp: Dictionary = _replay_fixture["initial_hp"].duplicate()
    var expected_sequence := 1
    for event in _replay_fixture["events"]:
        if event["sequence"] != expected_sequence or event["type"] != "damage":
            push_error("invalid authoritative battle event order/type")
            get_tree().quit(2)
            return ""
        hp[event["target"]] = maxi(0, int(hp[event["target"]]) - int(event["amount"]))
        expected_sequence += 1
    var canonical := "%s|training_red:%d|training_blue:%d|winner:%s|events:%d" % [
        _replay_fixture["schema_version"],
        hp["training_red"],
        hp["training_blue"],
        _replay_fixture["expected_winner"],
        _replay_fixture["events"].size(),
    ]
    var context := HashingContext.new()
    context.start(HashingContext.HASH_SHA256)
    context.update(canonical.to_utf8_buffer())
    return context.finish().hex_encode()


func _percentile(values: Array[float], fraction: float) -> float:
    var sorted := values.duplicate()
    sorted.sort()
    var index := clampi(ceili(float(sorted.size()) * fraction) - 1, 0, sorted.size() - 1)
    return sorted[index]


func _finalize() -> void:
    await RenderingServer.frame_post_draw
    var outer_window_dimensions := DisplayServer.window_get_size()
    var client_viewport_dimensions := Vector2i(get_viewport().get_visible_rect().size)
    var drawing_buffer_dimensions := Vector2i(get_viewport().get_texture().get_size())
    var image: Image
    if not _capture_path.is_empty():
        image = get_viewport().get_texture().get_image()
        drawing_buffer_dimensions = image.get_size()
        var capture_error := image.save_png(_capture_path)
        if capture_error != OK:
            push_error("failed to save native screenshot")
            get_tree().quit(2)
            return

    var device := RenderingServer.get_video_adapter_name()
    var api_version := RenderingServer.get_video_adapter_api_version()
    var lowered := device.to_lower()
    var software := lowered.contains("llvmpipe") or lowered.contains("lavapipe") or lowered.contains("swiftshader") or lowered.contains("software")
    var total := 0.0
    for value in _frame_times_ms:
        total += value
    var p95_frame_ms := _percentile(_frame_times_ms, 0.95)
    var p99_frame_ms := _percentile(_frame_times_ms, 0.99)
    var performance_gate_passed := _p95_budget_ms > 0.0 and _p99_budget_ms > 0.0 and p95_frame_ms <= _p95_budget_ms and p99_frame_ms <= _p99_budget_ms
    var report := {
        "api_version": api_version,
        "asset_loaded": _asset_loaded,
        "asset_formats": _asset_formats,
        "asset_profile": _asset_profile,
        "canonical_path_count": _runtime_fixture["path"].size(),
        "canonical_slice_id": _runtime_fixture["sliceId"],
        "device": device,
        "draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
        "final_hash": _final_hash,
        "frames": _frame_times_ms.size(),
        "import_prewarmed": _import_prewarmed,
        "mean_frame_ms": total / float(_frame_times_ms.size()),
        "movement_cell": _movement_cell,
        "movement_from": _movement_from,
        "movement_location": _movement_location,
        "objects": Performance.get_monitor(Performance.OBJECT_NODE_COUNT),
        "p95_budget_ms": _p95_budget_ms,
        "p95_frame_ms": p95_frame_ms,
        "p99_budget_ms": _p99_budget_ms,
        "p99_frame_ms": p99_frame_ms,
        "performance_gate_passed": performance_gate_passed,
        "performance_tier": _performance_tier,
        "presentation_asset_classification": _resolved_asset["classification"],
        "renderer": "Forward+",
        "resolved_asset_id": _resolved_asset_id,
        "requested_client_dimensions": [_requested_dimensions.x, _requested_dimensions.y],
        "resize_stable_frames": _resize_stable_frames,
        "resize_wait_frames": _resize_wait_frames,
        "save_location": _save_fixture["location_id"],
        "schema_version": Bindings.SCHEMA_VERSION,
        "shader_prewarm_frames": _shader_prewarm_frames,
        "software_renderer": software,
        "target_hardware": _target_hardware,
        "private_source_loaded": _private_source_loaded,
        "synthetic_only": false,
        "triangles": Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME),
        "outer_window_dimensions": [outer_window_dimensions.x, outer_window_dimensions.y],
        "client_viewport_dimensions": [client_viewport_dimensions.x, client_viewport_dimensions.y],
        "drawing_buffer_dimensions": [drawing_buffer_dimensions.x, drawing_buffer_dimensions.y],
        "window_decorations_observed": outer_window_dimensions != client_viewport_dimensions,
    }
    var report_file := FileAccess.open(_report_path, FileAccess.WRITE)
    if report_file == null:
        push_error("cannot write report: %s" % _report_path)
        get_tree().quit(2)
        return
    report_file.store_string(JSON.stringify(report, "  ") + "\n")
    print("NATIVE_PREFLIGHT_REPORT ", JSON.stringify(report))
    if client_viewport_dimensions != _requested_dimensions or drawing_buffer_dimensions != _requested_dimensions:
        push_error("native preflight client dimensions mismatch: requested=%s viewport=%s drawing_buffer=%s outer_window=%s" % [_requested_dimensions, client_viewport_dimensions, drawing_buffer_dimensions, outer_window_dimensions])
        get_tree().quit(4)
        return
    if software or not device.contains("NVIDIA GeForce RTX 3080 Ti"):
        push_error("native preflight requires RTX 3080 Ti Vulkan, got: %s" % device)
        get_tree().quit(3)
        return
    get_tree().quit(0)
