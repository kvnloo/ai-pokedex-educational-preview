"""Photograph the actual reimported GLB using the hero proof camera and lights."""
import bpy
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render_proof
from reopen_runtime import activate


def render(scene, output):
    output = Path(output) / 'reopened-renders'
    output.mkdir(exist_ok=True)
    if not scene.camera:
        data = bpy.data.cameras.new(scene.name + '-proof-camera')
        camera = bpy.data.objects.new(data.name, data)
        scene.collection.objects.link(camera)
        scene.camera = camera
    render_proof.configure(scene)
    scene.render.resolution_x = 900
    scene.render.resolution_y = 1000
    shots = [
        ('three-quarter', (.215, -.31, .275), (0, .030, .053), 58, 'Ready', .5),
        ('closed', (.13, -.23, .31), (0, 0, .010), 68, 'Closed', 0),
        ('controls-closeup', (.10, -.16, .15), (0, -.018, .005), 92, 'ButtonPress', 1 / 3),
    ]
    records = []
    for name, location, target, lens, clip, seconds in shots:
        render_proof.pose(scene, location, target, 1, lens)
        activate(scene, clip, seconds)
        path = output / (name + '-material.png')
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        records.append({'view': name, 'camera': location, 'target': target,
                        'lens': lens, 'clip': clip, 'seconds': seconds, 'path': str(path)})
    (output / 'cameras.json').write_text(json.dumps(records, indent=2) + '\n')
    print(json.dumps({'candidate': scene['candidateId'], 'reopenedStills': len(records)}))


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:]
    render(bpy.context.scene, args[0])
