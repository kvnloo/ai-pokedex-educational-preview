import * as THREE from 'three';

export type PresentationMode = 'starter' | 'explore' | 'battle';

export interface LumenWorldOptions {
  useMedium: boolean;
  grassPathHalf: number;
}

export interface LumenWorldPresentation {
  root: THREE.Group;
  battleArena: THREE.Group;
  healGlow: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  gymOrb: THREE.Mesh;
  eliteOrb: THREE.Mesh;
  grassBlades: THREE.Mesh[];
  grassBaseRot: number[];
  setMode: (mode: PresentationMode) => void;
  tick: (time: number, dt: number, mode: PresentationMode) => void;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setShadow(root: THREE.Object3D, cast = true, receive = true): void {
  root.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      object.castShadow = cast;
      object.receiveShadow = receive;
    }
  });
}

function radialTexture(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,.72)');
  gradient.addColorStop(0.72, 'rgba(255,255,255,.13)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function cloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const puffs = [
    [62, 76, 43],
    [106, 55, 54],
    [156, 66, 48],
    [194, 82, 35],
    [126, 86, 66],
  ] as const;
  for (const [x, y, r] of puffs) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(255,238,224,.72)');
    gradient.addColorStop(0.55, 'rgba(240,207,210,.38)');
    gradient.addColorStop(1, 'rgba(225,190,204,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function pathGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const left: Array<[number, number]> = [
    [-1.55, 10.5],
    [-1.32, 7.2],
    [-1.05, 3.9],
    [-0.97, -3.9],
    [-1.32, -7.2],
    [-2.75, -12.8],
  ];
  const right: Array<[number, number]> = [
    [1.55, 10.5],
    [1.32, 7.2],
    [1.05, 3.9],
    [0.97, -3.9],
    [0.35, -7.2],
    [-1.05, -12.8],
  ];
  const [firstX, firstZ] = left[0]!;
  shape.moveTo(firstX, -firstZ);
  for (const [x, z] of left.slice(1)) shape.lineTo(x, -z);
  for (const [x, z] of [...right].reverse()) shape.lineTo(x, -z);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 12);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function makeRock(
  rng: () => number,
  material: THREE.Material,
  position: THREE.Vector3,
  scale: THREE.Vector3,
): THREE.Mesh {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 1), material);
  rock.position.copy(position);
  rock.scale.copy(scale);
  rock.rotation.set((rng() - 0.5) * 0.24, rng() * Math.PI, (rng() - 0.5) * 0.2);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function addTree(
  parent: THREE.Object3D,
  rng: () => number,
  x: number,
  z: number,
  scale: number,
  tint: number,
  useMedium: boolean,
): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.rotation.y = rng() * Math.PI * 2;
  const bark = new THREE.MeshStandardMaterial({
    color: 0x584438,
    roughness: 0.96,
    metalness: 0,
  });
  const leaves = new THREE.MeshStandardMaterial({
    color: tint,
    roughness: 0.82,
    metalness: 0,
    emissive: tint,
    emissiveIntensity: 0.025,
  });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.34, 2.5, useMedium ? 7 : 10), bark);
  trunk.position.y = 1.18;
  trunk.rotation.z = (rng() - 0.5) * 0.09;
  tree.add(trunk);
  for (let i = 0; i < 3; i++) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 1.05, 7), bark);
    branch.position.set((i - 1) * 0.12, 1.82 + i * 0.16, 0);
    branch.rotation.z = (i - 1) * 0.62;
    tree.add(branch);
  }
  const canopyOffsets: Array<[number, number, number, number]> = [
    [-0.62, 2.3, 0.08, 0.9],
    [0.05, 2.72, -0.12, 1.15],
    [0.7, 2.32, 0.02, 0.92],
    [0.12, 2.12, 0.38, 0.82],
  ];
  for (const [cx, cy, cz, cs] of canopyOffsets) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.82, useMedium ? 1 : 2), leaves);
    crown.position.set(cx, cy, cz);
    crown.scale.set(1.15 * cs, 0.88 * cs, cs);
    crown.rotation.y = rng() * Math.PI;
    tree.add(crown);
  }
  tree.scale.setScalar(scale);
  setShadow(tree, !useMedium, true);
  parent.add(tree);
  return tree;
}

function addHouse(parent: THREE.Object3D, useMedium: boolean): void {
  const house = new THREE.Group();
  house.name = 'moonwell-lodge';
  house.position.set(5.25, 0, 5.78);
  const stone = new THREE.MeshStandardMaterial({ color: 0x819198, roughness: 0.9, metalness: 0.02 });
  const plaster = new THREE.MeshStandardMaterial({ color: 0xd6c6ae, roughness: 0.84, metalness: 0 });
  const timber = new THREE.MeshStandardMaterial({ color: 0x58413b, roughness: 0.9, metalness: 0 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8e4f46, roughness: 0.72, metalness: 0.02 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd58d, transparent: true, opacity: 0.86 });

  const footing = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.28, 1.02), stone);
  footing.position.y = 0.14;
  house.add(footing);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.92, 0.94), plaster);
  body.position.y = 0.72;
  house.add(body);
  for (const sx of [-0.51, 0.51]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.98, 0.98), timber);
    beam.position.set(sx, 0.73, 0);
    house.add(beam);
  }
  const cross = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.99), timber);
  cross.position.y = 0.75;
  house.add(cross);
  const roofA = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.1, 0.78), roofMat);
  roofA.position.set(0, 1.32, -0.34);
  roofA.rotation.x = 0.62;
  house.add(roofA);
  const roofB = roofA.clone();
  roofB.position.z = 0.34;
  roofB.rotation.x = -0.62;
  house.add(roofB);

  const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.035), timber);
  windowFrame.position.set(0, 0.83, -0.49);
  house.add(windowFrame);
  const windowGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.3), glowMat);
  windowGlow.position.set(0, 0.83, -0.512);
  windowGlow.rotation.y = Math.PI;
  house.add(windowGlow);
  const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34, 0.028), timber);
  mullionV.position.set(0, 0.83, -0.53);
  house.add(mullionV);
  const mullionH = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.028), timber);
  mullionH.position.set(0, 0.83, -0.53);
  house.add(mullionH);

  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.64, 0.22), stone);
  chimney.position.set(0.38, 1.6, 0.12);
  house.add(chimney);
  const windowLight = new THREE.PointLight(0xffb85c, useMedium ? 0.9 : 1.35, 5.5, 2);
  windowLight.position.set(0, 0.95, -0.7);
  house.add(windowLight);
  setShadow(house, !useMedium, true);
  parent.add(house);
}

function addLanternStake(
  parent: THREE.Object3D,
  x: number,
  z: number,
  color: number,
  emissive: number,
  height: number,
  useMedium: boolean,
): { root: THREE.Group; orb: THREE.Mesh } {
  const root = new THREE.Group();
  root.position.set(x, 0, z);
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x303b3f, roughness: 0.72, metalness: 0.18 });
  const metal = new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.34,
    roughness: 0.38,
    metalness: 0.54,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.48, 0.28, 10), darkStone);
  base.position.y = 0.14;
  root.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, height, 10), metal);
  post.position.y = 0.28 + height / 2;
  root.add(post);
  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 18), metal);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.65 + i * 0.42;
    root.add(band);
  }
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.12), darkStone);
  arm.position.set(0.22, height + 0.25, 0);
  root.add(arm);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 6, 18, Math.PI), metal);
  hook.position.set(0.59, height + 0.06, 0);
  hook.rotation.z = Math.PI;
  root.add(hook);
  const cage = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 1), metal);
  cage.position.set(0.59, height - 0.22, 0);
  root.add(cage);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, useMedium ? 10 : 18, useMedium ? 8 : 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.94 }),
  );
  orb.position.set(0.59, height - 0.22, 0);
  root.add(orb);
  const light = new THREE.PointLight(color, useMedium ? 1.1 : 1.75, 5, 1.8);
  light.position.copy(orb.position);
  root.add(light);
  setShadow(root, !useMedium, true);
  parent.add(root);
  return { root, orb };
}

function addDistantTower(parent: THREE.Object3D, useMedium: boolean): void {
  const tower = new THREE.Group();
  tower.name = 'hollow-observatory';
  tower.position.set(-1.7, 0.1, -17.5);
  const stone = new THREE.MeshStandardMaterial({ color: 0x526071, roughness: 0.92, metalness: 0.02 });
  const copper = new THREE.MeshStandardMaterial({
    color: 0x8b6559,
    roughness: 0.56,
    metalness: 0.34,
    emissive: 0x351a13,
    emissiveIntensity: 0.12,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.65, 4.1, useMedium ? 8 : 14), stone);
  base.position.y = 2.05;
  tower.add(base);
  const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.72, 0.18, 18), copper);
  balcony.position.y = 3.48;
  tower.add(balcony);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.35, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), copper);
  dome.position.y = 4.12;
  tower.add(dome);
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.8, 8), copper);
  needle.position.y = 5.75;
  tower.add(needle);
  for (const x of [-0.48, 0, 0.48]) {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.5),
      new THREE.MeshBasicMaterial({ color: 0xffc66d, transparent: true, opacity: 0.88 }),
    );
    window.position.set(x, 2.6, 1.26);
    tower.add(window);
  }
  setShadow(tower, !useMedium, true);
  parent.add(tower);
}

export function addCeremonyArchitecture(stage: THREE.Group, useMedium: boolean): void {
  const stone = new THREE.MeshStandardMaterial({ color: 0x253b3d, roughness: 0.8, metalness: 0.08 });
  const stoneEdge = new THREE.MeshStandardMaterial({ color: 0x536d68, roughness: 0.7, metalness: 0.12 });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd6b46e,
    emissive: 0x5f391d,
    emissiveIntensity: 0.34,
    roughness: 0.42,
    metalness: 0.54,
  });
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.08, 4.46, 0.22, 72), stone);
  platform.position.set(0, 0.07, 0.54);
  platform.receiveShadow = true;
  stage.add(platform);
  const platformEdge = new THREE.Mesh(new THREE.TorusGeometry(4.08, 0.045, 10, 96), gold);
  platformEdge.rotation.x = Math.PI / 2;
  platformEdge.position.set(0, 0.19, 0.54);
  stage.add(platformEdge);
  for (let i = 0; i < 3; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.65 + i * 0.55, 0.09, 0.34), stoneEdge);
    step.position.set(0, 0.035 + i * 0.035, 3.08 - i * 0.28);
    stage.add(step);
  }
  for (const x of [-3.55, 3.55]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.28, 2.65, 10), stoneEdge);
    pillar.position.set(x, 1.32, -0.18);
    stage.add(pillar);
    const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), gold);
    cap.position.set(x, 2.72, -0.18);
    stage.add(cap);
    const lamp = new THREE.PointLight(0xffc27d, useMedium ? 1.1 : 1.6, 6, 2);
    lamp.position.set(x, 2.65, 0.24);
    stage.add(lamp);
  }
  const backCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.52, 2.72, -0.18),
    new THREE.Vector3(-1.85, 3.72, -0.38),
    new THREE.Vector3(0, 4.02, -0.46),
    new THREE.Vector3(1.85, 3.72, -0.38),
    new THREE.Vector3(3.52, 2.72, -0.18),
  ]);
  const crown = new THREE.Mesh(new THREE.TubeGeometry(backCurve, 56, 0.055, 8, false), gold);
  stage.add(crown);
  for (const x of [-2.15, 0, 2.15]) {
    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.78, 4.3, 28, 1, true),
      new THREE.MeshBasicMaterial({
        color: x < -1 ? 0xff9368 : x > 1 ? 0x91d78c : 0x72c9ff,
        transparent: true,
        opacity: 0.055,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    beam.position.set(x, 2.35, 0.42);
    stage.add(beam);
  }
  setShadow(stage, !useMedium, true);
}

export function createLumenWorld(
  scene: THREE.Scene,
  options: LumenWorldOptions,
): LumenWorldPresentation {
  const { useMedium, grassPathHalf } = options;
  const rng = mulberry32(0x7a11e7);
  const root = new THREE.Group();
  root.name = 'lumen-hollow-world';
  scene.add(root);

  scene.background = new THREE.Color(0x6f84aa);
  scene.fog = new THREE.FogExp2(0x8aa0af, useMedium ? 0.022 : 0.018);

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(66, useMedium ? 24 : 48, useMedium ? 12 : 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new THREE.Color(0x253c68) },
        upper: { value: new THREE.Color(0x566f9d) },
        horizon: { value: new THREE.Color(0xd79a82) },
        nadir: { value: new THREE.Color(0xf0c092) },
        sunColor: { value: new THREE.Color(0xffe5ad) },
        sunDir: { value: new THREE.Vector3(-0.42, 0.16, -0.9).normalize() },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 zenith;
        uniform vec3 upper;
        uniform vec3 horizon;
        uniform vec3 nadir;
        uniform vec3 sunColor;
        uniform vec3 sunDir;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
          vec3 col = mix(nadir, horizon, smoothstep(0.0, 0.42, h));
          col = mix(col, upper, smoothstep(0.38, 0.72, h));
          col = mix(col, zenith, smoothstep(0.68, 1.0, h));
          float sun = pow(max(dot(normalize(vDir), sunDir), 0.0), 180.0);
          float haze = pow(max(dot(normalize(vDir), sunDir), 0.0), 14.0) * 0.32;
          col += sunColor * (sun * 2.1 + haze);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  );
  skyDome.renderOrder = -100;
  root.add(skyDome);

  const cloudMap = cloudTexture();
  const clouds: THREE.Sprite[] = [];
  const cloudPositions: Array<[number, number, number, number]> = [
    [-15, 10.5, -30, 12],
    [2, 13, -38, 16],
    [18, 9.2, -29, 10],
    [-26, 7.8, -12, 9],
    [28, 12.4, -18, 13],
    [7, 8.4, 26, 11],
  ];
  for (const [x, y, z, size] of cloudPositions) {
    const cloud = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cloudMap,
        color: 0xffdfd7,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
        fog: false,
      }),
    );
    cloud.position.set(x, y, z);
    cloud.scale.set(size * 1.9, size, 1);
    root.add(cloud);
    clouds.push(cloud);
  }

  const sun = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture(),
      color: 0xffd79c,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  sun.position.set(-18, 8.2, -36);
  sun.scale.set(10, 10, 1);
  root.add(sun);

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x466b51,
    roughness: 0.98,
    metalness: 0,
    emissive: 0x14271c,
    emissiveIntensity: 0.08,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(18.5, useMedium ? 64 : 128), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  root.add(ground);

  const terraceMats = [0x3a5e48, 0x52775a, 0x365344].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.96, metalness: 0 }),
  );
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.8 + i * 2.5, 5.08 + i * 2.5, useMedium ? 48 : 96),
      terraceMats[i % terraceMats.length]!,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.006 + i * 0.004;
    ring.scale.z = 0.82 + i * 0.035;
    ring.receiveShadow = true;
    root.add(ring);
  }

  const path = new THREE.Mesh(
    pathGeometry(),
    new THREE.MeshStandardMaterial({
      color: 0xc8ab7b,
      roughness: 0.94,
      metalness: 0,
      emissive: 0x483824,
      emissiveIntensity: 0.055,
    }),
  );
  path.position.y = 0.026;
  path.receiveShadow = true;
  root.add(path);

  const borderMat = new THREE.MeshStandardMaterial({ color: 0x8b755b, roughness: 0.92, metalness: 0.01 });
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.5, 0.055, 10),
    new THREE.Vector3(-1.18, 0.055, 3.5),
    new THREE.Vector3(-1.05, 0.055, -3.8),
    new THREE.Vector3(-1.4, 0.055, -7.2),
    new THREE.Vector3(-2.72, 0.055, -12.6),
  ]);
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.5, 0.055, 10),
    new THREE.Vector3(1.18, 0.055, 3.5),
    new THREE.Vector3(1.05, 0.055, -3.8),
    new THREE.Vector3(0.35, 0.055, -7.2),
    new THREE.Vector3(-1.02, 0.055, -12.6),
  ]);
  for (const curve of [leftCurve, rightCurve]) {
    const edge = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.045, 6, false), borderMat);
    edge.receiveShadow = true;
    root.add(edge);
  }

  const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa89475, roughness: 0.98, metalness: 0 });
  for (let i = 0; i < (useMedium ? 22 : 42); i++) {
    const z = -10 + rng() * 19;
    const taper = 1.1 + Math.abs(z) * 0.025;
    const side = rng() < 0.5 ? -1 : 1;
    const pebble = makeRock(
      rng,
      pebbleMat,
      new THREE.Vector3(side * (taper + rng() * 0.42), 0.055, z),
      new THREE.Vector3(0.13 + rng() * 0.18, 0.08 + rng() * 0.09, 0.16 + rng() * 0.2),
    );
    pebble.castShadow = false;
    root.add(pebble);
  }

  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x344c48, roughness: 0.92, metalness: 0 });
  const farRidgeMat = new THREE.MeshStandardMaterial({ color: 0x53666d, roughness: 0.98, metalness: 0 });
  for (let i = 0; i < 11; i++) {
    const angle = (i / 11) * Math.PI * 2 + 0.18;
    const radius = 13.2 + (i % 3) * 1.4;
    const ridge = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 + (i % 4) * 0.32, 1), i % 3 === 0 ? farRidgeMat : ridgeMat);
    ridge.position.set(Math.cos(angle) * radius, 0.18 + (i % 2) * 0.12, Math.sin(angle) * radius);
    ridge.scale.set(2.3 + rng(), 0.65 + rng() * 0.25, 1.35 + rng() * 0.7);
    ridge.rotation.y = rng() * Math.PI;
    ridge.castShadow = !useMedium;
    ridge.receiveShadow = true;
    root.add(ridge);
  }

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x596a68, roughness: 0.86, metalness: 0.03 });
  const warmRockMat = new THREE.MeshStandardMaterial({ color: 0x76645b, roughness: 0.88, metalness: 0.02 });
  const heroRocks: Array<[number, number, number, number, number, number]> = [
    [-9.8, -5.6, 1.1, 2.6, 1.05, 1.1],
    [9.2, -7.8, 1.0, 3.5, 1.25, 1.35],
    [7.4, 8.4, 0.62, 1.35, 0.7, 0.92],
    [-8.2, 7.3, 0.72, 1.8, 0.82, 1.05],
  ];
  for (const [x, z, y, sx, sy, sz] of heroRocks) {
    root.add(makeRock(rng, z < 0 ? rockMat : warmRockMat, new THREE.Vector3(x, y * 0.5, z), new THREE.Vector3(sx, sy, sz)));
  }

  const treeSpecs: Array<[number, number, number, number]> = [
    [-8.6, -2.6, 1.05, 0x25483d],
    [-10.1, 2.2, 1.15, 0x345344],
    [-7.8, 7.6, 0.92, 0x3b5b44],
    [8.9, -2.8, 1.15, 0x2c5140],
    [10.2, 2.2, 1.0, 0x3d5d46],
    [7.7, 8.2, 0.88, 0x456448],
    [-5.2, -9.8, 0.8, 0x2a4a3d],
    [5.1, -10.4, 0.92, 0x314e42],
  ];
  for (const [x, z, scale, tint] of treeSpecs) addTree(root, rng, x, z, scale, tint, useMedium);

  addHouse(root, useMedium);
  const wellGroup = new THREE.Group();
  wellGroup.position.set(4.5, 0, 4.5);
  const wellStone = new THREE.MeshStandardMaterial({ color: 0x789093, roughness: 0.8, metalness: 0.06 });
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(1.28, 1.42, 0.16, 48),
    wellStone,
  );
  pool.position.y = 0.08;
  wellGroup.add(pool);
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(1.16, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0x8bd7dd,
      emissive: 0x267f94,
      emissiveIntensity: 0.42,
      roughness: 0.14,
      metalness: 0.12,
      transmission: useMedium ? 0 : 0.2,
      transparent: true,
      opacity: 0.92,
      depthWrite: true,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.175;
  wellGroup.add(water);
  const healGlow = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.52, 48),
    new THREE.MeshBasicMaterial({
      color: 0xb8f3ff,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  healGlow.rotation.x = -Math.PI / 2;
  healGlow.position.y = 0.19;
  wellGroup.add(healGlow);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.22, 0.3), wellStone);
    block.position.set(Math.cos(a) * 1.37, 0.23, Math.sin(a) * 1.37);
    block.rotation.y = -a;
    wellGroup.add(block);
  }
  const wellLight = new THREE.PointLight(0x7fd9ff, useMedium ? 1.1 : 1.7, 6, 2);
  wellLight.position.y = 0.85;
  wellGroup.add(wellLight);
  setShadow(wellGroup, !useMedium, true);
  root.add(wellGroup);

  const gym = addLanternStake(root, -5.75, 3.15, 0xffd16f, 0x8c581c, 1.72, useMedium);
  const elite = addLanternStake(root, -6.25, 0.25, 0xb69cff, 0x4d2c88, 1.92, useMedium);
  const gymOrb = gym.orb;
  const eliteOrb = elite.orb;

  addDistantTower(root, useMedium);

  const underMat = new THREE.MeshStandardMaterial({
    color: 0x1b3528,
    roughness: 0.98,
    metalness: 0,
    emissive: 0x08160e,
    emissiveIntensity: 0.08,
  });
  for (const side of [-1, 1] as const) {
    const undergrowth = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 5.2), underMat);
    undergrowth.rotation.x = -Math.PI / 2;
    undergrowth.position.set(side * (grassPathHalf + 0.9), 0.035, -1.2);
    undergrowth.receiveShadow = true;
    root.add(undergrowth);
  }

  const grassColors = [0x2f7144, 0x3c8650, 0x235b38, 0x4a9658, 0x326d45, 0x568b57];
  const grassMats = grassColors.map(
    (color) => new THREE.MeshStandardMaterial({
      color,
      roughness: 0.86,
      metalness: 0,
      emissive: color,
      emissiveIntensity: 0.035,
    }),
  );
  const grassBlades: THREE.Mesh[] = [];
  const grassBaseRot: number[] = [];
  const count = useMedium ? 120 : 240;
  const bladeGeos = [
    new THREE.ConeGeometry(0.065, 0.95, useMedium ? 3 : 5),
    new THREE.ConeGeometry(0.052, 1.25, useMedium ? 3 : 4),
  ];
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 20) {
    attempts++;
    const x = (rng() * 2 - 1) * 2.58;
    const z = -1.2 + (rng() * 2 - 1) * 2.5;
    if (Math.abs(x) < grassPathHalf) continue;
    const cluster = 1 + Math.floor(rng() * 3);
    for (let j = 0; j < cluster && placed < count; j++) {
      const px = x + (j - (cluster - 1) / 2) * 0.11 + (rng() - 0.5) * 0.08;
      if (Math.abs(px) < grassPathHalf) continue;
      const tall = rng() > 0.58;
      const blade = new THREE.Mesh(bladeGeos[tall ? 1 : 0], grassMats[placed % grassMats.length]);
      const scaleY = 0.82 + rng() * 0.55;
      blade.position.set(px, (tall ? 0.57 : 0.43) * scaleY, z + (rng() - 0.5) * 0.14);
      blade.scale.set(0.78 + rng() * 0.42, scaleY, 0.76 + rng() * 0.38);
      blade.rotation.set((rng() - 0.5) * 0.2, rng() * Math.PI, (rng() - 0.5) * 0.34);
      blade.castShadow = !useMedium && placed % 9 === 0;
      blade.receiveShadow = !useMedium;
      grassBaseRot.push(blade.rotation.z);
      grassBlades.push(blade);
      root.add(blade);
      placed++;
    }
  }

  const flowerMats = [0xffc978, 0xaed9ff, 0xe7b3ff].map(
    (color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.82, side: THREE.DoubleSide }),
  );
  for (let i = 0; i < (useMedium ? 16 : 34); i++) {
    const flower = new THREE.Mesh(new THREE.CircleGeometry(0.045 + rng() * 0.035, 6), flowerMats[i % flowerMats.length]);
    const side = rng() < 0.5 ? -1 : 1;
    flower.position.set(side * (1.15 + rng() * 5.5), 0.08 + rng() * 0.16, -8 + rng() * 16);
    flower.rotation.set(-Math.PI / 2 + (rng() - 0.5) * 0.3, 0, rng() * Math.PI);
    root.add(flower);
  }

  const motesGeometry = new THREE.BufferGeometry();
  const moteCount = useMedium ? 32 : 72;
  const motePositions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    motePositions[i * 3] = (rng() * 2 - 1) * 10;
    motePositions[i * 3 + 1] = 0.35 + rng() * 3.3;
    motePositions[i * 3 + 2] = -10 + rng() * 20;
  }
  motesGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const motes = new THREE.Points(
    motesGeometry,
    new THREE.PointsMaterial({
      color: 0xffdb91,
      size: useMedium ? 0.075 : 0.095,
      transparent: true,
      opacity: 0.65,
      alphaMap: radialTexture(64),
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  root.add(motes);

  const battleArena = new THREE.Group();
  battleArena.name = 'battle-clearing';
  battleArena.visible = false;
  const arenaMat = new THREE.MeshStandardMaterial({
    color: 0x263f38,
    roughness: 0.78,
    metalness: 0.06,
    emissive: 0x102e27,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.96,
  });
  const arena = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.55, 0.14, 72), arenaMat);
  arena.position.set(0, 0.05, 0.25);
  arena.receiveShadow = true;
  battleArena.add(arena);
  const arenaRingMat = new THREE.MeshBasicMaterial({
    color: 0x8dd9c2,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const arenaRing = new THREE.Mesh(new THREE.TorusGeometry(3.72, 0.04, 8, 96), arenaRingMat);
  arenaRing.rotation.x = Math.PI / 2;
  arenaRing.position.set(0, 0.15, 0.25);
  battleArena.add(arenaRing);
  for (const z of [-0.72, 1.35]) {
    const sigil = new THREE.Mesh(new THREE.RingGeometry(0.66, 0.76, 48), arenaRingMat.clone());
    sigil.rotation.x = -Math.PI / 2;
    sigil.position.set(z < 0 ? -1.58 : 1.77, 0.155, z);
    battleArena.add(sigil);
  }
  const battleLight = new THREE.PointLight(0x7bd4c8, useMedium ? 0.65 : 1.05, 9, 2);
  battleLight.position.set(0, 2.8, 0.3);
  battleArena.add(battleLight);
  root.add(battleArena);

  let currentMode: PresentationMode = 'starter';
  const setMode = (mode: PresentationMode): void => {
    currentMode = mode;
    battleArena.visible = mode === 'battle';
  };
  setMode('starter');

  const tick = (time: number, _dt: number, mode: PresentationMode): void => {
    if (mode !== currentMode) setMode(mode);
    healGlow.material.opacity = 0.37 + Math.sin(time * 2.35) * 0.11;
    water.position.y = 0.176 + Math.sin(time * 1.55) * 0.008;
    gymOrb.position.y = 1.5 + Math.sin(time * 2.05) * 0.055;
    eliteOrb.position.y = 1.7 + Math.sin(time * 1.72 + 1.1) * 0.065;
    motes.rotation.y = Math.sin(time * 0.08) * 0.12;
    (motes.material as THREE.PointsMaterial).opacity = 0.52 + Math.sin(time * 0.65) * 0.13;
    for (let i = 0; i < clouds.length; i++) {
      clouds[i]!.position.x += Math.sin(time * 0.035 + i * 1.9) * 0.0015;
    }
    if (battleArena.visible) {
      arenaRing.rotation.z = time * 0.055;
      arenaRingMat.opacity = 0.31 + Math.sin(time * 2.1) * 0.08;
      battleLight.intensity = (useMedium ? 0.65 : 1.05) + Math.sin(time * 1.5) * 0.12;
    }
  };

  return {
    root,
    battleArena,
    healGlow,
    gymOrb,
    eliteOrb,
    grassBlades,
    grassBaseRot,
    setMode,
    tick,
  };
}
