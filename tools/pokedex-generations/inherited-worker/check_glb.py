"""Read the exported glTF JSON/binary directly and measure actual animation data."""
import struct,json,math
from pathlib import Path
import numpy as np
REQUIRED={'Closed','Opening','BootUp','Ready','Idle','ButtonPress'}

def inspect(path):
    data=Path(path).read_bytes();magic,version,total=struct.unpack_from('<III',data)
    assert magic==0x46546c67 and version==2 and total==len(data)
    length,kind=struct.unpack_from('<II',data,12);assert kind==0x4e4f534a
    g=json.loads(data[20:20+length]);offset=20+length
    binary_length,binary_type=struct.unpack_from('<II',data,offset);assert binary_type==0x004e4942
    binary=data[offset+8:offset+8+binary_length]
    def accessor(index):
        a=g['accessors'][index];view=g['bufferViews'][a['bufferView']];components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        dtype=np.dtype({5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']]);start=view.get('byteOffset',0)+a.get('byteOffset',0)
        stride=view.get('byteStride',components*dtype.itemsize)
        return np.ndarray((a['count'],components),dtype=dtype,buffer=binary,offset=start,strides=(stride,dtype.itemsize)).copy()
    for i in range(len(g['accessors'])):assert np.isfinite(accessor(i)).all(),f'Nonfinite accessor {i}'
    nodes=g['nodes'];names=[x['name'] for x in nodes];animations=g.get('animations',[])
    assert {x['name'] for x in animations}==REQUIRED,[x['name'] for x in animations]
    rows=[]
    for animation in animations:
        targets=[];duration=0;measures={}
        for ch in animation['channels']:
            sampler=animation['samplers'][ch['sampler']];times=accessor(sampler['input']).ravel();values=accessor(sampler['output']);name=names[ch['target']['node']];path=ch['target']['path']
            assert len(times)>=2 and np.all(np.diff(times)>0),f'Invalid timeline {animation["name"]}'
            assert times[0]>=-1e-6;duration=max(duration,float(times[-1]));targets.append(name+'.'+path)
            if name=='PDX.LidHinge' and path=='rotation':
                measures['hinge_angle_degrees']=[float(2*math.degrees(math.acos(min(1,abs(float(q[3])))))) for q in [values[0],values[-1]]]
                measures['hinge_motion_degrees']=float(2*math.degrees(math.acos(min(1,abs(float(np.dot(values[0],values[-1])))))))
            if name=='PDX.ButtonPress' and path=='translation':measures['button_travel_m']=float(np.max(np.ptp(values,axis=0)))
            if name=='PDX.BootProgress' and path=='scale':measures['progress_range']=np.ptp(values,axis=0).tolist()
        rows.append({'name':animation['name'],'duration_seconds':duration,'channels':len(targets),'targets':targets,**measures})
    by_name={r['name']:r for r in rows};assert by_name['Opening']['hinge_motion_degrees']>90
    assert by_name['ButtonPress']['button_travel_m']>.001
    assert by_name['BootUp']['progress_range'][0]>.9
    positions=[];triangles=0
    for mesh in g['meshes']:
        for primitive in mesh['primitives']:
            pos=accessor(primitive['attributes']['POSITION']);positions.append(len(pos))
            if 'indices' in primitive:
                indices=accessor(primitive['indices']);assert indices.max()<len(pos);triangles+=len(indices)//3
    assert not g.get('cameras') and not any(n.startswith('STUDIO') for n in names)
    return {'passed':True,'bytes':len(data),'mesh_count':len(g['meshes']),'nodes':len(nodes),'triangles':triangles,'animations':rows,'extensions':g.get('extensionsUsed',[]),'finite_accessors':True,'indices_in_range':True,'studio_excluded':True}

if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('file');p.add_argument('--report',required=True);a=p.parse_args()
    result=inspect(a.file);Path(a.report).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
