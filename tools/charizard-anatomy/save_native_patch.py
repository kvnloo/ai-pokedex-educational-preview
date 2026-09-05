"""Record Blender's authored patch, including recreated original triangles."""
import bpy
import json
from collections import Counter
from pathlib import Path

out = Path(globals().get('strip_directory', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r02/r02e'))
scene = bpy.data.scenes['EDIT-charizard-tail-r02e']
mesh = max((obj.data for obj in scene.objects if obj.type == 'MESH'), key=lambda mesh: len(mesh.vertices))
vertex_ids = mesh.attributes['r02d_vertex_id'].data
face_ids = mesh.attributes['r02d_face_id'].data
triangles = sorted([vertex_ids[index].value for index in face.vertices] for face in mesh.polygons if face_ids[face.index].value == -1)
edges = Counter(tuple(sorted((triangle[i], triangle[(i + 1) % 3]))) for triangle in triangles for i in range(3))
boundary = sorted({index for edge, count in edges.items() if count == 1 for index in edge})
assert len(triangles) == 27 and len(boundary) == 29
(out / 'native-patch.json').write_text(json.dumps({'newTriangleParentVertexIds': triangles, 'boundaryParentVertexIds': boundary}, indent=2) + '\n')
print(json.dumps({'nativePatchTriangles': len(triangles), 'nativePatchBoundaryVertices': len(boundary)}))
