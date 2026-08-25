import contract from '../../contracts/shared/v1/contract.json' with { type: 'json' };
import runtime from '../../canonical/runtime/kanto-opening.json' with { type: 'json' };
import intent from '../../contracts/shared/fixtures/movement-intent.json' with { type: 'json' };
import replay from '../../contracts/shared/fixtures/battle-replay.json' with { type: 'json' };
import save from '../../contracts/shared/fixtures/save.json' with { type: 'json' };
import {
  evaluateAuthoritativeReplay,
  type BattleReplay,
  type CanonicalRuntime,
  type MovementIntent,
  type SaveSnapshot,
  type SharedClientContract,
} from '../shared/crossClientParity.ts';

export async function createAuthoritativeBackendReplayEvidence() {
  return {
    source: 'authoritative-backend-replay' as const,
    callPath: 'src/backend/authoritativeReplay.ts' as const,
    ...await evaluateAuthoritativeReplay(
      contract as SharedClientContract,
      runtime as CanonicalRuntime,
      intent as MovementIntent,
      replay as BattleReplay,
      save as SaveSnapshot,
    ),
  };
}
