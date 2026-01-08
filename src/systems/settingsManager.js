/**
 * Settings Manager
 * Handles user settings with localStorage persistence
 */

const DEFAULT_SETTINGS = {
  musicVolume: 70,
  soundEffects: true,
  cameraSensitivity: 5,
  showMinimap: true,
  showJoystick: true,
  showActionButton: true
};

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.listeners = [];
  }

  /**
   * Load settings from localStorage or use defaults
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('royalCourtSettings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('royalCourtSettings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  /**
   * Get a setting value
   */
  get(key) {
    return this.settings[key];
  }

  /**
   * Set a setting value
   */
  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.notifyListeners(key, value);
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    // Notify all listeners about all changes
    Object.entries(this.settings).forEach(([key, value]) => {
      this.notifyListeners(key, value);
    });
  }

  /**
   * Add a change listener
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of a setting change
   */
  notifyListeners(key, value) {
    this.listeners.forEach(listener => listener(key, value));
  }

  /**
   * Get all settings
   */
  getAll() {
    return { ...this.settings };
  }
}

// Singleton instance
export const settingsManager = new SettingsManager();
