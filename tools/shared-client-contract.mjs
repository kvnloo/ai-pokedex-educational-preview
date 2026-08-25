import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), 'utf8'));

export function consumeSharedClientContract() {
  const contract = readJson('contracts/shared/v1/contract.json');
  const runtime = readJson(contract.canonicalRuntime);
  const intent = readJson('contracts/shared/fixtures/movement-intent.json');
  const replay = readJson('contracts/shared/fixtures/battle-replay.json');
  const save = readJson('contracts/shared/fixtures/save.json');

  if (!contract.intentOnlyClient) throw new Error('browser client must remain intent-only');
  if (intent.from_location_id !== runtime.path[0] || !runtime.path.includes(intent.expected_location_id)) {
    throw new Error('movement intent is outside canonical runtime path');
  }
  const expectedSequences = replay.events.map((_, index) => index + 1);
  if (JSON.stringify(replay.events.map(({ sequence }) => sequence)) !== JSON.stringify(expectedSequences)) {
    throw new Error('battle replay events are not contiguous');
  }
  const hp = { ...replay.initial_hp };
  for (const event of replay.events) {
    if (event.type !== 'damage') throw new Error(`unsupported authoritative event: ${event.type}`);
    hp[event.target] = Math.max(0, hp[event.target] - event.amount);
  }
  const canonical = `${replay.schema_version}|training_red:${hp.training_red}|training_blue:${hp.training_blue}|winner:${replay.expected_winner}|events:${replay.events.length}`;
  const finalHash = createHash('sha256').update(canonical).digest('hex');
  if (finalHash !== replay.expected_final_hash) throw new Error('browser replay hash mismatch');
  const saveAcknowledged = save.location_id === intent.expected_location_id
    && save.last_intent_sequence === intent.sequence
    && save.last_battle_replay_id === replay.replay_id
    && save.last_battle_final_hash === finalHash;
  if (!saveAcknowledged) throw new Error('save snapshot does not acknowledge shared intent/replay');

  return {
    client: 'browser',
    schemaVersion: contract.schemaVersion,
    canonicalCell: runtime.path[0],
    movementLocation: intent.expected_location_id,
    orderedEvents: replay.events.length,
    finalHash,
    saveAcknowledged,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(JSON.stringify(consumeSharedClientContract(), null, 2));
}
