import type { AvatarParameters } from '../types';
export const DEFAULT_AVATAR: AvatarParameters = {
  height: 1.76, shoulder: .44, chest: .96, waist: .79, hip: .98, arm: .59, inseam: .81, composition: .45,
};
export const PARAMETERS: { key: keyof AvatarParameters; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: 'height', label: 'Height', min: 1.55, max: 2.05, step: .01, unit: 'm' },
  { key: 'shoulder', label: 'Shoulder width', min: .34, max: .56, step: .01, unit: 'm' },
  { key: 'chest', label: 'Chest', min: .72, max: 1.30, step: .01, unit: 'm' },
  { key: 'waist', label: 'Waist', min: .58, max: 1.20, step: .01, unit: 'm' },
  { key: 'hip', label: 'Hip', min: .76, max: 1.28, step: .01, unit: 'm' },
  { key: 'arm', label: 'Arm length', min: .46, max: .76, step: .01, unit: 'm' },
  { key: 'inseam', label: 'Inseam', min: .65, max: .94, step: .01, unit: 'm' },
  { key: 'composition', label: 'Muscle / softness proxy', min: 0, max: 1, step: .01, unit: '' },
];
export function ellipseRadii(circumference: number, ratio = .72): [number, number] {
  const h = ((1 - ratio) / (1 + ratio)) ** 2;
  const a = circumference / (Math.PI * (1 + ratio) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))));
  return [a, a * ratio];
}
