from __future__ import annotations

import hashlib
import json
import os
import struct
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
TOOL = ROOT / "contracts" / "native" / "generate_bindings.py"


class NativeContractPreflightTest(unittest.TestCase):
    def assert_client_sizing_contract(self, report: dict[str, Any], png_dimensions: list[int]) -> None:
        expected = [960, 540]
        for field in (
            "requested_client_dimensions",
            "client_viewport_dimensions",
            "drawing_buffer_dimensions",
            "outer_window_dimensions",
            "window_decorations_observed",
            "resize_stable_frames",
            "resize_wait_frames",
        ):
            self.assertIn(field, report)
        self.assertEqual(report["requested_client_dimensions"], expected)
        self.assertEqual(report["client_viewport_dimensions"], expected)
        self.assertEqual(report["drawing_buffer_dimensions"], expected)
        self.assertEqual(png_dimensions, expected)
        self.assertEqual(report["resize_stable_frames"], 3)
        self.assertGreaterEqual(report["resize_wait_frames"], 3)

        outer = report["outer_window_dimensions"]
        self.assertIsInstance(outer, list)
        self.assertEqual(len(outer), 2)
        self.assertTrue(all(isinstance(value, int) and value > 0 for value in outer))
        self.assertGreaterEqual(outer[0], expected[0])
        self.assertGreaterEqual(outer[1], expected[1])
        self.assertEqual(
            report["window_decorations_observed"],
            outer != expected,
        )

    def test_canonical_unittest_run_preserves_frozen_evidence_and_tracked_state(self) -> None:
        if os.environ.get("NATIVE_FROZEN_EVIDENCE_GUARD") == "1":
            self.skipTest("inner canonical run")

        frozen_paths = [
            ROOT / path
            for path in subprocess.run(
                ["git", "ls-files", "native/godot/evidence"],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=True,
            ).stdout.splitlines()
        ]

        def frozen_hashes() -> dict[str, str]:
            return {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in frozen_paths}

        def tracked_state() -> str:
            return subprocess.run(
                ["git", "status", "--short", "--untracked-files=no"],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=True,
            ).stdout

        before_hashes = frozen_hashes()
        before_state = tracked_state()
        result = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", "tests/native", "-v"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
            env={**os.environ, "NATIVE_FROZEN_EVIDENCE_GUARD": "1"},
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(frozen_hashes(), before_hashes)
        self.assertEqual(tracked_state(), before_state)

    def test_frozen_capture_reports_exact_client_dimensions_and_truthful_outer_window(self) -> None:
        evidence = ROOT / "native" / "godot" / "evidence"
        screenshot = evidence / "native-preflight.png"
        report = json.loads((evidence / "performance-report.json").read_text(encoding="utf-8"))
        png_width, png_height = struct.unpack(">II", screenshot.read_bytes()[16:24])

        self.assert_client_sizing_contract(report, [png_width, png_height])

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

    def test_shared_kanto_contract_drives_native_bindings(self) -> None:
        result = subprocess.run(
            [sys.executable, str(TOOL), "--check"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report.get("shared_schema_version"), "authoritative-client/v1")
        self.assertEqual(report["canonical_slice_id"], "world-slice:kanto:pallet-pewter")
        self.assertEqual(report["canonical_cell"], "location:kanto:pallet-town")
        self.assertEqual(report["movement_target"], "location:kanto:route-1")
        self.assertEqual(report["save_location"], "location:kanto:route-1")
        self.assertEqual(report["native_final_hash"], report["browser_final_hash"])
        self.assertEqual(report["native_final_hash"], report["expected_final_hash"])
        self.assertEqual(report["authoritative_domains"], ["world", "battle", "story", "save", "inventory", "economy"])

    def test_browser_contract_consumer_matches_shared_replay_hash(self) -> None:
        result = subprocess.run(
            ["node", "tools/shared-client-contract.mjs"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report.get("client"), "browser")
        self.assertEqual(report.get("schemaVersion"), "authoritative-client/v1")
        self.assertEqual(report.get("canonicalCell"), "location:kanto:pallet-town")
        self.assertEqual(report.get("orderedEvents"), 3)
        self.assertEqual(report.get("finalHash"), "395db323b45f3a5d5379a68702c3f8e96e14e5362aa927f67b232c030d7ac1d6")
        self.assertTrue(report.get("saveAcknowledged"))

    def test_cross_client_evidence_compares_hashes_without_pixel_parity_claim(self) -> None:
        with tempfile.TemporaryDirectory(prefix="cross-client-") as temporary:
            temporary_path = Path(temporary)
            native_report = temporary_path / "native.json"
            comparison = temporary_path / "comparison.json"
            native = subprocess.run(
                [
                    os.environ.get("GODOT4", "/home/kvn/.local/bin/godot4"),
                    "--headless",
                    "--path",
                    str(ROOT / "native" / "godot"),
                    "--",
                    "--contract-only",
                    f"--report={native_report}",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(native.returncode, 0, native.stdout + native.stderr)
            result = subprocess.run(
                ["node", "tools/native-cross-client-evidence.mjs", "--native-report", str(native_report), "--out", str(comparison)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads(comparison.read_text(encoding="utf-8"))
            self.assertTrue(report.get("hashesMatch"))
            self.assertFalse(report.get("pixelParityClaimed"))
            self.assertEqual(report.get("orderedEvents"), 3)
            self.assertEqual(report.get("nativeFinalHash"), report.get("browserFinalHash"))

    def test_godot_contract_only_consumes_shared_kanto_authority(self) -> None:
        with tempfile.TemporaryDirectory(prefix="native-kanto-contract-") as temporary:
            report_path = Path(temporary) / "report.json"
            result = subprocess.run(
                [
                    os.environ.get("GODOT4", "/home/kvn/.local/bin/godot4"),
                    "--headless",
                    "--path",
                    str(ROOT / "native" / "godot"),
                    "--",
                    "--contract-only",
                    f"--report={report_path}",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertEqual(report.get("schema_version"), "authoritative-client/v1")
            self.assertEqual(report.get("canonical_slice_id"), "world-slice:kanto:pallet-pewter")
            self.assertEqual(report.get("canonical_path_count"), 7)
            self.assertEqual(report.get("movement_from"), "location:kanto:pallet-town")
            self.assertEqual(report.get("movement_location"), "location:kanto:route-1")
            self.assertEqual(report.get("save_location"), "location:kanto:route-1")
            self.assertEqual(report.get("final_hash"), "395db323b45f3a5d5379a68702c3f8e96e14e5362aa927f67b232c030d7ac1d6")
            self.assertTrue(report.get("intent_only_client"))

    def test_asset_resolver_profiles_consume_stable_shared_manifests(self) -> None:
        for profile in ("distributable", "private-local"):
            with self.subTest(profile=profile), tempfile.TemporaryDirectory(prefix=f"native-assets-{profile}-") as temporary:
                report_path = Path(temporary) / "report.json"
                result = subprocess.run(
                    [
                        os.environ.get("GODOT4", "/home/kvn/.local/bin/godot4"),
                        "--headless",
                        "--path",
                        str(ROOT / "native" / "godot"),
                        "--",
                        "--contract-only",
                        f"--asset-profile={profile}",
                        f"--report={report_path}",
                    ],
                    cwd=ROOT,
                    text=True,
                    capture_output=True,
                    check=False,
                )

                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                report = json.loads(report_path.read_text(encoding="utf-8"))
                self.assertEqual(report.get("asset_profile"), profile)
                self.assertEqual(report.get("resolved_asset_id"), "kanto.pallet-pewter.marker.v1")
                self.assertEqual(report.get("asset_formats"), ["animations", "glb", "ktx2", "materials"])
                self.assertEqual(report.get("presentation_asset_classification"), "CC0 synthetic stand-in")
                self.assertFalse(report.get("private_source_loaded"))
                self.assertTrue(report.get("asset_loaded"))

    def test_blender_iac_asset_is_a_valid_glb_with_provenance(self) -> None:
        glb = ROOT / "native" / "godot" / "assets" / "generated" / "synthetic_beacon.glb"
        provenance = glb.with_suffix(".provenance.json")

        self.assertTrue(glb.is_file(), "run the Blender IaC asset builder")
        self.assertEqual(glb.read_bytes()[:4], b"glTF")
        metadata = json.loads(provenance.read_text(encoding="utf-8"))
        self.assertEqual(metadata["generator"], "Blender 5.2 Python API")
        self.assertEqual(metadata["license"], "CC0-1.0 synthetic fixture")
        self.assertEqual(metadata["sha256"], hashlib.sha256(glb.read_bytes()).hexdigest())

    def test_godot_headless_smoke_loads_contract_asset_intent_and_replay(self) -> None:
        with tempfile.TemporaryDirectory(prefix="native-headless-") as temporary:
            evidence = Path(temporary)
            result = subprocess.run(
                ["bash", str(ROOT / "native" / "godot" / "scripts" / "headless_smoke.sh")],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
                env={**os.environ, "NATIVE_EVIDENCE_DIR": str(evidence)},
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads((evidence / "headless-report.json").read_text(encoding="utf-8"))
            self.assertEqual(report["renderer"], "Forward+")
            self.assertIn("NVIDIA GeForce RTX 3080 Ti", report["device"])
            self.assertFalse(report["software_renderer"])
            self.assertTrue(report["asset_loaded"])
            self.assertEqual(report["movement_cell"], [0, 1])
            self.assertEqual(report["movement_location"], "location:kanto:route-1")
            self.assertEqual(report["final_hash"], "395db323b45f3a5d5379a68702c3f8e96e14e5362aa927f67b232c030d7ac1d6")
            contract_path = evidence / "literal-headless-report.json"
            self.assertTrue(contract_path.is_file(), "literal Godot --headless report is required")
            contract_only = json.loads(contract_path.read_text(encoding="utf-8"))
            self.assertEqual(contract_only["display_driver"], "headless")
            self.assertEqual(contract_only["renderer"], "dummy (no rendering)")
            self.assertEqual(contract_only["final_hash"], report["final_hash"])

    def test_import_verification_proves_blender_to_godot_path(self) -> None:
        with tempfile.TemporaryDirectory(prefix="native-import-") as temporary:
            evidence = Path(temporary)
            result = subprocess.run(
                ["bash", str(ROOT / "native" / "godot" / "scripts" / "verify_import.sh")],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
                env={**os.environ, "NATIVE_EVIDENCE_DIR": str(evidence)},
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            report = json.loads((evidence / "import-verification.json").read_text(encoding="utf-8"))
            self.assertTrue(report["glb_magic_valid"])
            self.assertGreater(report["glb_bytes"], 1000)
            self.assertEqual(report["godot_imported_scene_count"], 1)
            self.assertFalse(report["private_assets"])

    def test_native_performance_capture_emits_png_and_gpu_telemetry(self) -> None:
        with tempfile.TemporaryDirectory(prefix="native-performance-") as temporary:
            evidence = Path(temporary)
            result = subprocess.run(
                ["bash", str(ROOT / "native" / "godot" / "scripts" / "capture_performance.sh"), "120"],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
                env={**os.environ, "NATIVE_EVIDENCE_DIR": str(evidence)},
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            screenshot = evidence / "native-preflight.png"
            report = json.loads((evidence / "performance-report.json").read_text(encoding="utf-8"))
            self.assertEqual(screenshot.read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
            self.assertEqual(report["device"], "NVIDIA GeForce RTX 3080 Ti")
            self.assertEqual(report["frames"], 120)
            self.assert_client_sizing_contract(
                report,
                list(struct.unpack(">II", screenshot.read_bytes()[16:24])),
            )
            self.assertGreater(report["triangles"], 0)
            self.assertGreater(report["draw_calls"], 0)
            self.assertFalse(report["software_renderer"])

    def test_rtx_3080ti_quality_tier_captures_exact_1440p_after_prewarm(self) -> None:
        with tempfile.TemporaryDirectory(prefix="native-1440p-") as temporary:
            evidence = Path(temporary)
            result = subprocess.run(
                ["bash", str(ROOT / "native" / "godot" / "scripts" / "capture_performance.sh"), "60", "quality"],
                cwd=ROOT,
                text=True,
                capture_output=True,
                check=False,
                env={**os.environ, "NATIVE_EVIDENCE_DIR": str(evidence)},
            )

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            screenshot = evidence / "native-kanto-1440p.png"
            report_path = evidence / "performance-1440p-report.json"
            self.assertTrue(screenshot.is_file(), "1440p capture is required")
            self.assertTrue(report_path.is_file(), "1440p performance report is required")
            report = json.loads(report_path.read_text(encoding="utf-8"))
            png_dimensions = list(struct.unpack(">II", screenshot.read_bytes()[16:24]))
            expected = [2560, 1440]
            self.assertEqual(report["requested_client_dimensions"], expected)
            self.assertEqual(report["client_viewport_dimensions"], expected)
            self.assertEqual(report["drawing_buffer_dimensions"], expected)
            self.assertEqual(png_dimensions, expected)
            self.assertEqual(report["performance_tier"], "quality")
            self.assertEqual(report["target_hardware"], "NVIDIA GeForce RTX 3080 Ti")
            self.assertTrue(report["import_prewarmed"])
            self.assertGreaterEqual(report["shader_prewarm_frames"], 120)
            self.assertGreater(report["p95_budget_ms"], 0)
            self.assertGreater(report["p99_budget_ms"], report["p95_budget_ms"])
            self.assertEqual(report["performance_gate_passed"], report["p95_frame_ms"] <= report["p95_budget_ms"] and report["p99_frame_ms"] <= report["p99_budget_ms"])
            outer = report["outer_window_dimensions"]
            self.assertGreaterEqual(outer[0], expected[0])
            self.assertGreaterEqual(outer[1], expected[1])


if __name__ == "__main__":
    unittest.main()
