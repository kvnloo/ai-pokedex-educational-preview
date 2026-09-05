"""Build the board-derived Pokedex as authored mechanical solids via Blender MCP."""
import bpy,bmesh,json,math,sys,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
if str(HERE) not in sys.path:sys.path.insert(0,str(HERE))
import importlib,geometry,materials
importlib.reload(geometry);importlib.reload(materials)
from geometry import pivot,slab,frame,annulus,disc,solid,cut,label,linked,union,section_x
REPO=HERE.parents[1]
CONTRACT=json.loads((REPO/'canonical/devices/pokedex.json').read_text())
OUT=Path(CONTRACT['assetRoot'])
previous=bpy.data.scenes.get('PDX-v001-authoring')
if previous:
 for obj in list(previous.objects):
  if len(obj.users_scene)==1:bpy.data.objects.remove(obj,do_unlink=True)
 bpy.data.scenes.remove(previous)
 for group in [bpy.data.collections,bpy.data.meshes,bpy.data.curves,bpy.data.materials,bpy.data.cameras,bpy.data.lights]:
  for item in list(group):
   if item.users==0 and item.name.startswith(('PDX.','GEO-PDX','MAT-PDX','STUDIO.')):group.remove(item)
scene=bpy.data.scenes.new('PDX-v001-authoring')
bpy.context.window.scene=scene
scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='MILLIMETERS'
scene.render.fps=30;scene.frame_start=1;scene.frame_end=294
collections={}
for key in ['Structure','Controls','Hinge','Display','Fasteners','Presentation']:
 c=bpy.data.collections.new('PDX.'+key);scene.collection.children.link(c);collections[key]=c
S=collections['Structure'];C=collections['Controls'];H=collections['Hinge'];D=collections['Display'];F=collections['Fasteners'];P=collections['Presentation']
m=materials.palette()
root=pivot('PDX.Root',(0,0,0),None,S)
base=pivot('PDX.Base',(0,0,0),root,S)
lid=pivot('PDX.LidHinge',(0,0,.024),root,S)
lid['hinge_axis']='local X';lid['closed_degrees']=0.;lid['ready_degrees']=-112.

# Hollow red lower chassis: a closed wall ring plus a seated 3mm floor.
body=frame('GEO-PDX.base-shell-wall',.100,.158,.002,.003,.018,.009,m['red'],base,S,center=(0,-.085),bevel=.00035)
floor=slab('GEO-PDX.base-floor',.096,.154,0,.003,.007,m['redTrim'],base,S,center=(0,-.085),bevel=.00035)
deck=slab('GEO-PDX.inner-deck',.0954,.1534,.0155,.018,.0067,m['graphite'],base,S,center=(0,-.085),bevel=.00045)

# Physical underside service opening and replaceable panel, with true seam.
cut(floor,slab('CUT-service',.066,.106,-.002,.006,.004,None,base,S,center=(0,-.087),bevel=0))
service=slab('GEO-PDX.service-panel',.0653,.1053,.0002,.0026,.00365,m['graphite'],base,S,center=(0,-.087),bevel=.0003)
lip=frame('PART-service-support-lip',.070,.110,.004,.0026,.0034,.006,m['redTrim'],base,S,center=(0,-.087),bevel=0)
union(floor,lip)
for x in [-.0317,.0317]:
 for y in [-.122,-.052]:
  for target in [service,floor]:cut(target,disc('CUT-service-shaft',.00085,.008,(x,y,.002),None,base,S,segments=24,bevel=0))
  cut(service,disc('CUT-service-head',.00135,.0014,(x,y,0),None,base,S,segments=32,bevel=0))
  head=disc('GEO-PDX.service-screw',.00125,.0006,(x,y,.0004),m['metal'],base,F,segments=32,bevel=.00007)
  cut(head,slab('CUT-service-drive',.0015,.0003,-.0003,.00035,.0001,None,base,F,center=(x,y),bevel=0))
  disc('GEO-PDX.service-screw-shaft',.00075,.0027,(x,y,.00205),m['metal'],base,F,segments=24,bevel=.00004)
# Four structural standoffs touch the underside of the deck and the inside floor.
for x in [-.042,.042]:
 for y in [-.152,-.018]:
  annulus(f'GEO-PDX.deck-standoff.{x}.{y}',.0033,.00115,.0125,(x,y,.00925),m['graphite'],base,S,segments=32)

# Real front USB-C shaped opening. Cutter and socket are rotated into XZ.
port_cut=slab('CUT-usb',.014,.0058,-.004,.004,.002,None,base,S,bevel=0)
port_cut.location=(0,-.163,.009);port_cut.rotation_euler.x=math.pi/2;cut(body,port_cut)
port=frame('GEO-PDX.usbc-surround',.0135,.0053,.00045,-.00225,.00225,.002,m['metal'],base,S,bevel=.0001)
port.location=(0,-.16155,.009);port.rotation_euler.x=math.pi/2
port_void=slab('GEO-PDX.usbc-dark-interior',.0135,.0053,-.0004,.0004,.002,m['black'],base,S,bevel=.0001)
port_void.location=(0,-.1589,.009);port_void.rotation_euler.x=math.pi/2
port_tongue=slab('GEO-PDX.usbc-tongue',.0084,.0009,-.00155,.00155,.0003,m['graphite'],base,S,bevel=.0001)
port_tongue.location=(0,-.16085,.009);port_tongue.rotation_euler.x=math.pi/2
for x in [-.0028,-.0017,-.0006,.0006,.0017,.0028]:
 pin=slab('GEO-PDX.usbc-contact',.00055,.00014,-.0006,.0006,.00006,m['metal'],base,S,bevel=0)
 pin.location=(x,-.1615,.0095);pin.rotation_euler.x=math.pi/2
 pocket=pin.copy();pocket.data=pin.data.copy();pocket.modifiers.clear();S.objects.link(pocket);cut(port_tongue,pocket)

# Recessed side accessory port and an actual slotted lanyard anchor.
access_cut=disc('CUT-accessory',.00265,.008,(.049,-.133,.009),None,base,S,axis='X',segments=32,bevel=0);cut(body,access_cut)
annulus('GEO-PDX.accessory-port',.0024,.0016,.004,(.048,-.133,.009),m['blackMetal'],base,S,axis='X',segments=40)
disc('GEO-PDX.accessory-back',.0024,.0008,(.0456,-.133,.009),m['black'],base,S,axis='X',segments=32)
anchor=slab('GEO-PDX.lanyard-anchor',.007,.014,.005,.013,.003,m['redTrim'],base,S,center=(-.049,-.145),bevel=.0003)
anchor_cut=slab('CUT-lanyard',.003,.008,.003,.015,.001,None,base,S,center=(-.050,-.145),bevel=0);cut(anchor,anchor_cut)
# Anchor merges into the side wall so the mounting has no intersecting separate parts.
union(body,anchor)

# Central control: actual deck aperture, seated bezel, luminous annulus and pivoted dial.
cut(deck,disc('CUT-control',.0249,.012,(0,-.073,.018),None,base,S,segments=96,bevel=0))
annulus('GEO-PDX.control-bezel',.0246,.0213,.003,(0,-.073,.0185),m['blackMetal'],base,C,segments=96,bevel=.00035)
annulus('GEO-PDX.control-lightpipe',.0208,.0198,.001,(0,-.073,.0199),m['cyan'],base,C,segments=96,bevel=.00015)
annulus('GEO-PDX.control-inner-seal',.0212,.0193,.0018,(0,-.073,.0182),m['rubber'],base,C,segments=96)
annulus('GEO-PDX.control-lightpipe-seat',.0212,.0196,.0003,(0,-.073,.01925),m['graphite'],base,C,segments=96)
annulus('GEO-PDX.control-well',.02465,.0232,.013,(0,-.073,.0095),m['graphite'],base,C,segments=96)
annulus('GEO-PDX.control-well-roof',.02465,.0081,.001,(0,-.073,.0165),m['graphite'],base,C,segments=96)
annulus('GEO-PDX.control-seal-seat',.0212,.0081,.0003,(0,-.073,.01715),m['graphite'],base,C,segments=96)
dial=pivot('PDX.ControlDial',(0,-.073,.0186),base,C)
rotor=disc('GEO-PDX.control-dial',.0192,.0022,(0,0,0),m['graphite'],dial,C,segments=96,bevel=.00035)
union(rotor,disc('PART-dial-shaft',.008,.01095,(0,0,-.006525),m['graphite'],dial,C,segments=64,bevel=0))
disc('GEO-PDX.dial-return',.0081,.0012,(0,-.073,.0060),m['rubber'],base,C,segments=64)
annulus('GEO-PDX.dial-machined-lip',.0184,.0179,.0003,(0,0,.00115),m['blackMetal'],dial,C,segments=96,bevel=.00008)
cut(rotor,annulus('CUT-dial-lip-seat',.01845,.01785,.0004,(0,0,.0012),None,dial,C,segments=96,bevel=0))
# A recessed radial marker is deliberately subtle.
slab('GEO-PDX.dial-index',.00075,.0034,.00112,.00125,.0002,m['white'],dial,C,center=(0,.0135),bevel=.00004)

# D-pad cross with a real cutout and travel pivot.
cross=[(-.011,-.0036),(-.0036,-.0036),(-.0036,-.011),(.0036,-.011),(.0036,-.0036),(.011,-.0036),(.011,.0036),(.0036,.0036),(.0036,.011),(-.0036,.011),(-.0036,.0036),(-.011,.0036)]
cut_outline=[(x*1.065-.030,y*1.065-.127) for x,y in cross]
cut(deck,solid('CUT-dpad',cut_outline,.013,.023,None,base,S))
dpad=pivot('PDX.DPad',(-.030,-.127,.0185),base,C)
solid('GEO-PDX.dpad',cross,-.003,.002,m['rubber'],dpad,C,bevel=.00065)
union(next(o for o in dpad.children if o.name=='GEO-PDX.dpad'),disc('PART-dpad-stem',.004,.008,(0,0,-.0069),m['rubber'],dpad,C,segments=40,bevel=0))
annulus('GEO-PDX.dpad-support',.007,.0043,.009,( -.030,-.127,.0075),m['graphite'],base,C,segments=40)
disc('GEO-PDX.dpad-return',.0042,.0012,(-.030,-.127,.0070),m['rubber'],base,C,segments=40)
for a in range(4):
 angle=a*math.pi/2
 x,y=.0073*math.sin(angle),.0073*math.cos(angle)
 marker=solid('GEO-PDX.dpad-direction',[(-.001,0),(.001,0),(0,.0013)],.00203,.00211,m['graphite'],dpad,C,bevel=.00004)
 marker.location=(x,y,0);marker.rotation_euler.z=-angle

# Face buttons share cap and socket meshes; each has an independent physical pivot.
button_template=None;socket_template=None
for i,(dx,dy,mark) in enumerate([(0,.009,'X'),(.009,0,'A'),(0,-.009,'B'),(-.009,0,'Y')]):
 x=.032+dx;y=-.126+dy
 cut(deck,disc('CUT-face',.00535,.012,(x,y,.018),None,base,S,segments=48,bevel=0))
 p=pivot('PDX.Button.'+mark,(x,y,.0187),base,C)
 if button_template:linked('GEO-PDX.button.'+mark,button_template,(0,0,0),p,C)
 else:button_template=disc('GEO-PDX.button.'+mark,.00495,.0038,(0,0,0),m['rubber'],p,C,segments=48,bevel=.0005)
 if socket_template:linked('GEO-PDX.button-socket.'+mark,socket_template,(x,y,.014),base,C)
 else:socket_template=annulus('GEO-PDX.button-socket.'+mark,.00525,.00405,.004,(x,y,.014),m['blackMetal'],base,C,segments=48,bevel=.00015)
 label('GEO-PDX.button-label.'+mark,mark,(0,0,.00194),.0027,m['white'],p,C)
 cap=next(o for o in p.children if o.name.startswith('GEO-PDX.button.'))
 if i==0:
  stem=disc('PART-button-stem',.00385,.0049,(0,0,-.00435),m['rubber'],p,C,segments=32,bevel=0)
  union(cap,stem)
 disc('GEO-PDX.button-return.'+mark,.0039,.0012,(x,y,.0113),m['rubber'],base,C,segments=32)
 annulus('GEO-PDX.button-guide-support.'+mark,.00525,.00398,.009,(x,y,.0075),m['graphite'],base,C,segments=32)

# Status and system controls have seated bezels and separate lenses.
for x,mark in [(-.014,'BACK'),(.014,'MENU')]:
 cut(deck,disc('CUT-status',.00265,.009,(x,-.037,.018),None,base,S,segments=32,bevel=0))
 p=pivot('PDX.System.'+mark,(x,-.037,.0182),base,C)
 cap=disc('GEO-PDX.system-'+mark,.0024,.0022,(0,0,0),m['rubber'],p,C,segments=32)
 union(cap,disc('PART-system-stem',.00185,.00725,(0,0,-.004675),m['rubber'],p,C,segments=32,bevel=0))
 disc('GEO-PDX.system-return-'+mark,.00195,.0009,(x,-.037,.00945),m['rubber'],base,C,segments=32)
 label('GEO-PDX.legend-'+mark,mark,(x,-.030,.01805),.0018,m['white'],base,C)
for x,color in [(-.036,'green'),(0,'amber'),(.036,'cyan')]:
 cut(deck,slab('CUT-base-led',.0055,.0018,.014,.021,.0007,None,base,S,center=(x,-.151),bevel=0))
 slab('GEO-PDX.base-led-'+color,.0051,.0015,.0165,.0181,.0006,m[color],base,C,center=(x,-.151),bevel=.0001)

# Lid is a shallow hollow housing. Dark structural back supports segmented red skins.
lid_wall=frame('GEO-PDX.lid-shell-wall',.100,.158,.002,.001,.010,.009,m['red'],lid,S,center=(0,-.085),bevel=.0005)
skirt=frame('PART-lid-return-skirt',.100,.158,.002,-.005,.0011,.009,m['red'],lid,S,center=(0,-.085),bevel=0)
cut(skirt,slab('CUT-skirt-hinge-relief',.110,.030,-.010,.005,.001,None,lid,S,center=(0,0),bevel=0))
union(lid_wall,skirt)
lid_back=slab('GEO-PDX.lid-backplate',.096,.154,.0071,.0085,.007,m['graphite'],lid,S,center=(0,-.085),bevel=.0002)
inner=slab('GEO-PDX.display-chassis',.0954,.1534,.001,.0035,.0067,m['graphite'],lid,S,center=(0,-.085),bevel=.0004)
cut(inner,slab('CUT-display',.0858,.116,.000,.006,.0046,None,lid,S,center=(0,-.081),bevel=0))
cut(inner,slab('CUT-display-trim-seat',.0874,.1176,-.001,.0023,.0052,None,lid,S,center=(0,-.081),bevel=0))
glass=slab('GEO-PDX.display-glass',.0850,.1152,.0021,.0029,.0042,m['glass'],lid,D,center=(0,-.081),bevel=.00016)
screen=slab('GEO-PDX.display-surface',.0847,.1149,.00305,.00325,.004,m['screen'],lid,D,center=(0,-.081),bevel=.00003)
screen['replaceable_display']=True;screen['display_normal']='local -Z';screen['content']='Original placeholder; replace material texture at runtime.'
frame('GEO-PDX.display-inner-trim',.0870,.1172,.00065,.0016,.0023,.005,m['blackMetal'],lid,D,center=(0,-.081),bevel=.0001)
frame('GEO-PDX.glass-support-ledge',.0857,.1159,.00075,.0029,.00305,.0045,m['rubber'],lid,D,center=(0,-.081),bevel=.00003)
frame('GEO-PDX.display-module-frame',.0857,.1159,.00045,.00305,.0058,.0045,m['graphite'],lid,D,center=(0,-.081),bevel=.0001)
slab('GEO-PDX.display-module-backing',.0847,.1149,.00325,.0058,.004,m['graphite'],lid,D,center=(0,-.081),bevel=.0001)
lid_carrier=slab('GEO-PDX.lid-module-carrier',.092,.148,.0058,.0071,.005,m['graphite'],lid,S,center=(0,-.085),bevel=.0002)
for x in [-.026,0,.026]:cut(lid_carrier,disc('CUT-lid-carrier-boss',.0027,.004,(x,-.0103,.006),None,lid,S,segments=32,bevel=0))
for x in [-.0445,.0445]:
 for y in [-.045,-.115]:
  union(inner,disc('PART-display-chassis-post',.001,.00235,(x,y,.004625),m['graphite'],lid,S,segments=32,bevel=0))

# Optical/sensor apertures and true header speaker slots; opaque baffle behind them.
cut(inner,disc('CUT-camera',.0065,.010,(-.032,-.150,.003),None,lid,S,segments=64,bevel=0))
annulus('GEO-PDX.camera-bezel',.0062,.0049,.003,(-.032,-.150,.0010),m['blackMetal'],lid,D,segments=64,bevel=.00018)
disc('GEO-PDX.camera-optics',.0047,.001,(-.032,-.150,.0000),m['glass'],lid,D,segments=64,bevel=.00015)
annulus('GEO-PDX.lens-inner-ring',.0043,.0038,.0002,(-.032,-.150,-.00065),m['metal'],lid,D,segments=64,bevel=.00004)
annulus('GEO-PDX.lens-retainer',.00495,.0043,.0002,(-.032,-.150,-.0006),m['blackMetal'],lid,D,segments=64,bevel=.00004)
annulus('GEO-PDX.lens-shoulder',.0049,.0037,.0007,(-.032,-.150,.00085),m['black'],lid,D,segments=64,bevel=.00005)
disc('GEO-PDX.lens-cartridge-back',.0049,.0013,(-.032,-.150,.00185),m['black'],lid,D,segments=64,bevel=.00005)
annulus('GEO-PDX.camera-carrier',.0062,.0049,.0033,(-.032,-.150,.00415),m['graphite'],lid,D,segments=64,bevel=.0001)
disc('GEO-PDX.lens-aperture',.0036,.0004,(-.032,-.150,.0010),m['black'],lid,D,segments=48)
cut(inner,slab('CUT-optical-led',.0048,.0025,-.002,.006,.001,None,lid,S,center=(-.017,-.150),bevel=0))
slab('GEO-PDX.optical-status',.0043,.0021,.0005,.002,.0008,m['amber'],lid,D,center=(-.017,-.150),bevel=.0001)
slab('GEO-PDX.optical-status-carrier',.0043,.0021,.002,.0058,.0008,m['graphite'],lid,D,center=(-.017,-.150),bevel=.0001)
for i in range(6):
 x=-.004+i*.0033
 cut(inner,slab('CUT-speaker',.0014,.0047,-.002,.005,.0006,None,lid,S,center=(x,-.150),bevel=0))
slab('GEO-PDX.speaker-baffle',.025,.008,.0040,.0048,.0015,m['black'],lid,D,center=(.004,-.150),bevel=.0001)
frame('GEO-PDX.speaker-foam-mount',.026,.009,.0008,.0035,.0040,.0018,m['rubber'],lid,D,center=(.004,-.150),bevel=.0001)
label('GEO-PDX.sensor-label','SENSOR / 01',(.031,-.150,.00085),.0018,m['white'],lid,D,rotation=(math.pi,0,0))

# Distinct front-cover control. It belongs to the lid, not the base dial.
upper=[(-.0473,-.015),(-.041,-.0087),(.041,-.0087),(.0473,-.015),(.0473,-.079),(.030,-.079),(.019,-.0847),(-.019,-.0847),(-.030,-.079),(-.0473,-.079)]
lower=[(x,-.170-y) for x,y in upper]
for part,outline in [('upper',upper),('lower',lower)]:
 panel=solid('GEO-PDX.outer-cover-'+part,outline,.0087,.010,m['red'],lid,S,bevel=.00045)
 cut(panel,disc('CUT-cover-control',.0192,.008,(0,-.085,.010),None,lid,S,segments=96,bevel=0))
 bond=solid('GEO-PDX.cover-bond-'+part,outline,.0085,.0087,m['rubber'],lid,S,bevel=.00003)
 cut(bond,disc('CUT-bond-control',.0192,.008,(0,-.085,.010),None,lid,S,segments=96,bevel=0))
annulus('GEO-PDX.cover-control-surround',.0189,.0148,.0015,(0,-.085,.00925),m['blackMetal'],lid,C,segments=96,bevel=.00025)
annulus('GEO-PDX.cover-cyan-ring',.0141,.0131,.00065,(0,-.085,.00965),m['cyan'],lid,C,segments=96,bevel=.00012)
annulus('GEO-PDX.cover-ring-seat',.01465,.01275,.000825,(0,-.085,.0089125),m['graphite'],lid,C,segments=96,bevel=.0001)
disc('GEO-PDX.cover-control-center',.0126,.0014,(0,-.085,.00920),m['metal'],lid,C,segments=96,bevel=.00025)
label('GEO-PDX.cover-title','POKEDEX',(0,-.131,.01005),.0049,m['white'],lid,S)
label('GEO-PDX.cover-serial','FIELD SYSTEM  /  PD-01',(0,-.139,.01005),.00175,m['white'],lid,S)
slab('GEO-PDX.cover-status',.0065,.0018,.0100,.01045,.0007,m['green'],lid,C,center=(-.035,-.034),bevel=.0001)

# Seven alternating bored barrels on a continuous pin. Each bracket stays in its lane.
pin=disc('GEO-PDX.hinge-pin',.0024,.094,(0,0,.024),m['metal'],base,H,axis='X',segments=64,bevel=.0001)
for i,x in enumerate([-.039,-.026,-.013,0,.013,.026,.039]):
 moving=i%2==1;parent=lid if moving else base
 z=0 if moving else .024
 barrel=annulus('GEO-PDX.hinge-barrel-'+str(i),.0054,.00255,.0123,(x,0,z),m['blackMetal'],parent,H,axis='X',segments=64,bevel=.0002)
 profile=([(-.013,.0035),(-.006,.0035),(-.002,.0045),(.002,.0045),(.002,-.0045),(-.002,-.0045),(-.0065,.0013),(-.013,.0013)] if moving else [(-.013,.0155),(-.006,.0155),(-.003,.019),(.002,.020),(.002,.028),(-.002,.028),(-.0065,.0188),(-.013,.0188)])
 bracket=section_x('PART-hinge-mount',profile,x,.0115,m['blackMetal'],parent,H)
 union(barrel,bracket)
 cut(barrel,disc('CUT-mount-bore',.00255,.015,(x,0,z),None,parent,H,axis='X',segments=64,bevel=0))
 # Recess the metal insert into each housing; attached solids have mating surfaces.
 for target in ([lid_wall,inner] if moving else [body,deck]):
  pocket=slab('CUT-hinge-seat',.0117,.008,0 if moving else .0151,.004 if moving else .021,.0001,None,parent,H,center=(x,-.0095),bevel=0)
  cut(target,pocket)
 head_z=.0015 if moving else .0182
 shaft_z=.0049 if moving else .0142
 bore=disc('CUT-hinge-screw',.00105,.014,(x,-.0103,shaft_z),None,parent,H,segments=32,bevel=0);cut(barrel,bore)
 shaft=disc('PART-hinge-screw-shaft',.00095,.006075 if moving else .006675,(x,-.0103,.0048625 if moving else .0145375),m['metal'],parent,F,segments=32,bevel=0)
 head=disc('GEO-PDX.hinge-screw-head',.0016,.00075,(x,-.0103,head_z),m['metal'],parent,F,segments=32,bevel=.00008)
 union(head,shaft)
 # Recessed slot faces the accessible side of the insert.
 groove=slab('CUT-hinge-drive',.0019,.0004,head_z-.001 if moving else head_z+.00015,head_z-.00015 if moving else head_z+.001,.0001,None,parent,F,center=(x,-.0103),bevel=0);cut(head,groove)
 head_pocket=disc('CUT-hinge-head',.0017,.001,(x,-.0103,.001375 if moving else .018325),None,parent,H,segments=32,bevel=0);cut(barrel,head_pocket)
 if moving:
  cut(lid_back,disc('CUT-backplate-hinge-bore',.00105,.004,(x,-.0103,.0075),None,parent,S,segments=32,bevel=0))
  union(lid_wall,annulus('PART-lid-hinge-boss',.0025,.00105,.0036,(x,-.0103,.0053),m['graphite'],parent,S,segments=32))
 else:union(body,annulus('PART-base-hinge-boss',.0025,.00105,.0125,(x,-.0103,.00925),m['graphite'],parent,S,segments=32))
for x in [-.048,.048]:
 cap=disc('GEO-PDX.hinge-endcap',.0056,.0018,(x,0,.024),m['metal'],base,H,axis='X',segments=64,bevel=.00025)
 union(cap,annulus('PART-endcap-neck',.0036,.00255,.00205,((1 if x>0 else -1)*.046175,0,.024),m['metal'],base,H,axis='X',segments=64,bevel=0))
 cut(cap,disc('CUT-pin-end-seat',.0022,.0003,(x+(.001 if x>0 else -.001),0,.024),None,base,H,axis='X',segments=48,bevel=0))
 disc('GEO-PDX.hinge-pin-end',.0021,.0003,(x+(.001 if x>0 else -.001),0,.024),m['blackMetal'],base,H,axis='X',segments=48,bevel=.00008)

# Fastener heads with actual recessed drives; repeated data is linked.
screw_template=None
for i,(x,y) in enumerate([(x,y) for x in [-.042,.042] for y in [-.152,-.018]]):
 cut(deck,disc('CUT-deck-shaft',.00110,.006,(x,y,.018),None,base,S,segments=32,bevel=0))
 cut(deck,disc('CUT-deck-head-seat',.00185,.002,(x,y,.01825),None,base,S,segments=32,bevel=0))
 if screw_template:linked('GEO-PDX.deck-screw-'+str(i),screw_template,(x,y,.0177),base,F)
 else:
  screw_template=disc('GEO-PDX.deck-screw-0',.00165,.0009,(x,y,.0177),m['metal'],base,F,segments=32,bevel=.0001)
  groove=slab('CUT-screw-drive',.0019,.00038,.0178,.019,.0001,None,base,F,center=(x,y),bevel=0);cut(screw_template,groove)
  union(screw_template,disc('PART-deck-screw-shaft',.001,.013,(x,y,.0108),m['metal'],base,F,segments=32,bevel=0))
for x in [-.041,.041]:
 for y in [-.150,-.020]:
  slab('GEO-PDX.rubber-foot',.010,.014,-.0012,0,.0035,m['rubber'],base,F,center=(x,y),bevel=.0003)
label('GEO-PDX.underside-label','PD-01  /  SERVICE', (0,-.081,.00015),.0026,m['white'],base,F,rotation=(math.pi,0,0))
label('GEO-PDX.underside-serial','DESIGNED FOR THE FIELD', (0,-.089,.00015),.0016,m['white'],base,F,rotation=(math.pi,0,0))

# One structural control carrier ties the guide wells to all four chassis posts.
# The removable service cover carries no button loads.
carrier=slab('GEO-PDX.internal-control-carrier',.088,.144,.0034,.0054,.006,m['graphite'],base,S,center=(0,-.085),bevel=.00025)
for obj in list(scene.objects):
 if obj.name.startswith(('GEO-PDX.deck-standoff.','GEO-PDX.button-guide-support.','GEO-PDX.dpad-support')) or obj.name=='GEO-PDX.control-well':union(carrier,obj)
for x,y in [(.032,-.117),(.041,-.126),(.032,-.135),(.023,-.126)]:
 union(carrier,disc('PART-return-seat',.0039,.00535,(x,y,.008025),m['graphite'],base,S,segments=32,bevel=0))
union(carrier,disc('PART-dpad-return-seat',.0042,.00105,(-.030,-.127,.005875),m['graphite'],base,S,segments=40,bevel=0))
for x in [-.014,.014]:
 union(carrier,annulus('PART-system-guide',.00255,.002,.01170,(x,-.037,.01120),m['graphite'],base,S,segments=32,bevel=0))
 union(carrier,disc('PART-system-return-seat',.00195,.00365,(x,-.037,.007175),m['graphite'],base,S,segments=32,bevel=0))
for x in [-.036,0,.036]:union(carrier,slab('PART-status-led-mount',.0052,.0016,.00535,.0165,.0006,m['graphite'],base,S,center=(x,-.151),bevel=0))
union(carrier,slab('PART-usb-foundation',.0135,.0028,.0034,.00635,.0003,m['graphite'],base,S,center=(0,-.1579),bevel=0))
union(carrier,slab('PART-usb-retention',.0135,.001,.0063,.01165,.0003,m['graphite'],base,S,center=(0,-.158),bevel=0))
union(carrier,slab('PART-accessory-foundation',.0045,.008,.0034,.0066,.0003,m['graphite'],base,S,center=(.04325,-.133),bevel=0))
union(carrier,slab('PART-accessory-retention',.0008,.0048,.00655,.0114,.0002,m['graphite'],base,S,center=(.0448,-.133),bevel=0))
# Trim support feet to the actual service-opening lip instead of intersecting it.
trim=frame('CUT-service-lip-relief',.07012,.11012,.00412,.0029,.00345,.00606,None,base,S,center=(0,-.087),bevel=0)
cut(carrier,trim)
for x in [-.042,.042]:
 for y in [-.152,-.018]:cut(carrier,disc('CUT-carrier-through-bore',.00115,.016,(x,y,.010),None,base,S,segments=32,bevel=0))
for x in [-.0317,.0317]:
 for y in [-.122,-.052]:cut(carrier,disc('CUT-service-clearance',.00085,.009,(x,y,.003),None,base,S,segments=24,bevel=0))

# Replaceable original boot/ready graphic placeholders; no board image projection.
boot=pivot('PDX.DisplayBoot',(0,0,0),lid,D)
ready=pivot('PDX.DisplayReady',(0,0,0),lid,D)
for name,text,xy,size in [('title','POKEDEX',(0,-.120),.0055),('status','SYSTEM READY',(0,-.070),.0026),('sub','FIELD ARCHIVE  /  LOCAL',(0,-.058),.0018)]:
 label('GEO-PDX.ready-'+name,text,(*xy,.00298),size,m['cyan'] if name=='title' else m['uiWhite'],ready,D,rotation=(math.pi,0,0))
# Closed perimeter graphic ring is original authored screen content, not mesh detail.
frame('GEO-PDX.ready-frame',.075,.104,.0003,.00295,.00300,.003,m['cyan'],ready,D,center=(0,-.081),bevel=0)
for parent in [boot,ready]:
 annulus('GEO-PDX.original-scan-glyph',.010,.0096,.00004,(0,-.095,.00297),m['cyan'],parent,D,segments=6,bevel=0)
 annulus('GEO-PDX.original-scan-inner',.005,.0047,.00004,(0,-.095,.00297),m['cyan'],parent,D,segments=48,bevel=0)
 disc('GEO-PDX.original-scan-dot',.0014,.00004,(0,-.095,.00297),m['uiWhite'],parent,D,segments=32,bevel=0)
label('GEO-PDX.boot-title','INITIALIZING',(0,-.075,.00298),.0032,m['cyan'],boot,D,rotation=(math.pi,0,0))
progress=pivot('PDX.BootProgress',(-.027,-.055,.00298),boot,D)
slab('GEO-PDX.boot-progress',.054,.0022,-.00002,.00002,.0005,m['cyan'],progress,D,center=(.027,0),bevel=0)
boot.scale=(.00001,.00001,.00001)

# Preview pose only. Authored time clips come after mechanical review.
lid.rotation_euler.x=math.radians(-112)
# Normal consistency on all original authored solids.
for obj in scene.objects:
 if obj.type=='MESH':
  for index in reversed(range(len(obj.data.materials))):
   if obj.data.materials[index] is None:obj.data.materials.pop(index=index)
  bm=bmesh.new();bm.from_mesh(obj.data)
  bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
  bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-8)
  bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
  # Boolean-generated planar triangles must retain a true flat face normal.
  for poly in obj.data.polygons:
   if max(abs(v) for v in poly.normal)>.999999:poly.use_smooth=False
  if obj.name=='GEO-PDX.base-shell-wall':
   next(mod for mod in obj.modifiers if mod.type=='WELD').merge_threshold=1e-8
# Record source/build identity before saving a dedicated scene file.
receipt={'assetId':CONTRACT['assetId'],'stage':'static-mechanical-first-pass','scene':scene.name,'root':root.name,'lidPivot':list(lid.location),'lidAxis':'X','readyAngleDegrees':-112,'objects':len(scene.objects),'meshes':sum(o.type=='MESH' for o in scene.objects),'materials':list(mat.name for mat in m.values()),'limitations':['First pass awaiting rendered inspection and collision audit.','UV/PBR baking, animation and optimized export not yet delivered.'],'sources':CONTRACT['referenceBoards'],'scripts':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [HERE/'build.py',HERE/'geometry.py',HERE/'materials.py']}}
(OUT/'source/build-first-pass.json').write_text(json.dumps(receipt,indent=2))
bpy.data.libraries.write(str(OUT/'source/pokedex-v001-static-first-pass.blend'),{scene},fake_user=True)
print(json.dumps(receipt))
