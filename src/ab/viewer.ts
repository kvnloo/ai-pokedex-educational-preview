/**
 * Research A/B viewer stub (not on ship surface).
 *
 * Production build excludes ab.html from rollup inputs.
 * Mode-1 evidence must come from tools/capture.mjs (browser-threejs of index.html).
 * No research plates or franchise identity loaded here.
 */

const stats = document.getElementById('stats');
if (stats) {
  stats.textContent =
    'Research viewer disabled on ship surface. Use tools/capture.mjs for mode-1 stills.';
}

console.info(
  '[ab/viewer] ship-boundary: research path disabled. Capture via tools/capture.mjs.',
);
