// Interactions - collision detection, NPC interactions, and dialog triggers
import { openDialog, openWandererDialog, openTrollDialog } from '../ui/uiManager.js';
import { openDialog, openWandererDialog, openBuildingNPCDialog } from '../ui/uiManager.js';

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
  } else if (ctx.gameState.nearNPC) {
    openDialog(ctx.gameState.nearNPC);
  } else if (ctx.gameState.nearWanderer) {
    openWandererDialog(ctx.gameState.nearWanderer);
  } else if (ctx.gameState.nearTroll) {
    openTrollDialog(ctx.gameState.nearTroll);
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
