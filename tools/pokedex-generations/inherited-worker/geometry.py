"""Meter-scale closed solids, with local coordinates preserved under one lid pivot."""
import bpy,math

def material(name,color,rough=.3,metal=0,emission=0,coat=0):
    m=bpy.data.materials.new('MAT-'+name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    for k,v in {'Base Color':(*color,1),'Metallic':metal,'Roughness':rough,'Coat Weight':coat,'Coat Roughness':.17,'Emission Color':(*color,1),'Emission Strength':emission}.items():p.inputs[k].default_value=v
    if name in {'obsidian','graphite','elastomer','panel-cut'}:p.inputs['Specular IOR Level'].default_value=.18
    return m

def empty(name,parent=None,loc=(0,0,0)):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc;return o

def finish(o,name,mat,parent,bevel=0):
    o.name='GEO-'+name;o.parent=parent
    if mat:o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('Edge radii','BEVEL');mod.width=bevel;mod.segments=3
        mod=o.modifiers.new('Surface normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=50
    return o

def polygon(name,points,z,depth,mat,parent,bevel=.0003):
    if sum(x1*y2-x2*y1 for (x1,y1),(x2,y2) in zip(points,points[1:]+points[:1]))<0:points=list(reversed(points))
    n=len(points);verts=[(x,y,z+zz) for zz in [-depth/2,depth/2] for x,y in points]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
    return finish(o,name,mat,parent,bevel)

def rounded(name,w,l,depth,r,loc,mat,parent,bevel=.0005):
    pts=[]
    for x,y,start in [(w/2-r,l/2-r,0),(-w/2+r,l/2-r,90),(-w/2+r,-l/2+r,180),(w/2-r,-l/2+r,270)]:
        for i in range(13):
            a=math.radians(start+i*90/12);pts.append((loc[0]+x+r*math.cos(a),loc[1]+y+r*math.sin(a)))
    return polygon(name,pts,loc[2],depth,mat,parent,bevel)

def cylinder(name,r,depth,loc,mat,parent,axis='Z',bevel=.0003):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=r,depth=depth,location=loc)
    o=bpy.context.object
    if axis=='X':o.rotation_euler.y=math.pi/2
    if axis=='Y':o.rotation_euler.x=math.pi/2
    for p in o.data.polygons:p.use_smooth=len(p.vertices)==4
    return finish(o,name,mat,parent,bevel)

def ring(name,r,tube,loc,mat,parent):
    bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=tube,major_segments=80,minor_segments=12,location=loc)
    o=bpy.context.object
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,mat,parent)

def line(name,pts,mat,parent,r=.00025):
    # Real narrow solid seams, exported as triangle meshes after conversion.
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2
    s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new('GEO-'+name,c);bpy.context.collection.objects.link(o);o.parent=parent;c.materials.append(mat);return o

def label(name,text,loc,size,mat,parent,inside=False):
    c=bpy.data.curves.new(name,'FONT');c.body=text;c.size=size;c.align_x='CENTER';c.extrude=.000015
    o=bpy.data.objects.new('GEO-'+name,c);bpy.context.collection.objects.link(o);o.parent=parent;o.location=loc
    if inside:o.rotation_euler.x=math.pi
    c.materials.append(mat);return o
