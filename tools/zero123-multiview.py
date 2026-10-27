#!/usr/bin/env python3
# pyright: reportMissingImports=false
"""Generate deterministic six-view sheets with Zero123++.

Run this with the isolated Hunyuan Python environment and PYTHONPATH unset.
The output is a hypothesis set, not canonical truth; every view remains tied to
its source image and seed for later consistency review.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--model", default="sudo-ai/zero123plus-v1.2")
    parser.add_argument("--pipeline", default="sudo-ai/zero123plus-pipeline")
    parser.add_argument("--seed", type=int, action="append", required=True)
    parser.add_argument("--steps", type=int, default=50)
    parser.add_argument("--local-files-only", action="store_true")
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def flatten_on_white(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    canvas = Image.new("RGBA", rgba.size, "white")
    canvas.alpha_composite(rgba)
    return canvas.convert("RGB")


def split_sheet(sheet: Image.Image, out_dir: Path, seed: int) -> list[dict[str, object]]:
    # Zero123++ v1.2 emits a 2-column × 3-row six-view sheet.
    columns, rows = 2, 3
    cell_width, cell_height = sheet.width // columns, sheet.height // rows
    views: list[dict[str, object]] = []
    index = 0
    for row in range(rows):
        for column in range(columns):
            index += 1
            box = (
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )
            path = out_dir / f"seed-{seed}-view-{index:02d}.png"
            sheet.crop(box).save(path, optimize=True)
            views.append(
                {
                    "index": index,
                    "row": row,
                    "column": column,
                    "path": str(path.resolve()),
                    "sha256": sha256(path),
                }
            )
    return views


def main() -> int:
    args = parse_args()
    if not args.image.is_file():
        raise SystemExit(f"input not found: {args.image}")
    args.out_dir.mkdir(parents=True, exist_ok=True)

    import torch
    from diffusers import DiffusionPipeline, EulerAncestralDiscreteScheduler

    if not torch.cuda.is_available():
        raise SystemExit("CUDA is required for this experiment")
    pipeline = DiffusionPipeline.from_pretrained(
        args.model,
        custom_pipeline=args.pipeline,
        torch_dtype=torch.float16,
        local_files_only=args.local_files_only,
    )
    pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
        pipeline.scheduler.config,
        timestep_spacing="trailing",
    )
    pipeline.to("cuda")
    pipeline.enable_attention_slicing()

    conditioning = flatten_on_white(Image.open(args.image))
    records: list[dict[str, object]] = []
    for seed in args.seed:
        generator = torch.Generator(device="cuda").manual_seed(seed)
        result = pipeline(
            conditioning,
            num_inference_steps=args.steps,
            generator=generator,
        ).images[0]
        sheet_path = args.out_dir / f"seed-{seed}-sheet.png"
        result.save(sheet_path, optimize=True)
        record = {
            "seed": seed,
            "sheet": str(sheet_path.resolve()),
            "sheetSha256": sha256(sheet_path),
            "views": split_sheet(result, args.out_dir, seed),
        }
        records.append(record)
        print(json.dumps({"completedSeed": seed, "sheet": str(sheet_path), "viewCount": 6}), flush=True)

    manifest = {
        "schemaVersion": 1,
        "purpose": "novel-view-hypotheses-for-manual-consistency-review",
        "warning": "Generated views are hypotheses, not canonical evidence. Reject drift before reconstruction.",
        "source": {"path": str(args.image.resolve()), "sha256": sha256(args.image)},
        "model": args.model,
        "customPipeline": args.pipeline,
        "steps": args.steps,
        "records": records,
    }
    manifest_path = args.out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"status": "complete", "manifest": str(manifest_path), "seedCount": len(records)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
