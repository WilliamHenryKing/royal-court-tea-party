// Renderer - Three.js renderer, scene, camera, lighting, and post-processing setup
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';

export let scene, camera, renderer, composer;

// Initialize the Three.js renderer, scene, and camera
export function initRenderer() {
  // Scene - Neutral background to preserve model colors
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
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

// Setup scene lighting - simple and bright
function setupLighting() {
  // Bright ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);

  // Main directional light
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(12, 20, 10);
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
