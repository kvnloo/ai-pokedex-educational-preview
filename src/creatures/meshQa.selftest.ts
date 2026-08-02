/**
 * Lightweight mesh QA self-check runnable via:
 *   npx tsc --noEmit && node --experimental-strip-types src/creatures/meshQa.selftest.ts
 */
import * as THREE from 'three';
import { makeCreatureMesh, SPECIES_BUILDERS } from './index.ts';
import { evaluateMeshQa } from './meshQa.ts';

function cubeLike(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
  return g;
}

function paperThin(): THREE.Group {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.05), new THREE.MeshBasicMaterial()));
  return g;
}

let failed = 0;
function check(name: string, ok: boolean, detail = ''): void {
  if (!ok) {
    failed++;
    console.error('FAIL', name, detail);
  } else {
    console.log('ok', name, detail);
  }
}

const cube = evaluateMeshQa(cubeLike());
check('reject cube volume/bbox>0.75', !cube.ok && cube.volumeOverBbox > 0.75, JSON.stringify(cube));

const thin = evaluateMeshQa(paperThin());
check('reject paper-thin min/max<0.12', !thin.ok && thin.thinRatio < 0.12, JSON.stringify(thin));

const phases = new Set<number>();
for (const id of Object.keys(SPECIES_BUILDERS)) {
  const a = makeCreatureMesh(id, 1, { idlePhaseSeed: 0.1 });
  const b = makeCreatureMesh(id, 1, { idlePhaseSeed: 2.7 });
  const qa = evaluateMeshQa(a);
  check(`${id} passes QA`, qa.ok, JSON.stringify(qa));
  check(
    `${id} not cube`,
    qa.volumeOverBbox <= 0.75,
    `vol=${qa.volumeOverBbox}`,
  );
  check(`${id} not thin`, qa.thinRatio >= 0.12, `thin=${qa.thinRatio}`);
  phases.add(a.userData.idlePhase as number);
  phases.add(b.userData.idlePhase as number);
  check(
    `${id} idle phases desync`,
    (a.userData.idlePhase as number) !== (b.userData.idlePhase as number),
    `${a.userData.idlePhase} vs ${b.userData.idlePhase}`,
  );
  // dispose
  a.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry?.dispose();
      const mat = m.material as THREE.Material;
      mat?.dispose?.();
    }
  });
}

check('phase seeds distinct for a/b pairs', phases.size >= 2, `n=${phases.size}`);

if (failed) {
  console.error(`meshQa selftest: ${failed} failure(s)`);
  throw new Error(`meshQa selftest: ${failed} failure(s)`);
}
console.log('meshQa selftest: all passed');
