// Game State - centralized game state management

// Create and export the game state
export function createGameState() {
  return {
    started: false,
    dialogOpen: false,
    timeScale: 1,
    firstSweetShown: false,
    visited: new Set(),
    collected: 0,
    currentLocation: 'palace',
    nearNPC: null,
    nearWanderer: null,
    nearTroll: null,
    pendingNotification: null,
    completionShown: false,
    capeUnlocked: false,
    bernieListenersActive: false,
    bernieListenersLeaving: false
  };
}
