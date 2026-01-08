// River - Austinville river system with animated water, bridges, and fish
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { collisionManager } from '../systems/CollisionManager.js';

// River configuration
export const RIVER_CONFIG = {
  path: [
    { x: -45, z: -27 },
    { x: -30, z: -28 },
    { x: -15, z: -25 },
    { x: 0, z: -28 },
    { x: 15, z: -30 },
    { x: 30, z: -27 },
    { x: 45, z: -25 }
  ],
  width: 6,
  depth: 0.5,
  flowSpeed: 0.8
};

// Store references for animation
export let riverWater = null;
export const riverRocks = [];
export const bridges = [];

// Jumping fish
export const fishArray = [];
const FISH_COUNT = 8;

/**
 * Create the river with bed and water surface
 */
export function createRiver() {
  const riverGroup = new THREE.Group();

  // River bed (darker depression)
  const bedMat = new THREE.MeshStandardMaterial({
    color: 0x4a6741,
    roughness: 1
  });

  // Create river bed as series of connected planes
  const riverBedGeo = new THREE.PlaneGeometry(95, RIVER_CONFIG.width + 2);
  const riverBed = new THREE.Mesh(riverBedGeo, bedMat);
  riverBed.rotation.x = -Math.PI / 2;
  riverBed.position.set(0, -0.15, -27);
  riverBed.receiveShadow = true;
  riverGroup.add(riverBed);

  // Water surface (animated)
  const waterGeo = new THREE.PlaneGeometry(90, RIVER_CONFIG.width, 50, 5);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4a90b8,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.2
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.05, -27);
  water.userData.isRiverWater = true;
  riverGroup.add(water);
  riverWater = water;

  // Rocks in river
  const rockPositions = [
    { x: -20, z: -26, scale: 0.8 },
    { x: -5, z: -28, scale: 1.2 },
    { x: 10, z: -27, scale: 0.6 },
    { x: 25, z: -29, scale: 1 },
    { x: -35, z: -26, scale: 0.9 },
    { x: 35, z: -28, scale: 0.7 }
  ];

  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.9 });

  rockPositions.forEach(pos => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5 * pos.scale, 1),
      rockMat
    );
    rock.position.set(pos.x, 0.1, pos.z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    riverGroup.add(rock);
    riverRocks.push(rock);
  });

  // River banks (slight elevation on sides)
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.9 });
  [-1, 1].forEach(side => {
    const bankGeo = new THREE.BoxGeometry(95, 0.3, 1.5);
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(0, 0.1, -27 + side * (RIVER_CONFIG.width / 2 + 0.8));
    bank.receiveShadow = true;
    riverGroup.add(bank);
  });

  scene.add(riverGroup);
  return riverGroup;
}

/**
 * Create a wooden bridge
 */
export function createWoodenBridge(start, end, archHeight = 1) {
  const group = new THREE.Group();

  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
  );
  const segments = Math.ceil(length / 0.5);

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb5a642 });

  // Calculate angle of bridge
  const bridgeAngle = Math.atan2(end.z - start.z, end.x - start.x);

  // Bridge planks (arched)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const archY = Math.sin(t * Math.PI) * archHeight;

    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 0.4),
      woodMat
    );
    plank.position.set(
      THREE.MathUtils.lerp(start.x, end.x, t),
      0.3 + archY,
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
    plank.rotation.y = bridgeAngle;
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }

  // Rope railings
  [-0.9, 0.9].forEach(side => {
    // Posts
    for (let i = 0; i <= segments; i += 3) {
      const t = i / segments;
      const archY = Math.sin(t * Math.PI) * archHeight;

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6),
        woodMat
      );

      // Calculate perpendicular offset
      const perpX = side * Math.sin(bridgeAngle + Math.PI / 2);
      const perpZ = side * Math.cos(bridgeAngle + Math.PI / 2);

      post.position.set(
        THREE.MathUtils.lerp(start.x, end.x, t) + perpX,
        0.7 + archY,
        THREE.MathUtils.lerp(start.z, end.z, t) + perpZ
      );
      post.castShadow = true;
      group.add(post);
    }

    // Rope (simplified as tube)
    const ropePoints = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const archY = Math.sin(t * Math.PI) * archHeight;
      const sag = Math.sin(t * Math.PI) * 0.1;

      const perpX = side * Math.sin(bridgeAngle + Math.PI / 2);
      const perpZ = side * Math.cos(bridgeAngle + Math.PI / 2);

      ropePoints.push(new THREE.Vector3(
        THREE.MathUtils.lerp(start.x, end.x, t) + perpX,
        1 + archY - sag,
        THREE.MathUtils.lerp(start.z, end.z, t) + perpZ
      ));
    }

    const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
    const ropeGeo = new THREE.TubeGeometry(ropeCurve, 20, 0.03, 6, false);
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.castShadow = true;
    group.add(rope);
  });

  group.userData.isBridge = true;
  return group;
}

/**
 * Create all bridges
 */
export function createAllBridges() {
  // Main bridge over river (east side)
  const bridge1 = createWoodenBridge(
    { x: 5, z: -24 },
    { x: 5, z: -32 },
    0.8
  );
  scene.add(bridge1);
  bridges.push(bridge1);

  // Smaller decorative bridge (west side)
  const bridge2 = createWoodenBridge(
    { x: -10, z: -24 },
    { x: -10, z: -30 },
    0.5
  );
  scene.add(bridge2);
  bridges.push(bridge2);

  // Third bridge (far east)
  const bridge3 = createWoodenBridge(
    { x: 25, z: -24 },
    { x: 25, z: -31 },
    0.6
  );
  scene.add(bridge3);
  bridges.push(bridge3);

  return bridges;
}

/**
 * Create a single fish mesh
 */
function createFishMesh() {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.15, 8, 8);
  bodyGeo.scale(2, 1, 0.8);
  const fishColors = [0xffa500, 0xff6347, 0x4169e1, 0x32cd32, 0xffd700, 0xff69b4];
  const bodyMat = new THREE.MeshStandardMaterial({
    color: fishColors[Math.floor(Math.random() * fishColors.length)],
    roughness: 0.3,
    metalness: 0.5
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Tail
  const tailGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.3;
  group.add(tail);

  // Dorsal fin
  const finGeo = new THREE.ConeGeometry(0.05, 0.15, 3);
  const fin = new THREE.Mesh(finGeo, bodyMat);
  fin.position.y = 0.12;
  group.add(fin);

  // Eye
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  eye.position.set(0.2, 0.05, 0.1);
  group.add(eye);

  return group;
}

/**
 * Create jumping fish
 */
export function createJumpingFish() {
  for (let i = 0; i < FISH_COUNT; i++) {
    const fish = createFishMesh();

    // Random position along river
    const riverX = -35 + Math.random() * 70;
    const riverZ = -28 + (Math.random() - 0.5) * 4;

    fish.position.set(riverX, -0.5, riverZ);
    fish.visible = false; // Start hidden underwater

    fish.userData = {
      baseX: riverX,
      baseZ: riverZ,
      jumpTimer: Math.random() * 10, // Staggered jumps
      jumpDuration: 0,
      isJumping: false,
      jumpHeight: 1.5 + Math.random() * 1,
      jumpCooldown: 5 + Math.random() * 8
    };

    scene.add(fish);
    fishArray.push(fish);
  }

  return fishArray;
}

// Splash pool for reuse
const splashPool = [];
const MAX_SPLASHES = 10;

/**
 * Create splash effect
 */
function createSplashEffect(position) {
  // Create quick splash sprite
  const splashGeo = new THREE.CircleGeometry(0.3, 8);
  const splashMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const splash = new THREE.Mesh(splashGeo, splashMat);
  splash.position.copy(position);
  splash.position.y = 0.1;
  splash.rotation.x = -Math.PI / 2;
  scene.add(splash);

  // Animate and remove
  splash.userData.scale = 0.3;
  splash.userData.opacity = 0.7;
  splash.userData.active = true;

  splashPool.push(splash);

  // Clean old splashes
  while (splashPool.length > MAX_SPLASHES) {
    const oldSplash = splashPool.shift();
    scene.remove(oldSplash);
    oldSplash.geometry.dispose();
    oldSplash.material.dispose();
  }
}

/**
 * Update jumping fish animation
 */
export function updateJumpingFish(time, delta) {
  fishArray.forEach(fish => {
    const data = fish.userData;

    if (!data.isJumping) {
      data.jumpTimer -= delta;

      if (data.jumpTimer <= 0) {
        // START JUMP!
        data.isJumping = true;
        data.jumpDuration = 0;
        fish.visible = true;

        // Splash particle
        createSplashEffect(fish.position.clone());
      }
    } else {
      // Jumping arc
      data.jumpDuration += delta;
      const jumpProgress = data.jumpDuration / 1.2; // 1.2 second jump

      if (jumpProgress >= 1) {
        // Land back in water
        data.isJumping = false;
        data.jumpTimer = data.jumpCooldown;
        fish.visible = false;
        fish.position.y = -0.5;
        fish.position.x = data.baseX;

        // Landing splash
        createSplashEffect(fish.position.clone());
      } else {
        // Parabolic arc
        const arc = Math.sin(jumpProgress * Math.PI);
        fish.position.y = arc * data.jumpHeight;

        // Rotation during jump
        fish.rotation.z = (jumpProgress - 0.5) * Math.PI * 0.8;

        // Slight forward movement
        fish.position.x = data.baseX + jumpProgress * 1.5;

        // Wiggle
        fish.rotation.y = Math.sin(time * 15) * 0.3;
      }
    }
  });

  // Update splashes
  splashPool.forEach((splash, index) => {
    if (splash.userData.active) {
      splash.userData.scale += 0.15 * delta * 60;
      splash.userData.opacity -= 0.08 * delta * 60;
      splash.scale.setScalar(splash.userData.scale);
      splash.material.opacity = splash.userData.opacity;

      if (splash.userData.opacity <= 0) {
        splash.userData.active = false;
        scene.remove(splash);
      }
    }
  });
}

/**
 * Update river water - now still water (no animation for performance)
 */
export function updateRiverWater(time) {
  // Still water - no animation needed for performance
  // The water surface is static now
}

/**
 * Check if position is in river (for collision)
 */
export function isInRiver(x, z) {
  // Simple bounding check
  const riverMinZ = -31;
  const riverMaxZ = -24;
  const riverMinX = -45;
  const riverMaxX = 45;

  return x > riverMinX && x < riverMaxX && z > riverMinZ && z < riverMaxZ;
}

/**
 * Check if position is on a bridge
 */
export function isOnBridge(x, z) {
  const bridgePositions = [
    { x: 5, minZ: -32, maxZ: -24 },
    { x: -10, minZ: -30, maxZ: -24 },
    { x: 25, minZ: -31, maxZ: -24 }
  ];

  for (const bridge of bridgePositions) {
    if (Math.abs(x - bridge.x) < 1.2 && z > bridge.minZ && z < bridge.maxZ) {
      return true;
    }
  }
  return false;
}

// ============================================
// IMPROVED RIVER VISUALS - Additional details
// ============================================

// Lily pads and water plants for still water
export const lilyPads = [];
export const waterPlants = [];

/**
 * Create lily pads for still water appearance
 */
export function createLilyPads() {
  const lilyPadPositions = [
    { x: -15, z: -26 }, { x: -12, z: -28 }, { x: -8, z: -27 },
    { x: 2, z: -29 }, { x: 8, z: -26 }, { x: 15, z: -28 },
    { x: 20, z: -27 }, { x: -30, z: -27 }, { x: 30, z: -26 }
  ];

  const lilyPadMat = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    roughness: 0.8,
    side: THREE.DoubleSide
  });

  lilyPadPositions.forEach(pos => {
    const group = new THREE.Group();

    // Lily pad (circular leaf)
    const padGeo = new THREE.CircleGeometry(0.4 + Math.random() * 0.2, 12);
    const pad = new THREE.Mesh(padGeo, lilyPadMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.08;
    group.add(pad);

    // Optional flower on some pads
    if (Math.random() > 0.5) {
      const flowerColors = [0xff69b4, 0xffffff, 0xffff00];
      const flowerMat = new THREE.MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
      });

      // Flower petals
      for (let i = 0; i < 5; i++) {
        const petalGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const petal = new THREE.Mesh(petalGeo, flowerMat);
        const angle = (i / 5) * Math.PI * 2;
        petal.position.set(Math.cos(angle) * 0.1, 0.15, Math.sin(angle) * 0.1);
        petal.scale.set(1, 0.5, 1);
        group.add(petal);
      }

      // Flower center
      const centerGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.y = 0.15;
      group.add(center);
    }

    group.position.set(pos.x, 0, pos.z);
    group.rotation.y = Math.random() * Math.PI * 2;
    scene.add(group);
    lilyPads.push(group);
  });
}

/**
 * Create reeds and cattails along river banks
 */
export function createRiverPlants() {
  const plantPositions = [
    // North bank
    { x: -20, z: -23.5 }, { x: -15, z: -23.2 }, { x: -5, z: -23.5 },
    { x: 10, z: -23.3 }, { x: 20, z: -23.5 }, { x: 30, z: -23.2 },
    // South bank
    { x: -25, z: -30.5 }, { x: -18, z: -30.3 }, { x: 0, z: -30.5 },
    { x: 12, z: -30.8 }, { x: 22, z: -30.3 }, { x: 35, z: -30.5 }
  ];

  const reedMat = new THREE.MeshStandardMaterial({ color: 0x4a7c4e });
  const cattailMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });

  plantPositions.forEach(pos => {
    const group = new THREE.Group();

    // Create 2-4 reeds per position
    const reedCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < reedCount; i++) {
      const height = 1 + Math.random() * 0.8;
      const reedGeo = new THREE.CylinderGeometry(0.02, 0.03, height, 6);
      const reed = new THREE.Mesh(reedGeo, reedMat);
      reed.position.set(
        (Math.random() - 0.5) * 0.5,
        height / 2,
        (Math.random() - 0.5) * 0.5
      );
      reed.rotation.z = (Math.random() - 0.5) * 0.2;
      group.add(reed);

      // Add cattail top to some reeds
      if (Math.random() > 0.5) {
        const cattailGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.25, 8);
        const cattail = new THREE.Mesh(cattailGeo, cattailMat);
        cattail.position.copy(reed.position);
        cattail.position.y = height - 0.1;
        group.add(cattail);
      }
    }

    group.position.set(pos.x, 0, pos.z);
    scene.add(group);
    waterPlants.push(group);
  });
}

// ============================================
// IMPROVED BRIDGE DETAILS
// ============================================

/**
 * Add decorative details to bridge area
 */
export function createBridgeDecorations() {
  // Add lanterns/posts at bridge entrances
  const bridgeEntrances = [
    { x: 5, z: -23 }, { x: 5, z: -33 },    // Main bridge
    { x: -10, z: -23 }, { x: -10, z: -31 }, // West bridge
    { x: 25, z: -23 }, { x: 25, z: -32 }    // East bridge
  ];

  const postMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffa500,
    emissiveIntensity: 0.3
  });

  bridgeEntrances.forEach(pos => {
    const group = new THREE.Group();

    // Post
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8);
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 0.75;
    post.castShadow = true;
    group.add(post);

    // Lantern
    const lanternGeo = new THREE.BoxGeometry(0.25, 0.3, 0.25);
    const lantern = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.position.y = 1.6;
    lantern.castShadow = true;
    group.add(lantern);

    // Lantern top
    const topGeo = new THREE.ConeGeometry(0.18, 0.15, 4);
    const top = new THREE.Mesh(topGeo, postMat);
    top.position.y = 1.85;
    group.add(top);

    group.position.set(pos.x, 0, pos.z);
    scene.add(group);
  });
}

// ============================================
// HIKE SIGN POST
// ============================================

export let hikeSign = null;

/**
 * Create HIKE sign post on the other side of the bridge
 */
export function createHikeSign() {
  const group = new THREE.Group();

  // Sign post
  const postMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const postGeo = new THREE.CylinderGeometry(0.1, 0.12, 3, 8);
  const post = new THREE.Mesh(postGeo, postMat);
  post.position.y = 1.5;
  post.castShadow = true;
  group.add(post);

  // Sign board
  const signMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
  const signGeo = new THREE.BoxGeometry(2, 0.8, 0.1);
  const signBoard = new THREE.Mesh(signGeo, signMat);
  signBoard.position.set(0, 2.8, 0);
  signBoard.castShadow = true;
  group.add(signBoard);

  // Sign text using canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#deb887';
  ctx.fillRect(0, 0, 256, 128);

  // Border
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 248, 120);

  // Text
  ctx.fillStyle = '#2f4f2f';
  ctx.font = 'bold 64px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HIKE', 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const textMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.8), textMat);
  textPlane.position.set(0, 2.8, 0.06);
  group.add(textPlane);

  // Back text (reversed)
  const textPlaneBack = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.8), textMat);
  textPlaneBack.position.set(0, 2.8, -0.06);
  textPlaneBack.rotation.y = Math.PI;
  group.add(textPlaneBack);

  // Arrow pointing to forest
  const arrowMat = new THREE.MeshStandardMaterial({ color: 0x2f4f2f });
  const arrowGeo = new THREE.ConeGeometry(0.15, 0.4, 3);
  const arrow = new THREE.Mesh(arrowGeo, arrowMat);
  arrow.position.set(0, 2.2, 0);
  arrow.rotation.z = -Math.PI / 2;
  arrow.rotation.y = Math.PI / 4;
  group.add(arrow);

  // Position on the south side of the main bridge (other side of river)
  group.position.set(8, 0, -35);
  group.rotation.y = Math.PI / 4;

  scene.add(group);
  hikeSign = group;

  return group;
}

// ============================================
// FOREST WITH ANIMALS
// ============================================

export const forestTrees = [];
export const foxes = [];
export const birds = [];
export let forestBounds = null;

/**
 * Create a small forest area with collision
 */
export function createForest() {
  const forestGroup = new THREE.Group();

  // Forest area bounds (south of the river, past the bridge)
  const forestCenter = { x: 15, z: -45 };
  const forestSize = { width: 30, depth: 20 };
  const pathWidth = 2.4;
  const clearingRadius = 3.6;

  // Store bounds for collision
  forestBounds = {
    minX: forestCenter.x - forestSize.width / 2,
    maxX: forestCenter.x + forestSize.width / 2,
    minZ: forestCenter.z - forestSize.depth / 2,
    maxZ: forestCenter.z + forestSize.depth / 2
  };

  // Ground cover
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d5c3d, roughness: 0.9 });
  const groundGeo = new THREE.PlaneGeometry(forestSize.width, forestSize.depth);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(forestCenter.x, 0.02, forestCenter.z);
  ground.receiveShadow = true;
  forestGroup.add(ground);

  // Subtle dirt path leading from bridge area to forest center
  const pathStart = {
    x: forestCenter.x - 6,
    z: forestBounds.maxZ - 1.2
  };
  const pathEnd = {
    x: forestCenter.x + 1,
    z: forestCenter.z + 0.5
  };
  const pathLength = Math.hypot(pathEnd.x - pathStart.x, pathEnd.z - pathStart.z);
  const pathGeo = new THREE.PlaneGeometry(pathLength, pathWidth);
  const pathMat = new THREE.MeshStandardMaterial({ color: 0x7a6345, roughness: 0.95 });
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(
    (pathStart.x + pathEnd.x) / 2,
    0.03,
    (pathStart.z + pathEnd.z) / 2
  );
  path.rotation.y = -Math.atan2(pathEnd.z - pathStart.z, pathEnd.x - pathStart.x);
  path.receiveShadow = true;
  forestGroup.add(path);

  // Clearing area with a small log ring and mushrooms
  const clearingCenter = {
    x: forestCenter.x + 2,
    z: forestCenter.z + 1.5
  };
  const clearingGeo = new THREE.CircleGeometry(clearingRadius, 24);
  const clearingMat = new THREE.MeshStandardMaterial({ color: 0x4d6a3f, roughness: 0.9 });
  const clearing = new THREE.Mesh(clearingGeo, clearingMat);
  clearing.rotation.x = -Math.PI / 2;
  clearing.position.set(clearingCenter.x, 0.025, clearingCenter.z);
  clearing.receiveShadow = true;
  forestGroup.add(clearing);

  const logMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.8 });
  const logGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const log = new THREE.Mesh(logGeo, logMat);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = angle;
    log.position.set(
      clearingCenter.x + Math.cos(angle) * 1.6,
      0.2,
      clearingCenter.z + Math.sin(angle) * 1.6
    );
    log.castShadow = true;
    forestGroup.add(log);
  }

  const mushroomColors = [0xff6b6b, 0xffa07a, 0x9370db];
  for (let i = 0; i < 4; i++) {
    const mushroomGroup = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.25, 6),
      new THREE.MeshStandardMaterial({ color: 0xfff8dc })
    );
    stem.position.y = 0.12;
    mushroomGroup.add(stem);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: mushroomColors[Math.floor(Math.random() * mushroomColors.length)]
      })
    );
    cap.position.y = 0.25;
    mushroomGroup.add(cap);

    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetRadius = 1 + Math.random() * 0.9;
    mushroomGroup.position.set(
      clearingCenter.x + Math.cos(offsetAngle) * offsetRadius,
      0,
      clearingCenter.z + Math.sin(offsetAngle) * offsetRadius
    );
    forestGroup.add(mushroomGroup);
  }

  // Tree materials
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 });
  const darkLeafMat = new THREE.MeshStandardMaterial({ color: 0x1a5c1a, roughness: 0.8 });

  // Create trees in a natural pattern
  const treePositions = [];
  const minTreeSpacing = 2.2;
  const maxAttempts = 200;

  const distanceToSegment = (point, start, end) => {
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const lengthSq = dx * dx + dz * dz;
    if (lengthSq === 0) {
      return Math.hypot(point.x - start.x, point.z - start.z);
    }
    let t = ((point.x - start.x) * dx + (point.z - start.z) * dz) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    const projX = start.x + t * dx;
    const projZ = start.z + t * dz;
    return Math.hypot(point.x - projX, point.z - projZ);
  };

  const isInsideBounds = pos =>
    pos.x > forestBounds.minX + 1 &&
    pos.x < forestBounds.maxX - 1 &&
    pos.z > forestBounds.minZ + 1 &&
    pos.z < forestBounds.maxZ - 1;

  const isClearOfPathAndClearing = pos => {
    const pathDistance = distanceToSegment(pos, pathStart, pathEnd);
    if (pathDistance < pathWidth * 0.6) {
      return false;
    }
    const clearingDistance = Math.hypot(pos.x - clearingCenter.x, pos.z - clearingCenter.z);
    return clearingDistance > clearingRadius + 0.8;
  };

  for (let i = 0; i < 25; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = {
        x: forestCenter.x + (Math.random() - 0.5) * (forestSize.width - 4),
        z: forestCenter.z + (Math.random() - 0.5) * (forestSize.depth - 4)
      };
      if (!isInsideBounds(candidate) || !isClearOfPathAndClearing(candidate)) {
        continue;
      }
      const isTooClose = treePositions.some(existing =>
        Math.hypot(existing.x - candidate.x, existing.z - candidate.z) < minTreeSpacing
      );
      if (isTooClose) {
        continue;
      }
      treePositions.push(candidate);
      placed = true;
      break;
    }
    if (!placed) {
      continue;
    }
  }

  treePositions.forEach((pos, index) => {
    const treeGroup = new THREE.Group();

    const treeHeight = 3 + Math.random() * 2;
    const treeType = Math.random();

    if (treeType < 0.6) {
      // Pine tree
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, treeHeight * 0.4, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = treeHeight * 0.2;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Pine layers
      for (let layer = 0; layer < 3; layer++) {
        const layerSize = 1.2 - layer * 0.3;
        const layerHeight = treeHeight * 0.3 + layer * treeHeight * 0.2;
        const coneGeo = new THREE.ConeGeometry(layerSize, treeHeight * 0.35, 8);
        const cone = new THREE.Mesh(coneGeo, layer % 2 === 0 ? leafMat : darkLeafMat);
        cone.position.y = layerHeight;
        cone.castShadow = true;
        treeGroup.add(cone);
      }
    } else {
      // Round tree
      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, treeHeight * 0.5, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = treeHeight * 0.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage
      const foliageGeo = new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 8);
      const foliage = new THREE.Mesh(foliageGeo, Math.random() > 0.5 ? leafMat : darkLeafMat);
      foliage.position.y = treeHeight * 0.6;
      foliage.scale.y = 0.8;
      foliage.castShadow = true;
      treeGroup.add(foliage);
    }

    treeGroup.position.set(pos.x, 0, pos.z);
    treeGroup.userData = { isTree: true, radius: 0.5 };
    scene.add(treeGroup);
    forestTrees.push(treeGroup);

    // Add collision for tree trunk
    collisionManager.addStaticBox(pos.x, pos.z, 0.6, 0.6);
  });

  // Add some bushes
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 });
  for (let i = 0; i < 15; i++) {
    const x = forestCenter.x + (Math.random() - 0.5) * (forestSize.width - 2);
    const z = forestCenter.z + (Math.random() - 0.5) * (forestSize.depth - 2);

    const bushGroup = new THREE.Group();
    const bushCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < bushCount; j++) {
      const bushGeo = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 6);
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(
        (Math.random() - 0.5) * 0.4,
        0.2,
        (Math.random() - 0.5) * 0.4
      );
      bush.scale.y = 0.7;
      bush.castShadow = true;
      bushGroup.add(bush);
    }
    bushGroup.position.set(x, 0, z);
    forestGroup.add(bushGroup);
  }

  scene.add(forestGroup);
  return forestGroup;
}

/**
 * Create foxes in the forest
 */
export function createFoxes() {
  const foxCount = 3;

  for (let i = 0; i < foxCount; i++) {
    const fox = new THREE.Group();

    // Materials
    const furMat = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.9 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.9 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.35, 12, 10);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.scale.set(1.4, 0.9, 1);
    body.position.y = 0.35;
    body.castShadow = true;
    fox.add(body);

    // Chest (white)
    const chestGeo = new THREE.SphereGeometry(0.2, 10, 8);
    const chest = new THREE.Mesh(chestGeo, whiteMat);
    chest.position.set(0.25, 0.3, 0);
    fox.add(chest);

    // Head
    const headGeo = new THREE.SphereGeometry(0.22, 12, 10);
    const head = new THREE.Mesh(headGeo, furMat);
    head.position.set(0.5, 0.5, 0);
    head.castShadow = true;
    fox.add(head);

    // Snout
    const snoutGeo = new THREE.ConeGeometry(0.1, 0.25, 8);
    const snout = new THREE.Mesh(snoutGeo, furMat);
    snout.position.set(0.7, 0.45, 0);
    snout.rotation.z = -Math.PI / 2;
    fox.add(snout);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nose = new THREE.Mesh(noseGeo, blackMat);
    nose.position.set(0.82, 0.45, 0);
    fox.add(nose);

    // Eyes
    [-0.08, 0.08].forEach(zOffset => {
      const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, blackMat);
      eye.position.set(0.62, 0.55, zOffset);
      fox.add(eye);
    });

    // Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.18, 4);
    [-0.1, 0.1].forEach(zOffset => {
      const ear = new THREE.Mesh(earGeo, furMat);
      ear.position.set(0.45, 0.72, zOffset);
      ear.rotation.x = zOffset > 0 ? -0.2 : 0.2;
      fox.add(ear);
    });

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6);
    const legPositions = [
      { x: 0.2, z: 0.12 }, { x: 0.2, z: -0.12 },
      { x: -0.25, z: 0.12 }, { x: -0.25, z: -0.12 }
    ];
    const legs = [];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, blackMat);
      leg.position.set(pos.x, 0.12, pos.z);
      fox.add(leg);
      legs.push(leg);
    });

    // Fluffy tail
    const tailGroup = new THREE.Group();
    const tailGeo = new THREE.ConeGeometry(0.15, 0.6, 8);
    const tail = new THREE.Mesh(tailGeo, furMat);
    tail.rotation.z = Math.PI / 3;
    tailGroup.add(tail);

    const tailTipGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const tailTip = new THREE.Mesh(tailTipGeo, whiteMat);
    tailTip.position.set(-0.25, 0.15, 0);
    tailGroup.add(tailTip);

    tailGroup.position.set(-0.4, 0.4, 0);
    fox.add(tailGroup);

    // Position in forest
    const forestCenter = { x: 15, z: -45 };
    fox.position.set(
      forestCenter.x + (Math.random() - 0.5) * 20,
      0,
      forestCenter.z + (Math.random() - 0.5) * 15
    );
    fox.rotation.y = Math.random() * Math.PI * 2;

    fox.userData = {
      baseY: 0,
      walkAngle: fox.rotation.y,
      walkSpeed: 0.3 + Math.random() * 0.2,
      timer: Math.random() * 5,
      legs,
      tailGroup,
      isFox: true
    };

    scene.add(fox);
    foxes.push(fox);
  }
}

/**
 * Create birds flying around the forest
 */
export function createBirds() {
  const birdCount = 8;
  const birdColors = [0x4169e1, 0xff6347, 0xffd700, 0x32cd32, 0xff69b4];

  for (let i = 0; i < birdCount; i++) {
    const bird = new THREE.Group();
    const birdColor = birdColors[Math.floor(Math.random() * birdColors.length)];
    const birdMat = new THREE.MeshStandardMaterial({ color: birdColor });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.12, 10, 8);
    const body = new THREE.Mesh(bodyGeo, birdMat);
    body.scale.set(1.3, 1, 1);
    bird.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.08, 10, 8);
    const head = new THREE.Mesh(headGeo, birdMat);
    head.position.set(0.12, 0.05, 0);
    bird.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
    const beak = new THREE.Mesh(beakGeo, new THREE.MeshStandardMaterial({ color: 0xffa500 }));
    beak.position.set(0.22, 0.05, 0);
    beak.rotation.z = -Math.PI / 2;
    bird.add(beak);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(0.15, 0.08, 0.05);
    bird.add(eye);

    // Wings
    const wingGeo = new THREE.PlaneGeometry(0.25, 0.1);
    const wingMat = new THREE.MeshStandardMaterial({ color: birdColor, side: THREE.DoubleSide });

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0, 0, 0.1);
    leftWing.rotation.x = Math.PI / 4;
    bird.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0, 0, -0.1);
    rightWing.rotation.x = -Math.PI / 4;
    bird.add(rightWing);

    // Tail
    const tailGeo = new THREE.PlaneGeometry(0.15, 0.06);
    const tail = new THREE.Mesh(tailGeo, wingMat);
    tail.position.set(-0.18, 0, 0);
    tail.rotation.y = Math.PI / 2;
    bird.add(tail);

    // Position above forest
    const forestCenter = { x: 15, z: -45 };
    bird.position.set(
      forestCenter.x + (Math.random() - 0.5) * 35,
      4 + Math.random() * 4,
      forestCenter.z + (Math.random() - 0.5) * 25
    );

    bird.userData = {
      baseY: bird.position.y,
      baseX: bird.position.x,
      baseZ: bird.position.z,
      flyRadius: 5 + Math.random() * 10,
      flySpeed: 0.5 + Math.random() * 0.5,
      flyAngle: Math.random() * Math.PI * 2,
      bobSpeed: 2 + Math.random(),
      leftWing,
      rightWing,
      isBird: true
    };

    scene.add(bird);
    birds.push(bird);
  }
}

/**
 * Update foxes animation
 */
export function updateFoxes(time, delta) {
  foxes.forEach(fox => {
    const data = fox.userData;

    // Random direction changes
    data.timer -= delta;
    if (data.timer <= 0) {
      data.walkAngle += (Math.random() - 0.5) * Math.PI * 0.5;
      data.timer = 2 + Math.random() * 4;
    }

    // Movement within forest bounds
    const speed = data.walkSpeed * delta;
    const newX = fox.position.x + Math.sin(data.walkAngle) * speed;
    const newZ = fox.position.z + Math.cos(data.walkAngle) * speed;

    // Keep within forest bounds
    if (forestBounds) {
      if (newX > forestBounds.minX + 2 && newX < forestBounds.maxX - 2) {
        fox.position.x = newX;
      } else {
        data.walkAngle = Math.PI - data.walkAngle;
      }
      if (newZ > forestBounds.minZ + 2 && newZ < forestBounds.maxZ - 2) {
        fox.position.z = newZ;
      } else {
        data.walkAngle = -data.walkAngle;
      }
    }

    // Face movement direction
    fox.rotation.y = THREE.MathUtils.lerp(fox.rotation.y, data.walkAngle, 0.1);

    // Leg animation
    data.legs.forEach((leg, index) => {
      const phase = index < 2 ? 0 : Math.PI;
      leg.rotation.x = Math.sin(time * 8 + phase) * 0.3;
    });

    // Tail wag
    if (data.tailGroup) {
      data.tailGroup.rotation.y = Math.sin(time * 4) * 0.3;
    }

    // Small bob
    fox.position.y = data.baseY + Math.abs(Math.sin(time * 6)) * 0.03;
  });
}

/**
 * Update birds animation
 */
export function updateBirds(time, delta) {
  birds.forEach(bird => {
    const data = bird.userData;

    // Circular flying pattern
    data.flyAngle += data.flySpeed * delta;
    bird.position.x = data.baseX + Math.cos(data.flyAngle) * data.flyRadius;
    bird.position.z = data.baseZ + Math.sin(data.flyAngle) * data.flyRadius;

    // Bobbing height
    bird.position.y = data.baseY + Math.sin(time * data.bobSpeed) * 0.5;

    // Face direction of flight
    bird.rotation.y = data.flyAngle + Math.PI / 2;

    // Wing flapping
    if (data.leftWing && data.rightWing) {
      const flapAngle = Math.sin(time * 15) * 0.5;
      data.leftWing.rotation.x = Math.PI / 4 + flapAngle;
      data.rightWing.rotation.x = -Math.PI / 4 - flapAngle;
    }
  });
}

// ============================================
// BRIDGE TROLL
// ============================================

export let bridgeTroll = null;
export const BRIDGE_TROLL_DIALOGUES = [
  "Halt! Who goes- *cough* *cough* ...sorry, my voice isn't what it used to be...",
  "Back in MY day, I'd charge THREE riddles! Now I can't even remember one...",
  "You shall not- oh, who am I kidding, my knees hurt too much to stop you...",
  "I'm supposed to be terrifying, but honestly, would you like a biscuit? I baked too many...",
  "NONE SHALL PASS! ...unless you want to, I guess. I'm too old for this...",
  "I used to make brave knights tremble! Now I tremble going down stairs...",
  "Pay the toll or face my- *yawn* ...sorry, it's past my bedtime...",
  "You dare cross MY bridge?! ...Actually, it's quite nice to have visitors...",
  "I'm a fearsome bridge troll! Well, I was. Now I'm more of a... bridge-adjacent pensioner."
];

export const BRIDGE_TROLL_RIDDLES = [
  {
    riddle: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?",
    options: ["A ghost", "An echo", "The wind itself", "A whisper"],
    correct: 1,
    hint: "Think about sound bouncing back..."
  },
  {
    riddle: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    options: ["A piano", "A keyboard", "A map", "A book"],
    correct: 1,
    hint: "You're probably using one right now!"
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    options: ["Footsteps", "Time", "Memories", "Shadows"],
    correct: 0,
    hint: "Every time you move, you create these..."
  },
  {
    riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    options: ["A painting", "A map", "A dream", "A photograph"],
    correct: 1,
    hint: "You'd use this to find your way..."
  },
  {
    riddle: "What can travel around the world while staying in a corner?",
    options: ["A spider", "A stamp", "Dust", "A thought"],
    correct: 1,
    hint: "It helps letters reach their destination..."
  },
  {
    riddle: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    options: ["A tree", "A candle", "A person", "A pencil"],
    correct: 1,
    hint: "As I burn, I get shorter..."
  }
];

/**
 * Create the bridge troll character
 */
export function createBridgeTroll() {
  const troll = new THREE.Group();

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x7b8b6f, roughness: 0.9 });
  const darkSkinMat = new THREE.MeshStandardMaterial({ color: 0x5a6b4f, roughness: 0.9 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xd3d3d3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.2 });

  // Body (hunched and round)
  const bodyGeo = new THREE.SphereGeometry(0.6, 12, 12);
  const body = new THREE.Mesh(bodyGeo, clothMat);
  body.position.y = 0.8;
  body.scale.set(1.2, 0.9, 1);
  body.castShadow = true;
  troll.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.4, 12, 12);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0.1, 1.5, 0);
  head.scale.set(1.1, 0.9, 1);
  head.castShadow = true;
  troll.add(head);

  // Big nose
  const noseGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const nose = new THREE.Mesh(noseGeo, darkSkinMat);
  nose.position.set(0.5, 1.45, 0);
  nose.scale.set(1.5, 1, 1);
  troll.add(nose);

  // Warty bumps on nose
  for (let i = 0; i < 3; i++) {
    const wartGeo = new THREE.SphereGeometry(0.03, 6, 6);
    const wart = new THREE.Mesh(wartGeo, darkSkinMat);
    wart.position.set(
      0.6 + Math.random() * 0.1,
      1.4 + Math.random() * 0.15,
      (Math.random() - 0.5) * 0.1
    );
    troll.add(wart);
  }

  // Eyes (tired looking)
  [-0.12, 0.12].forEach(zOffset => {
    // Eye socket
    const socketGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const socket = new THREE.Mesh(socketGeo, darkSkinMat);
    socket.position.set(0.35, 1.55, zOffset);
    socket.scale.set(1.2, 0.8, 1);
    troll.add(socket);

    // Eye
    const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0.4, 1.55, zOffset);
    troll.add(eye);

    // Pupil
    const pupilGeo = new THREE.SphereGeometry(0.03, 6, 6);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(0.45, 1.55, zOffset);
    troll.add(pupil);

    // Droopy eyelid
    const lidGeo = new THREE.SphereGeometry(0.08, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const lid = new THREE.Mesh(lidGeo, skinMat);
    lid.position.set(0.38, 1.58, zOffset);
    lid.rotation.x = Math.PI;
    troll.add(lid);
  });

  // Big ears
  const earGeo = new THREE.SphereGeometry(0.15, 8, 8);
  [-0.35, 0.35].forEach(zOffset => {
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(0, 1.5, zOffset);
    ear.scale.set(0.5, 1.2, 1);
    troll.add(ear);
  });

  // Scraggly hair (grey/white)
  for (let i = 0; i < 8; i++) {
    const hairGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.2 + Math.random() * 0.15, 4);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    const angle = (i / 8) * Math.PI - Math.PI / 2;
    hair.position.set(
      -0.1 + Math.cos(angle) * 0.25,
      1.8,
      Math.sin(angle) * 0.2
    );
    hair.rotation.z = (Math.random() - 0.5) * 0.5;
    hair.rotation.x = (Math.random() - 0.5) * 0.3;
    troll.add(hair);
  }

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
  [-0.5, 0.5].forEach(zOffset => {
    const arm = new THREE.Mesh(armGeo, skinMat);
    arm.position.set(0.1, 0.8, zOffset);
    arm.rotation.x = Math.PI / 2;
    arm.rotation.z = zOffset > 0 ? 0.3 : -0.3;
    arm.castShadow = true;
    troll.add(arm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.set(0.1, 0.8, zOffset > 0 ? 0.8 : -0.8);
    troll.add(hand);
  });

  // Legs (short and stumpy)
  const legGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.4, 8);
  const legs = [];
  [-0.25, 0.25].forEach(zOffset => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(-0.1, 0.2, zOffset);
    leg.castShadow = true;
    troll.add(leg);
    legs.push(leg);

    // Foot
    const footGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const foot = new THREE.Mesh(footGeo, skinMat);
    foot.position.set(0, 0.05, zOffset);
    foot.scale.set(1.3, 0.6, 1);
    troll.add(foot);
  });

  // Walking stick
  const stickGeo = new THREE.CylinderGeometry(0.03, 0.04, 1.5, 6);
  const stickMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
  const stick = new THREE.Mesh(stickGeo, stickMat);
  stick.position.set(0.3, 0.75, 0.7);
  stick.rotation.z = 0.2;
  troll.add(stick);

  // Indicator sphere (like other NPCs)
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0x9370db,
    emissive: 0x9370db,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.9
  });
  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    indicatorMat
  );
  indicator.position.y = 2.3;
  indicator.userData.isIndicator = true;
  troll.add(indicator);

  // Position next to the main bridge
  troll.position.set(3, 0, -28);
  troll.rotation.y = Math.PI / 2;

  troll.userData = {
    name: 'Grumbold the Bridge Troll',
    role: 'Retired Bridge Guardian',
    quotes: BRIDGE_TROLL_DIALOGUES,
    riddles: BRIDGE_TROLL_RIDDLES,
    isTroll: true,
    indicator,
    legs,
    dialogueIndex: 0,
    lastInteraction: 0,
    solvedRiddles: new Set(), // Track which riddles have been solved
    currentRiddle: null, // Currently active riddle
    riddlesOffered: 0 // How many times player has been offered a riddle
  };

  scene.add(troll);
  bridgeTroll = troll;

  return troll;
}

/**
 * Update bridge troll animation
 */
export function updateBridgeTroll(time) {
  if (!bridgeTroll) return;

  const data = bridgeTroll.userData;

  // Indicator bob
  if (data.indicator) {
    data.indicator.position.y = 2.3 + Math.sin(time * 2) * 0.1;
  }

  // Subtle idle animation (swaying)
  bridgeTroll.rotation.z = Math.sin(time * 0.5) * 0.02;
  bridgeTroll.position.y = Math.sin(time * 0.8) * 0.02;
}

// Fishing Dock configuration
export const FISHING_DOCK_POS = { x: -25, z: -23 };
export let fishingDock = null;

/**
 * Create the fishing dock structure
 */
export function createFishingDock() {
  const group = new THREE.Group();

  // Wooden dock material
  const dockMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });

  // Main platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.3, 4),
    dockMat
  );
  platform.position.set(0, 0.5, 0);
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  // Support poles
  const polePositions = [[-3.5, -1.5], [-3.5, 1.5], [3.5, -1.5], [3.5, 1.5]];
  polePositions.forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
      dockMat
    );
    pole.position.set(x, -0.1, z);
    pole.castShadow = true;
    group.add(pole);
  });

  // Railing
  const railMat = new THREE.MeshStandardMaterial({ color: 0x6b5a45 });
  [[-4, 0], [4, 0]].forEach(([x]) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6),
      railMat
    );
    post.position.set(x, 1.1, -1.8);
    post.castShadow = true;
    group.add(post);
  });

  // Top rail
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 8.5, 6),
    railMat
  );
  rail.position.set(0, 1.6, -1.8);
  rail.rotation.z = Math.PI / 2;
  group.add(rail);

  // "FISHING DOCK" sign
  const signGroup = new THREE.Group();

  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signPost.position.y = 1.5;
  signPost.castShadow = true;
  signGroup.add(signPost);

  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xfff8dc })
  );
  signBoard.position.y = 2.8;
  signBoard.castShadow = true;
  signGroup.add(signBoard);

  // Sign text
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 350;
  signCanvas.height = 80;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#8b4513';
  signCtx.fillRect(0, 0, 350, 80);
  signCtx.strokeStyle = '#654321';
  signCtx.lineWidth = 4;
  signCtx.strokeRect(4, 4, 342, 72);
  signCtx.fillStyle = '#f5f5dc';
  signCtx.font = 'bold 36px Georgia';
  signCtx.textAlign = 'center';
  signCtx.textBaseline = 'middle';
  signCtx.fillText('AUSTINVILLE FISHING DOCK', 175, 40);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(3.5, 0.8, 1);
  signSprite.position.y = 2.8;
  signSprite.position.z = 0.06;
  signGroup.add(signSprite);

  signGroup.position.set(0, 0, -1.5);
  group.add(signGroup);

  // Bucket with "catches"
  const bucketMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8),
    bucketMat
  );
  bucket.position.set(2, 0.85, 0.5);
  bucket.castShadow = true;
  group.add(bucket);

  // Fishing rod leaning against railing
  const rodGroup = new THREE.Group();
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 1.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  rodGroup.add(rod);

  const rodTip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.5, 4),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  rodTip.position.y = 1.1;
  rodGroup.add(rodTip);

  rodGroup.position.set(-3, 1.1, -1.2);
  rodGroup.rotation.x = 0.3;
  rodGroup.rotation.z = 0.2;
  group.add(rodGroup);

  // Tackle box
  const tackleBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.25, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  tackleBox.position.set(-2, 0.78, 0.8);
  tackleBox.castShadow = true;
  group.add(tackleBox);

  // Position the dock
  group.position.set(FISHING_DOCK_POS.x, 0, FISHING_DOCK_POS.z);
  group.rotation.y = -Math.PI / 6; // Angle toward river

  group.userData = {
    type: 'fishingDock',
    name: 'Austinville Fishing Dock'
  };

  scene.add(group);
  fishingDock = group;

  return group;
}
