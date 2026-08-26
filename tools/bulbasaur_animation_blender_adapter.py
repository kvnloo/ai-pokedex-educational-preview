#!/usr/bin/env python3
"""Blender bridge for the production-neutral Bulbasaur action lifecycle."""
from __future__ import annotations

from typing import Any, Mapping


class BlenderActionLifecycleAdapter:
    """Apply explicit effect teardown before selecting any rig action."""

    def __init__(
        self,
        *,
        bpy_module: Any,
        rig: Any,
        marker_contract: Mapping[str, Any],
        lifecycle_contract: Mapping[str, Any],
    ) -> None:
        self.bpy = bpy_module
        self.rig = rig
        self.marker_contract = marker_contract
        self.lifecycle_contract = lifecycle_contract
        self.entries = {entry["clip"]: entry for entry in marker_contract["clips"]}
        self.current_clip: str | None = None

    @staticmethod
    def _vector(values: list[float]) -> tuple[float, float, float]:
        if len(values) != 3:
            raise ValueError(f"expected three transform components, got {len(values)}")
        return float(values[0]), float(values[1]), float(values[2])

    def _set_reset_transform(self, obj: Any, declaration: Mapping[str, Any]) -> None:
        reset = declaration["reset"]
        obj.location = self._vector(reset["location"])
        obj.rotation_mode = "XYZ"
        obj.rotation_euler = self._vector(reset["rotationEuler"])
        obj.scale = self._vector(reset["scale"])

    def reset_all_effects(self) -> None:
        for owner, effect in self.lifecycle_contract["effects"].items():
            self.rig[effect["driverProperty"]] = False
            for declaration in effect["objects"]:
                obj = self.bpy.data.objects[declaration["name"]]
                if obj.animation_data is not None:
                    obj.animation_data.action = None
                self._set_reset_transform(obj, declaration)
        self.bpy.context.view_layer.update()

    def switch_action(self, clip: str, frame: int) -> None:
        if clip not in self.entries:
            raise KeyError(clip)
        self.reset_all_effects()
        entry = self.entries[clip]
        self.rig.animation_data.action = self.bpy.data.actions[entry["action"]]
        effect = self.lifecycle_contract["effects"].get(clip)
        if effect is not None:
            for declaration in effect["objects"]:
                action_name = declaration.get("animationAction")
                if action_name:
                    obj = self.bpy.data.objects[declaration["name"]]
                    obj.animation_data_create()
                    obj.animation_data.action = self.bpy.data.actions[action_name]
        self.current_clip = clip
        self.bpy.context.scene.frame_set(int(frame))
        self.bpy.context.view_layer.update()

    def contaminate_all_effects(self) -> None:
        for effect in self.lifecycle_contract["effects"].values():
            self.rig[effect["driverProperty"]] = True
            for declaration in effect["objects"]:
                obj = self.bpy.data.objects[declaration["name"]]
                reset = declaration["reset"]
                obj.location = tuple(float(value) + 9.0 for value in reset["location"])
                obj.rotation_euler = tuple(float(value) + 0.75 for value in reset["rotationEuler"])
                obj.scale = tuple(float(value) * 1.5 for value in reset["scale"])
        self.bpy.context.view_layer.update()

    @staticmethod
    def _close(actual: Any, expected: list[float], tolerance: float = 1e-7) -> bool:
        return all(abs(float(left) - float(right)) <= tolerance for left, right in zip(actual, expected))

    def reset_snapshot(self) -> dict[str, Any]:
        properties: dict[str, bool] = {}
        objects: dict[str, dict[str, Any]] = {}
        canonical = True
        for owner, effect in self.lifecycle_contract["effects"].items():
            prop = effect["driverProperty"]
            property_reset = not bool(self.rig.get(prop, False))
            properties[prop] = property_reset
            canonical = canonical and property_reset
            for declaration in effect["objects"]:
                obj = self.bpy.data.objects[declaration["name"]]
                reset = declaration["reset"]
                location_reset = self._close(obj.location, reset["location"])
                rotation_reset = self._close(obj.rotation_euler, reset["rotationEuler"])
                scale_reset = self._close(obj.scale, reset["scale"])
                expected_action = declaration.get("animationAction") if self.current_clip == owner else None
                actual_action = obj.animation_data.action.name if obj.animation_data and obj.animation_data.action else None
                action_reset = actual_action == expected_action
                object_reset = location_reset and rotation_reset and scale_reset and action_reset
                objects[obj.name] = {
                    "reset": object_reset,
                    "location": [float(value) for value in obj.location],
                    "rotationEuler": [float(value) for value in obj.rotation_euler],
                    "scale": [float(value) for value in obj.scale],
                    "animationAction": actual_action,
                    "expectedAnimationAction": expected_action,
                }
                canonical = canonical and object_reset
        return {
            "canonicalReset": canonical,
            "clip": self.current_clip,
            "properties": properties,
            "objects": objects,
        }
