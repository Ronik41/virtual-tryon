import type { FabricId, GarmentId, GarmentSettings } from '../types';
export const GARMENTS: { id: GarmentId; name: string; detail: string; fabric: FabricId; color: string }[] = [
  { id: 'fitted-tee', name: 'Fitted T-shirt', detail: 'Close silhouette', fabric: 'cotton', color: '#657c68' },
  { id: 'oversized-tee', name: 'Oversized T-shirt', detail: 'Dropped, roomy cut', fabric: 'cotton', color: '#718595' },
  { id: 'hoodie', name: 'Hoodie', detail: 'Hood + long sleeves', fabric: 'knit', color: '#ac785c' },
  { id: 'trousers', name: 'Trousers', detail: 'Straight leg', fabric: 'denim', color: '#536575' },
  { id: 'skirt', name: 'A-line skirt', detail: 'Flared silhouette', fabric: 'cotton', color: '#8e7481' },
  { id: 'jacket', name: 'Jacket', detail: 'Open front', fabric: 'stiff', color: '#b29c77' },
];
export const FABRICS = {
  cotton: { label: 'Cotton', roughness: .94, ripple: .006, detail: 'Matte, subtle surface grain' },
  denim: { label: 'Denim', roughness: .84, ripple: .002, detail: 'Diagonal surface weave' },
  knit: { label: 'Knit', roughness: 1, ripple: .012, detail: 'Soft ribbed appearance' },
  stiff: { label: 'Stiff jacket', roughness: .72, ripple: 0, detail: 'Smooth, structured appearance' },
};
export const SWATCHES = ['#657c68', '#b7b1a1', '#536575', '#ac785c', '#8e7481', '#353b3e'];
export function defaultGarment(id: GarmentId = 'fitted-tee'): GarmentSettings {
  const item = GARMENTS.find(g => g.id === id)!;
  return { id, size: 1, ease: .02, color: item.color, fabric: item.fabric };
}
