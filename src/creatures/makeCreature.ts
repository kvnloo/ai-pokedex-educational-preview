/**
 * Creature factory: silhouette + materials + clip state + mesh QA.
 */
import * as THREE from 'three';
import {
  SPECIES_BUILDERS,
  SPECIES_COLOR,
  buildGeneric,
} from './speciesMeshes.ts';
import { assertMeshQa, evaluateMeshQa, type MeshQaResult } from './meshQa.ts';
import {
  createClipState,
  idlePhaseFromSeed,
  clipProfileForSpecies,
  type CreatureClipState,
  type CreateClipOpts,
} from './clips.ts';

export interface MakeCreatureOpts {
  speciesId: string;
  scale?: number;
  /** Per-instance seed; consecutive wilds should differ. */
  idlePhaseSeed?: number;
  /** Skip throw on QA fail (tests may inspect). Default true. */
  assertQa?: boolean;
  colorOverride?: number;
  baseRotY?: number;
}

export interface CreatureInstance {
  root: THREE.Group;
  speciesId: string;
  clips: CreatureClipState;
  qa: MeshQaResult;
}

let _instanceCounter = 0;

export function makeCreatureMesh(
  speciesIdOrColor: string | number,
  scale = 1,
  opts: Omit<MakeCreatureOpts, 'speciesId' | 'scale'> = {},
): THREE.Group {
  const speciesId =
    typeof speciesIdOrColor === 'string'
      ? speciesIdOrColor
      : 'generic';
  const color =
    typeof speciesIdOrColor === 'number'
      ? speciesIdOrColor
      : (opts.colorOverride ?? SPECIES_COLOR[speciesId] ?? 0xaaaaaa);

  const builder = SPECIES_BUILDERS[speciesId];
  const root = builder ? builder(scale) : buildGeneric(color, scale);

  const seed =
    opts.idlePhaseSeed ??
    idlePhaseFromSeed((_instanceCounter++ + 1) * 97.13 + speciesId.length * 13.7);

  const clips = createClipState({
    idlePhaseSeed: seed,
    baseY: 0,
    baseRotY: opts.baseRotY ?? 0,
    profile:
      root.userData.motionProfile === 'biped' || root.userData.motionProfile === 'quadruped'
        ? root.userData.motionProfile
        : clipProfileForSpecies(speciesId),
    idleSpeed:
      speciesId === 'sparkmoth' || speciesId === 'ironwisp'
        ? 2.2
        : speciesId === 'gloomhorn'
          ? 1.15
          : 1.6,
  });
  root.userData.clips = clips;
  root.userData.speciesId = speciesId;
  root.userData.idlePhase = seed;

  const qa =
    opts.assertQa === false ? evaluateMeshQa(root) : assertMeshQa(root, speciesId);
  root.userData.qa = qa;

  return root;
}

export function makeCreature(opts: MakeCreatureOpts): CreatureInstance {
  const scale = opts.scale ?? 1;
  const root = makeCreatureMesh(opts.speciesId, scale, {
    idlePhaseSeed: opts.idlePhaseSeed,
    assertQa: opts.assertQa,
    colorOverride: opts.colorOverride,
    baseRotY: opts.baseRotY,
  });
  return {
    root,
    speciesId: opts.speciesId,
    clips: root.userData.clips as CreatureClipState,
    qa: root.userData.qa as MeshQaResult,
  };
}

export function getClipState(root: THREE.Object3D): CreatureClipState | undefined {
  return root.userData.clips as CreatureClipState | undefined;
}

export { SPECIES_COLOR, createClipState, idlePhaseFromSeed, clipProfileForSpecies };
export type { CreatureClipState, CreateClipOpts, MeshQaResult };
