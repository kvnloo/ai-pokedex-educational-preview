"""Mechanical selection guards for native vertex transforms; never moves geometry."""
import bpy
import bmesh


def prepare(object_name, vertex_indices):
    assert bpy.context.mode == 'OBJECT'
    obj = bpy.data.objects[object_name]
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D' and area.spaces.active.local_view:
            region = next(region for region in area.regions if region.type == 'WINDOW')
            with bpy.context.temp_override(area=area, region=region):
                bpy.ops.view3d.localview(frame_selected=False)
    indices = set(vertex_indices)
    assert indices and min(indices) >= 0 and max(indices) < len(obj.data.vertices)
    for other in bpy.context.scene.objects:
        other.select_set(False)
    obj.hide_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.context.scene.tool_settings.mesh_select_mode = (True, False, False)
    for face in obj.data.polygons:
        face.select = False
    for edge in obj.data.edges:
        edge.select = False
    for vertex in obj.data.vertices:
        vertex.select = vertex.index in indices
    obj.data.update()
    return sorted(indices)


def verify_edit(object_name, expected_indices):
    assert bpy.context.mode == 'EDIT_MESH'
    assert bpy.context.edit_object.name == object_name
    mesh = bmesh.from_edit_mesh(bpy.context.edit_object.data)
    mesh.verts.ensure_lookup_table()
    selected = {vertex.index for vertex in mesh.verts if vertex.select}
    assert selected == set(expected_indices), (len(selected), len(set(expected_indices)))
    return len(selected)
