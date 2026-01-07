// Camera Zoom System - Zooms in on NPCs during dialog interactions
import * as THREE from 'three';
import { camera } from '../engine/renderer.js';
import { player } from '../entities/player.js';
import { npcs } from '../entities/npcs.js';

// Camera zoom configuration
export const cameraZoomConfig = {
  // Normal gameplay camera settings
  normal: {
    offset: 14,
    height: 14,
    lookAtY: 1
  },
  // Zoomed in for NPC interaction
  interaction: {
    offset: 4,
    height: 2.5,
    lookAtY: 1.5
  },
  // Current state
  current: 'normal',
  transitionSpeed: 3,
  isTransitioning: false,
  targetNPC: null,
  // Store original player position for smooth return
  playerPosAtZoom: null,
  // Callback when zoom-in completes
  onZoomInComplete: null
};

// Target vectors for smooth camera movement
const cameraTarget = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();

/**
 * Zoom camera to an NPC for dialog interaction
 * @param {string} npcId - The ID of the NPC to zoom to
 * @param {Function} onComplete - Optional callback when zoom-in completes
 */
export function zoomToNPC(npcId, onComplete = null) {
  const npc = npcs[npcId];
  if (!npc) {
    // NPC not found, still call callback so dialog shows
    if (onComplete) onComplete();
    return;
  }

  cameraZoomConfig.current = 'interaction';
  cameraZoomConfig.isTransitioning = true;
  cameraZoomConfig.targetNPC = npc;
  cameraZoomConfig.playerPosAtZoom = player.position.clone();
  cameraZoomConfig.onZoomInComplete = onComplete;

  // Start NPC talking animation
  npc.userData.isTalking = true;
  npc.userData.talkStartTime = performance.now();
  npc.userData.originalRotationY = npc.rotation.y;
  npc.userData.originalPositionY = npc.position.y;

  // Make NPC face the player
  const toPlayer = new THREE.Vector3()
    .subVectors(player.position, npc.position)
    .normalize();
  npc.userData.targetRotationY = Math.atan2(toPlayer.x, toPlayer.z);
}

/**
 * Zoom camera back out to normal gameplay view
 */
export function zoomOut() {
  cameraZoomConfig.current = 'normal';
  cameraZoomConfig.isTransitioning = true;

  // Stop NPC talking animation
  if (cameraZoomConfig.targetNPC) {
    const npc = cameraZoomConfig.targetNPC;
    npc.userData.isTalking = false;
    // Restore original rotation
    if (npc.userData.originalRotationY !== undefined) {
      npc.rotation.y = npc.userData.originalRotationY;
    }
    if (npc.userData.originalPositionY !== undefined) {
      npc.position.y = npc.userData.originalPositionY;
    }
    npc.rotation.z = 0;
    npc.rotation.x = 0;
  }
  cameraZoomConfig.targetNPC = null;
  cameraZoomConfig.playerPosAtZoom = null;
}

/**
 * Check if camera is currently zoomed in
 */
export function isZoomedIn() {
  return cameraZoomConfig.current === 'interaction';
}

/**
 * Update camera zoom position - call this in the game loop
 */
export function updateCameraZoom(delta) {
  if (!cameraZoomConfig.isTransitioning && cameraZoomConfig.current === 'normal') {
    return false; // Let normal camera handle it
  }

  const config = cameraZoomConfig.current === 'interaction'
    ? cameraZoomConfig.interaction
    : cameraZoomConfig.normal;

  let targetPos;

  if (cameraZoomConfig.current === 'interaction' && cameraZoomConfig.targetNPC) {
    const npc = cameraZoomConfig.targetNPC;

    // Position camera between player and NPC, looking at NPC
    const playerPos = cameraZoomConfig.playerPosAtZoom || player.position;
    const midPoint = new THREE.Vector3()
      .addVectors(playerPos, npc.position)
      .multiplyScalar(0.5);

    // Camera positioned to see both player and NPC
    const toNPC = new THREE.Vector3()
      .subVectors(npc.position, playerPos)
      .normalize();

    // Get perpendicular direction for camera offset
    const perpendicular = new THREE.Vector3(-toNPC.z, 0, toNPC.x);

    targetPos = new THREE.Vector3()
      .copy(midPoint)
      .add(perpendicular.multiplyScalar(config.offset * 0.5))
      .add(new THREE.Vector3(0, config.height, 0));

    targetLookAt.set(
      npc.position.x,
      npc.position.y + config.lookAtY,
      npc.position.z
    );

    // Update NPC talking animation
    updateNPCTalkingAnimation(npc);

  } else {
    // Normal follow camera - return to standard behavior
    targetPos = new THREE.Vector3(
      player.position.x,
      player.position.y + config.height,
      player.position.z + config.offset
    );

    targetLookAt.set(
      player.position.x,
      player.position.y + config.lookAtY,
      player.position.z
    );
  }

  // Smooth transition
  const transitionFactor = cameraZoomConfig.transitionSpeed * delta;
  camera.position.lerp(targetPos, transitionFactor);
  cameraTarget.lerp(targetLookAt, transitionFactor);
  camera.lookAt(cameraTarget);

  // Check if transition complete
  if (camera.position.distanceTo(targetPos) < 0.1) {
    const wasTransitioning = cameraZoomConfig.isTransitioning;
    cameraZoomConfig.isTransitioning = false;

    // Call zoom-in complete callback if transitioning TO interaction mode
    if (wasTransitioning && cameraZoomConfig.current === 'interaction' && cameraZoomConfig.onZoomInComplete) {
      const callback = cameraZoomConfig.onZoomInComplete;
      cameraZoomConfig.onZoomInComplete = null; // Clear to prevent multiple calls
      callback();
    }
  }

  return true; // Camera was handled by zoom system
}

/**
 * Update NPC talking animation
 */
function updateNPCTalkingAnimation(npc) {
  if (!npc || !npc.userData.isTalking) return;

  const talkTime = (performance.now() - npc.userData.talkStartTime) / 1000;

  // Smoothly rotate to face player
  if (npc.userData.targetRotationY !== undefined) {
    npc.rotation.y = THREE.MathUtils.lerp(
      npc.rotation.y,
      npc.userData.targetRotationY,
      0.1
    );
  }

  // Head/body wiggle animation
  npc.rotation.z = Math.sin(talkTime * 6) * 0.05;

  // Slight bobbing movement
  if (npc.userData.originalPositionY !== undefined) {
    npc.position.y = npc.userData.originalPositionY + Math.sin(talkTime * 4) * 0.02;
  }

  // Traverse to find and animate head specifically
  npc.traverse(child => {
    if (child.isMesh && child.geometry) {
      // Check if this might be a head (sphere at top)
      if (child.geometry.type === 'SphereGeometry' && child.position.y > 1.0) {
        child.rotation.x = Math.sin(talkTime * 5) * 0.08;
        child.rotation.z = Math.sin(talkTime * 7) * 0.06;
      }
    }
  });
}

/**
 * Get current zoom state for external checks
 */
export function getZoomState() {
  return {
    current: cameraZoomConfig.current,
    isTransitioning: cameraZoomConfig.isTransitioning,
    targetNPC: cameraZoomConfig.targetNPC
  };
}
