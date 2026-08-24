# Native preflight evidence summary

The branch was created from exact `main` base `18821d22d57bd3e8533af29cff3e858ebf963901` in `/workspace/zer0/products/pokemon/.worktrees/native-godot`; the shared dirty main worktree was not used for implementation.

The governing direction files were synced from shared main after worktree creation and hash-bound in `native/godot/evidence/direction-hashes.txt`. In particular, the browser direction says progressive WebGPU/WASM only where measured; this preflight makes no claim that the current Three.js client is already wgpu.

Acceptance is intentionally narrow:

- official Godot 4.7.2 identity and release archive checksum;
- RTX 3080 Ti / NVIDIA proprietary Vulkan device proof with software rendering rejected;
- literal headless contract-only launch plus automated offscreen and interactive windowed Forward+ launch paths;
- generated binding validation over three synthetic versioned fixtures;
- synthetic Blender IaC GLB export and Godot import;
- movement-intent consumption and ordered replay final hash;
- exact 960×540 requested and observed window/viewport/drawing-buffer dimensions, independently verified PNG dimensions, and renderer telemetry.

It does not establish Kanto content readiness, cross-client production parity, backend implementation, five-minute allocation stability, 1440p performance, or final visual quality. Those remain dependency-gated and independently reviewed.

The canonical native unittest suite writes generated reports, captures and logs only to temporary directories and includes a nested regression run that hashes every frozen evidence file and compares tracked Git state before and after the exact discovery command.
