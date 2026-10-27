export {
  makeCreatureMesh,
  makeCreature,
  getClipState,
  SPECIES_COLOR,
  createClipState,
  idlePhaseFromSeed,
  type CreatureInstance,
  type MakeCreatureOpts,
  type CreatureClipState,
  type MeshQaResult,
} from './makeCreature.ts';

export {
  evaluateMeshQa,
  assertMeshQa,
} from './meshQa.ts';

export {
  playAttack,
  playFaint,
  playIdle,
  tickCreatureClip,
  type ClipName,
  type GaitPoseName,
  type GaitPoseWeights,
  type CreatureLocomotionState,
} from './clips.ts';

export {
  SPECIES_BUILDERS,
  buildEmberpup,
  buildDewkin,
  buildLeafit,
  buildDustbun,
  buildSparkmoth,
} from './speciesMeshes.ts';

export {
  buildGrookey,
  buildScorbunny,
  buildSobble,
  buildWooloo,
} from './pokeapiMeshes.ts';
