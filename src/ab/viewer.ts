/**
 * Research A/B viewer stub.
 *
 * Wooloo / TW / Hunyuan research plates are intentionally not loaded on the
 * ship surface. Production build excludes ab.html from rollup inputs.
 * Mode-1 evidence must come from tools/capture.mjs (browser-threejs of index.html).
 */

const stats = document.getElementById('stats');
if (stats) {
  stats.textContent =
    'Research viewer disabled on ship surface. Use tools/capture.mjs for mode-1 stills.';
}

console.info(
  '[ab/viewer] ship-boundary: no official-name GLB/ref load. Capture via tools/capture.mjs.',
);
