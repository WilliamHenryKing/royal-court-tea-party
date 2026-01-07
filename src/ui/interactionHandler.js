// Interaction Handler - Centralized event handling with proper separation of concerns
// This module provides consistent, reliable event handling across the UI

/**
 * Adds a reliable click/tap handler to an element
 * Uses click event with proper touch support
 * @param {HTMLElement} element - The element to attach the handler to
 * @param {Function} callback - The callback to execute
 * @param {Object} options - Optional configuration
 */
export function addClickHandler(element, callback, options = {}) {
  if (!element) {
    console.warn('addClickHandler: element is null or undefined');
    return;
  }

  const { preventDefault = true } = options;

  // Use click event - it works reliably across all devices
  element.addEventListener('click', (e) => {
    if (preventDefault) {
      e.preventDefault();
    }
    callback(e);
  });

  // Add keyboard support for accessibility
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      if (preventDefault) {
        e.preventDefault();
      }
      callback(e);
    }
  });
}

/**
 * Adds a toggle handler for elements that can be opened/closed
 * Prevents event propagation to avoid conflicts
 * @param {HTMLElement} trigger - The element that triggers the toggle
 * @param {HTMLElement} target - The element to toggle
 * @param {HTMLElement} overlay - Optional overlay element
 * @param {Object} options - Configuration options
 */
export function addToggleHandler(trigger, target, overlay = null, options = {}) {
  if (!trigger || !target) {
    console.warn('addToggleHandler: trigger or target is null or undefined');
    return;
  }

  const {
    toggleClass = 'visible',
    onOpen = null,
    onClose = null
  } = options;

  // Check if target is currently open
  const isOpen = () => target.classList.contains(toggleClass);

  // Toggle function
  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOpen()) {
      // Close
      target.classList.remove(toggleClass);
      if (overlay) overlay.classList.remove(toggleClass);
      if (onClose) onClose();
    } else {
      // Open
      target.classList.add(toggleClass);
      if (overlay) overlay.classList.add(toggleClass);
      if (onOpen) onOpen();
    }
  };

  // Add click handler to trigger
  addClickHandler(trigger, toggle, { preventDefault: true });

  // If overlay provided, clicking it closes the target
  if (overlay) {
    addClickHandler(overlay, (e) => {
      if (e.target === overlay) {
        target.classList.remove(toggleClass);
        overlay.classList.remove(toggleClass);
        if (onClose) onClose();
      }
    }, { preventDefault: true });
  }
}

/**
 * Adds a close handler for modal/dialog elements
 * @param {HTMLElement} closeButton - The close button element
 * @param {Function} callback - The callback to execute
 */
export function addCloseHandler(closeButton, callback) {
  if (!closeButton) {
    console.warn('addCloseHandler: closeButton is null or undefined');
    return;
  }

  addClickHandler(closeButton, callback, { preventDefault: false });
}

/**
 * Debounce function to prevent rapid repeated calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between executions
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
