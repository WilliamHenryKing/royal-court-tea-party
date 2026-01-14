// Boxing Minigame - First-Person Royal Rumble Combat
// ===================================================
// A first-person fighting mini-game where the player challenges
// Sir Clumsy and Lord Fumbles in the boxing ring

import * as THREE from 'three';
import { camera, scene } from '../engine/renderer.js';
import { player, disablePlayerMovement, enablePlayerMovement } from '../entities/player.js';
import { boxingFighters, BOXING_RING_DATA, BOXING_RING_BOUNDS } from '../entities/activities.js';

// Minigame configuration
const BOXING_CONFIG = {
  playerMaxHealth: 100,
  playerMaxStamina: 100,
  knightMaxHealth: 100,

  // Combat timing
  attackCooldown: 0.4,        // Seconds between player attacks
  blockStaminaDrain: 15,      // Stamina drain per second while blocking
  staminaRegen: 20,           // Stamina regen per second (when not blocking)

  // Damage values
  playerAttackDamage: 15,
  knightAttackDamage: 12,
  blockedDamageMultiplier: 0.3,

  // Knight AI timing
  knightAttackInterval: [1.5, 3.0],  // Random interval between knight attacks
  knightTelegraphTime: 0.6,          // How long knights wind up before attack

  // Camera settings for first-person view
  firstPersonHeight: 1.7,
  firstPersonFOV: 75
};

// Duke Dramatic's commentary during combat
const COMBAT_COMMENTARY = {
  intro: [
    "LADIES AND GENTLEMEN! A challenger approaches!",
    "The crowd holds its breath! Well, the imaginary crowd!",
    "This bout shall be LEGENDARY! Or at least mildly entertaining!",
    "Tonight we witness GLORY! Or glorious failure!"
  ],
  playerHit: [
    "WHAT A HIT! Sir Clumsy actually felt that one!",
    "DEVASTATING! Lord Fumbles is fumbling more than usual!",
    "The challenger shows no mercy!",
    "BAM! Right in the honor!",
    "That's gonna leave a mark on his dignity!"
  ],
  playerMiss: [
    "A swing and a miss! The air is terrified though!",
    "Close! If by close you mean not even remotely!",
    "The challenger practices their air-fighting technique!"
  ],
  knightHit: [
    "OOF! The challenger takes a hit!",
    "Sir Clumsy lands one! By accident, surely!",
    "Lord Fumbles CONNECTS! A broken clock and all that!",
    "The champion feels the sting of... moderate competence!"
  ],
  knightMiss: [
    "Sir Clumsy MISSES! Water is wet! Sky is blue!",
    "Lord Fumbles swings at nothing! As is tradition!",
    "The knight attacks the air with GREAT vengeance!",
    "A miss so spectacular it deserves its own trophy!"
  ],
  playerBlocking: [
    "The challenger BLOCKS! A defensive genius!",
    "Shield up! Safety first, glory second!",
    "Blocking like a TRUE coward-- I mean, strategist!"
  ],
  victory: [
    "KNOCKOUT! THE CHALLENGER IS VICTORIOUS!",
    "INCREDIBLE! Both knights lie defeated! Mostly from embarrassment!",
    "GLORY! TRIUMPH! CELEBRATION! ...and mild confusion from the knights!",
    "THE WINNER! Though 'winner' against these two is a low bar!"
  ],
  defeat: [
    "DOWN GOES THE CHALLENGER! ...to a knight who can barely hold a sword!",
    "DEFEAT! But don't feel bad, it happens to... actually no, this is embarrassing.",
    "The champion falls! Sir Clumsy is as surprised as anyone!",
    "KNOCKED OUT! By THESE two?! History shall not record this kindly!"
  ],
  combo: [
    "COMBO! The challenger is ON FIRE!",
    "DOUBLE HIT! TRIPLE HIT! The knights can't keep up!",
    "A FLURRY of blows! The knights are seeing stars!"
  ]
};

// Minigame state
let minigameState = {
  active: false,
  phase: 'idle',  // idle, intro, fighting, victory, defeat
  introTimer: 0,
  outroTimer: 0,

  // Player combat state
  playerHealth: BOXING_CONFIG.playerMaxHealth,
  playerStamina: BOXING_CONFIG.playerMaxStamina,
  isBlocking: false,
  attackCooldown: 0,
  comboCount: 0,
  lastHitTime: 0,

  // Knights state
  knights: [
    { health: BOXING_CONFIG.knightMaxHealth, attackTimer: 2, isAttacking: false, telegraphTime: 0, mesh: null },
    { health: BOXING_CONFIG.knightMaxHealth, attackTimer: 3, isAttacking: false, telegraphTime: 0, mesh: null }
  ],
  currentTarget: 0,  // Which knight player is facing

  // Camera state
  originalCameraPos: null,
  originalCameraFOV: null,
  targetLookAt: new THREE.Vector3(),
  cameraShake: 0,

  // Stats
  totalKnockouts: 0,
  totalDefeats: 0,

  // Input state
  mouseDown: false,
  spaceDown: false
};

// Store original player position for return
let originalPlayerPos = null;
let originalPlayerRot = null;

// UI elements references (will be set by uiManager)
let boxingUI = null;

/**
 * Initialize the boxing minigame system
 */
export function initBoxingMinigame() {
  // Set up input listeners
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  console.log('[BoxingMinigame] Initialized');
}

/**
 * Check if player is near the boxing ring entrance
 */
export function isNearBoxingRing(playerPos) {
  if (!playerPos) return false;

  const entryX = BOXING_RING_BOUNDS.entryPoint.x;
  const entryZ = BOXING_RING_BOUNDS.entryPoint.z;
  const distance = Math.sqrt(
    Math.pow(playerPos.x - entryX, 2) +
    Math.pow(playerPos.z - entryZ, 2)
  );

  return distance < 3 && !minigameState.active;
}

/**
 * Start the boxing minigame
 */
export function startBoxingMinigame(gameState) {
  if (minigameState.active) return;

  console.log('[BoxingMinigame] Starting...');

  // Store original positions
  originalPlayerPos = player.position.clone();
  originalPlayerRot = player.rotation.y;

  // Store camera state
  minigameState.originalCameraPos = camera.position.clone();
  minigameState.originalCameraFOV = camera.fov;

  // Disable normal player movement
  disablePlayerMovement();

  // Reset minigame state
  minigameState.active = true;
  minigameState.phase = 'intro';
  minigameState.introTimer = 3;  // 3 seconds of intro
  minigameState.playerHealth = BOXING_CONFIG.playerMaxHealth;
  minigameState.playerStamina = BOXING_CONFIG.playerMaxStamina;
  minigameState.isBlocking = false;
  minigameState.attackCooldown = 0;
  minigameState.comboCount = 0;
  minigameState.currentTarget = 0;
  minigameState.cameraShake = 0;

  // Reset knights
  minigameState.knights.forEach((k, i) => {
    k.health = BOXING_CONFIG.knightMaxHealth;
    k.attackTimer = 2 + Math.random() * 2;
    k.isAttacking = false;
    k.telegraphTime = 0;
    // Get reference to actual knight mesh
    if (boxingFighters && boxingFighters[i] && boxingFighters[i].userData.isFighter) {
      k.mesh = boxingFighters[i];
    }
  });

  // Teleport player into ring center
  player.position.set(BOXING_RING_BOUNDS.centerX, BOXING_RING_BOUNDS.platformY + 0.1, BOXING_RING_BOUNDS.centerZ + 2);
  player.visible = false;  // Hide player model in first-person

  // Update game state
  if (gameState) {
    gameState.boxingMinigame.active = true;
    gameState.boxingMinigame.phase = 'intro';
  }

  // Show intro commentary
  showCommentary('intro');

  // Show boxing UI
  showBoxingUI();
}

/**
 * End the boxing minigame
 */
export function endBoxingMinigame(gameState, forceEnd = false) {
  if (!minigameState.active && !forceEnd) return;

  console.log('[BoxingMinigame] Ending...');

  minigameState.active = false;
  minigameState.phase = 'idle';

  // Restore player
  if (originalPlayerPos) {
    player.position.copy(originalPlayerPos);
    player.rotation.y = originalPlayerRot;
  }
  player.visible = true;

  // Restore camera
  if (minigameState.originalCameraFOV) {
    camera.fov = minigameState.originalCameraFOV;
    camera.updateProjectionMatrix();
  }

  // Re-enable player movement
  enablePlayerMovement();

  // Update game state
  if (gameState) {
    gameState.boxingMinigame.active = false;
    gameState.boxingMinigame.phase = 'idle';
  }

  // Hide boxing UI
  hideBoxingUI();

  // Reset knights to their normal fighting behavior
  minigameState.knights.forEach(k => {
    if (k.mesh) {
      k.mesh.userData.fightState = 'ready';
      k.mesh.userData.attackTimer = 2 + Math.random() * 3;
    }
  });
}

/**
 * Update the boxing minigame - called from game loop
 */
export function updateBoxingMinigame(time, delta, gameState) {
  if (!minigameState.active) return;

  switch (minigameState.phase) {
    case 'intro':
      updateIntroPhase(delta);
      break;
    case 'fighting':
      updateFightingPhase(time, delta, gameState);
      break;
    case 'victory':
    case 'defeat':
      updateOutroPhase(delta, gameState);
      break;
  }

  // Always update camera
  updateFirstPersonCamera(delta);

  // Update UI
  updateBoxingUIValues();
}

/**
 * Update intro phase - Duke Dramatic announces the fight
 */
function updateIntroPhase(delta) {
  minigameState.introTimer -= delta;

  // Position knights to face player
  minigameState.knights.forEach((k, i) => {
    if (k.mesh) {
      const targetX = BOXING_RING_BOUNDS.centerX + (i === 0 ? -2 : 2);
      k.mesh.position.x = THREE.MathUtils.lerp(k.mesh.position.x, targetX, delta * 2);
      k.mesh.position.y = BOXING_RING_BOUNDS.platformY + 0.5;
      k.mesh.position.z = BOXING_RING_BOUNDS.centerZ;

      // Face the player
      const toPlayer = new THREE.Vector3()
        .subVectors(player.position, k.mesh.position)
        .normalize();
      k.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
    }
  });

  if (minigameState.introTimer <= 0) {
    minigameState.phase = 'fighting';
    showCommentary('intro');  // One more dramatic line
  }
}

/**
 * Update the main fighting phase
 */
function updateFightingPhase(time, delta, gameState) {
  // Update player attack cooldown
  if (minigameState.attackCooldown > 0) {
    minigameState.attackCooldown -= delta;
  }

  // Handle blocking stamina drain
  if (minigameState.isBlocking && minigameState.spaceDown) {
    minigameState.playerStamina -= BOXING_CONFIG.blockStaminaDrain * delta;
    if (minigameState.playerStamina <= 0) {
      minigameState.playerStamina = 0;
      minigameState.isBlocking = false;
    }
  } else {
    // Regenerate stamina when not blocking
    minigameState.playerStamina = Math.min(
      BOXING_CONFIG.playerMaxStamina,
      minigameState.playerStamina + BOXING_CONFIG.staminaRegen * delta
    );
  }

  // Update knights AI
  updateKnightsAI(time, delta);

  // Check for victory/defeat
  const allKnightsDown = minigameState.knights.every(k => k.health <= 0);
  if (allKnightsDown) {
    minigameState.phase = 'victory';
    minigameState.outroTimer = 4;
    minigameState.totalKnockouts++;
    showCommentary('victory');
    if (gameState) {
      gameState.boxingMinigame.knockoutCount++;
    }
  }

  if (minigameState.playerHealth <= 0) {
    minigameState.phase = 'defeat';
    minigameState.outroTimer = 4;
    minigameState.totalDefeats++;
    showCommentary('defeat');
    if (gameState) {
      gameState.boxingMinigame.defeatCount++;
    }
  }

  // Decay combo
  if (time - minigameState.lastHitTime > 2) {
    minigameState.comboCount = 0;
  }

  // Update camera shake
  if (minigameState.cameraShake > 0) {
    minigameState.cameraShake -= delta * 5;
  }
}

/**
 * Update knights AI - they attack the player
 */
function updateKnightsAI(time, delta) {
  minigameState.knights.forEach((knight, i) => {
    if (knight.health <= 0) {
      // Knight is knocked out - make them fall
      if (knight.mesh) {
        knight.mesh.rotation.z = THREE.MathUtils.lerp(knight.mesh.rotation.z, Math.PI / 2, delta * 2);
        knight.mesh.position.y = Math.max(0.2, knight.mesh.position.y - delta);
      }
      return;
    }

    // Animate knight bobbing
    if (knight.mesh && !knight.isAttacking) {
      knight.mesh.position.y = BOXING_RING_BOUNDS.platformY + 0.5 + Math.sin(time * 3 + i) * 0.05;
      // Weapon wobble
      if (knight.mesh.userData.sword) {
        knight.mesh.userData.sword.rotation.z = Math.PI / 4 + Math.sin(time * 2 + i) * 0.2;
      }
    }

    if (knight.isAttacking) {
      // Wind-up telegraph
      knight.telegraphTime += delta;

      if (knight.mesh && knight.telegraphTime < BOXING_CONFIG.knightTelegraphTime) {
        // Wind up animation - raise sword
        if (knight.mesh.userData.sword) {
          knight.mesh.userData.sword.rotation.z = Math.PI / 4 + knight.telegraphTime * 2;
        }
        knight.mesh.rotation.x = -knight.telegraphTime * 0.3;
      } else if (knight.telegraphTime >= BOXING_CONFIG.knightTelegraphTime) {
        // Attack!
        executeKnightAttack(knight, i);
        knight.isAttacking = false;
        knight.telegraphTime = 0;
        knight.attackTimer = BOXING_CONFIG.knightAttackInterval[0] +
          Math.random() * (BOXING_CONFIG.knightAttackInterval[1] - BOXING_CONFIG.knightAttackInterval[0]);

        // Reset mesh
        if (knight.mesh) {
          knight.mesh.rotation.x = 0;
          if (knight.mesh.userData.sword) {
            knight.mesh.userData.sword.rotation.z = Math.PI / 4;
          }
        }
      }
    } else {
      // Countdown to next attack
      knight.attackTimer -= delta;
      if (knight.attackTimer <= 0) {
        knight.isAttacking = true;
        knight.telegraphTime = 0;
      }
    }
  });
}

/**
 * Execute a knight's attack on the player
 */
function executeKnightAttack(knight, knightIndex) {
  // Random chance to miss (these are VERY incompetent knights)
  const missChance = 0.4;  // 40% chance to miss completely

  if (Math.random() < missChance) {
    showCommentary('knightMiss');
    return;
  }

  // Calculate damage
  let damage = BOXING_CONFIG.knightAttackDamage;

  if (minigameState.isBlocking && minigameState.playerStamina > 0) {
    damage *= BOXING_CONFIG.blockedDamageMultiplier;
    showCommentary('playerBlocking');
    minigameState.playerStamina -= 10;  // Extra stamina cost for blocking a hit
  } else {
    showCommentary('knightHit');
  }

  minigameState.playerHealth -= damage;
  minigameState.cameraShake = 0.5;  // Screen shake on hit

  // Reset combo on getting hit
  minigameState.comboCount = 0;
}

/**
 * Update outro phase (victory/defeat)
 */
function updateOutroPhase(delta, gameState) {
  minigameState.outroTimer -= delta;

  if (minigameState.outroTimer <= 0) {
    endBoxingMinigame(gameState);
  }
}

/**
 * Update first-person camera
 */
function updateFirstPersonCamera(delta) {
  // Target position: player's position at eye level
  const targetPos = new THREE.Vector3(
    player.position.x,
    player.position.y + BOXING_CONFIG.firstPersonHeight,
    player.position.z
  );

  // Add camera shake
  if (minigameState.cameraShake > 0) {
    targetPos.x += (Math.random() - 0.5) * minigameState.cameraShake * 0.3;
    targetPos.y += (Math.random() - 0.5) * minigameState.cameraShake * 0.3;
  }

  // Smooth camera movement
  camera.position.lerp(targetPos, delta * 10);

  // Look at current target knight
  const targetKnight = minigameState.knights[minigameState.currentTarget];
  if (targetKnight && targetKnight.mesh) {
    minigameState.targetLookAt.set(
      targetKnight.mesh.position.x,
      targetKnight.mesh.position.y + 1,
      targetKnight.mesh.position.z
    );
  } else {
    // Look at ring center if no knight
    minigameState.targetLookAt.set(
      BOXING_RING_BOUNDS.centerX,
      1.5,
      BOXING_RING_BOUNDS.centerZ
    );
  }

  camera.lookAt(minigameState.targetLookAt);

  // Adjust FOV for first-person
  if (camera.fov !== BOXING_CONFIG.firstPersonFOV) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, BOXING_CONFIG.firstPersonFOV, delta * 3);
    camera.updateProjectionMatrix();
  }
}

/**
 * Player attack action
 */
function playerAttack() {
  if (!minigameState.active || minigameState.phase !== 'fighting') return;
  if (minigameState.attackCooldown > 0) return;
  if (minigameState.isBlocking) return;

  minigameState.attackCooldown = BOXING_CONFIG.attackCooldown;

  // Get target knight
  const targetKnight = minigameState.knights[minigameState.currentTarget];

  // Check if knight is already knocked out
  if (targetKnight.health <= 0) {
    // Switch to other knight if alive
    const otherIndex = minigameState.currentTarget === 0 ? 1 : 0;
    if (minigameState.knights[otherIndex].health > 0) {
      minigameState.currentTarget = otherIndex;
      return;  // Don't attack this frame, just switch
    }
    return;  // Both down
  }

  // Small miss chance for player too (but much lower)
  if (Math.random() < 0.1) {
    showCommentary('playerMiss');
    minigameState.comboCount = 0;
    return;
  }

  // Hit!
  const damage = BOXING_CONFIG.playerAttackDamage;
  targetKnight.health -= damage;
  minigameState.lastHitTime = performance.now() / 1000;
  minigameState.comboCount++;

  // Visual feedback on knight mesh
  if (targetKnight.mesh) {
    // Flash red briefly
    targetKnight.mesh.traverse(child => {
      if (child.isMesh && child.material) {
        const origColor = child.material.color.getHex();
        child.material.color.setHex(0xff0000);
        setTimeout(() => child.material.color.setHex(origColor), 100);
      }
    });

    // Knockback
    const knockbackDir = minigameState.currentTarget === 0 ? -1 : 1;
    targetKnight.mesh.position.x += knockbackDir * 0.2;
  }

  // Commentary
  if (minigameState.comboCount >= 3) {
    showCommentary('combo');
  } else {
    showCommentary('playerHit');
  }

  // If knight knocked out, auto-switch to other
  if (targetKnight.health <= 0) {
    const otherIndex = minigameState.currentTarget === 0 ? 1 : 0;
    if (minigameState.knights[otherIndex].health > 0) {
      setTimeout(() => {
        minigameState.currentTarget = otherIndex;
      }, 500);
    }
  }
}

/**
 * Switch target to other knight
 */
export function switchTarget() {
  if (!minigameState.active || minigameState.phase !== 'fighting') return;

  const otherIndex = minigameState.currentTarget === 0 ? 1 : 0;
  if (minigameState.knights[otherIndex].health > 0) {
    minigameState.currentTarget = otherIndex;
  }
}

/**
 * Show commentary message from Duke Dramatic
 */
function showCommentary(type) {
  const quotes = COMBAT_COMMENTARY[type];
  if (!quotes || quotes.length === 0) return;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Create floating message
  const msg = document.createElement('div');
  msg.className = 'boxing-commentary';
  msg.innerHTML = `<span class="duke-name">Duke Dramatic:</span> "${quote}"`;
  msg.style.cssText = `
    position: fixed;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 3px solid #ffd700;
    border-radius: 10px;
    padding: 15px 25px;
    color: #fff;
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    text-align: center;
    z-index: 1000;
    max-width: 80%;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    animation: commentaryPop 0.3s ease-out;
  `;

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.animation = 'commentaryFade 0.5s ease-out forwards';
    setTimeout(() => msg.remove(), 500);
  }, 2000);
}

/**
 * Show the boxing UI overlay
 */
function showBoxingUI() {
  // Remove existing UI if any
  hideBoxingUI();

  boxingUI = document.createElement('div');
  boxingUI.id = 'boxing-ui';
  boxingUI.innerHTML = `
    <style>
      @keyframes commentaryPop {
        from { transform: translateX(-50%) scale(0.8); opacity: 0; }
        to { transform: translateX(-50%) scale(1); opacity: 1; }
      }
      @keyframes commentaryFade {
        to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
      }
      @keyframes healthPulse {
        0%, 100% { transform: scaleX(1); }
        50% { transform: scaleX(1.02); }
      }
      .boxing-bar {
        height: 20px;
        border-radius: 10px;
        transition: width 0.3s ease;
      }
      .knight-indicator.active {
        border-color: #ffd700 !important;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
      }
      .knight-indicator.knocked-out {
        opacity: 0.5;
      }
      .knight-indicator.knocked-out::after {
        content: 'K.O.';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ff0000;
        font-weight: bold;
        font-size: 1.2rem;
      }
    </style>

    <!-- Player Health & Stamina -->
    <div style="position: fixed; top: 20px; left: 20px; z-index: 999;">
      <div style="color: #ffd700; font-family: Georgia, serif; margin-bottom: 5px; font-size: 0.9rem;">
        YOUR HONOR
      </div>
      <div style="width: 200px; height: 24px; background: #333; border-radius: 12px; border: 2px solid #ffd700; overflow: hidden;">
        <div id="player-health-bar" class="boxing-bar" style="width: 100%; background: linear-gradient(90deg, #ff4444, #ff6b6b); height: 100%;"></div>
      </div>
      <div style="color: #4ecdc4; font-family: Georgia, serif; margin: 8px 0 5px 0; font-size: 0.8rem;">
        STAMINA
      </div>
      <div style="width: 150px; height: 16px; background: #333; border-radius: 8px; border: 2px solid #4ecdc4; overflow: hidden;">
        <div id="player-stamina-bar" class="boxing-bar" style="width: 100%; background: linear-gradient(90deg, #4ecdc4, #45b7aa); height: 100%;"></div>
      </div>
    </div>

    <!-- Knights Health -->
    <div style="position: fixed; top: 20px; right: 20px; z-index: 999; text-align: right;">
      <div id="knight1-indicator" class="knight-indicator" style="position: relative; display: inline-block; margin-bottom: 15px; padding: 10px; border: 2px solid #ff6b6b; border-radius: 8px; background: rgba(0,0,0,0.7);">
        <div style="color: #ff6b6b; font-family: Georgia, serif; margin-bottom: 5px; font-size: 0.8rem;">
          SIR CLUMSY
        </div>
        <div style="width: 150px; height: 16px; background: #333; border-radius: 8px; overflow: hidden;">
          <div id="knight1-health-bar" class="boxing-bar" style="width: 100%; background: #ff6b6b; height: 100%;"></div>
        </div>
      </div>
      <br>
      <div id="knight2-indicator" class="knight-indicator" style="position: relative; display: inline-block; padding: 10px; border: 2px solid #6b9eff; border-radius: 8px; background: rgba(0,0,0,0.7);">
        <div style="color: #6b9eff; font-family: Georgia, serif; margin-bottom: 5px; font-size: 0.8rem;">
          LORD FUMBLES
        </div>
        <div style="width: 150px; height: 16px; background: #333; border-radius: 8px; overflow: hidden;">
          <div id="knight2-health-bar" class="boxing-bar" style="width: 100%; background: #6b9eff; height: 100%;"></div>
        </div>
      </div>
    </div>

    <!-- Controls hint -->
    <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 999; text-align: center; color: #fff; font-family: Georgia, serif; background: rgba(0,0,0,0.7); padding: 10px 20px; border-radius: 8px; border: 1px solid #ffd700;">
      <span style="color: #ffd700;">CLICK</span> to Attack &nbsp;|&nbsp;
      <span style="color: #4ecdc4;">HOLD SPACE</span> to Block &nbsp;|&nbsp;
      <span style="color: #fff;">TAB</span> to Switch Target &nbsp;|&nbsp;
      <span style="color: #ff6b6b;">ESC</span> to Forfeit
    </div>

    <!-- Combo counter -->
    <div id="combo-counter" style="position: fixed; bottom: 100px; right: 20px; z-index: 999; color: #ffd700; font-family: Impact, sans-serif; font-size: 2rem; text-shadow: 2px 2px 4px #000; display: none;">
    </div>
  `;

  document.body.appendChild(boxingUI);
}

/**
 * Hide the boxing UI overlay
 */
function hideBoxingUI() {
  if (boxingUI) {
    boxingUI.remove();
    boxingUI = null;
  }

  // Also remove any lingering commentary
  document.querySelectorAll('.boxing-commentary').forEach(el => el.remove());
}

/**
 * Update UI values during gameplay
 */
function updateBoxingUIValues() {
  if (!boxingUI) return;

  // Player health
  const healthBar = document.getElementById('player-health-bar');
  if (healthBar) {
    const healthPercent = Math.max(0, minigameState.playerHealth / BOXING_CONFIG.playerMaxHealth * 100);
    healthBar.style.width = healthPercent + '%';
  }

  // Player stamina
  const staminaBar = document.getElementById('player-stamina-bar');
  if (staminaBar) {
    const staminaPercent = Math.max(0, minigameState.playerStamina / BOXING_CONFIG.playerMaxStamina * 100);
    staminaBar.style.width = staminaPercent + '%';
  }

  // Knight 1 health
  const knight1Bar = document.getElementById('knight1-health-bar');
  const knight1Ind = document.getElementById('knight1-indicator');
  if (knight1Bar && knight1Ind) {
    const health1Percent = Math.max(0, minigameState.knights[0].health / BOXING_CONFIG.knightMaxHealth * 100);
    knight1Bar.style.width = health1Percent + '%';
    knight1Ind.classList.toggle('active', minigameState.currentTarget === 0);
    knight1Ind.classList.toggle('knocked-out', minigameState.knights[0].health <= 0);
  }

  // Knight 2 health
  const knight2Bar = document.getElementById('knight2-health-bar');
  const knight2Ind = document.getElementById('knight2-indicator');
  if (knight2Bar && knight2Ind) {
    const health2Percent = Math.max(0, minigameState.knights[1].health / BOXING_CONFIG.knightMaxHealth * 100);
    knight2Bar.style.width = health2Percent + '%';
    knight2Ind.classList.toggle('active', minigameState.currentTarget === 1);
    knight2Ind.classList.toggle('knocked-out', minigameState.knights[1].health <= 0);
  }

  // Combo counter
  const comboCounter = document.getElementById('combo-counter');
  if (comboCounter) {
    if (minigameState.comboCount >= 2) {
      comboCounter.style.display = 'block';
      comboCounter.textContent = `${minigameState.comboCount}x COMBO!`;
    } else {
      comboCounter.style.display = 'none';
    }
  }
}

/**
 * Input handlers
 */
function onMouseDown(e) {
  if (!minigameState.active) return;
  if (e.button === 0) {  // Left click
    minigameState.mouseDown = true;
    playerAttack();
  }
}

function onMouseUp(e) {
  if (e.button === 0) {
    minigameState.mouseDown = false;
  }
}

function onKeyDown(e) {
  if (!minigameState.active) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (!minigameState.spaceDown && minigameState.playerStamina > 0) {
      minigameState.spaceDown = true;
      minigameState.isBlocking = true;
    }
  }

  if (e.code === 'Tab') {
    e.preventDefault();
    switchTarget();
  }

  if (e.code === 'Escape') {
    // Forfeit - end the match early
    minigameState.phase = 'defeat';
    minigameState.outroTimer = 2;
    showCommentary('defeat');
  }
}

function onKeyUp(e) {
  if (e.code === 'Space') {
    minigameState.spaceDown = false;
    minigameState.isBlocking = false;
  }
}

/**
 * Get current minigame state (for external queries)
 */
export function getBoxingMinigameState() {
  return {
    active: minigameState.active,
    phase: minigameState.phase,
    playerHealth: minigameState.playerHealth,
    playerStamina: minigameState.playerStamina,
    knight1Health: minigameState.knights[0].health,
    knight2Health: minigameState.knights[1].health,
    totalKnockouts: minigameState.totalKnockouts,
    totalDefeats: minigameState.totalDefeats
  };
}

/**
 * Check if minigame is active
 */
export function isBoxingMinigameActive() {
  return minigameState.active;
}
