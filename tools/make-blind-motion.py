#!/usr/bin/env python3
"""Create a labels-hidden, audio-free A/B motion panel with ffmpeg.

The secret side mapping is withheld from judges. Official study video is allowed
only when the output stays outside the product tree.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import shutil
import subprocess
from pathlib import Path

PRODUCT_ROOT = Path(__file__).resolve().parents[1]
PRIVATE_CORPUS = Path("/mnt/zer0models/pokemon_anime").resolve()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ours", type=Path, required=True)
    parser.add_argument("--against", type=Path, required=True)
    parser.add_argument("--ours-start", type=float, default=0)
    parser.add_argument("--against-start", type=float, default=0)
    parser.add_argument("--duration", type=float, default=5)
    parser.add_argument("--seed", type=int, default=6206)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    ours = args.ours.expanduser().resolve()
    against = args.against.expanduser().resolve()
    out_dir = args.out.expanduser().resolve()
    if not ours.is_file() or not against.is_file():
        parser.error("both video inputs must exist")
    if args.duration <= 0:
        parser.error("--duration must be positive")
    if shutil.which("ffmpeg") is None:
        parser.error("ffmpeg is required")
    if PRIVATE_CORPUS in against.parents and (out_dir == PRODUCT_ROOT or PRODUCT_ROOT in out_dir.parents):
        parser.error("refusing to write official study pixels under the product tree")

    out_dir.mkdir(parents=True, exist_ok=True)
    rng = random.Random(args.seed)
    ours_side = rng.choice(["A", "B"])
    side_paths = {ours_side: ours, "B" if ours_side == "A" else "A": against}
    side_starts = {
        ours_side: max(0.0, args.ours_start),
        "B" if ours_side == "A" else "A": max(0.0, args.against_start),
    }

    video = out_dir / "motion-panel-01.mp4"
    font = "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"
    filter_graph = (
        "[0:v]fps=30,scale=640:360:force_original_aspect_ratio=decrease,"
        "pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x05070b,setsar=1,"
        f"drawtext=fontfile={font}:text='A':x=24:y=22:fontsize=40:fontcolor=white:"
        "box=1:boxcolor=black@0.55:boxborderw=8[a];"
        "[1:v]fps=30,scale=640:360:force_original_aspect_ratio=decrease,"
        "pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x05070b,setsar=1,"
        f"drawtext=fontfile={font}:text='B':x=24:y=22:fontsize=40:fontcolor=white:"
        "box=1:boxcolor=black@0.55:boxborderw=8[b];"
        "[a][b]hstack=inputs=2[out]"
    )
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", str(side_starts["A"]), "-i", str(side_paths["A"]),
        "-ss", str(side_starts["B"]), "-i", str(side_paths["B"]),
        "-filter_complex", filter_graph,
        "-map", "[out]", "-t", str(args.duration), "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video),
    ]
    subprocess.run(command, check=True)

    public = {
        "policy": "judge motion and staging without inferring either side's origin",
        "panel": video.name,
        "duration_seconds": args.duration,
        "ballot_fields": ["winner", "locomotion", "camera", "impact", "atmosphere", "blocking_defects"],
    }
    secret = {
        "seed": args.seed,
        "ours_side": ours_side,
        "A": {"path": str(side_paths["A"]), "start": side_starts["A"], "sha256": sha256(side_paths["A"])},
        "B": {"path": str(side_paths["B"]), "start": side_starts["B"], "sha256": sha256(side_paths["B"])},
    }
    (out_dir / "judge-brief.json").write_text(json.dumps(public, indent=2) + "\n")
    secret_path = out_dir / "secret-map.json"
    secret_path.write_text(json.dumps(secret, indent=2) + "\n")
    os.chmod(secret_path, 0o600)
    print(json.dumps({"panel": str(video), "judge_brief": str(out_dir / "judge-brief.json")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
