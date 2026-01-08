/**
 * COLLISION MANAGER SYSTEM
 * =========================
 *
 * This is the central collision detection and response system for the Royal Court Tea Party game.
 * It handles all collision types: player, NPCs, buildings, and other entities.
 *
 * FOR NEW DEVELOPERS:
 * -------------------
 *
 * 1. COLLISION TYPES:
 *    - Static Colliders: Buildings, obstacles (don't move)
 *    - Dynamic Colliders: Player, NPCs, dogs (move every frame)
 *
 * 2. COLLISION SHAPES:
 *    - Box: Axis-aligned bounding box (used for buildings)
 *    - Circle: Circle collider (used for characters - more natural movement)
 *
 * 3. HOW TO USE:
 *    ```javascript
 *    import { collisionManager } from './systems/CollisionManager.js';
 *
 *    // Register static colliders (buildings)
 *    collisionManager.addStaticBox(x, z, width, depth);
 *
 *    // Register dynamic entities (NPCs, player)
 *    collisionManager.registerEntity('npc_1', npcMesh, 0.5); // radius 0.5
 *
 *    // Check if movement is valid
 *    const canMove = collisionManager.canMove(entityId, newX, newZ);
 *
 *    // Get corrected position (slides along walls)
 *    const corrected = collisionManager.getValidatedPosition(entityId, targetX, targetZ);
 *    entity.position.x = corrected.x;
 *    entity.position.z = corrected.z;
 *    ```
 *
 * 4. SPATIAL PARTITIONING:
 *    - Uses a grid system to optimize collision checks
 *    - Only checks entities in nearby grid cells
 *    - Grid size: 10 units (configurable)
 *
 * 5. COLLISION RESPONSE:
 *    - Returns corrected positions that slide along obstacles
 *    - Prevents entities from getting stuck or spinning infinitely
 *    - Handles corner cases and edge collisions
 */

import * as THREE from 'three';

// Collision shape types
const SHAPE_TYPES = {
  BOX: 'box',
  CIRCLE: 'circle'
};

// Collision layers (for filtering what collides with what)
const COLLISION_LAYERS = {
  STATIC: 1,      // Buildings, obstacles
  PLAYER: 2,      // Player character
  NPC: 4,         // NPCs and dogs
  BOUNDARY: 8     // World boundaries
};

/**
 * Represents a static collision box (building, obstacle)
 */
class StaticCollider {
  constructor(minX, maxX, minZ, maxZ) {
    this.type = SHAPE_TYPES.BOX;
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
    this.centerX = (minX + maxX) / 2;
    this.centerZ = (minZ + maxZ) / 2;
    this.width = maxX - minX;
    this.depth = maxZ - minZ;
  }

  /**
   * Check if a circle overlaps with this box
   */
  intersectsCircle(cx, cz, radius) {
    // Find closest point on box to circle center
    const closestX = Math.max(this.minX, Math.min(cx, this.maxX));
    const closestZ = Math.max(this.minZ, Math.min(cz, this.maxZ));

    // Calculate distance from circle center to closest point
    const dx = cx - closestX;
    const dz = cz - closestZ;
    const distSquared = dx * dx + dz * dz;

    return distSquared < radius * radius;
  }

  /**
   * Check if a box overlaps with this box
   */
  intersectsBox(minX, maxX, minZ, maxZ) {
    return !(maxX < this.minX || minX > this.maxX || maxZ < this.minZ || minZ > this.maxZ);
  }
}

/**
 * Represents a dynamic entity with circular collision
 */
class DynamicEntity {
  constructor(id, mesh, radius, layer) {
    this.id = id;
    this.mesh = mesh;
    this.radius = radius;
    this.layer = layer;
    this.enabled = true;
  }

  get x() { return this.mesh.position.x; }
  get z() { return this.mesh.position.z; }

  /**
   * Check if this entity overlaps with another circle
   */
  intersectsCircle(cx, cz, radius) {
    if (!this.enabled) return false;
    const dx = this.x - cx;
    const dz = this.z - cz;
    const distSquared = dx * dx + dz * dz;
    const minDist = this.radius + radius;
    return distSquared < minDist * minDist;
  }
}

/**
 * Grid cell for spatial partitioning
 */
class GridCell {
  constructor() {
    this.entities = new Set();
    this.staticColliders = [];
  }
}

/**
 * Main Collision Manager Class
 * =============================
 *
 * Handles all collision detection and response in the game.
 */
class CollisionManager {
  constructor() {
    // Static colliders (buildings, obstacles)
    this.staticColliders = [];

    // Dynamic entities (player, NPCs, dogs)
    this.entities = new Map();

    // World boundary
    this.worldRadius = 75;

    // Spatial partitioning grid
    this.gridSize = 10;
    this.grid = new Map();

    // Debug mode
    this.debug = false;
  }

  /**
   * ========================================
   * REGISTRATION METHODS
   * ========================================
   */

  /**
   * Add a static box collider (for buildings, obstacles)
   *
   * @param {number} centerX - Center X position
   * @param {number} centerZ - Center Z position
   * @param {number} width - Width (X dimension)
   * @param {number} depth - Depth (Z dimension)
   * @param {number} buffer - Extra padding around the box (default: 0)
   */
  addStaticBox(centerX, centerZ, width, depth, buffer = 0) {
    const halfW = width / 2 + buffer;
    const halfD = depth / 2 + buffer;

    const collider = new StaticCollider(
      centerX - halfW,
      centerX + halfW,
      centerZ - halfD,
      centerZ + halfD
    );

    this.staticColliders.push(collider);

    // Add to spatial grid
    this._addStaticToGrid(collider);

    return collider;
  }

  /**
   * Add a static box collider using min/max coordinates
   */
  addStaticBoxMinMax(minX, maxX, minZ, maxZ) {
    const collider = new StaticCollider(minX, maxX, minZ, maxZ);
    this.staticColliders.push(collider);
    this._addStaticToGrid(collider);
    return collider;
  }

  /**
   * Register a dynamic entity (player, NPC, dog)
   *
   * @param {string} id - Unique identifier for this entity
   * @param {THREE.Object3D} mesh - The 3D mesh object
   * @param {number} radius - Collision radius
   * @param {number} layer - Collision layer (use COLLISION_LAYERS)
   */
  registerEntity(id, mesh, radius, layer = COLLISION_LAYERS.NPC) {
    const entity = new DynamicEntity(id, mesh, radius, layer);
    this.entities.set(id, entity);
    return entity;
  }

  /**
   * Unregister an entity (when it's removed from the game)
   */
  unregisterEntity(id) {
    this.entities.delete(id);
  }

  /**
   * Enable/disable collision for an entity
   */
  setEntityEnabled(id, enabled) {
    const entity = this.entities.get(id);
    if (entity) {
      entity.enabled = enabled;
    }
  }

  /**
   * ========================================
   * COLLISION QUERY METHODS
   * ========================================
   */

  /**
   * Check if a position is valid (no collisions)
   *
   * @param {string} entityId - ID of the entity to check (null for no entity)
   * @param {number} x - X position to check
   * @param {number} z - Z position to check
   * @param {number} radius - Collision radius (default: 0.5)
   * @param {boolean} checkEntities - Whether to check other entities (default: true)
   * @returns {boolean} True if position is valid (no collisions)
   */
  canMove(entityId, x, z, radius = 0.5, checkEntities = true) {
    // Check world boundary
    if (!this._isInBounds(x, z)) {
      return false;
    }

    // Check static colliders
    if (this._checkStaticCollision(x, z, radius)) {
      return false;
    }

    // Check other entities
    if (checkEntities && this._checkEntityCollision(entityId, x, z, radius)) {
      return false;
    }

    return true;
  }

  /**
   * Get a validated position that slides along obstacles
   *
   * This is the main method for moving entities. It takes a target position
   * and returns a corrected position that:
   * 1. Doesn't overlap with any colliders
   * 2. Slides along walls/obstacles naturally
   * 3. Prevents getting stuck or spinning
   *
   * @param {string} entityId - ID of the moving entity
   * @param {number} targetX - Desired X position
   * @param {number} targetZ - Desired Z position
   * @param {number} radius - Collision radius
   * @param {boolean} checkEntities - Whether to check other entities
   * @returns {{x: number, z: number, collided: boolean}} Validated position
   */
  getValidatedPosition(entityId, targetX, targetZ, radius = 0.5, checkEntities = true) {
    const entity = this.entities.get(entityId);
    const currentX = entity ? entity.x : targetX;
    const currentZ = entity ? entity.z : targetZ;

    // If target position is valid, use it
    if (this.canMove(entityId, targetX, targetZ, radius, checkEntities)) {
      return { x: targetX, z: targetZ, collided: false };
    }

    // Try sliding along X axis only
    if (this.canMove(entityId, targetX, currentZ, radius, checkEntities)) {
      return { x: targetX, z: currentZ, collided: true };
    }

    // Try sliding along Z axis only
    if (this.canMove(entityId, currentX, targetZ, radius, checkEntities)) {
      return { x: currentX, z: targetZ, collided: true };
    }

    // Can't move - return current position
    return { x: currentX, z: currentZ, collided: true };
  }

  /**
   * Find the nearest valid position to a target position
   * Useful for placing entities in safe spots
   *
   * @param {number} targetX - Desired X position
   * @param {number} targetZ - Desired Z position
   * @param {number} radius - Entity radius
   * @param {number} searchRadius - How far to search (default: 5)
   * @param {number} searchSteps - Number of search attempts (default: 16)
   * @returns {{x: number, z: number} | null} Valid position or null
   */
  findNearestValidPosition(targetX, targetZ, radius = 0.5, searchRadius = 5, searchSteps = 16) {
    // Try the target position first
    if (this.canMove(null, targetX, targetZ, radius, false)) {
      return { x: targetX, z: targetZ };
    }

    // Search in expanding circles
    for (let r = 1; r <= searchRadius; r += 0.5) {
      for (let i = 0; i < searchSteps; i++) {
        const angle = (i / searchSteps) * Math.PI * 2;
        const x = targetX + Math.cos(angle) * r;
        const z = targetZ + Math.sin(angle) * r;

        if (this.canMove(null, x, z, radius, false)) {
          return { x, z };
        }
      }
    }

    return null;
  }

  /**
   * Get all entities within a radius of a position
   *
   * @param {number} x - Center X
   * @param {number} z - Center Z
   * @param {number} radius - Search radius
   * @param {string} excludeId - Entity ID to exclude from results
   * @returns {Array<DynamicEntity>} Entities within radius
   */
  getEntitiesInRadius(x, z, radius, excludeId = null) {
    const results = [];

    for (const entity of this.entities.values()) {
      if (!entity.enabled) continue;
      if (entity.id === excludeId) continue;

      const dx = entity.x - x;
      const dz = entity.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= radius) {
        results.push(entity);
      }
    }

    return results;
  }

  /**
   * ========================================
   * INTERNAL COLLISION CHECKING
   * ========================================
   */

  /**
   * Check if position is within world boundaries
   */
  _isInBounds(x, z) {
    const dist = Math.sqrt(x * x + z * z);
    return dist <= this.worldRadius;
  }

  /**
   * Check collision with static colliders (buildings, obstacles)
   */
  _checkStaticCollision(x, z, radius) {
    // Use spatial grid for optimization
    const gridCells = this._getGridCells(x, z, radius);

    for (const cell of gridCells) {
      for (const collider of cell.staticColliders) {
        if (collider.intersectsCircle(x, z, radius)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check collision with other entities
   */
  _checkEntityCollision(entityId, x, z, radius) {
    for (const other of this.entities.values()) {
      if (!other.enabled) continue;
      if (other.id === entityId) continue;

      if (other.intersectsCircle(x, z, radius)) {
        return true;
      }
    }

    return false;
  }

  /**
   * ========================================
   * SPATIAL PARTITIONING (GRID)
   * ========================================
   */

  /**
   * Get grid key for a position
   */
  _getGridKey(x, z) {
    const gx = Math.floor(x / this.gridSize);
    const gz = Math.floor(z / this.gridSize);
    return `${gx},${gz}`;
  }

  /**
   * Get or create grid cell
   */
  _getGridCell(x, z) {
    const key = this._getGridKey(x, z);
    if (!this.grid.has(key)) {
      this.grid.set(key, new GridCell());
    }
    return this.grid.get(key);
  }

  /**
   * Get all grid cells that might contain collisions for a position
   */
  _getGridCells(x, z, radius) {
    const cells = [];
    const minX = x - radius;
    const maxX = x + radius;
    const minZ = z - radius;
    const maxZ = z + radius;

    const minGX = Math.floor(minX / this.gridSize);
    const maxGX = Math.floor(maxX / this.gridSize);
    const minGZ = Math.floor(minZ / this.gridSize);
    const maxGZ = Math.floor(maxZ / this.gridSize);

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gz = minGZ; gz <= maxGZ; gz++) {
        const cell = this.grid.get(`${gx},${gz}`);
        if (cell) {
          cells.push(cell);
        }
      }
    }

    return cells;
  }

  /**
   * Add static collider to grid
   */
  _addStaticToGrid(collider) {
    const minGX = Math.floor(collider.minX / this.gridSize);
    const maxGX = Math.floor(collider.maxX / this.gridSize);
    const minGZ = Math.floor(collider.minZ / this.gridSize);
    const maxGZ = Math.floor(collider.maxZ / this.gridSize);

    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gz = minGZ; gz <= maxGZ; gz++) {
        const cell = this._getGridCell(gx * this.gridSize, gz * this.gridSize);
        cell.staticColliders.push(collider);
      }
    }
  }

  /**
   * ========================================
   * UTILITY METHODS
   * ========================================
   */

  /**
   * Clear all collision data
   */
  clear() {
    this.staticColliders = [];
    this.entities.clear();
    this.grid.clear();
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      staticColliders: this.staticColliders.length,
      dynamicEntities: this.entities.size,
      gridCells: this.grid.size,
      worldRadius: this.worldRadius
    };
  }

  /**
   * Enable/disable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// Create singleton instance
export const collisionManager = new CollisionManager();

// Export class and constants for advanced usage
export { CollisionManager, COLLISION_LAYERS, SHAPE_TYPES };
