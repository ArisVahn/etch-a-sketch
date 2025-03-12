/**
 * Theme Component Module
 * Handles theme-related functionality (dark/light mode)
 */

// Theme change observers
const themeObservers = new Set();

/**
 * Initialize the theme based on localStorage settings
 */
export function initializeTheme() {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setTheme(savedDarkMode);
}

/**
 * Toggle between dark and light mode
 */
export function toggleDarkMode() {
    const htmlEl = document.documentElement;
    const isDarkMode = htmlEl.classList.contains('dark-mode');
    setTheme(!isDarkMode);
}

/**
 * Set the theme and notify observers
 * @param {boolean} isDarkMode - Whether to set dark mode
 */
function setTheme(isDarkMode) {
    const htmlEl = document.documentElement;
    htmlEl.classList.toggle('dark-mode', isDarkMode);
    htmlEl.classList.toggle('light-mode', !isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    
    // Notify all observers of the theme change
    themeObservers.forEach(callback => callback(isDarkMode));
}

/**
 * Subscribe to theme changes
 * @param {Function} callback - Function to call when theme changes
 * @returns {Function} Unsubscribe function
 */
export function onThemeChange(callback) {
    themeObservers.add(callback);
    return () => themeObservers.delete(callback);
}