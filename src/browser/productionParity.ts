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

export const APPROVED_BROWSER_M2_REVISION = '7e01d16bbd7c5c1d58177d4abaa512600026d2e6' as const;

export async function createProductionBrowserParityEvidence() {
  return {
    source: 'production-browser-application' as const,
    callPath: 'src/main.ts -> createProductionBrowserParityEvidence' as const,
    approvedRevision: APPROVED_BROWSER_M2_REVISION,
    ...await evaluateAuthoritativeReplay(
      contract as SharedClientContract,
      runtime as CanonicalRuntime,
      intent as MovementIntent,
      replay as BattleReplay,
      save as SaveSnapshot,
    ),
  };
}
