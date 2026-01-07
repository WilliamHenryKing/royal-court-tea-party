// Streets - Austinville street system with cobblestone, sandy roads, and signs
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

/**
 * Create procedural road textures
 */
function createRoadMaterials() {
  // Cobblestone - create procedural texture
  const cobbleCanvas = document.createElement('canvas');
  cobbleCanvas.width = 128;
  cobbleCanvas.height = 128;
  const cobbleCtx = cobbleCanvas.getContext('2d');

  // Base color
  cobbleCtx.fillStyle = '#a0a0a0';
  cobbleCtx.fillRect(0, 0, 128, 128);

  // Draw stones
  const stoneColors = ['#888888', '#909090', '#989898', '#a8a8a8', '#b0b0b0'];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const offsetX = (y % 2) * 8;
      cobbleCtx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
      cobbleCtx.beginPath();
      // Round rectangle
      const rx = x * 16 + offsetX + 1;
      const ry = y * 16 + 1;
      const rw = 14;
      const rh = 14;
      const radius = 3;
      cobbleCtx.moveTo(rx + radius, ry);
      cobbleCtx.lineTo(rx + rw - radius, ry);
      cobbleCtx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
      cobbleCtx.lineTo(rx + rw, ry + rh - radius);
      cobbleCtx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
      cobbleCtx.lineTo(rx + radius, ry + rh);
      cobbleCtx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
      cobbleCtx.lineTo(rx, ry + radius);
      cobbleCtx.quadraticCurveTo(rx, ry, rx + radius, ry);
      cobbleCtx.closePath();
      cobbleCtx.fill();

      // Add slight shadow
      cobbleCtx.fillStyle = 'rgba(0,0,0,0.1)';
      cobbleCtx.fillRect(x * 16 + offsetX + 1, y * 16 + 12, 14, 4);
    }
  }

  const cobbleTexture = new THREE.CanvasTexture(cobbleCanvas);
  cobbleTexture.wrapS = THREE.RepeatWrapping;
  cobbleTexture.wrapT = THREE.RepeatWrapping;
  cobbleTexture.repeat.set(4, 4);

  ROAD_MATERIALS.cobblestone = new THREE.MeshStandardMaterial({
    map: cobbleTexture,
    roughness: 0.9
  });

  // Sandy road
  const sandyCanvas = document.createElement('canvas');
  sandyCanvas.width = 64;
  sandyCanvas.height = 64;
  const sandyCtx = sandyCanvas.getContext('2d');
  sandyCtx.fillStyle = '#e8d4a8';
  sandyCtx.fillRect(0, 0, 64, 64);

  // Add grain
  for (let i = 0; i < 200; i++) {
    sandyCtx.fillStyle = `rgba(139, 119, 80, ${Math.random() * 0.3})`;
    sandyCtx.fillRect(
      Math.random() * 64,
      Math.random() * 64,
      1 + Math.random() * 2,
      1 + Math.random() * 2
    );
  }

  const sandyTexture = new THREE.CanvasTexture(sandyCanvas);
  sandyTexture.wrapS = THREE.RepeatWrapping;
  sandyTexture.wrapT = THREE.RepeatWrapping;
  sandyTexture.repeat.set(6, 6);

  ROAD_MATERIALS.sandy = new THREE.MeshStandardMaterial({
    map: sandyTexture,
    roughness: 0.95
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
 * Create a single street segment
 */
function createStreet(streetData) {
  const group = new THREE.Group();

  const length = Math.sqrt(
    Math.pow(streetData.end.x - streetData.start.x, 2) +
    Math.pow(streetData.end.z - streetData.start.z, 2)
  );

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(length, streetData.width),
    ROAD_MATERIALS[streetData.type]
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(
    (streetData.start.x + streetData.end.x) / 2,
    0.02,
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

  return group;
}

/**
 * Create a street sign with post
 */
function createStreetSign(name, position, rotation = 0) {
  const group = new THREE.Group();

  // Post
  const postMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.5, 8),
    postMat
  );
  post.position.y = 1.25;
  post.castShadow = true;
  group.add(post);

  // Sign board
  const signMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 0.1),
    signMat
  );
  sign.position.y = 2.3;
  sign.castShadow = true;
  group.add(sign);

  // Text (using sprite)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5f5dc';
  ctx.font = 'bold 28px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);

  const textTexture = new THREE.CanvasTexture(canvas);
  const textMat = new THREE.SpriteMaterial({ map: textTexture });
  const text = new THREE.Sprite(textMat);
  text.scale.set(2, 0.5, 1);
  text.position.y = 2.3;
  text.position.z = 0.06;
  group.add(text);

  // Decorative top (gold ball)
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  top.position.y = 2.6;
  group.add(top);

  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;

  return group;
}

/**
 * Create all streets and signs
 */
export function createAllStreets() {
  createRoadMaterials();

  // Create main streets
  STREETS.main.forEach(street => {
    const streetMesh = createStreet(street);
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

  // Create cross streets
  STREETS.cross.forEach(street => {
    const streetMesh = createStreet(street);
    scene.add(streetMesh);
    streetMeshes.push(streetMesh);
  });

  return { streetMeshes, streetSignGroups };
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
