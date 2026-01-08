// World - Ground, paths, fountain, decorations, and environmental objects
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { PATH_CONFIG } from '../config.js';
import { LOCATIONS } from '../assets/data.js';
import { collisionManager, COLLISION_LAYERS } from '../systems/CollisionManager.js';

// Legacy collision boxes for world boundaries and objects
// NOTE: This is kept for backward compatibility but should be migrated to collisionManager
export const collisionBoxes = [];

// Grass tuft data and instance
export const grassTuftData = [];
export let grassTufts = null;

// Waterfall animation data
export const waterfallSheets = [];

// Shared materials
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.75 });
export const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
  transparent: true,
  opacity: 0.78,
  side: THREE.DoubleSide
});

// Temp objects for instanced rendering
const grassTuftDummy = new THREE.Object3D();

// ============================================
// HELPER FUNCTIONS - Placement and Collision
// ============================================

export function isSafeOffPathPlacement(x, z) {
  const radius = Math.hypot(x, z);
  // Expanded range for Austinville
  if (radius < 16 || radius > 72) {
    return false;
  }
  if (isNearPath(x, z, 2.5)) {
    return false;
  }
  if (!isClearOfBuildings(x, z, 3)) {
    return false;
  }
  return true;
}

export function isNearPath(x, z, buffer = 1.5) {
  const halfWidth = PATH_CONFIG.width / 2 + buffer;
  for (let i = 0; i < PATH_CONFIG.count; i++) {
    const angle = PATH_CONFIG.angleStep * i;
    const axisX = Math.sin(angle);
    const axisZ = Math.cos(angle);
    const projection = x * axisX + z * axisZ;
    if (projection < -buffer || projection > PATH_CONFIG.length + buffer) {
      continue;
    }
    const perpendicular = Math.abs(-axisZ * x + axisX * z);
    if (perpendicular <= halfWidth) {
      return true;
    }
  }
  return false;
}

export function isClearOfBuildings(x, z, buffer = 2) {
  return !collisionBoxes.some(b =>
    x > b.minX - buffer && x < b.maxX + buffer && z > b.minZ - buffer && z < b.maxZ + buffer
  );
}

/**
 * Legacy collision check - DEPRECATED
 * Use collisionManager.canMove() instead for new code
 * This is kept for backward compatibility during migration
 */
export function checkCollision(x, z) {
  // Use new collision manager (without entity checking for backward compatibility)
  return !collisionManager.canMove(null, x, z, 0.5, false);
}

// ============================================
// DECORATIVE OBJECT CREATION
// ============================================

function createFlower(color) {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  stem.position.y = 0.25;
  group.add(stem);

  const petalGeo = new THREE.SphereGeometry(0.14, 8, 8);
  petalGeo.scale(1, 0.5, 1);
  const petalMat = new THREE.MeshStandardMaterial({ color });

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(Math.cos(a) * 0.12, 0.55, Math.sin(a) * 0.12);
    group.add(petal);
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  center.position.y = 0.55;
  group.add(center);

  return group;
}

function createBush(material) {
  const group = new THREE.Group();
  const bushGeo = new THREE.SphereGeometry(0.4, 6, 6);
  const puffCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < puffCount; i++) {
    const puff = new THREE.Mesh(bushGeo, material);
    puff.position.set((Math.random() - 0.5) * 0.5, 0.2 + Math.random() * 0.2, (Math.random() - 0.5) * 0.5);
    puff.scale.setScalar(0.8 + Math.random() * 0.4);
    group.add(puff);
  }
  return group;
}

function createVine(material) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0, 0.2),
    new THREE.Vector3(-0.15, 0.8, 0.1),
    new THREE.Vector3(0.1, 1.6, -0.2),
    new THREE.Vector3(-0.05, 2.2, 0.1)
  ]);
  const geometry = new THREE.TubeGeometry(curve, 6, 0.04, 5, false);
  const vine = new THREE.Mesh(geometry, material);
  vine.castShadow = true;
  return vine;
}

function createBoulder(material) {
  return new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), material);
}

function createTree() {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 2.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  group.add(trunk);

  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
  [{ y: 3, r: 1.4 }, { y: 4, r: 1.1 }, { y: 4.8, r: 0.7 }].forEach(f => {
    const foliage = new THREE.Mesh(new THREE.SphereGeometry(f.r, 12, 12), foliageMat);
    foliage.position.y = f.y;
    foliage.castShadow = true;
    group.add(foliage);
  });

  if (Math.random() < 0.6) {
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
    const vine = createVine(vineMat);
    vine.position.y = 0.2;
    group.add(vine);
  }

  return group;
}

function createMushroom() {
  const group = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xfff8dc })
  );
  stem.position.y = 0.25;
  group.add(stem);

  const capColors = [0xff6b6b, 0xff69b4, 0xffa07a, 0x9370db];
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: capColors[Math.floor(Math.random() * capColors.length)] })
  );
  cap.position.y = 0.5;
  group.add(cap);

  return group;
}

// ============================================
// FLOWER BEDS - Decorative gardens along roads
// ============================================

function createFlowerBed(width = 2, length = 4, flowerDensity = 12) {
  const group = new THREE.Group();

  // Raised wooden/stone border
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
  const borderHeight = 0.15;
  const borderThickness = 0.12;

  // Front and back borders
  const frontBorder = new THREE.Mesh(
    new THREE.BoxGeometry(length, borderHeight, borderThickness),
    borderMat
  );
  frontBorder.position.set(0, borderHeight / 2, width / 2);
  frontBorder.castShadow = true;
  group.add(frontBorder);

  const backBorder = new THREE.Mesh(
    new THREE.BoxGeometry(length, borderHeight, borderThickness),
    borderMat
  );
  backBorder.position.set(0, borderHeight / 2, -width / 2);
  backBorder.castShadow = true;
  group.add(backBorder);

  // Side borders
  const leftBorder = new THREE.Mesh(
    new THREE.BoxGeometry(borderThickness, borderHeight, width),
    borderMat
  );
  leftBorder.position.set(-length / 2, borderHeight / 2, 0);
  leftBorder.castShadow = true;
  group.add(leftBorder);

  const rightBorder = new THREE.Mesh(
    new THREE.BoxGeometry(borderThickness, borderHeight, width),
    borderMat
  );
  rightBorder.position.set(length / 2, borderHeight / 2, 0);
  rightBorder.castShadow = true;
  group.add(rightBorder);

  // Dark soil/dirt inside
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95 });
  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(length - borderThickness * 2, 0.08, width - borderThickness * 2),
    soilMat
  );
  soil.position.y = 0.04;
  soil.receiveShadow = true;
  group.add(soil);

  // Flowers with varied colors
  const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00ced1, 0xffffff, 0xffb6c1];
  for (let i = 0; i < flowerDensity; i++) {
    const flower = createFlower(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
    const fx = (Math.random() - 0.5) * (length - 0.5);
    const fz = (Math.random() - 0.5) * (width - 0.5);
    flower.position.set(fx, 0.08, fz);
    flower.scale.setScalar(0.3 + Math.random() * 0.25);
    group.add(flower);
  }

  // Small decorative stones scattered
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.9 });
  for (let i = 0; i < 4; i++) {
    const stone = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 6, 6),
      stoneMat
    );
    stone.position.set(
      (Math.random() - 0.5) * (length - 0.4),
      0.05,
      (Math.random() - 0.5) * (width - 0.4)
    );
    stone.scale.set(1, 0.6, 1);
    group.add(stone);
  }

  return group;
}

function createFlowerBeds() {
  // Flower bed positions along key roads and intersections
  const flowerBedPositions = [
    // Near Palace along Royal Road
    { x: 15, z: 3, rotation: 0, width: 1.5, length: 3 },
    { x: 15, z: -3, rotation: 0, width: 1.5, length: 3 },
    // Near Tea Café
    { x: 28, z: 8, rotation: Math.PI / 4, width: 1.2, length: 2.5 },
    { x: 22, z: 8, rotation: -Math.PI / 4, width: 1.2, length: 2.5 },
    // Central fountain area
    { x: 6, z: 6, rotation: Math.PI / 6, width: 1.5, length: 2.5 },
    { x: -6, z: 6, rotation: -Math.PI / 6, width: 1.5, length: 2.5 },
    { x: 6, z: -6, rotation: -Math.PI / 6, width: 1.5, length: 2.5 },
    { x: -6, z: -6, rotation: Math.PI / 6, width: 1.5, length: 2.5 },
    // Intersection accents
    { x: 3.6, z: 3.4, rotation: Math.PI / 4, width: 1.1, length: 2.2 },
    { x: -23.5, z: -13.5, rotation: -Math.PI / 6, width: 1.1, length: 2.6 },
    { x: 16.5, z: 13.6, rotation: Math.PI / 8, width: 1.1, length: 2.6 },
    // Along Crumpet Court (could be crumpet-colored flowers!)
    { x: -12, z: 13, rotation: 0, width: 1.2, length: 3.5 },
    { x: 12, z: 13, rotation: 0, width: 1.2, length: 3.5 },
    // Near shop entrances
    { x: -28, z: 8, rotation: 0, width: 1.5, length: 2.5 }, // Pinkie School
    { x: -30.5, z: 6.5, rotation: Math.PI / 8, width: 1.2, length: 2.4 }, // Pinkie School side
    { x: 30.5, z: 6.5, rotation: -Math.PI / 10, width: 1.2, length: 2.4 }, // Tea Café side
    { x: 8, z: -21, rotation: Math.PI / 2, width: 1.2, length: 2.5 }, // Near Donut Shop
    { x: 16.5, z: -17.5, rotation: Math.PI / 3, width: 1.3, length: 2.6 }, // Donut Shop approach
    { x: 30.5, z: -12.5, rotation: Math.PI / 2, width: 1.2, length: 2.4 }, // Coffee Café entrance
    // At street sign posts
    { x: -33, z: 4, rotation: 0, width: 1, length: 2 },
    { x: 33, z: 4, rotation: 0, width: 1, length: 2 },
  ];

  flowerBedPositions.forEach(pos => {
    const bed = createFlowerBed(pos.width, pos.length, 8 + Math.floor(Math.random() * 6));
    bed.position.set(pos.x, 0, pos.z);
    bed.rotation.y = pos.rotation || 0;
    scene.add(bed);
  });
}

// ============================================
// ENHANCED TREES - Cherry blossoms and variety
// ============================================

function createCherryBlossomTree() {
  const group = new THREE.Group();

  // Trunk - darker, more elegant
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.35, 2.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a3728 })
  );
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  group.add(trunk);

  // Branches extending outward
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.1, 1.5, 6),
      branchMat
    );
    branch.position.set(Math.cos(angle) * 0.6, 2.5, Math.sin(angle) * 0.6);
    branch.rotation.z = Math.PI / 4;
    branch.rotation.y = angle;
    group.add(branch);
  }

  // Pink blossom foliage
  const blossomMat = new THREE.MeshStandardMaterial({ color: 0xffb7c5 });
  const blossomPositions = [
    { y: 3.2, r: 1.2 }, { y: 3.8, r: 1.0 }, { y: 4.3, r: 0.7 },
    { y: 3.0, r: 0.8, x: 0.8, z: 0.3 }, { y: 3.0, r: 0.8, x: -0.8, z: -0.3 }
  ];
  blossomPositions.forEach(b => {
    const blossom = new THREE.Mesh(new THREE.SphereGeometry(b.r, 12, 12), blossomMat);
    blossom.position.set(b.x || 0, b.y, b.z || 0);
    blossom.castShadow = true;
    group.add(blossom);
  });

  // Store for petal particle effect
  group.userData.isCherryBlossom = true;

  return group;
}

function createWillowTree() {
  const group = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b5344 })
  );
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  group.add(trunk);

  // Drooping foliage using cone geometry
  const willowMat = new THREE.MeshStandardMaterial({ color: 0x7cba3d });
  const foliageTop = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), willowMat);
  foliageTop.position.y = 4;
  foliageTop.scale.set(1, 0.8, 1);
  foliageTop.castShadow = true;
  group.add(foliageTop);

  // Hanging vines/branches
  const vineMat = new THREE.MeshStandardMaterial({ color: 0x5a9e2f });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 1.2 + Math.random() * 0.4;
    const vine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.02, 2.5 + Math.random(), 4),
      vineMat
    );
    vine.position.set(Math.cos(angle) * radius, 2.5, Math.sin(angle) * radius);
    vine.rotation.x = Math.PI / 8 + Math.random() * 0.2;
    vine.rotation.y = angle;
    group.add(vine);
  }

  return group;
}

function createPineTree() {
  const group = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d4037 })
  );
  trunk.position.y = 1;
  trunk.castShadow = true;
  group.add(trunk);

  // Layered cone foliage
  const pineMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
  const layers = [
    { y: 2.2, r: 1.2, h: 1.5 },
    { y: 3.2, r: 0.9, h: 1.3 },
    { y: 4.0, r: 0.6, h: 1.0 },
    { y: 4.6, r: 0.3, h: 0.7 }
  ];
  layers.forEach(l => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(l.r, l.h, 8), pineMat);
    cone.position.y = l.y;
    cone.castShadow = true;
    group.add(cone);
  });

  return group;
}

// ============================================
// BUTTERFLIES - Ambient flying creatures
// ============================================

export const butterflies = [];

function createButterfly() {
  const group = new THREE.Group();

  // Body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.015, 0.15, 6),
    bodyMat
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Wings - colorful
  const wingColors = [0xff69b4, 0xffd700, 0x87ceeb, 0xdda0dd, 0xffb6c1, 0x98fb98];
  const wingColor = wingColors[Math.floor(Math.random() * wingColors.length)];
  const wingMat = new THREE.MeshStandardMaterial({
    color: wingColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });

  // Wing shape using plane geometry
  const wingGeo = new THREE.PlaneGeometry(0.12, 0.1);

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.position.set(-0.06, 0, 0);
  leftWing.rotation.y = Math.PI / 6;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.position.set(0.06, 0, 0);
  rightWing.rotation.y = -Math.PI / 6;
  group.add(rightWing);

  // Animation data
  group.userData = {
    baseY: 0.8 + Math.random() * 1.5,
    centerX: 0,
    centerZ: 0,
    radius: 1 + Math.random() * 2,
    speed: 0.5 + Math.random() * 0.5,
    angle: Math.random() * Math.PI * 2,
    wingPhase: Math.random() * Math.PI * 2,
    leftWing,
    rightWing
  };

  return group;
}

function createButterflies() {
  // Place butterflies near flower beds
  const butterflySpots = [
    { x: 15, z: 0 }, { x: -6, z: 6 }, { x: 6, z: -6 },
    { x: 28, z: 8 }, { x: -12, z: 13 }, { x: 12, z: 13 },
    { x: -28, z: 8 }, { x: 8, z: -21 }
  ];

  butterflySpots.forEach(spot => {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const butterfly = createButterfly();
      butterfly.userData.centerX = spot.x + (Math.random() - 0.5) * 3;
      butterfly.userData.centerZ = spot.z + (Math.random() - 0.5) * 3;
      butterfly.position.set(
        butterfly.userData.centerX,
        butterfly.userData.baseY,
        butterfly.userData.centerZ
      );
      scene.add(butterfly);
      butterflies.push(butterfly);
    }
  });
}

export function updateButterflies(time) {
  butterflies.forEach(b => {
    const data = b.userData;
    // Circular flight pattern
    data.angle += data.speed * 0.02;
    b.position.x = data.centerX + Math.cos(data.angle) * data.radius;
    b.position.z = data.centerZ + Math.sin(data.angle) * data.radius;
    b.position.y = data.baseY + Math.sin(time * 2 + data.wingPhase) * 0.3;

    // Face direction of movement
    b.rotation.y = data.angle + Math.PI / 2;

    // Wing flapping
    const flapAngle = Math.sin(time * 15 + data.wingPhase) * 0.5;
    data.leftWing.rotation.y = Math.PI / 6 + flapAngle;
    data.rightWing.rotation.y = -Math.PI / 6 - flapAngle;
  });
}

// ============================================
// ROYAL PROPS - Large decorative items
// ============================================

function createHugeRedChair() {
  const group = new THREE.Group();
  const chairMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.6 });
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xffa3b1, roughness: 0.7 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.8 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 2.5), chairMat);
  seat.position.y = 0.8;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.5), chairMat);
  back.position.set(0, 2, -1);
  back.castShadow = true;
  group.add(back);

  const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.9), cushionMat);
  cushion.position.y = 1.1;
  group.add(cushion);

  [-1.2, 1.2].forEach(x => {
    [-0.9, 0.9].forEach(z => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), woodMat);
      leg.position.set(x, 0.4, z);
      leg.castShadow = true;
      group.add(leg);
    });
  });

  return group;
}

function createCakeWithCherry() {
  const group = new THREE.Group();
  const cakeMat = new THREE.MeshStandardMaterial({ color: 0xfff0d6, roughness: 0.7 });
  const frostingMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.6 });
  const cherryMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.15, 16), plateMat);
  plate.position.y = 0.1;
  group.add(plate);

  const cake = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 20), cakeMat);
  cake.position.y = 0.6;
  cake.castShadow = true;
  group.add(cake);

  const frosting = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.25, 20), frostingMat);
  frosting.position.y = 1.05;
  group.add(frosting);

  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), cherryMat);
  cherry.position.set(0.2, 1.3, 0);
  group.add(cherry);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
  stem.position.set(0.2, 1.45, 0);
  stem.rotation.z = 0.5;
  group.add(stem);

  return group;
}

function createMilkTart() {
  const group = new THREE.Group();
  const crustMat = new THREE.MeshStandardMaterial({ color: 0xf4c27a, roughness: 0.8 });
  const fillingMat = new THREE.MeshStandardMaterial({ color: 0xfff3c1, roughness: 0.6 });
  const dustMat = new THREE.MeshStandardMaterial({ color: 0xcfa670, roughness: 0.9 });

  const crust = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 0.4, 16), crustMat);
  crust.position.y = 0.25;
  crust.castShadow = true;
  group.add(crust);

  const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.25, 16), fillingMat);
  filling.position.y = 0.55;
  group.add(filling);

  const dust = new THREE.Mesh(new THREE.CircleGeometry(0.75, 16), dustMat);
  dust.rotation.x = -Math.PI / 2;
  dust.position.y = 0.7;
  group.add(dust);

  return group;
}

function createIceCreamGlass() {
  const group = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xd9f7ff, roughness: 0.3, metalness: 0.2 });
  const scoopColors = [0xffd1dc, 0xfde2a7, 0xc1e1c1];

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.6, 1.1, 16, 1, true), glassMat);
  bowl.position.y = 1.1;
  group.add(bowl);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.7, 8), stemMat);
  stem.position.y = 0.35;
  group.add(stem);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 12), stemMat);
  base.position.y = 0.05;
  group.add(base);

  scoopColors.forEach((color, i) => {
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), new THREE.MeshStandardMaterial({ color }));
    scoop.position.set((i - 1) * 0.35, 1.5 + i * 0.2, 0);
    scoop.castShadow = true;
    group.add(scoop);
  });

  return group;
}

function createPinkSodaGlass() {
  const group = new THREE.Group();
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  const sodaMat = new THREE.MeshStandardMaterial({ color: 0xff8fb1, transparent: true, opacity: 0.7 });
  const strawMat = new THREE.MeshStandardMaterial({ color: 0xff5c8a, roughness: 0.4 });

  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.6, 16), glassMat);
  glass.position.y = 0.9;
  group.add(glass);

  const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 16), sodaMat);
  soda.position.y = 0.75;
  group.add(soda);

  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), strawMat);
  straw.position.set(0.15, 1.4, 0);
  straw.rotation.z = 0.2;
  group.add(straw);

  return group;
}

function createGoldenTeapot() {
  const group = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd36e, metalness: 0.7, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), goldMat);
  body.scale.set(1.2, 1, 1);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.2, 12), goldMat);
  lid.position.y = 1.5;
  group.add(lid);

  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.8, 8), goldMat);
  spout.position.set(1, 1, 0.3);
  spout.rotation.z = -0.7;
  group.add(spout);

  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 16), goldMat);
  handle.position.set(-1, 1, 0);
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  return group;
}

function createMacaronTower() {
  const group = new THREE.Group();
  const colors = [0xffc1cc, 0xffe0a3, 0xc7e9f1, 0xd6c1f7];
  colors.forEach((color, i) => {
    const macaron = new THREE.Mesh(new THREE.CylinderGeometry(0.6 - i * 0.08, 0.6 - i * 0.08, 0.25, 16), new THREE.MeshStandardMaterial({ color }));
    macaron.position.y = 0.2 + i * 0.3;
    macaron.castShadow = true;
    group.add(macaron);
  });
  return group;
}

function createCrownCushion() {
  const group = new THREE.Group();
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xff7ab6, roughness: 0.7 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xfff4d1, roughness: 0.6 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.2), cushionMat);
  base.position.y = 0.25;
  base.castShadow = true;
  group.add(base);

  const trim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 8, 16), trimMat);
  trim.position.y = 0.5;
  trim.rotation.x = Math.PI / 2;
  group.add(trim);

  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x7dd3fc }));
  jewel.position.set(0, 0.6, 0.35);
  group.add(jewel);

  return group;
}

// ============================================
// WATERFALL AND WATER FEATURES
// ============================================

function createWaterfallFeature() {
  const feature = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x7f7f85, roughness: 0.9 });

  const rocks = [
    { geo: new THREE.DodecahedronGeometry(0.9, 0), pos: [0, 0.35, 0], scale: [1.2, 0.7, 1] },
    { geo: new THREE.DodecahedronGeometry(0.6, 0), pos: [-0.9, 0.2, 0.4], scale: [0.9, 0.6, 1.1] },
    { geo: new THREE.DodecahedronGeometry(0.5, 0), pos: [0.8, 0.2, 0.6], scale: [1, 0.5, 0.8] },
    { geo: new THREE.SphereGeometry(0.5, 6, 6), pos: [-0.2, 0.15, -0.6], scale: [1.3, 0.5, 1] },
    { geo: new THREE.SphereGeometry(0.4, 6, 6), pos: [0.6, 0.1, -0.4], scale: [0.8, 0.4, 0.9] }
  ];

  rocks.forEach(({ geo, pos, scale }) => {
    const rock = new THREE.Mesh(geo, rockMat);
    rock.position.set(pos[0], pos[1], pos[2]);
    rock.scale.set(scale[0], scale[1], scale[2]);
    rock.castShadow = true;
    rock.receiveShadow = true;
    feature.add(rock);
  });

  const waterfallMat = new THREE.MeshStandardMaterial({
    color: 0x6ecbff,
    transparent: true,
    opacity: 0.55,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8, 1, 4), waterfallMat);
  waterfall.position.set(0.2, 1.35, -0.2);
  waterfall.rotation.y = Math.PI * 0.1;
  feature.add(waterfall);
  waterfallSheets.push({ mesh: waterfall, baseY: waterfall.position.y, offset: Math.random() * Math.PI * 2 });

  return feature;
}

// AUSTINVILLE GRID LAYOUT - Big waterfall positioned in north-east area, away from donut shop
function createBigWaterfallFeature() {
  const waterfall = new THREE.Group();
  const anchorX = 32;
  const anchorZ = -30;

  const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.4, 4.2), stoneMaterial);
  base.position.y = 1.2;
  base.castShadow = true;
  waterfall.add(base);

  const back = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3, 1.4), stoneMaterial);
  back.position.set(0, 2.2, -1.6);
  back.castShadow = true;
  waterfall.add(back);

  const lip = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 1.2), stoneMaterial);
  lip.position.set(0, 2.1, -0.2);
  lip.castShadow = true;
  waterfall.add(lip);

  const fall = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), waterMaterial);
  fall.position.set(0, 1.1, 1.4);
  waterfall.add(fall);

  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16), waterMaterial);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.08, 2.2);
  waterfall.add(pool);

  waterfall.position.set(anchorX, 0, anchorZ);
  scene.add(waterfall);

  return { x: anchorX, z: anchorZ };
}

function createIrrigationSystem(anchorX, anchorZ) {
  const trough = new THREE.Group();
  const troughLength = 6;
  const troughWidth = 1.6;
  const wallThickness = 0.2;
  const wallHeight = 0.55;

  const base = new THREE.Mesh(new THREE.BoxGeometry(troughLength, 0.25, troughWidth), stoneMaterial);
  base.position.y = 0.12;
  base.castShadow = true;
  trough.add(base);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(troughLength, wallHeight, wallThickness), stoneMaterial);
  leftWall.position.set(0, wallHeight / 2 + 0.12, -troughWidth / 2 + wallThickness / 2);
  leftWall.castShadow = true;
  trough.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(troughLength, wallHeight, wallThickness), stoneMaterial);
  rightWall.position.set(0, wallHeight / 2 + 0.12, troughWidth / 2 - wallThickness / 2);
  rightWall.castShadow = true;
  trough.add(rightWall);

  const endWall1 = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, troughWidth), stoneMaterial);
  endWall1.position.set(-troughLength / 2 + wallThickness / 2, wallHeight / 2 + 0.12, 0);
  endWall1.castShadow = true;
  trough.add(endWall1);

  const endWall2 = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, troughWidth - 0.6), stoneMaterial);
  endWall2.position.set(troughLength / 2 - wallThickness / 2, wallHeight / 2 + 0.12, 0);
  endWall2.castShadow = true;
  trough.add(endWall2);

  const water = new THREE.Mesh(new THREE.BoxGeometry(troughLength - wallThickness * 2, 0.02, troughWidth - wallThickness * 2), waterMaterial);
  water.position.y = 0.5;
  trough.add(water);

  const angleToAnchor = Math.atan2(0 - anchorZ, 0 - anchorX);
  const distToCenter = Math.hypot(anchorX, anchorZ);
  const troughDistance = 8;
  const troughX = anchorX + Math.cos(angleToAnchor) * troughDistance;
  const troughZ = anchorZ + Math.sin(angleToAnchor) * troughDistance;

  trough.position.set(troughX, 0, troughZ);
  trough.rotation.y = angleToAnchor;
  scene.add(trough);

  collisionBoxes.push({
    minX: troughX - 4,
    maxX: troughX + 4,
    minZ: troughZ - 2,
    maxZ: troughZ + 2
  });
}

// ============================================
// FOUNTAIN
// ============================================

function createFountain() {
  // Small collision for fountain
  collisionBoxes.push({ minX: -1.5, maxX: 1.5, minZ: -1.5, maxZ: 1.5 });

  // Add fountain to collision manager
  collisionManager.addStaticBox(0, 0, 3, 3);

  const fountain = new THREE.Group();

  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 16), stoneMaterial);
  base.position.y = 0.25;
  base.castShadow = true;
  fountain.add(base);

  // Water
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.3, 16),
    waterMaterial
  );
  water.position.y = 0.65;
  fountain.add(water);

  // Pillar
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.5, 8), stoneMaterial);
  pillar.position.y = 1.25;
  pillar.castShadow = true;
  fountain.add(pillar);

  // Crown on top
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.2 });
  const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.2, 6), crownMat);
  crownBase.position.y = 2.2;
  fountain.add(crownBase);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const point = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 4), crownMat);
    point.position.set(Math.cos(a) * 0.25, 2.4, Math.sin(a) * 0.25);
    fountain.add(point);
  }

  scene.add(fountain);
}

// ============================================
// GRASS TUFTS - Instanced grass rendering
// ============================================

function createGrassTufts() {
  // Increased grass count for expanded Austinville
  const tuftCount = 720;
  const tuftGeo = new THREE.ConeGeometry(0.08, 0.6, 5);
  const tuftMat = new THREE.MeshStandardMaterial({ color: 0x4fae5d, roughness: 0.9 });
  grassTufts = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
  grassTufts.castShadow = false;
  grassTufts.receiveShadow = false;
  grassTufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  let placed = 0;
  let attempts = 0;
  while (placed < tuftCount && attempts < tuftCount * 8) {
    attempts++;
    const angle = Math.random() * Math.PI * 2;
    // Expanded range for Austinville
    const radius = 16 + Math.random() * 55;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const nearPathBand = isNearPath(x, z, 4.2) && !isNearPath(x, z, 1.2);
    const isSafeOpenArea = isSafeOffPathPlacement(x, z);
    if (!(isSafeOpenArea || (nearPathBand && isClearOfBuildings(x, z, 2.5)))) {
      continue;
    }

    const scaleBase = 0.35 + Math.random() * 0.6;
    const scale = new THREE.Vector3(
      scaleBase * (0.8 + Math.random() * 0.4),
      scaleBase * (0.9 + Math.random() * 0.6),
      scaleBase * (0.8 + Math.random() * 0.4)
    );
    const rotationY = Math.random() * Math.PI * 2;
    const position = new THREE.Vector3(x, 0.02, z);
    grassTuftData.push({ position, rotationY, scale });

    grassTuftDummy.position.copy(position);
    grassTuftDummy.rotation.set(0, rotationY, 0);
    grassTuftDummy.scale.copy(scale);
    grassTuftDummy.updateMatrix();
    grassTufts.setMatrixAt(placed, grassTuftDummy.matrix);
    placed++;
  }

  grassTufts.count = placed;
  scene.add(grassTufts);
}

// ============================================
// DECORATIONS - Flowers, trees, bushes, etc.
// ============================================

function createDecorations() {
  // Flowers (more for expanded Austinville)
  const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00ced1];
  for (let i = 0; i < 120; i++) {
    const flower = createFlower(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
    flower.position.set((Math.random() - 0.5) * 140, 0, (Math.random() - 0.5) * 140);
    flower.scale.setScalar(0.4 + Math.random() * 0.5);
    scene.add(flower);
  }

  // === FLOWER BEDS along roads ===
  createFlowerBeds();

  // === BUTTERFLIES near flower beds ===
  createButterflies();

  // Trees (AUSTINVILLE GRID LAYOUT - placed between blocks and along edges, avoiding buildings)
  // Now with variety: regular trees, cherry blossoms, willows, and pines
  const treePositions = [
    // Along southern edge - mix of regular and cherry blossoms
    { x: 0, z: 28, type: 'cherry' }, { x: 15, z: 26, type: 'regular' }, { x: -15, z: 26, type: 'cherry' },
    { x: 30, z: 22, type: 'regular' }, { x: -30, z: 22, type: 'pine' },
    // Between Crumpet Court (z=10) and Scone Street (z=20)
    { x: 35, z: 15, type: 'regular' }, { x: -35, z: 15, type: 'pine' },
    { x: 18, z: 16, type: 'cherry' }, { x: -18, z: 16, type: 'regular' },
    // Along eastern edge
    { x: 38, z: 0, type: 'regular' }, { x: 35, z: -8, type: 'pine' }, { x: 38, z: -22, type: 'regular' },
    // Along western edge
    { x: -38, z: 0, type: 'pine' }, { x: -38, z: -22, type: 'regular' },
    // Near river (north) - willows near water!
    { x: -15, z: -28, type: 'willow' }, { x: 28, z: -26, type: 'willow' },
    // Near Tea Café - cherry blossoms for atmosphere
    { x: 30, z: 8, type: 'cherry' }, { x: 20, z: 10, type: 'cherry' },
    // Additional variety trees
    { x: -32, z: 8, type: 'pine' }, { x: 32, z: -15, type: 'regular' },
    { x: -8, z: 25, type: 'cherry' }, { x: 8, z: 25, type: 'cherry' }
  ];

  treePositions.forEach(pos => {
    let tree;
    switch(pos.type) {
      case 'cherry':
        tree = createCherryBlossomTree();
        break;
      case 'willow':
        tree = createWillowTree();
        break;
      case 'pine':
        tree = createPineTree();
        break;
      default:
        tree = createTree();
    }
    tree.position.set(pos.x, 0, pos.z);
    tree.scale.setScalar(0.7 + Math.random() * 0.5);
    scene.add(tree);
  });

  // Sparse bushes and boulders (more for expanded area)
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a9d5d });
  const boulderMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.9 });

  for (let i = 0; i < 12; i++) {
    const bush = createBush(bushMat);
    let x = 0;
    let z = 0;
    for (let tries = 0; tries < 8; tries++) {
      x = (Math.random() - 0.5) * 130;
      z = (Math.random() - 0.5) * 130;
      if (isSafeOffPathPlacement(x, z)) break;
    }
    bush.position.set(x, 0, z);
    bush.scale.setScalar(0.5 + Math.random() * 0.4);
    scene.add(bush);
  }

  for (let i = 0; i < 6; i++) {
    const boulder = createBoulder(boulderMat);
    let x = 0;
    let z = 0;
    for (let tries = 0; tries < 8; tries++) {
      x = (Math.random() - 0.5) * 130;
      z = (Math.random() - 0.5) * 130;
      if (isSafeOffPathPlacement(x, z)) break;
    }
    boulder.position.set(x, 0.4, z);
    boulder.rotation.set(Math.random(), Math.random(), Math.random());
    boulder.scale.setScalar(0.8 + Math.random() * 0.4);
    boulder.castShadow = true;
    scene.add(boulder);
  }

  // Mushrooms (more for expanded area)
  for (let i = 0; i < 50; i++) {
    const mushroom = createMushroom();
    mushroom.position.set((Math.random() - 0.5) * 130, 0, (Math.random() - 0.5) * 130);
    mushroom.scale.setScalar(0.25 + Math.random() * 0.35);
    scene.add(mushroom);
  }

  createGrassTufts();

  // Royal props placed beyond paths
  createRoyalProps();

  const waterfallAnchor = createBigWaterfallFeature();
  createIrrigationSystem(waterfallAnchor.x, waterfallAnchor.z);
}

// ============================================
// ROYAL PROPS PLACEMENT
// ============================================

// AUSTINVILLE GRID LAYOUT - Royal props placed in open areas away from buildings and streets
// Avoiding: Core buildings (around center), Shops (at ±25, various z), Activities (west side),
// Streets (z: -20, -10, 0, 10, 20), River (z≈-27)
function createRoyalProps() {
  const propInset = 0.82;
  const placements = [
    // South-east corner area
    { create: createHugeRedChair, x: 38, z: 28, scale: 1.2 },
    { create: createMilkTart, x: 35, z: 18, scale: 1 },
    { create: createPinkSodaGlass, x: 32, z: 25, scale: 1 },
    // South-west corner area
    { create: createCakeWithCherry, x: -38, z: 28, scale: 1.1 },
    { create: createIceCreamGlass, x: -35, z: 18, scale: 1.05 },
    // West side (away from trampoline and boxing ring)
    { create: createGoldenTeapot, x: -38, z: -3, scale: 1 },
    // North area near river (spaced from donut shop)
    { create: createMacaronTower, x: 32, z: -28, scale: 1.1 },
    { create: createCrownCushion, x: -5, z: -32, scale: 1 },
    // East side waterfall
    {
      create: createWaterfallFeature,
      x: 42,
      z: -3,
      scale: 1.1,
      collision: { minX: -2.2, maxX: 2.2, minZ: -1.8, maxZ: 1.8 }
    }
  ];

  placements.forEach(({ create, x, z, scale, collision }) => {
    const insetX = x * propInset;
    const insetZ = z * propInset;
    if (!isSafeOffPathPlacement(insetX, insetZ)) return;
    const prop = create();
    prop.position.set(insetX, 0, insetZ);
    prop.scale.setScalar(scale);
    scene.add(prop);
    if (collision) {
      // Add to legacy collision boxes
      collisionBoxes.push({
        minX: insetX + collision.minX * scale,
        maxX: insetX + collision.maxX * scale,
        minZ: insetZ + collision.minZ * scale,
        maxZ: insetZ + collision.maxZ * scale
      });

      // Add to new collision manager
      const minX = insetX + collision.minX * scale;
      const maxX = insetX + collision.maxX * scale;
      const minZ = insetZ + collision.minZ * scale;
      const maxZ = insetZ + collision.maxZ * scale;
      collisionManager.addStaticBoxMinMax(minX, maxX, minZ, maxZ);
    }
  });
}

// ============================================
// MAIN WORLD CREATION
// ============================================

export function createWorld() {
  // Initialize collision system with buildings
  LOCATIONS.forEach(loc => {
    // Add to legacy collision boxes (for backward compatibility)
    collisionBoxes.push({
      minX: loc.x - loc.sx / 2 - 0.5,
      maxX: loc.x + loc.sx / 2 + 0.5,
      minZ: loc.z - loc.sz / 2 - 0.5,
      maxZ: loc.z + loc.sz / 2 + 0.5
    });

    // Add to new collision manager
    collisionManager.addStaticBox(loc.x, loc.z, loc.sx, loc.sz, 0.5);
  });

  // Ground (expanded for Austinville town)
  const groundGeo = new THREE.CircleGeometry(80, 64);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x90d860, roughness: 0.8 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Paths
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.9 });
  for (let i = 0; i < PATH_CONFIG.count; i++) {
    const angle = PATH_CONFIG.angleStep * i;
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(PATH_CONFIG.width, PATH_CONFIG.length),
      pathMat
    );
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = -angle;
    path.position.set(
      Math.sin(angle) * PATH_CONFIG.centerRadius,
      0.02,
      Math.cos(angle) * PATH_CONFIG.centerRadius
    );
    path.receiveShadow = true;
    scene.add(path);
  }

  // Plaza
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(5, 32),
    new THREE.MeshStandardMaterial({ color: 0xffd4a8, roughness: 0.7 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.03;
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Fountain
  createFountain();

  // Decorations (flowers, trees, grass, props, etc.)
  createDecorations();
}

// ============================================
// UPDATE - Grass culling optimization
// ============================================

export function updateGrassTuftsCulling() {
  // Performance optimization - update grass visibility
  // This could check distance to camera and cull far grass
  // For now, it's a placeholder for future optimization
}
