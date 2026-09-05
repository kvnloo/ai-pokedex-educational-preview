import bpy,math
from mathutils import Vector,Matrix

def setup():
    s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=True
    try:
        prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='CUDA';prefs.get_devices()
        for device in prefs.devices:device.use=device.type=='CUDA'
        s.cycles.device='GPU'
    except Exception as e:print('CPU fallback',e)
    s.world.color=(.18,.18,.18);s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.20,.23,.27,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.45
    s.view_settings.view_transform='AgX';s.render.film_transparent=True
    s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.resolution_percentage=100
    for name,loc,power,size,color in [('key',(-.17,-.06,.29),.6,.19,(1,.86,.74)),('fill',(.16,-.02,.18),.12,.16,(.73,.84,1)),('rim',(.02,.22,.24),.65,.14,(1,1,1))]:
        data=bpy.data.lights.new('STUDIO-'+name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
        o=bpy.data.objects.new('STUDIO-'+name,data);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,.035))-o.location).to_track_quat('-Z','Y').to_euler()
    data=bpy.data.cameras.new('ReferenceCamera');o=bpy.data.objects.new('ReferenceCamera',data);s.collection.objects.link(o);s.camera=o
    return s

def camera(scene,cam,width,height,mult=2):
    az,el,roll,scale,tx,ty,dist=cam;a,e,r=map(math.radians,[az,el,roll])
    right=Vector((math.cos(a),math.sin(a),0));up=Vector((-math.sin(a)*math.sin(e),math.cos(a)*math.sin(e),math.cos(e)));normal=right.cross(up)
    rr=math.cos(r)*right+math.sin(r)*up;uu=-math.sin(r)*right+math.cos(r)*up
    o=scene.camera;o.location=normal*dist;o.rotation_euler=Matrix((rr,uu,normal)).transposed().to_euler()
    o.data.type='PERSP';o.data.sensor_fit='HORIZONTAL';o.data.sensor_width=36;o.data.lens=scale*dist*36/width
    o.data.shift_x=(width/2-tx)/width;o.data.shift_y=(ty-height/2)/width;o.data.clip_start=.001;o.data.clip_end=100
    scene.render.resolution_x=width*mult;scene.render.resolution_y=height*mult
