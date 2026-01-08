// Game Update - main game loop update logic
import * as THREE from 'three';
import { player, updateCape } from '../entities/player.js';
import {
  PALACE_CARPET_FRONT_OFFSET,
  PALACE_CARPET_TOP_OFFSET,
  PALACE_CARPET_WIDTH,
  PALACE_HILL_HEIGHT,
  PALACE_HILL_RADIUS,
  buildings
} from '../entities/buildings.js';
import { npcs, wanderers, bernieListeners, corgis, bees, updateCorgis, updateBees, updateWanderers, updateBernieListeners, updateNPCIndicators } from '../entities/npcs.js';
import { buildingNpcs, updateBuildingNPCs } from '../entities/buildingNpcs.js';
import { collectibles, clouds, celebrationParticles, updateCelebrationParticles, updateAmbientParticles, fireflies, updateFireflies, cherryPetals, updateCherryPetals } from '../entities/collectibles.js';
import { waterMaterial, updateButterflies } from '../entities/world.js';
import { updateRiverWater, updateJumpingFish, updateFoxes, updateBirds, updateBridgeTroll, bridgeTroll } from '../entities/river.js';
import { updateKingAndGuards } from '../entities/king.js';
import { updateDoomSayer } from '../entities/doomSayer.js';
import { updateAllActivities } from '../entities/activities.js';
import { updateShops } from '../entities/shops.js';
import { updateCameraZoom, isZoomedIn, getZoomState } from '../systems/cameraZoom.js';
import { checkCollision } from './interactions.js';
import { getInputVector } from '../systems/inputSystem.js';
import { camera, getZoomLevel } from '../engine/renderer.js';
import { PLAYER_CONFIG } from '../config.js';
import { collisionManager, COLLISION_LAYERS } from '../systems/CollisionManager.js';
import { LOCATIONS } from '../assets/data.js';

// Player collision registration
let playerRegistered = false;
import {
  updateActionButton,
  updateLocationDisplay,
  updateCollectibleCount,
  showCollectPopup,
  showSweetIntro,
  showFloatingMessage
} from '../ui/uiManager.js';
import { maybePlayAmbientVoice } from '../audio/audioManager.js';

// Camera state
const cameraTarget = new THREE.Vector3();
const cameraZoomState = {
  moving: false,
  lastMoveChange: 0,
  baseOffset: 14,
  zoomedOutOffset: 18,
  currentOffset: 14,
  targetOffset: 14,
  zoomInDelay: 0.5,
  zoomOutDelay: 0.3
};

// Movement state
const moveDirection = new THREE.Vector3();
const palaceLocation = LOCATIONS.find(loc => loc.id === 'palace');
const palaceCarpet = palaceLocation ? {
  x: palaceLocation.x,
  z: palaceLocation.z,
  halfWidth: PALACE_CARPET_WIDTH / 2,
  topZ: palaceLocation.z + PALACE_CARPET_TOP_OFFSET,
  bottomZ: palaceLocation.z + PALACE_HILL_RADIUS + PALACE_CARPET_FRONT_OFFSET,
  maxHeight: PALACE_HILL_HEIGHT
} : null;

function getPalaceCarpetHeight(x, z) {
  if (!palaceCarpet) return 0;
  if (Math.abs(x - palaceCarpet.x) > palaceCarpet.halfWidth) return 0;
  if (z >= palaceCarpet.bottomZ) return 0;

  if (z >= palaceCarpet.topZ) {
    const t = (palaceCarpet.bottomZ - z) / (palaceCarpet.bottomZ - palaceCarpet.topZ);
    return palaceCarpet.maxHeight * THREE.MathUtils.clamp(t, 0, 1);
  }

  return palaceCarpet.maxHeight;
}

// Water animation state
const waterPulse = {
  baseOpacity: 0.78,
  amplitude: 0.05,
  speed: 1.5
};

// Get player speed based on boost state
function getPlayerSpeed(now) {
  if (player.userData.boostEndTime > now) {
    return PLAYER_CONFIG.BOOST_SPEED;
  }
  return PLAYER_CONFIG.BASE_SPEED;
}

// Main game update function
export function update(ctx, delta, time) {
  const now = performance.now();

  // Apply time scale
  delta *= ctx.gameState.timeScale;

  // Water material animation
  waterMaterial.opacity = waterPulse.baseOpacity + Math.sin(time * waterPulse.speed) * waterPulse.amplitude;

  // Always update camera zoom (even during dialog transitions)
  // This allows the zoom-in animation to complete before showing dialog
  updateCameraZoom(delta);

  // Check if camera is zooming to NPC (freeze player during zoom)
  const zoomState = getZoomState();
  const isZoomingOrZoomed = zoomState.current === 'interaction' || zoomState.isTransitioning;

  // Only update gameplay when started, dialog not open, and not zooming to NPC
  if (ctx.gameState.started && !ctx.gameState.dialogOpen && !isZoomingOrZoomed) {
    updatePlayer(ctx, delta, time, now);
    updateNPCs(ctx, delta, time);
    updateCollectibles(ctx, delta, time, now);
    updateBuildingProximity(ctx, time);
  }

  // Always update ambient animations
  updateAmbientAnimations(ctx, delta, time);
}

// Update player movement and animation
function updatePlayer(ctx, delta, time, now) {
  // Register player with collision manager on first update
  if (!playerRegistered && player) {
    collisionManager.registerEntity('player', player, 0.5, COLLISION_LAYERS.PLAYER);
    playerRegistered = true;
  }

  const input = getInputVector();
  const combinedInputX = Math.max(-1, Math.min(1, input.x));
  const combinedInputY = Math.max(-1, Math.min(1, input.y));
  const isMoving = combinedInputX !== 0 || combinedInputY !== 0;

  moveDirection.set(combinedInputX, 0, combinedInputY);
  if (moveDirection.lengthSq() > 0) {
    moveDirection.normalize();
  }

  if (isMoving) {
    const playerSpeed = getPlayerSpeed(now);
    const moveX = combinedInputX * playerSpeed * delta;
    const moveZ = combinedInputY * playerSpeed * delta;
    const targetX = player.position.x + moveX;
    const targetZ = player.position.z + moveZ;

    // Use new collision system with sliding
    const validated = collisionManager.getValidatedPosition('player', targetX, targetZ, 0.5, true);
    player.position.x = validated.x;
    player.position.z = validated.z;

    player.userData.baseY = getPalaceCarpetHeight(player.position.x, player.position.z);

    // Face movement direction
    const angle = Math.atan2(combinedInputX, combinedInputY);
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, angle, 0.15);

    // Waddle animation
    player.rotation.z = Math.sin(time * 15) * 0.12;
    player.position.y = player.userData.baseY + Math.abs(Math.sin(time * 18)) * 0.12;
  } else {
    player.userData.baseY = getPalaceCarpetHeight(player.position.x, player.position.z);
    // Idle animation
    player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, 0, 0.1);
    player.position.y = player.userData.baseY + Math.sin(time * 2) * 0.03;
  }

  // Update cape if player has one
  updateCape(delta, time, isMoving, moveDirection);

  // Camera follow with zoom
  updateCamera(ctx, delta, time, isMoving);
}

// Update camera position and zoom
function updateCamera(ctx, delta, time, isMoving) {
  // If NPC interaction zoom is active, skip normal camera follow
  // (camera zoom is updated in main update loop)
  if (isZoomedIn()) {
    return;
  }

  if (isMoving !== cameraZoomState.moving) {
    cameraZoomState.moving = isMoving;
    cameraZoomState.lastMoveChange = time;
  }

  if (cameraZoomState.moving) {
    if (time - cameraZoomState.lastMoveChange > cameraZoomState.zoomOutDelay) {
      cameraZoomState.targetOffset = cameraZoomState.zoomedOutOffset;
    }
  } else if (time - cameraZoomState.lastMoveChange > cameraZoomState.zoomInDelay) {
    cameraZoomState.targetOffset = cameraZoomState.baseOffset;
  }

  cameraZoomState.currentOffset = THREE.MathUtils.lerp(
    cameraZoomState.currentOffset,
    cameraZoomState.targetOffset,
    0.04
  );

  cameraTarget.set(player.position.x, player.position.y + 1, player.position.z);
  // Apply user zoom level from mouse wheel
  const userZoom = getZoomLevel();
  const zoomedOffset = cameraZoomState.currentOffset * userZoom;

  const idealPos = new THREE.Vector3(
    player.position.x,
    player.position.y + zoomedOffset,
    player.position.z + zoomedOffset
  );
  camera.position.lerp(idealPos, 0.08);
  camera.lookAt(cameraTarget);
}

// Update NPCs
function updateNPCs(ctx, delta, time) {
  // Check NPC proximity
  let nearestNPC = null;
  let nearestWanderer = null;
  let nearestTroll = null;
  let nearestBuildingNPC = null;
  let nearestDist = Infinity;

  // Check building NPCs first (they take priority for building lore)
  Object.entries(buildingNpcs).forEach(([id, npc]) => {
    const dist = player.position.distanceTo(npc.position);
    if (dist < 3.5 && dist < nearestDist) {
      nearestDist = dist;
      nearestBuildingNPC = id;
      nearestNPC = null;
      nearestWanderer = null;
    }
  });

  // Check main NPCs
  Object.entries(npcs).forEach(([id, npc]) => {
    const dist = player.position.distanceTo(npc.position);
    if (dist < 3.5 && dist < nearestDist) {
      nearestDist = dist;
      nearestNPC = id;
      nearestBuildingNPC = null;
      nearestWanderer = null;
      nearestTroll = null;
    }
  });

  // Check wanderers
  wanderers.forEach(npc => {
    const dist = player.position.distanceTo(npc.position);
    if (dist < 3.5 && dist < nearestDist) {
      nearestDist = dist;
      nearestNPC = null;
      nearestBuildingNPC = null;
      nearestWanderer = npc;
      nearestTroll = null;
    }
  });

  // Check bridge troll proximity
  if (bridgeTroll) {
    const dist = player.position.distanceTo(bridgeTroll.position);
    if (dist < 3.5 && dist < nearestDist) {
      nearestDist = dist;
      nearestNPC = null;
      nearestWanderer = null;
      nearestTroll = bridgeTroll;
    }
  }

  ctx.gameState.nearNPC = nearestNPC;
  ctx.gameState.nearWanderer = nearestWanderer;
  ctx.gameState.nearTroll = nearestTroll;

  ctx.gameState.nearBuildingNPC = nearestBuildingNPC;
  updateActionButton(nearestNPC, nearestWanderer, nearestBuildingNPC, nearestTroll);

  // Update corgis with player awareness
  updateCorgis(time, delta, player);

  // Update bees
  updateBees(time, delta);
}

// Update collectibles
function updateCollectibles(ctx, delta, time, now) {
  collectibles.forEach(col => {
    if (col.userData.collected) return;
    if (player.position.distanceTo(col.position) < 1.2) {
      col.userData.collected = true;
      col.visible = false;

      // Get collectible value (1 for normal, 5 for golden)
      const value = col.userData.value || 1;
      const isGolden = col.userData.isGolden || false;

      ctx.gameState.collected += value;
      updateCollectibleCount(ctx.gameState.collected);

      // Show floating +X number
      showFloatingPoints(col.position, value, isGolden);

      showCollectPopup();
      // spawnCelebrationBurst();
      player.userData.boostEndTime = now + PLAYER_CONFIG.BOOST_DURATION;
      if (!ctx.gameState.firstSweetShown) {
        ctx.gameState.firstSweetShown = true;
        ctx.gameState.timeScale = 0.2;
        ctx.gameState.dialogOpen = true;
        showSweetIntro();
      }
    }
  });
}

/**
 * Show floating +X points number at collection position
 */
function showFloatingPoints(position, value, isGolden) {
  const vec = position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const pointsDiv = document.createElement('div');
  pointsDiv.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    transform: translateX(-50%);
    font-size: ${isGolden ? '2.5rem' : '2rem'};
    font-weight: bold;
    color: ${isGolden ? '#ffd700' : '#90EE90'};
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 ${isGolden ? '20px #ffd700' : '10px #90EE90'};
    pointer-events: none;
    z-index: 1000;
    animation: floatUpPoints 1.5s ease-out forwards;
  `;
  pointsDiv.textContent = `+${value}`;

  document.body.appendChild(pointsDiv);

  setTimeout(() => pointsDiv.remove(), 1500);
}

// Update building proximity and location display
function updateBuildingProximity(ctx, time) {
  let nearestBuilding = null;
  let nearestBuildingDist = Infinity;
  Object.entries(buildings).forEach(([id, building]) => {
    const dist = player.position.distanceTo(building.position);
    if (dist < nearestBuildingDist) {
      nearestBuildingDist = dist;
      nearestBuilding = building;
    }
  });

  if (nearestBuilding && nearestBuilding.userData.id !== ctx.gameState.currentLocation) {
    ctx.gameState.currentLocation = nearestBuilding.userData.id;
    updateLocationDisplay(
      ctx.gameState.currentLocation,
      nearestBuilding.userData.icon,
      nearestBuilding.userData.name
    );
  }

  // Building pulse animation
  Object.values(buildings).forEach(building => {
    const dist = player.position.distanceTo(building.position);
    if (dist < 6) {
      building.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
    } else {
      building.scale.setScalar(THREE.MathUtils.lerp(building.scale.x, 1, 0.1));
    }
  });
}

// Update ambient animations (always run)
function updateAmbientAnimations(ctx, delta, time) {
  updateCelebrationParticles(delta);

  // Cloud movement
  clouds.forEach(cloud => {
    cloud.position.x += cloud.userData.speed;
    if (cloud.position.x > 60) cloud.position.x = -60;
  });

  // NPC indicators (floating golden spheres)
  updateNPCIndicators(time);

  // Collectible float and spin
  collectibles.forEach(col => {
    if (!col.userData.collected) {
      col.position.y = 0.5 + Math.sin(time * 3 + col.userData.floatOffset) * 0.15;
      col.rotation.y = time * 1.5;
    }
  });

  // Floating petals and sparkles
  updateAmbientParticles(time, delta);

  // Fireflies
  updateFireflies(time, delta);

  // Cherry blossom petals
  updateCherryPetals(time, delta);

  // River water animation
  updateRiverWater(time);

  // Jumping fish animation
  updateJumpingFish(time, delta);

  // King Ben and guards patrol
  updateKingAndGuards(time, delta, camera);

  // Doom Sayer wandering and prophecies (with dynamic context)
  updateDoomSayer(time, delta, camera, ctx);

  // Wandering NPCs movement
  updateWanderers(ctx, delta, time, showFloatingMessage, maybePlayAmbientVoice);

  // Bernie listeners movement
  updateBernieListeners(ctx, delta, time, showFloatingMessage, maybePlayAmbientVoice);

  // Austinville activities (Boxing Ring, Trampoline, Fishing NPCs, Tea vs Coffee War)
  updateAllActivities(time, delta, camera);

  // Shop animations (donut rotation, sprinkles, steam)
  updateShops(time, delta);

  // Forest animals
  updateFoxes(time, delta);
  updateBirds(time, delta);

  // Bridge troll animation
  updateBridgeTroll(time);
  // Building NPCs animations
  updateBuildingNPCs(time, delta);

  // Butterflies near flower beds
  updateButterflies(time);

}

// Add CSS animations for floating points
const pointsStyle = document.createElement('style');
pointsStyle.textContent = `
  @keyframes floatUpPoints {
    0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(0.5); }
    20% { transform: translateX(-50%) translateY(-10px) scale(1.2); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1); }
  }
`;
document.head.appendChild(pointsStyle);
