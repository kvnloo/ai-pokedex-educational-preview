# Pokédex v002 implementation plan

Goal: build separate board01 and board02 reference studies and animated assets without changing v001.

Architecture: independent variant contracts drive a shared headless Blender mesh generator. Manually traced reference coordinates drive camera fitting and silhouette measurements. Static overlays gate animation authoring. Private outputs remain in `/mnt/zer0models/pokemon-iac/devices/pokedex/v002`.

Stack: Blender 5.2, Python, NumPy/SciPy/Pillow, FFmpeg. No desktop application activation.

## Design and constraints

Use the first and third top-row panels of each supplied board for closed/open calibration. These are concept images with some perspective inconsistencies, not CAD drawings. Fit a coherent rigid object and report residuals. Width is fixed at 84 mm; length, opening angle, and independent reference cameras are fitted. No per-view mesh deformation or warped renders. Rounded shells, continuous cylindrical left spine, and a transverse hinge with two collars replace the rejected broad slab and seven-barrel layout.

Board01: radial black belt, cyan lock, upper-right silver wedge, black upper camera bezel, near-edge screen, graphite deck, D-pad and A control.
Board02: red lacquer, divided red/silver lock across black seam, red upper camera/sensor/speaker panel, red deck, D-pad and four-button diamond.

## Execution

- [ ] Trace four reference views and store the annotations/camera contracts in Git. Save reference, trace, and overlay sheets externally.
- [ ] Fit low-sample closed/open renders. Measure silhouette intersection-over-union and landmark residuals; retain all iterations. Gate target: silhouette IoU >= 0.90 and median landmark residual <= 8 pixels in native crops, with explicit visual review of panel identity. Never claim a failed gate passed.
- [ ] Only after all static gates, author Closed, Opening, BootUp, Ready, Idle, ButtonPress using a real transverse pivot. Use exportable mesh transforms for display reveal and button movement.
- [ ] Export .blend/GLB, reopen GLBs in a clean headless scene, inspect animation channels, geometry and bounds across clips. Render animation frames and encode videos. Decode video frames for visual inspection.
- [ ] Rehash v001, write manifests and an honest visual-delta report, verify reproduction commands, commit only scripts/contracts/docs. No merge or push.
