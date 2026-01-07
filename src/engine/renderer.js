// Renderer - Three.js renderer, scene, camera, lighting, and post-processing setup
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export let scene, camera, renderer, composer;

// Initialize the Three.js renderer, scene, and camera
export function initRenderer() {
  // Scene - Natural sky background
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb3d9ff);
  scene.fog = null;

  // Camera
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 14, 18);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2 });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Setup post-processing (basic render pass only)
  setupPostProcessing();

  // Handle window resize
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, composer };
}

// Setup post-processing for basic render pass
function setupPostProcessing() {
  composer = new EffectComposer(renderer);

  // Render the scene normally first
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // No bloom for now; render with the scene's base lighting.
}

// Setup scene lighting - natural outdoor look
function setupLighting() {
  // Subtle ambient light for base illumination
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Hemisphere light for natural sky/ground color variation
  const hemi = new THREE.HemisphereLight(0xb3d9ff, 0xc7e8ac, 0.3);
  scene.add(hemi);

  // Main directional sunlight (expanded for Austinville)
  const sun = new THREE.DirectionalLight(0xfffef0, 0.7);
  sun.position.set(20, 30, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -60;
  sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.radius = 4;
  scene.add(sun);
}

// Handle window resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
}
