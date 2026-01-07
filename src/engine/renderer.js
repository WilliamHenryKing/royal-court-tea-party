// Renderer - Three.js renderer, scene, camera, lighting, and post-processing setup
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export let scene, camera, renderer, composer;

// Initialize the Three.js renderer, scene, and camera
export function initRenderer() {
  // Scene - Warm golden hour sky
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffecd2); // Soft peachy-gold
  scene.fog = new THREE.FogExp2(0xfff8f0, 0.006); // Warm dreamy fog

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

  // Setup post-processing (bloom effect)
  setupPostProcessing();

  // Handle window resize
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, composer };
}

// Setup bloom post-processing for dreamy glow effect
function setupPostProcessing() {
  composer = new EffectComposer(renderer);

  // Render the scene normally first
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Add bloom effect - subtle dreamy glow
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,    // strength - subtle bloom
    0.5,    // radius - how far bloom spreads
    0.7     // threshold - brightness needed for bloom
  );
  composer.addPass(bloomPass);
}

// Setup scene lighting - Warm, golden-hour feel
function setupLighting() {
  // Warm ambient light - gives everything a soft glow
  const ambient = new THREE.AmbientLight(0xfff0e6, 0.5);
  scene.add(ambient);

  // Main directional light (golden sun)
  const sun = new THREE.DirectionalLight(0xffecd2, 0.7);
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

  // Hemisphere light - sky/ground gradient for softer shadows
  // Warm sky color, soft green ground bounce
  const hemi = new THREE.HemisphereLight(0xffecd2, 0x98fb98, 0.35);
  scene.add(hemi);

  // Rim light for magical back-lighting (subtle pink/purple)
  const rimLight = new THREE.DirectionalLight(0xffc0cb, 0.2);
  rimLight.position.set(-10, 15, -10);
  scene.add(rimLight);

  // Point lights for building warmth (golden glows)
  const buildingGlow = new THREE.PointLight(0xffd700, 0.3, 15);
  buildingGlow.position.set(0, 3, 0); // Near fountain
  scene.add(buildingGlow);
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
