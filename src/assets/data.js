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

// ============================================
// BUILDING NPCs - NPCs that introduce buildings
// ============================================

export const BUILDING_NPCS = {
  pinkieSchool: {
    id: 'pinkieSchool',
    name: "Madame Pinkie",
    role: "Headmistress of Proper Etiquette",
    avatar: "🤙",
    position: { x: -25, z: 8 }, // In front of building
    color: 0xdda0dd,
    intro: {
      greeting: "Ah, a new student approaches!",
      content: `<h3>🤙 Madame Pinkie's Academy</h3>
        <p style="font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: var(--pink-deep);">"Excellence Through Extension"</p>
        <div class="funny-quote">I am Madame Pinkie, and I have dedicated my LIFE to the art of the perfect pinkie extension!</div>
        <p>Here at my academy, we teach the sacred art of <strong>proper tea-holding technique</strong>. The pinkie must be raised at precisely <strong>45 degrees</strong>!</p>
        <p style="margin-top: 0.8rem;">Too little? Commoner. Too much? Showoff. <em>Perfection is in the angle.</em></p>
        <p style="margin-top: 0.8rem; font-style: italic; color: var(--text-light);">I have a protractor. I WILL measure. 📐</p>`
    },
    remarks: [
      "Your pinkie extension is... adequate. We can work on it.",
      "I once expelled a student for a 43-degree extension. Standards matter!",
      "The Queen herself studied here! Well, she visited once. For tea.",
      "Practice makes perfect! Now show me that pinkie!",
      "Remember: the pinkie leads, the teacup follows!",
      "*adjusts monocle* Hmm, I see potential in you."
    ]
  },
  boxingRing: {
    id: 'boxingRing',
    name: "Duke Dramatic",
    role: "Official Royal Commentator",
    avatar: "🎙️",
    position: { x: -20, z: -15 }, // Near announcer booth
    color: 0xffd700,
    intro: {
      greeting: "LADIES AND GENTLEMEN!",
      content: `<h3>🥊 The Royal Rumble</h3>
        <p style="font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: var(--pink-deep);">"Where Honor Meets... Whatever This Is"</p>
        <div class="funny-quote">Welcome to the GREATEST spectacle in all the kingdom! ...probably!</div>
        <p>I am Duke Dramatic, and I've commentated on <strong>487 matches</strong>! Victories? Zero. But the DRAMA? <em>Legendary.</em></p>
        <p style="margin-top: 0.8rem;">Watch as Sir Clumsy and Lord Fumbles battle for... actually, I'm not sure what they're fighting for. Honor? The last scone? Their own dignity?</p>
        <p style="margin-top: 0.8rem; font-style: italic; color: var(--text-light);">Spoiler: They'll both fall down. They always do. 😅</p>`
    },
    remarks: [
      "AND HE'S DOWN! ...wait, they both are. Classic.",
      "In my 40 years of commentary, this is the most... something.",
      "The crowd goes MILD! Mildly confused, that is!",
      "Place your bets! On what, I'm not sure!",
      "Sir Clumsy leads with a— oh, he tripped.",
      "WHAT. A. PERFORMANCE! ...of falling, mainly."
    ]
  },
  fishingDock: {
    id: 'fishingDock',
    name: "Ol' Captain Catch",
    role: "Legendary Fisherman (Self-Proclaimed)",
    avatar: "🎣",
    position: { x: -22, z: -21 }, // On the dock
    color: 0x4a90b8,
    intro: {
      greeting: "Ahoy there, landlubber!",
      content: `<h3>🎣 Austinville Fishing Dock</h3>
        <p style="font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: var(--pink-deep);">"Where Patience Meets... More Patience"</p>
        <div class="funny-quote">They call me Captain Catch! Haven't caught anything in years, but the NAME still works!</div>
        <p>This here dock has been the site of <strong>legendary catches</strong>... according to me. No witnesses, but trust me.</p>
        <p style="margin-top: 0.8rem;">We got Old Timer Pete (he's sleeping), Little Timmy (he's optimistic), and Competitive Carl (he's... intense).</p>
        <p style="margin-top: 0.8rem; font-style: italic; color: var(--text-light);">The fish here are plentiful! They just... choose not to be caught. Very polite of them. 🐟</p>`
    },
    remarks: [
      "The big one got away! ...again. For the 347th time.",
      "Timmy caught a fish once. We don't talk about it. Carl cried.",
      "These waters are TEEMING with fish! Just very shy fish.",
      "*stares at water* Any minute now...",
      "I once caught a boot. Best day of my life, honestly.",
      "The secret to fishing is patience. And lying about your catches."
    ]
  },
  donutShop: {
    id: 'donutShop',
    name: "Donut Daisy",
    role: "Chief Glaze Officer",
    avatar: "🍩",
    position: { x: 10, z: -20 }, // In front of donut shop
    color: 0xffb6c1,
    intro: {
      greeting: "Welcome to DONUT heaven!",
      content: `<h3>🍩 Glazed & Confused</h3>
        <p style="font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: var(--pink-deep);">"Life is Uncertain. Eat Donuts First."</p>
        <div class="funny-quote">I'm Donut Daisy, and I've been confused since 1847! But our donuts? PERFECT.</div>
        <p>See that giant donut on our roof? That's not just decoration— it's a <strong>lifestyle statement</strong>.</p>
        <p style="margin-top: 0.8rem;">We serve 47 flavors of confusion! From <em>"What did I just eat?"</em> to <em>"Why can't I stop eating these?!"</em></p>
        <p style="margin-top: 0.8rem; font-style: italic; color: var(--text-light);">Fun fact: Our sprinkles are color-coded by existential crisis type! 🌈</p>`
    },
    remarks: [
      "Try our new flavor: 'Questionable Decisions'!",
      "The hole in the donut represents... something deep, probably.",
      "Calories don't count if you're confused while eating!",
      "Our secret ingredient? More glaze. Always more glaze.",
      "I once ate 47 donuts. I regret nothing.",
      "Life gave me lemons, so I glazed them and put sprinkles on top!"
    ]
  },
  teaCoffeeBattle: {
    id: 'teaCoffeeBattle',
    name: "Sir Neutral",
    role: "Impartial Observer (Allegedly)",
    avatar: "⚖️",
    position: { x: 18, z: -5 }, // Between the cafes in the war zone
    color: 0x808080,
    intro: {
      greeting: "Ah, you've wandered into the war zone...",
      content: `<h3>⚔️ The Great Beverage War</h3>
        <p style="font-family: 'Dancing Script', cursive; font-size: 1.3rem; color: var(--pink-deep);">"A Tale of Two Cafes"</p>
        <div class="funny-quote">I am Sir Neutral! I take no sides! ...though tea IS clearly superior. Wait, I didn't say that.</div>
        <p>Behold! To the north, <strong>The Gilded Teacup</strong>— refined, elegant, properly steeped.</p>
        <p style="margin-top: 0.5rem;">To the south, <strong>The Bitter Bean</strong>— chaotic, caffeinated, never sleeping.</p>
        <p style="margin-top: 0.8rem;">They've been at war for <strong>centuries</strong>! Or maybe weeks. Time is weird when you're this tired.</p>
        <p style="margin-top: 0.8rem; font-style: italic; color: var(--text-light);">I just observe. Impartially. *sips tea* ...THAT WASN'T TEA IT WAS... um... water. 😅</p>`
    },
    remarks: [
      "The war continues! No casualties, just passive-aggressive menu changes.",
      "Coffee says they never sleep. Tea says that's NOT a flex.",
      "*yawns* I've been observing for 72 hours. Both sides offered me drinks. I took NEITHER. ...okay, I took both.",
      "Sir Chamomile threw a scone today. Dame Darjeeling was scandalized!",
      "Captain Cappuccino has had 12 espressos. He can see through TIME.",
      "I remain neutral! ...although have you TRIED a good Earl Grey?"
    ]
  }
};

// Generate building NPC dialogs - uses intro for first visit, remarks for subsequent
export function generateBuildingDialog(npcId, isFirstVisit = true) {
  const npc = BUILDING_NPCS[npcId];
  if (!npc) return null;

  if (isFirstVisit) {
    return {
      avatar: npc.avatar,
      name: npc.name,
      role: npc.role,
      content: npc.intro.content
    };
  } else {
    // Random remark for subsequent visits
    const remark = npc.remarks[Math.floor(Math.random() * npc.remarks.length)];
    return {
      avatar: npc.avatar,
      name: npc.name,
      role: npc.role,
      content: `<div class="funny-quote">${remark}</div>
        <p style="text-align: center; color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">*${npc.name} nods wisely*</p>`
    };
  }
}
