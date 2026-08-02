/**
 * Engine: system registry + frame loop (COD lineage, Twilight Route schedule).
 *
 *   input.beginFrame
 *   → N × fixedUpdate  (overworld, battle sim, encounters)
 *   → update           (presentation, fx, ui)
 *   → lateUpdate
 *   → render
 *   → input.endFrame
 */
import * as THREE from 'three';
import { Time } from './Time.ts';
import { frameStats, MEDIUM_1080P } from './frameStats.ts';

export interface EngineContext {
  engine: Engine;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  time: Time;
}

export const ORDER = {
  INPUT: 0,
  OVERWORLD: 100,
  BATTLE_SIM: 200,
  DIRECTOR: 300,
  WORLD_PRESENT: 400,
  CREATURE: 500,
  FX: 600,
  AUDIO: 700,
  CAMERA: 800,
  UI: 900,
  RENDER: 1000,
} as const;

export interface System {
  readonly name: string;
  readonly order: number;
  enabled?: boolean;
  init?(ctx: EngineContext): Promise<void> | void;
  fixedUpdate?(dt: number, ctx: EngineContext): void;
  update?(dt: number, ctx: EngineContext): void;
  lateUpdate?(dt: number, ctx: EngineContext): void;
  render?(ctx: EngineContext): void;
  resize?(width: number, height: number, pixelRatio: number): void;
  dispose?(): void;
}

export class Engine {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly time: Time;
  readonly canvas: HTMLCanvasElement;
  systems: System[] = [];
  private byName = new Map<string, System>();
  private ctx: EngineContext;
  private running = false;
  private rafId = 0;
  private initialised = false;
  /** Legacy ring; prefer frameStats for mode-4 gates. */
  readonly frameTimes = new Float32Array(240);
  private frameCursor = 0;

  constructor(canvas: HTMLCanvasElement, fixedHz = 60) {
    this.canvas = canvas;
    this.time = new Time(fixedHz);
    this.camera = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / Math.max(1, canvas.clientHeight),
      0.05,
      200,
    );
    this.ctx = {
      engine: this,
      scene: this.scene,
      camera: this.camera,
      time: this.time,
    };
  }

  add<T extends System>(system: T): T {
    if (this.byName.has(system.name)) {
      throw new Error(`[Engine] duplicate system "${system.name}"`);
    }
    this.byName.set(system.name, system);
    this.systems.push(system);
    this.systems.sort((a, b) => a.order - b.order);
    return system;
  }

  get<T extends System>(name: string): T {
    const s = this.byName.get(name);
    if (!s) throw new Error(`[Engine] missing system "${name}"`);
    return s as T;
  }

  tryGet<T extends System>(name: string): T | undefined {
    return this.byName.get(name) as T | undefined;
  }

  async init(): Promise<void> {
    if (this.initialised) return;
    for (const s of this.systems) {
      if (s.init) await s.init(this.ctx);
    }
    this.initialised = true;
    this.resize();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      this.frame(now);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  frame(nowMs: number): void {
    const t0 = performance.now();
    this.time.beginFrame(nowMs);
    const steps = this.time.takeFixedSteps(5);
    const fdt = this.time.fixedDt;
    for (let i = 0; i < steps; i++) {
      for (const s of this.systems) {
        if (s.enabled === false) continue;
        s.fixedUpdate?.(fdt, this.ctx);
      }
    }
    const dt = this.time.dt;
    for (const s of this.systems) {
      if (s.enabled === false) continue;
      s.update?.(dt, this.ctx);
    }
    for (const s of this.systems) {
      if (s.enabled === false) continue;
      s.lateUpdate?.(dt, this.ctx);
    }
    for (const s of this.systems) {
      if (s.enabled === false) continue;
      s.render?.(this.ctx);
    }
    const spent = performance.now() - t0;
    this.frameTimes[this.frameCursor % this.frameTimes.length] = spent;
    this.frameCursor += 1;
    frameStats.push(spent);
  }

  /** Mode-4 snapshot (post warm-up percentiles). */
  getFrameStats() {
    return frameStats.snapshot();
  }

  resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    const pr = Math.min(devicePixelRatio, MEDIUM_1080P.maxPixelRatio);
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    for (const s of this.systems) s.resize?.(w, h, pr);
  }

  dispose(): void {
    this.stop();
    for (const s of this.systems) s.dispose?.();
    this.systems.length = 0;
    this.byName.clear();
  }
}
