#!/usr/bin/env python3
"""Create a frozen labels-hidden grid for an N-way visual bake-off.

Paths and candidate IDs are retained only in secret-map.json. The public
manifest contains neutral labels and hashes, preventing expected-winner hints.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", action="append", required=True, help="candidate-id=/absolute/path.png")
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--seed", required=True, type=int)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--cell-size", type=int, default=420)
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    args = parse_args()
    candidates: list[tuple[str, Path]] = []
    for raw in args.image:
        candidate_id, separator, raw_path = raw.partition("=")
        if not separator or not candidate_id or not raw_path:
            raise SystemExit(f"invalid --image value: {raw}")
        path = Path(raw_path)
        if not path.is_file():
            raise SystemExit(f"candidate not found: {path}")
        candidates.append((candidate_id, path.resolve()))
    if len(candidates) < 2:
        raise SystemExit("at least two candidates are required")

    rng = random.Random(args.seed)
    rng.shuffle(candidates)
    args.out_dir.mkdir(parents=True, exist_ok=True)
    labels = [f"V{index + 1:02d}" for index in range(len(candidates))]
    columns = max(1, args.columns)
    rows = (len(candidates) + columns - 1) // columns
    label_height = 52
    sheet = Image.new(
        "RGB",
        (columns * args.cell_size, rows * (args.cell_size + label_height)),
        "#11141b",
    )
    draw = ImageDraw.Draw(sheet)
    secret_entries: list[dict[str, str]] = []
    public_entries: list[dict[str, str]] = []
    for index, ((candidate_id, path), label) in enumerate(zip(candidates, labels)):
        column = index % columns
        row = index // columns
        x = column * args.cell_size
        y = row * (args.cell_size + label_height)
        image = ImageOps.fit(
            Image.open(path).convert("RGB"),
            (args.cell_size, args.cell_size),
            method=Image.Resampling.LANCZOS,
        )
        sheet.paste(image, (x, y))
        draw.rectangle((x, y + args.cell_size, x + args.cell_size, y + args.cell_size + label_height), fill="#171c26")
        draw.text((x + 16, y + args.cell_size + 16), label, fill="white")
        image_hash = sha256(path)
        public_entries.append({"label": label, "sha256": image_hash})
        secret_entries.append({"label": label, "candidateId": candidate_id, "path": str(path), "sha256": image_hash})

    grid_path = args.out_dir / "blind-grid.jpg"
    sheet.save(grid_path, quality=94)
    public_manifest = {
        "schemaVersion": 1,
        "labelsHidden": True,
        "seedWithheld": True,
        "grid": "blind-grid.jpg",
        "gridSha256": sha256(grid_path),
        "entries": public_entries,
    }
    secret_map = {
        "schemaVersion": 1,
        "seed": args.seed,
        "grid": str(grid_path.resolve()),
        "gridSha256": sha256(grid_path),
        "entries": secret_entries,
    }
    (args.out_dir / "manifest.json").write_text(json.dumps(public_manifest, indent=2) + "\n")
    (args.out_dir / "secret-map.json").write_text(json.dumps(secret_map, indent=2) + "\n")
    print(json.dumps({"grid": str(grid_path), "sha256": public_manifest["gridSha256"], "candidateCount": len(candidates)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
