# Pokédex opening and Galaxy S25 Ultra alignment contract

Status: queued integration contract; implementation begins only after both authored Blender variants pass asset and animation gates.

## Product decision

Kevin's 2026-09-05 instruction supersedes the earlier single-shell assumption. Preserve **two selectable Pokédex variants**, one corresponding to each supplied reference board. Do not collapse them into one skin or treat either as a disposable modeling study.

## Loading-to-device sequence

1. Load only the closed, lightweight device shell and minimum environment.
2. Present the closed Pokédex as the loading affordance; loading progress may illuminate its ring/status LEDs but must not fake hinge movement.
3. When minimum runtime and animation dependencies are ready, make the device visibly tappable.
4. User taps/clicks the physical Pokédex.
5. Play the selected variant's authored `Opening` animation, followed by `BootUp`, `Ready`, then `Idle`.
6. Bind the field-OS screen to the replaceable screen surface during `BootUp`; crossfade from abstract boot glyph to the live UI before `Ready` completes.
7. Hand interaction to the field OS only after the animation state machine reports `Ready`. Fast taps are buffered once, not allowed to skip into a broken state.
8. Reduced-motion mode uses a brief closed→open pose dissolve and retains the boot/audio acknowledgment.
9. Returning from the UI can close the Pokédex only if a verified reversible `Closing` clip or runtime-reversed mechanical clip exists.

No CSS approximation may substitute for the delivered hinge animation in the integrated product. Runtime must inspect the GLB clip names and fail to a documented static-open fallback when required clips are absent.

## Galaxy S25 Ultra SKU lock

Target owned device: Samsung Galaxy S25 Ultra. Official manufacturer envelope: **162.8 mm H × 77.6 mm W × 8.2 mm D**, 6.9-inch display. Samsung documentation places the volume rocker above the Side key on the **right frame**.

Sources:

- [Samsung Galaxy S25 Ultra specifications](https://www.samsung.com/my/smartphones/galaxy-s25-ultra/specs/)
- [Samsung Galaxy S25-series user guide](https://content.syndigo.com/asset/b70c1612-21f0-48da-b4d4-050a32417a7e/original.pdf)
- [Samsung Side button behavior](https://www.samsung.com/us/support/answer/ANS10002033/)

Public manufacturer documents found in the research identify the controls and their ordering but do **not** provide reliable millimeter offsets for button centers/lengths. Do not infer exact offsets from marketing renders or generic case listings.

## Calibration strategy

A normal web app cannot reliably read the physical SKU, case geometry, or millimeter position of hardware buttons from browser APIs. It also cannot safely intercept Android's power/Side key, and volume-key delivery is OS/browser-dependent. Therefore “automatic detection” means:

1. Select the S25 Ultra baseline profile from verified viewport/UA hints, never silently claim certainty.
2. Account for orientation, `devicePixelRatio`, visual viewport, browser chrome and safe-area insets.
3. Ask once for **case / no case** and retain separate local profiles.
4. Show a calibration overlay with virtual Volume Up, Volume Down and Side-key rails on the right edge.
5. User drags one grouped rail until it visually aligns with the physical buttons; fine adjustment supports ±0.25 mm equivalent steps.
6. Persist normalized positions (`centerY / physicalHeight`) plus viewport and orientation signature, not raw CSS pixels.
7. Validate with an owner-photo overlay or measured offsets before calling the SKU profile exact.
8. Re-run calibration when orientation, standalone/browser display mode, case profile or viewport signature changes materially.

## Control mapping

- On-screen control nearest Volume Up: previous Dex entry / map zoom in.
- On-screen control nearest Volume Down: next Dex entry / map zoom out.
- On-screen control nearest Side key: confirm / scan trigger.
- Actual phone buttons remain optional accelerators only where the OS delivers events. The experience must remain complete using touch.
- Never override screenshot, emergency, lock, accessibility or system-volume behavior.

## Acceptance evidence

- Both variant GLBs reopen with required named clips and correct transforms.
- Tap closed device → real `Opening` → `BootUp` → live field OS → `Ready` is captured as continuous video on the S25 Ultra.
- Cold load, warm load, slow network, rapid double-tap, rotation and reduced-motion paths pass.
- Phone control rail aligns in owner-photo overlay for case and no-case profiles; report measured residual error.
- Touch targets remain at least 44 CSS px and are not occluded by browser chrome/safe areas.
- Physical-button accelerators are labeled best-effort and tested on the real phone; touch parity is mandatory.

## Dependency gate

Do not integrate placeholder meshes. Start runtime integration only after the two Blender variants, rendered sequence, clip manifest, GLB exports and visual/geometry evidence have been inspected and accepted. Merge to game `main` remains Kevin HITL.
