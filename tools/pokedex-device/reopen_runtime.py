"""Reopen the actual GLBs in clean Blender scenes and sample exported clips."""
import bpy
import hashlib
import json
import math
import numpy as np
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
OUT = Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001')


def activate(scene, clip, seconds):
    for obj in scene.objects:
        if not obj.animation_data:
            continue
        obj.animation_data.action = None
        for track in obj.animation_data.nla_tracks:
            track.mute = track.name != clip
    scene.frame_set(1 + round(seconds * 30))
    nodes = {obj.get('source_name'): obj for obj in scene.objects}
    for mat in {mat for obj in scene.objects if obj.type == 'MESH' for mat in obj.data.materials}:
        if 'power_signal' in mat:
            signal = nodes[mat['power_signal'].split('_RT_', 1)[1]]
            shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
            shader.inputs['Emission Strength'].default_value = mat['max_emission'] * max(0, min(1, signal.location.x))
    return nodes


def inspect(level):
    scene = bpy.data.scenes.new(f'PDX.ReopenedLOD{level}')
    bpy.context.window.scene = scene
    scene.render.fps = 30
    path = OUT / 'runtime' / f'pokedex-v001-lod{level}.glb'
    bpy.ops.import_scene.gltf(filepath=str(path))
    samples = []
    for clip, times in [('Closed',[0,.5]),('Opening',[0,1,2]),('BootUp',[0,1,2.5]),('Ready',[0,1]),('Idle',[0,1.5,3]),('ButtonPress',[0,.333333,.8])]:
        for t in times:
            nodes = activate(scene, clip, t)
            samples.append({'clip':clip,'seconds':t,'hingeDegrees':math.degrees(nodes['PDX.LidHinge'].rotation_quaternion.to_euler('XYZ').x),'buttonZ':nodes['PDX.Button.A'].location.z,'ringPower':nodes['SIG_RingPower'].location.x,'screenPower':nodes['SIG_ScreenPower'].location.x})
    nodes = activate(scene, 'Ready', .5)
    meshes = []
    for obj in scene.objects:
        if obj.type != 'MESH':
            continue
        mesh = obj.data
        mesh.calc_loop_triangles()
        vertices = np.asarray([list(v.co) for v in mesh.vertices], dtype=np.float64)
        faces = np.asarray([tuple(t.vertices) for t in mesh.loop_triangles])
        tri = vertices[faces]
        areas = np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1)/2
        meshes.append({'name':obj.name,'triangles':len(faces),'zeroAreaTriangles':int((areas==0).sum()),'finitePositions':bool(np.isfinite(vertices).all()),'uvLayers':len(mesh.uv_layers),'scale':list(obj.scale)})
    result = {'level':level,'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'meshObjects':len(meshes),'triangles':sum(m['triangles'] for m in meshes),'meshes':meshes,'animationSamples':samples,'images':[{'name':im.name,'size':list(im.size)} for mat in {m for o in scene.objects if o.type=='MESH' for m in o.data.materials} for node in mat.node_tree.nodes if node.type=='TEX_IMAGE' and (im:=node.image)],'passed':all(m['finitePositions'] and m['uvLayers']>0 and m['zeroAreaTriangles']==0 for m in meshes)}
    assert abs(samples[0]['hingeDegrees']) < .01
    assert abs(next(s['hingeDegrees'] for s in samples if s['clip']=='Opening' and s['seconds']==2)+112)<.01
    pressed = next(s['buttonZ'] for s in samples if s['clip']=='ButtonPress' and s['seconds']==.333333)
    assert abs(pressed-.01815)<1e-6
    collection = bpy.data.collections.new('PDX.Presentation')
    scene.collection.children.link(collection)
    import presentation
    presentation.setup(scene)
    scene.camera.location = (.265,-.38,.29)
    presentation.aim(scene.camera,(0,-.04,.074))
    bpy.data.libraries.write(str(OUT/'source'/f'pokedex-v001-reopened-lod{level}.blend'),{scene},fake_user=True)
    (OUT/'runtime'/f'lod{level}-reopened.json').write_text(json.dumps(result,indent=2))
    print('REOPENED',level,result['passed'],result['triangles'],sum(m['zeroAreaTriangles'] for m in meshes),flush=True)
    return result


if __name__ == '__main__':
    results = [inspect(level) for level in [0,1,2]]
    if not all(r['passed'] for r in results):
        raise RuntimeError('GLB reopened geometry did not pass')
