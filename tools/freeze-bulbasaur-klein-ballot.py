#!/usr/bin/env python3
"""Freeze a labels-hidden Bulbasaur Klein ballot before visual decode."""
from __future__ import annotations

import hashlib
import json
import pathlib
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path("/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/bulbasaur")
TOURNAMENT = ROOT / "tournament/klein"
REFERENCE = ROOT / "reference/bulbasaur_official_artwork.png"
LABELS = ("A", "B", "C", "D")


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    source_manifest = json.loads((TOURNAMENT / "manifest.json").read_text())
    records = sorted(source_manifest["records"], key=lambda record: record["output_sha256"])
    if len(records) != len(LABELS):
        raise RuntimeError(f"Expected exactly {len(LABELS)} candidates, got {len(records)}")
    ballot_entries = []
    panels = []
    font = ImageFont.load_default(size=28)
    reference = Image.open(REFERENCE).convert("RGB")
    reference.thumbnail((512, 512), Image.Resampling.LANCZOS)
    reference_panel = Image.new("RGB", (544, 576), "white")
    reference_panel.paste(reference, ((544 - reference.width) // 2, 42 + (512 - reference.height) // 2))
    ImageDraw.Draw(reference_panel).text((16, 10), "IDENTITY AUTHORITY", fill="black", font=font)
    panels.append(reference_panel)
    for label, record in zip(LABELS, records, strict=True):
        source = TOURNAMENT / record["output"]
        image = Image.open(source).convert("RGB")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        panel = Image.new("RGB", (544, 576), "white")
        panel.paste(image, ((544 - image.width) // 2, 42 + (512 - image.height) // 2))
        ImageDraw.Draw(panel).text((16, 10), f"CANDIDATE {label}", fill="black", font=font)
        panels.append(panel)
        ballot_entries.append({"label": label, "sha256": record["output_sha256"], "bytes": record["bytes"]})
    sheet = Image.new("RGB", (544 * len(panels), 576), (230, 230, 230))
    for index, panel in enumerate(panels):
        sheet.paste(panel, (544 * index, 0))
    sheet_path = TOURNAMENT / "ballot-klein-identity.png"
    sheet.save(sheet_path, format="PNG", compress_level=6)
    ballot = {
        "schema": "pokemon.bulbasaur.blind-ballot.v1",
        "status": "FROZEN_AWAITING_BUILDER_EXCLUDED_VERDICT",
        "ballot_scope": "klein_identity_vs_canonical",
        "identity_authority_sha256": sha256(REFERENCE),
        "candidate_order": ballot_entries,
        "sheet": sheet_path.name,
        "sheet_sha256": sha256(sheet_path),
        "verdict_fields": {
            "identity": None,
            "reconstruction_fidelity": "NOT_YET_APPLICABLE",
            "runtime_product_improvement": "NOT_YET_APPLICABLE",
        },
    }
    ballot_path = TOURNAMENT / "ballot-klein-identity.json"
    ballot_path.write_text(json.dumps(ballot, indent=2) + "\n")
    print(json.dumps(ballot, indent=2))


if __name__ == "__main__":
    main()
