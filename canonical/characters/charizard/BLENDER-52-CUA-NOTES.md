# Verified Blender 5.2 CUA integration notes

These observations come from R70/R71, not assumptions about other Blender versions.

- Unified brush controls are under `bpy.context.tool_settings.sculpt.unified_paint_settings`. The old ToolSettings path raised AttributeError after earlier setup had already applied. Inspect partial state before retrying.
- At the R70 viewport scale, brush Size 101 displayed an approximately101-pixel diameter cursor, not a202-pixel footprint. Measure the actual on-screen footprint before a stroke. Initial undersized trial was restored before the corrected stroke.
- Mechanical BMesh selection changes do not automatically become a native undo checkpoint. R71 F9 redo restored a previous6671-vertex selection rather than13 controls. Preserve a selection checkpoint before operators that may be adjusted through redo; verify selected count and actual moved coordinates afterward.
- A single native transform in VIEW orientation avoids successive constrained-axis operations for a displacement along a known membrane normal. R71's corrected VIEW Z .008 yielded world(0,-.00670755,-.00435990) as intended.
- Coordinate/thickness success does not imply visual success. That corrected transform was reverted because the rendered transition sharpened.

Geometry remains native CUA. bpy is restricted to mechanical setup, selection, inspection, checkpoints and file I/O.
