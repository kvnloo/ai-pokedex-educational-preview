#!/usr/bin/env python3
"""Execute and score controlled creature-image preprocessing variations.

The manifest keeps source acquisition separate from derived inputs. Results are
private experiment artifacts; this tool does not publish source pixels.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

RESAMPLERS = {
    "nearest": Image.Resampling.NEAREST,
    "bilinear": Image.Resampling.BILINEAR,
    "bicubic": Image.Resampling.BICUBIC,
    "lanczos": Image.Resampling.LANCZOS,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--realesrgan-bin", type=Path)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def flatten(image: Image.Image, background: tuple[int, int, int]) -> Image.Image:
    rgba = image.convert("RGBA")
    canvas = Image.new("RGBA", rgba.size, background + (255,))
    canvas.alpha_composite(rgba)
    return canvas.convert("RGB")


def square_plate(image: Image.Image, size: int, resampler: Image.Resampling, background: tuple[int, int, int]) -> Image.Image:
    image = flatten(image, background)
    margin = max(1, round(size * 0.055))
    fitted = ImageOps.contain(image, (size - margin * 2, size - margin * 2), method=resampler)
    plate = Image.new("RGB", (size, size), background)
    plate.paste(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    return plate


def run_realesrgan(source: Path, binary: Path, model: str, scale: int, tta: bool) -> Image.Image:
    with tempfile.TemporaryDirectory(prefix="pokemon-sr-") as temp_dir:
        temp = Path(temp_dir)
        input_path = temp / "input.png"
        output_path = temp / "output.png"
        flatten(Image.open(source), (246, 247, 244)).save(input_path)
        command = [str(binary), "-i", str(input_path), "-o", str(output_path), "-s", str(scale), "-n", model]
        if tta:
            command.append("-x")
        process = subprocess.run(command, capture_output=True, text=True)
        if process.returncode != 0 or not output_path.is_file():
            raise RuntimeError(f"Real-ESRGAN failed ({process.returncode}): {process.stdout}\n{process.stderr}")
        return Image.open(output_path).convert("RGB").copy()


def gray_array(image: Image.Image) -> np.ndarray:
    return np.asarray(image.convert("L"), dtype=np.float32) / 255.0


def entropy(values: np.ndarray) -> float:
    histogram, _ = np.histogram(values, bins=256, range=(0.0, 1.0))
    probabilities = histogram[histogram > 0].astype(np.float64)
    probabilities /= probabilities.sum()
    return float(-(probabilities * np.log2(probabilities)).sum())


def metrics(output: Image.Image, source: Image.Image) -> dict[str, float | int]:
    gray = gray_array(output)
    dx = np.diff(gray, axis=1)
    dy = np.diff(gray, axis=0)
    lap = gray[1:-1, :-2] + gray[1:-1, 2:] + gray[:-2, 1:-1] + gray[2:, 1:-1] - 4 * gray[1:-1, 1:-1]
    edge_energy = float((np.abs(dx).mean() + np.abs(dy).mean()) / 2)
    laplacian_variance = float(lap.var())
    edge_mask = np.zeros_like(gray, dtype=bool)
    edge_mask[:, 1:] |= np.abs(dx) > 0.08
    edge_mask[1:, :] |= np.abs(dy) > 0.08
    edge_density = float(edge_mask.mean())
    clipped = float(((gray < 0.01) | (gray > 0.99)).mean())

    reconstructed = output.resize(source.size, Image.Resampling.LANCZOS).convert("RGB")
    source_rgb = flatten(source, (246, 247, 244))
    a = np.asarray(reconstructed, dtype=np.float32)
    b = np.asarray(source_rgb, dtype=np.float32)
    mse = float(np.square(a - b).mean())
    psnr = 99.0 if mse == 0 else float(20 * math.log10(255.0 / math.sqrt(mse)))
    return {
        "width": output.width,
        "height": output.height,
        "entropy": round(entropy(gray), 5),
        "edgeEnergy": round(edge_energy, 7),
        "edgeDensity": round(edge_density, 7),
        "laplacianVariance": round(laplacian_variance, 8),
        "clippedPixelRatio": round(clipped, 7),
        "roundTripPsnrDb": round(psnr, 4),
        "roundTripMse": round(mse, 5),
    }


def build_variant(spec: dict[str, Any], source: Path, binary: Path | None) -> Image.Image:
    method = spec["method"]
    target = int(spec.get("targetSize", 1024))
    background = tuple(spec.get("background", [246, 247, 244]))
    resampler = RESAMPLERS[spec.get("resampler", "lanczos")]
    if method == "plate":
        image = Image.open(source)
    elif method == "resample":
        image = Image.open(source)
        scale = float(spec.get("scale", 4))
        image = flatten(image, background).resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            resampler,
        )
        if spec.get("unsharp"):
            image = image.filter(
                ImageFilter.UnsharpMask(
                    radius=float(spec.get("radius", 1.4)),
                    percent=int(spec.get("percent", 135)),
                    threshold=int(spec.get("threshold", 3)),
                )
            )
    elif method == "realesrgan":
        if binary is None:
            raise RuntimeError("a Real-ESRGAN binary is required for realesrgan variants")
        image = run_realesrgan(
            source,
            binary,
            str(spec.get("model", "realesr-animevideov3")),
            int(spec.get("scale", 4)),
            bool(spec.get("tta", False)),
        )
    else:
        raise ValueError(f"unsupported method: {method}")
    return square_plate(image, target, Image.Resampling.LANCZOS, background)


def make_contact_sheet(records: list[dict[str, Any]], destination: Path) -> None:
    cell = 360
    label = 54
    columns = 4
    rows = (len(records) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * cell, rows * (cell + label)), "#151820")
    draw = ImageDraw.Draw(sheet)
    for index, record in enumerate(records):
        image = Image.open(record["output"])
        thumb = ImageOps.fit(image, (cell - 16, cell - 16), method=Image.Resampling.LANCZOS)
        x = (index % columns) * cell + 8
        y = (index // columns) * (cell + label) + 8
        sheet.paste(thumb, (x, y))
        draw.text((x, y + cell - 2), f"{record['id']} · {record['method']}", fill="white")
        draw.text(
            (x, y + cell + 16),
            f"lap {record['metrics']['laplacianVariance']:.5f} · PSNR {record['metrics']['roundTripPsnrDb']:.1f}",
            fill="#b9c3d5",
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, quality=92)


def main() -> int:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text())
    sources = {item["id"]: Path(item["path"]) for item in manifest["sources"]}
    for source_id, path in sources.items():
        if not path.is_file():
            raise SystemExit(f"source {source_id} not found: {path}")
    if args.realesrgan_bin and not args.realesrgan_bin.is_file():
        raise SystemExit(f"Real-ESRGAN binary not found: {args.realesrgan_bin}")

    args.out_dir.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []
    for index, variant in enumerate(manifest["variants"]):
        source = sources[variant["source"]]
        output = build_variant(variant, source, args.realesrgan_bin)
        output_path = args.out_dir / f"{index + 1:02d}-{variant['id']}.png"
        output.save(output_path, optimize=True)
        record = {
            "id": variant["id"],
            "sourceId": variant["source"],
            "source": str(source.resolve()),
            "sourceSha256": sha256(source),
            "method": variant["method"],
            "parameters": {key: value for key, value in variant.items() if key not in {"id", "source", "method"}},
            "output": str(output_path.resolve()),
            "outputSha256": sha256(output_path),
            "metrics": metrics(output, Image.open(source)),
        }
        records.append(record)
        print(json.dumps({"completed": record["id"], "output": record["output"], "metrics": record["metrics"]}))

    report = {
        "schemaVersion": 1,
        "experimentId": manifest.get("experimentId"),
        "purpose": manifest.get("purpose"),
        "sourcePolicy": manifest.get("sourcePolicy"),
        "records": records,
    }
    (args.out_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    with (args.out_dir / "metrics.csv").open("w", newline="") as handle:
        fields = ["id", "sourceId", "method", "width", "height", "entropy", "edgeEnergy", "edgeDensity", "laplacianVariance", "clippedPixelRatio", "roundTripPsnrDb", "roundTripMse"]
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for record in records:
            writer.writerow({"id": record["id"], "sourceId": record["sourceId"], "method": record["method"], **record["metrics"]})
    make_contact_sheet(records, args.out_dir / "contact-sheet.jpg")
    print(json.dumps({"status": "complete", "variantCount": len(records), "report": str(args.out_dir / 'report.json')}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
