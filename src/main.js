// Main entry point - initializes and starts the game
import { initRenderer, scene, camera, renderer } from './engine/renderer.js';
import { setUpdateCallback, startLoop } from './engine/loop.js';
import { createGameState } from './game/gameState.js';
import { createPlayer, unlockPlayerCape } from './entities/player.js';
import { createBuildings, buildings } from './entities/buildings.js';
import {
  npcs,
  wanderers,
  bernieListeners,
  corgis,
  bees,
  createNPCs,
  createWanderers,
  createBernieListenersGroup,
  createCorgis,
  createBees
} from './entities/npcs.js';
import {
  collectibles,
  clouds,
  insects,
  initCollectibles,
  createCollectibles,
  createClouds,
  createInsects,
  createAmbientParticles
} from './entities/collectibles.js';
import { createWorld } from './entities/world.js';
import { createAllStreets } from './entities/streets.js';
import {
  createRiver,
  createAllBridges,
  createJumpingFish,
  createFishingDock
} from './entities/river.js';
import { handleAction } from './game/interactions.js';
import { update } from './game/update.js';
import {
  initUI,
  setupControls,
  setupSplashInteractions,
  updateMusicUI,
  setCollectibleTotal
} from './ui/uiManager.js';
import { musicAudio, musicState, loadTrack, playNextTrack } from './audio/audioManager.js';
import { EVENT, PLAYER_CONFIG } from './config.js';
import { generateDialogs, SPEAKERS, GUESTS, MUSIC_TRACKS } from './assets/data.js';

// Create the context object that will be shared across modules
const ctx = {
  // Game state
  gameState: null,

  // Three.js objects
  scene,
  camera,
  renderer,
  player: null,
  buildings,
  npcs,
  wanderers,
  bernieListeners,
  corgis,
  bees,
  insects,
  collectibles,
  clouds,

  // Data
  EVENT,
  SPEAKERS,
  GUESTS,
  MUSIC_TRACKS,
  DIALOGS: null,

  // Functions that need to be accessible from UI
  handleAction: null,
  unlockPlayerCape: null
};

// Initialize the game
function init() {
  // Initialize game state
  ctx.gameState = createGameState();

  // Generate dialogs from data
  ctx.DIALOGS = generateDialogs(EVENT, SPEAKERS, GUESTS);

  // Initialize renderer
  initRenderer();

  // Initialize collectibles system
  initCollectibles();

  // Create game world
  initGameWorld();

  // Initialize UI with context
  initUI(ctx);

  // Setup controls
  setupControls();

  // Setup splash screen
  setupSplashInteractions();

  // Setup audio
  musicAudio.volume = 0.5;
  musicAudio.addEventListener('ended', playNextTrack);
  loadTrack(musicState.currentIndex);

  // Update UI
  updateMusicUI();
  setCollectibleTotal(collectibles.length);

  // Setup function references in context
  ctx.handleAction = () => handleAction(ctx);
  ctx.unlockPlayerCape = () => unlockPlayerCape(ctx.gameState);

  // Setup update callback
  setUpdateCallback((delta, time) => {
    update(ctx, delta, time);
  });

  // Start the game loop
  startLoop();
}

// Create the game world
function initGameWorld() {
  // Create world environment (ground, paths, fountain, decorations, etc.)
  createWorld();

  // Create Austinville street system
  createAllStreets();

  // Create river, bridges, and fishing dock
  createRiver();
  createAllBridges();
  createFishingDock();
  createJumpingFish();

  // Create buildings
  createBuildings();

  // Create player
  ctx.player = createPlayer();

  // Create NPCs
  createNPCs();
  createWanderers();
  createBernieListenersGroup();
  createCorgis();
  createBees();

  // Create collectibles, clouds, insects, and ambient particles
  createCollectibles();
  createClouds();
  createInsects();
  createAmbientParticles(60); // Floating petals and sparkles
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
