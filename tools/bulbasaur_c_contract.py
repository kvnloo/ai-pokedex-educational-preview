#!/usr/bin/env python3
"""Frozen contract for the authored Bulbasaur C production-retopo lane."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

SOURCE = Path(
    "/mnt/zer0models/pokemon_anime/pipeline/pokeapi/kanto-starters/"
    "bulbasaur/production/manual-v1/hypothesis-C/bulbasaur_manual_v1_C.blend"
)
FROZEN_EVIDENCE_ROOT = SOURCE.parents[1]
EXPECTED_SOURCE_SHA256 = (
    "103bb4dd3074b423cf2d868f320283c786d1762dd59708ed775b81c76613178a"
)
EXPECTED_FROZEN_TREE_SHA256 = (
    "ea4c0534306b8c821c5975f34c850955faf4f5919a938c03cdb49a30cf1d1dc2"
)
EXPECTED_FROZEN_FILE_COUNT = 281
CANONICAL_SOURCE_SHA256 = (
    "7233d8d8b03b5fa91d835a3069d25769155db93c9ef91b6066e215ed3895e9d8"
)
PROMOTED_PANEL_SHA256 = (
    "3073e5d6c7790befa2d4400c4da3a1cbeab9a9ed9c995bade6acd9791b6117ca"
)
BALLOT_SHA256 = "d57a5c3932ce8300d4fdee07c370657db263d1b43c6586561674b0d1e09c57a2"

FOOT_NAMES = (
    "foot_front_L",
    "foot_front_R",
    "foot_rear_L",
    "foot_rear_R",
)

# Each station list is deliberately authored rather than inferred by an automatic
# remesher. Named stations become closed edge-loop vertex groups in the .blend.
LOFT_SPECS: dict[str, dict[str, Any]] = {
    "torso": {
        "axis": "Y",
        "segments": 32,
        "stations": [-0.96, -0.90, -0.82, -0.72, -0.62, -0.48, -0.32, -0.16, 0.0, 0.18, 0.38, 0.56, 0.72, 0.84, 0.92, 0.96],
        "loops": {
            "torso_chest_primary": -0.72,
            "torso_chest_support": -0.62,
            "torso_rear_support": 0.84,
        },
    },
    "chest": {
        "axis": "Y",
        "segments": 28,
        "stations": [-0.96, -0.90, -0.80, -0.70, -0.58, -0.44, -0.28, -0.12, 0.08, 0.28, 0.48, 0.66, 0.80, 0.90, 0.96],
        "loops": {
            "chest_neck_primary": -0.70,
            "chest_neck_support": -0.58,
            "chest_torso_primary": 0.80,
        },
    },
    "head": {
        "axis": "Y",
        "segments": 32,
        "stations": [-0.96, -0.90, -0.80, -0.68, -0.56, -0.42, -0.26, -0.08, 0.12, 0.30, 0.48, 0.64, 0.78, 0.88, 0.94, 0.97],
        "loops": {
            "head_muzzle_primary": -0.56,
            "head_muzzle_support": -0.42,
            "head_neck_primary": 0.78,
            "head_neck_support": 0.88,
        },
    },
    "muzzle": {
        "axis": "Y",
        "segments": 28,
        "stations": [-0.96, -0.88, -0.76, -0.64, -0.50, -0.34, -0.16, 0.04, 0.24, 0.44, 0.62, 0.76, 0.88, 0.95],
        "loops": {
            "muzzle_mouth_primary": -0.64,
            "muzzle_head_primary": 0.76,
            "muzzle_head_support": 0.88,
        },
    },
    "bulb_core": {
        "axis": "Z",
        "segments": 24,
        "stations": [-0.96, -0.90, -0.80, -0.70, -0.58, -0.42, -0.24, -0.04, 0.18, 0.40, 0.60, 0.76, 0.88, 0.95],
        "loops": {
            "bulb_core_root_primary": -0.70,
            "bulb_core_root_support": -0.58,
            "bulb_core_tip_support": 0.76,
        },
    },
}

LIMB_STATIONS = [-0.96, -0.90, -0.82, -0.70, -0.56, -0.42, -0.26, -0.08, 0.12, 0.32, 0.50, 0.66, 0.80, 0.90, 0.96]
FOOT_STATIONS = [-0.96, -0.90, -0.80, -0.68, -0.54, -0.40, -0.24, -0.06, 0.14, 0.34, 0.52, 0.68, 0.82, 0.91, 0.96]
LOBE_STATIONS = [-0.96, -0.90, -0.80, -0.70, -0.58, -0.44, -0.28, -0.10, 0.10, 0.30, 0.48, 0.64, 0.78, 0.88, 0.95]

for region in ("front", "rear"):
    for side in ("L", "R"):
        limb = f"limb_{region}_{side}"
        foot = f"foot_{region}_{side}"
        LOFT_SPECS[limb] = {
            "axis": "Z",
            "segments": 20,
            "stations": LIMB_STATIONS,
            "loops": {
                f"{limb}_foot_joint": -0.42,
                f"{limb}_knee_joint": 0.12,
                f"{limb}_body_joint": 0.80,
            },
        }
        LOFT_SPECS[foot] = {
            "axis": "Y",
            "segments": 24,
            "stations": FOOT_STATIONS,
            "loops": {
                f"{foot}_toe_root": -0.54,
                f"{foot}_midfoot": 0.14,
                f"{foot}_ankle_joint": 0.68,
            },
        }

for index in range(1, 7):
    name = f"bulb_lobe_{index}"
    LOFT_SPECS[name] = {
        "axis": "Y",
        "segments": 24,
        "stations": LOBE_STATIONS,
        "loops": {
            f"{name}_root_primary": -0.70,
            f"{name}_root_support": -0.58,
            f"{name}_tip_support": 0.78,
        },
    }

TORUS_SPEC = {
    "name": "bulb_attachment",
    "majorSegments": 32,
    "minorSegments": 12,
    "contactMinorIndices": (8, 9, 10),
    "contactLoops": (
        "bulb_torso_contact_outer",
        "bulb_torso_contact_center",
        "bulb_torso_contact_inner",
    ),
}

DEFORMATION_SURFACES = tuple(sorted((*LOFT_SPECS.keys(), TORUS_SPEC["name"])))

POSES: dict[str, dict[str, Any]] = {
    "bind": {
        "rotationsDeg": {},
        "planted": list(FOOT_NAMES),
        "lifted": [],
    },
    "extreme-crouch": {
        "rotationsDeg": {
            "torso": (8, 0, 0),
            "chest": (-10, 0, 0),
            "head": (-12, 0, 0),
            "leg.front.L.upper": (24, 0, 0),
            "leg.front.R.upper": (24, 0, 0),
            "leg.front.L.lower": (-34, 0, 0),
            "leg.front.R.lower": (-34, 0, 0),
            "leg.rear.L.upper": (-20, 0, 0),
            "leg.rear.R.upper": (-20, 0, 0),
            "leg.rear.L.lower": (30, 0, 0),
            "leg.rear.R.lower": (30, 0, 0),
        },
        "planted": list(FOOT_NAMES),
        "lifted": [],
    },
    "extreme-reach-L": {
        "rotationsDeg": {
            "chest": (0, -12, -10),
            "neck": (0, 10, 8),
            "head": (0, 16, 16),
            "leg.front.L.upper": (-24, 0, -8),
            "leg.front.L.lower": (12, 0, 4),
            "foot.front.L": (12, 0, 0),
        },
        "planted": ["foot_front_R", "foot_rear_L", "foot_rear_R"],
        "lifted": ["foot_front_L"],
    },
    "extreme-reach-R": {
        "rotationsDeg": {
            "chest": (0, 12, 10),
            "neck": (0, -10, -8),
            "head": (0, -16, -16),
            "leg.front.R.upper": (-24, 0, 8),
            "leg.front.R.lower": (12, 0, -4),
            "foot.front.R": (12, 0, 0),
        },
        "planted": ["foot_front_L", "foot_rear_L", "foot_rear_R"],
        "lifted": ["foot_front_R"],
    },
    "extreme-bulb-jaw": {
        "rotationsDeg": {
            "bulb.base": (14, 12, 0),
            "bulb.tip": (-18, 0, 0),
            "jaw": (-24, 0, 0),
        },
        "planted": list(FOOT_NAMES),
        "lifted": [],
    },
}

QA_THRESHOLDS = {
    "footContactToleranceM": 0.006,
    "liftedFootClearanceM": 0.045,
    "bulbContactMaxPositiveSeparationM": 0.025,
    "bulbContactMaxP95AbsoluteDistanceM": 0.13,
    "bulbContactMaxPenetrationM": 0.14,
    "bulbContactMinInsideFraction": 0.50,
    "selfIntersectionMaxPairs": 0,
    "forbiddenIntersectionMaxPairs": 0,
    "volumeRatioMin": 0.68,
    "volumeRatioMax": 1.32,
    "surfaceAreaRatioMin": 0.72,
    "surfaceAreaRatioMax": 1.36,
    "edgeLengthRatioP05Min": 0.62,
    "edgeLengthRatioP95Max": 1.48,
    "sourceSurfaceMeanDistanceM": 0.010,
    "sourceSurfaceMaxDistanceM": 0.035,
    "maxInfluencesPerVertex": 4,
    "minBoundaryMultiInfluenceFraction": 0.80,
    "minSurfaceMultiInfluenceFraction": 0.18,
    "minQuadFraction": 0.84,
}

FORBIDDEN_INTERSECTION_PAIRS = (
    ("limb_front_L", "limb_front_R"),
    ("limb_rear_L", "limb_rear_R"),
    ("foot_front_L", "foot_front_R"),
    ("foot_rear_L", "foot_rear_R"),
    ("foot_front_L", "foot_rear_L"),
    ("foot_front_R", "foot_rear_R"),
    ("head", "bulb_core"),
    ("muzzle", "bulb_attachment"),
)

PALETTE = {
    "skin": (0.155, 0.59, 0.52, 1.0),
    "spot": (0.035, 0.30, 0.32, 1.0),
    "bulb": (0.11, 0.40, 0.15, 1.0),
    "bulb_dark": (0.045, 0.19, 0.065, 1.0),
    "eye": (0.70, 0.055, 0.085, 1.0),
    "pupil": (0.012, 0.008, 0.012, 1.0),
    "mouth": (0.11, 0.018, 0.028, 1.0),
    "accent": (0.91, 0.75, 0.64, 1.0),
}


def sha256_path(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def hash_tree(root: Path) -> dict[str, Any]:
    root = root.resolve(strict=True)
    files = sorted(path for path in root.rglob("*") if path.is_file())
    tree = hashlib.sha256()
    total_bytes = 0
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        content_digest = bytes.fromhex(sha256_path(path))
        tree.update(len(relative).to_bytes(4, "big"))
        tree.update(relative)
        tree.update(content_digest)
        total_bytes += path.stat().st_size
    return {
        "algorithm": "sha256(concat(len4be(relpath), relpath, sha256(file)))",
        "fileCount": len(files),
        "root": str(root),
        "totalBytes": total_bytes,
        "treeSha256": tree.hexdigest(),
    }


def material_key(name: str) -> str:
    if name.startswith("bulb_lobe"):
        return "bulb"
    if name in {"bulb_core", "bulb_attachment"}:
        return "bulb_dark"
    if "spot" in name or "ear_inner" in name or "socket" in name:
        return "spot"
    if name.startswith("eye_"):
        return "eye"
    if name.startswith("pupil"):
        return "pupil"
    if "mouth" in name:
        return "mouth"
    if name == "tongue":
        return "eye"
    if name.startswith(("toe", "tooth")) or "glint" in name:
        return "accent"
    return "skin"
