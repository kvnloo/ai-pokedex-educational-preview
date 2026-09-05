import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface CharacterAsset {
  id: string; canonicalId: string; name: string; nationalDexId: number | null;
  form: string; heightMeters: number; sha256: string; href: string;
  location?: string; action?: string;
  sockets: string[]; materials: string[]; clips: string[];
}
export interface Character {
  root: THREE.Group; mixer: THREE.AnimationMixer; metadata: CharacterAsset;
  sockets: Map<string, THREE.Object3D>;
  setClip: (clip: string) => void;
}
export async function loadOpeningCharacters(): Promise<{ ash: Character; pikachu: Character; reviewOnly: boolean }> {
  const response = await fetch('/private-opening/catalog', { cache: 'no-store' });
  const catalog = await response.json();
  if (!response.ok || !catalog.ok) throw new Error(`${catalog.code ?? 'CHARACTER_ACCEPTANCE_REQUIRED'}\n${(catalog.errors ?? []).join('\n')}\n\n${catalog.required?.ledger ?? ''}`);
  const templates = new Map<string, Character>();
  const loader = new GLTFLoader();
  for (const asset of catalog.assets as CharacterAsset[]) {
    if (!['ash-ketchum-kanto', 'pikachu'].includes(asset.id)) throw new Error('Unknown opening character; no fallback');
    templates.set(asset.id,await loadCharacter(asset));
  }
  const ash = templates.get('ash-ketchum-kanto'), pikachu = templates.get('pikachu');
  if (!ash || !pikachu) throw new Error('Opening requires both characters; no fallback');
  return { ash, pikachu, reviewOnly: catalog.code === 'CANDIDATE_REVIEW_ONLY' };
}

export async function loadCharacter(asset:CharacterAsset):Promise<Character> {
  const loader=new GLTFLoader();
    const res = await fetch(asset.href, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${asset.name}: private asset unavailable; no fallback`);
    const bytes = await res.arrayBuffer();
    const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
    if (digest !== asset.sha256) throw new Error(`${asset.name}: asset hash mismatch`);
    const gltf = await loader.parseAsync(bytes, '');
    const root = new THREE.Group(); root.name = asset.canonicalId;
    const model = clone(gltf.scene);
    // Blender -Y faces +Z after glTF axis conversion. The game uses -Z north.
    model.rotation.y = Math.PI; root.add(model);
    root.userData = { ...asset, identityPlane: 'canonical-private-local', assetSha256: digest };
    const bounds = new THREE.Box3().setFromObject(root, true);
    const size = bounds.getSize(new THREE.Vector3());
    if (bounds.isEmpty() || ![size.x, size.y, size.z].every(Number.isFinite) || size.x < .05 || size.z < .03 || Math.abs(size.y - asset.heightMeters) > .015) throw new Error(`${asset.name}: scale/extent gate failed (${size.x}, ${size.y}, ${size.z}; expected height ${asset.heightMeters})`);
    root.children[0]!.position.y -= bounds.min.y;
    const materialNames = new Set<string>();
    root.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = true; node.receiveShadow = true;
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) materialNames.add(material.name);
    });
    for (const name of asset.materials) if (!materialNames.has(name)) throw new Error(`${asset.name}: material ${name} missing`);
    // GLTFLoader sanitizes punctuation in node names; extras preserve socket IDs.
    const sockets = new Map<string, THREE.Object3D>();
    root.traverse(node => { if (typeof node.userData.socket === 'string') sockets.set(node.userData.socket, node); });
    for (const name of asset.sockets) if (!sockets.has(name)) throw new Error(`${asset.name}: socket ${name} missing`);
    const mixer = new THREE.AnimationMixer(root);
    const actions = new Map(gltf.animations.map(clip => [clip.name, mixer.clipAction(clip)]));
    for (const name of asset.clips) if (!actions.has(name)) throw new Error(`${asset.name}: animation ${name} missing`);
    let current: THREE.AnimationAction | undefined;
    const setClip = (name: string) => {
      const action = actions.get(name);
      if (!action) throw new Error(`${asset.name}: unknown animation ${name}`);
      if (action === current) return;
      action.reset().play(); current?.crossFadeTo(action, .16, false); current = action;
    };
    setClip('idle'); return { root, mixer, metadata: asset, sockets, setClip };

}

export async function loadSpecies(id:string):Promise<Character> {
  const res=await fetch(`/private-opening/roster/${encodeURIComponent(id)}.json`);
  if(!res.ok) throw new Error('Species integrity verification failed');
  return loadCharacter(await res.json());
}
