import * as THREE from 'three';

export interface CinematicScenery {
  update(timeSeconds: number): void;
}

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x4b342d,
  roughness: 0.94,
  metalness: 0,
});
const leafMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x214f3d, roughness: 0.93 }),
  new THREE.MeshStandardMaterial({ color: 0x2d654a, roughness: 0.9 }),
  new THREE.MeshStandardMaterial({ color: 0x386f52, roughness: 0.88 }),
];
const stoneMaterial = new THREE.MeshStandardMaterial({
  color: 0x66716d,
  roughness: 0.92,
  metalness: 0.01,
});

function treeAt(x: number, z: number, scale: number, index: number): THREE.Group {
  const tree = new THREE.Group();
  tree.name = `route-tree-${index}`;
  tree.position.set(x, 0, z);
  tree.rotation.y = index * 1.713;
  tree.scale.setScalar(scale);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.25, 2.2, 8), trunkMaterial);
  trunk.position.y = 1.05;
  trunk.rotation.z = ((index % 3) - 1) * 0.045;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  const crownOffsets: ReadonlyArray<readonly [number, number, number, number]> = [
    [0, 2.45, 0, 1.08],
    [-0.58, 2.25, 0.05, 0.78],
    [0.55, 2.3, -0.12, 0.86],
    [0.08, 2.78, -0.08, 0.72],
  ];
  for (let part = 0; part < crownOffsets.length; part += 1) {
    const [cx, cy, cz, radius] = crownOffsets[part]!;
    const crown = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 2),
      leafMaterials[(index + part) % leafMaterials.length]!,
    );
    crown.position.set(cx, cy, cz);
    crown.scale.set(1.05 + ((index + part) % 3) * 0.08, 0.8 + (part % 2) * 0.12, 0.92);
    crown.rotation.set(part * 0.31, index * 0.43 + part, part * 0.17);
    crown.castShadow = part < 2;
    crown.receiveShadow = true;
    tree.add(crown);
  }
  return tree;
}

function lanternAt(x: number, z: number, warm: boolean, withLight: boolean): THREE.Group {
  const lantern = new THREE.Group();
  lantern.position.set(x, 0, z);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 1.55, 8), trunkMaterial);
  post.position.y = 0.76;
  post.castShadow = true;
  lantern.add(post);
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(0.23, 0.18, 6),
    new THREE.MeshStandardMaterial({ color: 0x272c31, roughness: 0.55, metalness: 0.45 }),
  );
  cap.position.y = 1.64;
  lantern.add(cap);
  const glowColor = warm ? 0xffc77a : 0x8dd9ff;
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.16, 0.3, 8),
    new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 1.8,
      roughness: 0.24,
      transparent: true,
      opacity: 0.9,
    }),
  );
  glass.position.y = 1.47;
  lantern.add(glass);
  if (withLight) {
    const light = new THREE.PointLight(glowColor, 1.25, 4.2, 2);
    light.position.y = 1.47;
    lantern.add(light);
  }
  return lantern;
}

/**
 * Adds deterministic original scenery around the flat gameplay corridor. The
 * central walkable area stays at y=0; depth is built with silhouettes,
 * landmarks, atmosphere and framing rather than untracked terrain collision.
 */
export function addCinematicScenery(scene: THREE.Scene, useMedium: boolean): CinematicScenery {
  const root = new THREE.Group();
  root.name = 'lumen-hollow-cinematic-scenery';
  scene.add(root);

  // Low sun and halo. They sit on the north vista's image plane; unlike an
  // untextured Sprite, CircleGeometry cannot render as a square card.
  const sunHalo = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb56f, transparent: true, opacity: 0.16, depthWrite: false }),
  );
  sunHalo.position.set(-10, 9, -25);
  sunHalo.scale.set(7.2, 7.2, 1);
  root.add(sunHalo);
  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0xffdfaa, transparent: true, opacity: 0.76, depthWrite: false }),
  );
  sun.position.copy(sunHalo.position);
  sun.scale.set(2.55, 2.55, 1);
  root.add(sun);

  // Layered atmospheric silhouettes keep the horizon from reading as a flat disc.
  const ridgeMatFar = new THREE.MeshBasicMaterial({ color: 0x344a4d, transparent: true, opacity: 0.55 });
  const ridgeMatNear = new THREE.MeshStandardMaterial({ color: 0x315940, roughness: 0.98 });
  const ridgeSpecs: ReadonlyArray<readonly [number, number, number, number, number]> = [
    [-13, -19, 3.4, 2.2, 1.2], [-8, -20, 4.3, 2.7, 1.5], [-2, -21, 5.2, 2.35, 1.7],
    [5, -20, 4.6, 2.6, 1.3], [11, -19, 4.1, 2.3, 1.55],
  ];
  for (let index = 0; index < ridgeSpecs.length; index += 1) {
    const [x, z, sx, sy, sz] = ridgeSpecs[index]!;
    const ridge = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.75, 2),
      index % 2 === 0 ? ridgeMatFar : ridgeMatNear,
    );
    ridge.position.set(x, sy * 0.5 - 1.3, z);
    ridge.scale.set(sx, sy, sz);
    ridge.rotation.set(0.1 * index, 0.37 * index, -0.08 + index * 0.018);
    ridge.receiveShadow = true;
    root.add(ridge);
  }

  const treeSpecs: ReadonlyArray<readonly [number, number, number]> = [
    [-8.5, -7.8, 1.35], [-6.4, -9.4, 1.05], [-4.7, -7.2, 0.82],
    [8.3, -8.2, 1.28], [6.1, -9.6, 1.08], [4.9, -7.1, 0.8],
    [-8.4, 1.4, 0.94], [8.6, 0.1, 1.02], [-6.8, 5.7, 0.72], [7.8, 5.4, 0.76],
  ];
  const treeLimit = useMedium ? 8 : treeSpecs.length;
  for (let index = 0; index < treeLimit; index += 1) {
    const [x, z, scale] = treeSpecs[index]!;
    root.add(treeAt(x, z, scale, index));
  }

  // Original destination landmark: a moonwell gate at the north end of the path.
  const gate = new THREE.Group();
  gate.name = 'moonwell-gate';
  gate.position.set(0, 0, -8.65);
  const gateStone = new THREE.MeshStandardMaterial({ color: 0x52605d, roughness: 0.87, metalness: 0.04 });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.42, 2.65, 7), gateStone);
    pillar.position.set(side * 1.45, 1.3, 0);
    pillar.rotation.z = side * -0.035;
    pillar.castShadow = true;
    gate.add(pillar);
    const rune = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.025, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x9ee2cf, emissive: 0x63b9a2, emissiveIntensity: 1.2 }),
    );
    rune.position.set(side * 1.45, 1.48, 0.25);
    gate.add(rune);
  }
  const lintelCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.45, 2.5, 0),
    new THREE.Vector3(-0.75, 3.08, -0.05),
    new THREE.Vector3(0, 3.28, -0.08),
    new THREE.Vector3(0.75, 3.08, -0.05),
    new THREE.Vector3(1.45, 2.5, 0),
  ]);
  const lintel = new THREE.Mesh(new THREE.TubeGeometry(lintelCurve, 24, 0.18, 7, false), gateStone);
  lintel.castShadow = true;
  gate.add(lintel);
  const wellGlow = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.22, 40),
    new THREE.MeshBasicMaterial({ color: 0x86d8d0, transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
  );
  wellGlow.rotation.x = -Math.PI / 2;
  wellGlow.position.set(0, 0.04, -0.2);
  gate.add(wellGlow);
  root.add(gate);

  const lanterns: THREE.Group[] = [];
  const lanternSpecs: ReadonlyArray<readonly [number, number, boolean]> = [
    [-3.1, 2.7, true], [3.1, 0.7, false], [-2.8, -2.4, false], [2.8, -5.2, true],
  ];
  lanternSpecs.forEach(([x, z, warm], index) => {
    const lantern = lanternAt(x, z, warm, !useMedium || index % 2 === 0);
    lanterns.push(lantern);
    root.add(lantern);
  });

  // Rock and flower clusters add midground scale without interfering with collision.
  const rockSpecs: ReadonlyArray<readonly [number, number, number]> = [
    [-3.8, -5.5, 0.52], [3.7, -6.1, 0.46], [-5.3, 2.6, 0.62], [5.8, 1.7, 0.55],
  ];
  rockSpecs.forEach(([x, z, scale], index) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 1), stoneMaterial);
    rock.position.set(x, scale * 0.42, z);
    rock.scale.set(1.25, 0.72, 0.95);
    rock.rotation.set(index * 0.41, index * 1.17, index * 0.23);
    rock.castShadow = true;
    rock.receiveShadow = true;
    root.add(rock);
  });

  const fireflyCount = useMedium ? 28 : 52;
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  for (let index = 0; index < fireflyCount; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    fireflyPositions[index * 3] = side * (2.2 + ((index * 37) % 47) / 10);
    fireflyPositions[index * 3 + 1] = 0.55 + ((index * 19) % 31) / 18;
    fireflyPositions[index * 3 + 2] = -6.8 + ((index * 29) % 113) / 10;
  }
  const fireflyGeometry = new THREE.BufferGeometry();
  fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflies = new THREE.Points(
    fireflyGeometry,
    new THREE.PointsMaterial({
      color: 0xb9ffe3,
      size: useMedium ? 0.055 : 0.075,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  root.add(fireflies);

  // Broad clouds share one material; slow parallax is visible in motion captures.
  const clouds = new THREE.Group();
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffe8dc, transparent: true, opacity: 0.13, depthWrite: false });
  const cloudSpecs: ReadonlyArray<readonly [number, number, number, number]> = [
    [-10, 8.5, -18, 2.2], [1, 10.2, -23, 2.8], [11, 7.8, -19, 2.15],
  ];
  cloudSpecs.forEach(([x, y, z, scale], clusterIndex) => {
    for (let part = 0; part < 3; part += 1) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 7), cloudMat);
      cloud.position.set(x + (part - 1) * scale * 0.65, y + (part % 2) * 0.28, z - part * 0.12);
      cloud.scale.set(scale * (0.82 + part * 0.12), scale * 0.34, scale * 0.48);
      cloud.userData.baseX = cloud.position.x;
      cloud.userData.phase = clusterIndex * 1.7 + part * 0.45;
      clouds.add(cloud);
    }
  });
  root.add(clouds);

  return {
    update(timeSeconds: number): void {
      const glowMat = wellGlow.material as THREE.MeshBasicMaterial;
      glowMat.opacity = 0.34 + Math.sin(timeSeconds * 1.7) * 0.1;
      wellGlow.rotation.z = timeSeconds * 0.08;
      fireflies.rotation.y = Math.sin(timeSeconds * 0.11) * 0.025;
      const fireflyMat = fireflies.material as THREE.PointsMaterial;
      fireflyMat.opacity = 0.58 + Math.sin(timeSeconds * 2.2) * 0.17;
      for (let index = 0; index < clouds.children.length; index += 1) {
        const cloud = clouds.children[index] as THREE.Mesh;
        cloud.position.x = Number(cloud.userData.baseX) + Math.sin(timeSeconds * 0.035 + Number(cloud.userData.phase)) * 1.2;
      }
      lanterns.forEach((lantern, index) => {
        const glass = lantern.children[2] as THREE.Mesh | undefined;
        if (!glass) return;
        const material = glass.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1.55 + Math.sin(timeSeconds * 2.1 + index * 1.3) * 0.22;
      });
    },
  };
}
