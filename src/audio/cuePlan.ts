/**
 * Pure score planner for Twilight Route's original procedural soundscape.
 *
 * Keeping cue composition separate from WebAudio makes timing deterministic,
 * testable, and replayable without loading a single binary audio asset.
 */

export type SoundCue =
  | 'starter-confirm'
  | 'step'
  | 'grass-rustle'
  | 'encounter'
  | 'battle-start'
  | 'move'
  | 'hit'
  | 'catch-throw'
  | 'catch-shake'
  | 'catch-success'
  | 'heal'
  | 'victory'
  | 'ui-confirm';

export interface CuePlanOptions {
  /** Stable cue variation seed. */
  seed?: number;
  /** 0..1 performance intensity. */
  intensity?: number;
}

interface BasePlanEvent {
  at: number;
  duration: number;
  gain: number;
  pan?: number;
}

export interface TonePlanEvent extends BasePlanEvent {
  kind: 'tone';
  frequency: number;
  endFrequency?: number;
  wave: OscillatorType;
}

export interface NoisePlanEvent extends BasePlanEvent {
  kind: 'noise';
  filter: BiquadFilterType;
  frequency: number;
  endFrequency?: number;
  q: number;
}

export type CuePlanEvent = TonePlanEvent | NoisePlanEvent;

export interface CuePlan {
  cue: SoundCue;
  duration: number;
  events: CuePlanEvent[];
}

export type SoundScene = 'starter' | 'explore' | 'battle';

export interface AmbientToneVoice {
  kind: 'tone';
  frequency: number;
  gain: number;
  wave: OscillatorType;
  detune: number;
  tremoloHz: number;
  tremoloDepth: number;
}

export interface AmbientNoiseVoice {
  kind: 'noise';
  gain: number;
  filter: BiquadFilterType;
  frequency: number;
  q: number;
  driftHz: number;
  driftDepth: number;
}

export type AmbientVoice = AmbientToneVoice | AmbientNoiseVoice;

export interface ScenePlan {
  scene: SoundScene;
  crossfadeMs: number;
  voices: AmbientVoice[];
}

export interface ScenePlanOptions {
  seed?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function tone(
  at: number,
  duration: number,
  frequency: number,
  gain: number,
  wave: OscillatorType,
  extras: Pick<TonePlanEvent, 'endFrequency' | 'pan'> = {},
): TonePlanEvent {
  return { kind: 'tone', at, duration, frequency, gain, wave, ...extras };
}

function noise(
  at: number,
  duration: number,
  frequency: number,
  gain: number,
  filter: BiquadFilterType,
  q: number,
  extras: Pick<NoisePlanEvent, 'endFrequency' | 'pan'> = {},
): NoisePlanEvent {
  return { kind: 'noise', at, duration, frequency, gain, filter, q, ...extras };
}

function motif(
  cue: SoundCue,
  notes: readonly number[],
  options: {
    gain: number;
    step: number;
    duration: number;
    wave: OscillatorType;
    intensity: number;
    panWidth?: number;
  },
): CuePlan {
  const panWidth = options.panWidth ?? 0.1;
  const events = notes.map((frequency, index) =>
    tone(
      index * options.step,
      options.duration,
      frequency,
      options.gain * options.intensity,
      options.wave,
      { pan: (index - (notes.length - 1) / 2) * panWidth },
    ),
  );
  return {
    cue,
    duration: (notes.length - 1) * options.step + options.duration + 0.06,
    events,
  };
}

export function buildCuePlan(
  cue: SoundCue,
  options: CuePlanOptions = {},
): CuePlan {
  const intensity = clamp01(options.intensity ?? 1);
  const random = seeded(options.seed ?? 1);
  const jitter = (span: number): number => (random() * 2 - 1) * span;

  switch (cue) {
    case 'starter-confirm':
      return motif(cue, [392, 523.25, 659.25], {
        gain: 0.105,
        step: 0.1,
        duration: 0.32,
        wave: 'triangle',
        intensity,
        panWidth: 0.11,
      });
    case 'step':
      return {
        cue,
        duration: 0.12,
        events: [
          noise(0, 0.055, 1150 + jitter(120), 0.027 * intensity, 'bandpass', 0.7, {
            pan: jitter(0.24),
          }),
          tone(0, 0.07, 92 + jitter(5), 0.018 * intensity, 'sine'),
        ],
      };
    case 'grass-rustle':
      return {
        cue,
        duration: 0.34,
        events: [
          noise(0, 0.24, 1850 + jitter(260), 0.045 * intensity, 'bandpass', 0.85, {
            endFrequency: 980 + jitter(120),
            pan: jitter(0.35),
          }),
          noise(0.08, 0.19, 2550 + jitter(320), 0.025 * intensity, 'highpass', 0.45, {
            pan: jitter(0.4),
          }),
        ],
      };
    case 'encounter':
      return {
        cue,
        duration: 0.72,
        events: [
          tone(0, 0.42, 146.83, 0.11 * intensity, 'sawtooth', {
            endFrequency: 587.33 + jitter(12),
          }),
          tone(0.2, 0.3, 440, 0.08 * intensity, 'triangle', { pan: -0.16 }),
          tone(0.31, 0.3, 659.25, 0.08 * intensity, 'triangle', { pan: 0.16 }),
        ],
      };
    case 'battle-start':
      return motif(cue, [196, 293.66, 392, 587.33], {
        gain: 0.085,
        step: 0.075,
        duration: 0.24,
        wave: 'sawtooth',
        intensity,
        panWidth: 0.08,
      });
    case 'move':
      return {
        cue,
        duration: 0.31,
        events: [
          tone(0, 0.24, 185 + jitter(18), 0.075 * intensity, 'sawtooth', {
            endFrequency: 720 + jitter(85),
            pan: jitter(0.25),
          }),
          noise(0.04, 0.16, 1350 + jitter(180), 0.026 * intensity, 'bandpass', 1.2),
        ],
      };
    case 'hit':
      return {
        cue,
        duration: 0.24,
        events: [
          noise(0, 0.13, 620 + jitter(90), 0.12 * intensity, 'lowpass', 0.75, {
            endFrequency: 170,
            pan: jitter(0.18),
          }),
          tone(0, 0.18, 78 + jitter(5), 0.12 * intensity, 'sine', {
            endFrequency: 52,
          }),
        ],
      };
    case 'catch-throw':
      return {
        cue,
        duration: 0.48,
        events: [
          tone(0, 0.4, 330 + jitter(9), 0.07 * intensity, 'sine', {
            endFrequency: 1174.66 + jitter(22),
            pan: -0.28,
          }),
          noise(0.07, 0.22, 2100, 0.02 * intensity, 'highpass', 0.5, { pan: 0.22 }),
        ],
      };
    case 'catch-shake':
      return {
        cue,
        duration: 0.27,
        events: [
          noise(0, 0.075, 760 + jitter(75), 0.07 * intensity, 'bandpass', 1.6, {
            pan: -0.22,
          }),
          tone(0.045, 0.13, 210 + jitter(8), 0.045 * intensity, 'triangle', {
            pan: 0.18,
          }),
          noise(0.11, 0.07, 980 + jitter(80), 0.045 * intensity, 'bandpass', 1.2, {
            pan: 0.24,
          }),
        ],
      };
    case 'catch-success':
      return motif(cue, [523.25, 659.25, 783.99, 987.77], {
        gain: 0.13,
        step: 0.12,
        duration: 0.28,
        wave: 'triangle',
        intensity,
        panWidth: 0.08,
      });
    case 'heal':
      return motif(cue, [392, 493.88, 587.33, 783.99], {
        gain: 0.09,
        step: 0.09,
        duration: 0.48,
        wave: 'sine',
        intensity,
        panWidth: 0.12,
      });
    case 'victory':
      return motif(cue, [261.63, 329.63, 392, 523.25, 659.25], {
        gain: 0.105,
        step: 0.11,
        duration: 0.36,
        wave: 'triangle',
        intensity,
        panWidth: 0.07,
      });
    case 'ui-confirm':
      return {
        cue,
        duration: 0.15,
        events: [tone(0, 0.11, 698.46, 0.042 * intensity, 'sine', { endFrequency: 880 })],
      };
  }
}

/** Layered, looping scene beds. Noise is synthesized at runtime from a seeded buffer. */
export function buildScenePlan(
  scene: SoundScene,
  options: ScenePlanOptions = {},
): ScenePlan {
  const random = seeded(options.seed ?? 1);
  const detune = (): number => (random() * 2 - 1) * 4;

  switch (scene) {
    case 'starter':
      return {
        scene,
        crossfadeMs: 720,
        voices: [
          {
            kind: 'tone',
            frequency: 98,
            gain: 0.028,
            wave: 'sine',
            detune: detune(),
            tremoloHz: 0.09,
            tremoloDepth: 0.18,
          },
          {
            kind: 'tone',
            frequency: 146.83,
            gain: 0.018,
            wave: 'triangle',
            detune: detune(),
            tremoloHz: 0.13,
            tremoloDepth: 0.22,
          },
          {
            kind: 'noise',
            gain: 0.013,
            filter: 'lowpass',
            frequency: 820,
            q: 0.45,
            driftHz: 0.06,
            driftDepth: 180,
          },
        ],
      };
    case 'explore':
      return {
        scene,
        crossfadeMs: 900,
        voices: [
          {
            kind: 'tone',
            frequency: 110,
            gain: 0.022,
            wave: 'sine',
            detune: detune(),
            tremoloHz: 0.08,
            tremoloDepth: 0.16,
          },
          {
            kind: 'tone',
            frequency: 164.81,
            gain: 0.012,
            wave: 'triangle',
            detune: detune(),
            tremoloHz: 0.11,
            tremoloDepth: 0.2,
          },
          {
            kind: 'noise',
            gain: 0.021,
            filter: 'bandpass',
            frequency: 1380,
            q: 0.36,
            driftHz: 0.05,
            driftDepth: 420,
          },
        ],
      };
    case 'battle':
      return {
        scene,
        crossfadeMs: 360,
        voices: [
          {
            kind: 'tone',
            frequency: 73.42,
            gain: 0.035,
            wave: 'sawtooth',
            detune: detune(),
            tremoloHz: 2.4,
            tremoloDepth: 0.42,
          },
          {
            kind: 'tone',
            frequency: 110,
            gain: 0.021,
            wave: 'triangle',
            detune: detune(),
            tremoloHz: 1.2,
            tremoloDepth: 0.3,
          },
          {
            kind: 'noise',
            gain: 0.018,
            filter: 'lowpass',
            frequency: 460,
            q: 0.75,
            driftHz: 0.32,
            driftDepth: 120,
          },
        ],
      };
  }
}
