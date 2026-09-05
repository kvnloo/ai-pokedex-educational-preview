# Read-only diagnosis of the retained root and r01 join

No Blender calls or asset edits were made. Measurements use glTF scene transforms followed by Blender world coordinates `(x,-z,y)`.

The proximal root survives because `repair.py` lines 24–27 only cut low geometry on the Y>.15 side, and lines 58–67 only create new distal rings. The earlier `repair-validation.json` confirms exact coordinate presence for 106843 protected original vertices. Therefore r01 cannot correct a retained root shape. It also does not match the outgoing source surface derivative at the retained boundary.

The join defect is verified independently in exported geometry. All 317 boundary vertices have Y=.15000000596046448. Their directly adjacent first generated ring also has 317 vertices, but its Y bounds are [.14794091880321503,.18600916862487793]. Twenty-nine vertices extend behind the cut. A Y=.149 section has both the retained low-left loop and an additional small low-left loop. Of 317 seam edges, 31 have adjacent face-normal angle greater than 90 degrees. Median angle is 7.1627 degrees, p90 is 84.0439 degrees and maximum is 164.8781 degrees. See `tail-root-join.json` for exact vertex IDs in the exported body geometry and full measurements. These are fold evidence; no full triangle intersection test was performed.

The code creates this fold by initializing the retained profile in the XZ plane, then immediately rotating the first new profile to a different tangent, `repair.py` lines 55–66. The first center advances only .018148428 in Y. Its tangent tilts 7.153755 degrees from +Y, and nominal radius .149 times the tilt sine is .018555331. The backward reach exceeds the forward spacing even before accounting for the retained profile's asymmetry. In addition, `blend=min(1,index/5)` starts rounding at 20 percent on the first ring. Neither the frame rotation nor this profile blend matches the source surface slope. Recalculating and smoothing normals cannot change that geometry.

## Plane sections and classification limits

The following table reports the broad low-left path of the original largest component. At Y=-.25 this is plainly a composite body path, and negative Y sections cannot be declared tail-only from topology. At Y=-.20 an additional separate low-right path lies at X[.260876,.395645], Z[-.531907,-.418329], so a general low-Z mask could include a limb. At Y=-.10 the broad low-left loop reaches Z=-.175421, also crossing the original -.20 guard. From Y=-.05 onward the low-left loop is wholly below -.20 and separate from the higher/right projections in each slice. This supports isolating a candidate region, not anatomical identification. The r01 return segment adds extra right-hand loops; those must not be mistaken for the proximal branch.

Circle centers are X,Z and circle fits use arc-uniform samples. Circle radii on composite or highly elongated paths are descriptive fit values, not anatomical radii.

| Blender Y | All raw paths | Selected X bounds | Selected Z bounds | X width / Z height | Circle center X,Z | Radius | Radial RMS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| -0.25 | 2 | [-0.957328, 0.783741] | [-0.550357, 0.420101] | 1.741069 / 0.970458 | (-0.058305, 0.091965) | 0.545584 | 0.227401 |
| -0.20 | 5 | [-0.571391, 0.246561] | [-0.492582, -0.035939] | 0.817952 / 0.456643 | (-0.154887, -0.315835) | 0.294168 | 0.082333 |
| -0.15 | 4 | [-0.637809, 0.121590] | [-0.520016, -0.101098] | 0.759399 / 0.418918 | (-0.240029, -0.335453) | 0.282125 | 0.086391 |
| -0.10 | 2 | [-0.690662, 0.052624] | [-0.541167, -0.175421] | 0.743286 / 0.365746 | (-0.306358, -0.371667) | 0.268961 | 0.086425 |
| -0.05 | 2 | [-0.728137, -0.023780] | [-0.557174, -0.246043] | 0.704356 / 0.311131 | (-0.371013, -0.402319) | 0.249875 | 0.081443 |
| 0.00 | 4 | [-0.758966, -0.123646] | [-0.571544, -0.304600] | 0.635320 / 0.266944 | (-0.440597, -0.425196) | 0.225867 | 0.071887 |
| 0.05 | 2 | [-0.783746, -0.237074] | [-0.582560, -0.331307] | 0.546672 / 0.251253 | (-0.516706, -0.448708) | 0.195435 | 0.055561 |
| 0.10 | 2 | [-0.801965, -0.394131] | [-0.590733, -0.321881] | 0.407834 / 0.268853 | (-0.603204, -0.465203) | 0.159623 | 0.026016 |
| 0.15 | 1 | [-0.811949, -0.481883] | [-0.598416, -0.314156] | 0.330067 / 0.284260 | (-0.641339, -0.463595) | 0.148620 | 0.011021 |
| 0.20 | 1 | [-0.817723, -0.491616] | [-0.602307, -0.305859] | 0.326106 / 0.296448 | (-0.646985, -0.459022) | 0.151504 | 0.008451 |
| 0.25 | 1 | [-0.819870, -0.484670] | [-0.603928, -0.299046] | 0.335200 / 0.304882 | (-0.645075, -0.454044) | 0.156282 | 0.007662 |

The Y-plane aspect ratio exaggerates flattening because the candidate centerline bends strongly in X. A second audit estimates a tangent from arc-uniform centroids of adjacent Y loops and slices normal to that tangent. At Y-label 0 the principal extent ratio drops to 1.576 from the Y-plane width/height ratio 2.380. At .05 it drops to 1.429 from 2.176. The root remains moderately oval under this approximation, but the result does not justify making every Y section circular. At .10 the perpendicular plane spans Y[-.073445,.351049], so it cuts a long curved region and does not define a clean local thickness. Full origins, normals, competing loops and samples are in `tail-root-normal-sections.json`.

| Y label of estimated center | Perpendicular principal min/max extents | Extent ratio | Principal standard-deviation ratio | Circle radius | Radial RMS |
| --- | --- | --- | --- | --- | --- |
| -0.100 | 0.254626 / 0.392994 | 1.543 | 1.397 | 0.162603 | 0.025393 |
| -0.050 | 0.235708 / 0.381505 | 1.619 | 1.434 | 0.155383 | 0.025812 |
| 0.000 | 0.225266 / 0.355025 | 1.576 | 1.416 | 0.146767 | 0.023639 |
| 0.050 | 0.228361 / 0.326243 | 1.429 | 1.325 | 0.138967 | 0.018991 |
| 0.100 | 0.271251 / 0.505604 | 1.864 | 1.680 | 0.183724 | 0.039973 |
| 0.125 | 0.278899 / 0.356976 | 1.280 | 1.210 | 0.154966 | 0.014248 |
| 0.150 | 0.279834 / 0.321690 | 1.150 | 1.109 | 0.147570 | 0.009861 |
| 0.200 | 0.293840 / 0.324275 | 1.104 | 1.081 | 0.151022 | 0.008248 |

## Conservative repair advice

Fixing the seam fold does not require moving any original body vertex. Preserve the original boundary and retained root, then rebuild the first generated segment through roughly Y=.32. Extrapolate the original surface's outgoing derivative from an inward collar at roughly Y=.125–.15. Bridge each boundary trajectory to the later generated profile with a Hermite or equivalent smooth interpolation that matches both endpoint positions and derivatives. Delay rigid frame reorientation and circularization with an easing function whose initial derivative is zero. Check first-strip advancement and face orientation explicitly. A single rotated first ring is insufficient.

If visual review separately requires changing the proximal shape, a conservative candidate envelope is the seam-connected negative-X, low-Z branch with -.05<Y<.32, X<0 and Z<-.20. Keep Y<=-.05 and all other branches fixed, and taper displacement to zero at the envelope boundaries. This envelope contains the isolated low-left Y loops and excludes the measured right-side projection. It still requires visual confirmation before treating the whole envelope as tail. Moving farther toward negative Y reaches paths that merge with torso or limbs. Shape targets should use an artist-confirmed centerline and normal sections, not Y-plane circles.

Before mesh edits, save stable original vertex IDs, coordinates and an explicit protected mask. Verify zero displacement by ID for protected vertices before export, and confirm protected face connectivity survives. After export, recheck protected coordinate presence and protected triangle geometry; coordinate presence alone could miss a moved vertex if another coincident coordinate remains. Check the repaired join for normal-angle spikes, reversed strip progression and local triangle intersections, then review the actual side and rear silhouettes. Existing watertight and edge-incidence tests do not establish these properties.

Fix Root Causes directed this audit toward the first ring geometry rather than the shading. Prove It Works directed it to inspect the exported GLB and to distinguish retained-coordinate evidence from stronger topology or anatomical claims.
