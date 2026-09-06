"""Coarse component construction through Blender MCP, followed by external visual critique.

No textures, sculpt microdetail, generated geometry, rigging or production acceptance.
Run build once in the owned scene, then render and inspect before a new revision.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Vector
from mathutils.geometry import tessellate_polygon

ROOT = Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05/whole-r11')
SCENE = 'EDIT-charizard-coarse-r11'
GROUPS = ('body', 'head-neck', 'wing-membranes', 'wing-spars', 'tail', 'eyes', 'hard-parts', 'controls')


def finish(obj, name, group):
    obj.name = 'GEO-r11-' + name
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    bpy.data.collections['R11-' + group].objects.link(obj)
    obj['component'] = group
    obj['stage'] = 'coarse-blockout-unapproved'
    obj['energyBaked'] = False
    if obj.type == 'MESH':
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj


def blob(name, center, radii, group):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=1, location=center)
    obj = bpy.context.object
    for vertex in obj.data.vertices:
        vertex.co = Vector(tuple(vertex.co[i] * radii[i] for i in range(3)))
    return finish(obj, name, group)


def tube(name, points, radii, group, sides=12):
    points = [Vector(p) for p in points]
    vertices, faces = [], []
    previous_u = None
    for index, point in enumerate(points):
        direction = points[min(index + 1, len(points) - 1)] - points[max(index - 1, 0)]
        direction.normalize()
        reference = Vector((1, 0, 0)) if abs(direction.x) < .9 else Vector((0, 1, 0))
        u = direction.cross(reference).normalized() if previous_u is None else (previous_u - direction * previous_u.dot(direction)).normalized()
        previous_u = u
        v = direction.cross(u).normalized()
        for side in range(sides):
            angle = side * math.tau / sides
            vertices.append(point + radii[index] * (u * math.cos(angle) + v * math.sin(angle)))
    for ring in range(len(points) - 1):
        for side in range(sides):
            a = ring * sides + side
            b = ring * sides + (side + 1) % sides
            faces.append((a, b, b + sides, a + sides))
    faces.extend([tuple(reversed(range(sides))), tuple((len(points) - 1) * sides + i for i in range(sides))])
    mesh = bpy.data.meshes.new('MESH-r11-' + name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    bm = bmesh.new(); bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh); bm.free()
    obj = bpy.data.objects.new('GEO-r11-' + name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return finish(obj, name, group)


def cone(name, start, end, radius, group='hard-parts'):
    start, end = Vector(start), Vector(end)
    bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=radius, radius2=0, depth=(end-start).length, location=(start+end)/2)
    obj = bpy.context.object
    obj.rotation_euler = (end-start).to_track_quat('Z', 'Y').to_euler()
    return finish(obj, name, group)


def build():
    assert SCENE not in bpy.data.scenes
    ROOT.mkdir(exist_ok=True)
    scene = bpy.data.scenes.new(SCENE)
    bpy.context.window.scene = scene
    for group in GROUPS:
        collection = bpy.data.collections.new('R11-' + group)
        scene.collection.children.link(collection)
    body = blob('body-pear', (0, 0, .63), (.32, .285, .49), 'body')
    for vertex in body.data.vertices:
        height = vertex.co.z / .49
        width = 1.0 - .24 * height
        vertex.co.x *= width
        vertex.co.y *= width
    tube('neck', [(0,.015,.94),(0,.02,1.10),(0,.01,1.29),(0,-.05,1.46),(0,-.17,1.53)], [.145,.12,.112,.12,.135], 'head-neck', 16)
    blob('skull', (0,-.225,1.55), (.17,.195,.133), 'head-neck')
    blob('muzzle', (0,-.39,1.565), (.17,.145,.10), 'head-neck')
    blob('jaw', (0,-.35,1.476), (.147,.165,.066), 'head-neck')
    for sign, side in ((-1,'L'),(1,'R')):
        blob('thigh-'+side, (sign*.33,.025,.31), (.235,.23,.29), 'body')
        blob('shin-'+side, (sign*.385,-.065,.17), (.12,.145,.16), 'body')
        blob('foot-'+side, (sign*.39,-.205,.09), (.15,.235,.09), 'body')
        tube('arm-'+side, [(sign*.20,-.005,1.0),(sign*.37,-.025,.95),(sign*.49,-.135,.82)], [.075,.062,.047], 'body')
        blob('hand-'+side, (sign*.50,-.155,.79), (.069,.065,.07), 'body')
        for finger in range(3):
            x=sign*(.50+(finger-1)*.055)
            tube('finger-'+side+str(finger), [(x,-.16,.8),(x,-.19,.71)], [.028,.018], 'body', 8)
        blob('eye-'+side, (sign*.148,-.274,1.603), (.034,.067,.040), 'eyes')
        cone('horn-'+side,(sign*.114,-.12,1.617),(sign*.18,.105,1.525),.053)
        for digit in range(3):
            x=sign*.39+(digit-1)*.085
            cone('foot-claw-'+side+str(digit),(x,-.35,.074),(x,-.475,.042),.040)
    tail = tube('tail', [(0,.16,.33),(0,.43,.255),(.11,.70,.175),(.40,.77,.14),(.66,.58,.18),(.82,.35,.33),(.86,.13,.58)], [.20,.175,.135,.108,.076,.049,.021], 'tail',16)
    modifier=tail.modifiers.new('Coarse curve continuity','SUBSURF'); modifier.levels=1; modifier.render_levels=1
    socket=bpy.data.objects.new('FlameSocket',None)
    bpy.data.collections['R11-controls'].objects.link(socket)
    socket.location=(.86,.13,.58); socket.parent=tail
    socket.empty_display_size=.035
    socket['energyBaked']=False; socket['effect']='charizard-tail-flame'
    for sign, side in ((-1,'L'),(1,'R')):
        outline=[(.18,.15,1.02),(.57,.17,1.16),(.79,.18,1.57),(1.06,.20,1.33),(1.24,.23,.85),(.98,.20,1.025),(.84,.18,.85),(.63,.16,1.0),(.42,.15,.85)]
        points=[Vector((sign*x,y,z)) for x,y,z in outline]
        triangles=tessellate_polygon([points])
        indices={tuple(p):i for i,p in enumerate(points)}
        mesh=bpy.data.meshes.new('MESH-r11-membrane-'+side)
        mesh.from_pydata(points,[],[tuple(v if isinstance(v, int) else indices[tuple(v)] for v in tri) for tri in triangles])
        obj=bpy.data.objects.new('GEO-r11-membrane-'+side,mesh)
        scene.collection.objects.link(obj); finish(obj,'membrane-'+side,'wing-membranes')
        thickness=obj.modifiers.new('Temporary membrane thickness','SOLIDIFY'); thickness.thickness=.008
        leading=[(sign*x,y,z) for x,y,z in outline[:5]]
        tube('leading-spar-'+side,leading,[.066,.046,.043,.034,.012],'wing-spars',10)
        for n,tip in enumerate((6,8)):
            tube('finger-spar-'+side+str(n),[points[2],points[tip]],[.023,.009],'wing-spars',8)
    placeholder=bpy.data.objects.new('PLACEHOLDER-teeth-deferred-until-shape-gate',None)
    bpy.data.collections['R11-hard-parts'].objects.link(placeholder)
    placeholder.hide_render=True
    scene.render.engine='BLENDER_WORKBENCH'
    scene.render.resolution_x=scene.render.resolution_y=1000
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.display.shading.light='STUDIO'
    scene.display.shading.studio_light='paint.sl'
    scene.display.shading.color_type='SINGLE'
    scene.display.shading.single_color=(.65,.65,.65)
    scene.display.shading.show_shadows=False
    scene.display.shading.show_cavity=False
    scene.world=bpy.data.worlds.new('WORLD-r11-neutral')
    scene.world.color=(.065,.065,.065)
    scene.view_settings.view_transform='Standard'
    target=Vector((0,0,.84))
    for view,offset in {'front':(0,-5,0),'side':(5,0,0),'rear':(0,5,0),'threequarter':(3,-5,2.0)}.items():
        data=bpy.data.cameras.new('CAM-r11-'+view); data.type='ORTHO'; data.ortho_scale=2.85
        camera=bpy.data.objects.new(data.name,data); scene.collection.objects.link(camera)
        camera.location=target+Vector(offset)
        camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene['stage']='coarse-blockout-unapproved'; scene['visualGatePassed']=False
    print(json.dumps({'scene':scene.name,'objects':len(scene.objects),'status':'Render and critique before correction'}))


def capture(revision):
    assert bpy.context.scene.name == SCENE
    assert revision in ('a','b','c','d')
    scene=bpy.context.scene
    path=ROOT/('charizard-blockout-r11'+revision+'.blend')
    assert not path.exists()
    for view in ('front','side','rear','threequarter'):
        scene.camera=scene.objects['CAM-r11-'+view]
        scene.render.filepath=str(ROOT/('r11'+revision+'-'+view+'.png'))
        bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(path))
    print(str(path))


if globals().get('operation') == 'build':
    build()
elif globals().get('operation') == 'capture':
    capture(globals()['revision'])
