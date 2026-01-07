// Austinville Activities - Boxing Ring, Trampoline, Fishing NPCs, Tea vs Coffee War
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { checkCollision, collisionBoxes } from './world.js';
import { player } from './player.js';
import { SHOP_POSITIONS } from './shops.js';
import { FISHING_DOCK_POS } from './river.js';

// ============================================
// BOXING RING - "The Royal Rumble"
// ============================================

// AUSTINVILLE GRID LAYOUT - Boxing Ring in west block between Milk Lane (z=-10) and Peppermint Ave (z=-20)
export const BOXING_RING_DATA = {
  position: { x: -25, z: -15 },
  fighters: [
    {
      name: "Sir Clumsy",
      quotes: [
        "*trips over nothing*",
        "I meant to do that!",
        "HAVE AT THEE! ...ow.",
        "My sword is just... resting.",
        "Victory is INEVITABLE! ...eventually."
      ],
      color: 0xff6b6b
    },
    {
      name: "Lord Fumbles",
      quotes: [
        "*drops shield for the 5th time*",
        "These gauntlets are too slippery!",
        "CHARGE! ...wrong direction.",
        "My honor demands... *falls*",
        "Best two out of three! ...hundred."
      ],
      color: 0x6b9eff
    }
  ],
  announcer: {
    name: "Duke Dramatic",
    role: "Official Commentator",
    quotes: [
      "AND HE'S DOWN! ...again.",
      "WHAT A MOVE! What was it? Nobody knows!",
      "The crowd goes MILD!",
      "In my 40 years of commentary, I've never seen... whatever that was.",
      "Ladies and gentlemen, we have a... tie? They both fell."
    ]
  }
};

export let boxingRing = null;
export let boxingFighters = [];

export function createBoxingRing() {
  const group = new THREE.Group();

  // Ring platform
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 8),
    platformMat
  );
  platform.position.y = 0.25;
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);

  // Ring mat with texture
  const matCanvas = document.createElement('canvas');
  matCanvas.width = 256;
  matCanvas.height = 256;
  const matCtx = matCanvas.getContext('2d');
  matCtx.fillStyle = '#dc143c';
  matCtx.fillRect(0, 0, 256, 256);
  matCtx.fillStyle = '#ffd700';
  matCtx.font = 'bold 40px Impact';
  matCtx.textAlign = 'center';
  matCtx.fillText('ROYAL', 128, 100);
  matCtx.fillText('RUMBLE', 128, 150);
  matCtx.strokeStyle = '#ffffff';
  matCtx.lineWidth = 10;
  matCtx.strokeRect(20, 20, 216, 216);

  const matTexture = new THREE.CanvasTexture(matCanvas);
  const ringMat = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 7.5),
    new THREE.MeshStandardMaterial({ map: matTexture })
  );
  ringMat.rotation.x = -Math.PI / 2;
  ringMat.position.y = 0.51;
  group.add(ringMat);

  // Corner posts
  const postMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 });
  const postPositions = [
    [-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]
  ];
  const cornerColors = [0xff0000, 0x0000ff, 0xff0000, 0x0000ff];

  postPositions.forEach(([x, z], i) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8),
      postMat
    );
    post.position.set(x, 1.4, z);
    post.castShadow = true;
    group.add(post);

    // Corner pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: cornerColors[i] })
    );
    pad.position.set(x, 0.7, z);
    group.add(pad);
  });

  // Ropes (3 levels)
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  [0.8, 1.3, 1.8].forEach(height => {
    [
      [[-3.5, -3.5], [3.5, -3.5]],
      [[3.5, -3.5], [3.5, 3.5]],
      [[3.5, 3.5], [-3.5, 3.5]],
      [[-3.5, 3.5], [-3.5, -3.5]]
    ].forEach(([start, end]) => {
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 7, 6),
        ropeMat
      );
      rope.position.set(
        (start[0] + end[0]) / 2,
        height,
        (start[1] + end[1]) / 2
      );
      rope.rotation.z = Math.PI / 2;
      if (start[0] === end[0]) rope.rotation.y = Math.PI / 2;
      group.add(rope);
    });
  });

  // Announcer booth
  const boothBase = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  boothBase.position.set(5, 0.75, 0);
  boothBase.castShadow = true;
  group.add(boothBase);

  // Commentary sign
  const commentCanvas = document.createElement('canvas');
  commentCanvas.width = 256;
  commentCanvas.height = 64;
  const commentCtx = commentCanvas.getContext('2d');
  commentCtx.fillStyle = '#ffd700';
  commentCtx.fillRect(0, 0, 256, 64);
  commentCtx.fillStyle = '#000000';
  commentCtx.font = 'bold 22px Arial';
  commentCtx.textAlign = 'center';
  commentCtx.fillText('COMMENTARY', 128, 40);

  const commentTexture = new THREE.CanvasTexture(commentCanvas);
  const commentSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: commentTexture }));
  commentSprite.scale.set(2, 0.5, 1);
  commentSprite.position.set(5, 2, 0);
  group.add(commentSprite);

  // Main sign
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.5, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  signBoard.position.set(0, 4, -4);
  signBoard.castShadow = true;
  group.add(signBoard);

  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#1a1a1a';
  signCtx.fillRect(0, 0, 512, 128);
  signCtx.fillStyle = '#ffd700';
  signCtx.font = 'bold 48px Impact';
  signCtx.textAlign = 'center';
  signCtx.fillText('THE ROYAL RUMBLE', 256, 75);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(5, 1.2, 1);
  signSprite.position.set(0, 4, -3.85);
  group.add(signSprite);

  group.position.set(BOXING_RING_DATA.position.x, 0, BOXING_RING_DATA.position.z);

  group.userData = {
    type: 'boxingRing',
    name: 'The Royal Rumble'
  };

  scene.add(group);
  boxingRing = group;

  // Add collision box
  collisionBoxes.push({
    minX: BOXING_RING_DATA.position.x - 5,
    maxX: BOXING_RING_DATA.position.x + 6,
    minZ: BOXING_RING_DATA.position.z - 5,
    maxZ: BOXING_RING_DATA.position.z + 5
  });

  return group;
}

/**
 * Create a simple NPC figure for fighters/fishermen
 */
function createSimpleNPC(color = 0xffeedd) {
  const group = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
  );
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 10, 10),
    new THREE.MeshStandardMaterial({ color })
  );
  head.position.y = 1.15;
  head.castShadow = true;
  group.add(head);

  // Eyes
  [-0.08, 0.08].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    eye.position.set(x, 1.2, 0.18);
    group.add(eye);
  });

  return group;
}

export function createBoxingKnights() {
  const fighters = [];

  BOXING_RING_DATA.fighters.forEach((data, i) => {
    const knight = createSimpleNPC();

    // Position in ring
    const xOffset = i === 0 ? -1.5 : 1.5;
    knight.position.set(
      BOXING_RING_DATA.position.x + xOffset,
      0.5,
      BOXING_RING_DATA.position.z
    );

    // Face opponent
    knight.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;

    // Add "sword" (pool noodle)
    const sword = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: data.color })
    );
    sword.position.set(0.5, 0.8, 0);
    sword.rotation.z = Math.PI / 4;
    knight.add(sword);

    // Add shield (pot lid)
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.25, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
    );
    shield.position.set(-0.4, 0.7, 0.3);
    shield.rotation.x = Math.PI / 3;
    knight.add(shield);

    knight.userData = {
      ...data,
      role: "Valiant Knight (?)",
      isFighter: true,
      fightState: 'ready',
      attackTimer: 2 + Math.random() * 3,
      fallTimer: 0,
      wins: 0,
      losses: 0,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 3000,
      opponent: null,
      sword,
      shield
    };

    scene.add(knight);
    fighters.push(knight);
  });

  // Link opponents
  fighters[0].userData.opponent = fighters[1];
  fighters[1].userData.opponent = fighters[0];

  // Create announcer
  const announcer = createSimpleNPC();
  announcer.position.set(
    BOXING_RING_DATA.position.x + 5,
    0,
    BOXING_RING_DATA.position.z
  );
  announcer.rotation.y = -Math.PI / 2;

  // Add microphone
  const mic = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  mic.position.set(0.3, 1, 0.2);
  mic.rotation.z = -Math.PI / 4;
  announcer.add(mic);

  announcer.userData = {
    ...BOXING_RING_DATA.announcer,
    isAnnouncer: true,
    commentTimer: 3 + Math.random() * 4,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 2000,
    walkSpeed: 0
  };
  scene.add(announcer);
  fighters.push(announcer);

  boxingFighters = fighters;
  return fighters;
}

export function updateBoxingRing(time, delta, camera) {
  if (!boxingFighters.length) return;

  const ringCenter = BOXING_RING_DATA.position;

  boxingFighters.filter(f => f.userData.isFighter).forEach(knight => {
    const data = knight.userData;
    const opponent = data.opponent;

    switch (data.fightState) {
      case 'ready':
        knight.position.y = 0.5 + Math.abs(Math.sin(time * 5)) * 0.1;
        if (data.sword) {
          data.sword.rotation.z = Math.PI / 4 + Math.sin(time * 3) * 0.3;
        }
        data.attackTimer -= delta;
        if (data.attackTimer <= 0) {
          data.fightState = 'attacking';
          data.attackTimer = 0;
        }
        break;

      case 'attacking':
        data.attackTimer += delta;
        const lungeProgress = Math.min(data.attackTimer / 0.5, 1);
        const dirToOpponent = knight.position.x < ringCenter.x ? 1 : -1;
        knight.position.x += dirToOpponent * delta * 5;

        if (data.sword) {
          data.sword.rotation.z = Math.PI / 4 - lungeProgress * Math.PI / 2;
        }

        if (lungeProgress >= 1) {
          const failType = Math.floor(Math.random() * 4);
          if (failType === 0) {
            data.fightState = 'falling';
          } else if (failType === 1) {
            if (data.sword) {
              data.sword.visible = false;
              setTimeout(() => data.sword.visible = true, 2000);
            }
            data.fightState = 'recovering';
          } else if (failType === 2) {
            data.fightState = 'falling';
            if (opponent) opponent.userData.fightState = 'falling';
          } else {
            knight.rotation.z = Math.PI / 2;
            data.fightState = 'recovering';
          }
          data.fallTimer = 0;
          showFighterQuote(knight, camera);
        }
        break;

      case 'falling':
        data.fallTimer += delta;
        knight.rotation.z = THREE.MathUtils.lerp(knight.rotation.z, Math.PI / 2, 0.2);
        knight.position.y = Math.max(0.2, 0.5 - data.fallTimer);

        if (data.fallTimer > 2) {
          data.fightState = 'recovering';
          data.fallTimer = 0;
          data.losses++;
        }
        break;

      case 'recovering':
        data.fallTimer += delta;
        knight.rotation.z = THREE.MathUtils.lerp(knight.rotation.z, 0, 0.05);
        knight.position.y = THREE.MathUtils.lerp(knight.position.y, 0.5, 0.05);

        const startX = knight.position.x < ringCenter.x
          ? ringCenter.x - 1.5
          : ringCenter.x + 1.5;
        knight.position.x = THREE.MathUtils.lerp(knight.position.x, startX, 0.03);

        if (data.fallTimer > 3 && Math.abs(knight.rotation.z) < 0.1) {
          data.fightState = 'ready';
          data.attackTimer = 2 + Math.random() * 3;
        }
        break;
    }
  });

  // Announcer commentary
  const announcer = boxingFighters.find(f => f.userData.isAnnouncer);
  if (announcer) {
    announcer.userData.commentTimer -= delta;
    if (announcer.userData.commentTimer <= 0) {
      announcer.userData.commentTimer = 5 + Math.random() * 8;
      showFighterQuote(announcer, camera);
    }
    announcer.rotation.x = Math.sin(time * 0.5) * 0.1;
  }
}

function showFighterQuote(npc, camera) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const quotes = npc.userData.quotes;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const msg = document.createElement('div');
  msg.className = 'floating-message fighter-quote';
  msg.textContent = quote;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 80}px;
    transform: translateX(-50%);
    font-size: 1rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 1px 1px 2px #000;
    pointer-events: none;
    z-index: 1000;
    animation: floatUp 3s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// ============================================
// TRAMPOLINE - "Royal Bounce Zone"
// AUSTINVILLE GRID LAYOUT - Trampoline in west block between Royal Road (z=0) and Milk Lane (z=-10)
// ============================================

export const TRAMPOLINE_DATA = {
  position: { x: -25, z: -5 },
  radius: 3,
  bouncePower: 15,
  quotes: [
    "WHEEEEE!",
    "I CAN SEE MY HOUSE!",
    "Is this... flying?!",
    "THE CLOUDS! I'm touching the CLOUDS!",
    "I immediately regret this!",
    "MY CROWN!",
    "This is UNDIGNIFIED! ...do it again!"
  ]
};

export let trampoline = null;

export const bounceState = {
  isBouncing: false,
  bounceVelocity: 0,
  bounceHeight: 0,
  maxHeight: 0
};

export function createTrampoline() {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4169e1 });

  // Legs
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.8, 6),
      frameMat
    );
    leg.position.set(
      Math.cos(angle) * TRAMPOLINE_DATA.radius,
      0.4,
      Math.sin(angle) * TRAMPOLINE_DATA.radius
    );
    leg.castShadow = true;
    group.add(leg);
  }

  // Rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(TRAMPOLINE_DATA.radius, 0.15, 8, 32),
    frameMat
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.8;
  rim.castShadow = true;
  group.add(rim);

  // Bounce surface
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.9
  });
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(TRAMPOLINE_DATA.radius - 0.2, 32),
    surfaceMat
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.75;
  surface.userData.isTrampoline = true;
  group.add(surface);

  // Safety padding (colorful)
  const padColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 0.4),
      new THREE.MeshStandardMaterial({ color: padColors[i % 4] })
    );
    pad.position.set(
      Math.cos(angle) * TRAMPOLINE_DATA.radius,
      0.85,
      Math.sin(angle) * TRAMPOLINE_DATA.radius
    );
    pad.rotation.y = angle + Math.PI / 2;
    group.add(pad);
  }

  // Sign
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signPost.position.set(TRAMPOLINE_DATA.radius + 1, 1.5, 0);
  signPost.castShadow = true;
  group.add(signPost);

  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#4169e1';
  signCtx.fillRect(0, 0, 256, 128);
  signCtx.fillStyle = '#ffffff';
  signCtx.font = 'bold 28px Arial';
  signCtx.textAlign = 'center';
  signCtx.fillText('ROYAL BOUNCE', 128, 50);
  signCtx.font = '18px Arial';
  signCtx.fillText('Crown holders bounce free!', 128, 85);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(2.5, 1.2, 1);
  signSprite.position.set(TRAMPOLINE_DATA.radius + 1, 2.8, 0);
  group.add(signSprite);

  group.position.set(TRAMPOLINE_DATA.position.x, 0, TRAMPOLINE_DATA.position.z);

  group.userData = {
    type: 'trampoline',
    name: 'Royal Bounce Zone'
  };

  scene.add(group);
  trampoline = group;

  return group;
}

export function checkTrampolineCollision(playerPos) {
  const trampolineCenter = TRAMPOLINE_DATA.position;
  const dist = Math.hypot(
    playerPos.x - trampolineCenter.x,
    playerPos.z - trampolineCenter.z
  );
  return dist < TRAMPOLINE_DATA.radius - 0.5;
}

export function updatePlayerBounce(delta) {
  if (!player) return;

  const onTrampoline = checkTrampolineCollision(player.position);

  if (onTrampoline && !bounceState.isBouncing) {
    bounceState.isBouncing = true;
    bounceState.bounceVelocity = TRAMPOLINE_DATA.bouncePower;
    bounceState.maxHeight = 8 + Math.random() * 4;

    const quote = TRAMPOLINE_DATA.quotes[
      Math.floor(Math.random() * TRAMPOLINE_DATA.quotes.length)
    ];
    showBounceQuote(quote);
  }

  if (bounceState.isBouncing) {
    bounceState.bounceVelocity -= 25 * delta;
    bounceState.bounceHeight += bounceState.bounceVelocity * delta;
    bounceState.bounceHeight = Math.max(0, bounceState.bounceHeight);

    player.position.y = player.userData.baseY + bounceState.bounceHeight + 0.8;

    if (bounceState.bounceHeight > 2) {
      player.rotation.x = Math.sin(bounceState.bounceHeight * 0.5) * 0.3;
    }

    if (bounceState.bounceHeight <= 0 && bounceState.bounceVelocity < 0) {
      bounceState.isBouncing = false;
      bounceState.bounceHeight = 0;
      bounceState.bounceVelocity = 0;
      player.rotation.x = 0;

      if (onTrampoline) {
        bounceState.bounceVelocity = TRAMPOLINE_DATA.bouncePower * 0.8;
        bounceState.isBouncing = true;
      }
    }
  }
}

function showBounceQuote(quote) {
  const popup = document.createElement('div');
  popup.className = 'bounce-quote';
  popup.textContent = quote;
  popup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    font-weight: bold;
    color: #4169e1;
    text-shadow: 2px 2px 4px white;
    animation: bounceQuote 1.5s ease-out forwards;
    z-index: 1000;
    pointer-events: none;
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

// ============================================
// FISHING NPCs
// ============================================

export const FISHERMEN_DATA = [
  {
    name: "Old Timer Pete",
    role: "Professional Napper",
    position: { x: FISHING_DOCK_POS.x, z: FISHING_DOCK_POS.z + 1 },
    quotes: [
      "*snore* ...huh? Oh, fishing! Yes, very busy fishing.",
      "I've been here since 1987. The fish respect my commitment.",
      "The secret is to look like you're sleeping. The fish let their guard down.",
      "I once caught a fish THIS big! ...then I woke up.",
      "My wife thinks I'm at the doctor's."
    ],
    isSleeping: true,
    animation: 'sleeping'
  },
  {
    name: "Little Timmy",
    role: "Aspiring Fisher Kid",
    position: { x: FISHING_DOCK_POS.x + 3, z: FISHING_DOCK_POS.z + 1 },
    quotes: [
      "I'm gonna catch a WHALE!",
      "Grandpa taught me that patience is... OH A BUTTERFLY!",
      "Is that a fish? ...no, it's a stick.",
      "MOM! MOM LOOK! ...oh, she's not here.",
      "The fish are just shy. Like me at school."
    ],
    animation: 'fishing_excited'
  },
  {
    name: "Competitive Carl",
    role: "Self-Proclaimed Champion",
    position: { x: FISHING_DOCK_POS.x - 3, z: FISHING_DOCK_POS.z + 1 },
    quotes: [
      "I WILL catch more fish than Timmy. It's a matter of HONOR.",
      "That kid caught ONE fish and now he thinks he's special.",
      "The leaderboard doesn't lie! I'm NUMBER ONE! ...ignore the zeros.",
      "This is my LUCKY spot. I've been lucky for 47 tries.",
      "A true champion never gives up! ...or catches anything."
    ],
    animation: 'fishing_intense'
  }
];

export let fishermen = [];

export function createFishermen() {
  FISHERMEN_DATA.forEach(data => {
    const npc = createSimpleNPC();

    // Add fishing rod
    const rodGroup = new THREE.Group();

    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.03, 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    rod.rotation.x = 0.3;
    rod.position.set(0.4, 0.8, 0.5);
    rodGroup.add(rod);

    // Line
    const lineGeo = new THREE.BufferGeometry();
    const linePoints = [
      new THREE.Vector3(0.4, 1.5, 1.2),
      new THREE.Vector3(0.4, 0.3, 3)
    ];
    lineGeo.setFromPoints(linePoints);
    const line = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0x888888 })
    );
    rodGroup.add(line);

    // Bobber
    const bobber = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    bobber.position.set(0.4, 0.3, 3);
    rodGroup.add(bobber);

    npc.add(rodGroup);

    npc.position.set(data.position.x, 0.5, data.position.z);
    npc.rotation.y = Math.PI; // Face water

    npc.userData = {
      ...data,
      isFishing: true,
      catchTimer: 5 + Math.random() * 10,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 5000,
      walkSpeed: 0,
      rod: rodGroup,
      bobber
    };

    scene.add(npc);
    fishermen.push(npc);
  });

  return fishermen;
}

export function updateFishermen(time, delta, camera) {
  fishermen.forEach(npc => {
    const data = npc.userData;

    // Bobber animation
    if (data.bobber) {
      data.bobber.position.y = 0.3 + Math.sin(time * 2) * 0.05;
    }

    // Occasional "catch" attempt
    data.catchTimer -= delta;
    if (data.catchTimer <= 0) {
      data.catchTimer = 8 + Math.random() * 15;

      if (data.name === "Old Timer Pete") {
        showFishermanQuote(npc, camera);
      } else if (data.name === "Little Timmy") {
        npc.rotation.z = Math.sin(time * 30) * 0.2;
        setTimeout(() => {
          npc.rotation.z = 0;
          showFishingResult(npc, Math.random() < 0.3, camera);
        }, 1500);
      } else {
        showFishingResult(npc, Math.random() < 0.1, camera);
      }
    }

    // Animation based on type
    if (data.animation === 'sleeping') {
      npc.scale.y = 0.95 + Math.sin(time * 0.5) * 0.03;
    } else if (data.animation === 'fishing_excited') {
      npc.rotation.z = Math.sin(time * 3) * 0.05;
    } else if (data.animation === 'fishing_intense') {
      npc.rotation.x = 0.1 + Math.sin(time * 0.5) * 0.02;
    }
  });
}

function showFishermanQuote(npc, camera) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const quotes = npc.userData.quotes;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = quote;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 80}px;
    transform: translateX(-50%);
    font-size: 1rem;
    font-weight: bold;
    color: #4a86e8;
    text-shadow: 1px 1px 2px #000;
    pointer-events: none;
    z-index: 1000;
    animation: floatUp 3s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

function showFishingResult(npc, caught, camera) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const msg = document.createElement('div');
  msg.className = 'floating-message';

  if (caught) {
    msg.textContent = npc.userData.name === "Little Timmy"
      ? "I CAUGHT ONE!!"
      : "Finally! ...wait, that's a boot.";
    msg.style.color = '#32cd32';
  } else {
    const misses = [
      "It got away!",
      "SO CLOSE!",
      "The fish mocked me...",
      "Next time for sure!",
      "I FELT A NIBBLE!"
    ];
    msg.textContent = misses[Math.floor(Math.random() * misses.length)];
    msg.style.color = '#ff6347';
  }

  msg.style.cssText += `
    position: fixed;
    left: ${x}px;
    top: ${y - 80}px;
    transform: translateX(-50%);
    font-size: 1.1rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px #000;
    pointer-events: none;
    z-index: 1000;
    animation: floatUp 3s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// ============================================
// TEA VS COFFEE WAR
// ============================================

export const BEVERAGE_WAR = {
  active: true,
  teaScore: 0,
  coffeeScore: 0,
  warCries: {
    tea: [
      "LONG LIVE THE LEAF!",
      "Pinkies at the ready!",
      "For the Queen (Bee)!",
      "Steep and CONQUER!",
      "Our leaves will blot out the sun!",
      "Tea-riffic victory awaits!"
    ],
    coffee: [
      "BEANS FOREVER!",
      "No sleep till victory!",
      "Espresso yourself!",
      "Grind them down!",
      "We're BREWING trouble!",
      "Decaf is for quitters!"
    ]
  }
};

export let warZone = null;
export let warriors = { tea: [], coffee: [] };

export function createWarZone() {
  const group = new THREE.Group();
  const zonePos = { x: 18, z: -2 };

  // "No Man's Land" sign
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signPost.position.y = 1.5;
  signPost.castShadow = true;
  group.add(signPost);

  // Two-sided sign
  const teaSide = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xff9eb5 })
  );
  teaSide.position.set(0, 2.8, 0.05);
  group.add(teaSide);

  const coffeeSide = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x3d2314 })
  );
  coffeeSide.position.set(0, 2.8, -0.05);
  coffeeSide.rotation.y = Math.PI;
  group.add(coffeeSide);

  // "DISPUTED TERRITORY" text
  const disputeCanvas = document.createElement('canvas');
  disputeCanvas.width = 256;
  disputeCanvas.height = 64;
  const disputeCtx = disputeCanvas.getContext('2d');
  disputeCtx.fillStyle = '#8b0000';
  disputeCtx.font = 'bold 24px Impact';
  disputeCtx.textAlign = 'center';
  disputeCtx.fillText('DISPUTED ZONE', 128, 40);

  const disputeTexture = new THREE.CanvasTexture(disputeCanvas);
  const disputeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: disputeTexture }));
  disputeSprite.scale.set(2.5, 0.6, 1);
  disputeSprite.position.set(0, 3.5, 0);
  group.add(disputeSprite);

  // Battlefield line on ground
  const battleLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 15),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  battleLine.rotation.x = -Math.PI / 2;
  battleLine.position.set(0, 0.03, 0);
  group.add(battleLine);

  group.position.set(zonePos.x, 0, zonePos.z);

  group.userData = {
    type: 'warZone',
    name: 'Tea vs Coffee Battleground'
  };

  scene.add(group);
  warZone = group;

  return group;
}

export function createWarriorNPCs() {
  const teaWarriorData = [
    { name: "Sir Chamomile", weapon: "scone", quotes: ["For the teapot!", "Pinkies up, THEN we fight!", "You call that a brew?!"] },
    { name: "Dame Darjeeling", weapon: "teaspoon", quotes: ["Our leaves are SUPERIOR!", "I challenge you to a steep-off!", "Taste defeat! ...It's bitter, unlike our tea."] }
  ];

  const coffeeWarriorData = [
    { name: "Captain Cappuccino", weapon: "coffee_stirrer", quotes: ["Surrender your kettle!", "We never sleep! ...literally.", "Your tea is WEAK!"] },
    { name: "Sergeant Shots", weapon: "espresso_cup", quotes: ["TRIPLE SHOT ATTACK!", "Decaf this!", "I've had 12 cups! I can see through TIME!"] }
  ];

  // Create Tea Warriors
  teaWarriorData.forEach((data, i) => {
    const warrior = createSimpleNPC(0xffeedd);

    // Pink outfit for tea
    warrior.children[0].material = new THREE.MeshStandardMaterial({ color: 0xff9eb5 });

    warrior.position.set(SHOP_POSITIONS.teaCafe.x - 5 + i * 2, 0, SHOP_POSITIONS.teaCafe.z + 5);
    warrior.userData = {
      ...data,
      faction: 'tea',
      role: 'Tea Warrior',
      state: 'patrolling',
      lastWarCry: 0,
      walkAngle: Math.random() * Math.PI * 2,
      walkSpeed: 0.8,
      timer: Math.random() * 3,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 3000
    };
    scene.add(warrior);
    warriors.tea.push(warrior);
  });

  // Create Coffee Warriors
  coffeeWarriorData.forEach((data, i) => {
    const warrior = createSimpleNPC(0xffeedd);

    // Dark outfit for coffee
    warrior.children[0].material = new THREE.MeshStandardMaterial({ color: 0x3d2314 });

    warrior.position.set(SHOP_POSITIONS.coffeeCafe.x - 5 + i * 2, 0, SHOP_POSITIONS.coffeeCafe.z + 5);
    warrior.userData = {
      ...data,
      faction: 'coffee',
      role: 'Coffee Warrior',
      state: 'patrolling',
      lastWarCry: 0,
      walkAngle: Math.random() * Math.PI * 2,
      walkSpeed: 1.5,
      timer: Math.random() * 2,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 2000
    };
    scene.add(warrior);
    warriors.coffee.push(warrior);
  });

  return warriors;
}

export function updateWarriors(time, delta, camera) {
  const warZonePos = { x: 18, z: -2 };

  // Check if warriors meet
  warriors.tea.forEach(teaWarrior => {
    warriors.coffee.forEach(coffeeWarrior => {
      const dist = teaWarrior.position.distanceTo(coffeeWarrior.position);

      if (dist < 4 && dist > 1) {
        teaWarrior.userData.state = 'confronting';
        coffeeWarrior.userData.state = 'confronting';

        // Face each other
        const toEnemy = new THREE.Vector3()
          .subVectors(coffeeWarrior.position, teaWarrior.position)
          .normalize();
        teaWarrior.rotation.y = Math.atan2(toEnemy.x, toEnemy.z);
        coffeeWarrior.rotation.y = Math.atan2(-toEnemy.x, -toEnemy.z);

        // Shout war cries
        const now = Date.now();
        if (now - teaWarrior.userData.lastWarCry > 5000) {
          teaWarrior.userData.lastWarCry = now;
          coffeeWarrior.userData.lastWarCry = now;
          showWarCry(teaWarrior, 'tea', camera);
          showWarCry(coffeeWarrior, 'coffee', camera);
        }

        teaWarrior.rotation.z = Math.sin(time * 20) * 0.1;
        coffeeWarrior.rotation.z = Math.sin(time * 25) * 0.12;

      } else if (dist > 6) {
        teaWarrior.userData.state = 'patrolling';
        coffeeWarrior.userData.state = 'patrolling';
        teaWarrior.rotation.z = THREE.MathUtils.lerp(teaWarrior.rotation.z, 0, 0.1);
        coffeeWarrior.rotation.z = THREE.MathUtils.lerp(coffeeWarrior.rotation.z, 0, 0.1);
      }
    });
  });

  // Patrol behavior
  [...warriors.tea, ...warriors.coffee].forEach(warrior => {
    if (warrior.userData.state === 'patrolling') {
      warrior.userData.timer -= delta;
      if (warrior.userData.timer <= 0) {
        warrior.userData.walkAngle += (Math.random() - 0.5) * Math.PI;
        warrior.userData.timer = 2 + Math.random() * 3;
      }

      const speed = warrior.userData.walkSpeed * delta;
      const newX = warrior.position.x + Math.sin(warrior.userData.walkAngle) * speed;
      const newZ = warrior.position.z + Math.cos(warrior.userData.walkAngle) * speed;

      const distToZone = Math.hypot(newX - warZonePos.x, newZ - warZonePos.z);
      if (distToZone < 12 && !checkCollision(newX, newZ)) {
        warrior.position.x = newX;
        warrior.position.z = newZ;
      } else {
        warrior.userData.walkAngle += Math.PI;
      }

      warrior.rotation.y = warrior.userData.walkAngle;

      if (warrior.userData.faction === 'coffee') {
        warrior.rotation.z = Math.sin(time * 20) * 0.15;
        warrior.position.y = Math.abs(Math.sin(time * 25)) * 0.15;
      } else {
        warrior.rotation.z = Math.sin(time * 10) * 0.08;
        warrior.position.y = Math.abs(Math.sin(time * 12)) * 0.08;
      }
    }
  });
}

function showWarCry(npc, faction, camera) {
  const cries = BEVERAGE_WAR.warCries[faction];
  const cry = cries[Math.floor(Math.random() * cries.length)];

  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const msg = document.createElement('div');
  msg.className = 'floating-message war-cry';
  msg.textContent = cry;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 100}px;
    transform: translateX(-50%);
    font-size: 1.2rem;
    font-weight: bold;
    color: ${faction === 'tea' ? '#ff69b4' : '#ff4500'};
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    pointer-events: none;
    z-index: 1000;
    animation: floatUp 3.5s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3500);
}

// ============================================
// MASTER CREATE AND UPDATE FUNCTIONS
// ============================================

export function createAllActivities() {
  createBoxingRing();
  createBoxingKnights();
  createTrampoline();
  createFishermen();
  createWarZone();
  createWarriorNPCs();

  return {
    boxingRing,
    boxingFighters,
    trampoline,
    fishermen,
    warZone,
    warriors
  };
}

export function updateAllActivities(time, delta, camera) {
  updateBoxingRing(time, delta, camera);
  updatePlayerBounce(delta);
  updateFishermen(time, delta, camera);
  updateWarriors(time, delta, camera);
}

// Add CSS animations
const activityStyle = document.createElement('style');
activityStyle.textContent = `
  @keyframes floatUp {
    0% { opacity: 1; transform: translateX(-50%) translateY(0); }
    70% { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
  }
  @keyframes bounceQuote {
    0% { opacity: 1; transform: translateX(-50%) scale(0.5); }
    50% { transform: translateX(-50%) scale(1.2); }
    100% { opacity: 0; transform: translateX(-50%) scale(1) translateY(-50px); }
  }
`;
document.head.appendChild(activityStyle);
