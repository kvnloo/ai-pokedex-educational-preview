import {
  buildCuePlan,
  buildScenePlan,
  type CuePlanEvent,
  type SoundCue,
  type SoundScene,
} from './cuePlan.ts';

export interface ProceduralSoundscapeOptions {
  /** Injection seam for tests; production defaults to AudioContext/webkitAudioContext. */
  contextFactory?: () => AudioContext;
  /** 0..1 output trim before the safety compressor. */
  masterGain?: number;
  /** Stable seed for generated noise and cue variation. */
  seed?: number;
}

export interface SoundscapeSnapshot {
  contextState: AudioContextState | 'uninitialized' | 'closed';
  scene: SoundScene | null;
  muted: boolean;
  masterGain: number;
  cueCount: number;
  activeVoices: number;
  disposed: boolean;
}

export interface CueOptions {
  intensity?: number;
  seed?: number;
}

export interface ProceduralSoundscape {
  /** Create/resume audio after a trusted user gesture. Safe to call repeatedly. */
  resume(): Promise<SoundscapeSnapshot>;
  /** Crossfade the persistent starter/explore/battle bed. */
  setScene(scene: SoundScene): Promise<SoundscapeSnapshot>;
  /** Schedule a short synthesized gameplay cue. */
  cue(cue: SoundCue, options?: CueOptions): Promise<SoundscapeSnapshot>;
  setMuted(muted: boolean): void;
  setMasterGain(gain: number): void;
  snapshot(): SoundscapeSnapshot;
  dispose(): void;
}

interface AmbientHandle {
  sources: AudioScheduledSourceNode[];
  nodes: AudioNode[];
  gain: GainNode;
  voiceCount: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function defaultContextFactory(): AudioContext {
  const scope = globalThis as typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };
  const Context = scope.AudioContext ?? scope.webkitAudioContext;
  if (!Context) throw new Error('WebAudio AudioContext is unavailable');
  return new Context({ latencyHint: 'interactive' });
}

function setNow(param: AudioParam, value: number, now: number): void {
  param.cancelScheduledValues(now);
  param.setValueAtTime(value, now);
}

function rampGain(param: AudioParam, value: number, now: number, seconds = 0.04): void {
  param.cancelScheduledValues(now);
  param.setValueAtTime(Math.max(0.0001, param.value), now);
  param.exponentialRampToValueAtTime(Math.max(0.0001, value), now + seconds);
}

function stopSource(source: AudioScheduledSourceNode, when = 0): void {
  try {
    source.stop(when);
  } catch {
    // Already stopped sources throw in some engines; disposal remains idempotent.
  }
}

function disconnect(node: AudioNode): void {
  try {
    node.disconnect();
  } catch {
    // A never-connected or already-disconnected node is harmless.
  }
}

/**
 * Original runtime soundscape: oscillators + generated noise only. There are no
 * fetches, media elements, decoded files, sample URLs, or third-party audio.
 */
export function createProceduralSoundscape(
  options: ProceduralSoundscapeOptions = {},
): ProceduralSoundscape {
  const contextFactory = options.contextFactory ?? defaultContextFactory;
  const baseSeed = options.seed ?? 0x51a7e;
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let compressor: DynamicsCompressorNode | null = null;
  let ambienceBus: GainNode | null = null;
  let cueBus: GainNode | null = null;
  let ambient: AmbientHandle | null = null;
  let scene: SoundScene | null = null;
  let muted = false;
  let outputGain = clamp01(options.masterGain ?? 0.72);
  let cueCount = 0;
  let ambientVoiceCount = 0;
  let disposed = false;
  let variation = 0;
  const activeCueSources = new Set<AudioScheduledSourceNode>();

  const contextState = (): SoundscapeSnapshot['contextState'] => {
    if (disposed) return 'closed';
    return context?.state ?? 'uninitialized';
  };

  const snapshot = (): SoundscapeSnapshot => ({
    contextState: contextState(),
    scene,
    muted,
    masterGain: outputGain,
    cueCount,
    activeVoices: ambientVoiceCount + activeCueSources.size,
    disposed,
  });

  const makeNoiseBuffer = (seconds: number, seed: number): AudioBuffer => {
    if (!context) throw new Error('soundscape context unavailable');
    const length = Math.max(1, Math.ceil(context.sampleRate * seconds));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let state = seed >>> 0;
    let previous = 0;
    for (let index = 0; index < channel.length; index += 1) {
      // Mulberry-derived white source, lightly correlated for less brittle wind.
      state = (state + 0x6d2b79f5) | 0;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      const white = (((value ^ (value >>> 14)) >>> 0) / 2147483648) - 1;
      previous = previous * 0.18 + white * 0.82;
      channel[index] = previous * 0.72;
    }
    return buffer;
  };

  const ensureContext = (): AudioContext => {
    if (disposed) throw new Error('procedural soundscape is disposed');
    if (context) return context;

    context = contextFactory();
    const now = context.currentTime;
    master = context.createGain();
    compressor = context.createDynamicsCompressor();
    ambienceBus = context.createGain();
    cueBus = context.createGain();

    setNow(master.gain, muted ? 0.0001 : outputGain, now);
    setNow(ambienceBus.gain, 1, now);
    setNow(cueBus.gain, 1, now);
    setNow(compressor.threshold, -18, now);
    setNow(compressor.knee, 16, now);
    setNow(compressor.ratio, 5, now);
    setNow(compressor.attack, 0.008, now);
    setNow(compressor.release, 0.2, now);

    ambienceBus.connect(master);
    cueBus.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);
    return context;
  };

  const resume = async (): Promise<SoundscapeSnapshot> => {
    const ctx = ensureContext();
    if (ctx.state === 'suspended') await ctx.resume();
    return snapshot();
  };

  const stopAmbient = (handle: AmbientHandle | null, fadeSeconds: number): void => {
    if (!handle || !context) return;
    const now = context.currentTime;
    rampGain(handle.gain.gain, 0.0001, now, Math.max(0.02, fadeSeconds));
    const stopAt = now + Math.max(0.03, fadeSeconds) + 0.04;
    for (const source of handle.sources) stopSource(source, stopAt);
    // Disconnect after scheduled stop where possible. This timer carries no audio data.
    globalThis.setTimeout(() => {
      for (const node of handle.nodes) disconnect(node);
    }, Math.ceil((fadeSeconds + 0.08) * 1000));
  };

  const makeAmbient = (nextScene: SoundScene): AmbientHandle => {
    if (!context || !ambienceBus) throw new Error('soundscape graph unavailable');
    const plan = buildScenePlan(nextScene, { seed: baseSeed + variation });
    const now = context.currentTime;
    const fadeSeconds = plan.crossfadeMs / 1000;
    const group = context.createGain();
    setNow(group.gain, 0.0001, now);
    group.gain.exponentialRampToValueAtTime(1, now + Math.max(0.03, fadeSeconds));
    group.connect(ambienceBus);
    const sources: AudioScheduledSourceNode[] = [];
    const nodes: AudioNode[] = [group];

    for (let index = 0; index < plan.voices.length; index += 1) {
      const voice = plan.voices[index]!;
      if (voice.kind === 'tone') {
        const oscillator = context.createOscillator();
        const voiceGain = context.createGain();
        const tremolo = context.createOscillator();
        const tremoloGain = context.createGain();
        oscillator.type = voice.wave;
        setNow(oscillator.frequency, voice.frequency, now);
        setNow(oscillator.detune, voice.detune, now);
        setNow(voiceGain.gain, Math.max(0.0001, voice.gain * (1 - voice.tremoloDepth)), now);
        tremolo.type = 'sine';
        setNow(tremolo.frequency, voice.tremoloHz, now);
        setNow(tremoloGain.gain, voice.gain * voice.tremoloDepth, now);
        tremolo.connect(tremoloGain);
        tremoloGain.connect(voiceGain.gain);
        oscillator.connect(voiceGain);
        voiceGain.connect(group);
        oscillator.start(now);
        tremolo.start(now);
        sources.push(oscillator, tremolo);
        nodes.push(oscillator, voiceGain, tremolo, tremoloGain);
      } else {
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const voiceGain = context.createGain();
        const drift = context.createOscillator();
        const driftGain = context.createGain();
        source.buffer = makeNoiseBuffer(4, baseSeed + variation * 97 + index * 811);
        source.loop = true;
        filter.type = voice.filter;
        setNow(filter.frequency, voice.frequency, now);
        setNow(filter.Q, voice.q, now);
        setNow(voiceGain.gain, voice.gain, now);
        drift.type = 'sine';
        setNow(drift.frequency, voice.driftHz, now);
        setNow(driftGain.gain, voice.driftDepth, now);
        drift.connect(driftGain);
        driftGain.connect(filter.frequency);
        source.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(group);
        source.start(now);
        drift.start(now);
        sources.push(source, drift);
        nodes.push(source, filter, voiceGain, drift, driftGain);
      }
    }

    return { sources, nodes, gain: group, voiceCount: plan.voices.length };
  };

  const setScene = async (nextScene: SoundScene): Promise<SoundscapeSnapshot> => {
    await resume();
    if (scene === nextScene && ambient) return snapshot();
    variation += 1;
    const previous = ambient;
    const plan = buildScenePlan(nextScene, { seed: baseSeed + variation });
    ambient = makeAmbient(nextScene);
    ambientVoiceCount = ambient.voiceCount;
    scene = nextScene;
    stopAmbient(previous, plan.crossfadeMs / 1000);
    return snapshot();
  };

  const connectWithPan = (
    source: AudioNode,
    gain: GainNode,
    pan: number | undefined,
  ): AudioNode[] => {
    if (!context || !cueBus) throw new Error('soundscape cue graph unavailable');
    const nodes: AudioNode[] = [source, gain];
    source.connect(gain);
    if (pan != null && typeof context.createStereoPanner === 'function') {
      const panner = context.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), context.currentTime);
      gain.connect(panner);
      panner.connect(cueBus);
      nodes.push(panner);
    } else {
      gain.connect(cueBus);
    }
    return nodes;
  };

  const scheduleCueEvent = (event: CuePlanEvent, cueSeed: number): void => {
    if (!context) throw new Error('soundscape context unavailable');
    const start = context.currentTime + 0.012 + event.at;
    const end = start + Math.max(0.025, event.duration);
    const eventGain = context.createGain();
    setNow(eventGain.gain, 0.0001, start);
    eventGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, event.gain),
      start + Math.min(0.018, event.duration * 0.25),
    );
    eventGain.gain.exponentialRampToValueAtTime(0.0001, end);

    let source: AudioScheduledSourceNode;
    let nodes: AudioNode[];
    if (event.kind === 'tone') {
      const oscillator = context.createOscillator();
      oscillator.type = event.wave;
      setNow(oscillator.frequency, Math.max(1, event.frequency), start);
      if (event.endFrequency != null) {
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(1, event.endFrequency),
          end,
        );
      }
      source = oscillator;
      nodes = connectWithPan(oscillator, eventGain, event.pan);
    } else {
      const noiseSource = context.createBufferSource();
      const filter = context.createBiquadFilter();
      noiseSource.buffer = makeNoiseBuffer(
        Math.max(0.08, event.duration + 0.03),
        cueSeed,
      );
      filter.type = event.filter;
      setNow(filter.frequency, Math.max(20, event.frequency), start);
      setNow(filter.Q, Math.max(0.0001, event.q), start);
      if (event.endFrequency != null) {
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(20, event.endFrequency),
          end,
        );
      }
      noiseSource.connect(filter);
      nodes = [noiseSource, filter, ...connectWithPan(filter, eventGain, event.pan).slice(1)];
      source = noiseSource;
    }

    activeCueSources.add(source);
    source.onended = () => {
      activeCueSources.delete(source);
      for (const node of nodes) disconnect(node);
    };
    source.start(start);
    source.stop(end + 0.025);
  };

  const cue = async (
    cueName: SoundCue,
    cueOptions: CueOptions = {},
  ): Promise<SoundscapeSnapshot> => {
    await resume();
    const cueSeed = cueOptions.seed ?? baseSeed + cueCount * 4099 + 17;
    const plan = buildCuePlan(cueName, {
      seed: cueSeed,
      intensity: cueOptions.intensity,
    });
    for (let index = 0; index < plan.events.length; index += 1) {
      scheduleCueEvent(plan.events[index]!, cueSeed + index * 131);
    }
    cueCount += 1;
    return snapshot();
  };

  const setMuted = (nextMuted: boolean): void => {
    muted = nextMuted;
    if (context && master) {
      rampGain(master.gain, muted ? 0.0001 : outputGain, context.currentTime, 0.035);
    }
  };

  const setMasterGain = (gain: number): void => {
    outputGain = clamp01(gain);
    if (context && master && !muted) {
      rampGain(master.gain, outputGain, context.currentTime, 0.035);
    }
  };

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    if (ambient) {
      for (const source of ambient.sources) stopSource(source);
      for (const node of ambient.nodes) disconnect(node);
    }
    ambient = null;
    ambientVoiceCount = 0;
    for (const source of activeCueSources) stopSource(source);
    activeCueSources.clear();
    disconnect(ambienceBus as AudioNode);
    disconnect(cueBus as AudioNode);
    disconnect(master as AudioNode);
    disconnect(compressor as AudioNode);
    if (context && context.state !== 'closed') void context.close();
    scene = null;
  };

  return {
    resume,
    setScene,
    cue,
    setMuted,
    setMasterGain,
    snapshot,
    dispose,
  };
}
