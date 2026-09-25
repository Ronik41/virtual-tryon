import type { BufferGeometry, Group, Skeleton, SkinnedMesh } from 'three';
export interface AvatarParameters {
  height: number; shoulder: number; chest: number; waist: number; hip: number;
  arm: number; inseam: number; composition: number;
}
export type GarmentId = 'fitted-tee' | 'oversized-tee' | 'hoodie' | 'trousers' | 'skirt' | 'jacket';
export type FabricId = 'cotton' | 'denim' | 'knit' | 'stiff';
export interface GarmentSettings { id: GarmentId; size: number; ease: number; color: string; fabric: FabricId }
export interface BodyPart { name: string; geometry: BufferGeometry; offset: number }
export interface AvatarAsset {
  mesh: SkinnedMesh; rig: Group; skeleton: Skeleton; parts: BodyPart[];
  parameters: AvatarParameters; landmarks: Record<string, number>;
  hair: Group; accessories: Group;
}
export interface GarmentAsset { mesh: SkinnedMesh; referencePositions: Float32Array; settings: GarmentSettings }
/** Replace generation independently of the viewport; future solvers must declare their evidence tier. */
export interface GarmentEngine {
  readonly accuracyTier: 'visual-proxy';
  build(avatar: AvatarAsset, settings: GarmentSettings): GarmentAsset;
}
export interface DiagnosticResult {
  collisions: number; samples: number; hitVertices: Set<number>; maxExtension: number;
  clearance: number; status: 'No visible collision' | 'Collision detected' | 'High stretch proxy' | 'Loose visual fit';
}
