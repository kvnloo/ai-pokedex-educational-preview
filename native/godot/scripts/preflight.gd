extends Node3D

const Bindings = preload("res://generated/native_contract_bindings.gd")
const EXPECTED_HASH := "64ba98824cdb8f2d4c0aa31c51bcb235438361d23d985b5d642659b36629653e"
const REQUESTED_DIMENSIONS := Vector2i(960, 540)

var _frame_limit := 24
var _warmup_frames := 0
var _seen_frames := 0
var _frame_times_ms: Array[float] = []
var _report_path := "res://evidence/headless-report.json"
var _capture_path := ""
var _finishing := false
var _contract_only := false
var _scene_fixture: Dictionary
var _intent_fixture: Dictionary
var _replay_fixture: Dictionary
var _asset_loaded := false
var _movement_cell := [0, 0]
var _final_hash := ""


func _ready() -> void:
    _parse_arguments()
    get_window().unresizable = true
    get_window().borderless = true
    get_window().size = REQUESTED_DIMENSIONS
    get_window().content_scale_size = REQUESTED_DIMENSIONS
    _scene_fixture = _load_fixture("canonical-scene.json", "canonical_scene")
    _intent_fixture = _load_fixture("movement-intent.json", "movement_intent")
    _replay_fixture = _load_fixture("battle-replay.json", "battle_replay")
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
    _seen_frames += 1
    if _seen_frames <= _warmup_frames:
        return
    _frame_times_ms.append(delta * 1000.0)
    if not _finishing and _frame_times_ms.size() >= _frame_limit:
        _finishing = true
        _finalize.call_deferred()


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
        elif argument == "--contract-only":
            _contract_only = true


func _write_contract_only_report() -> void:
    var report := {
        "asset_loaded": _asset_loaded,
        "display_driver": DisplayServer.get_name(),
        "final_hash": _final_hash,
        "movement_cell": _movement_cell,
        "renderer": "dummy (no rendering)",
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


func _contract_root() -> String:
    return ProjectSettings.globalize_path("res://").path_join("../../contracts/native/fixtures").simplify_path()


func _load_fixture(file_name: String, expected_kind: String) -> Dictionary:
    var path := _contract_root().path_join(file_name)
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        push_error("cannot open contract fixture: %s" % path)
        get_tree().quit(2)
        return {}
    var value = JSON.parse_string(file.get_as_text())
    if not value is Dictionary or not Bindings.validate_fixture(value, expected_kind):
        push_error("invalid %s fixture" % expected_kind)
        get_tree().quit(2)
        return {}
    return value


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

    for cell in _scene_fixture["cells"]:
        var tile := MeshInstance3D.new()
        var mesh := BoxMesh.new()
        mesh.size = Vector3(1.8, 0.12, 1.8)
        tile.mesh = mesh
        tile.position = Vector3(float(cell["grid"][0]) * 2.0, float(cell["height"]), float(cell["grid"][1]) * 2.0)
        var material := StandardMaterial3D.new()
        material.albedo_color = Color("172d4a") if cell["id"] == "origin" else Color("234869")
        material.metallic = 0.35
        material.roughness = 0.42
        tile.material_override = material
        add_child(tile)

    var asset = load(_scene_fixture["asset_uri"])
    if asset is PackedScene:
        var instance = asset.instantiate()
        instance.position = Vector3(0.0, 0.12, 0.0)
        add_child(instance)
        _asset_loaded = true

    var camera := Camera3D.new()
    camera.position = Vector3(4.4, 3.4, 6.2)
    camera.look_at_from_position(camera.position, Vector3(0.7, 0.5, 0.0))
    camera.fov = 42.0
    add_child(camera)


func _consume_movement_intent() -> void:
    var direction: Array = _intent_fixture["direction"]
    _movement_cell = [int(direction[0]), int(direction[1])]
    var expected: Array = _intent_fixture["expected_cell"]
    if _movement_cell != [int(expected[0]), int(expected[1])]:
        push_error("movement intent target mismatch")
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
        Bindings.SCHEMA_VERSION,
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
    var window_dimensions := DisplayServer.window_get_size()
    var viewport_dimensions := Vector2i(get_viewport().get_visible_rect().size)
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
    var report := {
        "api_version": api_version,
        "asset_loaded": _asset_loaded,
        "device": device,
        "draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
        "final_hash": _final_hash,
        "frames": _frame_times_ms.size(),
        "mean_frame_ms": total / float(_frame_times_ms.size()),
        "movement_cell": _movement_cell,
        "objects": Performance.get_monitor(Performance.OBJECT_NODE_COUNT),
        "p95_frame_ms": _percentile(_frame_times_ms, 0.95),
        "p99_frame_ms": _percentile(_frame_times_ms, 0.99),
        "renderer": "Forward+",
        "requested_dimensions": [REQUESTED_DIMENSIONS.x, REQUESTED_DIMENSIONS.y],
        "schema_version": Bindings.SCHEMA_VERSION,
        "software_renderer": software,
        "synthetic_only": true,
        "triangles": Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME),
        "window_dimensions": [window_dimensions.x, window_dimensions.y],
        "viewport_dimensions": [viewport_dimensions.x, viewport_dimensions.y],
        "drawing_buffer_dimensions": [drawing_buffer_dimensions.x, drawing_buffer_dimensions.y],
    }
    var report_file := FileAccess.open(_report_path, FileAccess.WRITE)
    if report_file == null:
        push_error("cannot write report: %s" % _report_path)
        get_tree().quit(2)
        return
    report_file.store_string(JSON.stringify(report, "  ") + "\n")
    print("NATIVE_PREFLIGHT_REPORT ", JSON.stringify(report))
    if window_dimensions != REQUESTED_DIMENSIONS or viewport_dimensions != REQUESTED_DIMENSIONS or drawing_buffer_dimensions != REQUESTED_DIMENSIONS:
        push_error("native preflight dimensions mismatch: requested=%s window=%s viewport=%s drawing_buffer=%s" % [REQUESTED_DIMENSIONS, window_dimensions, viewport_dimensions, drawing_buffer_dimensions])
        get_tree().quit(4)
        return
    if software or not device.contains("NVIDIA GeForce RTX 3080 Ti"):
        push_error("native preflight requires RTX 3080 Ti Vulkan, got: %s" % device)
        get_tree().quit(3)
        return
    get_tree().quit(0)
