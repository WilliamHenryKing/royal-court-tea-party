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

// Create all buildings from LOCATIONS data
export function createBuildings() {
  LOCATIONS.forEach((loc) => {
    const building = createBuilding(loc.color, loc.id);
    building.position.set(loc.x, 0, loc.z);
    building.userData = { id: loc.id, icon: loc.icon, name: loc.name };
    scene.add(building);
    buildings[loc.id] = building;
  });
}
