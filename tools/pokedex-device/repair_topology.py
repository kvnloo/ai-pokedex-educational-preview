"""Repair collinear bevel-fill faces without changing any vertex position."""
import bpy
import bmesh
import numpy as np


def triangle_area(face):
    if len(face.verts) != 3:
        return None
    v = np.asarray([list(v.co) for v in face.verts], dtype=np.float64)
    return float(np.linalg.norm(np.cross(v[1] - v[0], v[2] - v[0])) / 2)


def repair(scene):
    graph = bpy.context.evaluated_depsgraph_get()
    repaired = []
    for obj in scene.objects:
        if obj.type != 'MESH' or not obj.name.startswith('GEO-PDX.hinge-endcap'):
            continue
        mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(graph), preserve_all_data_layers=True, depsgraph=graph)
        bm = bmesh.new()
        bm.from_mesh(mesh)
        zero = [face for face in bm.faces if triangle_area(face) == 0]
        if not zero:
            bm.free()
            bpy.data.meshes.remove(mesh)
            continue
        before = sorted(tuple(v.co) for v in bm.verts)
        for face in zero:
            edge = max(face.edges, key=lambda e: e.calc_length())
            bmesh.ops.dissolve_edges(bm, edges=[edge], use_verts=False, use_face_split=False)
        bmesh.ops.triangulate(bm, faces=list(bm.faces), quad_method='BEAUTY', ngon_method='BEAUTY')
        assert not any(triangle_area(face) == 0 for face in bm.faces)
        assert all(edge.is_manifold for edge in bm.edges)
        assert before == sorted(tuple(v.co) for v in bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        obj.modifiers.clear()
        obj.data = mesh
        obj['topology_repair'] = 'Two collinear bevel fills absorbed into neighboring quads and retriangulated. Vertex coordinates exactly preserved. Parametric construction remains in build.py; this endcap has its bevel applied.'
        repaired.append(obj.name)
    print('LOCAL_TOPOLOGY_REPAIR', repaired)


if __name__ == '__main__':
    repair(bpy.context.scene)
