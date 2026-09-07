"""Mechanical preview only: hide the original foot, never the nearby tail.
Execute inside Blender with OUTPUT_DIR and optional VIEW_NAMES globals.
Restores visibility, camera, output path and removes its temporary mask.
"""
import bpy
import json
from pathlib import Path

scene = bpy.context.scene
body = bpy.data.objects['GEO-body-head-joined-r92']
candidate = bpy.data.objects['GEO-foot-reused-r130']
eligible = set()
for vertex in body.data.vertices:
    point = body.matrix_world @ vertex.co
    if point.x > .15 and point.y < -.2 and point.z < -.575:
        eligible.add(vertex.index)
neighbors = {index: [] for index in eligible}
for edge in body.data.edges:
    a, b = edge.vertices
    if a in eligible and b in eligible:
        neighbors[a].append(b)
        neighbors[b].append(a)
components = []
while eligible:
    stack = [eligible.pop()]
    component = set(stack)
    while stack:
        for neighbor in neighbors[stack.pop()]:
            if neighbor in eligible:
                eligible.remove(neighbor)
                component.add(neighbor)
                stack.append(neighbor)
    components.append(component)
foot = max(components, key=len)
output = Path(OUTPUT_DIR)
output.mkdir(parents=True, exist_ok=True)
views = {'foot': 'CAM-r122-foot', 'front': 'CAM-r50-front',
         'side': 'CAM-r50-side', 'rear': 'CAM-r50-rear',
         'threequarter': 'CAM-r50-threequarter'}
old_camera, old_path = scene.camera, scene.render.filepath
old_render, old_hidden = candidate.hide_render, candidate.hide_get()
group = body.vertex_groups.new(name='TEMP-foot-preview')
modifier = None
try:
    group.add([v.index for v in body.data.vertices if v.index not in foot], 1, 'REPLACE')
    modifier = body.modifiers.new('TEMP-foot-preview', 'MASK')
    modifier.vertex_group = group.name
    candidate.hide_render = False
    candidate.hide_set(False)
    for view in globals().get('VIEW_NAMES', list(views)):
        scene.camera = bpy.data.objects[views[view]]
        scene.render.filepath = str(output / (view + '.png'))
        bpy.ops.render.render(write_still=True)
finally:
    if modifier is not None:
        body.modifiers.remove(modifier)
    body.vertex_groups.remove(group)
    candidate.hide_render, scene.camera = old_render, old_camera
    candidate.hide_set(old_hidden)
    scene.render.filepath = old_path
print(json.dumps({'hiddenFootVertices': len(foot),
                  'preservedOtherComponentSizes': sorted(len(c) for c in components if c is not foot)}))
