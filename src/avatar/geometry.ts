import { BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, Vector3 } from 'three';
export interface Ring { center: Vector3; rx: number; rz: number; weights: [number, number, number] }
export function loft(rings: Ring[], closed = true, segments = 40, ripple = 0, startAngle = 0, angleLength = Math.PI * 2): BufferGeometry {
  const positions: number[] = [], skinIndices: number[] = [], skinWeights: number[] = [], uv: number[] = [], indices: number[] = [];
  const direction = rings.at(-1)!.center.clone().sub(rings[0].center).normalize();
  const u = new Vector3(direction.y, -direction.x, 0).normalize();
  const v = new Vector3(0, 0, 1);
  const add = (p: Vector3, ring: Ring, texU: number, texV: number) => {
    positions.push(p.x, p.y, p.z);
    skinIndices.push(ring.weights[0], ring.weights[1], 0, 0);
    skinWeights.push(1 - ring.weights[2], ring.weights[2], 0, 0); uv.push(texU, texV);
  };
  const n = segments + 1;
  rings.forEach((ring, j) => {
    for (let i = 0; i <= segments; i++) {
      const a = startAngle + i / segments * angleLength;
      const waviness = 1 + ripple * Math.sin(a * 10 + j * .55);
      add(ring.center.clone().addScaledVector(u, Math.cos(a) * ring.rx * waviness).addScaledVector(v, Math.sin(a) * ring.rz * waviness), ring, i / segments, j / (rings.length - 1));
      if (j < rings.length - 1 && i < segments) {
        const k = j * n + i; indices.push(k, k + n, k + 1, k + 1, k + n, k + n + 1);
      }
    }
  });
  if (closed) {
    for (const end of [0, rings.length - 1]) {
      const center = positions.length / 3; add(rings[end].center, rings[end], .5, end ? 1 : 0);
      for (let i = 0; i < segments; i++) {
        const k = end * n + i;
        if (end === 0) indices.push(center, k, k + 1); else indices.push(center, k + 1, k);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
  g.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2)); g.setIndex(indices); g.computeVertexNormals();
  return g;
}
export function ellipsoid(center: Vector3, radii: Vector3, bone: number): BufferGeometry {
  const rings: Ring[] = [];
  for (let j = 0; j <= 16; j++) {
    const a = -Math.PI / 2 + j / 16 * Math.PI;
    rings.push({ center: center.clone().add(new Vector3(0, Math.sin(a) * radii.y, 0)), rx: Math.max(.0001, Math.cos(a) * radii.x), rz: Math.max(.0001, Math.cos(a) * radii.z), weights: [bone, bone, 0] });
  }
  return loft(rings);
}
