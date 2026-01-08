// Audio Manager - handles voice and music playback

import { AUDIO_CONFIG } from '../config.js';
import { MUSIC_TRACKS } from '../assets/data.js';
import { settingsManager } from '../systems/settingsManager.js';

// Voice configuration
const VOICE_FILES = {
  palace: 'music/voices/Voice1.mp3',  // Queen Bee ALWAYS gets Voice1
  teashop: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  speakers: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  guests: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  feast: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3'],
  wanderer: ['music/voices/Voice2.mp3', 'music/voices/Voice3.mp3', 'music/voices/Voice4.mp3', 'music/voices/Voice5.mp3', 'music/voices/Voice6.mp3', 'music/voices/Voice7.mp3']
};

const SFX_DEFS = {
  ambience: {
    birds: { type: 'chirp', duration: 4, volume: 0.25, baseFreq: 900, accentFreq: 1400, noise: 0.08 },
    wind: { type: 'noise', duration: 4, volume: 0.2, lowpass: 0.01 },
    crowd: { type: 'noise', duration: 4, volume: 0.2, lowpass: 0.03, tremolo: 1.2 },
    cafe: { type: 'clink', duration: 3, volume: 0.22, baseFreq: 1200, noise: 0.08 }
  },
  location: {
    boxingBell: { type: 'tone', duration: 1.1, volume: 0.6, baseFreq: 880, vibrato: 10 },
    fishingReel: { type: 'tone', duration: 1.2, volume: 0.45, baseFreq: 300, noise: 0.12 },
    trampoline: { type: 'tone', duration: 0.7, volume: 0.5, baseFreq: 120, vibrato: 4 },
    bridgeCreak: { type: 'noise', duration: 0.6, volume: 0.4, lowpass: 0.08 }
  },
  footsteps: {
    grass: { type: 'noise', duration: 0.2, volume: 0.35, lowpass: 0.2 },
    sand: { type: 'noise', duration: 0.2, volume: 0.35, lowpass: 0.12 },
    cobble: { type: 'noise', duration: 0.18, volume: 0.4, lowpass: 0.3, baseFreq: 180 },
    wood: { type: 'noise', duration: 0.2, volume: 0.4, lowpass: 0.25, baseFreq: 140 }
  },
  npc: {
    greeting: { type: 'tone', duration: 0.5, volume: 0.4, baseFreq: 700, vibrato: 12 },
    laugh: { type: 'tone', duration: 0.8, volume: 0.4, baseFreq: 500, vibrato: 35, noise: 0.04 },
    sigh: { type: 'tone', duration: 1.0, volume: 0.35, baseFreq: 220, vibrato: 4, noise: 0.03 },
    corgiBark: { type: 'tone', duration: 0.4, volume: 0.4, baseFreq: 180, vibrato: 20, noise: 0.08 },
    guardClank: { type: 'noise', duration: 0.3, volume: 0.35, lowpass: 0.4, baseFreq: 400 }
  }
};

// Voice state
let lastWandererVoiceAt = 0;
let ambientInitialized = false;
const ambientLoops = new Map();
const sfxCooldowns = new Map();
let audioContext = null;
const audioBuffers = new Map();

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

function canPlaySfx() {
  return settingsManager.get('soundEffects');
}

function getAudioContext() {
  if (audioContext) return audioContext;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  audioContext = ctx;
  return ctx;
}

function ensureAudioContextRunning() {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(err => console.log('Audio resume prevented:', err));
  }
}

function getAudioBuffer(category, key) {
  const cacheKey = `${category}:${key}`;
  if (audioBuffers.has(cacheKey)) {
    return audioBuffers.get(cacheKey);
  }
  const def = SFX_DEFS[category]?.[key];
  if (!def) return null;
  const buffer = buildAudioBuffer(def);
  audioBuffers.set(cacheKey, buffer);
  return buffer;
}

function buildAudioBuffer(def) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * def.duration));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  const baseFreq = def.baseFreq || 440;
  const vibrato = def.vibrato || 0;
  const noiseAmount = def.noise || 0;
  const tremolo = def.tremolo || 0;
  let lowpass = def.lowpass || null;
  let last = 0;

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    let sample = 0;

    if (def.type === 'noise' || def.type === 'clink') {
      const n = Math.random() * 2 - 1;
      if (lowpass) {
        last += (n - last) * lowpass;
        sample = last;
      } else {
        sample = n;
      }
    } else {
      const vib = vibrato ? Math.sin(2 * Math.PI * 5 * t) * vibrato : 0;
      sample = Math.sin(2 * Math.PI * (baseFreq + vib) * t);
      if (def.type === 'chirp' && def.accentFreq && Math.random() < 0.002) {
        sample += Math.sin(2 * Math.PI * def.accentFreq * t) * 0.6;
      }
    }

    if (def.type === 'clink' && Math.random() < 0.003) {
      sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.6;
    }

    if (def.baseFreq && def.type === 'noise') {
      sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.15;
    }

    if (noiseAmount) {
      sample += (Math.random() * 2 - 1) * noiseAmount;
    }

    if (tremolo) {
      sample *= 0.6 + 0.4 * Math.sin(2 * Math.PI * tremolo * t);
    }

    const fadeIn = Math.min(1, t / 0.1);
    const fadeOut = Math.min(1, (def.duration - t) / 0.2);
    sample *= Math.max(0, Math.min(fadeIn, fadeOut));

    data[i] = Math.max(-1, Math.min(1, sample));
  }

  return buffer;
}

function createLoop(key, config) {
  const ctx = getAudioContext();
  const buffer = getAudioBuffer('ambience', key);
  if (!buffer) return;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  source.connect(gain).connect(ctx.destination);
  source.start(0);
  ambientLoops.set(key, { source, gain, baseVolume: config.volume });
}

export function initializeAmbientAudio() {
  if (ambientInitialized) return;
  ambientInitialized = true;
  ensureAudioContextRunning();

  Object.entries(SFX_DEFS.ambience).forEach(([key, config]) => {
    createLoop(key, config);
  });
}

function setLoopVolume(key, volume) {
  const entry = ambientLoops.get(key);
  if (!entry) return;
  entry.gain.gain.value = Math.max(0, Math.min(1, volume));
}

function distanceToVolume(distance, minDistance, maxDistance) {
  if (distance <= minDistance) return 1;
  if (distance >= maxDistance) return 0;
  return 1 - (distance - minDistance) / (maxDistance - minDistance);
}

export function updateAmbientAudio(playerPosition, zones = []) {
  if (!ambientInitialized || !playerPosition) return;

  if (!canPlaySfx()) {
    ambientLoops.forEach((_, key) => setLoopVolume(key, 0));
    return;
  }

  const volumeByKey = new Map();

  zones.forEach(zone => {
    const entry = ambientLoops.get(zone.key);
    if (!entry) return;
    const dx = playerPosition.x - zone.position.x;
    const dz = playerPosition.z - zone.position.z;
    const distance = Math.hypot(dx, dz);
    const scale = distanceToVolume(distance, zone.minDistance ?? 4, zone.maxDistance ?? 30);
    const volume = entry.baseVolume * scale;
    const current = volumeByKey.get(zone.key) ?? 0;
    volumeByKey.set(zone.key, Math.max(current, volume));
  });

  ambientLoops.forEach((_, key) => {
    setLoopVolume(key, volumeByKey.get(key) ?? 0);
  });
}

function playSfx(category, key, { volumeMultiplier = 1 } = {}) {
  if (!canPlaySfx()) return;
  const config = SFX_DEFS[category]?.[key];
  if (!config) return;

  const ctx = getAudioContext();
  ensureAudioContextRunning();
  const buffer = getAudioBuffer(category, key);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = Math.max(0, Math.min(1, config.volume * volumeMultiplier));

  source.connect(gain).connect(ctx.destination);
  source.start(0);
}

function playSfxWithCooldown(category, key, cooldownMs, options = {}) {
  const now = Date.now();
  const lastTime = sfxCooldowns.get(key) || 0;
  if (now - lastTime < cooldownMs) return;
  sfxCooldowns.set(key, now);
  playSfx(category, key, options);
}

export function playFootstep(surface) {
  playSfx('footsteps', surface);
}

export function playBridgeCreak() {
  playSfxWithCooldown('location', 'bridgeCreak', 900);
}

export function playBoxingBell() {
  playSfxWithCooldown('location', 'boxingBell', 4000);
}

export function playFishingReel() {
  playSfxWithCooldown('location', 'fishingReel', 2000);
}

export function playTrampolineBounce() {
  playSfxWithCooldown('location', 'trampoline', 500);
}

export function playNpcGreeting() {
  playSfxWithCooldown('npc', 'greeting', 1000);
}

export function playNpcLaugh() {
  playSfxWithCooldown('npc', 'laugh', 1000);
}

export function playNpcSigh() {
  playSfxWithCooldown('npc', 'sigh', 1000);
}

export function playCorgiBark() {
  playSfxWithCooldown('npc', 'corgiBark', 800);
}

export function playGuardClank() {
  playSfxWithCooldown('npc', 'guardClank', 1200);
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
