# Phase 1: one-person RGB feasibility experiment

**Protocol proposed 2026-09-25. Not executed. No pipeline is implemented.** All numeric gates below are project decisions to be frozen before a later run, not claims of present model accuracy or certified garment-industry tolerances.

## Question and permitted conclusions

> Can we capture Roni with consumer RGB input and produce a recognizable, structurally editable, metrically useful human representation that justifies further work?

The experiment has two sequential gates: **body/measurements first**, then **identity/appearance and asset suitability**. A measurement failure stops expensive appearance work. An appearance pass cannot compensate for a measurement failure.

Full success would justify a larger validation study and a separate garment-data experiment. It would not establish exact hidden-body recovery, population accuracy, tailoring quality, a phone-only compute pipeline, or real-garment fit prediction. Dense underlying shape accuracy remains only partially tested without an independent 3D reference scan.

## Minimum design

- One subject, one rear RGB phone camera, one helper, one fitted outfit, one controlled room.
- **Three independent captures A, B, C**, each with 24 full-body views plus one repeated front view. The subject steps away and resets stance between captures. This is 75 primary/QA photos; extracting three frame subsets from one recording does not count as independent capture.
- Only A receives **24 supplemental photos** for appearance: 12 somewhat higher and 12 lower viewpoints. Total body photos: **99**, plus calibration and reference records. No rotation video, other neural avatar, or reference scanner is required.
- One cheap single-image comparator and one shared-shape multi-view pipeline. No model training.
- Seven withheld dimensions, each measured three times per capture session; known height is a separate allowed input.

Three captures are the minimum here because a lucky reconstruction is not sufficient evidence. Supplemental appearance images are acquired at the same sitting but processed only after the metric gate. If this amount of capture fails, reducing it to two photos should not be the next step.

## Equipment and preflight

1. Use a phone that can save sharp full-resolution RGB stills; plan for 12 MP or more. Use its rear main lens at 1×, portrait orientation, no digital zoom, portrait blur, beauty filters, or automatic lens switching. Disable variable computational effects where the camera app permits, and record what could not be disabled.
2. Use bright diffuse fixed lights, a non-reflective floor, and a plain region behind the person's silhouette. Put static, distinct printed features around the surrounding room/floor to support camera tracking. Keep them fixed for all captures. Do not rely on blank walls for feature matching.
3. Print a checkerboard/ChArUco-style calibration target on rigid flat backing. Measure its actual square/marker dimensions with a ruler; do not trust printer settings. Use a roughly 0.5 m board if space allows. Put a rigid marked **1,000 mm check length** elsewhere in the scene, visible sharply in at least three views. Its length is withheld from scale fitting.
4. Use a non-stretch tailor's tape, a rigid ruler/straightedge for height and shoulder breadth, floor stance marks, and removable small landmark marks. Calibrate the tape against the ruler. These are reference/camera-calibration tools; no depth sensor is used as reconstruction input.
5. Wear thin, matte, fitted but non-compressive clothing. Bare feet; empty pockets; remove watch, jewelry and belt; keep hair clear of neck/shoulders. Avoid loose hems, padded/shaping garments, reflective cloth and featureless deep black. Small non-repeating fabric patterns help stereo. Record coverage and visible folds. No nudity is required.
6. Later processing target: owned/available NVIDIA CUDA workstation, preferably 24 GB VRAM, 32–64 GB RAM, approximately 50 GB free working space. These are planning allowances, not measured minima. Resolve workstation access before implementation; this plan does not authorize purchases or uploads.
7. Before the later experiment, confirm checkpoint access, record code revisions/weight hashes/licenses, and run the upstream supplied example once. Then freeze preprocessing, initial objective settings and landmark definitions. Do not spend more than one engineering day repairing an unavailable baseline before considering a documented alternative.

## Exact capture procedure

### Camera calibration

Take **20 target images**, covering the center and edges of the frame with varied target tilt and position, at the same lens, resolution and focus profile intended for the body. Use 15 for fitting and reserve 5 for intrinsic-calibration checking. Lock focus at the subject distance when possible, as well as white balance/exposure. Maintain that profile; if autofocus/lens/crop changes, flag or recalibrate it. [Calibration method](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html)

Choose enough distance, usually about 2.5–3.5 m, that the whole person occupies 70–85% of image height with feet and head visible. Distance is a starting setup value, not a camera parameter inferred from a tape later. Aim near mid-torso; keep the person centered. Take one test photograph: if hands, face or fabric show blur, improve light/shutter speed before starting. Aim for at least 1/250 s if manual settings allow.

Calibrate camera poses from the fixed scene, excluding the person from feature matching. Establish scale from the measured target. The separate 1,000 mm bar checks scale; known height later constrains the body. If height and scene scale disagree, investigate instead of applying two incompatible rescalings.

### Pose and the 24-view orbit

Use a relaxed low A-pose: feet about 20 cm apart on marks, knees straight without locking, arms approximately 30° away from the torso, palms facing the thighs, fingers relaxed and separated from the hips. Head neutral, eyes forward, face neutral. Do not flex, suck in the abdomen, shift weight or rotate to follow the camera. Breathe quietly; do not hold one breath for the whole capture.

Mark 24 approximate camera directions around the subject, **15° apart**, numbered 0–23. View 0 is front. The helper walks one orbit taking a sharp full-body still at each direction, aiming to finish in **45–60 seconds**. Direction labels define coverage/splitting; actual camera angles come from calibration, not assumed perfect circle geometry. Take the final front QA image immediately afterward from the marked front position.

For capture A, immediately take 12 supplemental higher views and 12 lower views, every 30°, with overlapping full-body or upper/lower-body framing. Keep the same lens/focus profile and enough overlap to register them. Raise/lower the camera approximately 0.4 m relative to the primary ring, adjusting distance if needed to preserve framing. Keep the subject's stance unchanged; record any necessary pause. These later views can fail static-surface QA independently of the primary body ring.

After A, rest, step off the marks, and reset. Repeat the primary ring for B, then C. Repeat reference measurements for each session as below. Do not merge A/B/C into one “better” reconstruction: their differences are the repeatability test.

Reject an orbit with visibly shifted feet, changed arm configuration, substantial blur, cropped anatomy, or a large start/end pose change. After camera alignment, use a start/end keypoint or torso-width change greater than **1% of image body height** as a motion flag requiring review. This catches major motion; passing it does not prove rigidity. Log rejection and allow at most one immediate recapture per session.

### Fixed view split

Before any model sees Roni's images, reserve primary indices **1, 5, 9, 13, 17, 21** from each capture for evaluation. The remaining **18 primary views** are fitting views. The repeated front image is QA-only.

For A, the 24 supplemental photos may enter dense appearance reconstruction after passing QA, but **not the primary body fit**. No primary held-out image may supply human masks, keypoints, shape information or texture during fitting/baking. Their static background may establish evaluation camera poses; document this explicitly.

For a held-out primary frame, interpolate only the small pose corrections from neighboring fitting frames; do not refit its body or pose to its human pixels for the primary score. A separate diagnostic with pose correction may be reported, but cannot replace the held-out score. Preserve the split even if one view is inconvenient.

## Independent reference measurements

Measure barefoot standing height three times against a wall with a level straightedge, compressing hair rather than measuring its volume. Median height is the permitted body input. If the range exceeds **5 mm**, repeat the height procedure. Do not score the known-height constraint as recovered accuracy.

A helper records each of the seven dimensions **three times**, fully removing and repositioning the tape/tool between repetitions. Take these close in time to each capture, using the same relaxed A-pose. Keep tape snug without indentation; take torso readings at the end of an ordinary exhale. Record raw values and landmark photographs. If a dimension's three readings span more than **5 mm**, repeat the set once; unresolved variability makes that dimension inconclusive, not a model pass.

| Dimension | Frozen physical definition | Matching mesh definition |
| --- | --- | --- |
| Chest | Horizontal tape at a marked mid-sternum level, below axillary folds; record this exact level and keep arms out of tape path | Torso-only closed intersection at the corresponding marked level; exclude arms |
| Waist | Horizontal level halfway between the lowest palpable rib and top of iliac crest, marked on both sides | Torso intersection at mapped corresponding level, not the smallest arbitrary waist slice |
| Hip | Maximum horizontal circumference across buttocks within the pelvis band, found by a short vertical tape search and marked | Maximum torso/pelvis loop within the same anatomically bounded band; save selected plane |
| Right upper arm | Circumference halfway along acromion-to-olecranon landmark distance, arm relaxed in capture pose | Right-arm-only loop through the midpoint, plane perpendicular to upper-arm axis |
| Right thigh | Circumference midway between marked inguinal-crease and upper-patella levels | Right-thigh-only loop at mapped midpoint, perpendicular to thigh axis |
| Right calf | Maximum circumference between knee and ankle | Maximum right-calf loop within the same bounded region |
| Shoulder breadth | Straight distance between palpated left/right acromion marks; use a rigid measure or straight taut span, not a tape draped over the back | Euclidean distance between corresponding surface landmarks, not skeleton joint centers |

These are **project measurement definitions**, not a claim of ISO certification. Some differ from brand sizing charts. Record enough landmarks to reproduce them; do not infer their numeric values from reference pictures. Visible fiducial locations are allowed fitting observations, but tape numbers, ruler spans used for body dimensions, and evaluation summaries are withheld.

Store reference numbers separately from reconstruction inputs. The helper retains them, or seals the file until mesh parameters, configuration and predictions are frozen and hashed. Freeze landmark mappings using anatomical evidence without seeing tape values. Use the median of each session's valid three readings as that session's reference. Never tune body parameters, offsets, cross-section placement or model choice using the seven numbers and still call the result an independent pass.

## Processing sequence for a later implementation

1. **Preflight and calibration QA.** Record settings, target checks, split and known height. Require held-out calibration-target RMS reprojection ≤ **1 pixel** at the calibrated image resolution and scale-bar error ≤ **5 mm** over 1,000 mm. Report residuals and rejected points. These gates catch gross calibration problems, not all systematic distortion.
2. **Single-image baseline.** Run SAM 3D Body on front fitting view 0 for A/B/C. Apply the same declared height convention. Save body shape and all seven predicted measurements before references are opened. This tests what extra capture effort buys us.
3. **Multi-view fit.** For each capture independently, fit one MHR identity/skeletal shape to the 18 fitting views using measured cameras, checked masks/landmarks and the allowed height. Use the objective in [architecture.md](architecture.md). Require the height-constraint residual ≤5 mm without changing the calibrated camera scale to force agreement. Save initialization, pose changes and residuals. No circumferences enter optimization.
4. **Bounded robustness checks.** On A, rerun from a second valid initialization and once with calibration parameters perturbed within their measured uncertainty. Also test a predeclared 0–3 mm outward silhouette uncertainty band for covered regions. Compare predicted dimensions before unblinding; a > **10 mm** change in any primary torso girth flags instability. These are diagnostics, not alternate outputs to cherry-pick.
5. **Freeze and evaluate.** Save raw meshes, native parameters, seven values per capture, holdout renders, manual corrections, runtime and peak VRAM. Only then open tape references. Compute the gates below for the primary output. Keep the baseline and all failures in the report.
6. **Appearance only after a metric pass.** Reconstruct A's observed surface/texture from its 18 fitting plus 24 supplemental photos through COLMAP/OpenMVS. No generative filling for the evidence version. Render the six primary held-out cameras, inspect seams and facial identity. Save unknown coverage explicitly.
7. **Rig and separation check.** Import body and observed surface into Blender as separate objects/collections. Test a modest arm raise, a 30° elbow bend and a 20° knee bend. Verify rest mesh dimensions/landmarks after export/import. Toggle captured appearance and a removable primitive proxy independently. This is a technical test, not a virtual try-on demo.

## Success criteria

Every value is pending until actually measured. **All applicable gates must pass**, and all three primary captures must yield valid body results. A failed reference measurement or invalid capture produces an inconclusive result requiring correction, not a pass.

| Gate | Predeclared criterion | Meaning / limitation |
| --- | --- | --- |
| Camera/scale | Held-out target RMS ≤1 px; unused 1,000 mm check bar error ≤5 mm; height-constraint residual ≤5 mm without overriding camera scale | Basic geometric setup is usable; constrained height is not an independent accuracy result |
| Primary torso dimensions | Absolute chest, waist and hip error **≤20 mm each, in every capture** | Provisional usefulness, not tailoring certification |
| Other dimensions | Upper arm, thigh, calf error **≤15 mm each**; shoulder breadth **≤10 mm**, every capture | Small regions cannot hide behind torso averages |
| Aggregate accuracy | MAE over the seven dimensions **≤10 mm in each capture** | Report individual and signed errors as well |
| Repeatability | Maximum minus minimum prediction across A/B/C **≤10 mm for every dimension** | Repeatable on one day/person; not population precision |
| Robustness | No primary torso girth changes >10 mm in the declared initialization/calibration/clothing-band checks | A fragile accidental fit is insufficient |
| Held-out body consistency | In each capture, mean silhouette IoU **≥0.95** over six views and no view <0.90, excluding predeclared hair/accessory regions; no obvious torso/limb misregistration | Tests visible silhouette, not hidden body accuracy; use the same frozen masks for all methods |
| Identity | Roni and helper each rate recognizable identity/proportions **≥4/5**, using the rubric below and all held-out views | Subjective, explicitly separate from metric evidence |
| Appearance | No missing face/major visible torso region; no obvious doubled facial features or large texture seams at a 1,500 px-tall full-body render; visible skin colors broadly agree under matched display conditions | Capture-light texture only, not validated albedo; unobserved soles/occlusions may remain marked unknown |
| Topology/rig | Body connected as intended with no accidental holes at measurement loops or gross limb inversions; three modest poses succeed; exported/imported rest dimensions change <1 mm | Scan can remain unrigged; preserve native body parameters/correctives |
| Clothing independence | Hiding captured surface/texture leaves complete rigged body with a neutral material; removable proxy does not change body geometry or measurements | Structural readiness, not recovered real clothing or skin |
| Practicality | After setup, ≤30 min manual corrections per body capture; ≤2 h compute per body capture and ≤4 h for A appearance on recorded hardware | Modest prototype budget, not a consumer speed target |

Identity rubric: **1** unusable/unrecognizable; **2** generic person with some matching attributes; **3** recognizable mainly through texture/hair/clothing, with obvious proportion or face errors; **4** recognizable across views with acceptable proportions and only localized errors; **5** close resemblance across all views. Score body proportions/flat-shaded face and textured appearance separately. Both raters must reach 4 for overall identity; report sub-scores even if the aggregate passes. This is not a biometric identity test.

Do not “repair” evaluation meshes by sculpting to reference measurements. Save raw and any cosmetically edited assets separately. No generated back views, beauty render, scale-free alignment, or best-looking frame can replace the declared metrics.

For every dimension report `prediction − reference`, absolute error, raw tape range, repeat-capture prediction range, and known input constraints. Round presentation to whole millimeters; preserve internal precision without implying millimeter-level truth. Report all three captures instead of a misleading population confidence interval.

## Time budget and stop/switch rules

Planning estimate: **45–90 minutes** for setup/capture/references and **3–5 focused engineering days** for a later minimal integration, capped at **five days** before reassessment. The fit/export/measurement work is custom; this estimate is not a completion promise. Maximum one corrected capture round and one targeted alternative body model before a decision. Any unblinded revision uses a newly captured, still-blinded set for an independent pass.

| Observed failure | Next action and abandonment evidence |
| --- | --- |
| Checkpoints unavailable or CUDA setup consumes the preflight day | Record blocker; try a released SMPL-X initializer or GEM-X/SOMA only after checking its specific terms. Do not build a new estimator |
| Camera/scale QA fails | Fix target, lens settings, scene features or poses first. No body-model comparison is valid until calibration passes |
| Background cameras are sound, but body rings disagree or dense appearance doubles limbs | Shorten capture and recapture once. If motion persists, abandon sequential one-camera static reconstruction; test simultaneous calibrated RGB cameras or explicitly revise scope to depth-assisted capture |
| Good cameras and stable observations, but systematic girth/shape bias persists | Try one SMPL-X or native Anny/SOMA fit with the same observation protocol and no reference-value tuning. Switch away from MHR only if that alternative passes a fresh blinded test or removes a clearly demonstrated representation/tooling limitation |
| Different shape/offset settings fit images equally well but yield incompatible girths | Mark underlying body insufficiently observable. Do not resolve the ambiguity by picking the tape-matching result; investigate less ambiguous clothing or measurement-assisted fitting under a new protocol |
| Body gate passes; face/texture fails | Keep body route. Test a separate close head capture or observed-surface improvement. LHM++/SiTH can be appearance comparators, clearly labeling synthesized regions; they do not replace metric evidence |
| Single-image baseline already meets every body gate | Run a new independent session before dropping multi-view capture. It may be a personal shortcut, not evidence that single-view capture generalizes |
| Two well-calibrated capture rounds and one reasonable body-model alternative fail the metric gate | Stop this RGB-only fit-estimation route. A visual-avatar project may still be viable, but continuing garment-fit claims needs an explicit shift to additional measurements, different capture, or a validated scanner |
| Metric/visual gates pass but rig/separation fails within budget | No full Phase 1 pass. Preserve successful geometry and fix representation/export before proceeding to clothing work |

## Final evidence bundle

Produce this only in the later experiment: private originals/calibration, fixed view split, licenses/version manifest, per-capture native body and standard mesh exports, A's raw observed surface/texture, measurement definitions and loops, frozen predictions and reference readings, holdout render comparisons, timings/manual-effort log, rig/separation screenshots, and a short decision report.

The report must state one of:

- **Proceed:** all gates passed for Roni under this protocol; validate more sessions/subjects before product claims.
- **Partial feasibility:** identify exactly which dimensions passed; authorize only the corresponding follow-up research.
- **Inconclusive:** invalid calibration/reference/capture prevents a fair test; state the bounded corrective experiment.
- **Stop or change input assumptions:** controlled RGB evidence did not support the metric requirement within the declared budget.

**First pipeline to prototype:** calibrated phone photos → SAM 3D Body → shared-shape MHR optimization and withheld anthropometry → separate COLMAP/OpenMVS appearance → Blender validation. The experiment succeeds by producing trustworthy evidence, including a defensible decision to stop.
