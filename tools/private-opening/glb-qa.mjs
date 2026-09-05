/** Independent binary inspection; never infer visual recognition from geometry. */
export function inspectGlb(bytes) {
  if(bytes.length<28 || bytes.toString('ascii',0,4)!=='glTF' || bytes.readUInt32LE(4)!==2 || bytes.readUInt32LE(8)!==bytes.length) throw new Error('GLB header/length mismatch');
  let gltf, binary;
  for(let offset=12;offset<bytes.length;) {
    if(offset+8>bytes.length) throw new Error('truncated GLB chunk');
    const length=bytes.readUInt32LE(offset), kind=bytes.readUInt32LE(offset+4);
    if(length%4!==0 || offset+8+length>bytes.length) throw new Error('invalid GLB chunk bounds');
    if(kind===0x4e4f534a) {if(gltf) throw new Error('duplicate JSON chunk');gltf=JSON.parse(bytes.subarray(offset+8,offset+8+length).toString());}
    else if(kind===0x004e4942) {if(binary) throw new Error('duplicate binary chunk');binary=bytes.subarray(offset+8,offset+8+length);}
    else throw new Error('unsupported GLB chunk');
    offset+=length+8;
  }
  if(!gltf || !binary || gltf.asset?.version!=='2.0' || gltf.buffers?.length!==1 || gltf.buffers[0].byteLength>binary.length || !gltf.meshes?.length) throw new Error('embedded GLB geometry required');
  if([...(gltf.buffers??[]),...(gltf.images??[])].some(x=>x.uri)) throw new Error('external/data URI assets forbidden');
  function accessor(index,type,components) {
    const a=gltf.accessors?.[index],v=gltf.bufferViews?.[a?.bufferView];
    if(!a || !v || a.sparse || a.type!==type || v.buffer!==0 || !Number.isSafeInteger(a.count) || a.count<1 || a.count>1_000_000) throw new Error('unsupported geometry accessor');
    const widths={5121:1,5123:2,5125:4,5126:4};const width=widths[a.componentType];
    if(!width || (type==='VEC3' && a.componentType!==5126) || (type==='SCALAR' && a.componentType===5126)) throw new Error('unsupported component type');
    const start=(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??width*components;
    const end=start+(a.count-1)*stride+width*components;
    if(!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(stride)||stride<width*components||end>binary.length||end>(v.byteOffset??0)+v.byteLength) throw new Error('accessor outside buffer');
    const get=(row,col=0)=>{
      if(!Number.isInteger(row)||row<0||row>=a.count) throw new Error('index outside vertices');
      const offset=start+row*stride+col*width;
      return a.componentType===5126?binary.readFloatLE(offset):a.componentType===5125?binary.readUInt32LE(offset):a.componentType===5123?binary.readUInt16LE(offset):binary.readUInt8(offset);
    };
    return {count:a.count,get};
  }
  let triangles=0,vertices=0;
  for(const mesh of gltf.meshes) for(const primitive of mesh.primitives??[]) {
    if((primitive.mode??4)!==4) throw new Error('triangle primitives required');
    const positions=accessor(primitive.attributes?.POSITION,'VEC3',3);
    const indices=primitive.indices===undefined?{count:positions.count,get:i=>i}:accessor(primitive.indices,'SCALAR',1);
    if(indices.count%3!==0) throw new Error('incomplete triangle');
    vertices+=positions.count;
    for(let i=0;i<positions.count;i++) for(let c=0;c<3;c++) if(!Number.isFinite(positions.get(i,c))) throw new Error('nonfinite vertex');
    for(let i=0;i<indices.count;i+=3) {
      const a=[0,1,2].map(c=>positions.get(indices.get(i),c));
      const b=[0,1,2].map(c=>positions.get(indices.get(i+1),c)-a[c]);
      const c=[0,1,2].map(c=>positions.get(indices.get(i+2),c)-a[c]);
      const area=Math.hypot(b[1]*c[2]-b[2]*c[1],b[2]*c[0]-b[0]*c[2],b[0]*c[1]-b[1]*c[0])/2;
      if(area<1e-12) throw new Error('degenerate triangle');
      triangles++;
    }
  }
  return {gltf,triangles,vertices};
}
