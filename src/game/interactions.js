// Interactions - collision detection, NPC interactions, and dialog triggers
import * as THREE from 'three';
import {
  openBuildingNPCDialog,
  openDialog,
  openKingDialog,
  openTrollDialog,
  openWandererDialog,
  openForemanDialog,
} from '../ui/uiManager.js';
import { spawnHearts } from '../entities/collectibles.js';

// Collision boxes storage
export const collisionBoxes = [];

// Check collision with buildings and obstacles
export function checkCollision(x, z) {
  for (const box of collisionBoxes) {
    if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ) {
      return true;
    }
  }
  return false;
}

// Handle action button press (interact with NPCs)
export function handleAction(ctx) {
  if (ctx.gameState.nearBuildingNPC) {
    openBuildingNPCDialog(ctx.gameState.nearBuildingNPC);
  } else if (ctx.gameState.nearNPC === 'kingBen') {
    openKingDialog();
  } else if (ctx.gameState.nearNPC) {
    openDialog(ctx.gameState.nearNPC);
  } else if (ctx.gameState.nearWanderer) {
    openWandererDialog(ctx.gameState.nearWanderer);
  } else if (ctx.gameState.nearTroll) {
    openTrollDialog(ctx.gameState.nearTroll);
  } else if (ctx.gameState.nearForeman) {
    openForemanDialog(ctx.gameState.nearForeman);
  }
}

// Add a collision box
export function addCollisionBox(minX, maxX, minZ, maxZ) {
  collisionBoxes.push({ minX, maxX, minZ, maxZ });
}

// Check if position is safe for placement (off path)
export function isSafeOffPathPlacement(x, z) {
  // TODO: Implement path checking logic
  return true;
}

// Handle corgi petting interaction
export function handleCorgiClick(event, camera, corgis) {
  // Create raycaster for mouse/touch position
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Get normalized device coordinates
  if (event.touches) {
    // Touch event
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
  } else {
    // Mouse event
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  raycaster.setFromCamera(mouse, camera);

  // Check if we clicked on a corgi
  const intersects = raycaster.intersectObjects(corgis, true);

  if (intersects.length > 0) {
    // Find the corgi parent
    let corgi = intersects[0].object;
    while (corgi.parent && !corgis.includes(corgi)) {
      corgi = corgi.parent;
    }

    if (corgis.includes(corgi)) {
      petCorgi(corgi);
      return true;
    }
  }

  return false;
}

// Pet a corgi - show hearts and make it happy
function petCorgi(corgi) {
  const now = performance.now();

  // Don't allow petting too frequently (cooldown 2 seconds)
  if (corgi.userData.lastPetTime && now - corgi.userData.lastPetTime < 2000) {
    return;
  }

  corgi.userData.lastPetTime = now;
  corgi.userData.isPetted = true;
  corgi.userData.pettedUntil = now + 3000; // Happy for 3 seconds

  // Spawn hearts above the corgi
  spawnHearts(corgi.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 8);
  // Show happy message (using existing floating message system)
  const messages = [
    "*happy wiggle*",
    "*tail wag*",
    "Woof! ❤️",
    "*lick lick*",
    "💕",
    "*happy dance*"
  ];

  // Create floating message
  if (typeof document !== 'undefined') {
    const msg = document.createElement('div');
    msg.className = 'floating-message';
    msg.textContent = messages[Math.floor(Math.random() * messages.length)];
    msg.style.cssText = `
      position: fixed;
      left: 50%;
      top: 30%;
      transform: translateX(-50%);
      background: rgba(255, 182, 193, 0.95);
      color: white;
      padding: 1rem 2rem;
      border-radius: 2rem;
      font-size: 1.2rem;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 200;
      animation: floatUp 2s ease forwards;
      pointer-events: none;
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  }
}
