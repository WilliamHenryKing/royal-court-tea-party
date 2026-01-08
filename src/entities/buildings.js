// Buildings - creation of all building structures in the game
import * as THREE from 'three';
import { scene } from '../engine/renderer.js';
import { LOCATIONS } from '../assets/data.js';

// Buildings storage
export const buildings = {};

// Create a building based on type
export function createBuilding(color, type) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color });
  const roofColor = new THREE.Color(color).multiplyScalar(0.8).getHex();
  const roofMat = new THREE.MeshStandardMaterial({ color: roofColor });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

  if (type === 'palace') {
    // Main palace structure
    const base = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 3), mat);
    base.position.y = 1.5;
    base.castShadow = true;
    group.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.5, 4), roofMat);
    roof.position.y = 3.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Grand entrance door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1), darkMat);
    door.position.set(0, 0.9, 1.55);
    group.add(door);

    // Door frame with gold trim
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.15), goldMat);
    doorFrame.position.set(0, 1, 1.52);
    group.add(doorFrame);

    // Windows on main structure
    [-1.2, 1.2].forEach(x => {
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
      );
      window.position.set(x, 2, 1.55);
      group.add(window);

      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.12), goldMat);
      windowFrame.position.set(x, 2, 1.53);
      group.add(windowFrame);
    });

    // Balcony
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(2, 0.15, 0.8), goldMat);
    balcony.position.set(0, 2.5, 1.8);
    balcony.castShadow = true;
    group.add(balcony);

    // Balcony railing
    for (let i = -4; i <= 4; i++) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), goldMat);
      rail.position.set(i * 0.22, 2.85, 2);
      group.add(rail);
    }

    // Crown decoration on roof
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 6), goldMat);
    crown.position.set(0, 5.5, 0);
    group.add(crown);

    const crownJewel = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff00ff }));
    crownJewel.position.set(0, 5.9, 0);
    group.add(crownJewel);

    // Towers with enhanced details
    [-1.8, 1.8].forEach(x => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 4.5, 8), mat);
      tower.position.set(x, 2.25, -1.3);
      tower.castShadow = true;
      group.add(tower);

      const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.3, 8), roofMat);
      towerRoof.position.set(x, 5.15, -1.3);
      towerRoof.castShadow = true;
      group.add(towerRoof);

      // Tower windows
      for (let y = 1; y < 4; y++) {
        const towerWindow = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.4, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
        );
        towerWindow.position.set(x, y, -0.65);
        group.add(towerWindow);
      }

      // Flag on tower
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), goldMat);
      flagPole.position.set(x, 6.3, -1.3);
      group.add(flagPole);

      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshStandardMaterial({ color: 0xff1493 }));
      flag.position.set(x + 0.25, 6.5, -1.3);
      group.add(flag);
    });

  } else if (type === 'teashop') {
    // Main building
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 2.8), mat);
    base.position.y = 1.1;
    base.castShadow = true;
    group.add(base);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.2, 4), roofMat);
    roof.position.y = 2.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Large teapot decoration on roof
    const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), whiteMat);
    teapot.position.y = 3.7;
    group.add(teapot);

    const teapotSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.3, 6), whiteMat);
    teapotSpout.position.set(0.35, 3.7, 0);
    teapotSpout.rotation.z = Math.PI / 2;
    group.add(teapotSpout);

    const teapotHandle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 12, Math.PI), whiteMat);
    teapotHandle.position.set(-0.35, 3.7, 0);
    teapotHandle.rotation.y = Math.PI / 2;
    group.add(teapotHandle);

    // Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.1), darkMat);
    door.position.set(0, 0.8, 1.45);
    group.add(door);

    // Windows with flower boxes
    [-1, 1].forEach(x => {
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.8, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
      );
      window.position.set(x, 1.3, 1.45);
      group.add(window);

      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.12), trimMat);
      windowFrame.position.set(x, 1.3, 1.43);
      group.add(windowFrame);

      // Flower box
      const flowerBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.3), trimMat);
      flowerBox.position.set(x, 0.8, 1.55);
      group.add(flowerBox);

      // Flowers
      const flowerColors = [0xff69b4, 0xff6347, 0xffd700, 0x9370db];
      for (let i = 0; i < 4; i++) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: flowerColors[i] }));
        flower.position.set(x - 0.3 + i * 0.2, 0.95, 1.55);
        group.add(flower);
      }
    });

    // Teacup decorations on sides
    [-1.65, 1.65].forEach(x => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.2, 12), whiteMat);
      cup.position.set(x, 1.8, 0);
      group.add(cup);

      const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), whiteMat);
      saucer.position.set(x, 1.65, 0);
      group.add(saucer);
    });

    // Garden elements around base
    const gardenPositions = [
      { x: 1.8, z: 1.6 }, { x: -1.8, z: 1.6 },
      { x: 1.8, z: -1.6 }, { x: -1.8, z: -1.6 }
    ];

    gardenPositions.forEach(pos => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
      bush.position.set(pos.x, 0.2, pos.z);
      group.add(bush);
    });

  } else if (type === 'speakers') {
    // Stage platform
    const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.35, 8), whiteMat);
    stage.position.y = 0.175;
    stage.castShadow = true;
    group.add(stage);

    // Stage steps
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.1, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xcccccc })
      );
      step.position.set(0, 0.05 + i * 0.1, 2.5 - i * 0.3);
      group.add(step);
    }

    // Pillars with enhanced details
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.8, 8), whiteMat);
      pillar.position.set(Math.cos(a) * 1.9, 1.75, Math.sin(a) * 1.9);
      pillar.castShadow = true;
      group.add(pillar);

      // Pillar capitals (decorative tops)
      const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.2, 8), goldMat);
      capital.position.set(Math.cos(a) * 1.9, 3.25, Math.sin(a) * 1.9);
      group.add(capital);

      // Pillar bases
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.15, 8), goldMat);
      base.position.set(Math.cos(a) * 1.9, 0.35, Math.sin(a) * 1.9);
      group.add(base);
    }

    // Dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.position.y = 3.15;
    dome.castShadow = true;
    group.add(dome);

    // Microphone stand in center
    const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    micStand.position.set(0, 0.95, 0);
    group.add(micStand);

    const mic = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    mic.position.set(0, 1.7, 0);
    mic.scale.set(1, 1.3, 1);
    group.add(mic);

    // Curtain decorations between pillars
    for (let i = 0; i < 6; i++) {
      const a1 = (i / 6) * Math.PI * 2;
      const a2 = ((i + 1) / 6) * Math.PI * 2;
      const midA = (a1 + a2) / 2;

      const curtain = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x9370db })
      );
      curtain.position.set(Math.cos(midA) * 2.1, 2.2, Math.sin(midA) * 2.1);
      curtain.lookAt(0, 2.2, 0);
      group.add(curtain);
    }

    // Speakers on sides
    [-2.3, 2.3].forEach(x => {
      const speaker = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.3), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      speaker.position.set(x, 0.65, 0);
      group.add(speaker);

      // Speaker grille
      for (let i = 0; i < 3; i++) {
        const grille = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
          new THREE.MeshStandardMaterial({ color: 0x444444 })
        );
        grille.position.set(x, 0.5 + i * 0.15, 0.16);
        grille.rotation.x = Math.PI / 2;
        group.add(grille);
      }
    });

    // Stage lights
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const light = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 8), goldMat);
      light.position.set(Math.cos(a) * 1.5, 3.5, Math.sin(a) * 1.5);
      light.rotation.set(Math.PI / 4, 0, 0);
      group.add(light);
    }

  } else if (type === 'guests') {
    // Main tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 4, 8), mat);
    tower.position.y = 2;
    tower.castShadow = true;
    group.add(tower);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 1.6, 8), roofMat);
    roof.position.y = 5.4;
    roof.castShadow = true;
    group.add(roof);

    // Grand arched door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 0.1), darkMat);
    door.position.set(0, 0.9, 1.95);
    group.add(door);

    const doorArch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16, 1, false, 0, Math.PI),
      trimMat
    );
    doorArch.position.set(0, 1.8, 1.95);
    doorArch.rotation.z = Math.PI;
    doorArch.rotation.y = Math.PI / 2;
    group.add(doorArch);

    // Windows at different levels
    for (let level = 0; level < 3; level++) {
      const y = 1.2 + level * 1.2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const window = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.7, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
        );
        const radius = 1.6 - (level * 0.1);
        window.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
        window.lookAt(0, y, 0);
        group.add(window);

        const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.12), trimMat);
        windowFrame.position.set(Math.cos(a) * (radius + 0.05), y, Math.sin(a) * (radius + 0.05));
        windowFrame.lookAt(0, y, 0);
        group.add(windowFrame);
      }
    }

    // Lanterns around the tower
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.5, 6), trimMat);
      lanternPost.position.set(Math.cos(a) * 2.3, 0.75, Math.sin(a) * 2.3);
      group.add(lanternPost);

      const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.3 }));
      lantern.position.set(Math.cos(a) * 2.3, 1.5, Math.sin(a) * 2.3);
      group.add(lantern);
    }

    // Decorative scroll/registry symbols
    const scrollPositions = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    scrollPositions.forEach(angle => {
      const scroll = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: 0xf5deb3 })
      );
      scroll.position.set(Math.cos(angle) * 2, 4.5, Math.sin(angle) * 2);
      scroll.rotation.z = Math.PI / 2;
      scroll.lookAt(0, 4.5, 0);
      scroll.rotation.y += Math.PI / 2;
      group.add(scroll);
    });

    // Official plaque near door
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    );
    plaque.position.set(0.8, 2, 1.95);
    group.add(plaque);

  } else if (type === 'feast') {
    // Main hall
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

    // Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
    chimney.position.set(1.2, 4, 0);
    chimney.castShadow = true;
    group.add(chimney);

    const chimneyTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.2, 0.7), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    chimneyTop.position.set(1.2, 4.7, 0);
    group.add(chimneyTop);

    // Large kitchen door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.1), darkMat);
    door.position.set(0, 0.9, 1.45);
    group.add(door);

    // Door window
    const doorWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
    );
    doorWindow.position.set(0, 1.4, 1.46);
    group.add(doorWindow);

    // Windows
    [-1.3, 1.3].forEach(x => {
      const window = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.9, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 })
      );
      window.position.set(x, 1.3, 1.45);
      group.add(window);

      const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.12), trimMat);
      windowFrame.position.set(x, 1.3, 1.43);
      group.add(windowFrame);
    });

    // Outdoor dining table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1), trimMat);
    table.position.set(0, 0.7, 2.5);
    group.add(table);

    // Table legs
    const legPositions = [
      { x: -0.6, z: 2.1 }, { x: 0.6, z: 2.1 },
      { x: -0.6, z: 2.9 }, { x: 0.6, z: 2.9 }
    ];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8), trimMat);
      leg.position.set(pos.x, 0.35, pos.z);
      group.add(leg);
    });

    // Food decorations on table
    const cakeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.45, 12), new THREE.MeshStandardMaterial({ color: 0xff8fcf }));
    cakeBase.position.set(-0.35, 0.98, 2.45);
    group.add(cakeBase);

    const cakeTier = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0xffc1e8 }));
    cakeTier.position.set(-0.35, 1.32, 2.45);
    group.add(cakeTier);

    const cakeFrosting = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    cakeFrosting.position.set(-0.35, 1.56, 2.45);
    group.add(cakeFrosting);

    const cakeCherry = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff3366 }));
    cakeCherry.position.set(-0.35, 1.68, 2.45);
    group.add(cakeCherry);

    const pie = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.15, 12), new THREE.MeshStandardMaterial({ color: 0xdaa520 }));
    pie.position.set(0.45, 0.83, 2.7);
    group.add(pie);

    const teapotBody = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }));
    teapotBody.position.set(0.1, 0.92, 2.35);
    group.add(teapotBody);

    const teapotLid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.05, 8), new THREE.MeshStandardMaterial({ color: 0xdedede }));
    teapotLid.position.set(0.1, 1.05, 2.35);
    group.add(teapotLid);

    const teapotSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.18, 6), new THREE.MeshStandardMaterial({ color: 0xf5f5f5 }));
    teapotSpout.position.set(0.28, 0.92, 2.35);
    teapotSpout.rotation.z = Math.PI / 2;
    group.add(teapotSpout);

    const teapotHandle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 10, Math.PI), new THREE.MeshStandardMaterial({ color: 0xdedede }));
    teapotHandle.position.set(-0.08, 0.92, 2.35);
    teapotHandle.rotation.y = Math.PI / 2;
    group.add(teapotHandle);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xd2a679 }));
    cone.position.set(0.38, 0.83, 2.25);
    cone.rotation.x = Math.PI;
    group.add(cone);

    const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffe4b5 }));
    scoop.position.set(0.38, 1.02, 2.25);
    group.add(scoop);

    const tartCrust = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 10), new THREE.MeshStandardMaterial({ color: 0xd9a441 }));
    tartCrust.position.set(-0.05, 0.8, 2.7);
    group.add(tartCrust);

    const tartFilling = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.05, 10), new THREE.MeshStandardMaterial({ color: 0xfff176 }));
    tartFilling.position.set(-0.05, 0.86, 2.7);
    group.add(tartFilling);

    // Utensil decorations on walls
    [-1.95, 1.95].forEach(x => {
      // Spoon
      const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xc0c0c0 }));
      spoon.position.set(x, 1.8, 0);
      spoon.rotation.z = Math.PI / 6;
      group.add(spoon);

      // Fork
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xc0c0c0 }));
      fork.position.set(x, 1.4, 0);
      fork.rotation.z = -Math.PI / 6;
      group.add(fork);
    });

    // Hanging pots decoration
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshStandardMaterial({ color: 0x8b7355 }));
    pot.position.set(-1.5, 2, -1);
    group.add(pot);

    const potHandle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    potHandle.position.set(-1.5, 2.25, -1);
    group.add(potHandle);
  }

  return group;
}

// Create all buildings from LOCATIONS data
export function createBuildings() {
  LOCATIONS.forEach((loc) => {
    const building = createBuilding(loc.color, loc.id);

    if (loc.id === 'palace') {
      const hillHeight = 1.2;
      const hillRadius = 6.2;
      const hillMat = new THREE.MeshStandardMaterial({ color: 0x7bc96f, roughness: 0.95 });
      const hill = new THREE.Mesh(
        new THREE.CylinderGeometry(hillRadius * 0.78, hillRadius, hillHeight, 32),
        hillMat
      );
      hill.position.set(loc.x, hillHeight / 2, loc.z);
      hill.receiveShadow = true;
      scene.add(hill);

      const stairGroup = new THREE.Group();
      const stepCount = 5;
      const stepHeight = hillHeight / stepCount;
      const stepDepth = 0.7;
      const stepWidth = 3;
      const stepMat = new THREE.MeshStandardMaterial({ color: 0xf2d4b8, roughness: 0.85 });
      const railMat = new THREE.MeshStandardMaterial({ color: 0xd5b46f, metalness: 0.4, roughness: 0.4 });

      for (let i = 0; i < stepCount; i++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
          stepMat
        );
        step.position.set(
          loc.x,
          hillHeight - stepHeight / 2 - i * stepHeight,
          loc.z + hillRadius - stepDepth / 2 + i * stepDepth
        );
        step.castShadow = true;
        step.receiveShadow = true;
        stairGroup.add(step);
      }

      const postHeight = 0.8;
      const railOffset = stepWidth / 2 + 0.25;
      for (let i = 0; i <= stepCount; i++) {
        const postY = hillHeight - i * stepHeight + postHeight / 2;
        const postZ = loc.z + hillRadius - stepDepth + i * stepDepth;
        [-railOffset, railOffset].forEach((xOffset) => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, postHeight, 8),
            railMat
          );
          post.position.set(loc.x + xOffset, postY, postZ);
          post.castShadow = true;
          stairGroup.add(post);
        });
      }

      for (let i = 0; i < stepCount; i++) {
        const startLeft = new THREE.Vector3(loc.x - railOffset, hillHeight - i * stepHeight + postHeight / 2, loc.z + hillRadius - stepDepth + i * stepDepth);
        const endLeft = new THREE.Vector3(loc.x - railOffset, hillHeight - (i + 1) * stepHeight + postHeight / 2, loc.z + hillRadius - stepDepth + (i + 1) * stepDepth);
        const startRight = new THREE.Vector3(loc.x + railOffset, startLeft.y, startLeft.z);
        const endRight = new THREE.Vector3(loc.x + railOffset, endLeft.y, endLeft.z);

        const addRailSegment = (start, end) => {
          const railLength = start.distanceTo(end);
          const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, railLength, 8), railMat);
          rail.position.copy(start.clone().add(end).multiplyScalar(0.5));
          rail.lookAt(end);
          rail.rotateX(Math.PI / 2);
          rail.castShadow = true;
          stairGroup.add(rail);
        };

        addRailSegment(startLeft, endLeft);
        addRailSegment(startRight, endRight);
      }

      scene.add(stairGroup);
      building.position.set(loc.x, hillHeight, loc.z);
    } else {
      building.position.set(loc.x, 0, loc.z);
    }

    building.userData = { id: loc.id, icon: loc.icon, name: loc.name };
    scene.add(building);
    buildings[loc.id] = building;
  });
}
