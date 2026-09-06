"""Author a reversible jaw-volume control below the placed oral cavity floor."""
import bpy
import json
from pathlib import Path

assert bpy.context.scene.name == 'EDIT-charizard-whole-r05'
root = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r05')
report_path = root/'jaw-refinement.json'
assert not report_path.exists()
head = bpy.data.objects['GEO-charizard-raw-head-r05']
assert head.data.users == 1 and head.data.shape_keys is None
assert len(head.data.vertices) == 9834
basis = head.shape_key_add(name='Basis', from_mix=False)
jaw = head.shape_key_add(name='Refine_JawDepth_r05', from_mix=False)
changed = 0
maximum_displacement = 0
for original, target in zip(basis.data, jaw.data):
    side, forward, up = original.co
    floor = -.003 - .041 * (forward+.01) / .31
    t = max(0., min(1., (forward+.02)/.09))
    weight = t*t*(3-2*t)
    if up < floor and weight > 0:
        target.co.z = floor + (up-floor)*(1-.4*weight)
        maximum_displacement = max(maximum_displacement, target.co.z-up)
        changed += 1
jaw.value = 1
jaw.slider_min = 0
jaw.slider_max = 1
bpy.context.view_layer.update()
report = {'object': head.name, 'shapeKey': jaw.name, 'value': jaw.value,
          'changedVertices': changed, 'maximumDisplacement': maximum_displacement,
          'authoring': 'MCP-authored native Blender shape key; no image generation or remeshing',
          'jawDepthReduction': .4, 'rearBlendForwardRange': [-.02, .07],
          'cavityFloor': 'headUp=-.003-.041*(headForward+.01)/.31',
          'scope': 'Shape study retaining the post-incision Basis. No rig or animation-ready topology claim.'}
report_path.write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
