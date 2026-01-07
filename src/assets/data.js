// Game content data - locations, NPCs, dialogs, etc.

export const SPEAKERS = [
  { name: "Sister Lucille", topic: "Me, Myself and I" },
  { name: "Sister Lizelle", topic: "The Importance of Friendship/Sisterhood" },
  { name: "Sister Mariana", topic: "Living for Christ and being the example" }
];

export const GUESTS = [
  "Bernily King", "Caron Benjamin", "Phebe Benjamin", "Ruth-Grace Davids",
  "Victory Strauss", "Aurelia Botha", "Zoe Kabwanga", "Tamlyn Okkers",
  "Carla Okkers", "Nicole Heuvel", "Kaylen Heuvel", "Sharidyn Rogers",
  "Chelsea Latola", "Beaulah Davids"
];

// AUSTINVILLE GRID LAYOUT
// Streets: Royal Road (z=0), Peppermint Ave (z=-20), Milk Lane (z=-10), Crumpet Court (z=10), Scone Street (z=20)
// Cross streets: Sugar Lane (x=-20), Honey Way (x=0), Biscuit Boulevard (x=20)
// Buildings placed in proper blocks between streets
export const LOCATIONS = [
  { id: 'palace', x: 10, z: 5, color: 0xf5a1c0, icon: '🏰', name: 'Royal Palace', sx: 5, sz: 4 },
  { id: 'teashop', x: 12, z: -5, color: 0xa9c7ff, icon: '🍵', name: 'Tea Garden', sx: 4, sz: 3.5 },
  { id: 'speakers', x: 0, z: 15, color: 0xd4b8ff, icon: '🎤', name: "Speaker's Grove", sx: 5, sz: 5 },
  { id: 'guests', x: -10, z: 5, color: 0xffd4a8, icon: '📜', name: 'Guest Registry', sx: 4, sz: 4 },
  { id: 'feast', x: -10, z: -5, color: 0xb8e986, icon: '🍰', name: 'Feast Hall', sx: 4.5, sz: 3.5 }
];

// Dialog content generator - uses EVENT data for template strings
export function generateDialogs(EVENT, SPEAKERS, GUESTS) {
  return {
    palace: {
      avatar: "👸",
      name: "Queen Bee",
      role: "Royal Host & Professional Crown Wearer",
      content: `<h3>👑 ${EVENT.title}</h3><p style="font-family: 'Dancing Script', cursive; font-size: 1.4rem; color: var(--pink-deep); margin: 1rem 0;">"${EVENT.subtitle}"</p><p style="font-style: italic; color: var(--text-light);">${EVENT.tagline}</p><div class="funny-quote">Why fit in when you were born to stand out... in a tiara? 👑🐝</div><p style="margin-top: 1rem;">Welcome to the Royal Court! You have been specially chosen to attend our magnificent tea party.</p><p style="margin-top: 0.8rem;">Explore the kingdom to discover all the magical details. And try not to step on the royal corgis! 🐕</p>`
    },
    teashop: {
      avatar: "🍵",
      name: "Lady Phebe",
      role: "Tea Sommelier & Biscuit Enthusiast",
      content: `<h3>📋 Event Details</h3><div class="funny-quote">I've never met a problem that couldn't be solved with tea. Except running out of tea. That's a crisis.</div><div class="detail-card"><div class="detail-row"><span class="detail-icon">📅</span><strong>${EVENT.date}</strong></div><div class="detail-row"><span class="detail-icon">⏰</span><strong>${EVENT.time}</strong></div><div class="detail-row"><span class="detail-icon">📍</span><span>${EVENT.location}</span></div><div class="detail-row"><span class="detail-icon">👗</span><span>Dress Code: <span class="highlight">${EVENT.dressCode}</span></span></div></div><p style="margin-top: 1rem;">Come dressed in your finest royal attire! Tiaras encouraged. Pajamas discouraged... unless they're ROYAL pajamas. 👑</p>`
    },
    speakers: {
      avatar: "🎤",
      name: "Princess Bernie",
      role: "Royal Announcer & Hype Lady",
      content: `<h3>🌟 Guest Speakers</h3><div class="funny-quote">*clears throat dramatically*<br>HEAR YE, HEAR YE! Prepare to be INSPIRED! 📣</div><p>Our distinguished speakers will share wisdom:</p>${SPEAKERS.map(s => `<div class="speaker-card"><div class="speaker-name">👑 ${s.name}</div><div class="speaker-topic">"${s.topic}"</div></div>`).join('')}<p style="margin-top: 1rem; font-style: italic; color: var(--text-light);">Tissues provided. Prepare for tears AND laughter! 😂😭</p>`
    },
    guests: {
      avatar: "📜",
      name: "Lord Scribe",
      role: "Royal Registry Keeper & Name Speller",
      content: `<h3>👑 The Royal Court</h3><div class="funny-quote">I've written every name with my finest quill. My hand cramped. Worth it. ✍️</div><p>These distinguished guests have been summoned:</p><div class="guest-grid">${GUESTS.map(g => `<div class="guest-item"><span>✿</span> ${g}</div>`).join('')}</div><p style="margin-top: 1rem; text-align: center;">If your name is here, you're basically royalty now! 💎</p>`
    },
    feast: {
      avatar: "🍰",
      name: "Chef Caron",
      role: "Royal Baker & Professional Taste Tester",
      content: `<h3>🍽️ A Royal Feast</h3><div class="funny-quote">My philosophy? Life is uncertain. Eat dessert first. 🧁</div><p>Our tea party shall be a grand <span class="highlight">Potluck Celebration</span>!</p><div class="detail-card"><p><strong>Each guest is kindly asked to bring:</strong></p><ul><li>A dish fit for royalty to share</li><li>Your favorite tea-time treat</li><li>An appetite (very important!)</li><li>Your creative mind</li></ul></div><p style="margin-top: 1rem;">Pinkies out at a 45-degree angle. I will have a PROTRACTOR. 📐</p><p style="margin-top: 1rem; font-family: 'Dancing Script', cursive; font-size: 1.2rem; text-align: center; color: var(--pink-deep);">"Together we feast, together we reign!" 👑</p>`
    }
  };
}

export const WANDERING_NPCS = [
  // Regular wanderers
  { name: "Lady Giggles", role: "Royal Laugher", quotes: [
    "Why did the crown go to therapy? Too much pressure! *snort*",
    "I laugh at my own jokes. Excellent taste.",
    "Best. Job. Ever.",
    "Hahahaha! Wait, what were we talking about?",
    "My doctor says I laugh too much. I laughed at him too."
  ], speed: 'normal' },
  { name: "Duke Snackington", role: "Snack Ambassador", quotes: [
    "I'm not hoarding cookies. I'm... protecting them.",
    "The secret ingredient is always more butter.",
    "I've been to the feast hall 7 times today.",
    "Is it snack time yet? It's always snack time.",
    "Calories don't count at royal parties. It's the law."
  ], speed: 'normal' },
  { name: "Countess Sparkle", role: "Glitter Specialist", quotes: [
    "I put glitter in my coffee this morning. YOLO.",
    "Some say I use too much sparkle. They're jealous.",
    "My tiara has a tiara.",
    "I sneezed and now the garden is fabulous.",
    "Glitter is just aggressive confetti. I love it."
  ], speed: 'normal' },

  // Fast runners - silly and hyper
  { name: "Zippy Zoom", role: "Royal Sprinter", quotes: [
    "GOTTA GO FAST! Wait... why?",
    "I'm not running FROM something, I'm running TO... actually I forgot.",
    "WHEEEEE! *crashes into bush*",
    "Can't stop won't stop! ...okay maybe I'll stop.",
    "I RAN SO FAST I SAW TOMORROW!"
  ], speed: 'fast' },
  { name: "Princess Turbo", role: "Speed Enthusiast", quotes: [
    "Slow? I don't know her!",
    "I had 47 cups of tea this morning!",
    "ZOOM ZOOM ZOOOOOM!",
    "Racing the clouds! I'm winning!",
    "My legs are powered by EXCITEMENT!"
  ], speed: 'fast' },
  { name: "Lady Rocket", role: "Professional Rusher", quotes: [
    "Late for EVERYTHING! Even when I'm early!",
    "My legs said RUN so here we are!",
    "*whoooosh* Did you see me? I was a BLUR!",
    "No time to chat! Actually yes time! NO WAIT—",
    "I'm not hyper, I'm ENTHUSIASTICALLY ENERGETIC!"
  ], speed: 'fast' },

  // Slow elderly - complaining adorably
  { name: "Granny Shuffle", role: "Senior Stroller", quotes: [
    "Back in MY day, we walked even SLOWER.",
    "My knees are older than this kingdom.",
    "These young folk and their 'running'... disgraceful.",
    "I've been walking to the tea shop since Tuesday.",
    "Slow and steady wins the... what was I saying?"
  ], speed: 'slow' },
  { name: "Old Baron Creaky", role: "Vintage Walker", quotes: [
    "*creeeak* That was my back, not the floor.",
    "Ah, to be young and have working ankles...",
    "I remember when this was all fields... wait, it still is.",
    "Walking is exercise. I'm basically an athlete.",
    "My bones predict rain. Also sunshine. They're confused."
  ], speed: 'slow' },
  { name: "Duchess Dawdle", role: "Leisurely Lady", quotes: [
    "Rushing causes wrinkles, dear.",
    "I'll get there when I get there. Maybe tomorrow.",
    "My spirit animal is a sleepy tortoise.",
    "These bones have seen 400 tea parties. They're tired.",
    "In my day, we took NAP BREAKS during walks."
  ], speed: 'slow' },
  { name: "Sir Wobbles", role: "Professional Walker", quotes: [
    "I've been walking in circles for 3 days. Send help.",
    "Have you seen my other shoe?",
    "I'm not lost. I'm on an ADVENTURE.",
    "Left foot, right foot, left foot... wait, which was first?",
    "I meant to go this way. Definitely. On purpose."
  ], speed: 'normal' },
  { name: "Princess Oops", role: "Professional Accident Haver", quotes: [
    "I've tripped over 3 invisible things today. New record!",
    "Who put that wall there?!",
    "I'm not clumsy. The floor is just really friendly.",
    "*trips on nothing* I MEANT TO DO THAT.",
    "Gravity and I have a complicated relationship."
  ], speed: 'normal' },
  { name: "Baron Von Naps", role: "Royal Sleep Consultant", quotes: [
    "I'm not sleeping, I'm resting my eyes... horizontally.",
    "My spirit animal is a sloth wearing a crown.",
    "Napping is just practicing for being a statue.",
    "*yawns royally* Excuse me, that was a REGAL yawn.",
    "I dream of dreams about dreaming. Very productive."
  ], speed: 'slow' }
];

export const MUSIC_TRACKS = [
  { title: "Cloud Kingdom Café Part I", file: "music/Cloud Kingdom Café Part I.mp3" },
  { title: "Cloud Kingdom Café Part II", file: "music/Cloud Kingdom Café Part II.mp3" },
  { title: "Castle in the Clouds", file: "music/Castle in the Clouds.mp3" }
];
