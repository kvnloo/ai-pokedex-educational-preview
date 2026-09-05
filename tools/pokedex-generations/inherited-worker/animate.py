"""Portable NLA clips: all visible motion is core glTF node translation/rotation/scale."""
import bpy,math
CLIPS=[('Closed',1,18),('Opening',18,84),('BootUp',84,132),('Ready',132,156),('Idle',156,198),('ButtonPress',198,222)]
TINY=.0001

def track(obj,name,start,end,path,points):
    obj.animation_data_create();action=bpy.data.actions.new(name+'__'+obj.name);obj.animation_data.action=action
    for frame,value in points:
        setattr(obj,path,value);obj.keyframe_insert(data_path=path,frame=frame)
    slot=obj.animation_data.action_slot
    for layer in action.layers:
        for strip in layer.strips:
            bag=strip.channelbag(slot)
            for curve in bag.fcurves:
                for key in curve.keyframe_points:
                    key.interpolation='LINEAR'
    obj.animation_data.action=None
    nla=obj.animation_data.nla_tracks.new();nla.name=name
    strip=nla.strips.new(name,start,action);strip.action_slot=slot;strip.action_frame_start=start;strip.action_frame_end=end
    strip.frame_start=start;strip.frame_end=end;strip.extrapolation='NOTHING';strip.blend_type='REPLACE'

def build(objects,contract):
    lid=objects['lid'];boot=objects['boot'];ready=objects['ready'];progress=objects['progress'];button=objects['button'];dial=objects['dial']
    location=tuple(button.location);angle=math.radians(-contract['angle'])
    for obj in objects.values():obj.animation_data_clear()
    for name,start,end in CLIPS:
        def hold(v):return [(start,v),(end,v)]
        hinge=hold((0,0,0) if name=='Closed' else (angle,0,0))
        if name=='Opening':
            hinge=[]
            for frame in range(start,end+1,3):
                t=(frame-start)/(end-start);ease=t*t*(3-2*t);hinge.append((frame,(angle*ease,0,0)))
            hinge.append((end,(angle,0,0)))
        track(lid,name,start,end,'rotation_euler',hinge)
        boot_points=hold((1,1,1) if name=='BootUp' else (TINY,)*3)
        if name=='BootUp':boot_points=[(start,(TINY,)*3),(start+7,(1,1,1)),(end,(1,1,1))]
        if name=='Ready':boot_points=[(start,(1,1,1)),(start+1,(TINY,)*3),(end,(TINY,)*3)]
        track(boot,name,start,end,'scale',boot_points)
        ready_points=hold((1,1,1) if name in {'Ready','Idle','ButtonPress'} else (TINY,)*3)
        if name=='Ready':ready_points=[(start,(TINY,)*3),(start+1,(1,1,1)),(end,(1,1,1))]
        track(ready,name,start,end,'scale',ready_points)
        fill=[(start,(.01,1,1)),(start+12,(.18,1,1)),(start+28,(.43,1,1)),(end,(1,1,1))] if name=='BootUp' else hold((1,1,1))
        track(progress,name,start,end,'scale',fill)
        press=hold(location)
        if name=='ButtonPress':
            pushed=(location[0],location[1],location[2]-.0012)
            press=[(start,location),(start+5,location),(start+8,pushed),(start+13,pushed),(start+18,location),(end,location)]
        track(button,name,start,end,'location',press)
        breathing=hold((1,1,1))
        if name=='Idle':breathing=[(start+i*7,(1+.014*math.sin(i*math.pi/3),1+.014*math.sin(i*math.pi/3),1)) for i in range(7)]
        if name=='ButtonPress':breathing=[(start,(1,1,1)),(start+8,(1.035,1.035,1)),(start+18,(1,1,1)),(end,(1,1,1))]
        track(dial,name,start,end,'scale',breathing)
    scene=bpy.context.scene;scene.render.fps=24;scene.frame_start=1;scene.frame_end=222
    for name,start,end in CLIPS:scene.timeline_markers.new(name,frame=start)
    scene.frame_set(156)
