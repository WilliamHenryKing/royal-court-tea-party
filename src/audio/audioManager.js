// Audio Manager - handles voice, music, ambient sounds, and interaction feedback

import { AUDIO_CONFIG } from '../config.js';
import { MUSIC_TRACKS } from '../assets/data.js';

// ============================================
// SOUND EFFECT SYSTEM (Web Audio API)
// ============================================

let audioContext = null;
let masterGain = null;
let sfxEnabled = true;

// Initialize audio context on first user interaction
export function initAudioContext() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioContext.destination);
  } catch (e) {
    console.log('Web Audio API not supported');
  }
}

// Generate procedural sounds using Web Audio API
function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (!audioContext || !sfxEnabled) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(masterGain);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Play noise burst (for footsteps, splashes, etc.)
function playNoise(duration, volume = 0.1, highpass = 1000) {
  if (!audioContext || !sfxEnabled) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = highpass;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  source.start();
}

// ============================================
// FOOTSTEP SOUNDS
// ============================================

const FOOTSTEP_CONFIG = {
  cobblestone: { type: 'noise', highpass: 2000, volume: 0.08, duration: 0.08 },
  grass: { type: 'noise', highpass: 800, volume: 0.05, duration: 0.1 },
  wood: { type: 'tone', frequency: 200, volume: 0.1, duration: 0.1 },
  sand: { type: 'noise', highpass: 600, volume: 0.04, duration: 0.15 },
  water: { type: 'noise', highpass: 400, volume: 0.12, duration: 0.2 }
};

let lastFootstepTime = 0;
const FOOTSTEP_INTERVAL = 280; // ms between footsteps

export function playFootstep(surfaceType = 'grass') {
  const now = Date.now();
  if (now - lastFootstepTime < FOOTSTEP_INTERVAL) return;
  lastFootstepTime = now;

  const config = FOOTSTEP_CONFIG[surfaceType] || FOOTSTEP_CONFIG.grass;

  if (config.type === 'noise') {
    playNoise(config.duration, config.volume, config.highpass);
  } else {
    playTone(config.frequency + Math.random() * 50, config.duration, 'sine', config.volume);
  }
}

// Determine surface type based on position
export function getSurfaceType(x, z) {
  // River/water area
  if (z > -32 && z < -24 && x > -45 && x < 45) {
    // Check if on bridge
    const bridgeXs = [5, -10, 25];
    for (const bx of bridgeXs) {
      if (Math.abs(x - bx) < 1.5) return 'wood';
    }
    return 'water';
  }

  // Forest area (south of river)
  if (z < -35 && x > 0 && x < 30) return 'grass';

  // Roads (sandy/cobblestone)
  if (Math.abs(z) < 2 || Math.abs(z - 10) < 2 || Math.abs(z + 10) < 2 || Math.abs(z + 20) < 2) {
    return 'cobblestone';
  }

  // Near buildings often have paths
  if (Math.abs(x) < 3 && Math.abs(z) < 3) return 'cobblestone';

  // Default to grass
  return 'grass';
}

// ============================================
// INTERACTION SOUNDS
// ============================================

export function playCollectSound() {
  if (!audioContext || !sfxEnabled) return;
  // Rising arpeggio for collecting sweets
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.15), i * 50);
  });
}

export function playBounceSound() {
  if (!audioContext || !sfxEnabled) return;
  // Boing sound for trampoline
  playTone(200, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(300, 0.1, 'sine', 0.15), 50);
  setTimeout(() => playTone(400, 0.15, 'sine', 0.1), 100);
}

export function playDialogOpen() {
  if (!audioContext || !sfxEnabled) return;
  // Soft chime for dialog
  playTone(880, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.08), 80);
}

export function playDialogClose() {
  if (!audioContext || !sfxEnabled) return;
  playTone(660, 0.1, 'sine', 0.08);
}

export function playSplashSound() {
  if (!audioContext || !sfxEnabled) return;
  playNoise(0.3, 0.15, 300);
}

export function playBellSound() {
  if (!audioContext || !sfxEnabled) return;
  // Bell for Pinkie School or announcements
  playTone(880, 0.5, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.4, 'sine', 0.15), 200);
}

// ============================================
// AMBIENT SOUND SYSTEM
// ============================================

let ambientInterval = null;
let lastAmbientPlay = {};

// Ambient sound probabilities and cooldowns
const AMBIENT_CONFIG = {
  birds: { cooldown: 5000, probability: 0.3 },
  wind: { cooldown: 8000, probability: 0.2 },
  teacup: { cooldown: 4000, probability: 0.4 },
  boxing: { cooldown: 3000, probability: 0.5 },
  fishing: { cooldown: 6000, probability: 0.25 }
};

export function playAmbientBird() {
  if (!audioContext || !sfxEnabled) return;
  // Bird chirp sequence
  const baseFreq = 2000 + Math.random() * 500;
  playTone(baseFreq, 0.08, 'sine', 0.05);
  setTimeout(() => playTone(baseFreq * 1.2, 0.06, 'sine', 0.04), 100);
  setTimeout(() => playTone(baseFreq * 0.9, 0.1, 'sine', 0.03), 180);
}

export function playWindSound() {
  if (!audioContext || !sfxEnabled) return;
  playNoise(0.8, 0.03, 200);
}

export function playTeacupClink() {
  if (!audioContext || !sfxEnabled) return;
  playTone(3000, 0.05, 'sine', 0.06);
  setTimeout(() => playTone(2800, 0.08, 'sine', 0.04), 50);
}

export function playBoxingBell() {
  if (!audioContext || !sfxEnabled) return;
  playTone(600, 0.3, 'triangle', 0.1);
}

export function playFishingSplash() {
  if (!audioContext || !sfxEnabled) return;
  playNoise(0.15, 0.08, 500);
}

// Update ambient sounds based on player position
export function updateAmbientSounds(playerX, playerZ) {
  const now = Date.now();

  // Birds near forest (south of river)
  if (playerZ < -30 && playerX > 0 && playerX < 35) {
    if (shouldPlayAmbient('birds', now)) {
      playAmbientBird();
    }
  }

  // Wind in open areas
  if (Math.abs(playerZ) > 15 || Math.abs(playerX) > 20) {
    if (shouldPlayAmbient('wind', now)) {
      playWindSound();
    }
  }

  // Teacup sounds near Tea Café (x:25, z:5)
  const distToCafe = Math.sqrt(Math.pow(playerX - 25, 2) + Math.pow(playerZ - 5, 2));
  if (distToCafe < 10) {
    if (shouldPlayAmbient('teacup', now)) {
      playTeacupClink();
    }
  }

  // Boxing sounds near boxing ring (activities area)
  const distToRing = Math.sqrt(Math.pow(playerX + 20, 2) + Math.pow(playerZ - 15, 2));
  if (distToRing < 12) {
    if (shouldPlayAmbient('boxing', now)) {
      playBoxingBell();
    }
  }

  // Fishing sounds near dock
  const distToDock = Math.sqrt(Math.pow(playerX + 25, 2) + Math.pow(playerZ + 23, 2));
  if (distToDock < 8) {
    if (shouldPlayAmbient('fishing', now)) {
      playFishingSplash();
    }
  }
}

function shouldPlayAmbient(type, now) {
  const config = AMBIENT_CONFIG[type];
  const lastPlay = lastAmbientPlay[type] || 0;

  if (now - lastPlay < config.cooldown) return false;
  if (Math.random() > config.probability) return false;

  lastAmbientPlay[type] = now;
  return true;
}

// Toggle SFX
export function toggleSFX() {
  sfxEnabled = !sfxEnabled;
  return sfxEnabled;
}

export function isSFXEnabled() {
  return sfxEnabled;
}

// Voice configuration
const VOICE_FILES = {
  palace: 'music/voices/Voice1.mp3',  // Queen Bee ALWAYS gets Voice1
  teashop: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  speakers: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  guests: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  feast: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  wanderer: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3']
};

// Voice state
let lastWandererVoiceAt = 0;

// Music state
export const musicAudio = new Audio();
export const musicState = {
  initialized: false,
  currentIndex: 0
};

// Voice functions
export function playVoice(locationId) {
  try {
    const voiceFile = VOICE_FILES[locationId];
    if (!voiceFile) return;

    const voicePath = Array.isArray(voiceFile)
      ? voiceFile[Math.floor(Math.random() * voiceFile.length)]
      : voiceFile;

    const audio = new Audio(voicePath);
    audio.volume = 0.6;
    audio.play().catch(err => console.log('Voice playback prevented:', err));
  } catch (err) {
    console.log('Voice error:', err);
  }
}

export function playRandomWandererVoice() {
  try {
    const now = Date.now();
    if (now - lastWandererVoiceAt < AUDIO_CONFIG.WANDERER_VOICE_COOLDOWN) {
      return;
    }
    lastWandererVoiceAt = now;

    const voices = VOICE_FILES.wanderer;
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];
    const audio = new Audio(randomVoice);
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Voice playback prevented:', err));
  } catch (err) {
    console.log('Voice error:', err);
  }
}

export function scheduleNextAmbientVoice(npc, now = Date.now()) {
  npc.userData.nextVoiceTime = now + AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY +
    Math.random() * (AUDIO_CONFIG.AMBIENT_VOICE_MAX_DELAY - AUDIO_CONFIG.AMBIENT_VOICE_MIN_DELAY);
}

export function maybePlayAmbientVoice(npc) {
  const now = Date.now();
  if (!npc.userData.nextVoiceTime) {
    scheduleNextAmbientVoice(npc, now);
    return;
  }
  if (now >= npc.userData.nextVoiceTime) {
    playRandomWandererVoice();
    scheduleNextAmbientVoice(npc, now);
  }
}

// Music functions
export function playCurrentTrack() {
  const track = MUSIC_TRACKS[musicState.currentIndex];
  if (!track) return;

  musicAudio.src = track.file;
  musicAudio.loop = false;
  musicAudio.volume = 0.3;

  // Note: ended event is handled externally in main.js to allow UI updates
  musicAudio.play().catch(err => console.log('Music playback prevented:', err));
}

export function loadTrack(index) {
  const track = MUSIC_TRACKS[index];
  if (!track) return;

  musicAudio.src = encodeURI(track.file);
  musicAudio.loop = false;
  musicAudio.volume = 0.3;
}

export function playNextTrack() {
  musicState.currentIndex = (musicState.currentIndex + 1) % MUSIC_TRACKS.length;
  playCurrentTrack();
}

export function toggleMusicMute() {
  musicAudio.muted = !musicAudio.muted;
}

export function getCurrentTrack() {
  return MUSIC_TRACKS[musicState.currentIndex];
}
