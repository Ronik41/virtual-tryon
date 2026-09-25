# Realistic Virtual Try-On — Research Prototype

**Status: research and experiment design only. No application or reconstruction pipeline has been implemented or run.**

Research checked: **2026-09-25**. Initial subject: **Roni only**.

The long-term goal is a personal, realistic digital representation that supports changing clothing, hairstyles, hair color, jewelry, and accessories; previewing real garments; receiving color/style suggestions; and eventually estimating garment fit from body and garment measurements.

Phase 1 asks a narrower question:

> Can consumer RGB camera input produce a recognizable, editable, metrically useful 3D representation of me, accurate enough to justify further research?

A convincing avatar is insufficient. We will assess visual identity, underlying body shape, body measurements, texture, rigging, and clothing independence separately. A result may succeed at one and fail at another.

## Read the plan

- [Feasibility research](docs/feasibility.md): evidence, candidate methods, hardware, licensing, and limitations.
- [Proposed architecture](docs/architecture.md): an explicit body mesh for measurements, with separate appearance and garment assets.
- [Phase 1 experiment](docs/phase-1.md): capture instructions, independent references, evaluation gates, and stop/switch decisions.
- [Project instructions](AGENTS.md): scope and evidence rules for future work.

## Recommendation

Prototype **calibrated, sequential multi-view RGB capture → SAM 3D Body initialization → joint fitting of one MHR body across views**. Use COLMAP for camera geometry, checked silhouettes/keypoints for fitting, known height for the declared scale constraint, and withheld tape measurements for evaluation. Once the body passes the metric gate, use COLMAP/OpenMVS on the same capture to reconstruct a separate observed surface and texture for identity assessment.

This is a proposed integration, not an existing turnkey measurement product. [SAM 3D Body](https://github.com/facebookresearch/sam-3d-body) supplies initialization; [MHR](https://github.com/facebookresearch/MHR) supplies the deformable body model; [COLMAP](https://github.com/colmap/colmap) and [OpenMVS](https://github.com/cdcseacave/openMVS) supply geometric reconstruction components. The shared-shape fitter and measurement definitions will require bounded engineering in a later task.

The smallest defensible test uses one phone, a helper, fitted non-compressive clothing, controlled light, calibration targets, known height, three short independent captures, and repeated reference measurements. A detailed mesh under opaque clothing remains an estimate; fitting the clothing surface does not reveal the body beneath it.

## Decision boundary

Continue only if the experiment passes its separate metric, repeatability, visual, and asset-structure gates. The provisional metric target is at most **20 mm error on each primary torso circumference**, **10 mm mean absolute error across all seven evaluation dimensions**, and **10 mm repeat-capture range per dimension**. These are project thresholds, not established tailoring tolerances or promised model performance.

Switch the body model if a calibrated capture fits poorly because of model shape limits. Switch capture strategy if motion defeats sequential views. Improve the appearance branch if measurements pass but identity does not. If repeated, well-calibrated RGB captures still fail the measurement gate across plausible models, stop claiming that this RGB-only route is a foundation for garment-fit estimation. Consider measurement-assisted capture or depth/multi-camera input as an explicit change in scope.

Passing on one person would justify a larger study. It would **not** validate consumer deployment, hidden-skin recovery, accurate hair editing, arbitrary real-garment reconstruction, cloth pressure, or fit prediction.
