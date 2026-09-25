import { Box3, BufferGeometry, DoubleSide, Ray, Vector3 } from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import type { AvatarAsset, DiagnosticResult, GarmentAsset } from '../types';
const DIRECTION = new Vector3(.93271, .31253, .18061).normalize();
/** Independent closed body components prevent overlapping primitives cancelling under parity. */
export class CollisionDiagnostics {
  private colliders: { geometry: BufferGeometry; bvh: MeshBVH; bounds: Box3; offset: number }[];
  constructor(private avatar: AvatarAsset) {
    this.colliders = avatar.parts.map(part => {
      const geometry = part.geometry.clone();
      return { geometry, bvh: new MeshBVH(geometry), bounds: new Box3(), offset: part.offset };
    });
  }
  updateBody() {
    const p = new Vector3();
    for (const collider of this.colliders) {
      const attribute = collider.geometry.attributes.position;
      for (let i = 0; i < attribute.count; i++) {
        this.avatar.mesh.getVertexPosition(collider.offset + i, p); attribute.setXYZ(i, p.x, p.y, p.z);
      }
      attribute.needsUpdate = true; collider.bvh.refit(); collider.geometry.computeBoundingBox(); collider.bounds.copy(collider.geometry.boundingBox!);
    }
  }
  contains(point: Vector3): boolean {
    const ray = new Ray(point, DIRECTION);
    for (const c of this.colliders) {
      if (!c.bounds.containsPoint(point)) continue;
      const distances = c.bvh.raycast(ray, DoubleSide, .0005).map(h => h.distance).sort((a,b) => a - b);
      // Shared triangle edges generate duplicate hits; count each surface crossing once.
      const unique = distances.filter((d, i) => i === 0 || Math.abs(d - distances[i - 1]) > 1e-5);
      if (unique.length % 2 === 1) return true;
    }
    return false;
  }
  evaluate(garment: GarmentAsset): DiagnosticResult {
    this.updateBody();
    const mesh = garment.mesh, positions = mesh.geometry.attributes.position, index = mesh.geometry.index!;
    const posed: Vector3[] = [], hitVertices = new Set<number>();
    let collisions = 0, samples = 0, maxExtension = 1;
    for (let i = 0; i < positions.count; i++) {
      const p = mesh.getVertexPosition(i, new Vector3()); posed.push(p); samples++;
      if (this.contains(p)) { collisions++; hitVertices.add(i); }
    }
    const centroid = new Vector3(), a = new Vector3(), b = new Vector3(), ref = garment.referencePositions;
    for (let i = 0; i < index.count; i += 3) {
      const x = index.getX(i), y = index.getX(i + 1), z = index.getX(i + 2);
      centroid.copy(posed[x]).add(posed[y]).add(posed[z]).multiplyScalar(1 / 3); samples++;
      if (this.contains(centroid)) { collisions++; hitVertices.add(x); hitVertices.add(y); hitVertices.add(z); }
      for (const [v1, v2] of [[x,y],[y,z],[z,x]]) {
        a.fromArray(ref, v1 * 3); b.fromArray(ref, v2 * 3);
        const rest = a.distanceTo(b); if (rest > .001) maxExtension = Math.max(maxExtension, posed[v1].distanceTo(posed[v2]) / rest);
      }
    }
    const clearance = garment.settings.ease;
    const status = collisions > 0 ? 'Collision detected' : maxExtension > 1.28 ? 'High stretch proxy' : clearance >= .055 || ['oversized-tee','skirt'].includes(garment.settings.id) ? 'Loose visual fit' : 'No visible collision';
    return { collisions, samples, hitVertices, maxExtension, clearance, status };
  }
  dispose() { this.colliders.forEach(c => c.geometry.dispose()); }
}
