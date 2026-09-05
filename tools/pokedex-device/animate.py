"""Actual hinge and control clips; portable core-TRS power signals drive look-dev."""
import bpy,math,json
from pathlib import Path
from geometry import pivot

OUT=Path('/mnt/zer0models/pokemon-iac/devices/pokedex/v001')
CLIPS=[('Closed',1,16),('Opening',16,76),('BootUp',76,151),('Ready',151,181),('Idle',181,271),('ButtonPress',271,295)]
TINY=1e-5

def ancestors(obj):
    obj=obj.parent
    while obj:
        yield obj
        obj=obj.parent

def keys(obj,clip,path,points,interpolation='BEZIER'):
    name,start,end=clip
    obj.animation_data_create()
    existing=next((t for t in obj.animation_data.nla_tracks if t.name==name),None)
    action=existing.strips[0].action if existing else bpy.data.actions.new(name+'__'+obj.name)
    obj.animation_data.action=action
    if existing:obj.animation_data.action_slot=existing.strips[0].action_slot
    for frame,value in points:
        setattr(obj,path,value);obj.keyframe_insert(data_path=path,frame=frame,group=obj.name)
    slot=obj.animation_data.action_slot
    for layer in action.layers:
        for strip in layer.strips:
            bag=strip.channelbag(slot)
            for curve in bag.fcurves:
                for point in curve.keyframe_points:
                    point.interpolation=interpolation;point.handle_left_type='AUTO_CLAMPED';point.handle_right_type='AUTO_CLAMPED'
    obj.animation_data.action=None
    if not existing:
        track=obj.animation_data.nla_tracks.new();track.name=name
        strip=track.strips.new(name,start,action);strip.action_slot=slot;strip.action_frame_start=start;strip.action_frame_end=end
        strip.frame_start=start;strip.frame_end=end;strip.extrapolation='NOTHING';strip.blend_type='REPLACE'
    return action

def hold(start,end,value):return [(start,value),(end,value)]

def drive(socket,index,signal,maximum):
    curve=socket.driver_add('default_value',index) if index is not None else socket.driver_add('default_value')
    driver=curve.driver;driver.type='SCRIPTED';var=driver.variables.new();var.name='power';var.type='TRANSFORMS'
    var.targets[0].id=signal;var.targets[0].transform_type='LOC_X';var.targets[0].transform_space='LOCAL_SPACE'
    driver.expression=f'{maximum!r}*max(0,min(1,power))'

def build(scene):
    objects=scene.objects;lid=objects['PDX.LidHinge'];base=objects['PDX.Base'];root=objects['PDX.Root']
    for obj in list(objects):
        if obj.name.startswith(('SIG_','PDX.Signals')):bpy.data.objects.remove(obj,do_unlink=True)
        elif obj.name.startswith(('PDX.','GEO-PDX')):obj.animation_data_clear()
    for action in list(bpy.data.actions):
        if '__PDX.' in action.name or '__SIG_' in action.name or '__GEO-PDX.' in action.name:bpy.data.actions.remove(action)
    collection=next(c for c in scene.collection.children if c.name.startswith('PDX.Controls'))
    signals_root=pivot('PDX.Signals',(0,0,0),root,collection)
    signals={name:pivot('SIG_'+name,(0,0,0),signals_root,collection) for name in ['ScreenPower','RingPower','GreenPower','AmberPower','BootProgress','ReadyContent']}
    for obj in signals.values():obj['semantic']='Normalized core-TRS signal in local translation.x; not a physical position.'
    # New dedicated copies separate display, ring and status power even when source colors match.
    driven={}
    for obj in objects:
        if obj.type not in {'MESH','FONT'}:continue
        for index,mat in enumerate(list(obj.data.materials)):
            if not mat or not mat.name.startswith('MAT-PDX'):continue
            source=mat.get('power_source_name',mat.name)
            is_display=any(p==objects['PDX.DisplayBoot'] or p==objects['PDX.DisplayReady'] for p in ancestors(obj)) or obj.name=='GEO-PDX.display-surface'
            channel=('ScreenPower' if is_display else 'RingPower' if 'cyan-lightpipe' in source else 'GreenPower' if 'green-status' in source else 'AmberPower' if 'amber-status' in source else None)
            if channel is None:continue
            token=(source,channel)
            if token not in driven:
                copy=mat.copy();copy.name='MAT-PDX-power-'+channel+'-'+source.removeprefix('MAT-PDX-').split('.')[0];copy['power_source_name']=source;copy['power_signal']='SIG_'+channel
                copy.node_tree.animation_data_clear();p=copy.node_tree.nodes['Principled BSDF'];strength=mat.get('max_emission',p.inputs['Emission Strength'].default_value)
                copy['max_emission']=strength;drive(p.inputs['Emission Strength'],None,signals[channel],strength)
                driven[token]=copy
            obj.data.materials[index]=driven[token]
    button=objects['PDX.Button.A'];spring=objects['GEO-PDX.button-return.A'];dial=objects['PDX.ControlDial']
    progress=objects['PDX.BootProgress'];boot=objects['PDX.DisplayBoot'];ready=objects['PDX.DisplayReady']
    scan=next(o for o in boot.children if o.name.startswith('GEO-PDX.original-scan-glyph'))
    for clip in CLIPS:
        name,start,end=clip
        hinge=([(16,0),(22,-2),(31,-18),(43,-65),(55,-99),(64,-111),(69,-112.65),(76,-112)] if name=='Opening' else hold(start,end,0 if name=='Closed' else -112))
        keys(lid,clip,'rotation_euler',[(f,(math.radians(v),0,0)) for f,v in hinge])
        button_points=[(271,0),(276,0),(279,.00055),(283,.00055),(288,0),(295,0)] if name=='ButtonPress' else hold(start,end,0)
        keys(button,clip,'location',[(f,(.041,-.126,.0187-travel)) for f,travel in button_points])
        keys(spring,clip,'location',[(f,(.041,-.126,.0113-travel/2)) for f,travel in button_points])
        keys(spring,clip,'scale',[(f,(1,1,1-travel/.0012)) for f,travel in button_points])
        keys(dial,clip,'rotation_euler',hold(start,end,(0,0,0)))
        signal_values={
            'ScreenPower':hold(start,end,0 if name in {'Closed','Opening'} else 1),
            'RingPower':hold(start,end,.10 if name=='Closed' else .22 if name=='Opening' else .9),
            'GreenPower':hold(start,end,.22 if name in {'Closed','Opening'} else .75),
            'AmberPower':hold(start,end,0),
            'BootProgress':hold(start,end,0 if name in {'Closed','Opening'} else 1),
            'ReadyContent':hold(start,end,0 if name in {'Closed','Opening','BootUp'} else 1),
        }
        if name=='Opening':signal_values['RingPower']=[(16,.1),(56,.1),(76,.22)]
        if name=='BootUp':
            signal_values.update(ScreenPower=[(76,0),(80,0),(92,.45),(106,1),(151,1)],RingPower=[(76,.22),(87,.3),(100,1),(125,1),(151,.9)],GreenPower=[(76,.22),(90,0),(135,0),(149,.75),(151,.75)],AmberPower=[(76,0),(88,.75),(103,.16),(118,.75),(133,.16),(145,0),(151,0)],BootProgress=[(76,0),(87,0),(95,.12),(105,.38),(119,.52),(130,.8),(142,1),(151,1)],ReadyContent=[(76,0),(146,0),(147,1),(151,1)])
        if name=='Idle':signal_values['RingPower']=[(181+i*15,.83+.07*math.cos(i*math.pi/3)) for i in range(7)]
        if name=='ButtonPress':signal_values['RingPower']=[(271,.9),(277,.9),(281,1),(287,.9),(295,.9)]
        for signal,points in signal_values.items():keys(signals[signal],clip,'location',[(f,(v,0,0)) for f,v in points], 'CONSTANT' if signal=='ReadyContent' else 'BEZIER')
        ready_points=[(76,TINY),(146,TINY),(147,1),(151,1)] if name=='BootUp' else hold(start,end,TINY if name in {'Closed','Opening'} else 1)
        boot_points=[(76,1),(146,1),(147,TINY),(151,TINY)] if name=='BootUp' else hold(start,end,TINY)
        keys(ready,clip,'scale',[(f,(v,v,v)) for f,v in ready_points],'CONSTANT')
        keys(boot,clip,'scale',[(f,(v,v,v)) for f,v in boot_points],'CONSTANT')
        keys(progress,clip,'scale',[(f,(max(TINY,v),1,1)) for f,v in signal_values['BootProgress']])
        keys(scan,clip,'rotation_euler',[(76,(0,0,0)),(105,(0,0,.7)),(141,(0,0,math.pi/3)),(151,(0,0,math.pi/3))] if name=='BootUp' else hold(start,end,(0,0,0)))
    scene.frame_start=1;scene.frame_end=294;scene.render.fps=30
    for marker in list(scene.timeline_markers):scene.timeline_markers.remove(marker)
    for name,start,end in CLIPS:scene.timeline_markers.new(name,frame=start)
    scene.frame_set(165);bpy.context.view_layer.update()
    contract={'fps':30,'clips':[{'name':name,'startFrame':start,'terminalFrame':end,'durationSeconds':(end-start)/30} for name,start,end in CLIPS],'hinge':{'node':lid.name,'axis':'X','pivotMeters':list(lid.location),'readyDegrees':-112,'maximumOpeningDegrees':112.65},'signals':{o.name:'local translation.x normalized 0..1' for o in signals.values()},'materialBindings':[{'material':mat.name,'signal':mat['power_signal'],'maximumEmission':mat['max_emission']} for mat in driven.values()],'runtimeOrder':'AnimationMixer.update(dt), then apply power signals to emissiveIntensity. Core scale tracks implement display group/progress transitions.','portableExportFlags':{'export_pointer_animation':False,'export_convert_animation_pointer':False},'buttonTravelMeters':.00055,'notes':['Each clip includes its own held terminal sample. Adjacent timeline boundary poses agree.','Button return diaphragm compresses with the cap travel.','Full-world volumetric collision certification is outside this graphical prop validation.']}
    (OUT/'source/animation-contract.json').write_text(json.dumps(contract,indent=2))
    bpy.data.libraries.write(str(OUT/'source/pokedex-v001-m2-animation-r02.blend'),{scene},fake_user=True)
    print(json.dumps(contract))

if __name__=='__main__':build(bpy.context.scene)
