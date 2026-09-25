# Garment Playground scope record

Recorded 2026-09-25, before implementation. The user explicitly authorized a local-only synthetic avatar and garment sandbox, including a small UI, procedural assets, simple rigging, and rendering diagnostics. This is a separate engineering exercise from the unexecuted human-capture experiment in `phase-1.md`; its gates and withheld references remain unchanged.

No human inputs, camera access, uploads, accounts, trained models, garment catalogue, physical simulation, or fit prediction are authorized or needed here. All dimensions are synthetic input parameters in meters. No evaluation geometry or personal data is involved.

## Implementation proposal

- TypeScript, Vite, Three.js and a triangle acceleration structure for sampled intersection checks. Loopback-only server; bundled dependencies, no runtime CDN.
- `src/avatar/`: procedural body components merged into a skinned mesh, skeleton, parameter definitions.
- `src/garments/`: six independent procedural garment meshes and a replaceable garment-engine interface.
- `src/diagnostics/`: posed-body containment tests at garment vertices and triangle centroids; geometric extension heuristic, not fabric strain.
- `src/viewer/`: local WebGL scene, orbit/canonical cameras, lighting, wireframe, and modest skeletal preview.
- `src/ui/`: accessible shape/material controls and explicit evidence tiers.
- `assets/manifests/`: source, license, units, topology, rigging, accuracy tier per asset.
- `tests/`: geometry, asset separation, skinning, dimensions, and diagnostics; browser verification documented after execution.

Build order: parameterized geometry and skeleton; garment generation and diagnostics; interface; automated and browser verification. Hair and accessory slots exist but contain no assets in this version. A single garment is previewed at a time.

## Evidence boundaries

1. Visual placement: available; procedural geometry with adjustable size and ease.
2. Animated behavior: available only as simple skeletal skinning. No gravity, material dynamics, or cloth response.
3. Physically validated drape: unavailable. No verified patterns, fabric tests, construction data, or validation.

Every garment remains a **visual proxy**. The labels “No visible collision”, “Collision detected”, “High stretch proxy”, and “Loose visual fit” describe rendering diagnostics only. Sampling can miss triangle-only intersections and does not test garment self-collision. No clear result validates real-world fit, size, pressure, comfort, or tailoring accuracy.
