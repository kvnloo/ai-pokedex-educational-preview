/**
 * Reusable authored organic geometry for the starter lane.
 *
 * Unlike primitive stacks, these lofts carry a changing cross-section through one
 * continuous macro mesh. Appendage lofts are authored from their semantic socket
 * so clip rotation happens at the joint rather than around a detached primitive.
 */
import * as THREE from 'three';

export interface DepthLoftSection {
  /** Local depth; sections must progress rear (-Z) to front (+Z). */
  z: number;
  /** Lateral centre offset. */
  x?: number;
  /** Vertical centre. */
  y: number;
  radiusX: number;
  radiusY: number;
  /** 2 = ellipse, >2 = gently fuller shoulder/cheek planes. */
  shapePower?: number;
  /** Raises only the top half of the ring for a readable spine/crown. */
  dorsalRidge?: number;
}

export interface VerticalLoftSection {
  /** Local height; sections must progress bottom to top. */
  y: number;
  /** Lateral centre offset from the semantic socket. */
  x?: number;
  /** Depth centre offset from the semantic socket. */
  z?: number;
  radiusX: number;
  radiusZ: number;
  shapePower?: number;
}

function signedPow(value: number, power: number): number {
  if (Math.abs(value) < 1e-10) return 0;
  return (value < 0 ? -1 : 1) * Math.pow(Math.abs(value), power);
}

function assertSections(label: string, values: readonly number[], axis: string): void {
  if (values.length < 3) throw new Error(`${label} requires at least three cross-sections`);
  for (let i = 1; i < values.length; i++) {
    if (values[i]! <= values[i - 1]!) {
      throw new Error(`${label} ${axis} sections must be strictly increasing`);
    }
  }
}

function finishGeometry(
  positions: number[],
  uvs: number[],
  indices: number[],
  name: string,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name = name;
  return geometry;
}

/**
 * Closed rear-to-front loft used for a continuous pelvis → ribcage → neck → skull → muzzle core.
 */
export function createDepthLoftGeometry(
  sections: readonly DepthLoftSection[],
  radialSegments = 24,
  name = 'depth-organic-loft',
): THREE.BufferGeometry {
  assertSections(name, sections.map((section) => section.z), 'z');
  if (radialSegments < 8) throw new Error(`${name} requires at least eight radial segments`);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  sections.forEach((section, ring) => {
    const exponent = 2 / Math.max(1.5, section.shapePower ?? 2);
    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const cx = signedPow(Math.cos(angle), exponent);
      const cy = signedPow(Math.sin(angle), exponent);
      const dorsal = Math.max(0, cy) * (section.dorsalRidge ?? 0);
      positions.push(
        (section.x ?? 0) + cx * section.radiusX,
        section.y + cy * section.radiusY + dorsal,
        section.z,
      );
      uvs.push(j / radialSegments, ring / (sections.length - 1));
    }
  });

  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let j = 0; j < radialSegments; j++) {
      const next = (j + 1) % radialSegments;
      const a = ring * radialSegments + j;
      const b = ring * radialSegments + next;
      const c = (ring + 1) * radialSegments + j;
      const d = (ring + 1) * radialSegments + next;
      // Ring tangent × depth tangent points away from the centreline.
      indices.push(a, b, c, b, d, c);
    }
  }

  const rear = sections[0]!;
  const rearCenter = positions.length / 3;
  positions.push(rear.x ?? 0, rear.y, rear.z);
  uvs.push(0.5, 0);
  for (let j = 0; j < radialSegments; j++) {
    const next = (j + 1) % radialSegments;
    indices.push(rearCenter, next, j);
  }

  const front = sections[sections.length - 1]!;
  const frontCenter = positions.length / 3;
  positions.push(front.x ?? 0, front.y, front.z);
  uvs.push(0.5, 1);
  const frontBase = (sections.length - 1) * radialSegments;
  for (let j = 0; j < radialSegments; j++) {
    const next = (j + 1) % radialSegments;
    indices.push(frontCenter, frontBase + j, frontBase + next);
  }

  return finishGeometry(positions, uvs, indices, name);
}

/**
 * Closed bottom-to-top loft for tapered legs and arms. Geometry is local to a
 * shoulder/hip socket; the uppermost section should be y=0 and overlap the core.
 */
export function createVerticalLoftGeometry(
  sections: readonly VerticalLoftSection[],
  radialSegments = 16,
  name = 'vertical-organic-loft',
): THREE.BufferGeometry {
  assertSections(name, sections.map((section) => section.y), 'y');
  if (radialSegments < 8) throw new Error(`${name} requires at least eight radial segments`);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  sections.forEach((section, ring) => {
    const exponent = 2 / Math.max(1.5, section.shapePower ?? 2);
    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const cx = signedPow(Math.cos(angle), exponent);
      const cz = signedPow(Math.sin(angle), exponent);
      positions.push(
        (section.x ?? 0) + cx * section.radiusX,
        section.y,
        (section.z ?? 0) + cz * section.radiusZ,
      );
      uvs.push(j / radialSegments, ring / (sections.length - 1));
    }
  });

  for (let ring = 0; ring < sections.length - 1; ring++) {
    for (let j = 0; j < radialSegments; j++) {
      const next = (j + 1) % radialSegments;
      const a = ring * radialSegments + j;
      const b = ring * radialSegments + next;
      const c = (ring + 1) * radialSegments + j;
      const d = (ring + 1) * radialSegments + next;
      // Height tangent × ring tangent points away from the centreline.
      indices.push(a, c, b, b, c, d);
    }
  }

  const bottom = sections[0]!;
  const bottomCenter = positions.length / 3;
  positions.push(bottom.x ?? 0, bottom.y, bottom.z ?? 0);
  uvs.push(0.5, 0);
  for (let j = 0; j < radialSegments; j++) {
    const next = (j + 1) % radialSegments;
    indices.push(bottomCenter, j, next);
  }

  const top = sections[sections.length - 1]!;
  const topCenter = positions.length / 3;
  positions.push(top.x ?? 0, top.y, top.z ?? 0);
  uvs.push(0.5, 1);
  const topBase = (sections.length - 1) * radialSegments;
  for (let j = 0; j < radialSegments; j++) {
    const next = (j + 1) % radialSegments;
    indices.push(topCenter, topBase + next, topBase + j);
  }

  return finishGeometry(positions, uvs, indices, name);
}

function sampleRadius(radii: readonly number[], t: number): number {
  if (radii.length === 1) return radii[0]!;
  const scaled = Math.min(radii.length - 1, Math.max(0, t) * (radii.length - 1));
  const i = Math.min(radii.length - 2, Math.floor(scaled));
  const f = scaled - i;
  return THREE.MathUtils.lerp(radii[i]!, radii[i + 1]!, f);
}

/**
 * Variable-radius Catmull-Rom sweep for tails, feelers and stems. Open ends are
 * deliberate: both ends embed into a parent core or terminal ornament.
 */
export function createTaperedCurveGeometry(
  points: readonly THREE.Vector3[],
  radii: readonly number[],
  tubularSegments = 20,
  radialSegments = 10,
  name = 'tapered-organic-curve',
): THREE.BufferGeometry {
  if (points.length < 3) throw new Error(`${name} requires at least three path points`);
  if (radii.length < 2) throw new Error(`${name} requires at least two radius samples`);
  const curve = new THREE.CatmullRomCurve3([...points], false, 'centripetal');
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const point = curve.getPointAt(t);
    const radius = sampleRadius(radii, t);
    const normal = frames.normals[i]!;
    const binormal = frames.binormals[i]!;
    for (let j = 0; j <= radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(angle);
      const cos = -Math.cos(angle);
      positions.push(
        point.x + radius * (cos * normal.x + sin * binormal.x),
        point.y + radius * (cos * normal.y + sin * binormal.y),
        point.z + radius * (cos * normal.z + sin * binormal.z),
      );
      uvs.push(t, j / radialSegments);
    }
  }

  for (let j = 1; j <= tubularSegments; j++) {
    for (let i = 1; i <= radialSegments; i++) {
      const a = (radialSegments + 1) * (j - 1) + (i - 1);
      const b = (radialSegments + 1) * j + (i - 1);
      const c = (radialSegments + 1) * j + i;
      const d = (radialSegments + 1) * (j - 1) + i;
      indices.push(a, b, d, b, c, d);
    }
  }

  return finishGeometry(positions, uvs, indices, name);
}
