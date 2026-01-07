// Configuration constants for Royal Court Tea game

export const EVENT = {
  title: "The Royal Court Tea",
  subtitle: "Unapologetically Royal",
  tagline: "Embracing your crown",
  date: "Saturday, 31 January 2026",
  time: "11:00 AM",
  location: "146 Heather Rd, Austinville, Blackheath",
  dressCode: "Royal (floral and pastel colours)"
};

export const PATH_CONFIG = {
  count: 5,
  angleStep: Math.PI * 0.4,
  length: 13,
  width: 2.5,
  centerRadius: 6.5
};

export const AUDIO_CONFIG = {
  AMBIENT_VOICE_MIN_DELAY: 10000,
  AMBIENT_VOICE_MAX_DELAY: 10000,
  WANDERER_VOICE_COOLDOWN: 10000
};

export const PLAYER_CONFIG = {
  BASE_SPEED: 6,
  BOOST_SPEED: 12,
  BOOST_DURATION: 1500
};

export const CELEBRATION_CONFIG = {
  COOLDOWN: 250
};
