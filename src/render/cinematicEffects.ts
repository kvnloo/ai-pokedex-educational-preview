import * as THREE from 'three';

export type ImpactKind = 'hit' | 'se' | 'nve' | 'crit' | 'catch';
export type AttackPhase = 'anticipation' | 'travel' | 'contact' | 'recoil' | 'settle' | 'idle';

export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * One authored attack grammar shared by player and foe actions.
 *
 * The first rendered frame is anticipation, contact owns a true 64ms
 * hit-stop, recoil stays readable for 190ms, and the whole pose is home by
 * 600ms. Keep these values in the critic-defined perceptual windows.
 */
export const AUTHORED_ATTACK_TIMELINE = Object.freeze({
  anticipationMs: 120,
  travelMs: 100,
  contactMs: 64,
  recoilMs: 190,
  settleMs: 126,
  totalMs: 600,
});

export function attackPhaseProgress(elapsedMs: number): {
  phase: AttackPhase;
  progress: number;
} {
  const spec = AUTHORED_ATTACK_TIMELINE;
  const elapsed = Math.max(0, elapsedMs);
  const travelAt = spec.anticipationMs;
  const contactAt = travelAt + spec.travelMs;
  const recoilAt = contactAt + spec.contactMs;
  const settleAt = recoilAt + spec.recoilMs;
  if (elapsed < travelAt) {
    return { phase: 'anticipation', progress: elapsed / spec.anticipationMs };
  }
  if (elapsed < contactAt) {
    return { phase: 'travel', progress: (elapsed - travelAt) / spec.travelMs };
  }
  if (elapsed < recoilAt) {
    return { phase: 'contact', progress: (elapsed - contactAt) / spec.contactMs };
  }
  if (elapsed < settleAt) {
    return { phase: 'recoil', progress: (elapsed - recoilAt) / spec.recoilMs };
  }
  if (elapsed < spec.totalMs) {
    return { phase: 'settle', progress: (elapsed - settleAt) / spec.settleMs };
  }
  return { phase: 'idle', progress: 1 };
}

export function attackPhaseAt(elapsedMs: number): AttackPhase {
  return attackPhaseProgress(elapsedMs).phase;
}

/** Margin-aware screen-space collision used by the production evidence gate. */
export function screenRectsOverlap(a: ScreenRect, b: ScreenRect, marginPx = 0): boolean {
  const margin = Math.max(0, marginPx);
  return !(
    a.right + margin <= b.left ||
    b.right + margin <= a.left ||
    a.bottom + margin <= b.top ||
    b.bottom + margin <= a.top
  );
}

export interface CinematicEffects {
  root: THREE.Group;
  burst: (position: THREE.Vector3, kind: ImpactKind) => void;
  trail: (position: THREE.Vector3, color?: number) => void;
  directedTrail: (
    origin: THREE.Vector3,
    target: THREE.Vector3,
    progress: number,
    color?: number,
  ) => void;
  clearDirectedTrail: () => void;
  tick: (dt: number, time: number) => void;
}

interface BurstParticle {
  mesh: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  life: number;
  age: number;
}

interface TrailParticle {
  sprite: THREE.Sprite;
  life: number;
  age: number;
}

function glowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.24, 'rgba(255,255,255,.82)');
  gradient.addColorStop(0.62, 'rgba(255,255,255,.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const IMPACT_COLOR: Record<ImpactKind, number> = {
  hit: 0xfff1cc,
  se: 0xffd15c,
  nve: 0x8ec8ff,
  crit: 0xff735d,
  catch: 0x9fffe0,
};

export function createCatchOrb(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'lumen-catch-orb';
  const upper = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xe65f50,
      roughness: 0.27,
      metalness: 0.4,
      clearcoat: 0.72,
      clearcoatRoughness: 0.22,
      emissive: 0x46120e,
      emissiveIntensity: 0.16,
    }),
  );
  const lower = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xf1eee4,
      roughness: 0.32,
      metalness: 0.24,
      clearcoat: 0.58,
      clearcoatRoughness: 0.26,
    }),
  );
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.151, 0.018, 8, 28),
    new THREE.MeshStandardMaterial({ color: 0x26333a, roughness: 0.36, metalness: 0.72 }),
  );
  band.rotation.x = Math.PI / 2;
  const button = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 0.022, 18),
    new THREE.MeshStandardMaterial({
      color: 0xcdfaff,
      emissive: 0x72d9e6,
      emissiveIntensity: 0.62,
      roughness: 0.2,
      metalness: 0.34,
    }),
  );
  button.rotation.x = Math.PI / 2;
  button.position.z = 0.15;
  root.add(upper, lower, band, button);
  root.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) object.castShadow = true;
  });
  return root;
}

export function createCinematicEffects(scene: THREE.Scene, useMedium = false): CinematicEffects {
  const root = new THREE.Group();
  root.name = 'cinematic-effects';
  scene.add(root);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.34, 40),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.visible = false;
  root.add(ring);
  let ringAge = 0;
  let ringLife = 0;

  const flash = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  flash.visible = false;
  root.add(flash);
  let flashAge = 0;
  let flashLife = 0;

  const light = new THREE.PointLight(0xffffff, 0, useMedium ? 3.5 : 5, 2);
  root.add(light);
  let lightAge = 1;

  const burstPool: BurstParticle[] = [];
  const burstCount = useMedium ? 10 : 18;
  for (let i = 0; i < burstCount; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), material);
    mesh.visible = false;
    root.add(mesh);
    burstPool.push({ mesh, velocity: new THREE.Vector3(), life: 0.34, age: 1 });
  }

  const trailMap = glowTexture();
  const trailPool: TrailParticle[] = [];
  const trailCount = useMedium ? 8 : 16;
  for (let i = 0; i < trailCount; i++) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: trailMap,
        color: 0xb8f6ff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sprite.visible = false;
    root.add(sprite);
    trailPool.push({ sprite, life: 0.28, age: 1 });
  }
  let trailCursor = 0;
  let burstCursor = 0;

  // Persistent travel geometry makes attack direction legible in a single
  // frame. The pooled glow motes remain secondary wake, not the only signal.
  const directionMaterial = new THREE.MeshBasicMaterial({
    color: 0xb8f6ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const directionRibbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.12, 1, 10, 1, true),
    directionMaterial,
  );
  directionRibbon.name = 'attack-direction-ribbon';
  directionRibbon.visible = false;
  directionRibbon.renderOrder = 8;
  root.add(directionRibbon);
  const directionHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.42, 12),
    directionMaterial.clone(),
  );
  directionHead.name = 'attack-direction-head';
  directionHead.visible = false;
  directionHead.renderOrder = 9;
  root.add(directionHead);
  const directionFrom = new THREE.Vector3();
  const directionTo = new THREE.Vector3();
  const directionDelta = new THREE.Vector3();
  const directionMid = new THREE.Vector3();
  const upAxis = new THREE.Vector3(0, 1, 0);

  const burst = (position: THREE.Vector3, kind: ImpactKind): void => {
    const color = IMPACT_COLOR[kind];
    const count = kind === 'crit' || kind === 'catch' ? burstCount : Math.ceil(burstCount * 0.68);
    for (let i = 0; i < count; i++) {
      const particle = burstPool[burstCursor % burstPool.length]!;
      burstCursor++;
      const angle = (i / count) * Math.PI * 2 + (burstCursor % 5) * 0.17;
      const speed = 1.4 + ((i * 37) % 11) * 0.12;
      particle.mesh.position.copy(position);
      particle.mesh.position.x += Math.cos(angle) * 0.05;
      particle.mesh.position.y += Math.sin(angle * 1.7) * 0.04;
      particle.mesh.position.z += Math.sin(angle) * 0.05;
      particle.mesh.scale.setScalar(kind === 'crit' ? 1.35 : kind === 'catch' ? 1.15 : 0.9);
      particle.mesh.material.color.setHex(color);
      particle.mesh.material.opacity = 0.95;
      particle.mesh.visible = true;
      particle.velocity.set(
        Math.cos(angle) * speed,
        Math.sin(angle * 2.2) * 0.55 + 0.75,
        Math.sin(angle) * speed * 0.72,
      );
      particle.age = 0;
      particle.life = kind === 'catch' ? 0.58 : kind === 'crit' ? 0.44 : 0.34;
    }

    ring.position.copy(position);
    ring.position.z += 0.05;
    ring.scale.setScalar(0.34);
    ring.material.color.setHex(color);
    ring.material.opacity = 0.78;
    ring.visible = true;
    ringAge = 0;
    ringLife = kind === 'catch' ? 0.68 : 0.42;

    flash.position.copy(position);
    flash.scale.setScalar(kind === 'crit' || kind === 'catch' ? 1.65 : 1.05);
    flash.material.color.setHex(color);
    flash.material.opacity = kind === 'crit' ? 0.86 : 0.68;
    flash.visible = true;
    flashAge = 0;
    flashLife = kind === 'catch' ? 0.58 : 0.26;

    light.position.copy(position);
    light.color.setHex(color);
    light.intensity = kind === 'crit' || kind === 'catch' ? 3.1 : 1.8;
    lightAge = 0;
  };

  const trail = (position: THREE.Vector3, color = 0xb8f6ff): void => {
    const particle = trailPool[trailCursor % trailPool.length]!;
    trailCursor++;
    particle.sprite.position.copy(position);
    particle.sprite.position.x += ((trailCursor * 37) % 9 - 4) * 0.006;
    particle.sprite.position.y += ((trailCursor * 17) % 7 - 3) * 0.006;
    const scale = 0.13 + (trailCursor % 4) * 0.018;
    particle.sprite.scale.set(scale, scale, 1);
    particle.sprite.material.color.setHex(color);
    particle.sprite.material.opacity = 0.7;
    particle.sprite.visible = true;
    particle.age = 0;
    particle.life = 0.24 + (trailCursor % 3) * 0.035;
  };

  const directedTrail = (
    origin: THREE.Vector3,
    target: THREE.Vector3,
    progress: number,
    color = 0xffb45f,
  ): void => {
    const u = Math.max(0, Math.min(1, progress));
    const eased = u * u * (3 - 2 * u);
    const tailU = Math.max(0, eased - 0.38);
    directionTo.lerpVectors(origin, target, eased);
    directionFrom.lerpVectors(origin, target, tailU);
    // A shallow authored arc keeps the projectile off both silhouettes while
    // its endpoints still communicate semantic origin and destination.
    directionTo.y += Math.sin(eased * Math.PI) * 0.24;
    directionFrom.y += Math.sin(tailU * Math.PI) * 0.24;
    directionDelta.subVectors(directionTo, directionFrom);
    const length = Math.max(0.035, directionDelta.length());
    const direction = directionDelta.normalize();
    directionMid.addVectors(directionFrom, directionTo).multiplyScalar(0.5);

    directionRibbon.position.copy(directionMid);
    directionRibbon.quaternion.setFromUnitVectors(upAxis, direction);
    directionRibbon.scale.set(1 + Math.sin(u * Math.PI) * 0.45, length, 1);
    directionRibbon.material.color.setHex(color);
    directionRibbon.material.opacity = 0.84 + Math.sin(u * Math.PI) * 0.14;
    directionRibbon.visible = true;

    directionHead.position.copy(directionTo);
    directionHead.quaternion.setFromUnitVectors(upAxis, direction);
    directionHead.scale.setScalar(0.82 + Math.sin(u * Math.PI) * 0.42);
    directionHead.material.color.setHex(color);
    directionHead.material.opacity = 0.94;
    directionHead.visible = true;
    trail(directionTo, color);
  };

  const clearDirectedTrail = (): void => {
    directionRibbon.visible = false;
    directionRibbon.material.opacity = 0;
    directionHead.visible = false;
    directionHead.material.opacity = 0;
  };

  const tick = (dt: number, time: number): void => {
    for (const particle of burstPool) {
      if (!particle.mesh.visible) continue;
      particle.age += dt;
      const u = particle.age / particle.life;
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.y -= dt * 2.8;
      particle.mesh.rotation.x += dt * 9;
      particle.mesh.rotation.y += dt * 13;
      particle.mesh.material.opacity = Math.max(0, 1 - u);
      particle.mesh.scale.multiplyScalar(Math.max(0.88, 1 - dt * 2.4));
      if (u >= 1) particle.mesh.visible = false;
    }
    for (const particle of trailPool) {
      if (!particle.sprite.visible) continue;
      particle.age += dt;
      const u = particle.age / particle.life;
      particle.sprite.position.y += dt * 0.3;
      particle.sprite.material.opacity = Math.max(0, (1 - u) * 0.7);
      particle.sprite.scale.multiplyScalar(1 + dt * 1.6);
      if (u >= 1) particle.sprite.visible = false;
    }
    if (ring.visible) {
      ringAge += dt;
      const u = ringAge / ringLife;
      ring.scale.setScalar(0.34 + u * 4.2);
      ring.material.opacity = Math.max(0, (1 - u) * 0.78);
      ring.rotation.z = time * 0.4;
      if (u >= 1) ring.visible = false;
    }
    if (flash.visible) {
      flashAge += dt;
      const u = flashAge / flashLife;
      flash.material.opacity = Math.max(0, (1 - u) * 0.72);
      flash.scale.multiplyScalar(1 + dt * 2.2);
      if (u >= 1) flash.visible = false;
    }
    lightAge += dt;
    light.intensity *= Math.exp(-dt * 12);
    if (lightAge > 0.4) light.intensity = 0;
  };

  return { root, burst, trail, directedTrail, clearDirectedTrail, tick };
}
