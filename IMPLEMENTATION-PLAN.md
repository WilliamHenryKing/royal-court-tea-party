# Royal Court Tea Party - Complete Implementation Plan

**Generated:** 2026-01-08
**Based on:** WEBSITE-IMPROVEMENT-SUGGESTIONS.md analysis

---

## Implementation Status Overview

| Category | Completion | Missing Features |
|----------|------------|------------------|
| Critical Bug Fixes | 100% | ✅ All done |
| Joystick Redesign | 100% | ✅ All done |
| UI Improvements | 65% | Settings panel, mobile gestures, zoom controls |
| 3D World Enhancements | 70% | Wind effects, ground wear, dense undergrowth |
| NPC Improvements | 60% | Interaction depth, sounds, variety |
| Environmental Details | 45% | Ambient details, wear patterns, decorations |
| Buildings & Structures | 40% | Detail polish, interactivity |
| Interactions & Gameplay | 50% | Enhanced mechanics, variety |
| Audio & Feedback | 10% | Ambient sounds, location audio, footsteps |

---

## PHASE 1: Core Systems & UI Foundation
**Goal:** Complete missing UI systems and desktop/mobile controls
**Priority:** HIGH - Improves all user interactions

### 1.1 Settings Panel System
- [ ] Create settings modal UI (overlay with close button)
- [ ] Music volume slider (0-100%)
- [ ] Sound effects toggle
- [ ] Camera sensitivity slider
- [ ] Show/hide UI elements toggles
- [ ] Settings button in HUD
- [ ] Persist settings to localStorage

### 1.2 Desktop Mode Enhancements
- [ ] Fullscreen button and API integration
- [ ] Mini-map toggle button
- [ ] Mouse wheel zoom controls (scale camera distance)
- [ ] Right-click context menu on NPCs (Talk, Follow, Info)
- [ ] Enhanced keyboard shortcuts display

### 1.3 Mobile Mode Enhancements
- [ ] Haptic feedback on interactions (navigator.vibrate)
- [ ] Double-tap to interact (alternative to action button)
- [ ] Pinch-to-zoom gesture recognition
- [ ] Portrait mode UI optimization
- [ ] Auto-hide UI when idle for 3+ seconds

### 1.4 Dialog System Polish
- [ ] Typewriter effect for dialog text (10ms per character)
- [ ] Character portrait blink animation (random intervals)
- [ ] "Tap to continue" hint for long dialogs
- [ ] Skip dialog button

---

## PHASE 2: Environmental Details & Polish
**Goal:** Add visual richness to the world
**Priority:** MEDIUM-HIGH - Enhances immersion

### 2.1 Ground & Path Enhancements
- [ ] Dirt patches near heavily-trafficked areas
- [ ] Moss texture on stones near river
- [ ] Fallen leaves near trees (autumn aesthetic)
- [ ] Wheel tracks on sandy roads
- [ ] Worn areas near shop entrances
- [ ] Occasional puddles (reflective material)
- [ ] Weeds growing through path cracks
- [ ] Small drainage grates
- [ ] Hitching posts for decoration

### 2.2 Grass & Flora Improvements
- [ ] Wind sway animation for grass (vertex shader or rotation)
- [ ] Wildflowers mixed into grass patches (5 colors)
- [ ] Increase undergrowth density (from 12 to 40+ bushes)
- [ ] Add fallen logs in forest (5-8 logs, walkable)
- [ ] Tree interactions: fruit dropping occasionally
- [ ] Squirrels running up tree trunks

### 2.3 River & Water Enhancements
- [ ] Foam at riverbanks (white particle rings)
- [ ] Floating leaves/debris moving downstream
- [ ] Shallow areas show riverbed stones
- [ ] More fish variety (3+ colors, 2+ sizes)
- [ ] Dragonflies hovering over water
- [ ] Lily pads with frogs (animated jump)
- [ ] Ducks swimming with wake trails
- [ ] Reeds and cattails at edges
- [ ] Smooth stones scattered on banks
- [ ] Footprints in mud near shore
- [ ] Small wooden rowboat tied up (decorative)

### 2.4 Bridge Enhancements
- [ ] Creaky board sounds when player walks
- [ ] Some boards wobble slightly (animation)
- [ ] Rope details more visible (thicker, textured)
- [ ] Lanterns on bridge posts (glowing)
- [ ] Echo effect for sounds under bridge
- [ ] Troll's "home" more visible under bridge

### 2.5 Atmospheric Effects
- [ ] Fireflies at dusk (50+ particles with glow)
- [ ] Falling cherry blossom petals (near cherry trees)
- [ ] Bird nests visible in some trees
- [ ] Woodpecker sounds near certain trees
- [ ] Milestone markers along roads
- [ ] Directional signs at intersections

---

## PHASE 3: NPC Behaviors & Interactions
**Goal:** Make NPCs feel alive and interactive
**Priority:** HIGH - Core gameplay experience

### 3.1 Corgi Enhancements (Beyond Current)
- [ ] Chase tail animation (spin in place, 5s duration)
- [ ] Sniff ground randomly (head down, sniff particles)
- [ ] Play with each other when 2+ corgis close
- [ ] React to collectibles (bark animation, wag tail)
- [ ] Petting interaction (tap corgi = hearts + wag)
- [ ] Bring gifts to player (bone/stick appears near player)
- [ ] Follow King Ben occasionally (50% chance)
- [ ] Sounds: happy bark, whimper, howl (if night mode)

### 3.2 Bridge Troll Complete System
- [ ] "TOLL: 1 RIDDLE" sign near bridge
- [ ] Stack of collected tolls (random items pile)
- [ ] Bridge decorations (mix of skulls and flowers)
- [ ] Riddle system with 5+ riddles
- [ ] Multiple choice answer UI (3 options)
- [ ] Correct answer: praise dialog + sparkles
- [ ] Wrong answer: sigh but still lets pass
- [ ] Toll reputation tracking (count crossings)
- [ ] Knitting needles visible, knitting animation
- [ ] Pet fish in bowl under bridge (swimming)
- [ ] Complain dialog about maintenance costs
- [ ] Poet dream dialog (recites bad poetry)

### 3.3 Fishermen Enhanced Mechanics
- [ ] More visible rod bending on catch attempt
- [ ] Catch silly items 10% of time (boot, treasure chest, message bottle)
- [ ] Competition scoreboard UI near dock
- [ ] Old Timer Pete: floating "Z" particles when sleeping
- [ ] Little Timmy: jumping excitement animation (y position bounce)
- [ ] Competitive Carl: frustrated stamping animation
- [ ] Seagulls try to steal bait (bird swoops down)
- [ ] Tackle boxes visible with supplies (textures)
- [ ] Fish jump near them more often (every 3-5s)

### 3.4 Boxing Ring Complete Scene
- [ ] Referee NPC in striped shirt
- [ ] 6-8 spectator NPCs around ring
- [ ] Spectators cheer and boo (animated reactions)
- [ ] Popcorn vendor NPC nearby with cart
- [ ] Match announcements from Duke Dramatic (round system)
- [ ] Victory celebrations with confetti particles
- [ ] Dramatic slow-motion moments (reduce timescale briefly)
- [ ] More varied fight moves (uppercut, dodge, block)

### 3.5 Tea vs Coffee War Enhanced
- [ ] Flying tea leaves during tea warrior attacks (green particles)
- [ ] Flying coffee beans during coffee warrior attacks (brown particles)
- [ ] Occasional treaty: warriors share beverage (15% chance)
- [ ] Ground color changes near Tea Café (pink tint)
- [ ] Ground color changes near Coffee Café (brown tint)
- [ ] Flag posts at faction boundaries
- [ ] No-man's land visual with both tea and coffee stains

### 3.6 Doom Sayer Interactive Depth
- [ ] Dynamic prophecies referencing player position/actions
- [ ] Weather-based prophecies ("Clouds spell DOOM!")
- [ ] Floating apocalyptic symbols (skull, clock particles)
- [ ] Special 10+ second proximity dialog
- [ ] "Doom insurance" joke item offer
- [ ] Running in circles shouting behavior (random trigger)

### 3.7 Guard Variety & Personality
- [ ] Different armor colors (gold, silver, bronze ranks)
- [ ] One particularly tall guard (1.3x scale)
- [ ] One short guard (0.8x scale)
- [ ] Squeaky armor sound for one guard
- [ ] Guard banter dialog when player nearby
- [ ] One guard occasionally yawns/falls asleep

---

## PHASE 4: Building & Structure Details
**Goal:** Add personality and life to buildings
**Priority:** MEDIUM - Visual storytelling

### 4.1 Tea Café Improvements
- [ ] Striped pink/white umbrellas over tables
- [ ] Menus visible on tables (paper texture)
- [ ] Detailed tea sets with visible steam particles
- [ ] Seated NPCs actually holding cups (hand position)
- [ ] More flower variety in window boxes
- [ ] Chalkboard sign with daily specials text
- [ ] Welcome mat at door (patterned texture)
- [ ] Open/Closed sign (changes based on time)
- [ ] Warm glow from windows
- [ ] Patron silhouettes visible through windows

### 4.2 Donut Shop Enhancements
- [ ] Sprinkles occasionally fall from giant donut (particles)
- [ ] Glaze drip animation (shader or texture scroll)
- [ ] Donut roof rotates slowly (0.1 rotation speed)
- [ ] Visible donut rack in display window
- [ ] "Fresh Donuts!" blinking neon sign
- [ ] Sweet smell indicator (wavy lines particle effect)

### 4.3 Palace Royal Grandeur
- [ ] Royal banners on towers (fabric with crest)
- [ ] Window lights that flicker (candle simulation)
- [ ] Guards at entrance standing post
- [ ] Red carpet at entrance (textured plane)
- [ ] Manicured hedge maze nearby (small demo maze)
- [ ] Royal flower garden (concentrated flower beds)
- [ ] Statue of King Ben in heroic pose

### 4.4 Pinkie School Atmosphere
- [ ] Bell tower with actual bell model
- [ ] Bell sound plays hourly (check game time)
- [ ] Student NPCs practicing pinkie positions (2-3 students)
- [ ] "PROPER TEA ETIQUETTE" poster visible on wall
- [ ] Graduation cap decorations on roof

### 4.5 Giant Teacup/Teapot Steam
- [ ] Animated steam rising from teacup on café
- [ ] Steam forms shapes occasionally (hearts, crowns)
- [ ] Steam intensity varies based on proximity
- [ ] Teapot whistle sound at intervals
- [ ] Walking near café triggers tea pour visual

---

## PHASE 5: Interactions & Collectibles
**Goal:** Enhanced gameplay mechanics and rewards
**Priority:** MEDIUM - Player engagement

### 5.1 Trampoline System Overhaul
- [ ] Flip animation at peak of bounce (360° rotation)
- [ ] Higher bounces for timed jumps (double-tap timing)
- [ ] Combo counter for consecutive bounces (UI display)
- [ ] Different bounce heights based on position
- [ ] Trampoline surface ripple effect on landing
- [ ] Wind particle effect at height
- [ ] View distance bonus at peak (camera pulls back)
- [ ] Achievements: "Sky High!", "Dizzy Royal" (10 bounces)
- [ ] Personal best height tracking

### 5.2 Food Items & Stands
- [ ] Ice cream cart/stand near Donut Shop
- [ ] Ice cream vendor NPC with silly flavors dialog
- [ ] Ice cream as collectible power-up (extra speed boost)
- [ ] Dripping animation in warm areas
- [ ] Pink cake display in Feast Hall window
- [ ] Multi-tiered elaborate cake design
- [ ] Sparkles around cake (extra magical)
- [ ] NPCs occasionally admire cake
- [ ] Lemon tart on Tea Café tables
- [ ] Bright yellow visual pop
- [ ] Flies buzz around tart (shoo away interaction)
- [ ] Baker NPC making fresh ones

### 5.3 Collectibles Enhancement
- [ ] Different sweet types: candy, lollipop, cupcake, cookie
- [ ] Different effects per type (speed, jump, sparkle trail)
- [ ] Rare golden sweets (5% spawn rate, worth 5 points)
- [ ] Hidden sweets in unusual locations (under bridges, in trees)
- [ ] Trail effect leading to nearby collectibles (sparkle path)
- [ ] Collectibles glow brighter when player close (<5 units)
- [ ] Sound variety per sweet type
- [ ] "+1" floating number when collected
- [ ] Collection milestone rewards (10, 25, 50 sweets)

---

## PHASE 6: Audio & Ambient Feedback
**Goal:** Rich soundscape for immersion
**Priority:** MEDIUM-LOW - Enhancement layer

### 6.1 Environmental Ambient Sounds
- [ ] Birds chirping near trees (positional audio)
- [ ] River flowing sound near water (looping)
- [ ] Wind through leaves in forest (subtle)
- [ ] Distant crowd murmur near activities

### 6.2 Location-Based Sounds
- [ ] Teacup clinking near café (random intervals)
- [ ] Boxing bell sounds near ring (per round)
- [ ] Bouncing sounds near trampoline (when used)
- [ ] Fishing reel sounds at dock (when cast)
- [ ] Creaky bridge boards when walking

### 6.3 Movement Feedback Sounds
- [ ] Footsteps - Cobblestone: hard tap
- [ ] Footsteps - Sandy: soft crunch
- [ ] Footsteps - Wooden bridge: hollow thunk
- [ ] Footsteps - Grass: soft rustle
- [ ] Different surface detection system

### 6.4 NPC Interaction Sounds
- [ ] Greeting sounds per NPC personality (voice clips or effects)
- [ ] Reaction sounds (laughter, gasps, sighs)
- [ ] Music intensity changes near certain NPCs
- [ ] Corgi barks, whimpers
- [ ] Guard helmet clank sounds

---

## PHASE 7: Advanced Features (Future)
**Goal:** Next-level features and polish
**Priority:** LOW - Nice to have

### 7.1 Photo Mode
- [ ] Hide UI option (toggle all HUD)
- [ ] Camera zoom/angle control (free camera)
- [ ] Add stickers/frames (decorative overlays)
- [ ] Screenshot save functionality
- [ ] Share button integration

### 7.2 Mini-Games
- [ ] Tea Brewing: ingredient sequence matching
- [ ] Corgi Herding: guide corgis to location
- [ ] Bounce Challenge: reach target height
- [ ] Fish Tales: memory game with fishermen

### 7.3 Time of Day System (No Lighting Changes)
- [ ] Sky gradient shifts (morning → afternoon → evening)
- [ ] NPC behavior changes by time
- [ ] Different collectibles appear at different times
- [ ] Time-based dialog variations

---

## Implementation Order Recommendation

### SPRINT 1 (Immediate Value)
1. Settings panel system (1.1)
2. Desktop enhancements (1.2)
3. Corgi behaviors (3.1)
4. Bridge Troll system (3.2)

### SPRINT 2 (Environmental Rich)
5. Ground & path enhancements (2.1)
6. Grass & flora improvements (2.2)
7. River enhancements (2.3)
8. Atmospheric effects (2.5)

### SPRINT 3 (NPC Life)
9. Fishermen mechanics (3.3)
10. Boxing ring scene (3.4)
11. Tea vs Coffee war (3.5)
12. Guard variety (3.7)

### SPRINT 4 (Building Polish)
13. Tea Café details (4.1)
14. Donut Shop details (4.2)
15. Palace grandeur (4.3)
16. Teacup steam (4.5)

### SPRINT 5 (Gameplay Depth)
17. Trampoline overhaul (5.1)
18. Food items (5.2)
19. Collectibles enhancement (5.3)
20. Dialog typewriter (1.4)

### SPRINT 6 (Audio Layer)
21. Environmental sounds (6.1)
22. Location sounds (6.2)
23. Movement sounds (6.3)
24. NPC sounds (6.4)

### SPRINT 7 (Future Features)
25. Mobile gestures (1.3)
26. Photo mode (7.1)
27. Mini-games (7.2)

---

## Technical Notes

- Maintain existing Three.js architecture
- Use procedural generation where possible
- Prioritize mobile performance
- Lazy-load distant details
- **DO NOT modify lighting** (keep current setup)
- Test on mobile devices regularly
- Use instanced meshes for repeated elements
- Implement audio with volume controls

---

## Success Metrics

- [ ] 100% of high-priority suggestions implemented
- [ ] 80%+ of medium-priority suggestions implemented
- [ ] Mobile performance maintained (30+ FPS)
- [ ] No new bugs introduced
- [ ] User experience feels cohesive and polished

---

*Ready for implementation: 2026-01-08*
