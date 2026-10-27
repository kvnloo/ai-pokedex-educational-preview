#!/usr/bin/env python3
# pyright: reportMissingImports=false
"""Run matched Hunyuan3D generations across source-image variants.

The source sweep holds seed and shape parameters constant. Run this only after
the Hunyuan API is healthy, using the Hunyuan venv with PYTHONPATH unset.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-report", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--variant", action="append", dest="variants")
    parser.add_argument("--server", default="http://127.0.0.1:8081")
    parser.add_argument("--seed", type=int, default=83101)
    parser.add_argument("--steps", type=int, default=20)
    parser.add_argument("--octree", type=int, default=384)
    parser.add_argument("--guidance", type=float, default=7.5)
    parser.add_argument("--chunks", type=int, default=12000)
    parser.add_argument("--timeout", type=int, default=600)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def health(server: str, timeout: int) -> dict[str, Any]:
    with urllib.request.urlopen(f"{server.rstrip('/')}/health", timeout=timeout) as response:
        return json.loads(response.read())


def generate(server: str, image_path: Path, destination: Path, parameters: dict[str, Any], timeout: int) -> dict[str, Any]:
    payload = {
        "image": base64.b64encode(image_path.read_bytes()).decode("ascii"),
        "remove_background": True,
        "texture": False,
        **parameters,
    }
    request = urllib.request.Request(
        f"{server.rstrip('/')}/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started = time.monotonic()
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read()
        content_type = response.headers.get("Content-Type", "")
        status = response.status
    duration = time.monotonic() - started
    if status != 200 or "model/gltf-binary" not in content_type:
        raise RuntimeError(f"unexpected Hunyuan response: status={status} type={content_type} bytes={len(body)}")
    destination.write_bytes(body)
    return {
        "httpStatus": status,
        "contentType": content_type,
        "durationSeconds": round(duration, 3),
        "bytes": len(body),
        "sha256": sha256(destination),
    }


def mesh_qa(path: Path) -> dict[str, Any]:
    import numpy as np
    import trimesh

    loaded = trimesh.load(str(path), force="scene")
    geometries = list(loaded.geometry.values()) if isinstance(loaded, trimesh.Scene) else [loaded]
    geometries = [geometry for geometry in geometries if hasattr(geometry, "faces") and len(geometry.faces)]
    if not geometries:
        return {"ok": False, "reason": "empty-scene"}
    mesh = trimesh.util.concatenate(geometries)
    extents = np.asarray(mesh.extents, dtype=float)
    longest = max(float(extents.max()), 1e-9)
    thin_ratio = float(extents.min() / longest)
    bounding_volume = float(mesh.bounding_box.volume)
    volume_ratio = float(abs(mesh.volume) / bounding_volume) if mesh.is_volume and bounding_volume > 0 else 0.0
    faces = int(len(mesh.faces))
    vertices = int(len(mesh.vertices))
    failures: list[str] = []
    if not np.isfinite(extents).all() or (extents <= 0).any():
        failures.append("degenerate-bounds")
    if faces < 200:
        failures.append("too-few-faces")
    if thin_ratio < 0.12:
        failures.append("paper-thin")
    if volume_ratio > 0.75:
        failures.append("cube-like")
    return {
        "ok": not failures,
        "failures": failures,
        "meshCount": len(geometries),
        "faceCount": faces,
        "vertexCount": vertices,
        "extents": [round(float(value), 6) for value in extents],
        "thinRatio": round(thin_ratio, 6),
        "volumeOverBoundingBox": round(volume_ratio, 6),
        "watertight": bool(mesh.is_watertight),
        "bodyCount": int(mesh.body_count),
    }


def main() -> int:
    args = parse_args()
    source_report = json.loads(args.source_report.read_text())
    selected_ids = set(args.variants or [])
    records = [
        record for record in source_report["records"]
        if not selected_ids or record["id"] in selected_ids
    ]
    if selected_ids:
        missing = selected_ids - {record["id"] for record in records}
        if missing:
            raise SystemExit(f"variant IDs not found: {sorted(missing)}")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    server_health = health(args.server, min(args.timeout, 30))
    parameters = {
        "seed": args.seed,
        "num_inference_steps": args.steps,
        "octree_resolution": args.octree,
        "guidance_scale": args.guidance,
        "num_chunks": args.chunks,
    }
    outputs: list[dict[str, Any]] = []
    for index, source_record in enumerate(records):
        variant_id = str(source_record["id"])
        image_path = Path(source_record["output"])
        destination = args.out_dir / f"{index + 1:02d}-{variant_id}.glb"
        result: dict[str, Any] = {
            "variantId": variant_id,
            "sourceImage": str(image_path.resolve()),
            "sourceImageSha256": sha256(image_path),
            "mesh": str(destination.resolve()),
            "parameters": parameters,
        }
        try:
            result["generation"] = generate(args.server, image_path, destination, parameters, args.timeout)
            result["qa"] = mesh_qa(destination)
            print(json.dumps({"completed": variant_id, "generation": result["generation"], "qa": result["qa"]}), flush=True)
        except (urllib.error.URLError, TimeoutError, RuntimeError, ValueError) as error:
            result["error"] = str(error)
            print(json.dumps({"failed": variant_id, "error": str(error)}), flush=True)
        outputs.append(result)

    report = {
        "schemaVersion": 1,
        "purpose": "matched-source-image-sweep",
        "server": args.server,
        "serverHealth": server_health,
        "sourceReport": str(args.source_report.resolve()),
        "heldConstant": parameters,
        "records": outputs,
    }
    report_path = args.out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    failures = [record for record in outputs if record.get("error") or not record.get("qa", {}).get("ok")]
    print(json.dumps({"status": "complete", "candidateCount": len(outputs), "failureCount": len(failures), "report": str(report_path)}))
    return 1 if any(record.get("error") for record in outputs) else 0


if __name__ == "__main__":
    raise SystemExit(main())
