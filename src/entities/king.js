// King Ben and Royal Guards - The Royal Promenade
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { checkCollision } from '../entities/world.js';
import { npcs } from './npcs.js';
import { collisionManager, COLLISION_LAYERS } from '../systems/CollisionManager.js';

// King Ben configuration
export const KING_BEN = {
  name: "King Ben",
  title: "His Royal Highness",
  role: "King of Austinville & Professional Crown Wearer",
  position: { x: 5, z: 5 },

  // Standard quotes when interacting
  quotes: [
    "Being king is hard work. I had to wave TWICE today.",
    "My crown is heavy. That's why I walk so slowly. Definitely not because I'm lost.",
    "I once got lost in my own palace. The guards still talk about it.",
    "The secret to royalty? Nod wisely at everything. Works every time.",
    "I practiced my royal wave for 7 years. Worth it? Absolutely.",
    "Tea parties are the backbone of diplomacy. And my diet.",
    "My scepter? It's for pointing at things regally. Very useful.",
    "I've been told I have 'kingly presence'. I think they mean I take up space."
  ],

  // Special quotes when near Queen Bee
  queenQuotes: [
    "Ah, my Queen! The most radiant bee in all the land!",
    "Queen Bee, your tea parties are legendary! Almost as legendary as your beauty!",
    "Every kingdom needs a queen. I'm lucky mine comes with excellent pastries.",
    "Did I mention you look lovely today? I meant to. Consider it mentioned!",
    "Your Majesty, the kingdom flourishes under your... um... tea-related leadership!",
    "They say behind every great king is a queen. I prefer beside. Better view.",
    "My dear, shall we stroll? I mean... REGALLY PROMENADE?"
  ],

  // Guard commands
  guardCommands: [
    "Guards! Look... regal!",
    "Formation! The pointy one!",
    "Protect the royal tea supplies!",
    "At ease! ...whatever that means.",
    "Eyes forward! ...wait, which way is forward?"
  ],

  // Enhanced route around town - visits more locations
  patrolRoute: [
    { x: 5, z: 5 },       // Start near palace
    { x: 12, z: -5 },     // Tea Shop visit
    { x: 20, z: 0 },      // East street
    { x: 25, z: 10 },     // East park area
    { x: 20, z: 20 },     // Northeast
    { x: 0, z: 25 },      // North plaza
    { x: 0, z: 15 },      // Speakers area
    { x: -10, z: 15 },    // Near speakers
    { x: -20, z: 20 },    // Northwest
    { x: -25, z: 10 },    // West park
    { x: -20, z: 0 },     // West street
    { x: -10, z: 5 },     // Guests hall
    { x: -10, z: -5 },    // Feast hall
    { x: -15, z: -15 },   // Southwest
    { x: 0, z: -15 },     // South street
    { x: 10, z: -10 },    // Southeast
    { x: 0, z: 0 },       // Central plaza
    { x: 5, z: 5 }        // Return to palace
  ]
};

// Store references
export let kingBen = null;
export const royalGuards = [];

/**
 * Create King Ben character
 */
export function createKingBen() {
  const group = new THREE.Group();

  // Materials
  const robeMat = new THREE.MeshStandardMaterial({
    color: 0x800020, // Burgundy
    roughness: 0.6
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xffd700, // Gold
    metalness: 0.7,
    roughness: 0.3
  });
  const furMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6 }); // Ermine
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });

  // === GRAND ROYAL ROBE ===
  // Flowing robe/cape
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(1, 1.8, 12, 1, true),
    robeMat
  );
  robe.position.y = 0.8;
  robe.rotation.x = Math.PI;
  robe.castShadow = true;
  group.add(robe);

  // Fur trim at collar
  const furCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.1, 8, 16),
    furMat
  );
  furCollar.position.y = 1.4;
  furCollar.rotation.x = Math.PI / 2;
  group.add(furCollar);

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.7, 12),
    robeMat
  );
  body.position.y = 1.1;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 14),
    skinMat
  );
  head.position.y = 1.75;
  head.castShadow = true;
  group.add(head);

  // Beard
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a3728 })
  );
  beard.position.set(0, 1.55, 0.15);
  beard.rotation.x = Math.PI;
  group.add(beard);

  // === THE MAGNIFICENT CROWN ===
  const crownGroup = new THREE.Group();

  // Crown base
  const crownBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.18, 8),
    trimMat
  );
  crownBase.position.y = 2.05;
  crownGroup.add(crownBase);

  // Crown points (taller than normal)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const point = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.35, 4),
      trimMat
    );
    point.position.set(
      Math.cos(angle) * 0.22,
      2.28,
      Math.sin(angle) * 0.22
    );
    crownGroup.add(point);

    // Jewels on points
    const jewelColors = [0xff0000, 0x0000ff, 0x00ff00, 0xff00ff, 0x00ffff, 0xffff00];
    const jewel = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({
        color: jewelColors[i],
        emissive: jewelColors[i],
        emissiveIntensity: 0.3
      })
    );
    jewel.position.set(
      Math.cos(angle) * 0.22,
      2.08,
      Math.sin(angle) * 0.22
    );
    crownGroup.add(jewel);
  }

  // Center orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.2
    })
  );
  orb.position.y = 2.5;
  crownGroup.add(orb);

  group.add(crownGroup);

  // === THE ROYAL SCEPTER ===
  const scepterGroup = new THREE.Group();

  // Staff
  const staff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8),
    trimMat
  );
  scepterGroup.add(staff);

  // Top orb
  const scepterOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    })
  );
  scepterOrb.position.y = 0.75;
  scepterGroup.add(scepterOrb);

  // Decorative rings
  [-0.3, 0, 0.3].forEach(y => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 12),
      trimMat
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    scepterGroup.add(ring);
  });

  scepterGroup.position.set(0.5, 1, 0.2);
  scepterGroup.rotation.z = 0.2;
  group.add(scepterGroup);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  [-0.1, 0.1].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      eyeMat
    );
    eye.position.set(x, 1.8, 0.3);
    group.add(eye);
  });

  // Friendly smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x8b0000 })
  );
  smile.position.set(0, 1.65, 0.32);
  smile.rotation.x = Math.PI;
  group.add(smile);

  // Indicator (floating crown icon)
  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9
    })
  );
  indicator.position.y = 2.9;
  indicator.userData.isIndicator = true;
  group.add(indicator);

  group.position.set(KING_BEN.position.x, 0, KING_BEN.position.z);

  group.userData = {
    ...KING_BEN,
    currentWaypoint: 0,
    walkSpeed: 0.6, // Stately pace
    waitTimer: 0,
    isWaiting: false,
    nearQueenBee: false,
    lastQueenComment: 0,
    guards: [],
    scepterGroup,
    crownGroup,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 5000
  };

  scene.add(group);
  kingBen = group;

  return group;
}

/**
 * Create a Royal Guard
 */
export function createRoyalGuard(index) {
  const group = new THREE.Group();

  const armorMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    metalness: 0.8,
    roughness: 0.3
  });
  const plumeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  // Body (armor)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.65, 8),
    armorMat
  );
  body.position.y = 0.85;
  body.castShadow = true;
  group.add(body);

  // Head (helmet)
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    armorMat
  );
  helmet.position.y = 1.4;
  helmet.castShadow = true;
  group.add(helmet);

  // Helmet plume
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.4, 6),
    plumeMat
  );
  plume.position.set(0, 1.75, -0.1);
  plume.rotation.x = 0.3;
  group.add(plume);

  // Visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.08, 0.1),
    armorMat
  );
  visor.position.set(0, 1.35, 0.25);
  group.add(visor);

  // Spear
  const spear = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  spear.add(shaft);

  const spearHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.25, 4),
    armorMat
  );
  spearHead.position.y = 1.05;
  spear.add(spearHead);

  spear.position.set(0.35, 1, 0);
  group.add(spear);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f });
  [-0.12, 0.12].forEach(x => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6),
      legMat
    );
    leg.position.set(x, 0.25, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  group.userData = {
    name: `Guard ${index + 1}`,
    role: "Royal Protector",
    quotes: [
      "*stoic silence*",
      "*more stoic silence*",
      "*quietly wonders about lunch*",
      "*maintains formation... mostly*",
      "*accidentally makes eye contact* *panics*"
    ],
    formationOffset: index,
    spear,
    plume,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 5000
  };

  return group;
}

/**
 * Create the King's entourage (King + 4 Guards)
 */
export function createKingEntourage() {
  const king = createKingBen();

  // Create 4 guards
  for (let i = 0; i < 4; i++) {
    const guard = createRoyalGuard(i);
    scene.add(guard);
    royalGuards.push(guard);
    king.userData.guards.push(guard);
  }

  return { king, guards: royalGuards };
}

/**
 * Update King Ben and his guards
 */
export function updateKingAndGuards(time, delta, camera) {
  if (!kingBen) return;

  const data = kingBen.userData;

  // Register King with collision system
  if (!data.collisionId) {
    data.collisionId = 'king_ben';
    collisionManager.registerEntity(data.collisionId, kingBen, 0.5, COLLISION_LAYERS.NPC);
  }

  // === PATROL ROUTE ===
  if (!data.isWaiting) {
    const target = data.patrolRoute[data.currentWaypoint];
    const dx = target.x - kingBen.position.x;
    const dz = target.z - kingBen.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 1) {
      // Reached waypoint
      data.isWaiting = true;
      data.waitTimer = 3 + Math.random() * 4; // Pause regally
      data.currentWaypoint = (data.currentWaypoint + 1) % data.patrolRoute.length;
    } else {
      // Move toward waypoint
      const moveX = (dx / dist) * data.walkSpeed * delta;
      const moveZ = (dz / dist) * data.walkSpeed * delta;

      const targetX = kingBen.position.x + moveX;
      const targetZ = kingBen.position.z + moveZ;

      // Use new collision system with sliding
      const validated = collisionManager.getValidatedPosition(
        data.collisionId,
        targetX,
        targetZ,
        0.5,
        true
      );

      kingBen.position.x = validated.x;
      kingBen.position.z = validated.z;

      // Face movement direction
      kingBen.rotation.y = Math.atan2(dx, dz);

      // Stately walk animation
      kingBen.position.y = Math.abs(Math.sin(time * 4)) * 0.05;
      kingBen.rotation.z = Math.sin(time * 4) * 0.03;

      // Scepter sway
      if (data.scepterGroup) {
        data.scepterGroup.rotation.z = 0.2 + Math.sin(time * 2) * 0.1;
      }
    }
  } else {
    data.waitTimer -= delta;
    if (data.waitTimer <= 0) {
      data.isWaiting = false;

      // Occasionally give a guard command
      if (Math.random() < 0.3) {
        const command = data.guardCommands[Math.floor(Math.random() * data.guardCommands.length)];
        showKingMessage(kingBen, command, camera);
      }
    }

    // Idle animation
    kingBen.position.y = Math.sin(time * 1.5) * 0.02;
  }

  // === CHECK IF NEAR QUEEN BEE ===
  const queenBee = npcs['palace'];
  if (queenBee) {
    const distToQueen = kingBen.position.distanceTo(queenBee.position);

    if (distToQueen < 5) {
      if (!data.nearQueenBee) {
        data.nearQueenBee = true;
        // First time approaching - give compliment!
        const now = Date.now();
        if (now - data.lastQueenComment > 15000) {
          data.lastQueenComment = now;
          const quote = data.queenQuotes[Math.floor(Math.random() * data.queenQuotes.length)];
          showKingMessage(kingBen, quote, camera, true);
        }
      }

      // Face the Queen
      kingBen.rotation.y = Math.atan2(
        queenBee.position.x - kingBen.position.x,
        queenBee.position.z - kingBen.position.z
      );

      // Bow slightly
      kingBen.rotation.x = 0.1;

    } else {
      data.nearQueenBee = false;
      kingBen.rotation.x = THREE.MathUtils.lerp(kingBen.rotation.x, 0, 0.1);
    }
  }

  // === UPDATE GUARDS - FOLLOW IN FORMATION ===
  data.guards.forEach((guard, i) => {
    // Diamond formation around king
    const formationAngles = [
      Math.PI / 4,
      3 * Math.PI / 4,
      5 * Math.PI / 4,
      7 * Math.PI / 4
    ];
    const formationDist = 2;

    const targetX = kingBen.position.x + Math.sin(kingBen.rotation.y + formationAngles[i]) * formationDist;
    const targetZ = kingBen.position.z + Math.cos(kingBen.rotation.y + formationAngles[i]) * formationDist;

    // Move toward formation position
    const gdx = targetX - guard.position.x;
    const gdz = targetZ - guard.position.z;
    const gDist = Math.sqrt(gdx * gdx + gdz * gdz);

    if (gDist > 0.3) {
      guard.position.x += (gdx / gDist) * data.walkSpeed * 1.2 * delta;
      guard.position.z += (gdz / gDist) * data.walkSpeed * 1.2 * delta;

      // March animation
      guard.position.y = Math.abs(Math.sin(time * 6 + i)) * 0.08;
      guard.rotation.z = Math.sin(time * 6 + i) * 0.05;
    }

    // Face same direction as king
    guard.rotation.y = THREE.MathUtils.lerp(guard.rotation.y, kingBen.rotation.y, 0.1);

    // Spear bob
    if (guard.userData.spear) {
      guard.userData.spear.rotation.x = Math.sin(time * 3 + i) * 0.05;
    }
  });

  // Crown float/bob
  if (data.crownGroup) {
    data.crownGroup.position.y = Math.sin(time * 2) * 0.02;
    data.crownGroup.rotation.y = Math.sin(time * 0.5) * 0.03;
  }

  // Indicator float
  kingBen.children.forEach(child => {
    if (child.userData?.isIndicator) {
      child.position.y = 2.9 + Math.sin(time * 3) * 0.15;
      child.rotation.y = time * 2;
    }
  });
}

/**
 * Show a floating message from the King
 */
function showKingMessage(npc, message, camera, isQueenQuote = false) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const msg = document.createElement('div');
  msg.className = 'floating-message king-quote';
  msg.textContent = message;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 120}px;
    transform: translateX(-50%);
    font-size: ${isQueenQuote ? '1.3rem' : '1.1rem'};
    font-weight: bold;
    color: ${isQueenQuote ? '#ffd700' : '#800020'};
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    max-width: 250px;
    text-align: center;
    pointer-events: none;
    z-index: 1000;
    animation: floatUp 4s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4500);
}
