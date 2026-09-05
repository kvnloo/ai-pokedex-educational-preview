"""Two explicit material/panel/control identities, sharing only construction primitives."""
import math
from generation_geometry import *

def build(variant,c):
    b1=variant=='board01';w=c['width'];length=c['length'];layout=c['layout']
    red=material('scarlet-'+variant,(.43,.014,.009) if b1 else (.55,.022,.012),.32 if b1 else .24,coat=.25 if b1 else .65)
    black=material('obsidian',(.003,.005,.007),.40)
    graphite=material('graphite',(.010,.014,.019),.48)
    silver=material('satin-aluminum',(.55,.59,.62),.29,1)
    ink=material('panel-cut',(.10,.013,.010),.48)
    rubber=material('elastomer',(.008,.009,.011),.56)
    cyan=material('cyan-lightpipe',(.055,.65,.8),.24,emission=6)
    green=material('green-status',(.025,.8,.11),.24,emission=3)
    amber=material('amber',(.95,.51,.06),.3,emission=.2)
    screenmat=material('display',(.003,.032,.035),.25,emission=.2)
    textmat=material('display-type',(.16,.77,.71),.36,emission=.6)
    root=empty('PDX.Root');root['variant']=variant;root['units']='meters'
    base=empty('PDX.Base',root);lid=empty('PDX.LidHinge',root,(0,length/2,.011));lid['axis']='local X';lid['closedDegrees']=0;lid['openDegrees']=c['angle']
    rounded('base-shell',w,length,.010,.011,(0,0,0),red,base,.0011)
    rounded('base-gasket',w-.001,length-.001,.001,.0105,(0,0,.005),black,base,.0002)
    rounded('control-deck',w-.005,length-.008,.001,.009,(0,-.001,.0057),graphite if b1 else red,base,.0004)
    rounded('lid-shell',w,length,.006,.012,(0,-length/2,.003),red,lid,.0010)
    if b1:
        rounded('lid-black-rim',w-.001,length-.001,.0007,.011,(0,-length/2,-.00035),silver,lid,.00015)
        rounded('lid-interior',w-.002,length-.003,.001,.011,(0,-length/2,-.0009),black,lid,.00035)
    # Cylindrical spine, uninterrupted core with three sleeves; two distinct runs articulate at the transverse pivot.
    for parent,y,z in [(base,0,.0015),(lid,-length/2,.001)]:
        spine_r=(.0055 if b1 else .006) if parent==base else .0023
        spine_x=-w/2-(.004 if b1 else .006) if parent==base else -w/2+.0004
        cylinder('spine-core-'+parent.name,spine_r,length-.006,(spine_x,y,z),silver,parent,'Y',.00045)
        for j,(offset,span) in enumerate([(-.43,.10),(0,.42),(.43,.10)]):
            cylinder('spine-sleeve-'+parent.name+str(j),spine_r+.0003,length*span,(spine_x,y+offset*length,z),red if not b1 else black,parent,'Y')
    cylinder('transverse-hinge',.0048,w+.001,(0,length/2-.004,.0105),black,base,'X',.0005)
    for x in [-w*.33,w*.33]:cylinder('hinge-collar',.005,w*.11,(x,length/2-.004,.0105),graphite,base,'X',.00025)
    closed=layout['closed'];cx,cy=closed['lock'];radius=.020 if b1 else .0198
    left=closed['seam_left'];right=closed['seam_right']
    if b1:
        polygon('radial-belt',[(left[0]-.001,left[1]+.002),(cx,cy),(left[0]-.001,left[1]-.041)],.00625,.00065,black,lid)
        a=closed['silver_top_left'];b=closed['silver_top_right'];d=closed['silver_bottom_left']
        polygon('upper-right-silver-wedge',[a,b,(right[0],d[1]),d,(cx+.007,cy+.016)],.0067,.001,silver,lid,.0004)
    line('equatorial-seam',([(cx,cy,.0068),(right[0],cy,.0068)] if b1 else [(left[0],cy,.0068),(cx,cy,.0068),(right[0],cy,.0068)]),black,lid,.0023 if not b1 else .0012)
    cylinder('lock-surround',radius,.0016,(cx,cy,.007),black,lid,bevel=.0006)
    if b1:
        cylinder('lock-inset',.0127,.001,(cx,cy,.008),graphite,lid)
        ring('closed-cyan-ring',.0109,.00075,(cx,cy,.0087),cyan,lid)
        cylinder('closed-lock-core',.010,.0006,(cx,cy,.0087),silver,lid)
    else:
        for upper,mat in [(True,red),(False,silver)]:
            start=0 if upper else math.pi
            pts=[(cx+.014*math.cos(start+i*math.pi/40),cy+.014*math.sin(start+i*math.pi/40)) for i in range(41)]
            polygon('pokeball-'+('red' if upper else 'silver'),pts,.0084,.001,mat,lid,.0002)
        line('pokeball-divider',[(cx-.014,cy,.009),(cx+.014,cy,.009)],black,lid,.0008)
        cylinder('lock-center-seat',.007,.001,(cx,cy,.009),black,lid)
        cylinder('lock-center-cyan',.0055,.0006,(cx,cy,.0097),cyan,lid)
    for i,pts in enumerate(closed['panel_lines']):
        if b1 and i==4:continue
        line('exterior-engraving-'+str(i),[(x,y,.0061) for x,y in pts],ink,lid,.00018)
    label('exterior-wordmark','POKÉDEX',(w*.16,-length*.84,.0069),.005,black if b1 else silver,lid)
    if b1:
        label('edition','001 - 1025',(w*.20,-length*.91,.0069),.0023,black,lid)
        polygon('gold-chevron',[(-.032,-length*.84),(-.024,-length*.87),(-.032,-length*.90)],.0066,.0007,amber,lid)
        rounded('outer-status',.007,.0015,.0007,.0006,(-.031,-length*.13,.0068),green,lid)
    op=layout['open'];sx=[op[k][0] for k in ['screen_tl','screen_tr','screen_br','screen_bl']];sy=[op[k][1] for k in ['screen_tl','screen_tr','screen_br','screen_bl']]
    # Mean corresponding edges make one rectangular screen, never a camera-specific skewed plane.
    xmin=(sx[0]+sx[3])/2;xmax=(sx[1]+sx[2])/2;ytop=(sy[0]+sy[1])/2;ybottom=(sy[2]+sy[3])/2
    sw=xmax-xmin;sl=ybottom-ytop;scx=(xmin+xmax)/2;scy=(ytop+ybottom)/2
    rounded('display-gasket',sw+.008,sl+.010,.0015,.009,(scx,scy,-.0015),black,lid,.0005)
    rounded('display-metal-rim',sw+.003,sl+.004,.0004,.006,(scx,scy,-.0024),graphite,lid,.0002)
    rounded('display-glass',sw,sl,.0005,.0048,(scx,scy,-.0028),screenmat,lid,.00015)
    # Camera lives at the traced offset, with upper sensor and asymmetric speaker.
    x,y=op['camera']
    cylinder('camera-surround',.0075,.002,(x,y,-.002),silver if b1 else black,lid)
    cylinder('camera-lens',.0062,.002,(x,y,-.003),black,lid)
    cylinder('camera-optics',.0039,.0006,(x,y,-.0042),material('lens',(.009,.022,.029),.12,coat=.9),lid)
    sensorx=x+.013 if b1 else x-.017
    cylinder('sensor',.0028,.0007,(sensorx,y,-.0019),graphite if b1 else amber,lid)
    for i in range(5):
        rounded('speaker-slot-'+str(i),.002,.0013,.00045,.0005,(x+.014+i*.0023,y-.002,-.0017),black if not b1 else graphite,lid,.0001)
    if b1:
        polygon('top-bezel-notch',[(-.012,-length+.001),(.012,-length+.001),(.008,-length+.009),(-.008,-length+.009)],-.0016,.0005,graphite,lid)
    # Boot and ready content are modeled vectors; no reference image pasted on the screen.
    boot=empty('PDX.DisplayBoot',lid,(scx,scy,-.00325));ready=empty('PDX.DisplayReady',lid,(scx,scy,-.0033))
    label('boot-title','POKÉDEX',(0,.015 if b1 else .007,0),.006,textmat,boot,True)
    label('boot-status','INITIALIZING...',(0,.036 if b1 else .018,0),.0032,textmat,boot,True)
    glyph=[(-.010,-.008),(-.014,-.019),(-.012,-.019),(-.006,-.016),(-.003,-.010),(.003,-.010),(.008,-.017),(.014,-.020),(.012,-.012),(.008,-.006),(.010,-.002),(.009,.005),(.008,.008),(.009,.012),(.006,.014),(-.008,.014),(-.010,.011),(-.009,.007),(-.010,.004),(-.011,0)]
    polygon('scan-glyph',[(x*.85,y*.85-.016) for x,y in glyph],0,.0002,textmat,boot,.00035)
    for x in [-.004,.004]:cylinder('glyph-eye',.00065,.0002,(x,-.017,-.0002),screenmat,boot)
    progress=empty('PDX.BootProgress',boot,(-sw*.33,.026,-.0002))
    rounded('progress-track',sw*.68,.0015,.00015,.0006,(0,.026,.0001),graphite,boot,.00005)
    rounded('progress-fill',sw*.67,.0012,.0002,.0005,(sw*.335,0,0),textmat,progress,.00005)
    label('ready-title','POKÉDEX',(0,-sl*.35,0),.006,textmat,ready,True)
    label('ready-region','KANTO  /  0151',(0,-sl*.22,0),.0031,textmat,ready,True)
    for i,t in enumerate(['001  BULBASAUR','004  CHARMANDER','007  SQUIRTLE','025  PIKACHU']):
        label('entry-'+str(i),t,(0,-.005+i*.011,0),.0033,textmat,ready,True)
    label('ready-footer','READY TO EXPLORE',(0,sl*.41,0),.0025,textmat,ready,True)
    ready.scale=(.0001,)*3
    progress.scale.x=.38
    rx,ry=op['ring'];diskradius=.024 if b1 else .025
    cylinder('control-ring-seat',diskradius,.001,(rx,ry,.0066),black,base,bevel=.0005)
    cylinder('control-ring-inset',diskradius*.73,.0007,(rx,ry,.0071),graphite,base)
    dial=ring('deck-cyan-ring',diskradius*.66,.00072,(rx,ry,.00765),cyan,base)
    ring('deck-ring-inner-trim',diskradius*.60,.00022,(rx,ry,.0075),silver,base)
    dx,dy=op['dpad'];s=.010;arm=.0035
    cross=[(-arm,s),(arm,s),(arm,arm),(s,arm),(s,-arm),(arm,-arm),(arm,-s),(-arm,-s),(-arm,-arm),(-s,-arm),(-s,arm),(-arm,arm)]
    polygon('dpad',[(dx+x,dy+y) for x,y in reversed(cross)],.0076,.003,rubber,base,.00065)
    bx,by=op['button'];button=empty('PDX.ButtonPress',base,(bx,by,.0074))
    if b1:
        cylinder('button-A-seat',.0092,.001,(bx,by,.0063),black,base)
        cylinder('button-A',.0084,.002,(0,0,0),rubber,button,bevel=.0008)
        label('button-A-type','A',(0,-.0015,.0012),.005,silver,button)
    else:
        # The fourth key is intentionally retained even though only three resolve clearly in the boot crop.
        for i,(ox,oy) in enumerate([(0,0),(-.015,0),(-.0075,.014),(-.0075,-.014)]):
            par=button if i==0 else base;pos=(ox,oy,0) if i==0 else (bx+ox,by+oy,.0074)
            cylinder('diamond-key-'+str(i),.0053,.002,pos,black,par,bevel=.0007)
            cylinder('diamond-inset-'+str(i),.0038,.0005,(pos[0],pos[1],pos[2]+.0011),red,par)
        cylinder('deck-function',.0058,.0016,(w*.30,length*.39,.0068),red,base)
        cylinder('deck-sensor',.0028,.0008,(w*.16,length*.40,.0064),graphite,base)
        cylinder('green-deck-indicator',.0015,.0005,(dx-.004,dy+.025,.0068),green,base)
        rounded('amber-front-indicator',.009,.002,.001,.0008,(w*.32,-length*.43,.0062),amber,base)
    rounded('front-red-indicator',.005,.0015,.0007,.0006,(-.009,-length*.44,.0065),material('red-status',(1,.012,.006),emission=6),base)
    # The concept's dial is deeper along the deck than a projected circular track.
    # An oval molded recess preserves that footprint without camera-specific deformation.
    for name in ['GEO-control-ring-seat','GEO-control-ring-inset','GEO-deck-cyan-ring','GEO-deck-ring-inner-trim']:
        for vertex in objects_by_name[name].data.vertices:vertex.co.y*=1.40 if b1 else 1.30
    # Small recessed fasteners are asymmetric and subordinate to the large panels.
    for i,(x,y) in enumerate([(-w*.32,length*.39),(w*.33,length*.37)]):
        cylinder('deck-fastener-'+str(i),.0018,.0004,(x,y,.00635),graphite,base)
        line('fastener-slot-'+str(i),[(x-.0008,y,.0066),(x+.0008,y,.0066)],black,base,.00013)
    for child in list(lid.children):child.location.y+=.004
    lid.location.y-=.004
    return {'root':root,'lid':lid,'base':base,'boot':boot,'ready':ready,'progress':progress,'button':button,'dial':dial}
