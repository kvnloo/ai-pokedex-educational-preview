#!/usr/bin/env python3
"""Unit contract for the production-neutral Bulbasaur animation runtime adapter."""
from __future__ import annotations

import unittest

from bulbasaur_animation_runtime import (
    AnimationRuntimeAdapter,
    CameraStateAdapter,
    EffectStateAdapter,
    GameplayStateAdapter,
    MarkerDispatcher,
    VfxStateAdapter,
)


MARKERS = [
    {"frame": 1, "phase": "enter"},
    {"frame": 16, "phase": "travel"},
    {"frame": 34, "phase": "contact"},
    {"frame": 48, "phase": "exit"},
]
CLIPS = tuple(
    "bind idle breathe blink look turn walk trot_run start stop turn_90 turn_180 send_out hit faint tackle growl vine_whip razor_leaf".split()
)


class MarkerDispatcherTests(unittest.TestCase):
    def setUp(self) -> None:
        self.dispatcher = MarkerDispatcher()

    def phases(self, previous: int, current: int, **kwargs: object) -> list[str]:
        events = self.dispatcher.cross(
            MARKERS,
            previous,
            current,
            start_frame=1,
            end_frame=48,
            **kwargs,
        )
        return [event["phase"] for event in events]

    def test_exact_boundary_and_forward_skip(self) -> None:
        self.assertEqual(self.phases(0, 1), ["enter"])
        self.assertEqual(self.phases(1, 34), ["travel", "contact"])

    def test_multi_marker_declaration_order_is_stable(self) -> None:
        markers = [
            {"frame": 8, "phase": "first"},
            {"frame": 8, "phase": "second"},
            {"frame": 9, "phase": "third"},
        ]
        events = self.dispatcher.cross(markers, 7, 9, start_frame=1, end_frame=12)
        self.assertEqual([event["phase"] for event in events], ["first", "second", "third"])

    def test_forward_loop_wrap_includes_exit_and_post_wrap_enter(self) -> None:
        self.assertEqual(self.phases(47, 49, loop=True), ["exit", "enter"])

    def test_forward_multi_loop_skip_emits_each_occurrence_once(self) -> None:
        self.assertEqual(
            self.phases(47, 98, loop=True),
            ["exit", "enter", "travel", "contact", "exit", "enter"],
        )

    def test_reverse_and_reverse_loop_wrap(self) -> None:
        self.assertEqual(self.phases(48, 0), ["contact", "travel", "enter"])
        self.dispatcher.begin_traversal()
        self.assertEqual(self.phases(2, 0, loop=True, direction=-1), ["enter", "exit"])

    def test_pause_seek_restart_and_once_per_traversal(self) -> None:
        self.assertEqual(self.phases(0, 34, paused=True), [])
        self.assertEqual(self.phases(0, 34, seek=True), [])
        restarted = self.dispatcher.restart(MARKERS, 34, start_frame=1, end_frame=48)
        self.assertEqual([event["phase"] for event in restarted], ["enter", "travel", "contact"])
        self.assertEqual(
            self.dispatcher.cross(
                MARKERS,
                0,
                34,
                start_frame=1,
                end_frame=48,
                traversal_id=self.dispatcher.traversal_id,
            ),
            [],
        )
        self.dispatcher.begin_traversal()
        self.assertEqual(self.phases(0, 1), ["enter"])


class RuntimeAdapterTests(unittest.TestCase):
    def make_runtime(self, *, reduced_motion: bool = False) -> AnimationRuntimeAdapter:
        effect_defaults = {
            "vine_whip": {"visible": False, "transform": [0.0, 0.0, 0.0], "driverActive": False},
            "razor_leaf": {"visible": False, "transform": [0.0, 0.0, 0.0], "driverActive": False},
            "tackle": {"visible": False, "transform": [0.0, -1.45, 0.46], "driverActive": False},
            "growl": {"visible": False, "transform": [0.0, -0.72, 0.54], "driverActive": False},
        }
        return AnimationRuntimeAdapter(
            clips={clip: {"startFrame": 1, "endFrame": 48, "markers": MARKERS} for clip in CLIPS},
            effects=EffectStateAdapter(effect_defaults),
            camera=CameraStateAdapter(),
            vfx=VfxStateAdapter(),
            gameplay=GameplayStateAdapter(),
            reduced_motion=reduced_motion,
        )

    def test_switch_action_resets_visibility_transform_and_driver_state_for_19_by_19_matrix(self) -> None:
        runtime = self.make_runtime()
        transitions = 0
        for source in CLIPS:
            runtime.switch_action(source)
            for effect_name in runtime.effects.state:
                runtime.effects.activate(effect_name, transform=[9.0, 8.0, 7.0])
            for target in CLIPS:
                runtime.switch_action(target)
                transitions += 1
                self.assertTrue(runtime.effects.is_canonical_reset())
                for effect_name in runtime.effects.state:
                    runtime.effects.activate(effect_name, transform=[9.0, 8.0, 7.0])
        self.assertEqual(transitions, 19 * 19)

    def test_reduced_motion_executes_real_camera_vfx_suppression_but_preserves_gameplay(self) -> None:
        full = self.make_runtime(reduced_motion=False)
        reduced = self.make_runtime(reduced_motion=True)
        full.switch_action("tackle")
        reduced.switch_action("tackle")
        full.advance(0, 48)
        reduced.advance(0, 48)
        self.assertEqual(full.gameplay.snapshot(), reduced.gameplay.snapshot())
        self.assertGreater(full.camera.applied_impulses, 0)
        self.assertEqual(reduced.camera.applied_impulses, 0)
        self.assertGreater(reduced.camera.suppressed_impulses, 0)
        self.assertGreater(full.vfx.emitted_high_frequency, 0)
        self.assertEqual(reduced.vfx.emitted_high_frequency, 0)
        self.assertGreater(reduced.vfx.suppressed_high_frequency, 0)

    def test_seek_pause_and_restart_use_the_same_dispatcher_as_runtime(self) -> None:
        runtime = self.make_runtime()
        runtime.switch_action("tackle")
        self.assertEqual(runtime.advance(0, 34, paused=True), [])
        self.assertEqual(runtime.advance(0, 34, seek=True), [])
        events = runtime.restart(34)
        self.assertEqual([event["phase"] for event in events], ["enter", "travel", "contact"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
