// Construction Zone - Meta-humor "Under Construction" area in the forest
// The programmer hasn't finished this part yet... or has he?
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { collisionManager, COLLISION_LAYERS } from '../systems/CollisionManager.js';

// Store references for animation
export let constructionSign = null;
export let bulldozer = null;
export let constructionWorkers = [];
export let constructionForeman = null;
export let scaffolding = [];
export let constructionCones = [];
export let todoSigns = [];

// Construction zone configuration
const CONSTRUCTION_CENTER = { x: 15, z: -50 };

// ============================================
// GIANT "UNDER CONSTRUCTION" SIGN
// ============================================

export function createConstructionSign() {
  const group = new THREE.Group();

  // Massive sign posts (two poles)
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.8 });

  [-3, 3].forEach(xOffset => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 12, 8),
      postMat
    );
    post.position.set(xOffset, 6, 0);
    post.castShadow = true;
    group.add(post);
  });

  // Giant sign board (bright yellow construction style)
  const signMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 0.3),
    signMat
  );
  signBoard.position.set(0, 10, 0);
  signBoard.castShadow = true;
  group.add(signBoard);

  // Black border stripes (construction warning style)
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

  // Top and bottom stripes
  [-1.8, 1.8].forEach(yOffset => {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.3, 0.35),
      stripeMat
    );
    stripe.position.set(0, 10 + yOffset, 0);
    group.add(stripe);
  });

  // Diagonal warning stripes
  for (let i = -4; i < 5; i++) {
    const diagonalStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 4.2, 0.32),
      stripeMat
    );
    diagonalStripe.position.set(i * 1.1, 10, 0.02);
    diagonalStripe.rotation.z = Math.PI / 6;
    group.add(diagonalStripe);
  }

  // Main text using canvas texture
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, 0, 1024, 512);

  // Main text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 100px Impact';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚧 UNDER 🚧', 512, 160);
  ctx.fillText('CONSTRUCTION', 512, 290);

  // Smaller subtitle
  ctx.font = 'bold 36px Arial';
  ctx.fillText('Developer still working on this bit...', 512, 400);

  const texture = new THREE.CanvasTexture(canvas);
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 3.5),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
  textPlane.position.set(0, 10, 0.2);
  group.add(textPlane);

  // Back side text (for people walking away)
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 512;
  const backCtx = backCanvas.getContext('2d');
  backCtx.fillStyle = '#ffcc00';
  backCtx.fillRect(0, 0, 1024, 512);
  backCtx.fillStyle = '#000000';
  backCtx.font = 'bold 72px Impact';
  backCtx.textAlign = 'center';
  backCtx.fillText('NOTHING TO SEE HERE', 512, 200);
  backCtx.font = 'bold 48px Arial';
  backCtx.fillText('(seriously, go back)', 512, 320);
  backCtx.font = '32px Arial';
  backCtx.fillText('git commit -m "TODO: finish forest"', 512, 420);

  const backTexture = new THREE.CanvasTexture(backCanvas);
  const backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 3.5),
    new THREE.MeshBasicMaterial({ map: backTexture, transparent: true })
  );
  backPlane.position.set(0, 10, -0.2);
  backPlane.rotation.y = Math.PI;
  group.add(backPlane);

  // Flashing warning lights on top
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff6600,
    emissiveIntensity: 0.8
  });

  [-4, 0, 4].forEach(xOffset => {
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 12, 12),
      lightMat.clone()
    );
    light.position.set(xOffset, 12.5, 0);
    light.userData.isWarningLight = true;
    light.userData.phase = xOffset; // Offset flash timing
    group.add(light);
  });

  group.position.set(CONSTRUCTION_CENTER.x, 0, CONSTRUCTION_CENTER.z + 8);
  scene.add(group);
  constructionSign = group;

  return group;
}

// ============================================
// TINY BULLDOZER (animated)
// ============================================

export function createBulldozer() {
  const group = new THREE.Group();

  // Scale everything tiny and cute
  const scale = 0.4;

  // Body (yellow construction vehicle)
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2 * scale, 0.6 * scale, 0.8 * scale),
    bodyMat
  );
  body.position.y = 0.4 * scale;
  body.castShadow = true;
  group.add(body);

  // Cabin
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.7
  });
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(0.5 * scale, 0.4 * scale, 0.6 * scale),
    cabinMat
  );
  cabin.position.set(-0.1 * scale, 0.8 * scale, 0);
  group.add(cabin);

  // Blade (front)
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.1 * scale, 0.5 * scale, 1 * scale),
    bladeMat
  );
  blade.position.set(0.65 * scale, 0.3 * scale, 0);
  blade.castShadow = true;
  group.add(blade);

  // Tracks (black)
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  [-0.35, 0.35].forEach(zOffset => {
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(1.4 * scale, 0.25 * scale, 0.2 * scale),
      trackMat
    );
    track.position.set(0, 0.15 * scale, zOffset * scale);
    group.add(track);
  });

  // Exhaust pipe with puff
  const exhaustPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.3 * scale, 6),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  exhaustPipe.position.set(-0.4 * scale, 1 * scale, 0.2 * scale);
  group.add(exhaustPipe);

  // Tiny driver (barely visible, just a blob)
  const driverMat = new THREE.MeshStandardMaterial({ color: 0xffa500 });
  const driver = new THREE.Mesh(
    new THREE.SphereGeometry(0.08 * scale, 8, 8),
    driverMat
  );
  driver.position.set(-0.1 * scale, 0.95 * scale, 0);
  group.add(driver);

  // Hard hat
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.05 * scale, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    hatMat
  );
  hat.position.set(-0.1 * scale, 1.02 * scale, 0);
  group.add(hat);

  // Animation data
  group.userData = {
    isBulldozer: true,
    moveDirection: 1,
    moveProgress: 0,
    pathStart: { x: CONSTRUCTION_CENTER.x - 8, z: CONSTRUCTION_CENTER.z - 3 },
    pathEnd: { x: CONSTRUCTION_CENTER.x + 5, z: CONSTRUCTION_CENTER.z - 3 },
    speed: 0.8
  };

  group.position.set(group.userData.pathStart.x, 0, group.userData.pathStart.z);
  group.scale.setScalar(1);

  scene.add(group);
  bulldozer = group;

  return group;
}

// ============================================
// TINY CONSTRUCTION WORKERS (animated)
// ============================================

function createTinyWorker(color = 0xffa500) {
  const group = new THREE.Group();
  const scale = 0.25; // Very tiny!

  // Body (vest)
  const vestMat = new THREE.MeshStandardMaterial({ color: color });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.18 * scale, 0.4 * scale, 8),
    vestMat
  );
  body.position.y = 0.35 * scale;
  body.castShadow = true;
  group.add(body);

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.12 * scale, 8, 8),
    headMat
  );
  head.position.y = 0.65 * scale;
  group.add(head);

  // Hard hat (yellow)
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const hat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.12 * scale, 0.08 * scale, 8),
    hatMat
  );
  hat.position.y = 0.78 * scale;
  group.add(hat);

  // Tiny legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  [-0.05, 0.05].forEach(xOffset => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.2 * scale, 6),
      legMat
    );
    leg.position.set(xOffset * scale, 0.1 * scale, 0);
    leg.userData.isLeg = true;
    group.add(leg);
  });

  return group;
}

function createWorkerWithItem(itemType) {
  const group = new THREE.Group();
  const worker = createTinyWorker();
  group.add(worker);

  const scale = 0.25;

  // Add item being carried
  switch (itemType) {
    case 'plank':
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * scale, 0.05 * scale, 0.15 * scale),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      plank.position.set(0, 0.5 * scale, 0.2 * scale);
      plank.rotation.z = 0.2;
      group.add(plank);
      break;

    case 'brick':
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(0.15 * scale, 0.1 * scale, 0.08 * scale),
        new THREE.MeshStandardMaterial({ color: 0xcc4444 })
      );
      brick.position.set(0.15 * scale, 0.4 * scale, 0.1 * scale);
      group.add(brick);
      break;

    case 'toolbox':
      const toolbox = new THREE.Mesh(
        new THREE.BoxGeometry(0.2 * scale, 0.12 * scale, 0.1 * scale),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      toolbox.position.set(0.18 * scale, 0.25 * scale, 0);
      group.add(toolbox);
      break;

    case 'coffee':
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.025 * scale, 0.08 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      cup.position.set(0.12 * scale, 0.45 * scale, 0.08 * scale);
      group.add(cup);
      break;

    case 'clipboard':
      const clipboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.12 * scale, 0.18 * scale, 0.02 * scale),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      clipboard.position.set(0.1 * scale, 0.4 * scale, 0.1 * scale);
      clipboard.rotation.x = -0.3;
      group.add(clipboard);
      break;
  }

  return group;
}

export function createConstructionWorkers() {
  const workerConfigs = [
    { item: 'plank', path: { start: { x: -5, z: 0 }, end: { x: 5, z: -2 } } },
    { item: 'brick', path: { start: { x: 3, z: 3 }, end: { x: -4, z: 1 } } },
    { item: 'toolbox', path: { start: { x: -6, z: -4 }, end: { x: 2, z: -5 } } },
    { item: 'coffee', path: { start: { x: 0, z: 2 }, end: { x: -3, z: -3 } } },
    { item: 'plank', path: { start: { x: 4, z: -1 }, end: { x: -5, z: 2 } } },
    { item: 'clipboard', path: { start: { x: -2, z: -2 }, end: { x: 4, z: 3 } } },
  ];

  workerConfigs.forEach((config, index) => {
    const worker = createWorkerWithItem(config.item);

    worker.userData = {
      isWorker: true,
      pathStart: {
        x: CONSTRUCTION_CENTER.x + config.path.start.x,
        z: CONSTRUCTION_CENTER.z + config.path.start.z
      },
      pathEnd: {
        x: CONSTRUCTION_CENTER.x + config.path.end.x,
        z: CONSTRUCTION_CENTER.z + config.path.end.z
      },
      progress: Math.random(), // Stagger starting positions
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: 0.3 + Math.random() * 0.3,
      bobOffset: Math.random() * Math.PI * 2
    };

    const startPos = worker.userData.pathStart;
    worker.position.set(startPos.x, 0, startPos.z);

    scene.add(worker);
    constructionWorkers.push(worker);
  });

  return constructionWorkers;
}

// ============================================
// CONSTRUCTION FOREMAN NPC (interactable)
// ============================================

export function createConstructionForeman() {
  const group = new THREE.Group();

  // Bigger than regular workers
  const scale = 0.6;

  // Body (orange safety vest)
  const vestMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.8, 12),
    vestMat
  );
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Reflective stripes
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    emissive: 0xcccccc,
    emissiveIntensity: 0.3
  });
  [-0.15, 0.15].forEach(yOffset => {
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.31, 0.05, 12),
      stripeMat
    );
    stripe.position.y = 0.6 + yOffset;
    group.add(stripe);
  });

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    headMat
  );
  head.position.y = 1.2;
  head.castShadow = true;
  group.add(head);

  // Hard hat (white - foreman!)
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const hatBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.22, 0.12, 12),
    hatMat
  );
  hatBase.position.y = 1.38;
  group.add(hatBase);

  const hatTop = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    hatMat
  );
  hatTop.position.y = 1.42;
  group.add(hatTop);

  // Eyes (tired, seen too much)
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  [-0.08, 0.08].forEach(xOffset => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      eyeMat
    );
    eye.position.set(xOffset, 1.22, 0.18);
    group.add(eye);
  });

  // Mustache (distinguished foreman)
  const mustacheMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
  const mustache = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.03, 0.05),
    mustacheMat
  );
  mustache.position.set(0, 1.12, 0.18);
  group.add(mustache);

  // Clipboard
  const clipboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.35, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  clipboard.position.set(0.35, 0.8, 0.15);
  clipboard.rotation.z = -0.3;
  group.add(clipboard);

  // Paper on clipboard
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.28),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  paper.position.set(0.35, 0.8, 0.17);
  paper.rotation.z = -0.3;
  group.add(paper);

  // Indicator sphere (like other NPCs)
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xffcc00,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.9
  });
  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    indicatorMat
  );
  indicator.position.y = 1.8;
  indicator.userData.isIndicator = true;
  group.add(indicator);

  // Position near the construction sign
  group.position.set(CONSTRUCTION_CENTER.x + 6, 0, CONSTRUCTION_CENTER.z + 5);
  group.rotation.y = -Math.PI / 3;

  group.userData = {
    name: 'Foreman Frank',
    role: 'Site Manager & Professional Apologizer',
    isForeman: true,
    indicator,
    quotes: [
      "Sorry about the mess! The developer said he'd finish this 'next sprint'... 47 sprints ago.",
      "We've been 'almost done' since the initial commit. Very promising!",
      "*checks clipboard* Ah yes, Task #4,721: 'Add actual content here'. Still pending.",
      "The trees? Oh, those are placeholder assets. Very... minimalist, right?",
      "Budget cuts. We had to fire the texture artists. Now it's just me and Dave.",
      "I've filed 238 bug reports about this area. All marked 'Won't Fix'.",
      "The good news? We're ahead of schedule! The bad news? The schedule is fictional.",
      "Between you and me, I think the developer forgot this file exists.",
      "That bulldozer? It's been moving dirt in circles for 3 months. Very productive.",
      "We were promised 'polish pass' in version 1.0. We're on version 47.",
      "The foxes keep asking when their AI will be finished. I just sigh.",
      "According to the roadmap, this should have been done... *squints* ...last year.",
      "Our TODO list has TODOs inside the TODOs. It's TODOs all the way down.",
      "Sometimes I hear the developer typing. Then silence. Then crying.",
      "If anyone asks, this is 'procedurally generated'. Very modern!"
    ],
    dialogueIndex: 0,
    lastInteraction: 0
  };

  scene.add(group);
  constructionForeman = group;

  // Register with collision system
  collisionManager.registerEntity('foreman', group, 0.4, COLLISION_LAYERS.NPC);

  return group;
}

// ============================================
// SCAFFOLDING AND UNFINISHED STRUCTURES
// ============================================

export function createScaffolding() {
  const structures = [];

  // Scaffolding 1 - Half-built "Nature Center"
  const scaffold1 = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6 });

  // Metal scaffolding frame
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z += 2) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 4, 6),
        metalMat
      );
      pole.position.set(x * 2, 2, z * 1.5);
      scaffold1.add(pole);
    }
  }

  // Horizontal bars
  [1, 2, 3].forEach(y => {
    const bar1 = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.08, 0.08),
      metalMat
    );
    bar1.position.set(0, y, -1.5);
    scaffold1.add(bar1);

    const bar2 = bar1.clone();
    bar2.position.z = 1.5;
    scaffold1.add(bar2);
  });

  // Planks on scaffolding
  [1, 2].forEach(y => {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.1, 2.8),
      woodMat
    );
    plank.position.set(0, y + 0.05, 0);
    scaffold1.add(plank);
  });

  // Partial walls (wireframe style to show "unfinished")
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });

  const partialWall = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 2.5, 0.2),
    wireframeMat
  );
  partialWall.position.set(0, 1.25, -1.4);
  scaffold1.add(partialWall);

  // "NATURE CENTER" sign (unfinished)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#8b7355';
  signCtx.fillRect(0, 0, 256, 64);
  signCtx.fillStyle = '#2f4f2f';
  signCtx.font = 'bold 24px Arial';
  signCtx.textAlign = 'center';
  signCtx.fillText('NATURE CENT--', 128, 35);
  signCtx.font = '14px Arial';
  signCtx.fillStyle = '#ff0000';
  signCtx.fillText('[STRING NOT FOUND]', 128, 55);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.5),
    new THREE.MeshBasicMaterial({ map: signTexture })
  );
  signPlane.position.set(0, 3.5, -1.5);
  scaffold1.add(signPlane);

  scaffold1.position.set(CONSTRUCTION_CENTER.x - 6, 0, CONSTRUCTION_CENTER.z - 5);
  scene.add(scaffold1);
  structures.push(scaffold1);

  // Scaffolding 2 - "Scenic Viewpoint" (just a platform with missing parts)
  const scaffold2 = new THREE.Group();

  // Support poles (some missing - "asset not loaded")
  [[-1, -1], [1, -1], [1, 1]].forEach(([x, z]) => { // Note: one corner missing!
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 2, 6),
      woodMat
    );
    pole.position.set(x * 1.5, 1, z * 1.5);
    scaffold2.add(pole);
  });

  // Floating error where pole should be
  const errorCanvas = document.createElement('canvas');
  errorCanvas.width = 128;
  errorCanvas.height = 64;
  const errorCtx = errorCanvas.getContext('2d');
  errorCtx.fillStyle = '#ff0000';
  errorCtx.font = 'bold 14px monospace';
  errorCtx.fillText('ERROR:', 5, 20);
  errorCtx.fillText('pole_04.obj', 5, 40);
  errorCtx.fillText('not found', 5, 55);

  const errorTexture = new THREE.CanvasTexture(errorCanvas);
  const errorSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: errorTexture })
  );
  errorSprite.scale.set(1, 0.5, 1);
  errorSprite.position.set(-1.5, 1, 1.5);
  scaffold2.add(errorSprite);

  // Platform with hole
  const platformShape = new THREE.Shape();
  platformShape.moveTo(-1.8, -1.8);
  platformShape.lineTo(1.8, -1.8);
  platformShape.lineTo(1.8, 1.8);
  platformShape.lineTo(-1.8, 1.8);
  platformShape.lineTo(-1.8, -1.8);

  // Hole in platform
  const hole = new THREE.Path();
  hole.moveTo(-1.5, 1);
  hole.lineTo(-0.5, 1);
  hole.lineTo(-0.5, 1.5);
  hole.lineTo(-1.5, 1.5);
  platformShape.holes.push(hole);

  const platformGeo = new THREE.ExtrudeGeometry(platformShape, { depth: 0.15, bevelEnabled: false });
  const platform = new THREE.Mesh(platformGeo, woodMat);
  platform.rotation.x = -Math.PI / 2;
  platform.position.y = 2;
  scaffold2.add(platform);

  // Sign
  const viewpointSign = createMetaSign('SCENIC VIEWPOINT', 'Coming Soon(TM)');
  viewpointSign.position.set(0, 2.8, -1.8);
  scaffold2.add(viewpointSign);

  scaffold2.position.set(CONSTRUCTION_CENTER.x + 8, 0, CONSTRUCTION_CENTER.z - 6);
  scene.add(scaffold2);
  structures.push(scaffold2);

  scaffolding = structures;
  return structures;
}

// Helper to create meta-humor signs
function createMetaSign(title, subtitle) {
  const group = new THREE.Group();

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(0, 0, 256, 128);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 124);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 128, 50);

  ctx.font = 'italic 16px Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText(subtitle, 128, 90);

  const texture = new THREE.CanvasTexture(canvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.75),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  group.add(sign);

  return group;
}

// ============================================
// TODO SIGNS AND META HUMOR ELEMENTS
// ============================================

export function createTodoSigns() {
  const signs = [];

  const todoTexts = [
    { text: '// TODO: Add more trees', subtext: 'Priority: Low (since 2019)', pos: { x: -4, z: 3 } },
    { text: '/* FIXME: Fox AI */', subtext: 'Foxes just vibe now', pos: { x: 5, z: -2 } },
    { text: 'console.log("why")', subtext: 'Left in by accident', pos: { x: -2, z: -6 } },
    { text: 'PLACEHOLDER_TREE.PNG', subtext: 'We ran out of art budget', pos: { x: 7, z: 4 } },
    { text: '< INSERT CONTENT >', subtext: 'Content machine broke', pos: { x: -7, z: -3 } },
    { text: 'v0.0.1-alpha-test', subtext: 'It\'s been alpha for 2 years', pos: { x: 3, z: 6 } },
  ];

  todoTexts.forEach(todo => {
    const group = new THREE.Group();

    // Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    post.position.y = 0.6;
    group.add(post);

    // Sign board
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Terminal/code style
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#3c3c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 252, 124);

    ctx.fillStyle = '#4ec9b0'; // Teal code color
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(todo.text, 128, 45);

    ctx.fillStyle = '#6a9955'; // Green comment color
    ctx.font = 'italic 14px monospace';
    ctx.fillText(todo.subtext, 128, 85);

    const texture = new THREE.CanvasTexture(canvas);
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      new THREE.MeshBasicMaterial({ map: texture })
    );
    signBoard.position.y = 1.4;
    group.add(signBoard);

    // Back of sign
    const backBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x4a3728 })
    );
    backBoard.position.set(0, 1.4, -0.02);
    backBoard.rotation.y = Math.PI;
    group.add(backBoard);

    group.position.set(
      CONSTRUCTION_CENTER.x + todo.pos.x,
      0,
      CONSTRUCTION_CENTER.z + todo.pos.z
    );
    group.rotation.y = Math.random() * 0.5 - 0.25;

    scene.add(group);
    signs.push(group);
  });

  todoSigns = signs;
  return signs;
}

// ============================================
// CONSTRUCTION CONES AND BARRIERS
// ============================================

export function createConstructionBarriers() {
  const barriers = [];

  // Traffic cones scattered around
  const conePositions = [
    { x: -3, z: 7 }, { x: 2, z: 8 }, { x: 6, z: 6 },
    { x: -8, z: 2 }, { x: 8, z: -1 }, { x: -5, z: -7 },
    { x: 4, z: -8 }, { x: -1, z: 5 }, { x: 7, z: 3 },
    { x: -6, z: -2 }, { x: 0, z: -5 }, { x: -4, z: 4 },
  ];

  const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

  conePositions.forEach(pos => {
    const coneGroup = new THREE.Group();

    // Cone body
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.5, 8),
      coneMat
    );
    cone.position.y = 0.25;
    cone.castShadow = true;
    coneGroup.add(cone);

    // White stripes
    [0.15, 0.3].forEach(y => {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.05, 8),
        stripeMat
      );
      stripe.position.y = y;
      coneGroup.add(stripe);
    });

    // Base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.05, 0.3),
      coneMat
    );
    base.position.y = 0.025;
    coneGroup.add(base);

    coneGroup.position.set(
      CONSTRUCTION_CENTER.x + pos.x,
      0,
      CONSTRUCTION_CENTER.z + pos.z
    );
    coneGroup.rotation.y = Math.random() * Math.PI * 2;
    // Some cones fallen over
    if (Math.random() > 0.8) {
      coneGroup.rotation.x = Math.PI / 2;
      coneGroup.position.y = 0.15;
    }

    scene.add(coneGroup);
    barriers.push(coneGroup);
  });

  // Barrier tape (yellow/black)
  const tapeGroup = new THREE.Group();
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

  // Create tape between posts
  const tapePoints = [
    { x: -9, z: 8 }, { x: 0, z: 10 }, { x: 9, z: 8 }
  ];

  tapePoints.forEach((pos, i) => {
    // Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    post.position.set(
      CONSTRUCTION_CENTER.x + pos.x,
      0.6,
      CONSTRUCTION_CENTER.z + pos.z
    );
    tapeGroup.add(post);

    // Tape to next post
    if (i < tapePoints.length - 1) {
      const nextPos = tapePoints[i + 1];
      const dx = nextPos.x - pos.x;
      const dz = nextPos.z - pos.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);

      const tape = new THREE.Mesh(
        new THREE.BoxGeometry(length, 0.1, 0.02),
        tapeMat
      );
      tape.position.set(
        CONSTRUCTION_CENTER.x + pos.x + dx / 2,
        1,
        CONSTRUCTION_CENTER.z + pos.z + dz / 2
      );
      tape.rotation.y = -angle;
      tapeGroup.add(tape);
    }
  });

  scene.add(tapeGroup);
  barriers.push(tapeGroup);

  // Pile of materials (looks busy)
  const pileGroup = new THREE.Group();

  // Random planks
  for (let i = 0; i < 8; i++) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(1 + Math.random() * 0.5, 0.08, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    );
    plank.position.set(
      (Math.random() - 0.5) * 2,
      0.04 + i * 0.08,
      (Math.random() - 0.5) * 0.5
    );
    plank.rotation.y = (Math.random() - 0.5) * 0.3;
    pileGroup.add(plank);
  }

  // Bucket of nails
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.12, 0.25, 8),
    new THREE.MeshStandardMaterial({ color: 0x666666 })
  );
  bucket.position.set(1.2, 0.125, 0);
  pileGroup.add(bucket);

  pileGroup.position.set(CONSTRUCTION_CENTER.x - 8, 0, CONSTRUCTION_CENTER.z + 2);
  scene.add(pileGroup);
  barriers.push(pileGroup);

  constructionCones = barriers;
  return barriers;
}

// ============================================
// UPDATE FUNCTION FOR ANIMATIONS
// ============================================

export function updateConstructionZone(time, delta) {
  // Animate warning lights on sign
  if (constructionSign) {
    constructionSign.children.forEach(child => {
      if (child.userData.isWarningLight) {
        const phase = child.userData.phase || 0;
        const flash = Math.sin(time * 4 + phase) > 0;
        child.material.emissiveIntensity = flash ? 1.2 : 0.2;
      }
    });
  }

  // Animate bulldozer
  if (bulldozer) {
    const data = bulldozer.userData;
    data.moveProgress += delta * data.speed * data.moveDirection * 0.1;

    if (data.moveProgress >= 1) {
      data.moveProgress = 1;
      data.moveDirection = -1;
    } else if (data.moveProgress <= 0) {
      data.moveProgress = 0;
      data.moveDirection = 1;
    }

    bulldozer.position.x = THREE.MathUtils.lerp(
      data.pathStart.x, data.pathEnd.x, data.moveProgress
    );
    bulldozer.position.z = THREE.MathUtils.lerp(
      data.pathStart.z, data.pathEnd.z, data.moveProgress
    );

    // Face direction of movement
    bulldozer.rotation.y = data.moveDirection > 0 ? 0 : Math.PI;

    // Slight bounce
    bulldozer.position.y = Math.abs(Math.sin(time * 8)) * 0.02;
  }

  // Animate workers
  constructionWorkers.forEach(worker => {
    const data = worker.userData;
    data.progress += delta * data.speed * data.direction * 0.15;

    if (data.progress >= 1) {
      data.progress = 1;
      data.direction = -1;
    } else if (data.progress <= 0) {
      data.progress = 0;
      data.direction = 1;
    }

    worker.position.x = THREE.MathUtils.lerp(
      data.pathStart.x, data.pathEnd.x, data.progress
    );
    worker.position.z = THREE.MathUtils.lerp(
      data.pathStart.z, data.pathEnd.z, data.progress
    );

    // Face direction
    const angle = Math.atan2(
      data.pathEnd.z - data.pathStart.z,
      data.pathEnd.x - data.pathStart.x
    );
    worker.rotation.y = data.direction > 0 ? -angle + Math.PI / 2 : -angle - Math.PI / 2;

    // Walking bob
    worker.position.y = Math.abs(Math.sin(time * 10 + data.bobOffset)) * 0.02;
  });

  // Animate foreman indicator
  if (constructionForeman) {
    const indicator = constructionForeman.userData.indicator;
    if (indicator) {
      indicator.position.y = 1.8 + Math.sin(time * 2) * 0.1;
      indicator.rotation.y = time;
    }

    // Slight clipboard checking animation
    constructionForeman.rotation.z = Math.sin(time * 0.5) * 0.05;
  }
}

// ============================================
// MAIN INITIALIZATION
// ============================================

export function createConstructionZone() {
  createConstructionSign();
  createBulldozer();
  createConstructionWorkers();
  createConstructionForeman();
  createScaffolding();
  createTodoSigns();
  createConstructionBarriers();
}
