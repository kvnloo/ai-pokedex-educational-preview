"""Compare every replay stage with the actual exported meshes, arrays and views."""
import argparse
import json
import numpy as np
import trimesh
from PIL import Image
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--reproduction',required=True,type=Path)
args=parser.parse_args()
root=Path('/mnt/zer0models/pokemon-iac/characters/charizard/anatomy-r03')
report={'reproduction':str(args.reproduction),'stages':{}}
for revision,audit in [('r01','topology-audit.npz'),('r05','refinement-audit.npz'),('r06','horn-audit.npz')]:
    identifier='charizard-head-'+revision
    directories=[root/('head-'+revision),args.reproduction/('head-'+revision)]
    scenes=[trimesh.load(folder/(identifier+'.glb'),force='scene',process=False) for folder in directories]
    result={'geometry':{},'arrays':{},'renders':{}}
    assert set(scenes[0].graph.nodes_geometry)==set(scenes[1].graph.nodes_geometry)
    for name in scenes[0].graph.nodes_geometry:
        nodes=[scene.graph[name] for scene in scenes]
        meshes=[scene.geometry[node[1]] for scene,node in zip(scenes,nodes)]
        result['geometry'][name]={'positionsExact':bool(np.array_equal(meshes[0].vertices,meshes[1].vertices)),'trianglesExact':bool(np.array_equal(meshes[0].faces,meshes[1].faces)),'transformExact':bool(np.array_equal(nodes[0][0],nodes[1][0]))}
    left,right=[np.load(folder/audit) for folder in directories]
    assert set(left.files)==set(right.files)
    for key in left.files: result['arrays'][key]=bool(np.array_equal(left[key],right[key]))
    for view in ['minusY','plusX','plusY','minusX','threequarter','head-front','head-right','head-left','head-rear','head-top','head-threequarter']:
        images=[np.asarray(Image.open(folder/(identifier+'-'+view+'.png'))) for folder in directories]
        result['renders'][view]={'pixelsExact':bool(np.array_equal(*images)),'differentChannels':int(np.count_nonzero(images[0]!=images[1]))}
    result['allExact']=all(all(checks.values()) for checks in result['geometry'].values()) and all(result['arrays'].values()) and all(image['pixelsExact'] for image in result['renders'].values())
    report['stages'][revision]=result
report['allExact']=all(stage['allExact'] for stage in report['stages'].values())
(args.reproduction/'comparison.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
assert report['allExact']
