"""Explicit solid construction for the authored Pokedex device; Blender Python."""
import bpy
import bmesh
import math
from mathutils import Vector


def link(name, data, parent, collection):
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    obj.parent=parent
    return obj


def pivot(name,xyz,parent,collection):
    obj=link(name,None,parent,collection)
    obj.location=xyz
    obj.empty_display_type='PLAIN_AXES';obj.empty_display_size=.008
    return obj


def finish(obj,material,bevel=0,segments=3):
    if material:obj.data.materials.append(material)
    if bevel:
        mod=obj.modifiers.new('Manufacturing edge radius','BEVEL')
        extent=[max(v.co[i] for v in obj.data.vertices)-min(v.co[i] for v in obj.data.vertices) for i in range(3)]
        mod.width=min(bevel,min(extent)*.28);mod.segments=segments;mod.limit_method='ANGLE'
        mod.harden_normals=True
        weld=obj.modifiers.new('Numerical seam weld','WELD');weld.merge_threshold=1e-7
        normal=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
        normal.keep_sharp=True;normal.weight=40
    return obj


def solid(name,outline,z0,z1,material,parent,collection,bevel=0):
    if sum(outline[i][0]*outline[(i+1)%len(outline)][1]-outline[(i+1)%len(outline)][0]*outline[i][1] for i in range(len(outline)))<0:outline=list(reversed(outline))
    n=len(outline)
    verts=[(x,y,z) for z in (z0,z1) for x,y in outline]
    faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    data=bpy.data.meshes.new(name+'.mesh');data.from_pydata(verts,[],faces);data.update()
    for poly in data.polygons:poly.use_smooth=len(poly.vertices)==4
    return finish(link(name,data,parent,collection),material,bevel)


def rounded_outline(width,length,radius,center=(0,0),segments=10):
    x,y=center;r=min(radius,width/2-.000001,length/2-.000001)
    points=[]
    for cx,cy,angle in [(width/2-r,length/2-r,0),(-width/2+r,length/2-r,90),(-width/2+r,-length/2+r,180),(width/2-r,-length/2+r,270)]:
        for j in range(segments+1):
            a=math.radians(angle+j*90/segments)
            points.append((x+cx+r*math.cos(a),y+cy+r*math.sin(a)))
    return points


def slab(name,width,length,z0,z1,radius,material,parent,collection,center=(0,0),bevel=.0003):
    return solid(name,rounded_outline(width,length,radius,center),z0,z1,material,parent,collection,bevel)


def frame(name,width,length,wall,z0,z1,radius,material,parent,collection,center=(0,0),bevel=.0002):
    outer=rounded_outline(width,length,radius,center)
    inner=rounded_outline(width-2*wall,length-2*wall,max(.0001,radius-wall),center)
    n=len(outer);verts=[(x,y,z) for z in (z0,z1) for loop in (outer,inner) for x,y in loop]
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,2*n+j,2*n+i),(n+j,n+i,3*n+i,3*n+j),(j,i,n+i,n+j),(2*n+i,2*n+j,3*n+j,3*n+i)])
    mesh=bpy.data.meshes.new(name+'.mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    for poly in mesh.polygons:poly.use_smooth=poly.index%4<2
    return finish(link(name,mesh,parent,collection),material,bevel)


def annulus(name,outer,inner,depth,xyz,material,parent,collection,axis='Z',segments=64,bevel=.00015):
    verts=[]
    for h in (-depth/2,depth/2):
        for radius in (outer,inner):
            for i in range(segments):
                a=2*math.pi*i/segments
                verts.append((radius*math.cos(a),radius*math.sin(a),h))
    n=segments;faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,2*n+j,2*n+i),(n+j,n+i,3*n+i,3*n+j),(i,n+i,n+j,j),(2*n+j,3*n+j,3*n+i,2*n+i)])
    mesh=bpy.data.meshes.new(name+'.mesh');mesh.from_pydata(verts,[],faces);mesh.update()
    obj=finish(link(name,mesh,parent,collection),material,bevel)
    obj.location=xyz
    if axis=='X':obj.rotation_euler.y=math.pi/2
    elif axis=='Y':obj.rotation_euler.x=math.pi/2
    for poly in mesh.polygons:poly.use_smooth=poly.index%4<2
    return obj


def disc(name,radius,depth,xyz,material,parent,collection,axis='Z',segments=64,bevel=.0002):
    outline=[(radius*math.cos(2*math.pi*i/segments),radius*math.sin(2*math.pi*i/segments)) for i in range(segments)]
    obj=solid(name,outline,-depth/2,depth/2,material,parent,collection,bevel)
    obj.location=xyz
    if axis=='X':obj.rotation_euler.y=math.pi/2
    elif axis=='Y':obj.rotation_euler.x=math.pi/2
    for poly in obj.data.polygons:poly.use_smooth=len(poly.vertices)==4
    return obj


def cut(target,cutter):
    # Apply the boolean before the bevel/normal stack to retain authored edge radii.
    bpy.context.view_layer.objects.active=target
    mod=target.modifiers.new('Machined opening','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter
    bpy.ops.object.modifier_move_to_index(modifier=mod.name,index=0)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter,do_unlink=True)


def union(target,part):
    part.modifiers.clear()
    bpy.context.view_layer.objects.active=target
    mod=target.modifiers.new('Integral mechanical solid','BOOLEAN');mod.operation='UNION';mod.solver='EXACT';mod.object=part
    bpy.ops.object.modifier_move_to_index(modifier=mod.name,index=0)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(part,do_unlink=True)


def section_x(name,profile,x,width,material,parent,collection,bevel=.0002):
    obj=solid(name,profile,-width/2,width/2,material,parent,collection,bevel)
    for vertex in obj.data.vertices:
        u,v,w=vertex.co;vertex.co=(w+x,u,v)
    return obj


def label(name,text,xyz,size,material,parent,collection,rotation=(0,0,0),align='CENTER'):
    curve=bpy.data.curves.new(name+'.font','FONT');curve.body=text;curve.size=size;curve.align_x=align;curve.align_y='CENTER'
    curve.extrude=.000015;curve.resolution_u=4
    obj=link(name,curve,parent,collection);obj.location=xyz;obj.rotation_euler=rotation
    curve.materials.append(material)
    return obj


def linked(name,source,xyz,parent,collection):
    obj=source.copy();obj.data=source.data;obj.name=name;collection.objects.link(obj);obj.parent=parent;obj.location=xyz
    return obj
