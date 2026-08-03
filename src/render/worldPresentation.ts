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

export type WorldDepthBand = 'near' | 'mid' | 'far';
export type GrassSilhouette = 'spear' | 'ribbon-left' | 'ribbon-right' | 'fan';

export interface RouteControlPoint {
  x: number;
  z: number;
  halfWidth: number;
}

export interface TerrainMassSpec {
  id: string;
  depthBand: WorldDepthBand;
  color: number;
  elevation: number;
  points: Array<{ x: number; z: number }>;
}

export interface GrassClusterSpec {
  id: string;
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
  count: number;
  seed: number;
  heightMin: number;
  heightMax: number;
  silhouettes: GrassSilhouette[];
}

export interface WorldRouteBlueprint {
  path: {
    safeHalfWidth: number;
    centerline: RouteControlPoint[];
  };
  terrainMasses: TerrainMassSpec[];
  grassClusters: GrassClusterSpec[];
  destination: {
    x: number;
    z: number;
    openingWidth: number;
    openingHeight: number;
    thresholdLight: 'warm-local';
  };
}

/**
 * Authored route data doubles as a deterministic QA surface. Keeping the scene
 * grammar declarative makes irregularity measurable without rendering pixels,
 * while all gameplay/collision coordinates remain owned by world/explore.ts.
 */
export const WORLD_ROUTE_BLUEPRINT: WorldRouteBlueprint = {
  path: {
    safeHalfWidth: 0.95,
    centerline: [
      { x: 0.02, z: 10.8, halfWidth: 1.76 },
      { x: -0.48, z: 7.75, halfWidth: 1.66 },
      { x: 0.58, z: 5.1, halfWidth: 1.6 },
      { x: -0.62, z: 2.25, halfWidth: 1.72 },
      { x: 0.7, z: -0.65, halfWidth: 1.76 },
      { x: -0.52, z: -3.75, halfWidth: 1.7 },
      { x: 0.62, z: -6.55, halfWidth: 1.56 },
      { x: -0.88, z: -9.35, halfWidth: 1.46 },
      { x: -1.08, z: -12.42, halfWidth: 1.72 },
    ],
  },
  terrainMasses: [
    {
      id: 'near-west-shadow-bank',
      depthBand: 'near',
      color: 0x345448,
      elevation: 0.004,
      points: [
        { x: -18.2, z: 13.8 }, { x: -7.1, z: 14.1 }, { x: -3.9, z: 10.4 },
        { x: -4.8, z: 6.2 }, { x: -7.8, z: 3.7 }, { x: -13.8, z: 4.2 },
        { x: -18.6, z: 7.1 }, { x: -19.1, z: 11.2 },
      ],
    },
    {
      id: 'near-east-moss-fan',
      depthBand: 'near',
      color: 0x3a5949,
      elevation: 0.006,
      points: [
        { x: 3.2, z: 13.9 }, { x: 17.8, z: 13.4 }, { x: 19.0, z: 7.3 },
        { x: 15.1, z: 2.2 }, { x: 9.3, z: 1.4 }, { x: 5.1, z: 5.0 },
        { x: 2.8, z: 9.2 },
      ],
    },
    {
      id: 'moonwell-lodge-shelf',
      depthBand: 'mid',
      color: 0x536e57,
      elevation: 0.012,
      points: [
        { x: 1.8, z: 8.7 }, { x: 5.1, z: 9.9 }, { x: 10.8, z: 8.6 },
        { x: 12.6, z: 5.4 }, { x: 10.7, z: 2.2 }, { x: 7.2, z: 0.8 },
        { x: 3.9, z: 2.0 }, { x: 2.0, z: 4.7 }, { x: 1.2, z: 6.5 },
      ],
    },
    {
      id: 'lantern-shoulder',
      depthBand: 'mid',
      color: 0x456451,
      elevation: 0.015,
      points: [
        { x: -11.4, z: 6.7 }, { x: -6.2, z: 7.8 }, { x: -2.2, z: 5.6 },
        { x: -2.8, z: 0.6 }, { x: -8.5, z: -0.8 }, { x: -12.2, z: 2.6 },
      ],
    },
    {
      id: 'whispergrass-west-fold',
      depthBand: 'mid',
      color: 0x3d5f4d,
      elevation: 0.019,
      points: [
        { x: -8.8, z: 2.5 }, { x: -4.1, z: 3.6 }, { x: -1.2, z: 1.8 },
        { x: -0.9, z: -1.1 }, { x: -2.0, z: -4.7 }, { x: -5.6, z: -6.2 },
        { x: -9.9, z: -4.8 }, { x: -11.6, z: -2.2 }, { x: -11.0, z: 0.1 },
        { x: -9.7, z: 1.3 },
      ],
    },
    {
      id: 'whispergrass-east-fold',
      depthBand: 'mid',
      color: 0x496652,
      elevation: 0.022,
      points: [
        { x: 1.0, z: 2.3 }, { x: 4.2, z: 3.3 }, { x: 9.7, z: 1.5 },
        { x: 11.3, z: -2.4 }, { x: 8.0, z: -5.5 }, { x: 3.0, z: -5.9 },
        { x: 0.9, z: -3.1 }, { x: 0.4, z: -0.3 },
      ],
    },
    {
      id: 'destination-basin',
      depthBand: 'far',
      color: 0x596d6c,
      elevation: 0.026,
      points: [
        { x: -10.5, z: -4.0 }, { x: -6.8, z: -3.3 }, { x: -2.5, z: -5.1 },
        { x: 1.4, z: -4.5 }, { x: 7.8, z: -6.1 }, { x: 10.9, z: -10.6 },
        { x: 8.7, z: -15.7 }, { x: 2.7, z: -18.1 }, { x: -4.2, z: -17.2 },
        { x: -10.4, z: -13.5 }, { x: -12.3, z: -8.1 },
      ],
    },
    {
      id: 'far-west-violet-moor',
      depthBand: 'far',
      color: 0x536568,
      elevation: 0.018,
      points: [
        { x: -18.8, z: -2.4 }, { x: -11.2, z: -1.0 }, { x: -8.7, z: -6.2 },
        { x: -10.8, z: -12.9 }, { x: -15.4, z: -16.8 }, { x: -19.5, z: -12.2 },
        { x: -20.1, z: -6.5 },
      ],
    },
    {
      id: 'far-east-blue-moor',
      depthBand: 'far',
      color: 0x586a6d,
      elevation: 0.014,
      points: [
        { x: 8.1, z: -2.6 }, { x: 14.4, z: -1.2 }, { x: 19.2, z: -4.7 },
        { x: 19.8, z: -11.1 }, { x: 16.0, z: -16.2 }, { x: 10.8, z: -17.8 },
        { x: 7.7, z: -14.8 }, { x: 9.1, z: -9.7 }, { x: 7.0, z: -6.3 },
      ],
    },
  ],
  grassClusters: [
    { id: 'west-copper-turn', x: -1.78, z: 1.24, radiusX: 0.64, radiusZ: 0.3, count: 18, seed: 0x71a1, heightMin: 0.72, heightMax: 1.34, silhouettes: ['fan', 'ribbon-left', 'spear'] },
    { id: 'west-lantern-pocket', x: -2.08, z: 0.02, radiusX: 0.72, radiusZ: 0.38, count: 23, seed: 0x71a2, heightMin: 0.54, heightMax: 1.08, silhouettes: ['ribbon-right', 'spear'] },
    { id: 'west-middle-hook', x: -1.76, z: -1.26, radiusX: 0.68, radiusZ: 0.4, count: 20, seed: 0x71a3, heightMin: 0.7, heightMax: 1.46, silhouettes: ['ribbon-left', 'ribbon-right', 'fan'] },
    { id: 'west-deep-crescent', x: -2.18, z: -2.58, radiusX: 0.8, radiusZ: 0.46, count: 27, seed: 0x71a4, heightMin: 0.5, heightMax: 1.14, silhouettes: ['spear', 'fan', 'ribbon-right'] },
    { id: 'west-exit-tuft', x: -1.62, z: -3.52, radiusX: 0.52, radiusZ: 0.26, count: 12, seed: 0x71a5, heightMin: 0.66, heightMax: 1.38, silhouettes: ['fan', 'ribbon-left'] },
    { id: 'east-entry-fan', x: 2.18, z: 0.58, radiusX: 0.72, radiusZ: 0.32, count: 17, seed: 0x71b1, heightMin: 0.54, heightMax: 1.02, silhouettes: ['fan', 'spear', 'ribbon-right'] },
    { id: 'east-blue-pocket', x: 1.82, z: -0.58, radiusX: 0.68, radiusZ: 0.38, count: 24, seed: 0x71b2, heightMin: 0.7, heightMax: 1.4, silhouettes: ['ribbon-left', 'spear'] },
    { id: 'east-narrow-turn', x: 2.18, z: -1.86, radiusX: 0.76, radiusZ: 0.34, count: 18, seed: 0x71b3, heightMin: 0.52, heightMax: 1.16, silhouettes: ['ribbon-right', 'fan'] },
    { id: 'east-deep-island', x: 1.86, z: -3.14, radiusX: 0.72, radiusZ: 0.44, count: 29, seed: 0x71b4, heightMin: 0.66, heightMax: 1.5, silhouettes: ['spear', 'ribbon-left', 'ribbon-right', 'fan'] },
  ],
  destination: {
    x: -1.08,
    z: -12.42,
    openingWidth: 2.36,
    openingHeight: 2.82,
    thresholdLight: 'warm-local',
  },
};

export const WORLD_LIGHTING_PROFILE = {
  nearFogDensity: 0.002,
  farFogDensity: 0.027,
  globalEmissiveMax: 0.015,
  warmLightStrategy: 'localized-rim-bounce' as const,
  shadowField: 'cool' as const,
};

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

interface RouteBoundarySample {
  center: THREE.Vector3[];
  left: THREE.Vector3[];
  right: THREE.Vector3[];
}

function sampleRouteBoundaries(samplesPerSpan = 8, widthScale = 1): RouteBoundarySample {
  const controls = WORLD_ROUTE_BLUEPRINT.path.centerline;
  const curve = new THREE.CatmullRomCurve3(
    controls.map((point) => new THREE.Vector3(point.x, 0, point.z)),
    false,
    'centripetal',
    0.42,
  );
  const sampleCount = (controls.length - 1) * samplesPerSpan;
  const center: THREE.Vector3[] = [];
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const widthIndex = t * (controls.length - 1);
    const fromIndex = Math.min(controls.length - 2, Math.floor(widthIndex));
    const widthBlend = widthIndex - fromIndex;
    const halfWidth = THREE.MathUtils.lerp(
      controls[fromIndex]!.halfWidth,
      controls[fromIndex + 1]!.halfWidth,
      widthBlend,
    ) * widthScale;
    // Left normal for a route travelling toward negative Z.
    const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
    center.push(point);
    left.push(point.clone().addScaledVector(normal, halfWidth));
    right.push(point.clone().addScaledVector(normal, -halfWidth));
  }

  return { center, left, right };
}

function pathGeometry(widthScale = 1): THREE.ShapeGeometry {
  const { left, right } = sampleRouteBoundaries(8, widthScale);
  const shape = new THREE.Shape();
  shape.moveTo(left[0]!.x, -left[0]!.z);
  for (const point of left.slice(1)) shape.lineTo(point.x, -point.z);
  for (const point of [...right].reverse()) shape.lineTo(point.x, -point.z);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 12);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function terrainMassGeometry(points: Array<{ x: number; z: number }>): THREE.ShapeGeometry {
  const contour = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(point.x, 0, point.z)),
    true,
    'centripetal',
    0.42,
  ).getPoints(points.length * 6);
  const shape = new THREE.Shape();
  shape.moveTo(contour[0]!.x, -contour[0]!.z);
  for (const point of contour.slice(1)) shape.lineTo(point.x, -point.z);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 8);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function grassSilhouetteGeometry(kind: GrassSilhouette): THREE.BufferGeometry {
  if (kind === 'spear') {
    const geometry = new THREE.ConeGeometry(0.075, 1, 4);
    geometry.translate(0, 0.5, 0);
    return geometry;
  }

  const shape = new THREE.Shape();
  if (kind === 'fan') {
    shape.moveTo(-0.035, 0);
    shape.bezierCurveTo(-0.08, 0.23, -0.24, 0.38, -0.2, 0.58);
    shape.lineTo(-0.07, 0.5);
    shape.lineTo(0, 0.84);
    shape.lineTo(0.075, 0.5);
    shape.lineTo(0.21, 0.58);
    shape.bezierCurveTo(0.23, 0.36, 0.08, 0.2, 0.035, 0);
  } else {
    const bend = kind === 'ribbon-left' ? -1 : 1;
    shape.moveTo(-0.038, 0);
    shape.bezierCurveTo(-0.055, 0.32, bend * 0.15 - 0.04, 0.68, bend * 0.18, 0.98);
    shape.bezierCurveTo(bend * 0.11, 0.73, 0.045, 0.32, 0.038, 0);
  }
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 5);
  geometry.computeVertexNormals();
  return geometry;
}

function clusterUnderlayGeometry(spec: GrassClusterSpec): THREE.ShapeGeometry {
  const rng = mulberry32(spec.seed ^ 0x5eeda11);
  const rawPoints: THREE.Vector3[] = [];
  const points = 11;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const irregularity = 0.82 + rng() * 0.3;
    rawPoints.push(
      new THREE.Vector3(
        spec.x + Math.cos(angle) * spec.radiusX * irregularity,
        0,
        spec.z + Math.sin(angle) * spec.radiusZ * irregularity,
      ),
    );
  }
  const contour = new THREE.CatmullRomCurve3(rawPoints, true, 'centripetal', 0.45).getPoints(44);
  const shape = new THREE.Shape();
  shape.moveTo(contour[0]!.x, -contour[0]!.z);
  for (const point of contour.slice(1)) shape.lineTo(point.x, -point.z);
  shape.closePath();
  const geometry = new THREE.ShapeGeometry(shape, 4);
  geometry.rotateX(-Math.PI / 2);
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
    roughness: 0.86,
    metalness: 0,
    emissive: tint,
    emissiveIntensity: 0.008,
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
    emissiveIntensity: 0.08,
    roughness: 0.46,
    metalness: 0.46,
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
  tower.position.set(WORLD_ROUTE_BLUEPRINT.destination.x, 0.1, -18.15);
  const stone = new THREE.MeshStandardMaterial({ color: 0x64717b, roughness: 0.94, metalness: 0.01 });
  const copper = new THREE.MeshStandardMaterial({
    color: 0x846b65,
    roughness: 0.64,
    metalness: 0.24,
    emissive: 0x2c1714,
    emissiveIntensity: WORLD_LIGHTING_PROFILE.globalEmissiveMax,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.58, 4.15, useMedium ? 8 : 14), stone);
  base.position.y = 2.08;
  tower.add(base);
  const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.18, 18), copper);
  balcony.position.y = 3.52;
  tower.add(balcony);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.34, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), copper);
  dome.position.y = 4.17;
  tower.add(dome);
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.72, 8), copper);
  needle.position.y = 5.72;
  tower.add(needle);
  for (const x of [-0.48, 0, 0.48]) {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.46),
      new THREE.MeshBasicMaterial({ color: 0xe8b46f, transparent: true, opacity: 0.68 }),
    );
    window.position.set(x, 2.58, 1.22);
    tower.add(window);
  }
  setShadow(tower, false, true);
  parent.add(tower);
}

function addDestinationEntrance(parent: THREE.Object3D, useMedium: boolean): void {
  const destination = WORLD_ROUTE_BLUEPRINT.destination;
  const gate = new THREE.Group();
  gate.name = 'observatory-threshold-entrance';
  gate.position.set(destination.x, 0, destination.z);

  const coolStone = new THREE.MeshStandardMaterial({
    color: 0x3d5056,
    roughness: 0.91,
    metalness: 0.03,
  });
  const edgeStone = new THREE.MeshStandardMaterial({
    color: 0x718084,
    roughness: 0.82,
    metalness: 0.04,
  });
  const openingMat = new THREE.MeshBasicMaterial({ color: 0x101a20, side: THREE.DoubleSide });
  const thresholdMat = new THREE.MeshBasicMaterial({
    color: 0xf5a65f,
    transparent: true,
    opacity: 0.72,
  });

  const radius = destination.openingWidth * 0.5;
  const springY = destination.openingHeight - radius;
  const pierOffset = radius + 0.31;
  for (const side of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.54, springY + 0.2, 0.72), coolStone);
    pier.position.set(side * pierOffset, (springY + 0.2) * 0.5, 0);
    pier.rotation.z = side * 0.018;
    gate.add(pier);

    const foot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 0), edgeStone);
    foot.position.set(side * pierOffset, 0.28, 0.03);
    foot.scale.set(1.0, 0.62, 0.9);
    gate.add(foot);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, useMedium ? 8 : 12, 8),
      new THREE.MeshBasicMaterial({ color: 0xf2b36f }),
    );
    marker.position.set(side * (radius + 0.05), springY - 0.16, 0.39);
    gate.add(marker);
  }

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.16, useMedium ? 6 : 9, useMedium ? 28 : 42, Math.PI),
    edgeStone,
  );
  arch.position.set(0, springY, 0.02);
  gate.add(arch);

  const openingShape = new THREE.Shape();
  openingShape.moveTo(-radius, 0);
  openingShape.lineTo(-radius, springY);
  openingShape.absarc(0, springY, radius, Math.PI, 0, true);
  openingShape.lineTo(radius, 0);
  openingShape.closePath();
  const opening = new THREE.Mesh(new THREE.ShapeGeometry(openingShape, 8), openingMat);
  opening.position.set(0, 0.035, -0.39);
  gate.add(opening);

  const threshold = new THREE.Mesh(
    new THREE.BoxGeometry(destination.openingWidth * 0.76, 0.055, 0.42),
    thresholdMat,
  );
  threshold.position.set(0, 0.07, 0.14);
  gate.add(threshold);

  const thresholdLight = new THREE.PointLight(0xffa45f, useMedium ? 0.72 : 1.05, 4.6, 2.1);
  thresholdLight.position.set(0, 0.92, -0.08);
  gate.add(thresholdLight);

  setShadow(gate, !useMedium, true);
  opening.castShadow = false;
  threshold.castShadow = false;
  parent.add(gate);
}

function tuneSceneLighting(scene: THREE.Scene, useMedium: boolean): void {
  // Main owns gameplay/camera lights; presentation only retunes their broad fill
  // so warm energy comes from local route fixtures rather than every surface.
  scene.traverse((object) => {
    if ((object as THREE.AmbientLight).isAmbientLight) {
      const light = object as THREE.AmbientLight;
      light.color.setHex(0xaec2dc);
      light.intensity = useMedium ? 0.24 : 0.27;
    } else if ((object as THREE.HemisphereLight).isHemisphereLight) {
      const light = object as THREE.HemisphereLight;
      light.color.setHex(0xb9c9e2);
      light.groundColor.setHex(0x182e35);
      light.intensity = useMedium ? 0.6 : 0.66;
    } else if ((object as THREE.DirectionalLight).isDirectionalLight) {
      const light = object as THREE.DirectionalLight;
      const color = light.color.getHex();
      if (color === 0xffdfbb) light.intensity = useMedium ? 1.14 : 1.3;
      else if (color === 0xff9579) light.intensity = useMedium ? 0.3 : 0.38;
      else if (color === 0x789bd4) light.intensity = useMedium ? 0.46 : 0.54;
      else if (color === 0xe4f1ff) light.intensity = useMedium ? 0.14 : 0.19;
    }
  });
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

  tuneSceneLighting(scene, useMedium);
  scene.background = new THREE.Color(0x60758f);
  scene.fog = new THREE.Fog(0x718696, useMedium ? 10.5 : 12.5, useMedium ? 34 : 40);

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(66, useMedium ? 24 : 48, useMedium ? 12 : 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new THREE.Color(0x1c3156) },
        upper: { value: new THREE.Color(0x485f82) },
        horizon: { value: new THREE.Color(0xb77776) },
        nadir: { value: new THREE.Color(0x8d6c72) },
        sunColor: { value: new THREE.Color(0xffd19a) },
        sunDir: { value: new THREE.Vector3(-0.5, 0.19, -0.86).normalize() },
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
          float sun = pow(max(dot(normalize(vDir), sunDir), 0.0), 210.0);
          float haze = pow(max(dot(normalize(vDir), sunDir), 0.0), 18.0) * 0.13;
          col += sunColor * (sun * 1.35 + haze);
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
    [-17, 11.2, -31, 11],
    [4, 13.5, -40, 15],
    [20, 9.8, -30, 9],
    [-27, 8.4, -10, 8],
    [29, 12.9, -20, 12],
    [8, 9.1, 27, 10],
  ];
  for (const [x, y, z, size] of cloudPositions) {
    const cloud = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cloudMap,
        color: 0xd9ced7,
        transparent: true,
        opacity: 0.27,
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
      color: 0xffc985,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  sun.position.set(-22, 9.5, -40);
  sun.scale.set(7.1, 7.1, 1);
  root.add(sun);

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x29443c,
    roughness: 0.99,
    metalness: 0,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(19.5, useMedium ? 56 : 96), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.025;
  ground.receiveShadow = true;
  ground.name = 'cool-shadow-field';
  root.add(ground);

  for (const spec of WORLD_ROUTE_BLUEPRINT.terrainMasses) {
    const mass = new THREE.Mesh(
      terrainMassGeometry(spec.points),
      new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.depthBand === 'far' ? 0.99 : 0.96,
        metalness: 0,
      }),
    );
    mass.name = `terrain-mass-${spec.id}`;
    mass.position.y = spec.elevation;
    mass.receiveShadow = true;
    mass.castShadow = false;
    root.add(mass);
  }

  const path = new THREE.Mesh(
    pathGeometry(),
    new THREE.MeshStandardMaterial({
      color: 0xb99d73,
      roughness: 0.97,
      metalness: 0,
    }),
  );
  path.name = 'winding-lantern-route';
  path.position.y = 0.045;
  path.receiveShadow = true;
  root.add(path);

  const routeCore = new THREE.Mesh(
    pathGeometry(0.39),
    new THREE.MeshStandardMaterial({ color: 0xc4aa82, roughness: 0.99, metalness: 0 }),
  );
  routeCore.name = 'worn-route-core';
  routeCore.position.y = 0.052;
  routeCore.receiveShadow = true;
  root.add(routeCore);

  const borderMat = new THREE.MeshStandardMaterial({ color: 0x716858, roughness: 0.99, metalness: 0 });
  const routeBoundary = sampleRouteBoundaries();
  const edgeSpans = [
    [[0, 13], [20, 31], [39, 51], [57, routeBoundary.left.length]],
    [[5, 17], [25, 37], [45, 58]],
  ] as const;
  for (const [sideIndex, points] of [routeBoundary.left, routeBoundary.right].entries()) {
    for (const [start, end] of edgeSpans[sideIndex]!) {
      const span = points.slice(start, end);
      if (span.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(
        span.map((point) => new THREE.Vector3(point.x, 0.072, point.z)),
        false,
        'centripetal',
        0.4,
      );
      const edge = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(8, span.length * 2), 0.025, 5, false),
        borderMat,
      );
      edge.name = `weathered-route-edge-${sideIndex}-${start}`;
      edge.receiveShadow = true;
      edge.castShadow = false;
      root.add(edge);
    }
  }

  const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x91836d, roughness: 0.98, metalness: 0 });
  const pathStoneSpecs: Array<[number, number, number, number, number]> = [
    [-2.02, 9.1, 0.3, 0.14, 0.22], [1.55, 8.55, 0.18, 0.1, 0.28],
    [-1.88, 7.2, 0.2, 0.09, 0.17], [1.96, 6.45, 0.28, 0.13, 0.19],
    [-1.24, 5.35, 0.16, 0.08, 0.24], [2.18, 4.65, 0.24, 0.1, 0.34],
    [-2.32, 3.15, 0.34, 0.14, 0.2], [1.22, 2.42, 0.18, 0.09, 0.16],
    [-1.1, 1.12, 0.22, 0.1, 0.3], [2.34, 0.48, 0.31, 0.13, 0.2],
    [-1.42, -0.86, 0.19, 0.08, 0.27], [2.13, -1.42, 0.26, 0.12, 0.18],
    [-2.08, -2.76, 0.32, 0.13, 0.23], [1.1, -3.58, 0.17, 0.08, 0.25],
    [-1.22, -4.82, 0.24, 0.11, 0.17], [2.12, -5.52, 0.3, 0.12, 0.26],
    [-1.05, -6.68, 0.16, 0.08, 0.22], [1.45, -7.45, 0.28, 0.13, 0.19],
    [-2.12, -8.52, 0.2, 0.09, 0.31], [0.82, -9.28, 0.34, 0.14, 0.21],
    [-2.62, -10.42, 0.26, 0.11, 0.2], [0.54, -11.08, 0.18, 0.09, 0.28],
    [-2.72, -12.0, 0.32, 0.13, 0.18], [0.48, -12.24, 0.22, 0.1, 0.3],
  ];
  for (let i = 0; i < pathStoneSpecs.length; i++) {
    if (useMedium && i % 3 === 1) continue;
    const [x, z, sx, sy, sz] = pathStoneSpecs[i]!;
    const pebble = makeRock(
      rng,
      pebbleMat,
      new THREE.Vector3(x, 0.065, z),
      new THREE.Vector3(sx, sy, sz),
    );
    pebble.castShadow = false;
    root.add(pebble);
  }

  const ridgeMaterials: Record<WorldDepthBand, THREE.MeshStandardMaterial> = {
    near: new THREE.MeshStandardMaterial({ color: 0x304b48, roughness: 0.93, metalness: 0 }),
    mid: new THREE.MeshStandardMaterial({ color: 0x485e5f, roughness: 0.96, metalness: 0 }),
    far: new THREE.MeshStandardMaterial({ color: 0x65747c, roughness: 0.99, metalness: 0 }),
  };
  const ridgeGeometry = new THREE.IcosahedronGeometry(1.45, 1);
  const ridgeSpecs: Array<[
    string,
    WorldDepthBand,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]> = [
    ['west-foreground-bank', 'near', -11.8, 6.2, 0.42, 3.8, 0.78, 2.15, 0.18],
    ['east-foreground-bank', 'near', 12.9, 8.0, 0.36, 4.5, 0.72, 2.5, -0.12],
    ['west-lantern-berm', 'mid', -9.4, -0.8, 0.46, 3.1, 0.86, 1.65, 0.44],
    ['east-moonwell-berm', 'mid', 10.6, -2.6, 0.4, 3.9, 0.75, 1.9, -0.24],
    ['west-route-fold', 'mid', -7.5, -6.8, 0.38, 2.8, 0.72, 1.5, 0.63],
    ['east-route-fold', 'mid', 7.8, -8.1, 0.41, 3.4, 0.82, 1.7, -0.38],
    ['west-gate-frame', 'far', -6.7, -13.5, 0.52, 3.0, 1.0, 1.8, 0.2],
    ['east-gate-frame', 'far', 5.7, -14.8, 0.56, 3.8, 1.08, 2.0, -0.34],
    ['west-horizon-step', 'far', -13.2, -15.2, 0.62, 4.6, 1.18, 2.6, 0.48],
    ['east-horizon-step', 'far', 12.1, -17.0, 0.66, 5.2, 1.1, 2.8, -0.22],
  ];
  for (const [id, band, x, z, y, sx, sy, sz, rotation] of ridgeSpecs) {
    const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterials[band]);
    ridge.name = `authored-ridge-${id}`;
    ridge.position.set(x, y, z);
    ridge.scale.set(sx, sy, sz);
    ridge.rotation.y = rotation;
    ridge.castShadow = !useMedium && band !== 'far';
    ridge.receiveShadow = true;
    root.add(ridge);
  }

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x52615f, roughness: 0.9, metalness: 0.02 });
  const warmRockMat = new THREE.MeshStandardMaterial({ color: 0x675b55, roughness: 0.91, metalness: 0.01 });
  const heroRocks: Array<[number, number, number, number, number, number]> = [
    [-9.2, -5.1, 1.0, 2.15, 0.9, 1.05],
    [9.0, -6.9, 0.9, 2.75, 1.05, 1.25],
    [7.7, 8.25, 0.58, 1.25, 0.64, 0.86],
    [-8.45, 7.0, 0.68, 1.55, 0.72, 0.96],
    [-4.5, -10.9, 0.52, 1.1, 0.58, 0.78],
  ];
  for (const [x, z, y, sx, sy, sz] of heroRocks) {
    root.add(
      makeRock(
        rng,
        z < 0 ? rockMat : warmRockMat,
        new THREE.Vector3(x, y * 0.5, z),
        new THREE.Vector3(sx, sy, sz),
      ),
    );
  }

  const treeSpecs: Array<[number, number, number, number]> = [
    [-9.4, 3.1, 1.22, 0x203f39],
    [-7.6, 7.9, 0.86, 0x345044],
    [-11.0, -2.6, 1.05, 0x294a43],
    [-6.9, -8.6, 0.76, 0x3a5350],
    [9.7, 1.2, 0.96, 0x315145],
    [7.4, 8.5, 0.78, 0x47634c],
    [10.8, -4.2, 1.13, 0x2b4c45],
    [5.4, -10.7, 0.7, 0x465a58],
    [-3.9, -12.8, 0.62, 0x536363],
    [3.8, -14.1, 0.68, 0x59696b],
    [13.4, -10.2, 0.88, 0x4b6261],
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
      color: 0x74b8c1,
      emissive: 0x18536a,
      emissiveIntensity: 0.12,
      roughness: 0.2,
      metalness: 0.08,
      transmission: useMedium ? 0 : 0.14,
      transparent: true,
      opacity: 0.9,
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
      opacity: 0.3,
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
  const wellLight = new THREE.PointLight(0x7fc9e5, useMedium ? 0.68 : 0.96, 5.2, 2.2);
  wellLight.position.y = 0.85;
  wellGroup.add(wellLight);
  setShadow(wellGroup, !useMedium, true);
  root.add(wellGroup);

  const gym = addLanternStake(root, -5.75, 3.15, 0xffd16f, 0x8c581c, 1.72, useMedium);
  const elite = addLanternStake(root, -6.25, 0.25, 0xb69cff, 0x4d2c88, 1.92, useMedium);
  const gymOrb = gym.orb;
  const eliteOrb = elite.orb;

  addDistantTower(root, useMedium);
  addDestinationEntrance(root, useMedium);

  const routeRim = new THREE.SpotLight(
    0xff9c67,
    useMedium ? 0.62 : 0.86,
    14,
    Math.PI * 0.21,
    0.88,
    2.2,
  );
  routeRim.name = 'localized-sunset-route-rim';
  routeRim.position.set(-4.8, 4.6, -4.8);
  routeRim.target.position.set(0.1, 0.25, 1.2);
  routeRim.castShadow = false;
  root.add(routeRim, routeRim.target);

  const grassField = new THREE.Group();
  grassField.name = 'whispergrass-field';
  root.add(grassField);

  const underMat = new THREE.MeshStandardMaterial({
    color: 0x2b5142,
    roughness: 0.99,
    metalness: 0,
  });
  for (const spec of WORLD_ROUTE_BLUEPRINT.grassClusters) {
    const undergrowth = new THREE.Mesh(clusterUnderlayGeometry(spec), underMat);
    undergrowth.name = `grass-cluster-footprint-${spec.id}`;
    undergrowth.position.y = 0.052;
    undergrowth.receiveShadow = true;
    grassField.add(undergrowth);
  }

  const grassColors = [0x32654e, 0x407757, 0x2b5a48, 0x4d825c, 0x416d53, 0x5b8a66];
  const grassMats = grassColors.map(
    (color) => new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  );
  const grassBlades: THREE.Mesh[] = [];
  const grassBaseRot: number[] = [];
  const silhouetteGeometries: Record<GrassSilhouette, THREE.BufferGeometry> = {
    spear: grassSilhouetteGeometry('spear'),
    'ribbon-left': grassSilhouetteGeometry('ribbon-left'),
    'ribbon-right': grassSilhouetteGeometry('ribbon-right'),
    fan: grassSilhouetteGeometry('fan'),
  };
  let placed = 0;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (const spec of WORLD_ROUTE_BLUEPRINT.grassClusters) {
    const clusterRng = mulberry32(spec.seed);
    const targetCount = useMedium ? Math.max(8, Math.round(spec.count * 0.52)) : spec.count;
    let clusterPlaced = 0;
    let attempts = 0;
    while (clusterPlaced < targetCount && attempts < targetCount * 14) {
      const sampleIndex = attempts++;
      const angle = sampleIndex * goldenAngle + (clusterRng() - 0.5) * 0.5;
      const radius = Math.sqrt((sampleIndex + 0.35) / (targetCount * 1.25));
      const envelope = Math.min(1, radius) * (0.76 + clusterRng() * 0.25);
      const px = spec.x + Math.cos(angle) * spec.radiusX * envelope;
      const pz = spec.z + Math.sin(angle) * spec.radiusZ * envelope;
      if (Math.abs(px) < grassPathHalf + 0.015) continue;
      const intersectsCeremony = [-2.18, 0, 2.18].some(
        (stageX) => Math.hypot(px - stageX, pz - 0.55) < 0.9,
      );
      if (intersectsCeremony) continue;

      const silhouette = spec.silhouettes[
        (clusterPlaced + Math.floor(clusterRng() * spec.silhouettes.length)) % spec.silhouettes.length
      ]!;
      const materialIndex = (placed + spec.seed) % grassMats.length;
      const blade = new THREE.Mesh(silhouetteGeometries[silhouette], grassMats[materialIndex]);
      const height = THREE.MathUtils.lerp(spec.heightMin, spec.heightMax, clusterRng()) * 0.84;
      const width = 0.7 + clusterRng() * 0.44;
      blade.name = `grass-${spec.id}-${silhouette}`;
      blade.position.set(px, 0.055, pz);
      blade.scale.set(width, height, 0.72 + clusterRng() * 0.46);
      blade.rotation.set((clusterRng() - 0.5) * 0.15, clusterRng() * Math.PI * 2, (clusterRng() - 0.5) * 0.28);
      blade.castShadow = !useMedium && placed % 11 === 0;
      blade.receiveShadow = !useMedium;
      grassBaseRot.push(blade.rotation.z);
      grassBlades.push(blade);
      grassField.add(blade);
      clusterPlaced++;
      placed++;
    }
  }

  const flowerMats = [0xe6b66e, 0x9fc9dc, 0xc8a5d8].map(
    (color) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.68, side: THREE.DoubleSide }),
  );
  const flowerSpecs: Array<[number, number, number, number, number]> = [
    [-4.8, 4.4, 0.055, 0.85, 0], [-5.15, 4.62, 0.052, 0.64, 2],
    [-3.92, 3.84, 0.058, 0.72, 1], [3.18, 6.25, 0.06, 0.9, 1],
    [3.52, 6.48, 0.052, 0.66, 2], [6.18, 4.04, 0.06, 0.8, 0],
    [6.48, 3.7, 0.05, 0.58, 1], [-3.0, 0.22, 0.052, 0.76, 2],
    [3.08, -0.9, 0.055, 0.7, 0], [-3.18, -2.7, 0.058, 0.92, 1],
    [3.3, -3.55, 0.05, 0.62, 2], [-2.72, -5.45, 0.055, 0.72, 0],
    [2.7, -6.15, 0.052, 0.82, 1], [-3.36, -7.72, 0.06, 0.66, 2],
    [2.1, -8.22, 0.052, 0.76, 0], [-3.14, -10.22, 0.056, 0.86, 1],
    [0.98, -10.9, 0.052, 0.62, 2], [-3.26, -11.55, 0.055, 0.72, 0],
  ];
  for (let i = 0; i < flowerSpecs.length; i++) {
    if (useMedium && i % 2 === 1) continue;
    const [x, z, radius, scale, materialIndex] = flowerSpecs[i]!;
    const flower = new THREE.Mesh(new THREE.CircleGeometry(radius, 6), flowerMats[materialIndex]);
    flower.position.set(x, 0.085 + (i % 3) * 0.028, z);
    flower.scale.setScalar(scale);
    flower.rotation.set(-Math.PI / 2 + ((i % 5) - 2) * 0.035, 0, i * 1.17);
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
    emissiveIntensity: WORLD_LIGHTING_PROFILE.globalEmissiveMax,
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
    // Keep the encounter silhouettes and impact VFX readable; the grass returns
    // immediately when the player exits back to exploration.
    grassField.visible = mode !== 'battle';
  };
  setMode('starter');

  const tick = (time: number, _dt: number, mode: PresentationMode): void => {
    if (mode !== currentMode) setMode(mode);
    healGlow.material.opacity = 0.22 + Math.sin(time * 2.35) * 0.075;
    water.position.y = 0.176 + Math.sin(time * 1.55) * 0.008;
    gymOrb.position.y = 1.5 + Math.sin(time * 2.05) * 0.055;
    eliteOrb.position.y = 1.7 + Math.sin(time * 1.72 + 1.1) * 0.065;
    motes.rotation.y = Math.sin(time * 0.08) * 0.12;
    (motes.material as THREE.PointsMaterial).opacity = 0.31 + Math.sin(time * 0.65) * 0.075;
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
