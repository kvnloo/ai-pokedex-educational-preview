"""Render the original isolated head under the repaired study's exact cameras."""
import bpy
import json
from pathlib import Path

scene = bpy.context.scene
assert scene.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
path = root/'home-head-r07-matched-intake.blend'
assert not path.exists() and not (root/'matched-intake').exists()
head = bpy.data.objects['GEO-charizard-home-head-r07']
states = [(obj,obj.hide_render,obj.hide_get()) for obj in scene.objects if obj.type == 'MESH']
keys = [(key,key.value) for key in head.data.shape_keys.key_blocks]
try:
    for obj,_,_ in states:
        obj.hide_render = obj != head
        obj.hide_set(obj != head)
    for key,_ in keys:
        if key.name != 'Basis':
            key.value = 0
    bpy.context.view_layer.update()
    capture_label = 'matched-intake'
    exec(compile((Path(__file__).parent/'capture_home_head_r07.py').read_text(), 'capture_home_head_r07.py','exec'))
    bpy.data.libraries.write(str(path), {scene},fake_user=True,compress=True)
finally:
    for obj,render,viewport in states:
        obj.hide_render = render
        obj.hide_set(viewport)
    for key,value in keys:
        key.value = value
    bpy.context.view_layer.update()
print(json.dumps({'source':str(path),'scope':'Basis head after native import, isolated cut and rigid reframe; no anatomy keys or eye patches. Same cameras and material as repaired study.'}))
