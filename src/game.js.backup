    // ============================================
    // 🎵 VOICE SYSTEM - Cute NPC voices!
    // ============================================
    const VOICE_FILES = {
      palace: 'voices/Voice1.mp3',  // Queen Bee ALWAYS gets Voice1
      teashop: ['voices/Voice2.mp3', 'voices/Voice3.mp3', 'voices/Voice4.mp3', 'voices/Voice5.mp3', 'voices/Voice6.mp3', 'voices/Voice7.mp3'],
      speakers: ['voices/Voice2.mp3', 'voices/Voice3.mp3', 'voices/Voice4.mp3', 'voices/Voice5.mp3', 'voices/Voice6.mp3', 'voices/Voice7.mp3'],
      guests: ['voices/Voice2.mp3', 'voices/Voice3.mp3', 'voices/Voice4.mp3', 'voices/Voice5.mp3', 'voices/Voice6.mp3', 'voices/Voice7.mp3'],
      feast: ['voices/Voice2.mp3', 'voices/Voice3.mp3', 'voices/Voice4.mp3', 'voices/Voice5.mp3', 'voices/Voice6.mp3', 'voices/Voice7.mp3'],
      wanderer: ['voices/Voice2.mp3', 'voices/Voice3.mp3', 'voices/Voice4.mp3', 'voices/Voice5.mp3', 'voices/Voice6.mp3', 'voices/Voice7.mp3']
    };
    const AMBIENT_VOICE_MIN_DELAY = 10000;
    const AMBIENT_VOICE_MAX_DELAY = 10000;
    const WANDERER_VOICE_COOLDOWN = 10000;
    let lastWandererVoiceAt = 0;

    function playVoice(locationId) {
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

    function playRandomWandererVoice() {
      try {
        const now = Date.now();
        if (now - lastWandererVoiceAt < WANDERER_VOICE_COOLDOWN) {
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

    function scheduleNextAmbientVoice(npc, now = Date.now()) {
      npc.userData.nextVoiceTime = now + AMBIENT_VOICE_MIN_DELAY +
        Math.random() * (AMBIENT_VOICE_MAX_DELAY - AMBIENT_VOICE_MIN_DELAY);
    }

    function maybePlayAmbientVoice(npc) {
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

    // Event data
    const EVENT = {
      title: "The Royal Court Tea",
      subtitle: "Unapologetically Royal",
      tagline: "Embracing your crown",
      date: "Saturday, 31 January 2026",
      time: "11:00 AM",
      location: "146 Heather Rd, Austinville, Blackheath",
      dressCode: "Royal (floral and pastel colours)"
    };
    const SPEAKERS = [
      { name: "Sister Lucille", topic: "Me, Myself and I" },
      { name: "Sister Lizelle", topic: "The Importance of Friendship/Sisterhood" },
      { name: "Sister Mariana", topic: "Living for Christ and being the example" }
    ];
    const GUESTS = ["Bernily King", "Caron Benjamin", "Phebe Benjamin", "Ruth-Grace Davids", "Victory Strauss", "Aurelia Botha", "Zoe Kabwanga", "Tamlyn Okkers", "Carla Okkers", "Nicole Heuvel", "Kaylen Heuvel", "Sharidyn Rogers", "Chelsea Latola", "Beaulah Davids"];

    // Location data
    const LOCATIONS = [
      { id: 'palace', x: 0, z: -14, color: 0xf5a1c0, icon: '🏰', name: 'Royal Palace', sx: 5, sz: 4 },
      { id: 'teashop', x: 12, z: -4, color: 0xa9c7ff, icon: '🍵', name: 'Tea Garden', sx: 4, sz: 3.5 },
      { id: 'speakers', x: 8, z: 11, color: 0xd4b8ff, icon: '🎤', name: "Speaker's Grove", sx: 5, sz: 5 },
      { id: 'guests', x: -8, z: 11, color: 0xffd4a8, icon: '📜', name: 'Guest Registry', sx: 4, sz: 4 },
      { id: 'feast', x: -12, z: -4, color: 0xb8e986, icon: '🍰', name: 'Feast Hall', sx: 4.5, sz: 3.5 }
    ];

    // Dialog content
    const DIALOGS = {
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

    const PATH_CONFIG = {
      count: 5,
      angleStep: Math.PI * 0.4,
      length: 13,
      width: 2.5,
      centerRadius: 6.5
    };

    const WANDERING_NPCS = [
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

    const MUSIC_TRACKS = [
      { title: "Cloud Kingdom Café Part I", file: "Cloud Kingdom Café Part I.mp3" },
      { title: "Cloud Kingdom Café Part II", file: "Cloud Kingdom Café Part II.mp3" },
      { title: "Castle in the Clouds", file: "Castle in the Clouds.mp3" }
    ];

    // Game state
    const gameState = {
      started: false,
      dialogOpen: false,
      timeScale: 1,
      firstSweetShown: false,
      visited: new Set(),
      collected: 0,
      currentLocation: 'palace',
      nearNPC: null,
      nearWanderer: null,
      completionShown: false,
      capeUnlocked: false,
      bernieListenersActive: false,
      bernieListenersLeaving: false
    };

    // Three.js objects
    let scene, camera, renderer, player;
    const buildings = {};
    const npcs = {};
    const wanderers = [];
    const collectibles = [];
    const clouds = [];
    const bees = [];
    const insects = [];
    const bernieListeners = [];
    const corgis = [];
    const collisionBoxes = [];
    const waterfallSheets = [];
    const celebrationParticles = [];
    const grassTuftData = [];
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.75 });
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide
    });
    let particleTexture;
    let lastCelebrationTime = 0;
    const CELEBRATION_COOLDOWN = 250;
    const BOOST_DURATION = 1500;
    const BASE_PLAYER_SPEED = 6;
    const BOOST_PLAYER_SPEED = 12;
    const clock = new THREE.Clock();
    const joystickInput = { x: 0, y: 0 };
    const keyboardInput = { x: 0, y: 0 };
    const keyboardState = { up: false, down: false, left: false, right: false };
    let desktopModeEnabled = false;
    const cameraTarget = new THREE.Vector3();
    const moveDirection = new THREE.Vector3();
    const cameraZoomState = {
      currentOffset: 12,
      targetOffset: 12,
      baseOffset: 12,
      zoomedOutOffset: 15,
      zoomOutDelay: 0.35,
      zoomInDelay: 0.6,
      lastMoveChange: 0,
      moving: false
    };
    const musicAudio = new Audio();
    const musicState = {
      currentIndex: 0,
      muted: false,
      initialized: false
    };
    const waterPulse = {
      baseOpacity: waterMaterial.opacity,
      amplitude: 0.06,
      speed: 2.1
    };
    const CAPE_CONFIG = {
      width: 0.9,
      height: 1.15,
      widthSegments: 5,
      heightSegments: 8,
      stiffness: 18,
      dampingMoving: 0.86,
      dampingIdle: 0.76,
      maxStretch: 1.4
    };
    let corgiFurMaterial;
    let corgiAccentMaterial;
    const npcTextureCache = new Map();
    const npcMaterialCache = new Map();
    const npcGeometries = {
      body: new THREE.CylinderGeometry(0.3, 0.35, 0.6, 16),
      bodice: new THREE.CylinderGeometry(0.32, 0.4, 0.45, 16),
      head: new THREE.SphereGeometry(0.38, 18, 16),
      hair: new THREE.SphereGeometry(0.4, 16, 12),
      hairBun: new THREE.SphereGeometry(0.16, 12, 10),
      indicator: new THREE.SphereGeometry(0.22, 12, 12),
      skirt: new THREE.ConeGeometry(0.75, 1.4, 12, 1, true),
      skirtLayer: new THREE.ConeGeometry(0.7, 0.5, 12, 1, true),
      waistRuffle: new THREE.TorusGeometry(0.35, 0.06, 8, 18),
      sleeve: new THREE.SphereGeometry(0.18, 12, 10),
      cuff: new THREE.TorusGeometry(0.12, 0.03, 6, 12),
      brooch: new THREE.SphereGeometry(0.06, 8, 8),
      broochRibbon: new THREE.ConeGeometry(0.035, 0.12, 5),
      collar: new THREE.TorusGeometry(0.19, 0.035, 6, 10),
      necklace: new THREE.TorusGeometry(0.14, 0.02, 6, 12),
      hemLayer: new THREE.TorusGeometry(0.62, 0.03, 6, 18),
      tiara: new THREE.CylinderGeometry(0.18, 0.22, 0.08, 6),
      jewel: new THREE.SphereGeometry(0.04, 8, 8),
      apron: new THREE.ConeGeometry(0.42, 0.85, 8, 1, true),
      bow: new THREE.TorusGeometry(0.12, 0.03, 6, 12),
      wandererBody: new THREE.SphereGeometry(0.35, 12, 12),
      wandererHead: new THREE.SphereGeometry(0.3, 12, 12),
      wandererSkirtLayer: new THREE.ConeGeometry(0.45, 0.28, 8, 1, true),
      wandererBrooch: new THREE.SphereGeometry(0.045, 6, 6),
      wandererCollar: new THREE.TorusGeometry(0.14, 0.03, 6, 8),
      wandererLeg: new THREE.CylinderGeometry(0.08, 0.06, 0.2, 6),
      wandererHem: new THREE.TorusGeometry(0.38, 0.02, 6, 12),
      wandererSweat: new THREE.SphereGeometry(0.05, 6, 6),
      wandererCane: new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6),
      wandererGlasses: new THREE.TorusGeometry(0.08, 0.015, 8, 16)
    };
    const npcSkinMaterial = new THREE.MeshStandardMaterial({ color: 0xffeedd });
    const capeTempVec = new THREE.Vector3();
    const capeTempVec2 = new THREE.Vector3();
    const capeTempVec3 = new THREE.Vector3();
    const capeTempVec4 = new THREE.Vector3();
    const capeTempVec5 = new THREE.Vector3();
    const capeTempVec6 = new THREE.Vector3();
    const capeTempQuat = new THREE.Quaternion();
    const grassTuftDummy = new THREE.Object3D();
    let grassTufts;

    function loadTrack(index) {
      const track = MUSIC_TRACKS[index];
      if (!track) return;
      musicAudio.src = encodeURI(track.file);
      updateMusicUI();
    }

    function playCurrentTrack() {
      if (!musicAudio.src) {
        loadTrack(musicState.currentIndex);
      }
      musicAudio.play().catch(() => {});
    }

    function playNextTrack() {
      musicState.currentIndex = (musicState.currentIndex + 1) % MUSIC_TRACKS.length;
      loadTrack(musicState.currentIndex);
      playCurrentTrack();
    }

    function toggleMusicMute() {
      musicAudio.muted = !musicAudio.muted;
      updateMusicUI();
    }

    // Initialize game
    function init() {
      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x87ceeb);
      scene.fog = new THREE.FogExp2(0xc8e8ff, 0.008);

      // Camera
      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 14, 18);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.getElementById('game-container').appendChild(renderer.domElement);
      particleTexture = createParticleTexture();

      // Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      
      const sun = new THREE.DirectionalLight(0xfff8e7, 0.6);
      sun.position.set(15, 25, 15);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 80;
      sun.shadow.camera.left = -35;
      sun.shadow.camera.right = 35;
      sun.shadow.camera.top = 35;
      sun.shadow.camera.bottom = -35;
      sun.shadow.radius = 4;
      scene.add(sun);
      
      scene.add(new THREE.HemisphereLight(0x87ceeb, 0x98fb98, 0.3));

      // Build world
      createWorld();
      
      // Update collectible count
      setCollectibleTotal(collectibles.length);

      // Event listeners
      window.addEventListener('resize', onResize);
      setupControls();

      musicAudio.volume = 0.5;
      musicAudio.addEventListener('ended', playNextTrack);
      loadTrack(musicState.currentIndex);
      updateMusicUI();

      // Start render loop
      animate();
    }

    function createWorld() {
      // Ground
      const groundGeo = new THREE.CircleGeometry(55, 64);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x90d860, roughness: 0.8 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Paths
      const pathMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.9 });
      for (let i = 0; i < PATH_CONFIG.count; i++) {
        const angle = PATH_CONFIG.angleStep * i;
        const path = new THREE.Mesh(
          new THREE.PlaneGeometry(PATH_CONFIG.width, PATH_CONFIG.length),
          pathMat
        );
        path.rotation.x = -Math.PI / 2;
        path.rotation.z = -angle;
        path.position.set(
          Math.sin(angle) * PATH_CONFIG.centerRadius,
          0.02,
          Math.cos(angle) * PATH_CONFIG.centerRadius
        );
        path.receiveShadow = true;
        scene.add(path);
      }

      // Plaza
      const plaza = new THREE.Mesh(
        new THREE.CircleGeometry(5, 32),
        new THREE.MeshStandardMaterial({ color: 0xffd4a8, roughness: 0.7 })
      );
      plaza.rotation.x = -Math.PI / 2;
      plaza.position.y = 0.03;
      plaza.receiveShadow = true;
      scene.add(plaza);

      // Fountain
      createFountain();

      // Player
      createPlayer();

      // Buildings and NPCs
      LOCATIONS.forEach((loc, index) => {
        const building = createBuilding(loc.color, loc.id);
        building.position.set(loc.x, 0, loc.z);
        building.userData = { id: loc.id, icon: loc.icon, name: loc.name };
        scene.add(building);
        buildings[loc.id] = building;

        // Add collision box
        collisionBoxes.push({
          minX: loc.x - loc.sx / 2 - 0.5,
          maxX: loc.x + loc.sx / 2 + 0.5,
          minZ: loc.z - loc.sz / 2 - 0.5,
          maxZ: loc.z + loc.sz / 2 + 0.5
        });

        // Create NPC in front of building
        const npc = createNPC(loc.id);
        npc.position.set(loc.x, 0, loc.z + 4);
        npc.userData = { locationId: loc.id };
        scene.add(npc);
        npcs[loc.id] = npc;
      });

      // Wandering NPCs with varied speeds
      WANDERING_NPCS.forEach((data, i) => {
        const angle = (i / WANDERING_NPCS.length) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 10 + Math.random() * 15;
        const npc = createWanderingNPC(data.speed);
        npc.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        
        // Set speed based on type
        let walkSpeed;
        if (data.speed === 'fast') {
          walkSpeed = 2.5 + Math.random() * 1.5; // Very fast!
        } else if (data.speed === 'slow') {
          walkSpeed = 0.15 + Math.random() * 0.1; // Very slow
        } else {
          walkSpeed = 0.5 + Math.random() * 0.5; // Normal
        }
        
        npc.userData = {
          ...data,
          walkAngle: Math.random() * Math.PI * 2,
          walkSpeed: walkSpeed,
          timer: Math.random() * 5,
          lastQuote: Date.now() - Math.random() * 3000, // Stagger initial quotes
          chatOffset: Math.random() * 4000, // Random offset for chat cooldown
          lastVoice: Date.now() - Math.random() * 10000,
          nextVoiceTime: Date.now() + AMBIENT_VOICE_MIN_DELAY +
            Math.random() * (AMBIENT_VOICE_MAX_DELAY - AMBIENT_VOICE_MIN_DELAY)
        };
        scene.add(npc);
        wanderers.push(npc);
      });

      // Create listeners for Princess Bernie (around speakers area)
      createBernieListeners();

      // Create bees and honey around palace
      createBeesAndHoney();

      // Corgis
      let corgisPlaced = 0;
      let corgiAttempts = 0;
      while (corgisPlaced < 5 && corgiAttempts < 120) {
        corgiAttempts++;
        const angle = Math.random() * Math.PI * 2;
        const radius = 18 + Math.random() * 24;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        if (!isSafeOffPathPlacement(x, z)) continue;

        const corgi = createCorgi();
        corgi.position.set(x, 0, z);
        corgi.rotation.y = Math.random() * Math.PI * 2;
        corgi.userData.walkAngle = corgi.rotation.y;
        corgi.userData.baseY = corgi.position.y;
        scene.add(corgi);
        corgis.push(corgi);
        corgisPlaced++;
      }

      // Collectibles
      for (let i = 0; i < 25; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Skip if too close to a building
        const tooClose = collisionBoxes.some(b => 
          x > b.minX - 2 && x < b.maxX + 2 && z > b.minZ - 2 && z < b.maxZ + 2
        );
        if (tooClose) continue;

        const collectible = createCollectible();
        collectible.position.set(x, 0.5, z);
        collectible.userData = { collected: false, floatOffset: Math.random() * Math.PI * 2 };
        scene.add(collectible);
        collectibles.push(collectible);
      }

      // Decorations
      createDecorations();
    }

    function createFountain() {
      // Small collision for fountain
      collisionBoxes.push({ minX: -1.5, maxX: 1.5, minZ: -1.5, maxZ: 1.5 });

      const fountain = new THREE.Group();
      
      // Base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.5, 16), stoneMaterial);
      base.position.y = 0.25;
      base.castShadow = true;
      fountain.add(base);

      // Water
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 0.3, 16),
        waterMaterial
      );
      water.position.y = 0.65;
      fountain.add(water);

      // Pillar
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.5, 8), stoneMaterial);
      pillar.position.y = 1.25;
      pillar.castShadow = true;
      fountain.add(pillar);

      // Crown on top
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.2 });
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.2, 6), crownMat);
      crownBase.position.y = 2.2;
      fountain.add(crownBase);

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const point = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 4), crownMat);
        point.position.set(Math.cos(a) * 0.25, 2.4, Math.sin(a) * 0.25);
        fountain.add(point);
      }

      scene.add(fountain);
    }

    function createCape() {
      const { width, height, widthSegments, heightSegments } = CAPE_CONFIG;
      const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
      geometry.translate(0, -height / 2, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff8fbf,
        roughness: 0.55,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const cape = new THREE.Mesh(geometry, material);
      cape.position.set(0, 1.38, -0.35);
      cape.rotation.x = 0.08;
      cape.castShadow = true;
      cape.receiveShadow = true;

      const rows = heightSegments + 1;
      const points = [];
      const velocities = [];
      const restLength = height / heightSegments;
      for (let i = 0; i < rows; i++) {
        points.push(new THREE.Vector3(0, -i * restLength, 0));
        velocities.push(new THREE.Vector3());
      }

      cape.userData.cape = {
        geometry,
        points,
        velocities,
        restLength,
        rows,
        cols: widthSegments + 1
      };
      return cape;
    }

    function updateCape(delta, time, isMoving, moveDir) {
      if (!player || !player.userData.cape) return;
      const capeData = player.userData.cape;
      const { geometry, points, velocities, restLength, rows, cols } = capeData;
      const heightSegments = CAPE_CONFIG.heightSegments;
      const width = CAPE_CONFIG.width;
      const windStrength = isMoving ? 1 : 0;
      const flutterStrength = isMoving ? 0.25 : 0.08;
      const damping = isMoving ? CAPE_CONFIG.dampingMoving : CAPE_CONFIG.dampingIdle;

      points[0].set(0, 0, 0);

      capeTempVec.copy(moveDir).multiplyScalar(-1.6 * windStrength);
      capeTempVec.y += 0.35 * windStrength;
      capeTempQuat.copy(player.quaternion).invert();
      capeTempVec2.copy(capeTempVec).applyQuaternion(capeTempQuat);

      for (let i = 1; i < rows; i++) {
        const point = points[i];
        const velocity = velocities[i];
        const prev = points[i - 1];

        capeTempVec3.copy(point).sub(prev);
        const distance = Math.max(capeTempVec3.length(), 0.0001);
        capeTempVec3.normalize();

        const springForce = capeTempVec3.multiplyScalar((distance - restLength) * -CAPE_CONFIG.stiffness);
        const gravity = capeTempVec4.set(0, -0.8, 0);
        const flutter = capeTempVec5.set(
          Math.sin(time * 3 + i) * 0.15,
          0,
          Math.cos(time * 2 + i * 0.7) * 0.12
        ).multiplyScalar(flutterStrength);

        velocity.add(springForce.add(gravity).add(capeTempVec2).add(flutter).multiplyScalar(delta));
        velocity.multiplyScalar(damping);
        point.addScaledVector(velocity, delta);

        capeTempVec6.copy(point).sub(prev);
        const maxStretch = restLength * CAPE_CONFIG.maxStretch;
        if (capeTempVec6.length() > maxStretch) {
          capeTempVec6.normalize().multiplyScalar(maxStretch);
          point.copy(prev).add(capeTempVec6);
        }
      }

      const positions = geometry.attributes.position;
      for (let row = 0; row <= heightSegments; row++) {
        const rowPoint = points[row];
        const drape = row / heightSegments;
        for (let col = 0; col < cols; col++) {
          const index = (row * cols + col) * 3;
          const x = (col / (cols - 1) - 0.5) * width;
          positions.array[index] = x;
          positions.array[index + 1] = rowPoint.y;
          positions.array[index + 2] = rowPoint.z - drape * 0.12 + Math.abs(x) * 0.08 * drape;
        }
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    function createPlayer() {
      const group = new THREE.Group();
      
      const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffd1e1 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 });

      // Body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), pinkMat);
      body.scale.set(1, 1.2, 0.9);
      body.position.y = 0.6;
      body.castShadow = true;
      group.add(body);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), skinMat);
      head.position.y = 1.3;
      head.castShadow = true;
      group.add(head);

      // Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), darkMat);
      eyeL.position.set(-0.15, 1.35, 0.38);
      group.add(eyeL);
      
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), darkMat);
      eyeR.position.set(0.15, 1.35, 0.38);
      group.add(eyeR);

      // Blush
      const blushMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.6 });
      const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), blushMat);
      blushL.position.set(-0.3, 1.22, 0.42);
      blushL.rotation.y = 0.3;
      group.add(blushL);
      
      const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), blushMat);
      blushR.position.set(0.3, 1.22, 0.42);
      blushR.rotation.y = -0.3;
      group.add(blushR);

      // Crown
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.15, 6), goldMat);
      crownBase.position.y = 1.72;
      group.add(crownBase);

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const point = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), goldMat);
        point.position.set(Math.cos(a) * 0.2, 1.89, Math.sin(a) * 0.2);
        group.add(point);
      }

      // Legs
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8), pinkMat);
      legL.position.set(-0.2, 0.15, 0);
      legL.castShadow = true;
      group.add(legL);
      
      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 8), pinkMat);
      legR.position.set(0.2, 0.15, 0);
      legR.castShadow = true;
      group.add(legR);

      // Shoes
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
      const shoeL = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), shoeMat);
      shoeL.scale.set(1.2, 0.8, 1.5);
      shoeL.position.set(-0.2, 0.06, 0.05);
      shoeL.castShadow = true;
      group.add(shoeL);
      
      const shoeR = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), shoeMat);
      shoeR.scale.set(1.2, 0.8, 1.5);
      shoeR.position.set(0.2, 0.06, 0.05);
      shoeR.castShadow = true;
      group.add(shoeR);

      player = group;
      player.position.set(0, 0, 5); // Start outside fountain
      player.userData.baseY = 0;
      player.userData.boostEndTime = 0;
      scene.add(player);
    }

    function createParticleTexture() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    }

    function spawnCelebrationBurst() {
      const now = performance.now();
      if (now - lastCelebrationTime < CELEBRATION_COOLDOWN) return;
      lastCelebrationTime = now;

      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion);
      const spawnPos = player.position.clone()
        .add(forward.multiplyScalar(-0.9))
        .add(new THREE.Vector3(0, 0.9, 0));

      const palette = [
        new THREE.Color(0xffd700),
        new THREE.Color(0xffb6c1),
        new THREE.Color(0xff9ad5),
        new THREE.Color(0xaee8ff),
        new THREE.Color(0xfad5a5),
        new THREE.Color(0xe3b6ff)
      ];

      spawnSparkles(spawnPos, palette);
      spawnFireworks(spawnPos, palette);
      spawnConfetti(spawnPos, palette);
      spawnSmoke(spawnPos, palette);
    }

    function createParticleSprite(color, opacity = 1) {
      const material = new THREE.SpriteMaterial({
        map: particleTexture,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(material);
      scene.add(sprite);
      return sprite;
    }

    function addParticle({ position, velocity, life, size, color, opacity, rotationSpeed, fade, gravity }) {
      const sprite = createParticleSprite(color, opacity);
      sprite.position.copy(position);
      sprite.scale.set(size, size, size);
      celebrationParticles.push({
        sprite,
        velocity,
        life,
        maxLife: life,
        rotationSpeed,
        fade,
        gravity
      });
    }

    function spawnSparkles(origin, palette) {
      for (let i = 0; i < 20; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2,
          (Math.random() - 0.5) * 2
        );
        addParticle({
          position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.2) * 0.4, (Math.random() - 0.5) * 0.4)),
          velocity,
          life: 0.6 + Math.random() * 0.4,
          size: 0.25 + Math.random() * 0.2,
          color,
          opacity: 0.9,
          rotationSpeed: (Math.random() - 0.5) * 6,
          fade: 1.2,
          gravity: -2
        });
      }
    }

    function spawnFireworks(origin, palette) {
      for (let i = 0; i < 12; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const angle = (i / 12) * Math.PI * 2;
        const velocity = new THREE.Vector3(Math.cos(angle) * 2, 2.5 + Math.random(), Math.sin(angle) * 2);
        addParticle({
          position: origin.clone(),
          velocity,
          life: 0.9 + Math.random() * 0.4,
          size: 0.35 + Math.random() * 0.25,
          color,
          opacity: 0.95,
          rotationSpeed: (Math.random() - 0.5) * 3,
          fade: 1.4,
          gravity: -3
        });
      }
    }

    function spawnConfetti(origin, palette) {
      for (let i = 0; i < 18; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          1.2 + Math.random() * 0.8,
          (Math.random() - 0.5) * 1.5
        );
        addParticle({
          position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.6, (Math.random() - 0.5) * 0.6)),
          velocity,
          life: 1.2 + Math.random() * 0.6,
          size: 0.3 + Math.random() * 0.2,
          color,
          opacity: 0.85,
          rotationSpeed: (Math.random() - 0.5) * 8,
          fade: 0.9,
          gravity: -1.2
        });
      }
    }

    function spawnSmoke(origin, palette) {
      for (let i = 0; i < 8; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)].clone().lerp(new THREE.Color(0xffffff), 0.4);
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          0.6 + Math.random() * 0.6,
          (Math.random() - 0.5) * 0.6
        );
        addParticle({
          position: origin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, Math.random() * 0.5, (Math.random() - 0.5) * 0.4)),
          velocity,
          life: 1.3 + Math.random() * 0.6,
          size: 0.6 + Math.random() * 0.4,
          color,
          opacity: 0.5,
          rotationSpeed: (Math.random() - 0.5) * 2,
          fade: 0.7,
          gravity: -0.6
        });
      }
    }

    function updateCelebrationParticles(delta) {
      for (let i = celebrationParticles.length - 1; i >= 0; i--) {
        const particle = celebrationParticles[i];
        particle.velocity.y += particle.gravity * delta;
        particle.sprite.position.addScaledVector(particle.velocity, delta);
        particle.sprite.material.opacity = Math.max(0, particle.sprite.material.opacity - delta * particle.fade);
        particle.sprite.material.rotation += particle.rotationSpeed * delta;
        particle.life -= delta;
        if (particle.life <= 0) {
          scene.remove(particle.sprite);
          particle.sprite.material.dispose();
          celebrationParticles.splice(i, 1);
        }
      }
    }

    function getPlayerSpeed(now) {
      if (now < player.userData.boostEndTime) {
        return BOOST_PLAYER_SPEED;
      }
      return BASE_PLAYER_SPEED;
    }

    function createBuilding(color, type) {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color });
      const roofColor = new THREE.Color(color).multiplyScalar(0.8).getHex();
      const roofMat = new THREE.MeshStandardMaterial({ color: roofColor });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

      if (type === 'palace') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), mat);
        base.position.y = 1.5;
        base.castShadow = true;
        group.add(base);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.5, 4), roofMat);
        roof.position.y = 3.75;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        [-1.8, 1.8].forEach(x => {
          const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 4.5, 8), mat);
          tower.position.set(x, 2.25, -1.3);
          tower.castShadow = true;
          group.add(tower);

          const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 8), roofMat);
          towerRoof.position.set(x, 5.15, -1.3);
          towerRoof.castShadow = true;
          group.add(towerRoof);
        });
      } else if (type === 'teashop') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 2.8), mat);
        base.position.y = 1.1;
        base.castShadow = true;
        group.add(base);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), roofMat);
        roof.position.y = 2.8;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);

        const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), whiteMat);
        teapot.position.y = 3.7;
        group.add(teapot);
      } else if (type === 'speakers') {
        const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.35, 8), whiteMat);
        stage.position.y = 0.175;
        stage.castShadow = true;
        group.add(stage);

        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.8, 8), whiteMat);
          pillar.position.set(Math.cos(a) * 1.9, 1.75, Math.sin(a) * 1.9);
          pillar.castShadow = true;
          group.add(pillar);
        }

        const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dome.position.y = 3.15;
        dome.castShadow = true;
        group.add(dome);
      } else if (type === 'guests') {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 4, 8), mat);
        tower.position.y = 2;
        tower.castShadow = true;
        group.add(tower);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 1.6, 8), roofMat);
        roof.position.y = 5.4;
        roof.castShadow = true;
        group.add(roof);
      } else if (type === 'feast') {
        const base = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.2, 2.8), mat);
        base.position.y = 1.1;
        base.castShadow = true;
        group.add(base);

        const roofShape = new THREE.Shape();
        roofShape.moveTo(-2.3, 0);
        roofShape.lineTo(0, 1.4);
        roofShape.lineTo(2.3, 0);
        roofShape.closePath();
        const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 3.2, bevelEnabled: false });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, 2.2, -1.6);
        roof.castShadow = true;
        group.add(roof);
      }

      return group;
    }

    function createGownTexture(cacheKey, baseColor, accentColor, style) {
      if (npcTextureCache.has(cacheKey)) {
        return npcTextureCache.get(cacheKey);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const base = `#${baseColor.toString(16).padStart(6, '0')}`;
      const accent = `#${accentColor.toString(16).padStart(6, '0')}`;
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (style === 'polka') {
        ctx.fillStyle = accent;
        const radius = 5;
        for (let y = 8; y < 64; y += 16) {
          for (let x = 8; x < 64; x += 16) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (style === 'lace') {
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.5;
        for (let y = 6; y < 64; y += 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(64, y);
          ctx.stroke();
        }
        for (let x = 6; x < 64; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 64);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 64, 64);
        gradient.addColorStop(0, base);
        gradient.addColorStop(1, accent);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.35;
        for (let y = 0; y < 64; y += 12) {
          ctx.fillRect(0, y, 64, 5);
        }
        ctx.globalAlpha = 1;
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      npcTextureCache.set(cacheKey, texture);
      return texture;
    }

    function getNPCMaterials(paletteKey, palette, style) {
      if (npcMaterialCache.has(paletteKey)) {
        return npcMaterialCache.get(paletteKey);
      }

      const gownTexture = createGownTexture(
        `npc-${paletteKey}`,
        palette.gown,
        palette.trim,
        style
      );
      const materials = {
        gownMat: new THREE.MeshStandardMaterial({ color: palette.gown, roughness: 0.65, map: gownTexture }),
        accentMat: new THREE.MeshStandardMaterial({ color: palette.accent, roughness: 0.4, metalness: 0.2 }),
        trimMat: new THREE.MeshStandardMaterial({ color: palette.trim, emissive: palette.trim, emissiveIntensity: 0.2 }),
        hairMat: new THREE.MeshStandardMaterial({ color: palette.hair, roughness: 0.8 })
      };
      npcMaterialCache.set(paletteKey, materials);
      return materials;
    }

    function getWanderingMaterials(paletteKey, bodyColor, trimColor, accentColor, style) {
      if (npcMaterialCache.has(paletteKey)) {
        return npcMaterialCache.get(paletteKey);
      }
      const gownTexture = createGownTexture(
        `wander-${paletteKey}`,
        bodyColor,
        trimColor,
        style
      );
      const materials = {
        bodyMat: new THREE.MeshStandardMaterial({ color: bodyColor, map: gownTexture }),
        trimMat: new THREE.MeshStandardMaterial({ color: trimColor }),
        accessoryMat: new THREE.MeshStandardMaterial({ color: accentColor })
      };
      npcMaterialCache.set(paletteKey, materials);
      return materials;
    }

    function createNPC(locationId) {
      const group = new THREE.Group();
      const palettes = {
        palace: { gown: 0xf7c2d9, accent: 0xffd700, trim: 0xfff2c9, hair: 0x7a4b2a },
        teashop: { gown: 0xbad9ff, accent: 0xfff2c9, trim: 0xffc1d9, hair: 0x5c3a21 },
        speakers: { gown: 0xd4b8ff, accent: 0xf7e8ff, trim: 0xffd1e1, hair: 0x4d2f2f },
        guests: { gown: 0xffd4a8, accent: 0xffc1d9, trim: 0xfff8f0, hair: 0x7a522b },
        feast: { gown: 0xb8e986, accent: 0xffd1e1, trim: 0xfff2c9, hair: 0x6a3b2a }
      };
      const palette = palettes[locationId] || palettes.palace;
      const gownStyle = locationId === 'palace' || locationId === 'guests' ? 'polka' : locationId === 'teashop' ? 'lace' : 'bands';
      const { gownMat, accentMat, trimMat, hairMat } = getNPCMaterials(locationId, palette, gownStyle);

      // Body core
      const body = new THREE.Mesh(npcGeometries.body, gownMat);
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);

      const bodice = new THREE.Mesh(npcGeometries.bodice, accentMat);
      bodice.position.y = 1.1;
      bodice.castShadow = true;
      group.add(bodice);

      // Head
      const head = new THREE.Mesh(npcGeometries.head, npcSkinMaterial);
      head.position.y = 1.75;
      head.castShadow = true;
      group.add(head);

      const hair = new THREE.Mesh(npcGeometries.hair, hairMat);
      hair.position.set(0, 1.78, -0.05);
      hair.scale.set(1, 0.9, 1);
      group.add(hair);

      const hairBun = new THREE.Mesh(npcGeometries.hairBun, hairMat);
      hairBun.position.set(0, 1.98, -0.2);
      group.add(hairBun);

      // Indicator
      const indicator = new THREE.Mesh(
        npcGeometries.indicator,
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 })
      );
      indicator.position.y = 2.5;
      indicator.userData.isIndicator = true;
      group.add(indicator);

      // Main gown
      const skirt = new THREE.Mesh(npcGeometries.skirt, gownMat);
      skirt.position.y = 0.6;
      skirt.rotation.x = Math.PI;
      skirt.castShadow = true;
      group.add(skirt);

      const skirtLayer = new THREE.Mesh(npcGeometries.skirtLayer, trimMat);
      skirtLayer.position.y = 0.28;
      skirtLayer.rotation.x = Math.PI;
      group.add(skirtLayer);

      const waistRuffle = new THREE.Mesh(npcGeometries.waistRuffle, trimMat);
      waistRuffle.position.y = 0.9;
      waistRuffle.rotation.x = Math.PI / 2;
      group.add(waistRuffle);

      const hemLayer = new THREE.Mesh(npcGeometries.hemLayer, trimMat);
      hemLayer.position.y = 0.04;
      hemLayer.rotation.x = Math.PI / 2;
      group.add(hemLayer);

      // Puff sleeves
      const sleeveL = new THREE.Mesh(npcGeometries.sleeve, accentMat);
      sleeveL.position.set(-0.42, 1.25, 0.05);
      group.add(sleeveL);

      const sleeveR = new THREE.Mesh(npcGeometries.sleeve, accentMat);
      sleeveR.position.set(0.42, 1.25, 0.05);
      group.add(sleeveR);

      const cuffL = new THREE.Mesh(npcGeometries.cuff, trimMat);
      cuffL.position.set(-0.42, 1.05, 0.15);
      cuffL.rotation.x = Math.PI / 2;
      group.add(cuffL);

      const cuffR = new THREE.Mesh(npcGeometries.cuff, trimMat);
      cuffR.position.set(0.42, 1.05, 0.15);
      cuffR.rotation.x = Math.PI / 2;
      group.add(cuffR);

      // Accessories: brooches and collar
      const broochLeft = new THREE.Mesh(npcGeometries.brooch, accentMat);
      broochLeft.position.set(-0.14, 1.22, 0.34);
      group.add(broochLeft);

      const broochRight = new THREE.Mesh(npcGeometries.brooch, accentMat);
      broochRight.position.set(0.14, 1.22, 0.34);
      group.add(broochRight);

      const collar = new THREE.Mesh(npcGeometries.collar, trimMat);
      collar.position.y = 1.38;
      collar.rotation.x = Math.PI / 2;
      group.add(collar);

      const necklace = new THREE.Mesh(npcGeometries.necklace, accentMat);
      necklace.position.y = 1.47;
      necklace.rotation.x = Math.PI / 2;
      group.add(necklace);

      const ribbonLeft = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
      ribbonLeft.position.set(-0.14, 1.12, 0.33);
      ribbonLeft.rotation.x = Math.PI;
      group.add(ribbonLeft);

      const ribbonRight = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
      ribbonRight.position.set(0.14, 1.12, 0.33);
      ribbonRight.rotation.x = Math.PI;
      group.add(ribbonRight);

      if (locationId === 'palace') {
        const tiara = new THREE.Mesh(npcGeometries.tiara, accentMat);
        tiara.position.y = 2.05;
        group.add(tiara);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const jewel = new THREE.Mesh(npcGeometries.jewel, trimMat);
          jewel.position.set(Math.cos(a) * 0.16, 2.12, Math.sin(a) * 0.16);
          group.add(jewel);
        }
      }

      if (locationId === 'feast') {
        const apron = new THREE.Mesh(npcGeometries.apron, trimMat);
        apron.position.y = 0.65;
        apron.rotation.x = Math.PI;
        group.add(apron);

        const bow = new THREE.Mesh(npcGeometries.bow, accentMat);
        bow.position.set(0, 0.95, 0.35);
        bow.rotation.x = Math.PI / 2;
        group.add(bow);
      }

      return group;
    }

    function createWanderingNPC(speedType) {
      const group = new THREE.Group();
      
      // Different colors based on speed type
      let bodyColors;
      let trimColors;
      if (speedType === 'fast') {
        bodyColors = [0xff6b6b, 0xff8c42, 0xffdd59, 0xff6b9d]; // Energetic warm colors
        trimColors = [0xfff1a8, 0xffc857];
      } else if (speedType === 'slow') {
        bodyColors = [0xc9b8a8, 0xa8a8c9, 0xb8c9a8, 0xd4c4b0]; // Muted elderly colors
        trimColors = [0xe6d6c0, 0xcbbfa6];
      } else {
        bodyColors = [0xffc0cb, 0xadd8e6, 0x98fb98, 0xdda0dd, 0xf0e68c, 0xffa07a];
        trimColors = [0xf7e8ff, 0xfff2c9];
      }
      
      const bodyColor = bodyColors[Math.floor(Math.random() * bodyColors.length)];
      const trimColor = trimColors[Math.floor(Math.random() * trimColors.length)];
      const accessoryColor = trimColors[Math.floor(Math.random() * trimColors.length)];
      const paletteKey = `wanderer-${speedType}-${bodyColor.toString(16)}-${trimColor.toString(16)}-${accessoryColor.toString(16)}`;
      const gownStyle = speedType === 'fast' ? 'bands' : speedType === 'slow' ? 'lace' : 'polka';
      const { bodyMat, trimMat, accessoryMat } = getWanderingMaterials(paletteKey, bodyColor, trimColor, accessoryColor, gownStyle);

      // Body - slightly hunched for elderly
      const body = new THREE.Mesh(npcGeometries.wandererBody, bodyMat);
      body.scale.set(1, speedType === 'slow' ? 1.1 : 1.3, 1);
      body.position.y = 0.55;
      body.castShadow = true;
      group.add(body);

      // Head
      const head = new THREE.Mesh(npcGeometries.wandererHead, npcSkinMaterial);
      head.position.y = speedType === 'slow' ? 1.0 : 1.1;
      head.castShadow = true;
      group.add(head);

      // Second skirt layer with trim
      const skirtLayer = new THREE.Mesh(npcGeometries.wandererSkirtLayer, trimMat);
      skirtLayer.position.y = 0.33;
      skirtLayer.rotation.x = Math.PI;
      group.add(skirtLayer);

      const hemLayer = new THREE.Mesh(npcGeometries.wandererHem, accessoryMat);
      hemLayer.position.y = 0.18;
      hemLayer.rotation.x = Math.PI / 2;
      group.add(hemLayer);

      // Accessories: brooch and collar
      const brooch = new THREE.Mesh(npcGeometries.wandererBrooch, accessoryMat);
      brooch.position.set(0, 0.8, 0.32);
      group.add(brooch);

      const collar = new THREE.Mesh(npcGeometries.wandererCollar, accessoryMat);
      collar.position.y = 0.95;
      collar.rotation.x = Math.PI / 2;
      group.add(collar);

      const ribbon = new THREE.Mesh(npcGeometries.broochRibbon, trimMat);
      ribbon.position.set(0, 0.72, 0.31);
      ribbon.rotation.x = Math.PI;
      group.add(ribbon);

      // Legs
      const legL = new THREE.Mesh(npcGeometries.wandererLeg, bodyMat);
      legL.position.set(-0.15, 0.1, 0);
      group.add(legL);

      const legR = new THREE.Mesh(npcGeometries.wandererLeg, bodyMat);
      legR.position.set(0.15, 0.1, 0);
      group.add(legR);

      // Add accessories based on type
      if (speedType === 'fast') {
        // Sweat drops or motion lines effect (small spheres)
        const sweatMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
        const sweat = new THREE.Mesh(npcGeometries.wandererSweat, sweatMat);
        sweat.position.set(-0.35, 1.15, 0);
        group.add(sweat);
      } else if (speedType === 'slow') {
        // Walking cane
        const caneMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const cane = new THREE.Mesh(npcGeometries.wandererCane, caneMat);
        cane.position.set(0.35, 0.4, 0);
        cane.rotation.z = 0.2;
        group.add(cane);
        
        // Glasses
        const glassesMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const glasses = new THREE.Mesh(npcGeometries.wandererGlasses, glassesMat);
        glasses.position.set(0, 1.05, 0.28);
        glasses.rotation.x = Math.PI / 2;
        group.add(glasses);
      }

      return group;
    }

    function createCorgi(speedType = (Math.random() < 0.35 ? 'run' : 'walk')) {
      if (!corgiFurMaterial) {
        corgiFurMaterial = new THREE.MeshStandardMaterial({ color: 0xd49a6a });
      }
      if (!corgiAccentMaterial) {
        corgiAccentMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a3c });
      }

      const corgi = new THREE.Group();

      const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.55, 0.8), corgiFurMaterial);
      body.position.y = 0.6;
      body.castShadow = true;
      corgi.add(body);

      const chest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.65), corgiFurMaterial);
      chest.position.set(0.65, 0.6, 0);
      chest.castShadow = true;
      corgi.add(chest);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), corgiFurMaterial);
      head.position.set(1.05, 0.9, 0);
      head.castShadow = true;
      corgi.add(head);

      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.26), corgiAccentMaterial);
      snout.position.set(1.35, 0.78, 0);
      snout.castShadow = true;
      corgi.add(snout);

      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2b1b15 }));
      nose.position.set(1.5, 0.78, 0);
      corgi.add(nose);

      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), corgiAccentMaterial);
      earL.position.set(0.95, 1.16, 0.18);
      earL.rotation.z = -0.3;
      corgi.add(earL);

      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 8), corgiAccentMaterial);
      earR.position.set(0.95, 1.16, -0.18);
      earR.rotation.z = -0.3;
      corgi.add(earR);

      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), corgiFurMaterial);
      hip.position.set(-0.65, 0.55, 0);
      hip.castShadow = true;
      corgi.add(hip);

      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.35, 8), corgiAccentMaterial);
      tail.position.set(-1.05, 0.78, 0);
      tail.rotation.z = 1.1;
      corgi.add(tail);

      const legGeo = new THREE.BoxGeometry(0.18, 0.4, 0.18);
      const legs = [];
      const pawGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const legPositions = [
        { x: 0.65, z: 0.25, phase: 0 },
        { x: 0.65, z: -0.25, phase: Math.PI },
        { x: -0.5, z: 0.25, phase: Math.PI },
        { x: -0.5, z: -0.25, phase: 0 }
      ];

      legPositions.forEach(({ x, z, phase }) => {
        const legGroup = new THREE.Group();
        const leg = new THREE.Mesh(legGeo, corgiFurMaterial);
        leg.position.y = -0.2;
        legGroup.add(leg);
        const paw = new THREE.Mesh(pawGeo, corgiAccentMaterial);
        paw.position.y = -0.4;
        legGroup.add(paw);
        legGroup.position.set(x, 0.4, z);
        legGroup.userData.phase = phase;
        corgi.add(legGroup);
        legs.push(legGroup);
      });

      corgi.userData = {
        baseY: 0,
        bobOffset: Math.random() * Math.PI * 2,
        legs,
        tail,
        speedType,
        walkAngle: Math.random() * Math.PI * 2,
        walkSpeed: speedType === 'run' ? 1.4 + Math.random() * 0.6 : 0.4 + Math.random() * 0.4,
        strideSpeed: speedType === 'run' ? 10 + Math.random() * 3 : 5 + Math.random() * 2,
        strideAmplitude: speedType === 'run' ? 0.9 : 0.55,
        bobSpeed: speedType === 'run' ? 7 : 4,
        timer: 1 + Math.random() * 2
      };

      return corgi;
    }

    function createCollectible() {
      const group = new THREE.Group();
      const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6bd6, 0xffd700];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });

      const types = ['candy', 'crown', 'gem'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'candy') {
        const candy = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), mat);
        candy.scale.set(1.5, 1, 1);
        group.add(candy);
      } else if (type === 'crown') {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.15, 6), mat);
        group.add(base);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const point = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), mat);
          point.position.set(Math.cos(a) * 0.15, 0.12, Math.sin(a) * 0.15);
          group.add(point);
        }
      } else {
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), mat);
        group.add(gem);
      }

      return group;
    }

    function createBeesAndHoney() {
      // Get palace position
      const palacePos = LOCATIONS.find(l => l.id === 'palace');
      
      // Create honey puddles around palace
      const honeyMat = new THREE.MeshStandardMaterial({ 
        color: 0xffc61a, 
        roughness: 0.2, 
        metalness: 0.3,
        transparent: true,
        opacity: 0.85
      });
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
        const radius = 5 + Math.random() * 4;
        const honey = new THREE.Mesh(
          new THREE.CircleGeometry(0.4 + Math.random() * 0.4, 12),
          honeyMat
        );
        honey.rotation.x = -Math.PI / 2;
        honey.position.set(
          palacePos.x + Math.cos(angle) * radius,
          0.04,
          palacePos.z + Math.sin(angle) * radius
        );
        scene.add(honey);
      }
      
      // Create bees
      const beeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
      
      for (let i = 0; i < 6; i++) {
        const bee = new THREE.Group();
        
        // Body
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), beeMat);
        body.scale.set(1.5, 1, 1);
        bee.add(body);
        
        // Stripes
        for (let s = 0; s < 2; s++) {
          const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 12), stripeMat);
          stripe.position.x = -0.05 + s * 0.1;
          stripe.rotation.y = Math.PI / 2;
          bee.add(stripe);
        }
        
        // Wings
        const wingGeo = new THREE.SphereGeometry(0.08, 6, 6);
        wingGeo.scale(1, 0.3, 1.5);
        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(0, 0.08, 0.1);
        bee.add(wingL);
        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0, 0.08, -0.1);
        bee.add(wingR);
        
        // Position around palace
        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 4;
        bee.position.set(
          palacePos.x + Math.cos(angle) * radius,
          2 + Math.random() * 2,
          palacePos.z + Math.sin(angle) * radius
        );
        bee.userData = {
          baseY: bee.position.y,
          angle: angle,
          radius: radius,
          speed: 1 + Math.random() * 2,
          bobSpeed: 3 + Math.random() * 2,
          palaceX: palacePos.x,
          palaceZ: palacePos.z
        };
        
        scene.add(bee);
        bees.push(bee);
      }
    }

    function createWaterfallFeature() {
      const waterfall = new THREE.Group();
      const anchorX = 26;
      const anchorZ = -28;

      const base = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.4, 4.2), stoneMaterial);
      base.position.y = 1.2;
      base.castShadow = true;
      waterfall.add(base);

      const back = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3, 1.4), stoneMaterial);
      back.position.set(0, 2.2, -1.6);
      back.castShadow = true;
      waterfall.add(back);

      const lip = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 1.2), stoneMaterial);
      lip.position.set(0, 2.1, -0.2);
      lip.castShadow = true;
      waterfall.add(lip);

      const fall = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.3), waterMaterial);
      fall.position.set(0, 1.1, 1.4);
      waterfall.add(fall);

      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 16), waterMaterial);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(0, 0.08, 2.2);
      waterfall.add(pool);

      waterfall.position.set(anchorX, 0, anchorZ);
      scene.add(waterfall);

      return { x: anchorX, z: anchorZ };
    }

    function createIrrigationSystem(anchorX, anchorZ) {
      const trough = new THREE.Group();
      const troughLength = 6;
      const troughWidth = 1.6;
      const wallThickness = 0.2;
      const wallHeight = 0.55;

      const base = new THREE.Mesh(new THREE.BoxGeometry(troughLength, 0.25, troughWidth), stoneMaterial);
      base.position.y = 0.12;
      base.castShadow = true;
      trough.add(base);

      const sideGeo = new THREE.BoxGeometry(troughLength, wallHeight, wallThickness);
      const sideFront = new THREE.Mesh(sideGeo, stoneMaterial);
      sideFront.position.set(0, 0.4, troughWidth / 2 - wallThickness / 2);
      sideFront.castShadow = true;
      trough.add(sideFront);

      const sideBack = new THREE.Mesh(sideGeo, stoneMaterial);
      sideBack.position.set(0, 0.4, -troughWidth / 2 + wallThickness / 2);
      sideBack.castShadow = true;
      trough.add(sideBack);

      const endGeo = new THREE.BoxGeometry(wallThickness, wallHeight, troughWidth - 0.1);
      const endLeft = new THREE.Mesh(endGeo, stoneMaterial);
      endLeft.position.set(-troughLength / 2 + wallThickness / 2, 0.4, 0);
      endLeft.castShadow = true;
      trough.add(endLeft);

      const endRight = new THREE.Mesh(endGeo, stoneMaterial);
      endRight.position.set(troughLength / 2 - wallThickness / 2, 0.4, 0);
      endRight.castShadow = true;
      trough.add(endRight);

      const waterStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(troughLength - 0.4, troughWidth - 0.4),
        waterMaterial
      );
      waterStrip.rotation.x = -Math.PI / 2;
      waterStrip.position.y = 0.27;
      trough.add(waterStrip);

      const troughX = anchorX - 5.2;
      const troughZ = anchorZ + 3.2;
      trough.position.set(troughX, 0, troughZ);
      scene.add(trough);

      collisionBoxes.push({
        minX: troughX - troughLength / 2 - 0.2,
        maxX: troughX + troughLength / 2 + 0.2,
        minZ: troughZ - troughWidth / 2 - 0.2,
        maxZ: troughZ + troughWidth / 2 + 0.2
      });
    }

    function createBernieListeners() {
      // Get speakers position (Princess Bernie's location)
      const speakersPos = LOCATIONS.find(l => l.id === 'speakers');
      
      const listenerData = [
        { name: 'Eager Earl', quotes: ["Ooh, tell us more!", "This is SO inspiring!", "I'm taking notes!", "*claps enthusiastically*", "WOOO! Go Princess Bernie!"] },
        { name: 'Curious Carol', quotes: ["Fascinating!", "Wait, can you repeat that?", "My mind is BLOWN!", "I need to write this down!", "This changes EVERYTHING!"] },
        { name: 'Listener Larry', quotes: ["Mmhmm, mmhmm...", "*nods wisely*", "Profound!", "I totally get it now!", "This is better than my nap!"] },
        { name: 'Attentive Annie', quotes: ["*leans in*", "Go on...", "Yes, YES!", "Preach it!", "I'm learning so much!"] },
        { name: 'Nodding Ned', quotes: ["*nods*", "*nods faster*", "*nods so hard head falls off*", "Absolutely!", "Couldn't agree more!"] }
      ];
      
      // Create 5 listener NPCs that will gather around Bernie
      for (let i = 0; i < 5; i++) {
        const listener = createWanderingNPC('normal');
        
        // Start them scattered nearby
        const startAngle = Math.random() * Math.PI * 2;
        const startRadius = 15 + Math.random() * 10;
        listener.position.set(
          speakersPos.x + Math.cos(startAngle) * startRadius,
          0,
          speakersPos.z + Math.sin(startAngle) * startRadius
        );
        
        // Target position around Bernie (semi-circle in front)
        const targetAngle = (Math.PI * 0.3) + (i / 5) * (Math.PI * 0.4); // Arc in front
        const targetRadius = 5 + (i % 2) * 1.5;
        
        listener.userData = {
          ...listenerData[i],
          role: 'Audience Member',
          isListener: true,
          targetX: speakersPos.x + Math.cos(targetAngle) * targetRadius,
          targetZ: speakersPos.z + Math.sin(targetAngle) * targetRadius,
          wanderAngle: Math.random() * Math.PI * 2,
          state: 'wandering', // wandering, gathering, listening, leaving
          speed: 0.8,
          lastQuote: Date.now() - Math.random() * 3000,
          chatOffset: Math.random() * 4000,
          nextVoiceTime: Date.now() + AMBIENT_VOICE_MIN_DELAY +
            Math.random() * (AMBIENT_VOICE_MAX_DELAY - AMBIENT_VOICE_MIN_DELAY)
        };
        
        scene.add(listener);
        bernieListeners.push(listener);
      }
    }

    function createGrassTufts() {
      const tuftCount = 480;
      const tuftGeo = new THREE.ConeGeometry(0.08, 0.6, 5);
      const tuftMat = new THREE.MeshStandardMaterial({ color: 0x4fae5d, roughness: 0.9 });
      grassTufts = new THREE.InstancedMesh(tuftGeo, tuftMat, tuftCount);
      grassTufts.castShadow = false;
      grassTufts.receiveShadow = false;
      grassTufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      let placed = 0;
      let attempts = 0;
      while (placed < tuftCount && attempts < tuftCount * 8) {
        attempts++;
        const angle = Math.random() * Math.PI * 2;
        const radius = 16 + Math.random() * 30;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const nearPathBand = isNearPath(x, z, 4.2) && !isNearPath(x, z, 1.2);
        const isSafeOpenArea = isSafeOffPathPlacement(x, z);
        if (!(isSafeOpenArea || (nearPathBand && isClearOfBuildings(x, z, 2.5)))) {
          continue;
        }

        const scaleBase = 0.35 + Math.random() * 0.6;
        const scale = new THREE.Vector3(
          scaleBase * (0.8 + Math.random() * 0.4),
          scaleBase * (0.9 + Math.random() * 0.6),
          scaleBase * (0.8 + Math.random() * 0.4)
        );
        const rotationY = Math.random() * Math.PI * 2;
        const position = new THREE.Vector3(x, 0.02, z);
        grassTuftData.push({ position, rotationY, scale });

        grassTuftDummy.position.copy(position);
        grassTuftDummy.rotation.set(0, rotationY, 0);
        grassTuftDummy.scale.copy(scale);
        grassTuftDummy.updateMatrix();
        grassTufts.setMatrixAt(placed, grassTuftDummy.matrix);
        placed++;
      }

      grassTufts.count = placed;
      scene.add(grassTufts);
    }

    function createDecorations() {
      // Flowers
      const flowerColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db, 0x00ced1];
      for (let i = 0; i < 80; i++) {
        const flower = createFlower(flowerColors[Math.floor(Math.random() * flowerColors.length)]);
        flower.position.set((Math.random() - 0.5) * 70, 0, (Math.random() - 0.5) * 70);
        flower.scale.setScalar(0.4 + Math.random() * 0.5);
        scene.add(flower);
      }

      // Trees
      const treePositions = [
        { x: 10, z: -10 }, { x: -10, z: -10 }, { x: 18, z: 5 },
        { x: -18, z: 5 }, { x: 0, z: 22 }, { x: 15, z: 18 }, { x: -15, z: 18 }
      ];
      treePositions.forEach(pos => {
        const tree = createTree();
        tree.position.set(pos.x, 0, pos.z);
        tree.scale.setScalar(0.7 + Math.random() * 0.5);
        scene.add(tree);
      });

      // Sparse bushes and boulders
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a9d5d });
      const boulderMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.9 });
      const insectMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

      for (let i = 0; i < 6; i++) {
        const bush = createBush(bushMat);
        let x = 0;
        let z = 0;
        for (let tries = 0; tries < 8; tries++) {
          x = (Math.random() - 0.5) * 65;
          z = (Math.random() - 0.5) * 65;
          if (isSafeOffPathPlacement(x, z)) break;
        }
        bush.position.set(x, 0, z);
        bush.scale.setScalar(0.5 + Math.random() * 0.4);
        scene.add(bush);
      }

      for (let i = 0; i < 3; i++) {
        const boulder = createBoulder(boulderMat);
        let x = 0;
        let z = 0;
        for (let tries = 0; tries < 8; tries++) {
          x = (Math.random() - 0.5) * 65;
          z = (Math.random() - 0.5) * 65;
          if (isSafeOffPathPlacement(x, z)) break;
        }
        boulder.position.set(x, 0.4, z);
        boulder.rotation.set(Math.random(), Math.random(), Math.random());
        boulder.scale.setScalar(0.8 + Math.random() * 0.4);
        boulder.castShadow = true;
        scene.add(boulder);
      }

      for (let i = 0; i < 6; i++) {
        const insect = createInsect(insectMat);
        insect.position.set((Math.random() - 0.5) * 60, 0.15 + Math.random() * 0.2, (Math.random() - 0.5) * 60);
        insect.userData.baseY = insect.position.y;
        insect.rotation.y = Math.random() * Math.PI * 2;
        scene.add(insect);
        insects.push(insect);
      }

      // Mushrooms
      for (let i = 0; i < 30; i++) {
        const mushroom = createMushroom();
        mushroom.position.set((Math.random() - 0.5) * 65, 0, (Math.random() - 0.5) * 65);
        mushroom.scale.setScalar(0.25 + Math.random() * 0.35);
        scene.add(mushroom);
      }

      createGrassTufts();

      // Clouds
      for (let i = 0; i < 12; i++) {
        const cloud = createCloud();
        cloud.position.set((Math.random() - 0.5) * 100, 18 + Math.random() * 12, (Math.random() - 0.5) * 100);
        cloud.userData.speed = 0.015 + Math.random() * 0.025;
        cloud.scale.setScalar(0.8 + Math.random() * 0.6);
        scene.add(cloud);
        clouds.push(cloud);
      }

      // Royal props placed beyond paths
      createRoyalProps();

      const waterfallAnchor = createWaterfallFeature();
      createIrrigationSystem(waterfallAnchor.x, waterfallAnchor.z);
    }

    function createWaterfallFeature() {
      const feature = new THREE.Group();
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x7f7f85, roughness: 0.9 });

      const rocks = [
        { geo: new THREE.DodecahedronGeometry(0.9, 0), pos: [0, 0.35, 0], scale: [1.2, 0.7, 1] },
        { geo: new THREE.DodecahedronGeometry(0.6, 0), pos: [-0.9, 0.2, 0.4], scale: [0.9, 0.6, 1.1] },
        { geo: new THREE.DodecahedronGeometry(0.5, 0), pos: [0.8, 0.2, 0.6], scale: [1, 0.5, 0.8] },
        { geo: new THREE.SphereGeometry(0.5, 6, 6), pos: [-0.2, 0.15, -0.6], scale: [1.3, 0.5, 1] },
        { geo: new THREE.SphereGeometry(0.4, 6, 6), pos: [0.6, 0.1, -0.4], scale: [0.8, 0.4, 0.9] }
      ];

      rocks.forEach(({ geo, pos, scale }) => {
        const rock = new THREE.Mesh(geo, rockMat);
        rock.position.set(pos[0], pos[1], pos[2]);
        rock.scale.set(scale[0], scale[1], scale[2]);
        rock.castShadow = true;
        rock.receiveShadow = true;
        feature.add(rock);
      });

      const waterfallMat = new THREE.MeshStandardMaterial({
        color: 0x6ecbff,
        transparent: true,
        opacity: 0.55,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
      const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.8, 1, 4), waterfallMat);
      waterfall.position.set(0.2, 1.35, -0.2);
      waterfall.rotation.y = Math.PI * 0.1;
      feature.add(waterfall);
      waterfallSheets.push({ mesh: waterfall, baseY: waterfall.position.y, offset: Math.random() * Math.PI * 2 });

      return feature;
    }

    function createRoyalProps() {
      const propInset = 0.82;
      const placements = [
        { create: createHugeRedChair, x: 28, z: -30, scale: 1.2 },
        { create: createCakeWithCherry, x: -32, z: -24, scale: 1.1 },
        { create: createMilkTart, x: 34, z: 22, scale: 1 },
        { create: createIceCreamGlass, x: -26, z: 30, scale: 1.05 },
        { create: createPinkSodaGlass, x: 22, z: 32, scale: 1 },
        { create: createGoldenTeapot, x: -36, z: 12, scale: 1 },
        { create: createMacaronTower, x: 12, z: -36, scale: 1.1 },
        { create: createCrownCushion, x: -18, z: -34, scale: 1 },
        {
          create: createWaterfallFeature,
          x: 40,
          z: -8,
          scale: 1.1,
          collision: { minX: -2.2, maxX: 2.2, minZ: -1.8, maxZ: 1.8 }
        }
      ];

      placements.forEach(({ create, x, z, scale, collision }) => {
        const insetX = x * propInset;
        const insetZ = z * propInset;
        if (!isSafeOffPathPlacement(insetX, insetZ)) return;
        const prop = create();
        prop.position.set(insetX, 0, insetZ);
        prop.scale.setScalar(scale);
        scene.add(prop);
        if (collision) {
          collisionBoxes.push({
            minX: insetX + collision.minX * scale,
            maxX: insetX + collision.maxX * scale,
            minZ: insetZ + collision.minZ * scale,
            maxZ: insetZ + collision.maxZ * scale
          });
        }
      });
    }

    function isSafeOffPathPlacement(x, z) {
      const radius = Math.hypot(x, z);
      if (radius < 16 || radius > 46) {
        return false;
      }
      if (isNearPath(x, z, 2.5)) {
        return false;
      }
      if (!isClearOfBuildings(x, z, 3)) {
        return false;
      }
      return true;
    }

    function isNearPath(x, z, buffer = 1.5) {
      const halfWidth = PATH_CONFIG.width / 2 + buffer;
      for (let i = 0; i < PATH_CONFIG.count; i++) {
        const angle = PATH_CONFIG.angleStep * i;
        const axisX = Math.sin(angle);
        const axisZ = Math.cos(angle);
        const projection = x * axisX + z * axisZ;
        if (projection < -buffer || projection > PATH_CONFIG.length + buffer) {
          continue;
        }
        const perpendicular = Math.abs(-axisZ * x + axisX * z);
        if (perpendicular <= halfWidth) {
          return true;
        }
      }
      return false;
    }

    function isClearOfBuildings(x, z, buffer = 2) {
      return !collisionBoxes.some(b =>
        x > b.minX - buffer && x < b.maxX + buffer && z > b.minZ - buffer && z < b.maxZ + buffer
      );
    }

    function updateGrassTuftsCulling() {
      if (!grassTufts || !player) return;
      const radius = 28;
      const radiusSq = radius * radius;
      let visibleCount = 0;

      for (let i = 0; i < grassTuftData.length; i++) {
        const data = grassTuftData[i];
        if (player.position.distanceToSquared(data.position) > radiusSq) continue;

        grassTuftDummy.position.copy(data.position);
        grassTuftDummy.rotation.set(0, data.rotationY, 0);
        grassTuftDummy.scale.copy(data.scale);
        grassTuftDummy.updateMatrix();
        grassTufts.setMatrixAt(visibleCount, grassTuftDummy.matrix);
        visibleCount++;
      }

      grassTufts.count = visibleCount;
      grassTufts.instanceMatrix.needsUpdate = true;
    }

    function createFlower(color) {
      const group = new THREE.Group();
      
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.04, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x228b22 })
      );
      stem.position.y = 0.25;
      group.add(stem);

      const petalGeo = new THREE.SphereGeometry(0.14, 8, 8);
      petalGeo.scale(1, 0.5, 1);
      const petalMat = new THREE.MeshStandardMaterial({ color });
      
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(a) * 0.12, 0.55, Math.sin(a) * 0.12);
        group.add(petal);
      }

      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700 })
      );
      center.position.y = 0.55;
      group.add(center);

      return group;
    }

    function createBush(material) {
      const group = new THREE.Group();
      const bushGeo = new THREE.SphereGeometry(0.4, 6, 6);
      const puffCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < puffCount; i++) {
        const puff = new THREE.Mesh(bushGeo, material);
        puff.position.set((Math.random() - 0.5) * 0.5, 0.2 + Math.random() * 0.2, (Math.random() - 0.5) * 0.5);
        puff.scale.setScalar(0.8 + Math.random() * 0.4);
        group.add(puff);
      }
      return group;
    }

    function createVine(material) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.2, 0, 0.2),
        new THREE.Vector3(-0.15, 0.8, 0.1),
        new THREE.Vector3(0.1, 1.6, -0.2),
        new THREE.Vector3(-0.05, 2.2, 0.1)
      ]);
      const geometry = new THREE.TubeGeometry(curve, 6, 0.04, 5, false);
      const vine = new THREE.Mesh(geometry, material);
      vine.castShadow = true;
      return vine;
    }

    function createInsect(material) {
      const group = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), material);
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), material);
      head.position.set(0.06, 0.02, 0);
      group.add(head);
      group.userData = {
        baseY: 0,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 1.5 + Math.random() * 1.5,
        wobbleAmount: 0.03 + Math.random() * 0.02
      };
      return group;
    }

    function createBoulder(material) {
      return new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), material);
    }

    function createTree() {
      const group = new THREE.Group();
      
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 2.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      );
      trunk.position.y = 1.25;
      trunk.castShadow = true;
      group.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x90ee90 });
      [{ y: 3, r: 1.4 }, { y: 4, r: 1.1 }, { y: 4.8, r: 0.7 }].forEach(f => {
        const foliage = new THREE.Mesh(new THREE.SphereGeometry(f.r, 12, 12), foliageMat);
        foliage.position.y = f.y;
        foliage.castShadow = true;
        group.add(foliage);
      });

      if (Math.random() < 0.6) {
        const vineMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
        const vine = createVine(vineMat);
        vine.position.y = 0.2;
        group.add(vine);
      }

      return group;
    }

    function createMushroom() {
      const group = new THREE.Group();
      
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.25, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xfff8dc })
      );
      stem.position.y = 0.25;
      group.add(stem);

      const capColors = [0xff6b6b, 0xff69b4, 0xffa07a, 0x9370db];
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: capColors[Math.floor(Math.random() * capColors.length)] })
      );
      cap.position.y = 0.5;
      group.add(cap);

      return group;
    }

    function createCloud() {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
      
      [{ x: 0, r: 2 }, { x: 1.6, r: 1.4 }, { x: -1.5, r: 1.5 }, { x: 0.8, r: 1.1 }, { x: -0.8, r: 1.2 }].forEach(p => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(p.r, 12, 12), mat);
        puff.position.set(p.x, Math.random() * 0.5, Math.random() * 0.5 - 0.25);
        group.add(puff);
      });

      return group;
    }

    function createHugeRedChair() {
      const group = new THREE.Group();
      const chairMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.6 });
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0xffa3b1, roughness: 0.7 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.8 });

      const seat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 2.5), chairMat);
      seat.position.y = 0.8;
      seat.castShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 0.5), chairMat);
      back.position.set(0, 2, -1);
      back.castShadow = true;
      group.add(back);

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.9), cushionMat);
      cushion.position.y = 1.1;
      group.add(cushion);

      [-1.2, 1.2].forEach(x => {
        [-0.9, 0.9].forEach(z => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), woodMat);
          leg.position.set(x, 0.4, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });

      return group;
    }

    function createCakeWithCherry() {
      const group = new THREE.Group();
      const cakeMat = new THREE.MeshStandardMaterial({ color: 0xfff0d6, roughness: 0.7 });
      const frostingMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.6 });
      const cherryMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.4 });
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.15, 16), plateMat);
      plate.position.y = 0.1;
      group.add(plate);

      const cake = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.8, 20), cakeMat);
      cake.position.y = 0.6;
      cake.castShadow = true;
      group.add(cake);

      const frosting = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.25, 20), frostingMat);
      frosting.position.y = 1.05;
      group.add(frosting);

      const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), cherryMat);
      cherry.position.set(0.2, 1.3, 0);
      group.add(cherry);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0x2e8b57 }));
      stem.position.set(0.2, 1.45, 0);
      stem.rotation.z = 0.5;
      group.add(stem);

      return group;
    }

    function createMilkTart() {
      const group = new THREE.Group();
      const crustMat = new THREE.MeshStandardMaterial({ color: 0xf4c27a, roughness: 0.8 });
      const fillingMat = new THREE.MeshStandardMaterial({ color: 0xfff3c1, roughness: 0.6 });
      const dustMat = new THREE.MeshStandardMaterial({ color: 0xcfa670, roughness: 0.9 });

      const crust = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 0.4, 16), crustMat);
      crust.position.y = 0.25;
      crust.castShadow = true;
      group.add(crust);

      const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.25, 16), fillingMat);
      filling.position.y = 0.55;
      group.add(filling);

      const dust = new THREE.Mesh(new THREE.CircleGeometry(0.75, 16), dustMat);
      dust.rotation.x = -Math.PI / 2;
      dust.position.y = 0.7;
      group.add(dust);

      return group;
    }

    function createIceCreamGlass() {
      const group = new THREE.Group();
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
      const stemMat = new THREE.MeshStandardMaterial({ color: 0xd9f7ff, roughness: 0.3, metalness: 0.2 });
      const scoopColors = [0xffd1dc, 0xfde2a7, 0xc1e1c1];

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.6, 1.1, 16, 1, true), glassMat);
      bowl.position.y = 1.1;
      group.add(bowl);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.7, 8), stemMat);
      stem.position.y = 0.35;
      group.add(stem);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.15, 12), stemMat);
      base.position.y = 0.05;
      group.add(base);

      scoopColors.forEach((color, i) => {
        const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 14), new THREE.MeshStandardMaterial({ color }));
        scoop.position.set((i - 1) * 0.35, 1.5 + i * 0.2, 0);
        scoop.castShadow = true;
        group.add(scoop);
      });

      return group;
    }

    function createPinkSodaGlass() {
      const group = new THREE.Group();
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
      const sodaMat = new THREE.MeshStandardMaterial({ color: 0xff8fb1, transparent: true, opacity: 0.7 });
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xff5c8a, roughness: 0.4 });

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.6, 16), glassMat);
      glass.position.y = 0.9;
      group.add(glass);

      const soda = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.2, 16), sodaMat);
      soda.position.y = 0.75;
      group.add(soda);

      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), strawMat);
      straw.position.set(0.15, 1.4, 0);
      straw.rotation.z = 0.2;
      group.add(straw);

      return group;
    }

    function createGoldenTeapot() {
      const group = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd36e, metalness: 0.7, roughness: 0.3 });

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), goldMat);
      body.scale.set(1.2, 1, 1);
      body.position.y = 0.9;
      body.castShadow = true;
      group.add(body);

      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.2, 12), goldMat);
      lid.position.y = 1.5;
      group.add(lid);

      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.8, 8), goldMat);
      spout.position.set(1, 1, 0.3);
      spout.rotation.z = -0.7;
      group.add(spout);

      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 8, 16), goldMat);
      handle.position.set(-1, 1, 0);
      handle.rotation.y = Math.PI / 2;
      group.add(handle);

      return group;
    }

    function createMacaronTower() {
      const group = new THREE.Group();
      const colors = [0xffc1cc, 0xffe0a3, 0xc7e9f1, 0xd6c1f7];
      colors.forEach((color, i) => {
        const macaron = new THREE.Mesh(new THREE.CylinderGeometry(0.6 - i * 0.08, 0.6 - i * 0.08, 0.25, 16), new THREE.MeshStandardMaterial({ color }));
        macaron.position.y = 0.2 + i * 0.3;
        macaron.castShadow = true;
        group.add(macaron);
      });
      return group;
    }

    function createCrownCushion() {
      const group = new THREE.Group();
      const cushionMat = new THREE.MeshStandardMaterial({ color: 0xff7ab6, roughness: 0.7 });
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xfff4d1, roughness: 0.6 });

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.2), cushionMat);
      base.position.y = 0.25;
      base.castShadow = true;
      group.add(base);

      const trim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 8, 16), trimMat);
      trim.position.y = 0.5;
      trim.rotation.x = Math.PI / 2;
      group.add(trim);

      const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0x7dd3fc }));
      jewel.position.set(0, 0.6, 0.35);
      group.add(jewel);

      return group;
    }

    function checkCollision(x, z) {
      // Check building collisions
      for (const box of collisionBoxes) {
        if (x > box.minX && x < box.maxX && z > box.minZ && z < box.maxZ) {
          return true;
        }
      }
      // Check world boundary
      if (Math.sqrt(x * x + z * z) > 48) {
        return true;
      }
      return false;
    }

    function updateKeyboardVector() {
      keyboardInput.x = (keyboardState.right ? 1 : 0) + (keyboardState.left ? -1 : 0);
      keyboardInput.y = (keyboardState.down ? 1 : 0) + (keyboardState.up ? -1 : 0);
      const length = Math.hypot(keyboardInput.x, keyboardInput.y);
      if (length > 1) {
        keyboardInput.x /= length;
        keyboardInput.y /= length;
      }
    }

    function handleAction() {
      if (gameState.nearNPC) {
        openDialog(gameState.nearNPC);
      } else if (gameState.nearWanderer) {
        openWandererDialog(gameState.nearWanderer);
      }
    }

    function unlockPlayerCape() {
      if (!player || gameState.capeUnlocked) return;
      const cape = createCape();
      player.add(cape);
      player.userData.cape = cape.userData.cape;
      gameState.capeUnlocked = true;
    }
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta() * gameState.timeScale;
      const time = clock.getElapsedTime();
      const now = performance.now();

      waterMaterial.opacity = waterPulse.baseOpacity + Math.sin(time * waterPulse.speed) * waterPulse.amplitude;

      if (gameState.started && !gameState.dialogOpen) {
        // Player movement
        const combinedInputX = Math.max(-1, Math.min(1, joystickInput.x + (desktopModeEnabled ? keyboardInput.x : 0)));
        const combinedInputY = Math.max(-1, Math.min(1, joystickInput.y + (desktopModeEnabled ? keyboardInput.y : 0)));
        const isMoving = combinedInputX !== 0 || combinedInputY !== 0;

        moveDirection.set(combinedInputX, 0, combinedInputY);
        if (moveDirection.lengthSq() > 0) {
          moveDirection.normalize();
        }
        
        if (isMoving) {
          const playerSpeed = getPlayerSpeed(now);
          const moveX = combinedInputX * playerSpeed * delta;
          const moveZ = combinedInputY * playerSpeed * delta;
          const newX = player.position.x + moveX;
          const newZ = player.position.z + moveZ;

          if (!checkCollision(newX, player.position.z)) {
            player.position.x = newX;
          }
          if (!checkCollision(player.position.x, newZ)) {
            player.position.z = newZ;
          }

          // Face movement direction
          const angle = Math.atan2(combinedInputX, combinedInputY);
          player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, angle, 0.15);

          // Waddle animation
          player.rotation.z = Math.sin(time * 15) * 0.12;
          player.position.y = player.userData.baseY + Math.abs(Math.sin(time * 18)) * 0.12;
        } else {
          // Idle animation
          player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, 0, 0.1);
          player.position.y = player.userData.baseY + Math.sin(time * 2) * 0.03;
        }

        updateCape(delta, time, isMoving, moveDirection);

        // Camera follow with gentle momentum zoom
        if (isMoving !== cameraZoomState.moving) {
          cameraZoomState.moving = isMoving;
          cameraZoomState.lastMoveChange = time;
        }

        if (cameraZoomState.moving) {
          if (time - cameraZoomState.lastMoveChange > cameraZoomState.zoomOutDelay) {
            cameraZoomState.targetOffset = cameraZoomState.zoomedOutOffset;
          }
        } else if (time - cameraZoomState.lastMoveChange > cameraZoomState.zoomInDelay) {
          cameraZoomState.targetOffset = cameraZoomState.baseOffset;
        }

        cameraZoomState.currentOffset = THREE.MathUtils.lerp(
          cameraZoomState.currentOffset,
          cameraZoomState.targetOffset,
          0.04
        );

        cameraTarget.set(player.position.x, player.position.y + 1, player.position.z);
        const idealPos = new THREE.Vector3(
          player.position.x,
          player.position.y + cameraZoomState.currentOffset,
          player.position.z + cameraZoomState.currentOffset
        );
        camera.position.lerp(idealPos, 0.08);
        camera.lookAt(cameraTarget);

        // Check NPC proximity
        let nearestNPC = null;
        let nearestWanderer = null;
        let nearestDist = Infinity;

        Object.entries(npcs).forEach(([id, npc]) => {
          const dist = player.position.distanceTo(npc.position);
          if (dist < 3.5 && dist < nearestDist) {
            nearestDist = dist;
            nearestNPC = id;
            nearestWanderer = null;
          }
        });

        wanderers.forEach(npc => {
          const dist = player.position.distanceTo(npc.position);
          if (dist < 3.5 && dist < nearestDist) {
            nearestDist = dist;
            nearestNPC = null;
            nearestWanderer = npc;
          }
        });

        gameState.nearNPC = nearestNPC;
        gameState.nearWanderer = nearestWanderer;

        updateActionButton(nearestNPC, nearestWanderer);

        // Check collectibles
        collectibles.forEach(col => {
          if (col.userData.collected) return;
          if (player.position.distanceTo(col.position) < 1.2) {
            col.userData.collected = true;
            col.visible = false;
            gameState.collected++;
            updateCollectibleCount(gameState.collected);
            showCollectPopup();
            spawnCelebrationBurst();
            player.userData.boostEndTime = now + BOOST_DURATION;
            if (!gameState.firstSweetShown) {
              gameState.firstSweetShown = true;
              gameState.timeScale = 0.2;
              gameState.dialogOpen = true;
              showSweetIntro();
            }
          }
        });

        // Update current location display
        let nearestBuilding = null;
        let nearestBuildingDist = Infinity;
        Object.entries(buildings).forEach(([id, building]) => {
          const dist = player.position.distanceTo(building.position);
          if (dist < nearestBuildingDist) {
            nearestBuildingDist = dist;
            nearestBuilding = building;
          }
        });

        if (nearestBuilding && nearestBuilding.userData.id !== gameState.currentLocation) {
          gameState.currentLocation = nearestBuilding.userData.id;
          updateLocationDisplay(
            gameState.currentLocation,
            nearestBuilding.userData.icon,
            nearestBuilding.userData.name
          );
        }

        // Update wandering NPCs
        wanderers.forEach(npc => {
          npc.userData.timer -= delta;
          if (npc.userData.timer <= 0) {
            npc.userData.walkAngle += (Math.random() - 0.5) * Math.PI;
            // Fast runners change direction more often
            npc.userData.timer = npc.userData.speed === 'fast' 
              ? 0.5 + Math.random() * 1 
              : 2 + Math.random() * 4;
          }
          
          // Always try to show message - the function handles the 3s cooldown
          showFloatingMessage(npc);
          maybePlayAmbientVoice(npc);

          const speed = npc.userData.walkSpeed * delta;
          const newX = npc.position.x + Math.sin(npc.userData.walkAngle) * speed;
          const newZ = npc.position.z + Math.cos(npc.userData.walkAngle) * speed;

          if (!checkCollision(newX, newZ)) {
            npc.position.x = newX;
            npc.position.z = newZ;
          } else {
            npc.userData.walkAngle += Math.PI * 0.5;
          }

          npc.rotation.y = npc.userData.walkAngle;
          
          // Different animation speeds based on NPC type
          if (npc.userData.speed === 'fast') {
            // Fast runners - very bouncy and wobbly
            npc.rotation.z = Math.sin(time * 25) * 0.2;
            npc.position.y = Math.abs(Math.sin(time * 30)) * 0.2;
          } else if (npc.userData.speed === 'slow') {
            // Elderly - slow shuffle
            npc.rotation.z = Math.sin(time * 4) * 0.03;
            npc.position.y = Math.abs(Math.sin(time * 5)) * 0.02;
          } else {
            // Normal
            npc.rotation.z = Math.sin(time * 12) * 0.08;
            npc.position.y = Math.abs(Math.sin(time * 15)) * 0.08;
          }
        });
      }

      // Ambient animations (always run)
      updateCelebrationParticles(delta);
      updateGrassTuftsCulling();
      clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        if (cloud.position.x > 60) cloud.position.x = -60;
      });

      // Animate bees
      bees.forEach(bee => {
        const data = bee.userData;
        // Circular flight around palace
        data.angle += data.speed * delta;
        bee.position.x = data.palaceX + Math.cos(data.angle) * data.radius;
        bee.position.z = data.palaceZ + Math.sin(data.angle) * data.radius;
        // Bobbing up and down
        bee.position.y = data.baseY + Math.sin(time * data.bobSpeed) * 0.5;
        // Face direction of movement
        bee.rotation.y = data.angle + Math.PI / 2;
        // Wing flutter
        bee.children.forEach((child, i) => {
          if (i >= 3) { // Wings are children 3 and 4
            child.rotation.x = Math.sin(time * 30) * 0.3;
          }
        });
      });

      // Animate insects
      insects.forEach(insect => {
        const data = insect.userData;
        insect.position.y = data.baseY + Math.sin(time * data.wobbleSpeed + data.wobbleOffset) * data.wobbleAmount;
        insect.rotation.z = Math.sin(time * data.wobbleSpeed + data.wobbleOffset) * 0.4;
      });
      // Animate corgis
      corgis.forEach(corgi => {
        const data = corgi.userData;
        data.timer -= delta;
        if (data.timer <= 0) {
          data.walkAngle += (Math.random() - 0.5) * Math.PI * 0.8;
          data.timer = data.speedType === 'run' ? 0.5 + Math.random() * 0.8 : 1.5 + Math.random() * 2.5;
        }

        const speed = data.walkSpeed * delta;
        const nextX = corgi.position.x + Math.sin(data.walkAngle) * speed;
        const nextZ = corgi.position.z + Math.cos(data.walkAngle) * speed;

        if (!checkCollision(nextX, nextZ) && isSafeOffPathPlacement(nextX, nextZ)) {
          corgi.position.x = nextX;
          corgi.position.z = nextZ;
        } else {
          data.walkAngle += Math.PI * (0.4 + Math.random() * 0.4);
        }

        corgi.rotation.y = data.walkAngle;

        const bob = Math.sin(time * data.bobSpeed + data.bobOffset) * (data.speedType === 'run' ? 0.12 : 0.07);
        corgi.position.y = data.baseY + bob;

        data.legs.forEach(leg => {
          leg.rotation.x = Math.sin(time * data.strideSpeed + leg.userData.phase + data.bobOffset) * data.strideAmplitude;
        });
        if (data.tail) {
          data.tail.rotation.y = Math.sin(time * (data.speedType === 'run' ? 12 : 6) + data.bobOffset) * 0.4;
        }
      });

      // Animate Bernie listeners
      const feastPos = LOCATIONS.find(l => l.id === 'feast');
      bernieListeners.forEach(listener => {
        const data = listener.userData;
        const speed = data.speed * delta;
        
        // Show floating messages (especially when listening!)
        if (data.state === 'listening') {
          showFloatingMessage(listener);
        } else if (Math.random() < 0.01) { // Less frequent when not listening
          showFloatingMessage(listener);
        }
        maybePlayAmbientVoice(listener);
        
        if (data.state === 'gathering') {
          // Move towards target position around Bernie
          const dx = data.targetX - listener.position.x;
          const dz = data.targetZ - listener.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist > 0.5) {
            listener.position.x += (dx / dist) * speed * 2;
            listener.position.z += (dz / dist) * speed * 2;
            listener.rotation.y = Math.atan2(dx, dz);
            // Walk animation
            listener.rotation.z = Math.sin(time * 12) * 0.08;
            listener.position.y = Math.abs(Math.sin(time * 15)) * 0.08;
          } else {
            data.state = 'listening';
          }
        } else if (data.state === 'listening') {
          // Face Bernie (speakers NPC) and nod occasionally
          const speakersPos = LOCATIONS.find(l => l.id === 'speakers');
          const npcPos = npcs['speakers'].position;
          listener.rotation.y = Math.atan2(
            npcPos.x - listener.position.x,
            npcPos.z - listener.position.z
          );
          // Nodding animation
          listener.rotation.x = Math.sin(time * 2) * 0.1;
          listener.position.y = 0;
        } else if (data.state === 'leaving') {
          // Head towards feast hall for cake!
          const dx = feastPos.x - listener.position.x;
          const dz = feastPos.z - listener.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          // Show hungry messages
          if (Math.random() < 0.015) {
            const hungryQuotes = ["CAKE TIME! 🍰", "My tummy is calling!", "Dessert awaits!", "I smell frosting!", "Can't talk, eating soon!"];
            const now = Date.now();
            if (now - data.lastQuote > 2000) {
              data.lastQuote = now;
              const vec = listener.position.clone().project(camera);
              if (vec.z < 1 && vec.x > -0.8 && vec.x < 0.8) {
                const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
                const msg = document.createElement('div');
                msg.className = 'floating-message';
                msg.textContent = hungryQuotes[Math.floor(Math.random() * hungryQuotes.length)];
                msg.style.left = x + 'px';
                msg.style.top = (y - 80) + 'px';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
              }
            }
          }
          
          if (dist > 3) {
            listener.position.x += (dx / dist) * speed * 2.5;
            listener.position.z += (dz / dist) * speed * 2.5;
            listener.rotation.y = Math.atan2(dx, dz);
            // Excited walking animation
            listener.rotation.z = Math.sin(time * 15) * 0.12;
            listener.position.y = Math.abs(Math.sin(time * 18)) * 0.12;
          } else {
            // Arrived at feast hall, start wandering there
            data.state = 'arrived';
          }
        } else if (data.state === 'arrived') {
          // Wander around feast hall happily
          data.wanderAngle += (Math.random() - 0.5) * 0.1;
          const newX = listener.position.x + Math.sin(data.wanderAngle) * speed;
          const newZ = listener.position.z + Math.cos(data.wanderAngle) * speed;
          
          // Show happy eating messages
          if (Math.random() < 0.01) {
            const eatingQuotes = ["*nom nom nom*", "This cake is DIVINE! 🍰", "More frosting please!", "I regret nothing!", "Best. Day. Ever."];
            const now = Date.now();
            if (now - data.lastQuote > 3000) {
              data.lastQuote = now;
              const vec = listener.position.clone().project(camera);
              if (vec.z < 1 && vec.x > -0.8 && vec.x < 0.8) {
                const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
                const msg = document.createElement('div');
                msg.className = 'floating-message';
                msg.textContent = eatingQuotes[Math.floor(Math.random() * eatingQuotes.length)];
                msg.style.left = x + 'px';
                msg.style.top = (y - 80) + 'px';
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 3000);
              }
            }
          }
          
          // Stay near feast hall
          const distToFeast = Math.sqrt(
            Math.pow(newX - feastPos.x, 2) + Math.pow(newZ - feastPos.z, 2)
          );
          if (distToFeast < 8 && !checkCollision(newX, newZ)) {
            listener.position.x = newX;
            listener.position.z = newZ;
          } else {
            data.wanderAngle += Math.PI;
          }
          listener.rotation.y = data.wanderAngle;
          listener.rotation.z = Math.sin(time * 10) * 0.06;
          listener.position.y = Math.abs(Math.sin(time * 12)) * 0.06;
        } else {
          // Default wandering state
          data.wanderAngle += (Math.random() - 0.5) * 0.05;
          const newX = listener.position.x + Math.sin(data.wanderAngle) * speed * 0.5;
          const newZ = listener.position.z + Math.cos(data.wanderAngle) * speed * 0.5;
          
          if (!checkCollision(newX, newZ)) {
            listener.position.x = newX;
            listener.position.z = newZ;
          } else {
            data.wanderAngle += Math.PI * 0.5;
          }
          listener.rotation.y = data.wanderAngle;
          listener.rotation.z = Math.sin(time * 8) * 0.05;
          listener.position.y = Math.abs(Math.sin(time * 10)) * 0.05;
        }
      });

      // NPC indicator float
      Object.values(npcs).forEach(npc => {
        npc.children.forEach(child => {
          if (child.userData.isIndicator) {
            child.position.y = 2.5 + Math.sin(time * 3) * 0.15;
            child.rotation.y = time * 2;
          }
        });
      });

      // Collectible float and spin
      collectibles.forEach(col => {
        if (!col.userData.collected) {
          col.position.y = 0.5 + Math.sin(time * 3 + col.userData.floatOffset) * 0.15;
          col.rotation.y = time * 1.5;
        }
      });

      // Building pulse when near
      Object.values(buildings).forEach(building => {
        const dist = player.position.distanceTo(building.position);
        if (dist < 6) {
          building.scale.setScalar(1 + Math.sin(time * 5) * 0.02);
        } else {
          building.scale.setScalar(THREE.MathUtils.lerp(building.scale.x, 1, 0.1));
        }
      });

      // Waterfall motion
      waterfallSheets.forEach(({ mesh, baseY, offset }) => {
        mesh.position.y = baseY + Math.sin(time * 3 + offset) * 0.05;
        mesh.material.opacity = 0.5 + Math.sin(time * 4 + offset) * 0.08;
      });

      renderer.render(scene, camera);
    }

    // Start the game
    setupSplashInteractions();
    init();
