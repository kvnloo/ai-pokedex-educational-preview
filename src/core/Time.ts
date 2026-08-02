/**
 * Simulation clock with fixed-step accumulator (COD lineage, slim).
 * default fixed Hz = 60 for overworld/battle feel (COD uses 120 for FPS).
 */
export class Time {
  /** Seconds since boot (scaled). */
  elapsed = 0;
  /** Variable frame dt (clamped). */
  dt = 0;
  /** Fixed step seconds. */
  readonly fixedDt: number;
  scale = 1;
  private accum = 0;
  private last = 0;
  private started = false;

  constructor(fixedHz = 60) {
    this.fixedDt = 1 / fixedHz;
  }

  beginFrame(nowMs: number): void {
    if (!this.started) {
      this.last = nowMs;
      this.started = true;
      this.dt = this.fixedDt;
      return;
    }
    const raw = ((nowMs - this.last) / 1000) * this.scale;
    this.last = nowMs;
    this.dt = Math.min(0.1, Math.max(0, raw));
    this.elapsed += this.dt;
    this.accum += this.dt;
  }

  /** Drain fixed steps; returns how many to run. Cap prevents spiral of death. */
  takeFixedSteps(max = 5): number {
    let n = 0;
    while (this.accum >= this.fixedDt && n < max) {
      this.accum -= this.fixedDt;
      n += 1;
    }
    if (this.accum > this.fixedDt * max) this.accum = 0;
    return n;
  }

  /** Interpolation alpha for presentation after fixed steps. */
  alpha(): number {
    return Math.min(1, this.accum / this.fixedDt);
  }
}
