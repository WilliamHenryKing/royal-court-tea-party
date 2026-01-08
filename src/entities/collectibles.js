// Collectibles - sweet collectibles, clouds, particles, and insects
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { CELEBRATION_CONFIG } from '../config.js';
import { collisionBoxes } from './world.js';

// Storage arrays
export const collectibles = [];
export const clouds = [];
export const celebrationParticles = [];
export const insects = [];
export const ambientParticles = [];
export const fireflies = [];
export const cherryPetals = [];

// Particle system state
export let particleTexture = null;
export let lastCelebrationTime = 0;

// ============================================
// PARTICLE TEXTURE CREATION
// ============================================

export function createParticleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  particleTexture = texture;
  return texture;
}

// ============================================
// PARTICLE SPRITE CREATION
// ============================================

function createParticleSprite(color, opacity = 1) {
  const material = new THREE.SpriteMaterial({
    map: particleTexture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const sprite = new THREE.Sprite(material);
  scene.add(sprite);
  return sprite;
}

function addParticle({ position, velocity, life, size, color, opacity, rotationSpeed, fade, gravity }) {
  const sprite = createParticleSprite(color, opacity);
  sprite.position.copy(position);
  sprite.scale.set(size, size, size);
  celebrationParticles.push({
    sprite,
    velocity,
    life,
    maxLife: life,
    rotationSpeed,
    fade,
    gravity
  });
}

// ============================================
// PARTICLE EFFECT SPAWNERS
// ============================================

function spawnSparkles(origin, palette) {
  for (let i = 0; i < 20; i++) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    );
    addParticle({
      position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.2) * 0.4, (Math.random() - 0.5) * 0.4)),
      velocity,
      life: 0.6 + Math.random() * 0.4,
      size: 0.25 + Math.random() * 0.2,
      color,
      opacity: 0.9,
      rotationSpeed: (Math.random() - 0.5) * 6,
      fade: 1.2,
      gravity: -2
    });
  }
}

function spawnFireworks(origin, palette) {
  for (let i = 0; i < 12; i++) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const angle = (i / 12) * Math.PI * 2;
    const velocity = new THREE.Vector3(Math.cos(angle) * 2, 2.5 + Math.random(), Math.sin(angle) * 2);
    addParticle({
      position: origin.clone(),
      velocity,
      life: 0.9 + Math.random() * 0.4,
      size: 0.35 + Math.random() * 0.25,
      color,
      opacity: 0.95,
      rotationSpeed: (Math.random() - 0.5) * 3,
      fade: 1.4,
      gravity: -3
    });
  }
}

function spawnConfetti(origin, palette) {
  for (let i = 0; i < 18; i++) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      1.2 + Math.random() * 0.8,
      (Math.random() - 0.5) * 1.5
    );
    addParticle({
      position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.6, (Math.random() - 0.5) * 0.6)),
      velocity,
      life: 1.2 + Math.random() * 0.6,
      size: 0.3 + Math.random() * 0.2,
      color,
      opacity: 0.85,
      rotationSpeed: (Math.random() - 0.5) * 8,
      fade: 0.9,
      gravity: -1.2
    });
  }
}

function spawnSmoke(origin, palette) {
  for (let i = 0; i < 8; i++) {
    const color = palette[Math.floor(Math.random() * palette.length)].clone().lerp(new THREE.Color(0xffffff), 0.4);
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.6,
      0.6 + Math.random() * 0.6,
      (Math.random() - 0.5) * 0.6
    );
    addParticle({
      position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, Math.random() * 0.5, (Math.random() - 0.5) * 0.4)),
      velocity,
      life: 1.3 + Math.random() * 0.6,
      size: 0.6 + Math.random() * 0.4,
      color,
      opacity: 0.5,
      rotationSpeed: (Math.random() - 0.5) * 2,
      fade: 0.7,
      gravity: -0.6
    });
  }
}

// ============================================
// CELEBRATION BURST - Main particle effect
// ============================================

export function spawnCelebrationBurst(playerRef) {
  const now = performance.now();
  if (now - lastCelebrationTime < CELEBRATION_CONFIG.COOLDOWN) return;
  lastCelebrationTime = now;

  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(playerRef.quaternion);
  const spawnPos = playerRef.position.clone()
    .add(forward.multiplyScalar(-0.9))
    .add(new THREE.Vector3(0, 0.9, 0));

  const palette = [
    new THREE.Color(0xffd700),
    new THREE.Color(0xffb6c1),
    new THREE.Color(0xff9ad5),
    new THREE.Color(0xaee8ff),
    new THREE.Color(0xfad5a5),
    new THREE.Color(0xe3b6ff)
  ];

  spawnSparkles(spawnPos, palette);
  spawnFireworks(spawnPos, palette);
  spawnConfetti(spawnPos, palette);
  spawnSmoke(spawnPos, palette);
}

// ============================================
// COLLECTIBLE CREATION
// ============================================

function createCollectible() {
  const group = new THREE.Group();
  const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6bd6, 0xffd700];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });

  const types = ['candy', 'crown', 'gem'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'candy') {
    const candy = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), mat);
    candy.scale.set(1.5, 1, 1);
    group.add(candy);
  } else if (type === 'crown') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.15, 6), mat);
    group.add(base);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const point = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), mat);
      point.position.set(Math.cos(a) * 0.15, 0.12, Math.sin(a) * 0.15);
      group.add(point);
    }
  } else {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), mat);
    group.add(gem);
  }

  return group;
}

export function createCollectibles() {
  // Place 25 collectibles around the world
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 35;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Skip if too close to a building
    const tooClose = collisionBoxes.some(b =>
      x > b.minX - 2 && x < b.maxX + 2 && z > b.minZ - 2 && z < b.maxZ + 2
    );
    if (tooClose) continue;

    const collectible = createCollectible();
    collectible.position.set(x, 0.5, z);
    collectible.userData = { collected: false, floatOffset: Math.random() * Math.PI * 2 };
    scene.add(collectible);
    collectibles.push(collectible);
  }
}

// ============================================
// CLOUD CREATION
// ============================================

function createCloud() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });

  [{ x: 0, r: 2 }, { x: 1.6, r: 1.4 }, { x: -1.5, r: 1.5 }, { x: 0.8, r: 1.1 }, { x: -0.8, r: 1.2 }].forEach(p => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(p.r, 12, 12), mat);
    puff.position.set(p.x, Math.random() * 0.5, Math.random() * 0.5 - 0.25);
    group.add(puff);
  });

  return group;
}

export function createClouds() {
  // Create 12 clouds floating in the sky
  for (let i = 0; i < 12; i++) {
    const cloud = createCloud();
    cloud.position.set((Math.random() - 0.5) * 100, 18 + Math.random() * 12, (Math.random() - 0.5) * 100);
    cloud.userData.speed = 0.015 + Math.random() * 0.025;
    cloud.scale.setScalar(0.8 + Math.random() * 0.6);
    scene.add(cloud);
    clouds.push(cloud);
  }
}

// ============================================
// INSECT CREATION
// ============================================

function createInsect(material) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), material);
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), material);
  head.position.set(0.06, 0.02, 0);
  group.add(head);
  group.userData = {
    baseY: 0,
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed: 1.5 + Math.random() * 1.5,
    wobbleAmount: 0.03 + Math.random() * 0.02
  };
  return group;
}

export function createInsects() {
  const insectMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

  for (let i = 0; i < 6; i++) {
    const insect = createInsect(insectMat);
    insect.position.set((Math.random() - 0.5) * 60, 0.15 + Math.random() * 0.2, (Math.random() - 0.5) * 60);
    insect.userData.baseY = insect.position.y;
    insect.rotation.y = Math.random() * Math.PI * 2;
    scene.add(insect);
    insects.push(insect);
  }
}

// ============================================
// UPDATE FUNCTIONS
// ============================================

export function updateCelebrationParticles(delta) {
  for (let i = celebrationParticles.length - 1; i >= 0; i--) {
    const particle = celebrationParticles[i];
    particle.velocity.y += particle.gravity * delta;
    particle.sprite.position.addScaledVector(particle.velocity, delta);
    particle.sprite.material.opacity = Math.max(0, particle.sprite.material.opacity - delta * particle.fade);
    particle.sprite.material.rotation += particle.rotationSpeed * delta;
    particle.life -= delta;
    if (particle.life <= 0) {
      scene.remove(particle.sprite);
      particle.sprite.material.dispose();
      celebrationParticles.splice(i, 1);
    }
  }
}

export function updateCollectibles(time) {
  // Animate collectibles - floating and rotating
  collectibles.forEach(col => {
    if (!col.userData.collected) {
      col.position.y = 0.5 + Math.sin(time * 2 + col.userData.floatOffset) * 0.15;
      col.rotation.y += 0.02;
    }
  });
}

export function updateClouds() {
  // Move clouds across the sky
  clouds.forEach(cloud => {
    cloud.position.x += cloud.userData.speed;
    if (cloud.position.x > 60) cloud.position.x = -60;
  });
}

export function updateInsects(time) {
  // Animate insects - wobbling motion
  insects.forEach(insect => {
    const data = insect.userData;
    insect.position.y = data.baseY + Math.sin(time * data.wobbleSpeed + data.wobbleOffset) * data.wobbleAmount;
    insect.rotation.z = Math.sin(time * data.wobbleSpeed + data.wobbleOffset) * 0.4;
  });
}

// ============================================
// AMBIENT FLOATING PARTICLES
// ============================================

// Petal sprite material
let petalMaterials = null;

function createPetalMaterials() {
  if (petalMaterials) return petalMaterials;

  const colors = [
    0xffb6c1, // Light pink
    0xffc0cb, // Pink
    0xffd1dc, // Light rose
    0xffe4e1, // Misty rose
    0xfff0f5, // Lavender blush
    0xffd700  // Gold sparkle
  ];

  petalMaterials = colors.map(color => new THREE.SpriteMaterial({
    map: particleTexture,
    color,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  }));

  return petalMaterials;
}

function createAmbientParticle(type = 'petal') {
  const mats = createPetalMaterials();
  const mat = mats[Math.floor(Math.random() * mats.length)].clone();

  const sprite = new THREE.Sprite(mat);

  // Random starting position in a large area
  const x = (Math.random() - 0.5) * 100;
  const y = 8 + Math.random() * 15;
  const z = (Math.random() - 0.5) * 100;

  sprite.position.set(x, y, z);

  const baseSize = type === 'sparkle' ? 0.15 : 0.3;
  const size = baseSize + Math.random() * 0.2;
  sprite.scale.set(size, size, size);

  sprite.userData = {
    type,
    // Movement
    driftSpeed: 0.3 + Math.random() * 0.4,
    driftAngle: Math.random() * Math.PI * 2,
    fallSpeed: 0.2 + Math.random() * 0.3,
    // Oscillation
    wobbleSpeed: 1.5 + Math.random() * 1.5,
    wobbleAmountX: 0.5 + Math.random() * 0.5,
    wobbleAmountZ: 0.5 + Math.random() * 0.5,
    // Rotation
    rotSpeed: (Math.random() - 0.5) * 2,
    // Phase offset
    phaseOffset: Math.random() * Math.PI * 2,
    // Respawn height
    spawnY: y
  };

  scene.add(sprite);
  return sprite;
}

export function createAmbientParticles(count = 60) {
  // Mix of petals and sparkles
  for (let i = 0; i < count; i++) {
    const type = Math.random() < 0.8 ? 'petal' : 'sparkle';
    const particle = createAmbientParticle(type);
    ambientParticles.push(particle);
  }
}

export function updateAmbientParticles(time, delta) {
  ambientParticles.forEach(particle => {
    const data = particle.userData;

    // Gentle falling
    particle.position.y -= data.fallSpeed * delta;

    // Horizontal drift with sine wave wobble
    const wobbleX = Math.sin(time * data.wobbleSpeed + data.phaseOffset) * data.wobbleAmountX;
    const wobbleZ = Math.cos(time * data.wobbleSpeed * 0.7 + data.phaseOffset) * data.wobbleAmountZ;

    particle.position.x += (Math.sin(data.driftAngle) * data.driftSpeed + wobbleX) * delta;
    particle.position.z += (Math.cos(data.driftAngle) * data.driftSpeed + wobbleZ) * delta;

    // Rotation
    particle.material.rotation += data.rotSpeed * delta;

    // Opacity pulsing for sparkles
    if (data.type === 'sparkle') {
      particle.material.opacity = 0.5 + Math.sin(time * 4 + data.phaseOffset) * 0.3;
    }

    // Respawn when too low or too far from center
    const distFromCenter = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
    if (particle.position.y < -2 || distFromCenter > 60) {
      // Respawn at top
      particle.position.y = data.spawnY + Math.random() * 5;
      particle.position.x = (Math.random() - 0.5) * 80;
      particle.position.z = (Math.random() - 0.5) * 80;
      data.driftAngle = Math.random() * Math.PI * 2;
    }
  });
}

// ============================================
// FIREFLIES
// ============================================

function createFirefly() {
  // Create a glowing sprite for the firefly
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Create radial gradient for glow
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 150, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 100, 0.8)');
  gradient.addColorStop(0.6, 'rgba(200, 255, 100, 0.4)');
  gradient.addColorStop(1, 'rgba(150, 255, 100, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.3, 0.3, 0.3);

  // Add subtle point light for extra glow
  const light = new THREE.PointLight(0xffff88, 0.3, 2);
  sprite.add(light);

  // Random starting position in forest areas
  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 25;
  sprite.position.set(
    Math.cos(angle) * radius,
    0.5 + Math.random() * 2.5,
    Math.sin(angle) * radius
  );

  // Store animation data
  sprite.userData = {
    baseY: sprite.position.y,
    floatSpeed: 0.3 + Math.random() * 0.4,
    floatAmount: 0.3 + Math.random() * 0.5,
    driftSpeed: 0.2 + Math.random() * 0.3,
    driftAngle: Math.random() * Math.PI * 2,
    phaseOffset: Math.random() * Math.PI * 2,
    blinkSpeed: 2 + Math.random() * 3,
    blinkPhase: Math.random() * Math.PI * 2,
    light: light,
    homePosX: sprite.position.x,
    homePosZ: sprite.position.z,
    wanderRadius: 3 + Math.random() * 4
  };

  scene.add(sprite);
  return sprite;
}

export function createFireflies(count = 50) {
  for (let i = 0; i < count; i++) {
    const firefly = createFirefly();
    fireflies.push(firefly);
  }
}

export function updateFireflies(time, delta) {
  fireflies.forEach(firefly => {
    const data = firefly.userData;

    // Floating up and down
    const floatOffset = Math.sin(time * data.floatSpeed + data.phaseOffset) * data.floatAmount;
    firefly.position.y = data.baseY + floatOffset;

    // Gentle wandering around home position
    const wanderX = Math.sin(time * data.driftSpeed + data.phaseOffset) * data.wanderRadius;
    const wanderZ = Math.cos(time * data.driftSpeed * 0.7 + data.phaseOffset) * data.wanderRadius;
    firefly.position.x = data.homePosX + wanderX;
    firefly.position.z = data.homePosZ + wanderZ;

    // Blinking effect - pulsing opacity and light intensity
    const blink = Math.sin(time * data.blinkSpeed + data.blinkPhase);
    const blinkValue = (blink + 1) * 0.5; // 0 to 1
    const intensity = blinkValue * 0.5 + 0.3; // 0.3 to 0.8

    firefly.material.opacity = intensity;
    data.light.intensity = intensity * 0.5;

    // Occasional bright flash
    if (Math.random() < 0.001) {
      data.blinkPhase = Math.random() * Math.PI * 2;
    }
  });
}

// ============================================
// FALLING CHERRY BLOSSOM PETALS
// ============================================

// Cherry tree positions from world.js
const CHERRY_TREE_POSITIONS = [
  { x: 0, z: 28 }, { x: -15, z: 26 }, { x: 18, z: 16 },
  { x: 30, z: 8 }, { x: 20, z: 10 }, { x: -8, z: 25 }, { x: 8, z: 25 }
];

function createCherryPetal(treePos) {
  // Create petal texture
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  // Draw petal shape
  ctx.fillStyle = '#ffb7c5';
  ctx.beginPath();
  ctx.ellipse(8, 8, 6, 4, Math.random() * Math.PI, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.8
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.15, 0.1, 0.1);

  // Start above the tree
  const spreadX = (Math.random() - 0.5) * 8;
  const spreadZ = (Math.random() - 0.5) * 8;
  sprite.position.set(
    treePos.x + spreadX,
    5 + Math.random() * 3,
    treePos.z + spreadZ
  );

  // Animation data
  sprite.userData = {
    treeX: treePos.x,
    treeZ: treePos.z,
    fallSpeed: 0.3 + Math.random() * 0.2,
    swaySpeed: 1 + Math.random() * 0.5,
    swayAmount: 0.3 + Math.random() * 0.3,
    rotSpeed: (Math.random() - 0.5) * 2,
    phaseOffset: Math.random() * Math.PI * 2
  };

  scene.add(sprite);
  return sprite;
}

export function createCherryPetals(petalsPerTree = 10) {
  CHERRY_TREE_POSITIONS.forEach(treePos => {
    for (let i = 0; i < petalsPerTree; i++) {
      const petal = createCherryPetal(treePos);
      cherryPetals.push(petal);
    }
  });
}

export function updateCherryPetals(time, delta) {
  cherryPetals.forEach(petal => {
    const data = petal.userData;

    // Gentle falling
    petal.position.y -= data.fallSpeed * delta;

    // Swaying motion as it falls
    const sway = Math.sin(time * data.swaySpeed + data.phaseOffset) * data.swayAmount;
    petal.position.x += sway * delta;

    // Gentle rotation
    petal.material.rotation += data.rotSpeed * delta;

    // Respawn when hits ground
    if (petal.position.y < 0.1) {
      petal.position.y = 5 + Math.random() * 3;
      const spreadX = (Math.random() - 0.5) * 8;
      const spreadZ = (Math.random() - 0.5) * 8;
      petal.position.x = data.treeX + spreadX;
      petal.position.z = data.treeZ + spreadZ;
      data.phaseOffset = Math.random() * Math.PI * 2;
    }
  });
}

// Initialize collectibles system
export function initCollectibles() {
  createParticleTexture();
}
