#!/usr/bin/env python3
# pyright: reportMissingImports=false
"""Rank a private animation-frame corpus against a canonical creature image.

This is a discovery tool only: it writes contact sheets and a manifest under a
private experiment directory. It never copies reference frames into public/.
Run it with the Hunyuan venv (and PYTHONPATH unset) so Torch/Transformers are
available.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageOps

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass(frozen=True)
class Candidate:
    path: Path
    score: float


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True, type=Path)
    parser.add_argument("--corpus", required=True, action="append", type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--model", default="facebook/dinov2-giant")
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--top-k", type=int, default=48)
    parser.add_argument("--local-files-only", action="store_true")
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_paths(roots: Iterable[Path]) -> list[Path]:
    paths = {
        path.resolve()
        for root in roots
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS
    }
    return sorted(paths)


def open_rgb(path: Path) -> Image.Image:
    image = Image.open(path)
    if image.mode == "RGBA":
        background = Image.new("RGBA", image.size, "white")
        background.alpha_composite(image)
        image = background
    return image.convert("RGB")


def batches(items: list[Path], size: int) -> Iterable[list[Path]]:
    for index in range(0, len(items), size):
        yield items[index : index + size]


def make_contact_sheet(candidates: list[Candidate], destination: Path) -> None:
    thumb_size = (320, 180)
    label_height = 38
    columns = 4
    rows = (len(candidates) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * 336, rows * (thumb_size[1] + label_height + 16)), "#151820")
    draw = ImageDraw.Draw(sheet)
    for index, candidate in enumerate(candidates):
        x = (index % columns) * 336 + 8
        y = (index // columns) * (thumb_size[1] + label_height + 16) + 8
        image = ImageOps.fit(open_rgb(candidate.path), thumb_size, method=Image.Resampling.LANCZOS)
        sheet.paste(image, (x, y))
        draw.text((x, y + thumb_size[1] + 4), f"{index + 1:02d}  {candidate.score:.4f}", fill="white")
        draw.text((x, y + thumb_size[1] + 19), candidate.path.name[:42], fill="#aeb8ca")
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, quality=92)


def main() -> int:
    args = parse_args()
    if not args.query.is_file():
        raise SystemExit(f"query not found: {args.query}")
    paths = image_paths(args.corpus)
    if not paths:
        raise SystemExit("no corpus images found")

    import torch
    import torch.nn.functional as torch_functional
    from transformers import AutoImageProcessor, AutoModel

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    processor = AutoImageProcessor.from_pretrained(
        args.model,
        local_files_only=args.local_files_only,
    )
    model = AutoModel.from_pretrained(
        args.model,
        torch_dtype=dtype,
        local_files_only=args.local_files_only,
    ).eval().to(device)

    def embed(images: list[Image.Image]) -> "torch.Tensor":
        inputs = processor(images=images, return_tensors="pt")
        pixel_values = inputs["pixel_values"].to(device=device, dtype=dtype)
        with torch.inference_mode():
            outputs = model(pixel_values=pixel_values)
            vectors = outputs.last_hidden_state[:, 0]
        return torch_functional.normalize(vectors.float(), dim=-1)

    query_vector = embed([open_rgb(args.query)])[0]
    scored: list[Candidate] = []
    for group in batches(paths, max(1, args.batch_size)):
        vectors = embed([open_rgb(path) for path in group])
        scores = vectors @ query_vector
        scored.extend(Candidate(path, float(score)) for path, score in zip(group, scores.cpu()))

    ranked = sorted(scored, key=lambda candidate: candidate.score, reverse=True)[: args.top_k]
    args.out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schemaVersion": 1,
        "purpose": "private-source-discovery-only",
        "query": {"path": str(args.query.resolve()), "sha256": sha256(args.query)},
        "model": args.model,
        "device": device,
        "corpusRoots": [str(path.resolve()) for path in args.corpus],
        "corpusImageCount": len(paths),
        "results": [
            {"rank": index + 1, "path": str(item.path), "score": item.score, "sha256": sha256(item.path)}
            for index, item in enumerate(ranked)
        ],
    }
    (args.out_dir / "ranking.json").write_text(json.dumps(manifest, indent=2) + "\n")
    make_contact_sheet(ranked, args.out_dir / "contact-sheet.jpg")
    print(json.dumps({"count": len(paths), "top": manifest["results"][:5], "outDir": str(args.out_dir)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
