// Renderer - Three.js renderer, scene, camera, and lighting setup
import * as THREE from 'three';

export let scene, camera, renderer;

// Initialize the Three.js renderer, scene, and camera
export function initRenderer() {
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

  // Setup lighting
  setupLighting();

  // Handle window resize
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer };
}

// Setup scene lighting
function setupLighting() {
  // Ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // Directional light (sun)
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

  // Hemisphere light
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x98fb98, 0.3));
}

// Handle window resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
