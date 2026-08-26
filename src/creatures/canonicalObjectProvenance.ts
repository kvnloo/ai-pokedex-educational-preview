import * as THREE from 'three';

export type CanonicalTemplateBinding = {
  speciesId: string;
  sourceSha256: string;
  sourceSceneUuid: string;
  templateRootUuid: string;
  geometrySha256: string;
  materialSha256: string;
  skeletonSignature: string;
  animationVariant: string;
};

export type CanonicalRenderBinding = CanonicalTemplateBinding & {
  scale: number;
  renderRootUuid: string;
  transformSha256: string;
};

const encoder = new TextEncoder();
const expectedLocalScales = new WeakMap<THREE.Object3D, readonly number[]>();
const sealedTransforms = new WeakMap<THREE.Object3D, string>();
const sealedRenderTrees = new WeakMap<THREE.Object3D, string>();
const disposedTextures = new WeakSet<THREE.Texture>();
const watchedTextures = new WeakSet<THREE.Texture>();

async function sha256(bytes: Uint8Array | string): Promise<string> {
  const input = typeof bytes === 'string' ? encoder.encode(bytes) : bytes;
  const digest = await crypto.subtle.digest('SHA-256', Uint8Array.from(input).buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function attributeBytes(attribute: THREE.BufferAttribute | THREE.InterleavedBufferAttribute): Uint8Array {
  const array = attribute instanceof THREE.InterleavedBufferAttribute ? attribute.data.array : attribute.array;
  return new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
}

function numericBytes(value: unknown): Uint8Array | null {
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return null;
}

async function imageCommitment(image: unknown): Promise<Record<string, unknown>> {
  const candidate = image as { data?: unknown; width?: number; height?: number; depth?: number } | null;
  const direct = numericBytes(candidate?.data);
  if (direct) return { width: candidate?.width, height: candidate?.height, depth: candidate?.depth ?? null, sha256: await sha256(direct) };
  const browserImage = typeof document !== 'undefined' && image && (
    (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap)
    || (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement)
    || (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement)
  );
  if (browserImage) {
    const source = image as CanvasImageSource & { width: number; height: number };
    const canvas = document.createElement('canvas');
    canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('unsupported canonical texture: 2D pixels unavailable');
    try {
      context.drawImage(source, 0, 0);
      const pixels = context.getImageData(0, 0, source.width, source.height).data;
      return { width: source.width, height: source.height, sha256: await sha256(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength)) };
    } catch (cause) {
      throw new Error('unsupported canonical texture: pixels are not synchronously readable', { cause });
    }
  }
  throw new Error('unsupported canonical texture: immutable source bytes required');
}

async function textureCommitment(texture: THREE.Texture): Promise<Record<string, unknown>> {
  if (!watchedTextures.has(texture)) {
    watchedTextures.add(texture);
    texture.addEventListener('dispose', () => disposedTextures.add(texture));
  }
  if (disposedTextures.has(texture)) throw new Error('canonical texture was disposed');
  const images = Array.isArray(texture.image) ? texture.image : [texture.image];
  return {
    uuid: texture.uuid, sourceUuid: texture.source.uuid, version: texture.version,
    format: texture.format, internalFormat: texture.internalFormat, type: texture.type,
    colorSpace: texture.colorSpace, channel: texture.channel, mapping: texture.mapping,
    wrapS: texture.wrapS, wrapT: texture.wrapT, wrapR: (texture as THREE.Data3DTexture).wrapR ?? null,
    magFilter: texture.magFilter, minFilter: texture.minFilter, anisotropy: texture.anisotropy,
    flipY: texture.flipY, premultiplyAlpha: texture.premultiplyAlpha,
    unpackAlignment: texture.unpackAlignment, generateMipmaps: texture.generateMipmaps,
    offset: texture.offset.toArray(), repeat: texture.repeat.toArray(), center: texture.center.toArray(),
    rotation: texture.rotation, matrixAutoUpdate: texture.matrixAutoUpdate, matrix: texture.matrix.toArray(),
    images: await Promise.all(images.map(imageCommitment)),
    mipmaps: await Promise.all(texture.mipmaps.map(imageCommitment)),
  };
}

async function transformDigest(root: THREE.Object3D): Promise<string> {
  root.updateWorldMatrix(true, true);
  const worldScale = new THREE.Vector3();
  root.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), worldScale);
  return sha256(stable({
    parentUuid: root.parent?.uuid ?? null, matrixAutoUpdate: root.matrixAutoUpdate,
    position: root.position.toArray(), quaternion: root.quaternion.toArray(), scale: root.scale.toArray(),
    matrix: root.matrix.toArray(), matrixWorld: root.matrixWorld.toArray(), effectiveWorldScale: worldScale.toArray(),
  }));
}

async function renderTreeDigest(root: THREE.Object3D): Promise<string> {
  root.updateWorldMatrix(true, true);
  const nodes: Array<Record<string, unknown>> = [];
  const visit = async (object: THREE.Object3D, path: string, lineage: readonly string[]): Promise<void> => {
    const worldScale = new THREE.Vector3().setFromMatrixScale(object.matrixWorld);
    const mesh = object as THREE.Mesh;
    const skinned = object as THREE.SkinnedMesh;
    const instanced = object as THREE.InstancedMesh;
    nodes.push({
      path, uuidLineage: [...lineage, object.uuid], uuid: object.uuid,
      canonicalSourceMeshUuid: object.userData.canonicalSourceMeshUuid ?? null,
      parentUuid: object.parent?.uuid ?? null, type: object.type,
      matrixAutoUpdate: object.matrixAutoUpdate, matrixWorldAutoUpdate: object.matrixWorldAutoUpdate,
      position: object.position.toArray(), quaternion: object.quaternion.toArray(), scale: object.scale.toArray(),
      matrix: object.matrix.toArray(), matrixWorld: object.matrixWorld.toArray(), effectiveWorldScale: worldScale.toArray(),
      visible: object.visible, layers: object.layers.mask, renderOrder: object.renderOrder,
      frustumCulled: object.frustumCulled, castShadow: object.castShadow, receiveShadow: object.receiveShadow,
      morphTargetInfluences: mesh.morphTargetInfluences ? [...mesh.morphTargetInfluences] : null,
      bindMode: skinned.isSkinnedMesh ? skinned.bindMode : null,
      bindMatrix: skinned.isSkinnedMesh ? skinned.bindMatrix.toArray() : null,
      bindMatrixInverse: skinned.isSkinnedMesh ? skinned.bindMatrixInverse.toArray() : null,
      skeleton: skinned.isSkinnedMesh ? {
        boneInverses: skinned.skeleton.boneInverses.map((matrix) => matrix.toArray()),
        boneMatrices: skinned.skeleton.boneMatrices
          ? await sha256(new Uint8Array(skinned.skeleton.boneMatrices.buffer))
          : null,
      } : null,
      instanceMatrix: instanced.isInstancedMesh ? await sha256(attributeBytes(instanced.instanceMatrix)) : null,
      instanceColor: instanced.isInstancedMesh && instanced.instanceColor ? await sha256(attributeBytes(instanced.instanceColor)) : null,
      count: instanced.isInstancedMesh ? instanced.count : null,
    });
    for (let index = 0; index < object.children.length; index += 1) {
      const child = object.children[index]!;
      await visit(child, `${path}/${index}:${child.name || child.type}`, [...lineage, object.uuid]);
    }
  };
  await visit(root, `0:${root.name || root.type}`, []);
  return sha256(stable(nodes));
}

async function objectDigests(root: THREE.Object3D): Promise<{ geometrySha256: string; materialSha256: string; skeletonSignature: string }> {
  const geometries: Array<Record<string, unknown>> = [];
  const materials: Array<Record<string, unknown>> = [];
  const skeletons: Array<Record<string, unknown>> = [];
  const visit = async (object: THREE.Object3D, path: string): Promise<void> => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      const geometry = mesh.geometry;
      const attributes: Record<string, unknown> = {};
      for (const [name, attribute] of Object.entries(geometry.attributes).sort(([a], [b]) => a.localeCompare(b))) {
        attributes[name] = { itemSize: attribute.itemSize, normalized: attribute.normalized, count: attribute.count, sha256: await sha256(attributeBytes(attribute)) };
      }
      geometries.push({
        path, sourceMeshUuid: object.userData.canonicalSourceMeshUuid, geometryUuid: geometry.uuid, attributes,
        index: geometry.index ? { count: geometry.index.count, sha256: await sha256(attributeBytes(geometry.index)) } : null,
        morphAttributes: Object.keys(geometry.morphAttributes).sort(),
      });
      for (const material of (Array.isArray(mesh.material) ? mesh.material : [mesh.material])) {
        const candidate = material as THREE.Material & Record<string, unknown>;
        const mapNames = ['map', 'alphaMap', 'aoMap', 'bumpMap', 'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap'];
        const maps = Object.fromEntries(await Promise.all(mapNames.map(async (name) => {
          const texture = candidate[name] as THREE.Texture | null | undefined;
          return [name, texture ? await textureCommitment(texture) : null];
        })));
        materials.push({
          path, uuid: material.uuid, type: material.type, defines: candidate.defines ?? null,
          color: (candidate.color as THREE.Color | undefined)?.getHexString() ?? null,
          emissive: (candidate.emissive as THREE.Color | undefined)?.getHexString() ?? null,
          transparent: material.transparent, side: material.side, vertexColors: material.vertexColors,
          alphaTest: material.alphaTest, blending: material.blending, roughness: candidate.roughness ?? null,
          metalness: candidate.metalness ?? null, maps,
        });
      }
      const skinned = mesh as THREE.SkinnedMesh;
      if (skinned.isSkinnedMesh) skeletons.push({ path, bindMode: skinned.bindMode, bones: skinned.skeleton.bones.map((bone) => ({ name: bone.name, uuid: bone.uuid })) });
    }
    await Promise.all(object.children.map((child, index) => visit(child, `${path}/${index}:${child.name || child.type}`)));
  };
  await visit(root, `0:${root.name || root.type}`);
  return {
    geometrySha256: await sha256(stable(geometries)),
    materialSha256: await sha256(stable(materials)),
    skeletonSignature: await sha256(stable(skeletons)),
  };
}

export async function bindCanonicalTemplateProvenance(
  root: THREE.Object3D,
  identity: Pick<CanonicalTemplateBinding, 'speciesId' | 'sourceSha256' | 'sourceSceneUuid' | 'animationVariant'>,
): Promise<CanonicalTemplateBinding> {
  root.traverse((object) => { if ((object as THREE.Mesh).isMesh) object.userData.canonicalSourceMeshUuid = object.uuid; });
  const binding: CanonicalTemplateBinding = { ...identity, templateRootUuid: root.uuid, ...await objectDigests(root) };
  root.userData.canonicalBinding = binding;
  return binding;
}

export function stampCanonicalRenderClone(root: THREE.Object3D, template: THREE.Object3D, scale: number): void {
  const binding = template.userData.canonicalBinding as CanonicalTemplateBinding | undefined;
  if (!binding) throw new Error('Canonical template provenance missing');
  root.userData.canonicalBinding = structuredClone(binding);
  root.userData.scale = scale;
  root.userData.renderRootUuid = root.uuid;
  expectedLocalScales.set(root, root.scale.toArray());
}

export async function verifyCanonicalRenderObject(
  root: THREE.Object3D,
  expected: { speciesId: string; sourceSha256: string; scale: number },
): Promise<CanonicalRenderBinding> {
  const binding = root.userData.canonicalBinding as CanonicalTemplateBinding | undefined;
  if (!binding) throw new Error('canonical binding missing');
  if (binding.speciesId !== expected.speciesId) throw new Error('species lineage mismatch');
  if (binding.sourceSha256 !== expected.sourceSha256) throw new Error('source SHA mismatch');
  if (root.userData.scale !== expected.scale) throw new Error('canonical scale mismatch');
  if (root.userData.renderRootUuid !== root.uuid && binding.templateRootUuid !== root.uuid) throw new Error('render UUID lineage mismatch');
  const actual = await objectDigests(root);
  if (actual.geometrySha256 !== binding.geometrySha256) throw new Error('geometry lineage mismatch');
  if (actual.materialSha256 !== binding.materialSha256) throw new Error('material lineage mismatch');
  if (actual.skeletonSignature !== binding.skeletonSignature) throw new Error('skeleton lineage mismatch');
  const expectedScale = expectedLocalScales.get(root);
  if (!expectedScale || root.scale.toArray().some((value, index) => value !== expectedScale[index])) throw new Error('transform lineage mismatch: effective canonical scale changed');
  const transformSha256 = await transformDigest(root);
  const sealed = sealedTransforms.get(root);
  if (sealed && sealed !== transformSha256) throw new Error('transform lineage mismatch');
  sealedTransforms.set(root, transformSha256);
  const renderTreeSha256 = await renderTreeDigest(root);
  const sealedTree = sealedRenderTrees.get(root);
  if (sealedTree && sealedTree !== renderTreeSha256) throw new Error('render tree lineage mismatch');
  sealedRenderTrees.set(root, renderTreeSha256);
  return { ...binding, scale: expected.scale, renderRootUuid: root.uuid, transformSha256 };
}
