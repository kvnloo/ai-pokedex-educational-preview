"""Real mechanical opening and controls; portable power channels for runtime emission."""
import bpy
import json
import math
from pathlib import Path
from motion_curves import keys,hold,drive

CLIPS=[('Closed',1,16),('Opening',16,76),('BootUp',76,151),('Ready',151,181),('Idle',181,271),('ButtonPress',271,295)]
TINY=1e-5

def author(scene,output):
    bpy.context.window.scene=scene;output=Path(output);prefix=scene['candidateId']
    if (output/(prefix+'-hero.blend')).exists():raise FileExistsError('Version the hero before replacing it')
    n={o.get('source_name'):o for o in scene.objects if o.get('source_name')}
    root,lid,button,boot,ready,progress=[n[k] for k in ['PDX.Root','PDX.LidHinge','PDX.ButtonPress','PDX.DisplayBoot','PDX.DisplayReady','PDX.BootProgress']]
    angle=json.loads(scene['contract'])['angle'];button_rest=tuple(button.location)
    spring=n['GEO-button-A-return'];spring_rest=tuple(spring.location)
    def empty(name,parent):
        o=bpy.data.objects.new(prefix+'/'+name,None);scene.collection.objects.link(o);o.parent=parent;o['source_name']=name;return o
    signal_root=empty('PDX.Signals',root)
    signals={key:empty('SIG_'+key,signal_root) for key in ['ScreenPower','RingPower','GreenPower','AmberPower','RedPower','BootProgress','ReadyContent']}
    for signal in signals.values():signal['semantic']='Normalized core-TRS control in local translation.x, not a physical location.'
    materials={m for o in scene.objects if o.type in {'MESH','CURVE','FONT'} for m in o.data.materials if m}
    bindings=[]
    for mat in materials:
        name=mat.name
        channel=('ScreenPower' if name.endswith(('MAT-display','MAT-display-type')) else 'RingPower' if 'cyan-lightpipe' in name else 'GreenPower' if 'green-status' in name else 'AmberPower' if name.endswith('MAT-amber') else 'RedPower' if 'red-status' in name else None)
        if not channel:continue
        p=mat.node_tree.nodes['Principled BSDF'];maximum=p.inputs['Emission Strength'].default_value
        if channel=='AmberPower':maximum=2
        drive(p.inputs['Emission Strength'],None,signals[channel],maximum)
        mat['power_signal']=signals[channel].name;mat['max_emission']=maximum
        bindings.append({'material':mat.name,'signal':signals[channel].name,'maximumEmission':maximum})
    for clip in CLIPS:
        name,start,end=clip
        theta=([(16,0),(22,-2),(32,-angle*.15),(44,-angle*.54),(58,-angle*.91),(68,-angle-.4),(76,-angle)] if name=='Opening' else hold(start,end,0 if name=='Closed' else -angle))
        keys(lid,clip,'rotation_euler',[(f,(math.radians(a),0,0)) for f,a in theta])
        travel=[(271,0),(276,0),(279,.00055),(283,.00055),(288,0),(295,0)] if name=='ButtonPress' else hold(start,end,0)
        keys(button,clip,'location',[(f,(*button_rest[:2],button_rest[2]-v)) for f,v in travel])
        keys(spring,clip,'location',[(f,(*spring_rest[:2],spring_rest[2]-v/2)) for f,v in travel])
        keys(spring,clip,'scale',[(f,(1,1,1-v/.0011)) for f,v in travel])
        values={
          'ScreenPower':hold(start,end,0 if name in {'Closed','Opening'} else 1),
          'RingPower':hold(start,end,.12 if name=='Closed' else .25 if name=='Opening' else .9),
          'GreenPower':hold(start,end,.25 if name in {'Closed','Opening'} else .8),
          'AmberPower':hold(start,end,0),'RedPower':hold(start,end,.10 if name in {'Closed','Opening'} else .4),
          'BootProgress':hold(start,end,0 if name in {'Closed','Opening'} else 1),
          'ReadyContent':hold(start,end,0 if name in {'Closed','Opening','BootUp'} else 1)}
        if name=='BootUp':values.update(ScreenPower=[(76,0),(83,0),(100,.6),(112,1),(151,1)],RingPower=[(76,.25),(86,.25),(103,1),(125,1),(151,.9)],GreenPower=[(76,.25),(92,0),(141,0),(149,.8),(151,.8)],AmberPower=[(76,0),(92,.8),(105,.12),(119,.8),(132,.12),(144,0),(151,0)],BootProgress=[(76,0),(86,0),(98,.2),(111,.42),(121,.58),(132,.88),(143,1),(151,1)],ReadyContent=[(76,0),(146,0),(147,1),(151,1)])
        if name=='Idle':values['RingPower']=[(181+i*15,.83+.07*math.cos(i*math.pi/3)) for i in range(7)]
        if name=='ButtonPress':values['RingPower']=[(271,.9),(277,.9),(281,1),(288,.9),(295,.9)]
        for key,points in values.items():keys(signals[key],clip,'location',[(f,(v,0,0)) for f,v in points],'CONSTANT' if key=='ReadyContent' else 'BEZIER')
        rp=[(76,TINY),(146,TINY),(147,1),(151,1)] if name=='BootUp' else hold(start,end,TINY if name in {'Closed','Opening'} else 1)
        bp=[(76,1),(146,1),(147,TINY),(151,TINY)] if name=='BootUp' else hold(start,end,TINY)
        keys(ready,clip,'scale',[(f,(v,v,v)) for f,v in rp],'CONSTANT');keys(boot,clip,'scale',[(f,(v,v,v)) for f,v in bp],'CONSTANT')
        keys(progress,clip,'scale',[(f,(max(TINY,v),1,1)) for f,v in values['BootProgress']])
    scene.frame_start=1;scene.frame_end=294;scene.render.fps=30
    for name,start,end in CLIPS:scene.timeline_markers.new(name,frame=start)
    scene.frame_set(165);bpy.context.view_layer.update();scene['stage']='animated-review-candidate'
    contract={'candidate':prefix,'fps':30,'clips':[{'name':name,'startFrame':start,'terminalFrame':end,'durationSeconds':(end-start)/30} for name,start,end in CLIPS],
        'hinge':{'node':lid.name,'axis':'X','pivotMeters':list(lid.location),'readyDegrees':-angle,'maximumOpeningDegrees':angle+.4},
        'button':{'node':button.name,'travelMeters':.00055,'returnNode':spring.name},'signals':{o.name:'local translation.x normalized 0..1' for o in signals.values()},
        'materialBindings':bindings,'display':{'surfaceNode':n['GEO-display-glass'].name,'placeholderGroups':[boot.name,ready.name]},
        'runtimeOrder':'AnimationMixer.update(dt), then set material emissiveIntensity from each power signal. No physical ring scaling.',
        'states':['Closed -> Opening -> BootUp -> Ready -> Idle','Ready/Idle -> ButtonPress -> Idle'],
        'clipPolicy':'Each clip includes held values for mechanical state and power. Export NLA tracks with held-object retention; validate Closed explicitly.'}
    (output/'animation-contract.json').write_text(json.dumps(contract,indent=2)+'\n')
    bpy.data.libraries.write(str(output/(prefix+'-hero.blend')),{scene},fake_user=True,compress=True)
    print(json.dumps({'candidate':prefix,'hero':str(output/(prefix+'-hero.blend')),'clips':[c[0] for c in CLIPS],'materialBindings':len(bindings)}))
    return contract
