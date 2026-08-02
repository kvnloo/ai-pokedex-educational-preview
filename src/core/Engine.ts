/**
 * Engine: system registry + frame loop (COD lineage, Twilight Route schedule).
 *
 *   input.beginFrame
 *   → N × fixedUpdate  (overworld, battle sim, encounters)
 *   → update           (presentation, fx, ui)
 *   → lateUpdate
 *   → render
 *   → input.endFrame
 *
 * Mode-4 F: primary gated metric is presented-frame interval (rAF timestamp
 * delta). CPU work-time is secondary. Both published on window.__frameStats.
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

/** Browser-facing stats handle for tools/profile.mjs (presented primary). */
export interface FrameStatsBridge {
  kind: 'presented-frame';
  times: number[];
  workTimes: number[];
  running: boolean;
  snapshot: () => ReturnType<typeof frameStats.snapshot>;
  reset: () => void;
}

declare global {
  interface Window {
    __frameStats?: FrameStatsBridge;
  }
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
  /** Legacy ring of CPU work ms. */
  readonly frameTimes = new Float32Array(240);
  private frameCursor = 0;
  /** Prior rAF presentation timestamp (ms). */
  private lastPresentedMs = 0;
  /** Presented intervals collected for profile bridge (post-start). */
  private presentedSamples: number[] = [];
  private workSamples: number[] = [];

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

  /** Publish / refresh window.__frameStats for mode-4 profile gate. */
  private publishFrameStatsBridge(): void {
    if (typeof window === 'undefined') return;
    const self = this;
    window.__frameStats = {
      kind: 'presented-frame',
      get times() {
        return self.presentedSamples;
      },
      get workTimes() {
        return self.workSamples;
      },
      running: this.running,
      snapshot: () => frameStats.snapshot(),
      reset: () => {
        self.presentedSamples = [];
        self.workSamples = [];
        self.lastPresentedMs = 0;
        frameStats.reset(MEDIUM_1080P.id);
      },
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastPresentedMs = 0;
    this.publishFrameStatsBridge();
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
    if (typeof window !== 'undefined' && window.__frameStats) {
      window.__frameStats.running = false;
    }
  }

  frame(nowMs: number): void {
    const t0 = performance.now();

    // Presented-frame interval (rAF timestamp delta) — primary mode-4 gate metric.
    if (this.lastPresentedMs > 0) {
      const presented = nowMs - this.lastPresentedMs;
      if (Number.isFinite(presented) && presented > 0) {
        this.presentedSamples.push(presented);
        // Keep bridge array bounded for long sessions.
        if (this.presentedSamples.length > 32_768) {
          this.presentedSamples.splice(0, this.presentedSamples.length - 24_576);
        }
        frameStats.push(presented);
      }
    }
    this.lastPresentedMs = nowMs;

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
    this.workSamples.push(spent);
    if (this.workSamples.length > 32_768) {
      this.workSamples.splice(0, this.workSamples.length - 24_576);
    }
  }

  /** Mode-4 snapshot (post warm-up percentiles of presented-frame samples). */
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
    if (typeof window !== 'undefined' && window.__frameStats) {
      delete window.__frameStats;
    }
  }
}
