#!/usr/bin/env python3
"""All-frame evaluated-mesh and real-state mutation gate for Bulbasaur C."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import bpy

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bulbasaur_deformation_qa import run_deformation_qa

ROOT = Path(os.environ["BULBASAUR_ANIMATION_OUTPUT"]).resolve(strict=True)
BLEND = ROOT / "bulbasaur_C_animated.blend"
if Path(bpy.data.filepath).resolve() != BLEND:
    raise RuntimeError(f"wrong blend: {bpy.data.filepath}")

contract = json.loads((ROOT / "animation-markers.v1.json").read_text())
report = run_deformation_qa(
    bpy_module=bpy,
    rig=bpy.data.objects["RIG_Bulbasaur_C"],
    marker_contract=contract,
    run_mutation_negatives=True,
)
(ROOT / "qa-deformation.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
print("DEFORMATION_QA_JSON " + json.dumps({
    "status": report["status"],
    "frames": report["evaluatedFrames"],
    "failures": report["failures"],
    "mutationNegatives": report["mutationNegatives"],
}, sort_keys=True))
if report["status"] != "PASS":
    raise RuntimeError(f"deformation QA failed: {len(report['failures'])} failures")
print("DEFORMATION_QA_PASS")
