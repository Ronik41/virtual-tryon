import { Color, DoubleSide, Float32BufferAttribute, MeshStandardMaterial, SkinnedMesh, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { AvatarAsset, GarmentAsset, GarmentEngine, GarmentSettings } from '../types';
import { ellipseRadii } from '../avatar/parameters';
import { loft, type Ring } from '../avatar/geometry';
import { FABRICS } from './catalog';
function geometryFor(avatar: AvatarAsset, settings: GarmentSettings) {
  const { id, size, ease, fabric } = settings;
  const { hip, waist, chest, shoulder, neck, crotch } = avatar.landmarks;
  const p = avatar.parameters, s = p.height / 1.76;
  const geometries = [], ripple = FABRICS[fabric].ripple;
  const ring = (y: number, circumference: number, ratio = .73): Ring => {
    const [rx, rz] = ellipseRadii(circumference * size, ratio);
    return { center: new Vector3(0, y, 0), rx: rx + ease, rz: rz + ease, weights: [0, 1, Math.max(0, Math.min(1, (y - hip) / (chest - hip)))] };
  };
  if (id === 'skirt') {
    geometries.push(loft([
      ring(crotch - .34 * s, 1.62), ring(crotch - .23 * s, 1.49), ring(crotch - .10 * s, 1.32),
      ring(hip - .015 * s, 1.07), ring(waist - .025 * s, .87), ring(waist, .86),
    ], false, 56, ripple));
  } else if (id === 'trousers') {
    geometries.push(loft([ring(crotch + .01 * s, .98), ring(hip, 1.01), ring(waist - .025 * s, .88), ring(waist, .87)], false, 40, ripple));
    for (const side of [1, -1]) {
      const thigh = side === 1 ? 10 : 12, shin = thigh + 1;
      const rings: Ring[] = [[.085 * s, .065], [crotch * .22, .066], [crotch * .44, .074], [crotch * .6, .085], [crotch * .8, .102], [crotch + .06 * s, .108]].map(([y, r]) => ({
        center: new Vector3(side * p.hip * (.135 - .025 * y / hip), y, 0), rx: r * size + ease, rz: r * size * 1.12 + ease,
        weights: [shin, thigh, Math.max(0, Math.min(1, (y / crotch - .43) / .17))],
      }));
      geometries.push(loft(rings, false, 36, ripple));
    }
  } else {
    const oversize = id === 'oversized-tee', hoodie = id === 'hoodie', jacket = id === 'jacket';
    const extra = oversize ? .20 : hoodie ? .14 : jacket ? .13 : .015;
    const hemY = hip - (oversize ? .12 : hoodie ? .10 : jacket ? .12 : .03) * s;
    const start = jacket ? Math.PI / 2 + .12 : 0, span = jacket ? 2 * Math.PI - .24 : Math.PI * 2;
    geometries.push(loft([
      ring(hemY, .99 + extra), ring(hemY + .025 * s, .985 + extra), ring(waist, .83 + extra),
      ring((waist + chest) / 2, .925 + extra), ring(chest, .98 + extra),
      ring(shoulder - .035 * s, 1.22 + extra, .58), ring(shoulder + .02 * s, 1.0 + extra, .55),
      ring(neck + .003 * s, .38 + (hoodie ? .07 : 0), .90),
    ], false, 56, ripple, start, span));
    for (const side of [1, -1]) {
      const upper = side === 1 ? 4 : 7, lower = upper + 1;
      const origin = avatar.skeleton.bones[upper].getWorldPosition(new Vector3());
      const direction = new Vector3(side * .5, -.8660254, 0);
      const length = hoodie || jacket ? .99 : oversize ? .50 : .35;
      const sleeve: Ring[] = [];
      for (let j = 0; j <= 8; j++) {
        const t = -.025 + j / 8 * (length + .025);
        const radius = (hoodie || jacket ? .086 - Math.max(0, t) * .044 : oversize ? .098 : .072) * size + ease;
        sleeve.push({ center: origin.clone().addScaledVector(direction, t * p.arm), rx: radius, rz: radius * .97, weights: [upper, lower, Math.max(0, Math.min(1, (t - .43) / .20))] });
      }
      geometries.push(loft(sleeve.reverse(), false, 36, ripple));
    }
    if (hoodie) {
      // A lowered hood: a separate open shell within this garment asset, not hair.
      const hood: Ring[] = [
        { center: new Vector3(0, neck - .105 * s, -.073 * s), rx: .08 * size + ease, rz: .065 * size + ease, weights: [1, 1, 0] },
        { center: new Vector3(0, neck - .06 * s, -.11 * s), rx: .13 * size + ease, rz: .08 * size + ease, weights: [1, 1, 0] },
        { center: new Vector3(0, neck + .025 * s, -.09 * s), rx: .115 * size + ease, rz: .08 * size + ease, weights: [1, 1, 0] },
      ];
      geometries.push(loft(hood, false, 40, .01));
    }
  }
  const result = mergeGeometries(geometries); geometries.forEach(g => g.dispose()); return result;
}
export class ProxyGarmentEngine implements GarmentEngine {
  readonly accuracyTier = 'visual-proxy' as const;
  build(avatar: AvatarAsset, settings: GarmentSettings): GarmentAsset {
    const geometry = geometryFor(avatar, settings);
    const reference = geometryFor(avatar, { ...settings, size: 1, ease: .02 });
    const referencePositions = Float32Array.from(reference.attributes.position.array); reference.dispose();
    const colors = new Float32Array(geometry.attributes.position.count * 3); colors.fill(1);
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    const material = new MeshStandardMaterial({ color: new Color(settings.color), roughness: FABRICS[settings.fabric].roughness, side: DoubleSide, vertexColors: true });
    const mesh = new SkinnedMesh(geometry, material); mesh.name = `garment-${settings.id}`;
    mesh.bind(avatar.skeleton, avatar.mesh.bindMatrix); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
    mesh.userData = { assetId: settings.id, accuracyTier: this.accuracyTier, label: 'visual proxy', units: 'm', settings: { ...settings } };
    return { mesh, settings: { ...settings }, referencePositions };
  }
}
