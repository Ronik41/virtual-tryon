# Project instructions

- This is a research project for realistic virtual try-on. The current task is Phase 1 feasibility and experiment design for one consenting subject, Roni.
- Do not implement an application, install reconstruction stacks, download model weights, run captures, or build a pipeline until a later user request authorizes implementation. Documentation work is authorized.
- Evaluate identity, underlying shape, metric measurements, texture, topology/rigging, and clothing independence separately. Rendering quality is not evidence of metric accuracy.
- Treat body, observed clothed surface, skin appearance, hair, garments, and accessories as distinct assets. Do not measure splats or call a clothed shell the underlying body.
- Link original papers, repositories, model cards, and licenses. Date checks; distinguish published results, engineering estimates, hypotheses, and measured local results.
- Check code, weights, body assets, and dependency licenses independently. Public code is not necessarily open source or commercially usable.
- Keep known height/calibration inputs separate from withheld measurement references. Freeze fitting before revealing reference values. Do not tune on evaluation captures or report imposed height as recovered accuracy.
- Preserve units, camera calibration, pose, transforms, uncertainty, input provenance, versions, and failed attempts. Never silently rescale or cosmetically repair evaluation geometry.
- Keep personal captures, measurements, textures, and checkpoints out of Git and public services. Obtain explicit authorization before uploading personal data or using paid compute.
- Follow docs/phase-1.md for gates and limits. Record any protocol change before running it; keep failed outcomes visible. One-subject success does not establish population accuracy.
- Prefer small offline experiments and standard 3D exports. No product UI, garment simulation, model training, or automatic deployment in Phase 1.
