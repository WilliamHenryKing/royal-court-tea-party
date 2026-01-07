// Game Loop - manages the main animation loop
import * as THREE from 'three';
import { renderer, scene, camera } from './renderer.js';

let updateCallback = null;
const clock = new THREE.Clock();

// Set the update callback function
export function setUpdateCallback(callback) {
  updateCallback = callback;
}

// Main animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Call the update function if set
  if (updateCallback) {
    updateCallback(delta, time);
  }

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
export function startLoop() {
  animate();
}
