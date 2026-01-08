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

  // Road network waypoints - King Ben ONLY walks on roads
  // Main streets (E-W): Royal Road (z=0), Milk Lane (z=-10), Crumpet Court (z=10), Peppermint Ave (z=-20), Scone Street (z=20)
  // Cross streets (N-S): Sugar Lane (x=-20), Honey Way (x=0), Biscuit Boulevard (x=20)
  // Note: Fountain at (0,0) blocks center - waypoints go around it
  roadWaypoints: [
    // Royal Road (z=0) - main road intersections and points (goes around fountain)
    { x: -35, z: 0 }, { x: -20, z: 0 }, { x: -10, z: 0 }, { x: -4, z: 0 }, { x: 4, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0 }, { x: 35, z: 0 },
    // Milk Lane (z=-10)
    { x: -35, z: -10 }, { x: -20, z: -10 }, { x: -10, z: -10 }, { x: 0, z: -10 }, { x: 10, z: -10 }, { x: 20, z: -10 }, { x: 35, z: -10 },
    // Crumpet Court (z=10)
    { x: -35, z: 10 }, { x: -20, z: 10 }, { x: -10, z: 10 }, { x: 0, z: 10 }, { x: 10, z: 10 }, { x: 20, z: 10 }, { x: 35, z: 10 },
    // Peppermint Ave (z=-20)
    { x: -35, z: -20 }, { x: -20, z: -20 }, { x: 0, z: -20 }, { x: 20, z: -20 }, { x: 35, z: -20 },
    // Scone Street (z=20)
    { x: -35, z: 20 }, { x: -20, z: 20 }, { x: 0, z: 20 }, { x: 20, z: 20 }, { x: 35, z: 20 },
    // Sugar Lane (x=-20) - additional points between main streets
    { x: -20, z: -15 }, { x: -20, z: -5 }, { x: -20, z: 5 }, { x: -20, z: 15 },
    // Honey Way (x=0) - additional points (skip near fountain at center)
    { x: 0, z: -15 }, { x: 0, z: 15 },
    // Biscuit Boulevard (x=20) - additional points
    { x: 20, z: -15 }, { x: 20, z: -5 }, { x: 20, z: 5 }, { x: 20, z: 15 }
  ],

  // Starting position on Royal Road (away from fountain at 0,0)
  startingWaypoint: { x: 5, z: 0 },

  // Palace waypoints for visiting Queen Bee - King visits here periodically!
  palaceWaypoints: [
    { x: 10, z: 5 },  // Palace entrance area
    { x: 8, z: 3 },   // Near palace front
    { x: 12, z: 3 }   // Palace side
  ],

  // Time between Queen visits (in seconds)
  queenVisitInterval: 45, // Visit Queen every ~45 seconds

  // Guard reactions when King stops or comments
  guardReactions: [
    "*snaps to attention*",
    "*salutes crisply*",
    "*stands straighter*",
    "*adjusts helmet nervously*",
    "*tries to look even more stoic*",
    "*maintains position... sweating slightly*"
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

  // Start on the road at center of Royal Road
  group.position.set(KING_BEN.startingWaypoint.x, 0, KING_BEN.startingWaypoint.z);

  group.userData = {
    ...KING_BEN,
    currentTarget: null,          // Current destination waypoint
    walkSpeed: 0.8,               // Slightly faster for continuous movement
    commentTimer: 0,              // Timer for occasional comments
    commentInterval: 8 + Math.random() * 7, // 8-15 seconds between comments
    isCommenting: false,          // Whether currently stopped for a comment
    nearQueenBee: false,
    lastQueenComment: 0,
    guards: [],
    scepterGroup,
    crownGroup,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 5000,
    // Queen visit behavior
    queenVisitTimer: 30,          // Start with short timer to visit soon
    isVisitingQueen: false,       // Whether currently on Queen visit
    queenVisitDuration: 0,        // How long to stay at Queen's side
    romanticMode: false,          // Enhanced romantic behavior when near Queen
    heartsSpawned: 0              // Track heart effects
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
 * Pick the next road waypoint that is connected via a road segment
 * Roads are either horizontal (same z) or vertical (same x)
 * This ensures King Ben only walks on actual roads
 */
function pickNextRoadWaypoint(currentX, currentZ, waypoints, lastTarget = null) {
  // Find waypoints that are connected via road (same x OR same z)
  // Allow small tolerance for floating point
  const tolerance = 1;

  const connectedWaypoints = waypoints.filter(wp => {
    // Skip if this is the last target (don't go back immediately)
    if (lastTarget && Math.abs(wp.x - lastTarget.x) < tolerance && Math.abs(wp.z - lastTarget.z) < tolerance) {
      return false;
    }

    // Skip if too close to current position
    const dist = Math.sqrt(Math.pow(wp.x - currentX, 2) + Math.pow(wp.z - currentZ, 2));
    if (dist < 2) return false;

    // Check if connected via road (same row or same column)
    const sameRow = Math.abs(wp.z - currentZ) < tolerance; // Same horizontal road
    const sameCol = Math.abs(wp.x - currentX) < tolerance; // Same vertical road

    // Also check if we're at an intersection (cross street positions)
    const crossStreetX = [-20, 0, 20];
    const mainStreetZ = [0, -10, 10, -20, 20];

    const atCrossStreet = crossStreetX.some(x => Math.abs(currentX - x) < tolerance);
    const atMainStreet = mainStreetZ.some(z => Math.abs(currentZ - z) < tolerance);
    const wpAtCrossStreet = crossStreetX.some(x => Math.abs(wp.x - x) < tolerance);
    const wpAtMainStreet = mainStreetZ.some(z => Math.abs(wp.z - z) < tolerance);

    // If at intersection, can go to waypoints on either connecting road
    if (atCrossStreet && atMainStreet) {
      // At intersection - can go to any connected waypoint on same row or column
      return sameRow || sameCol;
    }

    // On a main street (horizontal), can continue on same street or turn at cross street
    if (atMainStreet && !atCrossStreet) {
      return sameRow; // Stay on same horizontal road
    }

    // On a cross street (vertical), can continue or turn at main street
    if (atCrossStreet && !atMainStreet) {
      return sameCol; // Stay on same vertical road
    }

    // Default: only move along connected roads
    return sameRow || sameCol;
  });

  // If no valid waypoints found, pick any connected waypoint
  if (connectedWaypoints.length === 0) {
    const anyConnected = waypoints.filter(wp => {
      const dist = Math.sqrt(Math.pow(wp.x - currentX, 2) + Math.pow(wp.z - currentZ, 2));
      return dist > 2;
    });
    if (anyConnected.length > 0) {
      return anyConnected[Math.floor(Math.random() * anyConnected.length)];
    }
    // Fallback to center of Royal Road
    return { x: 0, z: 0 };
  }

  // Randomly pick from connected waypoints
  return connectedWaypoints[Math.floor(Math.random() * connectedWaypoints.length)];
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

  // === QUEEN VISIT TIMER ===
  data.queenVisitTimer += delta;

  // Check if it's time to visit the Queen
  if (!data.isVisitingQueen && data.queenVisitTimer >= data.queenVisitInterval) {
    data.isVisitingQueen = true;
    data.queenVisitTimer = 0;
    data.queenVisitDuration = 8 + Math.random() * 5; // Stay 8-13 seconds
    // Set target to palace area
    const palaceWp = data.palaceWaypoints[Math.floor(Math.random() * data.palaceWaypoints.length)];
    data.currentTarget = palaceWp;
  }

  // === ROAD-CONSTRAINED MOVEMENT ===
  // Pick a new target if we don't have one
  if (!data.currentTarget) {
    if (data.isVisitingQueen) {
      // Head toward palace
      const palaceWp = data.palaceWaypoints[Math.floor(Math.random() * data.palaceWaypoints.length)];
      data.currentTarget = palaceWp;
    } else {
      data.currentTarget = pickNextRoadWaypoint(kingBen.position.x, kingBen.position.z, data.roadWaypoints);
    }
  }

  // Handle commenting (brief 2-second stops)
  data.commentTimer += delta;
  if (data.isCommenting) {
    data.commentTimer -= delta; // Count down during comment
    if (data.commentTimer <= 0) {
      data.isCommenting = false;
      data.commentTimer = 0;
      data.commentInterval = 8 + Math.random() * 7; // Reset interval
    }
    // Idle animation while commenting
    kingBen.position.y = Math.sin(time * 1.5) * 0.02;
  } else {
    // Check if it's time for a comment
    if (data.commentTimer >= data.commentInterval) {
      data.isCommenting = true;
      data.commentTimer = 2; // 2 second comment pause

      // Show a random quote or guard command
      if (Math.random() < 0.4) {
        const command = data.guardCommands[Math.floor(Math.random() * data.guardCommands.length)];
        showKingMessage(kingBen, command, camera);
        // Guards react to commands!
        showGuardReaction(data.guards, camera);
      } else {
        const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
        showKingMessage(kingBen, quote, camera);
      }
    } else {
      // Move toward current target
      const target = data.currentTarget;
      const dx = target.x - kingBen.position.x;
      const dz = target.z - kingBen.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.5) {
        // Reached waypoint - immediately pick next one (no stopping)
        data.currentTarget = pickNextRoadWaypoint(kingBen.position.x, kingBen.position.z, data.roadWaypoints, target);
      } else {
        // Move toward waypoint
        const moveX = (dx / dist) * data.walkSpeed * delta;
        const moveZ = (dz / dist) * data.walkSpeed * delta;

        const targetX = kingBen.position.x + moveX;
        const targetZ = kingBen.position.z + moveZ;

        // Use collision system with sliding
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
    }
  }

  // === CHECK IF NEAR QUEEN BEE ===
  const queenBee = npcs['palace'];
  if (queenBee) {
    const distToQueen = kingBen.position.distanceTo(queenBee.position);

    if (distToQueen < 6) {
      if (!data.nearQueenBee) {
        data.nearQueenBee = true;
        data.romanticMode = true;
        // First time approaching - give compliment!
        const now = Date.now();
        if (now - data.lastQueenComment > 8000) { // More frequent compliments
          data.lastQueenComment = now;
          const quote = data.queenQuotes[Math.floor(Math.random() * data.queenQuotes.length)];
          showKingMessage(kingBen, quote, camera, true);
          // Spawn floating hearts!
          spawnRomanticHearts(kingBen.position, camera);
        }
      }

      // If on a Queen visit, count down visit duration
      if (data.isVisitingQueen) {
        data.queenVisitDuration -= delta;
        if (data.queenVisitDuration <= 0) {
          data.isVisitingQueen = false;
          data.currentTarget = null; // Resume normal patrol
        }
      }

      // Face the Queen
      kingBen.rotation.y = Math.atan2(
        queenBee.position.x - kingBen.position.x,
        queenBee.position.z - kingBen.position.z
      );

      // Romantic bow - slight forward lean
      kingBen.rotation.x = 0.12 + Math.sin(time * 2) * 0.02;

      // Occasional romantic comments while near Queen
      if (Math.random() < 0.002) { // Small chance each frame
        const now = Date.now();
        if (now - data.lastQueenComment > 6000) {
          data.lastQueenComment = now;
          const quote = data.queenQuotes[Math.floor(Math.random() * data.queenQuotes.length)];
          showKingMessage(kingBen, quote, camera, true);
          spawnRomanticHearts(kingBen.position, camera);
        }
      }

    } else {
      if (data.nearQueenBee) {
        data.romanticMode = false;
      }
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

/**
 * Show guard reaction when King gives a command
 */
function showGuardReaction(guards, camera) {
  // Pick a random guard to react
  if (guards.length === 0) return;

  const reactingGuard = guards[Math.floor(Math.random() * guards.length)];
  const reaction = KING_BEN.guardReactions[Math.floor(Math.random() * KING_BEN.guardReactions.length)];

  const vec = reactingGuard.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const msg = document.createElement('div');
  msg.className = 'floating-message guard-reaction';
  msg.textContent = reaction;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 80}px;
    transform: translateX(-50%);
    font-size: 0.9rem;
    font-style: italic;
    color: #4a4a4a;
    text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
    max-width: 150px;
    text-align: center;
    pointer-events: none;
    z-index: 999;
    animation: floatUp 2.5s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

/**
 * Spawn floating heart particles for romantic moments
 */
function spawnRomanticHearts(position, camera) {
  const vec = position.clone().project(camera);
  if (vec.z > 1) return;

  const baseX = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const baseY = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  // Spawn 3-5 hearts
  const heartCount = 3 + Math.floor(Math.random() * 3);
  const hearts = ['❤️', '💕', '💖', '💗', '💝'];

  for (let i = 0; i < heartCount; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'romantic-heart';
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      heart.style.cssText = `
        position: fixed;
        left: ${baseX + (Math.random() - 0.5) * 60}px;
        top: ${baseY - 50}px;
        font-size: ${1.2 + Math.random() * 0.8}rem;
        pointer-events: none;
        z-index: 1001;
        animation: heartFloat 2s ease-out forwards;
      `;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2500);
    }, i * 150);
  }
}
