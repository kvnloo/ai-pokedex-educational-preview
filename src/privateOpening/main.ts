import * as THREE from 'three';
import { loadOpeningCharacters } from './assets.ts';
import { advanceJourney, meetPartner, OPENING_SAVE_KEY, PIKACHU_MEETING, restoreJourney, newJourney, SOLIDS } from './journey.ts';
import './style.css';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const canvas = $('opening') as HTMLCanvasElement;
document.body.dataset.ready = 'false';

async function boot(): Promise<void> {
  // Startup is atomic: no scene, stand-in, or partial character set is playable.
  const { ash, pikachu, reviewOnly } = await loadOpeningCharacters();
  let saved: string | null = null;
  try { saved = localStorage.getItem(OPENING_SAVE_KEY); } catch { /* storage may be disabled */ }
  let journey = restoreJourney(saved);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#a5d7e8'); scene.fog = new THREE.Fog('#a5d7e8', 24, 60);
  const camera = new THREE.PerspectiveCamera(40, 1, .03, 120);
  const sun = new THREE.DirectionalLight('#fff3d9', 3.0); sun.position.set(-9, 18, 8); sun.castShadow = true;
  sun.shadow.bias=-.00015; sun.shadow.normalBias=.035;
  const fill=new THREE.DirectionalLight('#fff4dc',1.8); fill.position.set(1,6,-8);scene.add(fill);
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -20; sun.shadow.camera.right = 20; sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -30;
  scene.add(sun, new THREE.HemisphereLight('#d9f1ff', '#6b8150', 2));
  const palette = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (color: string) => {
    if (!palette.has(color)) palette.set(color, new THREE.MeshStandardMaterial({ color, roughness: .88 }));
    return palette.get(color)!;
  };
  function block(name: string, pos: number[], size: number[], color: string): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size as [number,number,number]), mat(color));
    mesh.name = name; mesh.position.set(...pos as [number,number,number]); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
  }
  block('Pallet and Route 1 terrain', [0,-.16,-9], [23,.3,40], '#77a654');
  block('northbound path', [0,.005,-9], [2.9,.03,37], '#d8c996');
  block('laboratory walkway', [2,.016,0], [4,.035,1.3], '#d8c996');
  function sign(label: string, x: number, z: number) {
    const textureCanvas = document.createElement('canvas'); textureCanvas.width = 512; textureCanvas.height = 128;
    const ctx = textureCanvas.getContext('2d')!; ctx.fillStyle = '#fbf2d0'; ctx.fillRect(0,0,512,128); ctx.fillStyle = '#365444'; ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label,256,78);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.7,.42,.09),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(textureCanvas)}));
    board.position.set(x,1.15,z); board.rotation.y=Math.PI;  scene.add(board); block('sign post',[x,.56,z],[.10,1.1,.10],'#7c6648');
  }
  for (const [index, house] of SOLIDS.entries()) {
    block(index === 2 ? 'Professor Oak laboratory' : index === 0 ? 'Ash home' : 'Pallet home', [house.x,1.05,house.z], [house.halfX*2,2.1,house.halfZ*2], '#f7e9c9');
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0,1,1.2,4),mat(index === 2 ? '#596f9a' : '#af5048'));
    roof.scale.set(house.halfX*1.53,1,house.halfZ*1.53); roof.rotation.y = Math.PI/4; roof.position.set(house.x,2.7,house.z); roof.castShadow = true; scene.add(roof);
    block('front door',[house.x,.66,house.z+house.halfZ+.025],[.60,1.30,.055],'#69583d');
    for (const side of [-1,1]) block('window',[house.x+side*1.04,1.25,house.z+house.halfZ+.033],[.64,.66,.07],'#89b8c6');
  }
  // Small authored details give the town a legible lived-in scale.
  for(const house of SOLIDS) {
    block('foundation',[house.x,.13,house.z],[house.halfX*2+.15,.26,house.halfZ*2+.15],'#b9b5a0');
    block('door step',[house.x,.075,house.z+house.halfZ+.3],[.85,.15,.52],'#c7bb97');
    block('chimney',[house.x-.9,2.8,house.z-.5],[.38,1.1,.42],'#b08872');
    for(const side of [-1,1]) {
      const x=house.x+side*1.04,z=house.z+house.halfZ+.08;
      block('window sill',[x,.91,z],[.78,.08,.17],'#f3efe1');
      block('window mullion',[x,1.25,z],[.045,.66,.08],'#f3efe1');
      block('window crossbar',[x,1.25,z],[.64,.045,.08],'#f3efe1');
      block('flower box',[x,.83,z],[.70,.16,.22],'#765a41');
      for(let j=0;j<4;j++) {
        const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.075,1),mat(j%2?'#f8cd60':'#de7e96'));
        flower.position.set(x-.25+j*.16,.98,z+.02);scene.add(flower);
      }
    }
  }
  for(let i=0;i<140;i++) {
    const x=Math.sin(i*41.7)*7.5,z=Math.cos(i*13.4)*6;
    if(Math.abs(x)<2 || SOLIDS.some(h=>Math.abs(x-h.x)<h.halfX+.4&&Math.abs(z-h.z)<h.halfZ+.5))continue;
    const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(.035,0),mat(i%3?'#f7e6a7':'#ece3f8'));
    flower.position.set(x,.10,z);scene.add(flower);
  }
  sign('OAK POKÉMON LAB',3.05,-1.15); sign('PALLET TOWN',-2.8,5.6); sign('ROUTE 1  ↑',2.8,-8.3);
  for (let x=-7; x<=7; x+=.65) if (Math.abs(x)>1.7) {
    block('north fence post',[x,.4,-8],[.13,.8,.13],'#e8dfbd');
    block('north fence rail',[x,.45,-8],[.67,.12,.09],'#e8dfbd');
  }
  function tree(x: number,z: number,scale: number) {
    block('tree trunk',[x,.8*scale,z],[.28*scale,1.6*scale,.28*scale],'#74573d');
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.15,1),mat('#416f43'));
    mesh.position.set(x,2.0*scale,z); mesh.scale.set(scale,scale*1.24,scale); mesh.castShadow=true; scene.add(mesh);
  }
  for (let i=0;i<23;i++) { tree(-9,-27+i*1.7,.82+(i%3)*.12); tree(9,-27+i*1.7,.82+((i+1)%3)*.12); }
  for(let i=0;i<100;i++) {
    const side=i%2 ? -1:1, x=side*(2.25+(i%7)*.62), z=-10-Math.floor(i/7)*.94;
    block('Route 1 grass',[x,.10,z],[.12,.20,.12],i%3 ? '#54813e':'#659446');
  }
  scene.add(ash.root,pikachu.root);
  $('review-banner').hidden=!reviewOnly;
  document.body.dataset.ready='true'; document.body.dataset.assetProfile='private-local';
  const keys=new Set<string>(); let touchX=0,touchZ=0,actionTime=0,sparkTime=0; let portrait=new URLSearchParams(location.search).has('portrait');
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const effects=new THREE.Group(); scene.add(effects);
  const sparkMaterial=new THREE.MeshBasicMaterial({color:'#fff9a2'});
  for(let i=0;i<12;i++) { const ray=new THREE.Mesh(new THREE.SphereGeometry(.012,6,4),sparkMaterial); effects.add(ray); }
  function greet() {
    if(meetPartner(journey)) $('message').textContent='Pikachu joined you. Head north together to Route 1.';
    else $('message').textContent=journey.partner ? 'Pikachu is ready. Your first adventure awaits!' : 'Walk over to Pikachu outside the laboratory, then press E.';
    actionTime=1; save();
  }
  function spark() {
    if(!journey.partner || sparkTime>0) return;
    sparkTime=.7; $('message').textContent='Pikachu used Thundershock!';
  }
  function save() { try { localStorage.setItem(OPENING_SAVE_KEY,JSON.stringify(journey)); } catch { $('bond').textContent='Saving unavailable in this browser.'; } }
  $('camera').onclick=()=>{portrait=!portrait;};
  $('greet').onclick=greet; $('spark').onclick=spark;
  $('reset').onclick=()=>{ journey=newJourney(); save(); $('message').textContent='Meet Pikachu outside the laboratory.'; };
  window.addEventListener('keydown',event=>{
    if(event.target instanceof HTMLInputElement) return;
    const key=event.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' ','shift','e'].includes(key)) event.preventDefault();
    if(key==='c'&&!event.repeat) portrait=!portrait;
    keys.add(key); if(!event.repeat && key==='e') greet(); if(!event.repeat && key===' ') spark();
  });
  window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();touchX=touchZ=0;save();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden) {keys.clear();touchX=touchZ=0;save();}});
  window.addEventListener('pagehide',save);
  for(const button of document.querySelectorAll<HTMLButtonElement>('#touch button')) {
    button.onpointerdown=event=>{button.setPointerCapture(event.pointerId);touchX=Number(button.dataset.dx??0);touchZ=Number(button.dataset.dz??0);};
    button.onpointerup=button.onpointercancel=button.onlostpointercapture=()=>{touchX=touchZ=0;};
  }
  const query=new URLSearchParams(location.search);
  const inspect=query.get('inspect'); const view=query.get('view')??'front-three-quarter';
  const angles: Record<string,number>={'front':0,'front-three-quarter':-Math.PI/4,'side':Math.PI/2,'rear-three-quarter':-Math.PI*3/4,'rear':Math.PI,'gameplay-distance':Math.PI/4};
  if(inspect) document.body.dataset.inspect='true';
  if(inspect && (!['ash-ketchum-kanto','pikachu'].includes(inspect) || !(view in angles))) throw new Error('Unknown recognition view');
  const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}; resize();window.addEventListener('resize',resize);
  let previous=performance.now(),saveElapsed=0;
  function frame(now:number) {
    const dt=Math.min((now-previous)/1000,.05); previous=now;
    const oldCompanion={...journey.companion};
    const oldCompleted=journey.completed;
    const speed=inspect?0:advanceJourney(journey,Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+touchX,Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'))+touchZ,dt,keys.has('shift'));
    actionTime=Math.max(0,actionTime-dt);sparkTime=Math.max(0,sparkTime-dt);
    const companionSpeed=dt>0?Math.hypot(oldCompanion.x-journey.companion.x,oldCompanion.z-journey.companion.z)/dt:0;
    ash.setClip(actionTime>0?'greet':speed>.1?(speed>2.1?'run':'walk'):'idle');
    pikachu.setClip(sparkTime>0?'thundershock':actionTime>0?'greet':companionSpeed>.1?(companionSpeed>3?'run':'walk'):'idle');
    if(!reduceMotion || speed>.1 || actionTime>0 || sparkTime>0) {ash.mixer.update(dt);pikachu.mixer.update(dt);}
    ash.root.position.set(journey.player.x,0,journey.player.z); ash.root.rotation.y=journey.player.heading;
    pikachu.root.position.set(journey.companion.x,0,journey.companion.z); pikachu.root.rotation.y=journey.companion.heading;
    const target=new THREE.Vector3(journey.player.x,.65,journey.player.z);
    if(inspect) {
      const subject=inspect==='pikachu'?pikachu:ash, other=inspect==='pikachu'?ash:pikachu;
      subject.root.position.set(0,0,0);subject.root.rotation.y=0;other.root.visible=false;
      target.set(0,subject.metadata.heightMeters*.5,0);
      const distance=view==='gameplay-distance'?8:subject.metadata.heightMeters*3.0;
      camera.position.set(Math.sin(angles[view]!)*distance,target.y+distance*.10,-Math.cos(angles[view]!)*distance);camera.lookAt(target);
    } else {
      camera.position.lerp(new THREE.Vector3(target.x+(portrait?-2.4:2.8),portrait?2.2:4.4,target.z+(portrait?-5.2:6)),1-Math.exp(-dt*6));camera.lookAt(target);
    }
    effects.visible=sparkTime>0;
    if(effects.visible) {
      const socket=pikachu.sockets.get('cheek.R')!;socket.getWorldPosition(effects.position);
      effects.children.forEach((ray,i)=>{const t=(.7-sparkTime)*5;ray.position.set(Math.sin(i*2.4+t)*.17,Math.cos(i*1.3+t)*.12,Math.cos(i*2.4+t)*.17);});
    }
    const label=journey.location==='pallet-town'?'Pallet Town':'Route 1'; $('location').textContent=label;
    $('objective').textContent=journey.completed?'Your first steps together.':journey.partner?'Follow the path north to Route 1.':'Meet Pikachu outside the laboratory.';
    $('bond').textContent=journey.partner?'Traveling with Ash Ketchum':'Waiting outside the laboratory';
    $('greet').textContent=journey.partner?'Greet Pikachu':'Meet Pikachu';
    if(journey.completed&&!oldCompleted) {$('message').textContent='Route 1 reached — Ash and Pikachu’s journey has begun.'; save();}
    saveElapsed+=dt;if(saveElapsed>=2) {saveElapsed=0;save();}
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }
  camera.position.set(3.5,7.4,12.5);
  $('message').textContent=journey.partner?'Continue north with Pikachu.':'Pikachu is waiting beside the laboratory. Walk over and say hello.';
  if(query.has('verify') || inspect) Object.assign(window,{__opening:{snapshot:()=>({journey:structuredClone(journey),characters:[ash.metadata,pikachu.metadata],reviewOnly,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,meeting:PIKACHU_MEETING})}});
  requestAnimationFrame(frame);
}
(new URLSearchParams(location.search).has('slice') ? import('./arena.ts').then(m=>m.bootArena()) : boot()).catch(error=>{
  document.body.dataset.ready='false';$('blocked').hidden=false;$('block-detail').textContent=String(error instanceof Error?error.message:error);
  $('message').textContent='Private asset integrity verification failed.';
});
