# Gauntlet harness lineage

This repository's browser gauntlet tooling is an original, product-specific implementation. It was informed by generally applicable instrumentation patterns inspected at these exact pinned MIT revisions:

- `kart-royale` — `036c0efb025f5ecf8fc31c405e9d818c61e03e21`, MIT, Copyright (c) 2026 Ryan Campbell. Studied: repeated rendered-frame integrity analysis, resize/mobile soak, and exercised WebGL context loss.
- `Claude-of-Duty` — `d9b237b75c9304ab8d9ef4cfa0c3568c7c11a853`, MIT, Copyright (c) 2026 mshumer. Studied: named multi-vantage shot sets and frame-time distributions with hitch attribution.

The donor MIT notices are reproduced below because the implementation adapts substantial harness concepts:

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

No donor identity, art, tracks, maps, weapons, mechanics, game content, or art direction was copied. The harness drives only Twilight Route's canonical starter/explore flow and evaluates only locally rendered Twilight Route pixels.

## Reproduction

- `npm run gauntlet:capture -- --label=<name> --port=<free-port>`
- `npm run gauntlet:judgeset -- --report=shots/<name>/gauntlet-report.json --out=<private-dir>`

The harness fails closed on stale occupied ports, build failure, missing Chromium/Playwright, page errors, black/flat frames, hard partial-frame seams, invalid resize buffers, or failed context restoration when `WEBGL_lose_context` is available.
