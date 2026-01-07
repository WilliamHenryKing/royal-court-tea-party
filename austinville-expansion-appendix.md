# 🏰 APPENDIX: AUSTINVILLE TOWN EXPANSION
## Transforming Royal Court Tea Party into a Living Village

---

# PART 1: THE TOWN OF AUSTINVILLE

## 🗺️ Town Layout & Districts

```
                    ╔══════════════════════════════════════════════════════╗
                    ║              AUSTINVILLE - Town Map                  ║
                    ╠══════════════════════════════════════════════════════╣
                    ║                                                      ║
                    ║     [Fishing Dock]----River~~~~[Wooden Bridge]~~~~   ║
                    ║          |              🐟         |                 ║
                    ║    [Doom Sayer]                [Donut Shop]          ║
                    ║          |                         |                 ║
                    ║    ══════╪═══ PEPPERMINT AVE ══════╪══════           ║
                    ║          |                         |                 ║
                    ║   [Boxing Ring]              [Coffee Café]           ║
                    ║          |                    ⚔️ WAR ⚔️              ║
                    ║    ══════╪═══ MILK LANE ═══════════╪══════           ║
                    ║          |                         |                 ║
                    ║   [Trampoline]               [Tea Café]              ║
                    ║          |                         |                 ║
                    ║    ══════╪═══ CRUMPET COURT ═══════╪══════           ║
                    ║          |                         |                 ║
                    ║   [Pinkie School]     ⛲      [Royal Palace]         ║
                    ║          |          CENTER         |                 ║
                    ║    ══════╪═══ ROYAL ROAD ══════════╪══════           ║
                    ║          |                         |                 ║
                    ║   [Guest Registry]          [Feast Hall]             ║
                    ║          |                         |                 ║
                    ║   [Speaker's Grove]    [King Ben's Route]            ║
                    ║                                                      ║
                    ╚══════════════════════════════════════════════════════╝
```

---

## 🏗️ NEW BUILDINGS & STRUCTURES

### Street System Configuration

```javascript
// === AUSTINVILLE STREET SYSTEM ===
const STREETS = {
  main: [
    { 
      name: "Royal Road", 
      type: "cobblestone",
      start: { x: -40, z: 0 },
      end: { x: 40, z: 0 },
      width: 4,
      signPositions: [{ x: -35, z: 2 }, { x: 35, z: 2 }]
    },
    { 
      name: "Peppermint Ave", 
      type: "cobblestone",
      start: { x: -40, z: -20 },
      end: { x: 40, z: -20 },
      width: 3.5,
      signPositions: [{ x: -35, z: -18 }, { x: 35, z: -18 }]
    },
    { 
      name: "Milk Lane", 
      type: "sandy",
      start: { x: -40, z: -10 },
      end: { x: 40, z: -10 },
      width: 3,
      signPositions: [{ x: -35, z: -8 }]
    },
    { 
      name: "Crumpet Court", 
      type: "cobblestone",
      start: { x: -40, z: 10 },
      end: { x: 40, z: 10 },
      width: 3,
      signPositions: [{ x: -35, z: 12 }]
    },
    { 
      name: "Scone Street", 
      type: "sandy",
      start: { x: -40, z: 20 },
      end: { x: 40, z: 20 },
      width: 2.5,
      signPositions: [{ x: 30, z: 22 }]
    }
  ],
  cross: [
    { name: "Sugar Lane", type: "sandy", start: { x: -20, z: -30 }, end: { x: -20, z: 30 }, width: 2.5 },
    { name: "Honey Way", type: "cobblestone", start: { x: 0, z: -30 }, end: { x: 0, z: 30 }, width: 3 },
    { name: "Biscuit Boulevard", type: "sandy", start: { x: 20, z: -30 }, end: { x: 20, z: 30 }, width: 2.5 }
  ]
};

// Road Materials
const ROAD_MATERIALS = {
  cobblestone: null,  // Will be created with texture
  sandy: null,
  wooden: null
};

function createRoadMaterials() {
  // Cobblestone - create procedural texture
  const cobbleCanvas = document.createElement('canvas');
  cobbleCanvas.width = 128;
  cobbleCanvas.height = 128;
  const cobbleCtx = cobbleCanvas.getContext('2d');
  
  // Base color
  cobbleCtx.fillStyle = '#a0a0a0';
  cobbleCtx.fillRect(0, 0, 128, 128);
  
  // Draw stones
  const stoneColors = ['#888888', '#909090', '#989898', '#a8a8a8', '#b0b0b0'];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const offsetX = (y % 2) * 8;
      cobbleCtx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
      cobbleCtx.beginPath();
      cobbleCtx.roundRect(
        x * 16 + offsetX + 1, 
        y * 16 + 1, 
        14, 14, 3
      );
      cobbleCtx.fill();
      
      // Add slight shadow
      cobbleCtx.fillStyle = 'rgba(0,0,0,0.1)';
      cobbleCtx.fillRect(x * 16 + offsetX + 1, y * 16 + 12, 14, 4);
    }
  }
  
  const cobbleTexture = new THREE.CanvasTexture(cobbleCanvas);
  cobbleTexture.wrapS = THREE.RepeatWrapping;
  cobbleTexture.wrapT = THREE.RepeatWrapping;
  cobbleTexture.repeat.set(4, 4);
  
  ROAD_MATERIALS.cobblestone = new THREE.MeshStandardMaterial({
    map: cobbleTexture,
    roughness: 0.9
  });
  
  // Sandy road
  const sandyCanvas = document.createElement('canvas');
  sandyCanvas.width = 64;
  sandyCanvas.height = 64;
  const sandyCtx = sandyCanvas.getContext('2d');
  sandyCtx.fillStyle = '#e8d4a8';
  sandyCtx.fillRect(0, 0, 64, 64);
  
  // Add grain
  for (let i = 0; i < 200; i++) {
    sandyCtx.fillStyle = `rgba(139, 119, 80, ${Math.random() * 0.3})`;
    sandyCtx.fillRect(
      Math.random() * 64,
      Math.random() * 64,
      1 + Math.random() * 2,
      1 + Math.random() * 2
    );
  }
  
  const sandyTexture = new THREE.CanvasTexture(sandyCanvas);
  sandyTexture.wrapS = THREE.RepeatWrapping;
  sandyTexture.wrapT = THREE.RepeatWrapping;
  sandyTexture.repeat.set(6, 6);
  
  ROAD_MATERIALS.sandy = new THREE.MeshStandardMaterial({
    map: sandyTexture,
    roughness: 0.95
  });
  
  // Wooden planks
  const woodCanvas = document.createElement('canvas');
  woodCanvas.width = 128;
  woodCanvas.height = 64;
  const woodCtx = woodCanvas.getContext('2d');
  
  for (let i = 0; i < 4; i++) {
    const shade = 140 + Math.random() * 30;
    woodCtx.fillStyle = `rgb(${shade + 40}, ${shade}, ${shade - 40})`;
    woodCtx.fillRect(0, i * 16, 128, 15);
    
    // Wood grain
    woodCtx.strokeStyle = `rgba(80, 50, 20, 0.2)`;
    for (let j = 0; j < 5; j++) {
      woodCtx.beginPath();
      woodCtx.moveTo(0, i * 16 + Math.random() * 15);
      woodCtx.lineTo(128, i * 16 + Math.random() * 15);
      woodCtx.stroke();
    }
  }
  
  const woodTexture = new THREE.CanvasTexture(woodCanvas);
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(8, 4);
  
  ROAD_MATERIALS.wooden = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8
  });
}

function createStreet(streetData) {
  const group = new THREE.Group();
  
  const length = Math.sqrt(
    Math.pow(streetData.end.x - streetData.start.x, 2) +
    Math.pow(streetData.end.z - streetData.start.z, 2)
  );
  
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(length, streetData.width),
    ROAD_MATERIALS[streetData.type]
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(
    (streetData.start.x + streetData.end.x) / 2,
    0.02,
    (streetData.start.z + streetData.end.z) / 2
  );
  
  // Rotate to match direction
  const angle = Math.atan2(
    streetData.end.z - streetData.start.z,
    streetData.end.x - streetData.start.x
  );
  road.rotation.z = -angle;
  road.receiveShadow = true;
  group.add(road);
  
  return group;
}

function createStreetSign(name, position, rotation = 0) {
  const group = new THREE.Group();
  
  // Post
  const postMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.5, 8),
    postMat
  );
  post.position.y = 1.25;
  post.castShadow = true;
  group.add(post);
  
  // Sign board
  const signMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 0.1),
    signMat
  );
  sign.position.y = 2.3;
  sign.castShadow = true;
  group.add(sign);
  
  // Text (using sprite for simplicity)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f5f5dc';
  ctx.font = 'bold 28px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 128, 32);
  
  const textTexture = new THREE.CanvasTexture(canvas);
  const textMat = new THREE.SpriteMaterial({ map: textTexture });
  const text = new THREE.Sprite(textMat);
  text.scale.set(2, 0.5, 1);
  text.position.y = 2.3;
  text.position.z = 0.06;
  group.add(text);
  
  // Decorative top
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  top.position.y = 2.6;
  group.add(top);
  
  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotation;
  
  return group;
}

function createAllStreets() {
  createRoadMaterials();
  
  // Create main streets
  STREETS.main.forEach(street => {
    const streetMesh = createStreet(street);
    scene.add(streetMesh);
    
    // Add signs
    street.signPositions?.forEach(pos => {
      const sign = createStreetSign(street.name, pos);
      scene.add(sign);
    });
  });
  
  // Create cross streets
  STREETS.cross.forEach(street => {
    const streetMesh = createStreet(street);
    scene.add(streetMesh);
  });
}
```

---

### Tea Café (with seated NPCs)

```javascript
// === TEA CAFÉ - "The Gilded Teacup" ===
const TEA_CAFE_DATA = {
  name: "The Gilded Teacup",
  position: { x: 18, z: 8 },
  tables: 4,
  seatedNPCs: [
    { name: "Lady Sip", quotes: ["*sips tea loudly*", "Ah, the perfect brew!", "Pinkies UP, everyone!"] },
    { name: "Sir Steep", quotes: ["This Earl Grey is divine!", "I've been here since 9am. No regrets.", "Tea > Everything"] },
    { name: "Duchess Pour", quotes: ["More sugar please!", "Is this organic?", "I feel SO sophisticated right now."] }
  ]
};

function createTeaCafe() {
  const group = new THREE.Group();
  
  // Main building
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xfff0e6 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  
  // Base structure
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3.5, 5),
    buildingMat
  );
  base.position.y = 1.75;
  base.castShadow = true;
  group.add(base);
  
  // Cute peaked roof
  const roofGeo = new THREE.ConeGeometry(4.5, 2, 4);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 4.5;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  
  // Chimney with steam
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.5, 0.6),
    new THREE.MeshStandardMaterial({ color: 0xb35a1f })
  );
  chimney.position.set(1.5, 5, 0);
  group.add(chimney);
  
  // Awning over entrance
  const awningGeo = new THREE.BoxGeometry(4, 0.15, 2);
  const awning = new THREE.Mesh(
    awningGeo,
    new THREE.MeshStandardMaterial({ color: 0xff9eb5 })
  );
  awning.position.set(0, 2.8, 3);
  awning.rotation.x = 0.15;
  group.add(awning);
  
  // Striped awning detail
  const stripeGeo = new THREE.PlaneGeometry(4, 1.5);
  const stripeCanvas = document.createElement('canvas');
  stripeCanvas.width = 64;
  stripeCanvas.height = 32;
  const stripeCtx = stripeCanvas.getContext('2d');
  for (let i = 0; i < 8; i++) {
    stripeCtx.fillStyle = i % 2 === 0 ? '#ff9eb5' : '#ffffff';
    stripeCtx.fillRect(i * 8, 0, 8, 32);
  }
  const stripeTexture = new THREE.CanvasTexture(stripeCanvas);
  const stripeMat = new THREE.MeshBasicMaterial({ map: stripeTexture, side: THREE.DoubleSide });
  const awningFront = new THREE.Mesh(stripeGeo, stripeMat);
  awningFront.position.set(0, 2.1, 3.9);
  awningFront.rotation.x = Math.PI / 2 + 0.3;
  group.add(awningFront);
  
  // Windows with flower boxes
  [-1.5, 1.5].forEach(x => {
    // Window
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.1),
      trimMat
    );
    windowFrame.position.set(x, 2, 2.55);
    group.add(windowFrame);
    
    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5 })
    );
    windowGlass.position.set(x, 2, 2.56);
    group.add(windowGlass);
    
    // Flower box
    const flowerBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.3, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    flowerBox.position.set(x, 1.2, 2.7);
    group.add(flowerBox);
    
    // Flowers in box
    const flowerColors = [0xff69b4, 0xff6347, 0xffd700];
    for (let i = 0; i < 5; i++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshStandardMaterial({ color: flowerColors[i % 3] })
      );
      flower.position.set(x - 0.5 + i * 0.25, 1.45, 2.7);
      group.add(flower);
    }
  });
  
  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  door.position.set(0, 1.1, 2.55);
  group.add(door);
  
  // Sign
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xfff8dc })
  );
  signBoard.position.set(0, 3.8, 2.55);
  group.add(signBoard);
  
  // Sign text
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#654321';
  signCtx.font = 'italic bold 32px Georgia';
  signCtx.textAlign = 'center';
  signCtx.fillText('☕ The Gilded Teacup ☕', 128, 42);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signText = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signText.scale.set(3, 0.75, 1);
  signText.position.set(0, 3.8, 2.62);
  group.add(signText);
  
  // === OUTDOOR SEATING AREA ===
  const tables = [];
  const tablePositions = [
    { x: -2, z: 5 },
    { x: 2, z: 5 },
    { x: -2, z: 7 },
    { x: 2, z: 7 }
  ];
  
  tablePositions.forEach((pos, i) => {
    const table = createCafeTable();
    table.position.set(pos.x, 0, pos.z);
    group.add(table);
    tables.push({ mesh: table, position: pos, index: i });
    
    // Add chairs
    const chairOffsets = [
      { x: 0.8, z: 0, rot: -Math.PI / 2 },
      { x: -0.8, z: 0, rot: Math.PI / 2 },
      { x: 0, z: 0.8, rot: Math.PI },
      { x: 0, z: -0.8, rot: 0 }
    ];
    
    chairOffsets.forEach(offset => {
      const chair = createCafeChair();
      chair.position.set(pos.x + offset.x, 0, pos.z + offset.z);
      chair.rotation.y = offset.rot;
      group.add(chair);
    });
  });
  
  // Decorative fence around seating
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const fencePositions = [
    { start: { x: -4, z: 4 }, end: { x: -4, z: 9 } },
    { start: { x: 4, z: 4 }, end: { x: 4, z: 9 } },
    { start: { x: -4, z: 9 }, end: { x: 4, z: 9 } }
  ];
  
  fencePositions.forEach(fence => {
    const fenceGroup = createDecorativeFence(fence.start, fence.end);
    group.add(fenceGroup);
  });
  
  // Giant teacup decoration on roof
  const giantCup = createGiantTeacup();
  giantCup.position.set(0, 5.5, 0);
  giantCup.scale.setScalar(0.8);
  group.add(giantCup);
  
  group.position.set(TEA_CAFE_DATA.position.x, 0, TEA_CAFE_DATA.position.z);
  group.userData = {
    type: 'teaCafe',
    name: TEA_CAFE_DATA.name,
    tables: tables
  };
  
  return group;
}

function createCafeTable() {
  const group = new THREE.Group();
  
  // Table top
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  top.position.y = 0.75;
  top.castShadow = true;
  group.add(top);
  
  // Pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  pedestal.position.y = 0.35;
  group.add(pedestal);
  
  // Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  base.position.y = 0.025;
  group.add(base);
  
  // Teacup on table
  const teacup = createMiniTeacup();
  teacup.position.set(0.2, 0.8, 0.1);
  teacup.scale.setScalar(0.4);
  group.add(teacup);
  
  // Small vase with flower
  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.08, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xff69b4 })
  );
  vase.position.set(-0.15, 0.85, -0.1);
  group.add(vase);
  
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  );
  flower.position.set(-0.15, 1, -0.1);
  group.add(flower);
  
  return group;
}

function createCafeChair() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xff9eb5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  // Seat
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.08, 0.45),
    mat
  );
  seat.position.y = 0.45;
  group.add(seat);
  
  // Backrest
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.5, 0.08),
    mat
  );
  back.position.set(0, 0.7, -0.2);
  group.add(back);
  
  // Legs
  [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6),
      metalMat
    );
    leg.position.set(x, 0.225, z);
    group.add(leg);
  });
  
  return group;
}

// === SEATED NPCs at Tea Café ===
function createSeatedTeaNPCs() {
  const seatedNPCs = [];
  
  TEA_CAFE_DATA.seatedNPCs.forEach((npcData, i) => {
    const npc = createWanderingNPC('normal');
    
    // Position at a table
    const tableIndex = i % 4;
    const tablePos = [
      { x: TEA_CAFE_DATA.position.x - 2, z: TEA_CAFE_DATA.position.z + 5 },
      { x: TEA_CAFE_DATA.position.x + 2, z: TEA_CAFE_DATA.position.z + 5 },
      { x: TEA_CAFE_DATA.position.x - 2, z: TEA_CAFE_DATA.position.z + 7 }
    ][i];
    
    if (tablePos) {
      npc.position.set(tablePos.x + 0.8, 0.4, tablePos.z); // Seated height
      npc.rotation.y = -Math.PI / 2; // Face table
      
      // Sitting pose - scrunch down
      npc.scale.y = 0.85;
      
      npc.userData = {
        ...npcData,
        role: "Tea Enthusiast",
        isSeated: true,
        tablePosition: tablePos,
        lastQuote: Date.now() - Math.random() * 3000,
        chatOffset: Math.random() * 4000,
        // Sipping animation
        sipTimer: Math.random() * 5,
        isSipping: false
      };
      
      scene.add(npc);
      seatedNPCs.push(npc);
    }
  });
  
  return seatedNPCs;
}
```

---

### Coffee Café (The Enemy!)

```javascript
// === COFFEE CAFÉ - "The Bitter Bean" (Tea's Rival!) ===
const COFFEE_CAFE_DATA = {
  name: "The Bitter Bean",
  position: { x: 18, z: -12 },
  faction: "coffee",
  seatedNPCs: [
    { name: "Baron Espresso", quotes: ["Coffee is SUPERIOR!", "Tea is just... leaf water!", "I've had 7 cups today. ROOKIE NUMBERS."] },
    { name: "Countess Latte", quotes: ["Need... more... caffeine...", "Sleep is for the WEAK!", "Tea drinkers are so slow..."] },
    { name: "Lord Mocha", quotes: ["*intense eye twitching*", "I CAN SEE SOUNDS", "Who needs sleep anyway?!"] }
  ],
  warCries: [
    "BEANS FOREVER! 🫘",
    "Down with the leaves! ☕",
    "Coffee supremacy!",
    "Your tea is just hot leaf juice!",
    "We don't need pinkies!"
  ]
};

function createCoffeeCafe() {
  const group = new THREE.Group();
  
  // Darker, more "edgy" aesthetic
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 }); // Dark brown
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); // Almost black
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc9a86c });
  
  // Main building - slightly more angular/modern
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 4, 5),
    buildingMat
  );
  base.position.y = 2;
  base.castShadow = true;
  group.add(base);
  
  // Flat modern roof with slight angle
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.3, 5.5),
    roofMat
  );
  roof.position.y = 4.2;
  roof.rotation.z = 0.05;
  group.add(roof);
  
  // Neon-style sign (glowing)
  const neonSign = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 0.2),
    new THREE.MeshStandardMaterial({ 
      color: 0xff4500,
      emissive: 0xff4500,
      emissiveIntensity: 0.5
    })
  );
  neonSign.position.set(0, 3.5, 2.6);
  group.add(neonSign);
  
  // Sign text
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 64;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#ffffff';
  signCtx.font = 'bold 36px Impact';
  signCtx.textAlign = 'center';
  signCtx.fillText('THE BITTER BEAN', 128, 45);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(4, 1, 1);
  signSprite.position.set(0, 3.5, 2.75);
  group.add(signSprite);
  
  // Giant coffee cup on roof (rival to teacup!)
  const giantCoffee = createGiantCoffeeCup();
  giantCoffee.position.set(0, 5, 0);
  giantCoffee.scale.setScalar(0.9);
  group.add(giantCoffee);
  
  // Steam coming from cup (more aggressive than tea steam)
  // (Would add particle system here)
  
  // War banner!
  const bannerPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  bannerPole.position.set(3, 5.5, 0);
  group.add(bannerPole);
  
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1),
    new THREE.MeshStandardMaterial({ 
      color: 0xff4500,
      side: THREE.DoubleSide
    })
  );
  banner.position.set(3.8, 6.2, 0);
  group.add(banner);
  
  // Banner text: "COFFEE > TEA"
  const bannerCanvas = document.createElement('canvas');
  bannerCanvas.width = 128;
  bannerCanvas.height = 64;
  const bannerCtx = bannerCanvas.getContext('2d');
  bannerCtx.fillStyle = '#ff4500';
  bannerCtx.fillRect(0, 0, 128, 64);
  bannerCtx.fillStyle = '#ffffff';
  bannerCtx.font = 'bold 20px Arial';
  bannerCtx.textAlign = 'center';
  bannerCtx.fillText('COFFEE', 64, 25);
  bannerCtx.fillText('> TEA', 64, 50);
  
  const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
  banner.material.map = bannerTexture;
  banner.material.needsUpdate = true;
  
  group.position.set(COFFEE_CAFE_DATA.position.x, 0, COFFEE_CAFE_DATA.position.z);
  group.userData = { type: 'coffeeCafe', name: COFFEE_CAFE_DATA.name, faction: 'coffee' };
  
  return group;
}

function createGiantCoffeeCup() {
  const group = new THREE.Group();
  
  // Cup body (taller, more cylindrical than teacup)
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.5, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
  );
  cup.position.y = 0.6;
  group.add(cup);
  
  // Coffee inside
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x3d2314 })
  );
  coffee.position.y = 1.15;
  group.add(coffee);
  
  // Handle
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.08, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2d2d2d })
  );
  handle.position.set(0.75, 0.6, 0);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = Math.PI / 2;
  group.add(handle);
  
  return group;
}
```

---

### The Tea vs Coffee War System

```javascript
// === THE GREAT BEVERAGE WAR ===
const BEVERAGE_WAR = {
  active: false,
  teaScore: 0,
  coffeeScore: 0,
  warCries: {
    tea: [
      "LONG LIVE THE LEAF! 🍃",
      "Pinkies at the ready!",
      "For the Queen (Bee)!",
      "Steep and CONQUER!",
      "Our leaves will blot out the sun!",
      "Tea-riffic victory awaits!"
    ],
    coffee: [
      "BEANS FOREVER! 🫘",
      "No sleep till victory!",
      "Espresso yourself!",
      "Grind them down!",
      "We're BREWING trouble!",
      "Decaf is for quitters!"
    ]
  },
  battleEvents: [
    "scone_throwing",
    "dramatic_sipping",
    "pinkie_duel",
    "insult_exchange"
  ]
};

function createWarZone() {
  const group = new THREE.Group();
  
  // Position between the two cafes
  const zonePos = { x: 18, z: -2 };
  
  // "No Man's Land" sign
  const warSign = new THREE.Group();
  
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signPost.position.y = 1.5;
  warSign.add(signPost);
  
  // Two-sided sign
  const teaSide = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xff9eb5 })
  );
  teaSide.position.set(0, 2.8, 0.05);
  warSign.add(teaSide);
  
  const coffeeSide = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x3d2314 })
  );
  coffeeSide.position.set(0, 2.8, -0.05);
  coffeeSide.rotation.y = Math.PI;
  warSign.add(coffeeSide);
  
  // "DISPUTED TERRITORY" text
  const disputeCanvas = document.createElement('canvas');
  disputeCanvas.width = 256;
  disputeCanvas.height = 64;
  const disputeCtx = disputeCanvas.getContext('2d');
  disputeCtx.fillStyle = '#8b0000';
  disputeCtx.font = 'bold 24px Impact';
  disputeCtx.textAlign = 'center';
  disputeCtx.fillText('⚔️ DISPUTED ZONE ⚔️', 128, 40);
  
  const disputeTexture = new THREE.CanvasTexture(disputeCanvas);
  const disputeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: disputeTexture }));
  disputeSprite.scale.set(2.5, 0.6, 1);
  disputeSprite.position.set(0, 3.5, 0);
  warSign.add(disputeSprite);
  
  warSign.position.set(zonePos.x, 0, zonePos.z);
  group.add(warSign);
  
  // Battlefield markings (dramatic line on ground)
  const battleLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 15),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  battleLine.rotation.x = -Math.PI / 2;
  battleLine.position.set(zonePos.x, 0.03, zonePos.z);
  group.add(battleLine);
  
  return group;
}

// War NPCs that occasionally clash
function createWarriorNPCs() {
  const warriors = {
    tea: [],
    coffee: []
  };
  
  // Tea Warriors
  const teaWarriorData = [
    { name: "Sir Chamomile", weapon: "scone", quotes: ["For the teapot!", "Pinkies up, THEN we fight!", "You call that a brew?!"] },
    { name: "Dame Darjeeling", weapon: "teaspoon", quotes: ["Our leaves are SUPERIOR!", "I challenge you to a steep-off!", "Taste defeat! ...It's bitter, unlike our tea."] }
  ];
  
  // Coffee Warriors
  const coffeeWarriorData = [
    { name: "Captain Cappuccino", weapon: "coffee_stirrer", quotes: ["Surrender your kettle!", "We never sleep! ...literally.", "Your tea is WEAK!"] },
    { name: "Sergeant Shots", weapon: "espresso_cup", quotes: ["TRIPLE SHOT ATTACK!", "Decaf this!", "I've had 12 cups! I can see through TIME!"] }
  ];
  
  // Create Tea Warriors
  teaWarriorData.forEach((data, i) => {
    const warrior = createWanderingNPC('normal');
    warrior.position.set(TEA_CAFE_DATA.position.x - 5 + i * 2, 0, TEA_CAFE_DATA.position.z + 3);
    warrior.userData = {
      ...data,
      faction: 'tea',
      role: 'Tea Warrior',
      state: 'patrolling',
      lastWarCry: 0,
      walkAngle: Math.random() * Math.PI * 2,
      walkSpeed: 0.8,
      timer: Math.random() * 3,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 3000
    };
    scene.add(warrior);
    warriors.tea.push(warrior);
  });
  
  // Create Coffee Warriors
  coffeeWarriorData.forEach((data, i) => {
    const warrior = createWanderingNPC('fast'); // Coffee warriors are caffeinated!
    warrior.position.set(COFFEE_CAFE_DATA.position.x - 5 + i * 2, 0, COFFEE_CAFE_DATA.position.z + 3);
    warrior.userData = {
      ...data,
      faction: 'coffee',
      role: 'Coffee Warrior',
      state: 'patrolling',
      lastWarCry: 0,
      walkAngle: Math.random() * Math.PI * 2,
      walkSpeed: 1.5, // Hyper!
      timer: Math.random() * 2,
      lastQuote: Date.now(),
      chatOffset: Math.random() * 2000
    };
    scene.add(warrior);
    warriors.coffee.push(warrior);
  });
  
  return warriors;
}

// Update warriors in animate()
function updateWarriors(warriors, time, delta) {
  const warZone = { x: 18, z: -2 };
  
  // Check if warriors meet
  warriors.tea.forEach(teaWarrior => {
    warriors.coffee.forEach(coffeeWarrior => {
      const dist = teaWarrior.position.distanceTo(coffeeWarrior.position);
      
      if (dist < 4 && dist > 1) {
        // CONFRONTATION!
        teaWarrior.userData.state = 'confronting';
        coffeeWarrior.userData.state = 'confronting';
        
        // Face each other
        const toEnemy = new THREE.Vector3()
          .subVectors(coffeeWarrior.position, teaWarrior.position)
          .normalize();
        teaWarrior.rotation.y = Math.atan2(toEnemy.x, toEnemy.z);
        coffeeWarrior.rotation.y = Math.atan2(-toEnemy.x, -toEnemy.z);
        
        // Shout war cries!
        const now = Date.now();
        if (now - teaWarrior.userData.lastWarCry > 5000) {
          teaWarrior.userData.lastWarCry = now;
          showWarCry(teaWarrior, 'tea');
          showWarCry(coffeeWarrior, 'coffee');
        }
        
        // Dramatic shaking
        teaWarrior.rotation.z = Math.sin(time * 20) * 0.1;
        coffeeWarrior.rotation.z = Math.sin(time * 25) * 0.12;
        
      } else if (dist > 6) {
        teaWarrior.userData.state = 'patrolling';
        coffeeWarrior.userData.state = 'patrolling';
        teaWarrior.rotation.z = THREE.MathUtils.lerp(teaWarrior.rotation.z, 0, 0.1);
        coffeeWarrior.rotation.z = THREE.MathUtils.lerp(coffeeWarrior.rotation.z, 0, 0.1);
      }
    });
  });
  
  // Patrol behavior
  [...warriors.tea, ...warriors.coffee].forEach(warrior => {
    if (warrior.userData.state === 'patrolling') {
      warrior.userData.timer -= delta;
      if (warrior.userData.timer <= 0) {
        warrior.userData.walkAngle += (Math.random() - 0.5) * Math.PI;
        warrior.userData.timer = 2 + Math.random() * 3;
      }
      
      const speed = warrior.userData.walkSpeed * delta;
      const newX = warrior.position.x + Math.sin(warrior.userData.walkAngle) * speed;
      const newZ = warrior.position.z + Math.cos(warrior.userData.walkAngle) * speed;
      
      // Stay near war zone
      const distToZone = Math.hypot(newX - warZone.x, newZ - warZone.z);
      if (distToZone < 12 && !checkCollision(newX, newZ)) {
        warrior.position.x = newX;
        warrior.position.z = newZ;
      } else {
        warrior.userData.walkAngle += Math.PI;
      }
      
      warrior.rotation.y = warrior.userData.walkAngle;
      
      // Walk animation
      if (warrior.userData.faction === 'coffee') {
        warrior.rotation.z = Math.sin(time * 20) * 0.15; // Jittery
        warrior.position.y = Math.abs(Math.sin(time * 25)) * 0.15;
      } else {
        warrior.rotation.z = Math.sin(time * 10) * 0.08;
        warrior.position.y = Math.abs(Math.sin(time * 12)) * 0.08;
      }
    }
  });
}

function showWarCry(npc, faction) {
  const cries = BEVERAGE_WAR.warCries[faction];
  const cry = cries[Math.floor(Math.random() * cries.length)];
  
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;
  
  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
  
  const msg = document.createElement('div');
  msg.className = 'floating-message war-cry';
  msg.textContent = cry;
  msg.style.left = x + 'px';
  msg.style.top = (y - 100) + 'px';
  msg.style.fontSize = '1.2rem';
  msg.style.fontWeight = 'bold';
  msg.style.color = faction === 'tea' ? '#ff69b4' : '#ff4500';
  msg.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3500);
}
```

---

## 🎣 THE RIVER & FISHING DISTRICT

### River System

```javascript
// === AUSTINVILLE RIVER ===
const RIVER_CONFIG = {
  path: [
    { x: -45, z: -25 },
    { x: -30, z: -28 },
    { x: -15, z: -25 },
    { x: 0, z: -28 },
    { x: 15, z: -30 },
    { x: 30, z: -27 },
    { x: 45, z: -25 }
  ],
  width: 6,
  depth: 0.5,
  flowSpeed: 0.8
};

function createRiver() {
  const riverGroup = new THREE.Group();
  
  // Create river bed
  const curve = new THREE.CatmullRomCurve3(
    RIVER_CONFIG.path.map(p => new THREE.Vector3(p.x, -0.3, p.z))
  );
  
  // River geometry following curve
  const riverShape = new THREE.Shape();
  riverShape.moveTo(0, -RIVER_CONFIG.width / 2);
  riverShape.lineTo(0, RIVER_CONFIG.width / 2);
  
  const extrudeSettings = {
    steps: 50,
    bevelEnabled: false,
    extrudePath: curve
  };
  
  // River bed (darker)
  const bedGeo = new THREE.ExtrudeGeometry(riverShape, extrudeSettings);
  const bedMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a6741,
    roughness: 1
  });
  const riverBed = new THREE.Mesh(bedGeo, bedMat);
  riverBed.rotation.x = Math.PI / 2;
  riverGroup.add(riverBed);
  
  // Water surface (animated)
  const waterGeo = new THREE.PlaneGeometry(90, RIVER_CONFIG.width, 50, 5);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4a90b8,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.2
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.05, -27);
  water.userData.isWater = true;
  riverGroup.add(water);
  
  // Rocks in river
  const rockPositions = [
    { x: -20, z: -26, scale: 0.8 },
    { x: -5, z: -28, scale: 1.2 },
    { x: 10, z: -27, scale: 0.6 },
    { x: 25, z: -29, scale: 1 },
    { x: -35, z: -26, scale: 0.9 }
  ];
  
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.9 });
  
  rockPositions.forEach(pos => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.5 * pos.scale, 1),
      rockMat
    );
    rock.position.set(pos.x, 0.1, pos.z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.castShadow = true;
    riverGroup.add(rock);
  });
  
  return riverGroup;
}

// Animated water in animate()
function updateRiver(time) {
  scene.traverse(obj => {
    if (obj.userData.isWater) {
      // Gentle wave animation
      const positions = obj.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const wave = Math.sin(x * 0.2 + time * RIVER_CONFIG.flowSpeed) * 0.1;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }
  });
}
```

### Jumping Fish

```javascript
// === JUMPING FISH ===
const fishArray = [];
const FISH_COUNT = 8;

function createFish() {
  const group = new THREE.Group();
  
  // Body
  const bodyGeo = new THREE.SphereGeometry(0.15, 8, 8);
  bodyGeo.scale(2, 1, 0.8);
  const fishColors = [0xffa500, 0xff6347, 0x4169e1, 0x32cd32];
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: fishColors[Math.floor(Math.random() * fishColors.length)],
    roughness: 0.3,
    metalness: 0.5
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);
  
  // Tail
  const tailGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.3;
  group.add(tail);
  
  // Eye
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  eye.position.set(0.2, 0.05, 0.1);
  group.add(eye);
  
  return group;
}

function createJumpingFish() {
  for (let i = 0; i < FISH_COUNT; i++) {
    const fish = createFish();
    
    // Random position along river
    const riverX = -35 + Math.random() * 70;
    const riverZ = -28 + (Math.random() - 0.5) * 4;
    
    fish.position.set(riverX, -0.5, riverZ);
    fish.visible = false; // Start hidden underwater
    
    fish.userData = {
      baseX: riverX,
      baseZ: riverZ,
      jumpTimer: Math.random() * 10, // Staggered jumps
      jumpDuration: 0,
      isJumping: false,
      jumpHeight: 1.5 + Math.random() * 1,
      jumpCooldown: 5 + Math.random() * 8
    };
    
    scene.add(fish);
    fishArray.push(fish);
  }
}

function updateJumpingFish(time, delta) {
  fishArray.forEach(fish => {
    const data = fish.userData;
    
    if (!data.isJumping) {
      data.jumpTimer -= delta;
      
      if (data.jumpTimer <= 0) {
        // START JUMP!
        data.isJumping = true;
        data.jumpDuration = 0;
        fish.visible = true;
        
        // Splash particle (simplified - would use particle system)
        createSplashEffect(fish.position.clone());
      }
    } else {
      // Jumping arc
      data.jumpDuration += delta;
      const jumpProgress = data.jumpDuration / 1.2; // 1.2 second jump
      
      if (jumpProgress >= 1) {
        // Land back in water
        data.isJumping = false;
        data.jumpTimer = data.jumpCooldown;
        fish.visible = false;
        fish.position.y = -0.5;
        
        // Landing splash
        createSplashEffect(fish.position.clone());
      } else {
        // Parabolic arc
        const arc = Math.sin(jumpProgress * Math.PI);
        fish.position.y = arc * data.jumpHeight;
        
        // Rotation during jump
        fish.rotation.z = (jumpProgress - 0.5) * Math.PI * 0.8;
        
        // Slight forward movement
        fish.position.x = data.baseX + jumpProgress * 1.5;
        
        // Wiggle
        fish.rotation.y = Math.sin(time * 15) * 0.3;
      }
    }
  });
}

function createSplashEffect(position) {
  // Create quick splash sprite
  const splashGeo = new THREE.CircleGeometry(0.3, 8);
  const splashMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const splash = new THREE.Mesh(splashGeo, splashMat);
  splash.position.copy(position);
  splash.position.y = 0.1;
  splash.rotation.x = -Math.PI / 2;
  scene.add(splash);
  
  // Animate and remove
  let scale = 0.3;
  const animateSplash = () => {
    scale += 0.1;
    splash.scale.setScalar(scale);
    splash.material.opacity -= 0.05;
    
    if (splash.material.opacity > 0) {
      requestAnimationFrame(animateSplash);
    } else {
      scene.remove(splash);
      splash.geometry.dispose();
      splash.material.dispose();
    }
  };
  animateSplash();
}
```

### Fishing NPCs

```javascript
// === FISHING NPCs ===
const FISHERMEN = [
  {
    name: "Old Timer Pete",
    role: "Professional Napper",
    position: { x: -25, z: -23 },
    quotes: [
      "*snore* ...huh? Oh, fishing! Yes, very busy fishing.",
      "I've been here since 1987. The fish respect my commitment.",
      "The secret is to look like you're sleeping. The fish let their guard down.",
      "I once caught a fish THIS big! ...then I woke up.",
      "My wife thinks I'm at the doctor's."
    ],
    isSleeping: true,
    animation: 'sleeping'
  },
  {
    name: "Little Timmy",
    role: "Aspiring Fisher Kid",
    position: { x: -22, z: -23 },
    quotes: [
      "I'm gonna catch a WHALE!",
      "Grandpa taught me that patience is— OH A BUTTERFLY!",
      "Is that a fish? ...no, it's a stick.",
      "MOM! MOM LOOK! ...oh, she's not here.",
      "The fish are just shy. Like me at school."
    ],
    animation: 'fishing_excited'
  },
  {
    name: "Competitive Carl",
    role: "Self-Proclaimed Champion",
    position: { x: -28, z: -23 },
    quotes: [
      "I WILL catch more fish than Timmy. It's a matter of HONOR.",
      "That kid caught ONE fish and now he thinks he's special.",
      "The leaderboard doesn't lie! I'm NUMBER ONE! ...ignore the zeros.",
      "This is my LUCKY spot. I've been lucky for 47 tries.",
      "A true champion never gives up! ...or catches anything."
    ],
    animation: 'fishing_intense'
  }
];

function createFishingDock() {
  const group = new THREE.Group();
  
  // Wooden dock
  const dockMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
  
  // Main platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.3, 4),
    dockMat
  );
  platform.position.set(0, 0.5, 0);
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);
  
  // Support poles
  [[-3.5, -1.5], [-3.5, 1.5], [3.5, -1.5], [3.5, 1.5]].forEach(([x, z]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
      dockMat
    );
    pole.position.set(x, -0.1, z);
    group.add(pole);
  });
  
  // Railing
  const railMat = new THREE.MeshStandardMaterial({ color: 0x6b5a45 });
  [[-4, 0], [4, 0]].forEach(([x, z]) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6),
      railMat
    );
    post.position.set(x, 1.1, z - 1.8);
    group.add(post);
  });
  
  // Top rail
  const rail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 8.5, 6),
    railMat
  );
  rail.position.set(0, 1.6, -1.8);
  rail.rotation.z = Math.PI / 2;
  group.add(rail);
  
  // "FISHING SPOT" sign
  const signGroup = createBuildingSign("🎣 AUSTINVILLE FISHING DOCK 🎣", 0xfff8dc, 0x8b4513);
  signGroup.position.set(0, 2.5, -1.5);
  group.add(signGroup);
  
  // Bucket with "catches"
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
  );
  bucket.position.set(2, 0.85, 0.5);
  group.add(bucket);
  
  group.position.set(-25, 0, -23);
  
  return group;
}

function createFisherman(data) {
  const npc = createWanderingNPC('slow'); // Fishermen are chill
  
  // Add fishing rod
  const rodGroup = new THREE.Group();
  
  // Rod
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 1.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  rod.rotation.x = 0.3;
  rod.position.set(0.4, 0.8, 0.5);
  rodGroup.add(rod);
  
  // Line
  const lineGeo = new THREE.BufferGeometry();
  const linePoints = [
    new THREE.Vector3(0.4, 1.5, 1.2),
    new THREE.Vector3(0.4, 0.3, 3)
  ];
  lineGeo.setFromPoints(linePoints);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0x888888 })
  );
  rodGroup.add(line);
  
  // Bobber
  const bobber = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
  );
  bobber.position.set(0.4, 0.3, 3);
  rodGroup.add(bobber);
  
  npc.add(rodGroup);
  
  npc.position.set(data.position.x, 0, data.position.z);
  npc.rotation.y = Math.PI; // Face water
  
  npc.userData = {
    ...data,
    isFishing: true,
    catchTimer: 5 + Math.random() * 10,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 5000,
    walkSpeed: 0, // Stationary
    rod: rodGroup,
    bobber: bobber
  };
  
  return npc;
}

function updateFishermen(fishermen, time, delta) {
  fishermen.forEach(npc => {
    const data = npc.userData;
    
    // Bobber animation
    if (data.bobber) {
      data.bobber.position.y = 0.3 + Math.sin(time * 2) * 0.05;
    }
    
    // Occasional "catch" attempt
    data.catchTimer -= delta;
    if (data.catchTimer <= 0) {
      data.catchTimer = 8 + Math.random() * 15;
      
      // React!
      if (data.name === "Old Timer Pete") {
        // Pete wakes up briefly
        showFloatingMessage(npc);
      } else if (data.name === "Little Timmy") {
        // Timmy gets excited
        npc.rotation.z = Math.sin(time * 30) * 0.2;
        setTimeout(() => {
          npc.rotation.z = 0;
          showFishingResult(npc, Math.random() < 0.3); // 30% catch rate
        }, 1500);
      }
    }
    
    // Animation based on type
    if (data.animation === 'sleeping') {
      // Gentle breathing motion
      npc.scale.y = 0.95 + Math.sin(time * 0.5) * 0.03;
    } else if (data.animation === 'fishing_excited') {
      // Fidgety
      npc.rotation.z = Math.sin(time * 3) * 0.05;
    } else if (data.animation === 'fishing_intense') {
      // Tense, leaning forward
      npc.rotation.x = 0.1 + Math.sin(time * 0.5) * 0.02;
    }
  });
}

function showFishingResult(npc, caught) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;
  
  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
  
  const msg = document.createElement('div');
  msg.className = 'floating-message';
  
  if (caught) {
    msg.textContent = npc.userData.name === "Little Timmy" 
      ? "I CAUGHT ONE!! 🐟🎉" 
      : "Finally! ...wait, that's a boot. 👢";
    msg.style.color = '#32cd32';
  } else {
    const misses = [
      "It got away! 😭",
      "SO CLOSE!",
      "The fish mocked me...",
      "Next time for sure!",
      "I FELT A NIBBLE!"
    ];
    msg.textContent = misses[Math.floor(Math.random() * misses.length)];
    msg.style.color = '#ff6347';
  }
  
  msg.style.left = x + 'px';
  msg.style.top = (y - 80) + 'px';
  msg.style.fontSize = '1.1rem';
  msg.style.fontWeight = 'bold';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
```

---

## 🌉 WOODEN BRIDGES

```javascript
// === WOODEN BRIDGE ===
function createWoodenBridge(start, end, archHeight = 1) {
  const group = new THREE.Group();
  
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
  );
  const segments = Math.ceil(length / 0.5);
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb5a642 });
  
  // Bridge planks (arched)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const archY = Math.sin(t * Math.PI) * archHeight;
    
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 0.4),
      woodMat
    );
    plank.position.set(
      THREE.MathUtils.lerp(start.x, end.x, t),
      0.3 + archY,
      THREE.MathUtils.lerp(start.z, end.z, t)
    );
    plank.rotation.y = Math.atan2(end.z - start.z, end.x - start.x);
    plank.castShadow = true;
    plank.receiveShadow = true;
    group.add(plank);
  }
  
  // Rope railings
  [-0.9, 0.9].forEach(side => {
    // Posts
    for (let i = 0; i <= segments; i += 3) {
      const t = i / segments;
      const archY = Math.sin(t * Math.PI) * archHeight;
      
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6),
        woodMat
      );
      post.position.set(
        THREE.MathUtils.lerp(start.x, end.x, t) + side * Math.cos(Math.atan2(end.z - start.z, end.x - start.x) + Math.PI/2),
        0.7 + archY,
        THREE.MathUtils.lerp(start.z, end.z, t) + side * Math.sin(Math.atan2(end.z - start.z, end.x - start.x) + Math.PI/2)
      );
      group.add(post);
    }
    
    // Rope (simplified as tube)
    const ropePoints = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const archY = Math.sin(t * Math.PI) * archHeight;
      const sag = Math.sin(t * Math.PI) * 0.1;
      
      ropePoints.push(new THREE.Vector3(
        THREE.MathUtils.lerp(start.x, end.x, t) + side * 0.9,
        1 + archY - sag,
        THREE.MathUtils.lerp(start.z, end.z, t)
      ));
    }
    
    const ropeCurve = new THREE.CatmullRomCurve3(ropePoints);
    const ropeGeo = new THREE.TubeGeometry(ropeCurve, 20, 0.03, 6, false);
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    group.add(rope);
  });
  
  return group;
}

// Create bridges
function createAllBridges() {
  const bridges = [];
  
  // Main bridge over river
  const bridge1 = createWoodenBridge(
    { x: 5, z: -24 },
    { x: 5, z: -32 },
    0.8
  );
  scene.add(bridge1);
  bridges.push(bridge1);
  
  // Smaller decorative bridge
  const bridge2 = createWoodenBridge(
    { x: -10, z: -24 },
    { x: -10, z: -30 },
    0.5
  );
  scene.add(bridge2);
  bridges.push(bridge2);
  
  return bridges;
}
```

---

## 🥊 THE BOXING RING

```javascript
// === THE ROYAL RUMBLE RING ===
const BOXING_RING_DATA = {
  name: "The Royal Rumble",
  position: { x: -22, z: -8 },
  fighters: [
    {
      name: "Sir Slips-a-Lot",
      quotes: [
        "*trips over own feet*",
        "I MEANT to do that!",
        "The floor is my ally!",
        "En garde! ...where'd my sword go?",
        "I've trained for YEARS! ...in falling."
      ],
      color: 0xff6b6b
    },
    {
      name: "Lord Fumbles",
      quotes: [
        "*drops shield for the 5th time*",
        "These gauntlets are too slippery!",
        "CHARGE! ...wrong direction.",
        "My honor demands— *falls*",
        "Best two out of three! ...hundred."
      ],
      color: 0x6b9eff
    }
  ],
  announcer: {
    name: "Duke Dramatic",
    role: "Official Commentator",
    quotes: [
      "AND HE'S DOWN! ...again.",
      "WHAT A MOVE! What was it? Nobody knows!",
      "The crowd goes MILD!",
      "In my 40 years of commentary, I've never seen... whatever that was.",
      "Ladies and gentlemen, we have a... tie? They both fell."
    ]
  }
};

function createBoxingRing() {
  const group = new THREE.Group();
  
  // Ring platform
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 8),
    platformMat
  );
  platform.position.y = 0.25;
  platform.castShadow = true;
  platform.receiveShadow = true;
  group.add(platform);
  
  // Ring mat
  const matCanvas = document.createElement('canvas');
  matCanvas.width = 256;
  matCanvas.height = 256;
  const matCtx = matCanvas.getContext('2d');
  matCtx.fillStyle = '#dc143c';
  matCtx.fillRect(0, 0, 256, 256);
  matCtx.fillStyle = '#ffd700';
  matCtx.font = 'bold 40px Impact';
  matCtx.textAlign = 'center';
  matCtx.fillText('ROYAL', 128, 100);
  matCtx.fillText('RUMBLE', 128, 150);
  matCtx.strokeStyle = '#ffffff';
  matCtx.lineWidth = 10;
  matCtx.strokeRect(20, 20, 216, 216);
  
  const matTexture = new THREE.CanvasTexture(matCanvas);
  const ringMat = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 7.5),
    new THREE.MeshStandardMaterial({ map: matTexture })
  );
  ringMat.rotation.x = -Math.PI / 2;
  ringMat.position.y = 0.51;
  group.add(ringMat);
  
  // Corner posts
  const postMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 });
  const postPositions = [
    [-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]
  ];
  const cornerColors = [0xff0000, 0x0000ff, 0xff0000, 0x0000ff];
  
  postPositions.forEach(([x, z], i) => {
    // Post
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8),
      postMat
    );
    post.position.set(x, 1.4, z);
    group.add(post);
    
    // Corner pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshStandardMaterial({ color: cornerColors[i] })
    );
    pad.position.set(x, 0.7, z);
    group.add(pad);
  });
  
  // Ropes (3 levels)
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  [0.8, 1.3, 1.8].forEach(height => {
    // Create rope around ring
    [
      [[-3.5, -3.5], [3.5, -3.5]],
      [[3.5, -3.5], [3.5, 3.5]],
      [[3.5, 3.5], [-3.5, 3.5]],
      [[-3.5, 3.5], [-3.5, -3.5]]
    ].forEach(([start, end]) => {
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 7, 6),
        ropeMat
      );
      rope.position.set(
        (start[0] + end[0]) / 2,
        height,
        (start[1] + end[1]) / 2
      );
      rope.rotation.z = Math.PI / 2;
      if (start[0] === end[0]) rope.rotation.y = Math.PI / 2;
      group.add(rope);
    });
  });
  
  // Announcer booth
  const booth = new THREE.Group();
  const boothBase = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  boothBase.position.set(5, 0.75, 0);
  booth.add(boothBase);
  
  // "COMMENTARY" sign
  const commentarySign = createBuildingSign("📢 COMMENTARY", 0xffd700, 0x000000);
  commentarySign.position.set(5, 2, 0);
  commentarySign.scale.setScalar(0.6);
  booth.add(commentarySign);
  
  group.add(booth);
  
  // Main sign
  const mainSign = new THREE.Group();
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.5, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  signBoard.position.y = 4;
  mainSign.add(signBoard);
  
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#1a1a1a';
  signCtx.fillRect(0, 0, 512, 128);
  signCtx.fillStyle = '#ffd700';
  signCtx.font = 'bold 48px Impact';
  signCtx.textAlign = 'center';
  signCtx.fillText('⚔️ THE ROYAL RUMBLE ⚔️', 256, 75);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(5, 1.2, 1);
  signSprite.position.y = 4;
  signSprite.position.z = 0.15;
  mainSign.add(signSprite);
  
  group.add(mainSign);
  
  group.position.set(BOXING_RING_DATA.position.x, 0, BOXING_RING_DATA.position.z);
  
  return group;
}

// Create the hapless fighters
function createBoxingKnights() {
  const fighters = [];
  
  BOXING_RING_DATA.fighters.forEach((data, i) => {
    const knight = createWanderingNPC('normal');
    
    // Position in ring
    const xOffset = i === 0 ? -1.5 : 1.5;
    knight.position.set(
      BOXING_RING_DATA.position.x + xOffset,
      0.5, // On platform
      BOXING_RING_DATA.position.z
    );
    
    // Face opponent
    knight.rotation.y = i === 0 ? Math.PI / 2 : -Math.PI / 2;
    
    // Add "sword" (pool noodle)
    const sword = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: data.color })
    );
    sword.position.set(0.5, 0.8, 0);
    sword.rotation.z = Math.PI / 4;
    knight.add(sword);
    
    // Add tiny shield (pot lid)
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.25, 0.05, 12),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8 })
    );
    shield.position.set(-0.4, 0.7, 0.3);
    shield.rotation.x = Math.PI / 3;
    knight.add(shield);
    
    knight.userData = {
      ...data,
      role: "Valiant Knight (?)",
      isFighter: true,
      fightState: 'ready', // ready, attacking, falling, recovering
      attackTimer: 2 + Math.random() * 3,
      fallTimer: 0,
      wins: 0,
      losses: 0, // Many losses
      lastQuote: Date.now(),
      chatOffset: Math.random() * 3000,
      opponent: null,
      sword,
      shield
    };
    
    scene.add(knight);
    fighters.push(knight);
  });
  
  // Link opponents
  fighters[0].userData.opponent = fighters[1];
  fighters[1].userData.opponent = fighters[0];
  
  // Create announcer
  const announcer = createWanderingNPC('normal');
  announcer.position.set(
    BOXING_RING_DATA.position.x + 5,
    0,
    BOXING_RING_DATA.position.z
  );
  announcer.rotation.y = -Math.PI / 2;
  
  announcer.userData = {
    ...BOXING_RING_DATA.announcer,
    isAnnouncer: true,
    commentTimer: 3 + Math.random() * 4,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 2000,
    walkSpeed: 0
  };
  scene.add(announcer);
  fighters.push(announcer);
  
  return fighters;
}

function updateBoxingRing(fighters, time, delta) {
  const ringCenter = BOXING_RING_DATA.position;
  
  fighters.filter(f => f.userData.isFighter).forEach(knight => {
    const data = knight.userData;
    const opponent = data.opponent;
    
    switch (data.fightState) {
      case 'ready':
        // Bounce threateningly
        knight.position.y = 0.5 + Math.abs(Math.sin(time * 5)) * 0.1;
        
        // Wave sword dramatically
        if (data.sword) {
          data.sword.rotation.z = Math.PI / 4 + Math.sin(time * 3) * 0.3;
        }
        
        data.attackTimer -= delta;
        if (data.attackTimer <= 0) {
          data.fightState = 'attacking';
          data.attackTimer = 0;
        }
        break;
        
      case 'attacking':
        // Lunge forward!
        data.attackTimer += delta;
        const lungeProgress = Math.min(data.attackTimer / 0.5, 1);
        
        const dirToOpponent = knight.position.x < ringCenter.x ? 1 : -1;
        knight.position.x += dirToOpponent * delta * 5;
        
        // Swing sword
        if (data.sword) {
          data.sword.rotation.z = Math.PI / 4 - lungeProgress * Math.PI / 2;
        }
        
        // Did we "connect"? (Always fail hilariously)
        if (lungeProgress >= 1) {
          // Random fail type
          const failType = Math.floor(Math.random() * 4);
          
          if (failType === 0) {
            // Trip over nothing
            data.fightState = 'falling';
          } else if (failType === 1) {
            // Drop weapon
            if (data.sword) {
              data.sword.visible = false;
              setTimeout(() => data.sword.visible = true, 2000);
            }
            data.fightState = 'recovering';
          } else if (failType === 2) {
            // Both fall!
            data.fightState = 'falling';
            if (opponent) opponent.userData.fightState = 'falling';
          } else {
            // Miss spectacularly
            knight.rotation.z = Math.PI / 2; // Spin!
            data.fightState = 'recovering';
          }
          
          data.fallTimer = 0;
          showFloatingMessage(knight);
        }
        break;
        
      case 'falling':
        data.fallTimer += delta;
        
        // Fall animation
        knight.rotation.z = THREE.MathUtils.lerp(
          knight.rotation.z,
          Math.PI / 2,
          0.2
        );
        knight.position.y = Math.max(0.2, 0.5 - data.fallTimer);
        
        if (data.fallTimer > 2) {
          data.fightState = 'recovering';
          data.fallTimer = 0;
          data.losses++;
        }
        break;
        
      case 'recovering':
        data.fallTimer += delta;
        
        // Get back up slowly
        knight.rotation.z = THREE.MathUtils.lerp(knight.rotation.z, 0, 0.05);
        knight.position.y = THREE.MathUtils.lerp(knight.position.y, 0.5, 0.05);
        
        // Return to starting position
        const startX = knight.position.x < ringCenter.x 
          ? ringCenter.x - 1.5 
          : ringCenter.x + 1.5;
        knight.position.x = THREE.MathUtils.lerp(knight.position.x, startX, 0.03);
        
        if (data.fallTimer > 3 && Math.abs(knight.rotation.z) < 0.1) {
          data.fightState = 'ready';
          data.attackTimer = 2 + Math.random() * 3;
        }
        break;
    }
  });
  
  // Announcer commentary
  const announcer = fighters.find(f => f.userData.isAnnouncer);
  if (announcer) {
    announcer.userData.commentTimer -= delta;
    if (announcer.userData.commentTimer <= 0) {
      announcer.userData.commentTimer = 5 + Math.random() * 8;
      showFloatingMessage(announcer);
    }
    
    // Lean into microphone
    announcer.rotation.x = Math.sin(time * 0.5) * 0.1;
  }
}
```

---

## 🎪 THE TRAMPOLINE

```javascript
// === ROYAL BOUNCE ZONE ===
const TRAMPOLINE_DATA = {
  position: { x: -22, z: 5 },
  radius: 3,
  bouncePower: 15, // How high they go!
  quotes: [
    "WHEEEEE! 🎉",
    "I CAN SEE MY HOUSE!",
    "Is this... flying?!",
    "THE CLOUDS! I'm touching the CLOUDS!",
    "I immediately regret this!",
    "MY CROWN! 👑",
    "This is UNDIGNIFIED! ...do it again!"
  ]
};

function createTrampoline() {
  const group = new THREE.Group();
  
  // Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4169e1 });
  
  // Legs
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.8, 6),
      frameMat
    );
    leg.position.set(
      Math.cos(angle) * TRAMPOLINE_DATA.radius,
      0.4,
      Math.sin(angle) * TRAMPOLINE_DATA.radius
    );
    group.add(leg);
  }
  
  // Rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(TRAMPOLINE_DATA.radius, 0.15, 8, 32),
    frameMat
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.8;
  group.add(rim);
  
  // Bounce surface
  const surfaceMat = new THREE.MeshStandardMaterial({ 
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.9
  });
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(TRAMPOLINE_DATA.radius - 0.2, 32),
    surfaceMat
  );
  surface.rotation.x = -Math.PI / 2;
  surface.position.y = 0.75;
  surface.userData.isTrampoline = true;
  group.add(surface);
  
  // Safety padding (colorful)
  const padColors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 0.4),
      new THREE.MeshStandardMaterial({ color: padColors[i % 4] })
    );
    pad.position.set(
      Math.cos(angle) * TRAMPOLINE_DATA.radius,
      0.85,
      Math.sin(angle) * TRAMPOLINE_DATA.radius
    );
    pad.rotation.y = angle + Math.PI / 2;
    group.add(pad);
  }
  
  // "ROYAL BOUNCE" sign
  const signPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signPost.position.set(TRAMPOLINE_DATA.radius + 1, 1.5, 0);
  group.add(signPost);
  
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#4169e1';
  signCtx.fillRect(0, 0, 256, 128);
  signCtx.fillStyle = '#ffffff';
  signCtx.font = 'bold 28px Arial';
  signCtx.textAlign = 'center';
  signCtx.fillText('🎪 ROYAL BOUNCE 🎪', 128, 50);
  signCtx.font = '18px Arial';
  signCtx.fillText('Crown holders bounce free!', 128, 85);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(2.5, 1.2, 1);
  signSprite.position.set(TRAMPOLINE_DATA.radius + 1, 2.8, 0);
  group.add(signSprite);
  
  group.position.set(TRAMPOLINE_DATA.position.x, 0, TRAMPOLINE_DATA.position.z);
  
  return group;
}

// Trampoline physics for player
function checkTrampolineCollision(playerPos) {
  const trampolineCenter = TRAMPOLINE_DATA.position;
  const dist = Math.hypot(
    playerPos.x - trampolineCenter.x,
    playerPos.z - trampolineCenter.z
  );
  
  return dist < TRAMPOLINE_DATA.radius - 0.5;
}

// Player bounce state
const bounceState = {
  isBouncing: false,
  bounceVelocity: 0,
  bounceHeight: 0,
  maxHeight: 0
};

function updatePlayerBounce(delta) {
  const onTrampoline = checkTrampolineCollision(player.position);
  
  if (onTrampoline && !bounceState.isBouncing) {
    // Start bounce!
    bounceState.isBouncing = true;
    bounceState.bounceVelocity = TRAMPOLINE_DATA.bouncePower;
    bounceState.maxHeight = 8 + Math.random() * 4; // Vary height
    
    // Show quote
    const quote = TRAMPOLINE_DATA.quotes[
      Math.floor(Math.random() * TRAMPOLINE_DATA.quotes.length)
    ];
    showBounceQuote(quote);
  }
  
  if (bounceState.isBouncing) {
    // Physics!
    bounceState.bounceVelocity -= 25 * delta; // Gravity
    bounceState.bounceHeight += bounceState.bounceVelocity * delta;
    
    // Clamp height
    bounceState.bounceHeight = Math.max(0, bounceState.bounceHeight);
    
    // Apply to player
    player.position.y = player.userData.baseY + bounceState.bounceHeight + 0.8;
    
    // Spin in air!
    if (bounceState.bounceHeight > 2) {
      player.rotation.x = Math.sin(bounceState.bounceHeight * 0.5) * 0.3;
      player.rotation.z = Math.sin(bounceState.bounceHeight * 0.8) * 0.4;
    }
    
    // Land
    if (bounceState.bounceHeight <= 0 && bounceState.bounceVelocity < 0) {
      bounceState.isBouncing = false;
      bounceState.bounceHeight = 0;
      bounceState.bounceVelocity = 0;
      player.rotation.x = 0;
      player.rotation.z = 0;
      
      // Bounce again if still on trampoline
      if (onTrampoline) {
        bounceState.bounceVelocity = TRAMPOLINE_DATA.bouncePower * 0.8;
        bounceState.isBouncing = true;
      }
    }
  }
}

function showBounceQuote(quote) {
  const popup = document.createElement('div');
  popup.className = 'bounce-quote';
  popup.textContent = quote;
  popup.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    font-weight: bold;
    color: #4169e1;
    text-shadow: 2px 2px 4px white;
    animation: bounceQuote 1.5s ease-out forwards;
    z-index: 1000;
    pointer-events: none;
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

// CSS for bounce quote
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
  @keyframes bounceQuote {
    0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(0.5); }
    50% { transform: translateX(-50%) translateY(-50px) scale(1.2); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-100px) scale(1); }
  }
`;
document.head.appendChild(bounceStyle);
```

---

## 🎀 ADDITIONAL SHOPS & BUILDINGS

### The Donut Shop

```javascript
const DONUT_SHOP = {
  name: "Glazed & Confused",
  position: { x: 8, z: -25 },
  owner: {
    name: "Baker Betty",
    quotes: [
      "Donuts are just bagels that believed in themselves.",
      "I've eaten my own inventory. AGAIN.",
      "Calories don't count if nobody sees you eat them!",
      "The secret ingredient is... more sugar.",
      "I haven't slept in 3 days. These donuts keep me going!"
    ]
  }
};

function createDonutShop() {
  const group = new THREE.Group();
  
  // Building - round to match donuts!
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
  
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4.5, 4, 16),
    buildingMat
  );
  body.position.y = 2;
  body.castShadow = true;
  group.add(body);
  
  // Roof shaped like a donut!
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const glazeMat = new THREE.MeshStandardMaterial({ 
    color: 0xff69b4,
    roughness: 0.3
  });
  
  // Donut torus
  const donutRoof = new THREE.Mesh(
    new THREE.TorusGeometry(3, 1.2, 16, 32),
    roofMat
  );
  donutRoof.rotation.x = Math.PI / 2;
  donutRoof.position.y = 5;
  group.add(donutRoof);
  
  // Glaze on top
  const glaze = new THREE.Mesh(
    new THREE.TorusGeometry(3, 1.3, 16, 32, Math.PI),
    glazeMat
  );
  glaze.rotation.x = Math.PI / 2;
  glaze.position.y = 5.3;
  group.add(glaze);
  
  // Sprinkles!
  const sprinkleColors = [0xff0000, 0xffff00, 0x00ff00, 0x0000ff, 0xff00ff];
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.5 + Math.random() * 1;
    const sprinkle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.2, 4),
      new THREE.MeshStandardMaterial({ color: sprinkleColors[Math.floor(Math.random() * 5)] })
    );
    sprinkle.position.set(
      Math.cos(angle) * radius,
      5.8,
      Math.sin(angle) * radius
    );
    sprinkle.rotation.x = Math.random() * Math.PI;
    sprinkle.rotation.z = Math.random() * Math.PI;
    group.add(sprinkle);
  }
  
  // Sign
  const sign = createBuildingSign("🍩 GLAZED & CONFUSED 🍩", 0xfff0f5, 0x8b4513);
  sign.position.set(0, 3, 4.6);
  group.add(sign);
  
  group.position.set(DONUT_SHOP.position.x, 0, DONUT_SHOP.position.z);
  
  return group;
}
```

### The Pinkie Technique School

```javascript
const PINKIE_SCHOOL = {
  name: "Madame Pinkie's Academy of Proper Tea Etiquette",
  position: { x: -18, z: 12 },
  teacher: {
    name: "Madame Pinkie",
    role: "Grand Master of the Pinkie Arts",
    quotes: [
      "Pinkie at 45 degrees! No, 47 is UNACCEPTABLE!",
      "I've trained pinkies for 40 years. FORTY. YEARS.",
      "Your pinkie lacks DISCIPLINE!",
      "In my day, we practiced 8 hours a day!",
      "The perfect pinkie tells the world you have CLASS!",
      "I once saw a 90-degree pinkie. I still have nightmares."
    ]
  },
  students: [
    { name: "Struggling Steve", quote: "*pinkie twitches uncontrollably*" },
    { name: "Perfectionist Patty", quote: "Is THIS 45 degrees? IS IT?!" },
    { name: "Confused Carl", quote: "Which finger is the pinkie again?" }
  ]
};

function createPinkieSchool() {
  const group = new THREE.Group();
  
  // Victorian-style building
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xdda0dd }); // Plum
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x4b0082 }); // Indigo
  
  // Main building
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 5),
    buildingMat
  );
  main.position.y = 2;
  main.castShadow = true;
  group.add(main);
  
  // Elaborate roof with dormers
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5, 2.5, 4),
    roofMat
  );
  roof.position.y = 5.25;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  
  // Giant pinkie statue on roof
  const pinkieGroup = createGiantPinkie();
  pinkieGroup.position.y = 6.5;
  pinkieGroup.scale.setScalar(0.8);
  group.add(pinkieGroup);
  
  // Windows with students visible
  // (Would add window meshes with student silhouettes)
  
  // Sign with fancy font
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#4b0082';
  signCtx.fillRect(0, 0, 512, 128);
  signCtx.fillStyle = '#ffd700';
  signCtx.font = 'italic 24px Georgia';
  signCtx.textAlign = 'center';
  signCtx.fillText("✨ Madame Pinkie's Academy ✨", 256, 50);
  signCtx.font = '16px Georgia';
  signCtx.fillText('of Proper Tea Etiquette', 256, 80);
  signCtx.font = '12px Georgia';
  signCtx.fillText('Est. 1847 • "Excellence Through Extension"', 256, 105);
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTexture }));
  signSprite.scale.set(5, 1.2, 1);
  signSprite.position.set(0, 3, 2.6);
  group.add(signSprite);
  
  // Protractor decoration (for measuring pinkie angle)
  const protractor = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 32, 0, Math.PI),
    new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      side: THREE.DoubleSide
    })
  );
  protractor.position.set(2.5, 3.5, 2.52);
  group.add(protractor);
  
  group.position.set(PINKIE_SCHOOL.position.x, 0, PINKIE_SCHOOL.position.z);
  
  return group;
}

function createGiantPinkie() {
  const group = new THREE.Group();
  
  // Hand base
  const handMat = new THREE.MeshStandardMaterial({ color: 0xffeedd });
  
  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.3, 0.6),
    handMat
  );
  group.add(palm);
  
  // Curled fingers
  for (let i = 0; i < 4; i++) {
    const finger = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6),
      handMat
    );
    finger.position.set(-0.25 + i * 0.15, -0.1, 0.2);
    finger.rotation.x = Math.PI / 3;
    group.add(finger);
  }
  
  // Extended pinkie (the star!)
  const pinkieBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 0.5, 6),
    handMat
  );
  pinkieBase.position.set(0.4, 0.15, 0);
  pinkieBase.rotation.z = -Math.PI / 4; // 45 degrees!
  group.add(pinkieBase);
  
  // Sparkle on pinkie tip
  const sparkle = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.1),
    new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.5
    })
  );
  sparkle.position.set(0.6, 0.4, 0);
  group.add(sparkle);
  
  return group;
}
```

---

# PART 2: SPECIAL CHARACTERS

## 👑 KING BEN - The Royal Promenade

```javascript
// === KING BEN - Humorous Royal ===
const KING_BEN = {
  name: "King Ben",
  title: "His Royal Highness",
  role: "King of Austinville & Professional Crown Wearer",
  position: { x: 5, z: 5 },
  
  // Standard quotes when interacting
  quotes: [
    "Being king is hard work. I had to wave TWICE today.",
    "My crown is heavy. That's why I walk so slowly. Definitely not because I'm lost.",
    "I once got lost in my own palace. The guards still talk about it.",
    "The secret to royalty? Nod wisely at everything. Works every time.",
    "I practiced my royal wave for 7 years. Worth it? Absolutely.",
    "Tea parties are the backbone of diplomacy. And my diet.",
    "My scepter? It's for pointing at things regally. Very useful.",
    "I've been told I have 'kingly presence'. I think they mean I take up space."
  ],
  
  // Special quotes when near Queen Bee
  queenQuotes: [
    "Ah, my Queen! The most radiant bee in all the land! 🐝👑",
    "Queen Bee, your tea parties are legendary! Almost as legendary as your beauty!",
    "Every kingdom needs a queen. I'm lucky mine comes with excellent pastries.",
    "Did I mention you look lovely today? I meant to. Consider it mentioned!",
    "Your Majesty, the kingdom flourishes under your... um... tea-related leadership!",
    "They say behind every great king is a queen. I prefer beside. Better view.",
    "My dear, shall we stroll? I mean... REGALLY PROMENADE?"
  ],
  
  // Guard commands
  guardCommands: [
    "Guards! Look... regal!",
    "Formation! The pointy one!",
    "Protect the royal tea supplies!",
    "At ease! ...whatever that means.",
    "Eyes forward! ...wait, which way is forward?"
  ],
  
  // Route around town
  patrolRoute: [
    { x: 5, z: 5 },      // Start near palace
    { x: 15, z: 5 },     // East
    { x: 15, z: 15 },    // Southeast
    { x: 0, z: 20 },     // South (park area)
    { x: -15, z: 15 },   // Southwest
    { x: -15, z: 5 },    // West
    { x: -15, z: -5 },   // Near tea/coffee war
    { x: 0, z: -10 },    // Center
    { x: 5, z: 5 }       // Return to palace
  ]
};

function createKingBen() {
  const group = new THREE.Group();
  
  // Base NPC
  const baseNPC = createNPC('palace'); // Use palace style
  
  // Remove default head accessories, we'll add grander ones
  
  // === GRAND ROYAL ROBE ===
  const robeMat = new THREE.MeshStandardMaterial({ 
    color: 0x800020, // Burgundy
    roughness: 0.6
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xffd700, // Gold
    metalness: 0.7,
    roughness: 0.3
  });
  const furMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6 }); // Ermine
  
  // Flowing robe/cape
  const robe = new THREE.Mesh(
    new THREE.ConeGeometry(1, 1.8, 12, 1, true),
    robeMat
  );
  robe.position.y = 0.8;
  robe.rotation.x = Math.PI;
  group.add(robe);
  
  // Fur trim at collar
  const furCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.1, 8, 16),
    furMat
  );
  furCollar.position.y = 1.4;
  furCollar.rotation.x = Math.PI / 2;
  group.add(furCollar);
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.7, 12),
    robeMat
  );
  body.position.y = 1.1;
  group.add(body);
  
  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 14),
    new THREE.MeshStandardMaterial({ color: 0xffeedd })
  );
  head.position.y = 1.75;
  group.add(head);
  
  // Beard
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a3728 })
  );
  beard.position.set(0, 1.55, 0.15);
  beard.rotation.x = Math.PI;
  group.add(beard);
  
  // === THE MAGNIFICENT CROWN ===
  const crownGroup = new THREE.Group();
  
  // Crown base
  const crownBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.18, 8),
    trimMat
  );
  crownBase.position.y = 2.05;
  crownGroup.add(crownBase);
  
  // Crown points (taller than normal)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const point = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.35, 4),
      trimMat
    );
    point.position.set(
      Math.cos(angle) * 0.22,
      2.28,
      Math.sin(angle) * 0.22
    );
    crownGroup.add(point);
    
    // Jewels on points
    const jewelColors = [0xff0000, 0x0000ff, 0x00ff00, 0xff00ff, 0x00ffff, 0xffff00];
    const jewel = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshStandardMaterial({ 
        color: jewelColors[i],
        emissive: jewelColors[i],
        emissiveIntensity: 0.3
      })
    );
    jewel.position.set(
      Math.cos(angle) * 0.22,
      2.08,
      Math.sin(angle) * 0.22
    );
    crownGroup.add(jewel);
  }
  
  // Center orb
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.2
    })
  );
  orb.position.y = 2.5;
  crownGroup.add(orb);
  
  group.add(crownGroup);
  
  // === THE ROYAL SCEPTER ===
  const scepterGroup = new THREE.Group();
  
  // Staff
  const staff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8),
    trimMat
  );
  scepterGroup.add(staff);
  
  // Top orb
  const scepterOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    })
  );
  scepterOrb.position.y = 0.75;
  scepterGroup.add(scepterOrb);
  
  // Decorative rings
  [-0.3, 0, 0.3].forEach(y => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.015, 6, 12),
      trimMat
    );
    ring.position.y = y;
    ring.rotation.x = Math.PI / 2;
    scepterGroup.add(ring);
  });
  
  scepterGroup.position.set(0.5, 1, 0.2);
  scepterGroup.rotation.z = 0.2;
  group.add(scepterGroup);
  
  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  [-0.1, 0.1].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      eyeMat
    );
    eye.position.set(x, 1.8, 0.3);
    group.add(eye);
  });
  
  // Friendly smile
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x8b0000 })
  );
  smile.position.set(0, 1.65, 0.32);
  smile.rotation.x = Math.PI;
  group.add(smile);
  
  // Indicator (floating crown icon)
  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 12),
    new THREE.MeshStandardMaterial({ 
      color: 0xffd700, 
      emissive: 0xffd700, 
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9
    })
  );
  indicator.position.y = 2.9;
  indicator.userData.isIndicator = true;
  group.add(indicator);
  
  group.position.set(KING_BEN.position.x, 0, KING_BEN.position.z);
  
  group.userData = {
    ...KING_BEN,
    currentWaypoint: 0,
    walkSpeed: 0.6, // Stately pace
    waitTimer: 0,
    isWaiting: false,
    nearQueenBee: false,
    lastQueenComment: 0,
    guards: [],
    scepterGroup,
    crownGroup,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 5000
  };
  
  return group;
}

// === ROYAL GUARDS ===
function createRoyalGuard(index) {
  const group = new THREE.Group();
  
  const armorMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a,
    metalness: 0.8,
    roughness: 0.3
  });
  const plumeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  
  // Body (armor)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.65, 8),
    armorMat
  );
  body.position.y = 0.85;
  group.add(body);
  
  // Head (helmet)
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 10),
    armorMat
  );
  helmet.position.y = 1.4;
  group.add(helmet);
  
  // Helmet plume
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.4, 6),
    plumeMat
  );
  plume.position.set(0, 1.75, -0.1);
  plume.rotation.x = 0.3;
  group.add(plume);
  
  // Visor
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.08, 0.1),
    armorMat
  );
  visor.position.set(0, 1.35, 0.25);
  group.add(visor);
  
  // Spear
  const spear = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  spear.add(shaft);
  
  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.25, 4),
    armorMat
  );
  head.position.y = 1.05;
  spear.add(head);
  
  spear.position.set(0.35, 1, 0);
  group.add(spear);
  
  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2f2f2f });
  [-0.12, 0.12].forEach(x => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6),
      legMat
    );
    leg.position.set(x, 0.25, 0);
    group.add(leg);
  });
  
  group.userData = {
    name: `Guard ${index + 1}`,
    role: "Royal Protector",
    quotes: [
      "*stoic silence*",
      "*more stoic silence*",
      "*quietly wonders about lunch*",
      "*maintains formation... mostly*",
      "*accidentally makes eye contact* *panics*"
    ],
    formationOffset: index, // For positioning around king
    spear,
    plume
  };
  
  return group;
}

function createKingEntourage() {
  const king = createKingBen();
  scene.add(king);
  
  // Create 4 guards
  const guards = [];
  for (let i = 0; i < 4; i++) {
    const guard = createRoyalGuard(i);
    scene.add(guard);
    guards.push(guard);
    king.userData.guards.push(guard);
  }
  
  return { king, guards };
}

function updateKingAndGuards(king, time, delta) {
  const data = king.userData;
  
  // === PATROL ROUTE ===
  if (!data.isWaiting) {
    const target = data.patrolRoute[data.currentWaypoint];
    const dx = target.x - king.position.x;
    const dz = target.z - king.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 1) {
      // Reached waypoint
      data.isWaiting = true;
      data.waitTimer = 3 + Math.random() * 4; // Pause regally
      data.currentWaypoint = (data.currentWaypoint + 1) % data.patrolRoute.length;
    } else {
      // Move toward waypoint
      const moveX = (dx / dist) * data.walkSpeed * delta;
      const moveZ = (dz / dist) * data.walkSpeed * delta;
      
      if (!checkCollision(king.position.x + moveX, king.position.z + moveZ)) {
        king.position.x += moveX;
        king.position.z += moveZ;
      }
      
      // Face movement direction
      king.rotation.y = Math.atan2(dx, dz);
      
      // Stately walk animation
      king.position.y = Math.abs(Math.sin(time * 4)) * 0.05;
      king.rotation.z = Math.sin(time * 4) * 0.03;
      
      // Scepter sway
      if (data.scepterGroup) {
        data.scepterGroup.rotation.z = 0.2 + Math.sin(time * 2) * 0.1;
      }
    }
  } else {
    data.waitTimer -= delta;
    if (data.waitTimer <= 0) {
      data.isWaiting = false;
      
      // Occasionally give a guard command
      if (Math.random() < 0.3) {
        const command = data.guardCommands[Math.floor(Math.random() * data.guardCommands.length)];
        showKingCommand(king, command);
      }
    }
    
    // Idle animation
    king.position.y = Math.sin(time * 1.5) * 0.02;
  }
  
  // === CHECK IF NEAR QUEEN BEE ===
  const queenBeePos = npcs['palace']?.position;
  if (queenBeePos) {
    const distToQueen = king.position.distanceTo(queenBeePos);
    
    if (distToQueen < 5) {
      if (!data.nearQueenBee) {
        data.nearQueenBee = true;
        // First time approaching - give compliment!
        const now = Date.now();
        if (now - data.lastQueenComment > 15000) {
          data.lastQueenComment = now;
          const quote = data.queenQuotes[Math.floor(Math.random() * data.queenQuotes.length)];
          showKingQuote(king, quote, true);
        }
      }
      
      // Face the Queen
      king.rotation.y = Math.atan2(
        queenBeePos.x - king.position.x,
        queenBeePos.z - king.position.z
      );
      
      // Bow slightly
      king.rotation.x = 0.1;
      
    } else {
      data.nearQueenBee = false;
      king.rotation.x = THREE.MathUtils.lerp(king.rotation.x, 0, 0.1);
    }
  }
  
  // === UPDATE GUARDS - FOLLOW IN FORMATION ===
  data.guards.forEach((guard, i) => {
    // Diamond formation around king
    const formationAngles = [
      Math.PI / 4,
      3 * Math.PI / 4,
      5 * Math.PI / 4,
      7 * Math.PI / 4
    ];
    const formationDist = 2;
    
    const targetX = king.position.x + Math.sin(king.rotation.y + formationAngles[i]) * formationDist;
    const targetZ = king.position.z + Math.cos(king.rotation.y + formationAngles[i]) * formationDist;
    
    // Move toward formation position
    const gdx = targetX - guard.position.x;
    const gdz = targetZ - guard.position.z;
    const gDist = Math.sqrt(gdx * gdx + gdz * gdz);
    
    if (gDist > 0.3) {
      guard.position.x += (gdx / gDist) * data.walkSpeed * 1.2 * delta;
      guard.position.z += (gdz / gDist) * data.walkSpeed * 1.2 * delta;
      
      // March animation
      guard.position.y = Math.abs(Math.sin(time * 6 + i)) * 0.08;
      guard.rotation.z = Math.sin(time * 6 + i) * 0.05;
    }
    
    // Face same direction as king
    guard.rotation.y = THREE.MathUtils.lerp(guard.rotation.y, king.rotation.y, 0.1);
    
    // Spear bob
    if (guard.userData.spear) {
      guard.userData.spear.rotation.x = Math.sin(time * 3 + i) * 0.05;
    }
  });
  
  // Crown float/bob
  if (data.crownGroup) {
    data.crownGroup.position.y = Math.sin(time * 2) * 0.02;
    data.crownGroup.rotation.y = Math.sin(time * 0.5) * 0.03;
  }
  
  // Indicator float
  king.children.forEach(child => {
    if (child.userData?.isIndicator) {
      child.position.y = 2.9 + Math.sin(time * 3) * 0.15;
      child.rotation.y = time * 2;
    }
  });
}

function showKingQuote(king, quote, isQueenQuote = false) {
  const vec = king.position.clone().project(camera);
  if (vec.z > 1) return;
  
  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
  
  const msg = document.createElement('div');
  msg.className = 'floating-message king-quote';
  msg.textContent = quote;
  msg.style.left = x + 'px';
  msg.style.top = (y - 120) + 'px';
  msg.style.fontSize = isQueenQuote ? '1.3rem' : '1.1rem';
  msg.style.fontWeight = 'bold';
  msg.style.color = isQueenQuote ? '#ffd700' : '#800020';
  msg.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
  msg.style.maxWidth = '250px';
  msg.style.textAlign = 'center';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4500);
}

function showKingCommand(king, command) {
  const vec = king.position.clone().project(camera);
  if (vec.z > 1) return;
  
  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
  
  const msg = document.createElement('div');
  msg.className = 'floating-message';
  msg.textContent = `👑 ${command}`;
  msg.style.left = x + 'px';
  msg.style.top = (y - 100) + 'px';
  msg.style.fontSize = '1rem';
  msg.style.color = '#4a4a4a';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}
```

---

## 📢 THE DOOM SAYER

```javascript
// === THE DOOM SAYER ===
const DOOM_SAYER = {
  name: "Prophet Pessimist",
  role: "Professional Worrier",
  position: { x: -30, z: -18 },
  
  quotes: [
    "THE TEA-TIME END IS NEAR! 🍵💀",
    "Repent! The last scone is coming!",
    "The sugar bowl... it's almost EMPTY!",
    "I have foreseen it... cold tea! COLD. TEA!",
    "The prophecy speaks of... running out of biscuits!",
    "You laugh now, but when the kettle stops boiling...",
    "THE LEAVES HAVE SPOKEN! ...They said 'steep longer'.",
    "Mark my words! The milk will one day... EXPIRE!",
    "I've seen the future. There's no more Earl Grey. NONE!",
    "Flee while you can! The crumpets are almost gone!"
  ],
  
  signTexts: [
    "THE TEA-TIME END IS NEAR",
    "REPENT & STEEP",
    "THE LAST SCONE COMETH",
    "SUGAR SHORTAGE IMMINENT"
  ]
};

function createDoomSayer() {
  const group = new THREE.Group();
  
  // Ragged robe
  const robeMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
  
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.5, 8),
    robeMat
  );
  body.position.y = 0.75;
  body.rotation.x = Math.PI;
  group.add(body);
  
  // Hood
  const hood = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    robeMat
  );
  hood.position.y = 1.4;
  hood.rotation.x = -0.3;
  group.add(hood);
  
  // Face (shadowed, mysterious)
  const face = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xffeedd })
  );
  face.position.y = 1.35;
  face.position.z = 0.1;
  group.add(face);
  
  // Wild eyes
  const eyeMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.3
  });
  [-0.08, 0.08].forEach(x => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      eyeMat
    );
    eye.position.set(x, 1.4, 0.2);
    group.add(eye);
    
    // Pupil
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    pupil.position.set(x, 1.4, 0.25);
    group.add(pupil);
  });
  
  // === THE SIGN ===
  const signGroup = new THREE.Group();
  
  // Sign pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  pole.position.y = 1.25;
  signGroup.add(pole);
  
  // Sign board
  const signBoard = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.8, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  signBoard.position.y = 2.3;
  signGroup.add(signBoard);
  
  // Sign text (will rotate through messages)
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 256;
  signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  
  function updateSignText(text) {
    signCtx.fillStyle = '#8b4513';
    signCtx.fillRect(0, 0, 256, 128);
    signCtx.fillStyle = '#ffffff';
    signCtx.font = 'bold 20px Impact';
    signCtx.textAlign = 'center';
    
    // Word wrap
    const words = text.split(' ');
    let line = '';
    let y = 40;
    words.forEach(word => {
      const testLine = line + word + ' ';
      if (signCtx.measureText(testLine).width > 220) {
        signCtx.fillText(line, 128, y);
        line = word + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    });
    signCtx.fillText(line, 128, y);
    
    signTexture.needsUpdate = true;
  }
  
  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signTextMat = new THREE.MeshBasicMaterial({ map: signTexture });
  const signFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 0.7),
    signTextMat
  );
  signFace.position.y = 2.3;
  signFace.position.z = 0.03;
  signGroup.add(signFace);
  
  // Initial text
  updateSignText(DOOM_SAYER.signTexts[0]);
  
  signGroup.position.set(-0.6, 0, 0);
  signGroup.userData.updateText = updateSignText;
  signGroup.userData.currentTextIndex = 0;
  group.add(signGroup);
  
  group.position.set(DOOM_SAYER.position.x, 0, DOOM_SAYER.position.z);
  
  group.userData = {
    ...DOOM_SAYER,
    signGroup,
    signTextTimer: 0,
    walkAngle: Math.random() * Math.PI * 2,
    walkSpeed: 0.3,
    timer: Math.random() * 3,
    shoutTimer: 5,
    lastQuote: Date.now(),
    chatOffset: Math.random() * 3000,
    isRanting: false,
    rantTimer: 0
  };
  
  return group;
}

function updateDoomSayer(doomSayer, time, delta) {
  const data = doomSayer.userData;
  
  // Wander erratically
  data.timer -= delta;
  if (data.timer <= 0) {
    data.walkAngle += (Math.random() - 0.5) * Math.PI * 1.5;
    data.timer = 1 + Math.random() * 3;
  }
  
  const speed = data.walkSpeed * delta;
  const newX = doomSayer.position.x + Math.sin(data.walkAngle) * speed;
  const newZ = doomSayer.position.z + Math.cos(data.walkAngle) * speed;
  
  // Stay in general area
  const distFromStart = Math.hypot(newX - DOOM_SAYER.position.x, newZ - DOOM_SAYER.position.z);
  if (distFromStart < 15 && !checkCollision(newX, newZ)) {
    doomSayer.position.x = newX;
    doomSayer.position.z = newZ;
  } else {
    data.walkAngle += Math.PI;
  }
  
  doomSayer.rotation.y = data.walkAngle;
  
  // Frantic movement
  doomSayer.rotation.z = Math.sin(time * 8) * 0.15;
  doomSayer.position.y = Math.abs(Math.sin(time * 6)) * 0.1;
  
  // Shake sign
  if (data.signGroup) {
    data.signGroup.rotation.z = Math.sin(time * 5) * 0.2;
    data.signGroup.rotation.x = Math.sin(time * 3) * 0.1;
  }
  
  // Cycle sign text
  data.signTextTimer += delta;
  if (data.signTextTimer > 8) {
    data.signTextTimer = 0;
    const nextIndex = (data.signGroup.userData.currentTextIndex + 1) % DOOM_SAYER.signTexts.length;
    data.signGroup.userData.currentTextIndex = nextIndex;
    data.signGroup.userData.updateText(DOOM_SAYER.signTexts[nextIndex]);
  }
  
  // Shout prophecies
  data.shoutTimer -= delta;
  if (data.shoutTimer <= 0) {
    data.shoutTimer = 6 + Math.random() * 8;
    
    const quote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
    showDoomQuote(doomSayer, quote);
    
    // Brief rant animation
    data.isRanting = true;
    data.rantTimer = 2;
  }
  
  if (data.isRanting) {
    data.rantTimer -= delta;
    // Wild gesturing
    doomSayer.rotation.x = Math.sin(time * 10) * 0.2;
    
    if (data.rantTimer <= 0) {
      data.isRanting = false;
      doomSayer.rotation.x = 0;
    }
  }
}

function showDoomQuote(npc, quote) {
  const vec = npc.position.clone().project(camera);
  if (vec.z > 1) return;
  
  const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;
  
  const msg = document.createElement('div');
  msg.className = 'floating-message doom-quote';
  msg.textContent = quote;
  msg.style.left = x + 'px';
  msg.style.top = (y - 100) + 'px';
  msg.style.fontSize = '1.2rem';
  msg.style.fontWeight = 'bold';
  msg.style.color = '#8b0000';
  msg.style.textShadow = '1px 1px 2px #000';
  msg.style.animation = 'doomShake 0.5s ease-in-out infinite';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

// CSS for doom shake
const doomStyle = document.createElement('style');
doomStyle.textContent = `
  @keyframes doomShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px) rotate(-2deg); }
    75% { transform: translateX(5px) rotate(2deg); }
  }
`;
document.head.appendChild(doomStyle);
```

---

# PART 3: CAMERA ENHANCEMENTS

## 🎥 Zoom Close-Up on NPC Interaction

```javascript
// === CAMERA ZOOM SYSTEM ===
const cameraZoomConfig = {
  // Normal gameplay
  normal: {
    offset: 12,
    height: 14,
    lookAtY: 1
  },
  // Zoomed in for NPC interaction
  interaction: {
    offset: 4,
    height: 2.5,
    lookAtY: 1.5
  },
  // Current state
  current: 'normal',
  transitionSpeed: 3,
  isTransitioning: false,
  targetNPC: null
};

function zoomToNPC(npc) {
  cameraZoomConfig.current = 'interaction';
  cameraZoomConfig.isTransitioning = true;
  cameraZoomConfig.targetNPC = npc;
  
  // Start NPC talking animation
  if (npc) {
    npc.userData.isTalking = true;
    npc.userData.talkStartTime = performance.now();
  }
}

function zoomOut() {
  cameraZoomConfig.current = 'normal';
  cameraZoomConfig.isTransitioning = true;
  
  // Stop NPC talking
  if (cameraZoomConfig.targetNPC) {
    cameraZoomConfig.targetNPC.userData.isTalking = false;
  }
  cameraZoomConfig.targetNPC = null;
}

// Modify openDialog to trigger zoom
function openDialogWithZoom(locationId) {
  const npc = npcs[locationId];
  if (npc) {
    zoomToNPC(npc);
  }
  // ... rest of existing openDialog code
  openDialog(locationId);
}

// Modify closeDialog to zoom out
function closeDialogWithZoom() {
  zoomOut();
  closeDialog();
}

// Update camera in animate()
function updateCameraZoom(delta) {
  const config = cameraZoomConfig.current === 'interaction' 
    ? cameraZoomConfig.interaction 
    : cameraZoomConfig.normal;
  
  let targetPos, targetLookAt;
  
  if (cameraZoomConfig.current === 'interaction' && cameraZoomConfig.targetNPC) {
    const npc = cameraZoomConfig.targetNPC;
    
    // Position camera in front of NPC, slightly to the side
    const npcForward = new THREE.Vector3(0, 0, 1).applyQuaternion(npc.quaternion);
    const npcRight = new THREE.Vector3(1, 0, 0).applyQuaternion(npc.quaternion);
    
    targetPos = new THREE.Vector3()
      .copy(npc.position)
      .add(npcForward.multiplyScalar(config.offset))
      .add(npcRight.multiplyScalar(1))
      .add(new THREE.Vector3(0, config.height, 0));
    
    targetLookAt = new THREE.Vector3(
      npc.position.x,
      config.lookAtY,
      npc.position.z
    );
    
  } else {
    // Normal follow camera
    targetPos = new THREE.Vector3(
      player.position.x,
      player.position.y + config.height,
      player.position.z + config.offset
    );
    
    targetLookAt = new THREE.Vector3(
      player.position.x,
      player.position.y + config.lookAtY,
      player.position.z
    );
  }
  
  // Smooth transition
  const transitionFactor = cameraZoomConfig.transitionSpeed * delta;
  camera.position.lerp(targetPos, transitionFactor);
  cameraTarget.lerp(targetLookAt, transitionFactor);
  camera.lookAt(cameraTarget);
  
  // Check if transition complete
  if (camera.position.distanceTo(targetPos) < 0.1) {
    cameraZoomConfig.isTransitioning = false;
  }
}

// NPC talking animation
function updateNPCTalkingAnimation(npc, time) {
  if (!npc.userData.isTalking) return;
  
  const talkTime = (performance.now() - npc.userData.talkStartTime) / 1000;
  
  // Head wiggle
  npc.rotation.y += Math.sin(talkTime * 8) * 0.02;
  npc.rotation.z = Math.sin(talkTime * 6) * 0.05;
  
  // Slight body movement
  npc.position.y += Math.sin(talkTime * 4) * 0.005;
  
  // Find and animate head if present
  npc.traverse(child => {
    if (child.geometry?.type === 'SphereGeometry' && child.position.y > 1.5) {
      // This is likely the head
      child.rotation.x = Math.sin(talkTime * 5) * 0.1;
      child.rotation.z = Math.sin(talkTime * 7) * 0.08;
    }
  });
}
```

---

# PART 4: INTEGRATION CHECKLIST

## 📋 Files to Create/Modify

### New Files:
1. `streets.js` - Street system
2. `river.js` - River & fishing
3. `buildings.js` - New buildings
4. `king.js` - King Ben & guards
5. `war.js` - Tea vs Coffee war
6. `special-npcs.js` - Doom sayer, etc.

### Modify game.js:
1. Add all new building/NPC creation calls to `createWorld()`
2. Add update functions to `animate()` loop
3. Integrate camera zoom system
4. Add trampoline physics

### Modify ui.js:
1. Update dialog functions for zoom
2. Add King Ben interaction handling
3. Add war quote displays

## 🎯 Priority Implementation Order

### Phase 1: Foundation (Day 1-2)
- [ ] Street system with signs
- [ ] River with bridges
- [ ] Update ground layout

### Phase 2: Core Characters (Day 3-4)
- [ ] King Ben + Guards
- [ ] Queen Bee scepter update
- [ ] Doom Sayer

### Phase 3: New Buildings (Day 5-6)
- [ ] Tea Café with seated NPCs
- [ ] Coffee Café
- [ ] Donut Shop
- [ ] Pinkie School

### Phase 4: Interactions (Day 7-8)
- [ ] Tea vs Coffee war system
- [ ] Fishing district + NPCs
- [ ] Boxing ring + fighters
- [ ] Trampoline physics

### Phase 5: Polish (Day 9-10)
- [ ] Camera zoom system
- [ ] NPC talking animations
- [ ] All floating messages
- [ ] Testing & balance

---

## 🏆 REMEMBER: PARTY INFO IS THE GOAL

All of this fun chaos should ultimately guide players to:
1. **Visit Queen Bee first** (palace) - Event overview
2. **Lady Phebe** (teashop) - Date, time, location, dress code
3. **Princess Bernie** (speakers) - Guest speakers
4. **Lord Scribe** (guests) - Guest list
5. **Chef Caron** (feast) - Potluck info

Everything else is delightful distraction that makes the journey memorable!

---

*"Welcome to Austinville - where the tea is warm, the coffee is strong, and the corgis are fluffy!"* 🏰🍵☕🐕👑
