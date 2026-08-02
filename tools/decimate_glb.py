import bpy
from pathlib import Path

src = Path("/home/kvn/workspace/zer0/products/pokemon/public/ab/wooloo_shape.glb")
dst = Path("/home/kvn/workspace/zer0/products/pokemon/public/ab/wooloo_preview.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(src))

meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
print("imported meshes", len(meshes), "faces", sum(len(m.data.polygons) for m in meshes))
for o in bpy.context.scene.objects:
    o.select_set(o.type == "MESH")
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
faces_before = len(obj.data.polygons)
mod = obj.modifiers.new("dec", "DECIMATE")
mod.ratio = min(1.0, 8000 / max(1, faces_before))
print("decimate ratio", mod.ratio, "from", faces_before)
bpy.ops.object.modifier_apply(modifier="dec")
print("after faces", len(obj.data.polygons), "verts", len(obj.data.vertices))
bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(
    filepath=str(dst),
    export_format="GLB",
    use_selection=False,
    export_apply=True,
)
print("wrote", dst, dst.stat().st_size)
