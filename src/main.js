// Main entry point - initializes and starts the game
import { initRenderer, scene, camera, renderer } from './engine/renderer.js';
import { setUpdateCallback, startLoop } from './engine/loop.js';
import { createGameState } from './game/gameState.js';
import { createPlayer, unlockPlayerCape } from './entities/player.js';
import { handleAction, handleCorgiClick } from './game/interactions.js';
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
  fireflies,
  cherryPetals,
  initCollectibles,
  createCollectibles,
  createClouds,
  createInsects,
  createAmbientParticles,
  createFireflies,
  createCherryPetals
} from './entities/collectibles.js';
import { createWorld } from './entities/world.js';
import { createAllStreets } from './entities/streets.js';
import {
  createRiver,
  createAllBridges,
  createJumpingFish,
  createFishingDock,
  createLilyPads,
  createRiverPlants,
  createBridgeDecorations,
  createHikeSign,
  createForest,
  createFoxes,
  createBirds,
  createBridgeTroll,
  bridgeTroll,
  forestTrees
} from './entities/river.js';
import { createKingEntourage, kingBen, royalGuards } from './entities/king.js';
import { createDoomSayer, doomSayer } from './entities/doomSayer.js';
import { createAllShops, teaCafe, coffeeCafe, donutShop, pinkieSchool } from './entities/shops.js';
import { createAllActivities } from './entities/activities.js';
import { createBuildingNPCs, buildingNpcs } from './entities/buildingNpcs.js';
import { createConstructionZone, constructionForeman } from './entities/constructionZone.js';
import { initBoxingMinigame } from './game/boxingMinigame.js';
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
  fireflies,
  cherryPetals,
  buildingNpcs,

  // Data
  EVENT,
  SPEAKERS,
  GUESTS,
  MUSIC_TRACKS,
  DIALOGS: null,

  // Functions that need to be accessible from UI
  handleAction: null,
  unlockPlayerCape: null,

  // Bridge troll reference (set after creation)
  bridgeTroll: null,

  // Construction foreman reference (set after creation)
  constructionForeman: null
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

  // Setup corgi petting interaction
  const canvas = renderer.domElement;
  canvas.addEventListener('click', (event) => {
    // Don't interfere with UI interactions
    if (ctx.gameState.dialogOpen) return;
    handleCorgiClick(event, camera, corgis);
  });

  canvas.addEventListener('touchend', (event) => {
    // Don't interfere with UI interactions
    if (ctx.gameState.dialogOpen) return;
    handleCorgiClick(event, camera, corgis);
  });

  // Setup splash screen
  setupSplashInteractions();

  // Setup audio
  musicAudio.volume = 0.5;
  musicAudio.addEventListener('ended', () => {
    playNextTrack();
    updateMusicUI();
  });
  loadTrack(musicState.currentIndex);

  // Update UI
  updateMusicUI();
  setCollectibleTotal(collectibles.length);

  // Setup function references in context
  ctx.handleAction = () => handleAction(ctx);
  ctx.unlockPlayerCape = () => unlockPlayerCape(ctx.gameState);

  // Initialize boxing minigame system
  initBoxingMinigame();

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

  // Create improved river visuals (lily pads, plants, decorations)
  createLilyPads();
  createRiverPlants();
  createBridgeDecorations();

  // Create HIKE sign on the other side of bridge
  createHikeSign();

  // Create forest with foxes and birds
  createForest();
  createFoxes();
  createBirds();

  // Create bridge troll
  createBridgeTroll();

  // Set bridge troll reference in context
  ctx.bridgeTroll = bridgeTroll;

  // Create construction zone in the forest (meta-humor "under construction" area)
  createConstructionZone();

  // Set construction foreman reference in context
  ctx.constructionForeman = constructionForeman;

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

  // Create special characters (King Ben and Doom Sayer)
  createKingEntourage();
  createDoomSayer();

  // Create Austinville shops (Tea Café, Coffee Café, Donut Shop, Pinkie School)
  createAllShops();

  // Create Austinville activities (Boxing Ring, Trampoline, Fishing NPCs, Tea vs Coffee War)
  createAllActivities();

  // Create building NPCs (for shops and activities lore)
  createBuildingNPCs();

  // Create collectibles, clouds, insects, and ambient particles
  createCollectibles();
  createClouds();
  createInsects();
  createAmbientParticles(60); // Floating petals and sparkles
  createFireflies(50); // Glowing fireflies in forest areas
  createCherryPetals(10); // Falling petals from cherry trees (10 per tree)
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
