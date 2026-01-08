// NPCs - Non-player character creation and management
import * as THREE from 'three';
import { scene, camera } from '../engine/renderer.js';
import { LOCATIONS, WANDERING_NPCS } from '../assets/data.js';
import { AUDIO_CONFIG } from '../config.js';
import { isSafeOffPathPlacement, checkCollision } from './world.js';
import { collisionManager, COLLISION_LAYERS } from '../systems/CollisionManager.js';
import { npcPathfinder } from '../systems/NPCPathfinding.js';

// Entity registration counter for unique IDs
let npcIdCounter = 0;
let corgiIdCounter = 0;

// NPC storage
export const npcs = {};
export const wanderers = [];
export const bernieListeners = [];
export const corgis = [];
export const bees = [];

// Material and texture caches
let corgiFurMaterial;
let corgiAccentMaterial;
const npcTextureCache = new Map();
const npcMaterialCache = new Map();

// Shared skin material
const npcSkinMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });

// ============================================
// NPC GEOMETRIES - Reusable geometries for NPCs
// ============================================

const npcGeometries = {
  // Main NPC geometries
  body: new THREE.CylinderGeometry(0.3, 0.35, 0.6, 16),
  bodice: new THREE.CylinderGeometry(0.32, 0.4, 0.45, 16),
  head: new THREE.SphereGeometry(0.38, 18, 16),
  hair: new THREE.SphereGeometry(0.4, 16, 12),
  hairBun: new THREE.SphereGeometry(0.16, 12, 10),
  indicator: new THREE.SphereGeometry(0.22, 12, 12),
  skirt: new THREE.ConeGeometry(0.75, 1.4, 12, 1, true),
  skirtLayer: new THREE.ConeGeometry(0.7, 0.5, 12, 1, true),
  waistRuffle: new THREE.TorusGeometry(0.35, 0.06, 8, 18),
  sleeve: new THREE.SphereGeometry(0.18, 12, 10),
  cuff: new THREE.TorusGeometry(0.12, 0.03, 6, 12),
  brooch: new THREE.SphereGeometry(0.06, 8, 8),
  broochRibbon: new THREE.ConeGeometry(0.035, 0.12, 5),
  collar: new THREE.TorusGeometry(0.19, 0.035, 6, 10),
  necklace: new THREE.TorusGeometry(0.14, 0.02, 6, 12),
  hemLayer: new THREE.TorusGeometry(0.62, 0.03, 6, 18),
  tiara: new THREE.CylinderGeometry(0.18, 0.22, 0.08, 6),
  jewel: new THREE.SphereGeometry(0.04, 8, 8),
  apron: new THREE.ConeGeometry(0.42, 0.85, 8, 1, true),
  bow: new THREE.TorusGeometry(0.12, 0.03, 6, 12),

  // Wanderer geometries
  wandererBody: new THREE.SphereGeometry(0.35, 12, 12),
  wandererHead: new THREE.SphereGeometry(0.3, 12, 12),
  wandererSkirtLayer: new THREE.ConeGeometry(0.45, 0.28, 8, 1, true),
  wandererBrooch: new THREE.SphereGeometry(0.045, 6, 6),
  wandererCollar: new THREE.TorusGeometry(0.14, 0.03, 6, 8),
  wandererLeg: new THREE.CylinderGeometry(0.08, 0.06, 0.2, 6),
  wandererHem: new THREE.TorusGeometry(0.38, 0.02, 6, 12),
  wandererSweat: new THREE.SphereGeometry(0.05, 6, 6),
  wandererCane: new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6),
  wandererGlasses: new THREE.TorusGeometry(0.08, 0.015, 8, 16)
};

// ============================================
// GOWN TEXTURE CREATION - Patterned fabrics
// ============================================

function createGownTexture(cacheKey, baseColor, accentColor, style) {
  if (npcTextureCache.has(cacheKey)) {
    return npcTextureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const base = `#${baseColor.toString(16).padStart(6, '0')}`;
  const accent = `#${accentColor.toString(16).padStart(6, '0')}`;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (style === 'polka') {
    ctx.fillStyle = accent;
    const radius = 5;
    for (let y = 8; y < 64; y += 16) {
      for (let x = 8; x < 64; x += 16) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (style === 'lace') {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.5;
    for (let y = 6; y < 64; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(64, y);
      ctx.stroke();
    }
    for (let x = 6; x < 64; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 64);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 64, 64);
    gradient.addColorStop(0, base);
    gradient.addColorStop(1, accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.35;
    for (let y = 0; y < 64; y += 12) {
      ctx.fillRect(0, y, 64, 5);
    }
    ctx.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  npcTextureCache.set(cacheKey, texture);
  return texture;
}

// ============================================
// MATERIAL CREATION - Cached materials
// ============================================

function getNPCMaterials(paletteKey, palette, style) {
  if (npcMaterialCache.has(paletteKey)) {
    return npcMaterialCache.get(paletteKey);
  }

  const gownTexture = createGownTexture(
    `npc-${paletteKey}`,
    palette.gown,
    palette.trim,
    style
  );
  const materials = {
    gownMat: new THREE.MeshStandardMaterial({ color: palette.gown, roughness: 0.65, map: gownTexture }),
    accentMat: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.4, metalness: 0.2 }),
    trimMat: new THREE.MeshStandardMaterial({ color: palette.trim, emissive: palette.trim, emissiveIntensity: 0.2 }),
    hairMat: new THREE.MeshStandardMaterial({ color: palette.hair, roughness: 0.8 })
  };
  npcMaterialCache.set(paletteKey, materials);
  return materials;
}

function getWanderingMaterials(paletteKey, bodyColor, trimColor, accentColor, style) {
  if (npcMaterialCache.has(paletteKey)) {
    return npcMaterialCache.get(paletteKey);
  }
  const gownTexture = createGownTexture(
    `wander-${paletteKey}`,
    bodyColor,
    trimColor,
    style
  );
  const materials = {
    bodyMat: new THREE.MeshStandardMaterial({ color: bodyColor, map: gownTexture }),
    trimMat: new THREE.MeshStandardMaterial({ color: trimColor }),
    accessoryMat: new THREE.MeshStandardMaterial({ color: accentColor })
  };
  npcMaterialCache.set(paletteKey, materials);
  return materials;
}

// ============================================
// NPC CREATION - Building NPCs
// ============================================

function createNPC(locationId) {
  const group = new THREE.Group();
  const palettes = {
    palace: { gown: 0xf7c2d9, accent: 0xffd700, trim: 0xfff2c9, hair: 0x7a4b2a },
    teashop: { gown: 0xbad9ff, accent: 0xfff2c9, trim: 0xffc1d9, hair: 0x5c3a21 },
    speakers: { gown: 0xd4b8ff, accent: 0xf7e8ff, trim: 0xffd1e1, hair: 0x4d2f2f },
    guests: { gown: 0xffd4a8, accent: 0xffc1d9, trim: 0xfff8f0, hair: 0x7a522b },
    feast: { gown: 0xb8e986, accent: 0xffd1e1, trim: 0xfff2c9, hair: 0x6a3b2a }
  };
  const palette = palettes[locationId] || palettes.palace;
  const gownStyle = locationId === 'palace' || locationId === 'guests' ? 'polka' : locationId === 'teashop' ? 'lace' : 'bands';
  const { gownMat, accentMat, trimMat, hairMat } = getNPCMaterials(locationId, palette, gownStyle);

  // Body core
  const body = new THREE.Mesh(npcGeometries.body, gownMat);
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);

  const bodice = new THREE.Mesh(npcGeometries.bodice, accentMat);
  bodice.position.y = 1.1;
  bodice.castShadow = true;
  group.add(bodice);

  // Head
  const head = new THREE.Mesh(npcGeometries.head, npcSkinMaterial);
  head.position.y = 1.75;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(npcGeometries.hair, hairMat);
  hair.position.set(0, 1.78, -0.05);
  hair.scale.set(1, 0.9, 1);
  group.add(hair);

  const hairBun = new THREE.Mesh(npcGeometries.hairBun, hairMat);
  hairBun.position.set(0, 1.98, -0.2);
  group.add(hairBun);

  // Indicator
  const indicator = new THREE.Mesh(
    npcGeometries.indicator,
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 })
  );
  indicator.position.y = 2.5;
  indicator.userData.isIndicator = true;
  group.add(indicator);

  // Main gown
  const skirt = new THREE.Mesh(npcGeometries.skirt, gownMat);
  skirt.position.y = 0.6;
  skirt.rotation.x = Math.PI;
  skirt.castShadow = true;
  group.add(skirt);

  const skirtLayer = new THREE.Mesh(npcGeometries.skirtLayer, trimMat);
  skirtLayer.position.y = 0.28;
  skirtLayer.rotation.x = Math.PI;
  group.add(skirtLayer);

  const waistRuffle = new THREE.Mesh(npcGeometries.waistRuffle, trimMat);
  waistRuffle.position.y = 0.9;
  waistRuffle.rotation.x = Math.PI / 2;
  group.add(waistRuffle);

  const hemLayer = new THREE.Mesh(npcGeometries.hemLayer, trimMat);
  hemLayer.position.y = 0.04;
  hemLayer.rotation.x = Math.PI / 2;
  group.add(hemLayer);

  // Puff sleeves
  const sleeveL = new THREE.Mesh(npcGeometries.sleeve, accentMat);
  sleeveL.position.set(-0.42, 1.25, 0.05);
  group.add(sleeveL);

  const sleeveR = new THREE.Mesh(npcGeometries.sleeve, accentMat);
  sleeveR.position.set(0.42, 1.25, 0.05);
  group.add(sleeveR);

  const cuffL = new THREE.Mesh(npcGeometries.cuff, trimMat);
  cuffL.position.set(-0.42, 1.05, 0.15);
  cuffL.rotation.x = Math.PI / 2;
  group.add(cuffL);

  const cuffR = new THREE.Mesh(npcGeometries.cuff, trimMat);
  cuffR.position.set(0.42, 1.05, 0.15);
  cuffR.rotation.x = Math.PI / 2;
  group.add(cuffR);

  // Accessories: brooches and collar
  const broochLeft = new THREE.Mesh(npcGeometries.brooch, accentMat);
  broochLeft.position.set(-0.14, 1.22, 0.34);
  group.add(broochLeft);

  const broochRight = new THREE.Mesh(npcGeometries.brooch, accentMat);
  broochRight.position.set(0.14, 1.22, 0.34);
  group.add(broochRight);

  const collar = new THREE.Mesh(npcGeometries.collar, trimMat);
  collar.position.y = 1.38;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  const necklace = new THREE.Mesh(npcGeometries.necklace, accentMat);
  necklace.position.y = 1.47;
  necklace.rotation.x = Math.PI / 2;
  group.add(necklace);

  const ribbonLeft = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
  ribbonLeft.position.set(-0.14, 1.12, 0.33);
  ribbonLeft.rotation.x = Math.PI;
  group.add(ribbonLeft);

  const ribbonRight = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
  ribbonRight.position.set(0.14, 1.12, 0.33);
  ribbonRight.rotation.x = Math.PI;
  group.add(ribbonRight);

  if (locationId === 'palace') {
    const tiara = new THREE.Mesh(npcGeometries.tiara, accentMat);
    tiara.position.y = 2.05;
    group.add(tiara);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const jewel = new THREE.Mesh(npcGeometries.jewel, trimMat);
      jewel.position.set(Math.cos(a) * 0.16, 2.12, Math.sin(a) * 0.16);
      group.add(jewel);
    }
  }

  if (locationId === 'feast') {
    const apron = new THREE.Mesh(npcGeometries.apron, trimMat);
    apron.position.y = 0.65;
    apron.rotation.x = Math.PI;
    group.add(apron);

    const bow = new THREE.Mesh(npcGeometries.bow, accentMat);
    bow.position.set(0, 0.95, 0.35);
    bow.rotation.x = Math.PI / 2;
    group.add(bow);
  }

  return group;
}

// ============================================
// WANDERING NPC CREATION
// ============================================

function createWanderingNPC(speedType) {
  const group = new THREE.Group();

  // Different colors based on speed type
  let bodyColors;
  let trimColors;
  if (speedType === 'fast') {
    bodyColors = [0xff6b6b, 0xff8c42, 0xffdd59, 0xff6b9d]; // Energetic warm colors
    trimColors = [0xfff1a8, 0xffc857];
  } else if (speedType === 'slow') {
    bodyColors = [0xc9b8a8, 0xa8a8c9, 0xb8c9a8, 0xd4c4b0]; // Muted elderly colors
    trimColors = [0xe6d6c0, 0xcbbfa6];
  } else {
    bodyColors = [0xffc0cb, 0xadd8e6, 0x98fb98, 0xdda0dd, 0xf0e68c, 0xffa07a];
    trimColors = [0xf7e8ff, 0xfff2c9];
  }

  const bodyColor = bodyColors[Math.floor(Math.random() * bodyColors.length)];
  const trimColor = trimColors[Math.floor(Math.random() * trimColors.length)];
  const accessoryColor = trimColors[Math.floor(Math.random() * trimColors.length)];
  const paletteKey = `wanderer-${speedType}-${bodyColor.toString(16)}-${trimColor.toString(16)}-${accessoryColor.toString(16)}`;
  const gownStyle = speedType === 'fast' ? 'bands' : speedType === 'slow' ? 'lace' : 'polka';
  const { bodyMat, trimMat, accessoryMat } = getWanderingMaterials(paletteKey, bodyColor, trimColor, accessoryColor, gownStyle);

  // Body - slightly hunched for elderly
  const body = new THREE.Mesh(npcGeometries.wandererBody, bodyMat);
  body.scale.set(1, speedType === 'slow' ? 1.1 : 1.3, 1);
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(npcGeometries.wandererHead, npcSkinMaterial);
  head.position.y = speedType === 'slow' ? 1.0 : 1.1;
  head.castShadow = true;
  group.add(head);

  // Second skirt layer with trim
  const skirtLayer = new THREE.Mesh(npcGeometries.wandererSkirtLayer, trimMat);
  skirtLayer.position.y = 0.33;
  skirtLayer.rotation.x = Math.PI;
  group.add(skirtLayer);

  const hemLayer = new THREE.Mesh(npcGeometries.wandererHem, accessoryMat);
  hemLayer.position.y = 0.18;
  hemLayer.rotation.x = Math.PI / 2;
  group.add(hemLayer);

  // Accessories: brooch and collar
  const brooch = new THREE.Mesh(npcGeometries.wandererBrooch, accessoryMat);
  brooch.position.set(0, 0.8, 0.32);
  group.add(brooch);

  const collar = new THREE.Mesh(npcGeometries.wandererCollar, accessoryMat);
  collar.position.y = 0.95;
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  const ribbon = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
  ribbon.position.set(0, 0.72, 0.31);
  ribbon.rotation.x = Math.PI;
  group.add(ribbon);

  // Legs
  const legL = new THREE.Mesh(npcGeometries.wandererLeg, bodyMat);
  legL.position.set(-0.15, 0.1, 0);
  group.add(legL);

  const legR = new THREE.Mesh(npcGeometries.wandererLeg, bodyMat);
  legR.position.set(0.15, 0.1, 0);
  group.add(legR);

  // Add accessories based on type
  if (speedType === 'fast') {
    // Sweat drops or motion lines effect (small spheres)
    const sweatMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
    const sweat = new THREE.Mesh(npcGeometries.wandererSweat, sweatMat);
    sweat.position.set(-0.35, 1.15, 0);
    group.add(sweat);
  } else if (speedType === 'slow') {
    // Walking cane
    const caneMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const cane = new THREE.Mesh(npcGeometries.wandererCane, caneMat);
    cane.position.set(0.35, 0.4, 0);
    cane.rotation.z = 0.2;
    group.add(cane);

    // Glasses
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const glasses = new THREE.Mesh(npcGeometries.wandererGlasses, glassesMat);
    glasses.position.set(0, 1.05, 0.28);
    glasses.rotation.x = Math.PI / 2;
    group.add(glasses);
  }

  return group;
}

// ============================================
// CORGI CREATION
// ============================================

function createCorgi(speedType = (Math.random() < 0.35 ? 'run' : 'walk')) {
  // Softer, warmer fur colors
  const furColors = [0xd49a6a, 0xc98b5a, 0xe5a872, 0xd4915f];
  const selectedFur = furColors[Math.floor(Math.random() * furColors.length)];

  const corgiFurMat = new THREE.MeshStandardMaterial({
    color: selectedFur,
    roughness: 0.9  // Fluffy look
  });
  const corgiWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xfff8f0,  // Cream white chest
    roughness: 0.85
  });
  const corgiAccentMat = new THREE.MeshStandardMaterial({
    color: 0x8b5a3c,
    roughness: 0.8
  });
  const noseMat = new THREE.MeshStandardMaterial({
    color: 0x2b1b15,
    roughness: 0.3  // Shiny nose!
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1a1208,
    roughness: 0.2
  });
  const tongueMat = new THREE.MeshStandardMaterial({
    color: 0xff8fa3,
    roughness: 0.5
  });

  const corgi = new THREE.Group();

  // === BODY - Rounder, more organic ===
  const bodyGroup = new THREE.Group();

  // Back sphere
  const backBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 12),
    corgiFurMat
  );
  backBody.scale.set(1.2, 0.9, 1);
  backBody.position.set(-0.3, 0, 0);
  bodyGroup.add(backBody);

  // Middle body
  const midBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 12),
    corgiFurMat
  );
  midBody.scale.set(1.3, 0.85, 1);
  bodyGroup.add(midBody);

  // Front body/chest
  const frontBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    corgiFurMat
  );
  frontBody.scale.set(1.1, 0.95, 1);
  frontBody.position.set(0.35, 0.05, 0);
  bodyGroup.add(frontBody);

  // White chest patch
  const chestPatch = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10),
    corgiWhiteMat
  );
  chestPatch.scale.set(0.8, 1, 0.9);
  chestPatch.position.set(0.4, -0.05, 0);
  bodyGroup.add(chestPatch);

  bodyGroup.position.y = 0.45;
  bodyGroup.castShadow = true;
  corgi.add(bodyGroup);

  // === FLUFFY BUTT (iconic corgi feature!) ===
  const fluffyButt = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    corgiFurMat
  );
  fluffyButt.scale.set(1, 0.9, 1.1);
  fluffyButt.position.set(-0.55, 0.4, 0);
  corgi.add(fluffyButt);

  // === HEAD - Rounder, cuter ===
  const headGroup = new THREE.Group();

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 14),
    corgiFurMat
  );
  head.scale.set(1.1, 0.95, 1);
  headGroup.add(head);

  // Forehead marking (white blaze)
  const blaze = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.18),
    corgiWhiteMat
  );
  blaze.position.set(0, 0.08, 0.27);
  blaze.rotation.x = -0.2;
  headGroup.add(blaze);

  // Snout - rounder
  const snout = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    corgiAccentMat
  );
  snout.scale.set(1.2, 0.7, 1);
  snout.position.set(0, -0.08, 0.22);
  headGroup.add(snout);

  // Nose
  const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 10, 10),
    noseMat
  );
  nose.position.set(0, -0.05, 0.36);
  headGroup.add(nose);

  // === EYES with shine ===
  const eyeGroup = new THREE.Group();

  [-0.1, 0.1].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      eyeMat
    );
    eye.position.set(x, 0.05, 0.22);
    eyeGroup.add(eye);

    // Eye shine (makes them look alive!)
    const shine = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    shine.position.set(x + 0.02, 0.07, 0.26);
    eyeGroup.add(shine);
  });
  headGroup.add(eyeGroup);

  // === EARS - Bigger, more expressive ===
  const earGroup = new THREE.Group();

  const earGeo = new THREE.ConeGeometry(0.1, 0.22, 8);
  [-0.15, 0.15].forEach((x, i) => {
    const ear = new THREE.Mesh(earGeo, corgiFurMat);
    ear.position.set(x, 0.22, -0.05);
    ear.rotation.z = x > 0 ? -0.25 : 0.25;
    ear.rotation.x = 0.15;
    ear.userData.baseRotationZ = ear.rotation.z;
    ear.userData.side = i;
    earGroup.add(ear);
  });
  headGroup.add(earGroup);

  // === TONGUE (optional, shows when happy) ===
  const tongue = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, 0.12),
    tongueMat
  );
  tongue.position.set(0, -0.15, 0.32);
  tongue.rotation.x = 0.4;
  tongue.visible = speedType === 'run'; // Runners have tongue out
  headGroup.add(tongue);

  headGroup.position.set(0.6, 0.65, 0);
  corgi.add(headGroup);

  // === TAIL - Fluffy stub with proper wagging ===
  const tailGroup = new THREE.Group();

  const tail = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    corgiFurMat
  );
  tail.scale.set(0.8, 1, 0.9);
  tailGroup.add(tail);

  // Tail fluff
  const tailFluff = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 8),
    corgiFurMat
  );
  tailFluff.position.set(0, 0.08, -0.03);
  tailGroup.add(tailFluff);

  tailGroup.position.set(-0.7, 0.55, 0);
  corgi.add(tailGroup);

  // === LEGS - Stubby corgi legs! ===
  const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.25, 8);
  const pawGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const legs = [];

  const legPositions = [
    { x: 0.35, z: 0.15, phase: 0 },
    { x: 0.35, z: -0.15, phase: Math.PI },
    { x: -0.4, z: 0.15, phase: Math.PI },
    { x: -0.4, z: -0.15, phase: 0 }
  ];

  legPositions.forEach(({ x, z, phase }) => {
    const legGroup = new THREE.Group();

    const leg = new THREE.Mesh(legGeo, corgiFurMat);
    leg.position.y = -0.12;
    legGroup.add(leg);

    const paw = new THREE.Mesh(pawGeo, corgiAccentMat);
    paw.scale.set(1.1, 0.7, 1.2);
    paw.position.y = -0.26;
    legGroup.add(paw);

    legGroup.position.set(x, 0.28, z);
    legGroup.userData.phase = phase;
    corgi.add(legGroup);
    legs.push(legGroup);
  });

  // === SHADOW ===
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 16),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  corgi.add(shadow);

  // === USER DATA for animations ===
  corgi.userData = {
    baseY: 0,
    bobOffset: Math.random() * Math.PI * 2,
    legs,
    tailGroup,
    earGroup,
    headGroup,
    eyeGroup,
    tongue,
    speedType,
    walkAngle: Math.random() * Math.PI * 2,
    walkSpeed: speedType === 'run' ? 1.4 + Math.random() * 0.6 : 0.4 + Math.random() * 0.4,
    strideSpeed: speedType === 'run' ? 10 + Math.random() * 3 : 5 + Math.random() * 2,
    strideAmplitude: speedType === 'run' ? 0.7 : 0.45,
    bobSpeed: speedType === 'run' ? 8 : 5,
    timer: 1 + Math.random() * 2,
    // NEW: Emotion/behavior states
    happiness: 0.7 + Math.random() * 0.3,
    isExcited: false,
    lastBlink: 0,
    blinkDuration: 150,
    nextBlink: 2000 + Math.random() * 3000,
    // Player awareness
    noticeDistance: 5,
    lookAtPlayer: false
  };

  return corgi;
}

// ============================================
// BEES AND HONEY
// ============================================

function createBeesAndHoney() {
  // Get palace position
  const palacePos = LOCATIONS.find(l => l.id === 'palace');

  // Create honey puddles around palace
  const honeyMat = new THREE.MeshStandardMaterial({
    color: 0xffc61a,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85
  });

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 5 + Math.random() * 4;
    const honey = new THREE.Mesh(
      new THREE.CircleGeometry(0.4 + Math.random() * 0.4, 12),
      honeyMat
    );
    honey.rotation.x = -Math.PI / 2;
    honey.position.set(
      palacePos.x + Math.cos(angle) * radius,
      0.04,
      palacePos.z + Math.sin(angle) * radius
    );
    scene.add(honey);
  }

  // Create bees
  const beeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });

  for (let i = 0; i < 6; i++) {
    const bee = new THREE.Group();

    // Body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), beeMat);
    body.scale.set(1.5, 1, 1);
    bee.add(body);

    // Stripes
    for (let s = 0; s < 2; s++) {
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 12), stripeMat);
      stripe.position.x = -0.05 + s * 0.1;
      stripe.rotation.y = Math.PI / 2;
      bee.add(stripe);
    }

    // Wings
    const wingGeo = new THREE.SphereGeometry(0.08, 6, 6);
    wingGeo.scale(1, 0.3, 1.5);
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(0, 0.08, 0.1);
    bee.add(wingL);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingR.position.set(0, 0.08, -0.1);
    bee.add(wingR);

    // Position around palace
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 4;
    bee.position.set(
      palacePos.x + Math.cos(angle) * radius,
      2 + Math.random() * 2,
      palacePos.z + Math.sin(angle) * radius
    );
    bee.userData = {
      baseY: bee.position.y,
      angle: angle,
      radius: radius,
      speed: 1 + Math.random() * 2,
      bobSpeed: 3 + Math.random() * 2,
      palaceX: palacePos.x,
      palaceZ: palacePos.z
    };

    scene.add(bee);
    bees.push(bee);
  }
}

// ============================================
// BERNIE LISTENERS - Special NPCs that gather
// ============================================

function createBernieListeners() {
  // Get speakers position (Princess Bernie's location)
  const speakersPos = LOCATIONS.find(l => l.id === 'speakers');

  const listenerData = [
    { name: 'Eager Earl', quotes: ["Ooh, tell us more!", "This is SO inspiring!", "I'm taking notes!", "*claps enthusiastically*", "WOOO! Go Princess Bernie!"] },
    { name: 'Curious Carol', quotes: ["Fascinating!", "Wait, can you repeat that?", "My mind is BLOWN!", "I need to write this down!", "This changes EVERYTHING!"] },
    { name: 'Listener Larry', quotes: ["Mmhmm, mmhmm...", "*nods wisely*", "Profound!", "I totally get it now!", "This is better than my nap!"] },
    { name: 'Attentive Annie', quotes: ["*leans in*", "Go on...", "Yes, YES!", "Preach it!", "I'm learning so much!"] },
    { name: 'Nodding Ned', quotes: ["*nods*", "*nods faster*", "*nods so hard head falls off*", "Absolutely!", "Couldn't agree more!"] }
  ];

  // Create 5 listener NPCs that will gather around Bernie
  for (let i = 0; i < 5; i++) {
    const listener = createWanderingNPC('normal');

    // Start them scattered nearby
    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = 15 + Math.random() * 10;
    listener.position.set(
      speakersPos.x + Math.cos(startAngle) * startRadius,
      0,
      speakersPos.z + Math.sin(startAngle) * startRadius
    );

    // Target position around Bernie (semi-circle in front)
    const targetAngle = (Math.PI * 0.3) + (i / 5) * (Math.PI * 0.4); // Arc in front
    const targetRadius = 5 + (i % 2) * 1.5;

    listener.userData = {
      ...listenerData[i],
      role: 'Audience Member',
      isListener: true,
      targetX: speakersPos.x + Math.cos(targetAngle) * targetRadius,
      targetZ: speakersPos.z + Math.sin(targetAngle) * targetRadius,
      wanderAngle: Math.random() * Math.PI * 2,
      state: 'wandering', // wandering, gathering, listening, leaving
      speed: 0.8,
      lastQuote: Date.now() - Math.random() * 3000,
      chatOffset: Math.random() * 4000,
      nextVoiceTime: Date.now() + AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY +
        Math.random() * (AUDIO_CONFIG.AMBIENT_VOICE_MAX_DELAY - AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY)
    };

    scene.add(listener);
    bernieListeners.push(listener);
  }
}

// ============================================
// CREATE ALL NPCs - Main entry point
// ============================================

export function createNPCs() {
  // Create NPCs at each building location
  LOCATIONS.forEach((loc) => {
    const npc = createNPC(loc.id);
    npc.position.set(loc.x, 0, loc.z + 4);
    npc.userData = { locationId: loc.id };
    scene.add(npc);
    npcs[loc.id] = npc;
  });
}

export function createWanderers() {
  // Create wandering NPCs with varied speeds
  WANDERING_NPCS.forEach((data, i) => {
    const angle = (i / WANDERING_NPCS.length) * Math.PI * 2 + Math.random() * 0.5;
    const radius = 10 + Math.random() * 15;
    const npc = createWanderingNPC(data.speed);
    npc.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // Set speed based on type
    let walkSpeed;
    if (data.speed === 'fast') {
      walkSpeed = 2.5 + Math.random() * 1.5; // Very fast!
    } else if (data.speed === 'slow') {
      walkSpeed = 0.15 + Math.random() * 0.1; // Very slow
    } else {
      walkSpeed = 0.5 + Math.random() * 0.5; // Normal
    }

    npc.userData = {
      ...data,
      walkAngle: Math.random() * Math.PI * 2,
      walkSpeed: walkSpeed,
      timer: Math.random() * 5,
      lastQuote: Date.now() - Math.random() * 3000, // Stagger initial quotes
      chatOffset: Math.random() * 4000, // Random offset for chat cooldown
      lastVoice: Date.now() - Math.random() * 10000,
      nextVoiceTime: Date.now() + AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY +
        Math.random() * (AUDIO_CONFIG.AMBIENT_VOICE_MAX_DELAY - AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY)
    };
    scene.add(npc);
    wanderers.push(npc);
  });
}

export function createCorgis() {
  // Create 5 corgis wandering in safe areas
  let corgisPlaced = 0;
  let corgiAttempts = 0;
  while (corgisPlaced < 5 && corgiAttempts < 120) {
    corgiAttempts++;
    const angle = Math.random() * Math.PI * 2;
    const radius = 18 + Math.random() * 24;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (!isSafeOffPathPlacement(x, z)) continue;

    const corgi = createCorgi();
    corgi.position.set(x, 0, z);
    corgi.rotation.y = Math.random() * Math.PI * 2;
    corgi.userData.walkAngle = corgi.rotation.y;
    corgi.userData.baseY = corgi.position.y;
    scene.add(corgi);
    corgis.push(corgi);
    corgisPlaced++;
  }
}

export function createBees() {
  createBeesAndHoney();
}

export function createBernieListenersGroup() {
  createBernieListeners();
}

// ============================================
// UPDATE FUNCTIONS - Animation and movement
// ============================================

export function updateNPCIndicators(time) {
  // Animate NPC indicators (floating golden spheres)
  Object.values(npcs).forEach(npc => {
    npc.children.forEach(child => {
      if (child.userData.isIndicator) {
        child.position.y = 2.5 + Math.sin(time * 2) * 0.15;
      }
    });
  });
}

export function updateWanderers(ctx, delta, time, showFloatingMessage, maybePlayAmbientVoice) {
  wanderers.forEach(npc => {
    // Register NPC with collision system if not already registered
    if (!npc.userData.collisionId) {
      npc.userData.collisionId = `npc_${npcIdCounter++}`;
      collisionManager.registerEntity(npc.userData.collisionId, npc, 0.4, COLLISION_LAYERS.NPC);
    }

    // Initialize pathfinding state if needed
    if (!npc.userData.pathfindingState) {
      npc.userData.pathfindingState = npcPathfinder.createState(npc.userData.speed);
    }

    // Always try to show message - the function handles the 3s cooldown
    showFloatingMessage(npc);
    maybePlayAmbientVoice(npc);

    // Use pathfinding system to determine movement
    const pathResult = npcPathfinder.updateNPC(npc, delta);

    if (pathResult.shouldMove && pathResult.targetAngle !== null) {
      // Pathfinding wants us to move to a destination
      npc.userData.walkAngle = pathResult.targetAngle;

      const speed = npc.userData.walkSpeed * delta;
      const targetX = npc.position.x + Math.sin(npc.userData.walkAngle) * speed;
      const targetZ = npc.position.z + Math.cos(npc.userData.walkAngle) * speed;

      // Use collision system with sliding
      const validated = collisionManager.getValidatedPosition(
        npc.userData.collisionId,
        targetX,
        targetZ,
        0.4,
        true
      );

      npc.position.x = validated.x;
      npc.position.z = validated.z;

      // Smoothly rotate to face movement direction
      npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, npc.userData.walkAngle, 0.1);
    } else if (pathResult.isArrived) {
      // NPC has arrived at destination - idle animation
      npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, npc.rotation.y, 0.05);
    } else {
      // Fallback to old random wander behavior if pathfinding returns nothing
      npc.userData.timer -= delta;
      if (npc.userData.timer <= 0) {
        npc.userData.walkAngle += (Math.random() - 0.5) * Math.PI;
        npc.userData.timer = npc.userData.speed === 'fast'
          ? 0.5 + Math.random() * 1
          : 2 + Math.random() * 4;
      }

      const speed = npc.userData.walkSpeed * delta;
      const targetX = npc.position.x + Math.sin(npc.userData.walkAngle) * speed;
      const targetZ = npc.position.z + Math.cos(npc.userData.walkAngle) * speed;

      const validated = collisionManager.getValidatedPosition(
        npc.userData.collisionId,
        targetX,
        targetZ,
        0.4,
        true
      );

      const didMove = Math.abs(validated.x - npc.position.x) > 0.001 ||
                      Math.abs(validated.z - npc.position.z) > 0.001;

      npc.position.x = validated.x;
      npc.position.z = validated.z;

      if (validated.collided && !didMove) {
        npc.userData.walkAngle = Math.random() * Math.PI * 2;
        npc.userData.timer = 0.1;
      }

      npc.rotation.y = THREE.MathUtils.lerp(npc.rotation.y, npc.userData.walkAngle, 0.1);
    }

    // Different animation speeds based on NPC type
    if (npc.userData.speed === 'fast') {
      // Fast runners - very bouncy and wobbly
      npc.rotation.z = Math.sin(time * 25) * 0.2;
      npc.position.y = Math.abs(Math.sin(time * 30)) * 0.2;
    } else if (npc.userData.speed === 'slow') {
      // Elderly - slow shuffle
      npc.rotation.z = Math.sin(time * 4) * 0.03;
      npc.position.y = Math.abs(Math.sin(time * 5)) * 0.02;
    } else {
      // Normal
      npc.rotation.z = Math.sin(time * 12) * 0.08;
      npc.position.y = Math.abs(Math.sin(time * 15)) * 0.08;
    }
  });
}

export function updateBees(time, delta) {
  bees.forEach(bee => {
    const data = bee.userData;
    // Circular flight around palace
    data.angle += data.speed * delta;
    bee.position.x = data.palaceX + Math.cos(data.angle) * data.radius;
    bee.position.z = data.palaceZ + Math.sin(data.angle) * data.radius;
    // Bobbing up and down
    bee.position.y = data.baseY + Math.sin(time * data.bobSpeed) * 0.5;
    // Face direction of movement
    bee.rotation.y = data.angle + Math.PI / 2;
    // Wing flutter
    bee.children.forEach((child, i) => {
      if (i >= 3) { // Wings are children 3 and 4
        child.rotation.x = Math.sin(time * 30) * 0.3;
      }
    });
  });
}

export function updateCorgis(time, delta, player = null) {
  const now = performance.now();

  corgis.forEach(corgi => {
    const data = corgi.userData;

    // Register corgi with collision system if not already registered
    if (!data.collisionId) {
      data.collisionId = `corgi_${corgiIdCounter++}`;
      collisionManager.registerEntity(data.collisionId, corgi, 0.35, COLLISION_LAYERS.NPC);
    }

    // === Check if recently petted ===
    const isPetted = data.pettedUntil && now < data.pettedUntil;

    // === Behavior state management (tail-chase, sniffing) ===
    if (!data.behaviorState) {
      data.behaviorState = 'walking';
      data.behaviorTimer = 0;
      data.nextBehaviorCheck = now + 5000 + Math.random() * 10000;
    }

    // Check if it's time to start a new behavior
    if (data.behaviorState === 'walking' && now > data.nextBehaviorCheck && !isPetted) {
      const rand = Math.random();
      if (rand < 0.3) {
        // Start tail-chase behavior
        data.behaviorState = 'tailChase';
        data.behaviorTimer = 2000 + Math.random() * 1500; // 2-3.5 seconds
        data.tailChaseStartTime = now;
      } else if (rand < 0.5) {
        // Start sniffing behavior
        data.behaviorState = 'sniffing';
        data.behaviorTimer = 1500 + Math.random() * 1500; // 1.5-3 seconds
        data.sniffStartTime = now;
      }
      data.nextBehaviorCheck = now + 8000 + Math.random() * 12000; // Next check in 8-20 seconds
    }

    // Update behavior timer
    if (data.behaviorState !== 'walking') {
      data.behaviorTimer -= delta * 1000;
      if (data.behaviorTimer <= 0) {
        data.behaviorState = 'walking';
      }
    }

    // === Direction change timer ===
    data.timer -= delta;
    if (data.timer <= 0) {
      data.walkAngle += (Math.random() - 0.5) * Math.PI * 0.8;
      data.timer = data.speedType === 'run' ? 0.5 + Math.random() * 0.8 : 1.5 + Math.random() * 2.5;
    }

    // === Movement ===
    let speed = data.walkSpeed * delta;
    let targetX, targetZ;

    if (data.behaviorState === 'tailChase') {
      // Spin in circles trying to catch tail!
      const spinSpeed = 8; // Fast spin
      corgi.rotation.y += spinSpeed * delta;
      // Stay roughly in place but move a tiny bit
      targetX = corgi.position.x + Math.sin(corgi.rotation.y) * speed * 0.3;
      targetZ = corgi.position.z + Math.cos(corgi.rotation.y) * speed * 0.3;
    } else if (data.behaviorState === 'sniffing') {
      // Stay still while sniffing
      targetX = corgi.position.x;
      targetZ = corgi.position.z;
    } else {
      // Normal walking behavior
      targetX = corgi.position.x + Math.sin(data.walkAngle) * speed;
      targetZ = corgi.position.z + Math.cos(data.walkAngle) * speed;
    }

    // Use new collision system - this prevents infinite spinning
    const validated = collisionManager.getValidatedPosition(
      data.collisionId,
      targetX,
      targetZ,
      0.35,
      true
    );

    // Check if we actually moved
    const didMove = Math.abs(validated.x - corgi.position.x) > 0.001 ||
                    Math.abs(validated.z - corgi.position.z) > 0.001;

    corgi.position.x = validated.x;
    corgi.position.z = validated.z;

    // If we collided and couldn't move, pick a new random direction
    // This prevents the infinite spinning bug
    if (validated.collided && !didMove) {
      data.walkAngle = Math.random() * Math.PI * 2;
      data.timer = 0.1; // Try new direction soon
    }

    // Face movement direction smoothly
    // The corgi model faces +X locally, so we offset by -PI/2 to align with movement direction
    const targetRotation = data.walkAngle - Math.PI / 2;
    corgi.rotation.y = THREE.MathUtils.lerp(
      corgi.rotation.y,
      targetRotation,
      0.15
    );

    // === Head movement (player awareness, sniffing, tail-chase) ===
    if (data.headGroup) {
      if (data.behaviorState === 'sniffing') {
        // Tilt head down to sniff ground
        const sniffProgress = (now - data.sniffStartTime) / data.behaviorTimer;
        const sniffBob = Math.sin(time * 6) * 0.15; // Bobbing while sniffing
        data.headGroup.rotation.x = THREE.MathUtils.lerp(data.headGroup.rotation.x, -0.6 + sniffBob, 0.1);
        data.headGroup.rotation.y = THREE.MathUtils.lerp(data.headGroup.rotation.y, 0, 0.1);
      } else if (data.behaviorState === 'tailChase') {
        // Look back at tail while spinning
        data.headGroup.rotation.y = THREE.MathUtils.lerp(data.headGroup.rotation.y, -0.8, 0.15);
        data.headGroup.rotation.x = THREE.MathUtils.lerp(data.headGroup.rotation.x, -0.2, 0.1);
      } else if (player) {
        // Normal player awareness
        const distToPlayer = corgi.position.distanceTo(player.position);
        if (distToPlayer < data.noticeDistance) {
          data.lookAtPlayer = true;
          data.isExcited = distToPlayer < 3;

          // Head turns toward player
          const toPlayer = new THREE.Vector3()
            .subVectors(player.position, corgi.position)
            .normalize();
          const localToPlayer = toPlayer.clone().applyQuaternion(
            corgi.quaternion.clone().invert()
          );
          const targetHeadY = Math.atan2(localToPlayer.x, localToPlayer.z) * 0.5;
          data.headGroup.rotation.y = THREE.MathUtils.lerp(
            data.headGroup.rotation.y,
            THREE.MathUtils.clamp(targetHeadY, -0.4, 0.4),
            0.08
          );
          data.headGroup.rotation.x = THREE.MathUtils.lerp(data.headGroup.rotation.x, 0, 0.1);
        } else {
          data.lookAtPlayer = false;
          data.isExcited = false;
          data.headGroup.rotation.y = THREE.MathUtils.lerp(data.headGroup.rotation.y, 0, 0.05);
          data.headGroup.rotation.x = THREE.MathUtils.lerp(data.headGroup.rotation.x, 0, 0.05);
        }
      } else {
        // Reset head when no special behavior
        data.headGroup.rotation.y = THREE.MathUtils.lerp(data.headGroup.rotation.y, 0, 0.05);
        data.headGroup.rotation.x = THREE.MathUtils.lerp(data.headGroup.rotation.x, 0, 0.05);
      }
    }

    // === Body bob ===
    const bobIntensity = isPetted ? 0.2 : (data.isExcited ? 0.15 : (data.speedType === 'run' ? 0.12 : 0.07));
    const bobSpeed = isPetted ? data.bobSpeed * 1.5 : data.bobSpeed;
    const bob = Math.sin(time * bobSpeed + data.bobOffset) * bobIntensity;
    corgi.position.y = data.baseY + Math.abs(bob);

    // === Leg animation ===
    data.legs.forEach(leg => {
      leg.rotation.x = Math.sin(time * data.strideSpeed + leg.userData.phase + data.bobOffset) * data.strideAmplitude;
    });

    // === TAIL WAGGING - More expressive! ===
    if (data.tailGroup) {
      let wagSpeed, wagAmount;

      if (data.behaviorState === 'tailChase') {
        // Super frantic wagging during tail-chase!
        wagSpeed = 35;
        wagAmount = 1.1;
      } else if (isPetted) {
        wagSpeed = 28;
        wagAmount = 0.9;
      } else if (data.isExcited) {
        wagSpeed = 20;
        wagAmount = 0.7;
      } else if (data.speedType === 'run') {
        wagSpeed = 14;
        wagAmount = 0.5;
      } else {
        wagSpeed = 8;
        wagAmount = 0.35;
      }

      // Side-to-side wag
      data.tailGroup.rotation.y = Math.sin(time * wagSpeed + data.bobOffset) * wagAmount;
      // Slight vertical movement
      data.tailGroup.rotation.x = Math.sin(time * wagSpeed * 0.5) * 0.2 - 0.3;
      // Excited tail goes higher
      data.tailGroup.position.y = 0.55 + (data.behaviorState === 'tailChase' ? 0.2 : (isPetted ? 0.15 : (data.isExcited ? 0.1 : 0)));
    }

    // === EAR WIGGLE ===
    if (data.earGroup && data.earGroup.children.length >= 2) {
      const earWiggle = isPetted ? 0.25 : (data.isExcited ? 0.15 : 0.05);
      const earWiggleSpeed = isPetted ? 8 : 4;
      data.earGroup.children.forEach((ear, i) => {
        const offset = i === 0 ? 0 : Math.PI;
        ear.rotation.z = ear.userData.baseRotationZ + Math.sin(time * earWiggleSpeed + offset) * earWiggle;
        // Perk up when excited or petted
        ear.rotation.x = 0.15 - (isPetted ? 0.15 : (data.isExcited ? 0.1 : 0));
      });
    }

    // === EYE BLINK ===
    if (data.eyeGroup) {
      if (now - data.lastBlink > data.nextBlink) {
        // Start blink
        data.lastBlink = now;
        data.nextBlink = 2000 + Math.random() * 4000;

        // Quick scale down/up for blink effect
        data.eyeGroup.children.forEach(eye => {
          if (eye.geometry && eye.geometry.type === 'SphereGeometry') {
            eye.scale.y = 0.1;
          }
        });

        setTimeout(() => {
          if (data.eyeGroup) {
            data.eyeGroup.children.forEach(eye => {
              if (eye.geometry && eye.geometry.type === 'SphereGeometry') {
                eye.scale.y = 1;
              }
            });
          }
        }, data.blinkDuration);
      }
    }

    // === TONGUE (panting when running/excited/petted) ===
    if (data.tongue) {
      data.tongue.visible = isPetted || data.speedType === 'run' || data.isExcited;
      if (data.tongue.visible) {
        // Panting animation (more intense when petted)
        const pantSpeed = isPetted ? 16 : 12;
        data.tongue.scale.y = 1 + Math.sin(time * pantSpeed) * 0.2;
      }
    }
  });
}

export function updateBernieListeners(ctx, delta, time, showFloatingMessage, maybePlayAmbientVoice) {
  const feastPos = LOCATIONS.find(l => l.id === 'feast');
  bernieListeners.forEach(listener => {
    const data = listener.userData;
    const speed = data.speed * delta;

    // Show floating messages (especially when listening!)
    if (data.state === 'listening') {
      showFloatingMessage(listener);
    } else if (Math.random() < 0.01) { // Less frequent when not listening
      showFloatingMessage(listener);
    }
    maybePlayAmbientVoice(listener);

    if (data.state === 'gathering') {
      // Move towards target position around Bernie
      const dx = data.targetX - listener.position.x;
      const dz = data.targetZ - listener.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.5) {
        listener.position.x += (dx / dist) * speed * 2;
        listener.position.z += (dz / dist) * speed * 2;
        listener.rotation.y = Math.atan2(dx, dz);
        // Walk animation
        listener.rotation.z = Math.sin(time * 12) * 0.08;
        listener.position.y = Math.abs(Math.sin(time * 15)) * 0.08;
      } else {
        data.state = 'listening';
      }
    } else if (data.state === 'listening') {
      // Face Bernie (speakers NPC) and nod occasionally
      const speakersPos = LOCATIONS.find(l => l.id === 'speakers');
      const npcPos = ctx.npcs['speakers'].position;
      listener.rotation.y = Math.atan2(
        npcPos.x - listener.position.x,
        npcPos.z - listener.position.z
      );
      // Nodding animation
      listener.rotation.x = Math.sin(time * 2) * 0.1;
      listener.position.y = 0;
    } else if (data.state === 'leaving') {
      // Head towards feast hall for cake!
      const dx = feastPos.x - listener.position.x;
      const dz = feastPos.z - listener.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Show hungry messages
      if (Math.random() < 0.015) {
        const hungryQuotes = ["CAKE TIME! 🍰", "My tummy is calling!", "Dessert awaits!", "I smell frosting!", "Can't talk, eating soon!"];
        const now = Date.now();
        if (now - data.lastQuote > 2000) {
          data.lastQuote = now;
          const vec = listener.position.clone().project(camera);
          if (vec.z < 1 && vec.x > -0.8 && vec.x < 0.8) {
            const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
            const msg = document.createElement('div');
            msg.className = 'floating-message';
            msg.textContent = hungryQuotes[Math.floor(Math.random() * hungryQuotes.length)];
            msg.style.left = x + 'px';
            msg.style.top = (y - 80) + 'px';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
          }
        }
      }

      if (dist > 3) {
        listener.position.x += (dx / dist) * speed * 2.5;
        listener.position.z += (dz / dist) * speed * 2.5;
        listener.rotation.y = Math.atan2(dx, dz);
        // Excited walking animation
        listener.rotation.z = Math.sin(time * 15) * 0.12;
        listener.position.y = Math.abs(Math.sin(time * 18)) * 0.12;
      } else {
        // Arrived at feast hall, start wandering there
        data.state = 'arrived';
      }
    } else if (data.state === 'arrived') {
      // Wander around feast hall happily
      data.wanderAngle += (Math.random() - 0.5) * 0.1;
      const newX = listener.position.x + Math.sin(data.wanderAngle) * speed;
      const newZ = listener.position.z + Math.cos(data.wanderAngle) * speed;

      // Show happy eating messages
      if (Math.random() < 0.01) {
        const eatingQuotes = ["*nom nom nom*", "This cake is DIVINE! 🍰", "More frosting please!", "I regret nothing!", "Best. Day. Ever."];
        const now = Date.now();
        if (now - data.lastQuote > 3000) {
          data.lastQuote = now;
          const vec = listener.position.clone().project(camera);
          if (vec.z < 1 && vec.x > -0.8 && vec.x < 0.8) {
            const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
            const msg = document.createElement('div');
            msg.className = 'floating-message';
            msg.textContent = eatingQuotes[Math.floor(Math.random() * eatingQuotes.length)];
            msg.style.left = x + 'px';
            msg.style.top = (y - 80) + 'px';
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 3000);
          }
        }
      }

      listener.position.x = newX;
      listener.position.z = newZ;
      listener.rotation.y = data.wanderAngle;
      // Happy bouncing animation
      listener.rotation.z = Math.sin(time * 10) * 0.06;
      listener.position.y = Math.abs(Math.sin(time * 12)) * 0.06;
    }
  });
}
