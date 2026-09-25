# Phase 1 feasibility: RGB capture of one real person

**Research date: 2026-09-25. No reconstruction was run.** Repository inspection establishes that components and download instructions exist; it does not establish successful installation, access approval, or working inference. Hardware figures below distinguish author reports from our planning estimates. This is a focused review of usable approaches, not an exhaustive ranking of every 2026 paper.

## Finding

There is enough evidence to justify a **controlled, falsifiable experiment**, but not to promise an accurate body scanner or garment-fit predictor. The strongest first architecture combines calibrated multi-view observations with an explicit, rigged body prior, and keeps appearance reconstruction separate. A single-image generative avatar is a poor primary measurement instrument.

Our proposed first body representation is **MHR**, initialized with **SAM 3D Body**, then jointly fitted across calibrated images. **SMPL-X** remains a valuable alternative with a larger established human-reconstruction ecosystem. The preference for MHR is an engineering judgment about initialization, rigging, and licensing—not evidence that MHR gives better circumferences. The experiment must establish that.

## Six different meanings of “accurate”

| Dimension | What must be tested | What does not prove it |
| --- | --- | --- |
| Visual identity | Recognizable face, proportions, characteristic appearance from held-out views | A realistic generic person, attractive render, or recognizable shirt |
| Underlying body shape | Correct torso/limb geometry beneath the capture outfit, subject to observed evidence | A close fit to a loose garment; a smooth plausible prior |
| Metric measurements | Defined lengths and circumferences in real units against independent references | Known height imposed on a mesh; low joint error; low image loss |
| Texture/appearance | Observed detail, color consistency, coverage, seams and view dependence | Hallucinated back texture or lighting baked into “skin color” |
| Topology/rigging | Stable body topology, usable skeleton/weights, controlled deformation | A triangle mesh that merely opens in Blender |
| Clothing independence | A complete body object whose geometry and material are independent of the observed outfit | Deleting shirt-colored pixels or animating a fused clothed shell |

These distinctions are our evaluation framework. Some cannot be fully validated without additional evidence: tape measurements constrain selected dimensions, not the entire hidden surface. A reference scanner would strengthen shape validation but is deliberately outside the minimum experiment.

## What RGB can and cannot establish

One image leaves depth, scale, unseen surfaces, and clothing thickness ambiguous. Known height resolves one scale ambiguity; it does not uniquely determine waist depth, shoulder shape, or the back. Multiple calibrated views add actual geometric constraints, but silhouettes do not reveal every concavity. Priors regularize those missing observations and can also bias the result toward an average body.

The distinction is measurable in the literature. **PromptHMR's 448×448 HBW shape-prompt ablation**, with text used in training and testing, reports chest/waist/hip errors of **43/76/58 mm**. This is a specific in-the-wild experiment, not a bound on controlled capture or a result for SAM 3D Body. It demonstrates why strong mesh-recovery results cannot be assumed to meet a 10–20 mm anthropometry target. [Original paper, Table 3](https://arxiv.org/html/2504.06397v1)

SAM 3D Body reports strong pose/mesh benchmarks, but its reported MPJPE/PVE scores are not chest, waist, or hip circumference validation. MPJPE measures joint position error; PVE measures vertex error under a specified protocol. Procrustes-aligned metrics may remove rotation, translation, and scale. None can be substituted for an absolute circumference test. The paper also acknowledges shape limitations across age groups. [Original paper](https://arxiv.org/html/2602.15989v1)

Beware apparently comparable measurement claims: a 2025 compact imaging paper reports roughly 5 mm mean real-world error, but its system includes **four RGB and two RGB-D cameras**. Its abstract does not establish that one moving phone achieves that result. [Original publication](https://www.sciencedirect.com/science/article/pii/S0263224125001368)

Opaque clothing hides skin. Even perfectly reconstructed garment geometry leaves unknown ease, fabric thickness, and body compression. As a geometric illustration, adding a uniform 3 mm radial layer to a circular cross-section increases circumference by about `2π × 3 = 19 mm`. Real clothing is less uniform. Fitted clothing reduces ambiguity; compression clothing changes the body we are trying to measure. There is no generally identifiable solution for the exact body beneath arbitrary loose clothing from RGB alone.

## Candidate capabilities

Ratings are **our assessment for this project**, informed by the linked primary sources. “Estimated body” means a prior-based inference, not recovered hidden ground truth. No candidate below has verified measurement accuracy on Roni.

| Approach | Identity, surface and texture | Body shape / metric outlook | Representation, rigging and Blender | Clothing independence / hidden body |
| --- | --- | --- | --- | --- |
| **SAM 3D Body + MHR, single-image baseline** | Coarse identity/proportions; no captured texture or hair | Strong initialization candidate; monocular scale/shape ambiguity remains | Parametric mesh and skeleton; MHR includes FBX rig assets. Export fitted parameters/mesh; verify correctives separately | Supplies estimated body separately from clothes; does not recover unseen skin |
| **Calibrated multi-view shared MHR fit — proposed first** | Body proportions constrained by real views; texture is a separate task | Best first balance of controllable capture and explicit measurements; no published accuracy for our integration | Fixed model topology/rig; custom fitting and measurement layer required | Independent estimated body; fitted-clothing uncertainty remains |
| **SMPL/SMPL-X with SMPLify-X/EasyMocap-style multi-view fitting** | Smooth anatomical body; little personal surface detail without augmentation | Useful alternative to MHR; limited shape space and keypoint-only fitting can miss girths | Established skinned mesh; SMPL-X adds articulated face/hands. Standard mesh export plus rig integration | Estimates body under clothes; no automatic independent garment extraction |
| **SHAPY** | Body-shape emphasis rather than detailed identity or texture | Specifically studies shape and measurements; useful research comparator, still a monocular prediction | SMPL-X parameters plus virtual measurements; normal SMPL-X tooling | Estimated body; hidden geometry remains statistical |
| **COLMAP + OpenMVS photogrammetry** | Strong observed texture/detail potential with sharp, overlapping images and a nearly static subject | Can constrain measured exterior in calibrated scale; clothing is exterior, motion causes inconsistent geometry | Point cloud → irregular textured triangle mesh; Blender import straightforward, rigging/retopology additional | Clothes/hair normally fused into the scan; does not infer underlying body |
| **ECON** | Detailed clothed normals/mesh; full texture needs extra steps | Front/back reconstruction uses learned normals and a body prior; no independent anthropometry guarantee | Explicit clothed mesh; provided avatarization and Blender-related workflows | Animation is possible, but garment geometry is not an independently simulated clothing asset; body prior is an estimate |
| **SiTH** | Fully textured single-view clothed mesh; diffusion fills unseen appearance | Back-side plausibility is not subject-specific evidence; metric accuracy unvalidated | Textured mesh; separate Editable-Humans workflow for reposing | Primarily observed/invented clothed surface, not independently recoverable clothes and skin |
| **NeRF video avatars: InstantAvatar** | Good subject-specific view synthesis with suitable video/poses | Density and image fidelity are not a calibrated body boundary | Articulated radiance field; mesh extraction/UV export are extra work, not ordinary Blender mesh use | Can animate the captured outfit; hidden body and replaceable garments are not solved |
| **Video Gaussian avatars: GaussianAvatar** | Captures appearance across video; learned deformation supports animation | Splat positions/opacity are not a watertight measurable body | Deformable Gaussians + body driver; custom renderer/add-on required | Outfit baked into avatar representation; changing pose is not changing clothing |
| **LHM / LHM++** | Fast single/few-image animatable avatars; attractive appearance baseline | Synthesized missing views; no demonstrated tailoring-grade measurements | Gaussian/neural representation; some LHM++ variants export splat PLY, which is not a triangle mesh | Reposing supported, but independent garment/body separation is not established |
| **DUSt3R / VGGT; human-aware HAMSt3R** | Learned multi-view cameras/depth/point maps; helpful on difficult imagery | Potential geometry/camera initialization, not calibrated anthropometry by default | Point maps/clouds; extra meshing, fitting, texture, rigging | Visible surface evidence, not recovered body beneath clothes |

### Body models are representations, not scanners

[SMPL](https://smpl.is.tue.mpg.de/) and [SMPL-X](https://github.com/vchoutas/smplx) encode shape and pose on a consistent skinned mesh. Their existence does not imply that an image estimator recovered the right shape. SMPL-X is useful for eventual hands, facial articulation, and accessories, but full-body phone photos contain limited face/finger detail. Shape-space bias can survive excellent silhouette alignment.

[MHR](https://github.com/facebookresearch/MHR) exposes differentiable body, head, and hand identity controls alongside skeletal parameters. Its code/model package and rig assets make it a serious current alternative. Native mesh units, estimator output units, and export units must still be checked independently. Its SMPL/SMPL-X conversion tooling performs fitting; conversion error must be measured instead of treated as lossless. [Conversion documentation](https://github.com/facebookresearch/MHR/blob/main/tools/mhr_smpl_conversion/README.md)

Two newer options weaken the assumption that this project must depend permanently on SMPL-X. [Anny](https://github.com/naver/anny) has interpretable shape controls and a MakeHuman-derived rig. [SOMA-X](https://github.com/NVlabs/SOMA-X) provides common topology/rig conventions and multiple identity backends. Neither is by itself a consumer-image measurement system. Keep an adapter boundary, but do not add a second body representation to the minimum experiment without evidence that the first one fails.

### What has superseded ECON/SiTH—and what has not

ECON remains useful for explicit clothed geometry; SiTH for textured single-image reconstruction. Their objectives differ from anthropometry. ECON predicts normal-based detail around a body estimate; SiTH explicitly generates a back view. High-frequency detail does not correct low-frequency body-size bias. [ECON paper](https://openaccess.thecvf.com/content/CVPR2023/papers/Xiu_ECON_Explicit_Clothed_Humans_Optimized_via_Normal_Integration_CVPR_2023_paper.pdf), [SiTH paper](https://openaccess.thecvf.com/content/CVPR2024/papers/Ho_SiTH_Single-view_Textured_Human_Reconstruction_with_Image-Conditioned_Diffusion_CVPR_2024_paper.pdf)

Newer work improves different components: SAM 3D Body and [SMPLest-X](https://github.com/MotrixLab/SMPLest-X) improve human mesh recovery; [BLADE](https://github.com/NVlabs/blade) addresses camera perspective; [GEM-X](https://github.com/NVlabs/GEM-X) offers video motion recovery with SOMA; [LHM](https://arxiv.org/abs/2503.10625) and [LHM++](https://github.com/aigc3d/LHM-plusplus) improve avatar generation speed and appearance. These are not evidence that the joint problem of accurate body, identity, skin, separable clothing, and garment fit is solved.

HAMSt3R is particularly relevant conceptually because it reconstructs human-aware point maps from uncalibrated views. Its published evaluations concern scene/human reconstruction; they do not establish circumference accuracy. A clearly usable official code-and-weight release was not verified in this review, so it is a watch-list method, not a Phase 1 dependency. [Original paper](https://arxiv.org/html/2508.16433v1)

## Practicality, hardware, time, and release status

**A = author-stated; E = our unbenchmarked planning estimate; U = not verified/not specified.** “Local” means the models can be processed on owned hardware after asset acquisition, not that the current Mac can run the upstream pipeline unchanged. None of the heavy neural paths has been tested here on Apple Silicon. Input remains ordinary RGB even when processing requires a GPU workstation.

| Candidate | Code/weights and complexity | Compute / local operation | Time relevant to this experiment |
| --- | --- | --- | --- |
| SAM 3D Body | Official inference code; ViT-H and DINOv3 checkpoints gated on Hugging Face. Medium setup; custom multiview optimization is additional | Upstream estimator uses CUDA; **E:** plan NVIDIA 24 GB VRAM, 32–64 GB RAM, batch size 1. Minimum VRAM U | **E:** seconds per image, 1–10 min for a small view set including preprocessing; benchmark rather than promise |
| Shared MHR fit | Model/autograd exist; our silhouette objective, constraints and anatomical measurements do not. High relative complexity | Model supports CPU/GPU; **E:** reuse 24 GB workstation, accumulate views in small batches | **E:** 5–30 min per fit; engineering cap in experiment is separate from runtime |
| SMPL-X / EasyMocap | Code/assets available with separate model registration. Existing multiview fitting helps, but adding shape-sensitive silhouette losses is work | CPU body evaluation possible; GPU estimators/rendering preferred. **E:** 12–24 GB GPU for fitting stack | **E:** minutes to tens of minutes per subject; detector/calibration/setup extra |
| SHAPY | Code and model acquisition documented; older dependency stack, medium/high integration effort | Documented Ubuntu/PyTorch/CUDA environment; **E:** reserve 12–24 GB, actual minimum U | Inference seconds-scale **E**; no comparable end-to-end timing verified |
| COLMAP + OpenMVS | Mature code, no learned weights required. Medium setup, human-capture cleanup can dominate | CPU paths available; **E:** 32–64 GB RAM, 8–16 GB GPU useful, 20–50 GB working storage per pilot. Mac source-build support must be tested | **E:** 15–120 min per small capture, resolution dependent; not neural “inference” |
| ECON | Code/models and setup docs available; medium/high dependency burden | **A:** CUDA 11.6, GPU memory **>12 GB**, Ubuntu setup | **A:** README demo ~1.8 min; not a guarantee for our hardware or full texture/rigging |
| SiTH | Reconstruction/diffusion downloads documented; SMPL-X and keypoint dependencies separate. Medium/high setup | **A:** Ubuntu 22.04, CUDA 12.1, RTX 3090 tested | **A:** about 2 min for demo on RTX 3090; acquisition and manual fitting excluded |
| InstantAvatar | Research code, custom-video workflow; subject optimization and preprocessing required. License unresolved; high integration | CUDA ecosystem; **E:** 12–24 GB GPU, minimum U | Paper advertises 60-second learning; full custom-video pipeline timing U |
| GaussianAvatar | Training/inference/custom-video scripts and example subject checkpoints available. Must optimize Roni, not reuse somebody else's avatar | CUDA rasterizer; **E:** 12–24 GB, high setup | **E:** tens of minutes to hours including preprocessing/optimization; no verified target-machine timing |
| LHM++ | Inference/weights listed; default PixelShuffle variant says Hub weights pending. Variant selection and CUDA dependencies add complexity | **A:** README lists 8 GB service requirement; tested CUDA 12.1 | **A:** table lists 0.79 s for 1 view, 1.31 s for 8 views; hardware/preprocessing context insufficient for direct comparison |
| VGGT / DUSt3R | Official code/checkpoints; medium effort for point maps, high for finished human assets | GPU strongly preferred; memory grows with view count. **E:** 16–24 GB for small batches; do not assume all photos fit | Feed-forward results seconds-scale; optimization/meshing/export extra and target-machine timing U |
| Anny / SOMA-X | Body/rig code and assets, not image scanners; custom fitting still needed | CPU/GPU paths; GPU rendering useful. **E:** 8–24 GB for a fitting experiment | Model evaluation not the bottleneck; full fit runtime U |
| GEM-X | Official video code and checkpoint download; motion-oriented comparator | Current README specifies CUDA 12.6+, PyTorch 2.10+; minimum VRAM U | No verified end-to-end timing for this capture protocol |

Hardware/runtime sources: [SAM installation](https://github.com/facebookresearch/sam-3d-body/blob/main/INSTALL.md), [SAM estimator](https://github.com/facebookresearch/sam-3d-body/blob/main/sam_3d_body/sam_3d_body_estimator.py), [ECON installation](https://github.com/YuliangXiu/ECON/blob/master/docs/installation-ubuntu.md), [ECON demo](https://github.com/YuliangXiu/ECON), [SiTH setup/demo](https://github.com/SiTH-Diffusion/SiTH), [SHAPY setup](https://github.com/muelea/shapy/blob/master/documentation/INSTALL.md), [InstantAvatar](https://github.com/tijiang13/InstantAvatar), [GaussianAvatar](https://github.com/aipixel/GaussianAvatar), [LHM++ model table](https://github.com/aigc3d/LHM-plusplus), [VGGT](https://github.com/facebookresearch/vggt), [DUSt3R](https://github.com/naver/dust3r), [GEM-X](https://github.com/NVlabs/GEM-X).

COLMAP's current installation documentation includes an AMD HIP dense-stereo backend; older FAQ text still describes the CUDA-only situation. Pin a version and inspect the actual build. For this experiment, NVIDIA remains the simpler shared target because the human estimators also depend on CUDA. OpenMVS is a useful CPU-capable dense/mesh/texture alternative; “CPU possible” does not establish acceptable runtime on this Mac. [COLMAP installation](https://colmap.github.io/install.html), [OpenMVS](https://github.com/cdcseacave/openMVS)

## Licensing: code, weights, and models are different assets

This is a summary of inspected upstream terms, not a blanket clearance for a commercial product. “Research only” and custom licenses are not interchangeable with permissive open source. A personal prototype of a future business should not automatically be assumed to satisfy every non-commercial research clause.

| Component | Inspected terms / practical consequence |
| --- | --- |
| SAM 3D Body code + checkpoints | Custom [SAM License](https://github.com/facebookresearch/sam-3d-body/blob/main/LICENSE), not Apache/MIT. Includes redistribution/use conditions and trade-control restrictions; not described as research-only. Checkpoint access requires approval. Review separately from MHR |
| MHR | [Apache-2.0](https://github.com/facebookresearch/MHR/blob/main/LICENSE) for the published package. Preserve notices and inspect downloaded asset notices |
| SMPL-X / SMPLify-X | [Non-commercial scientific research model/software license](https://smpl-x.is.tue.mpg.de/modellicense.html); commercial arrangements separate. Free download is not product-use permission; distributing body-derived assets also needs terms review |
| EasyMocap | Current [Project Registration License v1.0](https://github.com/zju3dv/EasyMocap/blob/master/LICENSE): personal/research/education use without registration; organizational project use requires registration. Third-party model terms remain. Do not assume an older license |
| SMPLest-X | [S-Lab License 1.0](https://github.com/MotrixLab/SMPLest-X/blob/main/LICENSE.txt), non-commercial; SMPL-X assets separate |
| SHAPY | [README declares non-commercial scientific research](https://github.com/muelea/shapy#license); its linked top-level LICENSE was missing when checked. Obtain the actual applicable terms before use; dependent SMPL-X assets separate |
| ECON | [Non-commercial scientific research](https://github.com/YuliangXiu/ECON/blob/master/LICENSE) code/model; dependent assets separate |
| SiTH | [MIT code](https://github.com/SiTH-Diffusion/SiTH/blob/main/LICENSE); this does not clear SMPL-X, OpenPose, diffusion bases, or every downloadable checkpoint. Full dependency/weight rights unresolved for product use |
| COLMAP / OpenMVS | [COLMAP](https://github.com/colmap/colmap/blob/main/LICENSE) BSD, with separate dependency terms / [OpenMVS](https://github.com/cdcseacave/openMVS/blob/master/LICENSE) AGPL-3.0. AGPL permits commercial use but carries obligations that must be reviewed before integration/distribution/service use |
| InstantAvatar | No top-level license was found in the inspected repository root; treat permission as unresolved. SMPL/OpenPose/CUDA dependencies have separate terms |
| GaussianAvatar / original 3DGS | [GaussianAvatar MIT](https://github.com/aipixel/GaussianAvatar/blob/main/LICENSE) does not override its body-model or rasterizer dependencies. Original [3DGS license](https://github.com/graphdeco-inria/gaussian-splatting/blob/main/LICENSE.md) has research/non-commercial conditions |
| LHM++ | [Apache code](https://github.com/aigc3d/LHM-plusplus/blob/main/LICENSE), but [weights CC BY-NC 4.0](https://github.com/aigc3d/LHM-plusplus/blob/main/LICENSE_WEIGHT), plus [NVIDIA component terms](https://github.com/aigc3d/LHM-plusplus/blob/main/LICENSE_NVIDIA). An Apache badge or “SMPLX-FREE” variant name does not clear the full stack |
| VGGT / DUSt3R | [VGGT](https://github.com/facebookresearch/vggt): commercial-use checkpoint is separately gated/licensed; original weights remain non-commercial. [DUSt3R](https://github.com/naver/dust3r): CC BY-NC-SA 4.0 plus upstream constraints |
| Anny | [Apache code](https://github.com/naver/anny), default MakeHuman-derived assets CC0; optional SMPL-X topology is non-commercial. Select assets explicitly |
| SOMA-X / GEM-X | [SOMA-X Apache](https://github.com/NVlabs/SOMA-X) with third-party backend terms retained. [GEM-X](https://github.com/NVlabs/GEM-X) distinguishes Apache code from NVIDIA Open Model License weights |
| SMPL-Anthropometry | [MIT utility](https://github.com/DavidBoja/SMPL-Anthropometry), SMPL-family models separately licensed. Utility license does not clear the body model |

Snapshot anchors for reproducibility: [SAM 3D Body b5c765a](https://github.com/facebookresearch/sam-3d-body/tree/b5c765a0d89d789985e186d396315e7590887b94), [MHR d96fafa](https://github.com/facebookresearch/MHR/tree/d96fafa33bbf018647c70c3525e91f53e79d2a14), [EasyMocap e6006fd](https://github.com/zju3dv/EasyMocap/tree/e6006fd3814d5f8ad45a7ce965beb9bcc90767f2), [LHM++ 906b5d9](https://github.com/aigc3d/LHM-plusplus/tree/906b5d9fb967ab42efb92f6fa55bf22cac86b653). These are inspected revisions, not tested dependency pins. No weights were downloaded.

## Measurement tools and what they actually validate

[SHAPY](https://github.com/muelea/shapy) is relevant because it explicitly studies body shape and anthropometry, rather than only pose. Its virtual-measurement machinery is useful precedent. [SMPL-Anthropometry](https://github.com/DavidBoja/SMPL-Anthropometry) computes landmark distances and plane-cut circumferences, assumes a neutral T-pose, and can normalize measurements to known height. It measures the mesh it receives; it does not establish that this mesh matches the person. Its vertex definitions cannot be used unchanged on MHR.

[GarmentMeasurements](https://github.com/mbotsch/GarmentMeasurements) is another useful reference for tailor-oriented measurement definitions. Again, extraction from a mesh and reconstruction of the correct mesh are distinct problems. Do not quietly replace anatomical waist with the smallest convenient cross-section, or straight-line length with a tape path.

[MeasureXpert (ICCV 2025)](https://openaccess.thecvf.com/content/ICCV2025/papers/Zhao_MeasureXpert_Automatic_Anthropometric_Measurement_Extraction_from_Two_Unregistered_Partial_Posed_ICCV_2025_paper.pdf) estimates anthropometry from two partial dressed **3D scans**, not two ordinary RGB images. Its [official repository](https://github.com/daisyranc/MeasureXpert) contains code and a CUDA 9.0 setup, but a clear top-level license and ready pretrained-weight download were not verified. It is not a drop-in RGB baseline; creating its input and proving permission would be separate work.

Our experiment uses seven explicitly defined measurements, repeated captures, and frozen predictions. Known height is an input and is excluded from reported recovered-measurement accuracy. We report per-dimension error, signed bias, repeatability, and reference uncertainty. A mean alone can hide an unacceptable waist error. With one person, neither population confidence intervals nor subgroup fairness claims are justified.

## Capture alternatives

| Input | Advantage | Main problem | Decision |
| --- | --- | --- | --- |
| One front photo | Lowest effort; establishes a baseline | Depth/back/body-size ambiguity | Baseline only |
| Front/side/back stills | More shape information | Sparse cameras and pose changes | Useful ablation after a successful full capture |
| Person rotates before fixed phone | Simple solo capture, full appearance coverage | Rotation changes balance, limbs, breathing and garment folds; stationary background contradicts a rigid rotating-object assumption | Later convenience test, with human-aware pose handling |
| Camera orbits stationary person | Background can anchor cameras; body tries to maintain one pose | Human sway/breathing still violate static reconstruction | First experiment, short capture with helper |
| Several simultaneous calibrated RGB cameras | Reduces motion inconsistency | More equipment, synchronization and setup | Escalation only if sequential motion is the measured failure |
| Depth/LiDAR or professional scan | Stronger geometric reference | Different input promise; some phones have limited relevant resolution | Optional later reference/fallback, not evidence of RGB-only success |

A plain backdrop helps segmentation but gives poor camera-matching features. Use a plain region around the silhouette and static textured markers elsewhere in view. Keep two masks: background features for camera registration, person evidence for reconstruction. Do not remove the very background needed to estimate the orbit. This is our capture-design inference from the static-scene assumptions of [COLMAP](https://colmap.github.io/tutorial) and camera calibration practice in [OpenCV](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html).

## Long-term feasibility boundaries

- **Independent clothing changes:** feasible as an asset architecture. A fitted body plus separately authored/scanned garments permits replacement. A fused scan does not supply sewing patterns, cloth rest shape, or hidden skin. Segmentation alone cannot recover these missing quantities.
- **Actual garment fit:** body measurements are necessary but insufficient. Need garment dimensions at the right locations, size-specific patterns/rest geometry, seam construction, stretch/bending response, ease, pose and contact. Two bodies with the same few girths can distribute volume differently. A size-chart comparison is not a validated drape/pressure simulation. [GarmentCodeData](https://arxiv.org/abs/2405.17609) and its [simulation documentation](https://github.com/maria-korosteleva/GarmentCode/blob/main/docs/Running_data_generation.md) expose these additional inputs.
- **Real garments from product photos:** exact unseen cut, thickness and material are not uniquely recoverable from ordinary pictures. Generated plausible garments may support appearance previews, but cannot justify accurate size/fit claims. Prefer manufacturer patterns/material data or physical measurement later.
- **Hair and facial identity:** whole-body photographs limit sampling density. Separate close capture may be necessary. Hair is not a solid skin surface; hairstyle replacement needs scalp/head geometry and a separate hair asset. Recoloring highlights in a baked photograph is not relighting real hair.
- **Jewelry:** separate rigid assets and attachment points are practical; earrings/rings need finer ear/finger capture than a body-measurement prototype provides.
- **Color/style recommendations:** style preferences can be modeled separately. Accurate physical color requires controlled illumination, color calibration, material response, and display assumptions; a texture under unknown light is not skin albedo.
- **Exact hidden-body recovery:** unsupported for arbitrary opaque clothing. More compute cannot recover information absent from the observations. Additional captures, manual measurements, or explicit uncertainty are required.

## Decision

Start with **calibrated multi-view MHR fitting**, not a generative clothed avatar. Keep **COLMAP/OpenMVS appearance reconstruction** separate and gated behind useful body measurements. Use a single-image SAM 3D Body fit as the cheap comparator. Do not train any model.

Abandon the particular model if another explicit model fits the same calibrated observations and independent measurements materially better. Abandon sequential capture if camera calibration is sound but subject motion prevents consistency. Abandon the RGB-only fit-estimation claim if two controlled attempts and one targeted model alternative still cannot satisfy the predeclared measurement gate. Exact triggers, time limits, and the narrower conclusions permitted by a pass are in [Phase 1](phase-1.md).
