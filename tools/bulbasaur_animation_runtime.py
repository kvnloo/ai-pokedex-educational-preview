#!/usr/bin/env python3
"""Production-neutral marker, action-lifecycle, and accessibility adapter.

The module is Blender-independent. DCC verification and future Three.js/Godot
bridges provide concrete scene adapters while sharing the exact traversal and
teardown semantics implemented here.
"""
from __future__ import annotations

import copy
import math
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping

Marker = Mapping[str, Any]
Event = dict[str, Any]


class MarkerDispatcher:
    """Cross frame markers exactly once per direction/cycle/traversal."""

    def __init__(self) -> None:
        self.traversal_id = 0
        self._emitted: set[tuple[int, int, int, int]] = set()

    def begin_traversal(self) -> int:
        self.traversal_id += 1
        self._emitted.clear()
        return self.traversal_id

    @staticmethod
    def _occurrences(
        markers: Iterable[Marker],
        previous: int,
        current: int,
        start_frame: int,
        end_frame: int,
        *,
        loop: bool,
        direction: int,
    ) -> list[tuple[int, int, int, Marker]]:
        period = end_frame - start_frame + 1
        if period <= 0:
            raise ValueError("end_frame must be >= start_frame")
        indexed = list(enumerate(markers))
        occurrences: list[tuple[int, int, int, Marker]] = []
        for index, marker in indexed:
            frame = int(marker["frame"])
            if not start_frame <= frame <= end_frame:
                raise ValueError(f"marker frame {frame} outside [{start_frame}, {end_frame}]")
            if loop:
                if direction > 0:
                    first_cycle = math.floor((previous - frame) / period) + 1
                    last_cycle = math.floor((current - frame) / period)
                else:
                    first_cycle = math.ceil((current - frame) / period)
                    last_cycle = math.ceil((previous - frame) / period) - 1
                cycles = range(first_cycle, last_cycle + 1)
            else:
                crosses = previous < frame <= current if direction > 0 else current <= frame < previous
                cycles = (0,) if crosses else ()
            for cycle in cycles:
                occurrence = frame + cycle * period
                if direction > 0 and not previous < occurrence <= current:
                    continue
                if direction < 0 and not current <= occurrence < previous:
                    continue
                occurrences.append((occurrence, index, cycle, marker))
        if direction > 0:
            occurrences.sort(key=lambda item: (item[0], item[1]))
        else:
            occurrences.sort(key=lambda item: (-item[0], item[1]))
        return occurrences

    def cross(
        self,
        markers: Iterable[Marker],
        previous: int,
        current: int,
        *,
        start_frame: int,
        end_frame: int,
        loop: bool = False,
        direction: int | None = None,
        paused: bool = False,
        seek: bool = False,
        traversal_id: int | None = None,
    ) -> list[Event]:
        if paused or seek or previous == current:
            return []
        resolved_direction = direction if direction is not None else (1 if current > previous else -1)
        if resolved_direction not in (-1, 1):
            raise ValueError("direction must be -1 or 1")
        traversal = self.traversal_id if traversal_id is None else traversal_id
        result: list[Event] = []
        for occurrence, index, cycle, marker in self._occurrences(
            markers,
            previous,
            current,
            start_frame,
            end_frame,
            loop=loop,
            direction=resolved_direction,
        ):
            key = (traversal, resolved_direction, cycle, index)
            if key in self._emitted:
                continue
            self._emitted.add(key)
            event = dict(marker)
            event.update(
                {
                    "occurrenceFrame": occurrence,
                    "cycle": cycle,
                    "direction": resolved_direction,
                    "traversalId": traversal,
                    "declarationIndex": index,
                }
            )
            result.append(event)
        return result

    def restart(
        self,
        markers: Iterable[Marker],
        current: int,
        *,
        start_frame: int,
        end_frame: int,
        loop: bool = False,
    ) -> list[Event]:
        traversal = self.begin_traversal()
        return self.cross(
            markers,
            start_frame - 1,
            current,
            start_frame=start_frame,
            end_frame=end_frame,
            loop=loop,
            direction=1,
            traversal_id=traversal,
        )


class EffectStateAdapter:
    """Concrete effect ownership state with canonical teardown snapshots."""

    def __init__(self, defaults: Mapping[str, Mapping[str, Any]]) -> None:
        self.defaults: dict[str, dict[str, Any]] = {
            name: copy.deepcopy(dict(value)) for name, value in defaults.items()
        }
        self.state: dict[str, dict[str, Any]] = copy.deepcopy(self.defaults)
        self.reset_count = 0

    def reset_all(self) -> None:
        self.state = copy.deepcopy(self.defaults)
        self.reset_count += 1

    def activate(self, name: str, *, transform: list[float] | None = None) -> None:
        if name not in self.state:
            raise KeyError(name)
        self.state[name]["visible"] = True
        self.state[name]["driverActive"] = True
        if transform is not None:
            self.state[name]["transform"] = list(transform)

    def is_canonical_reset(self) -> bool:
        return self.state == self.defaults


@dataclass
class CameraStateAdapter:
    applied_impulses: int = 0
    suppressed_impulses: int = 0
    active_impulses: list[str] = field(default_factory=list)

    def request_impulse(self, phase: str, *, reduced_motion: bool) -> None:
        if reduced_motion:
            self.suppressed_impulses += 1
            return
        self.applied_impulses += 1
        self.active_impulses.append(phase)

    def reset_transient(self) -> None:
        self.active_impulses.clear()


@dataclass
class VfxStateAdapter:
    emitted_high_frequency: int = 0
    suppressed_high_frequency: int = 0
    active_high_frequency: list[str] = field(default_factory=list)

    def emit_high_frequency(self, phase: str, *, reduced_motion: bool) -> None:
        if reduced_motion:
            self.suppressed_high_frequency += 1
            return
        self.emitted_high_frequency += 1
        self.active_high_frequency.append(phase)

    def reset_transient(self) -> None:
        self.active_high_frequency.clear()


@dataclass
class GameplayStateAdapter:
    phases: list[tuple[str, str, int, int]] = field(default_factory=list)
    contact_count: int = 0

    def apply_marker(self, clip: str, event: Event) -> None:
        phase = str(event["phase"])
        self.phases.append(
            (clip, phase, int(event["occurrenceFrame"]), int(event["direction"]))
        )
        if phase == "contact":
            self.contact_count += 1

    def snapshot(self) -> dict[str, Any]:
        return {"phases": list(self.phases), "contactCount": self.contact_count}


class AnimationRuntimeAdapter:
    """Own clip changes, marker traversal, teardown, and reduced-motion execution."""

    _CAMERA_PHASES = frozenset({"release", "travel", "contact", "recoil", "exit"})
    _HIGH_FREQUENCY_VFX_PHASES = frozenset({"release", "travel", "contact", "recoil"})

    def __init__(
        self,
        *,
        clips: Mapping[str, Mapping[str, Any]],
        effects: EffectStateAdapter,
        camera: CameraStateAdapter,
        vfx: VfxStateAdapter,
        gameplay: GameplayStateAdapter,
        reduced_motion: bool = False,
    ) -> None:
        self.clips = dict(clips)
        self.effects = effects
        self.camera = camera
        self.vfx = vfx
        self.gameplay = gameplay
        self.reduced_motion = reduced_motion
        self.dispatcher = MarkerDispatcher()
        self.current_clip: str | None = None

    def switch_action(self, clip: str) -> None:
        if clip not in self.clips:
            raise KeyError(clip)
        self.effects.reset_all()
        self.camera.reset_transient()
        self.vfx.reset_transient()
        self.current_clip = clip
        self.dispatcher.begin_traversal()

    def _entry(self) -> Mapping[str, Any]:
        if self.current_clip is None:
            raise RuntimeError("switch_action must be called before playback")
        return self.clips[self.current_clip]

    def _execute(self, events: list[Event]) -> list[Event]:
        if self.current_clip is None:
            raise RuntimeError("no current clip")
        for event in events:
            phase = str(event["phase"])
            self.gameplay.apply_marker(self.current_clip, event)
            if phase in self._CAMERA_PHASES:
                self.camera.request_impulse(phase, reduced_motion=self.reduced_motion)
            if phase in self._HIGH_FREQUENCY_VFX_PHASES:
                self.vfx.emit_high_frequency(phase, reduced_motion=self.reduced_motion)
        return events

    def advance(
        self,
        previous: int,
        current: int,
        *,
        paused: bool = False,
        seek: bool = False,
        direction: int | None = None,
    ) -> list[Event]:
        entry = self._entry()
        events = self.dispatcher.cross(
            entry["markers"],
            previous,
            current,
            start_frame=int(entry["startFrame"]),
            end_frame=int(entry["endFrame"]),
            loop=bool(entry.get("playback") == "loop"),
            paused=paused,
            seek=seek,
            direction=direction,
        )
        return self._execute(events)

    def restart(self, current: int) -> list[Event]:
        entry = self._entry()
        events = self.dispatcher.restart(
            entry["markers"],
            current,
            start_frame=int(entry["startFrame"]),
            end_frame=int(entry["endFrame"]),
            loop=bool(entry.get("playback") == "loop"),
        )
        return self._execute(events)
