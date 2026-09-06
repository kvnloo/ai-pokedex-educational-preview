"""Inspect a curved closed-mouth opening on the cleaned source surface."""
import bpy
import json
import numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r05')
out=root/'mouth-layout-r01';assert not out.exists();out.mkdir()
data=np.load(root/'head-r20/muzzle-audit.npz')
landmarks=json.loads((root/'landmarks-r02/landmarks.json').read_text())
origin=np.asarray(landmarks['origin']);frame=np.asarray(landmarks['frame']);side,forward,up=frame
source=bpy.data.objects['GEO-charizard-body-head-r20']
before=np.asarray([vertex.co[:] for vertex in source.data.vertices],dtype=np.float32)
assert np.array_equal(before,data['after'])
faces=[list(face.vertices) for face in source.data.polygons if not np.any(data['protected'][list(face.vertices)])]
tree=BVHTree.FromPolygons(before.tolist(),faces)
center=np.asarray([.012,.020])
axis_scale=np.asarray([.12,.22])


def profile(phi):
    return -.025+.020*np.exp(-((np.abs(phi)-.70)/.40)**2)


def surface(phi,height):
    direction=side*axis_scale[0]*np.sin(phi)+forward*axis_scale[1]*np.cos(phi)
    direction/=np.linalg.norm(direction)
    target=origin+side*center[0]+forward*center[1]+up*height
    point,normal,index,distance=tree.ray_cast(Vector(target+direction*.6),Vector(-direction))
    assert point is not None and normal.dot(Vector(direction))>.1,(phi,height)
    return np.asarray(point),np.asarray(normal)


theta=np.linspace(0,2*np.pi,256,endpoint=False)
phi=1.45*np.cos(theta)
height=profile(phi)+.0028*np.sin(theta)
height-=.018*np.exp(-((np.abs(phi)-.60)/.16)**2)*np.clip(-np.sin(theta)*2,0,1)
uv=np.column_stack([phi,height])
points=[];normals=[]
for angle,h in uv:
    point,normal=surface(angle,h);points.append(point);normals.append(normal)
scene=bpy.data.scenes.new('REVIEW-charizard-mouth-layout-r01')
for original in bpy.data.scenes['EDIT-charizard-head-r20'].objects:
    if original.type=='MESH':
        obj=original.copy();obj.data=original.data.copy();obj.parent=None;obj.matrix_world=original.matrix_world.copy()
        obj.name=original.name.replace('r20','mouth-layout-r01');scene.collection.objects.link(obj)
curve=bpy.data.curves.new('DIAG-mouth-opening-r01','CURVE');curve.dimensions='3D';curve.resolution_u=1
curve.bevel_depth=.0015;curve.bevel_resolution=2
spline=curve.splines.new('POLY');spline.points.add(len(points)-1);spline.use_cyclic_u=True
for row,point,normal in zip(spline.points,points,normals):row.co=(*list(point+normal*.0015),1)
obj=bpy.data.objects.new('DIAG-mouth-opening-r01',curve);scene.collection.objects.link(obj)
material=bpy.data.materials.new('DIAG-mouth-opening-red');material.diffuse_color=(.8,.015,.01,1);curve.materials.append(material)
bpy.context.window.scene=scene
camera=bpy.data.objects.new('CAM-charizard-mouth-layout-r01',bpy.data.cameras.new('CAM-charizard-mouth-layout-r01'))
scene.collection.objects.link(camera);scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=.64
scene.render.engine='BLENDER_WORKBENCH';scene.render.resolution_x=scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('WORLD-charizard-mouth-layout-r01');scene.world.color=(.075,.075,.075)
shade=scene.display.shading;shade.light='STUDIO';shade.studio_light='paint.sl';shade.color_type='VERTEX';shade.show_shadows=False;shade.show_cavity=False;shade.background_type='WORLD'
directions={'front':forward,'reference':np.asarray([0,-1,0]),'negative-side':-side,'positive-side':side,'top':up}
for name,direction in directions.items():
    camera.location=Vector(origin+direction*3);camera.rotation_euler=(Vector(origin)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.clip_start=2.80 if 'side' in name else .01;camera.data.clip_end=3.20 if 'side' in name else 1000
    scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
np.savez_compressed(out/'layout.npz',uv=uv,points=np.asarray(points),normals=np.asarray(normals),origin=origin,frame=frame,center=center,axis_scale=axis_scale)
(out/'layout.json').write_text(json.dumps({'source':'charizard-head-r20','coordinateSystem':'elliptical horizontal head rays: phi,height','rayCenterSideForward':center.tolist(),'rayAxisScale':axis_scale.tolist(),'phiExtent':1.45,'restHalfGap':.0028,'lowerFangNotchDepth':.018,'status':'Diagnostic contour only; parent geometry unchanged; awaiting visual decision'},indent=2)+'\n')
print('Rendered closed-mouth contour; source unchanged')
