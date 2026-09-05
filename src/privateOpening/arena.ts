import * as THREE from 'three';
import {loadOpeningCharacters,loadSpecies} from './assets.ts';
const $=(id:string)=>document.getElementById(id)!;
const IDS=['charizard','dragonite','mew','blaziken','giratina-altered','giratina-origin'];
export async function bootArena():Promise<void> {
  const query=new URLSearchParams(location.search),id=query.get('slice')!;
  if(!IDS.includes(id))throw new Error('Unknown encounter');
  const [creature,{ash,pikachu}]=await Promise.all([loadSpecies(id),loadOpeningCharacters()]);
  const ghost=id.startsWith('giratina'),fire=id==='charizard'||id==='blaziken',water=id==='dragonite';
  const renderer=new THREE.WebGLRenderer({canvas:$('opening'),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.background=new THREE.Color(ghost?'#251e43':water?'#a4e0e5':'#c3d6c6');scene.fog=new THREE.Fog(scene.background,22,65);
  const camera=new THREE.PerspectiveCamera(38,1,.03,140);
  const sun=new THREE.DirectionalLight(ghost?'#d5bfff':'#fff0cf',3);sun.position.set(-5,10,-7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.025;sun.shadow.bias=-.0001;sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;
  scene.add(sun,new THREE.HemisphereLight('#e1eeff',ghost?'#332548':'#607c65',2));
  const fill=new THREE.DirectionalLight('#c5e9ff',1.3);fill.position.set(6,5,2);scene.add(fill);
  function mesh(g:THREE.BufferGeometry,color:string,x:number,y:number,z:number) {
    const o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color,roughness:.82}));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;
  }
  mesh(new THREE.CylinderGeometry(11,12,.6,80),ghost?'#5c4c70':fire?'#b5a089':'#9bab79',0,-.32,0);
  mesh(new THREE.CylinderGeometry(4.4,4.4,.045,80),ghost?'#807a99':fire?'#d7c1a4':'#dce1b0',0,-.012,0);
  const rim=mesh(new THREE.TorusGeometry(4.4,.035,8,100),ghost?'#cab5ed':'#f2e5bd',0,.022,0);rim.rotation.x=Math.PI/2;
  if(water)mesh(new THREE.CircleGeometry(60,80),'#4999ad',0,-.7,0).rotation.x=-Math.PI/2;
  for(let i=0;i<22;i++) {
    const t=i/22*Math.PI*2,x=Math.cos(t)*((ghost?28:8)+(i%3)),z=Math.sin(t)*((ghost?28:8)+i%2);
    if(ghost) {
      const rock=mesh(new THREE.OctahedronGeometry(.5+i%3*.25),i%2?'#817096':'#504462',x,1+i%4,z);rock.rotation.z=i;rock.scale.y=2.5;
    }else if(fire) {
      const rock=mesh(new THREE.DodecahedronGeometry(.6+i%3*.3),i%2?'#807868':'#75675f',x,.2,z);rock.scale.y=.7+i%3*.4;
    }else {
      mesh(new THREE.CylinderGeometry(.12,.2,2.5,8),'#8b785c',x,1,z);
      const crown=mesh(new THREE.IcosahedronGeometry(1.4,1),water?'#759657':'#789963',x,2.8,z);crown.scale.y=1.3;
    }
  }
  const beacons=new THREE.Group();scene.add(beacons);
  const beaconPoints=[new THREE.Vector3(-3,.13,-2),new THREE.Vector3(3,.13,-2),new THREE.Vector3(0,.13,3)];
  const collected=new Set<number>();
  beaconPoints.forEach(p=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.06,8,32),new THREE.MeshStandardMaterial({color:'#ffda72',emissive:'#b27624',emissiveIntensity:.25}));ring.rotation.x=Math.PI/2;ring.position.copy(p);beacons.add(ring);});
  scene.add(creature.root,ash.root,pikachu.root);ash.root.position.set(-2.8,0,1.2);ash.root.rotation.y=.4;pikachu.root.position.set(-2,0,1.5);pikachu.root.rotation.y=.3;
  const effects=new THREE.Group();scene.add(effects);
  const actionColor=ghost?'#da61fa':fire?'#ff9e2e':water?'#8eeafa':'#e9a4ef';
  for(let i=0;i<44;i++) {
    const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,1),new THREE.MeshBasicMaterial({color:i%3?actionColor:'#fff4be',transparent:true,opacity:.85}));effects.add(orb);
  }
  let x=0,z=0,heading=0,action=0,elapsed=0,portrait=true,greet=0;const keys=new Set<string>();
  const stateKey=`private-opening:encounter:${id}:v1`;
  try{const save=JSON.parse(localStorage.getItem(stateKey)??'null');if(save?.completed===true)beaconPoints.forEach((_,i)=>collected.add(i));}catch{/* no saved encounter */}
  function special(){action=1.5;$('message').textContent=`${creature.metadata.name} · ${creature.metadata.action}`;}
  function reset(){x=z=heading=0;collected.clear();localStorage.removeItem(stateKey);$('message').textContent='Walk through the three golden rings, then try your signature move.';}
  $('spark').textContent=creature.metadata.action!;$('spark').onclick=special;
  $('greet').textContent='Greet';$('greet').onclick=()=>{greet=1.3;$('message').textContent=`${creature.metadata.name} responds to Ash and Pikachu.`;};
  $('camera').onclick=()=>{portrait=!portrait;};$('reset').onclick=reset;
  $('location').textContent=creature.metadata.location!;$('objective').textContent='Explore together · 0 / 3 rings';
  $('partner').innerHTML=`<span>ASH KETCHUM & PIKACHU</span><strong>${creature.metadata.name} <small>#${String(creature.metadata.nationalDexId).padStart(3,'0')}</small></strong><p>${creature.metadata.form==='standard'?'A new companion':creature.metadata.form.toUpperCase()+' FORME'}</p>`;
  $('message').textContent='Walk through the three golden rings, then try your signature move.';
  document.querySelector('footer span')!.textContent='WASD / arrows · Move creature   Shift · Run   Space · Signature move   C · Camera';
  $('review-banner').hidden=false;
  const inspect=query.get('view');if(inspect)document.body.dataset.inspect='true';
  window.addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys.add(k);if(!e.repeat&&k===' ')special();if(!e.repeat&&k==='c')portrait=!portrait;if(!e.repeat&&k==='e')$('greet').click();});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
  for(const button of document.querySelectorAll<HTMLButtonElement>('#touch button')) {const k=Number(button.dataset.dx)<0?'a':Number(button.dataset.dx)>0?'d':Number(button.dataset.dz)<0?'w':'s';button.onpointerdown=e=>{button.setPointerCapture(e.pointerId);keys.add(k);};button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>keys.delete(k);}
  const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();};resize();window.addEventListener('resize',resize);
  const h=creature.metadata.heightMeters;let previous=performance.now();
  function frame(now:number) {
    const dt=Math.min((now-previous)/1000,.05);previous=now;elapsed+=dt;action=Math.max(0,action-dt);greet=Math.max(0,greet-dt);
    let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
    const moving=Math.hypot(dx,dz)>0&&!inspect;
    if(moving){const length=Math.hypot(dx,dz),speed=keys.has('shift')?3:1.8;dx/=length;dz/=length;x=THREE.MathUtils.clamp(x+dx*dt*speed,-6,6);z=THREE.MathUtils.clamp(z+dz*dt*speed,-6,6);heading=Math.atan2(-dx,-dz);}
    creature.root.position.set(x,id==='mew'||id==='giratina-origin'?.25+Math.sin(elapsed*2)*.1:0,z);creature.root.rotation.y=heading;
    creature.setClip(action?'special':greet?'greet':moving?(keys.has('shift')?'run':'walk'):'idle');creature.mixer.update(dt);ash.mixer.update(dt);pikachu.mixer.update(dt);
    ash.setClip(greet?'greet':'idle');pikachu.setClip(greet?'greet':'idle');
    beacons.children.forEach((o,i)=>{o.visible=!collected.has(i);if(Math.hypot(x-o.position.x,z-o.position.z)<.65){collected.add(i);if(collected.size===3){localStorage.setItem(stateKey,JSON.stringify({completed:true}));$('message').textContent=`Exploration complete · ${creature.metadata.name} is at home with the team.`;}}});
    $('objective').textContent=`Explore together · ${collected.size} / 3 rings`;
    effects.visible=action>0;
    if(action){
      creature.root.updateMatrixWorld(true);
      const mouth=creature.sockets.get(id==='blaziken'?'kick':'mouth');
      if(mouth)mouth.getWorldPosition(effects.position);else effects.position.set(x,targetHeight(),z);
      effects.rotation.y=heading;
      effects.children.forEach((o,i)=>{
        const p=((elapsed*1.8+i/44)%1);
        if(ghost||id==='mew') {const t=i/44*Math.PI*2+elapsed*3,r=(id==='mew'?.3:h*.55)*(1+p);o.position.set(Math.cos(t)*r,Math.sin(t*2)*r*.4,Math.sin(t)*r);o.scale.setScalar(id==='mew'?.35:.6+p);}
        else if(id==='blaziken') {o.position.set(Math.cos(i+elapsed*6)*.22,Math.sin(i+elapsed*9)*.18,Math.cos(i*2+elapsed*6)*.22);o.scale.setScalar(.5+p);}
        else {o.position.set(Math.sin(i*2.4)*p*.4,Math.cos(i*1.8)*p*.28,-.1-p*2.8);o.scale.setScalar(.3+p*2);}
      });
    }
    function targetHeight(){return h*.6+(id==='mew'?.25:0);}
    const target=new THREE.Vector3(x,h*.5+(id==='mew'||id==='giratina-origin'?.25:0),z);
    if(inspect){ash.root.visible=pikachu.root.visible=false;const angles:Record<string,number>={front:0,'front-three-quarter':-.55,side:Math.PI/2,'rear-three-quarter':2.3,rear:Math.PI,'gameplay-distance':-.55};const angle=angles[inspect]??0;const d=inspect==='gameplay-distance'?Math.max(7,h*3.4):Math.max(h*3.2,1.7);camera.position.set(Math.sin(angle)*d,target.y+d*.12,-Math.cos(angle)*d);}
    else {const d=id==='mew'?2.6:Math.max(5.6,h*2.5);camera.position.set(x+(portrait?-d*.42:d*.45),id==='mew'?1.2:Math.max(2.6,h*1.2),z+(portrait?-d:d));}
    camera.lookAt(target);renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  document.body.dataset.ready='true';document.body.dataset.assetProfile='private-local';
  Object.assign(window,{__encounter:{snapshot:()=>({id,canonicalId:creature.metadata.canonicalId,form:creature.metadata.form,x,z,action,collected:[...collected],triangles:renderer.info.render.triangles,assetSha256:creature.metadata.sha256})}});
  requestAnimationFrame(frame);
}
