// Input System - handles joystick, keyboard, and input state

// Input state
export const joystickInput = { x: 0, y: 0 };
export const keyboardState = { up: false, down: false, left: false, right: false };
export const keyboardVector = { x: 0, y: 0 };
export let desktopModeEnabled = false;

// Set desktop mode
export function setDesktopModeEnabled(enabled) {
  desktopModeEnabled = enabled;
}

// Update keyboard vector from state
export function updateKeyboardVector() {
  keyboardVector.x = 0;
  keyboardVector.y = 0;
  if (keyboardState.up) keyboardVector.y -= 1;
  if (keyboardState.down) keyboardVector.y += 1;
  if (keyboardState.left) keyboardVector.x -= 1;
  if (keyboardState.right) keyboardVector.x += 1;

  // Normalize diagonal movement
  const length = Math.sqrt(keyboardVector.x * keyboardVector.x + keyboardVector.y * keyboardVector.y);
  if (length > 0) {
    keyboardVector.x /= length;
    keyboardVector.y /= length;
  }
}

// Get current input vector (combines joystick and keyboard)
export function getInputVector() {
  if (desktopModeEnabled) {
    return { x: keyboardVector.x, y: keyboardVector.y };
  }
  return { x: joystickInput.x, y: -joystickInput.y }; // Invert Y for joystick
}
