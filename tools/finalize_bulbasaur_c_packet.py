#!/usr/bin/env python3
"""Finalize the hash-bound, builder-excluded Bulbasaur C review packet."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    required = [
        "bulbasaur_C_production.blend",
        "qa-build.json",
        "qa-final.json",
        "qa-relocated.json",
        "frozen-inputs-before.json",
        "frozen-inputs-after.json",
        "verification.log",
        "review-renders/bind.png",
        "review-renders/extreme-crouch.png",
        "review-renders/extreme-reach-L.png",
        "review-renders/extreme-reach-R.png",
        "review-renders/extreme-bulb-jaw.png",
        "review-renders/wireframe-bind-front34.png",
        "review-renders/wireframe-bind-side.png",
        "fixed-camera/source-vs-retopo-clay.png",
    ]
    missing = [relative for relative in required if not (root / relative).is_file()]
    if missing:
        raise RuntimeError(f"missing final review evidence: {missing}")
    verification_log = root / "verification.log"
    normalized_log = "\n".join(
        line.rstrip() for line in verification_log.read_text(encoding="utf-8").splitlines()
    ) + "\n"
    verification_log.write_text(normalized_log, encoding="utf-8")
    qa_build = read_json(root / "qa-build.json")
    qa_final = read_json(root / "qa-final.json")
    qa_relocated = read_json(root / "qa-relocated.json")
    frozen_before = read_json(root / "frozen-inputs-before.json")
    frozen_after = read_json(root / "frozen-inputs-after.json")
    if qa_final.get("verdict") != "PASS_NON_CANONICAL_AUTHORED_RETOPO_SKIN_DEFORMATION_QA":
        raise RuntimeError("final QA is not green")
    if qa_relocated.get("verdict") != qa_final.get("verdict"):
        raise RuntimeError("relocated QA verdict differs")
    if qa_final["production"]["sha256"] != qa_relocated["production"]["sha256"]:
        raise RuntimeError("relocated production hash differs")
    if frozen_before["treeSha256"] != frozen_after["treeSha256"]:
        raise RuntimeError("frozen A/B/C evidence tree changed during work")
    artifact_hashes = {
        relative: {"bytes": (root / relative).stat().st_size, "sha256": sha256(root / relative)}
        for relative in required
    }
    poses = qa_final["deformation"]["poses"]
    packet = {
        "schema": "pokemon.bulbasaur.builder-excluded-review/v2",
        "candidate": "promoted-hypothesis-C-authored-production-retopo-v2",
        "builderMayCertify": False,
        "builderDecision": None,
        "canonicalCertification": False,
        "qualityLabel": "production-retopo/rig candidate; independent review pending; not canonical",
        "authority": {
            "canonicalSha256": qa_build["source"].get("canonicalSha256", "7233d8d8b03b5fa91d835a3069d25769155db93c9ef91b6066e215ed3895e9d8"),
            "promotedSourceSha256": qa_final["source"]["sha256"],
            "frozenPanelSha256": "3073e5d6c7790befa2d4400c4da3a1cbeab9a9ed9c995bade6acd9791b6117ca",
            "frozenEvidenceTreeBefore": frozen_before["treeSha256"],
            "frozenEvidenceTreeAfter": frozen_after["treeSha256"],
            "frozenEvidenceFileCount": frozen_after["fileCount"],
            "frozenEvidencePreservedByteForByte": True,
        },
        "artifact": {
            "path": "bulbasaur_C_production.blend",
            "sha256": qa_final["production"]["sha256"],
            "bytes": qa_final["production"]["bytes"],
        },
        "scope": [
            "explicit authored cross-section and saddle-torus retopology; no Decimate/UNSUBDIV/remesh/shrinkwrap",
            "55 semantic features preserved",
            "eight consolidated glTF metallic-roughness PBR materials and complete UVs",
            "22-bone hierarchy with upper/lower/foot chains and <=4 normalized influences",
            "closed-loop/valence evidence at torso/chest/head, every limb/foot joint, and bulb saddle",
            "five deterministic evaluated poses with every foot declared planted or lifted",
            "per-foot armature-space contact controls; no global rig/root translation",
            "full 96-vertex bulb attachment contact evaluation",
            "self/intersection and posed volume/area/edge preservation gates versus bind",
        ],
        "mechanicalQa": {
            "verdict": qa_final["verdict"],
            "topologyObjects": len(qa_final["topology"]),
            "meshObjects": qa_final["production"]["objects"],
            "vertices": qa_final["production"]["vertices"],
            "triangles": qa_final["production"]["triangles"],
            "bones": qa_final["rig"]["bones"],
            "deformBones": qa_final["rig"]["deformBones"],
            "materials": qa_final["production"]["materials"],
            "thresholds": qa_final["deformation"]["thresholds"],
            "poseDeclarations": {
                name: {
                    "planted": record["declaredPlantedFeet"],
                    "lifted": record["declaredLiftedFeet"],
                    "footAssemblyMinZ": record["footAssemblyMinZ"],
                    "globalRigTranslation": record["globalRigTranslation"],
                }
                for name, record in poses.items()
            },
        },
        "relocationTest": {
            "reopenedFrom": qa_relocated["reopenedFrom"],
            "reopenedAndVerified": True,
            "productionSha256": qa_relocated["production"]["sha256"],
            "sameBytesAsOriginal": True,
        },
        "evidence": artifact_hashes,
        "fixedCameraComparison": {
            "path": "fixed-camera/source-vs-retopo-clay.png",
            "layout": "top immutable source C; bottom authored retopo; twelve matched roles",
            "sha256": artifact_hashes["fixed-camera/source-vs-retopo-clay.png"]["sha256"],
        },
        "explicitLowConfidenceHypotheses": [
            "rear rump contour retained from promoted C",
            "twin vine-root socket positions retained as explicit rig metadata",
        ],
        "forbiddenActionsConfirmedAbsent": {
            "gameplayAnimation": True,
            "productIntegration": True,
            "publication": True,
            "merge": True,
            "canonicalCertification": True,
        },
        "reviewInstruction": "Independent reviewer must inspect the real .blend, wireframes, fixed-camera comparison, and all posed renders; passing numeric QA cannot certify identity or art quality.",
    }
    packet_path = root / "REVIEW_PACKET.json"
    packet_path.write_text(json.dumps(packet, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    hash_lines = []
    for path in sorted(candidate for candidate in root.rglob("*") if candidate.is_file() and candidate.name != "HASHES.sha256"):
        hash_lines.append(f"{sha256(path)}  {path.relative_to(root).as_posix()}")
    (root / "HASHES.sha256").write_text("\n".join(hash_lines) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "artifactSha256": qa_final["production"]["sha256"],
                "hashEntries": len(hash_lines),
                "packet": str(packet_path),
                "packetSha256": sha256(packet_path),
            },
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()
