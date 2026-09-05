"""Authored portable Principled materials; hero microdetail is isolated for baking."""
import bpy


def material(name,color,roughness,metallic=0,coat=0,emission=0,transmission=0):
    mat=bpy.data.materials.new('MAT-PDX-'+name);mat.use_nodes=True;mat.diffuse_color=(*color,1)
    p=mat.node_tree.nodes.get('Principled BSDF')
    for key,value in {'Base Color':(*color,1),'Roughness':roughness,'Metallic':metallic,'Coat Weight':coat,'Coat Roughness':.18,'IOR':1.46,'Transmission Weight':transmission,'Emission Color':(*color,1),'Emission Strength':emission}.items():p.inputs[key].default_value=value
    return mat


def palette():
    return {
      'red':material('ceramic-red-polymer',(.38,.012,.020),.26,coat=.38),
      'redTrim':material('crimson-trim',(.19,.008,.014),.29,coat=.25),
      'graphite':material('graphite-chassis',(.016,.022,.027),.37),
      'rubber':material('silicone-controls',(.009,.014,.017),.48),
      'metal':material('brushed-aluminum',(.50,.54,.57),.26,metallic=1),
      'blackMetal':material('blackened-steel',(.042,.055,.065),.30,metallic=1),
      'glass':material('optical-glass',(.88,.94,.96),.065,transmission=1),
      'screen':material('swappable-display',(.004,.022,.029),.22,emission=.35),
      'cyan':material('cyan-lightpipe',(.04,.72,.84),.22,emission=2.4),
      'green':material('green-status',(.025,.75,.24),.25,emission=1.8),
      'amber':material('amber-status',(.98,.39,.035),.25,emission=1.5),
      'white':material('warm-silver-markings',(.66,.75,.76),.42),
      'uiWhite':material('display-white',(.66,.85,.86),.42,emission=1.5),
      'black':material('port-interior',(.003,.004,.005),.60),
    }
