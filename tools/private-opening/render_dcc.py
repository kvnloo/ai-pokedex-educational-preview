"""Render the exact authored .blend for visual inspection, outside the repository."""
import bpy,sys,math
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:];source=Path(args[0]);out=Path(args[1])
bpy.ops.wm.open_mainfile(filepath=str(source));bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
points=[o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices]
lo=Vector(tuple(min(p[i] for p in points) for i in range(3)));hi=Vector(tuple(max(p[i] for p in points) for i in range(3)));center=(lo+hi)/2;h=hi.z-lo.z;extent=max(h,hi.x-lo.x)
world=bpy.data.worlds.new('authored studio');bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.19,.24,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
bpy.ops.object.camera_add(location=center+Vector((extent*1.0,-extent*2.2,extent*.6)));cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=extent*1.4;bpy.context.scene.camera=cam
for xyz,power,size in [((-3,-4,6),800,5),((4,-2,3),600,4),((0,4,5),1000,3)]:
 bpy.ops.object.light_add(type='AREA',location=center+Vector(xyz)*h*.5);light=bpy.context.object;light.data.energy=power*h*h*.10;light.data.shape='DISK';light.data.size=size*h*.5;light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,lo.z-.015));floor=bpy.context.object;m=bpy.data.materials.new('studio floor');m.diffuse_color=(.13,.17,.19,1);floor.data.materials.append(m)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=24;s.render.resolution_x=1200;s.render.resolution_y=1200;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=str(out);s.view_settings.view_transform='AgX';bpy.ops.render.render(write_still=True)
