// NPCs - Non-player character creation and management
import * as THREE from 'three';
import { scene, camera } from '../engine/renderer.js';
import { LOCATIONS, WANDERING_NPCS } from '../assets/data.js';
import { AUDIO_CONFIG } from '../config.js';
import { isSafeOffPathPlacement, checkCollision } from './world.js';

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
  if (!corgiFurMaterial) {
    corgiFurMaterial = new THREE.MeshStandardMaterial({ color: 0xd49a6a });
  }
  if (!corgiAccentMaterial) {
    corgiAccentMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a3c });
  }

  const corgi = new THREE.Group();

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.8), corgiFurMaterial);
  body.position.y = 0.6;
  body.castShadow = true;
  corgi.add(body);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.65), corgiFurMaterial);
  chest.position.set(0.65, 0.6, 0);
  chest.castShadow = true;
  corgi.add(chest);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), corgiFurMaterial);
  head.position.set(1.05, 0.9, 0);
  head.castShadow = true;
  corgi.add(head);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.26), corgiAccentMaterial);
  snout.position.set(1.35, 0.78, 0);
  snout.castShadow = true;
  corgi.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2b1b15 }));
  nose.position.set(1.5, 0.78, 0);
  corgi.add(nose);

  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), corgiAccentMaterial);
  earL.position.set(0.95, 1.16, 0.18);
  earL.rotation.z = -0.3;
  corgi.add(earL);

  const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), corgiAccentMaterial);
  earR.position.set(0.95, 1.16, -0.18);
  earR.rotation.z = -0.3;
  corgi.add(earR);

  const hip = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), corgiFurMaterial);
  hip.position.set(-0.65, 0.55, 0);
  hip.castShadow = true;
  corgi.add(hip);

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.35, 8), corgiAccentMaterial);
  tail.position.set(-1.05, 0.78, 0);
  tail.rotation.z = 1.1;
  corgi.add(tail);

  const legGeo = new THREE.BoxGeometry(0.18, 0.4, 0.18);
  const legs = [];
  const pawGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const legPositions = [
    { x: 0.65, z: 0.25, phase: 0 },
    { x: 0.65, z: -0.25, phase: Math.PI },
    { x: -0.5, z: 0.25, phase: Math.PI },
    { x: -0.5, z: -0.25, phase: 0 }
  ];

  legPositions.forEach(({ x, z, phase }) => {
    const legGroup = new THREE.Group();
    const leg = new THREE.Mesh(legGeo, corgiFurMaterial);
    leg.position.y = -0.2;
    legGroup.add(leg);
    const paw = new THREE.Mesh(pawGeo, corgiAccentMaterial);
    paw.position.y = -0.4;
    legGroup.add(paw);
    legGroup.position.set(x, 0.4, z);
    legGroup.userData.phase = phase;
    corgi.add(legGroup);
    legs.push(legGroup);
  });

  corgi.userData = {
    baseY: 0,
    bobOffset: Math.random() * Math.PI * 2,
    legs,
    tail,
    speedType,
    walkAngle: Math.random() * Math.PI * 2,
    walkSpeed: speedType === 'run' ? 1.4 + Math.random() * 0.6 : 0.4 + Math.random() * 0.4,
    strideSpeed: speedType === 'run' ? 10 + Math.random() * 3 : 5 + Math.random() * 2,
    strideAmplitude: speedType === 'run' ? 0.9 : 0.55,
    bobSpeed: speedType === 'run' ? 7 : 4,
    timer: 1 + Math.random() * 2
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
    npc.userData.timer -= delta;
    if (npc.userData.timer <= 0) {
      npc.userData.walkAngle += (Math.random() - 0.5) * Math.PI;
      // Fast runners change direction more often
      npc.userData.timer = npc.userData.speed === 'fast'
        ? 0.5 + Math.random() * 1
        : 2 + Math.random() * 4;
    }

    // Always try to show message - the function handles the 3s cooldown
    showFloatingMessage(npc);
    maybePlayAmbientVoice(npc);

    const speed = npc.userData.walkSpeed * delta;
    const newX = npc.position.x + Math.sin(npc.userData.walkAngle) * speed;
    const newZ = npc.position.z + Math.cos(npc.userData.walkAngle) * speed;

    if (!checkCollision(newX, newZ)) {
      npc.position.x = newX;
      npc.position.z = newZ;
    } else {
      npc.userData.walkAngle += Math.PI * 0.5;
    }

    npc.rotation.y = npc.userData.walkAngle;

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

export function updateCorgis(time, delta) {
  corgis.forEach(corgi => {
    const data = corgi.userData;
    data.timer -= delta;
    if (data.timer <= 0) {
      data.walkAngle += (Math.random() - 0.5) * Math.PI * 0.8;
      data.timer = data.speedType === 'run' ? 0.5 + Math.random() * 0.8 : 1.5 + Math.random() * 2.5;
    }

    const speed = data.walkSpeed * delta;
    const nextX = corgi.position.x + Math.sin(data.walkAngle) * speed;
    const nextZ = corgi.position.z + Math.cos(data.walkAngle) * speed;

    if (!checkCollision(nextX, nextZ) && isSafeOffPathPlacement(nextX, nextZ)) {
      corgi.position.x = nextX;
      corgi.position.z = nextZ;
    } else {
      data.walkAngle += Math.PI * (0.4 + Math.random() * 0.4);
    }

    corgi.rotation.y = data.walkAngle;

    const bob = Math.sin(time * data.bobSpeed + data.bobOffset) * (data.speedType === 'run' ? 0.12 : 0.07);
    corgi.position.y = data.baseY + bob;

    data.legs.forEach(leg => {
      leg.rotation.x = Math.sin(time * data.strideSpeed + leg.userData.phase + data.bobOffset) * data.strideAmplitude;
    });
    if (data.tail) {
      data.tail.rotation.y = Math.sin(time * (data.speedType === 'run' ? 12 : 6) + data.bobOffset) * 0.4;
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
