"""Use the measured approximate symmetry guide, then repeat the jaw-depth study."""
import bpy
import json
from pathlib import Path
from mathutils import Matrix, Vector

root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r07')
scene = bpy.context.scene
obj = bpy.context.object
assert scene.name == 'EDIT-charizard-head-home-r07' and bpy.context.mode == 'OBJECT'
assert obj.name == 'GEO-charizard-home-head-r07'
checkpoint = root/'home-head-before-axis-correction.blend'
assert not checkpoint.exists() and not (root/'head-frame-correction.json').exists()
bpy.data.libraries.write(str(checkpoint),{scene},fake_user=True,compress=True)
audit = json.loads((root/'head-alignment-audit.json').read_text())
fit = audit['result']['denseValidation']['best']
old = Matrix(json.loads((root/'home-head-intake.json').read_text())['sourceFrame'])
side = Vector(fit['normal']).normalized()
forward = Vector((-side.y,side.x,.45)).normalized()
up = side.cross(forward).normalized()
new = Matrix((side,forward,up)).transposed().to_4x4()
new.translation = Vector(fit['closestPlanePointToO'])
before = [old@vertex.co for vertex in obj.data.shape_keys.key_blocks['Basis'].data]
obj.data.transform(new.inverted()@old,shape_keys=True)
error = max((new@vertex.co-point).length for vertex,point in zip(obj.data.shape_keys.key_blocks['Basis'].data,before))
assert error<1e-6
for key in obj.data.shape_keys.key_blocks:
    if key.name!='Basis':
        key.value = 0
key = obj.shape_key_add(name='Reduce_JawDepthAligned_r07',from_mix=True)
key.value = 1
obj.active_shape_key_index = len(obj.data.shape_keys.key_blocks)-1
bpy.context.view_layer.update()
bpy.data.libraries.write(str(root/'home-head-aligned-intake.blend'),{scene},fake_user=True,compress=True)
script = Path('/mnt/zer0models/workspace/zer0/experiments/pokemon/.worktrees/charizard-anatomy/tools/charizard-whole/capture_home_head_r07.py')
exec(compile(script.read_text(),str(script),'exec'),{'capture_label':'home-aligned-intake'})

def smooth(value):
    value = max(0,min(1,value))
    return value*value*(3-2*value)

changes = []
for vertex in key.data:
    weight = smooth((-.015-vertex.co.z)/.045)*smooth((vertex.co.y+.1)/.12)
    delta = max(0,-.015-vertex.co.z)*.35*weight
    vertex.co.z += delta
    changes.append(delta)
bpy.context.view_layer.update()
report = {'sourceFrame': [list(row) for row in new],'reviewFrame':[list(row) for row in obj.matrix_world],'basisReprojectionMaximumError':error,'fit':fit,'fitLimit':'Approximate frontal sculpt guide, not whole-head symmetry or anatomical ground truth. Pitch remains an artist estimate.','changes':'Rigid frame conversion of all keys; old trial keys disabled. Fresh aligned-frame jaw-depth key.','jawKey':key.name,'jawPlaneZ':-.015,'jawDepthFraction':.35,'forwardFade':[-.1,.02],'upFade':[-.015,-.06],'changedVertices':sum(delta>1e-7 for delta in changes),'maximumJawDisplacement':max(changes),'authoring':'MCP native mesh frame transform and shape key; no new GUI stroke'}
(root/'head-frame-correction.json').write_text(json.dumps(report,indent=2)+'\n')
exec(compile(script.read_text(),str(script),'exec'),{'capture_label':'home-aligned-depth'})
print(json.dumps(report))
