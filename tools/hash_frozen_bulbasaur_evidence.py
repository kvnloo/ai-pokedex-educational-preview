#!/usr/bin/env python3
"""Hash the immutable Bulbasaur manual-v1 evidence tree deterministically."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

DEFAULT_ROOT = Path(
    "/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/"
    "bulbasaur/production/manual-v1"
)


def file_sha256(path: Path) -> bytes:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.digest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    files = sorted(path for path in root.rglob("*") if path.is_file())
    tree = hashlib.sha256()
    total_bytes = 0
    selected: dict[str, str] = {}
    selected_names = {
        "blind-packet-v1/BALLOT.json",
        "blind-packet-v1/X01-12role.png",
        "blind-packet-v1/X02-12role.png",
        "blind-packet-v1/X03-12role.png",
        "hypothesis-A/bulbasaur_manual_v1_A.blend",
        "hypothesis-B/bulbasaur_manual_v1_B.blend",
        "hypothesis-C/bulbasaur_manual_v1_C.blend",
    }
    for path in files:
        relative = path.relative_to(root).as_posix()
        relative_bytes = relative.encode("utf-8")
        content_digest = file_sha256(path)
        tree.update(len(relative_bytes).to_bytes(4, "big"))
        tree.update(relative_bytes)
        tree.update(content_digest)
        total_bytes += path.stat().st_size
        if relative in selected_names:
            selected[relative] = content_digest.hex()
    payload = json.dumps(
        {
            "algorithm": "sha256(concat(len4be(relpath), relpath, sha256(file)))",
            "fileCount": len(files),
            "root": str(root),
            "selected": selected,
            "totalBytes": total_bytes,
            "treeSha256": tree.hexdigest(),
        },
        indent=2,
        sort_keys=True,
    )
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload + "\n", encoding="utf-8")
    print(payload)


if __name__ == "__main__":
    main()
