#!/usr/bin/env python3
# pyright: reportMissingImports=false, reportArgumentType=false
"""Select a consensus six-view sheet from multiple Zero123++ seed runs.

Selection is per camera slot. A candidate scores well when it stays close to the
canonical image and agrees with other seeds for that same slot. This is a
triage aid only; a human/vision identity review must still reject semantic
errors such as missing horns, altered ears, or extra limbs.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--query", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--model", default="facebook/dinov2-giant")
    parser.add_argument("--identity-weight", type=float, default=0.55)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--local-files-only", action="store_true")
    return parser.parse_args()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def open_rgb(path: Path) -> Image.Image:
    image = Image.open(path)
    if image.mode == "RGBA":
        canvas = Image.new("RGBA", image.size, "white")
        canvas.alpha_composite(image)
        image = canvas
    return image.convert("RGB")


def make_sheet(selected: list[dict[str, object]], out_path: Path) -> None:
    cell = 512
    label = 38
    sheet = Image.new("RGB", (cell * 2, (cell + label) * 3), "#151820")
    draw = ImageDraw.Draw(sheet)
    for item in selected:
        row = int(item["row"])
        column = int(item["column"])
        image = ImageOps.fit(open_rgb(Path(str(item["path"]))), (cell, cell), method=Image.Resampling.LANCZOS)
        x = column * cell
        y = row * (cell + label)
        sheet.paste(image, (x, y))
        draw.text(
            (x + 8, y + cell + 8),
            f"view {int(item['index']):02d} · seed {int(item['seed'])} · {float(item['consensusScore']):.4f}",
            fill="white",
        )
    sheet.save(out_path, optimize=True)


def main() -> int:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text())
    candidates: list[dict[str, object]] = []
    for record in manifest["records"]:
        for view in record["views"]:
            candidates.append({**view, "seed": record["seed"]})
    if not candidates:
        raise SystemExit("manifest has no generated views")

    import torch
    import torch.nn.functional as torch_functional
    from transformers import AutoImageProcessor, AutoModel

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    processor = AutoImageProcessor.from_pretrained(args.model, local_files_only=args.local_files_only)
    model = AutoModel.from_pretrained(
        args.model,
        torch_dtype=dtype,
        local_files_only=args.local_files_only,
    ).eval().to(device)

    def embed(paths: list[Path]) -> "torch.Tensor":
        vectors: list["torch.Tensor"] = []
        for start in range(0, len(paths), args.batch_size):
            images = [open_rgb(path) for path in paths[start : start + args.batch_size]]
            inputs = processor(images=images, return_tensors="pt")
            pixels = inputs["pixel_values"].to(device=device, dtype=dtype)
            with torch.inference_mode():
                output = model(pixel_values=pixels).last_hidden_state[:, 0]
            vectors.append(torch_functional.normalize(output.float(), dim=-1).cpu())
        return torch.cat(vectors)

    query_vector = embed([args.query])[0]
    vectors = embed([Path(str(item["path"])) for item in candidates])
    by_slot: dict[int, list[int]] = defaultdict(list)
    for offset, item in enumerate(candidates):
        by_slot[int(item["index"])].append(offset)

    selected: list[dict[str, object]] = []
    scored_all: list[dict[str, object]] = []
    identity_weight = min(1.0, max(0.0, args.identity_weight))
    for slot in sorted(by_slot):
        indices = by_slot[slot]
        slot_vectors = vectors[indices]
        agreement = (slot_vectors @ slot_vectors.T).mean(dim=1)
        identity = slot_vectors @ query_vector
        consensus = identity_weight * identity + (1 - identity_weight) * agreement
        for local_index, global_index in enumerate(indices):
            enriched = {
                **candidates[global_index],
                "identityScore": float(identity[local_index]),
                "sameViewAgreement": float(agreement[local_index]),
                "consensusScore": float(consensus[local_index]),
            }
            scored_all.append(enriched)
        best_local = int(consensus.argmax())
        selected.append(scored_all[-len(indices) + best_local])

    args.out_dir.mkdir(parents=True, exist_ok=True)
    sheet_path = args.out_dir / "consensus-sheet.png"
    make_sheet(selected, sheet_path)
    result = {
        "schemaVersion": 1,
        "purpose": "machine-triaged-multiview-consensus-requiring-manual-identity-review",
        "sourceManifest": str(args.manifest.resolve()),
        "query": {"path": str(args.query.resolve()), "sha256": sha256(args.query)},
        "model": args.model,
        "identityWeight": identity_weight,
        "selected": selected,
        "allCandidates": scored_all,
        "consensusSheet": str(sheet_path.resolve()),
        "consensusSheetSha256": sha256(sheet_path),
    }
    result_path = args.out_dir / "consensus.json"
    result_path.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"status": "complete", "selected": len(selected), "sheet": str(sheet_path), "manifest": str(result_path)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
