export type SharedClientContract = {
  schemaVersion: string;
  intentOnlyClient: boolean;
};

export type CanonicalRuntime = {
  sliceId: string;
  activeGameId: string;
  path: string[];
};

export type MovementIntent = {
  sequence: number;
  from_location_id: string;
  expected_location_id: string;
};

export type ReplayEvent = {
  sequence: number;
  type: string;
  actor: string;
  target: string;
  amount: number;
};

export type BattleReplay = {
  schema_version: string;
  replay_id: string;
  initial_hp: Record<string, number>;
  events: ReplayEvent[];
  expected_winner: string;
  expected_final_hash: string;
};

export type SaveSnapshot = {
  location_id: string;
  last_intent_sequence: number;
  last_battle_replay_id: string;
  last_battle_final_hash: string;
};

export type ReplayParityEvidence = {
  schemaVersion: string;
  contentHash: string;
  replayHash: string;
  finalHash: string;
  orderedEvents: number;
  movementLocation: string;
  saveAcknowledged: boolean;
};

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function evaluateAuthoritativeReplay(
  contract: SharedClientContract,
  runtime: CanonicalRuntime,
  intent: MovementIntent,
  replay: BattleReplay,
  save: SaveSnapshot,
): Promise<ReplayParityEvidence> {
  if (!contract.intentOnlyClient) throw new Error('frontend clients must remain intent-only');
  if (intent.from_location_id !== runtime.path[0] || !runtime.path.includes(intent.expected_location_id)) {
    throw new Error('movement intent is outside canonical runtime path');
  }
  const sequences = replay.events.map(({ sequence }) => sequence);
  if (sequences.some((sequence, index) => sequence !== index + 1)) {
    throw new Error('battle replay events are not contiguous');
  }

  const hp = { ...replay.initial_hp };
  for (const event of replay.events) {
    if (event.type !== 'damage' || !(event.target in hp)) throw new Error(`unsupported authoritative event: ${event.type}`);
    hp[event.target] = Math.max(0, hp[event.target]! - event.amount);
  }

  const contentCanonical = [
    contract.schemaVersion,
    runtime.sliceId,
    runtime.activeGameId,
    runtime.path.join(','),
    `${intent.sequence}:${intent.from_location_id}->${intent.expected_location_id}`,
    replay.replay_id,
  ].join('|');
  const replayCanonical = replay.events
    .map((event) => `${event.sequence}:${event.type}:${event.actor}:${event.target}:${event.amount}`)
    .join('|');
  const finalCanonical = `${replay.schema_version}|training_red:${hp.training_red}|training_blue:${hp.training_blue}|winner:${replay.expected_winner}|events:${replay.events.length}`;
  const [contentHash, replayHash, finalHash] = await Promise.all([
    sha256(contentCanonical),
    sha256(replayCanonical),
    sha256(finalCanonical),
  ]);
  if (finalHash !== replay.expected_final_hash) throw new Error('authoritative replay final hash mismatch');
  const saveAcknowledged = save.location_id === intent.expected_location_id
    && save.last_intent_sequence === intent.sequence
    && save.last_battle_replay_id === replay.replay_id
    && save.last_battle_final_hash === finalHash;
  if (!saveAcknowledged) throw new Error('save snapshot does not acknowledge shared intent/replay');

  return {
    schemaVersion: contract.schemaVersion,
    contentHash,
    replayHash,
    finalHash,
    orderedEvents: replay.events.length,
    movementLocation: intent.expected_location_id,
    saveAcknowledged,
  };
}
