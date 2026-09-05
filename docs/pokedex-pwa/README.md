# Fullscreen private Pokédex

Status: **simulated-green/device-HITL-pending**. This is part of the canonical Pokémon game in `codex/pokedex-generations`. No push or merge is authorized. Source and receipts are in Git; PNGs, compiled output and browser profiles remain under `/mnt/zer0models/pokemon-iac/devices/pokedex/pwa`.

## Install on Kevin's Galaxy S25 Ultra

1. Connect Tailscale. Open [the private Pokédex](https://0.taila30dc.ts.net:8472/pokedex.html) in **Chrome or Samsung Internet**, outside Telegram's embedded browser.
2. Use the discreet **APP ↗** button if it appears, or **Tools → Settings**. Choose **Install Pokédex** when the browser offers it. Otherwise use Chrome's **Add to Home screen → Install**, or Samsung Internet's **Add page to → Home screen** / install icon. Wording varies by browser version.
3. Finish installation, then **launch the Pokédex icon from the home screen**. Merely opening the link again opens a browser tab.
4. Rotate portrait/landscape. Check the camera cutout, gesture/navigation edge, six dock buttons, SCAN, A/B and audio. In Tools → Settings, the detected mode should read **Fullscreen** or **Installed app**. Close and relaunch once; try the shell offline after a connected visit.

An ordinary Android tab retains browser chrome. The app cannot hide it automatically. **Enter fullscreen** is an explicit user-gesture option where supported, and may end on Back or app switching. The installed manifest requests fullscreen first and standalone second; actual Samsung browser/OS behavior still requires the phone check. These limits follow the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [manifest display override](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display_override), and [Samsung's home-screen guidance](https://samsunginternet.github.io/docs/homescreen).

## Implementation

- The private build emits `pokedex.webmanifest` with stable ID `./pokedex.html`, launch URL `./pokedex.html?launch=homescreen`, scope `./`, orientation `any`, theme/background `#8f1626`, `display: fullscreen`, and overrides `[fullscreen, standalone]`.
- Four authored PNG icons: 192 and 512 pixels, separate `any` and `maskable` purposes. Maskable images have an opaque background and keep the device drawing inside the central safe circle. `tools/pokedex-pwa/icon.svg` and hash-verified `icons.json` reproduce the private PNGs.
- Android/mobile and Apple fallback metadata accompany `viewport-fit=cover`. Display-mode media queries and `document.fullscreenElement` detection select the layout. Installed/fullscreen mode removes desktop framing at every viewport width.
- The device uses `100dvw`/`100dvh`. Padding incorporates all four `env(safe-area-inset-*)` values. The screen is a grid with a constrained scrollable content row and fixed dock. Short landscape moves physical controls into a side grip. The browser desktop frame remains available.
- Native buttons/dialog/focus behavior, zoom, reduced motion and normal tab use remain available. The install hint appears once per browser origin; Tools → Settings is permanent. The deferred `beforeinstallprompt` is consumed once. No automatic fullscreen request or claim that accepting installation changes the current tab's display mode.

## Offline and update boundaries

Only the compiled `private-local` build registers `pokedex-sw-v1.js`. The HMR development server does not register a worker, and the public build emits no Pokédex page, manifest, worker or icons.

Each release hashes the compiled HTML, its exact JS/CSS dependencies, manifest, icons and worker policy into a cache version. R02 is `9dd97057ef93e9fd`: **9 files, 77,588 uncompressed bytes**. The emitted `pokedex-pwa-release.json` records every hash.

The worker's root scope is required by the root `/pokedex.html` URL, but its fetch handler only responds to that page's navigation and exact shell file paths. Other routes, models, reference images, APIs, queries on fetched assets, POSTs and cross-origin requests pass through. There is no catch-all offline navigation fallback and no runtime cache growth. Other applications' cache namespaces are preserved.

Installation failure deletes the incomplete new cache. Updates wait for existing controlled windows to close; there is no `skipWaiting`, `clients.claim`, reload or forced state loss. Activation removes only older caches from this app/base-path namespace. For an update, close all Pokédex tabs/windows and reopen. The shell and its icons remain on the device for offline use until its site storage is cleared. 3D assets still require a connection. See [service-worker lifecycle guidance](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Verification and limits

- **137 headed Chromium checks pass**, using a fresh normal profile for installability, real service-worker installation/offline reload and explicit Fullscreen API entry/exit. Chromium reports no installability errors. Every emitted shell file matches its SHA-256. The browser reports no uncaught app errors.
- Portrait 384×832 and 412×892; landscape 832×384 and 892×412; additional 412×892 safe-inset portrait, 892×412 safe-inset landscape, 832×320 short browser landscape, and 1440×900 browser/installed layouts. These are representative CSS viewport simulations, not measurements from Kevin's phone. Synthetic insets are top 32/bottom 24 in portrait and left 40/right 12/bottom 24 in landscape.
- Bounds and center-point hit tests cover every dock button and physical control; scrolling leaves the dock stationary. All six dock routes work. Reduced motion and the one-time hint/settings fallback pass. Screenshots were inspected visually, including both orientations and safe-inset layouts.
- Installed-mode `matchMedia` results are injected in the layout tests because CDP does not emulate that media feature here. The browser's actual Fullscreen API was separately exercised; this Chromium reports `fullscreenElement` while its display-mode query remains false, so the implementation handles both. The install-event branch uses a synthetic prompt. **Neither test proves installation on Android.**
- Real HTTPS update check through Chrome MCP: R01 stayed active and continued serving its matching HTML while R02 waited. After the final old client closed, R02 activated, served its new HTML, and removed the old cache. Receipt: `canonical/devices/pwa/update-lifecycle.json`.
- TypeScript app/build-plugin checks, 4 existing Pokédex tests, 3 worker-policy tests, and 6 canonical build rejection tests pass. Private and public Vite builds pass their canonical gate. The build-content copier now respects the configured output directory, keeping these versioned builds self-contained. Canonical rejection fixtures include the actual Vite plugin imports.
- **Full `npm run build:private` remains blocked** before Vite by the existing absent owner-art fixture `/mnt/zer0models/pokemon-iac/sources/owner-supplied/pokemon-kanto-art.bin`. No fixture was fabricated and no asset gate was weakened. The tested direct private compilation is a narrower passing result.

Remaining acceptance gate: Kevin must launch the installed app on his actual S25 Ultra and confirm browser chrome, cutout/gesture clearance, rotation, touch, back navigation and relaunch behavior. Record browser/Android versions and screen/display scaling with that result. Do not mark device approval complete from browser simulations.

## Reproduce

Run from this worktree with Node 26.4.0 on PATH. The configured private icons already exist; to regenerate them use `node tools/pokedex-pwa/generate-icons.mjs` with `SHARP_MODULE` and `POKEDEX_PWA_ICONS` overrides if needed.

```sh
npm run typecheck
npm run test:pokedex
npm run test:pokedex-pwa
npm run test:canonical-build
node node_modules/vite/bin/vite.js build --mode private-local --outDir /mnt/zer0models/pokemon-iac/devices/pokedex/pwa/build-NEW
node node_modules/vite/bin/vite.js preview --mode private-local --outDir /mnt/zer0models/pokemon-iac/devices/pokedex/pwa/build-NEW --port 5195 --strictPort
POKEDEX_PWA_URL=http://127.0.0.1:5195 npm run test:browser-pokedex-pwa
```

Use a fresh build directory; retain prior releases. The current private preview serves `build-r02` on port 5195 through Tailscale HTTPS 8472. Research 8445 and interactive asset review 8471 remain available. Browser evidence and screenshot hashes are recorded in `canonical/devices/pwa/acceptance-r01.json`.
