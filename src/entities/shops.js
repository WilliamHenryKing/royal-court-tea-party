// Austinville Shops - Tea Café, Coffee Café, Donut Shop, Pinkie School
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { collisionBoxes } from './world.js';

// Store references
export let teaCafe = null;
export let coffeeCafe = null;
export let donutShop = null;
export let pinkieSchool = null;

// Building configurations
export const SHOP_POSITIONS = {
  teaCafe: { x: 18, z: 8, name: "The Gilded Teacup" },
  coffeeCafe: { x: 18, z: -12, name: "The Bitter Bean" },
  donutShop: { x: 8, z: -25, name: "Glazed & Confused" },
  pinkieSchool: { x: -18, z: 12, name: "Madame Pinkie's Academy" }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mini teacup decoration
 */
function createMiniTeacup() {
  const group = new THREE.Group();

  const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const teaMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });

  // Cup body
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.12, 0.2, 12),
    cupMat
  );
  cup.position.y = 0.1;
  group.add(cup);

  // Tea inside
  const tea = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.05, 12),
    teaMat
  );
  tea.position.y = 0.18;
  group.add(tea);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.06, 0.02, 6, 12, Math.PI),
    cupMat
  );
  handle.position.set(0.17, 0.1, 0);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  return group;
}

/**
 * Create a giant teacup decoration
 */
function createGiantTeacup() {
  const group = new THREE.Group();

  const cupMat = new THREE.MeshStandardMaterial({ color: 0xfff0f5 });
  const teaMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });

  // Cup body
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.6, 0.8, 16),
    cupMat
  );
  cup.position.y = 0.4;
  group.add(cup);

  // Gold rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.05, 8, 24),
    trimMat
  );
  rim.position.y = 0.8;
  rim.rotation.x = Math.PI / 2;
  group.add(rim);

  // Tea inside
  const tea = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.1, 16),
    teaMat
  );
  tea.position.y = 0.75;
  group.add(tea);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI),
    cupMat
  );
  handle.position.set(0.95, 0.4, 0);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  // Saucer
  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.2, 0.1, 16),
    cupMat
  );
  saucer.position.y = -0.05;
  group.add(saucer);

  return group;
}

/**
 * Create a café table
 */
function createCafeTable() {
  const group = new THREE.Group();

  // Table top
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  top.position.y = 0.75;
  top.castShadow = true;
  group.add(top);

  // Pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  pedestal.position.y = 0.35;
  group.add(pedestal);

  // Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  base.position.y = 0.025;
  group.add(base);

  // Teacup on table
  const teacup = createMiniTeacup();
  teacup.position.set(0.2, 0.8, 0.1);
  teacup.scale.setScalar(0.4);
  group.add(teacup);

  // Small vase with flower
  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xff69b4 })
  );
  vase.position.set(-0.15, 0.85, -0.1);
  group.add(vase);

  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  flower.position.set(-0.15, 1, -0.1);
  group.add(flower);

  return group;
}

/**
 * Create a café chair
 */
function createCafeChair() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xff9eb5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  // Seat
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.08, 0.45),
    mat
  );
  seat.position.y = 0.45;
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.5, 0.08),
    mat
  );
  back.position.set(0, 0.7, -0.2);
  back.castShadow = true;
  group.add(back);

  // Legs
  [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6),
      metalMat
    );
    leg.position.set(x, 0.225, z);
    group.add(leg);
  });

  return group;
}

/**
 * Create a decorative fence section
 */
function createDecorativeFence(start, end) {
  const group = new THREE.Group();
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
  );
  const angle = Math.atan2(end.z - start.z, end.x - start.x);
  const posts = Math.ceil(length / 1.5);

  for (let i = 0; i <= posts; i++) {
    const t = i / posts;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6),
      fenceMat
    );
    post.position.set(
      THREE.MathUtils.lerp(start.x, end.x, t),
      0.4,
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
    post.castShadow = true;
    group.add(post);

    // Decorative ball on top
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      fenceMat
    );
    ball.position.set(
      THREE.MathUtils.lerp(start.x, end.x, t),
      0.85,
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
    group.add(ball);
  }

  // Horizontal rails
  [0.3, 0.6].forEach(height => {
    const rail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, length, 6),
      fenceMat
    );
    rail.position.set(
      (start.x + end.x) / 2,
      height,
      (start.z + end.z) / 2
    );
    rail.rotation.z = Math.PI / 2;
    rail.rotation.y = -angle;
    group.add(rail);
  });

  return group;
}

// ============================================
// TEA CAFÉ - "The Gilded Teacup"
// ============================================

export function createTeaCafe() {
  const group = new THREE.Group();
  const pos = SHOP_POSITIONS.teaCafe;

  // Materials
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xfff0e6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  // Base structure
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3.5, 5),
    buildingMat
  );
  base.position.y = 1.75;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Cute peaked roof
  const roofGeo = new THREE.ConeGeometry(4.5, 2, 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 4.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  // Chimney with steam
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.5, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xb35a1f })
  );
  chimney.position.set(1.5, 5, 0);
  chimney.castShadow = true;
  group.add(chimney);

  // Awning over entrance
  const awningGeo = new THREE.BoxGeometry(4, 0.15, 2);
  const awning = new THREE.Mesh(
    awningGeo,
    new THREE.MeshStandardMaterial({ color: 0xff9eb5 })
  );
  awning.position.set(0, 2.8, 3);
  awning.rotation.x = 0.15;
  awning.castShadow = true;
  group.add(awning);

  // Striped awning detail
  const stripeCanvas = document.createElement('canvas');
  stripeCanvas.width = 64;
  stripeCanvas.height = 32;
  const stripeCtx = stripeCanvas.getContext('2d');
  for (let i = 0; i < 8; i++) {
    stripeCtx.fillStyle = i % 2 === 0 ? '#ff9eb5' : '#ffffff';
    stripeCtx.fillRect(i * 8, 0, 8, 32);
  }
  const stripeTexture = new THREE.CanvasTexture(stripeCanvas);
  const stripeMat = new THREE.MeshBasicMaterial({ map: stripeTexture, side: THREE.DoubleSide });
  const awningFront = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 1.5),
    stripeMat
  );
  awningFront.position.set(0, 2.1, 3.9);
  awningFront.rotation.x = Math.PI / 2 + 0.3;
  group.add(awningFront);

  // Windows with flower boxes
  [-1.5, 1.5].forEach(x => {
    // Window frame
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.1),
      trimMat
    );
    windowFrame.position.set(x, 2, 2.55);
    group.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5 })
    );
    windowGlass.position.set(x, 2, 2.56);
    group.add(windowGlass);

    // Flower box
    const flowerBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    flowerBox.position.set(x, 1.2, 2.7);
    group.add(flowerBox);

    // Flowers in box
    const flowerColors = [0xff69b4, 0xff6347, 0xffd700];
    for (let i = 0; i < 5; i++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: flowerColors[i % 3] })
      );
      flower.position.set(x - 0.5 + i * 0.25, 1.45, 2.7);
      group.add(flower);
    }
  });

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  door.position.set(0, 1.1, 2.55);
  group.add(door);

  // Sign board
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xfff8dc })
  );
  signBoard.position.set(0, 3.8, 2.55);
  signBoard.castShadow = true;
  group.add(signBoard);

  // Sign text
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 300;
  signCanvas.height = 80;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#fff8dc';
  signCtx.fillRect(0, 0, 300, 80);
  signCtx.fillStyle = '#654321';
  signCtx.font = 'italic bold 28px Georgia';
  signCtx.textAlign = 'center';
  signCtx.fillText('The Gilded Teacup', 150, 50);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(3, 0.8, 1);
  signSprite.position.set(0, 3.8, 2.62);
  group.add(signSprite);

  // === OUTDOOR SEATING AREA ===
  const tablePositions = [
    { x: -2, z: 5 },
    { x: 2, z: 5 },
    { x: -2, z: 7 },
    { x: 2, z: 7 }
  ];

  tablePositions.forEach((tPos) => {
    const table = createCafeTable();
    table.position.set(tPos.x, 0, tPos.z);
    group.add(table);

    // Add chairs around table
    const chairOffsets = [
      { x: 0.8, z: 0, rot: -Math.PI / 2 },
      { x: -0.8, z: 0, rot: Math.PI / 2 },
      { x: 0, z: 0.8, rot: Math.PI },
      { x: 0, z: -0.8, rot: 0 }
    ];

    chairOffsets.forEach(offset => {
      const chair = createCafeChair();
      chair.position.set(tPos.x + offset.x, 0, tPos.z + offset.z);
      chair.rotation.y = offset.rot;
      group.add(chair);
    });
  });

  // Decorative fence around seating
  const fencePositions = [
    { start: { x: -4, z: 4 }, end: { x: -4, z: 9 } },
    { start: { x: 4, z: 4 }, end: { x: 4, z: 9 } },
    { start: { x: -4, z: 9 }, end: { x: 4, z: 9 } }
  ];

  fencePositions.forEach(fence => {
    const fenceGroup = createDecorativeFence(fence.start, fence.end);
    group.add(fenceGroup);
  });

  // Giant teacup decoration on roof
  const giantCup = createGiantTeacup();
  giantCup.position.set(0, 5.5, 0);
  giantCup.scale.setScalar(0.8);
  group.add(giantCup);

  group.position.set(pos.x, 0, pos.z);
  group.userData = {
    type: 'teaCafe',
    name: pos.name,
    faction: 'tea'
  };

  scene.add(group);
  teaCafe = group;

  // Add collision box
  collisionBoxes.push({
    minX: pos.x - 4,
    maxX: pos.x + 4,
    minZ: pos.z - 3,
    maxZ: pos.z + 10
  });

  return group;
}

// ============================================
// COFFEE CAFÉ - "The Bitter Bean" (Tea's Rival!)
// ============================================

/**
 * Create a giant coffee cup
 */
function createGiantCoffeeCup() {
  const group = new THREE.Group();

  // Cup body (taller, more cylindrical than teacup)
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.5, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
  );
  cup.position.y = 0.6;
  group.add(cup);

  // Coffee inside
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2314 })
  );
  coffee.position.y = 1.15;
  group.add(coffee);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.08, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
  );
  handle.position.set(0.75, 0.6, 0);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = Math.PI / 2;
  group.add(handle);

  return group;
}

export function createCoffeeCafe() {
  const group = new THREE.Group();
  const pos = SHOP_POSITIONS.coffeeCafe;

  // Darker, more "edgy" aesthetic
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 }); // Dark brown
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); // Almost black
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });

  // Main building - slightly more angular/modern
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 4, 5),
    buildingMat
  );
  base.position.y = 2;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Flat modern roof with slight angle
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.3, 5.5),
    roofMat
  );
  roof.position.y = 4.2;
  roof.rotation.z = 0.05;
  roof.castShadow = true;
  group.add(roof);

  // Neon-style sign (glowing)
  const neonSign = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff4500,
      emissiveIntensity: 0.5
    })
  );
  neonSign.position.set(0, 3.5, 2.6);
  group.add(neonSign);

  // Sign text
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#ff4500';
  signCtx.fillRect(0, 0, 256, 64);
  signCtx.fillStyle = '#ffffff';
  signCtx.font = 'bold 32px Impact';
  signCtx.textAlign = 'center';
  signCtx.fillText('THE BITTER BEAN', 128, 42);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(4, 1, 1);
  signSprite.position.set(0, 3.5, 2.75);
  group.add(signSprite);

  // Giant coffee cup on roof
  const giantCoffee = createGiantCoffeeCup();
  giantCoffee.position.set(0, 5, 0);
  giantCoffee.scale.setScalar(0.9);
  group.add(giantCoffee);

  // War banner pole
  const bannerPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  bannerPole.position.set(3, 5.5, 0);
  bannerPole.castShadow = true;
  group.add(bannerPole);

  // War banner
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 128;
  bannerCanvas.height = 64;
  const bannerCtx = bannerCanvas.getContext('2d');
  bannerCtx.fillStyle = '#ff4500';
  bannerCtx.fillRect(0, 0, 128, 64);
  bannerCtx.fillStyle = '#ffffff';
  bannerCtx.font = 'bold 18px Arial';
  bannerCtx.textAlign = 'center';
  bannerCtx.fillText('COFFEE', 64, 25);
  bannerCtx.fillText('> TEA', 64, 48);

  const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1),
    new THREE.MeshStandardMaterial({
      map: bannerTexture,
      side: THREE.DoubleSide
    })
  );
  banner.position.set(3.8, 6.2, 0);
  group.add(banner);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  door.position.set(0, 1.2, 2.55);
  group.add(door);

  // Windows (larger, modern)
  [-1.8, 1.8].forEach(x => {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.8),
      new THREE.MeshStandardMaterial({
        color: 0x3d2314,
        transparent: true,
        opacity: 0.6
      })
    );
    window.position.set(x, 2.5, 2.56);
    group.add(window);
  });

  group.position.set(pos.x, 0, pos.z);
  group.userData = {
    type: 'coffeeCafe',
    name: pos.name,
    faction: 'coffee'
  };

  scene.add(group);
  coffeeCafe = group;

  // Add collision box
  collisionBoxes.push({
    minX: pos.x - 3.5,
    maxX: pos.x + 3.5,
    minZ: pos.z - 3,
    maxZ: pos.z + 3
  });

  return group;
}

// ============================================
// DONUT SHOP - "Glazed & Confused"
// ============================================

export function createDonutShop() {
  const group = new THREE.Group();
  const pos = SHOP_POSITIONS.donutShop;

  // Building - round to match donuts!
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4.5, 4, 16),
    buildingMat
  );
  body.position.y = 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Roof shaped like a donut!
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const glazeMat = new THREE.MeshStandardMaterial({
    color: 0xff69b4,
    roughness: 0.3
  });

  // Donut torus
  const donutRoof = new THREE.Mesh(
    new THREE.TorusGeometry(3, 1.2, 16, 32),
    roofMat
  );
  donutRoof.rotation.x = Math.PI / 2;
  donutRoof.position.y = 5;
  donutRoof.castShadow = true;
  group.add(donutRoof);

  // Glaze on top
  const glaze = new THREE.Mesh(
    new THREE.TorusGeometry(3, 1.3, 16, 32, Math.PI),
    glazeMat
  );
  glaze.rotation.x = Math.PI / 2;
  glaze.position.y = 5.3;
  group.add(glaze);

  // Sprinkles!
  const sprinkleColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff];
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.5 + Math.random() * 1;
    const sprinkle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: sprinkleColors[Math.floor(Math.random() * 5)] })
    );
    sprinkle.position.set(
      Math.cos(angle) * radius,
      5.8,
      Math.sin(angle) * radius
    );
    sprinkle.rotation.x = Math.random() * Math.PI;
    sprinkle.rotation.z = Math.random() * Math.PI;
    group.add(sprinkle);
  }

  // Sign
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 300;
  signCanvas.height = 80;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#fff0f5';
  signCtx.fillRect(0, 0, 300, 80);
  signCtx.strokeStyle = '#8b4513';
  signCtx.lineWidth = 4;
  signCtx.strokeRect(4, 4, 292, 72);
  signCtx.fillStyle = '#8b4513';
  signCtx.font = 'bold 28px Georgia';
  signCtx.textAlign = 'center';
  signCtx.fillText('Glazed & Confused', 150, 50);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(3.5, 0.9, 1);
  signSprite.position.set(0, 3, 4.6);
  group.add(signSprite);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  door.position.set(0, 1.1, 4.45);
  group.add(door);

  // Windows (round, donut-like)
  [Math.PI / 4, -Math.PI / 4, Math.PI * 3 / 4, -Math.PI * 3 / 4].forEach(angle => {
    const window = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0xfff8dc,
        transparent: true,
        opacity: 0.6
      })
    );
    window.position.set(
      Math.sin(angle) * 4.01,
      2.5,
      Math.cos(angle) * 4.01
    );
    window.rotation.y = angle;
    group.add(window);
  });

  group.position.set(pos.x, 0, pos.z);
  group.userData = {
    type: 'donutShop',
    name: pos.name
  };

  scene.add(group);
  donutShop = group;

  // Add collision box
  collisionBoxes.push({
    minX: pos.x - 5,
    maxX: pos.x + 5,
    minZ: pos.z - 5,
    maxZ: pos.z + 5
  });

  return group;
}

// ============================================
// PINKIE SCHOOL - "Madame Pinkie's Academy"
// ============================================

/**
 * Create the giant pinkie hand statue
 */
function createGiantPinkie() {
  const group = new THREE.Group();

  // Hand base
  const handMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });

  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.3, 0.6),
    handMat
  );
  group.add(palm);

  // Curled fingers
  for (let i = 0; i < 4; i++) {
    const finger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6),
      handMat
    );
    finger.position.set(-0.25 + i * 0.15, -0.1, 0.2);
    finger.rotation.x = Math.PI / 3;
    group.add(finger);
  }

  // Extended pinkie (the star!)
  const pinkieBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.5, 6),
    handMat
  );
  pinkieBase.position.set(0.4, 0.15, 0);
  pinkieBase.rotation.z = -Math.PI / 4; // 45 degrees!
  group.add(pinkieBase);

  // Sparkle on pinkie tip
  const sparkle = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.1),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.5
    })
  );
  sparkle.position.set(0.6, 0.4, 0);
  group.add(sparkle);

  return group;
}

export function createPinkieSchool() {
  const group = new THREE.Group();
  const pos = SHOP_POSITIONS.pinkieSchool;

  // Victorian-style building
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xdda0dd }); // Plum
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x4b0082 }); // Indigo

  // Main building
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 5),
    buildingMat
  );
  main.position.y = 2;
  main.castShadow = true;
  main.receiveShadow = true;
  group.add(main);

  // Elaborate roof with dormers
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5, 2.5, 4),
    roofMat
  );
  roof.position.y = 5.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  // Giant pinkie statue on roof
  const pinkieGroup = createGiantPinkie();
  pinkieGroup.position.y = 6.5;
  pinkieGroup.scale.setScalar(1.5);
  group.add(pinkieGroup);

  // Sign with fancy font
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#4b0082';
  signCtx.fillRect(0, 0, 512, 128);
  signCtx.fillStyle = '#ffd700';
  signCtx.font = 'italic 24px Georgia';
  signCtx.textAlign = 'center';
  signCtx.fillText("Madame Pinkie's Academy", 256, 50);
  signCtx.font = '16px Georgia';
  signCtx.fillText('of Proper Tea Etiquette', 256, 80);
  signCtx.font = '12px Georgia';
  signCtx.fillText('Est. 1847 - "Excellence Through Extension"', 256, 105);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(5, 1.2, 1);
  signSprite.position.set(0, 3, 2.6);
  group.add(signSprite);

  // Protractor decoration (for measuring pinkie angle)
  const protractor = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32, 0, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide
    })
  );
  protractor.position.set(2.5, 3.5, 2.52);
  group.add(protractor);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.4, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x4b0082 })
  );
  door.position.set(0, 1.2, 2.55);
  group.add(door);

  // Windows with elegant frames
  [[-2.2, 2.3], [2.2, 2.3], [-2.2, 1], [2.2, 1]].forEach(([x, y]) => {
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x4b0082 })
    );
    windowFrame.position.set(x, y, 2.55);
    group.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.2),
      new THREE.MeshStandardMaterial({
        color: 0xe6e6fa,
        transparent: true,
        opacity: 0.5
      })
    );
    windowGlass.position.set(x, y, 2.56);
    group.add(windowGlass);
  });

  // Decorative columns at entrance
  [-1.5, 1.5].forEach(x => {
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    column.position.set(x, 1.5, 2.8);
    column.castShadow = true;
    group.add(column);

    // Column cap
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.15, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    cap.position.set(x, 3.05, 2.8);
    group.add(cap);
  });

  group.position.set(pos.x, 0, pos.z);
  group.userData = {
    type: 'pinkieSchool',
    name: pos.name
  };

  scene.add(group);
  pinkieSchool = group;

  // Add collision box
  collisionBoxes.push({
    minX: pos.x - 4,
    maxX: pos.x + 4,
    minZ: pos.z - 3,
    maxZ: pos.z + 3
  });

  return group;
}

// ============================================
// CREATE ALL SHOPS
// ============================================

export function createAllShops() {
  createTeaCafe();
  createCoffeeCafe();
  createDonutShop();
  createPinkieSchool();

  return { teaCafe, coffeeCafe, donutShop, pinkieSchool };
}
