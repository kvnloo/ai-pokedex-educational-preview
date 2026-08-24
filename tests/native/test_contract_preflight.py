from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TOOL = ROOT / "contracts" / "native" / "generate_bindings.py"


class NativeContractPreflightTest(unittest.TestCase):
    def test_synthetic_contract_fixtures_validate_and_match_replay_hash(self) -> None:
        result = subprocess.run(
            [sys.executable, str(TOOL), "--check"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["schema_version"], "native-preflight/v1")
        self.assertEqual(report["validated_fixtures"], 3)
        self.assertEqual(report["replay_final_hash"], report["expected_final_hash"])
        self.assertTrue(report["binding_current"])

    def test_blender_iac_asset_is_a_valid_glb_with_provenance(self) -> None:
        glb = ROOT / "native" / "godot" / "assets" / "generated" / "synthetic_beacon.glb"
        provenance = glb.with_suffix(".provenance.json")

        self.assertTrue(glb.is_file(), "run the Blender IaC asset builder")
        self.assertEqual(glb.read_bytes()[:4], b"glTF")
        metadata = json.loads(provenance.read_text(encoding="utf-8"))
        self.assertEqual(metadata["generator"], "Blender 5.2 Python API")
        self.assertEqual(metadata["license"], "CC0-1.0 synthetic fixture")
        self.assertEqual(metadata["sha256"], __import__("hashlib").sha256(glb.read_bytes()).hexdigest())

    def test_godot_headless_smoke_loads_contract_asset_intent_and_replay(self) -> None:
        result = subprocess.run(
            ["bash", str(ROOT / "native" / "godot" / "scripts" / "headless_smoke.sh")],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads((ROOT / "native" / "godot" / "evidence" / "headless-report.json").read_text(encoding="utf-8"))
        self.assertEqual(report["renderer"], "Forward+")
        self.assertIn("NVIDIA GeForce RTX 3080 Ti", report["device"])
        self.assertFalse(report["software_renderer"])
        self.assertTrue(report["asset_loaded"])
        self.assertEqual(report["movement_cell"], [1, 0])
        self.assertEqual(report["final_hash"], "64ba98824cdb8f2d4c0aa31c51bcb235438361d23d985b5d642659b36629653e")
        contract_path = ROOT / "native" / "godot" / "evidence" / "literal-headless-report.json"
        self.assertTrue(contract_path.is_file(), "literal Godot --headless report is required")
        contract_only = json.loads(contract_path.read_text(encoding="utf-8"))
        self.assertEqual(contract_only["display_driver"], "headless")
        self.assertEqual(contract_only["renderer"], "dummy (no rendering)")
        self.assertEqual(contract_only["final_hash"], report["final_hash"])

    def test_import_verification_proves_blender_to_godot_path(self) -> None:
        result = subprocess.run(
            ["bash", str(ROOT / "native" / "godot" / "scripts" / "verify_import.sh")],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads((ROOT / "native" / "godot" / "evidence" / "import-verification.json").read_text(encoding="utf-8"))
        self.assertTrue(report["glb_magic_valid"])
        self.assertGreater(report["glb_bytes"], 1000)
        self.assertEqual(report["godot_imported_scene_count"], 1)
        self.assertFalse(report["private_assets"])

    def test_native_performance_capture_emits_png_and_gpu_telemetry(self) -> None:
        result = subprocess.run(
            ["bash", str(ROOT / "native" / "godot" / "scripts" / "capture_performance.sh"), "120"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        evidence = ROOT / "native" / "godot" / "evidence"
        screenshot = evidence / "native-preflight.png"
        report = json.loads((evidence / "performance-report.json").read_text(encoding="utf-8"))
        self.assertEqual(screenshot.read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
        self.assertEqual(report["device"], "NVIDIA GeForce RTX 3080 Ti")
        self.assertEqual(report["frames"], 120)
        self.assertGreater(report["triangles"], 0)
        self.assertGreater(report["draw_calls"], 0)
        self.assertFalse(report["software_renderer"])


if __name__ == "__main__":
    unittest.main()
