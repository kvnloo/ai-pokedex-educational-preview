#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    project = args.project.resolve()
    glb = project / "assets" / "generated" / "synthetic_beacon.glb"
    provenance_path = glb.with_suffix(".provenance.json")
    provenance = json.loads(provenance_path.read_text(encoding="utf-8"))
    imported = sorted((project / ".godot" / "imported").glob("synthetic_beacon.glb-*.scn"))
    report = {
        "blender_generator": provenance["generator"],
        "glb_bytes": glb.stat().st_size,
        "glb_magic_valid": glb.read_bytes()[:4] == b"glTF",
        "glb_sha256": hashlib.sha256(glb.read_bytes()).hexdigest(),
        "godot_imported_scene_count": len(imported),
        "godot_imported_scenes": [str(path.relative_to(project)) for path in imported],
        "license": provenance["license"],
        "private_assets": provenance["private_assets"],
        "provenance_hash_matches": provenance["sha256"] == hashlib.sha256(glb.read_bytes()).hexdigest(),
    }
    if not all((report["glb_magic_valid"], report["provenance_hash_matches"], len(imported) == 1, not report["private_assets"])):
        raise SystemExit("Blender→GLB→Godot import verification failed")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
