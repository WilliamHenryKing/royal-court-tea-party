// Doom Sayer - Prophet Pessimist, the Professional Worrier
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { checkCollision } from '../entities/world.js';

// Doom Sayer configuration
export const DOOM_SAYER_CONFIG = {
  name: "Prophet Pessimist",
  role: "Professional Worrier",
  position: { x: -30, z: -18 },

  quotes: [
    "THE TEA-TIME END IS NEAR!",
    "Repent! The last scone is coming!",
    "The sugar bowl... it's almost EMPTY!",
    "I have foreseen it... cold tea! COLD. TEA!",
    "The prophecy speaks of... running out of biscuits!",
    "You laugh now, but when the kettle stops boiling...",
    "THE LEAVES HAVE SPOKEN! ...They said 'steep longer'.",
    "Mark my words! The milk will one day... EXPIRE!",
    "I've seen the future. There's no more Earl Grey. NONE!",
    "Flee while you can! The crumpets are almost gone!"
  ],

  signTexts: [
    "THE TEA-TIME END IS NEAR",
    "REPENT & STEEP",
    "THE LAST SCONE COMETH",
    "SUGAR SHORTAGE IMMINENT"
  ]
};

// Store reference
export let doomSayer = null;
let signTexture = null;

/**
 * Create the Doom Sayer character
 */
export function createDoomSayer() {
  const group = new THREE.Group();

  // Ragged robe
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.5, 8),
    robeMat
  );
  body.position.y = 0.75;
  body.rotation.x = Math.PI;
  body.castShadow = true;
  group.add(body);

  // Hood
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    robeMat
  );
  hood.position.y = 1.4;
  hood.rotation.x = -0.3;
  group.add(hood);

  // Face (shadowed, mysterious)
  const face = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffeedd })
  );
  face.position.y = 1.35;
  face.position.z = 0.1;
  group.add(face);

  // Wild eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  });
  [-0.08, 0.08].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      eyeMat
    );
    eye.position.set(x, 1.4, 0.2);
    group.add(eye);

    // Pupil
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    pupil.position.set(x, 1.4, 0.25);
    group.add(pupil);
  });

  // === THE SIGN ===
  const signGroup = new THREE.Group();

  // Sign pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  pole.position.y = 1.25;
  pole.castShadow = true;
  signGroup.add(pole);

  // Sign board
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signBoard.position.y = 2.3;
  signBoard.castShadow = true;
  signGroup.add(signBoard);

  // Sign text (canvas texture)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');

  function updateSignText(text) {
    signCtx.fillStyle = '#8b4513';
    signCtx.fillRect(0, 0, 256, 128);
    signCtx.fillStyle = '#ffffff';
    signCtx.font = 'bold 20px Impact';
    signCtx.textAlign = 'center';

    // Word wrap
    const words = text.split(' ');
    let line = '';
    let y = 40;
    words.forEach(word => {
      const testLine = line + word + ' ';
      if (signCtx.measureText(testLine).width > 220) {
        signCtx.fillText(line, 128, y);
        line = word + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    });
    signCtx.fillText(line, 128, y);

    signTexture.needsUpdate = true;
  }

  signTexture = new THREE.CanvasTexture(signCanvas);
  const signTextMat = new THREE.MeshBasicMaterial({ map: signTexture });
  const signFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.7),
    signTextMat
  );
  signFace.position.y = 2.3;
  signFace.position.z = 0.03;
  signGroup.add(signFace);

  // Initial text
  updateSignText(DOOM_SAYER_CONFIG.signTexts[0]);

  signGroup.position.set(-0.6, 0, 0);
  signGroup.userData.updateText = updateSignText;
  signGroup.userData.currentTextIndex = 0;
  group.add(signGroup);

  group.position.set(DOOM_SAYER_CONFIG.position.x, 0, DOOM_SAYER_CONFIG.position.z);

  group.userData = {
    ...DOOM_SAYER_CONFIG,
    signGroup,
    signTextTimer: 0,
    walkAngle: Math.random() * Math.PI * 2,
    walkSpeed: 0.3,
    timer: Math.random() * 3,
    shoutTimer: 5,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 3000,
    isRanting: false,
    rantTimer: 0
  };

  scene.add(group);
  doomSayer = group;

  return group;
}

/**
 * Update Doom Sayer behavior
 */
export function updateDoomSayer(time, delta, camera) {
  if (!doomSayer) return;

  const data = doomSayer.userData;

  // Wander erratically
  data.timer -= delta;
  if (data.timer <= 0) {
    data.walkAngle += (Math.random() - 0.5) * Math.PI * 1.5;
    data.timer = 1 + Math.random() * 3;
  }

  const speed = data.walkSpeed * delta;
  const newX = doomSayer.position.x + Math.sin(data.walkAngle) * speed;
  const newZ = doomSayer.position.z + Math.cos(data.walkAngle) * speed;

  // Stay in general area
  const distFromStart = Math.hypot(newX - DOOM_SAYER_CONFIG.position.x, newZ - DOOM_SAYER_CONFIG.position.z);
  if (distFromStart < 15 && !checkCollision(newX, newZ)) {
    doomSayer.position.x = newX;
    doomSayer.position.z = newZ;
  } else {
    data.walkAngle += Math.PI;
  }

  doomSayer.rotation.y = data.walkAngle;

  // Frantic movement
  doomSayer.rotation.z = Math.sin(time * 8) * 0.15;
  doomSayer.position.y = Math.abs(Math.sin(time * 6)) * 0.1;

  // Shake sign
  if (data.signGroup) {
    data.signGroup.rotation.z = Math.sin(time * 5) * 0.2;
    data.signGroup.rotation.x = Math.sin(time * 3) * 0.1;
  }

  // Cycle sign text
  data.signTextTimer += delta;
  if (data.signTextTimer > 8) {
    data.signTextTimer = 0;
    const nextIndex = (data.signGroup.userData.currentTextIndex + 1) % DOOM_SAYER_CONFIG.signTexts.length;
    data.signGroup.userData.currentTextIndex = nextIndex;
    data.signGroup.userData.updateText(DOOM_SAYER_CONFIG.signTexts[nextIndex]);
  }

  // Shout prophecies
  data.shoutTimer -= delta;
  if (data.shoutTimer <= 0) {
    data.shoutTimer = 6 + Math.random() * 8;

    const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    showDoomQuote(doomSayer, quote, camera);

    // Brief rant animation
    data.isRanting = true;
    data.rantTimer = 2;
  }

  if (data.isRanting) {
    data.rantTimer -= delta;
    // Wild gesturing
    doomSayer.rotation.x = Math.sin(time * 10) * 0.2;

    if (data.rantTimer <= 0) {
      data.isRanting = false;
      doomSayer.rotation.x = 0;
    }
  }
}

/**
 * Show a doom prophecy quote
 */
function showDoomQuote(npc, quote, camera) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const msg = document.createElement('div');
  msg.className = 'floating-message doom-quote';
  msg.textContent = quote;
  msg.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y - 100}px;
    transform: translateX(-50%);
    font-size: 1.2rem;
    font-weight: bold;
    color: #8b0000;
    text-shadow: 1px 1px 2px #000;
    pointer-events: none;
    z-index: 1000;
    animation: doomShake 0.5s ease-in-out infinite, floatUp 4s ease-out forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// Add CSS for doom shake animation
const doomStyle = document.createElement('style');
doomStyle.textContent = `
  @keyframes doomShake {
    0%, 100% { transform: translateX(-50%); }
    25% { transform: translateX(calc(-50% - 5px)) rotate(-2deg); }
    75% { transform: translateX(calc(-50% + 5px)) rotate(2deg); }
  }
  @keyframes floatUp {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
  }
`;
document.head.appendChild(doomStyle);
