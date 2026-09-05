"""Reproduce r02a in a fresh Blender process without overwriting its artifacts."""
import argparse
import bpy
import hashlib
import sys
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
output_directory = str(Path(args.out).resolve())
assert Path(output_directory).is_relative_to('/mnt/zer0models'), 'Keep private binaries on the asset drive'
assert not Path(output_directory).exists(), 'Choose a new verification directory'
assert 'EDIT-charizard-tail-r02a' not in bpy.data.scenes, 'Use a fresh Blender process'
root = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon')
parent = root / 'assets/blender/charizard-tail-r01/charizard-tail-r01.blend'
raw = root / 'assets/experiments/charizard-official-raw/charizard-official-raw-61062-o256.glb'
assert hashlib.sha256(parent.read_bytes()).hexdigest() == 'fe19a120326f98a7173f25a4e1b435a40d96caa04286c14078043699571aa680'
assert hashlib.sha256(raw.read_bytes()).hexdigest() == 'f9f0b2c3f2e189dcdd1c72190e8c79b7b958a2dd4f3bacb2d844ec37b330ed8e'
with bpy.data.libraries.load(str(parent), link=False) as (available, loaded):
    assert 'EDIT-charizard-tail-r01' in available.scenes
    loaded.scenes = ['EDIT-charizard-tail-r01']
bpy.context.window.scene = bpy.data.scenes['EDIT-charizard-tail-r01']
bpy.context.view_layer.update()
parent_objects = [(obj, obj.matrix_world.copy()) for obj in bpy.context.scene.objects if obj.type == 'MESH']
raw_scene = bpy.data.scenes.new('FAIR-charizard-official-61062-o256')
bpy.context.window.scene = raw_scene
bpy.ops.import_scene.gltf(filepath=str(raw))
scene = bpy.data.scenes.new('EDIT-charizard-tail-r02a')
bpy.context.window.scene = scene
for obj, transform in parent_objects:
    copy = obj.copy()
    copy.data = obj.data.copy()
    copy.parent = None
    copy.matrix_world = transform
    copy.name = 'GEO-charizard-body-tail-r02a' if len(copy.data.vertices) > 10000 else 'GEO-charizard-flame-reference-r02a'
    scene.collection.objects.link(copy)
scripts = Path(__file__).resolve().parent
for name in ['tail_patch.py', 'render_review.py']:
    exec(compile((scripts / name).read_text(), str(scripts / name), 'exec'))
