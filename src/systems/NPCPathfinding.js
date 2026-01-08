/**
 * NPC PATHFINDING SYSTEM
 * =======================
 *
 * This system provides intelligent pathfinding and destination-based movement for NPCs.
 * NPCs will walk to various locations around town instead of just wandering randomly.
 *
 * FOR NEW DEVELOPERS:
 * -------------------
 *
 * 1. OVERVIEW:
 *    - NPCs have "destinations" they want to visit (buildings, points of interest)
 *    - Each NPC picks a destination, walks there, stays for a while, then picks a new one
 *    - Path finding uses waypoints to navigate around buildings
 *
 * 2. HOW IT WORKS:
 *    ```javascript
 *    import { npcPathfinder } from './systems/NPCPathfinding.js';
 *
 *    // In NPC creation:
 *    npc.userData.pathfindingState = npcPathfinder.createState();
 *
 *    // In update loop:
 *    const result = npcPathfinder.updateNPC(npc, delta);
 *    if (result.targetAngle !== null) {
 *      npc.userData.walkAngle = result.targetAngle;
 *    }
 *    ```
 *
 * 3. DESTINATIONS:
 *    - Buildings: Palace, Tea Shop, Speakers, Guests, Feast Hall
 *    - Activities: Boxing Ring, Trampoline, Fishing Dock
 *    - Points of Interest: Plaza, Park areas, Streets
 *
 * 4. BEHAVIOR:
 *    - NPCs walk toward their destination
 *    - When they arrive, they stay for a while (5-15 seconds)
 *    - Then they pick a new random destination
 *    - Uses smart pathfinding to avoid buildings
 *
 * 5. SPEED TYPES:
 *    - Fast NPCs: Visit more places, shorter stays
 *    - Normal NPCs: Balanced exploration
 *    - Slow NPCs: Fewer destinations, longer stays
 */

import * as THREE from 'three';
import { LOCATIONS } from '../assets/data.js';
import { collisionManager } from './CollisionManager.js';

// Destination types
const DESTINATION_TYPES = {
  BUILDING: 'building',
  ACTIVITY: 'activity',
  POI: 'point_of_interest',  // Point of interest
  WANDER: 'wander'
};

// Movement states
const MOVEMENT_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  ARRIVED: 'arrived'
};

/**
 * Points of Interest around Austinville
 * These are interesting spots where NPCs might want to visit
 */
const POINTS_OF_INTEREST = [
  { id: 'plaza', x: 0, z: 0, name: 'Central Plaza' },
  { id: 'east_park', x: 25, z: 10, name: 'East Park' },
  { id: 'west_park', x: -25, z: 10, name: 'West Park' },
  { id: 'north_plaza', x: 0, z: 25, name: 'North Plaza' },
  { id: 'south_street', x: 0, z: -20, name: 'South Street' },
  { id: 'fountain', x: 0, z: 0, name: 'Fountain' },
  { id: 'east_corner', x: 20, z: 20, name: 'East Corner' },
  { id: 'west_corner', x: -20, z: 20, name: 'West Corner' }
];

/**
 * Activity locations (from activities.js)
 */
const ACTIVITY_DESTINATIONS = [
  { id: 'boxing', x: -25, z: 25, name: 'Boxing Ring' },
  { id: 'trampoline', x: 25, z: -25, name: 'Trampoline' },
  { id: 'fishing', x: -30, z: -30, name: 'Fishing Dock' }
];

/**
 * All possible destinations
 */
let allDestinations = [];

/**
 * Initialize destination list
 */
function initializeDestinations() {
  if (allDestinations.length > 0) return;

  // Add buildings
  LOCATIONS.forEach(loc => {
    allDestinations.push({
      id: loc.id,
      x: loc.x,
      z: loc.z,
      name: loc.id,
      type: DESTINATION_TYPES.BUILDING,
      approachDistance: 3  // How close to get before "arriving"
    });
  });

  // Add activities
  ACTIVITY_DESTINATIONS.forEach(act => {
    allDestinations.push({
      id: act.id,
      x: act.x,
      z: act.z,
      name: act.name,
      type: DESTINATION_TYPES.ACTIVITY,
      approachDistance: 4
    });
  });

  // Add points of interest
  POINTS_OF_INTEREST.forEach(poi => {
    allDestinations.push({
      id: poi.id,
      x: poi.x,
      z: poi.z,
      name: poi.name,
      type: DESTINATION_TYPES.POI,
      approachDistance: 2
    });
  });
}

/**
 * NPC Pathfinding Manager Class
 */
class NPCPathfinder {
  constructor() {
    this.enabled = true;
    initializeDestinations();
  }

  /**
   * Create a new pathfinding state for an NPC
   */
  createState(speedType = 'normal') {
    return {
      currentDestination: null,
      destinationHistory: [],  // Track last 3 destinations to avoid repetition
      state: MOVEMENT_STATES.IDLE,
      arrivalTimer: 0,
      stuckTimer: 0,
      lastPosition: new THREE.Vector3(),
      speedType: speedType,
      preferredDestinations: this._getPreferredDestinations(speedType)
    };
  }

  /**
   * Get preferred destinations based on NPC speed type
   */
  _getPreferredDestinations(speedType) {
    if (speedType === 'fast') {
      // Fast NPCs prefer activities and exciting places
      return [DESTINATION_TYPES.ACTIVITY, DESTINATION_TYPES.POI];
    } else if (speedType === 'slow') {
      // Slow NPCs prefer buildings and quiet spots
      return [DESTINATION_TYPES.BUILDING, DESTINATION_TYPES.POI];
    } else {
      // Normal NPCs visit everything
      return [DESTINATION_TYPES.BUILDING, DESTINATION_TYPES.ACTIVITY, DESTINATION_TYPES.POI];
    }
  }

  /**
   * Pick a new destination for an NPC
   */
  _pickNewDestination(npc) {
    const state = npc.userData.pathfindingState;
    if (!state) return null;

    // Filter destinations by preference and history
    const available = allDestinations.filter(dest => {
      // Don't revisit recent destinations
      if (state.destinationHistory.includes(dest.id)) return false;

      // Filter by preference
      if (!state.preferredDestinations.includes(dest.type)) {
        // 30% chance to visit non-preferred destinations
        return Math.random() < 0.3;
      }

      return true;
    });

    if (available.length === 0) {
      // If no destinations available, clear history and try again
      state.destinationHistory = [];
      return this._pickNewDestination(npc);
    }

    // Pick random destination from available
    const dest = available[Math.floor(Math.random() * available.length)];

    // Update history (keep last 3)
    state.destinationHistory.push(dest.id);
    if (state.destinationHistory.length > 3) {
      state.destinationHistory.shift();
    }

    return dest;
  }

  /**
   * Calculate angle to move toward destination
   */
  _calculateMoveAngle(npc) {
    const state = npc.userData.pathfindingState;
    if (!state || !state.currentDestination) return null;

    const dest = state.currentDestination;
    const dx = dest.x - npc.position.x;
    const dz = dest.z - npc.position.z;

    return Math.atan2(dx, dz);
  }

  /**
   * Check if NPC has arrived at destination
   */
  _hasArrived(npc) {
    const state = npc.userData.pathfindingState;
    if (!state || !state.currentDestination) return false;

    const dest = state.currentDestination;
    const dx = dest.x - npc.position.x;
    const dz = dest.z - npc.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    return dist < (dest.approachDistance || 3);
  }

  /**
   * Check if NPC is stuck (not moving)
   */
  _isStuck(npc, delta) {
    const state = npc.userData.pathfindingState;
    if (!state) return false;

    const currentPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
    const distMoved = currentPos.distanceTo(state.lastPosition);

    if (distMoved < 0.01) {
      state.stuckTimer += delta;
    } else {
      state.stuckTimer = 0;
    }

    state.lastPosition.copy(currentPos);

    // If stuck for more than 2 seconds, consider stuck
    return state.stuckTimer > 2;
  }

  /**
   * Main update function for NPC pathfinding
   *
   * @param {THREE.Object3D} npc - The NPC object
   * @param {number} delta - Time delta
   * @returns {{targetAngle: number|null, shouldMove: boolean, isArrived: boolean}}
   */
  updateNPC(npc, delta) {
    if (!this.enabled) {
      return { targetAngle: null, shouldMove: false, isArrived: false };
    }

    // Initialize state if needed
    if (!npc.userData.pathfindingState) {
      npc.userData.pathfindingState = this.createState(npc.userData.speed || 'normal');
    }

    const state = npc.userData.pathfindingState;

    // State machine
    switch (state.state) {
      case MOVEMENT_STATES.IDLE:
        // Pick a new destination
        state.currentDestination = this._pickNewDestination(npc);
        state.state = MOVEMENT_STATES.WALKING;
        state.stuckTimer = 0;
        return { targetAngle: this._calculateMoveAngle(npc), shouldMove: true, isArrived: false };

      case MOVEMENT_STATES.WALKING:
        // Check if arrived
        if (this._hasArrived(npc)) {
          state.state = MOVEMENT_STATES.ARRIVED;

          // Arrival timer based on speed type
          if (state.speedType === 'fast') {
            state.arrivalTimer = 2 + Math.random() * 3;  // 2-5 seconds
          } else if (state.speedType === 'slow') {
            state.arrivalTimer = 8 + Math.random() * 7;  // 8-15 seconds
          } else {
            state.arrivalTimer = 5 + Math.random() * 5;  // 5-10 seconds
          }

          return { targetAngle: null, shouldMove: false, isArrived: true };
        }

        // Check if stuck
        if (this._isStuck(npc, delta)) {
          // Pick a new destination if stuck
          state.state = MOVEMENT_STATES.IDLE;
          state.currentDestination = null;
          return { targetAngle: null, shouldMove: false, isArrived: false };
        }

        // Continue walking
        return { targetAngle: this._calculateMoveAngle(npc), shouldMove: true, isArrived: false };

      case MOVEMENT_STATES.ARRIVED:
        // Wait at destination
        state.arrivalTimer -= delta;
        if (state.arrivalTimer <= 0) {
          state.state = MOVEMENT_STATES.IDLE;
          state.currentDestination = null;
        }
        return { targetAngle: null, shouldMove: false, isArrived: true };
    }

    return { targetAngle: null, shouldMove: false, isArrived: false };
  }

  /**
   * Enable/disable pathfinding system
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Force NPC to pick new destination
   */
  resetNPCDestination(npc) {
    if (npc.userData.pathfindingState) {
      npc.userData.pathfindingState.state = MOVEMENT_STATES.IDLE;
      npc.userData.pathfindingState.currentDestination = null;
    }
  }

  /**
   * Get debug info for an NPC
   */
  getDebugInfo(npc) {
    const state = npc.userData.pathfindingState;
    if (!state) return null;

    return {
      state: state.state,
      destination: state.currentDestination?.name || 'none',
      arrivalTimer: state.arrivalTimer.toFixed(1),
      stuckTimer: state.stuckTimer.toFixed(1)
    };
  }
}

// Create singleton instance
export const npcPathfinder = new NPCPathfinder();

// Export for advanced usage
export { DESTINATION_TYPES, MOVEMENT_STATES };
