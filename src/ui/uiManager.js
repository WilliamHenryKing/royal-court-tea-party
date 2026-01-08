// UI Manager - handles all DOM interactions and UI updates
// Imports from other modules
import {
  playVoice,
  playRandomWandererVoice,
  musicState,
  musicAudio,
  playCurrentTrack,
  toggleMusicMute,
  playNextTrack,
  initializeAmbientAudio,
  playNpcGreeting,
  playNpcLaugh,
  playNpcSigh
} from '../audio/audioManager.js';
import { LOCATIONS } from '../assets/data.js';
import { AUDIO_CONFIG } from '../config.js';
import {
  joystickInput,
  keyboardState,
  desktopModeEnabled,
  setDesktopModeEnabled,
  updateKeyboardVector
} from '../systems/inputSystem.js';
import {
  addClickHandler,
  addToggleHandler,
  addCloseHandler
} from './interactionHandler.js';
import { zoomToNPC, zoomOut } from '../systems/cameraZoom.js';
import { generateBuildingDialog, generateKingDialog } from '../assets/data.js';
import { settingsManager } from '../systems/settingsManager.js';

// Module-level context reference
let ctx = null;

// Initialize UI manager with context
export function initUI(context) {
  ctx = context;
}

// Music UI
export function updateMusicUI() {
  const trackLabel = document.getElementById('music-track');
  const toggleBtn = document.getElementById('music-toggle');
  const track = ctx.MUSIC_TRACKS[musicState.currentIndex];
  if (trackLabel) {
    trackLabel.textContent = track ? track.title : 'Ready to play';
  }
  if (toggleBtn) {
    toggleBtn.textContent = musicAudio.muted ? '🔇 Muted' : '🔈 Sound On';
  }
}

export function setCollectibleTotal(total) {
  const totalLabel = document.getElementById('collectible-total');
  if (totalLabel) {
    totalLabel.textContent = total;
  }
}

export function updateCollectibleCount(count) {
  const countLabel = document.getElementById('collectible-count');
  if (countLabel) {
    countLabel.textContent = count;
  }
}

export function updateActionButton(nearestNPC, nearestWanderer, nearestBuildingNPC = null, nearestTroll = null) {
  const actionBtn = document.getElementById('action-btn');
  if (!actionBtn) return;
  if (nearestNPC || nearestWanderer || nearestBuildingNPC || nearestTroll) {
    actionBtn.classList.add('visible');
    if (nearestBuildingNPC) {
      // Building NPC - check if visited for icon
      const visited = ctx.gameState.visitedBuildings && ctx.gameState.visitedBuildings.has(nearestBuildingNPC);
      const icon = visited ? '💬' : '❓';
      actionBtn.innerHTML = `<span>${icon}</span><span>Tap to Talk</span>`;
    } else if (nearestNPC) {
      const visitedSpecial = nearestNPC === 'kingBen'
        ? ctx.gameState.visitedSpecialNpcs?.has(nearestNPC)
        : ctx.gameState.visited.has(nearestNPC);
      const icon = visitedSpecial ? '💬' : '❓';
      actionBtn.innerHTML = `<span>${icon}</span><span>Tap to Chat</span>`;
    } else if (nearestTroll) {
      actionBtn.innerHTML = `<span>🧌</span><span>Talk to Troll</span>`;
    } else {
      actionBtn.innerHTML = `<span>🤪</span><span>Say Hi!</span>`;
    }
  } else {
    actionBtn.classList.remove('visible');
  }
}

export function updateLocationDisplay(locationId, icon, name) {
  const iconEl = document.getElementById('location-icon');
  const nameEl = document.getElementById('location-name');
  if (iconEl) {
    iconEl.textContent = icon;
  }
  if (nameEl) {
    nameEl.textContent = name;
  }
  document.querySelectorAll('.map-icon').forEach(mapIcon => {
    mapIcon.classList.toggle('current', mapIcon.dataset.location === locationId);
  });
}

export function startAdventure() {
  document.getElementById('intro-modal').classList.remove('visible');
  ctx.gameState.dialogOpen = false;
  ctx.gameState.started = true;
  initializeAmbientAudio();
  if (!musicState.initialized) {
    musicState.initialized = true;
    playCurrentTrack();
    updateMusicUI();
  }
}

export function setDesktopMode(enabled) {
  setDesktopModeEnabled(enabled);
  const joystickContainer = document.getElementById('joystick-container');
  const keyboardHints = document.getElementById('keyboard-hints');
  joystickContainer.classList.toggle('is-hidden', enabled);
  keyboardHints.classList.toggle('visible', enabled);
  if (!enabled) {
    keyboardState.up = false;
    keyboardState.down = false;
    keyboardState.left = false;
    keyboardState.right = false;
    updateKeyboardVector();
  }
}

export function setupControls() {
  const container = document.getElementById('joystick-container');
  const base = document.getElementById('joystick-base');
  const thumb = document.getElementById('joystick-thumb');
  const ripple = document.querySelector('.joystick-ripple');
  const baseRadius = 55;
  const maxDistance = 32;
  let active = false;
  let centerX = 0;
  let centerY = 0;

  // Trigger ripple effect
  function triggerRipple() {
    if (ripple) {
      ripple.classList.remove('animate');
      void ripple.offsetWidth; // Force reflow
      ripple.classList.add('animate');
    }
  }
  const desktopSection = document.getElementById('desktop-mode-section');
  const desktopToggle = document.getElementById('desktop-mode-toggle');
  const isLikelyDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || /Windows|Macintosh|Linux/.test(navigator.userAgent);

  if (isLikelyDesktop) {
    desktopSection.classList.add('visible');
  } else {
    desktopSection.classList.remove('visible');
  }
  setDesktopMode(false);
  desktopToggle.checked = false;
  desktopToggle.addEventListener('change', (e) => {
    setDesktopMode(e.target.checked);
  });

  function start(e) {
    if (ctx.gameState.dialogOpen || !ctx.gameState.started) return;
    e.preventDefault();
    active = true;
    const rect = container.getBoundingClientRect();
    centerX = rect.left + baseRadius;
    centerY = rect.top + baseRadius;

    // Add active visual states
    base.classList.add('active');
    thumb.classList.add('active');
    triggerRipple();
  }

  function move(e) {
    if (!active) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    thumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joystickInput.x = dx / maxDistance;
    joystickInput.y = dy / maxDistance;
  }

  function end() {
    active = false;
    thumb.style.transform = 'translate(-50%, -50%)';
    joystickInput.x = 0;
    joystickInput.y = 0;

    // Remove active visual states
    base.classList.remove('active');
    thumb.classList.remove('active');
  }

  container.addEventListener('touchstart', start, { passive: false });
  container.addEventListener('touchmove', move, { passive: false });
  container.addEventListener('touchend', end);
  container.addEventListener('touchcancel', end);
  container.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);

  document.addEventListener('keydown', (e) => {
    if (!desktopModeEnabled) return;
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      e.preventDefault();
    }
    switch (key) {
      case 'w':
        keyboardState.up = true;
        break;
      case 's':
        keyboardState.down = true;
        break;
      case 'a':
        keyboardState.left = true;
        break;
      case 'd':
        keyboardState.right = true;
        break;
      case 'p':
        if (
          !e.repeat
          && !ctx.gameState.dialogOpen
          && ctx.gameState.started
          && (ctx.gameState.nearNPC
            || ctx.gameState.nearWanderer
            || ctx.gameState.nearBuildingNPC
            || ctx.gameState.nearTroll)
        ) {
          ctx.handleAction();
        }
        break;
      default:
        break;
    }
    updateKeyboardVector();
  });

  document.addEventListener('keyup', (e) => {
    if (!desktopModeEnabled) return;
    const key = e.key.toLowerCase();
    switch (key) {
      case 'w':
        keyboardState.up = false;
        break;
      case 's':
        keyboardState.down = false;
        break;
      case 'a':
        keyboardState.left = false;
        break;
      case 'd':
        keyboardState.right = false;
        break;
      default:
        break;
    }
    updateKeyboardVector();
  });

  // Action button - use consistent click handler
  const actionBtn = document.getElementById('action-btn');
  addClickHandler(actionBtn, () => {
    ctx.handleAction();
  });

  // Dialog close - use consistent close handler
  addCloseHandler(document.getElementById('dialog-close'), closeDialog);
  const dialogOverlay = document.getElementById('dialog-overlay');
  addClickHandler(dialogOverlay, (e) => {
    if (e.target.id === 'dialog-overlay') closeDialog();
  }, { preventDefault: false });

  // Completion modal - use consistent handlers
  addCloseHandler(document.getElementById('completion-close'), closeCompletion);
  addClickHandler(document.getElementById('continue-btn'), handleCompletionContinue, { preventDefault: false });

  // Music controls - use consistent handlers
  addClickHandler(document.getElementById('music-toggle'), () => {
    toggleMusicMute();
    if (!musicState.initialized) {
      musicState.initialized = true;
      playCurrentTrack();
    }
    updateMusicUI();
  }, { preventDefault: false });

  addClickHandler(document.getElementById('music-next'), () => {
    musicState.initialized = true;
    playNextTrack();
    updateMusicUI();
  }, { preventDefault: false });

  // Settings button - open settings modal
  addClickHandler(document.getElementById('settings-btn'), () => {
    openSettings();
  }, { preventDefault: false });

  // Fullscreen button
  addClickHandler(document.getElementById('fullscreen-btn'), () => {
    toggleFullscreen();
  }, { preventDefault: false });

  // Settings modal handlers
  setupSettingsModal();

  // Intro modal - use consistent handlers
  addClickHandler(document.getElementById('intro-start'), () => {
    startAdventure();
  }, { preventDefault: false });

  const introModal = document.getElementById('intro-modal');
  addClickHandler(introModal, (e) => {
    if (e.target.id === 'intro-modal') {
      startAdventure();
    }
  }, { preventDefault: false });

  // Sweet intro - use consistent handler
  addClickHandler(document.getElementById('sweet-dismiss'), dismissSweetIntro, { preventDefault: false });
}

// Create dynamic sparkles for splash screen
function createSplashSparkles() {
  const container = document.getElementById('sparkles');
  if (!container) return;

  const sparkleChars = ['✨', '⭐', '💫', '🌟', '✦'];

  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 4 + 's';
    sparkle.style.animationDuration = (3 + Math.random() * 2) + 's';
    container.appendChild(sparkle);
  }
}

// Cycle whimsical loading messages
function cycleLoadingMessages() {
  const messages = [
    "Polishing the royal crowns... 👑",
    "Brewing the perfect tea... 🍵",
    "Fluffing the corgis... 🐕",
    "Arranging the flowers... 🌸",
    "Setting the royal table... 🍰",
    "Tuning the harpsichord... 🎵",
    "Glazing the donuts... 🍩",
    "Training the butterflies... 🦋",
    "Waxing the royal floors... ✨",
    "Ironing the royal flags... 🚩",
    "Counting the sugar cubes... 🧊",
    "Practicing royal waves... 👋",
    "Frosting the cakes... 🎂",
    "Summoning the bees... 🐝",
    "Rolling out the red carpet... 🟥",
    "Teaching fish to jump... 🐟"
  ];

  const messageEl = document.querySelector('.loading-text');
  if (!messageEl) return;

  let index = 0;
  const intervalId = setInterval(() => {
    messageEl.textContent = messages[index];
    index = (index + 1) % messages.length;
  }, 2000);

  // Stop cycling when loading screen is hidden
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('hidden')) {
        clearInterval(intervalId);
        observer.disconnect();
      }
    });
  });

  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    observer.observe(loadingScreen, { attributes: true, attributeFilter: ['class'] });
  }
}

export function setupSplashInteractions() {
  const splashScreen = document.getElementById('splash-screen');
  const splashMap = document.getElementById('splash-map');
  const mapOverlay = document.getElementById('map-overlay');
  const startBtn = document.getElementById('start-btn');

  if (!splashScreen || !splashMap || !mapOverlay || !startBtn) return;

  // Start button handler - using reliable click handler
  let startTriggered = false;
  const triggerStart = () => {
    if (startTriggered) return;
    startTriggered = true;
    splashScreen.classList.add('hidden');
    mapOverlay.classList.remove('visible');
    splashMap.classList.remove('zoomed');
    document.getElementById('loading-screen').classList.remove('hidden');

    // Start cycling loading messages
    cycleLoadingMessages();

    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('intro-modal').classList.add('visible');
      ctx.gameState.dialogOpen = true;
    }, 2000);
  };

  // Use the centralized click handler for consistency
  addClickHandler(startBtn, triggerStart);

  // Map zoom toggle - using proper toggle handler
  addToggleHandler(splashMap, splashMap, mapOverlay, {
    toggleClass: 'zoomed',
    onOpen: () => {
      // When map zooms, also show overlay
      mapOverlay.classList.add('visible');
    },
    onClose: () => {
      // When map closes, hide overlay
      mapOverlay.classList.remove('visible');
    }
  });
}

export function openDialog(locationId) {
  const dialog = ctx.DIALOGS[locationId];
  if (!dialog) return;

  // Hide action button immediately
  document.getElementById('action-btn').classList.remove('visible');

  // Check if first visit (before showing dialog)
  const isNewVisit = !ctx.gameState.visited.has(locationId);
  if (isNewVisit) {
    ctx.gameState.visited.add(locationId);
    updateStars();
  }

  // Store for notification on close
  if (isNewVisit) {
    ctx.gameState.pendingNotification = locationId;
  }

  // Function to show the dialog UI
  const showDialogUI = () => {
    ctx.gameState.dialogOpen = true;

    // Play voice when dialog appears
    playVoice(locationId);
    playNpcGreeting();

    // Update dialog UI
    document.getElementById('dialog-avatar').textContent = dialog.avatar;
    document.getElementById('dialog-name').textContent = dialog.name;
    document.getElementById('dialog-role').textContent = dialog.role;

    const dialogContent = document.getElementById('dialog-content');
    dialogContent.innerHTML = dialog.content;

    document.getElementById('dialog-overlay').classList.add('visible');
  };

  // Zoom camera to NPC, then show dialog when zoom completes
  zoomToNPC(locationId, showDialogUI);
}

export function openKingDialog() {
  // Hide action button immediately
  document.getElementById('action-btn').classList.remove('visible');

  if (!ctx.gameState.visitedSpecialNpcs) {
    ctx.gameState.visitedSpecialNpcs = new Set();
  }

  const isNewVisit = !ctx.gameState.visitedSpecialNpcs.has('kingBen');
  if (isNewVisit) {
    ctx.gameState.visitedSpecialNpcs.add('kingBen');
  }

  const showDialogUI = () => {
    ctx.gameState.dialogOpen = true;

    playRandomWandererVoice();
    playNpcGreeting();

    const dialog = generateKingDialog(isNewVisit);
    if (dialog) {
      document.getElementById('dialog-avatar').textContent = dialog.avatar;
      document.getElementById('dialog-name').textContent = dialog.name;
      document.getElementById('dialog-role').textContent = dialog.role;

      const dialogContent = document.getElementById('dialog-content');
      dialogContent.innerHTML = dialog.content;
    }

    document.getElementById('dialog-overlay').classList.add('visible');
  };

  zoomToNPC('kingBen', showDialogUI);
}

export function openWandererDialog(npc) {
  const data = npc.userData;
  const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];

  // Play random voice
  playRandomWandererVoice();
  playNpcLaugh();

  ctx.gameState.dialogOpen = true;

  document.getElementById('dialog-avatar').textContent = '🤪';
  document.getElementById('dialog-name').textContent = data.name;
  document.getElementById('dialog-role').textContent = data.role;

  const content = `
    <div class="funny-quote" style="margin-top: 0;">${quote}</div>
    <p style="text-align: center; color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">*${data.name} wanders off humming*</p>
  `;

  const dialogContent = document.getElementById('dialog-content');
  dialogContent.innerHTML = content;

  document.getElementById('dialog-overlay').classList.add('visible');
  document.getElementById('action-btn').classList.remove('visible');
}

export function openTrollDialog(troll) {
  const data = troll.userData;

  // Check if we should offer a riddle
  const unsolvedRiddles = data.riddles.filter((_, i) => !data.solvedRiddles.has(i));
  const shouldOfferRiddle = unsolvedRiddles.length > 0 && Math.random() < 0.7; // 70% chance

  // Play random voice (reusing wanderer voice for now)
  playRandomWandererVoice();
  playNpcSigh();

  ctx.gameState.dialogOpen = true;

  document.getElementById('dialog-avatar').textContent = '🧌';
  document.getElementById('dialog-name').textContent = data.name;
  document.getElementById('dialog-role').textContent = data.role;

  let content;

  if (shouldOfferRiddle) {
    // Select a random unsolved riddle
    const riddleIndex = data.riddles.findIndex((_, i) => !data.solvedRiddles.has(i));
    const availableIndices = data.riddles.map((_, i) => i).filter(i => !data.solvedRiddles.has(i));
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const riddle = data.riddles[selectedIndex];

    data.currentRiddle = selectedIndex;
    data.riddlesOffered++;

    const intro = data.riddlesOffered === 1
      ? "Ah! A visitor! *perks up slightly* You know what, I DO remember one of my old riddles! Care to test your wits?"
      : "Back for another riddle, eh? Let me see if I can remember another one...";

    content = `
      <div style="margin-bottom: 1rem;">
        <p style="font-style: italic;">"${intro}"</p>
      </div>
      <div style="background: rgba(147, 112, 219, 0.1); border-left: 3px solid var(--accent); padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--accent);">${riddle.riddle}</p>
        <div id="riddle-options" style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${riddle.options.map((option, i) => `
            <button class="riddle-option" data-index="${i}" style="
              background: rgba(255,255,255,0.1);
              border: 2px solid var(--accent);
              padding: 0.75rem;
              border-radius: 0.5rem;
              color: white;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.2s;
              text-align: left;
            ">${option}</button>
          `).join('')}
        </div>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-light); font-style: italic;">💡 Hint: ${riddle.hint}</p>
      </div>
    `;

    // Show riddle content immediately
    document.getElementById('dialog-content').innerHTML = content;

    // Add click handlers for options
    setTimeout(() => {
      document.querySelectorAll('.riddle-option').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.background = 'rgba(147, 112, 219, 0.3)';
          btn.style.transform = 'translateX(5px)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'rgba(255,255,255,0.1)';
          btn.style.transform = 'translateX(0)';
        });
        btn.addEventListener('click', (e) => {
          const selectedIndex = parseInt(e.target.dataset.index);
          handleRiddleAnswer(troll, selectedIndex);
        });
      });
    }, 100);
  } else {
    // Show regular dialogue
    const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    content = `
      <div class="funny-quote" style="margin-top: 0; font-style: italic;">"${quote}"</div>
      <p style="text-align: center; color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">*${data.name} sighs and leans heavily on his walking stick*</p>
    `;

    const dialogContent = document.getElementById('dialog-content');
    dialogContent.innerHTML = content;
  }

  document.getElementById('dialog-overlay').classList.add('visible');
  document.getElementById('action-btn').classList.remove('visible');
}

function handleRiddleAnswer(troll, selectedIndex) {
  const data = troll.userData;
  const riddle = data.riddles[data.currentRiddle];
  const isCorrect = selectedIndex === riddle.correct;

  if (isCorrect) {
    // Mark riddle as solved
    data.solvedRiddles.add(data.currentRiddle);

    // Show success message
    const content = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
        <p style="font-size: 1.3rem; font-weight: 600; color: #90EE90; margin-bottom: 1rem;">Correct!</p>
        <p style="font-style: italic;">"${data.quotes[3]}"</p>
        <p style="color: var(--text-light); margin-top: 1rem;">
          ${data.solvedRiddles.size === data.riddles.length
            ? "You've solved all my riddles! I'm impressed... *wipes away a tear* You remind me of the old days..."
            : `You've solved ${data.solvedRiddles.size} of ${data.riddles.length} riddles!`}
        </p>
      </div>
    `;
    document.getElementById('dialog-content').innerHTML = content;
  } else {
    // Show failure message
    const content = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
        <p style="font-size: 1.3rem; font-weight: 600; color: #FF6B6B; margin-bottom: 1rem;">Not quite...</p>
        <p style="font-style: italic;">"Ah well, can't get them all. The answer was: <strong>${riddle.options[riddle.correct]}</strong>"</p>
        <p style="color: var(--text-light); margin-top: 1rem;">*${data.name} chuckles softly* "Don't worry, I forget the answers too sometimes..."</p>
      </div>
    `;
    document.getElementById('dialog-content').innerHTML = content;
  }

  data.currentRiddle = null;
}
export function openBuildingNPCDialog(npcId) {
  // Hide action button immediately
  document.getElementById('action-btn').classList.remove('visible');

  // Check if first visit (tracked separately from main locations)
  const visitKey = `building_${npcId}`;
  const isNewVisit = !ctx.gameState.visitedBuildings || !ctx.gameState.visitedBuildings.has(npcId);

  // Initialize visitedBuildings set if needed
  if (!ctx.gameState.visitedBuildings) {
    ctx.gameState.visitedBuildings = new Set();
  }

  if (isNewVisit) {
    ctx.gameState.visitedBuildings.add(npcId);
  }

  // Function to show the dialog UI
  const showDialogUI = () => {
    ctx.gameState.dialogOpen = true;

    // Play voice when dialog appears
    playRandomWandererVoice();
    playNpcGreeting();

    // Generate dialog based on visit status
    const dialog = generateBuildingDialog(npcId, isNewVisit);

    if (dialog) {
      document.getElementById('dialog-avatar').textContent = dialog.avatar;
      document.getElementById('dialog-name').textContent = dialog.name;
      document.getElementById('dialog-role').textContent = dialog.role;

      const dialogContent = document.getElementById('dialog-content');
      dialogContent.innerHTML = dialog.content;
    }

    document.getElementById('dialog-overlay').classList.add('visible');
  };

  // Zoom camera to building NPC, then show dialog when zoom completes
  zoomToNPC(npcId, showDialogUI);
}

export function closeDialog() {
  // Hide dialog overlay immediately for visual feedback
  document.getElementById('dialog-overlay').classList.remove('visible');

  // Zoom camera back out, then enable controls when animation completes
  zoomOut(() => {
    // Only enable controls after zoom-out animation finishes
    ctx.gameState.dialogOpen = false;

    // Show mission notification if this was a new visit
    if (ctx.gameState.pendingNotification) {
      const locationId = ctx.gameState.pendingNotification;
      showMissionNotification(locationId);
      ctx.gameState.pendingNotification = null;

      // Trigger Bernie listeners if we just talked to Princess Bernie (speakers)
      if (locationId === 'speakers' && !ctx.gameState.bernieListenersActive) {
        ctx.gameState.bernieListenersActive = true;
        // Set listeners to gathering state
        ctx.bernieListeners.forEach(listener => {
          listener.userData.state = 'gathering';
        });

        // After 8 seconds, they get hungry and leave for cake
        setTimeout(() => {
          ctx.gameState.bernieListenersLeaving = true;
          ctx.bernieListeners.forEach(listener => {
            listener.userData.state = 'leaving';
            // Show hungry message
            showListenerHungryMessage(listener);
          });
        }, 8000);
      }

      // Check if all missions complete - show completion after a delay
      if (ctx.gameState.visited.size === 5 && !ctx.gameState.completionShown) {
        setTimeout(() => {
          ctx.gameState.completionShown = true;
          document.getElementById('completion-modal').classList.add('visible');
        }, 1500);
      }
    }
  });
}

export function showListenerHungryMessage(listener) {
  // Only show if player is nearby
  if (!ctx.player) return;
  const distanceToPlayer = listener.position.distanceTo(ctx.player.position);
  if (distanceToPlayer > 12) return;

  const vec = listener.position.clone().project(ctx.camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const messages = [
    "Cake time!",
    "Snack break!",
    "*hungry*"
  ];

  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];
  msg.style.left = x + 'px';
  msg.style.top = (y - 80) + 'px';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

export function closeCompletion() {
  document.getElementById('completion-modal').classList.remove('visible');
}

export function handleCompletionContinue() {
  closeCompletion();
  if (!ctx.gameState.capeUnlocked) {
    ctx.unlockPlayerCape();
    showCapeRewardNotification();
  }
}

export function updateStars() {
  const locationIds = ['palace', 'teashop', 'speakers', 'guests', 'feast'];
  locationIds.forEach((id, index) => {
    if (ctx.gameState.visited.has(id)) {
      document.getElementById(`star-${index}`).classList.add('collected');
      document.querySelector(`.map-icon[data-location="${id}"]`).classList.add('visited');
    }
  });
}

export function showMissionNotification(locationId) {
  const loc = LOCATIONS.find(l => l.id === locationId);
  const name = loc ? loc.name : locationId;

  const notif = document.createElement('div');
  notif.className = 'mission-notif';
  notif.innerHTML = `<span class="mission-notif-icon">⭐</span>${name} completed!`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

export function showCapeRewardNotification() {
  const notif = document.createElement('div');
  notif.className = 'mission-notif';
  notif.innerHTML = '<span class="mission-notif-icon">🧣</span>You earned a tiny royal cape! ✨';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

export function showCollectPopup() {
  const messages = ['Yummy! 🍬', 'Sweet! 🍭', 'Royal! 👑', 'Shiny! ✨', 'Lovely! 💖', 'Fabulous! 💎'];
  const popup = document.createElement('div');
  popup.className = 'collect-popup';
  popup.textContent = messages[Math.floor(Math.random() * messages.length)];
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

export function showSweetIntro() {
  const sweetIntro = document.getElementById('sweet-intro');
  if (!sweetIntro) return;
  sweetIntro.classList.add('visible');
}

export function dismissSweetIntro() {
  const sweetIntro = document.getElementById('sweet-intro');
  if (!sweetIntro) return;
  sweetIntro.classList.remove('visible');
  ctx.gameState.timeScale = 1;
  ctx.gameState.dialogOpen = false;
}

export function showFloatingMessage(npc) {
  // Only show speech bubbles when player is nearby
  if (!ctx.player) return;
  const distanceToPlayer = npc.position.distanceTo(ctx.player.position);
  if (distanceToPlayer > 12) return; // Must be within 12 units of player

  const now = Date.now();
  // 20 second base cooldown + random 0-10 seconds to prevent frequent bubbles
  const cooldown = 20000 + (npc.userData.chatOffset || 0);
  if (now - npc.userData.lastQuote < cooldown) return;
  npc.userData.lastQuote = now;
  npc.userData.chatOffset = Math.random() * 10000; // Randomize next cooldown

  const vec = npc.position.clone().project(ctx.camera);
  if (vec.z > 1) return; // Behind camera

  // Only show if reasonably on screen
  if (vec.x < -0.8 || vec.x > 0.8 || vec.y < -0.8 || vec.y > 0.8) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  // Use NPC's own quotes
  const quotes = npc.userData.quotes || ["Nice day!", "*hums*", "..."];

  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  msg.style.left = x + 'px';
  msg.style.top = (y - 80) + 'px';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

// Settings Modal Functions
function setupSettingsModal() {
  // Get all settings elements
  const musicVolumeSlider = document.getElementById('music-volume-slider');
  const musicVolumeValue = document.getElementById('music-volume-value');
  const soundEffectsToggle = document.getElementById('sound-effects-toggle');
  const cameraSensitivitySlider = document.getElementById('camera-sensitivity-slider');
  const cameraSensitivityValue = document.getElementById('camera-sensitivity-value');
  const minimapToggle = document.getElementById('minimap-toggle');
  const joystickToggle = document.getElementById('joystick-toggle');
  const actionButtonToggle = document.getElementById('action-button-toggle');
  const resetBtn = document.getElementById('settings-reset');
  const closeBtn = document.getElementById('settings-close');

  // Initialize settings from saved values
  const settings = settingsManager.getAll();
  musicVolumeSlider.value = settings.musicVolume;
  musicVolumeValue.textContent = settings.musicVolume + '%';
  soundEffectsToggle.checked = settings.soundEffects;
  cameraSensitivitySlider.value = settings.cameraSensitivity;
  cameraSensitivityValue.textContent = settings.cameraSensitivity;
  minimapToggle.checked = settings.showMinimap;
  joystickToggle.checked = settings.showJoystick;
  actionButtonToggle.checked = settings.showActionButton;

  // Apply initial settings
  applySettings();

  // Music volume slider
  musicVolumeSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    musicVolumeValue.textContent = value + '%';
    settingsManager.set('musicVolume', value);
  });

  // Sound effects toggle
  soundEffectsToggle.addEventListener('change', (e) => {
    settingsManager.set('soundEffects', e.target.checked);
  });

  // Camera sensitivity slider
  cameraSensitivitySlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    cameraSensitivityValue.textContent = value;
    settingsManager.set('cameraSensitivity', value);
  });

  // Minimap toggle
  minimapToggle.addEventListener('change', (e) => {
    settingsManager.set('showMinimap', e.target.checked);
  });

  // Joystick toggle
  joystickToggle.addEventListener('change', (e) => {
    settingsManager.set('showJoystick', e.target.checked);
  });

  // Action button toggle
  actionButtonToggle.addEventListener('change', (e) => {
    settingsManager.set('showActionButton', e.target.checked);
  });

  // Reset button
  addClickHandler(resetBtn, () => {
    settingsManager.reset();
    // Update UI to reflect reset values
    const newSettings = settingsManager.getAll();
    musicVolumeSlider.value = newSettings.musicVolume;
    musicVolumeValue.textContent = newSettings.musicVolume + '%';
    soundEffectsToggle.checked = newSettings.soundEffects;
    cameraSensitivitySlider.value = newSettings.cameraSensitivity;
    cameraSensitivityValue.textContent = newSettings.cameraSensitivity;
    minimapToggle.checked = newSettings.showMinimap;
    joystickToggle.checked = newSettings.showJoystick;
    actionButtonToggle.checked = newSettings.showActionButton;
  }, { preventDefault: false });

  // Close button
  addCloseHandler(closeBtn, closeSettings);

  // Click outside to close
  const settingsModal = document.getElementById('settings-modal');
  addClickHandler(settingsModal, (e) => {
    if (e.target.id === 'settings-modal') {
      closeSettings();
    }
  }, { preventDefault: false });

  // Listen to settings changes and apply them
  settingsManager.onChange((key, value) => {
    applySettings();
  });
}

function openSettings() {
  document.getElementById('settings-modal').classList.add('visible');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('visible');
}

function applySettings() {
  const settings = settingsManager.getAll();

  // Apply music volume
  if (musicAudio) {
    musicAudio.volume = settings.musicVolume / 100;
  }

  // Apply minimap visibility
  const minimap = document.getElementById('minimap');
  if (minimap) {
    minimap.style.display = settings.showMinimap ? 'flex' : 'none';
  }

  // Apply joystick visibility
  const joystick = document.getElementById('joystick-container');
  if (joystick) {
    joystick.style.display = settings.showJoystick ? 'block' : 'none';
  }

  // Apply action button visibility
  const actionBtn = document.getElementById('action-btn');
  if (actionBtn) {
    // Only hide if setting is off AND it doesn't have the 'visible' class
    if (!settings.showActionButton) {
      actionBtn.style.opacity = '0';
      actionBtn.style.pointerEvents = 'none';
    } else {
      actionBtn.style.opacity = '';
      actionBtn.style.pointerEvents = '';
    }
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.log('Error attempting to enable fullscreen:', err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
