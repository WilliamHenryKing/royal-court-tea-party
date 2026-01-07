// Streets - Austinville street system with Roman cobblestone and sandy roads
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';

// Street configurations
export const STREETS = {
  main: [
    {
      name: "Royal Road",
      type: "cobblestone",
      start: { x: -40, z: 0 },
      end: { x: 40, z: 0 },
      width: 4,
      signPositions: [{ x: -35, z: 2 }, { x: 35, z: 2 }]
    },
    {
      name: "Peppermint Ave",
      type: "cobblestone",
      start: { x: -40, z: -20 },
      end: { x: 40, z: -20 },
      width: 3.5,
      signPositions: [{ x: -35, z: -18 }, { x: 35, z: -18 }]
    },
    {
      name: "Milk Lane",
      type: "sandy",
      start: { x: -40, z: -10 },
      end: { x: 40, z: -10 },
      width: 3,
      signPositions: [{ x: -35, z: -8 }]
    },
    {
      name: "Crumpet Court",
      type: "cobblestone",
      start: { x: -40, z: 10 },
      end: { x: 40, z: 10 },
      width: 3,
      signPositions: [{ x: -35, z: 12 }]
    },
    {
      name: "Scone Street",
      type: "sandy",
      start: { x: -40, z: 20 },
      end: { x: 40, z: 20 },
      width: 2.5,
      signPositions: [{ x: 30, z: 22 }]
    }
  ],
  cross: [
    { name: "Sugar Lane", type: "sandy", start: { x: -20, z: -30 }, end: { x: -20, z: 30 }, width: 2.5 },
    { name: "Honey Way", type: "cobblestone", start: { x: 0, z: -30 }, end: { x: 0, z: 30 }, width: 3 },
    { name: "Biscuit Boulevard", type: "sandy", start: { x: 20, z: -30 }, end: { x: 20, z: 30 }, width: 2.5 }
  ]
};

// Road Materials (cached)
const ROAD_MATERIALS = {
  cobblestone: null,
  sandy: null,
  wooden: null
};

// Store all street meshes for updates
export const streetMeshes = [];
export const streetSignGroups = [];
export const intersectionTiles = [];

/**
 * Create beautiful Roman cobblestone texture
 * Rounded, irregular white/cream stones with dark mortar gaps
 */
function createRomanCobblestoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Dark mortar/gap color as base
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(0, 0, 256, 256);

  // Stone colors - cream/white Roman style
  const stoneColors = [
    '#f5f0e6', '#ebe5d8', '#e8e2d4', '#f0ebe0', '#e5dfd0',
    '#ded8c8', '#d8d2c4', '#eae4d6', '#f2ece0', '#e0dace'
  ];

  // Create irregular cobblestones in an offset pattern
  const stoneSize = 28;
  const gap = 4;
  const rows = Math.ceil(256 / (stoneSize + gap)) + 1;
  const cols = Math.ceil(256 / (stoneSize + gap)) + 1;

  for (let row = 0; row < rows; row++) {
    const rowOffset = (row % 2) * (stoneSize / 2 + gap / 2);

    for (let col = 0; col < cols; col++) {
      const baseX = col * (stoneSize + gap) + rowOffset - stoneSize / 2;
      const baseY = row * (stoneSize + gap) - stoneSize / 2;

      // Slight random offset for natural look
      const x = baseX + (Math.random() - 0.5) * 4;
      const y = baseY + (Math.random() - 0.5) * 4;

      // Vary stone size slightly
      const w = stoneSize + (Math.random() - 0.5) * 8;
      const h = stoneSize + (Math.random() - 0.5) * 8;

      // Pick a stone color
      const color = stoneColors[Math.floor(Math.random() * stoneColors.length)];

      // Draw rounded stone
      ctx.fillStyle = color;
      ctx.beginPath();

      // Irregular rounded rectangle
      const radius = 6 + Math.random() * 4;
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Add subtle 3D effect - highlight on top-left
      const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add some texture/wear marks
      if (Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.beginPath();
        ctx.arc(
          x + Math.random() * w,
          y + Math.random() * h,
          2 + Math.random() * 4,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Add some cracks/variations for realism
  ctx.strokeStyle = 'rgba(100, 90, 80, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 256, Math.random() * 256);
    ctx.lineTo(Math.random() * 256, Math.random() * 256);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Create sandy road texture
 */
function createSandyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Base sandy color
  ctx.fillStyle = '#e8d4a8';
  ctx.fillRect(0, 0, 128, 128);

  // Add varied sand grains
  const sandColors = ['#d4c098', '#c9b588', '#dcc8a0', '#e0d4b0', '#cfc298'];

  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = sandColors[Math.floor(Math.random() * sandColors.length)];
    ctx.globalAlpha = 0.3 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(
      Math.random() * 128,
      Math.random() * 128,
      0.5 + Math.random() * 2,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // Add some small pebbles
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(${130 + Math.random() * 40}, ${120 + Math.random() * 30}, ${100 + Math.random() * 20}, 0.5)`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * 128,
      Math.random() * 128,
      1 + Math.random() * 3,
      1 + Math.random() * 2,
      Math.random() * Math.PI,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  // Add subtle cart tracks/paths
  ctx.strokeStyle = 'rgba(180, 160, 120, 0.2)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(128, 42);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 88);
  ctx.lineTo(128, 86);
  ctx.stroke();

  return canvas;
}

/**
 * Create procedural road textures
 */
function createRoadMaterials() {
  // Roman Cobblestone
  const cobbleCanvas = createRomanCobblestoneTexture();
  const cobbleTexture = new THREE.CanvasTexture(cobbleCanvas);
  cobbleTexture.wrapS = THREE.RepeatWrapping;
  cobbleTexture.wrapT = THREE.RepeatWrapping;
  cobbleTexture.repeat.set(3, 3);
  cobbleTexture.anisotropy = 4;

  ROAD_MATERIALS.cobblestone = new THREE.MeshStandardMaterial({
    map: cobbleTexture,
    roughness: 0.85,
    metalness: 0.05,
    // Prevent z-fighting with polygon offset
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  // Sandy road
  const sandyCanvas = createSandyTexture();
  const sandyTexture = new THREE.CanvasTexture(sandyCanvas);
  sandyTexture.wrapS = THREE.RepeatWrapping;
  sandyTexture.wrapT = THREE.RepeatWrapping;
  sandyTexture.repeat.set(4, 4);
  sandyTexture.anisotropy = 4;

  ROAD_MATERIALS.sandy = new THREE.MeshStandardMaterial({
    map: sandyTexture,
    roughness: 0.95,
    // Prevent z-fighting
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });

  // Wooden planks (for bridges)
  const woodCanvas = document.createElement('canvas');
  woodCanvas.width = 128;
  woodCanvas.height = 64;
  const woodCtx = woodCanvas.getContext('2d');

  for (let i = 0; i < 4; i++) {
    const shade = 140 + Math.random() * 30;
    woodCtx.fillStyle = `rgb(${Math.floor(shade + 40)}, ${Math.floor(shade)}, ${Math.floor(shade - 40)})`;
    woodCtx.fillRect(0, i * 16, 128, 15);

    // Wood grain
    woodCtx.strokeStyle = 'rgba(80, 50, 20, 0.2)';
    for (let j = 0; j < 5; j++) {
      woodCtx.beginPath();
      woodCtx.moveTo(0, i * 16 + Math.random() * 15);
      woodCtx.lineTo(128, i * 16 + Math.random() * 15);
      woodCtx.stroke();
    }
  }

  const woodTexture = new THREE.CanvasTexture(woodCanvas);
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(8, 4);

  ROAD_MATERIALS.wooden = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8
  });
}

/**
 * Create curb/border stones along the road edges
 */
function createRoadCurbs(streetData, roadGroup, yPosition = 0.12) {
  const length = Math.sqrt(
    Math.pow(streetData.end.x - streetData.start.x, 2) +
    Math.pow(streetData.end.z - streetData.start.z, 2)
  );

  const angle = Math.atan2(
    streetData.end.z - streetData.start.z,
    streetData.end.x - streetData.start.x
  );

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0xd0c8b8,
    roughness: 0.9
  });

  const curbHeight = 0.08;
  const curbWidth = 0.15;

  // Create curbs on both sides
  [-1, 1].forEach(side => {
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(length, curbHeight, curbWidth),
      curbMat
    );

    const centerX = (streetData.start.x + streetData.end.x) / 2;
    const centerZ = (streetData.start.z + streetData.end.z) / 2;

    // Offset perpendicular to road direction
    const perpX = -Math.sin(angle) * (streetData.width / 2 + curbWidth / 2) * side;
    const perpZ = Math.cos(angle) * (streetData.width / 2 + curbWidth / 2) * side;

    curb.position.set(
      centerX + perpX,
      yPosition + curbHeight / 2,
      centerZ + perpZ
    );
    curb.rotation.y = angle;
    curb.castShadow = true;
    curb.receiveShadow = true;

    roadGroup.add(curb);
  });
}

/**
 * Create a single street segment
 */
function createStreet(streetData, yPosition = 0.12) {
  const group = new THREE.Group();

  const length = Math.sqrt(
    Math.pow(streetData.end.x - streetData.start.x, 2) +
    Math.pow(streetData.end.z - streetData.start.z, 2)
  );

  // Clone material so texture repeat can be adjusted per road
  const material = ROAD_MATERIALS[streetData.type].clone();

  // Adjust texture repeat based on road dimensions
  if (material.map) {
    material.map = material.map.clone();
    const repeatX = length / 8;
    const repeatY = streetData.width / 3;
    material.map.repeat.set(repeatX, repeatY);
    material.map.needsUpdate = true;
  }

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(length, streetData.width),
    material
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(
    (streetData.start.x + streetData.end.x) / 2,
    yPosition, // Use passed Y position
    (streetData.start.z + streetData.end.z) / 2
  );

  // Rotate to match direction
  const angle = Math.atan2(
    streetData.end.z - streetData.start.z,
    streetData.end.x - streetData.start.x
  );
  road.rotation.z = -angle;
  road.receiveShadow = true;
  group.add(road);

  // Add curbs for cobblestone roads (skip near intersections)
  if (streetData.type === 'cobblestone') {
    createRoadCurbs(streetData, group, yPosition);
  }

  return group;
}

/**
 * Create an intersection tile where roads cross
 */
function createIntersectionTile(x, z, size, type = 'cobblestone') {
  // Clone material for this intersection
  const material = ROAD_MATERIALS[type].clone();

  if (material.map) {
    material.map = material.map.clone();
    material.map.repeat.set(size / 3, size / 3);
    material.map.needsUpdate = true;
  }

  // Use stronger polygon offset for intersections
  material.polygonOffset = true;
  material.polygonOffsetFactor = -2;
  material.polygonOffsetUnits = -2;

  const tile = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    material
  );
  tile.rotation.x = -Math.PI / 2;
  tile.position.set(x, 0.14, z); // Intersection tiles sit highest
  tile.receiveShadow = true;

  return tile;
}

/**
 * Create a street sign with post
 */
function createStreetSign(name, position, rotation = 0) {
  const group = new THREE.Group();

  // Post - ornate iron style
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    metalness: 0.6,
    roughness: 0.4
  });
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 2.5, 8),
    postMat
  );
  post.position.y = 1.25;
  post.castShadow = true;
  group.add(post);

  // Decorative rings on post
  [0.5, 1.0, 1.5].forEach(y => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.02, 6, 12),
      postMat
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  });

  // Sign board - elegant dark green
  const signMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a });
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.55, 0.08),
    signMat
  );
  sign.position.y = 2.3;
  sign.castShadow = true;
  group.add(sign);

  // Gold trim around sign
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.7,
    roughness: 0.3
  });
  const trim = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.65, 0.06),
    trimMat
  );
  trim.position.y = 2.3;
  trim.position.z = -0.02;
  group.add(trim);

  // Text
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5eedd';
  ctx.font = 'bold 26px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);

  const textTexture = new THREE.CanvasTexture(canvas);
  const textMat = new THREE.SpriteMaterial({ map: textTexture });
  const text = new THREE.Sprite(textMat);
  text.scale.set(2.1, 0.52, 1);
  text.position.y = 2.3;
  text.position.z = 0.05;
  group.add(text);

  // Decorative top - gold finial
  const finialBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8),
    trimMat
  );
  finialBase.position.y = 2.55;
  group.add(finialBase);

  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    trimMat
  );
  finial.position.y = 2.7;
  group.add(finial);

  const spike = new THREE.Mesh(
    new THREE.ConeGeometry(0.04, 0.15, 6),
    trimMat
  );
  spike.position.y = 2.85;
  group.add(spike);

  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;

  return group;
}

/**
 * Create all streets and signs
 */
export function createAllStreets() {
  createRoadMaterials();

  const MAIN_STREET_Y = 0.12;
  const CROSS_STREET_Y = 0.10;

  // Create main streets (east-west, higher Y)
  STREETS.main.forEach(street => {
    const streetMesh = createStreet(street, MAIN_STREET_Y);
    scene.add(streetMesh);
    streetMeshes.push(streetMesh);

    // Add signs
    if (street.signPositions) {
      street.signPositions.forEach(pos => {
        const sign = createStreetSign(street.name, pos);
        scene.add(sign);
        streetSignGroups.push(sign);
      });
    }
  });

  // Create cross streets (north-south, lower Y)
  STREETS.cross.forEach(street => {
    const streetMesh = createStreet(street, CROSS_STREET_Y);
    scene.add(streetMesh);
    streetMeshes.push(streetMesh);
  });

  // Create intersection tiles where main and cross streets meet
  STREETS.main.forEach(mainStreet => {
    STREETS.cross.forEach(crossStreet => {
      // Find intersection point
      const mainZ = mainStreet.start.z; // Main streets are horizontal, constant Z
      const crossX = crossStreet.start.x; // Cross streets are vertical, constant X

      // Check if cross street spans the main street's Z position
      const crossMinZ = Math.min(crossStreet.start.z, crossStreet.end.z);
      const crossMaxZ = Math.max(crossStreet.start.z, crossStreet.end.z);

      // Check if main street spans the cross street's X position
      const mainMinX = Math.min(mainStreet.start.x, mainStreet.end.x);
      const mainMaxX = Math.max(mainStreet.start.x, mainStreet.end.x);

      if (mainZ >= crossMinZ && mainZ <= crossMaxZ &&
          crossX >= mainMinX && crossX <= mainMaxX) {
        // There is an intersection! Create a tile
        const tileSize = Math.max(mainStreet.width, crossStreet.width) + 1;

        // Use cobblestone if either road is cobblestone
        const type = (mainStreet.type === 'cobblestone' || crossStreet.type === 'cobblestone')
          ? 'cobblestone' : 'sandy';

        const tile = createIntersectionTile(crossX, mainZ, tileSize, type);
        scene.add(tile);
        intersectionTiles.push(tile);
      }
    });
  });

  return { streetMeshes, streetSignGroups, intersectionTiles };
}

/**
 * Check if position is on a street
 */
export function isOnStreet(x, z, buffer = 0.5) {
  const allStreets = [...STREETS.main, ...STREETS.cross];

  for (const street of allStreets) {
    const halfWidth = street.width / 2 + buffer;

    // Calculate if point is within street bounds
    const dx = street.end.x - street.start.x;
    const dz = street.end.z - street.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    // Normalize direction
    const dirX = dx / length;
    const dirZ = dz / length;

    // Vector from start to point
    const px = x - street.start.x;
    const pz = z - street.start.z;

    // Projection onto street direction
    const projection = px * dirX + pz * dirZ;

    // Check if within street length
    if (projection < -buffer || projection > length + buffer) continue;

    // Perpendicular distance
    const perpDist = Math.abs(-dirZ * px + dirX * pz);

    if (perpDist <= halfWidth) {
      return true;
    }
  }

  return false;
}

// Export materials for use by bridges
export { ROAD_MATERIALS };
