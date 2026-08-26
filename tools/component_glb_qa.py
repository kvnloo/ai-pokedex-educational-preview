#!/usr/bin/env python3
"""Emit deterministic aggregate and connected-component QA for a GLB mesh."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def rounded(value: Any) -> Any:
    if hasattr(value, "tolist"):
        return rounded(value.tolist())
    if isinstance(value, list):
        return [rounded(item) for item in value]
    if isinstance(value, float):
        return round(value, 6)
    return value


def mesh_record(mesh: Any, total_faces: int) -> dict[str, Any]:
    extents = mesh.extents
    maximum = max(float(extents.max()), 1e-12)
    is_volume = bool(mesh.is_volume)
    return {
        "faces": int(len(mesh.faces)),
        "vertices": int(len(mesh.vertices)),
        "faceShare": round(len(mesh.faces) / max(total_faces, 1), 6),
        "extents": rounded(extents),
        "thinRatio": round(float(extents.min()) / maximum, 6),
        "watertight": bool(mesh.is_watertight),
        "area": round(float(mesh.area), 6),
        "volume": round(abs(float(mesh.volume)), 6) if is_volume else None,
        "isVolume": is_volume,
    }


def inspect(path: Path) -> dict[str, Any]:
    import trimesh

    loaded = trimesh.load(str(path), force="scene", process=False)
    geometries = [geometry for geometry in loaded.geometry.values() if len(geometry.faces)]
    if not geometries:
        raise ValueError("GLB contains no triangle geometry")
    combined = trimesh.util.concatenate(geometries)
    components = sorted(combined.split(only_watertight=False), key=lambda item: len(item.faces), reverse=True)
    total_faces = len(combined.faces)
    records = [mesh_record(component, total_faces) for component in components]
    aggregate = mesh_record(combined, total_faces)
    aggregate["geometryNodes"] = len(geometries)
    aggregate["components"] = len(records)
    aggregate["boundingBoxVolume"] = round(float(combined.bounding_box.volume), 6)
    aggregate["volumeRatio"] = (
        round(abs(float(combined.volume)) / max(float(combined.bounding_box.volume), 1e-12), 6)
        if combined.is_volume
        else None
    )

    failures: list[str] = []
    warnings: list[str] = []
    if aggregate["thinRatio"] < 0.12:
        failures.append("aggregate-paper-thin")
    if aggregate["volumeRatio"] is not None and aggregate["volumeRatio"] > 0.75:
        failures.append("aggregate-cube-like")
    dominant = records[0]
    if dominant["faceShare"] >= 0.5 and dominant["thinRatio"] < 0.22:
        failures.append("dominant-component-relief-thin")
    for index, component in enumerate(records):
        if component["faceShare"] >= 0.05 and component["thinRatio"] < 0.08:
            failures.append(f"substantial-component-{index}-slab")
    meaningful = sum(component["faceShare"] >= 0.01 for component in records)
    if meaningful > 12:
        warnings.append("high-meaningful-component-count")
    if total_faces > 100_000:
        warnings.append("raw-face-count-over-realtime-budget")

    data = path.read_bytes()
    return {
        "schema": "ComponentGlbQaReport",
        "schemaVersion": 1,
        "input": str(path.resolve()),
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "aggregate": aggregate,
        "components": records,
        "structuralVerdict": "reject" if failures else "visual-review-required",
        "failures": failures,
        "warnings": warnings,
        "limits": {
            "aggregateThinRatioMin": 0.12,
            "aggregateVolumeRatioMax": 0.75,
            "dominantFaceShareMin": 0.5,
            "dominantThinRatioMin": 0.22,
            "substantialFaceShareMin": 0.05,
            "slabThinRatioMin": 0.08,
        },
        "disclaimer": "Structural QA cannot certify anatomy, identity, rig readiness, or rendered quality.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = inspect(args.input)
    payload = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload, encoding="utf-8")
    print(payload, end="")
    return 1 if report["structuralVerdict"] == "reject" else 0


if __name__ == "__main__":
    raise SystemExit(main())
