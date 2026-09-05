"""Balanced inspection photography with measured full-object framing."""
import bpy
import hashlib
import json
import sys
from itertools import product
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render_proof


def corners(scene):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    points = []
    for obj in scene.objects:
        if obj.type not in {'MESH', 'CURVE', 'FONT'}:
            continue
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        if mesh and mesh.vertices:
            extents = [(min(v.co[i] for v in mesh.vertices), max(v.co[i] for v in mesh.vertices)) for i in range(3)]
            points.extend(evaluated.matrix_world @ Vector(point) for point in product(*extents))
        evaluated.to_mesh_clear()
    return points


def render(scene, output):
    output = Path(output) / 'inspection-r01'
    output.mkdir(exist_ok=True)
    camera = render_proof.configure(scene)
    scene.render.resolution_x = 900
    scene.render.resolution_y = 1000
    scene.cycles.samples = 32
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .2
    lamp = bpy.data.lights.new(scene.name + '-camera-fill', 'AREA')
    lamp.shape = 'DISK'
    lamp.size = .16
    fill = bpy.data.objects.new(lamp.name, lamp)
    scene.collection.objects.link(fill)
    clay = bpy.data.materials.new(scene.name + '-inspection-clay')
    clay.use_nodes = True
    shader = clay.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value = (.28, .30, .32, 1)
    shader.inputs['Roughness'].default_value = .65
    shots = [
        ('front', (0, -.38, .17), (0, .035, .065), 165, 58, True),
        ('back', (0, .40, .17), (0, .040, .065), 165, 58, True),
        ('side', (.37, .030, .09), (0, .030, .060), 165, 58, True),
        ('three-quarter', (.215, -.31, .275), (0, .030, .053), 165, 58, True),
        ('closed', (.13, -.23, .31), (0, 0, .010), 1, 68, True),
        ('underside', (.10, -.18, -.27), (0, 0, 0), 1, 70, True),
        ('hinge-closeup', (.11, -.10, .13), (0, .065, .013), 165, 95, False),
        ('controls-closeup', (.10, -.16, .15), (0, -.018, .005), 281, 92, False),
        ('port-closeup', (.05, -.16, .04), (0, -.067, 0), 1, 110, False),
    ]
    records = []
    for name, location, target, frame, lens, full_object in shots:
        render_proof.pose(scene, location, target, frame, lens)
        points = corners(scene)
        direction = camera.location - Vector(target)
        if full_object:
            lo = Vector([min(p[i] for p in points) for i in range(3)])
            hi = Vector([max(p[i] for p in points) for i in range(3)])
            target = (lo + hi) / 2
            for _ in range(40):
                camera.location = Vector(target) + direction
                render_proof.aim(camera, target)
                bpy.context.view_layer.update()
                projected = [world_to_camera_view(scene, camera, p) for p in points]
                if all(.08 <= p.x <= .92 and .08 <= p.y <= .92 and p.z > 0 for p in projected):
                    break
                direction *= 1.05
            else:
                raise RuntimeError('Could not fit full object for ' + name)
        projected = [world_to_camera_view(scene, camera, p) for p in points]
        bounds = [[min(p[i] for p in projected), max(p[i] for p in projected)] for i in [0, 1]]
        fill.location = camera.location + Vector((-.04, 0, .035 if camera.location.z > 0 else -.035))
        render_proof.aim(fill, target)
        lamp.energy = .9 * ((fill.location - Vector(target)).length / .35) ** 2
        for finish in (['material', 'clay'] if name in {'front', 'back', 'side', 'three-quarter'} else ['material']):
            scene.view_layers[0].material_override = clay if finish == 'clay' else None
            path = output / (name + '-' + finish + '.png')
            scene.render.filepath = str(path)
            bpy.ops.render.render(write_still=True)
            records.append({'view': name, 'finish': finish, 'frame': frame,
                            'camera': list(camera.location), 'target': list(target), 'lens': lens,
                            'wholeObjectRequired': full_object, 'projectedBounds': bounds,
                            'path': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    scene.view_layers[0].material_override = None
    (output / 'cameras.json').write_text(json.dumps({
        'source': bpy.data.filepath, 'sourceSha256': hashlib.sha256(Path(bpy.data.filepath).read_bytes()).hexdigest(),
        'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'shots': records,
        'reason': 'Original side photo clipped the lid and rear/underside were underlit. These independent inspection photos preserve the frozen source and animation.'
    }, indent=2) + '\n')
    print(json.dumps({'candidate': scene['candidateId'], 'inspectionStills': len(records)}))


if __name__ == '__main__':
    render(bpy.context.scene, sys.argv[sys.argv.index('--') + 1])
