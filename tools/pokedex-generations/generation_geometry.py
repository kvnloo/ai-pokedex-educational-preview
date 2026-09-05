"""Named, bounded solids for separate reference candidates; no global scene deletion."""
import bpy
import math
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('pokedex_solid_primitives', Path(__file__).resolve().parents[1] / 'pokedex-device/geometry.py')
solids = importlib.util.module_from_spec(spec)
spec.loader.exec_module(solids)
objects_by_name = {}
prefix = ''

def register(obj, name):
    obj['source_name'] = name
    obj.name = prefix + name
    objects_by_name[name] = obj
    return obj

def material(name, color, rough=.3, metal=0, emission=0, coat=0):
    m = bpy.data.materials.new(prefix + 'MAT-' + name)
    m.diffuse_color = (*color, 1); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    for key, value in {'Base Color': (*color, 1), 'Metallic': metal, 'Roughness': rough, 'Coat Weight': coat, 'Coat Roughness': .17, 'Emission Color': (*color, 1), 'Emission Strength': emission}.items():
        p.inputs[key].default_value = value
    return m

def empty(name, parent=None, loc=(0,0,0)):
    return register(solids.pivot(prefix+name, loc, parent, bpy.context.scene.collection), name)

def polygon(name, points, z, depth, mat, parent, bevel=.0003):
    obj = solids.solid(prefix+'GEO-'+name, points, z-depth/2, z+depth/2, mat, parent, bpy.context.scene.collection, bevel)
    return register(obj, 'GEO-'+name)

def rounded(name, w, length, depth, r, loc, mat, parent, bevel=.0005):
    obj = solids.slab(prefix+'GEO-'+name, w, length, loc[2]-depth/2, loc[2]+depth/2, r, mat, parent, bpy.context.scene.collection, center=loc[:2], bevel=bevel)
    return register(obj, 'GEO-'+name)

def cylinder(name, r, depth, loc, mat, parent, axis='Z', bevel=.0003):
    obj = solids.disc(prefix+'GEO-'+name, r, depth, loc, mat, parent, bpy.context.scene.collection, axis=axis, bevel=bevel)
    return register(obj, 'GEO-'+name)

def ring(name, r, tube, loc, mat, parent):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=tube, major_segments=96, minor_segments=12, location=loc)
    obj = bpy.context.object; obj.parent = parent; obj.data.materials.append(mat)
    for p in obj.data.polygons: p.use_smooth = True
    return register(obj, 'GEO-'+name)

def line(name, pts, mat, parent, r=.00025):
    curve = bpy.data.curves.new(prefix+name, 'CURVE'); curve.dimensions = '3D'
    curve.bevel_depth = r; curve.bevel_resolution = 2; curve.use_fill_caps = True
    spline = curve.splines.new('POLY'); spline.points.add(len(pts)-1)
    for p, point in zip(spline.points, pts): p.co = (*point, 1)
    obj = solids.link(prefix+'GEO-'+name, curve, parent, bpy.context.scene.collection)
    curve.materials.append(mat)
    return register(obj, 'GEO-'+name)

def label(name, text, loc, size, mat, parent, inside=False):
    obj = solids.label(prefix+'GEO-'+name, text, loc, size, mat, parent, bpy.context.scene.collection, rotation=(math.pi if inside else 0,0,0))
    obj['geometry_role'] = 'display-graphic'
    return register(obj, 'GEO-'+name)

def remove(obj):
    bpy.data.objects.remove(obj, do_unlink=True)

def subtract(target, tool):
    bpy.context.view_layer.update()
    solids.cut(target, tool)

def union(target, part):
    bpy.context.view_layer.update()
    solids.union(target, part)

def tube(name, outer, inner, depth, loc, mat, parent, axis='Z', bevel=.00012):
    obj = solids.annulus(prefix+'GEO-'+name, outer, inner, depth, loc, mat, parent, bpy.context.scene.collection, axis=axis, bevel=bevel)
    return register(obj, 'GEO-'+name)

def section_x(name, profile, x, width, mat, parent, bevel=.0002):
    obj=solids.section_x(prefix+'GEO-'+name,profile,x,width,mat,parent,bpy.context.scene.collection,bevel)
    return register(obj,'GEO-'+name)

def outer_bevel(obj,width,length,radius,center_y,z_values,edge_radius):
    weights=obj.data.attributes.get('bevel_weight_edge') or obj.data.attributes.new('bevel_weight_edge','FLOAT','EDGE')
    def outer(co):
        qx=max(abs(co.x)-(width/2-radius),0)
        qy=max(abs(co.y-center_y)-(length/2-radius),0)
        return abs(math.hypot(qx,qy)-radius)<1e-6
    for edge in obj.data.edges:
        a,b=[obj.data.vertices[i].co for i in edge.vertices]
        weights.data[edge.index].value=float(outer(a) and outer(b) and any(abs(a.z-z)<1e-7 and abs(b.z-z)<1e-7 for z in z_values))
    mod=next(m for m in obj.modifiers if m.type=='BEVEL')
    mod.limit_method='WEIGHT';mod.width=edge_radius;mod.segments=4
    mod.miter_inner='MITER_SHARP';mod.spread=.0001
