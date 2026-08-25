export const SAVE_VERSION = 2 as const;

type StoryEvent = { id: string; locationId: string; order: number };
type CampaignContract = { sliceId: string; path: readonly string[]; events: readonly StoryEvent[] };
type CampaignEvent = {
  sequence: number;
  type: 'starter-chosen' | 'location-entered' | 'encounter-began' | 'battle-resolved' | 'healed';
  payload: Record<string, string | number | boolean | null>;
  hash: string;
};

type CampaignSave = {
  version: typeof SAVE_VERSION;
  sliceId: string;
  currentLocationId: string;
  visitedLocationIds: string[];
  storyEventIds: string[];
  traversedMeters: number;
  saveRevision: number;
  starterSpeciesId: string | null;
  partySpeciesIds: string[];
  eventLog: CampaignEvent[];
  seed: number;
  finalHash: string;
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function fnv1a64(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

function validateContract(contract: CampaignContract): void {
  if (!contract.sliceId || contract.path.length < 2 || new Set(contract.path).size !== contract.path.length) {
    throw new Error('Invalid campaign contract');
  }
  let prior = 0;
  for (const event of contract.events) {
    if (!contract.path.includes(event.locationId) || event.order <= prior) throw new Error('Invalid ordered story event contract');
    prior = event.order;
  }
}

export function migrateCampaignSave(raw: unknown, contract: CampaignContract): CampaignSave {
  validateContract(contract);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid campaign save');
  const candidate = raw as Partial<CampaignSave> & { version?: number };
  if (candidate.sliceId !== contract.sliceId) throw new Error('Campaign save slice mismatch');
  const index = contract.path.indexOf(String(candidate.currentLocationId));
  if (index < 0) throw new Error('Campaign save location mismatch');
  const visited = contract.path.slice(0, index + 1);
  const allowedEvents = contract.events.filter((event) => visited.includes(event.locationId)).map((event) => event.id);
  const party = Array.isArray(candidate.partySpeciesIds) ? candidate.partySpeciesIds.filter((id): id is string => typeof id === 'string') : [];
  return {
    version: SAVE_VERSION,
    sliceId: contract.sliceId,
    currentLocationId: visited.at(-1)!,
    visitedLocationIds: [...visited],
    storyEventIds: allowedEvents.filter((id) => candidate.storyEventIds?.includes(id)),
    traversedMeters: Math.max(0, Number(candidate.traversedMeters) || 0),
    saveRevision: Math.max(0, Math.floor(Number(candidate.saveRevision) || 0)),
    starterSpeciesId: typeof candidate.starterSpeciesId === 'string' ? candidate.starterSpeciesId : null,
    partySpeciesIds: party,
    eventLog: Array.isArray(candidate.eventLog) ? candidate.eventLog : [],
    seed: Number.isSafeInteger(candidate.seed) ? Number(candidate.seed) : 0,
    finalHash: typeof candidate.finalHash === 'string' ? candidate.finalHash : fnv1a64('genesis'),
  };
}

export class CampaignEngine {
  readonly #contract: CampaignContract;
  #state: CampaignSave;

  constructor(contract: CampaignContract, options: { seed: number }) {
    validateContract(contract);
    this.#contract = contract;
    this.#state = {
      version: SAVE_VERSION,
      sliceId: contract.sliceId,
      currentLocationId: contract.path[0]!,
      visitedLocationIds: [contract.path[0]!],
      storyEventIds: contract.events.filter((event) => event.locationId === contract.path[0]).map((event) => event.id),
      traversedMeters: 0,
      saveRevision: 0,
      starterSpeciesId: null,
      partySpeciesIds: [],
      eventLog: [],
      seed: options.seed,
      finalHash: fnv1a64('genesis'),
    };
  }

  static replay(contract: CampaignContract, events: readonly CampaignEvent[]): CampaignEngine {
    const engine = new CampaignEngine(contract, { seed: 0 });
    for (const event of events) {
      if (event.type === 'starter-chosen') engine.chooseStarter(String(event.payload.speciesId));
      else if (event.type === 'location-entered') engine.enterLocation(String(event.payload.locationId));
      else if (event.type === 'encounter-began') engine.beginEncounter(String(event.payload.speciesId));
      else if (event.type === 'battle-resolved') engine.resolveBattle({ turns: Number(event.payload.turns), caughtSpeciesId: typeof event.payload.caughtSpeciesId === 'string' ? event.payload.caughtSpeciesId : undefined });
      else if (event.type === 'healed') engine.heal();
    }
    return engine;
  }

  static restore(contract: CampaignContract, raw: unknown): CampaignEngine {
    const save = migrateCampaignSave(raw, contract);
    const engine = CampaignEngine.replay(contract, save.eventLog);
    if (engine.#state.finalHash !== save.finalHash) throw new Error('Campaign event journal hash mismatch');
    return engine;
  }

  #append(type: CampaignEvent['type'], payload: CampaignEvent['payload']): void {
    const body = { sequence: this.#state.eventLog.length + 1, type, payload, previousHash: this.#state.finalHash };
    const event = { sequence: body.sequence, type, payload, hash: fnv1a64(stable(body)) };
    this.#state.eventLog.push(event);
    this.#state.finalHash = event.hash;
    this.#state.saveRevision += 1;
  }

  chooseStarter(speciesId: string): void {
    if (!speciesId || this.#state.starterSpeciesId) throw new Error('Starter already chosen or invalid');
    this.#state.starterSpeciesId = speciesId;
    this.#state.partySpeciesIds = [speciesId];
    this.#append('starter-chosen', { speciesId });
  }

  enterLocation(locationId: string): void {
    if (!this.#state.starterSpeciesId) throw new Error('Choose a starter first');
    const expected = this.#contract.path[this.#state.visitedLocationIds.length];
    if (locationId !== expected) throw new Error(`Invalid traversal: expected ${expected}`);
    this.#state.currentLocationId = locationId;
    this.#state.visitedLocationIds.push(locationId);
    for (const event of this.#contract.events) {
      if (event.locationId === locationId && !this.#state.storyEventIds.includes(event.id)) this.#state.storyEventIds.push(event.id);
    }
    this.#append('location-entered', { locationId });
  }

  beginEncounter(speciesId: string): void {
    if (this.#state.visitedLocationIds.length < 2) throw new Error('Encounter boundary requires Route 1');
    this.#append('encounter-began', { speciesId });
  }

  resolveBattle(result: { turns: number; caughtSpeciesId?: string }): void {
    if (this.#state.eventLog.at(-1)?.type !== 'encounter-began') throw new Error('No active encounter');
    if (!Number.isInteger(result.turns) || result.turns < 1) throw new Error('Battle must contain a turn');
    if (result.caughtSpeciesId && !this.#state.partySpeciesIds.includes(result.caughtSpeciesId)) this.#state.partySpeciesIds.push(result.caughtSpeciesId);
    this.#append('battle-resolved', { turns: result.turns, caughtSpeciesId: result.caughtSpeciesId ?? null });
  }

  heal(): void { this.#append('healed', {}); }

  snapshot(): CampaignSave { return structuredClone(this.#state); }
}

type InputSources = {
  keys: ReadonlySet<string>;
  touch?: { x: number; y: number };
  gamepad?: { x: number; y: number; interact?: boolean };
};

export function normalizeInputFrame(sources: InputSources): { x: number; y: number; interact: boolean } {
  let x = (sources.keys.has('d') || sources.keys.has('arrowright') ? 1 : 0) - (sources.keys.has('a') || sources.keys.has('arrowleft') ? 1 : 0);
  let y = (sources.keys.has('s') || sources.keys.has('arrowdown') ? 1 : 0) - (sources.keys.has('w') || sources.keys.has('arrowup') ? 1 : 0);
  x += sources.touch?.x ?? 0;
  y += sources.touch?.y ?? 0;
  x += sources.gamepad?.x ?? 0;
  y += sources.gamepad?.y ?? 0;
  const length = Math.hypot(x, y);
  if (length > 1) { x /= length; y /= length; }
  return { x, y, interact: sources.keys.has('e') || sources.gamepad?.interact === true };
}

type AssetRuntimeContract = Record<string, { markerHref: string; policy: 'private-only' | 'distributable' }>;
export function resolveRuntimeAssetProfile(profile: 'private-local' | 'distributable', contract: AssetRuntimeContract) {
  const selected = contract[profile];
  if (!selected || (profile === 'distributable' && selected.policy !== 'distributable')) throw new Error(`Runtime asset profile ${profile} unavailable`);
  return { profile, markerHref: selected.markerHref, policy: selected.policy };
}
