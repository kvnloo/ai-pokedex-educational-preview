import * as THREE from 'three';

export type DeviceState = 'closed' | 'opening' | 'booting' | 'ready' | 'idle' | 'pressing' | 'closing';
export interface DevicePlayback { state: DeviceState; seconds: number }
type ClipName = 'Closed' | 'Opening' | 'BootUp' | 'Ready' | 'Idle' | 'ButtonPress';
const clipNames: ClipName[] = ['Closed', 'Opening', 'BootUp', 'Ready', 'Idle', 'ButtonPress'];
const stateClips: Record<DeviceState, ClipName> = {
  closed: 'Closed', opening: 'Opening', closing: 'Opening', booting: 'BootUp',
  ready: 'Ready', idle: 'Idle', pressing: 'ButtonPress',
};

/** Binds the authored GLB contract without replacing its mechanical animation. */
export class PokedexRuntime {
  readonly mixer: THREE.AnimationMixer;
  private readonly actions = new Map<ClipName, THREE.AnimationAction>();
  private readonly power: { material: THREE.MeshStandardMaterial; node: THREE.Object3D; maximum: number }[] = [];
  private phase: DeviceState = 'closed';
  private current: THREE.AnimationAction;
  private readonly screen: THREE.Mesh;
  private readonly screenMaterial: THREE.MeshStandardMaterial;
  private readonly ready: THREE.Object3D;
  private replacement: THREE.MeshStandardMaterial | null = null;

  constructor(readonly root: THREE.Object3D, clips: THREE.AnimationClip[], readyContentSource = 'PDX.DisplayReady') {
    this.mixer = new THREE.AnimationMixer(root);
    for (const name of clipNames) {
      const clip = clips.find(candidate => candidate.name === name);
      if (!clip) throw new Error(`Pokédex asset is missing ${name}`);
      this.actions.set(name, this.mixer.clipAction(clip));
    }
    const materials = new Set<THREE.Material>();
    root.traverse(object => {
      if (object instanceof THREE.Mesh) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    for (const material of materials) {
      const signal: unknown = material.userData.power_signal;
      if (signal === undefined) continue;
      const maximum: unknown = material.userData.max_emission;
      const node = typeof signal === 'string' ? root.getObjectByName(signal) : undefined;
      if (!(material instanceof THREE.MeshStandardMaterial) || !node || typeof maximum !== 'number' || !Number.isFinite(maximum)) {
        throw new Error('Pokédex material has an invalid power binding');
      }
      this.power.push({ material, node, maximum });
    }
    let display: THREE.Object3D | undefined;
    let ready: THREE.Object3D | undefined;
    root.traverse(object => {
      if (object.userData.replaceable_display === true) display = object;
      if (object.userData.source_name === readyContentSource) ready = object;
    });
    if (!(display instanceof THREE.Mesh) || !(display.material instanceof THREE.MeshStandardMaterial) || !ready) {
      throw new Error('Pokédex asset has no replaceable display');
    }
    this.screen = display;
    this.screenMaterial = display.material;
    this.ready = ready;
    this.current = this.action('Closed');
    this.mixer.addEventListener('finished', this.finished);
    this.play('Closed', 'closed', true);
    this.update(0);
  }

  get state(): DeviceState { return this.phase; }
  get canOpen(): boolean { return this.phase === 'closed'; }
  get canClose(): boolean { return this.phase === 'ready' || this.phase === 'idle'; }
  get canPress(): boolean { return this.phase === 'idle'; }

  capturePlayback(): DevicePlayback { return { state: this.phase, seconds: this.current.time }; }

  /** Preserve the actual clip phase when replacing a level of detail. */
  restorePlayback(playback: DevicePlayback): void {
    this.play(stateClips[playback.state], playback.state, playback.state === 'closed');
    this.current.time = THREE.MathUtils.clamp(playback.seconds, 0, this.current.getClip().duration);
    this.current.setEffectiveTimeScale(playback.state === 'closing' ? -1 : 1);
    this.update(0);
  }

  open(): void {
    if (this.canOpen) this.play('Opening', 'opening');
  }

  close(): void {
    if (!this.canClose) return;
    this.play('Opening', 'closing');
    this.current.time = this.current.getClip().duration;
    this.current.setEffectiveTimeScale(-1);
    this.update(0);
  }

  press(): void {
    if (this.canPress) this.play('ButtonPress', 'pressing');
  }

  /** The caller retains ownership of the texture. The exported display stays intact. */
  setDisplay(texture: THREE.Texture | null): void {
    this.screen.material = this.screenMaterial;
    this.replacement?.dispose();
    this.replacement = null;
    if (texture) {
      const material = this.screenMaterial.clone();
      material.color.setRGB(1, 1, 1);
      material.emissive.setRGB(1, 1, 1);
      material.map = material.emissiveMap = texture;
      material.emissiveIntensity = .65;
      material.needsUpdate = true;
      this.replacement = material;
    }
    this.update(0);
  }

  update(seconds: number): void {
    this.mixer.update(seconds);
    for (const { material, node, maximum } of this.power) {
      material.emissiveIntensity = maximum * THREE.MathUtils.clamp(node.position.x, 0, 1);
    }
    const showReplacement = this.replacement !== null && ['ready', 'idle', 'pressing'].includes(this.phase);
    this.screen.material = showReplacement && this.replacement ? this.replacement : this.screenMaterial;
    this.ready.visible = !showReplacement;
  }

  dispose(): void {
    this.mixer.removeEventListener('finished', this.finished);
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.root);
    this.screen.material = this.screenMaterial;
    this.ready.visible = true;
    this.replacement?.dispose();
  }

  private action(name: ClipName): THREE.AnimationAction {
    const action = this.actions.get(name);
    if (!action) throw new Error(`Pokédex action ${name} was not initialized`);
    return action;
  }

  private play(name: ClipName, phase: DeviceState, hold = false): void {
    this.mixer.stopAllAction();
    this.current = this.action(name).reset();
    this.current.setEffectiveTimeScale(1).setEffectiveWeight(1);
    this.current.setLoop(name === 'Idle' ? THREE.LoopRepeat : THREE.LoopOnce, name === 'Idle' ? Infinity : 1);
    this.current.clampWhenFinished = true;
    this.current.play();
    this.current.paused = hold;
    this.phase = phase;
  }

  private readonly finished = (event: { action: THREE.AnimationAction }): void => {
    if (event.action !== this.current) return;
    switch (this.phase) {
      case 'opening': this.play('BootUp', 'booting'); break;
      case 'booting': this.play('Ready', 'ready'); break;
      case 'ready':
      case 'pressing': this.play('Idle', 'idle'); break;
      case 'closing': this.play('Closed', 'closed', true); break;
      case 'closed':
      case 'idle': break;
    }
  };
}
