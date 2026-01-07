// River - Austinville river system with animated water, bridges, and fish
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';

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
 * Update river water animation
 */
export function updateRiverWater(time) {
  if (!riverWater) return;

  const positions = riverWater.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const originalZ = positions.array[i * 3 + 2]; // Get original z
    const wave = Math.sin(x * 0.2 + time * RIVER_CONFIG.flowSpeed) * 0.1;
    // Only modify Y (which is Z after rotation)
    positions.setZ(i, wave);
  }
  positions.needsUpdate = true;
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
