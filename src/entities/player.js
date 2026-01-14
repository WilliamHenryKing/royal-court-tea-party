// Player entity - player creation, cape system, and player-related utilities
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';

// Cape configuration
const CAPE_CONFIG = {
  width: 0.9,
  height: 1.15,
  widthSegments: 5,
  heightSegments: 8,
  stiffness: 18,
  dampingMoving: 0.86,
  dampingIdle: 0.76,
  maxStretch: 1.4
};

// Temp vectors for cape physics (reused to avoid garbage collection)
const capeTempVec = new THREE.Vector3();
const capeTempVec2 = new THREE.Vector3();
const capeTempVec3 = new THREE.Vector3();
const capeTempVec4 = new THREE.Vector3();
const capeTempVec5 = new THREE.Vector3();
const capeTempVec6 = new THREE.Vector3();
const capeTempQuat = new THREE.Quaternion();

export let player = null;
export let playerMovementDisabled = false;

// Disable player movement (for minigames, cutscenes, etc.)
export function disablePlayerMovement() {
  playerMovementDisabled = true;
}

// Enable player movement
export function enablePlayerMovement() {
  playerMovementDisabled = false;
}

// Check if player can move
export function canPlayerMove() {
  return !playerMovementDisabled;
}

// Create the player character
export function createPlayer() {
  const group = new THREE.Group();

  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffd1e1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 });

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), pinkMat);
  body.scale.set(1, 1.2, 0.9);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), skinMat);
  head.position.y = 1.3;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), darkMat);
  eyeL.position.set(-0.15, 1.35, 0.38);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), darkMat);
  eyeR.position.set(0.15, 1.35, 0.38);
  group.add(eyeR);

  // Blush
  const blushMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.6 });
  const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), blushMat);
  blushL.position.set(-0.3, 1.22, 0.42);
  blushL.rotation.y = 0.3;
  group.add(blushL);

  const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), blushMat);
  blushR.position.set(0.3, 1.22, 0.42);
  blushR.rotation.y = -0.3;
  group.add(blushR);

  // Crown
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.15, 6), goldMat);
  crownBase.position.y = 1.72;
  group.add(crownBase);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), goldMat);
    point.position.set(Math.cos(a) * 0.2, 1.89, Math.sin(a) * 0.2);
    group.add(point);
  }

  // Legs
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8), pinkMat);
  legL.position.set(-0.2, 0.15, 0);
  legL.castShadow = true;
  group.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8), pinkMat);
  legR.position.set(0.2, 0.15, 0);
  legR.castShadow = true;
  group.add(legR);

  // Shoes
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  const shoeL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), shoeMat);
  shoeL.scale.set(1.2, 0.8, 1.5);
  shoeL.position.set(-0.2, 0.06, 0.05);
  shoeL.castShadow = true;
  group.add(shoeL);

  const shoeR = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), shoeMat);
  shoeR.scale.set(1.2, 0.8, 1.5);
  shoeR.position.set(0.2, 0.06, 0.05);
  shoeR.castShadow = true;
  group.add(shoeR);

  player = group;
  player.position.set(0, 0, 5); // Start outside fountain
  player.userData.baseY = 0;
  player.userData.boostEndTime = 0;
  scene.add(player);

  return player;
}

// Create a cape for the player
export function createCape() {
  const { width, height, widthSegments, heightSegments } = CAPE_CONFIG;
  const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
  geometry.translate(0, -height / 2, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff8fbf,
    roughness: 0.55,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const cape = new THREE.Mesh(geometry, material);
  cape.position.set(0, 1.38, -0.35);
  cape.rotation.x = 0.08;
  cape.castShadow = true;
  cape.receiveShadow = true;

  const rows = heightSegments + 1;
  const points = [];
  const velocities = [];
  const restLength = height / heightSegments;
  for (let i = 0; i < rows; i++) {
    points.push(new THREE.Vector3(0, -i * restLength, 0));
    velocities.push(new THREE.Vector3());
  }

  cape.userData.cape = {
    geometry,
    points,
    velocities,
    restLength,
    rows,
    cols: widthSegments + 1
  };
  return cape;
}

// Update cape physics
export function updateCape(delta, time, isMoving, moveDir) {
  if (!player || !player.userData.cape) return;
  const capeData = player.userData.cape;
  const { geometry, points, velocities, restLength, rows, cols } = capeData;
  const heightSegments = CAPE_CONFIG.heightSegments;
  const width = CAPE_CONFIG.width;
  const windStrength = isMoving ? 1 : 0;
  const flutterStrength = isMoving ? 0.25 : 0.08;
  const damping = isMoving ? CAPE_CONFIG.dampingMoving : CAPE_CONFIG.dampingIdle;

  points[0].set(0, 0, 0);

  capeTempVec.copy(moveDir).multiplyScalar(-1.6 * windStrength);
  capeTempVec.y += 0.35 * windStrength;
  capeTempQuat.copy(player.quaternion).invert();
  capeTempVec2.copy(capeTempVec).applyQuaternion(capeTempQuat);

  for (let i = 1; i < rows; i++) {
    const point = points[i];
    const velocity = velocities[i];
    const prev = points[i - 1];

    capeTempVec3.copy(point).sub(prev);
    const distance = Math.max(capeTempVec3.length(), 0.0001);
    capeTempVec3.normalize();

    const springForce = capeTempVec3.multiplyScalar((distance - restLength) * -CAPE_CONFIG.stiffness);
    const gravity = capeTempVec4.set(0, -0.8, 0);
    const flutter = capeTempVec5.set(
      Math.sin(time * 3 + i) * 0.15,
      0,
      Math.cos(time * 2 + i * 0.7) * 0.12
    ).multiplyScalar(flutterStrength);

    velocity.add(springForce.add(gravity).add(capeTempVec2).add(flutter).multiplyScalar(delta));
    velocity.multiplyScalar(damping);
    point.addScaledVector(velocity, delta);

    capeTempVec6.copy(point).sub(prev);
    const maxStretch = restLength * CAPE_CONFIG.maxStretch;
    if (capeTempVec6.length() > maxStretch) {
      capeTempVec6.normalize().multiplyScalar(maxStretch);
      point.copy(prev).add(capeTempVec6);
    }
  }

  const positions = geometry.attributes.position;
  for (let row = 0; row <= heightSegments; row++) {
    const rowPoint = points[row];
    const drape = row / heightSegments;
    for (let col = 0; col < cols; col++) {
      const index = (row * cols + col) * 3;
      const x = (col / (cols - 1) - 0.5) * width;
      positions.array[index] = x;
      positions.array[index + 1] = rowPoint.y;
      positions.array[index + 2] = rowPoint.z - drape * 0.12 + Math.abs(x) * 0.08 * drape;
    }
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Unlock the player's cape (reward for completing all missions)
export function unlockPlayerCape(gameState) {
  if (!player || gameState.capeUnlocked) return;
  const cape = createCape();
  player.add(cape);
  player.userData.cape = cape.userData.cape;
  gameState.capeUnlocked = true;
}
