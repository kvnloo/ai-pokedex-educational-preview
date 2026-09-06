"""Coarse corrections following root's inspection of r11a front/side/rear/3q."""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.geometry import tessellate_polygon

helper = Path(__file__).with_name('blockout_r11.py')
ns = {}; exec(compile(helper.read_text(), str(helper), 'exec'), ns)
blob, tube, finish = ns['blob'], ns['tube'], ns['finish']
scene = bpy.context.scene
assert scene.name == ns['SCENE']
assert Path(bpy.data.filepath).name == 'charizard-blockout-r11a.blend'


def remove(name):
    obj = scene.objects['GEO-r11-' + name]
    data = obj.data
    bpy.data.objects.remove(obj, do_unlink=True)
    if data.users == 0:
        bpy.data.meshes.remove(data)


audit = {
    'revision': 'r11a', 'gatePassed': False,
    'silhouette': 'FAIL: upright egg body, hanging thighs, mechanical wing edges.',
    'torsoToHead': 'FAIL: head reads as three stacked blobs; jaw/muzzle not one short broad mass.',
    'wingSpan': 'Retain large span for next comparison; no evidence to shrink wings yet.',
    'legMass': 'FAIL: sufficient volume but too vertical; broaden and squat thighs.',
    'armLength': 'FAIL: low hands and projecting roots; shorten reach and move roots inward.',
    'headProfile': 'FAIL: sausage-shaped muzzle and exposed eye spheres.',
    'neckThickness': 'Review: adequate coarse diameter, but angular S and exposed chest transition.',
    'tailAttachment': 'FAIL: base depth needs more pelvic overlap; tube frame twist must be repaired.',
    'referenceLimit': 'HOME and illustration are oblique references; rear sprite is low resolution and differently posed. No supplied exact side orthographic reference.',
}
(ns['ROOT'] / 'critique-r11a.json').write_text(json.dumps(audit, indent=2) + '\n')
body = scene.objects['GEO-r11-body-pear']
for vertex in body.data.vertices:
    vertex.co.x *= 1.12
    vertex.co.y *= 1.07
    vertex.co.z *= .91
body.location.z = .60
remove('neck')
tube('neck', [(0,.01,.88),(0,.03,1.08),(0,.005,1.28),(0,-.075,1.43),(0,-.18,1.50)], [.155,.13,.115,.126,.14], 'head-neck', 16)
for name in ('skull','muzzle','jaw'):
    remove(name)
# Broad low-resolution head volumes; no facial grooves, nostrils or teeth.
blob('skull', (0,-.235,1.545), (.195,.19,.14), 'head-neck')
blob('muzzle', (0,-.37,1.57), (.195,.145,.086), 'head-neck')
blob('jaw', (0,-.32,1.478), (.168,.17,.052), 'head-neck')
for sign, side in ((-1,'L'),(1,'R')):
    thigh=scene.objects['GEO-r11-thigh-'+side]
    for vertex in thigh.data.vertices:
        vertex.co.x *= 1.1
        vertex.co.z *= .8
    thigh.location.x=sign*.355; thigh.location.z=.275
    thigh.rotation_euler.y=sign*.32
    remove('arm-'+side)
    tube('arm-'+side,[(sign*.12,-.005,.94),(sign*.34,-.035,.955),(sign*.43,-.16,.81)],[.085,.053,.042],'body')
    scene.objects['GEO-r11-hand-'+side].location.x=sign*.44
    for digit in range(3):
        finger=scene.objects['GEO-r11-finger-'+side+str(digit)]
        finger.location.x-=sign*.06
    eye=scene.objects['GEO-r11-eye-'+side]
    eye.location.x=sign*.171
    for vertex in eye.data.vertices:
        vertex.co *= .68
    # Separate trailing-edge arcs establish silhouette; membrane remains separate.
    old=scene.objects['GEO-r11-membrane-'+side]
    outline=[(.13,.15,.99),(.57,.17,1.16),(.79,.18,1.57),(1.06,.20,1.33),(1.24,.23,.85)]
    def arc(a,c,b):
        return [tuple((1-t)**2*a[i]+2*(1-t)*t*c[i]+t*t*b[i] for i in range(3)) for t in (1/6,2/6,3/6,4/6,5/6,1)]
    outline+=arc(outline[-1],(1.035,.2,1.28),(.84,.18,.85))
    outline+=arc(outline[-1],(.63,.16,1.13),(.42,.15,.85))
    points=[Vector((sign*x,y,z)) for x,y,z in outline]
    triangles=tessellate_polygon([points]); indices={tuple(p):i for i,p in enumerate(points)}
    old.data.clear_geometry()
    old.data.from_pydata(points,[],[tuple(v if isinstance(v,int) else indices[tuple(v)] for v in tri) for tri in triangles])
    old.data.update()
    remove('leading-spar-'+side)
    tube('leading-spar-'+side,[(sign*x,y,z) for x,y,z in outline[:5]],[.058,.044,.04,.03,.01],'wing-spars',10)
socket=next(o for o in scene.objects if o.type=='EMPTY' and o.get('effect')=='charizard-tail-flame')
world=socket.matrix_world.copy(); socket.parent=None; socket.matrix_world=world
remove('tail')
tail=tube('tail',[(0,.10,.34),(0,.39,.24),(.1,.65,.165),(.38,.73,.135),(.64,.57,.18),(.81,.34,.33),(.86,.13,.58)],[.225,.17,.13,.105,.075,.049,.021],'tail',16)
mod=tail.modifiers.new('Coarse curve continuity','SUBSURF'); mod.levels=1; mod.render_levels=1
socket.parent=tail; socket.matrix_world=world
print('r11b coarse corrections ready for four-view capture')
