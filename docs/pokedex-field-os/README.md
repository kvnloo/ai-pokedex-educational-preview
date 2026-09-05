# Field OS recovery

Kevin's real S25 report is the acceptance baseline: an opening model with unreachable Pokémon is a failed integration. Fullscreen and Blender polish are paused for this repair. Browser checks remain simulated-green/device-HITL-pending until Kevin retests.

## What changed

`pokedex.html` owns the original Field OS from `0f386a3`, carried through base `50930b314ad15b0d193f7d1d0c335311f7589ee4`. The existing dock, species data, scan, research, map sightings, party, eight utility cards, procedural sound and A/B/scan controls remain in the same DOM application. The Home screen adds a prominent Browse Pokémon button. All six species are named, including unknown-status Geodude, and entries display the existing official PokeAPI HOME artwork instead of a generic shape.

The existing V3 r08 device GLB is a disposable entry scene. Its actual Opening and BootUp clips run through the established `PokedexRuntime`; Ready reveals the already-mounted, interactive Field OS without navigation or page replacement. The old `pokedex-device.html` URL redirects into that same app. The previous technical reviewer is retained at `pokedex-review.html`, separate from the player entry.

Direct entry remains available during loading and animation. Reduced motion, offline use, a missing model, unavailable WebGL, or a 15-second load deadline return to the OS. Renderer/model resources are disposed at handoff. This is an entry transition, not a claim of a newly approved Blender model or a perfectly seamless visual match between the shell and OS.

Scan now resists duplicate presses while identification is pending. Audio failure does not block registration. A late scan result cannot replace another app after the player navigates away. Entries select Dex in the dock and reset inner scrolling.

## Diagnosis and preservation

The former physical viewer used `CanvasTexture` ready text and did not mount the OS at Ready. The original Field OS still contained the species. This is a navigation/integration failure, not evidence of deleted Pokémon data. During this session the existing HTTPS 8469 mapping pointed at local 4191, which had no listener and returned 502. Its old deployed bundle could not be inspected live; Kevin's earlier device report remains authoritative.

A CoS CLI worker concurrently edited `.worktrees/pokedex-generations`. Its exact process was interrupted after verifying its command and working directory. Its mixed dirty work was preserved in place and in `/mnt/zer0models/pokemon-iac/devices/pokedex/field-os/r01/concurrent-snapshot.tar`, with patch/status receipts. Nothing in that dirty checkout was reverted, committed or deleted. This repair is authored only in `.worktrees/pokedex-field-os-repair`, branch `codex/pokedex-field-os-repair`, based on the last clean root milestone. The frozen v001 and stopped v002 worker artifacts remain untouched. Root retains Blender ownership.

## Private asset and build boundary

`canonical/devices/field-os/assets.json` pins source URLs, local receipts, hashes and sizes for the six 512×512 HOME PNGs and the existing opening GLB. The asset plugin verifies hashes and emits only those assets for private builds. No binaries enter Git. A public build emits neither the Pokédex pages nor their private artwork/models.

The private PWA cache contains the OS shell, its JavaScript dependencies, six HOME images, manifest and app icons. It excludes GLBs, APIs, the main game and the research warehouse. Offline use opens directly into the OS. Vite rewrites dynamic import preloads late in bundling; the PWA plugin now hashes chunks after that rewrite. The compiled release's hashes are verified against actual HTTP bytes.

The canonical acceptance gate still runs before private/public Vite builds. The full private asset bootstrap remains blocked by its pre-existing absent owner-supplied fixture `/mnt/zer0models/pokemon-iac/sources/owner-supplied/pokemon-kanto-art.bin`. This repair does not fabricate that fixture or relax its gate. Direct private Vite compilation and the public build pass.

## Evidence and reproduction

Private evidence root: `/mnt/zer0models/pokemon-iac/devices/pokedex/field-os/`.

- `r01/before-final/regression.json`: frozen prior compiled app fails primary opening integration, named Geodude discovery and former viewer-to-OS routing. Scan and the existing utility navigation pass.
- `r03/functional/regression.json`: six headed Chromium scenarios pass at 412×892, including actual Opening → BootUp → Ready → Dex → Bulbasaur, every species entry/image, scan → Pidgey registration, research, map, party, tools/audio/Home, old URL routing and missing-model fallback.
- `r03/pwa-final/browser-report.json`: 146 checks pass. Real service worker/offline behavior, compiled hashes, manifest/icons, install affordance and Fullscreen API are checked. Nine viewport cases cover S25-like 384/412 portrait, 832/892 landscape, safe-area margins, short browser landscape and desktop fallback. Dock/control bounds and hit testing pass. Installed display modes and safe areas are simulated; these are not real S25 acceptance.
- `r03/unit-tests.log`: 13 tests pass across existing Pokédex behavior, worker policy and canonical rejection gates. Application and asset-plugin TypeScript checks pass.
- `r03/public-boundary.json`: public build has zero Pokédex/private device leaks.

The PWA suite uses reduced-motion direct entry because the functional suite separately exercises the animated handoff. It waits for installed dimensions to settle, then applies the same strict viewport/zero-radius assertions. Earlier `pwa`, `pwa-b`, and `pwa-c` reports are retained as failed diagnostic attempts, not acceptance evidence. The initial headed video capture has incorrect compositor scaling and is rejected as a preview; screenshots and functional assertions remain separately inspected. The replacement capture is labeled with its browser mode.

Final review capture: `r03/capture/opening-to-live-os.mp4`, 412×892 H.264/yuv420p, 25 fps, 22.16 seconds, 395663 bytes. This records the real application in headless Chromium and was played through in the browser, with extracted frames and the final live Bulbasaur entry inspected. It includes loading and preserves the original timing; it is not a phone GPU benchmark. The six functional scenarios also pass in this capture run. The read-only code reviewer found no blocking issues and independently verified all cache hashes; the non-reduced-motion offline early-return branch is not independently covered.

Run against a compiled private preview with the pinned Node runtime:

```sh
FIELD_OS_URL=http://127.0.0.1:5197 node tools/pokedex-field-os/regression.mjs
POKEDEX_PWA_URL=http://127.0.0.1:5197 node tools/pokedex-pwa/browser-check.mjs
node --test tools/pokedex.test.mjs tools/pokedex-pwa/worker.test.mjs tools/canonical-build.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

The browser tools use installed Chromium and the existing Playwright module at `/workspace/zer0/products/cod/node_modules/playwright/index.mjs`. Set `FIELD_OS_HEADLESS=1` for compositor-independent video capture; this does not stand in for phone testing.

## Preview and device gate

Only after the replacement passes, switch the existing Tailscale 8469 handler in one operation to its compiled preview. Preserve the former build and record the old/new mapping, release hashes and post-cutover HTTPS checks. Do not merge or push. The delivery receipt records the exact implementation revision and URL.

Completed cutover: implementation `fa975753269125aebcf471a04515664b90d7fc7c`, release `f85e3ae295feec02`, compiled directory `r03/build`, preview port 5197. The single 8469 handler changed from 4191 to 5197 after local acceptance. All other Tailscale handlers are unchanged. `r03/published/regression.json` confirms all six functional scenarios on the actual HTTPS URL; `r03/published-http.json` confirms 21 published file/hash checks. The old 4191 build was not modified. These results remain browser-green/device-HITL-pending.

On the S25, open `https://0.taila30dc.ts.net:8469/pokedex.html`, tap Open Pokédex and wait for the live Home screen. Tap Browse Pokémon or the persistent Dex dock button. Confirm all six species and open an entry. Press Scan to identify/register Pidgey, then visit Research, Map, Party and Tools; B returns Home. The direct-entry button is available if animation is unwanted.

For an installed experience, Chrome offers Add to Home screen → Install; Samsung Internet provides its home-screen/install action. Launch the installed icon. Normal browser tabs retain browser chrome. Existing open PWA sessions retain their coherent cache until closed; close older Pokédex app windows before retesting a newly installed release. Actual installed layout, touch gestures, orientation, audio output and GPU performance remain Kevin's S25 gate.

This preserves the original demo's scope. Scan is a scripted Pidgey encounter, utility cards mostly report readiness, cries are procedural, and research/party changes are session state rather than a new save system. No complete-game or S+ asset claim is made by this repair.

Telegram delivery succeeded as message `16686`, containing the published URL, six-species image and corrected opening-to-live-OS video. The success receipt is pinned in `canonical/devices/field-os/delivery-r03.json`.
