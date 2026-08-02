#!/usr/bin/env python3
"""Index the private Twilight Wings study corpus without copying it into the game.

The script scans every extracted full frame and keyframe, computes compact visual
features, clusters composition/look representatives, and finds high-motion frame
transitions. All image sheets remain under the private corpus. The product may
commit the JSON manifest (paths + metrics only), never the official pixels.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from sklearn.cluster import MiniBatchKMeans
from sklearn.preprocessing import StandardScaler

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
FRAME_NUMBER = re.compile(r"(?:f|k)_(\d+)$")


def load_thumb(path: Path, width: int = 64, height: int = 36) -> np.ndarray:
    with Image.open(path) as image:
        image = image.convert("RGB")
        image.thumbnail((width, height), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (width, height), (0, 0, 0))
        x = (width - image.width) // 2
        y = (height - image.height) // 2
        canvas.paste(image, (x, y))
        return np.asarray(canvas, dtype=np.float32) / 255.0


def rgb_to_hsv(rgb: np.ndarray) -> np.ndarray:
    # Pillow's HSV conversion is stable and sufficient for corpus indexing.
    arr = np.clip(rgb * 255.0, 0, 255).astype(np.uint8)
    return np.asarray(Image.fromarray(arr, "RGB").convert("HSV"), dtype=np.float32) / 255.0


def feature_vector(rgb: np.ndarray) -> np.ndarray:
    hsv = rgb_to_hsv(rgb)
    luma = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    dx = np.abs(np.diff(luma, axis=1)).mean()
    dy = np.abs(np.diff(luma, axis=0)).mean()
    h, w = luma.shape
    center = luma[h // 4 : (3 * h) // 4, w // 4 : (3 * w) // 4]
    border = np.concatenate((luma[: h // 5].ravel(), luma[-h // 5 :].ravel(), luma[:, : w // 5].ravel(), luma[:, -w // 5 :].ravel()))
    thirds = [luma[: h // 3], luma[h // 3 : (2 * h) // 3], luma[(2 * h) // 3 :]]
    hist = []
    for channel in range(3):
        counts, _ = np.histogram(rgb[..., channel], bins=8, range=(0.0, 1.0), density=True)
        hist.extend(counts.tolist())
    return np.asarray(
        [
            *rgb.mean(axis=(0, 1)),
            *rgb.std(axis=(0, 1)),
            hsv[..., 1].mean(),
            hsv[..., 1].std(),
            luma.mean(),
            luma.std(),
            *np.quantile(luma, [0.1, 0.25, 0.5, 0.75, 0.9]),
            float(dx),
            float(dy),
            center.mean(),
            border.mean(),
            *(part.mean() for part in thirds),
            *hist,
        ],
        dtype=np.float32,
    )


def frame_number(path: Path) -> int:
    match = FRAME_NUMBER.search(path.stem)
    return int(match.group(1)) if match else -1


def nonmax_motion(rows: list[dict], count: int, separation: int) -> list[dict]:
    chosen: list[dict] = []
    for row in sorted(rows, key=lambda item: item.get("motion_delta", 0.0), reverse=True):
        number = row["number"]
        if all(abs(number - prior["number"]) >= separation for prior in chosen):
            chosen.append(row)
            if len(chosen) >= count:
                break
    return chosen


def make_sheet(items: list[dict], output: Path, title: str, cols: int = 8, cell_w: int = 240, cell_h: int = 158) -> None:
    rows = math.ceil(len(items) / cols)
    sheet = Image.new("RGB", (cols * cell_w, 42 + rows * cell_h), (13, 17, 23))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    draw.text((12, 13), title, fill=(236, 240, 245), font=font)
    for index, item in enumerate(items):
        x = (index % cols) * cell_w
        y = 42 + (index // cols) * cell_h
        with Image.open(item["path"]) as image:
            image = image.convert("RGB")
            image.thumbnail((cell_w - 8, cell_h - 30), Image.Resampling.LANCZOS)
            px = x + (cell_w - image.width) // 2
            py = y + 2
            sheet.paste(image, (px, py))
        label = f"{index:02d} {item['episode']} {item['kind'][0]}{item['number']:04d}"
        if "motion_delta" in item:
            label += f" d={item['motion_delta']:.3f}"
        draw.rectangle((x, y + cell_h - 26, x + cell_w, y + cell_h), fill=(13, 17, 23))
        draw.text((x + 6, y + cell_h - 20), label, fill=(225, 231, 239), font=font)
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, quality=94)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("/mnt/zer0models/pokemon_anime"))
    parser.add_argument("--out", type=Path, default=Path("/mnt/zer0models/pokemon_anime/pipeline/reference_index/sol"))
    parser.add_argument("--clusters", type=int, default=64)
    parser.add_argument("--motion-per-episode", type=int, default=10)
    args = parser.parse_args()

    candidates: list[Path] = []
    for source in (args.root / "frames", args.root / "keyframes"):
        if source.exists():
            candidates.extend(sorted(path for path in source.rglob("*") if path.is_file() and path.suffix.lower() in IMAGE_EXTS))
    if not candidates:
        raise SystemExit("No extracted frames/keyframes found")

    rows: list[dict] = []
    thumbs: list[np.ndarray] = []
    features: list[np.ndarray] = []
    previous_by_stream: dict[tuple[str, str], tuple[int, np.ndarray]] = {}

    for path in candidates:
        kind = "keyframe" if "keyframes" in path.parts else "frame"
        episode = path.parent.name
        number = frame_number(path)
        thumb = load_thumb(path)
        vector = feature_vector(thumb)
        stream = (kind, episode)
        motion_delta = None
        previous = previous_by_stream.get(stream)
        if previous is not None and number > previous[0]:
            motion_delta = float(np.mean(np.abs(thumb - previous[1])))
        previous_by_stream[stream] = (number, thumb)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        rows.append(
            {
                "path": str(path),
                "kind": kind,
                "episode": episode,
                "number": number,
                "sha256": digest,
                "mean_luma": float(vector[8]),
                "edge_energy": float(vector[15] + vector[16]),
                **({"motion_delta": motion_delta} if motion_delta is not None else {}),
            }
        )
        thumbs.append(thumb)
        features.append(vector)

    matrix = np.stack(features)
    scaled = StandardScaler().fit_transform(matrix)
    cluster_count = max(1, min(args.clusters, len(rows)))
    model = MiniBatchKMeans(n_clusters=cluster_count, random_state=7, batch_size=256, n_init="auto")
    labels = model.fit_predict(scaled)
    representatives: list[dict] = []
    for cluster in range(cluster_count):
        indices = np.flatnonzero(labels == cluster)
        centroid = model.cluster_centers_[cluster]
        best = int(indices[np.argmin(np.sum((scaled[indices] - centroid) ** 2, axis=1))])
        rows[best]["cluster"] = cluster
        representatives.append(rows[best])
    representatives.sort(key=lambda item: item["cluster"])

    motion: list[dict] = []
    streams = sorted({(row["kind"], row["episode"]) for row in rows})
    for kind, episode in streams:
        stream_rows = [row for row in rows if row["kind"] == kind and row["episode"] == episode and "motion_delta" in row]
        motion.extend(nonmax_motion(stream_rows, args.motion_per_episode, separation=5 if kind == "frame" else 2))
    motion.sort(key=lambda item: (item["episode"], item["kind"], -item["motion_delta"]))

    args.out.mkdir(parents=True, exist_ok=True)
    make_sheet(representatives, args.out / "composition-clusters.jpg", "All extracted frames + keyframes: composition/look cluster representatives")
    make_sheet(motion, args.out / "motion-peaks.jpg", "All streams: high-change transitions (motion/staging candidates)")

    manifest = {
        "corpus_root": str(args.root),
        "policy": "private study only; never copy official pixels into the shipped product",
        "scanned_images": len(rows),
        "frame_count": sum(row["kind"] == "frame" for row in rows),
        "keyframe_count": sum(row["kind"] == "keyframe" for row in rows),
        "cluster_count": cluster_count,
        "composition_representatives": representatives,
        "motion_candidates": motion,
        "sheets": {
            "composition": str(args.out / "composition-clusters.jpg"),
            "motion": str(args.out / "motion-peaks.jpg"),
        },
    }
    (args.out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({key: manifest[key] for key in ("scanned_images", "frame_count", "keyframe_count", "cluster_count", "sheets")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
