"""Reference-specific fittings and seated markings; editable screen placeholders."""
import bpy
import math
import generation_geometry as g

def detail(variant,c,objects):
    n=g.objects_by_name; b1=variant=='board01';w=c['width'];length=c['length']
    lid,base=objects['lid'],objects['base']
    shell=n['GEO-lid-shell'];red=shell.data.materials[0]
    black=n['GEO-base-gasket'].data.materials[0]
    silver=n['GEO-camera-retainer'].data.materials[0]
    # Surface markings sit on their support, rather than hovering over the shell.
    for name in ['GEO-exterior-wordmark','GEO-edition']:
        if name in n:n[name].location.z=.006025
    if b1:n['GEO-button-A-type'].location.z=.001025
    # Cut physical panel grooves, retaining a narrow dark floor inside each groove.
    for obj in list(bpy.context.scene.objects):
        if not obj.get('source_name','').startswith('GEO-exterior-engraving-'):continue
        pts=[(p.co.x,p.co.y+.004,.00602) for p in obj.data.splines[0].points]
        name=obj['source_name'].removeprefix('GEO-');ink=obj.data.materials[0];g.remove(obj)
        tool=g.line('CUT-'+name,pts,ink,lid,.00024)
        bpy.ops.object.select_all(action='DESELECT');tool.select_set(True);bpy.context.view_layer.objects.active=tool
        bpy.ops.object.convert(target='MESH');g.subtract(shell,bpy.context.object)
        g.line(name,[(x,y,.00581) for x,y,z in pts],ink,lid,.000045)
    if not b1:
        g.remove(n['GEO-equatorial-seam'])
        cx,cy=c['layout']['closed']['lock'];cy+=.004
        g.rounded('equatorial-seam',w-.0004,.0042,.0008,.00035,(0,cy,.00625),black,lid,.00012)
    # Red end sleeves and black rails match the open panels, independent of the exterior spine.
    for obj in list(bpy.context.scene.objects):
        name=obj.get('source_name','')
        if obj.parent==lid and name.startswith('GEO-spine-'):
            obj.data.materials.clear();obj.data.materials.append(red if 'sleeve' in name and name[-1] in '02' else black)
    radius=.0055 if b1 else .006
    x=-w/2-(.004 if b1 else .006)
    source=None
    for i,t in enumerate([-.40,-.27,.27,.40]):
        ring=g.tube('spine-band-'+str(i),radius+.00042,radius,.0013,(x,t*length,.0015),black,base,'Y',.00013)
        if source:old=ring.data;ring.data=source.data;bpy.data.meshes.remove(old)
        else:source=ring
    sensor=n['GEO-sensor'];sensor.location.z=-.00125
    for v in sensor.data.vertices:v.co.x*=.82;v.co.y*=.58;v.co.z*=.5
    if not b1:
        sensor.data.materials.clear();sensor.data.materials.append(n['GEO-green-deck-indicator'].data.materials[0])
    # Full-travel stems contact their elastomer returns in the rest pose.
    for obj in list(bpy.context.scene.objects):
        logical=obj.get('source_name','')
        if logical=='GEO-button-A-stem' or logical.startswith('GEO-key-stem-'):
            obj.location.z=-.0028
            for v in obj.data.vertices:v.co.z*=.0041/.0036
        if logical=='GEO-dpad-stem':
            obj.location.z=.002675
            for v in obj.data.vertices:v.co.z*=.00715/.006
    # A simple original scanner symbol avoids passing the inherited rough mascot off as finished UI.
    for name in ['GEO-scan-glyph','GEO-glyph-eye']:
        for obj in list(bpy.context.scene.objects):
            if obj.get('source_name')==name:g.remove(obj)
    boot=objects['boot'];textmat=n['GEO-boot-title'].data.materials[0]
    center_y=-.008 if b1 else -.016
    for i,(r,tube) in enumerate([(.011,.00032),(.0033,.00035)]):
        mark=g.ring('boot-scan-ring-'+str(i),r,tube,(0,center_y,0),textmat,boot)
        mark['geometry_role']='display-graphic'
    for side in [-1,1]:
        mark=g.line('boot-scan-bar-'+str(side),[(side*.004,center_y,0),(side*.0108,center_y,0)],textmat,boot,.00025)
        mark['geometry_role']='display-graphic'
    # The screen and every overlay remain individually replaceable by the game.
    for group in [objects['boot'],objects['ready']]:group['replaceable_display_content']=True
    for obj in list(bpy.context.scene.objects):
        if obj.type not in {'MESH','CURVE','FONT'}:continue
        parent=obj.parent
        if parent in [boot,objects['ready'],objects['progress']]:obj['geometry_role']='display-graphic'
    g.outer_bevel(shell,w,length,.012,-length/2,[0,.006],.0014)
    g.outer_bevel(n['GEO-base-shell'],w,length,.011,0,[-.005,.005],.0013)
