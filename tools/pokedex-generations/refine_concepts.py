"""Reconstruct mechanics around each board's own retained camera/layout contract."""
import bpy
import math
import generation_geometry as g

def refine(variant, c, objects):
    b1 = variant == 'board01'; w = c['width']; length = c['length']
    base, lid = objects['base'], objects['lid']; n = g.objects_by_name
    lid.location.z=.013
    red = n['GEO-base-shell'].data.materials[0]
    black = n['GEO-base-gasket'].data.materials[0]
    graphite = g.material('inner-support', (.013,.019,.024), .4)
    metal = g.material('hinge-steel', (.11,.14,.17), .24, 1)
    rubber = g.material('button-return', (.008,.011,.014), .55)

    # The outer dimensions remain the measured board silhouettes. Hollow the slabs.
    shell = n['GEO-base-shell']; deck = n['GEO-control-deck']; gasket = n['GEO-base-gasket']
    for obj in [shell, gasket]:
        g.subtract(obj, g.rounded('CUT-base-cavity', w-.0036, length-.0036, .018, .0092, (0,0,.0058), None, base, 0))
    rear = length/2-.004
    lid_shell = n['GEO-lid-shell']
    g.subtract(lid_shell, g.rounded('CUT-lid-cavity', w-.0036, length-.010, .008, .010, (0,-length/2+.001,.000), None, lid, 0))
    if not b1:
        g.rounded('lid-interior', w-.002, length-.003, .001, .011,
                  (0,-length/2+.004,-.0009), red, lid, .00025)

    # Open the interior panel for the display module instead of stacking it over a solid lid.
    op = c['layout']['open']; sx = [op[k][0] for k in ['screen_tl','screen_tr','screen_br','screen_bl']]; sy = [op[k][1] for k in ['screen_tl','screen_tr','screen_br','screen_bl']]
    xmin=(sx[0]+sx[3])/2; xmax=(sx[1]+sx[2])/2
    yt=(sy[0]+sy[1])/2+.004; yb=(sy[2]+sy[3])/2+.004
    sw=xmax-xmin; sl=yb-yt; cx=(xmin+xmax)/2; cy=(yt+yb)/2
    panels = [lid_shell,n['GEO-lid-interior']] + ([n['GEO-lid-black-rim']] if b1 else [])
    for panel in panels:
        g.subtract(panel, g.rounded('CUT-screen-window', sw+.001, sl+.001, .005, .005, (cx,cy,-.0018), None, lid, 0))
    for name in ['GEO-display-gasket','GEO-display-metal-rim']:
        obj=n[name]
        g.subtract(obj,g.rounded('CUT-display-ring',sw-.0002,sl-.0002,.010,.0045,(cx,cy,-.0015),None,lid,0))
    screen=n['GEO-display-glass']; screen['replaceable_display']=True
    screen['geometry_role']='display-surface'
    g.rounded('display-module-backing',sw,sl,.003,.0048,(cx,cy,-.00085),graphite,lid,.0001)

    # True header apertures and an internal baffle. Optical dimensions are independently reviewed.
    for i in range(5):
        slot=n['GEO-speaker-slot-'+str(i)]
        points=[slot.matrix_local @ v.co for v in slot.data.vertices]
        x=sum(p.x for p in points)/len(points); y=sum(p.y for p in points)/len(points)
        g.remove(slot)
        for panel in panels:
            g.subtract(panel,g.rounded('CUT-speaker',.0019,.0010,.006,.00035,(x,y,0),None,lid,0))
    x,y=op['camera']; y+=.004
    g.rounded('speaker-baffle',.016,.004,.0008,.001,(x+.019,y-.002,.0024),black,lid,.0001)
    for name in ['GEO-camera-surround','GEO-camera-lens','GEO-camera-optics']:g.remove(n[name])
    cr=1.17 if b1 else 1
    for panel in panels:g.subtract(panel,g.cylinder('CUT-camera',.0068*cr,.006,(x,y,0),None,lid,bevel=0))
    g.tube('camera-bezel',.0066*cr,.00555*cr,.0014,(x,y,-.0019),metal,lid,bevel=.00012)
    g.cylinder('camera-inner',.00545*cr,.0010,(x,y,-.0014),black,lid,bevel=.0001)
    g.tube('camera-retainer',.0052*cr,.00475*cr,.0003,(x,y,-.0024),metal,lid,bevel=.00004)
    g.cylinder('camera-optics',.0046*cr,.00045,(x,y,-.00255),g.material('coated-optics',(.005,.013,.020),.035,.25,coat=.65),lid,bevel=.00005)
    g.cylinder('camera-carrier',.0065*cr,.0028,(x,y,.0006),graphite,lid,bevel=.0001)

    # Keep the board's transverse hinge silhouette, with distinct moving/fixed knuckles and a pin.
    for obj in list(bpy.context.scene.objects):
        logical=obj.get('source_name','')
        if logical.startswith(('GEO-transverse-hinge','GEO-hinge-collar')):g.remove(obj)
    hy=rear; hz=.013
    for panel in panels:
        g.subtract(panel,g.cylinder('CUT-hinge-sweep',.00510,w+.020,(0,0,0),None,lid,'X',0))
    # Arc joins prevent the inner bevel from pinching into zero-area wedges at the pocket corners.
    for mod in lid_shell.modifiers:
        if mod.type=='BEVEL':
            mod.miter_inner='MITER_ARC'
            mod.width=.00065
            mod.spread=.0002
    if b1:
        g.remove(n['GEO-top-bezel-notch'])
        outline=[(-.012,-length+.005),(.012,-length+.005),(.008,-length+.013),(-.008,-length+.013)]
        g.subtract(n['GEO-lid-interior'],g.polygon('CUT-notch-insert',outline,-.001,.004,None,lid,0))
        g.polygon('top-bezel-notch',outline,-.00065,.001,graphite,lid,.00012)
    for side in [-1,1]:
        x=side*w*.36
        sleeve=g.cylinder('hinge-fixed-'+str(side),.0048,w*.255,(x,hy,hz),black,base,'X',.0002)
        profile=[(hy-.011,.0045),(hy-.011,.0065),(hy-.0034,.0097),(hy-.0024,.0097),(hy-.0024,.0045)]
        bracket=g.section_x('hinge-base-mount-'+str(side),profile,x,w*.20,graphite,base,.0002)
        g.union(sleeve,bracket)
        g.subtract(sleeve,g.cylinder('CUT-fixed-bearing',.00225,w*.26,(x,hy,hz),None,base,'X',0))
    center=g.cylinder('hinge-moving',.0048,w*.445,(0,0,0),black,lid,'X',.0002)
    bracket=g.rounded('hinge-lid-mount',w*.36,.010,.003,.001,(0,-.006,.0020),graphite,lid,.00015)
    g.union(center,bracket)
    g.subtract(center,g.cylinder('CUT-moving-bearing',.00225,w*.46,(0,0,0),None,lid,'X',0))
    for name in ['GEO-hinge-moving','GEO-hinge-fixed--1','GEO-hinge-fixed-1']:
        for mod in n[name].modifiers:
            if mod.type=='BEVEL':mod.miter_inner='MITER_ARC';mod.spread=.0001
    g.cylinder('hinge-pin',.00205,w*.998,(0,hy,hz),metal,base,'X',.0001)
    for side in [-1,1]:
        g.cylinder('hinge-pin-retainer-'+str(side),.0027,.0007,(side*w*.505,hy,hz),metal,base,'X',.0001)
    lid['hinge_radial_clearance_m']=.0002; lid['hinge_axial_clearance_m']=w*(.36-.255/2-.445/2)

    # The side spine is a protective rail, not a second incompatible hinge.
    for obj in list(bpy.context.scene.objects):
        if obj.get('source_name','').startswith('GEO-spine-'):
            obj['mechanical_role']='segmented protective side rail'
            if obj.parent==lid:
                g.subtract(obj,g.rounded('CUT-spine-hinge-clearance',.02,.030,.040,.001,(-w/2,.008,.001),None,lid,0))
    for parent,cy0,z in [(base,0,0),(lid,-length/2+.004,.003)]:
        g.rounded('spine-attachment',.003,length*.77,.003,.0005,(-w/2+.0002,cy0,z),red,parent,.0002)

    # Machine the control holes and retain real fixed guides and separate moving caps.
    button=objects['button']; bx,by,_=button.location
    for name in ['GEO-button-A-seat']:
        if b1 and name in n:g.remove(n[name])
    button_r=.0084 if b1 else .0053
    g.subtract(deck,g.cylinder('CUT-button-A',button_r+.00022,.010,(bx,by,.0045),None,base,bevel=0))
    g.tube('button-A-guide',button_r+.00015,button_r-.0011,.0036,(bx,by,.0037),graphite,base,bevel=.0001)
    g.cylinder('button-A-stem',button_r-.0014,.0036,(0,0,-.0017),rubber,button,bevel=.0001)
    g.cylinder('button-A-return',button_r-.0012,.0011,(bx,by,.0020),rubber,base,bevel=.00008)
    objects['buttonReturn']=n['GEO-button-A-return']
    if not b1:
        for i in range(1,4):
            cap=n['GEO-diamond-key-'+str(i)]; inset=n['GEO-diamond-inset-'+str(i)]
            pos=cap.location.copy(); pivot=g.empty('PDX.FaceKey.'+str(i),base,pos)
            for obj in [cap,inset]:obj.parent=pivot;obj.location-=pos
            g.subtract(deck,g.cylinder('CUT-other-key',.0055,.010,(pos.x,pos.y,.0045),None,base,bevel=0))
            g.tube('key-guide-'+str(i),.00545,.0041,.0036,(pos.x,pos.y,.0037),graphite,base,bevel=.0001)
            g.cylinder('key-stem-'+str(i),.004,.0036,(0,0,-.0017),rubber,pivot,bevel=.0001)
            g.cylinder('key-return-'+str(i),.0041,.0011,(pos.x,pos.y,.0020),rubber,base,bevel=.00008)
    dpad=n['GEO-dpad']; dx,dy=op['dpad']
    outline=[(v.co.x,v.co.y) for v in dpad.data.vertices[:len(dpad.data.vertices)//2]]
    g.subtract(deck,g.polygon('CUT-dpad',[(dx+(x-dx)*1.045,dy+(y-dy)*1.045) for x,y in outline],.005,.012,None,base,0))
    dpivot=g.empty('PDX.DPad',base,(dx,dy,0));dpad.parent=dpivot
    for v in dpad.data.vertices:v.co.x-=dx;v.co.y-=dy
    g.cylinder('dpad-stem',.0034,.006,(0,0,.004),rubber,dpivot,bevel=.00015)
    g.tube('dpad-guide',.0052,.0036,.005,(dx,dy,.0016),graphite,base,bevel=.0001)
    g.cylinder('dpad-return',.0036,.0008,(dx,dy,-.0013),rubber,base,bevel=.00008)

    # Seat the oval control module through the deck; the lightpipe stays rigid during idle.
    rx,ry=op['ring'];rad=.024 if b1 else .025;stretch=1.4 if b1 else 1.3
    cutter=g.cylinder('CUT-dial',rad+.00025,.012,(rx,ry,.005),None,base,bevel=0)
    for v in cutter.data.vertices:v.co.y*=stretch
    g.subtract(deck,cutter)
    guide=g.tube('dial-guide',rad+.00015,rad-.0012,.004,(rx,ry,.004),graphite,base,bevel=.0001)
    for v in guide.data.vertices:v.co.y*=stretch
    g.cylinder('dial-module-stem',.008,.007,(rx,ry,.0025),graphite,base,bevel=.00012)
    objects['dial']['mechanical_role']='rigid lightpipe; animate emission only'

    # Underside service panel and a genuine front port, subordinate to board identity.
    g.subtract(shell,g.rounded('CUT-service',w*.61,length*.60,.008,.003,(0,-.005,-.006),None,base,0))
    g.rounded('service-panel',w*.61-.00045,length*.60-.00045,.0015,.0028,(0,-.005,-.0041),graphite,base,.0002)
    for x in [-w*.30,w*.30]:
        for y in [-length*.34,length*.26]:
            g.cylinder('service-screw',.0011,.0004,(x,y,-.005),metal,base,bevel=.00006)
    port=g.rounded('CUT-port',.008,.0028,.015,.001,(0,0,0),None,base,0)
    port.rotation_euler.x=math.pi/2;port.location=(0,-length/2,-.0005);g.subtract(shell,port)
    port=g.rounded('port-cartridge',.0076,.0024,.003,.0008,(0,0,0),black,base,.00008)
    port.rotation_euler.x=math.pi/2;port.location=(0,-length/2+.0016,-.0005)
    for side in [-1,1]:
        for y in [-length*.36,length*.32]:
            g.rounded('underside-foot',.007,.012,.0011,.002,(side*w*.35,y,-.00535),rubber,base,.0002)
    g.outer_bevel(lid_shell,w,length,.012,-length/2,[0,.006],.00085)
    g.outer_bevel(shell,w,length,.011,0,[-.005,.005],.0009)
    return objects
