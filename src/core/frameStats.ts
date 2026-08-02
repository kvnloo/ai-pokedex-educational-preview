/**
 * Mode-4 frame-time instrument (category F).
 *
 * Ring buffer of per-frame ms; percentile / long-frame counters after warm-up.
 * Safe for Engine loop or a one-line main import later — no Three dependency.
 *
 * Gates (documented, asserted by tools/profile.mjs):
 *   - p99_ms ≤ 16.7  at 1080p medium preset during explore+battle
 *   - frames_over_50ms === 0 after warm-up
 */

/** Named quality preset: 1080p medium (DPR + AA). */
export interface GraphicsPreset {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  /** Cap for renderer.setPixelRatio */
  readonly maxPixelRatio: number;
  readonly antialias: boolean;
  /** Frames discarded before gate window (shader compile, first layout). */
  readonly warmupFrames: number;
}

/** Reference machine preset for mode-4 F gates. */
export const MEDIUM_1080P: GraphicsPreset = {
  id: 'medium-1080p',
  width: 1920,
  height: 1080,
  maxPixelRatio: 1,
  antialias: true,
  warmupFrames: 120,
};

export const FRAME_GATES = {
  /** 60 Hz budget */
  p99_ms_max: 16.7,
  /** Long-frame hard fail after warm-up */
  long_frame_ms: 50,
  long_frame_max_count: 0,
} as const;

export interface FrameStatsSnapshot {
  samples: number;
  counted: number;
  warmupSkipped: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_ms: number;
  mean_ms: number;
  frames_over_16_7ms: number;
  frames_over_50ms: number;
  gate_p99_ok: boolean;
  gate_long_ok: boolean;
  gates_ok: boolean;
  presetId: string | null;
}

const DEFAULT_CAPACITY = 16_384;

export class FrameStats {
  readonly capacity: number;
  readonly warmupFrames: number;
  private buf: Float32Array;
  private cursor = 0;
  private filled = 0;
  private totalSeen = 0;
  private warmupSkipped = 0;
  private maxMs = 0;
  private sumMs = 0;
  private over167 = 0;
  private over50 = 0;
  private recording = true;
  presetId: string | null = null;

  constructor(opts?: {
    capacity?: number;
    warmupFrames?: number;
    presetId?: string | null;
  }) {
    this.capacity = opts?.capacity ?? DEFAULT_CAPACITY;
    this.warmupFrames = opts?.warmupFrames ?? MEDIUM_1080P.warmupFrames;
    this.presetId = opts?.presetId ?? null;
    this.buf = new Float32Array(this.capacity);
  }

  reset(presetId?: string | null): void {
    this.cursor = 0;
    this.filled = 0;
    this.totalSeen = 0;
    this.warmupSkipped = 0;
    this.maxMs = 0;
    this.sumMs = 0;
    this.over167 = 0;
    this.over50 = 0;
    this.recording = true;
    if (presetId !== undefined) this.presetId = presetId;
    this.buf.fill(0);
  }

  /** Push one frame duration in milliseconds. */
  push(ms: number): void {
    if (!this.recording || !Number.isFinite(ms) || ms < 0) return;
    this.totalSeen += 1;
    if (this.totalSeen <= this.warmupFrames) {
      this.warmupSkipped += 1;
      return;
    }
    const v = ms;
    this.buf[this.cursor % this.capacity] = v;
    this.cursor += 1;
    if (this.filled < this.capacity) this.filled += 1;
    this.sumMs += v;
    if (v > this.maxMs) this.maxMs = v;
    if (v > 16.7) this.over167 += 1;
    if (v > FRAME_GATES.long_frame_ms) this.over50 += 1;
  }

  stop(): void {
    this.recording = false;
  }

  start(): void {
    this.recording = true;
  }

  get sampleCount(): number {
    return this.filled;
  }

  /** Sorted copy of counted samples (post warm-up). */
  private sorted(): Float32Array {
    const n = this.filled;
    const out = new Float32Array(n);
    if (n === 0) return out;
    if (n < this.capacity) {
      out.set(this.buf.subarray(0, n));
    } else {
      // ring is full; order doesn't matter for percentile
      out.set(this.buf);
    }
    out.sort();
    return out;
  }

  private percentile(sorted: Float32Array, p: number): number {
    const n = sorted.length;
    if (n === 0) return 0;
    if (n === 1) return sorted[0]!;
    const idx = Math.min(n - 1, Math.max(0, Math.ceil((p / 100) * n) - 1));
    return sorted[idx]!;
  }

  snapshot(): FrameStatsSnapshot {
    const sorted = this.sorted();
    const n = sorted.length;
    const p99 = this.percentile(sorted, 99);
    const max = n === 0 ? 0 : this.maxMs;
    const mean = n === 0 ? 0 : this.sumMs / n;
    const gate_p99_ok = n > 0 && p99 <= FRAME_GATES.p99_ms_max;
    const gate_long_ok = this.over50 <= FRAME_GATES.long_frame_max_count;
    return {
      samples: this.totalSeen,
      counted: n,
      warmupSkipped: this.warmupSkipped,
      p50_ms: round3(this.percentile(sorted, 50)),
      p95_ms: round3(this.percentile(sorted, 95)),
      p99_ms: round3(p99),
      max_ms: round3(max),
      mean_ms: round3(mean),
      frames_over_16_7ms: this.over167,
      frames_over_50ms: this.over50,
      gate_p99_ok,
      gate_long_ok,
      gates_ok: gate_p99_ok && gate_long_ok && n > 0,
      presetId: this.presetId,
    };
  }
}

function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

/** Global default used by Engine and optional main hook. */
export const frameStats = new FrameStats({
  warmupFrames: MEDIUM_1080P.warmupFrames,
  presetId: MEDIUM_1080P.id,
});

/**
 * Apply medium-1080p (or other) preset to a WebGLRenderer-like object.
 * Main may call this later with one import; profile.mjs injects equivalent CSS size.
 */
export function applyGraphicsPreset(
  renderer: {
    setPixelRatio: (n: number) => void;
    setSize: (w: number, h: number, updateStyle?: boolean) => void;
  },
  preset: GraphicsPreset = MEDIUM_1080P,
  devicePr = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1,
): void {
  const pr = Math.min(devicePr, preset.maxPixelRatio);
  renderer.setPixelRatio(pr);
  renderer.setSize(preset.width, preset.height, false);
}

export function resolvePresetFromQuery(
  search: string,
): GraphicsPreset | null {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const p = q.get('preset') || q.get('quality');
  if (p === 'medium' || p === 'medium-1080p' || p === MEDIUM_1080P.id) {
    return MEDIUM_1080P;
  }
  return null;
}
