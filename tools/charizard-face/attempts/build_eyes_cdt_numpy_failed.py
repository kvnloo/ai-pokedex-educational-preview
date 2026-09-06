"""Author connected orbital rims and closed eye surfaces from inspected landmarks."""
import bpy
import bmesh
import hashlib
import json
import numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import delaunay_2d_cdt

root = Path(globals().get('face_root', '/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r04'))
revision = globals().get('eye_revision', 'r16')
out = root / ('head-' + revision)
assert not out.exists()
source = bpy.data.objects['GEO-charizard-body-head-r15']
parent = root / 'head-r15'
audit = np.load(parent / 'fair-audit.npz')
before = np.asarray([vertex.co[:] for vertex in source.data.vertices], dtype=np.float32)
assert np.array_equal(before, audit['after'])
landmarks = json.loads((root / 'landmarks-r02/landmarks.json').read_text())
origin = np.asarray(landmarks['origin'])
frame = np.asarray(landmarks['frame'])
side, forward, up = frame
local = (before - origin) @ frame.T
head_faces = [list(face.vertices) for face in source.data.polygons if not np.any(audit['protected'][list(face.vertices)])]
tree = BVHTree.FromPolygons(before.tolist(), head_faces)
outline = np.asarray([[.095,.040],[-.005,.073],[-.032,.051],[.030,.028]])
center = outline.mean(0)
scale = np.asarray([.065,.027])
outer = center + (outline - center) * 1.38


def inside(points, polygon):
    result = np.zeros(len(points), dtype=bool)
    for a, b in zip(polygon, np.roll(polygon, -1, axis=0)):
        crossing = (a[1] > points[:,1]) != (b[1] > points[:,1])
        if a[1] != b[1]:
            result ^= crossing & (points[:,0] < (b[0]-a[0])*(points[:,1]-a[1])/(b[1]-a[1])+a[0])
    return result


def surface(point, sign):
    start = origin + forward*point[0] + up*point[1] + sign*side*.30
    position, normal, index, distance = tree.ray_cast(Vector(start), Vector(-sign*side))
    assert position is not None and normal.dot(Vector(sign*side)) > .05, (point, sign)
    return np.asarray(position)


def round_outline(polygon):
    points = []
    for i, corner in enumerate(polygon):
        start = corner*.83 + polygon[i-1]*.17
        end = corner*.83 + polygon[(i+1)%len(polygon)]*.17
        for t in np.linspace(0, 1, 12, endpoint=False):
            points.append((1-t)**2*start + 2*t*(1-t)*corner + t*t*end)
        following = polygon[(i+1)%len(polygon)]*.83 + corner*.17
        points.extend(np.linspace(end, following, 12, endpoint=False))
    return np.asarray(points)


contour = round_outline(outline)


def contour_point(angle):
    direction = np.asarray([np.cos(angle),np.sin(angle)])*scale
    distances = []
    for a,b in zip(contour,np.roll(contour,-1,axis=0)):
        matrix = np.column_stack([direction,a-b])
        if abs(np.linalg.det(matrix)) < 1e-12:
            continue
        ray, segment = np.linalg.solve(matrix,a-center)
        if ray > 0 and 0 <= segment <= 1:
            distances.append(ray)
    assert distances
    return center + direction*min(distances)


mask = inside(local[:,1:3], outer) & (np.abs(local[:,0]) > .025) & ~audit['protected']
assert not mask[audit['protected']].any()
bm = bmesh.new()
bm.from_mesh(source.data)
bm.verts.ensure_lookup_table()
bm.faces.ensure_lookup_table()
vertex_ids = bm.verts.layers.int.new('head_r15_vertex_id')
face_ids = bm.faces.layers.int.new('head_r15_face_id')
for vertex in bm.verts:
    vertex[vertex_ids] = vertex.index
for face in bm.faces:
    face[face_ids] = face.index
vertex_ancestry = [layer for name,layer in bm.verts.layers.int.items() if name.endswith('_vertex_id')]
face_ancestry = [layer for name,layer in bm.faces.layers.int.items() if name.endswith('_face_id')]


def vertex_at(point):
    vertex = bm.verts.new(point)
    for layer in vertex_ancestry:
        vertex[layer] = -1
    return vertex


def face_at(vertices):
    face = bm.faces.new(vertices)
    for layer in face_ancestry:
        face[layer] = -1
    face.smooth = True
    return face


removed_faces = sorted({face[face_ids] for vertex in bm.verts if mask[vertex[vertex_ids]] for face in vertex.link_faces})
bmesh.ops.delete(bm, geom=[vertex for vertex in bm.verts if mask[vertex[vertex_ids]]], context='VERTS')
wire_edges = [edge for edge in bm.edges if not edge.link_faces]
wire_count = len(wire_edges)
if wire_edges:
    bmesh.ops.delete(bm, geom=wire_edges, context='EDGES')
loose_vertices = [vertex for vertex in bm.verts if not vertex.link_edges]
for vertex in loose_vertices:
    assert not audit['protected'][vertex[vertex_ids]]
    mask[vertex[vertex_ids]] = True
if loose_vertices:
    bmesh.ops.delete(bm, geom=loose_vertices, context='VERTS')
boundaries = {edge for edge in bm.edges if edge.is_boundary}
assert all(sum(edge.is_boundary for edge in vertex.link_edges) == 2 for edge in boundaries for vertex in edge.verts)
rims = []
while boundaries:
    edge = min(boundaries,key=lambda edge:tuple(sorted(vertex[vertex_ids] for vertex in edge.verts)))
    loop = next(loop for loop in edge.link_faces[0].loops if loop.edge == edge)
    start,current = loop.vert,loop.link_loop_next.vert
    boundaries.remove(edge)
    rim = [start,current]
    while current != start:
        edge = next(edge for edge in current.link_edges if edge in boundaries)
        boundaries.remove(edge)
        current = edge.other_vert(current)
        if current != start:
            rim.append(current)
    rims.append(rim)
assert len(rims) == 2, len(rims)
eyes = []
records = []
def boundary_distance(point, polygon):
    a=polygon
    edge=np.roll(polygon,-1,axis=0)-a
    parameter=np.clip(np.einsum('ij,ij->i',point-a,edge)/np.einsum('ij,ij->i',edge,edge),0,1)
    return float(np.linalg.norm(point-a-parameter[:,None]*edge,axis=1).min())


for rim in rims:
    boundary_ids=[vertex[vertex_ids] for vertex in rim]
    uv=local[boundary_ids,1:3]
    sign=int(np.sign(local[boundary_ids,0].mean()))
    assert np.all(np.sign(local[boundary_ids,0])==sign)
    root_count=len(rim)
    count=len(contour)
    inner_uv=contour.copy()
    points=list(uv)+list(inner_uv)
    for t in np.arange(uv[:,0].min(),uv[:,0].max(),.004):
        for h in np.arange(uv[:,1].min(),uv[:,1].max(),.004):
            point=np.asarray([t,h])
            if inside(point[None,:],uv)[0] and not inside(point[None,:],inner_uv)[0] and min(boundary_distance(point,uv),boundary_distance(point,inner_uv))>.0015:
                points.append(point)
    constraints=[(i,(i+1)%root_count) for i in range(root_count)]+[(root_count+i,root_count+(i+1)%count) for i in range(count)]
    cdt_vertices,cdt_edges,cdt_faces,original_vertices,original_edges,original_faces=delaunay_2d_cdt([Vector(point) for point in points],constraints,[],0,1e-10)
    coordinates=np.asarray([list(point) for point in cdt_vertices])
    triangles=np.asarray(cdt_faces,dtype=np.int64)
    centroids=coordinates[triangles].mean(1)
    triangles=triangles[inside(centroids,uv)&~inside(centroids,inner_uv)]
    used=set(map(int,np.unique(triangles)))
    original_to_output={original:index for index,originals in enumerate(original_vertices) for original in originals}
    assert all(i in original_to_output for i in range(root_count+count))
    mapped={}
    for index in sorted(used):
        source_rows=[i for i in original_vertices[index] if i<root_count]
        assert len(source_rows)<=1
        if source_rows:
            mapped[index]=rim[source_rows[0]]
        else:
            point=coordinates[index]
            outer_distance=boundary_distance(point,uv)
            inner_distance=boundary_distance(point,inner_uv)
            fraction=outer_distance/max(outer_distance+inner_distance,1e-12)
            upper=np.clip((point[1]-center[1])/.025,0,1)
            lift=.003*np.sin(np.pi*fraction)**2*(.35+.65*upper)+.0015*fraction*fraction*(3-2*fraction)
            mapped[index]=vertex_at(surface(point,sign)+sign*side*lift)
    for triangle in triangles:
        a,b,c=coordinates[triangle]
        orientation=np.cross(b-a,c-a)
        order=triangle if orientation*sign>0 else triangle[::-1]
        face_at([mapped[int(i)] for i in order])
    lip=[mapped[original_to_output[root_count+i]] for i in range(count)]
    floor_ring=[vertex_at(surface(center+(point-center)*.94,sign)-sign*side*.032) for point in inner_uv]
    floor_center=vertex_at(surface(center,sign)-sign*side*.045)
    for i in range(count):
        j=(i+1)%count
        quad=(lip[i],lip[j],floor_ring[j],floor_ring[i])
        fan=(floor_ring[i],floor_ring[j],floor_center)
        face_at(quad if sign>0 else quad[::-1])
        face_at(fan if sign>0 else fan[::-1])

    eye_vertices=[]
    eye_colors=[]
    eye_faces=[]
    for radius in np.linspace(.985,.025,32):
        for point in inner_uv:
            point=center+(point-center)*radius
            eye_vertices.append(surface(point,sign)+sign*side*(-.003+.0015*(1-radius*radius)))
            iris=np.linalg.norm((point-center)/np.asarray([.016,.021]))
            pupil=np.linalg.norm((point-center)/np.asarray([.007,.016]))
            color=np.asarray([.92,.93,.88,1])
            iris_weight=np.clip((1.04-iris)/.08,0,1)
            pupil_weight=np.clip((1.05-pupil)/.10,0,1)
            color=color*(1-iris_weight)+np.asarray([.06,.32,.46,1])*iris_weight
            color=color*(1-pupil_weight)+np.asarray([.008,.012,.016,1])*pupil_weight
            eye_colors.append(color)
    front_center=len(eye_vertices)
    eye_vertices.append(surface(center,sign)-sign*side*.0015)
    eye_colors.append([.008,.012,.016,1])
    back_center=len(eye_vertices)
    eye_vertices.append(surface(center,sign)-sign*side*.018)
    eye_colors.append([.5,.5,.5,1])
    for ring_index in range(31):
        for i in range(count):
            j=(i+1)%count
            a=ring_index*count;b=a+count
            quad=(a+i,a+j,b+j,b+i)
            eye_faces.append(quad if sign>0 else quad[::-1])
    for i in range(count):
        j=(i+1)%count
        front=(31*count+i,31*count+j,front_center)
        back=(j,i,back_center)
        eye_faces.append(front if sign>0 else front[::-1])
        eye_faces.append(back if sign>0 else back[::-1])
    eyes.append((sign,eye_vertices,eye_faces,eye_colors))
    records.append({'side':sign,'boundaryParentRows':boundary_ids,'annulusTriangles':len(triangles),'skinMethod':'Constrained 2D triangulation between fixed root and closed opening contours','openingVertices':count,'eyeFrontRings':32,'openingContour':inner_uv.tolist(),'floorRingDepth':.032,'floorCenterDepth':.045,'eyeBackDepth':.018,'status':'awaiting visual/geometry audit'})
assert all(len(edge.link_faces) == 2 for edge in bm.edges)

scene = bpy.data.scenes.new('EDIT-charizard-head-'+revision)
for original in bpy.data.scenes['EDIT-charizard-head-r15'].objects:
    if original.type == 'MESH':
        obj = original.copy()
        obj.data = original.data.copy()
        obj.parent = None
        obj.matrix_world = original.matrix_world.copy()
        obj.name = original.name.replace('r15',revision)
        scene.collection.objects.link(obj)
body = bpy.data.objects['GEO-charizard-body-head-'+revision]
bm.to_mesh(body.data)
bm.free()
body.data.update()
after = np.asarray([vertex.co[:] for vertex in body.data.vertices],dtype=np.float32)
parent_ids = np.asarray([row.value for row in body.data.attributes['head_r15_vertex_id'].data])
retained = parent_ids >= 0
assert np.array_equal(after[retained],before[parent_ids[retained]])
protected = np.zeros(len(after),dtype=bool)
protected[retained] = audit['protected'][parent_ids[retained]]
assert protected.sum() == 113062
for sign,vertices,faces,colors in eyes:
    name = 'GEO-charizard-eye-'+str(sign)+'-'+revision
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(obj)
    for face in mesh.polygons:
        face.use_smooth = True
    attribute = mesh.color_attributes.new(name='provisional-eye-palette',type='FLOAT_COLOR',domain='POINT')
    attribute.data.foreach_set('color',np.asarray(colors,dtype=np.float32).ravel())
    mesh.color_attributes.active_color = attribute
for obj in scene.objects:
    if obj.type == 'MESH' and not obj.data.color_attributes:
        attribute = obj.data.color_attributes.new(name='clay-preview',type='FLOAT_COLOR',domain='POINT')
        attribute.data.foreach_set('color',np.tile(np.asarray([.63,.65,.68,1],dtype=np.float32),(len(obj.data.vertices),1)).ravel())
        obj.data.color_attributes.active_color = attribute
bpy.context.window.scene = scene
out.mkdir(parents=True)
np.savez_compressed(out/'eye-audit.npz',before=before,after=after,parent_vertex_ids=parent_ids,protected=protected,removed_parent_vertices=np.flatnonzero(mask),removed_parent_faces=removed_faces)
(out/'eye-receipt.json').write_text(json.dumps({'parent':'charizard-head-r15','candidate':'charizard-head-'+revision,'parentBlendSHA256':hashlib.sha256((parent/'charizard-head-r15.blend').read_bytes()).hexdigest(),'method':'Constrained triangular orbital skin patches, deeper socket floors and separate closed eye surfaces','removedVertices':int(mask.sum()),'orphanEdgesRemovedAfterCut':wire_count,'retainedVerticesExact':int(retained.sum()),'newSkinVertices':int((~retained).sum()),'protectedVerticesExact':int(protected.sum()),'eyes':records,'paletteStatus':'Provisional vertex colors for eye readability; no PBR textures or animated gaze','status':'awaiting export/visual/independent validation'},indent=2)+'\n')
print(json.dumps({'candidate':'charizard-head-'+revision,'eyes':len(eyes),'bodyVertices':len(after),'removedVertices':int(mask.sum()),'eyeBoundaryCounts':[len(record['boundaryParentRows']) for record in records]}))
