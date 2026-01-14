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
    pendingNotification: null,
    completionShown: false,
    capeUnlocked: false,
    bernieListenersActive: false,
    bernieListenersLeaving: false
  };
}
