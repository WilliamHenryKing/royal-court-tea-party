// Building NPCs - NPCs that stand in front of buildings and give lore/info
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { BUILDING_NPCS } from '../assets/data.js';
import { SHOP_POSITIONS } from './shops.js';
import { BOXING_RING_DATA } from './activities.js';
import { FISHING_DOCK_POS } from './river.js';

// Store building NPCs
export const buildingNpcs = {};

// Building positions for camera zoom (includes sign positions)
export const BUILDING_CAMERA_TARGETS = {
  pinkieSchool: {
    npcOffset: { x: 0, z: 3 }, // NPC stands in front
    cameraOffset: { x: 8, y: 3.5, z: 10 }, // Camera position relative to NPC
    lookAtOffset: { x: -2, y: 2, z: -2 }, // Look at the building and NPC
    buildingPos: SHOP_POSITIONS.pinkieSchool
  },
  boxingRing: {
    npcOffset: { x: 5, z: 0 }, // NPC near announcer booth
    cameraOffset: { x: -8, y: 3.5, z: 8 },
    lookAtOffset: { x: 2, y: 1.5, z: 0 },
    buildingPos: BOXING_RING_DATA.position
  },
  fishingDock: {
    npcOffset: { x: 3, z: 2 },
    cameraOffset: { x: -6, y: 3, z: 8 },
    lookAtOffset: { x: 2, y: 1, z: -2 },
    buildingPos: FISHING_DOCK_POS
  },
  donutShop: {
    npcOffset: { x: 0, z: 4 },
    cameraOffset: { x: 6, y: 4, z: 10 },
    lookAtOffset: { x: 0, y: 2.5, z: -2 },
    buildingPos: SHOP_POSITIONS.donutShop
  },
  teaCoffeeBattle: {
    npcOffset: { x: 0, z: -3 },
    cameraOffset: { x: -8, y: 4, z: 6 },
    lookAtOffset: { x: 4, y: 2, z: 0 },
    buildingPos: { x: 18, z: -2 } // War zone position
  }
};

/**
 * Create a building NPC with distinctive appearance
 */
function createBuildingNPCModel(npcData) {
  const group = new THREE.Group();
  const skinColor = 0xffeedd;

  // Body - unique outfit based on character
  const bodyMat = new THREE.MeshStandardMaterial({ color: npcData.color });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 1, 12),
    bodyMat
  );
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  // Head
  const headMat = new THREE.MeshStandardMaterial({ color: skinColor });
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    headMat
  );
  head.position.y = 1.4;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  [-0.08, 0.08].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      eyeMat
    );
    eye.position.set(x, 1.45, 0.2);
    group.add(eye);
  });

  // Character-specific features
  addCharacterFeatures(group, npcData);

  // Floating indicator (golden sphere above head)
  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.5
    })
  );
  indicator.position.y = 1.9;
  indicator.userData.isIndicator = true;
  group.add(indicator);

  return group;
}

/**
 * Add character-specific features based on NPC type
 */
function addCharacterFeatures(group, npcData) {
  switch (npcData.id) {
    case 'pinkieSchool':
      // Madame Pinkie - elegant teacher with monocle and proper pose
      // Hair bun
      const bunMat = new THREE.MeshStandardMaterial({ color: 0x2d1b1a });
      const bun = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 10, 10),
        bunMat
      );
      bun.position.set(0, 1.55, -0.1);
      group.add(bun);

      // Monocle
      const monocle = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.01, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
      );
      monocle.position.set(0.12, 1.48, 0.25);
      monocle.rotation.y = 0.2;
      group.add(monocle);

      // Pinkie hand extended (the signature!)
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.15, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffeedd })
      );
      hand.position.set(0.5, 1, 0.3);
      hand.rotation.z = -0.8; // Extended pinkie pose!
      group.add(hand);

      // Pinkie finger (extended at 45 degrees!)
      const pinkie = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.012, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0xffeedd })
      );
      pinkie.position.set(0.55, 1.08, 0.33);
      pinkie.rotation.z = -Math.PI / 4; // 45 degrees!
      group.add(pinkie);
      break;

    case 'boxingRing':
      // Duke Dramatic - announcer with microphone and fancy hat
      // Top hat
      const hatBrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      hatBrim.position.y = 1.6;
      group.add(hatBrim);

      const hatTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
      );
      hatTop.position.y = 1.75;
      group.add(hatTop);

      // Gold band on hat
      const hatBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd700 })
      );
      hatBand.position.y = 1.65;
      group.add(hatBand);

      // Microphone
      const micHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.025, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      micHandle.position.set(0.35, 1.1, 0.2);
      micHandle.rotation.z = -0.5;
      group.add(micHandle);

      const micHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6 })
      );
      micHead.position.set(0.42, 1.22, 0.22);
      group.add(micHead);
      break;

    case 'fishingDock':
      // Captain Catch - sailor with captain's hat and fishing rod
      // Captain hat
      const capBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.22, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a3a5c })
      );
      capBase.position.y = 1.58;
      group.add(capBase);

      const capTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0x1a3a5c })
      );
      capTop.position.y = 1.68;
      group.add(capTop);

      // Cap emblem (anchor shape - simplified as gold circle)
      const emblem = new THREE.Mesh(
        new THREE.CircleGeometry(0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, side: THREE.DoubleSide })
      );
      emblem.position.set(0, 1.62, 0.22);
      group.add(emblem);

      // Fishing rod
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      rod.position.set(-0.3, 1.2, 0);
      rod.rotation.z = 0.4;
      rod.rotation.x = -0.2;
      group.add(rod);

      // Beard
      const beard = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      beard.position.set(0, 1.28, 0.12);
      beard.scale.set(1, 1.3, 0.6);
      group.add(beard);
      break;

    case 'donutShop':
      // Donut Daisy - cheerful baker with chef hat and apron
      // Chef toque (tall hat)
      const toqueBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.22, 0.08, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      toqueBase.position.y = 1.6;
      group.add(toqueBase);

      const toquePuff = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      toquePuff.position.y = 1.75;
      toquePuff.scale.y = 1.5;
      group.add(toquePuff);

      // Apron
      const apron = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffb6c1, side: THREE.DoubleSide })
      );
      apron.position.set(0, 0.5, 0.36);
      group.add(apron);

      // Holding a donut
      const donutInHand = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.05, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xff69b4 })
      );
      donutInHand.position.set(0.4, 0.9, 0.25);
      donutInHand.rotation.x = Math.PI / 2;
      group.add(donutInHand);

      // Sprinkles on donut
      const sprinkleColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const sprinkle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, 0.03, 4),
          new THREE.MeshStandardMaterial({ color: sprinkleColors[i % 4] })
        );
        sprinkle.position.set(
          0.4 + Math.cos(angle) * 0.1,
          0.95,
          0.25 + Math.sin(angle) * 0.1
        );
        sprinkle.rotation.x = Math.random() * Math.PI;
        group.add(sprinkle);
      }
      break;

    case 'teaCoffeeBattle':
      // Sir Neutral - scholar with glasses, holding both tea and coffee
      // Glasses
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      [-0.1, 0.1].forEach(x => {
        const lens = new THREE.Mesh(
          new THREE.TorusGeometry(0.06, 0.01, 6, 12),
          glassesMat
        );
        lens.position.set(x, 1.46, 0.24);
        group.add(lens);
      });

      // Glasses bridge
      const bridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.1, 4),
        glassesMat
      );
      bridge.position.set(0, 1.46, 0.24);
      bridge.rotation.z = Math.PI / 2;
      group.add(bridge);

      // Scholar's cap/beret
      const beret = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
      );
      beret.position.y = 1.58;
      beret.rotation.x = 0.2;
      group.add(beret);

      // Tea cup in left hand
      const teaCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff0f5 })
      );
      teaCup.position.set(-0.4, 0.9, 0.2);
      group.add(teaCup);

      // Tea inside
      const tea = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8),
        new THREE.MeshStandardMaterial({ color: 0xc9a86c })
      );
      tea.position.set(-0.4, 0.95, 0.2);
      group.add(tea);

      // Coffee cup in right hand
      const coffeeCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x3d2314 })
      );
      coffeeCup.position.set(0.4, 0.9, 0.2);
      group.add(coffeeCup);

      // Coffee inside
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8),
        new THREE.MeshStandardMaterial({ color: 0x2d1b14 })
      );
      coffee.position.set(0.4, 0.97, 0.2);
      group.add(coffee);
      break;
  }
}

/**
 * Create all building NPCs
 */
export function createBuildingNPCs() {
  Object.entries(BUILDING_NPCS).forEach(([id, npcData]) => {
    const npc = createBuildingNPCModel(npcData);

    // Position based on NPC data
    npc.position.set(
      npcData.position.x,
      0,
      npcData.position.z
    );

    // Face forward (toward where player would approach)
    npc.rotation.y = Math.PI; // Face south by default

    // Store NPC data for interaction
    npc.userData = {
      id: id,
      name: npcData.name,
      role: npcData.role,
      isBuildingNPC: true,
      walkSpeed: 0, // Stationary
      lastQuote: Date.now(),
      chatOffset: Math.random() * 5000
    };

    scene.add(npc);
    buildingNpcs[id] = npc;
  });

  // Adjust individual NPC rotations to face the approach path
  if (buildingNpcs.pinkieSchool) {
    buildingNpcs.pinkieSchool.rotation.y = Math.PI; // Face south
  }
  if (buildingNpcs.boxingRing) {
    buildingNpcs.boxingRing.rotation.y = -Math.PI / 2; // Face east toward ring
  }
  if (buildingNpcs.fishingDock) {
    buildingNpcs.fishingDock.rotation.y = Math.PI / 6; // Angled toward river
  }
  if (buildingNpcs.donutShop) {
    buildingNpcs.donutShop.rotation.y = Math.PI; // Face south
  }
  if (buildingNpcs.teaCoffeeBattle) {
    buildingNpcs.teaCoffeeBattle.rotation.y = 0; // Face north toward cafes
  }

  return buildingNpcs;
}

/**
 * Update building NPC animations
 */
export function updateBuildingNPCs(time, delta) {
  Object.values(buildingNpcs).forEach(npc => {
    // Gentle idle animation
    npc.position.y = Math.sin(time * 2 + npc.userData.chatOffset * 0.001) * 0.02;

    // Indicator float animation
    const indicator = npc.children.find(child => child.userData?.isIndicator);
    if (indicator) {
      indicator.position.y = 1.9 + Math.sin(time * 3) * 0.1;
      indicator.rotation.y = time * 2;
    }

    // Character-specific animations
    switch (npc.userData.id) {
      case 'pinkieSchool':
        // Slight pinkie waggle
        const pinkieFinger = npc.children.find(c =>
          c.geometry?.parameters?.radiusTop === 0.015
        );
        if (pinkieFinger) {
          pinkieFinger.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.1;
        }
        break;

      case 'boxingRing':
        // Excited commentary bounce
        npc.rotation.z = Math.sin(time * 4) * 0.05;
        break;

      case 'fishingDock':
        // Rod casting motion
        const rod = npc.children.find(c =>
          c.geometry?.parameters?.height === 1.5
        );
        if (rod) {
          rod.rotation.z = 0.4 + Math.sin(time * 0.5) * 0.1;
        }
        break;

      case 'donutShop':
        // Cheerful bounce
        npc.position.y = Math.abs(Math.sin(time * 3)) * 0.05;
        break;

      case 'teaCoffeeBattle':
        // Alternating sips animation (looking left and right)
        npc.rotation.y = Math.sin(time * 0.3) * 0.3;
        break;
    }
  });
}

/**
 * Get building NPC by ID
 */
export function getBuildingNPC(id) {
  return buildingNpcs[id] || null;
}

/**
 * Get camera target info for a building NPC
 */
export function getBuildingCameraTarget(npcId) {
  return BUILDING_CAMERA_TARGETS[npcId] || null;
}
