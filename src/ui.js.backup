// DOM-only utilities for the Royal Court Tea experience.

function updateMusicUI() {
  const trackLabel = document.getElementById('music-track');
  const toggleBtn = document.getElementById('music-toggle');
  const track = MUSIC_TRACKS[musicState.currentIndex];
  if (trackLabel) {
    trackLabel.textContent = track ? track.title : 'Ready to play';
  }
  if (toggleBtn) {
    toggleBtn.textContent = musicAudio.muted ? '🔇 Muted' : '🔈 Sound On';
  }
}

function setCollectibleTotal(total) {
  const totalLabel = document.getElementById('collectible-total');
  if (totalLabel) {
    totalLabel.textContent = total;
  }
}

function updateCollectibleCount(count) {
  const countLabel = document.getElementById('collectible-count');
  if (countLabel) {
    countLabel.textContent = count;
  }
}

function updateActionButton(nearestNPC, nearestWanderer) {
  const actionBtn = document.getElementById('action-btn');
  if (!actionBtn) return;
  if (nearestNPC || nearestWanderer) {
    actionBtn.classList.add('visible');
    if (nearestNPC) {
      const icon = gameState.visited.has(nearestNPC) ? '💬' : '❓';
      actionBtn.innerHTML = `<span>${icon}</span><span>Tap to Chat</span>`;
    } else {
      actionBtn.innerHTML = `<span>🤪</span><span>Say Hi!</span>`;
    }
  } else {
    actionBtn.classList.remove('visible');
  }
}

function updateLocationDisplay(locationId, icon, name) {
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

function startAdventure() {
  document.getElementById('intro-modal').classList.remove('visible');
  gameState.dialogOpen = false;
  gameState.started = true;
  if (!musicState.initialized) {
    musicState.initialized = true;
    playCurrentTrack();
  }
}

function setDesktopMode(enabled) {
  desktopModeEnabled = enabled;
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

function setupControls() {
  const container = document.getElementById('joystick-container');
  const thumb = document.getElementById('joystick-thumb');
  const baseRadius = 55;
  const maxDistance = 32;
  let active = false;
  let centerX = 0;
  let centerY = 0;
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
    if (gameState.dialogOpen || !gameState.started) return;
    e.preventDefault();
    active = true;
    const rect = container.getBoundingClientRect();
    centerX = rect.left + baseRadius;
    centerY = rect.top + baseRadius;
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
        if (!e.repeat && !gameState.dialogOpen && gameState.started && (gameState.nearNPC || gameState.nearWanderer)) {
          handleAction();
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

  // Action button
  const actionBtn = document.getElementById('action-btn');
  actionBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    handleAction();
  });
  actionBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handleAction();
    }
  });

  // Dialog close
  document.getElementById('dialog-close').addEventListener('click', closeDialog);
  document.getElementById('dialog-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'dialog-overlay') closeDialog();
  });

  // Completion modal
  document.getElementById('completion-close').addEventListener('click', closeCompletion);
  document.getElementById('continue-btn').addEventListener('click', handleCompletionContinue);

  // Music controls
  document.getElementById('music-toggle').addEventListener('click', () => {
    toggleMusicMute();
    if (!musicState.initialized) {
      musicState.initialized = true;
      playCurrentTrack();
    }
  });
  document.getElementById('music-next').addEventListener('click', () => {
    musicState.initialized = true;
    playNextTrack();
  });

  document.getElementById('intro-start').addEventListener('click', () => {
    startAdventure();
  });

  document.getElementById('intro-modal').addEventListener('click', (e) => {
    if (e.target.id === 'intro-modal') {
      startAdventure();
    }
  });

  document.getElementById('sweet-dismiss').addEventListener('click', dismissSweetIntro);
}

function setupSplashInteractions() {
  const splashScreen = document.getElementById('splash-screen');
  const splashMap = document.getElementById('splash-map');
  const mapOverlay = document.getElementById('map-overlay');
  const startBtn = document.getElementById('start-btn');

  if (!splashScreen || !splashMap || !mapOverlay || !startBtn) return;

  let startTriggered = false;
  let lastPointerStart = 0;
  const triggerStart = () => {
    if (startTriggered) return;
    startTriggered = true;
    splashScreen.classList.add('hidden');
    mapOverlay.classList.remove('visible');
    splashMap.classList.remove('zoomed');
    document.getElementById('loading-screen').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
      document.getElementById('intro-modal').classList.add('visible');
      gameState.dialogOpen = true;
    }, 2000);
  };

  startBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    lastPointerStart = performance.now();
    triggerStart();
  });
  startBtn.addEventListener('click', () => {
    if (performance.now() - lastPointerStart < 500) return;
    triggerStart();
  });
  startBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      triggerStart();
    }
  });

  const toggleMapZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (splashMap.classList.contains('zoomed')) {
      splashMap.classList.remove('zoomed');
      mapOverlay.classList.remove('visible');
    } else {
      splashMap.classList.add('zoomed');
      mapOverlay.classList.add('visible');
    }
  };

  splashMap.addEventListener('pointerdown', toggleMapZoom);
  mapOverlay.addEventListener('pointerdown', () => {
    splashMap.classList.remove('zoomed');
    mapOverlay.classList.remove('visible');
  });
}

function openDialog(locationId) {
  const dialog = DIALOGS[locationId];
  if (!dialog) return;

  // 🎵 PLAY VOICE!
  playVoice(locationId);

  gameState.dialogOpen = true;

  // Check if first visit
  const isNewVisit = !gameState.visited.has(locationId);
  if (isNewVisit) {
    gameState.visited.add(locationId);
    updateStars();
  }

  // Update dialog UI
  document.getElementById('dialog-avatar').textContent = dialog.avatar;
  document.getElementById('dialog-name').textContent = dialog.name;
  document.getElementById('dialog-role').textContent = dialog.role;
  document.getElementById('dialog-content').innerHTML = dialog.content;
  document.getElementById('dialog-overlay').classList.add('visible');
  document.getElementById('action-btn').classList.remove('visible');

  // Store for notification on close
  if (isNewVisit) {
    gameState.pendingNotification = locationId;
  }
}

function openWandererDialog(npc) {
  const data = npc.userData;
  const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];

  // 🎵 PLAY RANDOM VOICE!
  playRandomWandererVoice();

  gameState.dialogOpen = true;

  document.getElementById('dialog-avatar').textContent = '🤪';
  document.getElementById('dialog-name').textContent = data.name;
  document.getElementById('dialog-role').textContent = data.role;
  document.getElementById('dialog-content').innerHTML = `
    <div class="funny-quote" style="margin-top: 0;">${quote}</div>
    <p style="text-align: center; color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">*${data.name} wanders off humming*</p>
  `;
  document.getElementById('dialog-overlay').classList.add('visible');
  document.getElementById('action-btn').classList.remove('visible');
}

function closeDialog() {
  gameState.dialogOpen = false;
  document.getElementById('dialog-overlay').classList.remove('visible');

  // Show mission notification if this was a new visit
  if (gameState.pendingNotification) {
    const locationId = gameState.pendingNotification;
    showMissionNotification(locationId);
    gameState.pendingNotification = null;

    // Trigger Bernie listeners if we just talked to Princess Bernie (speakers)
    if (locationId === 'speakers' && !gameState.bernieListenersActive) {
      gameState.bernieListenersActive = true;
      // Set listeners to gathering state
      bernieListeners.forEach(listener => {
        listener.userData.state = 'gathering';
      });

      // After 8 seconds, they get hungry and leave for cake
      setTimeout(() => {
        gameState.bernieListenersLeaving = true;
        bernieListeners.forEach(listener => {
          listener.userData.state = 'leaving';
          // Show hungry message
          showListenerHungryMessage(listener);
        });
      }, 8000);
    }

    // Check if all missions complete - show completion after a delay
    if (gameState.visited.size === 5 && !gameState.completionShown) {
      setTimeout(() => {
        gameState.completionShown = true;
        document.getElementById('completion-modal').classList.add('visible');
      }, 1500);
    }
  }
}

function showListenerHungryMessage(listener) {
  const vec = listener.position.clone().project(camera);
  if (vec.z > 1) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  const messages = [
    "I smell CAKE! 🍰",
    "Did someone say dessert?",
    "My tummy is rumbling!",
    "Time for snacks!",
    "Cake break! 🧁"
  ];

  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];
  msg.style.left = x + 'px';
  msg.style.top = (y - 80) + 'px';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);

  // 🎵 Occasionally play voice (15% chance)
  if (Math.random() < 0.15) {
    const now = Date.now();
    if (now - (listener.userData.lastVoice || 0) > WANDERER_VOICE_COOLDOWN) {
      listener.userData.lastVoice = now;
      playRandomWandererVoice();
    }
  }
}

function closeCompletion() {
  document.getElementById('completion-modal').classList.remove('visible');
}

function handleCompletionContinue() {
  closeCompletion();
  if (!gameState.capeUnlocked) {
    unlockPlayerCape();
    showCapeRewardNotification();
  }
}

function updateStars() {
  const locationIds = ['palace', 'teashop', 'speakers', 'guests', 'feast'];
  locationIds.forEach((id, index) => {
    if (gameState.visited.has(id)) {
      document.getElementById(`star-${index}`).classList.add('collected');
      document.querySelector(`.map-icon[data-location="${id}"]`).classList.add('visited');
    }
  });
}

function showMissionNotification(locationId) {
  const loc = LOCATIONS.find(l => l.id === locationId);
  const name = loc ? loc.name : locationId;

  const notif = document.createElement('div');
  notif.className = 'mission-notif';
  notif.innerHTML = `<span class="mission-notif-icon">⭐</span>${name} completed!`;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

function showCapeRewardNotification() {
  const notif = document.createElement('div');
  notif.className = 'mission-notif';
  notif.innerHTML = '<span class="mission-notif-icon">🧣</span>You earned a tiny royal cape! ✨';
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

function showCollectPopup() {
  const messages = ['Yummy! 🍬', 'Sweet! 🍭', 'Royal! 👑', 'Shiny! ✨', 'Lovely! 💖', 'Fabulous! 💎'];
  const popup = document.createElement('div');
  popup.className = 'collect-popup';
  popup.textContent = messages[Math.floor(Math.random() * messages.length)];
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

function showSweetIntro() {
  const sweetIntro = document.getElementById('sweet-intro');
  if (!sweetIntro) return;
  sweetIntro.classList.add('visible');
}

function dismissSweetIntro() {
  const sweetIntro = document.getElementById('sweet-intro');
  if (!sweetIntro) return;
  sweetIntro.classList.remove('visible');
  gameState.timeScale = 1;
  gameState.dialogOpen = false;
}

function showFloatingMessage(npc) {
  const now = Date.now();
  // 7 second base cooldown + random 0-4 seconds to prevent all talking at once
  const cooldown = 7000 + (npc.userData.chatOffset || 0);
  if (now - npc.userData.lastQuote < cooldown) return;
  npc.userData.lastQuote = now;
  npc.userData.chatOffset = Math.random() * 4000; // Randomize next cooldown

  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return; // Behind camera

  // Only show if reasonably on screen
  if (vec.x < -0.8 || vec.x > 0.8 || vec.y < -0.8 || vec.y > 0.8) return;

  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

  // Use NPC's own quotes
  const quotes = npc.userData.quotes || ["La la la~ 🎵", "Nice day!", "*hums*"];

  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  msg.style.left = x + 'px';
  msg.style.top = (y - 80) + 'px';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
