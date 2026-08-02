#!/usr/bin/env python3
"""Create labels-hidden A/B panels for independent visual judges.

Candidate origin is randomized and stored only in secret-map.json. Official study
frames may be used as private comparators, but a hard guard prevents any composite
containing them from being written inside the product repository.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PRODUCT_ROOT = Path(__file__).resolve().parents[1]
PRIVATE_CORPUS = Path("/mnt/zer0models/pokemon_anime")


def is_within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def fit_image(path: Path, width: int, height: int) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGB")
    scale = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (width, height), (7, 10, 14))
    canvas.paste(image, ((width - size[0]) // 2, (height - size[1]) // 2))
    return canvas


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ours", type=Path, action="append", required=True, help="Current build frame; repeat for multiple panels")
    parser.add_argument("--against", type=Path, action="append", required=True, help="Reference/previous frame; repeat for multiple panels")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--seed", type=int, default=7602)
    parser.add_argument("--title", default="Choose the stronger shipping-quality frame in one second")
    args = parser.parse_args()

    if len(args.ours) != len(args.against):
        raise SystemExit("--ours and --against counts must match")
    for path in [*args.ours, *args.against]:
        if not path.is_file():
            raise SystemExit(f"Missing input: {path}")

    contains_private_pixels = any(is_within(path, PRIVATE_CORPUS) for path in args.against)
    if contains_private_pixels and is_within(args.out, PRODUCT_ROOT):
        raise SystemExit("Refusing to write a panel containing private official pixels inside the product tree")

    args.out.mkdir(parents=True, exist_ok=True)
    rng = random.Random(args.seed)
    font = ImageFont.load_default(size=22)
    small = ImageFont.load_default(size=16)
    secret_panels: list[dict[str, object]] = []
    public_panels: list[dict[str, object]] = []
    secret: dict[str, object] = {
        "seed": args.seed,
        "policy": "withhold this file from judges until all ballots are final",
        "panels": secret_panels,
    }
    public: dict[str, object] = {
        "title": args.title,
        "instructions": [
            "Origin labels are hidden. Judge only the pixels.",
            "Choose A or B in one second, then state concrete reasons.",
            "Fail both if both read as prototypes; a forced preference is still required.",
        ],
        "panels": public_panels,
    }

    for index, (ours_path, against_path) in enumerate(zip(args.ours, args.against, strict=True), start=1):
        ours_path = ours_path.resolve()
        against_path = against_path.resolve()
        ours_side = rng.choice(("A", "B"))
        paths = {ours_side: ours_path, "B" if ours_side == "A" else "A": against_path}
        frame_w, frame_h = 960, 540
        gutter, header = 24, 70
        panel = Image.new("RGB", (frame_w * 2 + gutter, frame_h + header), (7, 10, 14))
        draw = ImageDraw.Draw(panel)
        title_box = draw.textbbox((0, 0), args.title, font=small)
        title_w = title_box[2] - title_box[0]
        draw.text(((panel.width - title_w) // 2, 12), args.title, fill=(226, 232, 241), font=small)
        for side, x in (("A", 0), ("B", frame_w + gutter)):
            panel.paste(fit_image(paths[side], frame_w, frame_h), (x, header))
            draw.rounded_rectangle((x + 12, header + 12, x + 58, header + 54), radius=8, fill=(10, 14, 20), outline=(235, 239, 245), width=2)
            draw.text((x + 27, header + 20), side, fill=(248, 250, 252), font=font)
        filename = f"panel-{index:02d}.jpg"
        panel.save(args.out / filename, quality=94, subsampling=0)
        secret_panels.append(
            {
                "id": index,
                "file": filename,
                "ours_side": ours_side,
                "A": {"path": str(paths["A"]), "sha256": digest(paths["A"])},
                "B": {"path": str(paths["B"]), "sha256": digest(paths["B"])},
            }
        )
        public_panels.append({"id": index, "file": filename, "choices": ["A", "B"]})

    secret_path = args.out / "secret-map.json"
    secret_path.write_text(json.dumps(secret, indent=2) + "\n")
    secret_path.chmod(0o600)
    (args.out / "ballot.json").write_text(json.dumps(public, indent=2) + "\n")
    print(json.dumps({"panels": len(args.ours), "out": str(args.out), "ballot": str(args.out / "ballot.json"), "secret": str(secret_path), "private_pixels": contains_private_pixels}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
