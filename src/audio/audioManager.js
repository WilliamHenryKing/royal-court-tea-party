// Audio Manager - handles voice and music playback

import { AUDIO_CONFIG } from '../config.js';
import { MUSIC_TRACKS } from '../assets/data.js';

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
