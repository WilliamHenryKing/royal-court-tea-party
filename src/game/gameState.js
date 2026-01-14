// Game State - centralized game state management

// Create and export the game state
export function createGameState() {
  return {
    started: false,
    dialogOpen: false,
    timeScale: 1,
    firstSweetShown: false,
    visited: new Set(),
    visitedBuildings: new Set(), // Track building NPC visits for intro vs remarks
    visitedSpecialNpcs: new Set(),
    collected: 0,
    currentLocation: 'palace',
    nearNPC: null,
    nearWanderer: null,
    nearTroll: null,
    nearBuildingNPC: null, // Track proximity to building NPCs
    nearForeman: null, // Track proximity to construction foreman
    nearBoxingRing: false, // Track proximity to boxing ring entrance
    // Boxing minigame state
    boxingMinigame: {
      active: false,           // Is the minigame currently running
      phase: 'idle',           // idle, intro, fighting, victory, defeat
      playerHealth: 100,
      playerStamina: 100,
      playerIsBlocking: false,
      playerAttackCooldown: 0,
      knight1Health: 100,      // Sir Clumsy
      knight2Health: 100,      // Lord Fumbles
      currentTarget: 0,        // Which knight player is facing (0 or 1)
      comboCount: 0,
      lastHitTime: 0,
      knockoutCount: 0,        // How many times player has won
      defeatCount: 0           // How many times player has lost
    },
    pendingNotification: null,
    completionShown: false,
    capeUnlocked: false,
    bernieListenersActive: false,
    bernieListenersLeaving: false
  };
}
