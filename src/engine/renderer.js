// Renderer - Three.js renderer, scene, camera, lighting, and post-processing setup
import * as THREE from 'three';
export let scene, camera, renderer;

const MOBILE_MAX_PIXEL_RATIO = 1.5;
const DESKTOP_MAX_PIXEL_RATIO = 2;
const MOBILE_SHADOW_MAP_SIZE = 1024;
const DESKTOP_SHADOW_MAP_SIZE = 2048;

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
  renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio < 2,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Setup lighting
  setupLighting();

  // Handle window resize
  window.addEventListener('resize', onResize);

  // Handle mouse wheel zoom (desktop only)
  setupMouseWheelZoom();

  return { scene, camera, renderer };
}

// Mouse wheel zoom for desktop
let zoomLevel = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

function setupMouseWheelZoom() {
  window.addEventListener('wheel', (e) => {
    // Prevent default scroll behavior
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }

    // Adjust zoom level
    const delta = e.deltaY > 0 ? 0.05 : -0.05;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + delta));
  }, { passive: false });
}

// Export zoom level for camera system to use
export function getZoomLevel() {
  return zoomLevel;
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
  const shadowMapSize = getShadowMapSize();
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
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
  renderer.setPixelRatio(getRenderPixelRatio());
}

function isMobileDisplay() {
  return window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches;
}

function getRenderPixelRatio() {
  const maxRatio = isMobileDisplay() ? MOBILE_MAX_PIXEL_RATIO : DESKTOP_MAX_PIXEL_RATIO;
  return Math.min(window.devicePixelRatio, maxRatio);
}

function getShadowMapSize() {
  return isMobileDisplay() ? MOBILE_SHADOW_MAP_SIZE : DESKTOP_SHADOW_MAP_SIZE;
}
