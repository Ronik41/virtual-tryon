import { Bone, Group, MeshStandardMaterial, Skeleton, SkinnedMesh, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { AvatarAsset, AvatarParameters, BodyPart } from '../types';
import { ellipseRadii } from './parameters';
import { ellipsoid, loft, type Ring } from './geometry';
export const BONE = { pelvis: 0, spine: 1, neck: 2, head: 3, leftArm: 4, leftElbow: 5, leftHand: 6, rightArm: 7, rightElbow: 8, rightHand: 9, leftLeg: 10, leftKnee: 11, rightLeg: 12, rightKnee: 13 };
export function buildAvatar(p: AvatarParameters): AvatarAsset {
  const s = p.height / 1.76, crotch = p.inseam, hip = crotch + .10 * s;
  const shoulder = p.height - .31 * s, chest = shoulder - .115 * s;
  const waist = hip + (chest - hip) * .40, neck = p.height - .225 * s;
  const landmarks = { crotch, hip, shoulder, chest, waist, neck };
  const rig = new Group(); rig.name = 'rig'; const bones: Bone[] = [];
  const bone = (name: string, position: Vector3, parent = -1) => {
    const b = new Bone(); b.name = name;
    if (parent < 0) { b.position.copy(position); rig.add(b); }
    else { b.position.copy(position.clone().sub(bones[parent].getWorldPosition(new Vector3()))); bones[parent].add(b); }
    bones.push(b); rig.updateMatrixWorld(true);
  };
  bone('pelvis', new Vector3(0, hip, 0));
  bone('spine', new Vector3(0, waist, 0), 0);
  bone('neck', new Vector3(0, neck, 0), 1);
  bone('head', new Vector3(0, p.height - .15 * s, 0), 2);
  for (const side of [1, -1]) {
    const root = bones.length, sign = side === 1 ? 'left' : 'right';
    const start = new Vector3(side * (p.shoulder / 2 - .025 * s), shoulder - .018 * s, 0);
    const dir = new Vector3(side * .50, -.8660254, 0);
    bone(`${sign}_upper_arm`, start, 1);
    bone(`${sign}_forearm`, start.clone().addScaledVector(dir, p.arm * .53), root);
    bone(`${sign}_hand`, start.clone().addScaledVector(dir, p.arm), root + 1);
  }
  for (const side of [1, -1]) {
    const index = bones.length;
    bone(side === 1 ? 'left_thigh' : 'right_thigh', new Vector3(side * p.hip * .11, hip - .055 * s, 0), 0);
    bone(side === 1 ? 'left_shin' : 'right_shin', new Vector3(side * p.hip * .12, crotch * .49, 0), index);
  }
  const skeleton = new Skeleton(bones); rig.updateMatrixWorld(true); skeleton.calculateInverses();
  const parts: BodyPart[] = []; let offset = 0;
  const add = (name: string, geometry: BodyPart['geometry']) => { parts.push({ name, geometry, offset }); offset += geometry.attributes.position.count; };
  const torsoSpecs: [number, number, number][] = [
    [crotch - .015 * s, p.hip * .66, .82], [hip - .055 * s, p.hip * .94, .78], [hip, p.hip, .74],
    [hip + (waist - hip) * .5, (p.hip + p.waist) / 2, .73], [waist, p.waist, .72],
    [(waist + chest) / 2, (p.waist + p.chest) / 2, .74], [chest, p.chest, .73],
    [shoulder - .035 * s, p.shoulder * 2.72, .58], [shoulder + .02 * s, p.shoulder * 2.2, .55], [neck, .34 * s, .9],
  ];
  add('torso', loft(torsoSpecs.map(([y, circ, ratio]) => {
    const [rx, rz] = ellipseRadii(circ, ratio);
    return { center: new Vector3(0, y, 0), rx, rz, weights: [0, 1, Math.min(1, Math.max(0, (y - hip) / (chest - hip)))] };
  })));
  add('neck', ellipsoid(new Vector3(0, neck + .025 * s, 0), new Vector3(.054, .075, .052).multiplyScalar(s), 2));
  add('head', ellipsoid(new Vector3(0, p.height - .108 * s, 0), new Vector3(.079, .108, .085).multiplyScalar(s), 3));
  add('nose', ellipsoid(new Vector3(0, p.height - .113 * s, .081 * s), new Vector3(.014, .021, .018).multiplyScalar(s), 3));
  for (const side of [1, -1]) {
    const upper = side === 1 ? 4 : 7, lower = upper + 1;
    const start = bones[upper].getWorldPosition(new Vector3());
    const dir = new Vector3(side * .5, -.8660254, 0), soft = .88 + p.composition * .3;
    const armRings: Ring[] = [
      [-.05, .038], [0, .067], [.17, .062], [.32, .058], [.49, .043], [.57, .045], [.7, .045], [.88, .032], [1, .026],
    ].map(([t, r]) => ({ center: start.clone().addScaledVector(dir, t * p.arm), rx: r * s * soft, rz: r * s * soft * .96, weights: [upper, lower, Math.max(0, Math.min(1, (t - .43) / .20))] }));
    // Reverse descending limbs so the loft's winding remains outward.
    add(`arm_${side}`, loft(armRings.reverse()));
    add(`hand_${side}`, ellipsoid(start.clone().addScaledVector(dir, p.arm + .065 * s), new Vector3(.035, .079, .025).multiplyScalar(s), upper + 2));
    const thigh = side === 1 ? 10 : 12, shin = thigh + 1;
    const thighX = side * p.hip * .11, ankleX = side * p.hip * .135;
    const legRings: Ring[] = [
      [.07 * s, .036], [crotch * .16, .043], [crotch * .3, .060], [crotch * .43, .052], [crotch * .50, .052], [crotch * .65, .075], [crotch * .81, .093], [hip - .05 * s, .093],
    ].map(([y, r]) => ({ center: new Vector3(ankleX + (thighX - ankleX) * y / hip, y, 0), rx: r * (p.hip / .98) * (.94 + p.composition * .13), rz: r * (p.hip / .98) * 1.1, weights: [shin, thigh, Math.min(1, Math.max(0, (y / crotch - .43) / .17))] }));
    add(`leg_${side}`, loft(legRings));
    add(`foot_${side}`, ellipsoid(new Vector3(ankleX, .045 * s, .055 * s), new Vector3(.05, .045, .12).multiplyScalar(s), shin));
  }
  const geometry = mergeGeometries(parts.map(x => x.geometry));
  const mesh = new SkinnedMesh(geometry, new MeshStandardMaterial({ color: '#d6cfc2', roughness: .83 }));
  mesh.name = 'synthetic-body'; mesh.bind(skeleton); mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  const hair = new Group(); hair.name = 'hair-empty'; const accessories = new Group(); accessories.name = 'accessories-empty';
  return { mesh, rig, skeleton, parts, parameters: { ...p }, landmarks, hair, accessories };
}
export function poseAvatar(avatar: AvatarAsset, time: number) {
  const b = avatar.skeleton.bones;
  b.forEach(bone => bone.rotation.set(0, 0, 0));
  if (time !== 0) {
    b[1].rotation.y = Math.sin(time * .7) * .09;
    b[4].rotation.z = Math.sin(time * .8) * .08;
    b[7].rotation.z = -Math.sin(time * .8) * .08;
    b[5].rotation.x = (Math.sin(time) + 1) * .10;
    b[8].rotation.x = (Math.sin(time + .8) + 1) * .10;
    b[3].rotation.y = Math.sin(time * .5) * .07;
  }
  avatar.rig.updateMatrixWorld(true); avatar.skeleton.update();
}
